import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@app_theme_mode';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    disabled: string;
    placeholder: string;
    inputBackground: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#34B27B',
    secondary: '#FDFBF7',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111111',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#CFF5E7',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    disabled: '#D1D5DB',
    placeholder: '#9CA3AF',
    inputBackground: '#FFFFFF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#34B27B',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#34B27B',
    secondary: '#1C1C1C',
    background: '#0E0E0E',
    card: '#1C1C1C',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#065F46',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7',
    disabled: '#4B5563',
    placeholder: '#6B7280',
    inputBackground: '#1F2937',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#34B27B',
  },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const theme: Theme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setThemeModeState(stored);
      } else if (systemColorScheme) {
        setThemeModeState(systemColorScheme);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      console.log('Theme mode set to:', mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  return useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isLoaded,
    }),
    [theme, themeMode, setThemeMode, toggleTheme, isLoaded]
  );
});
