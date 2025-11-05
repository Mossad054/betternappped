/**
 * design.ts - Betternapped Design System
 * Inspired by mindful wellness app aesthetics
 * Date: 2025-11-05
 * Soft pastels, generous spacing, playful yet calming
 */

// ============================================================================
// COLORS - PASTEL WELLNESS PALETTE
// ============================================================================

export const colors = {
  // Primary backgrounds - Soft mint greens
  background: '#F0FAED',              // bright mint background
  backgroundGradientStart: '#F0FAED',
  backgroundGradientEnd: '#E0F4DB',
  surface: '#FFFFFF',                 // pure white cards
  surfaceVariant: '#F8FBF7',          // subtle off-white
  
  // Secondary backgrounds - Warm peach/coral
  backgroundAlt: '#FFE8DC',           // soft peach background
  backgroundAltStart: '#FFE8DC',
  backgroundAltEnd: '#FFDCC8',
  
  // Primary accent colors - Warm coral/orange
  primary: '#FFB088',                 // vibrant coral accent
  primaryDark: '#FF9B6E',             // deeper coral
  primaryLight: '#FFC5A3',            // lighter coral
  secondary: '#D4EDD1',               // soft mint green
  accent: '#FF8866',                  // bright coral accent
  
  // Text colors - High contrast on pastels
  textPrimary: '#1C1C1E',             // near black
  textSecondary: '#3A3A3C',           // dark gray
  textTertiary: '#6B6B6B',            // medium gray
  textLight: '#9A9A9A',               // light gray
  textOnPrimary: '#FFFFFF',           // white text on coral
  
  // Functional colors - Soft pastels
  success: '#A5D6A7',                 // soft green
  danger: '#FF8B8B',                  // soft red
  warning: '#FFD97D',                 // soft yellow
  info: '#81D4FA',                    // soft blue
  
  // UI elements
  divider: 'rgba(0, 0, 0, 0.08)',     // subtle divider
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  icon: '#2C2C2E',                    // dark icon tint
  iconActive: '#FFB088',              // coral active icons
  iconInactive: '#B8B8B8',            // light gray inactive
  
  // Mood colors - Playful pastels
  moodHappy: '#FFE29F',               // bright yellow
  moodCalm: '#A8E6CF',                // mint green
  moodAngry: '#FF9999',               // soft red
  moodSad: '#9FC5E8',                 // soft blue
  moodNeutral: '#F0E68C',             // neutral yellow
  moodExcited: '#FFCC80',             // orange excited
  
  // Mood palette for charts - Soft pastels
  moodPalette: ['#FFE29F', '#A8E6CF', '#FF9999', '#9FC5E8', '#F0E68C', '#FFCC80'],
  
  // Overlay colors - Minimal, clean
  cardShadow: 'rgba(0, 0, 0, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.02)',
  overlayMedium: 'rgba(0, 0, 0, 0.06)',
  overlayStrong: 'rgba(0, 0, 0, 0.12)',
  overlayLight: 'rgba(0, 0, 0, 0.01)',
  
  // Glass/Frosted effects
  glassTint: 'rgba(255, 255, 255, 0.85)',
  glassBlur: 20,
  
  // Basic colors
  white: '#FFFFFF',                   // pure white
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// GRADIENTS - SOFT PASTEL TRANSITIONS
// ============================================================================

export const gradients = {
  // Background gradient - Soft mint to deeper mint
  background: {
    colors: ['#F0FAED', '#E0F4DB', '#D4EDD1'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    angle: 180,
  },
  
  // Alternate background - Warm peach gradient
  backgroundAlt: {
    colors: ['#FFE8DC', '#FFDCC8', '#FFD0B5'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    angle: 180,
  },
  
  // Button gradient - Coral to deeper coral
  button: {
    colors: ['#FFC5A3', '#FFB088', '#FF9B6E'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Highlight alias
  highlight: {
    colors: ['#FFC5A3', '#FFB088', '#FF9B6E'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Happy mood gradient - Warm yellow
  moodHappy: {
    colors: ['#FFF4C4', '#FFE29F', '#FFD97D'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Calm mood gradient - Mint green
  moodCalm: {
    colors: ['#C8E6C9', '#A8E6CF', '#8FD6BD'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Primary accent gradient - Coral flow
  primary: {
    colors: ['#FFD0B5', '#FFC5A3', '#FFB088'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Card subtle gradient - White to hint of mint
  card: {
    colors: ['#FFFFFF', '#FAFBFA', '#F8FBF7'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    angle: 180,
  },
};

// ============================================================================
// TYPOGRAPHY - CLEAN, MODERN, SPACIOUS
// ============================================================================

export const typography = {
  fontFamily: 'System',              // SF Pro on iOS, Roboto on Android
  fontFamilySystem: 'System',
  
  // Display/Hero text - Larger, bolder
  h1: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  
  // Large heading - More spacious
  h2: {
    fontFamily: 'System',
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  
  // Section heading
  h3: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  
  // Card heading
  h4: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Small heading
  h5: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Smallest heading
  h6: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Body text - large
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.textSecondary,
  },
  
  // Body text - regular
  body: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: -0.1,
    color: colors.textSecondary,
  },
  
  // Body text - small
  bodySmall: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Caption text
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0,
    color: colors.textTertiary,
  },
  
  // Caption small
  captionSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
    color: colors.textTertiary,
  },
  
  // Button text
  button: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: colors.textOnPrimary,
  },
  
  // Label text
  label: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Overline text
  overline: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.textTertiary,
  },
};

// ============================================================================
// SPACING - GENEROUS, BREATHABLE
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Semantic spacing - More generous
  screenHorizontal: 24,
  screenVertical: 24,
  cardPadding: 20,
  sectionGap: 32,
  elementGap: 16,
  chipGap: 12,
};

// ============================================================================
// BORDER RADIUS - SOFT, ROUNDED
// ============================================================================

export const radii = {
  none: 0,
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  card: 28,        // More rounded cards
  pill: 999,
  circle: 9999,
  
  // Component-specific - Softer corners
  button: 16,
  chip: 20,
  modal: 32,
  bottomNav: 36,
};

// ============================================================================
// SHADOWS & ELEVATION - SUBTLE, SOFT
// ============================================================================

export const shadows = {
  // iOS shadow styles - More subtle
  ios: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    xlarge: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.10,
      shadowRadius: 20,
    },
  },
  
  // Android elevation mapping
  android: {
    small: 1,
    medium: 3,
    large: 6,
    xlarge: 10,
  },
};

// Platform-aware shadow helper
export const elevation = {
  small: {
    ...shadows.ios.small,
    elevation: shadows.android.small,
  },
  medium: {
    ...shadows.ios.medium,
    elevation: shadows.android.medium,
  },
  large: {
    ...shadows.ios.large,
    elevation: shadows.android.large,
  },
  xlarge: {
    ...shadows.ios.xlarge,
    elevation: shadows.android.xlarge,
  },
};

// ============================================================================
// OPACITY VALUES
// ============================================================================

export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  subtle: 0.8,
  overlay: 0.02,
  overlayMedium: 0.06,
  overlayStrong: 0.12,
  pressed: 0.10,
  hover: 0.04,
  glass: 0.15,          // Glassmorphism backdrop
  glowSubtle: 0.3,      // Subtle glow effect
  glowMedium: 0.5,      // Medium glow
  glowStrong: 0.7,      // Strong glow for dark mode
};

// ============================================================================
// DARK MODE EFFECTS - Glassmorphism & Glow
// ============================================================================

export const darkModeEffects = {
  // Glassmorphism for elevated surfaces
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Subtle glow for interactive elements
  glowPrimary: {
    shadowColor: '#FFB088',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  glowAccent: {
    shadowColor: '#6EE7B7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  
  // Card with subtle depth
  cardGlow: {
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ============================================================================
// ICON MAPPING
// ============================================================================

export const icons = {
  // Bottom navigation icons
  home: 'home',
  explore: 'compass',
  trophy: 'award',
  music: 'music',
  profile: 'user',
  
  // Action icons
  meditate: 'sun',
  journal: 'book',
  timer: 'clock',
  
  // Interface icons
  bell: 'bell',
  search: 'search',
  microphone: 'mic',
  filter: 'sliders',
  more: 'more-horizontal',
  chevronRight: 'chevron-right',
  back: 'chevron-left',
  play: 'play',
  pause: 'pause',
  
  // Category icons
  sleep: 'moon',
  activity: 'activity',
  focus: 'target',
  
  // Mood icons
  moodAngry: '😠',
  moodCalm: '😌',
  moodSad: '😢',
  moodNeutral: '😐',
  moodHappy: '😊',
  moodExcited: '😄',
};

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  // Card variants - Softer, more spacious
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.cardPadding,
    ...elevation.small,
  },
  
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.cardPadding,
    ...elevation.medium,
  },
  
  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.cardPadding,
  },
  
  // Button variants - More rounded
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...elevation.small,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...elevation.small,
  },
  
  buttonOutlined: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg - 2,
  },
  
  // Text input - Cleaner
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  
  textInputFocused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md - 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  
  // Chip/pill - More rounded
  chip: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radii.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  
  chipActive: {
    backgroundColor: colors.primary,
    borderRadius: radii.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...elevation.small,
  },
  
  // Avatar
  avatar: {
    small: {
      width: 32,
      height: 32,
      borderRadius: radii.circle,
    },
    medium: {
      width: 48,
      height: 48,
      borderRadius: radii.circle,
    },
    large: {
      width: 64,
      height: 64,
      borderRadius: radii.circle,
    },
  },
  
  // List item
  listItem: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
  
  // Bottom navigation - More rounded
  bottomNav: {
    container: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.bottomNav,
      borderTopRightRadius: radii.bottomNav,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      ...elevation.large,
    },
    item: {
      width: 56,
      height: 56,
      borderRadius: radii.circle,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    itemActive: {
      width: 56,
      height: 56,
      borderRadius: radii.circle,
      backgroundColor: colors.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      ...elevation.small,
    },
  },
  
  // Mood circle - Larger, more prominent
  moodCircle: {
    size: 60,
    borderRadius: radii.circle,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...elevation.small,
  },
  
  // Dark mode specific components - vibrant & glowing
  darkMode: {
    cardGlass: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: radii.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    
    buttonPrimaryGlow: {
      backgroundColor: colors.primary,
      borderRadius: radii.button,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      shadowColor: '#FFB088',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 10,
    },
    
    cardElevatedGlow: {
      backgroundColor: '#0F0F0F',
      borderRadius: radii.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      shadowColor: 'rgba(255, 255, 255, 0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.9,
      shadowRadius: 16,
      elevation: 8,
    },
    
    iconGlow: {
      shadowColor: '#6EE7B7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
    
    // True Black variants for deepest contrast
    trueBlack: {
      cardDeep: {
        backgroundColor: '#000000',
        borderRadius: radii.card,
        padding: spacing.cardPadding,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      
      surfaceElevated: {
        backgroundColor: '#0F0F0F',
        borderRadius: radii.card,
        padding: spacing.cardPadding,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
      },
      
      buttonIntense: {
        backgroundColor: colors.primary,
        borderRadius: radii.button,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        shadowColor: '#FFB088',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      
      textGlow: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
      },
    },
  },
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Convert hex color to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get linear gradient configuration
 */
export function getLinearGradientProps(name: keyof typeof gradients) {
  const gradient = gradients[name];
  if (!gradient) {
    console.warn(`Gradient "${name}" not found in theme`);
    return {
      colors: [colors.primary, colors.secondary],
      start: { x: 0, y: 0.5 },
      end: { x: 1, y: 0.5 },
    };
  }
  return {
    colors: gradient.colors,
    start: gradient.start,
    end: gradient.end,
  };
}

/**
 * Get platform-appropriate shadow style
 */
export function getShadow(size: keyof typeof elevation = 'small') {
  return elevation[size] || elevation.small;
}

/**
 * Get spacing value by multiplier
 */
export function getSpacing(multiplier: number): number {
  return spacing.sm * multiplier;
}

/**
 * Apply opacity to a color
 */
export function withOpacity(color: string, opacityValue: number): string {
  if (color.startsWith('#')) {
    return hexToRgba(color, opacityValue);
  }
  return color;
}

// ============================================================================
// DEFAULT THEME EXPORT
// ============================================================================

const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  shadows,
  elevation,
  opacity,
  icons,
  components,
  
  // Helper functions
  hexToRgba,
  getLinearGradientProps,
  getShadow,
  getSpacing,
  withOpacity,
};

export default theme;
