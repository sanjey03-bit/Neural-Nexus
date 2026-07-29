# pyrefly: ignore [missing-import]
import chromadb
# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
from backend.config import settings
from typing import List, Dict, Any

# Load the SentenceTransformer model (will download once on demand)
model = SentenceTransformer("all-MiniLM-L6-v2")

class ChromaStore:
    def __init__(self):
        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(path=str(settings.CHROMA_DB_DIR))
        # Get or create collection with cosine similarity space
        self.collection = self.client.get_or_create_collection(
            name="reference_corpus",
            metadata={"hnsw:space": "cosine"}
        )

    def add_reference(self, doc_id: str, text: str, title: str, source: str):
        """Add a reference document with its vector embedding to ChromaDB."""
        embedding = model.encode(text).tolist()
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[{"title": title, "source": source}]
        )

    def search_similar(self, text: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search ChromaDB for similar documents and return list with similarity percentage."""
        if self.collection.count() == 0:
            return []
            
        embedding = model.encode(text).tolist()
        results = self.collection.query(
            query_embeddings=[embedding],
            n_results=min(limit, self.collection.count())
        )

        matches = []
        if not results or not results["ids"]:
            return []

        # Parse query results
        ids = results["ids"][0]
        distances = results["distances"][0]
        documents = results["documents"][0]
        metadatas = results["metadatas"][0]

        for i in range(len(ids)):
            # Cosine distance in ChromaDB is 1 - CosineSimilarity.
            # So similarity_score = (1 - distance) * 100
            dist = distances[i]
            sim_score = max(0.0, min(100.0, (1.0 - dist) * 100.0))
            
            matches.append({
                "doc_id": ids[i],
                "abstract": documents[i],
                "title": metadatas[i].get("title", "Unknown"),
                "source": metadatas[i].get("source", "Unknown"),
                "similarity_score": round(sim_score, 1)
            })
            
        # Sort by similarity score descending
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matches

# Singleton instance
chroma_store = ChromaStore()
