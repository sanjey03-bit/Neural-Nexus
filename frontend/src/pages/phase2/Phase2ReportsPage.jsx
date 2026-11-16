import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileDown,
  FileText,
  ShieldAlert,
  Gauge,
  Sparkles,
  Scale,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function Phase2ReportsPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);

  const reports = [
    {
      id: "risk",
      title: "Comprehensive Risk Analysis Report",
      subtitle: "Technical, Financial, Timeline & Resource Profiling",
      description: "Complete line-item risk assessment with evidence citations from the proposal text, budget feasibility indices, and prioritized mitigation checklists.",
      icon: ShieldAlert,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      filename: "R-Insight_Risk_Report.pdf",
    },
    {
      id: "funding",
      title: "Funding Readiness Evaluation Report",
      subtitle: "12-Criterion Institutional Review Rubric",
      description: "Full scoring matrix across research quality, novelty, feasibility, and impact. Identifies explicit funding barriers and recommended institutional revisions.",
      icon: Gauge,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      filename: "R-Insight_Funding_Readiness.pdf",
    },
    {
      id: "recommendations",
      title: "AI Proposal Enhancement Report",
      subtitle: "Structural Diagnostics & Recommended Rewrites",
      description: "Section-by-section analysis with original vs suggested academic rewrites for objectives, methodology, financial contingency, and research dissemination.",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      filename: "R-Insight_AI_Recommendations.pdf",
    },
    {
      id: "decision",
      title: "Consolidated Decision Support Dossier",
      subtitle: "Phase 1 + Phase 2 Multilateral Recommendation",
      description: "Executive advisory verdict synthesizing innovation, novelty, risk, and funding readiness for grant evaluation committees and supervisor review boards.",
      icon: Scale,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      filename: "R-Insight_Decision_Dossier.pdf",
    },
  ];

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 7 — Documentation Engine
          </span>
          <span className="text-xs text-gray-500">Local ReportLab PDF Compiler • 100% Free & Offline</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Phase 2 PDF Report Generation Center
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Generate and download publication-ready evaluation dossiers. All reports are rendered locally on your machine using ReportLab without external paid services.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
      />

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const downloadUrl = proposalId
            ? `/api/phase2/proposals/${proposalId}/reports/${r.id}`
            : "#";

          return (
            <div
              key={r.id}
              className="glass-card p-6 border-white/[0.08] flex flex-col justify-between"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${r.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded">
                    PDF / Printable
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{r.title}</h3>
                  <span className="text-xs text-brand-accent font-medium block mt-0.5">
                    {r.subtitle}
                  </span>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-mono">
                  {proposalId ? `Target: Proposal #${proposalId}` : "Select proposal above"}
                </span>

                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`glass-button-primary py-2 px-4 text-xs font-semibold flex items-center gap-2 ${
                    !proposalId ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Report (PDF)</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero-Cost Verification Banner */}
      <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <Lock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs text-gray-300">
          <span className="font-bold text-emerald-300">Zero-Cost Local Architecture Verified:</span>
          <p className="text-gray-400 leading-relaxed">
            All PDF dossiers are compiled strictly on the local backend using Python's open-source ReportLab toolkit.
            No document conversion APIs, cloud printers, or paid services are contacted.
          </p>
        </div>
      </div>
    </div>
  );
}
