 async function getVillageMetrics(villageId, year = 2024) {
  // Deterministic calculation based on villageId hash and year
  const idNum = parseInt(String(villageId).replace(/\D/g, '') || '1', 10);
  const baseNdvi = 0.52 + ((idNum % 10) * 0.03) - ((2026 - year) * 0.02);
  const baseNdwi = 0.28 + ((idNum % 7) * 0.02);

  return {
    villageId: String(villageId),
    year,
    ndvi: Math.round(Math.min(0.88, Math.max(0.25, baseNdvi)) * 100) / 100,
    ndwi: Math.round(Math.min(0.65, Math.max(0.1, baseNdwi)) * 100) / 100,
    ndmi: Math.round((baseNdvi * 0.85) * 100) / 100,
    lst_c: Math.round((32.5 + (idNum % 5) - (year === 2024 ? 1 : 0)) * 10) / 10,
    soil_moisture: Math.round((0.32 + (baseNdwi * 0.3)) * 100) / 100,
    rainfall_mm: 890 + (idNum % 150),
    temp_c: 28.5
  };
}


module.exports = getVillageMetrics;