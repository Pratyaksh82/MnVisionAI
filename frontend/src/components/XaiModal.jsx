import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Download, Compass, AlertCircle, Drill, BarChart3, Layers } from 'lucide-react';
import BoreholeStratigraphy from './BoreholeStratigraphy';

export default function XaiModal({ target, explanation, onClose, onDownloadPdf }) {
  if (!target || !explanation) return null;

  const [modalTab, setModalTab] = useState('xai'); // 'xai' or 'stratigraphy'
  const attributions = explanation.feature_attributions || [];
  const narrative = explanation.geological_narrative || '';
  const stratigraphy = explanation.borehole_stratigraphy;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--cyan-main), var(--violet-main))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--cyan-glow)'
            }}>
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#FFF' }}>
                Exploration Target Intelligence & XAI Diagnostic
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Target: {target.target_id} &bull; GPS: {target.latitude}°N, {target.longitude}°E &bull; Priority Score: {target.priority_rank_score}/1.0
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
          <button
            className={`nav-tab-btn ${modalTab === 'xai' ? 'active' : ''}`}
            onClick={() => setModalTab('xai')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <BarChart3 size={14} />
            <span>SHAP Geological Attribution</span>
          </button>
          <button
            className={`nav-tab-btn ${modalTab === 'stratigraphy' ? 'active' : ''}`}
            onClick={() => setModalTab('stratigraphy')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <Drill size={14} />
            <span>3D Subsurface Borehole Core Log</span>
          </button>
        </div>

        {/* Summary Metric Ribbon */}
        <div style={{
          background: 'rgba(0, 242, 254, 0.05)',
          border: '1px solid var(--border-glow)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.85rem'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              AI Probability
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--cyan-main)', fontFamily: 'var(--font-heading)' }}>
              {Math.round(target.prospectivity_score * 100)}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Model Confidence
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--emerald-main)', fontFamily: 'var(--font-heading)' }}>
              {Math.round(target.confidence_score * 100)}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Target Stratum
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
              {target.estimated_depth_tier}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Rig Accessibility
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFF', marginTop: '4px' }}>
              {target.terrain_slope_deg}° ({target.rig_accessibility})
            </div>
          </div>
        </div>

        {modalTab === 'xai' && (
          <>
            {/* Geological Narrative */}
            <div style={{ background: 'rgba(255, 255, 255, 0.025)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', color: 'var(--cyan-main)', fontWeight: 600, fontSize: '0.85rem' }}>
                <Compass size={15} />
                <span>AI Geologist Diagnostic Synthesis</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {narrative}
              </p>
            </div>

            {/* SHAP Feature Contributions Bar Visualizer */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', marginBottom: '0.75rem' }}>
                Key Geospatial & Mineralogical Drivers (SHAP Lift vs Regional Sausar Baseline)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {attributions.slice(0, 6).map((feat) => {
                  const pct = feat.importance_pct || 0;
                  return (
                    <div key={feat.feature_id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {feat.feature_name}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
                            ({feat.category})
                          </span>
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: feat.is_positive ? 'var(--cyan-main)' : 'var(--rose-main)' }}>
                          {feat.is_positive ? `+${pct}%` : `${feat.shap_impact}`}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#0F172A', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, pct * 2.2)}%`,
                            background: feat.is_positive
                              ? 'linear-gradient(90deg, var(--cyan-main), var(--violet-main))'
                              : 'var(--rose-main)',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        Observed: {feat.observed_value} vs Baseline: {feat.baseline_value} &mdash; {feat.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {modalTab === 'stratigraphy' && (
          <BoreholeStratigraphy stratigraphy={stratigraphy} />
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--emerald-main)' }}>
            <ShieldCheck size={16} />
            <span>UNFC-1997 / CRIRSCO Reporting Standard Compliant</span>
          </div>

          <button
            className="btn-action-sm"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, var(--cyan-main), var(--violet-main))',
              color: '#030712',
              fontWeight: 800,
              boxShadow: '0 0 16px var(--cyan-glow)'
            }}
            onClick={() => onDownloadPdf(target.target_id)}
          >
            <Download size={15} />
            <span>Export Official Dossier PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
