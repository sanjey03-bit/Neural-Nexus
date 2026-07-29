# agents.md — R-Insight (Module 1)

This file has two audiences: (1) the **Antigravity coding agent(s)** working in this repo, and
(2) documentation of the **application's own multi-agent AI pipeline** (Module 1's Multi-Agent AI
Framework). Keep both sections current as the project evolves.

---

## Part A — Instructions for the Antigravity coding agent

- Read this file, `project_guidelines.md`, and `requirements.txt` before making any change.
- Work module-by-module: finish Module 1 (Proposal Intelligence & Innovation Discovery Engine)
  fully — frontend, backend, DB, AI pipeline, integration — before starting Module 2 code. If asked
  to scaffold Module 2, only add a disabled nav stub, nothing functional.
- One backend framework only (Express **or** FastAPI — check `project_guidelines.md` for which one
  was chosen for this repo and stay consistent).
- Never introduce a second CSS approach alongside Tailwind (no inline style sprawl, no CSS-in-JS
  libraries, no Bootstrap).
- Whenever you add a new Python package anywhere in the repo (backend, notebook, or scripts),
  append it to `requirements.txt` with a pinned or minimum version in the same change.
- Whenever you add a new database table or column, update the `.sql` schema file and note the
  change in `project_guidelines.md`'s "Database Schema" section.
- Every AI-generated score must be persisted with its justification text and a confidence value —
  never write a bare numeric score to the database.
- Do not fetch or call any AI service directly from React components. All AI/DB access goes
  through the REST API.
- Prefer small, reviewable commits/changes over large rewrites; this is a student capstone repo
  that gets demoed to a supervisor, so keep it explainable and readable, not clever.
- If a task is ambiguous, default to the simplest option that satisfies `project_guidelines.md`
  and state the assumption in a code comment or PR description rather than blocking.

---

## Part B — The application's own agents (Multi-Agent AI Framework)

These are the AI agents implemented inside Module 1's pipeline (run from the Jupyter/Colab
notebook, exposed to the REST backend over HTTP). Each agent has one job, a defined input, a
defined output, and must log its reasoning so the pipeline stays explainable.

### 1. Extraction Agent
- **Input**: raw proposal file (PDF/DOCX) after text extraction.
- **Job**: parse the document into structured fields — objectives, methodology, budget, expected
  outcomes, and any other clearly labeled sections.
- **Output**: a structured JSON object matching the `proposal_extractions` table schema.
- **Model**: Llama 3 / Gemma via LangChain, prompted for structured (JSON) output.

### 2. Novelty & Classification Agent
- **Input**: extracted proposal text + the ChromaDB reference-corpus index.
- **Job**: (a) classify the proposal's research domain/category; (b) embed the proposal via
  Sentence Transformers and run a RAG similarity search against ChromaDB to find the most similar
  existing papers/patents; (c) write a short narrative on where the proposal overlaps with or
  diverges from each close match.
- **Output**: domain label, ranked list of similar reference documents with similarity scores, and
  narrative text — matching `similarity_results` table schema.

### 3. Scoring / Review Agent
- **Input**: outputs of Agents 1 and 2.
- **Job**: synthesize an Innovation Score, a Quality Score, and an overall Novelty verdict, each
  with a plain-language justification and a confidence value; then compose the final Proposal
  Evaluation Summary in reviewer-friendly language (no jargon dump).
- **Output**: rows for `scores` and `evaluation_summaries` tables.

### Pipeline contract (notebook ⇄ REST backend)
- The notebook/service exposes one HTTP entry point that accepts `{ proposal_id, raw_text,
  metadata }` and returns `{ extraction: {...}, similarity: {...}, scores: {...}, summary: "..." }`
  once all three agents complete, plus a status-polling shape `{ proposal_id, stage, done }` for
  the frontend's progress indicator. Keep this contract in sync with the backend's expected
  payloads — update both sides together if it changes.
- Log each agent's intermediate output (not just the final synthesis) so a reviewer can trace how
  a score was reached — this is the explainability requirement from the project's literature
  review (XAI).
