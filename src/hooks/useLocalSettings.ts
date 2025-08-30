import { useState, useEffect } from 'react';
import { localApi } from '../lib/localApi';

interface AppSettings {
  app_name: string;
  motogp_enabled: boolean;
  setup_completed: boolean;
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'YourFamily',
    motogp_enabled: true,
    setup_completed: false
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await localApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      await localApi.updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const setupApp = async (setupData: {
    admin_username: string;
    admin_password: string;
    family_code: string;
    app_name: string;
  }) => {
    try {
      const response = await localApi.setupApp(setupData);
      if (response.success) {
        await fetchSettings();
        return { error: null, user: response.user };
      }
      return { error: new Error('Setup failed') };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    setupApp,
    refetchSettings: fetchSettings,
  };
}