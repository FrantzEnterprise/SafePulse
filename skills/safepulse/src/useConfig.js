import { useState, useEffect } from 'react';
import defaultConfig from './config.json';

export function useConfig() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('safepulse_config');
      if (saved) {
        return { ...defaultConfig, ...JSON.parse(saved) };
      }
    } catch (e) { /* ignore */ }
    return defaultConfig;
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Try fetching a custom config.json from the server (for deployment)
    fetch('./config.json')
      .then(r => r.ok ? r.json() : null)
      .then(serverConfig => {
        if (serverConfig) {
          const merged = { ...defaultConfig, ...serverConfig };
          setConfig(merged);
        }
        setLoaded(true);
      })
      .catch(() => {
        // Fallback: use default or localStorage
        setLoaded(true);
      });
  }, []);

  const updateConfig = (patch) => {
    const newConfig = { ...config, ...patch };
    setConfig(newConfig);
    try {
      localStorage.setItem('safepulse_config', JSON.stringify(newConfig));
    } catch (e) { /* ignore */ }
  };

  // Generate CSS variables from branding
  const cssVars = {
    '--color-primary': config.branding.primaryColor,
    '--color-primary-hover': config.branding.primaryHover,
    '--color-accent': config.branding.accentColor,
    '--color-bg': config.branding.backgroundColor,
    '--color-header-bg': config.branding.headerBg,
    '--color-header-text': config.branding.headerText,
    '--font-family': config.branding.fontFamily,
  };

  return { config, loaded, updateConfig, cssVars };
}
