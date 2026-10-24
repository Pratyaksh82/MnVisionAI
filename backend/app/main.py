"""
FastAPI Server for MnVisionAI: Space-Intelligence Platform for Manganese Reserve Discovery.
Smart India Hackathon (SIH 2026) Problem Statement SIH26009.
"""

import os
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import numpy as np

from app.data.sausar_belt_data import STUDY_AREA, KNOWN_MINES, GEOLOGICAL_FORMATIONS
from app.data.sample_rasters import get_or_build_pipeline
from app.core.xai_engine import XaiEngine
from app.core.production_forecaster import ProductionForecaster
from app.core.report_generator import generate_target_dossier_pdf

app = FastAPI(
    title="MnVisionAI API",
    description="Space-Intelligence Platform for Manganese Reserve Discovery and Production Shortfall Mitigation",
    version="1.0.0"
)

# Enable CORS for local and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoiAnalysisRequest(BaseModel):
    min_lat: float = Field(..., description="Minimum latitude bounding box")
    max_lat: float = Field(..., description="Maximum latitude bounding box")
    min_lon: float = Field(..., description="Minimum longitude bounding box")
    max_lon: float = Field(..., description="Maximum longitude bounding box")
    name: Optional[str] = "Custom Exploration Lease ROI"
    polygon_coords: Optional[List[List[float]]] = None

@app.get("/")
def read_root():
    return {
        "platform": "MnVisionAI",
        "description": "Space-Intelligence Platform for Manganese Reserve Discovery & Production Shortfall Mitigation",
        "sih_ps": "SIH26009",
        "organization": "MOIL Limited & Ministry of Steel",
        "status": "Operational"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "MnVisionAI Backend Engine"}

@app.get("/api/study-area")
def get_study_area():
    """Returns primary study region, geological formations, and historical mines."""
    return {
        "study_area": STUDY_AREA,
        "known_mines": KNOWN_MINES,
        "geological_formations": GEOLOGICAL_FORMATIONS
    }

@app.get("/api/prospectivity/grid")
def get_prospectivity_grid(downsample: int = Query(default=2, ge=1, le=4)):
    """
    Returns spatial grid data for interactive heatmap and raster rendering.
    Downsample reduces payload for snappy browser rendering.
    """
    model, features, meta, predictions = get_or_build_pipeline()

    step = downsample
    # Subsample matrices for web transfer
    prob_sub = predictions["prospectivity_map"][::step, ::step].tolist()
    unc_sub = predictions["uncertainty_map"][::step, ::step].tolist()
    mn_sub = features["manganese_proxy"][::step, ::step].tolist()
    lineament_sub = features["lineament_density"][::step, ::step].tolist()
    alteration_sub = features["hydrothermal_alteration"][::step, ::step].tolist()
    dem_sub = features["dem_elevation"][::step, ::step].tolist()

    return {
        "bounds": meta["bounds"],
        "rows": len(prob_sub),
        "cols": len(prob_sub[0]),
        "layers": {
            "prospectivity": prob_sub,
            "uncertainty": unc_sub,
            "manganese_proxy": mn_sub,
            "lineament_density": lineament_sub,
            "hydrothermal_alteration": alteration_sub,
            "dem_elevation": dem_sub
        },
        "feature_importances": model.feature_importances
    }

@app.get("/api/drill-targets")
def get_drill_targets(min_prospectivity: float = 0.65, top_k: int = 8):
    """
    Returns discrete ranked drill hole candidate targets.
    """
    model, features, meta, predictions = get_or_build_pipeline()
    targets = model.extract_drill_targets(
        prospectivity_map=predictions["prospectivity_map"],
        uncertainty_map=predictions["uncertainty_map"],
        feature_stack=features,
        geo_bounds=meta["bounds"],
        min_prospectivity=min_prospectivity,
        top_k=top_k
    )
    return {"targets": targets, "total_candidates": len(targets)}

@app.get("/api/explain-target/{target_id}")
def explain_drill_target(target_id: str):
    """
    Provides explainable AI (SHAP) attributions and geological narrative for a drill target.
    """
    model, features, meta, predictions = get_or_build_pipeline()
    targets = model.extract_drill_targets(
        prospectivity_map=predictions["prospectivity_map"],
        uncertainty_map=predictions["uncertainty_map"],
        feature_stack=features,
        geo_bounds=meta["bounds"],
        min_prospectivity=0.60,
        top_k=15
    )

    matching = next((t for t in targets if t["target_id"] == target_id), None)
    if not matching:
        # Fallback to top target
        if targets:
            matching = targets[0]
        else:
            raise HTTPException(status_code=404, detail="Target not found")

    explanation = XaiEngine.explain_target(
        target_indicators={
            "manganese_proxy": matching["indicators"]["manganese_spectral"],
            "hydrothermal_alteration": matching["indicators"]["hydrothermal_alteration"],
            "iron_oxide_index": 0.45,
            "lineament_density": matching["indicators"]["lineament_density"],
            "structural_intersections": matching["indicators"]["lineament_density"] * 0.9,
            "formation_prior": 0.82,
            "slope_suitability": max(0.1, 1.0 - (matching["terrain_slope_deg"] / 30.0)),
            "proximity_factor": 0.75
        },
        overall_score=matching["prospectivity_score"]
    )

    return {
        "target": matching,
        "explanation": explanation
    }

@app.post("/api/analyze-roi")
def analyze_custom_roi(roi: RoiAnalysisRequest):
    """
    Evaluates a user-defined custom lease area or bounding box.
    """
    model, features, meta, predictions = get_or_build_pipeline()

    # Clip to grid indices
    b = meta["bounds"]
    r_min = int(np.clip((b["max_lat"] - roi.max_lat) / (b["max_lat"] - b["min_lat"]) * meta["rows"], 0, meta["rows"] - 1))
    r_max = int(np.clip((b["max_lat"] - roi.min_lat) / (b["max_lat"] - b["min_lat"]) * meta["rows"], 0, meta["rows"] - 1))
    c_min = int(np.clip((roi.min_lon - b["min_lon"]) / (b["max_lon"] - b["min_lon"]) * meta["cols"], 0, meta["cols"] - 1))
    c_max = int(np.clip((roi.max_lon - b["min_lon"]) / (b["max_lon"] - b["min_lon"]) * meta["cols"], 0, meta["cols"] - 1))

    if r_min >= r_max:
        r_max = r_min + 1
    if c_min >= c_max:
        c_max = c_min + 1

    roi_prob = predictions["prospectivity_map"][r_min:r_max, c_min:c_max]
    mean_prob = float(np.mean(roi_prob))
    max_prob = float(np.max(roi_prob))
    high_potential_area_pct = float(np.mean(roi_prob >= 0.70) * 100)

    # Approximate ground concession area in sq km
    lat_span_km = abs(roi.max_lat - roi.min_lat) * 111.13
    lon_span_km = abs(roi.max_lon - roi.min_lon) * 103.4
    area_sq_km = round(lat_span_km * lon_span_km, 2)
    # Estimated in-situ inferred resource (UNFC G-3 category): Area * Thickness * Density
    est_resource_mt = round(area_sq_km * (high_potential_area_pct / 100.0) * 8.5 * 3.4 * 10000, 0)

    return {
        "roi_name": roi.name,
        "area_sq_km": area_sq_km,
        "mean_prospectivity": round(mean_prob, 3),
        "peak_prospectivity": round(max_prob, 3),
        "high_potential_area_pct": round(high_potential_area_pct, 1),
        "estimated_in_situ_resource_mt": int(est_resource_mt),
        "unfc_exploration_tier": "G-2 / G-3 Reconnaissance Exploration",
        "recommendation": "High Priority for Core Drilling" if max_prob > 0.75 else "Secondary Exploration Recommended"
    }

@app.get("/api/operations/simulate")
def simulate_operations(
    month: str = "July (Monsoon Peak)",
    rainfall_intensity: str = "High",
    equipment_availability_pct: float = 82.0,
    blasting_delay_factor: float = 1.25
):
    """
    Runs MOIL operational production shortfall simulation.
    """
    return ProductionForecaster.simulate_production_scenario(
        month=month,
        rainfall_intensity=rainfall_intensity,
        equipment_availability_pct=equipment_availability_pct,
        blasting_delay_factor=blasting_delay_factor
    )

@app.get("/api/reports/download-dossier/{target_id}")
def download_target_dossier(target_id: str):
    """
    Generates and returns an official PDF Exploration Target Dossier.
    """
    model, features, meta, predictions = get_or_build_pipeline()
    targets = model.extract_drill_targets(
        prospectivity_map=predictions["prospectivity_map"],
        uncertainty_map=predictions["uncertainty_map"],
        feature_stack=features,
        geo_bounds=meta["bounds"],
        min_prospectivity=0.60,
        top_k=15
    )

    matching = next((t for t in targets if t["target_id"] == target_id), None)
    if not matching:
        if targets:
            matching = targets[0]
        else:
            raise HTTPException(status_code=404, detail="Target not found")

    explanation = XaiEngine.explain_target(
        target_indicators={
            "manganese_proxy": matching["indicators"]["manganese_spectral"],
            "hydrothermal_alteration": matching["indicators"]["hydrothermal_alteration"],
            "iron_oxide_index": 0.45,
            "lineament_density": matching["indicators"]["lineament_density"],
            "structural_intersections": matching["indicators"]["lineament_density"] * 0.9,
            "formation_prior": 0.82,
            "slope_suitability": max(0.1, 1.0 - (matching["terrain_slope_deg"] / 30.0)),
            "proximity_factor": 0.75
        },
        overall_score=matching["prospectivity_score"]
    )

    pdf_bytes = generate_target_dossier_pdf(matching, explanation)

    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=MnVisionAI_{target_id}_Dossier.pdf"
        }
    )

# Static files mount for Render fullstack single-service deployment
_base_dir = os.path.dirname(os.path.abspath(__file__))
_frontend_dist = os.path.abspath(os.path.join(_base_dir, "..", "..", "frontend", "dist"))
if not os.path.exists(_frontend_dist):
    _frontend_dist = os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist"))

if os.path.exists(_frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API Endpoint Not Found")
        file_path = os.path.join(_frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

