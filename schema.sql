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
