import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as designSystem from '@/themes/design';
import { getPaletteColors, type ColorPalette } from '@/themes/colorPalettes';
import { getIconPalette, type IconPalette, type IconStyle } from '@/themes/iconPalettes';
import { getEmojiPalette, getEmojiSet, getEmojiOpacity, type EmojiPalette, type EmojiSet } from '@/themes/emojiPalettes';

export type ThemeMode = 'light' | 'dark';

// Use design system colors for light mode - Soft Pastel Theme
const lightColors = {
  ...designSystem.colors,
  
  // Legacy aliases for backward compatibility
  text: designSystem.colors.textPrimary,
  textInverted: designSystem.colors.white,
  card: designSystem.colors.surface,
  cardSecondary: designSystem.colors.surfaceVariant,
  cardElevated: designSystem.colors.surface,
  
  // Soft pastel mood colors
  moodRad: '#FFCC80',
  moodGood: '#A8E6CF',
  moodMeh: '#FFE29F',
  moodBad: '#FF9999',
  moodAwful: '#FF8B8B',
  moodAnxious: '#9FC5E8',
  moodJoyful: '#C8E6C9',
  moodTired: '#F0E68C',
  
  // Additional legacy colors
  error: designSystem.colors.danger,
  
  // Icon backgrounds - Soft pastels
  iconBackground: {
    yellow: '#FFF4C4',
    cyan: '#B2EBF2',
    green: '#C8E6C9',
    purple: '#E1BEE7',
    orange: '#FFE0B2',
    pink: '#F8BBD0',
    blue: '#BBDEFB',
    lime: '#E6EE9C',
  },
  
  shadow: 'rgba(0, 0, 0, 0.03)',
  shadowMedium: 'rgba(0, 0, 0, 0.05)',
  shadowStrong: 'rgba(0, 0, 0, 0.08)',
};

// Dark mode - Deep black with luminous white text (True Dark)
const darkColors = {
  ...designSystem.colors,
  // True black aesthetic with perfect contrast
  primary: '#FFB088',                    // Warm coral - vibrant accent
  background: '#000000',                 // Pure black - deepest dark
  backgroundGradientStart: '#000000',    
  backgroundGradientEnd: '#0A0A0A',      // Near black gradient
  surface: '#0F0F0F',                    // Elevated surface - slightly raised
  surfaceVariant: '#1A1A1A',             // Card variants - visible depth
  
  textPrimary: '#B8B8B8',                // Muted gray - comfortable
  textSecondary: '#A0A0A0',              // Softer gray - easy on eyes
  textTertiary: '#888888',               // Light gray - subtle
  textLight: '#707070',                  // Dim gray - background text
  
  border: 'rgba(255, 255, 255, 0.15)',   // Bright borders
  borderLight: 'rgba(255, 255, 255, 0.10)',
  divider: 'rgba(255, 255, 255, 0.12)',
  
  icon: '#B8B8B8',                       // Muted gray icons
  iconActive: '#FFB088',                 // Vibrant coral
  iconInactive: '#999999',               // Muted gray inactive
  
  // Legacy aliases
  text: '#B8B8B8',
  textInverted: '#000000',
  card: '#0F0F0F',
  cardSecondary: '#1A1A1A',
  cardElevated: '#252525',               // Highest elevation
  
  accent: '#FF9B6E',                     // Luminous coral
  secondary: '#6EE7B7',                  // Vibrant mint green
  
  // Vibrant mood colors - balanced against black
  moodRad: '#FFD700',                    // Gold yellow - joyful
  moodGood: '#5FD3A7',                   // Mint - positive
  moodMeh: '#FFA500',                    // Orange - neutral energy
  moodBad: '#FF6B6B',                    // Coral red - visible
  moodAwful: '#FF4444',                  // Bright red - alert
  moodAnxious: '#4A9EFF',                // Blue - calming
  moodJoyful: '#5FD3A7',                 // Green - uplifting
  moodTired: '#E89B3C',                  // Amber - comforting
  
  success: '#00C853',                    // Bright emerald
  warning: '#FFB300',                    // Bright amber
  error: '#FF3D00',                      // Bright red
  danger: '#FF3D00',
  info: '#2196F3',                       // Bright blue
  
  moodHappy: '#FFD700',                  // Gold yellow
  moodCalm: '#5FD3A7',                   // Mint glow
  moodAngry: '#FF6B6B',                  // Coral red
  moodSad: '#4A9EFF',                    // Blue
  moodNeutral: '#FFA500',                // Orange
  moodExcited: '#FF8C42',                // Bright orange
  moodPalette: ['#FFD700', '#5FD3A7', '#FF6B6B', '#4A9EFF', '#FFA500', '#FF8C42'],
  
  iconBackground: {
    yellow: '#FFD700',                   // Gold yellow
    cyan: '#00E5FF',                     // Bright cyan
    green: '#5FD3A7',                    // Luminous mint
    purple: '#B388FF',                   // Bright purple
    orange: '#FF8C42',                   // Bright orange
    pink: '#FF4081',                     // Hot pink
    blue: '#448AFF',                     // Bright blue
    lime: '#76FF03',                     // Neon lime
  },
  
  shadow: 'rgba(0, 0, 0, 0.6)',          // Deep shadows for true black
  shadowMedium: 'rgba(0, 0, 0, 0.7)',
  shadowStrong: 'rgba(0, 0, 0, 0.8)',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayMedium: 'rgba(0, 0, 0, 0.5)',
  overlayStrong: 'rgba(0, 0, 0, 0.7)',
  
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  white: '#2C2C2E',
  black: '#000000',
  transparent: 'transparent',
};

// Use design system gradients - Soft pastel transitions
const gradients = {
  ...designSystem.gradients,
  // Convert to array format for backward compatibility
  primary: designSystem.gradients.primary.colors,
  secondary: designSystem.gradients.card.colors,
  background: designSystem.gradients.background.colors,
  warm: ['#FFE8DC', '#FFDCC8', '#FFD0B5'],  // Peach gradient
  cool: ['#F0FAED', '#E0F4DB', '#D4EDD1'],  // Bright mint gradient
  accent: designSystem.gradients.button.colors,
  peach: designSystem.gradients.backgroundAlt.colors,
  sunset: ['#FFC5A3', '#FFB088', '#FF9B6E'],  // Coral gradient
  calm: designSystem.gradients.moodCalm.colors,
  energy: designSystem.gradients.moodHappy.colors,
  dark: ['#000000', '#0A0A0A', '#1A1A1A'],  // True black gradient with depth
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
  colorPalette: string;
  iconPalette: string;
  iconStyle: IconStyle;
  emojiPalette: string;
  emojiSet: EmojiSet;
  emojiOpacity: number;
  setThemeMode: (mode: ThemeMode) => void;
  setColorPalette: (paletteId: string) => void;
  setIconPalette: (paletteId: string) => void;
  setEmojiPalette: (paletteId: string) => void;
  toggleTheme: () => void;
  getEmoji: (key: keyof EmojiSet) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';
const COLOR_PALETTE_STORAGE_KEY = '@app_color_palette';
const ICON_PALETTE_STORAGE_KEY = '@app_icon_palette';
const EMOJI_PALETTE_STORAGE_KEY = '@app_emoji_palette';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [colorPalette, setColorPaletteState] = useState<string>('default');
  const [iconPalette, setIconPaletteState] = useState<string>('default');
  const [emojiPalette, setEmojiPaletteState] = useState<string>('apple');

  useEffect(() => {
    loadThemePreference();
    loadColorPalettePreference();
    loadIconPalettePreference();
    loadEmojiPalettePreference();
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

  const loadColorPalettePreference = async () => {
    try {
      const storedPalette = await AsyncStorage.getItem(COLOR_PALETTE_STORAGE_KEY);
      if (storedPalette) {
        setColorPaletteState(storedPalette);
      }
    } catch (error) {
      console.error('Failed to load color palette preference:', error);
    }
  };

  const loadIconPalettePreference = async () => {
    try {
      const storedIconPalette = await AsyncStorage.getItem(ICON_PALETTE_STORAGE_KEY);
      if (storedIconPalette) {
        setIconPaletteState(storedIconPalette);
      }
    } catch (error) {
      console.error('Failed to load icon palette preference:', error);
    }
  };

  const loadEmojiPalettePreference = async () => {
    try {
      const storedEmojiPalette = await AsyncStorage.getItem(EMOJI_PALETTE_STORAGE_KEY);
      if (storedEmojiPalette) {
        setEmojiPaletteState(storedEmojiPalette);
      }
    } catch (error) {
      console.error('Failed to load emoji palette preference:', error);
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

  const setColorPalette = useCallback(async (paletteId: string) => {
    try {
      await AsyncStorage.setItem(COLOR_PALETTE_STORAGE_KEY, paletteId);
      setColorPaletteState(paletteId);
    } catch (error) {
      console.error('Failed to save color palette preference:', error);
    }
  }, []);

  const setIconPalette = useCallback(async (paletteId: string) => {
    try {
      await AsyncStorage.setItem(ICON_PALETTE_STORAGE_KEY, paletteId);
      setIconPaletteState(paletteId);
    } catch (error) {
      console.error('Failed to save icon palette preference:', error);
    }
  }, []);

  const setEmojiPalette = useCallback(async (paletteId: string) => {
    try {
      await AsyncStorage.setItem(EMOJI_PALETTE_STORAGE_KEY, paletteId);
      setEmojiPaletteState(paletteId);
    } catch (error) {
      console.error('Failed to save emoji palette preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setThemeMode]);

  // Get current icon style based on selected palette
  const iconStyle = useMemo(() => {
    const palette = getIconPalette(iconPalette);
    return palette.style;
  }, [iconPalette]);

  // Get current emoji set based on selected palette
  const emojiSet = useMemo(() => {
    return getEmojiSet(emojiPalette);
  }, [emojiPalette]);

  // Get emoji opacity for current theme mode
  const emojiOpacity = useMemo(() => {
    return getEmojiOpacity(emojiPalette, themeMode);
  }, [emojiPalette, themeMode]);

  // Helper function to get emoji by key
  const getEmoji = useCallback((key: keyof EmojiSet) => {
    return emojiSet[key];
  }, [emojiSet]);

  // Merge color palette with base colors
  const getCustomColors = useCallback(() => {
    const baseColors = themeMode === 'light' ? lightColors : darkColors;
    
    // If using default palette, return base colors
    if (colorPalette === 'default') {
      return baseColors;
    }

    // Get custom palette colors
    const paletteColors = getPaletteColors(colorPalette, themeMode);
    
    // Merge palette colors with base, giving palette priority for main colors
    return {
      ...baseColors,
      primary: paletteColors.primary,
      secondary: paletteColors.secondary,
      accent: paletteColors.accent,
      success: paletteColors.success,
      warning: paletteColors.warning,
      error: paletteColors.error,
      danger: paletteColors.error,
      info: paletteColors.info,
      // Keep other base colors for compatibility
    };
  }, [themeMode, colorPalette]);

  // Get dynamic components with palette-based border colors
  const getCustomComponents = useCallback(() => {
    const customColors = getCustomColors();
    const baseComponents = designSystem.components;
    
    // Override card components with palette accent color for borders
    return {
      ...baseComponents,
      card: {
        ...baseComponents.card,
        borderColor: customColors.accent,
      },
      cardElevated: {
        ...baseComponents.cardElevated,
        borderColor: customColors.accent,
      },
      cardFlat: {
        ...baseComponents.cardFlat,
        borderColor: customColors.accent,
      },
      // Override dark mode card variants
      darkMode: {
        ...baseComponents.darkMode,
        cardGlass: {
          ...baseComponents.darkMode.cardGlass,
          borderColor: customColors.accent,
        },
        cardElevatedGlow: {
          ...baseComponents.darkMode.cardElevatedGlow,
          borderColor: customColors.accent,
        },
        trueBlack: {
          ...baseComponents.darkMode.trueBlack,
          cardDeep: {
            ...baseComponents.darkMode.trueBlack.cardDeep,
            borderColor: customColors.accent,
          },
          surfaceElevated: {
            ...baseComponents.darkMode.trueBlack.surfaceElevated,
            borderColor: customColors.accent,
          },
        },
      },
    };
  }, [getCustomColors]);

  const theme: Theme = useMemo(() => ({
    colors: getCustomColors(),
    gradients,
    typography,
    spacing,
    borderRadius,
    radii: borderRadius,
    shadows,
    elevation: shadows,
    icons: designSystem.icons,
    components: getCustomComponents(),
    mode: themeMode,
    // Include helper functions
    hexToRgba: designSystem.hexToRgba,
    getLinearGradientProps: designSystem.getLinearGradientProps,
    getShadow: designSystem.getShadow,
    getSpacing: designSystem.getSpacing,
    withOpacity: designSystem.withOpacity,
  }), [themeMode, getCustomColors, getCustomComponents]);

  const value = useMemo(() => ({
    theme,
    themeMode,
    colorPalette,
    iconPalette,
    iconStyle,
    emojiPalette,
    emojiSet,
    emojiOpacity,
    setThemeMode,
    setColorPalette,
    setIconPalette,
    setEmojiPalette,
    toggleTheme,
    getEmoji,
  }), [theme, themeMode, colorPalette, iconPalette, iconStyle, emojiPalette, emojiSet, emojiOpacity, setThemeMode, setColorPalette, setIconPalette, setEmojiPalette, toggleTheme, getEmoji]);

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
