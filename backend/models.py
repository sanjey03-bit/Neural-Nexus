# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    domain = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, default="pending")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Cascading relationships
    extraction = relationship("ProposalExtraction", back_populates="proposal", uselist=False, cascade="all, delete-orphan")
    similarity_results = relationship("SimilarityResult", back_populates="proposal", cascade="all, delete-orphan")
    scores = relationship("Scores", back_populates="proposal", uselist=False, cascade="all, delete-orphan")
    evaluation_summary = relationship("EvaluationSummary", back_populates="proposal", uselist=False, cascade="all, delete-orphan")


class ProposalExtraction(Base):
    __tablename__ = "proposal_extractions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), unique=True, nullable=False)
    objectives = Column(Text, nullable=False)
    methodology = Column(Text, nullable=False)
    budget = Column(Text, nullable=False)
    expected_outcomes = Column(Text, nullable=False)
    other_sections = Column(JSON, nullable=True)

    proposal = relationship("Proposal", back_populates="extraction")


class ReferenceCorpus(Base):
    __tablename__ = "reference_corpus"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    doc_id = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    similarity_matches = relationship("SimilarityResult", back_populates="reference", cascade="all, delete-orphan")


class SimilarityResult(Base):
    __tablename__ = "similarity_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False)
    reference_id = Column(Integer, ForeignKey("reference_corpus.id", ondelete="CASCADE"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    overlap_narrative = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="similarity_results")
    reference = relationship("ReferenceCorpus", back_populates="similarity_matches")


class Scores(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), unique=True, nullable=False)
    innovation_score = Column(Integer, nullable=False)
    innovation_justification = Column(Text, nullable=False)
    innovation_confidence = Column(Float, nullable=False)
    quality_score = Column(Integer, nullable=False)
    quality_justification = Column(Text, nullable=False)
    quality_confidence = Column(Float, nullable=False)
    novelty_score = Column(Integer, nullable=False)
    novelty_justification = Column(Text, nullable=False)
    novelty_confidence = Column(Float, nullable=False)
    novelty_verdict = Column(String(100), nullable=False)

    proposal = relationship("Proposal", back_populates="scores")


class EvaluationSummary(Base):
    __tablename__ = "evaluation_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), unique=True, nullable=False)
    summary_text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    proposal = relationship("Proposal", back_populates="evaluation_summary")
