"""
Unit tests for Spectral Remote Sensing Engine (Sentinel-2 multispectral indices).
"""

import numpy as np
import pytest
from app.core.spectral_engine import SpectralEngine

def test_ndvi_bounds():
    red = np.array([[0.2, 0.4], [0.1, 0.5]], dtype=np.float32)
    nir = np.array([[0.6, 0.3], [0.8, 0.5]], dtype=np.float32)
    ndvi = SpectralEngine.compute_ndvi(red, nir)
    assert ndvi.shape == (2, 2)
    assert np.all(ndvi >= -1.0) and np.all(ndvi <= 1.0)
    assert ndvi[0, 0] == pytest.approx((0.6 - 0.2) / (0.8 + 1e-7), rel=1e-3)

def test_iron_oxide_ratio():
    blue = np.array([[0.1, 0.15]], dtype=np.float32)
    red = np.array([[0.25, 0.30]], dtype=np.float32)
    fe_index = SpectralEngine.compute_iron_oxide(blue, red)
    assert np.all(fe_index >= 0.0) and np.all(fe_index <= 1.0)

def test_hydrothermal_alteration():
    swir1 = np.array([[0.35, 0.45]], dtype=np.float32)
    swir2 = np.array([[0.20, 0.22]], dtype=np.float32)
    alt = SpectralEngine.compute_hydrothermal_alteration(swir1, swir2)
    assert np.all(alt >= 0.0) and np.all(alt <= 1.0)

def test_spectral_cube_pipeline():
    rows, cols = 20, 30
    bands = {
        "blue": np.random.uniform(0.08, 0.14, (rows, cols)).astype(np.float32),
        "green": np.random.uniform(0.12, 0.20, (rows, cols)).astype(np.float32),
        "red": np.random.uniform(0.15, 0.26, (rows, cols)).astype(np.float32),
        "nir": np.random.uniform(0.28, 0.42, (rows, cols)).astype(np.float32),
        "swir1": np.random.uniform(0.22, 0.35, (rows, cols)).astype(np.float32),
        "swir2": np.random.uniform(0.18, 0.30, (rows, cols)).astype(np.float32)
    }
    layers = SpectralEngine.process_spectral_cube(bands)
    for key in ["ndvi", "iron_oxide_index", "hydrothermal_alteration", "manganese_proxy", "canopy_attenuation"]:
        assert key in layers
        assert layers[key].shape == (rows, cols)
        assert not np.isnan(layers[key]).any()
