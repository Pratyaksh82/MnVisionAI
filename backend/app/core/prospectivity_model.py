"""
AI Mineral Prospectivity Mapping (MPM) Engine.
Integrates spectral, structural, lithological, and spatial proximity features
using an ensembled Positive-Unlabeled (PU) Machine Learning framework.
Predicts manganese prospectivity probabilities, quantifies epistemic uncertainty,
and ranks discrete drill targets.
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from scipy import ndimage

class ProspectivityModel:
    """
    Supervised and Positive-Unlabeled (PU) Mineral Prospectivity Model.
    """

    FEATURE_NAMES = [
        "manganese_proxy",
        "hydrothermal_alteration",
        "iron_oxide_index",
        "lineament_density",
        "structural_intersections",
        "slope_suitability",
        "formation_prior",
        "proximity_factor"
    ]

    def __init__(self):
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=7,
            min_samples_split=4,
            random_state=42
        )
        self.gb_model = HistGradientBoostingClassifier(
            max_iter=100,
            max_depth=5,
            learning_rate=0.08,
            random_state=42
        )
        self.is_trained = False
        self.feature_importances: Dict[str, float] = {}

    def train_pu_ensemble(self, X: np.ndarray, y: np.ndarray):
        """
        Trains the ensemble model on feature vectors X and binary labels y.
        y = 1 for known deposit occurrences, y = 0 for unlabeled background samples.
        """
        self.rf_model.fit(X, y)
        self.gb_model.fit(X, y)
        self.is_trained = True

        # Extract normalized feature importance from Random Forest
        raw_importances = self.rf_model.feature_importances_
        norm_importances = raw_importances / np.sum(raw_importances)
        self.feature_importances = {
            name: round(float(imp), 4)
            for name, imp in zip(self.FEATURE_NAMES, norm_importances)
        }

    def predict_grid(self, feature_stack: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Runs batch prediction over a 2D spatial grid of feature layers.
        Returns prospectivity probability, uncertainty variance, and drill hotspots.
        """
        rows, cols = feature_stack[self.FEATURE_NAMES[0]].shape
        n_pixels = rows * cols

        # Flatten features into (n_pixels, n_features) matrix
        X = np.zeros((n_pixels, len(self.FEATURE_NAMES)), dtype=np.float32)
        for idx, feat_name in enumerate(self.FEATURE_NAMES):
            X[:, idx] = feature_stack[feat_name].ravel()

        if not self.is_trained:
            # Fallback to calibrated domain-weighted geostatistical prior if model not fitted
            weights = np.array([0.22, 0.18, 0.14, 0.16, 0.12, 0.06, 0.12, 0.00], dtype=np.float32)
            base_score = np.dot(X, weights)
            prob_rf = base_score
            prob_gb = base_score
        else:
            prob_rf = self.rf_model.predict_proba(X)[:, 1]
            prob_gb = self.gb_model.predict_proba(X)[:, 1]

        # Ensemble average prospectivity
        ensemble_prob = 0.55 * prob_rf + 0.45 * prob_gb
        ensemble_prob = np.clip(ensemble_prob, 0.0, 1.0)

        # Epistemic Uncertainty = Variance / Disagreement between ensemble models
        uncertainty = np.abs(prob_rf - prob_gb) * 1.5

        # Reshape back to 2D grid
        grid_prob = ensemble_prob.reshape(rows, cols)
        grid_uncertainty = uncertainty.reshape(rows, cols)

        return {
            "prospectivity_map": np.round(grid_prob, 4),
            "uncertainty_map": np.round(grid_uncertainty, 4)
        }

    @staticmethod
    def extract_drill_targets(
        prospectivity_map: np.ndarray,
        uncertainty_map: np.ndarray,
        feature_stack: Dict[str, np.ndarray],
        geo_bounds: Dict[str, float],
        min_prospectivity: float = 0.68,
        top_k: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Detects local prospectivity maxima / clusters and ranks discrete drilling targets.
        """
        rows, cols = prospectivity_map.shape
        high_prob_mask = prospectivity_map >= min_prospectivity

        # Label contiguous high-prospectivity anomaly clusters
        labeled_array, num_features = ndimage.label(high_prob_mask)

        targets = []
        lat_step = (geo_bounds['max_lat'] - geo_bounds['min_lat']) / rows
        lon_step = (geo_bounds['max_lon'] - geo_bounds['min_lon']) / cols

        for cluster_id in range(1, num_features + 1):
            mask = labeled_array == cluster_id
            cluster_size = int(np.sum(mask))

            if cluster_size < 3:
                continue  # Filter out single-pixel noise

            # Find coordinates of the peak prospectivity within this cluster
            cluster_values = np.where(mask, prospectivity_map, 0.0)
            max_r, max_c = np.unravel_index(np.argmax(cluster_values), (rows, cols))

            score = float(prospectivity_map[max_r, max_c])
            unc = float(uncertainty_map[max_r, max_c])
            lat = float(geo_bounds['max_lat'] - (max_r + 0.5) * lat_step)
            lon = float(geo_bounds['min_lon'] + (max_c + 0.5) * lon_step)

            # Geological indicators at this peak
            mn_sig = float(feature_stack["manganese_proxy"][max_r, max_c])
            lineament = float(feature_stack["lineament_density"][max_r, max_c])
            alteration = float(feature_stack["hydrothermal_alteration"][max_r, max_c])
            slope = float(feature_stack.get("slope_deg", np.zeros_like(prospectivity_map))[max_r, max_c])

            # Drilling Accessibility Score (flatter terrain = easier rig mobilization)
            rig_accessibility = "High" if slope < 12 else ("Medium" if slope < 22 else "Challenging (Rugged)")

            # Calculated drill priority (Composite: 60% prospectivity, 25% low uncertainty, 15% structural traps)
            priority_score = round(score * 0.60 + (1.0 - unc) * 0.25 + lineament * 0.15, 3)

            targets.append({
                "target_id": f"MN-TGT-{len(targets) + 1:02d}",
                "latitude": round(lat, 5),
                "longitude": round(lon, 5),
                "prospectivity_score": round(score, 3),
                "confidence_score": round(1.0 - unc, 3),
                "uncertainty": round(unc, 3),
                "priority_rank_score": priority_score,
                "cluster_area_sq_km": round(cluster_size * 0.09, 2),  # approx cell size
                "estimated_depth_tier": "Shallow (20-60m)" if mn_sig > 0.8 else "Intermediate (60-140m)",
                "rig_accessibility": rig_accessibility,
                "terrain_slope_deg": round(slope, 1),
                "indicators": {
                    "manganese_spectral": round(mn_sig, 3),
                    "hydrothermal_alteration": round(alteration, 3),
                    "lineament_density": round(lineament, 3)
                },
                "recommended_action": "Priority 1 Core Drilling (30m diamond core hole)" if priority_score > 0.75 else "Secondary Trenching & Ground Magnetics"
            })

        # Sort descending by priority rank score and return top K
        targets.sort(key=lambda t: t["priority_rank_score"], reverse=True)
        return targets[:top_k]
