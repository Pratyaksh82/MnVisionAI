"""
Automated Exploration Dossier and Drill Recommendations PDF Generator.
Produces professional technical reports for exploration geologists and MOIL management.
"""

from fpdf import FPDF
from typing import Dict, Any, List
from datetime import datetime

def sanitize_text(text: Any) -> str:
    """Sanitizes text to prevent Latin-1 encoding issues in standard FPDF Helvetica font."""
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
        '…': '...'
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text.encode('latin-1', 'replace').decode('latin-1')

class ExplorationDossierPDF(FPDF):
    def header(self):
        self.set_fill_color(15, 23, 42) # Slate dark header
        self.rect(0, 0, 210, 18, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 10, sanitize_text('MnVisionAI | Space-Intelligence Platform for Manganese Reserve Discovery'), 0, 1, 'L')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, sanitize_text(f'SIH 2026 PS SIH26009 | MOIL Limited & Ministry of Steel | Page {self.page_no()}'), 0, 0, 'C')

def generate_target_dossier_pdf(
    target: Dict[str, Any],
    explanation: Dict[str, Any],
    roi_name: str = "Central India Sausar Belt"
) -> bytes:
    """
    Builds a PDF technical dossier for a prioritized manganese drill target.
    """
    pdf = ExplorationDossierPDF(orientation='P', unit='mm', format='A4')
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=18)

    # Document Title
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, sanitize_text('EXPLORATION TARGET DOSSIER'), 0, 1, 'L')
    
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(100, 116, 139)
    sub = f'Target Identifier: {target.get("target_id", "MN-TGT-01")} | Region: {roi_name} | Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}'
    pdf.cell(0, 6, sanitize_text(sub), 0, 1, 'L')
    pdf.ln(4)

    # Divider line
    pdf.set_draw_color(203, 213, 225)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(6)

    # Section 1: Executive Target Summary Card
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, sanitize_text('1. Executive Target Specification'), 0, 1, 'L')
    pdf.ln(2)

    # Key Value Table
    pdf.set_font('Helvetica', '', 9)
    data = [
        ("GPS Center Coordinates", f"{target.get('latitude', 0.0)} deg N, {target.get('longitude', 0.0)} deg E"),
        ("AI Prospectivity Score", f"{int(target.get('prospectivity_score', 0.0) * 100)}% (High Probability Anomaly)"),
        ("Confidence Score", f"{int(target.get('confidence_score', 0.0) * 100)}% (Low Model Variance)"),
        ("Priority Rank Score", f"{target.get('priority_rank_score', 0.0)} / 1.00"),
        ("Estimated Depth Tier", target.get('estimated_depth_tier', 'Shallow (20-60m)')),
        ("Terrain Slope & Rig Access", f"{target.get('terrain_slope_deg', 0.0)} deg - {target.get('rig_accessibility', 'High')}"),
        ("Recommended Action", target.get('recommended_action', 'Priority 1 Core Drilling'))
    ]

    for label, val in data:
        pdf.set_fill_color(248, 250, 252)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(51, 65, 85)
        pdf.cell(65, 7, sanitize_text(f' {label}'), 1, 0, 'L', True)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(125, 7, sanitize_text(f' {val}'), 1, 1, 'L')

    pdf.ln(6)

    # Section 2: Explainable AI & Geological Attribution
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, sanitize_text('2. Explainable AI (XAI) Attribution & Geological Drivers'), 0, 1, 'L')
    pdf.ln(2)

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(51, 65, 85)
    pdf.multi_cell(0, 5, sanitize_text(explanation.get("geological_narrative", "High mineral prospectivity identified.")))
    pdf.ln(4)

    # Feature Attribution Breakdown Table
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(226, 232, 240)
    pdf.cell(60, 6, sanitize_text(' Diagnostic Feature'), 1, 0, 'L', True)
    pdf.cell(30, 6, sanitize_text(' Category'), 1, 0, 'C', True)
    pdf.cell(30, 6, sanitize_text(' Observed Value'), 1, 0, 'C', True)
    pdf.cell(35, 6, sanitize_text(' Regional Baseline'), 1, 0, 'C', True)
    pdf.cell(35, 6, sanitize_text(' Model Weight Share'), 1, 1, 'C', True)

    pdf.set_font('Helvetica', '', 8)
    for feat in explanation.get("feature_attributions", [])[:6]:
        pdf.set_text_color(15, 23, 42)
        pdf.cell(60, 6, sanitize_text(f' {feat["feature_name"]}'), 1, 0, 'L')
        pdf.cell(30, 6, sanitize_text(f' {feat["category"]}'), 1, 0, 'C')
        pdf.cell(30, 6, sanitize_text(f' {feat["observed_value"]}'), 1, 0, 'C')
        pdf.cell(35, 6, sanitize_text(f' {feat["baseline_value"]}'), 1, 0, 'C')
        pdf.cell(35, 6, sanitize_text(f' +{feat.get("importance_pct", 0)}%'), 1, 1, 'C')

    pdf.ln(6)

    # Section 3: Subsurface Stratigraphy & Borehole Intercept
    strat = explanation.get("borehole_stratigraphy")
    if strat and "ore_intercept" in strat:
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 7, sanitize_text('3. Subsurface Stratigraphy & Drill Core Intercept Forecast'), 0, 1, 'L')
        pdf.ln(2)

        ore = strat["ore_intercept"]
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(51, 65, 85)
        strat_summary = (
            f"Planned Borehole: {strat.get('borehole_id', 'DDH-01')} | Depth: {strat.get('total_depth_eoh_m', 90)}m EOH | "
            f"Inclination: {strat.get('collar_inclination_deg', 60)} deg -> Azimuth: {strat.get('drilling_azimuth_deg', 160)} deg SSE\n"
            f"Predicted Ore Intercept: {ore.get('top_depth_m', 30)}m to {ore.get('bottom_depth_m', 55)}m "
            f"(Apparent: {ore.get('apparent_thickness_m', 25)}m, True: {ore.get('true_thickness_m', 21.6)}m)\n"
            f"Forecasted Chemistry: {ore.get('avg_mn_grade_pct', 45.0)}% Mn, {ore.get('avg_fe_pct', 5.5)}% Fe, "
            f"{ore.get('avg_sio2_pct', 8.2)}% SiO2 | Classification: {ore.get('unfc_classification', 'G-2 Indicated')}"
        )
        pdf.multi_cell(0, 5, sanitize_text(strat_summary))
        pdf.ln(4)

    # Section 4: Recommended Diamond Core Drilling Protocol
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(15, 23, 42)
    sec_num = '4' if strat else '3'
    pdf.cell(0, 7, sanitize_text(f'{sec_num}. Recommended Drilling & Field Verification Protocol'), 0, 1, 'L')
    pdf.ln(2)

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(51, 65, 85)
    protocol_steps = (
        "Phase A: Establish a 100m x 50m detailed ground magnetic & radiometric grid over the GPS center.\n"
        "Phase B: Mobilize skid-mounted core drilling rig (NQ wireline core barrel, 47.6mm core diameter).\n"
        "Phase C: Drill inclined borehole (60 deg inclination towards SSE azimuth to intersect dipping gondite horizon).\n"
        "Phase D: Immediate split-core XRF logging for Mn, Fe, SiO2, and P content to confirm ore grade."
    )
    pdf.multi_cell(0, 5, sanitize_text(protocol_steps))

    return pdf.output()
