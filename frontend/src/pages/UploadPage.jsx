import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, File, AlertCircle, Sparkles } from "lucide-react";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const validateFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setError("Unsupported format. Only PDF or DOCX files are allowed.");
      return false;
    }
    setError("");
    return true;
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a proposal file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());
    if (domain.trim()) formData.append("domain", domain.trim());

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload proposal.");
      }

      const result = await response.json();
      // Redirect to the evaluation history page where progress indicator is shown
      navigate("/proposals");
    } catch (err) {
      setError(err.message || "Failed to upload proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
          Evaluate Research Proposal
          <Sparkles className="h-6 w-6 text-brand-accent animate-pulse" />
        </h2>
        <p className="text-gray-400 mt-1.5 text-sm">
          Upload a research proposal document to launch the multi-agent AI pipeline for structural extraction, RAG similarity search, and innovation scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 flex flex-col gap-6">
          {/* File Upload Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-brand-accent bg-brand-accent/5"
                : file
                ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                : "border-white/10 hover:border-white/20 bg-white/[0.01]"
            }`}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <File className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white max-w-xs truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider mt-1">
                  Ready to Process
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.06] text-gray-400">
                  <UploadCloud className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag and drop your file here, or{" "}
                    <span className="text-brand-accent hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepts PDF or DOCX (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Proposal Title (Optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave blank to auto-detect from filename"
                className="glass-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="domain" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Discipline / Research Domain (Optional)
              </label>
              <select
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="glass-input appearance-none bg-black/40 text-gray-300"
              >
                <option value="">Auto-Inferred by Classification Agent</option>
                <option value="Information Technology & AI">Information Technology & AI</option>
                <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
                <option value="Biotechnology & Medicine">Biotechnology & Medicine</option>
                <option value="Internet of Things (IoT) & Embedded Systems">Internet of Things (IoT) & Embedded Systems</option>
                <option value="Electrical Engineering & Energy Systems">Electrical Engineering & Energy Systems</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="glass-button-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-brand-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deploying Multi-Agent Framework...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Evaluation Pipeline
              </>
            )}
          </button>
        </form>

        {/* Sidebar Info Panel */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-6 flex flex-col gap-4 border-white/[0.05]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Explainable RAG AI
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every score generated by the R-Insight engine includes natural-language justifications and confidence statistics. This mitigates black-box review issues.
            </p>
            <div className="border-t border-white/[0.06] my-2"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Affiliation Bias Mitigation
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Author credentials and university names are actively filtered from the scoring context to guarantee objective review metrics.
            </p>
            <div className="border-t border-white/[0.06] my-2"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Confidence Indicator
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Qualitative studies (Humanities/Arts) naturally yield lower pipeline confidence levels than structured STEM proposals. Look for the confidence meters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
