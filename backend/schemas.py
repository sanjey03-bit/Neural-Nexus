from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Reference Corpus ---
class ReferenceCorpusBase(BaseModel):
    title: str
    abstract: str
    source: str

class ReferenceCorpusCreate(ReferenceCorpusBase):
    pass

class ReferenceCorpusResponse(ReferenceCorpusBase):
    id: int
    doc_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Proposal Status ---
class ProposalStatusResponse(BaseModel):
    id: int
    title: str
    status: str
    error_message: Optional[str] = None
    done: bool

# --- Proposal List Item ---
class ProposalListItem(BaseModel):
    id: int
    title: str
    filename: str
    domain: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Structured Extraction ---
class ExtractionResponse(BaseModel):
    objectives: str
    methodology: str
    budget: str
    expected_outcomes: str
    other_sections: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Similarity Results ---
class SimilarityMatchItem(BaseModel):
    id: int
    title: str
    source: str
    abstract: str
    similarity_score: float
    overlap_narrative: str

class NoveltyReportResponse(BaseModel):
    proposal_id: int
    novelty_verdict: str
    novelty_score: int
    novelty_justification: str
    novelty_confidence: float
    matches: List[SimilarityMatchItem]

# --- Scores ---
class SingleScore(BaseModel):
    score: int
    justification: str
    confidence: float

class ScoresResponse(BaseModel):
    innovation: SingleScore
    quality: SingleScore
    novelty: SingleScore
    novelty_verdict: str

# --- Evaluation Summary ---
class EvaluationSummaryResponse(BaseModel):
    proposal_id: int
    summary_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Complete Dashboard Data ---
class DashboardResponse(BaseModel):
    proposal_id: int
    title: str
    filename: str
    domain: Optional[str] = None
    status: str
    created_at: datetime
    extraction: Optional[ExtractionResponse] = None
    scores: Optional[ScoresResponse] = None
    novelty_report: Optional[NoveltyReportResponse] = None
    summary: Optional[str] = None

# --- Reviewer Q&A ---
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    proposal_id: int
