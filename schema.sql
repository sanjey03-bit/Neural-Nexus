-- R-Insight Database Schema
-- Designed for MySQL Workbench / MySQL Server 8.0+

CREATE DATABASE IF NOT EXISTS r_insight;
USE r_insight;

-- -------------------------------------------------------------
-- Table proposals
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    domain VARCHAR(100) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table proposal_extractions
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposal_extractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL UNIQUE,
    objectives TEXT NOT NULL,
    methodology TEXT NOT NULL,
    budget TEXT NOT NULL,
    expected_outcomes TEXT NOT NULL,
    other_sections JSON DEFAULT NULL,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table reference_corpus
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reference_corpus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    doc_id VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table similarity_results
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS similarity_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    reference_id INT NOT NULL,
    similarity_score FLOAT NOT NULL,
    overlap_narrative TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (reference_id) REFERENCES reference_corpus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table scores
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL UNIQUE,
    innovation_score INT NOT NULL,
    innovation_justification TEXT NOT NULL,
    innovation_confidence FLOAT NOT NULL,
    quality_score INT NOT NULL,
    quality_justification TEXT NOT NULL,
    quality_confidence FLOAT NOT NULL,
    novelty_score INT NOT NULL,
    novelty_justification TEXT NOT NULL,
    novelty_confidence FLOAT NOT NULL,
    novelty_verdict VARCHAR(100) NOT NULL,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table evaluation_summaries
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL UNIQUE,
    summary_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PHASE 2 EXTENSIONS: Risk Assessment & Funding Decision Intelligence
-- =============================================================

-- -------------------------------------------------------------
-- Table phase2_risk_assessments
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phase2_risk_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    technical_score INT NOT NULL,
    technical_classification VARCHAR(50) NOT NULL,
    technical_risks JSON NOT NULL,
    financial_score INT NOT NULL,
    financial_classification VARCHAR(50) NOT NULL,
    financial_budget_feasibility_score INT NOT NULL,
    financial_risks JSON NOT NULL,
    timeline_score INT NOT NULL,
    timeline_classification VARCHAR(50) NOT NULL,
    timeline_risks JSON NOT NULL,
    resource_score INT NOT NULL,
    resource_classification VARCHAR(50) NOT NULL,
    resource_risks JSON NOT NULL,
    overall_risk_score INT NOT NULL,
    overall_risk_classification VARCHAR(50) NOT NULL,
    risk_weights JSON NOT NULL,
    overall_explanation TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table phase2_funding_readiness
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phase2_funding_readiness (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    overall_readiness_score INT NOT NULL,
    readiness_classification VARCHAR(100) NOT NULL,
    criteria_scores JSON NOT NULL,
    strengths JSON NOT NULL,
    weaknesses JSON NOT NULL,
    funding_barriers JSON NOT NULL,
    missing_information JSON NOT NULL,
    recommendations JSON NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table phase2_plagiarism_checks
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phase2_plagiarism_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    overall_overlap_percentage FLOAT NOT NULL,
    exact_match_percentage FLOAT NOT NULL,
    near_match_percentage FLOAT NOT NULL,
    semantic_similarity_percentage FLOAT NOT NULL,
    matching_passages JSON NOT NULL,
    matching_sources JSON NOT NULL,
    citation_observations JSON NOT NULL,
    recommendations JSON NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table phase2_enhancements
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phase2_enhancements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    identified_weaknesses JSON NOT NULL,
    executive_guidance TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Table phase2_decision_support
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phase2_decision_support (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    advisory_verdict VARCHAR(100) NOT NULL,
    decision_score INT NOT NULL,
    executive_summary TEXT NOT NULL,
    positive_factors JSON NOT NULL,
    negative_factors JSON NOT NULL,
    critical_risks JSON NOT NULL,
    funding_readiness_summary TEXT NOT NULL,
    funding_barriers JSON NOT NULL,
    priority_action_items JSON NOT NULL,
    human_review_disclaimer TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.88,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
