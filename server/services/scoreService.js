const { getVillageMetrics } = require("./satelliteService");

async function getVillageScore(villageId, year = 2024) {
  const metrics = await getVillageMetrics(villageId, year);

  const water = Math.round(metrics.ndwi * 100 * 1.3);
  const vegetation = Math.round(metrics.ndvi * 100 * 1.15);
  const climate = Math.round(100 - (metrics.lst_c - 25) * 3);
  const flood = 78;
  const land = Math.round(metrics.soil_moisture * 100 * 1.8);

  const overallScore = Math.round(
    water * 0.25 +
      vegetation * 0.25 +
      climate * 0.2 +
      flood * 0.15 +
      land * 0.15,
  );

  return {
    villageId: String(villageId),
    year,
    overallScore: Math.min(99, Math.max(35, overallScore)),
    status:
      overallScore > 75
        ? "Healthy / Stable"
        : overallScore > 55
          ? "Moderate Stress"
          : "Critical Deficit",
    components: {
      water: Math.min(100, Math.max(20, water)),
      vegetation: Math.min(100, Math.max(20, vegetation)),
      climate: Math.min(100, Math.max(20, climate)),
      flood,
      land: Math.min(100, Math.max(20, land)),
    },
  };
}

module.exports = { getVillageScore };
