import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Printer, Sparkles, Send, HelpCircle, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const { proposalId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reviewer Q&A State
  const [question, setQuestion] = useState("");
  const [qaList, setQaList] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposalId}/dashboard`);
      if (!response.ok) throw new Error("Failed to load dashboard data.");
      const resData = await response.json();
      setData(resData);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch evaluation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [proposalId]);

  const handlePrint = () => {
    window.print();
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQaLoading(true);
    const userQuestion = question.trim();
    setQuestion("");

    // Optimistically add user message
    setQaList((prev) => [...prev, { sender: "user", text: userQuestion }]);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) throw new Error("Failed to consult RAG pipeline.");
      const result = await response.json();

      setQaList((prev) => [...prev, { sender: "system", text: result.answer }]);
    } catch (err) {
      setQaList((prev) => [
        ...prev,
        { sender: "system", text: "Error: Could not reach the query agent. Please try again." },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-accent"></div>
        <p className="text-sm text-gray-500">Retrieving explainable intelligence report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {error}
        </div>
        <Link to="/proposals" className="glass-button-secondary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { title, filename, domain, extraction, scores, novelty_report, summary } = data;

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header Actions */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/proposals" className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white transition-all duration-150">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white max-w-xl truncate">{title}</h2>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
                Verified
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              File: {filename} <span className="mx-2">•</span> Discipline: <span className="text-brand-accent font-semibold">{domain}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="glass-button-secondary py-2 text-xs flex items-center gap-2 self-stretch sm:self-auto"
        >
          <Printer className="h-3.5 w-3.5" />
          Export Evaluation Summary (Print)
        </button>
      </div>

      {/* --- Score Gauge Panel --- */}
      {scores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreCircularGauge
            label="Innovation Index"
            score={scores.innovation.score}
            justification={scores.innovation.justification}
            confidence={scores.innovation.confidence}
          />
          <ScoreCircularGauge
            label="Proposal Quality"
            score={scores.quality.score}
            justification={scores.quality.justification}
            confidence={scores.quality.confidence}
          />
          <ScoreCircularGauge
            label="Novelty Score"
            score={scores.novelty.score}
            justification={scores.novelty.justification}
            confidence={scores.novelty.confidence}
            verdict={scores.novelty_verdict}
          />
        </div>
      )}

      {/* --- Print-Only Printable Layout --- */}
      <div className="hidden print:block font-serif text-black p-4">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">R-Insight Proposal Intelligence Report</h1>
          <p className="text-sm mt-1">Institutional Capstone Evaluation System • Anna University</p>
        </div>
        <table className="w-full text-left border-collapse mb-6 text-sm">
          <tbody>
            <tr className="border-b border-gray-300"><td className="py-2 font-bold w-1/3">Proposal Title:</td><td className="py-2">{title}</td></tr>
            <tr className="border-b border-gray-300"><td className="py-2 font-bold">Research Domain:</td><td className="py-2">{domain}</td></tr>
            <tr className="border-b border-gray-300"><td className="py-2 font-bold">Document Source:</td><td className="py-2">{filename}</td></tr>
            {scores && (
              <>
                <tr className="border-b border-gray-300"><td className="py-2 font-bold">Innovation Index:</td><td className="py-2">{scores.innovation.score}/100 (Confidence: {Math.round(scores.innovation.confidence*100)}%)</td></tr>
                <tr className="border-b border-gray-300"><td className="py-2 font-bold">Technical Quality:</td><td className="py-2">{scores.quality.score}/100 (Confidence: {Math.round(scores.quality.confidence*100)}%)</td></tr>
                <tr className="border-b border-gray-300"><td className="py-2 font-bold">Novelty Rating:</td><td className="py-2">{scores.novelty.score}/100 ({scores.novelty_verdict})</td></tr>
              </>
            )}
          </tbody>
        </table>
        
        <h2 className="text-xl font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">Structured Extraction</h2>
        <div className="mb-6 text-sm flex flex-col gap-4">
          <div><p className="font-bold">Objectives:</p><p className="italic">{extraction?.objectives}</p></div>
          <div><p className="font-bold">Methodology:</p><p className="italic">{extraction?.methodology}</p></div>
          <div><p className="font-bold">Budget & Allocation:</p><p className="italic">{extraction?.budget}</p></div>
          <div><p className="font-bold">Expected Outcomes:</p><p className="italic">{extraction?.expected_outcomes}</p></div>
        </div>

        <h2 className="text-xl font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">Evaluation Review Summary</h2>
        <p className="whitespace-pre-line text-sm italic">{summary}</p>
      </div>

      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Column: Extracted Structure --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card p-6 border-white/[0.05]">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-300 border-b border-white/[0.06] pb-2">
              <FileText className="h-4 w-4 text-brand-accent" />
              Extracted Proposal Structure
            </h3>
            {extraction ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Objectives</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{extraction.objectives}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Methodology</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{extraction.methodology}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Parsed Budget & Cost</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{extraction.budget}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expected Deliverables</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{extraction.expected_outcomes}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No structured data extracted.</p>
            )}
          </div>

          {/* --- Synthesis Evaluation Summary --- */}
          {summary && (
            <div className="glass-card p-6 border-white/[0.05]">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-300 border-b border-white/[0.06] pb-2">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                Proposal Evaluation Summary
              </h3>
              <div className="p-4 rounded-xl bg-brand-accent/[0.02] border border-brand-accent/10">
                <p className="whitespace-pre-line text-xs text-gray-300 leading-relaxed font-mono">
                  {summary}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Column: Novelty Report & Q&A --- */}
        <div className="flex flex-col gap-6">
          {/* Novelty matches from RAG */}
          {novelty_report && (
            <div className="glass-card p-6 border-white/[0.05]">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-300 border-b border-white/[0.06] pb-2">
                <Sparkles className="h-4 w-4 text-brand-accent" />
                Novelty Assessment Report
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Overall Verdict</span>
                    <span className="text-sm font-extrabold text-white mt-0.5">{novelty_report.novelty_verdict}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Similarity Cap</span>
                    <span className="text-sm font-extrabold text-brand-accent mt-0.5">
                      {novelty_report.matches.length > 0 ? `${novelty_report.matches[0].similarity_score}%` : "0%"}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-2">
                  Top RAG Database Matches
                </div>

                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {novelty_report.matches.map((match) => (
                    <div key={match.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white leading-tight max-w-[200px] truncate">
                            {match.title}
                          </span>
                          <span className="text-[10px] text-gray-500 mt-0.5">
                            {match.source}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-md">
                          {match.similarity_score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-light border-l border-white/[0.08] pl-2.5 italic">
                        {match.overlap_narrative}
                      </p>
                    </div>
                  ))}
                  {novelty_report.matches.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No similar reference items found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Q&A Panel */}
          <div className="glass-card p-6 border-white/[0.05] flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wider text-gray-300 border-b border-white/[0.06] pb-2">
              <HelpCircle className="h-4 w-4 text-brand-accent" />
              Reviewer follow-up query
            </h3>
            
            {/* Conversation list */}
            <div className="flex flex-col gap-3 min-h-[160px] max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {qaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <HelpCircle className="h-8 w-8 text-gray-700 mb-2" />
                  <p className="text-[10px] text-gray-500 max-w-[180px]">
                    Consult the RAG pipeline about specific items like novelty scoring or budget.
                  </p>
                </div>
              ) : (
                qaList.map((qa, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs ${
                      qa.sender === "user"
                        ? "bg-brand-accentMuted border border-brand-accent/20 text-brand-accent self-end rounded-tr-none"
                        : "bg-white/[0.02] border border-white/[0.06] text-gray-300 self-start rounded-tl-none font-light leading-relaxed"
                    }`}
                  >
                    {qa.text}
                  </div>
                ))
              )}
              {qaLoading && (
                <div className="bg-white/[0.01] border border-white/[0.04] text-gray-500 self-start rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5">
                  <span className="flex gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full"></span>
                  </span>
                  RAG agent query...
                </div>
              )}
            </div>

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about evaluation metrics..."
                disabled={qaLoading}
                className="glass-input py-2 text-xs flex-1"
              />
              <button
                type="submit"
                disabled={qaLoading || !question.trim()}
                className="glass-button-primary p-2.5 rounded-xl self-stretch"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Gauges helper ---

function ScoreCircularGauge({ label, score, justification, confidence, verdict = "" }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 flex flex-col gap-4 border-white/[0.05]">
      <div className="flex items-center gap-4">
        {/* SVG Circle */}
        <div className="relative h-18 w-18 shrink-0">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="36"
              cy="36"
              r={radius}
              className="stroke-white/[0.03] fill-none"
              strokeWidth="5"
            />
            <circle
              cx="36"
              cy="36"
              r={radius}
              className="stroke-brand-accent fill-none transition-all duration-1000 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-bold text-white leading-none">{score}</span>
            <span className="text-[9px] text-gray-500 mt-0.5">/ 100</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">{label}</h3>
          {verdict && (
            <span className="text-[10px] font-semibold text-brand-accent mt-0.5 block">
              {verdict}
            </span>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-16 bg-white/[0.05] h-1 rounded-full overflow-hidden">
              <div
                className="bg-brand-accent h-full rounded-full"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-gray-400 font-semibold font-mono">
              Conf: {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-brand-accent/20 pl-3">
        "{justification}"
      </p>
    </div>
  );
}
