const express = require("express");
const { requireFields } = require("../utils/validators");

const router = express.Router();

// Hardcoded common cities for INSTANT millisecond response
const POPULAR_CITIES = {
  "mumbai": [72.8777, 19.0760],
  "pune": [73.8567, 18.5204],
  "bangalore": [77.5946, 12.9716],
  "bengaluru": [77.5946, 12.9716],
  "delhi": [77.2090, 28.6139],
  "new delhi": [77.2090, 28.6139],
  "goa": [74.1240, 15.2993],
  "panaji": [73.8278, 15.4909],
  "chennai": [80.2707, 13.0827],
  "hyderabad": [78.4867, 17.3850],
  "kolkata": [88.3639, 22.5726],
  "chandigarh": [76.7794, 30.7333],
  "kochi": [76.2673, 9.9312],
  "ahmedabad": [72.5714, 23.0225],
  "jaipur": [75.7873, 26.9124]
};

const geocodeCache = new Map();
const routeCache = new Map();

async function geocodeIndia(city) {
  const normalized = String(city).trim().toLowerCase();
  if (POPULAR_CITIES[normalized]) return POPULAR_CITIES[normalized];
  if (geocodeCache.has(normalized)) return geocodeCache.get(normalized);

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(city)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "RouteNest/1.0 (routing demo)" }
  });
  if (!response.ok) throw new Error("Geocoding failed");
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) throw new Error("City not found");
  
  const coords = [Number(data[0].lon), Number(data[0].lat)];
  geocodeCache.set(normalized, coords);
  return coords;
}

function classifyTraffic(delayMinutes) {
  if (delayMinutes <= 8) return { congestion: "18%", impact: "Low traffic" };
  if (delayMinutes <= 22) return { congestion: "36%", impact: "Moderate traffic" };
  return { congestion: "58%", impact: "Heavy traffic" };
}

function toRoutePayload(route, index) {
  const distanceKm = Math.max(1, Math.round((Number(route.distance) || 0) / 1000));
  const etaMinutes = Math.max(1, Math.round((Number(route.duration) || 0) / 60));
  const noTrafficMinutes = etaMinutes;
  const syntheticDelay = Math.max(4, Math.round(noTrafficMinutes * (0.06 + index * 0.07)));
  const tf = classifyTraffic(syntheticDelay);
  const congestionPct = parseInt(String(tf.congestion).replace("%", ""), 10) || 0;
  const coords = Array.isArray(route.geometry?.coordinates) ? route.geometry.coordinates : [];

  return {
    id: `osrm-${index}-${Date.now()}`,
    name: index === 0 ? "Fastest Route" : index === 1 ? "Alternate Route" : "Scenic Route",
    distanceKm,
    etaMinutes,
    congestion: tf.congestion,
    congestionPct,
    delayMinutes: syntheticDelay,
    trafficImpact: tf.impact,
    highTraffic: congestionPct > 30,
    recommended: false,                 // set below after we know the min
    path: coords.map((c) => [c[1], c[0]]),
  };
}

async function buildORSRoutes(start, destination, waypoints = []) {
  const points = [start, ...waypoints.slice(0, 2), destination];
  const coords = [];
  for (const p of points) coords.push(await geocodeIndia(p));

  const coordString = coords.map(([lon, lat]) => `[${lon},${lat}]`).join(",");
  const body = `{"coordinates":[${coordString}]}`;
  
  // Instant millisecond cache hit for identical routes
  const cacheKey = coordString;
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  const orsKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjEwODI5Zjk0YTBjMDRjODNhZjZiYjY2N2EyMmE2MTJmIiwiaCI6Im11cm11cjY0In0=";
  const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": orsKey,
      "Content-Type": "application/json"
    },
    body
  });
  
  if (!response.ok) throw new Error("ORS routing failed");
  const json = await response.json();
  if (!json.features || !json.features.length) {
    throw new Error("No ORS route found");
  }

  const payloads = json.features.slice(0, 3).map((f, i) => {
    return toRoutePayload({
      distance: f.properties?.summary?.distance || 0,
      duration: f.properties?.summary?.duration || 0,
      geometry: { coordinates: f.geometry?.coordinates || [] }
    }, i);
  });

  // ORS usually returns 1 route. Simulate alternatives to ensure users always see 3 routes to compare.
  if (payloads.length === 1) {
    const base = payloads[0];
    payloads.push({
      ...base,
      id: `ors-1-${Date.now()}`,
      name: "Alternate Route",
      distanceKm: Math.round(base.distanceKm * 1.05),
      etaMinutes: Math.round(base.etaMinutes * 1.1),
      congestionPct: Math.min(100, base.congestionPct + 15),
      delayMinutes: base.delayMinutes + 10,
      trafficImpact: "Moderate traffic",
      highTraffic: (base.congestionPct + 15) > 30,
      path: base.path.map(([lat, lng]) => [lat + 0.001, lng + 0.001])
    });
    payloads.push({
      ...base,
      id: `ors-2-${Date.now()}`,
      name: "Scenic Route",
      distanceKm: Math.round(base.distanceKm * 1.15),
      etaMinutes: Math.round(base.etaMinutes * 1.25),
      congestionPct: Math.max(0, base.congestionPct - 20),
      delayMinutes: Math.max(0, base.delayMinutes - 5),
      trafficImpact: "Low traffic",
      highTraffic: false,
      path: base.path.map(([lat, lng]) => [lat - 0.002, lng - 0.002])
    });
  } else if (payloads.length === 2) {
    const base = payloads[0];
    payloads.push({
      ...base,
      id: `ors-2-${Date.now()}`,
      name: "Scenic Route",
      distanceKm: Math.round(base.distanceKm * 1.15),
      etaMinutes: Math.round(base.etaMinutes * 1.25),
      congestionPct: Math.max(0, base.congestionPct - 20),
      delayMinutes: Math.max(0, base.delayMinutes - 5),
      trafficImpact: "Low traffic",
      highTraffic: false,
      path: base.path.map(([lat, lng]) => [lat - 0.002, lng - 0.002])
    });
  }

  // Recommendation = lowest congestion %, tie-broken by lowest ETA
  let recIdx = 0;
  for (let i = 1; i < payloads.length; i++) {
    const a = payloads[i], b = payloads[recIdx];
    if (a.congestionPct < b.congestionPct ||
        (a.congestionPct === b.congestionPct && a.etaMinutes < b.etaMinutes)) {
      recIdx = i;
    }
  }
  const waypointCoords = coords.slice(1, -1).map(([lon, lat]) => [lat, lon]);
  payloads.forEach((p, i) => { 
    p.recommended = i === recIdx; 
    p.waypoints = waypointCoords;
  });
  
  routeCache.set(cacheKey, payloads);
  return payloads;
}

router.post("/plan", async (req, res) => {
  const err = requireFields(req.body || {}, ["start", "destination"]);
  if (err) return res.status(400).json({ error: err });

  const start = String(req.body.start || "").trim();
  const destination = String(req.body.destination || "").trim();
  const waypoints = Array.isArray(req.body.waypoints)
    ? req.body.waypoints.map((w) => String(w).trim()).filter(Boolean)
    : [];

  try {
    const routes = await buildORSRoutes(start, destination, waypoints);
    return res.json({ source: "vendor", provider: "ors", routes });
  } catch (_error) {
    return res.status(400).json({
      error: "Unable to build route for these cities right now. Try a nearby city name."
    });
  }
});

/* ── Saved Routes ────────────────────────────────────────── */

/* GET /api/planner/saved/:userId — get all saved routes for user */
router.get("/saved/:userId", (req, res) => {
  const { getStore } = require("../data/store");
  const userId = String(req.params.userId);
  const savedRoutes = getStore().savedRoutes || {};
  res.json(savedRoutes[userId] || []);
});

/* POST /api/planner/saved/:userId — save a route */
router.post("/saved/:userId", (req, res) => {
  const { getStore } = require("../data/store");
  const store = getStore();
  if (!store.savedRoutes) store.savedRoutes = {};

  const userId = String(req.params.userId);
  const { name, start, destination, waypoints, route } = req.body || {};
  if (!name || !route) {
    return res.status(400).json({ error: "name and route are required." });
  }

  if (!store.savedRoutes[userId]) store.savedRoutes[userId] = [];
  const list = store.savedRoutes[userId];
  const saved = {
    id: list.length > 0 ? Math.max(...list.map((s) => s.id)) + 1 : 1,
    name,
    start: start || "",
    destination: destination || "",
    waypoints: waypoints || [],
    route,
    savedAt: new Date().toISOString(),
  };
  list.push(saved);
  res.status(201).json(saved);
});

/* DELETE /api/planner/saved/:userId/:routeId — remove saved route */
router.delete("/saved/:userId/:routeId", (req, res) => {
  const { getStore } = require("../data/store");
  const store = getStore();
  const savedRoutes = store.savedRoutes || {};
  const userId = String(req.params.userId);
  const routeId = Number(req.params.routeId);
  if (!savedRoutes[userId]) {
    return res.status(404).json({ error: "No saved routes found." });
  }
  const idx = savedRoutes[userId].findIndex((s) => s.id === routeId);
  if (idx === -1) {
    return res.status(404).json({ error: "Saved route not found." });
  }
  savedRoutes[userId].splice(idx, 1);
  res.json({ message: "Saved route removed." });
});

module.exports = router;

