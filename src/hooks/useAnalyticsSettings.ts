import { useState, useEffect } from "react";

export interface AnalyticsSettings {
  usage: boolean;
  performance: boolean;
  statistics: boolean;
  historical: boolean;
  comparison: boolean;
}

const DEFAULT_SETTINGS: AnalyticsSettings = {
  usage: true,
  performance: true,
  statistics: true,
  historical: true,
  comparison: true,
};

const STORAGE_KEY = "analytics-settings";

export function useAnalyticsSettings() {
  const [settings, setSettings] = useState<AnalyticsSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load analytics settings:", error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save analytics settings:", error);
    }
  }, [settings]);

  const toggleMetric = (metric: keyof AnalyticsSettings) => {
    setSettings((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const enableAll = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const disableAll = () => {
    setSettings({
      usage: false,
      performance: false,
      statistics: false,
      historical: false,
      comparison: false,
    });
  };

  return {
    settings,
    toggleMetric,
    resetSettings,
    enableAll,
    disableAll,
  };
}
