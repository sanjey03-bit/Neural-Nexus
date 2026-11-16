import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Sparkles, FileText, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

export default function ProposalSelector({
  selectedId,
  onSelect,
  onAnalyzeComplete,
  showAnalyzeButton = true,
}) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/proposals")
      .then((res) => res.json())
      .then((data) => {
        const completed = data.filter((p) => p.status === "completed");
        setProposals(completed);
        setLoading(false);
        if (!selectedId && completed.length > 0) {
          onSelect(completed[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch proposals:", err);
        setLoading(false);
      });
  }, []);

  const handleSelect = (e) => {
    const id = parseInt(e.target.value, 10);
    onSelect(id);
  };

  const currentProposal = proposals.find((p) => p.id === Number(selectedId));

  const handleRunFullAnalysis = async () => {
    if (!selectedId) return;
    setAnalyzing(true);
    setAnalyzeMsg("Running Phase 2 Intelligence Suite...");
    try {
      const res = await fetch(`/api/phase2/proposals/${selectedId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalyzeMsg("Analysis complete!");
      setTimeout(() => setAnalyzeMsg(""), 3000);
      if (onAnalyzeComplete) onAnalyzeComplete(data);
    } catch (err) {
      setAnalyzeMsg("Analysis failed. Check console.");
      setTimeout(() => setAnalyzeMsg(""), 3500);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-4 flex items-center justify-between text-xs text-gray-400">
        <span>Loading completed proposals...</span>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-amber-300">No Evaluated Proposals Found</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Phase 2 risk and funding intelligence requires at least one proposal completed in Phase 1.
          </p>
        </div>
        <Link to="/upload" className="glass-button-primary py-2 text-xs">
          Upload in Phase 1
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
          Target Proposal:
        </label>
        <div className="relative min-w-[260px] max-w-md">
          <select
            value={selectedId || ""}
            onChange={handleSelect}
            className="w-full appearance-none bg-black/40 border border-white/[0.12] rounded-xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-accent/60 pr-8 cursor-pointer"
          >
            {proposals.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                #{p.id} — {p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title} ({p.domain || "STEM"})
              </option>
            ))}
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {currentProposal && (
          <Link
            to={`/dashboard/${currentProposal.id}`}
            title="Inspect Phase 1 Intelligence Dashboard"
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 self-start sm:self-auto"
          >
            <FileText className="h-3 w-3" />
            <span>Phase 1 Report</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {analyzeMsg && (
          <span className="text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {analyzeMsg}
          </span>
        )}

        {showAnalyzeButton && (
          <button
            onClick={handleRunFullAnalysis}
            disabled={analyzing}
            className="glass-button-primary py-2 text-xs font-semibold flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Run Phase 2 Analysis</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
