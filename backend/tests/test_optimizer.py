"""
Unit tests for Production Forecaster & SciPy Linear Programming Optimization Solver.
"""

import pytest
from app.core.production_forecaster import ProductionForecaster

def test_production_simulation_defaults():
    res = ProductionForecaster.simulate_production_scenario()
    assert "summary" in res
    assert "lp_optimization" in res
    assert "waterfall_analysis" in res
    assert "prescriptive_actions" in res

    summary = res["summary"]
    assert summary["total_target_mt"] == 114000
    assert summary["unmitigated_predicted_mt"] <= summary["total_target_mt"]
    assert summary["optimized_recovered_mt"] > 0
    assert summary["deficit_recovery_efficiency_pct"] > 0
    assert summary["residual_shortfall_mt"] < summary["unmitigated_shortfall_mt"]

def test_extreme_monsoon_lp_convergence():
    res = ProductionForecaster.simulate_production_scenario(
        rainfall_intensity="Extreme",
        equipment_availability_pct=72.0,
        blasting_delay_factor=1.35
    )
    assert res["summary"]["risk_level"] == "High"
    assert res["lp_optimization"]["solver_status"] == "Optimal Convergence (SciPy HiGHS LP)"
    assert res["summary"]["optimized_recovered_mt"] > 5000

    # Verify waterfall structure
    waterfall = res["waterfall_analysis"]
    assert len(waterfall) == 7
    steps = [w["step"] for w in waterfall]
    assert "Planned Monthly Target" in steps
    assert "AI LP Rebalancing Recovery" in steps
    assert "Final Optimized Output" in steps
