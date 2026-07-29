import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, CheckCircle, AlertTriangle, Cpu, Loader, RefreshCw, Eye } from "lucide-react";

export default function ProposalsListPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProposals = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/proposals");
      if (!response.ok) throw new Error("Failed to load proposals.");
      const data = await response.json();
      setProposals(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load proposals list.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(true);
  }, []);

  // Poll running proposals
  useEffect(() => {
    const runningProposals = proposals.filter(
      (p) => p.status !== "completed" && p.status !== "failed"
    );

    if (runningProposals.length === 0) return;

    const interval = setInterval(async () => {
      let updated = false;
      const updatedProposals = await Promise.all(
        proposals.map(async (p) => {
          if (p.status !== "completed" && p.status !== "failed") {
            try {
              const res = await fetch(`/api/proposals/${p.id}/status`);
              if (res.ok) {
                const statusData = await res.json();
                if (statusData.status !== p.status) {
                  updated = true;
                  return { ...p, status: statusData.status, error_message: statusData.error_message };
                }
              }
            } catch (err) {
              console.error(`Error polling status for proposal ${p.id}:`, err);
            }
          }
          return p;
        })
      );

      if (updated) {
        setProposals(updatedProposals);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [proposals]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <Loader className="h-3 w-3 animate-spin text-gray-400" />
            Queued
          </span>
        );
      case "parsing":
        return (
          <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader className="h-3 w-3 animate-spin text-blue-400" />
            Extraction Agent
          </span>
        );
      case "classifying":
        return (
          <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Loader className="h-3 w-3 animate-spin text-indigo-400" />
            Classification
          </span>
        );
      case "comparing":
        return (
          <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Loader className="h-3 w-3 animate-spin text-amber-400" />
            ChromaDB Search
          </span>
        );
      case "scoring":
        return (
          <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Loader className="h-3 w-3 animate-spin text-purple-400" />
            Scoring Agent
          </span>
        );
      case "completed":
        return (
          <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-3 w-3 text-red-400" />
            Failed
          </span>
        );
      default:
        return <span className="badge bg-gray-500/15 text-gray-400">{status}</span>;
    }
  };

  const getStatusRowDescription = (status) => {
    switch (status) {
      case "pending":
        return "Waiting for resource allocation...";
      case "parsing":
        return "Extraction Agent: Parsing PDF/DOCX structural components...";
      case "classifying":
        return "Novelty Agent: Inferring project domain & categories...";
      case "comparing":
        return "Novelty Agent: Running RAG similarity matches on ChromaDB...";
      case "scoring":
        return "Reviewer Agent: Formulating scoring profiles and summary...";
      case "completed":
        return "Evaluation pipeline complete. Fully explainable.";
      case "failed":
        return "Evaluation terminated with system error.";
      default:
        return "";
    }
  };

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Evaluation History</h2>
          <p className="text-gray-400 mt-1.5 text-sm">
            Monitor running multi-agent jobs or access completed proposal dashboards.
          </p>
        </div>
        <button
          onClick={() => fetchProposals(true)}
          className="glass-button-secondary py-2 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Loading history records...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-white/[0.05] bg-white/[0.01]">
          <Cpu className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Evaluations Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Upload your first research proposal file to trigger the structured parser and RAG similarity scoring engine.
          </p>
          <Link to="/upload" className="glass-button-primary inline-flex">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Proposal Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Inferred Domain</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pipeline Stage</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date Uploaded</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-white/[0.01] transition-all duration-150">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm max-w-xs truncate">
                          {proposal.title}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                          {proposal.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {proposal.domain ? (
                        <span className="text-xs bg-brand-accentMuted/30 text-brand-accent border border-brand-accent/20 px-2.5 py-1 rounded-lg">
                          {proposal.domain}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Determining...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(proposal.status)}
                        <span className="text-[10px] text-gray-500">
                          {getStatusRowDescription(proposal.status)}
                        </span>
                        {proposal.status === "failed" && proposal.error_message && (
                          <span className="text-[10px] text-red-400 font-mono mt-0.5 block max-w-xs truncate">
                            Error: {proposal.error_message}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(proposal.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {proposal.status === "completed" ? (
                        <Link
                          to={`/dashboard/${proposal.id}`}
                          className="glass-button-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Dashboard
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="glass-button bg-white/[0.01] border border-white/[0.04] text-gray-600 py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-not-allowed"
                        >
                          <Loader className="h-3.5 w-3.5 animate-spin" />
                          Running
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
