"""
Generates the comprehensive technical documentation PDF for MnVisionAI.
Covers project overview, scientific foundations, system architecture,
code structure, pipeline mechanics, API specs, and evaluation advantages.
"""

from fpdf import FPDF
from datetime import datetime
import os

def clean(text: str) -> str:
    """Sanitizes unicode to ASCII / Latin-1 for standard FPDF core fonts."""
    if not isinstance(text, str):
        text = str(text)
    replacements = {
        '—': '-',
        '–': '-',
        '°': ' deg',
        '²': '2',
        '³': '3',
        '‘': "'",
        '’': "'",
        '“': '"',
        '”': '"',
        '•': '*',
        '…': '...',
        '≥': '>=',
        '≤': '<=',
        '→': '->',
        '≈': '~',
        'µ': 'u',
        '±': '+/-'
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text.encode('latin-1', 'replace').decode('latin-1')

class DocumentationPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return # Cover page has custom layout
        self.set_fill_color(15, 23, 42) # Slate dark header
        self.rect(0, 0, 210, 16, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 7, clean('MnVisionAI | Space-Intelligence Platform for Manganese Reserve Discovery'), 0, 1, 'L')
        self.set_font('Helvetica', 'I', 7)
        self.set_text_color(148, 163, 184)
        self.cell(0, 4, clean('SIH 2026 Problem Statement SIH26009 | MOIL Limited & Ministry of Steel'), 0, 1, 'L')
        self.ln(6)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(100, 10, clean('CONFIDENTIAL & PROPRIETARY | SIH 2026 TECHNICAL DOSSIER'), 0, 0, 'L')
        self.cell(90, 10, clean(f'Page {self.page_no()}'), 0, 0, 'R')

    def chapter_title(self, num: int, title: str):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(15, 23, 42)
        self.set_fill_color(241, 245, 249)
        self.cell(0, 8, clean(f'  {num}. {title}'), 0, 1, 'L', True)
        self.ln(3)

    def section_heading(self, title: str):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(14, 116, 144) # Deep Cyan
        self.cell(0, 6, clean(title), 0, 1, 'L')
        self.ln(1)

    def body_text(self, text: str):
        self.set_font('Helvetica', '', 9)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 4.8, clean(text))
        self.ln(2.5)

    def key_value_box(self, pairs):
        self.set_font('Helvetica', '', 8.5)
        for label, val in pairs:
            self.set_fill_color(248, 250, 252)
            self.set_font('Helvetica', 'B', 8.5)
            self.set_text_color(51, 65, 85)
            self.cell(55, 6, clean(f' {label}'), 1, 0, 'L', True)
            self.set_font('Helvetica', '', 8.5)
            self.set_text_color(15, 23, 42)
            self.cell(135, 6, clean(f' {val}'), 1, 1, 'L')
        self.ln(3)

def build_pdf(output_path: str):
    pdf = DocumentationPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=18)

    # ---------------- PAGE 1: COVER PAGE ----------------
    pdf.add_page()
    pdf.set_fill_color(11, 15, 25) # Space dark background
    pdf.rect(0, 0, 210, 297, 'F')

    # Accent decorative banner
    pdf.set_fill_color(6, 182, 212)
    pdf.rect(0, 45, 8, 80, 'F')

    pdf.set_y(55)
    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 30)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 12, clean('MnVisionAI'), 0, 1, 'L')

    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 15)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 10, clean('Space-Intelligence Platform for Manganese Reserve Discovery'), 0, 1, 'L')

    pdf.set_x(20)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 7, clean('& Operational Production Shortfall Mitigation'), 0, 1, 'L')

    pdf.ln(15)
    pdf.set_draw_color(51, 65, 85)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(12)

    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, clean('Smart India Hackathon (SIH 2026) Technical Blueprint'), 0, 1, 'L')

    specs = [
        ("Problem Statement ID", "SIH26009"),
        ("Theme / Category", "Smart Automation / Space Technology (Software)"),
        ("Client Ministry / PSU", "Ministry of Steel / MOIL Limited (Nagpur, India)"),
        ("Core Capability 1", "Remote Sensing & AI Mineral Prospectivity Mapping (MPM)"),
        ("Core Capability 2", "Explainable AI (SHAP) & UNFC Core Drilling Prioritization"),
        ("Core Capability 3", "Heavy Machinery MTBF & Monsoon Production Forecaster"),
        ("Implementation Stack", "FastAPI (Python) + React (Vite) + Leaflet Web GIS"),
        ("Study Area Ground Truth", "Sausar Manganese Belt (Balaghat, Bhandara, Nagpur)")
    ]

    pdf.ln(4)
    for label, val in specs:
        pdf.set_x(20)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(6, 182, 212)
        pdf.cell(50, 6.5, clean(label + ':'), 0, 0, 'L')
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(226, 232, 240)
        pdf.cell(120, 6.5, clean(val), 0, 1, 'L')

    pdf.set_y(250)
    pdf.set_x(20)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 5, clean(f'Generated: {datetime.now().strftime("%B %d, %Y")} | Complete Architecture and Engineering Specifications'), 0, 1, 'L')

    # ---------------- PAGE 2: EXECUTIVE SUMMARY & SIH CONTEXT ----------------
    pdf.add_page()
    pdf.chapter_title(1, "Executive Summary & Problem Statement Context")
    
    pdf.body_text(
        "Manganese is an irreplaceable strategic element essential for steelmaking (deoxidizer and alloying element, ~10 kg Mn "
        "required per tonne of crude steel) and the surging lithium-manganese-iron-phosphate (LMFP) battery market. "
        "Despite India possessing substantial geological resources, the domestic mining industry faces twin structural crises: "
        "(1) a prolonged exploration bottleneck with declining discovery rates using traditional ground surveys, and (2) chronic "
        "production shortfalls driven by monsoon water-logging and heavy machinery downtime."
    )

    pdf.section_heading("The Mandate of SIH26009 (MOIL Limited & Ministry of Steel)")
    pdf.body_text(
        "Problem Statement SIH26009 issued by MOIL Limited (the largest producer of manganese ore in India, commanding ~45% market share) "
        "establishes a dual-objective challenge:\n"
        "* Subsurface Exploration: Deploy space-borne Earth Observation (EO) and Machine Learning to rapidly identify prospective "
        "manganese ore zones and rank core drilling targets, replacing cost-prohibitive manual field surveys.\n"
        "* Overcoming Operational Shortfalls: Construct a predictive intelligence system that analyzes operational bottlenecks "
        "(equipment breakdown, weather severity, statutory blasting delays) to forecast output deficits and deliver prescriptive mitigations."
    )

    pdf.section_heading("Core Platform Architecture at a Glance")
    pdf.key_value_box([
        ("Space-Intelligence Engine", "Calibrated multi-spectral indices (Fe-Oxide, SWIR Clay, Mn-Proxy) + SRTM DEM lineaments."),
        ("AI Prospectivity Pipeline", "Positive-Unlabeled (PU) Bagging Ensemble combining XGBoost and Random Forest."),
        ("Explainability (XAI)", "SHAP (SHapley Additive exPlanations) attributing local geological drivers for every anomaly."),
        ("Operational Risk Engine", "Dynamic simulation of equipment availability, precipitation, and blasting turnaround times."),
        ("Presentation Layer", "Interactive dark-mode Web GIS dashboard with raster canvas rendering and PDF dossier generation.")
    ])

    # ---------------- PAGE 3: SCIENTIFIC & GEOLOGICAL FOUNDATIONS ----------------
    pdf.add_page()
    pdf.chapter_title(2, "Scientific & Geological Foundations")

    pdf.section_heading("Geological Setting: The Sausar Manganese Corridor")
    pdf.body_text(
        "MnVisionAI is anchored on India's premier manganese metallogenic province: the Proterozoic Sausar Belt spanning Balaghat and "
        "Chhindwara districts in Madhya Pradesh and Nagpur and Bhandara districts in Maharashtra. The ore bodies occur as syngenetic bedded "
        "strata within the Munsar Formation of the Sausar Group, intimately associated with gondites (manganese silicate-carbonate rocks) "
        "and quartz-muscovite-biotite schists. Primary ore minerals include Braunite (3Mn2O3.MnSiO3), Pyrolusite (MnO2), Psilomelane, "
        "and Jacobsite (MnFe2O4)."
    )

    pdf.section_heading("Remote Sensing Spectroscopy for Manganese")
    pdf.body_text(
        "Manganese oxides and their alteration aureoles exhibit unique diagnostic spectral absorption and reflection features:\n"
        "1. Crystal Field Absorption: Pyrolusite and braunite demonstrate characteristic absorption in the Visible Near-Infrared (VNIR) "
        "spectrum (0.45-0.55 um and 0.70-0.90 um) caused by Mn3+ and Mn4+ electronic transitions.\n"
        "2. Iron Oxide Index (Sentinel-2 B4 / B2): Manganese deposits in the Sausar Group are persistently enveloped in ferruginous "
        "gossan caps and hematite-goethite oxidation zones. Band 4 (Red) / Band 2 (Blue) highlights these alteration contacts.\n"
        "3. Hydrothermal / Clay Index (Sentinel-2 B11 / B12): SWIR1 / SWIR2 ratio maps the concentration of Al-OH and Mg-OH "
        "phyllosilicates (illite, kaolinite, muscovite) generated by hydrothermal fluid flux during metamorphism.\n"
        "4. Vegetation Suppression (NDVI): Canopy density is masked via (B8 - B4) / (B8 + B4) to prevent false positives over dense forest."
    )

    pdf.section_heading("Structural Geology & DEM Lineament Mechanics")
    pdf.body_text(
        "Mineralization in the Sausar Belt is strongly controlled by tight isoclinal folds, shear corridors, and thrust faults oriented "
        "ENE-WSW (65 deg regional strike). By applying directional multi-angle Sobel convolutions (0, 45, 90, 135 deg) on 30m SRTM DEM elevation, "
        "MnVisionAI calculates Lineament Intersection Density - highlighting dilational structural traps where hydrothermal fluids precipitated ore."
    )

    # ---------------- PAGE 4: SYSTEM ARCHITECTURE & DATA FLOW ----------------
    pdf.add_page()
    pdf.chapter_title(3, "System Architecture & Data Flow")

    pdf.section_heading("End-to-End Architectural Diagram")
    pdf.body_text(
        "MnVisionAI is architectured in five decoupled layers designed for modularity, sub-second latency, and horizontal scalability:"
    )

    arch_table = [
        ("Layer 1: Data Ingestion", "Copernicus Sentinel-2 (VNIR/SWIR), USGS SRTM 30m DEM, GSI Bhukosh Lithology, MOIL Mine Ground Truth."),
        ("Layer 2: Geo-Processing", "NumPy & SciPy spectral band ratios, NDVI canopy masking, directional edge kernels, lineament density."),
        ("Layer 3: Machine Learning", "Positive-Unlabeled (PU) Bagging with Random Forest and HistGradientBoosting; Epistemic uncertainty map."),
        ("Layer 4: Explainable AI & APIs", "FastAPI asynchronous REST server, SHAP local attribution calculator, FPDF2 technical dossier generator."),
        ("Layer 5: Presentation GIS", "Vite + React 18, Leaflet dynamic raster canvas overlays, Recharts analytics, responsive glassmorphism UI.")
    ]
    pdf.key_value_box(arch_table)

    pdf.section_heading("Data Pipeline Execution Flow")
    pdf.body_text(
        "1. Ingestion: Multispectral bands (B2, B3, B4, B8, B11, B12) and DEM rasters are normalized and aligned to bounding coordinates.\n"
        "2. Feature Synthesis: Computes Iron Oxide, Hydrothermal Alteration, Mn-Proxy, Lineament Density, TWI, and Lithology priors.\n"
        "3. PU-Ensemble Training: Positives are sampled from known MOIL mines (Balaghat, Tirodi, Ukwa, etc.); background pixels are treated "
        "as unlabeled rather than false negatives, eliminating biased negative penalties.\n"
        "4. Grid Inference: Predicts continuous 0.0 to 1.0 prospectivity scores and calculates ensemble disagreement variance (uncertainty).\n"
        "5. Clustering & Ranking: Connected-component analysis identifies anomaly peaks, filtered by slope (< 15 deg) for core drilling rig mobility.\n"
        "6. XAI & Reporting: For any target, calculates SHAP factor contributions and compiles diamond core drilling protocols."
    )

    # ---------------- PAGE 5: CODEBASE STRUCTURE & DIRECTORY ----------------
    pdf.add_page()
    pdf.chapter_title(4, "Codebase Structure & Directory Breakdown")

    pdf.body_text(
        "The repository follows clean enterprise software engineering principles with complete separation between the Python backend "
        "geospatial engine and the modern React web frontend:"
    )

    code_structure = [
        ("backend/app/main.py", "FastAPI server entrypoint, CORS configuration, REST routing, and PDF streaming endpoint."),
        ("backend/app/data/sausar_belt_data.py", "Ground truth database: real MOIL mine records, coordinates, Sausar lithological units."),
        ("backend/app/data/sample_rasters.py", "Calibrated spatial grid pipeline: generates synthetic/calibrated rasters, pre-trains AI model."),
        ("backend/app/core/spectral_engine.py", "Spectral remote sensing engine: NDVI, Iron Oxide, SWIR Clay, and calibrated Mn proxies."),
        ("backend/app/core/lineament_engine.py", "Structural geology engine: Sobel directional edge filtering, lineament density, terrain slope."),
        ("backend/app/core/prospectivity_model.py", "AI MPM model: PU-bagged Random Forest + Gradient Boosting, target clustering, rank scores."),
        ("backend/app/core/xai_engine.py", "Explainable AI: SHAP feature attributions, baseline comparisons, geologist narrative synthesis."),
        ("backend/app/core/production_forecaster.py", "MOIL operations simulator: equipment MTBF, monsoon waterlogging, shortfall calculations."),
        ("backend/app/core/report_generator.py", "FPDF2 PDF generator: creates branded Exploration Target Dossiers with drill protocols."),
        ("frontend/src/App.jsx", "Root React application orchestrating state, API data fetching, tab switches, and modal drawers."),
        ("frontend/src/index.css", "Modern design system: slate/dark theme, glowing neon accents, glassmorphic panels, responsive grid."),
        ("frontend/src/components/MapViewer.jsx", "Interactive Leaflet Web GIS: canvas raster overlay, target pins, mine popups, basemap switcher."),
        ("frontend/src/components/LayerControl.jsx", "Side control panel: layer switching, opacity slider, threshold filter, ROI preset zooms."),
        ("frontend/src/components/TargetRankTable.jsx", "Drill target matrix: priority rank, coordinates, confidence, rig feasibility, action buttons."),
        ("frontend/src/components/XaiModal.jsx", "SHAP attribution modal: horizontal attribution bar chart, diagnostic synthesis, PDF export."),
        ("frontend/src/components/ProductionForecaster.jsx", "MOIL operations dashboard: shortfall KPIs, bottleneck breakdown, mine table, directives.")
    ]
    pdf.key_value_box(code_structure)

    # ---------------- PAGE 6: MOIL OPERATIONS FORECASTER & SHORTFALL MITIGATION ----------------
    pdf.add_page()
    pdf.chapter_title(5, "MOIL Operations & Production Shortfall Forecaster")

    pdf.body_text(
        "A critical innovation of MnVisionAI is directly addressing the operational half of SIH26009. Most hackathon participants only "
        "build satellite maps; MnVisionAI provides MOIL leadership with a predictive operations cockpit to prevent yield deficits."
    )

    pdf.section_heading("Operational Variables & Constraint Modeling")
    pdf.body_text(
        "* Monsoon / Precipitation Inundation: Central India experiences severe monsoonal rainfall (300-600mm/month in July-August). "
        "Open pit operations (Dongri Buzurg, Tirodi) suffer pit flooding, bench slippage, and sump overloading, while underground mines "
        "(Balaghat, Ukwa, Chikla) face haulage road degradation.\n"
        "* Heavy Machinery (HEMM) Availability: Tracks Mean Time Between Failures (MTBF) and mechanical availability for dumpers, "
        "hydraulic excavators, blast-hole drills, and underground skip hoists.\n"
        "* Blasting & Regulatory Bottlenecks: Factors statutory DGMS explosive clearances and safety perimeter evacuation delays."
    )

    pdf.section_heading("Prescriptive Mitigation Engine")
    pdf.body_text(
        "When projected production falls below the monthly target (114,000 MT baseline across MOIL's central cluster), the AI engine "
        "automatically issues prescriptive corrective actions:\n"
        "1. Dewatering Capacity Pre-Deployment: Recommends positioning 5,000 m3/hr auxiliary high-head submersible pumps at Dongri Buzurg "
        "48 hours prior to forecasted storm alerts to eliminate 3-day hauling halts.\n"
        "2. Underground Shift Rebalancing: Shifts 15-20% haulage load from flooded open pits to Balaghat and Ukwa underground stopes.\n"
        "3. HEMM Preventive Maintenance Blitz: Re-routes maintenance crews to restore dumper availability above 90% threshold."
    )

    # ---------------- PAGE 7: REST API SPECIFICATION & DATA REALITY ----------------
    pdf.add_page()
    pdf.chapter_title(6, "REST API Specification & Data Implementation")

    pdf.section_heading("FastAPI REST Endpoints")
    api_specs = [
        ("GET /api/study-area", "Returns bounds, center, and verified ground-truth historical MOIL mines and Sausar lithological units."),
        ("GET /api/prospectivity/grid", "Returns spatial matrices for prospectivity, manganese proxy, hydrothermal alteration, DEM, and lineaments."),
        ("GET /api/drill-targets", "Returns ranked candidate drill coordinates, confidence scores, depth tiers, and rig accessibility grades."),
        ("GET /api/explain-target/{id}", "Calculates SHAP feature attributions, observed vs baseline values, and geological narrative for a target."),
        ("GET /api/operations/simulate", "Simulates production shortfall scenario based on rainfall, machinery availability, and blasting delay."),
        ("GET /api/reports/download-dossier/{id}", "Generates and streams an official PDF Exploration Target Dossier with diamond core drilling protocols.")
    ]
    pdf.key_value_box(api_specs)

    pdf.section_heading("Ground Truth vs Calibrated Simulation Breakdown")
    pdf.body_text(
        "To ensure total transparency and technical rigor:\n"
        "* 100% Real Ground Truth: Real coordinates (Balaghat 21.867 N, 80.200 E; Dongri Buzurg 21.550 N, 79.683 E; etc.), verified ore "
        "grades (38-48.5% Mn), Sausar Group Munsar lithology, real mathematical band arithmetic formulas, and active ML models.\n"
        "* Calibrated Rasters: The raster pixels are synthesized and calibrated on the real coordinate grid rather than downloading 5 GB "
        "of raw Copernicus GeoTIFFs, ensuring sub-second response times and 100% offline reliability during hackathon presentations.\n"
        "* Plug-and-Play Ingestion: The pipeline is built to ingest raw GeoTIFFs via tifffile or Planetary Computer STAC API with zero architecture changes."
    )

    # ---------------- PAGE 8: ROADMAP & HACKATHON WINNING ADVANTAGES ----------------
    pdf.add_page()
    pdf.chapter_title(7, "Evaluation Advantages & 6-Month Roadmap")

    pdf.section_heading("Key Differentiators for SIH 2026 Judging")
    advantages = [
        ("Dual-Mandate Completeness", "Solves BOTH exploration discovery AND operational production shortfalls as demanded by MOIL."),
        ("Explainable AI (XAI)", "Does not provide a black-box; equips geologists with SHAP attributions and mineral physics explanations."),
        ("Rig Feasibility Integration", "Ranks targets by slope and accessibility, preventing recommendations in inaccessible rugged terrain."),
        ("End-to-End Working System", "Fully operational web GIS, responsive controls, live simulation, and instant PDF/GeoJSON downloads."),
        ("Scientific Credibility", "Strictly grounded in Sausar Belt gonditic manganese geology and Sentinel-2 spectral physics.")
    ]
    pdf.key_value_box(advantages)

    pdf.section_heading("6-Month Production Roadmap")
    pdf.body_text(
        "* Month 1 (Cloud Data Lake): Automated ingestion pipeline connecting ESA Copernicus SciHub & USGS Earthdata APIs.\n"
        "* Month 2 (Hyperspectral Expansion): Integration of ISRO AVIRIS-NG and NASA EMIT hyperspectral imagery for fine-band MnO2 mapping.\n"
        "* Month 3 (3D Subsurface Modeling): Inversion modeling of ground magnetics and gravity data to generate 3D ore block models.\n"
        "* Month 4 (ERP & SCADA Integration): Secure connector to MOIL's SAP ERP and telemetry systems for live fleet tracking.\n"
        "* Month 5 (Field Ground-Truthing): Active learning feedback loop updating AI weights from core drilling assay results.\n"
        "* Month 6 (National Deployment): Scaling platform to the Sandur (Karnataka) and Bonai-Keonjhar (Odisha) manganese belts."
    )

    pdf.output(output_path)
    print(f"Documentation PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath("MnVisionAI_Complete_Technical_Documentation.pdf")
    build_pdf(out)
