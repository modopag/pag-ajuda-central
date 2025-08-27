import { useState, useEffect } from 'react';
import { getDataAdapter } from '@/lib/data-adapter';
import type { GlobalSEOSettings, HelpQuickSettings, ReclameAquiSettings, BrandSettings } from '@/types/admin';

interface SettingsState {
  seo: GlobalSEOSettings;
  help: HelpQuickSettings;
  reclame: ReclameAquiSettings;
  brand: BrandSettings;
  loading: boolean;
}

const defaultSettings: SettingsState = {
  seo: {
    default_title: "",
    default_meta_description: "",
    default_og_image: "",
    robots_txt: "",
    site_url: "https://ajuda.modopag.com.br/",
    google_analytics_id: "G-XXXXXXXXXX", // Fallback GA ID
  },
  help: {
    phone: "",
    whatsapp_url: "https://wa.me/5571981470573",
    email: "suporte@modopag.com.br",
    is_active: true,
  },
  reclame: {
    cards: []
  },
  brand: {
    logo_black_url: "",
    logo_yellow_url: "",
    logo_icon_url: "",
    favicon_url: "",
  },
  loading: false, // Changed to false for immediate rendering
};

const CACHE_KEY = 'modopag_settings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCachedSettings = () => {
  // Try to get cached settings immediately
  const getCachedSettings = (): SettingsState | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (isExpired) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return { ...data, loading: false };
    } catch {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const [settings, setSettings] = useState<SettingsState>(() => {
    const cached = getCachedSettings();
    return cached || defaultSettings;
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const adapter = await getDataAdapter();
      const allSettings = await adapter.getAllSettings();
      
      const newSettings = { ...defaultSettings };
      
      allSettings.forEach((setting) => {
        const value = setting.type === 'json' ? JSON.parse(setting.value) : setting.value;
        
        switch (setting.key) {
          case 'global_seo':
            newSettings.seo = { ...newSettings.seo, ...value };
            break;
          case 'help_quick':
            newSettings.help = { ...newSettings.help, ...value };
            break;
          case 'reclame_aqui':
            newSettings.reclame = value;
            break;
          case 'brand':
            newSettings.brand = value;
            break;
        }
      });
      
      const finalSettings = { ...newSettings, loading: false };
      setSettings(finalSettings);
      
      // Cache the settings
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: finalSettings,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default settings if loading fails
      setSettings(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    ...settings,
    reload: loadSettings,
  };
};
