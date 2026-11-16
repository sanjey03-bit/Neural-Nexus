"""
Integration & Regression Test Suite for R-Insight Phase 1 + Phase 2.
Verifies that:
1. All Phase 1 endpoints remain 100% backward-compatible and functional.
2. All Phase 2 endpoints (Risk, Funding Readiness, Plagiarism, Enhancements, Decision Support, Dashboard, Reports) function correctly.
3. Database persistence works across all Phase 2 tables.
4. ReportLab local PDF generation returns valid, downloadable PDF streams.
"""
import sys
from starlette.testclient import TestClient
from backend.main import app

def run_tests():
    client = TestClient(app)
    print("==================================================")
    print("STARTING R-INSIGHT INTEGRATION & REGRESSION SUITE")
    print("==================================================")

    # -------------------------------------------------------------------------
    # TEST 1: Phase 1 Root Endpoint
    # -------------------------------------------------------------------------
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("[PASS] Test 1: Phase 1 Root Endpoint (/) -> 200 OK")

    # -------------------------------------------------------------------------
    # TEST 2: Phase 1 List Proposals
    # -------------------------------------------------------------------------
    res = client.get("/api/proposals")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    proposals = res.json()
    assert isinstance(proposals, list), "Expected list of proposals"
    assert len(proposals) > 0, "Expected at least 1 proposal in database"
    target_id = proposals[0]["id"]
    print(f"[PASS] Test 2: Phase 1 List Proposals (/api/proposals) -> Found {len(proposals)} proposals. Target #{target_id}")

    # -------------------------------------------------------------------------
    # TEST 3: Phase 1 Proposal Status
    # -------------------------------------------------------------------------
    res = client.get(f"/api/proposals/{target_id}/status")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    status_data = res.json()
    assert "status" in status_data and "done" in status_data
    print(f"[PASS] Test 3: Phase 1 Proposal Status (/api/proposals/{target_id}/status) -> Status: {status_data['status']}")

    # -------------------------------------------------------------------------
    # TEST 4: Phase 1 Proposal Dashboard
    # -------------------------------------------------------------------------
    res = client.get(f"/api/proposals/{target_id}/dashboard")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    dash_data = res.json()
    assert "proposal_id" in dash_data and "extraction" in dash_data and "scores" in dash_data
    print(f"[PASS] Test 4: Phase 1 Dashboard (/api/proposals/{target_id}/dashboard) -> Innovation: {dash_data['scores']['innovation']['score']}, Quality: {dash_data['scores']['quality']['score']}")

    # -------------------------------------------------------------------------
    # TEST 5: Phase 1 Reference Corpus Admin
    # -------------------------------------------------------------------------
    res = client.get("/api/admin/corpus")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    corpus = res.json()
    assert isinstance(corpus, list), "Expected corpus list"
    print(f"[PASS] Test 5: Phase 1 Corpus Admin (/api/admin/corpus) -> {len(corpus)} documents indexed")

    # -------------------------------------------------------------------------
    # TEST 6: Phase 2 Analyze Proposal
    # -------------------------------------------------------------------------
    res = client.post(f"/api/phase2/proposals/{target_id}/analyze")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    phase2_res = res.json()
    assert phase2_res["risk"] is not None
    assert phase2_res["funding_readiness"] is not None
    assert phase2_res["plagiarism"] is not None
    assert phase2_res["enhancements"] is not None
    assert phase2_res["decision_support"] is not None
    print(f"[PASS] Test 6: Phase 2 Analyze (/api/phase2/proposals/{target_id}/analyze) -> Full Suite Executed")

    # -------------------------------------------------------------------------
    # TEST 7: Phase 2 Risk Assessment & Dynamic Weights
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/risk")
    assert res.status_code == 200
    risk = res.json()
    assert "overall_risk_score" in risk and "technical" in risk and "financial" in risk
    # Test custom weights
    res_weighted = client.get(f"/api/phase2/proposals/{target_id}/risk?w_tech=50&w_fin=30&w_time=10&w_res=10")
    assert res_weighted.status_code == 200
    print(f"[PASS] Test 7: Phase 2 Risk (/api/phase2/proposals/{target_id}/risk) -> Overall Risk: {risk['overall_risk_score']}/100 ({risk['overall_risk_classification']})")

    # -------------------------------------------------------------------------
    # TEST 8: Phase 2 Funding Readiness
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/funding-readiness")
    assert res.status_code == 200
    funding = res.json()
    assert "overall_readiness_score" in funding and len(funding["criteria_scores"]) > 0
    print(f"[PASS] Test 8: Phase 2 Funding (/api/phase2/proposals/{target_id}/funding-readiness) -> Readiness: {funding['overall_readiness_score']}/100 ({funding['readiness_classification']})")

    # -------------------------------------------------------------------------
    # TEST 9: Phase 2 Plagiarism Checker
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/plagiarism")
    assert res.status_code == 200
    plag = res.json()
    assert "overall_overlap_percentage" in plag and "disclaimer" in plag
    print(f"[PASS] Test 9: Phase 2 Plagiarism (/api/phase2/proposals/{target_id}/plagiarism) -> Overlap: {plag['overall_overlap_percentage']}%, Semantic: {plag['semantic_similarity_percentage']}%")

    # -------------------------------------------------------------------------
    # TEST 10: Phase 2 AI Enhancements & Suggestion Acceptance Toggle
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/enhancements")
    assert res.status_code == 200
    enh = res.json()
    assert len(enh["identified_weaknesses"]) > 0
    weakness_id = enh["identified_weaknesses"][0]["id"]
    # Toggle acceptance
    res_toggle = client.post(f"/api/phase2/proposals/{target_id}/enhancements/{weakness_id}/toggle")
    assert res_toggle.status_code == 200
    toggled = res_toggle.json()
    assert toggled["identified_weaknesses"][0]["accepted"] is True
    print(f"[PASS] Test 10: Phase 2 Enhancements (/api/phase2/proposals/{target_id}/enhancements) -> {len(enh['identified_weaknesses'])} items, Toggle Verified")

    # -------------------------------------------------------------------------
    # TEST 11: Phase 2 Decision Support
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/decision")
    assert res.status_code == 200
    dec = res.json()
    assert "advisory_verdict" in dec and "decision_score" in dec
    print(f"[PASS] Test 11: Phase 2 Decision Support (/api/phase2/proposals/{target_id}/decision) -> Verdict: '{dec['advisory_verdict']}' (Score: {dec['decision_score']}/100)")

    # -------------------------------------------------------------------------
    # TEST 12: Phase 2 Dashboard Payload
    # -------------------------------------------------------------------------
    res = client.get(f"/api/phase2/proposals/{target_id}/dashboard")
    assert res.status_code == 200
    d2 = res.json()
    assert d2["risk"] is not None and d2["funding_readiness"] is not None
    print(f"[PASS] Test 12: Phase 2 Dashboard (/api/phase2/proposals/{target_id}/dashboard) -> Complete Consolidated Metric Payload Received")

    # -------------------------------------------------------------------------
    # TEST 13: Phase 2 Local PDF Reports (All 4 Types via ReportLab)
    # -------------------------------------------------------------------------
    report_types = ["risk", "funding", "recommendations", "decision"]
    for r_type in report_types:
        pdf_res = client.get(f"/api/phase2/proposals/{target_id}/reports/{r_type}")
        assert pdf_res.status_code == 200, f"PDF generation failed for {r_type}"
        assert pdf_res.headers.get("content-type") == "application/pdf"
        assert len(pdf_res.content) > 1000, f"PDF file size too small for {r_type}"
        assert pdf_res.content[:4] == b"%PDF", f"Invalid PDF signature for {r_type}"
        print(f"[PASS] Test 13.{report_types.index(r_type)+1}: Phase 2 PDF Report ({r_type}) -> Valid PDF ({len(pdf_res.content)} bytes)")

    print("==================================================")
    print("ALL 13 PHASE 1 & PHASE 2 REGRESSION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
