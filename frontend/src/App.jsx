import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Phase 1 Pages (Fully Preserved)
import UploadPage from "./pages/UploadPage";
import ProposalsListPage from "./pages/ProposalsListPage";
import DashboardPage from "./pages/DashboardPage";

// Phase 2 Pages (Risk Assessment & Funding Decision Intelligence)
import Phase2OverviewPage from "./pages/phase2/Phase2OverviewPage";
import Phase2DashboardPage from "./pages/phase2/Phase2DashboardPage";
import RiskAnalysisPage from "./pages/phase2/RiskAnalysisPage";
import FundingReadinessPage from "./pages/phase2/FundingReadinessPage";
import PlagiarismPage from "./pages/phase2/PlagiarismPage";
import EnhancementsPage from "./pages/phase2/EnhancementsPage";
import DecisionSupportPage from "./pages/phase2/DecisionSupportPage";
import Phase2ReportsPage from "./pages/phase2/Phase2ReportsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-[#070a13] font-sans antialiased text-gray-200">
        {/* Header (Hidden when printing) */}
        <Navbar />
        
        {/* Application Shell */}
        <div className="flex flex-1 relative">
          {/* Navigation Sidebar (Hidden when printing) */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/upload" replace />} />
              
              {/* Core Phase 1 Routes (Strictly Preserved) */}
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/proposals" element={<ProposalsListPage />} />
              <Route path="/dashboard/:proposalId" element={<DashboardPage />} />

              {/* Dedicated Phase 2 Routes */}
              <Route path="/phase2" element={<Phase2OverviewPage />} />
              <Route path="/phase2/dashboard" element={<Phase2DashboardPage />} />
              <Route path="/phase2/risk" element={<RiskAnalysisPage />} />
              <Route path="/phase2/funding" element={<FundingReadinessPage />} />
              <Route path="/phase2/plagiarism" element={<PlagiarismPage />} />
              <Route path="/phase2/enhancements" element={<EnhancementsPage />} />
              <Route path="/phase2/decision" element={<DecisionSupportPage />} />
              <Route path="/phase2/reports" element={<Phase2ReportsPage />} />
              
              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
