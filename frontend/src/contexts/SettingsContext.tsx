import { createContext, useContext, useEffect, useState } from 'react';

interface YesPlusSettings {
  link?: string;
}

interface SettingsContextType {
  yesPlusSettings: YesPlusSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [yesPlusSettings, setYesPlusSettings] = useState<YesPlusSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings/yesplus/link`);
      if (response.ok) {
        const data = await response.json();
        setYesPlusSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and set up polling
  useEffect(() => {
    fetchSettings();

    // Poll for settings updates every 30 seconds
    const pollInterval = setInterval(() => {
      fetchSettings();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ yesPlusSettings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
