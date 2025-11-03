import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as designSystem from '@/themes/design';

export type ThemeMode = 'light' | 'dark';

// Use design system colors for light mode
const lightColors = {
  ...designSystem.colors,
  
  // Legacy aliases for backward compatibility
  text: designSystem.colors.textPrimary,
  textInverted: designSystem.colors.white,
  card: designSystem.colors.surface,
  cardSecondary: designSystem.colors.surfaceVariant,
  cardElevated: designSystem.colors.surface,
  
  // Keep existing extended mood colors
  moodRad: '#FF6B9D',
  moodGood: '#A8E6CF',
  moodMeh: '#FFD93D',
  moodBad: '#FFB366',
  moodAwful: '#FF6B6B',
  moodAnxious: '#87CEEB',
  moodJoyful: '#A8E6CF',
  moodTired: '#E5D4A5',
  
  // Additional legacy colors
  error: designSystem.colors.danger,
  
  // Icon backgrounds (keep for backward compatibility)
  iconBackground: {
    yellow: '#FEEB99',
    cyan: '#80DEEA',
    green: '#D9F7A3',
    purple: '#CE93D8',
    orange: '#FFD799',
    pink: '#F48FB1',
    blue: '#90CAF9',
    lime: '#D9F7A3',
  },
  
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowStrong: 'rgba(0, 0, 0, 0.12)',
};

// Dark mode - use design system with inverted values where appropriate
const darkColors = {
  ...designSystem.colors,
  // Override for dark theme (simplified for now, can be enhanced later)
  primary: '#FFD97D',
  background: '#1F1F1F',
  backgroundGradientStart: '#1F1F1F',
  backgroundGradientEnd: '#2A2A2A',
  surface: '#2A2A2A',
  surfaceVariant: '#333333',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  textLight: '#666666',
  
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  divider: '#3A3A3A',
  
  icon: '#CCCCCC',
  iconActive: '#FFFFFF',
  iconInactive: '#999999',
  
  // Legacy aliases
  text: '#FFFFFF',
  textInverted: '#1E1E1E',
  card: '#2A2A2A',
  cardSecondary: '#333333',
  cardElevated: '#363636',
  
  accent: '#FEEB99',
  secondary: '#D9F7A3',
  
  // Keep existing mood colors
  moodRad: '#FF6B9D',
  moodGood: '#A8E6CF',
  moodMeh: '#FFD93D',
  moodBad: '#FFB366',
  moodAwful: '#FF6B6B',
  moodAnxious: '#87CEEB',
  moodJoyful: '#A8E6CF',
  moodTired: '#E5D4A5',
  
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  danger: '#EF5350',
  info: '#42A5F5',
  
  moodHappy: '#FFE66D',
  moodCalm: '#D4A5E5',
  moodAngry: '#FF6B6B',
  moodSad: '#FFC1CC',
  moodNeutral: '#DCEDC1',
  moodExcited: '#FFE29F',
  moodPalette: ['#FFE66D', '#A8E6CF', '#FF6B6B', '#87CEEB', '#DCEDC1', '#FFE29F'],
  
  iconBackground: {
    yellow: '#FEEB99',
    cyan: '#80DEEA',
    green: '#D9F7A3',
    purple: '#CE93D8',
    orange: '#FFD799',
    pink: '#F48FB1',
    blue: '#90CAF9',
    lime: '#D9F7A3',
  },
  
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayMedium: 'rgba(0, 0, 0, 0.5)',
  overlayStrong: 'rgba(0, 0, 0, 0.7)',
  
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  white: '#2A2A2A',
  black: '#000000',
  transparent: 'transparent',
};

// Use design system gradients
const gradients = {
  ...designSystem.gradients,
  // Convert to array format for backward compatibility
  primary: designSystem.gradients.primary.colors,
  secondary: designSystem.gradients.card.colors,
  background: designSystem.gradients.background.colors,
  warm: designSystem.gradients.background.colors,
  cool: designSystem.gradients.card.colors,
  accent: designSystem.gradients.primary.colors,
  peach: designSystem.gradients.button.colors,
  sunset: designSystem.gradients.button.colors,
  calm: designSystem.gradients.moodCalm.colors,
  energy: designSystem.gradients.moodHappy.colors,
  dark: ['#1F1F1F', '#2A2A2A', '#333333'],
};

// Use design system typography with backward compatible aliases
const typography = {
  ...designSystem.typography,
  fontFamily: {
    regular: 'System' as const,
    medium: 'System' as const,
    semibold: 'System' as const,
    bold: 'System' as const,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    huge: 36,
    massive: 44,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// Use design system spacing with backward compatible aliases
const spacing = {
  ...designSystem.spacing,
  base: 16,
  huge: 48,
  massive: 64,
};

// Use design system radii with backward compatible alias
const borderRadius = {
  ...designSystem.radii,
  base: 20,
  full: 9999,
  pill: 100,
};

// Use design system shadows
const shadows = {
  ...designSystem.elevation,
  button: designSystem.elevation.small,
};

export interface Theme {
  colors: typeof lightColors;
  gradients: typeof gradients;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  radii: typeof borderRadius; // Alias for design system consistency
  shadows: typeof shadows;
  elevation: typeof shadows; // Alias for design system consistency
  icons: typeof designSystem.icons;
  components: typeof designSystem.components;
  mode: ThemeMode;
  // Helper functions from design system
  hexToRgba: typeof designSystem.hexToRgba;
  getLinearGradientProps: typeof designSystem.getLinearGradientProps;
  getShadow: typeof designSystem.getShadow;
  getSpacing: typeof designSystem.getSpacing;
  withOpacity: typeof designSystem.withOpacity;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeModeState(storedTheme);
      } else if (systemColorScheme) {
        setThemeModeState(systemColorScheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setThemeMode]);

  const theme: Theme = useMemo(() => ({
    colors: themeMode === 'light' ? lightColors : darkColors,
    gradients,
    typography,
    spacing,
    borderRadius,
    radii: borderRadius,
    shadows,
    elevation: shadows,
    icons: designSystem.icons,
    components: designSystem.components,
    mode: themeMode,
    // Include helper functions
    hexToRgba: designSystem.hexToRgba,
    getLinearGradientProps: designSystem.getLinearGradientProps,
    getShadow: designSystem.getShadow,
    getSpacing: designSystem.getSpacing,
    withOpacity: designSystem.withOpacity,
  }), [themeMode]);

  const value = useMemo(() => ({
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  }), [theme, themeMode, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export const getThemedColors = (mode: ThemeMode) => {
  return mode === 'light' ? lightColors : darkColors;
};

export const createThemedStyles = <T extends Record<string, any>>(
  stylesFn: (theme: Theme) => T
) => {
  return (theme: Theme) => stylesFn(theme);
};

export { lightColors, darkColors, gradients, typography, spacing, borderRadius, shadows };
