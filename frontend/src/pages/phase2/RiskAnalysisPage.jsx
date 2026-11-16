import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldAlert,
  Cpu,
  DollarSign,
  Clock,
  Users,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function RiskAnalysisPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Weight sliders state
  const [weights, setWeights] = useState({
    tech: 30,
    fin: 30,
    time: 20,
    res: 20,
  });
  const [recalculating, setRecalculating] = useState(false);

  const fetchRiskData = async (id, customWeights = null) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      let url = `/api/phase2/proposals/${id}/risk`;
      if (customWeights) {
        url += `?w_tech=${customWeights.tech}&w_fin=${customWeights.fin}&w_time=${customWeights.time}&w_res=${customWeights.res}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load risk analysis data.");
      const json = await res.json();
      setData(json);
      if (json.risk_weights) {
        setWeights({
          tech: Math.round(json.risk_weights.technical * 100),
          fin: Math.round(json.risk_weights.financial * 100),
          time: Math.round(json.risk_weights.timeline * 100),
          res: Math.round(json.risk_weights.resource * 100),
        });
      }
    } catch (err) {
      setError(err.message || "Error fetching risk profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchRiskData(proposalId);
    }
  }, [proposalId]);

  const handleApplyWeights = async (e) => {
    e.preventDefault();
    if (!proposalId) return;
    setRecalculating(true);
    await fetchRiskData(proposalId, weights);
    setRecalculating(false);
  };

  const getTierBadge = (classification) => {
    switch (classification) {
      case "Low":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Medium":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "High":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Critical":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/15 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 1 — Risk Assessment
          </span>
          <span className="text-xs text-gray-500">4 Dimensions • Weighted Deterministic Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Comprehensive Risk Analysis
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Evaluates project vulnerability across technical complexity, line-item budget feasibility, timeline milestones, and resource availability with concrete evidence from the proposal.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchRiskData(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Evaluating multi-dimensional risk matrix...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Top Overall Risk Card & Configurable Weights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Risk Gauge */}
            <div className="glass-card p-6 flex flex-col justify-between border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Overall Composite Risk
                </span>
                <span className={`badge border ${getTierBadge(data.overall_risk_classification)}`}>
                  {data.overall_risk_classification} Risk
                </span>
              </div>

              <div className="flex items-center gap-6 my-4">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-white/[0.05] fill-none"
                      strokeWidth="7"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-amber-400 fill-none transition-all duration-1000"
                      strokeWidth="7"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - data.overall_risk_score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{data.overall_risk_score}</span>
                    <span className="text-[10px] text-gray-500 font-mono">/ 100</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-white">Project Risk Index</h3>
                  <p className="text-xs text-gray-400">
                    Scale 0–100. Higher score indicates elevated operational risk.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Confidence {Math.round(data.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                "{data.overall_explanation}"
              </p>
            </div>

            {/* Configurable Risk Weights Panel */}
            <div className="glass-card p-6 lg:col-span-2 border-white/[0.08] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-brand-accent" />
                    <h3 className="text-sm font-bold text-white">
                      Configurable Policy Weights
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    Total: {weights.tech + weights.fin + weights.time + weights.res}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Adjust dimension priorities to align with specific committee grant policies or funding program mandates.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Tech */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">Technical</span>
                      <span className="font-mono text-brand-accent">{weights.tech}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={weights.tech}
                      onChange={(e) => setWeights({ ...weights, tech: parseInt(e.target.value, 10) })}
                      className="w-full accent-brand-accent cursor-pointer"
                    />
                  </div>

                  {/* Financial */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">Financial</span>
                      <span className="font-mono text-brand-accent">{weights.fin}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={weights.fin}
                      onChange={(e) => setWeights({ ...weights, fin: parseInt(e.target.value, 10) })}
                      className="w-full accent-brand-accent cursor-pointer"
                    />
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">Timeline</span>
                      <span className="font-mono text-brand-accent">{weights.time}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={weights.time}
                      onChange={(e) => setWeights({ ...weights, time: parseInt(e.target.value, 10) })}
                      className="w-full accent-brand-accent cursor-pointer"
                    />
                  </div>

                  {/* Resource */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">Resource</span>
                      <span className="font-mono text-brand-accent">{weights.res}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={weights.res}
                      onChange={(e) => setWeights({ ...weights, res: parseInt(e.target.value, 10) })}
                      className="w-full accent-brand-accent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  Initial Defaults: 30% Tech, 30% Fin, 20% Time, 20% Res
                </span>
                <button
                  onClick={handleApplyWeights}
                  disabled={recalculating}
                  className="glass-button-secondary py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />
                  <span>Recalculate Scores</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Dimension Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Technical Risk */}
            <RiskDimensionCard
              title="Technical Risk"
              icon={Cpu}
              score={data.technical.score}
              classification={data.technical.classification}
              risks={data.technical.risks}
              explanation={data.technical.explanation}
              confidence={data.technical.confidence}
              getTierBadge={getTierBadge}
            />

            {/* 2. Financial Risk */}
            <RiskDimensionCard
              title="Financial Risk"
              icon={DollarSign}
              score={data.financial.score}
              classification={data.financial.classification}
              risks={data.financial.risks}
              explanation={data.financial.explanation}
              confidence={data.financial.confidence}
              extraMetric={{
                label: "Budget Feasibility",
                value: `${data.financial.extra_metrics?.budget_feasibility_score || 75}/100`,
              }}
              getTierBadge={getTierBadge}
            />

            {/* 3. Timeline Risk */}
            <RiskDimensionCard
              title="Timeline Risk"
              icon={Clock}
              score={data.timeline.score}
              classification={data.timeline.classification}
              risks={data.timeline.risks}
              explanation={data.timeline.explanation}
              confidence={data.timeline.confidence}
              getTierBadge={getTierBadge}
            />

            {/* 4. Resource Risk */}
            <RiskDimensionCard
              title="Resource Risk"
              icon={Users}
              score={data.resource.score}
              classification={data.resource.classification}
              risks={data.resource.risks}
              explanation={data.resource.explanation}
              confidence={data.resource.confidence}
              getTierBadge={getTierBadge}
            />
          </div>
        </>
      )}
    </div>
  );
}

function RiskDimensionCard({
  title,
  icon: Icon,
  score,
  classification,
  risks,
  explanation,
  confidence,
  extraMetric,
  getTierBadge,
}) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between border-white/[0.08]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-brand-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <span className="text-[11px] text-gray-500 font-mono">
                Confidence {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {extraMetric && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-mono">
                {extraMetric.label}: {extraMetric.value}
              </span>
            )}
            <span className={`badge border ${getTierBadge(classification)}`}>
              {score}/100 • {classification}
            </span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 75
                ? "bg-red-400"
                : score >= 50
                ? "bg-amber-400"
                : score >= 25
                ? "bg-sky-400"
                : "bg-emerald-400"
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>

        {/* Identified Risk Points */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Identified Vulnerabilities & Mitigations
          </span>
          {risks && risks.length > 0 ? (
            risks.map((r, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    {r.risk}
                  </span>
                  {r.confidence && (
                    <span className="text-[9px] font-mono text-gray-500">
                      Conf. {Math.round(r.confidence * 100)}%
                    </span>
                  )}
                </div>

                {r.evidence && (
                  <p className="text-[11px] text-gray-400 italic bg-black/30 p-2 rounded-lg border border-white/[0.03]">
                    <span className="text-gray-500 not-italic font-semibold">Evidence:</span> "{r.evidence}"
                  </p>
                )}

                <p className="text-xs text-gray-300 leading-relaxed">
                  {r.explanation}
                </p>

                {r.mitigation && (
                  <div className="mt-1 pt-2 border-t border-white/[0.04] flex items-start gap-1.5 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Mitigation:</strong> {r.mitigation}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No elevated risk factors detected in this dimension.</p>
          )}
        </div>
      </div>
    </div>
  );
}
