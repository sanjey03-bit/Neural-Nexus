from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Risk Analysis Schemas ---
class SingleRiskItem(BaseModel):
    risk: str
    evidence: str
    explanation: str
    mitigation: str
    confidence: float = 0.85

class DimensionRiskDetail(BaseModel):
    score: int
    classification: str
    risks: List[Dict[str, Any]]
    confidence: float
    explanation: Optional[str] = None
    extra_metrics: Optional[Dict[str, Any]] = None

class RiskAssessmentResponse(BaseModel):
    proposal_id: int
    technical: DimensionRiskDetail
    financial: DimensionRiskDetail
    timeline: DimensionRiskDetail
    resource: DimensionRiskDetail
    overall_risk_score: int
    overall_risk_classification: str
    risk_weights: Dict[str, float]
    overall_explanation: str
    confidence: float
    created_at: Optional[datetime] = None

class RiskAnalysisRequest(BaseModel):
    weights: Optional[Dict[str, float]] = None


# --- Funding Readiness Schemas ---
class CriterionScoreItem(BaseModel):
    criterion: str
    score: int
    weight: float
    explanation: str
    confidence: float

class FundingReadinessResponse(BaseModel):
    proposal_id: int
    overall_readiness_score: int
    readiness_classification: str
    criteria_scores: List[CriterionScoreItem]
    strengths: List[str]
    weaknesses: List[str]
    funding_barriers: List[str]
    missing_information: List[str]
    recommendations: List[str]
    confidence: float
    created_at: Optional[datetime] = None


# --- Plagiarism & Textual Similarity Schemas ---
class MatchingPassageItem(BaseModel):
    proposal_passage: str
    reference_passage: str
    doc_title: str
    doc_source: str
    similarity_pct: float
    match_method: str  # "Exact Sentence Match", "Phrase Overlap", "Near-Duplicate", "Semantic Alignment"
    proposal_section: str
    explanation: str

class PlagiarismCheckResponse(BaseModel):
    proposal_id: int
    overall_overlap_percentage: float
    exact_match_percentage: float
    near_match_percentage: float
    semantic_similarity_percentage: float
    matching_passages: List[MatchingPassageItem]
    matching_sources: List[Dict[str, Any]]
    citation_observations: List[str]
    recommendations: List[str]
    disclaimer: str
    created_at: Optional[datetime] = None


# --- AI Proposal Enhancement Schemas ---
class WeaknessItem(BaseModel):
    id: int
    section: str
    problem: str
    why_it_matters: str
    evidence: str
    suggested_improvement: str
    priority: str  # "High", "Medium", "Low"
    expected_benefit: str
    related_criterion: str
    original_text: str
    rewritten_text: str
    accepted: bool = False

class EnhancementResponse(BaseModel):
    proposal_id: int
    identified_weaknesses: List[WeaknessItem]
    executive_guidance: str
    created_at: Optional[datetime] = None

class AcceptEnhancementRequest(BaseModel):
    weakness_id: int
    accepted: bool = True


# --- Decision Support Schemas ---
class DecisionSupportResponse(BaseModel):
    proposal_id: int
    advisory_verdict: str  # "Recommended for Further Consideration", "Recommended After Improvements", "Requires Major Revisions", "Not Recommended in Current Form"
    decision_score: int
    executive_summary: str
    positive_factors: List[str]
    negative_factors: List[str]
    critical_risks: List[str]
    funding_readiness_summary: str
    funding_barriers: List[str]
    priority_action_items: List[str]
    human_review_disclaimer: str
    confidence: float
    created_at: Optional[datetime] = None


# --- Consolidated Phase 2 Dashboard Payload ---
class Phase2DashboardResponse(BaseModel):
    proposal_id: int
    title: str
    filename: str
    domain: Optional[str] = None
    phase1_status: str
    risk: Optional[RiskAssessmentResponse] = None
    funding_readiness: Optional[FundingReadinessResponse] = None
    plagiarism: Optional[PlagiarismCheckResponse] = None
    enhancements: Optional[EnhancementResponse] = None
    decision_support: Optional[DecisionSupportResponse] = None
    created_at: Optional[datetime] = None
