"""
Structural Geology and Lineament Extraction Engine.
Extracts structural fault networks, shear zones, and fracture density from Digital Elevation Models (DEM).
Manganese deposits in the Sausar Group are structurally controlled by folds, fault planes, and thrust contacts.
"""

import numpy as np
from scipy import ndimage
from typing import Dict, Any

class LineamentEngine:
    """
    Computes structural lineaments, lineament intersection density,
    and topographic derivatives from DEM rasters.
    """

    @staticmethod
    def compute_slope_aspect(dem: np.ndarray, cell_size_m: float = 30.0) -> Dict[str, np.ndarray]:
        """
        Calculates terrain slope in degrees and aspect from DEM elevation raster.
        """
        # Sobel gradients in X and Y directions
        dx = ndimage.sobel(dem, axis=1) / (8.0 * cell_size_m)
        dy = ndimage.sobel(dem, axis=0) / (8.0 * cell_size_m)

        slope_rad = np.arctan(np.sqrt(dx**2 + dy**2))
        slope_deg = np.rad2deg(slope_rad)

        aspect_rad = np.arctan2(-dy, dx)
        aspect_deg = np.rad2deg(aspect_rad)
        aspect_deg[aspect_deg < 0] += 360.0

        return {
            "slope_deg": np.round(slope_deg, 2),
            "aspect_deg": np.round(aspect_deg, 2),
            "grad_x": dx,
            "grad_y": dy
        }

    @classmethod
    def extract_lineaments(cls, dem: np.ndarray, threshold_percentile: float = 88.0) -> Dict[str, np.ndarray]:
        """
        Applies directional multi-angle filtering to isolate structural lineaments
        aligned with the regional Sausar structural trend (ENE-WSW & NW-SE conjugate sets).
        """
        # Directional convolution kernels for fault edge detection
        # 1. Horizontal / E-W
        k_ew = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
        # 2. Vertical / N-S
        k_ns = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
        # 3. Diagonal 45° (NE-SW: Regional Sausar strike)
        k_ne_sw = np.array([[0, 1, 2], [-1, 0, 1], [-2, -1, 0]], dtype=np.float32)
        # 4. Diagonal 135° (NW-SE: Cross-faults)
        k_nw_se = np.array([[2, 1, 0], [1, 0, -1], [0, -1, -2]], dtype=np.float32)

        g_ew = np.abs(ndimage.convolve(dem, k_ew))
        g_ns = np.abs(ndimage.convolve(dem, k_ns))
        g_ne_sw = np.abs(ndimage.convolve(dem, k_ne_sw)) * 1.25  # Weighted for dominant regional trend
        g_nw_se = np.abs(ndimage.convolve(dem, k_nw_se))

        # Combined edge strength
        edge_magnitude = np.sqrt(g_ew**2 + g_ns**2 + g_ne_sw**2 + g_nw_se**2)

        # Thresholding to extract significant structural edges
        thresh = np.percentile(edge_magnitude, threshold_percentile)
        binary_edges = (edge_magnitude >= thresh).astype(np.float32)

        # Compute Lineament Density via Gaussian spatial window
        # Higher density indicates high fracture permeability favorable for ore deposition
        lineament_density = ndimage.gaussian_filter(binary_edges, sigma=3.5)
        # Normalize to 0.0 - 1.0 range
        max_d = np.max(lineament_density) + 1e-6
        norm_density = np.clip(lineament_density / max_d, 0.0, 1.0)

        # Lineament intersection nodes (cross-cutting structural traps)
        intersection_nodes = ndimage.gaussian_filter((g_ne_sw > thresh) * (g_nw_se > thresh), sigma=2.0)
        norm_intersections = np.clip(intersection_nodes / (np.max(intersection_nodes) + 1e-6), 0.0, 1.0)

        return {
            "edge_magnitude": np.round(edge_magnitude, 2),
            "lineament_binary": binary_edges,
            "lineament_density": np.round(norm_density, 4),
            "structural_intersections": np.round(norm_intersections, 4)
        }
