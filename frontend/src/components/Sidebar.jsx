import React from "react";
import { NavLink } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  ShieldAlert,
  Gauge,
  FileSearch,
  Sparkles,
  Scale,
  LayoutDashboard,
  FileDown,
  Compass,
} from "lucide-react";

export default function Sidebar() {
  const activeStyle = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-medium ${
      isActive
        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/25 shadow-sm shadow-brand-accent/10"
        : "text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
    }`;

  const phase2ActiveStyle = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 text-xs font-medium ${
      isActive
        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
        : "text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
    }`;

  return (
    <aside className="no-print w-64 border-r border-white/[0.08] bg-black/20 flex flex-col justify-between p-4 h-[calc(100vh-77px)] sticky top-[77px] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-4">
        {/* ========================================================= */}
        {/* PHASE 1 SECTION */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Phase 1 — Intelligence
            </span>
            <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono">
              v1.0
            </span>
          </div>

          <NavLink to="/upload" className={activeStyle}>
            <UploadCloud className="h-4 w-4 shrink-0" />
            <span>Upload Proposal</span>
          </NavLink>

          <NavLink to="/proposals" className={activeStyle}>
            <FileText className="h-4 w-4 shrink-0" />
            <span>Evaluation History</span>
          </NavLink>
        </div>

        <div className="border-t border-white/[0.06]"></div>

        {/* ========================================================= */}
        {/* PHASE 2 SECTION — ACTIVE & HIGHLIGHTED */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              Phase 2 — Risk & Funding
            </span>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold animate-pulse">
              NEW
            </span>
          </div>

          <NavLink to="/phase2" end className={phase2ActiveStyle}>
            <Compass className="h-3.5 w-3.5 shrink-0" />
            <span>Phase 2 Overview</span>
          </NavLink>

          <NavLink to="/phase2/dashboard" className={phase2ActiveStyle}>
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            <span>Phase 2 Dashboard</span>
          </NavLink>

          <NavLink to="/phase2/risk" className={phase2ActiveStyle}>
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Risk Analysis</span>
          </NavLink>

          <NavLink to="/phase2/funding" className={phase2ActiveStyle}>
            <Gauge className="h-3.5 w-3.5 shrink-0" />
            <span>Funding Readiness</span>
          </NavLink>

          <NavLink to="/phase2/plagiarism" className={phase2ActiveStyle}>
            <FileSearch className="h-3.5 w-3.5 shrink-0" />
            <span>Plagiarism Checker</span>
          </NavLink>

          <NavLink to="/phase2/enhancements" className={phase2ActiveStyle}>
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>AI Recommendations</span>
          </NavLink>

          <NavLink to="/phase2/decision" className={phase2ActiveStyle}>
            <Scale className="h-3.5 w-3.5 shrink-0" />
            <span>Decision Support</span>
          </NavLink>

          <NavLink to="/phase2/reports" className={phase2ActiveStyle}>
            <FileDown className="h-3.5 w-3.5 shrink-0" />
            <span>Phase 2 Reports (PDF)</span>
          </NavLink>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-300">R-Insight Platform</span>
          <span className="text-[9px] text-emerald-400 font-mono">Phase 1 + 2</span>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Proposal intelligence, risk analysis & funding decision support. 100% Zero-Cost Local Architecture.
        </p>
      </div>
    </aside>
  );
}
