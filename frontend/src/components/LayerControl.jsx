import React from 'react';
import { Layers, Sliders, Eye, Mountain, Compass, Sparkles, MapPin, Radio, ShieldAlert } from 'lucide-react';

export default function LayerControl({
  activeLayer,
  setActiveLayer,
  opacity,
  setOpacity,
  threshold,
  setThreshold,
  showMines,
  setShowMines,
  onSelectRoiPreset
}) {
  const layers = [
    {
      id: 'prospectivity',
      name: 'AI Prospectivity Heatmap',
      tag: 'XGBoost + RF PU Ensemble',
      color: '#00F0FF',
      desc: 'Predictive probability of manganese ore occurrence'
    },
    {
      id: 'manganese_proxy',
      name: 'Manganese Spectral Proxy',
      tag: 'VNIR / SWIR Absorption Contrast',
      color: '#C084FC',
      desc: 'Absorption features characteristic of Pyrolusite and Braunite'
    },
    {
      id: 'hydrothermal_alteration',
      name: 'Hydrothermal / Clay Alteration',
      tag: 'Sentinel-2 B11/B12 Ratio',
      color: '#E5A93C',
      desc: 'Phyllosilicates and muscovite-schist alteration aureoles'
    },
    {
      id: 'lineament_density',
      name: 'Lineament & Fracture Density',
      tag: 'DEM Directional Multi-Angle Filter',
      color: '#F43F5E',
      desc: 'Shear zones and ENE-WSW conjugate fault networks'
    },
    {
      id: 'dem_elevation',
      name: 'Terrain Elevation Relief',
      tag: 'SRTM 30m Topographic Grid',
      color: '#34D399',
      desc: 'Topographic strike ridges and synclinal valley contours'
    }
  ];

  return (
    <aside className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Layers size={19} color="var(--cyan-main)" />
          <span>Space Multi-Layer Control</span>
        </div>
        <span className="telemetry-badge telemetry-cyan">
          5 Sensors
        </span>
      </div>

      {/* Layer Selection Items */}
      <div className="layer-group">
        {layers.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <div
              key={layer.id}
              className={`layer-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveLayer(layer.id)}
            >
              <div className="layer-info">
                <div
                  className="layer-color-dot"
                  style={{
                    backgroundColor: layer.color,
                    boxShadow: isActive ? `0 0 12px ${layer.color}` : `0 0 4px ${layer.color}`
                  }}
                />
                <div>
                  <div className="layer-name">{layer.name}</div>
                  <div className="layer-tag">{layer.tag}</div>
                </div>
              </div>
              <Eye size={15} color={isActive ? 'var(--cyan-main)' : 'var(--text-dim)'} />
            </div>
          );
        })}
      </div>

      {/* Historical MOIL Mines Toggle */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '0.75rem 0.95rem'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⛏️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#FFF' }}>Historical MOIL Mines</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>8 GSI Verified Ground Deposits</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={showMines}
            onChange={(e) => setShowMines(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: 'var(--cyan-main)',
              cursor: 'pointer'
            }}
          />
        </label>
      </div>

      {/* Precision Sliders */}
      <div className="slider-container">
        <div className="slider-label">
          <span>Raster Layer Opacity</span>
          <span style={{ color: 'var(--cyan-main)', fontFamily: 'var(--font-mono)' }}>
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.2"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="custom-slider"
        />
      </div>

      <div className="slider-container">
        <div className="slider-label">
          <span>AI Prospectivity Anomaly Cutoff</span>
          <span style={{ color: 'var(--emerald-main)', fontFamily: 'var(--font-mono)' }}>
            &ge; {Math.round(threshold * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.50"
          max="0.90"
          step="0.02"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="custom-slider"
        />
      </div>

      {/* Exploration Concession Presets */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          EXPLORATION CONCESSION PRESETS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <button
            className="map-btn"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.55rem 0.85rem' }}
            onClick={() => onSelectRoiPreset('balaghat_corridor')}
          >
            <Compass size={14} color="var(--cyan-main)" />
            <span>Balaghat-Bharweli Structural Axis</span>
          </button>
          <button
            className="map-btn"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.55rem 0.85rem' }}
            onClick={() => onSelectRoiPreset('dongri_chikla')}
          >
            <Sparkles size={14} color="var(--violet-bright)" />
            <span>Dongri Buzurg-Chikla Fold Belt</span>
          </button>
          <button
            className="map-btn"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.55rem 0.85rem' }}
            onClick={() => onSelectRoiPreset('ukwa_extension')}
          >
            <Mountain size={14} color="var(--amber-main)" />
            <span>Ukwa Synclinal Extension</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
