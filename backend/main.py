import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
from pathlib import Path
import uuid

from backend.config import settings
from backend import models, schemas
from backend.database import get_db, engine
from backend.document_parser import extract_text
from backend.ai_pipeline import process_proposal_pipeline, answer_reviewer_query_rag
from backend.chroma_store import chroma_store

# Create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="R-Insight API", description="Module 1 Proposal Intelligence API")

# Configure CORS for local react client (usually port 5173 for Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to R-Insight API (Module 1)"}

# --- Proposal Handlers ---

@app.post("/api/proposals", response_model=schemas.ProposalStatusResponse)
async def upload_proposal(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    domain: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a proposal PDF/DOCX.
    Parses the text, saves the record, and triggers the async pipeline in the background.
    """
    # 1. Validate file extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{suffix}'. Only PDF and DOCX files are allowed."
        )

    # 2. Generate unique filename and save to uploads folder
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = settings.UPLOAD_DIR / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    # 3. Extract raw text immediately to validate readability
    try:
        raw_text = extract_text(file_path)
        if not raw_text.strip():
            raise ValueError("File content is empty or unreadable.")
    except Exception as parse_err:
        # Cleanup file
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to extract text from document: {str(parse_err)}")

    # 4. Create proposal database record
    db_title = title if (title and title.strip()) else file.filename
    db_proposal = models.Proposal(
        title=db_title,
        filename=file.filename,
        domain=domain if (domain and domain.strip()) else None,
        status="pending"
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)

    # 5. Delegate processing to async background tasks
    background_tasks.add_task(
        process_proposal_pipeline, 
        db=db, 
        proposal_id=db_proposal.id, 
        raw_text=raw_text
    )

    return {
        "id": db_proposal.id,
        "title": db_proposal.title,
        "status": "pending",
        "error_message": None,
        "done": False
    }


@app.get("/api/proposals", response_model=List[schemas.ProposalListItem])
def list_proposals(db: Session = Depends(get_db)):
    """Fetch the list/history of all uploaded proposals."""
    return db.query(models.Proposal).order_by(models.Proposal.created_at.desc()).all()


@app.get("/api/proposals/{proposal_id}/status", response_model=schemas.ProposalStatusResponse)
def get_proposal_status(proposal_id: int, db: Session = Depends(get_db)):
    """Check the status of a running pipeline (for frontend status progress)."""
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    done = proposal.status in ["completed", "failed"]
    return {
        "id": proposal.id,
        "title": proposal.title,
        "status": proposal.status,
        "error_message": proposal.error_message,
        "done": done
    }


@app.get("/api/proposals/{proposal_id}/dashboard", response_model=schemas.DashboardResponse)
def get_proposal_dashboard_data(proposal_id: int, db: Session = Depends(get_db)):
    """Fetch the full dashboard payload for a processed proposal."""
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    # Map extraction
    extraction = None
    if proposal.extraction:
        extraction = schemas.ExtractionResponse(
            objectives=proposal.extraction.objectives,
            methodology=proposal.extraction.methodology,
            budget=proposal.extraction.budget,
            expected_outcomes=proposal.extraction.expected_outcomes,
            other_sections=proposal.extraction.other_sections
        )

    # Map scores
    scores = None
    if proposal.scores:
        scores = schemas.ScoresResponse(
            innovation=schemas.SingleScore(
                score=proposal.scores.innovation_score,
                justification=proposal.scores.innovation_justification,
                confidence=proposal.scores.innovation_confidence
            ),
            quality=schemas.SingleScore(
                score=proposal.scores.quality_score,
                justification=proposal.scores.quality_justification,
                confidence=proposal.scores.quality_confidence
            ),
            novelty=schemas.SingleScore(
                score=proposal.scores.novelty_score,
                justification=proposal.scores.novelty_justification,
                confidence=proposal.scores.novelty_confidence
            ),
            novelty_verdict=proposal.scores.novelty_verdict
        )

    # Map novelty report
    novelty_report = None
    if proposal.scores:
        matches = []
        for match in proposal.similarity_results:
            matches.append(schemas.SimilarityMatchItem(
                id=match.reference.id,
                title=match.reference.title,
                source=match.reference.source,
                abstract=match.reference.abstract,
                similarity_score=match.similarity_score,
                overlap_narrative=match.overlap_narrative
            ))
            
        novelty_report = schemas.NoveltyReportResponse(
            proposal_id=proposal_id,
            novelty_verdict=proposal.scores.novelty_verdict,
            novelty_score=proposal.scores.novelty_score,
            novelty_justification=proposal.scores.novelty_justification,
            novelty_confidence=proposal.scores.novelty_confidence,
            matches=matches
        )

    summary_text = proposal.evaluation_summary.summary_text if proposal.evaluation_summary else None

    return schemas.DashboardResponse(
        proposal_id=proposal.id,
        title=proposal.title,
        filename=proposal.filename,
        domain=proposal.domain,
        status=proposal.status,
        created_at=proposal.created_at,
        extraction=extraction,
        scores=scores,
        novelty_report=novelty_report,
        summary=summary_text
    )


@app.post("/api/proposals/{proposal_id}/query", response_model=schemas.QueryResponse)
def post_reviewer_query(proposal_id: int, payload: schemas.QueryRequest, db: Session = Depends(get_db)):
    """Ask a follow-up query about a specific proposal using RAG."""
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    if proposal.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot query an incomplete proposal evaluation.")

    answer = answer_reviewer_query_rag(db, proposal_id, payload.question)
    return {
        "question": payload.question,
        "answer": answer,
        "proposal_id": proposal_id
    }


# --- Reference Corpus Admin Handlers ---

@app.post("/api/admin/corpus", response_model=schemas.ReferenceCorpusResponse)
def add_reference_document(payload: schemas.ReferenceCorpusCreate, db: Session = Depends(get_db)):
    """Admin-only flow: Upload/add a reference research paper or patent to the comparison corpus."""
    doc_id = f"ref_{uuid.uuid4().hex[:12]}"
    
    # 1. Save in MySQL
    db_ref = models.ReferenceCorpus(
        title=payload.title,
        abstract=payload.abstract,
        source=payload.source,
        doc_id=doc_id
    )
    db.add(db_ref)
    db.commit()
    db.refresh(db_ref)

    # 2. Index in ChromaDB
    try:
        chroma_store.add_reference(
            doc_id=doc_id,
            text=payload.abstract,
            title=payload.title,
            source=payload.source
        )
    except Exception as e:
        # Rollback DB record if ChromaDB indexing fails
        db.delete(db_ref)
        db.commit()
        raise HTTPException(status_code=500, detail=f"ChromaDB indexing failed: {str(e)}")

    return db_ref


@app.get("/api/admin/corpus", response_model=List[schemas.ReferenceCorpusResponse])
def get_reference_corpus(db: Session = Depends(get_db)):
    """Fetch all reference documents in the corpus."""
    return db.query(models.ReferenceCorpus).order_by(models.ReferenceCorpus.created_at.desc()).all()
