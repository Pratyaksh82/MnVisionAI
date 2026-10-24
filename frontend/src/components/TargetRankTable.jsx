import React from 'react';
import { Target, Download, HelpCircle, ArrowUpRight, CheckCircle2, Drill } from 'lucide-react';

export default function TargetRankTable({
  targets = [],
  selectedTarget,
  onSelectTarget,
  onDownloadPdf
}) {
  const getRankBadgeStyle = (rank) => {
    if (rank === 1) {
      return {
        background: 'linear-gradient(135deg, #FFF176 0%, #E5A93C 55%, #B45309 100%)',
        color: '#030712',
        border: '1px solid #FFE082',
        boxShadow: '0 0 16px rgba(229, 169, 60, 0.65)',
        fontWeight: 900
      };
    }
    if (rank === 2) {
      return {
        background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 55%, #64748B 100%)',
        color: '#030712',
        border: '1px solid #FFFFFF',
        boxShadow: '0 0 14px rgba(226, 232, 240, 0.5)',
        fontWeight: 900
      };
    }
    if (rank === 3) {
      return {
        background: 'linear-gradient(135deg, #FDE68A 0%, #D97706 55%, #78350F 100%)',
        color: '#030712',
        border: '1px solid #FCD34D',
        boxShadow: '0 0 14px rgba(217, 119, 6, 0.5)',
        fontWeight: 900
      };
    }
    return {
      background: 'rgba(0, 240, 255, 0.12)',
      color: '#00F0FF',
      border: '1px solid rgba(0, 240, 255, 0.35)',
      boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
    };
  };

  return (
    <div className="targets-panel">
      <div className="panel-header" style={{ padding: '0.85rem 1.25rem', background: 'rgba(6, 11, 24, 0.7)' }}>
        <div className="panel-title">
          <Target size={19} color="var(--cyan-main)" />
          <span>Prioritized Diamond Core Drill Targets (Ranked by AI & Rig Feasibility)</span>
        </div>
        <div className="telemetry-badge telemetry-cyan">
          {targets.length} Identified Candidates
        </div>
      </div>

      <div className="targets-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Rank</th>
              <th>Target ID</th>
              <th>GPS Coordinates</th>
              <th>AI Prospectivity</th>
              <th>Confidence</th>
              <th>Target Depth</th>
              <th>Rig Access & Slope</th>
              <th>Recommended Action</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((tgt, index) => {
              const isSelected = selectedTarget?.target_id === tgt.target_id;
              const probPct = Math.round(tgt.prospectivity_score * 100);
              const confPct = Math.round(tgt.confidence_score * 100);
              const rank = index + 1;

              return (
                <tr
                  key={tgt.target_id}
                  style={{
                    backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectTarget(tgt)}
                >
                  <td>
                    <span
                      style={{
                        ...getRankBadgeStyle(rank),
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '0.78rem'
                      }}
                    >
                      #{rank}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFF' }}>
                    {tgt.target_id}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {tgt.latitude}°N, {tgt.longitude}°E
                  </td>
                  <td>
                    <span className={`score-badge ${probPct >= 80 ? 'score-high' : 'score-med'}`}>
                      {probPct}% Match
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-bright)' }}>
                    {confPct}%
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {tgt.estimated_depth_tier}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: tgt.terrain_slope_deg < 15 ? 'var(--emerald-main)' : 'var(--amber-main)', fontWeight: 600 }}>
                      {tgt.rig_accessibility}
                    </span> ({tgt.terrain_slope_deg}°)
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {tgt.recommended_action}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.45rem' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-action-sm"
                        onClick={() => onSelectTarget(tgt)}
                        title="View Explainable AI (SHAP) & 3D Core Log"
                      >
                        <Drill size={13} />
                        <span>XAI & Log</span>
                      </button>
                      <button
                        className="btn-action-sm"
                        style={{
                          background: 'rgba(0, 245, 160, 0.14)',
                          color: 'var(--emerald-main)',
                          borderColor: 'rgba(0, 245, 160, 0.35)'
                        }}
                        onClick={() => onDownloadPdf(tgt.target_id)}
                        title="Download Official Exploration Dossier PDF"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
