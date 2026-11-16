import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  ShieldCheck,
  Quote,
} from "lucide-react";
import ProposalSelector from "../../components/ProposalSelector";

export default function PlagiarismPage() {
  const [searchParams] = useSearchParams();
  const [proposalId, setProposalId] = useState(searchParams.get("proposalId") || null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlagiarismData = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/phase2/proposals/${id}/plagiarism`);
      if (!res.ok) throw new Error("Failed to load plagiarism audit data.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error fetching plagiarism report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchPlagiarismData(proposalId);
    }
  }, [proposalId]);

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
            Module 3 — Integrity Audit
          </span>
          <span className="text-xs text-gray-500">Local Reference Corpus • Lexical & Semantic Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Plagiarism & Textual Similarity Checker
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Verifies document originality against the indexed research corpus using exact sentence matching, near-duplicate phrase detection (RapidFuzz), and semantic alignment.
        </p>
      </div>

      {/* Proposal Selector */}
      <ProposalSelector
        selectedId={proposalId}
        onSelect={(id) => setProposalId(id)}
        onAnalyzeComplete={() => fetchPlagiarismData(proposalId)}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
          <p className="text-sm text-gray-500">Scanning local reference corpus for lexical overlap...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          {/* Integrity Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 border-white/[0.08] flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Overall Text Overlap
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black ${data.overall_overlap_percentage > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {data.overall_overlap_percentage}%
                </span>
                <span className="text-xs text-gray-500">aggregate</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Combined exact + near duplicate</span>
            </div>

            <div className="glass-card p-5 border-white/[0.08] flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Exact Sentence Matches
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">
                  {data.exact_match_percentage}%
                </span>
                <span className="text-xs text-gray-500">verbatim</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">100% lexical identity</span>
            </div>

            <div className="glass-card p-5 border-white/[0.08] flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Near-Duplicate Overlap
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-sky-400">
                  {data.near_match_percentage}%
                </span>
                <span className="text-xs text-gray-500">paraphrase</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Fuzzy token sort &gt; 82%</span>
            </div>

            <div className="glass-card p-5 border-white/[0.08] flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Semantic Similarity
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-purple-400">
                  {data.semantic_similarity_percentage}%
                </span>
                <span className="text-xs text-gray-500">ChromaDB</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Dense vector embedding space</span>
            </div>
          </div>

          {/* Transparent Academic Disclaimer */}
          <div className="glass-card p-5 border-sky-500/20 bg-sky-500/5 flex items-start gap-3">
            <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs text-gray-300 leading-relaxed">
              <span className="font-bold text-sky-300">Important Scope & Methodological Notice:</span>
              <p>{data.disclaimer}</p>
            </div>
          </div>

          {/* Side-by-Side Matching Passages Viewer */}
          <div className="glass-card p-6 border-white/[0.08]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-accent" />
                <h3 className="text-base font-bold text-white">
                  Matching Passage Analysis
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {data.matching_passages?.length || 0} candidate passage alignments identified
              </span>
            </div>

            {data.matching_passages && data.matching_passages.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.matching_passages.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-accent">
                          Passage #{idx + 1}
                        </span>
                        <span className="text-[10px] bg-white/[0.05] text-gray-300 px-2 py-0.5 rounded font-medium">
                          Section: {m.proposal_section}
                        </span>
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                          {m.match_method}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {m.similarity_pct}% Similarity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Proposal Passage */}
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-black/30 border border-white/[0.03]">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Original Proposal Passage:
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed italic">
                          "{m.proposal_passage}"
                        </p>
                      </div>

                      {/* Matching Reference */}
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Reference Corpus Passage:
                          </span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[200px]" title={m.doc_title}>
                            {m.doc_title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                          "{m.reference_passage}"
                        </p>
                        <span className="text-[9px] text-gray-500 font-mono mt-1">
                          Source: {m.doc_source}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 italic">
                      <strong className="text-gray-300 not-italic">Evaluator Observation:</strong> {m.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 bg-white/[0.01] rounded-xl border border-dashed border-white/[0.06]">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white">No verbatim or near-duplicate passages detected</p>
                <p className="text-gray-500 mt-1">
                  The proposal shows zero direct textual duplication against documents in the reference corpus.
                </p>
              </div>
            )}
          </div>

          {/* Matching Sources & Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Sources */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-accent" />
                <span>Reference Documents Cited / Aligned</span>
              </h3>
              {data.matching_sources && data.matching_sources.length > 0 ? (
                <div className="flex flex-col gap-2 mt-1">
                  {data.matching_sources.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-semibold text-white truncate">{s.title}</span>
                        <span className="text-[10px] text-gray-500">{s.source}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                        {s.highest_similarity}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No overlapping reference documents identified.</p>
              )}
            </div>

            {/* Observations & Citation Advice */}
            <div className="glass-card p-6 border-white/[0.08] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Quote className="h-4 w-4 text-emerald-400" />
                <span>Citation Observations & Guidelines</span>
              </h3>
              <div className="flex flex-col gap-2 mt-1">
                {data.citation_observations?.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
                {data.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-sky-300">
                    <span className="text-sky-400 shrink-0 mt-0.5">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
