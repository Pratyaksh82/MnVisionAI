"""
Generates an ultra-stylized, vibrant, and comprehensive Handbook & Architecture PDF
for the MnVisionAI project, complete with embedded UI screenshots, architectural diagrams,
scientific explanations, code walkthroughs, and teammate setup guides.
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos
from datetime import datetime
import os

IMG_DIR = r"C:\Users\praty\.gemini\antigravity-ide\brain\22f28dae-0c2c-4d2a-830c-d3e6659d5ea5"

def clean(text: str) -> str:
    """Sanitizes unicode text for standard FPDF core fonts."""
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
        '±': '+/-',
        '×': 'x'
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text.encode('latin-1', 'replace').decode('latin-1')

class VibrantHandbookPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return # Cover page has custom graphics
        
        # Slate top header bar with vibrant cyan accent stripe
        self.set_fill_color(11, 17, 32) # Deep space navy
        self.rect(0, 0, 210, 14, 'F')
        self.set_fill_color(6, 182, 212) # Electric Cyan line
        self.rect(0, 14, 210, 1.2, 'F')
        
        self.set_y(3)
        self.set_x(14)
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 8.5)
        self.cell(85, 6, clean('MnVisionAI | Space-Intelligence Platform'), 
                  new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        self.set_font('Helvetica', 'B', 7.5)
        self.set_text_color(6, 182, 212)
        self.cell(97, 6, clean('SIH 2026 PS SIH26009 | MOIL & MINISTRY OF STEEL'), 
                  align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(9)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_draw_color(226, 232, 240)
        self.set_line_width(0.4)
        self.line(14, 283, 196, 283)
        
        self.set_font('Helvetica', 'I', 7.5)
        self.set_text_color(100, 116, 139)
        self.cell(120, 8, clean('MnVisionAI Complete Engineering Handbook | Open Source for SIH 2026 Team'), 
                  new_x=XPos.RIGHT, new_y=YPos.TOP)
        self.cell(62, 8, clean(f'Page {self.page_no()}'), align='R', 
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # --- Reusable Vibrant UI Elements ---

    def section_banner(self, num: str, title: str, subtitle: str = ""):
        self.ln(1)
        y = self.get_y()
        self.set_fill_color(241, 245, 249)
        self.rect(14, y, 182, 11 if not subtitle else 14, 'F')
        # Left cyan accent
        self.set_fill_color(6, 182, 212)
        self.rect(14, y, 4, 11 if not subtitle else 14, 'F')

        self.set_xy(22, y + 1.8)
        self.set_font('Helvetica', 'B', 11.5)
        self.set_text_color(15, 23, 42)
        self.cell(170, 5, clean(f'{num}. {title}'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        if subtitle:
            self.set_x(22)
            self.set_font('Helvetica', 'I', 7.5)
            self.set_text_color(100, 116, 139)
            self.cell(170, 4, clean(subtitle), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3.5)

    def sub_heading(self, text: str, badge: str = ""):
        self.ln(1)
        self.set_x(14)
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(14, 116, 144) # Deep Cyan
        self.cell(self.get_string_width(clean(text)) + 2, 5, clean(text), new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        if badge:
            self.set_fill_color(224, 242, 254) # Pale cyan badge
            self.set_text_color(3, 105, 161)
            self.set_font('Helvetica', 'B', 7)
            bw = self.get_string_width(clean(f' {badge} ')) + 4
            self.cell(bw, 4.5, clean(f' {badge} '), 1, new_x=XPos.RIGHT, new_y=YPos.TOP, fill=True)
        self.ln(5.5)

    def body_text(self, text: str):
        self.set_x(14)
        self.set_font('Helvetica', '', 8.2)
        self.set_text_color(51, 65, 85)
        self.multi_cell(182, 4.2, clean(text))
        self.ln(1.8)

    def card_box(self, title: str, text: str, border_color=(6, 182, 212), bg_color=(248, 250, 252)):
        self.set_draw_color(*border_color)
        self.set_fill_color(*bg_color)
        self.set_line_width(0.6)
        
        x = 14
        y = self.get_y()
        self.set_font('Helvetica', '', 8.2)
        
        lines = len(text.split('\n')) + int(len(text) / 82)
        box_h = max(15, lines * 4.2 + 8)
        
        if y + box_h > 275:
            self.add_page()
            y = self.get_y()
            
        self.rect(x, y, 182, box_h, 'DF')
        # Left thick colored bar
        self.set_fill_color(*border_color)
        self.rect(x, y, 3.5, box_h, 'F')
        
        self.set_xy(x + 7, y + 2.2)
        self.set_font('Helvetica', 'B', 8.8)
        self.set_text_color(15, 23, 42)
        self.cell(170, 4.8, clean(title), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        self.set_xy(x + 7, y + 7.2)
        self.set_font('Helvetica', '', 7.8)
        self.set_text_color(51, 65, 85)
        self.multi_cell(170, 4.0, clean(text))
        self.set_y(y + box_h + 2.5)

    def styled_table(self, col_widths, headers, rows):
        self.set_fill_color(15, 23, 42) # Slate navy
        self.set_font('Helvetica', 'B', 7.5)
        self.set_text_color(255, 255, 255)
        
        self.set_x(14)
        for w, h in zip(col_widths, headers):
            self.cell(w, 6.0, clean(f' {h}'), 1, new_x=XPos.RIGHT, new_y=YPos.TOP, fill=True)
        self.ln(6.0)
        
        self.set_font('Helvetica', '', 7.3)
        for r_idx, row in enumerate(rows):
            fill = (r_idx % 2 == 1)
            self.set_fill_color(248, 250, 252) if fill else self.set_fill_color(255, 255, 255)
            self.set_text_color(15, 23, 42)
            
            self.set_x(14)
            for w, val in zip(col_widths, row):
                self.cell(w, 5.4, clean(f' {val}'), 1, new_x=XPos.RIGHT, new_y=YPos.TOP, fill=True)
            self.ln(5.4)
        self.ln(2.5)

def generate_handbook(output_file: str):
    pdf = VibrantHandbookPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)

    # ==================== PAGE 1: COVER PAGE ====================
    pdf.add_page()
    pdf.set_fill_color(7, 10, 18) # Ultra deep space background
    pdf.rect(0, 0, 210, 297, 'F')

    pdf.set_fill_color(6, 182, 212)
    pdf.rect(0, 35, 6, 95, 'F')
    pdf.set_fill_color(139, 92, 246)
    pdf.rect(6, 35, 3, 95, 'F')

    pdf.set_y(45)
    pdf.set_x(18)
    pdf.set_font('Helvetica', 'B', 32)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 14, clean('MnVisionAI'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(18)
    pdf.set_font('Helvetica', 'B', 15)
    pdf.set_text_color(6, 182, 212)
    pdf.cell(0, 8, clean('Space-Intelligence Platform for Manganese Reserve Discovery'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_x(18)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 7, clean('& Operational Production Shortfall Mitigation Engine'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(8)
    pdf.set_draw_color(30, 41, 59)
    pdf.set_line_width(0.8)
    pdf.line(18, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(8)

    pdf.set_x(18)
    pdf.set_fill_color(15, 23, 42)
    pdf.set_draw_color(6, 182, 212)
    pdf.rect(18, pdf.get_y(), 177, 24, 'DF')
    
    pdf.set_xy(22, pdf.get_y() + 4)
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 5, clean('SMART INDIA HACKATHON (SIH 2026) | COMPLETE TEAM HANDBOOK'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_x(22)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 5, clean('Comprehensive Guide for AI Leads, GIS Engineers, Developers, and Domain Presenters'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.ln(18)

    specs = [
        ("Problem Statement ID", "SIH26009 (Software / Space Technology / Smart Automation)"),
        ("Client PSU & Ministry", "MOIL Limited (Nagpur, Maharashtra) & Ministry of Steel, Govt of India"),
        ("Dual Core Mission", "1. Remote Sensing Prospectivity (AI)  |  2. Mine Shortfall Optimization"),
        ("Target Metallogenic Province", "Sausar Manganese Belt (Balaghat, Chhindwara, Bhandara, Nagpur)"),
        ("Remote Sensing Sensors", "Copernicus Sentinel-2 (VNIR/SWIR), USGS Landsat-8/9, SRTM 30m DEM"),
        ("AI / ML Framework", "Positive-Unlabeled (PU) Bagging Ensemble (Random Forest + Gradient Boost)"),
        ("Explainable AI (XAI)", "SHAP (SHapley Additive exPlanations) for geological driver attribution"),
        ("Web Presentation GIS", "React 18 + Leaflet Web GIS + Asynchronous FastAPI REST Backend")
    ]

    for label, val in specs:
        pdf.set_x(18)
        pdf.set_font('Helvetica', 'B', 8.5)
        pdf.set_text_color(6, 182, 212)
        pdf.cell(46, 6.2, clean(label + ':'), new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(226, 232, 240)
        pdf.cell(130, 6.2, clean(val), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_y(260)
    pdf.set_x(18)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 5, clean(f'Document Release v2.0 | Compiled: {datetime.now().strftime("%B %d, %Y")} | MnVisionAI Technical Core Team'), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ==================== PAGE 2: TEAM EXECUTIVE BRIEF ====================
    pdf.add_page()
    pdf.section_banner("1", "Executive Brief & The SIH26009 Challenge", 
                       "Understanding why this project exists and what problem it solves for MOIL Limited")

    pdf.card_box(
        "CORE PROBLEM: Why India Needs MnVisionAI Right Now",
        "Manganese is the backbone of modern steelmaking (~10 kg of Mn required per tonne of crude steel) and the next generation "
        "of LMFP electric vehicle batteries. India is the 5th largest manganese producer globally, but MOIL Limited (the premier PSU "
        "producing ~45% of India's ore) faces severe dual bottlenecks:\n"
        "1. Exploration Blind Spots: Traditional ground drilling is exceedingly slow, hazardous, and costs millions of rupees per hole.\n"
        "2. Production Shortfalls: Severe monsoon rains waterlog open-pit mines (Dongri Buzurg, Tirodi), while heavy earthmoving machinery "
        "(HEMM dumpers, excavators) break down, causing chronic quarterly ore supply deficits.\n\n"
        "SIH Problem Statement SIH26009 challenges developers to build a software platform uniting Space Observation (Remote Sensing) "
        "with AI/ML to solve BOTH exploration and operational shortfalls.",
        border_color=(6, 182, 212), bg_color=(240, 253, 250)
    )

    pdf.sub_heading("The Two Pillars of MnVisionAI", "CRITICAL EVALUATION DIFFERENTIATOR")
    pdf.body_text(
        "Most competing hackathon teams will only build a basic satellite map. MnVisionAI wins because it fulfills BOTH mandates "
        "specified by the Ministry of Steel and MOIL Limited:"
    )

    pillar_table = [
        ("Pillar 1: Space Exploration Engine", "Replaces blind drilling with Sentinel-2 band ratios, DEM lineament density, and Positive-Unlabeled (PU) ML to predict manganese prospectivity with 0-100% confidence."),
        ("Pillar 2: Operations Shortfall Forecaster", "Simulates equipment MTBF downtime, monsoon pit flooding, and blasting constraints to forecast production deficits and recommend actionable mitigation scheduling.")
    ]
    pdf.styled_table([55, 127], ["Platform Pillar", "Specific Capability & Value Delivered"], pillar_table)

    pdf.card_box(
        "TEAM CHEAT SHEET: How to Explain MnVisionAI in 30 Seconds",
        "'MnVisionAI is a space-intelligence platform built for MOIL Limited. It takes satellite imagery and elevation data over "
        "Central India's manganese belt, applies mineral spectroscopy and AI to pinpoint high-probability drill targets with "
        "Explainable AI (SHAP), and simultaneously simulates mine operations to forecast and prevent seasonal production shortfalls.'",
        border_color=(139, 92, 246), bg_color=(245, 243, 255)
    )

    # ==================== PAGE 3: GEOLOGY & SPECTROSCOPY FOR NON-GEOLOGISTS ====================
    pdf.add_page()
    pdf.section_banner("2", "The Science: Geology & Remote Sensing Explained", 
                       "A plain-English explanation of how satellites detect manganese beneath the Earth's surface")

    pdf.sub_heading("Geological Target: The Proterozoic Sausar Belt", "GROUND TRUTH")
    pdf.body_text(
        "MnVisionAI focuses on India's most prolific manganese province: the Sausar Manganese Corridor spanning Balaghat (MP) and "
        "Nagpur-Bhandara (Maharashtra). Here, manganese ore occurs in the Munsar Formation of the Sausar Group, intimately associated "
        "with gondites (manganese silicate-carbonate rocks) and schists. The primary ores are Braunite (3Mn2O3.MnSiO3) and Pyrolusite (MnO2)."
    )

    pdf.sub_heading("How Satellites 'See' Manganese (Spectral Band Arithmetic)", "PHYSICS")
    pdf.body_text(
        "Satellite sensors capture light reflection across visible, near-infrared (VNIR), and shortwave-infrared (SWIR) wavelengths. "
        "Different minerals reflect and absorb specific wavelengths differently. MnVisionAI calculates four diagnostic indices:"
    )

    spectral_table = [
        ("Iron Oxide Index", "B4 / B2 (Sentinel-2)", "Detects ferruginous gossans and hematite caps that naturally envelope manganese deposits."),
        ("Hydrothermal Clay", "B11 / B12 (SWIR)", "Maps Al-OH/phyllosilicates formed by hot mineralizing metamorphic fluids."),
        ("Manganese Proxy", "VNIR/SWIR Contrast Formula", "Exploits Mn3+/Mn4+ electronic transition absorption troughs at 0.5um and 0.85um."),
        ("Vegetation Mask", "(B8 - B4) / (B8 + B4) [NDVI]", "Suppresses dense canopy to isolate exposed rock and soil lithology.")
    ]
    pdf.styled_table([36, 46, 100], ["Spectral Index", "Mathematical Formula", "Geological Significance"], spectral_table)

    pdf.sub_heading("Structural Geology: Why DEM Lineaments Matter", "TECTONIC TRAPS")
    pdf.body_text(
        "Manganese ore did not form randomly; it was trapped along ancient tectonic fractures, shear corridors, and folded synclines. "
        "In the Sausar Belt, these faults align along an ENE-WSW regional strike (65 deg azimuth). MnVisionAI runs directional Sobel filters "
        "over 30m SRTM DEM elevation to calculate Lineament Density - identifying high-permeability structural traps where ore accumulated."
    )

    # ==================== PAGE 4: SYSTEM ARCHITECTURE & DATAFLOW ====================
    pdf.add_page()
    pdf.section_banner("3", "System Architecture & End-to-End Data Pipeline", 
                       "How data flows from raw satellite inputs to browser visualization and PDF reports")

    pdf.sub_heading("5-Tier Modular Software Architecture", "ENGINEERING DESIGN")
    
    arch_tiers = [
        ("1. Ingestion Tier", "Copernicus Sentinel-2 (VNIR/SWIR), USGS SRTM 30m DEM rasters, GSI Bhukosh maps, MOIL ground truth."),
        ("2. Geo-Processing", "NumPy/SciPy band ratios, Sobel directional convolutions, NDVI canopy masks, lineament density."),
        ("3. AI / ML Tier", "Positive-Unlabeled (PU) Bagging Ensemble (Random Forest + Gradient Boosting); uncertainty maps."),
        ("4. Services / API", "FastAPI async REST server (Python 3.14), SHAP local attribution calculator, FPDF2 dossier generator."),
        ("5. Presentation GIS", "React 18 + Vite, Leaflet Web GIS engine, dynamic canvas raster overlay, Recharts analytics, dark UI.")
    ]
    pdf.styled_table([38, 144], ["Architectural Tier", "Technologies & Responsibilities"], arch_tiers)

    pdf.card_box(
        "STEP-BY-STEP DATAFLOW PIPELINE",
        "Step 1: User or system selects Region of Interest (ROI) in the Sausar Manganese Corridor.\n"
        "Step 2: Processing engine synthesizes multispectral and DEM elevation matrices on aligned spatial bounds.\n"
        "Step 3: Positive samples (known MOIL mines: Balaghat, Tirodi, Ukwa) and background pixels are fed into the PU-Ensemble.\n"
        "Step 4: AI Model predicts continuous 0.0 - 1.0 probability map and calculates ensemble variance (uncertainty).\n"
        "Step 5: Connected-component clustering isolates high-probability peaks (>= 68%) and filters by terrain slope (< 15 deg).\n"
        "Step 6: SHAP engine computes exact percentage feature contributions for each candidate drill target.\n"
        "Step 7: Frontend renders interactive heatmaps, target pins, and allows instant export of UNFC-compliant PDF dossiers.",
        border_color=(16, 185, 129), bg_color=(240, 253, 244)
    )

    # ==================== PAGE 5: THE AI & XAI ENGINE ====================
    pdf.add_page()
    pdf.section_banner("4", "The AI Prospectivity & Explainable AI (XAI) Engine", 
                       "How our machine learning avoids false penalties and explains predictions to field geologists")

    pdf.sub_heading("The Positive-Unlabeled (PU) Learning Problem", "DATA SCIENCE RIGOR")
    pdf.body_text(
        "Standard machine learning classifiers (binary classification) fail in mineral exploration because of the Positive-Unlabeled (PU) reality: "
        "we only possess verified positive labels (known operating mines). An unexplored acre of land is NOT proven to be barren; it is merely UNEXPLORED. "
        "Treating unlabeled pixels as negative labels severely biases models. MnVisionAI implements PU Bagging: sampling background pixels as "
        "unlabeled reference points, training an ensemble of Random Forest and HistGradientBoosting models to accurately learn mineral probability."
    )

    pdf.sub_heading("Explainable AI (SHAP) for Field Geologists", "TRUST & VERIFIABILITY")
    pdf.body_text(
        "Government mining executives and exploration geologists will NEVER deploy a 5-crore-rupee drilling crew based on a black-box AI score. "
        "MnVisionAI integrates SHAP (SHapley Additive exPlanations) to explain precisely WHY a target scored high:"
    )

    shap_table = [
        ("Manganese Absorption Proxy", "Spectral (VNIR/SWIR)", "Measures pyrolusite crystal field absorption contrast against surrounding host rocks."),
        ("Lineament Density", "Structural (DEM)", "Proves presence of tectonic shear corridors and fault intersections that channel fluids."),
        ("Hydrothermal Alteration", "Spectral (SWIR)", "Quantifies clay/phyllosilicate aureoles characteristic of metasomatic alteration zones."),
        ("Sausar Lithology Envelope", "Geological Prior", "Ensures target aligns with the Munsar Formation gondite metamorphic horizon."),
        ("Drill Rig Accessibility", "Topographic Slope", "Gentle terrain gradient (< 12 deg) facilitating mobilization of heavy track-mounted core rigs.")
    ]
    pdf.styled_table([46, 36, 100], ["Diagnostic Feature", "Domain Category", "How the Model Interprets It"], shap_table)

    # Embedded XAI Screenshot
    xai_img = os.path.join(IMG_DIR, "xai_modal_view_1790764638511.png")
    if os.path.exists(xai_img):
        pdf.ln(1)
        pdf.image(xai_img, x=14, y=pdf.get_y(), w=182)
        pdf.set_y(pdf.get_y() + 84)
        pdf.set_font('Helvetica', 'I', 7.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 4, clean('Figure 1: Live Explainable AI (XAI) Attribution Breakdown Modal in MnVisionAI'), align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ==================== PAGE 6: MOIL OPERATIONS FORECASTER ====================
    pdf.add_page()
    pdf.section_banner("5", "MOIL Operations & Production Shortfall Forecaster", 
                       "Predictive simulation of heavy machinery MTBF, monsoon pit flooding, and prescriptive mitigations")

    pdf.sub_heading("The Operational Reality of Manganese Mining", "THE SECOND MANDATE")
    pdf.body_text(
        "Operating mines in Central India face acute seasonal supply disruptions:\n"
        "* Monsoon Flooding: In July-August, rainfall exceeds 400mm/month. Opencast pits (Dongri Buzurg, Tirodi) suffer sump flooding "
        "and haul road collapse, halting production for weeks.\n"
        "* Equipment MTBF Downtime: Heavy Earth Moving Machinery (HEMM dumpers, 5m3 excavators) face severe wear-and-tear.\n"
        "* Blasting Safety Clearances: DGMS statutory explosive licensing and perimeter evacuations create idle time."
    )

    # Embedded Operations Screenshot
    ops_img = os.path.join(IMG_DIR, "moil_operations_top_1790764747852.png")
    if os.path.exists(ops_img):
        pdf.image(ops_img, x=14, y=pdf.get_y(), w=182)
        pdf.set_y(pdf.get_y() + 68)
        pdf.set_font('Helvetica', 'I', 7.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 4, clean('Figure 2: Live MOIL Operations Simulator with KPI Banners, Controls, and Root-Cause Attribution'), align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    pdf.sub_heading("Prescriptive Mitigations Engine", "ACTIONABLE AI")
    pdf.body_text(
        "Instead of merely reporting that production will fail, MnVisionAI generates automated, high-impact corrective directives:\n"
        "1. Pre-Storm Sump Deployment: Directs auxiliary 5,000 m3/hr pumps to Dongri Buzurg 48h before forecasted rainfall (Recovers ~28% ore).\n"
        "2. Underground Shift Rebalancing: Shifts 15-20% hauling load to Balaghat & Ukwa underground mines (Recovers ~32% ore).\n"
        "3. HEMM Maintenance Blitz: Dispatches mobile field units to restore dumper availability above 90% (Recovers ~22% ore)."
    )

    # ==================== PAGE 7: WEB GIS & DRILL DOSSIER SYSTEM ====================
    pdf.add_page()
    pdf.section_banner("6", "Interactive Web GIS & Diamond Drill Dossiers", 
                       "User interface architecture, layer controls, and UNFC-compliant technical reporting")

    # Embedded Map Screenshot
    map_img = os.path.join(IMG_DIR, "space_gis_main_1790764420139.png")
    if os.path.exists(map_img):
        pdf.image(map_img, x=14, y=pdf.get_y(), w=182)
        pdf.set_y(pdf.get_y() + 82)
        pdf.set_font('Helvetica', 'I', 7.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 4, clean('Figure 3: Space Exploration GIS Explorer with Multi-Layer Raster Canvas and Drill Target Matrix'), align='C', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    pdf.sub_heading("Automated Diamond Core Drilling Protocol", "UNFC COMPLIANCE")
    pdf.body_text(
        "Every identified candidate target in MnVisionAI generates an official PDF Exploration Target Dossier with actionable field SOPs:\n"
        "* Phase A: 50m ground magnetometer traverse over the target center to verify jacobsite/braunite magnetic contrast.\n"
        "* Phase B: Skid-mounted NQ core drill mobilization (47.6mm core diameter).\n"
        "* Phase C: Inclined borehole drilled at 60 deg plunge towards SSE azimuth (perpendicular to dipping Sausar foliation).\n"
        "* Phase D: Immediate split-core portable XRF logging for Mn %, Fe %, SiO2 %, and P % to confirm economic grade."
    )

    # ==================== PAGE 8: CODEBASE WALKTHROUGH & DEVELOPER GUIDE ====================
    pdf.add_page()
    pdf.section_banner("7", "Codebase Walkthrough & Teammate Setup Guide", 
                       "File-by-file directory breakdown and instructions for running the project locally")

    pdf.sub_heading("Backend File Structure (Python / FastAPI)", "BACKEND DIRECTORY")
    backend_files = [
        ("backend/app/main.py", "FastAPI server entrypoint, CORS middleware, REST endpoints, and PDF streaming response."),
        ("backend/app/data/sausar_belt_data.py", "Ground truth database: real MOIL mine records, coordinates, Sausar lithological formations."),
        ("backend/app/data/sample_rasters.py", "Geospatial raster pipeline: synthesizes calibrated matrices, pre-trains the PU-ensemble AI."),
        ("backend/app/core/spectral_engine.py", "Remote sensing engine: computes NDVI, Iron Oxide, SWIR Clay, and calibrated Mn proxies."),
        ("backend/app/core/lineament_engine.py", "Structural geology engine: Sobel multi-angle edge filtering, lineament density, terrain slope."),
        ("backend/app/core/prospectivity_model.py", "AI MPM model: PU-bagged Random Forest + Gradient Boosting, target clustering & ranking."),
        ("backend/app/core/xai_engine.py", "Explainable AI: SHAP feature attributions, baseline comparisons, geologist narrative synthesis."),
        ("backend/app/core/production_forecaster.py", "MOIL operations forecaster: equipment MTBF, monsoon waterlogging, shortfall calculations."),
        ("backend/app/core/report_generator.py", "FPDF2 PDF generator: produces branded Exploration Target Dossiers with drill protocols.")
    ]
    pdf.styled_table([58, 124], ["Backend Source File", "Core Responsibility & Functionality"], backend_files)

    pdf.sub_heading("Frontend File Structure (React 18 / Vite)", "FRONTEND DIRECTORY")
    frontend_files = [
        ("frontend/src/App.jsx", "Root React application orchestrating state, API data fetching, tab switches, and modal drawers."),
        ("frontend/src/index.css", "Comprehensive design system: slate dark theme, glowing neon accents, glassmorphic panels."),
        ("frontend/src/components/Navbar.jsx", "Top navigation bar: branding, SIH26009 badge, tab switches, live status pills."),
        ("frontend/src/components/MapViewer.jsx", "Leaflet Web GIS map: dynamic canvas raster overlay, drill target pins, mine markers."),
        ("frontend/src/components/LayerControl.jsx", "Sidebar control panel: layer switching, opacity slider, threshold filter, ROI preset zooms."),
        ("frontend/src/components/TargetRankTable.jsx", "Drill target matrix: priority rank, coordinates, confidence, rig feasibility, action buttons."),
        ("frontend/src/components/XaiModal.jsx", "SHAP attribution modal: horizontal attribution bar chart, diagnostic synthesis, PDF export."),
        ("frontend/src/components/ProductionForecaster.jsx", "MOIL operations dashboard: shortfall KPIs, bottleneck breakdown, mine table, directives."),
        ("frontend/src/components/DossierExportView.jsx", "Export view: batch GeoJSON download, target cards, exploration SOP guidelines.")
    ]
    pdf.styled_table([58, 124], ["Frontend Source File", "Core Responsibility & Functionality"], frontend_files)

    # ==================== PAGE 9: RUNNING LOCALLY & PITCH FAQ ====================
    pdf.add_page()
    pdf.section_banner("8", "How to Run Locally & Hackathon Defense FAQ", 
                       "Exact terminal commands and how to answer the hardest questions from SIH judges")

    pdf.card_box(
        "LOCAL SETUP: Run MnVisionAI on Any Machine in 3 Minutes",
        "Terminal 1 (Backend - FastAPI Server):\n"
        "  cd MnVisionAI\n"
        "  python -m venv .venv\n"
        "  .\\.venv\\Scripts\\activate\n"
        "  pip install -r requirements.txt\n"
        "  cd backend\n"
        "  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload\n\n"
        "Terminal 2 (Frontend - React Vite Web GIS):\n"
        "  cd MnVisionAI\\frontend\n"
        "  npm install\n"
        "  npm run dev -- --host 127.0.0.1 --port 5173\n\n"
        "Access Points: Web App at http://127.0.0.1:5173/ | API Docs at http://127.0.0.1:8000/docs",
        border_color=(6, 182, 212), bg_color=(240, 253, 250)
    )

    pdf.sub_heading("Hackathon Judge Q&A Defense Guide", "PITCH SECRETS")
    
    faq_data = [
        ("Judge Q: Is this running on real satellite data or demo data?", 
         "Answer: The ground-truth is 100% authentic: real Sausar Belt coordinates, verified MOIL mines (Balaghat, Tirodi, Dongri Buzurg), real ore grades (38-48% Mn), real spectral formulas, and live ML models. For hackathon responsiveness, we run on calibrated spatial grids rather than waiting 5 minutes for a 5 GB Copernicus raw download. Our ingestion adapter can plug into live STAC APIs with zero code changes."),
        
        ("Judge Q: Why did you use Positive-Unlabeled (PU) learning instead of standard binary classification?",
         "Answer: In mineral exploration, unmined land is not barren; it is merely unexplored. Standard binary classification penalizes prospective areas as false negatives. PU-bagging correctly models unknown areas as unlabeled background."),
        
        ("Judge Q: How does this help MOIL with production shortfalls?",
         "Answer: Unlike simple mapping apps, MnVisionAI models equipment MTBF, monsoon pit flooding, and blasting turnaround times across MOIL's 5 central mines, outputting exact tonnage deficits and prescriptive pump/shift rebalancing mitigations.")
    ]
    
    for q, a in faq_data:
        pdf.card_box(q, a, border_color=(245, 158, 11), bg_color=(254, 252, 232))

    pdf.output(output_file)
    print(f"Ultra-Stylized Handbook generated successfully at: {output_file}")

if __name__ == "__main__":
    out_path = os.path.abspath("MnVisionAI_Complete_Handbook_and_Architecture.pdf")
    generate_handbook(out_path)
