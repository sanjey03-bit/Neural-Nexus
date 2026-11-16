# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Phase2RiskAssessment(Base):
    __tablename__ = "phase2_risk_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 4 Core Risk Dimensions
    technical_score = Column(Integer, nullable=False)
    technical_classification = Column(String(50), nullable=False)
    technical_risks = Column(JSON, nullable=False)
    
    financial_score = Column(Integer, nullable=False)
    financial_classification = Column(String(50), nullable=False)
    financial_budget_feasibility_score = Column(Integer, nullable=False)
    financial_risks = Column(JSON, nullable=False)
    
    timeline_score = Column(Integer, nullable=False)
    timeline_classification = Column(String(50), nullable=False)
    timeline_risks = Column(JSON, nullable=False)
    
    resource_score = Column(Integer, nullable=False)
    resource_classification = Column(String(50), nullable=False)
    resource_risks = Column(JSON, nullable=False)
    
    # Weighted synthesis
    overall_risk_score = Column(Integer, nullable=False)
    overall_risk_classification = Column(String(50), nullable=False)
    risk_weights = Column(JSON, nullable=False)
    overall_explanation = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85)
    
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="risk_assessment")


class Phase2FundingReadiness(Base):
    __tablename__ = "phase2_funding_readiness"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    overall_readiness_score = Column(Integer, nullable=False)
    readiness_classification = Column(String(100), nullable=False)
    
    criteria_scores = Column(JSON, nullable=False)
    strengths = Column(JSON, nullable=False)
    weaknesses = Column(JSON, nullable=False)
    funding_barriers = Column(JSON, nullable=False)
    missing_information = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    confidence = Column(Float, nullable=False, default=0.85)
    
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="funding_readiness")


class Phase2PlagiarismCheck(Base):
    __tablename__ = "phase2_plagiarism_checks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    overall_overlap_percentage = Column(Float, nullable=False)
    exact_match_percentage = Column(Float, nullable=False)
    near_match_percentage = Column(Float, nullable=False)
    semantic_similarity_percentage = Column(Float, nullable=False)
    
    matching_passages = Column(JSON, nullable=False)
    matching_sources = Column(JSON, nullable=False)
    citation_observations = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    disclaimer = Column(Text, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="plagiarism_check")


class Phase2Enhancement(Base):
    __tablename__ = "phase2_enhancements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    identified_weaknesses = Column(JSON, nullable=False)
    executive_guidance = Column(Text, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="enhancement")


class Phase2DecisionSupport(Base):
    __tablename__ = "phase2_decision_support"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    advisory_verdict = Column(String(100), nullable=False)
    decision_score = Column(Integer, nullable=False)
    executive_summary = Column(Text, nullable=False)
    
    positive_factors = Column(JSON, nullable=False)
    negative_factors = Column(JSON, nullable=False)
    critical_risks = Column(JSON, nullable=False)
    funding_readiness_summary = Column(Text, nullable=False)
    funding_barriers = Column(JSON, nullable=False)
    priority_action_items = Column(JSON, nullable=False)
    human_review_disclaimer = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.88)
    
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="decision_support")
