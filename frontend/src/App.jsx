import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LayerControl from './components/LayerControl';
import MapViewer from './components/MapViewer';
import TargetRankTable from './components/TargetRankTable';
import XaiModal from './components/XaiModal';
import ProductionForecaster from './components/ProductionForecaster';
import DossierExportView from './components/DossierExportView';
import { API_BASE } from './config';
import { ShieldCheck, Sparkles, MapPin, Compass } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');

  // Geospatial Map State
  const [activeLayer, setActiveLayer] = useState('prospectivity');
  const [opacity, setOpacity] = useState(0.85);
  const [threshold, setThreshold] = useState(0.65);
  const [showMines, setShowMines] = useState(true);

  // Data State from Backend API
  const [gridData, setGridData] = useState(null);
  const [targets, setTargets] = useState([]);
  const [knownMines, setKnownMines] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [roiAnalysis, setRoiAnalysis] = useState(null);

  // XAI Modal State
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loadingXai, setLoadingXai] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch study area & known mines
        const resArea = await fetch(`${API_BASE}/api/study-area`);
        if (resArea.ok) {
          const areaData = await resArea.json();
          setKnownMines(areaData.known_mines || []);
        }

        // 2. Fetch prospectivity grid
        const resGrid = await fetch(`${API_BASE}/api/prospectivity/grid?downsample=2`);
        if (resGrid.ok) {
          const gData = await resGrid.json();
          setGridData(gData);
        }

        // 3. Fetch drill targets
        const resTargets = await fetch(`${API_BASE}/api/drill-targets?min_prospectivity=0.65&top_k=8`);
        if (resTargets.ok) {
          const tData = await resTargets.json();
          setTargets(tData.targets || []);
        }
      } catch (err) {
        console.error('Failed to connect to MnVisionAI backend', err);
      }
    };

    fetchData();
  }, []);

  // Handle Target Selection & Fetch SHAP XAI Explanation
  const handleSelectTarget = async (target) => {
    setSelectedTarget(target);
    setLoadingXai(true);
    try {
      const res = await fetch(`${API_BASE}/api/explain-target/${target.target_id}`);
      if (res.ok) {
        const data = await res.json();
        setExplanation(data.explanation);
      }
    } catch (err) {
      console.error('Failed to fetch XAI explanation', err);
    } finally {
      setLoadingXai(false);
    }
  };

  // Download PDF Dossier
  const handleDownloadPdf = (targetId) => {
    window.open(`${API_BASE}/api/reports/download-dossier/${targetId}`, '_blank');
  };

  // Preset ROI Bounding Box Zooming & On-the-Fly Reserve Analysis
  const handleSelectRoiPreset = async (presetKey) => {
    let bounds = null;
    let roiReq = null;

    if (presetKey === 'balaghat_corridor') {
      bounds = [[21.75, 80.05], [21.95, 80.35]];
      roiReq = { min_lat: 21.75, max_lat: 21.95, min_lon: 80.05, max_lon: 80.35, name: "Balaghat-Bharweli Structural Axis" };
    } else if (presetKey === 'dongri_chikla') {
      bounds = [[21.48, 79.60], [21.65, 79.80]];
      roiReq = { min_lat: 21.48, max_lat: 21.65, min_lon: 79.60, max_lon: 79.80, name: "Dongri Buzurg-Chikla Fold Belt" };
    } else if (presetKey === 'ukwa_extension') {
      bounds = [[21.88, 80.35], [22.05, 80.55]];
      roiReq = { min_lat: 21.88, max_lat: 22.05, min_lon: 80.35, max_lon: 80.55, name: "Ukwa Synclinal Extension" };
    }

    if (bounds) {
      setMapBounds(bounds);
    }

    if (roiReq) {
      try {
        const res = await fetch(`${API_BASE}/api/analyze-roi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roiReq)
        });
        if (res.ok) {
          const data = await res.json();
          setRoiAnalysis(data);
        }
      } catch (e) {
        console.error('Failed to run ROI analysis', e);
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetCount={targets.length}
      />

      <main className="main-viewport">
        {activeTab === 'explorer' && (
          <div className="explorer-grid">
            {/* Left Control Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <LayerControl
                activeLayer={activeLayer}
                setActiveLayer={setActiveLayer}
                opacity={opacity}
                setOpacity={setOpacity}
                threshold={threshold}
                setThreshold={setThreshold}
                showMines={showMines}
                setShowMines={setShowMines}
                onSelectRoiPreset={handleSelectRoiPreset}
              />

              {/* Concession ROI Intelligence Card if evaluated */}
              {roiAnalysis && (
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border-glow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-main)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Compass size={15} />
                      <span>{roiAnalysis.roi_name}</span>
                    </div>
                    <button
                      onClick={() => setRoiAnalysis(null)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      &times;
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Concession Area</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
                        {roiAnalysis.area_sq_km} km²
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Peak Anomaly</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--cyan-main)', fontFamily: 'var(--font-mono)' }}>
                        {Math.round(roiAnalysis.peak_prospectivity * 100)}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--emerald-main)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={14} />
                    <span>In-Situ Potential: ~{(roiAnalysis.estimated_in_situ_resource_mt || 0).toLocaleString()} MT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Map Workspace & Targets Split */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ flex: '1 1 60%', minHeight: '380px' }}>
                <MapViewer
                  gridData={gridData}
                  activeLayer={activeLayer}
                  opacity={opacity}
                  threshold={threshold}
                  targets={targets}
                  knownMines={showMines ? knownMines : []}
                  selectedTarget={selectedTarget}
                  onSelectTarget={handleSelectTarget}
                  mapBounds={mapBounds}
                />
              </div>

              <div style={{ flex: '0 0 auto' }}>
                <TargetRankTable
                  targets={targets}
                  selectedTarget={selectedTarget}
                  onSelectTarget={handleSelectTarget}
                  onDownloadPdf={handleDownloadPdf}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <ProductionForecaster />
        )}

        {activeTab === 'dossiers' && (
          <DossierExportView
            targets={targets}
            onDownloadPdf={handleDownloadPdf}
          />
        )}
      </main>

      {/* Explainable AI Modal with 3D Borehole Stratigraphy */}
      {selectedTarget && explanation && (
        <XaiModal
          target={selectedTarget}
          explanation={explanation}
          onClose={() => {
            setSelectedTarget(null);
            setExplanation(null);
          }}
          onDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
}
