import io
from datetime import datetime
from typing import Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

from backend import models

def _get_base_styles():
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0ea5e9")  # Brand Accent
    c_dark = colors.HexColor("#0f172a")     # Slate 900
    c_text = colors.HexColor("#334155")     # Slate 700
    c_light = colors.HexColor("#f8fafc")    # Slate 50
    c_border = colors.HexColor("#cbd5e1")   # Slate 300

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_dark,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=c_primary,
        spaceAfter=12,
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=c_dark,
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_text,
    )

    callout_style = ParagraphStyle(
        "Callout",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569"),
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#64748b"),
        alignment=1, # Center
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "section": section_heading,
        "body": body_style,
        "callout": callout_style,
        "disclaimer": disclaimer_style,
        "c_primary": c_primary,
        "c_dark": c_dark,
        "c_light": c_light,
        "c_border": c_border,
    }


def _build_header(proposal: models.Proposal, report_title: str, styles: dict) -> list:
    story = []
    
    # Brand Top Banner
    story.append(Paragraph("R-INSIGHT : AI-AUGMENTED PROPOSAL INTELLIGENCE", styles["subtitle"]))
    story.append(Paragraph(report_title, styles["title"]))
    story.append(Spacer(1, 4))
    
    meta_data = [
        [
            Paragraph("<b>Proposal:</b> " + (proposal.title or "Untitled"), styles["body"]),
            Paragraph("<b>Discipline:</b> " + (proposal.domain or "General STEM"), styles["body"]),
        ],
        [
            Paragraph("<b>Source File:</b> " + (proposal.filename or "N/A"), styles["body"]),
            Paragraph("<b>Generated:</b> " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"), styles["body"]),
        ]
    ]
    t = Table(meta_data, colWidths=[3.5 * inch, 3.5 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), styles["c_light"]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=styles["c_primary"], spaceAfter=12))
    return story


def _build_footer(styles: dict) -> list:
    story = []
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=styles["c_border"], spaceAfter=8))
    story.append(Paragraph(
        "CONFIDENTIAL & ADVISORY ONLY — R-Insight Academic Decision Support System — "
        "Generated 100% locally with zero external API dependencies. Final funding decisions rest exclusively with authorized human review committees.",
        styles["disclaimer"]
    ))
    return story


# ==============================================================================
# 1. RISK ANALYSIS PDF
# ==============================================================================
def generate_risk_pdf(proposal: models.Proposal, risk_data: Dict[str, Any]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_base_styles()
    story = _build_header(proposal, "Phase 2 Comprehensive Risk Analysis Report", styles)

    # Executive Risk Gauge Summary Table
    overall_score = risk_data.get("overall_risk_score", 0)
    overall_class = risk_data.get("overall_risk_classification", "Medium")

    summary_rows = [
        [
            Paragraph("<b>Overall Project Risk</b>", styles["body"]),
            Paragraph(f"<b>{overall_score} / 100</b> ({overall_class})", styles["body"]),
            Paragraph("<b>Evaluation Confidence:</b> " + str(int(risk_data.get("confidence", 0.85) * 100)) + "%", styles["body"])
        ],
        [
            Paragraph("<b>Technical Risk:</b> " + str(risk_data["technical"]["score"]) + "/100 (" + risk_data["technical"]["classification"] + ")", styles["body"]),
            Paragraph("<b>Financial Risk:</b> " + str(risk_data["financial"]["score"]) + "/100 (" + risk_data["financial"]["classification"] + ")", styles["body"]),
            Paragraph("<b>Budget Feasibility:</b> " + str(risk_data["financial"].get("budget_feasibility_score", 70)) + "/100", styles["body"])
        ],
        [
            Paragraph("<b>Timeline Risk:</b> " + str(risk_data["timeline"]["score"]) + "/100 (" + risk_data["timeline"]["classification"] + ")", styles["body"]),
            Paragraph("<b>Resource Risk:</b> " + str(risk_data["resource"]["score"]) + "/100 (" + risk_data["resource"]["classification"] + ")", styles["body"]),
            Paragraph("<b>Weights:</b> Tech 30%, Fin 30%, Time 20%, Res 20%", styles["body"])
        ]
    ]
    st = Table(summary_rows, colWidths=[2.33 * inch, 2.33 * inch, 2.33 * inch])
    st.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 1, styles["c_primary"]),
        ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(st)
    story.append(Spacer(1, 10))

    # Explanation Narrative
    story.append(Paragraph("<b>Risk Synthesis & Explanations:</b>", styles["section"]))
    story.append(Paragraph(risk_data.get("overall_explanation", ""), styles["body"]))
    story.append(Spacer(1, 10))

    # Dimension Breakdown
    dimensions = [
        ("Technical Risk Profile", risk_data["technical"]),
        ("Financial & Budget Risk Profile", risk_data["financial"]),
        ("Timeline & Milestone Risk Profile", risk_data["timeline"]),
        ("Resource & Expertise Readiness Profile", risk_data["resource"]),
    ]

    for dim_title, dim_data in dimensions:
        story.append(Paragraph(f"<b>{dim_title} — Score: {dim_data['score']}/100 ({dim_data['classification']})</b>", styles["section"]))
        
        risks_list = dim_data.get("risks", [])
        if risks_list:
            table_data = [
                [
                    Paragraph("<b>Identified Risk Factor</b>", styles["body"]),
                    Paragraph("<b>Proposal Evidence</b>", styles["body"]),
                    Paragraph("<b>Recommended Mitigation</b>", styles["body"])
                ]
            ]
            for r in risks_list:
                table_data.append([
                    Paragraph(f"<b>{r.get('risk', '')}</b><br/>{r.get('explanation', '')}", styles["body"]),
                    Paragraph(r.get("evidence", "N/A"), styles["callout"]),
                    Paragraph(r.get("mitigation", "N/A"), styles["body"]),
                ])
            rt = Table(table_data, colWidths=[2.5 * inch, 2.2 * inch, 2.3 * inch])
            rt.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), styles["c_light"]),
                ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
                ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
                ('PADDING', (0,0), (-1,-1), 5),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(rt)
        story.append(Spacer(1, 8))

    story.extend(_build_footer(styles))
    doc.build(story)
    buffer.seek(0)
    return buffer


# ==============================================================================
# 2. FUNDING READINESS PDF
# ==============================================================================
def generate_funding_pdf(proposal: models.Proposal, funding_data: Dict[str, Any]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_base_styles()
    story = _build_header(proposal, "Phase 2 Funding Readiness Evaluation Report", styles)

    readiness_score = funding_data.get("overall_readiness_score", 0)
    readiness_class = funding_data.get("readiness_classification", "Pending")

    header_table = [
        [
            Paragraph("<b>Overall Funding Readiness</b>", styles["body"]),
            Paragraph(f"<b>{readiness_score} / 100</b>", styles["title"]),
            Paragraph(f"<b>Status:</b> {readiness_class}<br/><b>Confidence:</b> {int(funding_data.get('confidence', 0.85)*100)}%", styles["body"])
        ]
    ]
    ht = Table(header_table, colWidths=[2.5 * inch, 2.0 * inch, 2.5 * inch])
    ht.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 1, styles["c_primary"]),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(ht)
    story.append(Spacer(1, 10))

    # Criteria Score Table
    story.append(Paragraph("<b>12-Criterion Evaluation Matrix:</b>", styles["section"]))
    criteria = funding_data.get("criteria_scores", [])
    crit_rows = [
        [
            Paragraph("<b>Evaluation Criterion</b>", styles["body"]),
            Paragraph("<b>Weight</b>", styles["body"]),
            Paragraph("<b>Score</b>", styles["body"]),
            Paragraph("<b>Evaluator Rationale & Evidence</b>", styles["body"]),
        ]
    ]
    for c in criteria:
        crit_rows.append([
            Paragraph(f"<b>{c.get('criterion', '')}</b>", styles["body"]),
            Paragraph(str(int(c.get("weight", 0) * 100)) + "%", styles["body"]),
            Paragraph(f"<b>{c.get('score', 0)} / 100</b>", styles["body"]),
            Paragraph(c.get("explanation", ""), styles["body"]),
        ])
    ct = Table(crit_rows, colWidths=[1.8 * inch, 0.7 * inch, 0.9 * inch, 3.6 * inch])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(ct)
    story.append(Spacer(1, 10))

    # Strengths & Funding Barriers side by side
    strengths_text = "<br/>".join([f"• {s}" for s in funding_data.get("strengths", ["Standard methodology."])])
    barriers_text = "<br/>".join([f"• {b}" for b in funding_data.get("funding_barriers", ["None."])])

    col_data = [
        [
            Paragraph("<b>Identified Proposal Strengths</b>", styles["body"]),
            Paragraph("<b>Critical Funding Barriers</b>", styles["body"])
        ],
        [
            Paragraph(strengths_text, styles["body"]),
            Paragraph(barriers_text, styles["body"])
        ]
    ]
    col_t = Table(col_data, colWidths=[3.5 * inch, 3.5 * inch])
    col_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(col_t)
    story.append(Spacer(1, 10))

    # Recommendations
    story.append(Paragraph("<b>Actionable Funding Improvements:</b>", styles["section"]))
    recs = funding_data.get("recommendations", [])
    for idx, r in enumerate(recs, 1):
        story.append(Paragraph(f"<b>{idx}.</b> {r}", styles["body"]))
        story.append(Spacer(1, 3))

    story.extend(_build_footer(styles))
    doc.build(story)
    buffer.seek(0)
    return buffer


# ==============================================================================
# 3. AI RECOMMENDATIONS PDF
# ==============================================================================
def generate_recommendations_pdf(proposal: models.Proposal, enhancement_data: Dict[str, Any]) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_base_styles()
    story = _build_header(proposal, "Phase 2 AI Proposal Enhancement Report", styles)

    story.append(Paragraph("<b>Executive Guidance:</b>", styles["section"]))
    story.append(Paragraph(enhancement_data.get("executive_guidance", ""), styles["body"]))
    story.append(Spacer(1, 10))

    weaknesses = enhancement_data.get("identified_weaknesses", [])
    for w in weaknesses:
        story.append(Paragraph(
            f"<b>Item #{w.get('id', 1)}: {w.get('section', '')} — [{w.get('priority', 'Medium')} Priority]</b>",
            styles["section"]
        ))
        
        item_table = [
            [
                Paragraph("<b>Identified Problem:</b>", styles["body"]),
                Paragraph(w.get("problem", ""), styles["body"])
            ],
            [
                Paragraph("<b>Why It Matters:</b>", styles["body"]),
                Paragraph(w.get("why_it_matters", ""), styles["body"])
            ],
            [
                Paragraph("<b>Proposal Evidence:</b>", styles["body"]),
                Paragraph(w.get("evidence", ""), styles["callout"])
            ],
            [
                Paragraph("<b>Suggested Rewrite:</b>", styles["body"]),
                Paragraph(w.get("rewritten_text", "").replace("\n", "<br/>"), styles["body"])
            ],
            [
                Paragraph("<b>Expected Benefit:</b>", styles["body"]),
                Paragraph(f"{w.get('expected_benefit', '')} (Target: {w.get('related_criterion', '')})", styles["body"])
            ]
        ]
        it = Table(item_table, colWidths=[1.8 * inch, 5.2 * inch])
        it.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), styles["c_light"]),
            ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
            ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(it)
        story.append(Spacer(1, 10))

    story.extend(_build_footer(styles))
    doc.build(story)
    buffer.seek(0)
    return buffer


# ==============================================================================
# 4. EXPLAINABLE DECISION SUPPORT PDF
# ==============================================================================
def generate_decision_pdf(
    proposal: models.Proposal,
    decision_data: Dict[str, Any],
    risk_data: Dict[str, Any],
    funding_data: Dict[str, Any]
) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = _get_base_styles()
    story = _build_header(proposal, "Phase 2 Consolidated Decision Support Dossier", styles)

    verdict = decision_data.get("advisory_verdict", "Pending Review")
    dec_score = decision_data.get("decision_score", 0)

    # Highlight Banner
    verdict_table = [
        [
            Paragraph("<b>ADVISORY RECOMMENDATION:</b>", styles["body"]),
            Paragraph(f"<b>{verdict.upper()}</b>", styles["title"]),
            Paragraph(f"<b>Composite Decision Score:</b> {dec_score} / 100<br/><b>Confidence:</b> {int(decision_data.get('confidence', 0.88)*100)}%", styles["body"])
        ]
    ]
    vt = Table(verdict_table, colWidths=[2.2 * inch, 2.8 * inch, 2.0 * inch])
    vt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 1.5, styles["c_primary"]),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(vt)
    story.append(Spacer(1, 10))

    # Executive Summary Narrative
    story.append(Paragraph("<b>Executive Synthesis Narrative:</b>", styles["section"]))
    story.append(Paragraph(decision_data.get("executive_summary", "").replace("\n", "<br/>"), styles["body"]))
    story.append(Spacer(1, 10))

    # Multilateral Comparison Table: Phase 1 vs Phase 2
    p1 = proposal.scores
    comp_rows = [
        [
            Paragraph("<b>Evaluation Dimension</b>", styles["body"]),
            Paragraph("<b>Phase</b>", styles["body"]),
            Paragraph("<b>Score / Verdict</b>", styles["body"]),
            Paragraph("<b>Summary Observation</b>", styles["body"]),
        ],
        [
            Paragraph("Innovation Index", styles["body"]),
            Paragraph("Phase 1", styles["body"]),
            Paragraph(f"{p1.innovation_score if p1 else 75}/100", styles["body"]),
            Paragraph(p1.innovation_justification[:100] + "..." if p1 else "N/A", styles["body"]),
        ],
        [
            Paragraph("Scientific Quality", styles["body"]),
            Paragraph("Phase 1", styles["body"]),
            Paragraph(f"{p1.quality_score if p1 else 78}/100", styles["body"]),
            Paragraph(p1.quality_justification[:100] + "..." if p1 else "N/A", styles["body"]),
        ],
        [
            Paragraph("Novelty Verdict", styles["body"]),
            Paragraph("Phase 1", styles["body"]),
            Paragraph(f"{p1.novelty_verdict if p1 else 'Moderate'} ({p1.novelty_score if p1 else 70}/100)", styles["body"]),
            Paragraph(p1.novelty_justification[:100] + "..." if p1 else "N/A", styles["body"]),
        ],
        [
            Paragraph("Overall Risk Exposure", styles["body"]),
            Paragraph("Phase 2", styles["body"]),
            Paragraph(f"{risk_data.get('overall_risk_score', 0)}/100 ({risk_data.get('overall_risk_classification', 'Med')})", styles["body"]),
            Paragraph(f"Tech: {risk_data['technical']['score']}, Fin: {risk_data['financial']['score']}, Time: {risk_data['timeline']['score']}, Res: {risk_data['resource']['score']}", styles["body"]),
        ],
        [
            Paragraph("Funding Readiness", styles["body"]),
            Paragraph("Phase 2", styles["body"]),
            Paragraph(f"{funding_data.get('overall_readiness_score', 0)}/100", styles["body"]),
            Paragraph(funding_data.get("readiness_classification", ""), styles["body"]),
        ],
    ]
    ct = Table(comp_rows, colWidths=[1.8 * inch, 0.8 * inch, 1.4 * inch, 3.0 * inch])
    ct.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), styles["c_light"]),
        ('BOX', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('GRID', (0,0), (-1,-1), 0.5, styles["c_border"]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(ct)
    story.append(Spacer(1, 10))

    # Priority Action Items
    story.append(Paragraph("<b>Priority Action Items for Applicant Revision:</b>", styles["section"]))
    actions = decision_data.get("priority_action_items", [])
    for idx, act in enumerate(actions, 1):
        story.append(Paragraph(f"<b>{idx}.</b> {act}", styles["body"]))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))
    story.append(Paragraph(f"<b>Review Disclaimer:</b> {decision_data.get('human_review_disclaimer', '')}", styles["callout"]))

    story.extend(_build_footer(styles))
    doc.build(story)
    buffer.seek(0)
    return buffer
