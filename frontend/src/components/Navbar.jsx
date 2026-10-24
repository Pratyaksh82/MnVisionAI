import React from 'react';
import { Satellite, Compass, Activity, FileSpreadsheet, ShieldCheck, Sparkles, Radio, Award } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, targetCount = 0 }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <div className="brand-orbit-ring"></div>
          <Satellite size={22} color="#FFF" style={{ zIndex: 2 }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="brand-title">MnVisionAI</h1>
            <span className="brand-badge-gold">
              <Award size={11} style={{ marginRight: '3px' }} />
              MOIL &bull; MINISTRY OF STEEL
            </span>
          </div>
          <p className="brand-subtitle">
            Autonomous Space-Intelligence &bull; Subsurface Manganese Anomaly Platform
          </p>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <Compass size={16} />
          <span>Space Exploration GIS</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => setActiveTab('operations')}
        >
          <Activity size={16} />
          <span>MOIL Operations & Shortfalls</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dossiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('dossiers')}
        >
          <FileSpreadsheet size={16} />
          <span>Drill Targets & Reports</span>
        </button>
      </nav>

      <div className="nav-status">
        <div className="live-indicator">
          <div className="pulse-dot-radar"></div>
          <span>Sentinel-2 Orbit Locked</span>
        </div>

        <div className="telemetry-badge telemetry-gold">
          <ShieldCheck size={12} />
          <span>UNFC G-2 Validated</span>
        </div>

        <div className="telemetry-badge telemetry-cyan">
          <Radio size={12} />
          <span>{targetCount} Drill Targets</span>
        </div>
      </div>
    </header>
  );
}

