import { useState, useEffect } from 'react';
import defaultConfig from './config.json';

function deepMerge(a, b) {
  const result = { ...a };
  for (const key of Object.keys(b || {})) {
    if (
      b[key] && typeof b[key] === 'object' && !Array.isArray(b[key]) &&
      a[key] && typeof a[key] === 'object' && !Array.isArray(a[key])
    ) {
      result[key] = { ...a[key], ...b[key] };
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

export function useConfig() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('safepulse_config');
      if (saved) {
        return deepMerge(defaultConfig, JSON.parse(saved));
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
          const merged = deepMerge(defaultConfig, serverConfig);
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
    '--color-primary-hover': config.branding.primaryHover || config.branding.primaryColor,
    '--color-accent': config.branding.accentColor,
    '--color-accent-hover': config.branding.accentHover || config.branding.accentColor,
    '--color-bg': config.branding.backgroundColor,
    '--color-header-bg': config.branding.headerBg,
    '--color-header-text': config.branding.headerText,
    '--color-header-bg-hover': config.branding.headerBgHover || config.branding.headerBg,
    '--color-body-text': config.branding.bodyTextColor || '#4a4f55',
    '--color-card-bg': config.branding.cardBg || '#f8f9fa',
    '--color-card-border': config.branding.cardBorder || '#e0e3e8',
    '--font-family': config.branding.fontFamily,
    '--radius-sm': config.branding.borderRadiusSm || '8px',
    '--radius-lg': config.branding.borderRadiusLg || '12px',
  };

  return { config, loaded, updateConfig, cssVars };
}
