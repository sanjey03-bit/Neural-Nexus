import React from "react";
import { NavLink } from "react-router-dom";
import { UploadCloud, FileText, Lock, ShieldAlert } from "lucide-react";

export default function Sidebar() {
  const activeStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive
        ? "bg-brand-accent/15 text-brand-accent border border-brand-accent/20"
        : "text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent"
    }`;

  return (
    <aside className="no-print w-64 border-r border-white/[0.08] bg-black/10 flex flex-col justify-between p-4 h-[calc(100vh-77px)] sticky top-[77px]">
      <div className="flex flex-col gap-2">
        <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-3 mb-2">
          Module 1 Core
        </div>
        
        <NavLink to="/upload" className={activeStyle}>
          <UploadCloud className="h-4 w-4" />
          <span>Upload Proposal</span>
        </NavLink>

        <NavLink to="/proposals" className={activeStyle}>
          <FileText className="h-4 w-4" />
          <span>Evaluation History</span>
        </NavLink>

        <div className="border-t border-white/[0.06] my-4"></div>

        <div className="text-[10px] uppercase font-bold text-gray-600 tracking-widest px-3 mb-2 flex items-center gap-1.5">
          Module 2 Staging
        </div>

        {/* Disabled Module 2 Navigation Stub */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-white/[0.05] bg-white/[0.01] opacity-40 cursor-not-allowed select-none group">
          <div className="flex items-center gap-3 text-gray-400">
            <ShieldAlert className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-300">Module 2</span>
              <span className="text-[10px] text-gray-500">Risk & Decision Support</span>
            </div>
          </div>
          <Lock className="h-3.5 w-3.5 text-gray-500" />
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
        <div className="text-xs font-bold text-gray-400 mb-1">Capstone Demo</div>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Designed for zeroth/first panel review. Multi-agent evaluation is backed by RAG and explainable metrics.
        </p>
      </div>
    </aside>
  );
}
