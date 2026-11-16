import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Gauge,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  FileQuestion,
  TrendingUp,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function FundingReadinessPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFundingData = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/phase2/proposals/${id}/funding-readiness`);
      if (!res.ok) throw new Error("Failed to load funding readiness evaluation.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error fetching funding readiness.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchFundingData(proposalId);
    }
  }, [proposalId]);

  const getTierColor = (classification) => {
    switch (classification) {
      case "Highly Funding Ready":
        return {
          bg: "bg-emerald-500/15",
          text: "text-emerald-400",
          border: "border-emerald-500/30",
          bar: "bg-emerald-400",
        };
      case "Funding Ready with Minor Improvements":
        return {
          bg: "bg-sky-500/15",
          text: "text-sky-400",
          border: "border-sky-500/30",
          bar: "bg-sky-400",
        };
      case "Needs Significant Improvements":
        return {
          bg: "bg-amber-500/15",
          text: "text-amber-400",
          border: "border-amber-500/30",
          bar: "bg-amber-400",
        };
      default:
        return {
          bg: "bg-red-500/15",
          text: "text-red-400",
          border: "border-red-500/30",
          bar: "bg-red-400",
        };
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 2 — Funding Engine
          </span>
          <span className="text-xs text-gray-500">12 Criteria Matrix • Institutional Rubric</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Funding Readiness Evaluation
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Synthesizes scientific merit, feasibility, and resource readiness into an objective grant score, highlighting critical funding barriers and required committee enhancements.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchFundingData(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Compiling 12-criterion readiness scorecard...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Top Scorecard & Tier Banner */}
          {(() => {
            const tier = getTierColor(data.readiness_classification);
            return (
              <div className="glass-card p-6 border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-white/[0.05] fill-none"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className={`stroke-emerald-400 fill-none transition-all duration-1000`}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * (1 - data.overall_readiness_score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">{data.overall_readiness_score}</span>
                      <span className="text-[10px] text-gray-500 font-mono">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                      Readiness Rating
                    </span>
                    <span className={`badge border mt-1.5 ${tier.bg} ${tier.text} ${tier.border}`}>
                      {data.readiness_classification}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">
                      Confidence: {Math.round(data.confidence * 100)}%
                    </p>
                  </div>
                </div>

                {/* Score explanation */}
                <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
                  <h3 className="text-sm font-bold text-white mb-1">
                    Grant Allocation Assessment
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Evaluated against 12 weighted institutional rubric criteria across scientific quality, novelty, technical and financial feasibility, timeline gating, and resource capacity.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300">
                      85–100: Highly Ready
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300">
                      70–84: Minor Improvements
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300">
                      50–69: Major Improvements
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-300">
                      0–49: Not Ready
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 12 Criteria Table */}
          <div className="glass-card p-6 border-white/[0.08]">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-accent" />
              <span>12-Criterion Rubric Breakdown</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Criterion</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Evaluator Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data.criteria_scores?.map((c, i) => (
                    <tr key={i} className="hover:bg-white/[0.01]">
                      <td className="px-4 py-3 text-xs font-bold text-white whitespace-nowrap">
                        {c.criterion}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {Math.round(c.weight * 100)}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono w-10">
                            {c.score}/100
                          </span>
                          <div className="w-24 bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.score >= 75
                                  ? "bg-emerald-400"
                                  : c.score >= 55
                                  ? "bg-sky-400"
                                  : "bg-amber-400"
                              }`}
                              style={{ width: `${c.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300 leading-relaxed">
                        {c.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Identified Proposal Strengths</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.strengths?.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span>Identified Evaluation Weaknesses</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.weaknesses?.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-red-400 shrink-0 mt-0.5">•</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Funding Barriers & Missing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Barriers */}
            <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Critical Funding Barriers</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.funding_barriers?.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Info */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-sky-400" />
                <span>Required Documentation & Missing Data</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.missing_information?.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-sky-400 shrink-0 mt-0.5">•</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Actionable Recommendations to Qualify for Full Funding</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              {data.recommendations?.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 flex items-start gap-2"
                >
                  <span className="font-bold text-brand-accent font-mono shrink-0">{idx + 1}.</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
