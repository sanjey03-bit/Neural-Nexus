import React from "react";
import { Brain, Cpu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="no-print w-full border-b border-white/[0.08] bg-black/20 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-accentMuted border border-brand-accent/30 text-brand-accent">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            R-Insight
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium">
              Phase 1 + 2
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Proposal Intelligence & Funding Decision Support System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Capstone Identification Tag */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-400">
          <Cpu className="h-4 w-4 text-brand-accent shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-medium text-gray-200">Team Neural Nexus</span>
            <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
              Sri Krishna College of<br />Engineering and Technology
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
