"""
Spectral Remote Sensing Engine for Manganese Prospectivity.
Implements calibrated multispectral indices for Sentinel-2, Landsat-8/9, and ASTER data.
Calculates iron oxide alteration, clay/hydrothermal indices, manganese absorption proxies, and vegetation masks.
"""

import numpy as np
from typing import Dict, Any, Tuple

class SpectralEngine:
    """
    Processes multispectral bands and computes diagnostic mineralogical indices
    for manganese reserve exploration.
    """

    @staticmethod
    def compute_ndvi(band_red: np.ndarray, band_nir: np.ndarray) -> np.ndarray:
        """
        Normalized Difference Vegetation Index (NDVI)
        Used to identify canopy density and create bare rock/soil masks.
        """
        denominator = band_nir + band_red + 1e-7
        ndvi = (band_nir - band_red) / denominator
        return np.clip(ndvi, -1.0, 1.0)

    @staticmethod
    def compute_iron_oxide(band_blue: np.ndarray, band_red: np.ndarray) -> np.ndarray:
        """
        Iron Oxide Index (Sentinel-2 B4 / B2).
        Manganese deposits in the Sausar belt are frequently associated with
        ferruginous gossans, hematite/goethite caps, and jacobsite mineralization.
        """
        denominator = band_blue + 1e-7
        ratio = band_red / denominator
        # Normalize into a 0.0 - 1.0 standard index range
        normalized = np.clip((ratio - 0.8) / 1.5, 0.0, 1.0)
        return normalized

    @staticmethod
    def compute_hydrothermal_alteration(band_swir1: np.ndarray, band_swir2: np.ndarray) -> np.ndarray:
        """
        Hydrothermal / Clay Alteration Index (Sentinel-2 B11 / B12).
        Highlights Al-OH and Mg-OH phyllosilicates (illite, muscovite, kaolinite)
        formed during metamorphism and hydrothermal fluid alteration around ore bodies.
        """
        denominator = band_swir2 + 1e-7
        ratio = band_swir1 / denominator
        normalized = np.clip((ratio - 0.9) / 1.2, 0.0, 1.0)
        return normalized

    @staticmethod
    def compute_manganese_spectral_proxy(
        band_blue: np.ndarray,
        band_green: np.ndarray,
        band_red: np.ndarray,
        band_swir1: np.ndarray,
        band_swir2: np.ndarray
    ) -> np.ndarray:
        """
        Calibrated Manganese Absorption Proxy.
        Pyrolusite (MnO2) and Braunite (3Mn2O3·MnSiO3) exhibit distinct absorption
        troughs in VNIR (due to Mn3+/Mn4+ crystal field transitions) combined with
        characteristic SWIR reflectance behavior.
        
        Formula combines ASTER-style ratio contrast with Sentinel-2 SWIR/VNIR balance:
        Proxy = ((SWIR1 / (Red + Blue + 1e-5)) * (Green / (Red + 1e-5))) normalized.
        """
        vnir_denominator = band_red + band_blue + 1e-6
        swir_contrast = band_swir1 / vnir_denominator
        green_red_balance = band_green / (band_red + 1e-6)
        
        raw_proxy = swir_contrast * green_red_balance
        # Normalization with 2nd to 98th percentile scaling
        p2, p98 = np.percentile(raw_proxy, [2, 98])
        if p98 > p2:
            norm_proxy = np.clip((raw_proxy - p2) / (p98 - p2), 0.0, 1.0)
        else:
            norm_proxy = np.zeros_like(raw_proxy)
            
        return norm_proxy

    @classmethod
    def process_spectral_cube(cls, bands: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Runs comprehensive spectral index pipeline across band layers:
        - blue (B2)
        - green (B3)
        - red (B4)
        - nir (B8)
        - swir1 (B11)
        - swir2 (B12)
        """
        b_blue = bands['blue']
        b_green = bands['green']
        b_red = bands['red']
        b_nir = bands['nir']
        b_swir1 = bands['swir1']
        b_swir2 = bands['swir2']

        ndvi = cls.compute_ndvi(b_red, b_nir)
        iron_oxide = cls.compute_iron_oxide(b_blue, b_red)
        alteration = cls.compute_hydrothermal_alteration(b_swir1, b_swir2)
        mn_proxy = cls.compute_manganese_spectral_proxy(b_blue, b_green, b_red, b_swir1, b_swir2)

        # Vegetation suppression: where NDVI > 0.45 (dense canopy), spectral signals
        # from surface lithology are attenuated. Apply a dampening factor to bare rock indices.
        canopy_mask = np.clip(1.0 - (ndvi - 0.25) / 0.35, 0.2, 1.0)
        
        calibrated_mn = mn_proxy * canopy_mask
        calibrated_alteration = alteration * canopy_mask
        calibrated_fe = iron_oxide * canopy_mask

        return {
            "ndvi": np.round(ndvi, 4),
            "iron_oxide_index": np.round(calibrated_fe, 4),
            "hydrothermal_alteration": np.round(calibrated_alteration, 4),
            "manganese_proxy": np.round(calibrated_mn, 4),
            "canopy_attenuation": np.round(canopy_mask, 4)
        }
