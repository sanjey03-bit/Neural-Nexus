import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Gauge,
  FileSearch,
  Scale,
  Sparkles,
  FileDown,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function Phase2DashboardPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/phase2/proposals/${id}/dashboard`);
      if (!res.ok) throw new Error("Failed to load Phase 2 dashboard.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error loading dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchDashboard(proposalId);
    }
  }, [proposalId]);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
              Phase 2 Executive Cockpit
            </span>
            <span className="text-xs text-gray-500">Live Multi-Module Aggregation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Phase 2 Intelligence Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Consolidated oversight across risk modeling, funding readiness, plagiarism audit, and committee decision support.
          </p>
        </div>

        {proposalId && (
          <Link
            to={`/phase2/reports?proposalId=${proposalId}`}
            className="glass-button-secondary py-2 text-xs flex items-center gap-2"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Generate PDF Reports</span>
          </Link>
        )}
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchDashboard(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Loading consolidated Phase 2 metrics...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Risk */}
            <div className="glass-card p-5 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Overall Risk Score
                </span>
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-black text-white">
                  {data.risk?.overall_risk_score ?? "N/A"}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 100</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">
                  {data.risk?.overall_risk_classification || "Pending"}
                </span>
                <Link to={`/phase2/risk?proposalId=${proposalId}`} className="text-brand-accent hover:underline flex items-center gap-0.5">
                  Inspect <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Funding Readiness */}
            <div className="glass-card p-5 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Funding Readiness
                </span>
                <Gauge className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-black text-white">
                  {data.funding_readiness?.overall_readiness_score ?? "N/A"}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 100</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium truncate max-w-[140px]">
                  {data.funding_readiness?.readiness_classification || "Pending"}
                </span>
                <Link to={`/phase2/funding?proposalId=${proposalId}`} className="text-brand-accent hover:underline flex items-center gap-0.5">
                  Inspect <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Advisory Verdict */}
            <div className="glass-card p-5 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Advisory Verdict
                </span>
                <Scale className="h-4 w-4 text-sky-400" />
              </div>
              <div className="my-2">
                <span className="text-xs font-bold text-sky-300 leading-snug line-clamp-2">
                  {data.decision_support?.advisory_verdict || "Pending Analysis"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400 font-mono">
                  Score: {data.decision_support?.decision_score || "N/A"}/100
                </span>
                <Link to={`/phase2/decision?proposalId=${proposalId}`} className="text-brand-accent hover:underline flex items-center gap-0.5">
                  Inspect <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Textual Overlap */}
            <div className="glass-card p-5 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Textual Originality
                </span>
                <FileSearch className="h-4 w-4 text-purple-400" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-black text-white">
                  {data.plagiarism?.overall_overlap_percentage ?? "0.0"}%
                </span>
                <span className="text-xs text-gray-500 ml-1">overlap</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Local reference corpus</span>
                <Link to={`/phase2/plagiarism?proposalId=${proposalId}`} className="text-brand-accent hover:underline flex items-center gap-0.5">
                  Inspect <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Visualizations: Radar Chart & Rubric Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SVG Risk Radar Chart */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-brand-accent" />
                  <h3 className="text-sm font-bold text-white">4-Axis Risk Radar</h3>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">Scale: 0-100</span>
              </div>

              <div className="flex items-center justify-center py-4">
                <RiskRadarChart
                  technical={data.risk?.technical.score || 35}
                  financial={data.risk?.financial.score || 40}
                  timeline={data.risk?.timeline.score || 45}
                  resource={data.risk?.resource.score || 30}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.04] text-center">
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-[10px] text-gray-400 block">Technical</span>
                  <span className="text-xs font-bold text-white font-mono">{data.risk?.technical.score}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-[10px] text-gray-400 block">Financial</span>
                  <span className="text-xs font-bold text-white font-mono">{data.risk?.financial.score}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-[10px] text-gray-400 block">Timeline</span>
                  <span className="text-xs font-bold text-white font-mono">{data.risk?.timeline.score}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-[10px] text-gray-400 block">Resource</span>
                  <span className="text-xs font-bold text-white font-mono">{data.risk?.resource.score}%</span>
                </div>
              </div>
            </div>

            {/* Rubric Horizontal Bar Distribution */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Funding Rubric Distribution</h3>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">12 Key Indicators</span>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[290px] pr-2 custom-scrollbar">
                {data.funding_readiness?.criteria_scores?.map((c, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium truncate max-w-[220px]">
                        {c.criterion}
                      </span>
                      <span className="text-gray-400 font-mono text-[11px]">
                        {c.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
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
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-gray-400">
                <span>Higher score reflects grant approval probability</span>
                <Link to={`/phase2/funding?proposalId=${proposalId}`} className="text-emerald-400 hover:underline">
                  View Full Matrix →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick PDF Reports Banner */}
          <div className="glass-card p-6 border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Generate Local PDF Documentation</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Download fully formatted evaluation dossiers compiled 100% locally with ReportLab.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/api/phase2/proposals/${proposalId}/reports/risk`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary py-1.5 px-3 text-xs"
              >
                Risk Report
              </a>
              <a
                href={`/api/phase2/proposals/${proposalId}/reports/funding`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary py-1.5 px-3 text-xs"
              >
                Funding Report
              </a>
              <a
                href={`/api/phase2/proposals/${proposalId}/reports/recommendations`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary py-1.5 px-3 text-xs"
              >
                Enhancements
              </a>
              <a
                href={`/api/phase2/proposals/${proposalId}/reports/decision`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-primary py-1.5 px-3 text-xs font-semibold"
              >
                Decision Dossier
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Interactive SVG Risk Radar Chart ---
function RiskRadarChart({ technical, financial, timeline, resource }) {
  const size = 260;
  const center = size / 2;
  const maxRadius = 90;

  // 4 Axes: Top (Tech), Right (Fin), Bottom (Time), Left (Res)
  const angleTech = -Math.PI / 2;
  const angleFin = 0;
  const angleTime = Math.PI / 2;
  const angleRes = Math.PI;

  const getCoordinates = (value, angle) => {
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const pTech = getCoordinates(technical, angleTech);
  const pFin = getCoordinates(financial, angleFin);
  const pTime = getCoordinates(timeline, angleTime);
  const pRes = getCoordinates(resource, angleRes);

  const polygonPoints = `${pTech.x},${pTech.y} ${pFin.x},${pFin.y} ${pTime.x},${pTime.y} ${pRes.x},${pRes.y}`;

  // Guideline rings at 25, 50, 75, 100
  const rings = [25, 50, 75, 100];

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circular rings */}
        {rings.map((ring) => {
          const r = (ring / 100) * maxRadius;
          return (
            <circle
              key={ring}
              cx={center}
              cy={center}
              r={r}
              className="stroke-white/[0.08] fill-none"
              strokeDasharray={ring === 100 ? "0" : "3 3"}
              strokeWidth="1"
            />
          );
        })}

        {/* Axes lines */}
        <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} className="stroke-white/[0.08]" strokeWidth="1" />
        <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} className="stroke-white/[0.08]" strokeWidth="1" />

        {/* Benchmark polygon (50% average baseline) */}
        <polygon
          points={`
            ${center},${center - maxRadius * 0.5}
            ${center + maxRadius * 0.5},${center}
            ${center},${center + maxRadius * 0.5}
            ${center - maxRadius * 0.5},${center}
          `}
          className="stroke-gray-600/40 fill-gray-500/5"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Actual Proposal Risk polygon */}
        <polygon
          points={polygonPoints}
          className="stroke-amber-400 fill-amber-500/20 transition-all duration-700"
          strokeWidth="2"
        />

        {/* Vertex dots */}
        <circle cx={pTech.x} cy={pTech.y} r="4" className="fill-amber-400" />
        <circle cx={pFin.x} cy={pFin.y} r="4" className="fill-amber-400" />
        <circle cx={pTime.x} cy={pTime.y} r="4" className="fill-amber-400" />
        <circle cx={pRes.x} cy={pRes.y} r="4" className="fill-amber-400" />

        {/* Labels */}
        <text x={center} y={center - maxRadius - 12} textAnchor="middle" className="fill-gray-300 text-[10px] font-bold">
          Technical
        </text>
        <text x={center + maxRadius + 16} y={center + 4} textAnchor="start" className="fill-gray-300 text-[10px] font-bold">
          Financial
        </text>
        <text x={center} y={center + maxRadius + 18} textAnchor="middle" className="fill-gray-300 text-[10px] font-bold">
          Timeline
        </text>
        <text x={center - maxRadius - 16} y={center + 4} textAnchor="end" className="fill-gray-300 text-[10px] font-bold">
          Resource
        </text>
      </svg>
    </div>
  );
}
