import React, { useState } from 'react';
import { Layers, Compass, ShieldCheck, Drill, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BoreholeStratigraphy({ stratigraphy }) {
  if (!stratigraphy) return null;

  const {
    borehole_id = "DDH-PLANNED-01",
    collar_inclination_deg = 60,
    drilling_azimuth_deg = 160,
    total_depth_eoh_m = 90.0,
    core_barrel_spec = "Wireline NQ (47.6mm Core)",
    ore_intercept = {},
    intervals = []
  } = stratigraphy;

  const [activeInterval, setActiveInterval] = useState(
    intervals.find(i => i.classification.includes("Economic Ore")) || intervals[0]
  );

  return (
    <div className="borehole-container">
      {/* Borehole Technical Header */}
      <div className="borehole-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="icon-badge-glow">
            <Drill size={16} color="var(--cyan-main)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
                {borehole_id}
              </span>
              <span className="telemetry-badge telemetry-cyan">
                {collar_inclination_deg}° &rarr; {drilling_azimuth_deg}° SSE
              </span>
              <span className="telemetry-badge telemetry-emerald">
                EOH: {total_depth_eoh_m}m
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Rig Tooling: {core_barrel_spec} &bull; UNFC Class: {ore_intercept.unfc_classification || "G-2 Indicated"}
            </div>
          </div>
        </div>

        {/* Economic Pay Seam Callout */}
        {ore_intercept && (
          <div className="ore-intercept-pill">
            <Sparkles size={14} color="#A855F7" />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Forecasted Braunite Seam
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-heading)' }}>
                {ore_intercept.apparent_thickness_m}m @ <span style={{ color: 'var(--violet-main)' }}>{ore_intercept.avg_mn_grade_pct}% Mn</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stratigraphic Interactive Column Layout */}
      <div className="borehole-body-grid">
        {/* Left: Visual Core Strip Column */}
        <div className="core-strip-wrapper">
          <div className="depth-ruler">
            <span>0m</span>
            <span>20m</span>
            <span>40m</span>
            <span>60m</span>
            <span>80m</span>
            <span>{Math.round(total_depth_eoh_m)}m</span>
          </div>

          <div className="core-column">
            {intervals.map((intv) => {
              const thickness = intv.to_depth_m - intv.from_depth_m;
              const heightPct = (thickness / total_depth_eoh_m) * 100;
              const isSelected = activeInterval?.interval_id === intv.interval_id;
              const isPaySeam = intv.classification.includes("Economic Ore");

              return (
                <div
                  key={intv.interval_id}
                  className={`core-slice ${isSelected ? 'selected' : ''} ${isPaySeam ? 'pay-seam-glow' : ''}`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: intv.color_code
                  }}
                  onClick={() => setActiveInterval(intv)}
                  title={`${intv.unit_name} (${intv.from_depth_m}m - ${intv.to_depth_m}m)`}
                >
                  <div className="slice-inner-content">
                    <span className="slice-depth-tag">
                      {intv.from_depth_m}-{intv.to_depth_m}m
                    </span>
                    <span className="slice-grade-tag">
                      {intv.mn_pct}% Mn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Core Interval Diagnostic Card */}
        {activeInterval && (
          <div className="interval-detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <span className="telemetry-badge" style={{ backgroundColor: `${activeInterval.color_code}33`, color: '#FFF', border: `1px solid ${activeInterval.color_code}` }}>
                  {activeInterval.classification}
                </span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', color: '#FFF', marginTop: '6px' }}>
                  {activeInterval.unit_name}
                </h4>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Depth Interval: {activeInterval.from_depth_m}m &mdash; {activeInterval.to_depth_m}m (Thickness: {Math.round((activeInterval.to_depth_m - activeInterval.from_depth_m) * 10) / 10}m)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Core Recovery</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-main)', fontFamily: 'var(--font-mono)' }}>
                  {activeInterval.core_recovery_pct}%
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {activeInterval.lithology}
            </p>

            {/* Chemical Assay Matrix */}
            <div className="assay-grid">
              <div className="assay-item">
                <span className="assay-label">Mn Content</span>
                <span className="assay-value" style={{ color: activeInterval.mn_pct >= 40 ? 'var(--violet-main)' : (activeInterval.mn_pct >= 20 ? 'var(--amber-main)' : 'var(--text-main)') }}>
                  {activeInterval.mn_pct}%
                </span>
              </div>
              <div className="assay-item">
                <span className="assay-label">Fe (Iron)</span>
                <span className="assay-value" style={{ color: 'var(--text-muted)' }}>
                  {activeInterval.fe_pct}%
                </span>
              </div>
              <div className="assay-item">
                <span className="assay-label">SiO₂ (Silica)</span>
                <span className="assay-value" style={{ color: 'var(--text-muted)' }}>
                  {activeInterval.sio2_pct}%
                </span>
              </div>
              <div className="assay-item">
                <span className="assay-label">Mn / Fe Ratio</span>
                <span className="assay-value" style={{ color: 'var(--cyan-main)' }}>
                  {Math.round((activeInterval.mn_pct / (activeInterval.fe_pct + 1e-4)) * 10) / 10}:1
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
