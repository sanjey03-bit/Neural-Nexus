import logging
from typing import Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from backend.database import get_db
from backend import models
from backend.models_phase2 import (
    Phase2RiskAssessment,
    Phase2FundingReadiness,
    Phase2PlagiarismCheck,
    Phase2Enhancement,
    Phase2DecisionSupport,
)
from backend import schemas_phase2
from backend.phase2_engine import (
    analyze_proposal_risk,
    evaluate_funding_readiness,
    check_proposal_plagiarism,
    generate_proposal_enhancements,
    generate_decision_support,
)
from backend.pdf_generator import (
    generate_risk_pdf,
    generate_funding_pdf,
    generate_recommendations_pdf,
    generate_decision_pdf,
)

logger = logging.getLogger(__name__)

router = APIRouter()

def _get_verified_proposal(proposal_id: int, db: Session) -> models.Proposal:
    proposal = db.query(models.Proposal).filter(models.Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Proposal #{proposal_id} must be in 'completed' state in Phase 1 before running Phase 2. Current status: '{proposal.status}'"
        )
    return proposal


# ==============================================================================
# 1. RUN FULL PHASE 2 ANALYSIS PIPELINE
# ==============================================================================
@router.post("/proposals/{proposal_id}/analyze", response_model=schemas_phase2.Phase2DashboardResponse)
def run_phase2_analysis(
    proposal_id: int,
    db: Session = Depends(get_db)
):
    """
    Executes the comprehensive Phase 2 Intelligence Suite:
    Risk Assessment, Funding Readiness, Plagiarism Audit, AI Enhancements, Decision Support.
    Results are persisted additively into MySQL.
    """
    proposal = _get_verified_proposal(proposal_id, db)

    # 1. Risk Analysis
    risk_data = analyze_proposal_risk(proposal)
    existing_risk = db.query(Phase2RiskAssessment).filter(Phase2RiskAssessment.proposal_id == proposal_id).first()
    if existing_risk:
        existing_risk.technical_score = risk_data["technical"]["score"]
        existing_risk.technical_classification = risk_data["technical"]["classification"]
        existing_risk.technical_risks = risk_data["technical"]["risks"]
        existing_risk.financial_score = risk_data["financial"]["score"]
        existing_risk.financial_classification = risk_data["financial"]["classification"]
        existing_risk.financial_budget_feasibility_score = risk_data["financial"]["budget_feasibility_score"]
        existing_risk.financial_risks = risk_data["financial"]["risks"]
        existing_risk.timeline_score = risk_data["timeline"]["score"]
        existing_risk.timeline_classification = risk_data["timeline"]["classification"]
        existing_risk.timeline_risks = risk_data["timeline"]["risks"]
        existing_risk.resource_score = risk_data["resource"]["score"]
        existing_risk.resource_classification = risk_data["resource"]["classification"]
        existing_risk.resource_risks = risk_data["resource"]["risks"]
        existing_risk.overall_risk_score = risk_data["overall_risk_score"]
        existing_risk.overall_risk_classification = risk_data["overall_risk_classification"]
        existing_risk.risk_weights = risk_data["risk_weights"]
        existing_risk.overall_explanation = risk_data["overall_explanation"]
        existing_risk.confidence = risk_data["confidence"]
    else:
        db_risk = Phase2RiskAssessment(
            proposal_id=proposal_id,
            technical_score=risk_data["technical"]["score"],
            technical_classification=risk_data["technical"]["classification"],
            technical_risks=risk_data["technical"]["risks"],
            financial_score=risk_data["financial"]["score"],
            financial_classification=risk_data["financial"]["classification"],
            financial_budget_feasibility_score=risk_data["financial"]["budget_feasibility_score"],
            financial_risks=risk_data["financial"]["risks"],
            timeline_score=risk_data["timeline"]["score"],
            timeline_classification=risk_data["timeline"]["classification"],
            timeline_risks=risk_data["timeline"]["risks"],
            resource_score=risk_data["resource"]["score"],
            resource_classification=risk_data["resource"]["classification"],
            resource_risks=risk_data["resource"]["risks"],
            overall_risk_score=risk_data["overall_risk_score"],
            overall_risk_classification=risk_data["overall_risk_classification"],
            risk_weights=risk_data["risk_weights"],
            overall_explanation=risk_data["overall_explanation"],
            confidence=risk_data["confidence"]
        )
        db.add(db_risk)
    db.commit()

    # 2. Funding Readiness
    funding_data = evaluate_funding_readiness(proposal, risk_data)
    existing_funding = db.query(Phase2FundingReadiness).filter(Phase2FundingReadiness.proposal_id == proposal_id).first()
    if existing_funding:
        existing_funding.overall_readiness_score = funding_data["overall_readiness_score"]
        existing_funding.readiness_classification = funding_data["readiness_classification"]
        existing_funding.criteria_scores = funding_data["criteria_scores"]
        existing_funding.strengths = funding_data["strengths"]
        existing_funding.weaknesses = funding_data["weaknesses"]
        existing_funding.funding_barriers = funding_data["funding_barriers"]
        existing_funding.missing_information = funding_data["missing_information"]
        existing_funding.recommendations = funding_data["recommendations"]
        existing_funding.confidence = funding_data["confidence"]
    else:
        db_funding = Phase2FundingReadiness(
            proposal_id=proposal_id,
            overall_readiness_score=funding_data["overall_readiness_score"],
            readiness_classification=funding_data["readiness_classification"],
            criteria_scores=funding_data["criteria_scores"],
            strengths=funding_data["strengths"],
            weaknesses=funding_data["weaknesses"],
            funding_barriers=funding_data["funding_barriers"],
            missing_information=funding_data["missing_information"],
            recommendations=funding_data["recommendations"],
            confidence=funding_data["confidence"]
        )
        db.add(db_funding)
    db.commit()

    # 3. Plagiarism & Textual Similarity Audit
    plag_data = check_proposal_plagiarism(db, proposal)
    existing_plag = db.query(Phase2PlagiarismCheck).filter(Phase2PlagiarismCheck.proposal_id == proposal_id).first()
    if existing_plag:
        existing_plag.overall_overlap_percentage = plag_data["overall_overlap_percentage"]
        existing_plag.exact_match_percentage = plag_data["exact_match_percentage"]
        existing_plag.near_match_percentage = plag_data["near_match_percentage"]
        existing_plag.semantic_similarity_percentage = plag_data["semantic_similarity_percentage"]
        existing_plag.matching_passages = plag_data["matching_passages"]
        existing_plag.matching_sources = plag_data["matching_sources"]
        existing_plag.citation_observations = plag_data["citation_observations"]
        existing_plag.recommendations = plag_data["recommendations"]
        existing_plag.disclaimer = plag_data["disclaimer"]
    else:
        db_plag = Phase2PlagiarismCheck(
            proposal_id=proposal_id,
            overall_overlap_percentage=plag_data["overall_overlap_percentage"],
            exact_match_percentage=plag_data["exact_match_percentage"],
            near_match_percentage=plag_data["near_match_percentage"],
            semantic_similarity_percentage=plag_data["semantic_similarity_percentage"],
            matching_passages=plag_data["matching_passages"],
            matching_sources=plag_data["matching_sources"],
            citation_observations=plag_data["citation_observations"],
            recommendations=plag_data["recommendations"],
            disclaimer=plag_data["disclaimer"]
        )
        db.add(db_plag)
    db.commit()

    # 4. AI Enhancement Recommendations
    enhancement_data = generate_proposal_enhancements(proposal, risk_data, funding_data)
    existing_enh = db.query(Phase2Enhancement).filter(Phase2Enhancement.proposal_id == proposal_id).first()
    if existing_enh:
        existing_enh.identified_weaknesses = enhancement_data["identified_weaknesses"]
        existing_enh.executive_guidance = enhancement_data["executive_guidance"]
    else:
        db_enh = Phase2Enhancement(
            proposal_id=proposal_id,
            identified_weaknesses=enhancement_data["identified_weaknesses"],
            executive_guidance=enhancement_data["executive_guidance"]
        )
        db.add(db_enh)
    db.commit()

    # 5. Consolidated Decision Support
    decision_data = generate_decision_support(proposal, risk_data, funding_data, plag_data)
    existing_dec = db.query(Phase2DecisionSupport).filter(Phase2DecisionSupport.proposal_id == proposal_id).first()
    if existing_dec:
        existing_dec.advisory_verdict = decision_data["advisory_verdict"]
        existing_dec.decision_score = decision_data["decision_score"]
        existing_dec.executive_summary = decision_data["executive_summary"]
        existing_dec.positive_factors = decision_data["positive_factors"]
        existing_dec.negative_factors = decision_data["negative_factors"]
        existing_dec.critical_risks = decision_data["critical_risks"]
        existing_dec.funding_readiness_summary = decision_data["funding_readiness_summary"]
        existing_dec.funding_barriers = decision_data["funding_barriers"]
        existing_dec.priority_action_items = decision_data["priority_action_items"]
        existing_dec.human_review_disclaimer = decision_data["human_review_disclaimer"]
        existing_dec.confidence = decision_data["confidence"]
    else:
        db_dec = Phase2DecisionSupport(
            proposal_id=proposal_id,
            advisory_verdict=decision_data["advisory_verdict"],
            decision_score=decision_data["decision_score"],
            executive_summary=decision_data["executive_summary"],
            positive_factors=decision_data["positive_factors"],
            negative_factors=decision_data["negative_factors"],
            critical_risks=decision_data["critical_risks"],
            funding_readiness_summary=decision_data["funding_readiness_summary"],
            funding_barriers=decision_data["funding_barriers"],
            priority_action_items=decision_data["priority_action_items"],
            human_review_disclaimer=decision_data["human_review_disclaimer"],
            confidence=decision_data["confidence"]
        )
        db.add(db_dec)
    db.commit()

    return get_phase2_dashboard_data(proposal_id, db)


# ==============================================================================
# 2. RISK ANALYSIS ENDPOINTS
# ==============================================================================
@router.get("/proposals/{proposal_id}/risk", response_model=schemas_phase2.RiskAssessmentResponse)
def get_proposal_risk(
    proposal_id: int,
    w_tech: Optional[float] = Query(None),
    w_fin: Optional[float] = Query(None),
    w_time: Optional[float] = Query(None),
    w_res: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve Risk Assessment for proposal. If weights are provided or record missing, analyzes dynamically."""
    proposal = _get_verified_proposal(proposal_id, db)
    
    weights = None
    if all(w is not None for w in [w_tech, w_fin, w_time, w_res]):
        # Normalize weights so they sum to 1.0
        total = w_tech + w_fin + w_time + w_res
        if total > 0:
            weights = {
                "technical": round(w_tech / total, 3),
                "financial": round(w_fin / total, 3),
                "timeline": round(w_time / total, 3),
                "resource": round(w_res / total, 3),
            }

    record = db.query(Phase2RiskAssessment).filter(Phase2RiskAssessment.proposal_id == proposal_id).first()
    
    if not record or weights is not None:
        risk_data = analyze_proposal_risk(proposal, weights)
        return schemas_phase2.RiskAssessmentResponse(
            proposal_id=proposal_id,
            technical=schemas_phase2.DimensionRiskDetail(
                score=risk_data["technical"]["score"],
                classification=risk_data["technical"]["classification"],
                risks=risk_data["technical"]["risks"],
                confidence=risk_data["technical"]["confidence"],
                explanation=risk_data["technical"].get("explanation")
            ),
            financial=schemas_phase2.DimensionRiskDetail(
                score=risk_data["financial"]["score"],
                classification=risk_data["financial"]["classification"],
                risks=risk_data["financial"]["risks"],
                confidence=risk_data["financial"]["confidence"],
                explanation=risk_data["financial"].get("explanation"),
                extra_metrics={"budget_feasibility_score": risk_data["financial"].get("budget_feasibility_score", 75)}
            ),
            timeline=schemas_phase2.DimensionRiskDetail(
                score=risk_data["timeline"]["score"],
                classification=risk_data["timeline"]["classification"],
                risks=risk_data["timeline"]["risks"],
                confidence=risk_data["timeline"]["confidence"],
                explanation=risk_data["timeline"].get("explanation")
            ),
            resource=schemas_phase2.DimensionRiskDetail(
                score=risk_data["resource"]["score"],
                classification=risk_data["resource"]["classification"],
                risks=risk_data["resource"]["risks"],
                confidence=risk_data["resource"]["confidence"],
                explanation=risk_data["resource"].get("explanation")
            ),
            overall_risk_score=risk_data["overall_risk_score"],
            overall_risk_classification=risk_data["overall_risk_classification"],
            risk_weights=risk_data["risk_weights"],
            overall_explanation=risk_data["overall_explanation"],
            confidence=risk_data["confidence"]
        )

    return schemas_phase2.RiskAssessmentResponse(
        proposal_id=proposal_id,
        technical=schemas_phase2.DimensionRiskDetail(
            score=record.technical_score,
            classification=record.technical_classification,
            risks=record.technical_risks,
            confidence=record.confidence
        ),
        financial=schemas_phase2.DimensionRiskDetail(
            score=record.financial_score,
            classification=record.financial_classification,
            risks=record.financial_risks,
            confidence=record.confidence,
            extra_metrics={"budget_feasibility_score": record.financial_budget_feasibility_score}
        ),
        timeline=schemas_phase2.DimensionRiskDetail(
            score=record.timeline_score,
            classification=record.timeline_classification,
            risks=record.timeline_risks,
            confidence=record.confidence
        ),
        resource=schemas_phase2.DimensionRiskDetail(
            score=record.resource_score,
            classification=record.resource_classification,
            risks=record.resource_risks,
            confidence=record.confidence
        ),
        overall_risk_score=record.overall_risk_score,
        overall_risk_classification=record.overall_risk_classification,
        risk_weights=record.risk_weights,
        overall_explanation=record.overall_explanation,
        confidence=record.confidence,
        created_at=record.created_at
    )


# ==============================================================================
# 3. FUNDING READINESS ENDPOINTS
# ==============================================================================
@router.get("/proposals/{proposal_id}/funding-readiness", response_model=schemas_phase2.FundingReadinessResponse)
def get_funding_readiness(proposal_id: int, db: Session = Depends(get_db)):
    """Retrieve Funding Readiness Evaluation."""
    proposal = _get_verified_proposal(proposal_id, db)
    record = db.query(Phase2FundingReadiness).filter(Phase2FundingReadiness.proposal_id == proposal_id).first()
    
    if not record:
        funding_data = evaluate_funding_readiness(proposal)
        return schemas_phase2.FundingReadinessResponse(
            proposal_id=proposal_id,
            overall_readiness_score=funding_data["overall_readiness_score"],
            readiness_classification=funding_data["readiness_classification"],
            criteria_scores=funding_data["criteria_scores"],
            strengths=funding_data["strengths"],
            weaknesses=funding_data["weaknesses"],
            funding_barriers=funding_data["funding_barriers"],
            missing_information=funding_data["missing_information"],
            recommendations=funding_data["recommendations"],
            confidence=funding_data["confidence"]
        )

    return schemas_phase2.FundingReadinessResponse(
        proposal_id=proposal_id,
        overall_readiness_score=record.overall_readiness_score,
        readiness_classification=record.readiness_classification,
        criteria_scores=record.criteria_scores,
        strengths=record.strengths,
        weaknesses=record.weaknesses,
        funding_barriers=record.funding_barriers,
        missing_information=record.missing_information,
        recommendations=record.recommendations,
        confidence=record.confidence,
        created_at=record.created_at
    )


# ==============================================================================
# 4. PLAGIARISM CHECK ENDPOINTS
# ==============================================================================
@router.get("/proposals/{proposal_id}/plagiarism", response_model=schemas_phase2.PlagiarismCheckResponse)
def get_plagiarism_check(proposal_id: int, db: Session = Depends(get_db)):
    """Retrieve Plagiarism & Textual Similarity Audit."""
    proposal = _get_verified_proposal(proposal_id, db)
    record = db.query(Phase2PlagiarismCheck).filter(Phase2PlagiarismCheck.proposal_id == proposal_id).first()
    
    if not record:
        plag_data = check_proposal_plagiarism(db, proposal)
        return schemas_phase2.PlagiarismCheckResponse(
            proposal_id=proposal_id,
            overall_overlap_percentage=plag_data["overall_overlap_percentage"],
            exact_match_percentage=plag_data["exact_match_percentage"],
            near_match_percentage=plag_data["near_match_percentage"],
            semantic_similarity_percentage=plag_data["semantic_similarity_percentage"],
            matching_passages=plag_data["matching_passages"],
            matching_sources=plag_data["matching_sources"],
            citation_observations=plag_data["citation_observations"],
            recommendations=plag_data["recommendations"],
            disclaimer=plag_data["disclaimer"]
        )

    return schemas_phase2.PlagiarismCheckResponse(
        proposal_id=proposal_id,
        overall_overlap_percentage=record.overall_overlap_percentage,
        exact_match_percentage=record.exact_match_percentage,
        near_match_percentage=record.near_match_percentage,
        semantic_similarity_percentage=record.semantic_similarity_percentage,
        matching_passages=record.matching_passages,
        matching_sources=record.matching_sources,
        citation_observations=record.citation_observations,
        recommendations=record.recommendations,
        disclaimer=record.disclaimer,
        created_at=record.created_at
    )


# ==============================================================================
# 5. AI ENHANCEMENTS ENDPOINTS
# ==============================================================================
@router.get("/proposals/{proposal_id}/enhancements", response_model=schemas_phase2.EnhancementResponse)
def get_proposal_enhancements(proposal_id: int, db: Session = Depends(get_db)):
    """Retrieve AI-Assisted Proposal Enhancement suggestions and rewrites."""
    proposal = _get_verified_proposal(proposal_id, db)
    record = db.query(Phase2Enhancement).filter(Phase2Enhancement.proposal_id == proposal_id).first()
    
    if not record:
        enh_data = generate_proposal_enhancements(proposal)
        return schemas_phase2.EnhancementResponse(
            proposal_id=proposal_id,
            identified_weaknesses=enh_data["identified_weaknesses"],
            executive_guidance=enh_data["executive_guidance"]
        )

    return schemas_phase2.EnhancementResponse(
        proposal_id=proposal_id,
        identified_weaknesses=record.identified_weaknesses,
        executive_guidance=record.executive_guidance,
        created_at=record.created_at
    )

@router.post("/proposals/{proposal_id}/enhancements/{weakness_id}/toggle", response_model=schemas_phase2.EnhancementResponse)
def toggle_enhancement_acceptance(proposal_id: int, weakness_id: int, db: Session = Depends(get_db)):
    """User review & accept capability: toggles whether an enhancement suggestion is accepted."""
    record = db.query(Phase2Enhancement).filter(Phase2Enhancement.proposal_id == proposal_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Enhancement record not found. Run analysis first.")

    weaknesses = [dict(w) for w in record.identified_weaknesses]
    found = False
    for item in weaknesses:
        if item.get("id") == weakness_id:
            item["accepted"] = not item.get("accepted", False)
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail=f"Weakness #{weakness_id} not found.")

    record.identified_weaknesses = weaknesses
    flag_modified(record, "identified_weaknesses")
    db.commit()
    db.refresh(record)

    return schemas_phase2.EnhancementResponse(
        proposal_id=proposal_id,
        identified_weaknesses=record.identified_weaknesses,
        executive_guidance=record.executive_guidance,
        created_at=record.created_at
    )


# ==============================================================================
# 6. DECISION SUPPORT ENDPOINTS
# ==============================================================================
@router.get("/proposals/{proposal_id}/decision", response_model=schemas_phase2.DecisionSupportResponse)
def get_decision_support(proposal_id: int, db: Session = Depends(get_db)):
    """Retrieve Consolidated Decision Support Synthesis."""
    proposal = _get_verified_proposal(proposal_id, db)
    record = db.query(Phase2DecisionSupport).filter(Phase2DecisionSupport.proposal_id == proposal_id).first()
    
    if not record:
        dec_data = generate_decision_support(proposal)
        return schemas_phase2.DecisionSupportResponse(
            proposal_id=proposal_id,
            advisory_verdict=dec_data["advisory_verdict"],
            decision_score=dec_data["decision_score"],
            executive_summary=dec_data["executive_summary"],
            positive_factors=dec_data["positive_factors"],
            negative_factors=dec_data["negative_factors"],
            critical_risks=dec_data["critical_risks"],
            funding_readiness_summary=dec_data["funding_readiness_summary"],
            funding_barriers=dec_data["funding_barriers"],
            priority_action_items=dec_data["priority_action_items"],
            human_review_disclaimer=dec_data["human_review_disclaimer"],
            confidence=dec_data["confidence"]
        )

    return schemas_phase2.DecisionSupportResponse(
        proposal_id=proposal_id,
        advisory_verdict=record.advisory_verdict,
        decision_score=record.decision_score,
        executive_summary=record.executive_summary,
        positive_factors=record.positive_factors,
        negative_factors=record.negative_factors,
        critical_risks=record.critical_risks,
        funding_readiness_summary=record.funding_readiness_summary,
        funding_barriers=record.funding_barriers,
        priority_action_items=record.priority_action_items,
        human_review_disclaimer=record.human_review_disclaimer,
        confidence=record.confidence,
        created_at=record.created_at
    )


# ==============================================================================
# 7. CONSOLIDATED PHASE 2 DASHBOARD DATA
# ==============================================================================
@router.get("/proposals/{proposal_id}/dashboard", response_model=schemas_phase2.Phase2DashboardResponse)
def get_phase2_dashboard_data(proposal_id: int, db: Session = Depends(get_db)):
    """Retrieve complete consolidated Phase 2 dashboard metrics."""
    proposal = _get_verified_proposal(proposal_id, db)
    
    risk_res = get_proposal_risk(proposal_id, None, None, None, None, db)
    funding_res = get_funding_readiness(proposal_id, db)
    plag_res = get_plagiarism_check(proposal_id, db)
    enh_res = get_proposal_enhancements(proposal_id, db)
    dec_res = get_decision_support(proposal_id, db)

    return schemas_phase2.Phase2DashboardResponse(
        proposal_id=proposal.id,
        title=proposal.title,
        filename=proposal.filename,
        domain=proposal.domain,
        phase1_status=proposal.status,
        risk=risk_res,
        funding_readiness=funding_res,
        plagiarism=plag_res,
        enhancements=enh_res,
        decision_support=dec_res,
        created_at=proposal.created_at
    )


# ==============================================================================
# 8. LOCAL PDF REPORT GENERATION & DOWNLOAD
# ==============================================================================
@router.get("/proposals/{proposal_id}/reports/{report_type}")
def download_phase2_pdf_report(
    proposal_id: int,
    report_type: str,  # 'risk', 'funding', 'recommendations', 'decision'
    db: Session = Depends(get_db)
):
    """
    Generates and streams a 100% locally produced PDF report using ReportLab.
    Zero external paid services used.
    """
    proposal = _get_verified_proposal(proposal_id, db)
    
    # Ensure data is ready
    risk_data = analyze_proposal_risk(proposal)
    funding_data = evaluate_funding_readiness(proposal, risk_data)

    clean_title = "".join(c for c in proposal.title if c.isalnum() or c in (' ', '_', '-')).rstrip()[:30].replace(" ", "_")

    if report_type == "risk":
        pdf_stream = generate_risk_pdf(proposal, risk_data)
        filename = f"R-Insight_Risk_Report_P{proposal_id}_{clean_title}.pdf"
    elif report_type == "funding":
        pdf_stream = generate_funding_pdf(proposal, funding_data)
        filename = f"R-Insight_Funding_Readiness_P{proposal_id}_{clean_title}.pdf"
    elif report_type == "recommendations":
        enh_data = generate_proposal_enhancements(proposal, risk_data, funding_data)
        pdf_stream = generate_recommendations_pdf(proposal, enh_data)
        filename = f"R-Insight_AI_Recommendations_P{proposal_id}_{clean_title}.pdf"
    elif report_type == "decision":
        plag_data = check_proposal_plagiarism(db, proposal)
        dec_data = generate_decision_support(proposal, risk_data, funding_data, plag_data)
        pdf_stream = generate_decision_pdf(proposal, dec_data, risk_data, funding_data)
        filename = f"R-Insight_Decision_Dossier_P{proposal_id}_{clean_title}.pdf"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown report type '{report_type}'. Valid types: 'risk', 'funding', 'recommendations', 'decision'."
        )

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return Response(content=pdf_stream.getvalue(), media_type="application/pdf", headers=headers)
