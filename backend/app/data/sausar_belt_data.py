"""
Sausar Belt Manganese Geological and Mining Database.
Centered on the prime manganese corridor in Central India (Balaghat-Nagpur-Bhandara districts).
This is the operational epicenter of MOIL Limited.
"""

from typing import List, Dict, Any

# Primary Exploration Study Region (Sausar Belt - Balaghat/Nagpur Sector)
# Bounding box covers prominent manganese deposits: 21.30°N to 22.10°N, 79.10°E to 80.60°E
STUDY_AREA = {
    "name": "Central India Sausar Manganese Corridor",
    "district": "Balaghat (MP) & Nagpur-Bhandara (MH)",
    "bounds": {
        "min_lat": 21.30,
        "max_lat": 22.10,
        "min_lon": 79.10,
        "max_lon": 80.60
    },
    "center": [21.70, 79.85],
    "zoom": 10,
    "description": "Prolific Proterozoic Sausar Group hosting high-grade braunite, pyrolusite, and gondite ore bodies."
}

# Verified Historical Mines & Occurrences (Ground Truth Positives)
# Sourced from GSI (Geological Survey of India) Bhukosh and MOIL operational data
KNOWN_MINES: List[Dict[str, Any]] = [
    {
        "id": "MOIL-MN-01",
        "name": "Balaghat Mine (Bharweli)",
        "district": "Balaghat, MP",
        "operator": "MOIL Limited",
        "lat": 21.867,
        "lon": 80.200,
        "status": "Active (Underground & Opencast)",
        "formation": "Munsar Formation",
        "ore_type": "High Grade Braunite / Pyrolusite",
        "reserves_mt": 24.5,
        "avg_grade_mn_pct": 46.5,
        "depth_meters": 380,
        "strike_length_km": 2.8,
        "significance": "Deepest and largest underground manganese mine in Asia."
    },
    {
        "id": "MOIL-MN-02",
        "name": "Dongri Buzurg Mine",
        "district": "Bhandara, MH",
        "operator": "MOIL Limited",
        "lat": 21.550,
        "lon": 79.683,
        "status": "Active (Opencast)",
        "formation": "Munsar Formation",
        "ore_type": "High Grade Peroxide Ore (MnO2)",
        "reserves_mt": 14.8,
        "avg_grade_mn_pct": 48.2,
        "depth_meters": 135,
        "strike_length_km": 2.1,
        "significance": "India's premier source of battery-grade high-purity manganese dioxide."
    },
    {
        "id": "MOIL-MN-03",
        "name": "Chikla Mine",
        "district": "Bhandara, MH",
        "operator": "MOIL Limited",
        "lat": 21.558,
        "lon": 79.742,
        "status": "Active (Underground)",
        "formation": "Munsar Formation",
        "ore_type": "Medium to High Grade Braunite",
        "reserves_mt": 9.2,
        "avg_grade_mn_pct": 42.0,
        "depth_meters": 220,
        "strike_length_km": 1.9,
        "significance": "Continuous tabular deposit with strong structural synclinal fold control."
    },
    {
        "id": "MOIL-MN-04",
        "name": "Tirodi Mine",
        "district": "Balaghat, MP",
        "operator": "MOIL Limited",
        "lat": 21.683,
        "lon": 79.717,
        "status": "Active (Opencast)",
        "formation": "Munsar Formation / Gondite",
        "ore_type": "Braunite & Psilomelane in Gondite",
        "reserves_mt": 11.4,
        "avg_grade_mn_pct": 39.5,
        "depth_meters": 95,
        "strike_length_km": 3.4,
        "significance": "Classic type locality for gonditic manganese silicate-carbonate protore."
    },
    {
        "id": "MOIL-MN-05",
        "name": "Ukwa Mine",
        "district": "Balaghat, MP",
        "operator": "MOIL Limited",
        "lat": 21.967,
        "lon": 80.467,
        "status": "Active (Underground)",
        "formation": "Ukwa-Bharweli horizon",
        "ore_type": "Syngenetic Sedimentary Braunite",
        "reserves_mt": 16.3,
        "avg_grade_mn_pct": 41.8,
        "depth_meters": 190,
        "strike_length_km": 5.2,
        "significance": "Unusually long tabular seam with minimal folding disruption."
    },
    {
        "id": "MOIL-MN-06",
        "name": "Mansar Mine",
        "district": "Nagpur, MH",
        "operator": "MOIL Limited",
        "lat": 21.400,
        "lon": 79.283,
        "status": "Active (Opencast & Underground)",
        "formation": "Munsar Formation",
        "ore_type": "Ferruginous Manganese Ore",
        "reserves_mt": 7.6,
        "avg_grade_mn_pct": 38.0,
        "depth_meters": 140,
        "strike_length_km": 1.6,
        "significance": "Type area of Munsar Formation containing rich historical workings."
    },
    {
        "id": "MOIL-MN-07",
        "name": "Kandri Mine",
        "district": "Nagpur, MH",
        "operator": "MOIL Limited",
        "lat": 21.417,
        "lon": 79.267,
        "status": "Active (Opencast)",
        "formation": "Munsar Formation",
        "ore_type": "Hard Lumpy Braunite",
        "reserves_mt": 6.8,
        "avg_grade_mn_pct": 44.5,
        "depth_meters": 110,
        "strike_length_km": 1.4,
        "significance": "Produces premium metallurgical grade lump ore for ferromanganese plants."
    },
    {
        "id": "MOIL-MN-08",
        "name": "Gumgaon Mine",
        "district": "Nagpur, MH",
        "operator": "MOIL Limited",
        "lat": 21.383,
        "lon": 79.200,
        "status": "Active (Underground)",
        "formation": "Munsar Formation",
        "ore_type": "Braunite & Jacobsite",
        "reserves_mt": 5.4,
        "avg_grade_mn_pct": 40.2,
        "depth_meters": 260,
        "strike_length_km": 1.2,
        "significance": "Steeply dipping synformal deposit requiring deep shaft mining."
    }
]

# Major Lithological Formations in the Sausar Group
GEOLOGICAL_FORMATIONS = [
    {
        "name": "Munsar Formation",
        "rock_type": "Mica Schist & Gondite with Bedded Manganese Ore",
        "prospectivity_prior": 0.88,
        "description": "Primary ore horizon hosting over 80% of Central Indian manganese reserves."
    },
    {
        "name": "Chorbaoli Formation",
        "rock_type": "Quartzite & Quartz-Muscovite Schist",
        "prospectivity_prior": 0.42,
        "description": "Competent quartzitic footwall often bordering structural contacts."
    },
    {
        "name": "Bichua Formation",
        "rock_type": "Dolomitic Marble & Calc-Silicate Rocks",
        "prospectivity_prior": 0.35,
        "description": "Carbonate rocks locally associated with secondary hydrothermal supergene enrichment."
    },
    {
        "name": "Lohangi Formation",
        "rock_type": "Pink and White Calcite Marbles",
        "prospectivity_prior": 0.28,
        "description": "Basal carbonate member with minor associated manganese occurrences."
    },
    {
        "name": "Tirodi Biotite Gneiss",
        "rock_type": "Basement Gneiss & Granitoid",
        "prospectivity_prior": 0.08,
        "description": "Archean basement complex; sterile for primary syngenetic manganese ore."
    }
]

# Operational Mines for MOIL Production Simulator
MOIL_OPERATING_MINES = [
    {
        "mine_id": "BAL-01",
        "name": "Balaghat Underground",
        "monthly_target_mt": 35000,
        "type": "Underground",
        "weather_sensitivity": "Medium",
        "machinery_count": {"dumpers": 12, "loaders": 8, "drills": 6, "hoists": 3},
        "critical_sump_capacity_m3": 15000
    },
    {
        "mine_id": "DON-02",
        "name": "Dongri Buzurg Opencast",
        "monthly_target_mt": 30000,
        "type": "Opencast",
        "weather_sensitivity": "High",
        "machinery_count": {"dumpers": 22, "excavators": 6, "drills": 5, "graders": 3},
        "critical_sump_capacity_m3": 8000
    },
    {
        "mine_id": "CHK-03",
        "name": "Chikla Underground",
        "monthly_target_mt": 18000,
        "type": "Underground",
        "weather_sensitivity": "Low",
        "machinery_count": {"dumpers": 8, "loaders": 5, "drills": 4, "hoists": 2},
        "critical_sump_capacity_m3": 10000
    },
    {
        "mine_id": "TIR-04",
        "name": "Tirodi Opencast",
        "monthly_target_mt": 16000,
        "type": "Opencast",
        "weather_sensitivity": "High",
        "machinery_count": {"dumpers": 14, "excavators": 4, "drills": 4, "graders": 2},
        "critical_sump_capacity_m3": 6000
    },
    {
        "mine_id": "UKW-05",
        "name": "Ukwa Underground",
        "monthly_target_mt": 15000,
        "type": "Underground",
        "weather_sensitivity": "Medium",
        "machinery_count": {"dumpers": 7, "loaders": 4, "drills": 4, "hoists": 2},
        "critical_sump_capacity_m3": 9000
    }
]
