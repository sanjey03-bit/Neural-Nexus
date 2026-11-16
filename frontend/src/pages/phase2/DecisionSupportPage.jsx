import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Printer,
  FileDown,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function DecisionSupportPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDecisionData = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/phase2/proposals/${id}/decision`);
      if (!res.ok) throw new Error("Failed to load decision support dossier.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error fetching decision support data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchDecisionData(proposalId);
    }
  }, [proposalId]);

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case "Recommended for Further Consideration":
        return {
          bg: "bg-emerald-500/15",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          glow: "shadow-emerald-500/10",
        };
      case "Recommended After Improvements":
        return {
          bg: "bg-sky-500/15",
          text: "text-sky-400",
          border: "border-sky-500/30",
          glow: "shadow-sky-500/10",
        };
      case "Requires Major Revisions":
        return {
          bg: "bg-amber-500/15",
          text: "text-amber-400",
          border: "border-amber-500/30",
          glow: "shadow-amber-500/10",
        };
      default:
        return {
          bg: "bg-red-500/15",
          text: "text-red-400",
          border: "border-red-500/30",
          glow: "shadow-red-500/10",
        };
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-sky-500/15 border border-sky-500/30 text-sky-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 5 — Decision Intelligence
          </span>
          <span className="text-xs text-gray-500">Cross-Phase Synthesis • Advisory Verdict</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Explainable Decision Support Dossier
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Consolidates Phase 1 proposal intelligence with Phase 2 risk and readiness assessments into an explainable executive recommendation for funding committees and academic peer reviewers.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchDecisionData(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Synthesizing Phase 1 & Phase 2 intelligence metrics...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Executive Verdict Hero Card */}
          {(() => {
            const vStyle = getVerdictStyle(data.advisory_verdict);
            return (
              <div className={`glass-card p-8 border ${vStyle.border} ${vStyle.bg} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl ${vStyle.glow}`}>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">
                    Official Advisory Recommendation
                  </span>
                  <h2 className={`text-2xl sm:text-3xl font-black ${vStyle.text} tracking-tight`}>
                    {data.advisory_verdict}
                  </h2>
                  <p className="text-xs text-gray-300 max-w-2xl leading-relaxed mt-1">
                    {data.funding_readiness_summary}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/[0.08] min-w-[130px]">
                    <span className="text-3xl font-black text-white">{data.decision_score}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">Decision Score</span>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1">
                      {Math.round(data.confidence * 100)}% Confidence
                    </span>
                  </div>

                  {proposalId && (
                    <a
                      href={`/api/phase2/proposals/${proposalId}/reports/decision`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button-primary py-3 px-5 text-xs font-semibold flex items-center gap-2 self-stretch"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Executive Narrative */}
          <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-brand-accent" />
              <span>Executive Synthesis Narrative</span>
            </h3>
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-black/30 p-4 rounded-xl border border-white/[0.04]">
              {data.executive_summary}
            </div>
          </div>

          {/* Positive vs Negative Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Positive Evaluation Factors</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.positive_factors?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative / Risks */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Negative Evaluation Factors & Vulnerabilities</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.negative_factors?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
                    <span>{f}</span>
                  </div>
                ))}
                {data.critical_risks?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-300">
                    <span className="text-red-400 shrink-0 mt-0.5">✕</span>
                    <span>Critical Risk: {r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Action Items */}
          <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-sky-400" />
              <span>Priority Action Items for Grant Proposal Revision</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              {data.priority_action_items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5 text-xs text-gray-300"
                >
                  <span className="font-mono font-bold text-brand-accent shrink-0">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Human Reviewer Disclaimer */}
          <div className="glass-card p-5 border-white/[0.08] bg-white/[0.01] flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs text-gray-400 leading-relaxed">
              <span className="font-bold text-gray-300">Decision Support Advisory Disclaimer:</span>
              <p>{data.human_review_disclaimer}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
