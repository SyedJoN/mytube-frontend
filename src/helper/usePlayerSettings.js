// usePlayerSettings.js
import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'my-player-settings';
const EXPIRATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (parsed.expiration && Date.now() > parsed.expiration) {
      localStorage.removeItem(SETTINGS_KEY);
      return {};
    }

    return parsed.data || {};
  } catch {
    return {};
  }
}

function saveSettings(data) {
  const payload = {
    data,
    expiration: Date.now() + EXPIRATION_MS,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
}

export function usePlayerSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const settings = loadSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  });

  useEffect(() => {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
  }, [key, value]);

  const updateValue = useCallback((val) => {
    setValue(val);
  }, []);

  return [value, updateValue];
}
