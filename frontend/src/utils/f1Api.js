// f1Api.js — New API abstraction layer for F1 Pitwall new features.
// DO NOT modify existing utils. This file is purely additive.

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

export const f1Api = {
  // ---------- Ergast / Jolpica ----------

  getDriverStandings: (season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/driverStandings.json`),

  getConstructorStandings: (season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/constructorStandings.json`),

  getDriverResults: (driverId, season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/drivers/${driverId}/results.json?limit=50`),

  getConstructorResults: (constructorId, season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/constructors/${constructorId}/results.json?limit=50`),

  getDriverSeasonStats: (driverId, season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/drivers/${driverId}/driverStandings.json`),

  getConstructorDrivers: (constructorId, season = 'current') =>
    fetchJson(`${ERGAST_BASE}/${season}/constructors/${constructorId}/drivers.json`),

  getRaceResults: (season = 'current', round = 'last') =>
    fetchJson(`${ERGAST_BASE}/${season}/${round}/results.json`),

  getPitStops: (season = 'current', round = 'last') =>
    fetchJson(`${ERGAST_BASE}/${season}/${round}/pitstops.json?limit=100`),

  getFastestLaps: (season = 'current', round = 'last') =>
    fetchJson(`${ERGAST_BASE}/${season}/${round}/fastest/1/results.json`),

  // ---------- OpenF1 Live ----------

  getLiveDrivers: () =>
    fetchJson(`${OPENF1_BASE}/drivers?session_key=latest`),

  getLiveIntervals: () =>
    fetchJson(`${OPENF1_BASE}/intervals?session_key=latest`),

  getLivePositions: () =>
    fetchJson(`${OPENF1_BASE}/position?session_key=latest`),

  getLiveStints: () =>
    fetchJson(`${OPENF1_BASE}/stints?session_key=latest`),

  getLivePitStops: () =>
    fetchJson(`${OPENF1_BASE}/pit?session_key=latest`),

  getLiveSession: () =>
    fetchJson(`${OPENF1_BASE}/sessions?session_key=latest`),

  getLapData: (driverNumber) =>
    fetchJson(`${OPENF1_BASE}/laps?session_key=latest&driver_number=${driverNumber}`),
};

export default f1Api;
