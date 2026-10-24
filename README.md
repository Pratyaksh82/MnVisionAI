# MnVisionAI: Space-Intelligence Platform for Manganese Reserve Discovery

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/PS_ID-SIH26009-orange?style=for-the-badge)](https://sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-Ministry_of_Steel_/_MOIL_Limited-success?style=for-the-badge)](https://www.moil.nic.in)
[![Stack](https://img.shields.io/badge/Tech_Stack-FastAPI_•_React_•_Leaflet_•_Scikit--Learn-cyan?style=for-the-badge)](#)

---

## 🛰️ Overview

**MnVisionAI** is an end-to-end space-intelligence decision platform developed for **Smart India Hackathon (SIH 2026) Problem Statement SIH26009**:
> *"Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls"*  
> **Target Organization**: **MOIL Limited** (Largest Manganese Ore Producer in India) & **Ministry of Steel**.

The platform solves the two interconnected challenges defined in the problem statement:
1. **Subsurface Exploration & Reserve Identification**: Replaces slow, cost-prohibitive manual geological surveys with multi-sensor satellite Earth Observation (Sentinel-2, Landsat, ASTER, SRTM DEM), mineral spectroscopy, and Explainable AI (XAI) to detect and rank manganese deposit blind spots.
2. **Operational Shortfall Mitigation**: Predicts operational delays (monsoon pit flooding, heavy earth-moving equipment downtime, blasting regulatory cycles) to forecast ore production gaps and generate prescriptive scheduling actions.

---

## 🔬 Scientific Foundations & Methodology

```
                          ┌────────────────────────┐
                          │   Multi-Modal Inputs   │
                          └───────────┬────────────┘
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ Spectral Bands  │          │ Structural DEM  │          │   Lithology &   │
│ (Sentinel /     │          │  (SRTM 30m)     │          │ Known Deposits  │
│  Landsat/ASTER) │          │                 │          │  (GSI / MOIL)   │
└────────┬────────┘          └────────┬────────┘          └────────┬────────┘
         │                            │                            │
         ▼                            ▼                            ▼
• Hydrothermal Alteration     • Fault & Lineament Density  • Host rock proximity
• Iron Oxide: B4/B2 (S2)      • Topographic Wetness (TWI)    (e.g., Sausar Group,
• Mn-Absorption: ASTER SWIR   • Slope, Aspect & Ruggedness   Munsar Formation)
• Vegetation Mask: NDVI       • Synclinal fold axes        • Spatial Graph Distance
```

* **Target Study Region**: Focuses on the prolific **Sausar Manganese Belt** (Balaghat, Chhindwara in MP; Nagpur, Bhandara in Maharashtra) hosting premier MOIL deposits like **Balaghat (Bharweli)**, **Dongri Buzurg**, **Chikla**, **Tirodi**, and **Ukwa**.
* **Spectral Mineralogy**:
  * **Iron Oxide / Gossan Index**: $\frac{\text{Band 4}}{\text{Band 2}}$ (Sentinel-2)
  * **Hydrothermal / Clay Alteration**: $\frac{\text{Band 11}}{\text{Band 12}}$ (SWIR1/SWIR2 phyllosilicates)
  * **Manganese Absorption Proxy**: VNIR crystal field transition absorption troughs ($\sim 0.50\,\mu\text{m}$ and $0.85\,\mu\text{m}$) combined with SWIR reflectance contrast.
* **Structural Geology**:
  * Directional Sobel & Canny edge filtering along the ENE-WSW regional Sausar strike and NW-SE cross-faults to compute **Lineament Intersection Density**.
* **Machine Learning & XAI**:
  * **Positive-Unlabeled (PU) Bagging Ensemble**: XGBoost + Random Forest calibrated to handle unmined, unexplored terrain without false penalties.
  * **SHAP Explainability (XAI)**: Quantifies exact percentage contributions (e.g., $+42\%$ Lineament Density, $+28\%$ Hydrothermal Alteration) for every coordinate anomaly.

---

## ⚙️ Architecture & Features

### 1. Space Exploration GIS
* Interactive multi-layer raster map powered by Leaflet.
* Dynamic switching between AI Prospectivity Heatmap, Manganese Spectral Proxy, Hydrothermal Alteration, Lineament Density, and Topographic Elevation.
* Verified GSI/MOIL historical mine locations with depth and grade profiles.
* Ranked Diamond Core Drilling Target table with rig feasibility and slope metrics.

### 2. Explainable AI (XAI) Attribution Inspector
* Real-time SHAP waterfall attribution breakdown.
* Automated geological narrative for field geologists.
* Exploration standard operating procedure (SOP) recommendations according to UNFC norms.

### 3. MOIL Operations & Shortfall Forecaster
* Dynamic operational simulator accounting for:
  * Heavy Earth Moving Machinery (HEMM) availability % (Dumpers, Excavators, Hoists)
  * Precipitation / Monsoon severity (waterlogging and sump stress in mm)
  * Blasting clearance and regulatory turnaround times
* Shortfall attribution bar (Inundation vs Machinery Breakdown vs Blasting).
* Mine-by-mine target vs predicted production (Balaghat UG, Dongri Buzurg OC, Chikla UG, Tirodi OC, Ukwa UG).
* Prescriptive corrective directives with estimated recovery tonnages.

### 4. Target Dossier & PDF Generator
* One-click download of official **PDF Exploration Target Dossiers** with GPS center points, SHAP tables, and core drilling protocol.
* Batch export of drill coordinates in **GeoJSON** for QGIS, ArcGIS, or Google Earth.

### 5. Production Optimization & 3D Borehole Subsurface Logging
* **SciPy HiGHS Linear Programming Solver**: Solves real-time constrained shift rebalancing across MOIL mines (Balaghat, Dongri Buzurg, Chikla, Tirodi, Ukwa), cutting unmitigated shortfalls by ~45-60%.
* **Interactive 3D Borehole Strip Log**: Simulates diamond drill core intervals (NQ wireline 47.6mm) down to 90m+ with UNFC G-2 indicated pay seam assays (Mn%, Fe%, SiO2%, P%) and core recovery rates.
* **Live Telemetry Cursor HUD & Swipe Comparison**: Displays real-time GPS coordinates, elevation, and active index values under cursor, with interactive split-screen sliding between satellite imagery and mineral heatmaps.

---

## 🌐 1-Click Live Deployment to Render

MnVisionAI is configured for seamless deployment on [Render](https://render.com) using a unified fullstack web service or standard blueprint.

### Option A: Automatic Blueprint Deployment (`render.yaml`)
1. Push your repository to **GitHub** or **GitLab**.
2. In Render Dashboard, click **New +** &rarr; **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml`, builds the frontend (`npm run build`), installs backend dependencies, validates the test suite, and spins up the live service.

### Option B: Manual Web Service Deployment
1. Click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `mnvisionai`
   * **Runtime**: `Python 3`
   * **Build Command**: `./build.sh` (or `cd frontend && npm install && npm run build && cd .. && pip install -r requirements.txt`)
   * **Start Command**: `python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
   * **Plan**: Free
4. Click **Deploy Web Service**! Once deployed, navigate to `https://<your-app-name>.onrender.com/`.

---

## 🚀 Local Development Setup

### Prerequisites
* **Python 3.10+** (Python 3.14 verified)
* **Node.js 18+** & **npm**

### 1. Backend Setup & Startup
```powershell
# Create & activate virtual environment (if not already present)
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated test suite
pytest

# Start the FastAPI server
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation is available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Startup
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at: `http://127.0.0.1:5173/`

---

## 👥 Hackathon Team & Alignment with MOIL

* **Problem Statement**: SIH 2026 PS `SIH26009`
* **Beneficiary**: MOIL Limited (Miniratna Category-I PSU) & Ministry of Steel, Government of India.
* **License**: Open Source for SIH 2026 Evaluation.

