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
            <span className="text-xs bg-brand-accent/10 border border-brand-accent/20 text-brand-accent px-2 py-0.5 rounded-full font-mono font-medium">
              Module 1
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Proposal Intelligence & Innovation Discovery Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Capstone Identification Tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-400">
          <Cpu className="h-3.5 w-3.5 text-brand-accent" />
          <span>Team R-Nexus</span>
          <span className="text-gray-600">|</span>
          <span className="font-semibold text-gray-300">Anna University</span>
        </div>
      </div>
    </header>
  );
}
