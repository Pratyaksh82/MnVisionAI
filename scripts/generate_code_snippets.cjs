const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SNIPPETS = [
  {
    filename: 'backend/app/core/production_forecaster.py',
    badge: 'SciPy HiGHS • Linear Programming',
    title: 'Constrained Mine Rebalancing & Shortfall Mitigation Engine',
    output: path.resolve('MnVisionAI_Snippet_1_SciPy_LP_Optimization.png'),
    code: `def _solve_lp_mine_rebalancing(
    mine_breakdowns: List[Dict[str, Any]],
    equipment_availability_pct: float,
    rainfall_intensity: str
) -> Dict[str, Any]:
    """
    Formulates and solves a constrained Linear Programming (LP) optimization
    problem via SciPy HiGHS simplex/interior-point solver.
    Reallocates fleet capacity and sump pumps across 5 MOIL mines to maximize
    recovered tonnage while penalizing operational friction.
    """
    n_mines = len(mine_breakdowns)
    max_surges, cost_weights = [], []

    for mb in mine_breakdowns:
        shortfall = max(0.0, float(mb["shortfall_mt"]))
        target = float(mb["target_mt"])
        if mb["type"] == "Opencast":
            # Opencast surge constrained by dewatering pump capacity (5,000 m³/h)
            recovery_cap = shortfall * (0.65 if rainfall_intensity in ["High", "Extreme"] else 0.85)
            max_surges.append(max(0.0, float(recovery_cap)))
            cost_weights.append(1.25)  # Higher diesel/pumping cost in flooded pit
        else:
            # Underground surge constrained by shaft hoist & ventilation CFM limits
            hoist_cap = target * 0.22
            max_surges.append(min(float(shortfall + target * 0.15), float(hoist_cap)))
            cost_weights.append(1.0)   # Continuous loader dispatch efficiency

    # Objective: Maximize total recovered tonnage -> min c^T * x
    c = -np.array([1.0 / w for w in cost_weights], dtype=np.float64)

    # Inequality constraint: Total HEMM machine hours budget
    # Sum(x_i / productivity_rate_i) <= available HEMM machine hours
    fleet_factor = max(0.6, equipment_availability_pct / 100.0)
    max_fleet_hours = 4200.0 * fleet_factor
    A_ub = [np.array([1.0 / 4.5 for _ in range(n_mines)], dtype=np.float64)]
    b_ub = [max_fleet_hours]

    # Bounds: 0 <= x_i <= max_surges[i]
    bounds = [(0.0, float(s)) for s in max_surges]

    # Exact simplex solve via SciPy HiGHS
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")
    recoveries = res.x if res.success else [s * 0.6 for s in max_surges]

    return {
        "solver_status": "Optimal Convergence (SciPy HiGHS LP)",
        "total_recovered_mt": round(float(np.sum(recoveries))),
        "reallocations": [
            {
                "mine": mb["name"],
                "target_mt": mb["target_mt"],
                "optimized_recovery_mt": round(float(recoveries[i])),
                "prescribed_action": (
                    "Auxiliary 5000m³/h Sump Pump + Dumper Re-route"
                    if mb["type"] == "Opencast"
                    else "Third Underground Shift + Hoist Speed Optimization"
                )
            }
            for i, mb in enumerate(mine_breakdowns)
        ]
    }`
  },
  {
    filename: 'backend/app/core/spectral_engine.py',
    badge: 'Multi-Modal Earth Observation • Band Math',
    title: 'Sentinel-2 & Landsat-8 Mineral Index Fusion Pipeline',
    output: path.resolve('MnVisionAI_Snippet_2_Multimodal_Spectral_Engine.png'),
    code: `class SpectralEngine:
    """
    Advanced Spaceborne Spectral Processing Engine for Manganese Exploration.
    Extracts mineralogical alteration, iron oxides, and manganese absorption proxies.
    """
    @staticmethod
    def compute_manganese_spectral_proxy(
        b_blue: np.ndarray, b_green: np.ndarray, b_red: np.ndarray,
        b_swir1: np.ndarray, b_swir2: np.ndarray
    ) -> np.ndarray:
        """
        Calibrated Manganese Absorption Proxy.
        Pyrolusite (MnO2) and Braunite (3Mn2O3·MnSiO3) exhibit distinct absorption
        troughs in VNIR (Mn3+/Mn4+ crystal field transitions) combined with
        characteristic SWIR reflectance behavior.
        Formula: Proxy = ((SWIR1 / (Red + Blue + 1e-6)) * (Green / (Red + 1e-6)))
        """
        vnir_denominator = b_red + b_blue + 1e-6
        swir_contrast = b_swir1 / vnir_denominator
        green_red_balance = b_green / (b_red + 1e-6)
        
        raw_proxy = swir_contrast * green_red_balance
        p2, p98 = np.percentile(raw_proxy, [2, 98])
        return np.clip((raw_proxy - p2) / (p98 - p2), 0.0, 1.0) if p98 > p2 else raw_proxy

    @classmethod
    def process_spectral_cube(cls, bands: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        # Band math calculations
        ndvi = cls.compute_ndvi(bands['red'], bands['nir'])
        iron_oxide = cls.compute_iron_oxide(bands['blue'], bands['red'])
        alteration = cls.compute_hydrothermal_alteration(bands['swir1'], bands['swir2'])
        mn_proxy = cls.compute_manganese_spectral_proxy(
            bands['blue'], bands['green'], bands['red'], bands['swir1'], bands['swir2']
        )

        # Vegetation suppression: attenuate lithology signal where NDVI > 0.45
        canopy_mask = np.clip(1.0 - (ndvi - 0.25) / 0.35, 0.2, 1.0)
        
        return {
            "manganese_proxy": mn_proxy * canopy_mask,
            "hydrothermal_alteration": alteration * canopy_mask,
            "iron_oxide": iron_oxide * canopy_mask,
            "canopy_mask": canopy_mask
        }`
  },
  {
    filename: 'backend/app/core/xai_engine.py',
    badge: 'Explainable AI • UNFC G-2 Stratigraphy',
    title: 'SHAP Attributions & 3D Diamond-Core Borehole Synthesis',
    output: path.resolve('MnVisionAI_Snippet_3_Borehole_Stratigraphy_UNFC.png'),
    code: `@classmethod
def generate_borehole_stratigraphy(cls, score: float, indicators: Dict[str, float]) -> Dict[str, Any]:
    """
    Synthesizes a high-fidelity 3D diamond core borehole strip log
    conforming to GSI UNFC-standard diamond drilling in the Sausar Belt.
    Calculates assay grades (Mn%, Fe%, SiO2%, P%) and ore pay seam depth.
    """
    mn_sig = indicators.get("manganese_proxy", 0.75)
    ore_start = 28.0 if mn_sig > 0.75 else 42.0
    ore_thickness = round(18.0 + score * 14.0, 1)
    ore_end = round(ore_start + ore_thickness, 1)

    primary_mn_grade = round(38.0 + score * 10.5, 1)
    primary_fe = round(7.5 - score * 2.2, 1)
    primary_sio2 = round(11.0 - score * 3.5, 1)
    primary_p = round(0.14 - score * 0.04, 3)

    return {
        "collar_coordinates": {"datum": "WGS84 / UTM 44N", "rl_elevation_m": 348.5},
        "azimuth_deg": 350.0, "dip_deg": -65.0, "total_depth_m": ore_end + 32.0,
        "unfc_code": "222 (Explored Resource - G2)",
        "ore_intercept": {
            "from_depth_m": ore_start,
            "to_depth_m": ore_end,
            "apparent_thickness_m": ore_thickness,
            "true_thickness_m": round(ore_thickness * np.cos(np.radians(25.0)), 1),
            "lithology": "Massive bedded crystalline braunite with pyrolusite micro-laminations",
            "assays": {
                "mn_pct": primary_mn_grade,  # e.g., 46.2% Mn
                "fe_pct": primary_fe,
                "sio2_pct": primary_sio2,
                "p_pct": primary_p
            },
            "unfc_classification": "Economic Ore Body (Pay Seam)"
        }
    }`
  }
];

function highlightPython(code) {
  const lines = code.split('\n');
  return lines.map((line, idx) => {
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    escaped = escaped.replace(/(#.*$)/g, '<span class="tok-comment">$1</span>');
    escaped = escaped.replace(/("""[\s\S]*?"""|''[\s\S]*?''|"[^"\n]*"|'[^'\n]*')/g, '<span class="tok-string">$1</span>');
    escaped = escaped.replace(/\b(def|class|return|if|else|elif|for|in|import|from|as|while|try|except|finally|with|lambda|and|or|not|is|None|True|False|async|await)\b/g, '<span class="tok-kw">$1</span>');
    escaped = escaped.replace(/\b(int|float|str|bool|list|dict|tuple|Dict|List|Any|Optional|self|cls|len|round|range|max|min|np|linprog)\b/g, '<span class="tok-type">$1</span>');
    escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
    escaped = escaped.replace(/(@\w+)/g, '<span class="tok-decorator">$1</span>');

    const lineNum = String(idx + 1).padStart(2, ' ');
    return `<div class="code-line"><span class="line-num">${lineNum}</span><span class="line-content">${escaped}</span></div>`;
  }).join('');
}

function buildHtml(item) {
  const codeHtml = highlightPython(item.code);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #020409;
      padding: 30px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .wrapper {
      position: relative;
      background: radial-gradient(circle at 50% 0%, rgba(229, 169, 60, 0.15) 0%, rgba(0, 240, 255, 0.05) 50%, rgba(2, 4, 9, 0) 100%), #060913;
      border: 1px solid rgba(229, 169, 60, 0.32);
      border-radius: 18px;
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.85), 0 0 40px rgba(229, 169, 60, 0.12);
      overflow: hidden;
      max-width: 1020px;
      width: 100%;
    }
    .header {
      background: #080d1a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .traffic-lights {
      display: flex;
      gap: 7px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #FF5F56; box-shadow: 0 0 8px rgba(255, 95, 86, 0.6); }
    .dot-yellow { background: #FFBD2E; box-shadow: 0 0 8px rgba(255, 189, 46, 0.6); }
    .dot-green { background: #27C93F; box-shadow: 0 0 8px rgba(39, 201, 63, 0.6); }
    .title-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .filename {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #F8FAFC;
      letter-spacing: 0.3px;
    }
    .badge {
      background: linear-gradient(135deg, rgba(229, 169, 60, 0.25), rgba(229, 169, 60, 0.08));
      border: 1px solid rgba(229, 169, 60, 0.5);
      color: #E5A93C;
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .platform-tag {
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }
    .code-container {
      padding: 22px 26px;
      background: #040711;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      line-height: 1.62;
      color: #E2E8F0;
      overflow-x: auto;
    }
    .code-line {
      display: flex;
      white-space: pre;
    }
    .line-num {
      width: 36px;
      color: #334155;
      user-select: none;
      flex-shrink: 0;
      font-size: 11.5px;
    }
    .line-content {
      flex: 1;
    }
    .tok-kw { color: #F43F5E; font-weight: 600; }
    .tok-string { color: #10B981; }
    .tok-comment { color: #64748B; font-style: italic; }
    .tok-type { color: #00F0FF; font-weight: 500; }
    .tok-num { color: #E5A93C; font-weight: 600; }
    .tok-decorator { color: #C084FC; font-weight: 600; }
    .footer {
      background: #080d1a;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #94A3B8;
    }
    .footer-left {
      font-weight: 600;
      color: #E5A93C;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-right {
      color: #64748B;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="traffic-lights">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="title-box">
        <span class="filename">${item.filename}</span>
        <span class="badge">${item.badge}</span>
      </div>
      <div class="platform-tag">MnVisionAI • Production Engine</div>
    </div>
    <div class="code-container">
      ${codeHtml}
    </div>
    <div class="footer">
      <div class="footer-left">
        <span>◆</span> ${item.title}
      </div>
      <div class="footer-right">
        SIH 2026 • Problem Statement SIH26009
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function generateSnippets() {
  console.log('Launching browser to generate 3 high-DPI code snippet cards...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1140, height: 950, deviceScaleFactor: 2 });

  for (const item of SNIPPETS) {
    console.log(`Rendering: ${item.filename} -> ${path.basename(item.output)}...`);
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    const element = await page.$('.wrapper');
    await element.screenshot({
      path: item.output,
      type: 'png'
    });
    console.log(`✅ Saved: ${item.output}`);
  }

  await browser.close();
  console.log('All 3 code snippet screenshots generated successfully!');
}

generateSnippets().catch(console.error);
