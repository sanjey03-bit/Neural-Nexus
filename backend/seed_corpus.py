import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.database import SessionLocal, engine
from backend import models
from backend.chroma_store import chroma_store

# Pre-seeded abstracts for similarity search comparison
SEED_PAPERS = [
    # --- Category: Information Technology & AI ---
    {
        "title": "Attention Is All You Need",
        "abstract": "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. The model achieves 28.4 BLEU on English-to-German and 41.8 BLEU on English-to-French translation.",
        "source": "arXiv:1706.03762 (Research Paper)"
    },
    {
        "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        "abstract": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks.",
        "source": "arXiv:1810.04805 (Research Paper)"
    },
    {
        "title": "Generative Adversarial Nets",
        "abstract": "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G. The training procedure for G is to maximize the probability of D making a mistake. This framework corresponds to a minimax two-player game.",
        "source": "NIPS 2014 (Research Paper)"
    },
    # --- Category: Internet of Things (IoT) ---
    {
        "title": "A Smart Water Monitoring System Using IoT and Edge Computing",
        "abstract": "This patent details a distributed internet-of-things system configured for real-time monitoring of water quality parameters. The system features low-power microcontrollers interfaced with pH, turbidity, and temperature sensors. A custom edge-computing node aggregates telemetry data and runs a local anomaly detection algorithm before transmitting critical reports over a LoRaWAN mesh network, minimizing cellular bandwidth consumption.",
        "source": "US Patent US10928374B2"
    },
    {
        "title": "An Integrated LoRaWAN Gateway for Precision Agriculture",
        "abstract": "A hardware design and communication protocol for precision farming telemetry. The gateway coordinates a network of battery-powered soil moisture and temperature sensors distributed over a multi-hectare farm. Utilizing optimized sleep cycles, the nodes achieve a battery life of up to five years, transmitting environmental indicators to a centralized cloud platform for automated irrigation scheduling.",
        "source": "IEEE Internet of Things Journal (Research Paper)"
    },
    # --- Category: Cybersecurity ---
    {
        "title": "Decentralized Access Control Framework for Multi-Tenant Cloud Environments Using Blockchain",
        "abstract": "We present a decentralized access control model utilizing smart contracts on the Ethereum blockchain. The architecture replaces traditional centralized Identity and Access Management (IAM) systems in multi-tenant environments. By storing access policies on a tamper-proof ledger and using cryptographic signatures, we demonstrate resistance against insider privilege escalation attacks and achieve auditability of access requests.",
        "source": "Computers & Security (Research Paper)"
    },
    {
        "title": "Intrusion Detection System for Industrial Control Systems Using Deep Belief Networks",
        "abstract": "Industrial Control Systems (ICS) are increasingly targets of sophisticated cyber threats. This paper proposes a network-based intrusion detection system utilizing Deep Belief Networks (DBN) trained on industrial Modbus traffic. The model identifies zero-day logic injection attacks and unauthorized telemetry manipulation with high accuracy, outperforming traditional shallow classifiers like Support Vector Machines.",
        "source": "IEEE Transactions on Industrial Informatics (Research Paper)"
    },
    # --- Category: Biotechnology & Medicine ---
    {
        "title": "CRISPR-Cas9 Gene Editing for Targeted In-Vivo Therapeutics",
        "abstract": "We describe a novel lipid nanoparticle delivery system configured to deliver CRISPR-Cas9 components directly to hepatocytes in mice models. By packaging guide RNAs targeting the PCSK9 gene, we demonstrate a stable 50% reduction in serum cholesterol levels following a single intravenous administration. The study details off-target sequencing audits to establish therapeutic safety profiles.",
        "source": "Nature Biotechnology (Research Paper)"
    },
    {
        "title": "Deep Learning for Automated Classification of Dermatological Lesions",
        "abstract": "A convolutional neural network architecture trained on clinical skin lesion photographs. The classifier distinguishes between benign nevi and malignant melanomas with sensitivity comparable to board-certified dermatologists. The system uses a model explainability layer displaying activation heatmaps to support clinical decision-making during examinations.",
        "source": "Journal of the American Academy of Dermatology (Research Paper)"
    },
    # --- Category: Electrical Engineering & Energy ---
    {
        "title": "A Bidirectional Solid-State Transformer for Smart Grid Energy Routing",
        "abstract": "This invention covers a high-frequency solid-state transformer configured for bidirectional power routing between residential solar storage units and localized distribution grids. The power electronics topology utilizes Silicon Carbide (SiC) MOSFETs to achieve a 98.5% efficiency. It incorporates dynamic reactive power compensation algorithms to stabilize grid voltages.",
        "source": "US Patent US11289945B1"
    },
    {
        "title": "Deep Reinforcement Learning for Optimal Battery Storage Dispatch in Microgrids",
        "abstract": "Managing energy storage systems under fluctuating tariff rates and volatile renewable generation is challenging. This paper presents a Deep Q-Network (DQN) agent that schedules battery charging and discharging cycles in a solar-powered microgrid. Trained on historical grid data, the agent reduces electricity costs by 18% compared to rule-based heuristics.",
        "source": "IEEE Transactions on Smart Grid (Research Paper)"
    },
    # --- Category: Humanities & Social Sciences (Exploratory/Qualitative) ---
    {
        "title": "The Digital Divide: Socio-Economic Influences on Remote Education in Tamil Nadu",
        "abstract": "A qualitative sociological survey investigating remote learning experiences among middle-school children across rural districts of Tamil Nadu. Using structured interview datasets from 150 families, we examine how variables like smartphone availability, electricity outages, and parental literacy shape learning outcomes. The study discusses policy requirements for localized regional-language content.",
        "source": "Indian Journal of Social Work (Research Paper)"
    },
    {
        "title": "Reconstructing Historical Trade Routes of the Indian Ocean Using Epigraphical Records",
        "abstract": "This monograph conducts an archaeological and linguistic analysis of 9th-12th century Tamil inscriptions discovered along coastal ports in Southeast Asia. By correlating harbor records with maritime trade logs, we map commercial exchanges. The research details historical integrations of merchant guilds and cultural diffusion across the Bay of Bengal.",
        "source": "Journal of Southeast Asian Studies (Research Paper)"
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # Enforce table creation
        models.Base.metadata.create_all(bind=engine)

        # Check if database is already seeded
        count = db.query(models.ReferenceCorpus).count()
        if count > 0:
            print(f"Database already contains {count} reference documents. Skipping seeding.")
            return

        print("Seeding MySQL database and ChromaDB collection...")

        for i, paper in enumerate(SEED_PAPERS):
            doc_id = f"ref_{i + 1}"
            
            # 1. Add to MySQL
            ref = models.ReferenceCorpus(
                title=paper["title"],
                abstract=paper["abstract"],
                source=paper["source"],
                doc_id=doc_id
            )
            db.add(ref)
            db.commit()
            db.refresh(ref)

            # 2. Add to ChromaDB
            chroma_store.add_reference(
                doc_id=doc_id,
                text=paper["abstract"],
                title=paper["title"],
                source=paper["source"]
            )
            print(f"Indexed [{ref.id}]: {ref.title}")

        print("Seeding completed successfully!")
    except Exception as e:
        print(f"Seeding failed: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
