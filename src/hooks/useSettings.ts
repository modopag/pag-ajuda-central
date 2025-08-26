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
    google_analytics_id: "",
  },
  help: {
    phone: "",
    whatsapp_url: "",
    email: "",
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
  loading: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

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
            newSettings.seo = value;
            break;
          case 'help_quick':
            newSettings.help = value;
            break;
          case 'reclame_aqui':
            newSettings.reclame = value;
            break;
          case 'brand':
            newSettings.brand = value;
            break;
        }
      });
      
      setSettings({ ...newSettings, loading: false });
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    ...settings,
    reload: loadSettings,
  };
};