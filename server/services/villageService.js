const fs = require("fs");
const path = require("path");
const axios = require("axios");

const VillageModel = require("../models/Village.js");

const searchCache = new Map();
const boundaryCache = new Map();
const searchIndex = [];

function unwrapGeometry(value) {
  if (!value || typeof value !== "object") return null;
  if (value.type === "Feature") return value.geometry || null;
  if (value.type === "FeatureCollection") {
    return value.features?.[0]?.geometry || null;
  }
  return value;
}

function getOuterRing(geometry) {
  const normalized = unwrapGeometry(geometry);
  if (!normalized || !Array.isArray(normalized.coordinates)) return null;

  const coordinates = normalized.coordinates;
  if (normalized.type === "Polygon") {
    return Array.isArray(coordinates[0]) ? coordinates[0] : null;
  }
  if (normalized.type === "MultiPolygon") {
    return Array.isArray(coordinates[0]?.[0]) ? coordinates[0][0] : null;
  }
  return null;
}

function computePolygonAreaSqm(geometry) {
  // Basic bounding box approximation for area in square meters.
  const coords = getOuterRing(geometry);
  if (!coords || coords.length === 0) return 1000000;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of coords) {
    if (!Array.isArray(p) || p.length < 2) continue;
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return 1000000;
  const widthM =
    (maxX - minX) * 111000 * Math.cos(((minY + maxY) / 2) * (Math.PI / 180));
  const heightM = (maxY - minY) * 111000;
  return Math.max(100000, Math.abs(widthM * heightM * 0.75));
}

async function loadVillages() {
  try {
    searchCache.clear();
    boundaryCache.clear();
    searchIndex.length = 0;

    const dataDir = path.resolve("data");
    const geojsonPath = path.join(dataDir, "maharashtra.geojson");

    if (fs.existsSync(geojsonPath)) {
      const raw = fs.readFileSync(geojsonPath, "utf-8");
      const parsed = JSON.parse(raw);
      const features = parsed.features || [];

      let count = 0;
      for (const feat of features) {
        const props = feat.properties || {};
        const geom = feat.geometry || {};
        if (!geom || !["Polygon", "MultiPolygon"].includes(geom.type)) continue;

        const v_id = String(props.id || count + 1);
        const name = props.name || "Unknown";
        const district = props.district || "Unknown";
        const state = props.state || "Maharashtra";

        let lat = 20.0,
          lon = 78.0;
        const coords = geom.coordinates;
        if (coords && coords.length > 0) {
          const pts =
            geom.type === "MultiPolygon" ? coords[0]?.[0] || [] : coords[0];
          if (pts.length > 0) {
            lon = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
            lat = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
          }
        }

        const areaHa = computePolygonAreaSqm(geom) / 10000.0;

        const village = {
          id: v_id,
          name,
          nameHindi: name,
          district,
          state,
          coordinates: [lat, lon],
          lat,
          lon,
          boundary: geom,
          area: areaHa,
          soilType: props.soilType || "Black Cotton / Clay Loam",
          primaryCrops: ["Soybean", "Cotton", "Sugarcane", "Chickpea"],
        };

        searchCache.set(v_id, village);
        boundaryCache.set(v_id, geom);
        searchIndex.push({
          id: v_id,
          name,
          district,
          state,
        });

        // Async seed into MongoDB
        VillageModel.updateOne(
          { id: v_id },
          { $set: village },
          { upsert: true },
        ).catch(() => {});

        count++;
      }
      console.log(
        `[VillageService] Loaded ${count} villages into index & DB cache.`,
      );
    }
  } catch (err) {
    console.error("[VillageService Error]", err.message);
  }
}

async function searchVillages(query) {
  if (!query) return searchIndex.slice(0, 20);
  const q = query.toLowerCase();

  // Primary local index search
  const matches = searchIndex.filter((item) =>
    item.name.toLowerCase().includes(q),
  );
  if (matches.length > 0) {
    return matches.slice(0, 20);
  }

  // Fallback OSM Nominatim Geocoding
  try {
    const resp = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: `${query}, India`,
        format: "json",
        polygon_geojson: 1,
        limit: 5,
      },
      headers: { "User-Agent": "GramDrishti-Farmer-Platform/1.0" },
      timeout: 5000,
    });

    if (resp.data && resp.data.length > 0) {
      const results = [];
      for (const item of resp.data) {
        const v_id = `osm_${item.place_id}`;
        const name = item.display_name.split(",")[0] || query;
        const district =
          item.display_name.split(",")[1]?.trim() || "Custom District";
        const polygon = item.geojson || {
          type: "Polygon",
          coordinates: [
            [
              [parseFloat(item.lon) - 0.02, parseFloat(item.lat) - 0.02],
              [parseFloat(item.lon) + 0.02, parseFloat(item.lat) - 0.02],
              [parseFloat(item.lon) + 0.02, parseFloat(item.lat) + 0.02],
              [parseFloat(item.lon) - 0.02, parseFloat(item.lat) + 0.02],
              [parseFloat(item.lon) - 0.02, parseFloat(item.lat) - 0.02],
            ],
          ],
        };
        addDynamicVillage(v_id, polygon, name, district);
        results.push({ id: v_id, name, district, state: "India" });
      }
      return results;
    }
  } catch (e) {
    console.warn("[Nominatim Search Warning]", e.message);
  }

  return searchIndex.slice(0, 10);
}

function getVillageById(id) {
  const v_id = String(id);
  return searchCache.get(v_id) || searchCache.get("1") || null;
}

function getVillageBoundary(id) {
  const v_id = String(id);
  return boundaryCache.get(v_id) || boundaryCache.get("1") || null;
}

async function addDynamicVillage(
  v_id,
  polygon,
  name = "Custom Farm Location",
  district = "Dynamic",
) {
  const geometry = unwrapGeometry(polygon) || polygon;
  let lat = 20.0,
    lon = 78.0;
  const coords = getOuterRing(geometry) || [];
  if (coords.length > 0) {
    const validPoints = coords.filter(
      (point) => Array.isArray(point) && point.length >= 2,
    );
    if (validPoints.length > 0) {
      lon = validPoints.reduce((sum, p) => sum + p[0], 0) / validPoints.length;
      lat = validPoints.reduce((sum, p) => sum + p[1], 0) / validPoints.length;
    }
  }

  const areaHa = computePolygonAreaSqm(geometry) / 10000.0;
  const village = {
    id: v_id,
    name: name || v_id,
    nameHindi: name || v_id,
    district,
    state: "Maharashtra",
    coordinates: [lat, lon],
    lat,
    lon,
    boundary: geometry,
    area: areaHa,
    soilType: "Medium Black Soil",
    primaryCrops: ["Soybean", "Wheat", "Gram", "Cotton"],
  };

  searchCache.set(v_id, village);
  boundaryCache.set(v_id, geometry);

  VillageModel.updateOne(
    { id: v_id },
    { $set: village },
    { upsert: true },
  ).catch(() => {});
  return village;
}

function getSearchIndex() {
  return searchIndex;
}

function getAllVillageBoundaries() {
  const features = [];
  for (const [id, village] of searchCache.entries()) {
    if (village.boundary) {
      features.push({
        type: "Feature",
        id,
        properties: {
          id,
          name: village.name,
          district: village.district,
          state: village.state,
        },
        geometry: village.boundary,
      });
    }
  }
  return {
    type: "FeatureCollection",
    features,
  };
}

module.exports = {
  loadVillages,
  searchVillages,
  getVillageById,
  getVillageBoundary,
  addDynamicVillage,
  getSearchIndex,
  getAllVillageBoundaries,
};
