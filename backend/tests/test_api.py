"""
Integration tests for FastAPI REST Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

def test_api_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_study_area(client):
    res = client.get("/api/study-area")
    assert res.status_code == 200
    data = res.json()
    assert "study_area" in data
    assert "known_mines" in data
    assert len(data["known_mines"]) >= 5

def test_prospectivity_grid(client):
    res = client.get("/api/prospectivity/grid?downsample=2")
    assert res.status_code == 200
    data = res.json()
    assert "bounds" in data
    assert "layers" in data
    assert "prospectivity" in data["layers"]
    assert "manganese_proxy" in data["layers"]

def test_drill_targets(client):
    res = client.get("/api/drill-targets?min_prospectivity=0.65&top_k=5")
    assert res.status_code == 200
    data = res.json()
    assert "targets" in data
    assert len(data["targets"]) > 0
    tgt = data["targets"][0]
    assert "target_id" in tgt
    assert "prospectivity_score" in tgt
    assert tgt["prospectivity_score"] >= 0.65

def test_explain_drill_target(client):
    res = client.get("/api/explain-target/MN-TGT-01")
    assert res.status_code == 200
    data = res.json()
    assert "target" in data
    assert "explanation" in data
    expl = data["explanation"]
    assert "geological_narrative" in expl
    assert "feature_attributions" in expl
    assert "borehole_stratigraphy" in expl
    assert "ore_intercept" in expl["borehole_stratigraphy"]

def test_analyze_roi(client):
    payload = {
        "min_lat": 21.75,
        "max_lat": 21.95,
        "min_lon": 80.05,
        "max_lon": 80.35,
        "name": "Balaghat-Bharweli Structural Axis Concession"
    }
    res = client.post("/api/analyze-roi", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["roi_name"] == payload["name"]
    assert data["area_sq_km"] > 0
    assert "peak_prospectivity" in data
    assert "estimated_in_situ_resource_mt" in data

def test_operations_simulate(client):
    res = client.get("/api/operations/simulate?month=July&rainfall_intensity=High&equipment_availability_pct=80.0")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "lp_optimization" in data
    assert "waterfall_analysis" in data

def test_download_dossier_pdf(client):
    res = client.get("/api/reports/download-dossier/MN-TGT-01")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000
