import React from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2, Shield, MapPin, Compass, Drill, Sparkles } from 'lucide-react';

export default function DossierExportView({ targets = [], onDownloadPdf }) {
  const downloadGeoJson = () => {
    const geojson = {
      type: "FeatureCollection",
      features: targets.map(t => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [t.longitude, t.latitude]
        },
        properties: {
          target_id: t.target_id,
          prospectivity_score: t.prospectivity_score,
          confidence_score: t.confidence_score,
          depth_tier: t.estimated_depth_tier,
          slope_deg: t.terrain_slope_deg,
          rig_access: t.rig_accessibility,
          recommended_action: t.recommended_action
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MnVisionAI_Sausar_Drill_Targets.geojson";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="operations-container">
      {/* Title & Vector Export Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--cyan-main), var(--violet-main))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--cyan-glow)'
            }}>
              <FileSpreadsheet size={20} color="#020408" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#FFF' }}>
              Exploration Target Dossiers & Drill Recommendations
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Official exploration dossiers, UNFC G-2 drill plans, and GIS vector exports formatted for QGIS, ArcGIS, and field deployment.
          </p>
        </div>

        <button
          className="map-btn"
          style={{
            background: 'linear-gradient(135deg, var(--gold-main), #D97706)',
            color: '#03050c',
            fontWeight: 800,
            boxShadow: '0 0 20px rgba(229, 169, 60, 0.4)',
            border: '1px solid #FFE082'
          }}
          onClick={downloadGeoJson}
        >
          <Download size={14} />
          <span>Export All Targets as GeoJSON</span>
        </button>
      </div>

      {/* Target Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.45rem' }}>
        {targets.map((tgt, idx) => {
          const isGold = idx === 0;
          const isSilver = idx === 1;
          const isBronze = idx === 2;

          let badgeBg = 'linear-gradient(135deg, #00F0FF, #0284C7)';
          let badgeBorder = 'rgba(0, 240, 255, 0.4)';
          let badgeGlow = '0 0 12px rgba(0, 240, 255, 0.3)';

          if (isGold) {
            badgeBg = 'linear-gradient(135deg, #FFF176 0%, #E5A93C 55%, #B45309 100%)';
            badgeBorder = '#FFE082';
            badgeGlow = '0 0 18px rgba(229, 169, 60, 0.6)';
          } else if (isSilver) {
            badgeBg = 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 55%, #64748B 100%)';
            badgeBorder = '#FFFFFF';
            badgeGlow = '0 0 14px rgba(226, 232, 240, 0.5)';
          } else if (isBronze) {
            badgeBg = 'linear-gradient(135deg, #FDE68A 0%, #D97706 55%, #78350F 100%)';
            badgeBorder = '#FCD34D';
            badgeGlow = '0 0 14px rgba(217, 119, 6, 0.5)';
          }

          return (
            <div
              key={tgt.target_id}
              className="glass-panel"
              style={{
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                position: 'relative',
                overflow: 'hidden',
                borderColor: isGold ? 'rgba(229, 169, 60, 0.45)' : 'var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: badgeBg,
                    color: '#03050c',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${badgeBorder}`,
                    boxShadow: badgeGlow,
                    fontFamily: 'JetBrains Mono'
                  }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFF', fontFamily: 'var(--font-heading)' }}>
                      {tgt.target_id}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Priority Score: {tgt.priority_rank_score}/1.0
                    </div>
                  </div>
                </div>

                <span className="score-badge score-high">
                  {Math.round(tgt.prospectivity_score * 100)}% Match
                </span>
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.025)',
                padding: '0.95rem',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                lineHeight: 1.65
              }}>
                <div><strong>GPS Coordinates:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-bright)' }}>{tgt.latitude}°N, {tgt.longitude}°E</span></div>
                <div><strong>Target Stratum:</strong> {tgt.estimated_depth_tier}</div>
                <div><strong>Rig Access & Terrain:</strong> <span style={{ color: tgt.terrain_slope_deg < 15 ? 'var(--emerald-main)' : 'var(--amber-main)', fontWeight: 600 }}>{tgt.rig_accessibility}</span> ({tgt.terrain_slope_deg}° slope)</div>
                <div><strong>Estimated Seam Area:</strong> {tgt.cluster_area_sq_km} km² anomaly cluster</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.95rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} />
                  <span>{tgt.recommended_action}</span>
                </span>

                <button
                  className="btn-action-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-main), #D97706)',
                    color: '#03050c',
                    fontWeight: 800,
                    boxShadow: '0 0 16px rgba(229, 169, 60, 0.4)',
                    border: '1px solid #FFE082'
                  }}
                  onClick={() => onDownloadPdf(tgt.target_id)}
                >
                  <Download size={13} />
                  <span>PDF Dossier</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>


      {/* Field Exploration Protocol SOP Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', gap: '1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Shield size={20} color="var(--emerald-main)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFF' }}>
            Exploration Standard Operating Procedure (GSI & UNFC-1997 Norms)
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Field deployment teams operating under MOIL exploration concession leases must adhere to the following 4-phase verification protocol:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--cyan-main)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '4px' }}>
              PHASE 01 &bull; GROUND GEOPHYSICS
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Lay out a 100m x 50m ground proton-precession magnetometer and radiometric survey over the anomaly center to identify gonditic magnetic dipoles.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--violet-bright)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '4px' }}>
              PHASE 02 &bull; RIG MOBILIZATION
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Mobilize skid-mounted wireline NQ diamond core drill rig. Establish mud sumps and secure environmental clearances with local forest divisions.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--amber-main)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '4px' }}>
              PHASE 03 &bull; INCLINED CORING
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Drill inclined borehole at 60° inclination towards 160° SSE azimuth perpendicular to the ENE Sausar strike to intersect the bedded braunite horizon.
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--emerald-main)', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '4px' }}>
              PHASE 04 &bull; XRF ASSAY LOGGING
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Perform split-core XRF portable spectrometer logging at 0.5m sample intervals. Quantify Mn, Fe, SiO₂, and P to confirm metallurgical ore grade.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
