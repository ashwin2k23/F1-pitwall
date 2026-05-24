// f1Api.js — New API abstraction layer for F1 Pitwall new features.
// DO NOT modify existing utils. This file is purely additive.

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';  // kept for reference (requires auth)
const FASTF1_BASE = 'http://127.0.0.1:5001/api';   // Free F1 live timing via FastF1/SignalR


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

  // ---------- FastF1 Live Timing (Free — localhost:5001) ----------

  getLiveStatus: () =>
    fetchJson(`${FASTF1_BASE}/live/status`),

  getLiveDrivers: () =>
    fetchJson(`${FASTF1_BASE}/live/drivers`).then(obj =>
      Object.values(obj || {}).map(d => ({
        driver_number: d.number,
        name_acronym: d.acronym,
        team_colour: d.team_color ? d.team_color.replace('#', '') : 'ef4444',
        full_name: d.full_name,
        team_name: d.team_name,
        ...d
      }))
    ),

  getLiveIntervals: () =>
    fetchJson(`${FASTF1_BASE}/live/positions`).then(arr =>
      (arr || []).map(p => ({
        ...p,
        gap_to_leader: p.gap,
        driver_number: p.driver_number,
      }))
    ),

  getLivePositions: () =>
    fetchJson(`${FASTF1_BASE}/live/positions`).then(arr =>
      (arr || []).map(p => ({
        ...p,
        gap_to_leader: p.gap,
        driver_number: p.driver_number,
      }))
    ),

  getLiveStints: () =>
    fetchJson(`${FASTF1_BASE}/live/stints`),

  getLiveTiming: () =>
    fetchJson(`${FASTF1_BASE}/live/timing`),

  getLivePitStops: () =>
    fetchJson(`${FASTF1_BASE}/live/positions`),

  getLiveSession: () =>
    fetchJson(`${FASTF1_BASE}/live/status`).then(d => [{
      status: d.connected ? 'Started' : 'Inactive',
      session_name: d.session?.name || 'Race',
      race_name: d.session?.gp_name || 'Grand Prix',
      ...d.session,
    }]),

  getLapData: () =>
    fetchJson(`${FASTF1_BASE}/live/positions`),

  getLiveWeather: () =>
    fetchJson(`${FASTF1_BASE}/live/weather`),

  getRaceControl: () =>
    fetchJson(`${FASTF1_BASE}/live/race-control`),
};

export default f1Api;
