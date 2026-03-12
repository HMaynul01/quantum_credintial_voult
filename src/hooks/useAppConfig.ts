// FIX: Import React to use React.ElementType.
import React from 'react';
import { useState, useEffect } from 'react';
import { AppCustomization } from '../types';
import { Shield, Lock, Hexagon, Terminal, Box } from 'lucide-react';

const APP_CUSTOMIZATION_KEY = 'QAV_APP_CUSTOMIZATION';

const APP_ICONS: Record<string, React.ElementType> = {
  'Shield': Shield, 'Lock': Lock, 'Hexagon': Hexagon, 'Terminal': Terminal, 'Box': Box
};

const DEFAULT_APP_CONFIG: AppCustomization = {
  appTitle: "QUANTUM AUTHENTICATION VAULT",
  appFooter: "QAV SYSTEM v8.0 | NEON HORIZON",
  appIcon: 'Shield',
  subscriptionTiers: [],
  activeAnnouncement: null,
};

const useAppConfig = () => {
  const [appConfig, setAppConfig] = useState<AppCustomization>(DEFAULT_APP_CONFIG);

  useEffect(() => {
    const savedConfig = localStorage.getItem(APP_CUSTOMIZATION_KEY);
    if (savedConfig) {
      try {
        setAppConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse app config from localStorage", e);
      }
    }
  }, []);

  const updateAppConfig = (updates: Partial<AppCustomization>) => {
    const newConfig = { ...appConfig, ...updates };
    setAppConfig(newConfig);
    localStorage.setItem(APP_CUSTOMIZATION_KEY, JSON.stringify(newConfig));
  };

  const AppIcon = APP_ICONS[appConfig.appIcon] || Shield;

  return {
    appConfig,
    updateAppConfig,
    AppIcon,
  };
};

export default useAppConfig;