// usePersonalization.js — localStorage-only personalization for F1 Pitwall new features.
// No changes to existing auth or user flows. Purely additive.

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'f1pw_personalization';

const DEFAULTS = {
  favoriteDriver: null,   // { driverId, name, team }
  favoriteTeam: null,     // { constructorId, name }
};

export const usePersonalization = () => {
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* quota errors — silently ignore */ }
  }, [prefs]);

  const setFavoriteDriver = useCallback((driver) => {
    setPrefs((p) => ({ ...p, favoriteDriver: driver }));
  }, []);

  const setFavoriteTeam = useCallback((team) => {
    setPrefs((p) => ({ ...p, favoriteTeam: team }));
  }, []);

  const clearFavoriteDriver = useCallback(() => {
    setPrefs((p) => ({ ...p, favoriteDriver: null }));
  }, []);

  const clearFavoriteTeam = useCallback(() => {
    setPrefs((p) => ({ ...p, favoriteTeam: null }));
  }, []);

  const isFavoriteDriver = useCallback(
    (driverId) => prefs.favoriteDriver?.driverId === driverId,
    [prefs.favoriteDriver]
  );

  const isFavoriteTeam = useCallback(
    (constructorId) => prefs.favoriteTeam?.constructorId === constructorId,
    [prefs.favoriteTeam]
  );

  return {
    prefs,
    setFavoriteDriver,
    setFavoriteTeam,
    clearFavoriteDriver,
    clearFavoriteTeam,
    isFavoriteDriver,
    isFavoriteTeam,
  };
};

export default usePersonalization;
