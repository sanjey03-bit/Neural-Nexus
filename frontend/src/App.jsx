import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import UploadPage from "./pages/UploadPage";
import ProposalsListPage from "./pages/ProposalsListPage";
import DashboardPage from "./pages/DashboardPage";

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
          
          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/upload" replace />} />
              
              {/* Core Module 1 Routes */}
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/proposals" element={<ProposalsListPage />} />
              <Route path="/dashboard/:proposalId" element={<DashboardPage />} />
              
              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
