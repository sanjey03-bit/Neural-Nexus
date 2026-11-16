import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lightbulb,
  FileText,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function EnhancementsPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchEnhancements = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/phase2/proposals/${id}/enhancements`);
      if (!res.ok) throw new Error("Failed to load AI enhancements.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error fetching AI recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchEnhancements(proposalId);
    }
  }, [proposalId]);

  const handleToggleAccept = async (weaknessId) => {
    if (!proposalId) return;
    setTogglingId(weaknessId);
    try {
      const res = await fetch(
        `/api/phase2/proposals/${proposalId}/enhancements/${weaknessId}/toggle`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    }
  };

  const acceptedCount = data?.identified_weaknesses?.filter((w) => w.accepted)?.length || 0;
  const totalCount = data?.identified_weaknesses?.length || 0;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-purple-500/15 border border-purple-500/30 text-purple-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 4 — AI Enhancement Studio
          </span>
          <span className="text-xs text-gray-500">Actionable Diagnostics • Side-by-Side Rewrites</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          AI Proposal Enhancement Engine
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Analyzes proposal sections for structural and methodological weaknesses. Generates high-impact academic rewrites with supporting evidence and reviewer justification.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchEnhancements(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Generating targeted section improvements and rewrites...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Executive Guidance Banner & Acceptance Counter */}
          <div className="glass-card p-6 border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">
                  AI Enhancement Dossier
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                  {data.executive_guidance}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Accepted Modifications
                </span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {acceptedCount} of {totalCount} suggestions
                </span>
              </div>
            </div>
          </div>

          {/* Weaknesses & Rewrites List */}
          <div className="flex flex-col gap-6">
            {data.identified_weaknesses?.map((w) => (
              <div
                key={w.id}
                className={`glass-card p-6 border-white/[0.08] transition-all duration-200 ${
                  w.accepted ? "bg-emerald-500/[0.02] border-emerald-500/30" : ""
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/[0.03] text-gray-300 border border-white/[0.06]">
                      #{w.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{w.section}</h3>
                        <span className={`badge border text-[10px] ${getPriorityBadge(w.priority)}`}>
                          {w.priority} Priority
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{w.problem}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleAccept(w.id)}
                    disabled={togglingId === w.id}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 self-start sm:self-auto ${
                      w.accepted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : "glass-button-primary"
                    }`}
                  >
                    {w.accepted ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Accepted for Review Dossier</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>Accept Suggestion</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Why It Matters:
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">{w.why_it_matters}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Expected Committee Benefit:
                    </span>
                    <p className="text-xs text-emerald-300 leading-relaxed">
                      {w.expected_benefit} <span className="text-gray-500 font-mono">({w.related_criterion})</span>
                    </p>
                  </div>
                </div>

                {/* Proposal Evidence */}
                {w.evidence && (
                  <div className="mb-4 p-3 rounded-lg bg-black/40 border border-white/[0.04] text-xs text-gray-400">
                    <strong className="text-gray-300">Supporting Proposal Evidence:</strong> "{w.evidence}"
                  </div>
                )}

                {/* Side-by-Side: Original vs Rewritten */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* Original Text */}
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/30 border border-white/[0.05]">
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-gray-500" />
                      Original Proposal Formulation
                    </span>
                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line italic">
                      {w.original_text || "No original text available."}
                    </p>
                  </div>

                  {/* AI Rewritten Text */}
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-brand-accent/[0.04] border border-brand-accent/20">
                    <span className="text-xs font-semibold text-brand-accent flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Recommended Academic Rewrite
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                      {w.rewritten_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
