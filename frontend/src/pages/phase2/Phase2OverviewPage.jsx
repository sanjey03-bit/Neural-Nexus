import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Gauge,
  FileSearch,
  Sparkles,
  Scale,
  LayoutDashboard,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function Phase2OverviewPage() {
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const modules = [
    {
      title: "Comprehensive Risk Analysis",
      description: "4-dimensional risk modeling: Technical, Financial, Timeline, and Resource feasibility with evidence-based scoring and mitigations.",
      icon: ShieldAlert,
      path: "/phase2/risk",
      color: "from-amber-500/20 to-red-500/10",
      accent: "text-amber-400",
      tag: "4 Dimensions",
    },
    {
      title: "Funding Readiness Evaluation",
      description: "12-criterion institutional evaluation matrix synthesizing scientific quality, feasibility, and impact into an actionable readiness tier.",
      icon: Gauge,
      path: "/phase2/funding",
      color: "from-emerald-500/20 to-teal-500/10",
      accent: "text-emerald-400",
      tag: "12 Criteria",
    },
    {
      title: "Plagiarism & Textual Similarity",
      description: "Local corpus comparison analyzing exact sentence matches, phrase shingles, near-duplicates (RapidFuzz), and semantic alignment.",
      icon: FileSearch,
      path: "/phase2/plagiarism",
      color: "from-cyan-500/20 to-blue-500/10",
      accent: "text-cyan-400",
      tag: "Local RAG Corpus",
    },
    {
      title: "AI Proposal Enhancement",
      description: "Section-by-section weakness diagnostics with concrete evidence and generated academic rewrites for immediate reviewer incorporation.",
      icon: Sparkles,
      path: "/phase2/enhancements",
      color: "from-purple-500/20 to-pink-500/10",
      accent: "text-purple-400",
      tag: "Actionable Rewrites",
    },
    {
      title: "Explainable Decision Support",
      description: "Consolidated Phase 1 + Phase 2 intelligence generating advisory verdicts, positive/negative drivers, and reviewer action items.",
      icon: Scale,
      path: "/phase2/decision",
      color: "from-sky-500/20 to-indigo-500/10",
      accent: "text-sky-400",
      tag: "Advisory Verdict",
    },
    {
      title: "Phase 2 Executive Dashboard",
      description: "Integrated visualization cockpit displaying multi-axis risk radar charts, readiness gauges, and real-time proposal health metrics.",
      icon: LayoutDashboard,
      path: "/phase2/dashboard",
      color: "from-emerald-500/20 to-blue-500/10",
      accent: "text-emerald-300",
      tag: "Interactive Cockpit",
    },
    {
      title: "Phase 2 PDF Report Center",
      description: "On-demand, 100% locally compiled PDF dossiers (Risk, Funding Readiness, Recommendations, Decision Dossier) via ReportLab.",
      icon: FileDown,
      path: "/phase2/reports",
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-blue-400",
      tag: "ReportLab Engine",
    },
  ];

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Banner */}
      <div className="glass-card p-8 border-white/[0.08] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-mono font-semibold uppercase tracking-wider">
                Phase 2 Activated
              </span>
              <span className="text-xs text-gray-500 font-mono">
                100% Zero-Cost Local Architecture
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Risk Assessment & Funding Decision Intelligence
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Phase 2 extends R-Insight's Phase 1 proposal intelligence with objective, multi-dimensional risk analysis, 12-criterion funding readiness evaluation, local reference corpus plagiarism auditing, and explainable decision support dossiers.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link
              to="/phase2/dashboard"
              className="glass-button-primary py-3 px-6 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-accent/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Launch Phase 2 Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[10px] text-gray-500 text-center font-mono">
              Consumes verified Phase 1 outputs
            </span>
          </div>
        </div>

        {/* System Architecture Highlights */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/[0.03] text-emerald-400 border border-white/[0.06]">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-200">Strict Separation</span>
              <span className="text-[10px] text-gray-500">Phase 1 100% Intact</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/[0.03] text-sky-400 border border-white/[0.06]">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-200">Local MySQL & Chroma</span>
              <span className="text-[10px] text-gray-500">Additive DB Migrations</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/[0.03] text-purple-400 border border-white/[0.06]">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-200">Sentence Transformers</span>
              <span className="text-[10px] text-gray-500">all-MiniLM-L6-v2</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/[0.03] text-amber-400 border border-white/[0.06]">
              <Lock className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-200">₹0 Total Expenditure</span>
              <span className="text-[10px] text-gray-500">No Paid APIs or Clouds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onAnalyzeComplete={(data) => {
          navigate(`/phase2/dashboard`);
        }}
      />

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Phase 2 Intelligence Modules</span>
            <span className="text-xs text-gray-500 font-normal">({modules.length} active engines)</span>
          </h2>
          <span className="text-xs text-gray-400">Select any module to inspect detailed insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            const targetUrl = selectedId ? `${m.path}?proposalId=${selectedId}` : m.path;
            return (
              <Link
                key={idx}
                to={targetUrl}
                className="glass-card p-6 flex flex-col justify-between border-white/[0.06] hover:border-white/[0.15] group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${m.color} border border-white/[0.08] ${m.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-white/[0.03] border border-white/[0.06] text-gray-400 px-2 py-0.5 rounded-md">
                      {m.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-brand-accent transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                  <span>Open Module</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-brand-accent" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
