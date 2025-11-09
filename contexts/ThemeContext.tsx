
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { type Settings, type Theme, type FontFamily } from '../types';

interface ThemeContextType extends Settings {
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: FontFamily) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'forest',
  fontSize: 16,
  fontFamily: "'Segoe UI', sans-serif",
  highContrast: false,
  reduceMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('quizAppSettings');
      // Merge saved settings with defaults to ensure new settings are not missed
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error("Could not load settings, using defaults.", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('quizAppSettings', JSON.stringify(settings));
      document.documentElement.setAttribute('data-theme', settings.theme);
      if (settings.highContrast) {
        document.documentElement.setAttribute('data-contrast', 'high');
      } else {
        document.documentElement.removeAttribute('data-contrast');
      }
      // FIX: The try-catch block had a syntax error. A catch statement without braces can only be followed by a single statement. The following closing brace was invalid. Braces have been added to the catch block to correct the syntax. This resolves all reported errors for this file.
    } catch (error) {
      console.error("Could not save settings.", error);
    }
  }, [settings]);

  const value = useMemo(() => ({
    ...settings,
    setTheme: (theme: Theme) => setSettings(s => ({ ...s, theme })),
    setFontSize: (fontSize: number) => setSettings(s => ({ ...s, fontSize })),
    setFontFamily: (fontFamily: FontFamily) => setSettings(s => ({ ...s, fontFamily })),
    setHighContrast: (highContrast: boolean) => setSettings(s => ({ ...s, highContrast })),
    setReduceMotion: (reduceMotion: boolean) => setSettings(s => ({...s, reduceMotion })),
    resetSettings: () => setSettings(defaultSettings),
  }), [settings]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
