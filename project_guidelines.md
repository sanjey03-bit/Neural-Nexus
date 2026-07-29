# Project Guidelines — R-Insight (Module 1)

## 1. Scope for this phase
Build **Module 1: Proposal Intelligence & Innovation Discovery Engine** only. Module 2 (Risk
Assessment & Decision Support) is out of scope except for a disabled nav placeholder. Do not let
scope creep in — every feature added should map back to one of Module 1's four core functions:
proposal parsing/extraction, objective/methodology/budget/outcome analysis, domain classification,
and semantic-similarity/multi-agent scoring.

## 2. Architecture overview

```
React (Vite + Tailwind, glassmorphic dark UI)
        │  REST calls (JSON over HTTPS)
        ▼
Backend API (Express or FastAPI — pick ONE, document choice below)
        │  reads/writes
        ▼
MySQL (schema managed in MySQL Workbench, .sql file checked into repo)
        │
        │  backend also calls out to ↓
        ▼
AI Pipeline Service (Jupyter/Colab notebook exported to a callable service)
  Extraction Agent → Novelty & Classification Agent → Scoring/Review Agent
  (Llama 3/Gemma + LangChain/RAG + ChromaDB + Sentence Transformers)
```

**Backend framework decision**: **FastAPI (Python)**.
Whichever is chosen, use it exclusively; do not run two backend frameworks in parallel.

## 3. Frontend standards
- React function components + hooks only. No class components.
- Tailwind CSS utility classes only — no separate CSS-in-JS, no component library that overrides
  the visual language (no Material UI / Bootstrap / Ant Design).
- **Visual identity**: glassmorphic, dark, minimalistic.
  - Background: dark base (near-black or deep muted navy/charcoal), optionally a subtle gradient.
  - Panels/cards: translucent frosted glass (`bg-white/5` to `bg-white/10` + `backdrop-blur-md` +
    a thin `border-white/10`), soft shadow, rounded corners (consistent radius across the app).
  - Color: one accent hue used consistently for primary actions, active states, and score
    highlights. Do not introduce a second accent color without reason. No neon, no
    rainbow-gradient text.
  - Typography: one font family, 2 weights (regular + semibold/bold). Titles get real size
    contrast from body text; avoid decorative underline bars beneath headings.
  - No literal `•` bullets — use proper list styling. No skeuomorphic borders or drop shadows that
    fight the flat/glass aesthetic.
  - Loading/progress states are required wherever the AI pipeline is running — never leave the
    user staring at a blank or frozen screen during multi-agent processing.
- Routing: `/upload`, `/proposals`, `/dashboard/:proposalId`, plus a disabled "Module 2" nav item.
- State: keep it simple — React state/context is sufficient for this scope; no Redux needed unless
  the team decides otherwise.
- **No browser storage** (`localStorage`/`sessionStorage`) for anything that needs to persist —
  always go through the REST API.

## 4. Backend standards
- All routes versioned or clearly namespaced (e.g., `/api/proposals`, `/api/proposals/:id/status`,
  `/api/proposals/:id/dashboard`, `/api/proposals/:id/novelty`, `/api/proposals/:id/summary`,
  `/api/admin/corpus`).
- Backend is the single point of contact with MySQL and with the AI pipeline service — the
  frontend never talks to either directly.
- Validate uploads (file type PDF/DOCX, reasonable size limit) before handing off to the AI
  pipeline.
- Long-running AI pipeline calls should be async: kick off processing, return a `proposal_id`
  immediately, and let the frontend poll a status endpoint (or use webhooks/SSE if the team wants
  to go further) rather than holding an HTTP request open for minutes.
- Environment variables (DB credentials, AI service URL/tunnel, any API keys) live in a `.env`
  file, excluded from version control via `.gitignore`. Provide a `.env.example` with dummy values.

## 5. Database schema (MySQL / Workbench)
Maintain a single `schema.sql` at the repo root, importable directly into MySQL Workbench. Minimum
tables:

| Table | Purpose |
|---|---|
| `proposals` | one row per uploaded proposal; id, title, filename, domain (nullable until classified), status, timestamps |
| `proposal_extractions` | structured objectives/methodology/budget/outcomes JSON or normalized columns, FK to `proposals.id` |
| `reference_corpus` | seed + admin-added reference papers/patents (title, source, embedding reference id) |
| `similarity_results` | per-proposal ranked list of similar reference docs + similarity score + narrative, FK to `proposals.id` |
| `scores` | innovation_score, quality_score, novelty_verdict, each with justification text + confidence, FK to `proposals.id` |
| `evaluation_summaries` | final plain-language summary text, FK to `proposals.id` |

Keep foreign keys enforced. Any schema change must be reflected in `schema.sql` and mentioned in a
commit/PR description.

## 6. AI pipeline standards
- Development happens in a Jupyter Notebook on Google Colab (for GPU access to run Llama 3/Gemma).
- The notebook must be structured in clearly separated, re-runnable cells per agent (Extraction →
  Novelty/Classification → Scoring/Review), not one monolithic cell.
- Export the pipeline logic into a form the backend can call over HTTP with a stable JSON contract
  (see `agents.md` Part B) — don't leave it as notebook-only, un-callable code.
- Every generated score must ship with: (a) a justification string, (b) a confidence value. No bare
  numbers.
- Log intermediate agent outputs for traceability/explainability, per the project's literature
  review emphasis on explainable AI (XAI) and trust.
- Be mindful of bias: where feasible, exclude author name/institution from the fields the scoring
  agent sees, in line with the anonymization approach discussed in the literature review.

## 7. Simplicity rules (read before every change)
- Ship the simplest working solution — no speculative abstractions, no config knobs nobody asked
  for, no extra service layers "for future flexibility."
- One function/class = one clear responsibility. If you can't name it precisely, split it.
- No duplicated logic — if the same 3+ lines appear twice, extract a helper.
- No unused variables, imports, dead code paths, or commented-out blocks left in the codebase.
- Prefer explicit, readable code over clever one-liners; optimize for the next reader, not for
  fewest keystrokes.
- Plan before coding: settle the schema, the route list, and the agent contract first (see
  `agents.md`), then implement once — this project is built in a single pass, not iterated through
  throwaway drafts.

## 8. General engineering practices
- Keep `agents.md`, `requirements.txt`, and this file in sync with the actual code at all times —
  treat them as living documents, not one-time scaffolding.
- Favor readable, demoable code over cleverness — this is a capstone project reviewed by a
  supervisor and evaluation panel.
- Commit in small, logical units; write commit messages that explain *why*, not just *what*.
- Before declaring a feature done, verify it against this file and `antigravity_master_prompt.md`'s
  Outputs section — the four required outputs (Dashboard, Innovation & Quality Scores, Novelty
  Assessment Report, Proposal Evaluation Summary) must all be reachable in the UI.
