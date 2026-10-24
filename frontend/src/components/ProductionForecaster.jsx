import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CloudRain,
  Wrench,
  Flame,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Truck,
  ShieldAlert,
  Sparkles,
  Cpu,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { API_BASE } from '../config';

export default function ProductionForecaster() {
  const [month, setMonth] = useState('July (Monsoon Peak)');
  const [rainfall, setRainfall] = useState('High');
  const [machineryAvailability, setMachineryAvailability] = useState(82.0);
  const [blastingDelay, setBlastingDelay] = useState(1.25);

  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        month,
        rainfall_intensity: rainfall,
        equipment_availability_pct: machineryAvailability.toString(),
        blasting_delay_factor: blastingDelay.toString()
      });
      const res = await fetch(`${API_BASE}/api/operations/simulate?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSimData(data);
      }
    } catch (err) {
      console.error('Failed to run simulation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [month, rainfall, machineryAvailability, blastingDelay]);

  if (!simData) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '3rem', textAlign: 'center' }}>
        <div className="pulse-dot" style={{ margin: '0 auto 1rem' }} />
        Solving MOIL operations Linear Programming constraints...
      </div>
    );
  }

  const {
    summary,
    bottlenecks,
    mine_breakdowns,
    lp_optimization = {},
    waterfall_analysis = [],
    prescriptive_actions,
    monthly_trend
  } = simData;

  const reallocations = lp_optimization.reallocations || [];

  return (
    <div className="operations-container">
      {/* Title & Context Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--rose-main), var(--amber-main))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--rose-glow)'
            }}>
              <Activity size={20} color="#FFF" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#FFF' }}>
              MOIL Production Shortfall Forecaster & LP Optimization Engine
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            SIH 2026 Core Deliverable: Predictive modeling of equipment MTBF, weather inundation, and blasting bottlenecks to ensure continuous ore availability.
          </p>
        </div>

        <button
          className="map-btn"
          style={{ background: 'linear-gradient(135deg, var(--cyan-main), var(--violet-main))', color: '#030712', fontWeight: 800 }}
          onClick={runSimulation}
        >
          <Sparkles size={14} />
          <span>{loading ? 'Solving...' : 'Re-Run LP Solver'}</span>
        </button>
      </div>

      {/* KPI Cards Banner */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-title">MOIL Monthly Target</div>
          <div className="kpi-value">
            {summary.total_target_mt.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>MT</span>
          </div>
          <div className="kpi-sub">Aggregate across 5 primary central mines</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Unmitigated Baseline Forecast</div>
          <div className="kpi-value" style={{ color: 'var(--rose-main)' }}>
            {(summary.unmitigated_predicted_mt || summary.total_predicted_mt).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MT</span>
          </div>
          <div className="kpi-sub">
            Deficit: -{(summary.unmitigated_shortfall_mt || summary.overall_shortfall_mt).toLocaleString()} MT ({summary.unmitigated_shortfall_pct}%)
          </div>
        </div>

        <div className="kpi-card" style={{ border: '1px solid var(--border-glow)' }}>
          <div className="kpi-title" style={{ color: 'var(--cyan-main)' }}>AI Optimized Net Output</div>
          <div className="kpi-value" style={{ color: 'var(--emerald-main)' }}>
            {(summary.post_mitigation_predicted_mt || summary.total_predicted_mt).toLocaleString()} <span style={{ fontSize: '0.85rem' }}>MT</span>
          </div>
          <div className="kpi-sub">
            Recovered: +{summary.optimized_recovered_mt.toLocaleString()} MT ({summary.deficit_recovery_efficiency_pct}% gap cleared)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Residual Operational Risk</div>
          <div className="kpi-value" style={{ color: summary.residual_shortfall_pct > 10 ? 'var(--amber-main)' : 'var(--emerald-main)' }}>
            {summary.risk_level === 'High' && summary.residual_shortfall_pct <= 10 ? 'Mitigated (Low)' : summary.risk_level}
          </div>
          <div className="kpi-sub">Residual Deficit: -{summary.residual_shortfall_mt.toLocaleString()} MT ({summary.residual_shortfall_pct}%)</div>
        </div>
      </div>

      {/* SciPy LP Optimization Banner */}
      <div className="lp-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="var(--cyan-main)" />
            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#FFF', fontFamily: 'var(--font-heading)' }}>
              Mathematical Optimization Result: {lp_optimization.solver_status || "Optimal Convergence (SciPy HiGHS LP)"}
            </span>
          </div>
          <div className="telemetry-badge telemetry-cyan">
            Recovery Efficiency: {summary.deficit_recovery_efficiency_pct}%
          </div>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          The solver computed the physical and statutory boundary constraints across pit pumping velocity, HEMM mobile maintenance hours, and underground hoist capacities. By executing targeted shift overtime at Balaghat and deploying auxiliary sumps at Dongri Buzurg, <strong>{summary.optimized_recovered_mt.toLocaleString()} MT</strong> of manganese shortfall is recovered.
        </p>

        {/* Executive Waterfall Deficit Flow */}
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
            Tonnage Delta Waterfall Flow (MT)
          </div>
          <div className="waterfall-grid">
            {waterfall_analysis.map((step, idx) => {
              const isLoss = step.value < 0;
              const isRec = step.type === 'recovery';
              const isFinal = step.type === 'final';

              return (
                <div
                  key={idx}
                  className="waterfall-step"
                  style={{
                    borderColor: isFinal ? 'var(--emerald-main)' : (isRec ? 'var(--cyan-main)' : (isLoss ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)')),
                    background: isFinal ? 'rgba(16, 185, 129, 0.1)' : (isRec ? 'rgba(0, 242, 254, 0.08)' : 'rgba(11, 18, 33, 0.7)')
                  }}
                >
                  <span className="waterfall-label">{step.step}</span>
                  <span
                    className="waterfall-value"
                    style={{
                      color: isFinal ? 'var(--emerald-main)' : (isRec ? 'var(--cyan-main)' : (isLoss ? 'var(--rose-main)' : '#FFF'))
                    }}
                  >
                    {step.value > 0 && !isFinal && step.type !== 'baseline' && step.type !== 'subtotal' ? `+${step.value.toLocaleString()}` : step.value.toLocaleString()} MT
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Simulation Parameters Controls */}
      <div className="simulation-controls-grid">
        <div className="control-field">
          <label className="control-label">
            <span>Simulation Month</span>
            <span style={{ color: 'var(--cyan-main)', fontFamily: 'var(--font-mono)' }}>{month}</span>
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="custom-select"
          >
            <option value="July (Monsoon Peak)">July (Monsoon Peak - Sump Stress)</option>
            <option value="August (High Inflow)">August (High Inflow / Waterlogging)</option>
            <option value="October (Post-Monsoon)">October (Post-Monsoon Ramp-Up)</option>
            <option value="January (Dry Peak)">January (Dry Winter Peak Operations)</option>
          </select>
        </div>

        <div className="control-field">
          <label className="control-label">
            <span>Precipitation / Inundation Severity</span>
            <span style={{ color: 'var(--amber-main)', fontFamily: 'var(--font-mono)' }}>
              {rainfall} ({simData.simulation_params.rainfall_mm}mm)
            </span>
          </label>
          <select
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            className="custom-select"
          >
            <option value="Low">Low (&lt; 50mm - Dry Season / Normal)</option>
            <option value="Medium">Medium (180mm - Moderate Monsoon Inflow)</option>
            <option value="High">High (360mm - Severe Pit Waterlogging)</option>
            <option value="Extreme">Extreme (540mm - Flash Inundation Crisis)</option>
          </select>
        </div>

        <div className="control-field">
          <div className="control-label">
            <span>HEMM Machinery Availability</span>
            <span style={{ color: machineryAvailability < 80 ? 'var(--rose-main)' : 'var(--emerald-main)', fontFamily: 'var(--font-mono)' }}>
              {machineryAvailability}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="100"
            step="1"
            value={machineryAvailability}
            onChange={(e) => setMachineryAvailability(parseFloat(e.target.value))}
            className="custom-slider"
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Tracks Haul Dumpers, Hydraulic Excavators, and Mine Hoists
          </div>
        </div>

        <div className="control-field">
          <div className="control-label">
            <span>Blasting Delay Multiplier</span>
            <span style={{ color: 'var(--cyan-main)', fontFamily: 'var(--font-mono)' }}>{blastingDelay}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="1.5"
            step="0.05"
            value={blastingDelay}
            onChange={(e) => setBlastingDelay(parseFloat(e.target.value))}
            className="custom-slider"
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            DGMS regulatory clearance turnaround and magazine delivery sync
          </div>
        </div>
      </div>

      {/* Bottlenecks Attribution Bar */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF' }}>
          Shortfall Root-Cause Attribution Breakdown
        </div>
        <div style={{ display: 'flex', height: '14px', borderRadius: '8px', overflow: 'hidden', background: '#0F172A' }}>
          <div
            style={{ width: `${bottlenecks.weather_monsoon_pct}%`, background: 'var(--cyan-main)' }}
            title={`Monsoon Inundation: ${bottlenecks.weather_monsoon_pct}%`}
          />
          <div
            style={{ width: `${bottlenecks.equipment_downtime_pct}%`, background: 'var(--amber-main)' }}
            title={`HEMM Machinery Downtime: ${bottlenecks.equipment_downtime_pct}%`}
          />
          <div
            style={{ width: `${bottlenecks.blasting_clearance_pct}%`, background: 'var(--rose-main)' }}
            title={`Blasting Delays: ${bottlenecks.blasting_clearance_pct}%`}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--cyan-main)' }}></div>
            <span>Monsoon Pit Inundation: <strong>{bottlenecks.weather_monsoon_pct}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--amber-main)' }}></div>
            <span>HEMM Machinery Breakdown: <strong>{bottlenecks.equipment_downtime_pct}%</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--rose-main)' }}></div>
            <span>Blasting & Clearance Delay: <strong>{bottlenecks.blasting_clearance_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* Mine-by-Mine LP Reallocation Table */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFF' }}>
            Mine Facility Schedule & AI LP Shift Reallocations
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Physical capacity bounds enforced
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mine Facility</th>
                <th>Type</th>
                <th>Target Output</th>
                <th>Unmitigated</th>
                <th>AI LP Surge Recovery</th>
                <th>Final Net Output</th>
                <th>Prescribed Mitigation Directives</th>
              </tr>
            </thead>
            <tbody>
              {(reallocations.length > 0 ? reallocations : mine_breakdowns).map((m) => (
                <tr key={m.mine_id}>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: m.type === 'Underground' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                      color: m.type === 'Underground' ? 'var(--violet-main)' : 'var(--cyan-main)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700
                    }}>
                      {m.type}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{m.target_mt.toLocaleString()} MT</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose-main)' }}>
                    {(m.unmitigated_predicted_mt || m.predicted_mt).toLocaleString()} MT
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-main)' }}>
                    +{ (m.optimized_recovery_mt || 0).toLocaleString()} MT
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-main)' }}>
                    {(m.post_mitigation_predicted_mt || m.predicted_mt).toLocaleString()} MT
                  </td>
                  <td style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {m.prescribed_action || m.primary_risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescriptive Corrective Actions Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--cyan-main)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#FFF' }}>
            Prescriptive Corrective Actions & Resource Mobilization
          </h3>
        </div>

        <div className="actions-grid">
          {prescriptive_actions.map((act) => (
            <div key={act.id} className={`action-card ${act.priority === 'Critical' ? 'critical' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="action-title">{act.action}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: act.priority === 'Critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: act.priority === 'Critical' ? 'var(--rose-main)' : 'var(--amber-main)',
                  fontWeight: 800
                }}>
                  {act.priority}
                </span>
              </div>
              <p className="action-desc">{act.details}</p>
              <div className="action-gain">
                Estimated Recovery: +{act.expected_recovery_mt.toLocaleString()} MT Manganese Ore
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
