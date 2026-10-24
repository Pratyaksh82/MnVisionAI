import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Target, Pickaxe, MapPin, ZoomIn, Eye, Sparkles, SlidersHorizontal, Compass, Layers, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../config';

// Map controller to smoothly fly to bounds or center coordinates
function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { duration: 1.2, padding: [30, 30] });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Live Mouse Telemetry Hook
function CursorTelemetryTracker({ onTelemetryUpdate, gridData, activeLayer }) {
  useMapEvents({
    mousemove(e) {
      const { lat, lng } = e.latlng;
      if (gridData && gridData.bounds) {
        const b = gridData.bounds;
        if (lat >= b.min_lat && lat <= b.max_lat && lng >= b.min_lon && lng <= b.max_lon) {
          const r = Math.max(0, Math.min(gridData.rows - 1, Math.floor(((b.max_lat - lat) / (b.max_lat - b.min_lat)) * gridData.rows)));
          const c = Math.max(0, Math.min(gridData.cols - 1, Math.floor(((lng - b.min_lon) / (b.max_lon - b.min_lon)) * gridData.cols)));
          const matrix = gridData.layers[activeLayer] || gridData.layers['prospectivity'];
          const val = matrix && matrix[r] ? matrix[r][c] : 0.0;
          const elev = gridData.layers['dem_elevation'] && gridData.layers['dem_elevation'][r]
            ? Math.round(gridData.layers['dem_elevation'][r][c])
            : 410;

          // Estimate lithology based on Sausar regional strike axis
          const formation = (lat > 21.65 && lat < 21.95 && lng > 79.5 && lng < 80.4)
            ? "Munsar Formation (Gondite & Braunite)"
            : (lat >= 21.95 ? "Ukwa-Bharweli Quartzite Horizon" : "Chorbaoli-Bichua Calc-Silicate");

          onTelemetryUpdate({
            lat: lat.toFixed(4),
            lng: lng.toFixed(4),
            val: Math.round(val * 100),
            elevation: elev,
            formation,
            inBounds: true
          });
          return;
        }
      }
      onTelemetryUpdate({
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
        val: null,
        elevation: null,
        formation: "Central Indian Tectonic Zone",
        inBounds: false
      });
    }
  });
  return null;
}

// Color ramp for multi-spectral raster layers
function getColorForValue(val, layerId) {
  const v = Math.max(0, Math.min(1, val));

  if (layerId === 'prospectivity') {
    // High-contrast Prospectivity Ramp: Cyber Indigo -> Neon Cyan -> Gold Topaz -> Crimson Peak
    if (v < 0.28) return [11, 18, 33, Math.floor(v * 160)];
    if (v < 0.58) return [0, 242, 254, Math.floor(v * 210)]; // Neon Cyan
    if (v < 0.80) return [245, 158, 11, Math.floor(v * 230)]; // Gold Amber
    return [244, 63, 94, 245]; // Crimson High-grade Hotspot
  } else if (layerId === 'manganese_proxy') {
    return [168, 85, 247, Math.floor(v * 220)]; // Manganese Purple
  } else if (layerId === 'hydrothermal_alteration') {
    return [245, 158, 11, Math.floor(v * 220)]; // Clay Amber
  } else if (layerId === 'lineament_density') {
    return [236, 72, 153, Math.floor(v * 225)]; // Fracture Magenta
  } else {
    return [16, 185, 129, Math.floor(v * 200)]; // SRTM Emerald
  }
}

export default function MapViewer({
  gridData,
  activeLayer,
  opacity,
  threshold,
  targets = [],
  knownMines = [],
  selectedTarget,
  onSelectTarget,
  mapBounds
}) {
  const [overlayUrl, setOverlayUrl] = useState(null);
  const [basemap, setBasemap] = useState('satellite'); // 'satellite', 'dark', or 'topo'
  const [isSwipeMode, setIsSwipeMode] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage 0 - 100
  const [telemetry, setTelemetry] = useState({
    lat: "21.8672",
    lng: "80.2001",
    val: 88,
    elevation: 435,
    formation: "Munsar Formation (Gondite & Braunite)",
    inBounds: true
  });
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const mapWrapperRef = useRef(null);

  // Build client-side canvas raster overlay
  useEffect(() => {
    if (!gridData || !gridData.layers || !gridData.layers[activeLayer]) return;

    const layerMatrix = gridData.layers[activeLayer];
    const rows = layerMatrix.length;
    const cols = layerMatrix[0].length;

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(cols, rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = layerMatrix[r][c];
        const idx = (r * cols + c) * 4;

        if (activeLayer === 'prospectivity' && val < threshold) {
          imgData.data[idx + 3] = 0;
          continue;
        }

        const [red, green, blue, alpha] = getColorForValue(val, activeLayer);
        imgData.data[idx] = red;
        imgData.data[idx + 1] = green;
        imgData.data[idx + 2] = blue;
        imgData.data[idx + 3] = Math.floor(alpha * opacity);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setOverlayUrl(canvas.toDataURL());
  }, [gridData, activeLayer, opacity, threshold]);

  const defaultCenter = [21.70, 79.85];
  const defaultZoom = 9;

  const rasterBounds = gridData?.bounds
    ? [
        [gridData.bounds.min_lat, gridData.bounds.min_lon],
        [gridData.bounds.max_lat, gridData.bounds.max_lon]
      ]
    : [
        [21.30, 79.10],
        [22.10, 80.60]
      ];

  // Drag handler for Split-Screen Comparison
  const handleMouseMove = useCallback((e) => {
    if (!isDraggingSlider || !mapWrapperRef.current) return;
    const rect = mapWrapperRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setSplitPos(Math.round((x / rect.width) * 100));
  }, [isDraggingSlider]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingSlider(false);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingSlider, handleMouseMove, handleMouseUp]);

  // Pulsating icon for ranked drill targets
  // Sophisticated Metallic Marker Generators
  const createTargetIcon = (target, index) => {
    const isSelected = selectedTarget?.target_id === target.target_id;
    const isGold = index === 0;
    const isSilver = index === 1;
    const isBronze = index === 2;

    let markerBg = 'linear-gradient(135deg, #00F0FF, #0284C7)';
    let markerColor = '#030712';
    let ringColor = 'rgba(0, 240, 255, 0.4)';
    let glowBox = '0 0 16px rgba(0, 240, 255, 0.6)';

    if (isSelected) {
      markerBg = 'linear-gradient(135deg, #FFF, #00F0FF)';
      ringColor = 'rgba(255, 255, 255, 0.7)';
      glowBox = '0 0 24px #00F0FF';
    } else if (isGold) {
      markerBg = 'linear-gradient(135deg, #FFF176, #F59E0B, #B45309)';
      ringColor = 'rgba(245, 158, 11, 0.5)';
      glowBox = '0 0 18px rgba(245, 158, 11, 0.7)';
    } else if (isSilver) {
      markerBg = 'linear-gradient(135deg, #FFFFFF, #CBD5E1, #64748B)';
      ringColor = 'rgba(226, 232, 240, 0.4)';
      glowBox = '0 0 16px rgba(226, 232, 240, 0.5)';
    } else if (isBronze) {
      markerBg = 'linear-gradient(135deg, #FDE68A, #D97706, #78350F)';
      ringColor = 'rgba(217, 119, 6, 0.4)';
      glowBox = '0 0 16px rgba(217, 119, 6, 0.5)';
    }

    return L.divIcon({
      className: 'custom-target-marker',
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${ringColor};
            animation: pulse-ring 2s infinite ease-in-out;
          "></div>
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${markerBg};
            border: 2px solid ${isGold ? '#FFE082' : '#FFFFFF'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 900;
            color: ${markerColor};
            box-shadow: ${glowBox};
            font-family: 'JetBrains Mono', monospace;
          ">
            #${index + 1}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  // Icon for verified MOIL operating mines
  const createMineIcon = (mine) => {
    return L.divIcon({
      className: 'custom-mine-marker',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0A0F1D, #162038);
          border: 1.5px solid #E5A93C;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(229, 169, 60, 0.6), inset 0 1px 0 rgba(255,255,255,0.2);
          cursor: pointer;
        ">
          <span style="font-size: 14px; filter: drop-shadow(0 0 4px rgba(229, 169, 60, 0.8));">⛏️</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="map-workspace">
      <div className="map-wrapper" ref={mapWrapperRef}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%', background: '#020408' }}
          zoomControl={false}
        >
          <MapController center={defaultCenter} zoom={defaultZoom} bounds={mapBounds} />
          <CursorTelemetryTracker
            onTelemetryUpdate={setTelemetry}
            gridData={gridData}
            activeLayer={activeLayer}
          />

          {/* Underneath Basemap Tile Layers (Zero Watermarks) */}
          {basemap === 'satellite' && (
            <TileLayer
              attribution='&copy; Esri &bull; High-Resolution Orbital Earth Observation'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {basemap === 'dark' && (
            <TileLayer
              attribution='&copy; Esri &bull; Precision Dark Gray Geodetic Grid'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {basemap === 'topo' && (
            <TileLayer
              attribution='&copy; Esri &bull; USGS Shaded Relief & Geomorphology'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {/* Multi-spectral / Prospectivity Raster Image Overlay */}
          {overlayUrl && (
            <div style={isSwipeMode ? { clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` } : {}}>
              <ImageOverlay
                url={overlayUrl}
                bounds={rasterBounds}
                opacity={opacity}
                zIndex={400}
              />
            </div>
          )}

          {/* Known Historical MOIL Mines & Deposits */}
          {knownMines.map((mine) => (
            <Marker
              key={mine.id}
              position={[mine.lat, mine.lon]}
              icon={createMineIcon(mine)}
            >
              <Popup>
                <div style={{ color: '#F1F5F9', background: '#070C1A', padding: '10px', borderRadius: '12px', border: '1px solid rgba(229, 169, 60, 0.4)', minWidth: '240px', boxShadow: '0 12px 32px rgba(0,0,0,0.8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⛏️</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#FFF' }}>
                        {mine.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {mine.district} &bull; {mine.operator}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', marginTop: '8px', lineHeight: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div><strong style={{ color: '#E5A93C' }}>Stratum:</strong> {mine.formation}</div>
                    <div><strong style={{ color: '#E5A93C' }}>Reserves:</strong> {mine.reserves_mt} MT @ {mine.avg_grade_mn_pct}% Mn</div>
                    <div><strong style={{ color: '#E5A93C' }}>Status:</strong> {mine.status} (Depth: {mine.depth_meters}m)</div>
                    <div><strong style={{ color: '#E5A93C' }}>Significance:</strong> {mine.significance}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* AI Identified Drill Targets */}
          {targets.map((tgt, idx) => (
            <Marker
              key={tgt.target_id}
              position={[tgt.latitude, tgt.longitude]}
              icon={createTargetIcon(tgt, idx)}
              eventHandlers={{
                click: () => onSelectTarget(tgt)
              }}
            >
              <Popup>
                <div style={{ color: '#F1F5F9', background: '#070C1A', padding: '12px', borderRadius: '14px', border: '1px solid rgba(0, 240, 255, 0.4)', minWidth: '250px', boxShadow: '0 16px 40px rgba(0,0,0,0.85)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '0.98rem', color: '#FFF', fontFamily: 'JetBrains Mono' }}>{tgt.target_id}</strong>
                    <span style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.35))',
                      color: '#34D399',
                      fontSize: '0.74rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      border: '1px solid rgba(52, 211, 153, 0.5)'
                    }}>
                      {Math.round(tgt.prospectivity_score * 100)}% Match
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '8px', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                    <div><strong>GPS:</strong> <span style={{ fontFamily: 'JetBrains Mono' }}>{tgt.latitude}°N, {tgt.longitude}°E</span></div>
                    <div><strong>Horizon:</strong> {tgt.estimated_depth_tier}</div>
                    <div><strong>Terrain Slope:</strong> {tgt.terrain_slope_deg}° ({tgt.rig_accessibility})</div>
                    <div><strong>Directive:</strong> {tgt.recommended_action}</div>
                  </div>
                  <button
                    onClick={() => onSelectTarget(tgt)}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      background: 'linear-gradient(135deg, #00F0FF, #0284C7)',
                      color: '#030712',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
                      letterSpacing: '0.3px',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    Inspect XAI & 3D Borehole Log &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Swipe / Split-Screen Draggable Divider */}
        {isSwipeMode && (
          <div className="swipe-container">
            <span className="swipe-badge" style={{ left: '1rem' }}>
              &larr; AI Mineral Heatmap ({activeLayer.replace('_', ' ')})
            </span>
            <span className="swipe-badge" style={{ right: '1rem' }}>
              Sentinel-2 Satellite Surface &rarr;
            </span>

            <div
              className="swipe-divider"
              style={{ left: `${splitPos}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingSlider(true);
              }}
            >
              <div className="swipe-handle">
                <SlidersHorizontal size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Map Floating Control Toolbar (High-End Basemap Switcher) */}
        <div className="map-floating-bar">
          <div className="basemap-segmented">
            <button
              className={`basemap-seg-btn ${basemap === 'satellite' ? 'active' : ''}`}
              onClick={() => {
                setBasemap('satellite');
                setIsSwipeMode(false);
              }}
              title="Orbital Multispectral Satellite (High-Res Earth Observation)"
            >
              🛰️ Satellite
            </button>
            <button
              className={`basemap-seg-btn ${basemap === 'dark' ? 'active' : ''}`}
              onClick={() => {
                setBasemap('dark');
                setIsSwipeMode(false);
              }}
              title="Precision Dark Geodetic Canvas"
            >
              🌑 Dark Grid
            </button>
            <button
              className={`basemap-seg-btn ${basemap === 'topo' ? 'active' : ''}`}
              onClick={() => {
                setBasemap('topo');
                setIsSwipeMode(false);
              }}
              title="Topographic Geomorphological Relief"
            >
              🏔️ Topo
            </button>
          </div>

          <button
            className={`map-btn ${isSwipeMode ? 'active' : ''}`}
            onClick={() => {
              setIsSwipeMode(!isSwipeMode);
              if (!isSwipeMode) setBasemap('satellite');
            }}
            title="Draggable Split-Screen comparison between Satellite surface and AI Heatmap"
          >
            <SlidersHorizontal size={13} />
            <span>{isSwipeMode ? 'Exit Swipe' : 'Swipe Compare'}</span>
          </button>
        </div>

        {/* Live Telemetry Cursor HUD */}
        <div className="telemetry-hud">
          <div className="hud-metric">
            <span className="hud-metric-label">GPS Coordinate</span>
            <span className="hud-metric-value">{telemetry.lat}°N, {telemetry.lng}°E</span>
          </div>

          <div className="hud-metric">
            <span className="hud-metric-label">SRTM Elevation</span>
            <span className="hud-metric-value" style={{ color: 'var(--emerald-main)' }}>
              {telemetry.elevation ? `${telemetry.elevation}m` : '---'}
            </span>
          </div>

          <div className="hud-metric">
            <span className="hud-metric-label">{activeLayer.replace('_', ' ')} Index</span>
            <span className="hud-metric-value" style={{ color: 'var(--cyan-main)' }}>
              {telemetry.val !== null ? `${telemetry.val}%` : '---'}
            </span>
          </div>

          <div className="hud-metric" style={{ maxWidth: '200px' }}>
            <span className="hud-metric-label">Geological Stratum</span>
            <span className="hud-metric-value" style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {telemetry.formation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
