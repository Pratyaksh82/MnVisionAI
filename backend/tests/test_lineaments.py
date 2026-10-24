"""
Unit tests for Structural Geology & Lineament Extraction Engine.
"""

import numpy as np
import pytest
from app.core.lineament_engine import LineamentEngine

def test_slope_aspect_computation():
    # Simple tilted plane: 10m drop across 30m cell
    dem = np.zeros((10, 10), dtype=np.float32)
    for r in range(10):
        dem[r, :] = r * 15.0

    slope_dict = LineamentEngine.compute_slope_aspect(dem, cell_size_m=30.0)
    assert "slope_deg" in slope_dict
    assert "aspect_deg" in slope_dict
    assert slope_dict["slope_deg"].shape == (10, 10)
    assert np.all(slope_dict["slope_deg"] >= 0.0)
    assert np.all(slope_dict["slope_deg"] <= 90.0)

def test_lineament_extraction():
    rows, cols = 30, 40
    # Synthetic DEM with an ENE strike ridge
    x, y = np.meshgrid(np.linspace(0, 10, cols), np.linspace(0, 10, rows))
    dem = 400.0 + 50.0 * np.sin(x * 0.8 + y * 0.4)

    lineaments = LineamentEngine.extract_lineaments(dem, threshold_percentile=85.0)
    assert "lineament_density" in lineaments
    assert "structural_intersections" in lineaments
    assert np.all(lineaments["lineament_density"] >= 0.0) and np.all(lineaments["lineament_density"] <= 1.0)
    assert np.all(lineaments["structural_intersections"] >= 0.0) and np.all(lineaments["structural_intersections"] <= 1.0)
