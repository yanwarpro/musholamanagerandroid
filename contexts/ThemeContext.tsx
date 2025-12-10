import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'dark' | 'light';

interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGradientStart: string;
  bgGradientMiddle: string;
  bgGradientEnd: string;
  
  // Card colors
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Blur tint
  blurTint: 'dark' | 'light';
  
  // Input colors
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  
  // Overlay
  overlay: string;
}

const darkTheme: ThemeColors = {
  bgPrimary: '#0A1628',
  bgSecondary: '#0D2B3E',
  bgTertiary: '#122A3D',
  bgGradientStart: '#0A1628',
  bgGradientMiddle: '#0D2B3E',
  bgGradientEnd: '#0A1628',
  
  cardBg: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.15)',
  cardShadow: '#7FFFD4',
  
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  
  accent: '#7FFFD4',
  accentLight: '#98FFE0',
  accentDark: '#5FCFB0',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  blurTint: 'dark',
  
  inputBg: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.15)',
  inputPlaceholder: 'rgba(255, 255, 255, 0.3)',
  
  overlay: 'rgba(10, 22, 40, 0.4)',
};

const lightTheme: ThemeColors = {
  bgPrimary: '#F0F9F6',
  bgSecondary: '#E8F5F0',
  bgTertiary: '#FFFFFF',
  bgGradientStart: '#F0F9F6',
  bgGradientMiddle: '#E8F5F0',
  bgGradientEnd: '#F0F9F6',
  
  cardBg: 'rgba(255, 255, 255, 0.9)',
  cardBorder: 'rgba(0, 100, 80, 0.15)',
  cardShadow: '#0D9488',
  
  textPrimary: '#0F172A',
  textSecondary: 'rgba(15, 23, 42, 0.7)',
  textMuted: 'rgba(15, 23, 42, 0.5)',
  
  accent: '#0D9488',
  accentLight: '#14B8A6',
  accentDark: '#0F766E',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  
  blurTint: 'light',
  
  inputBg: 'rgba(255, 255, 255, 0.8)',
  inputBorder: 'rgba(0, 100, 80, 0.2)',
  inputPlaceholder: 'rgba(15, 23, 42, 0.4)',
  
  overlay: 'rgba(240, 249, 246, 0.4)',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@mushola_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Load saved theme on mount
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeColors };
