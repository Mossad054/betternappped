/**
 * design.ts - Wellness App Design System
 * Extracted from wellness UI design (theme.md)
 * Date: 2025-10-30
 * All colors, gradients, typography, and components follow the original style
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary backgrounds
  background: '#F5EFE1',              // main app background (dull cream)
  backgroundGradientStart: '#F5EFE1',
  backgroundGradientEnd: '#E8DBC5',
  surface: '#FAF5EB',                 // cards, containers (warm cream, no white)
  surfaceVariant: '#F7F1E3',          // slight variant for depth
  
  // Primary accent colors
  primary: '#F9CF73',                 // soft warm yellow accent (buttons, highlights)
  primaryDark: '#F5C55F',             // darker yellow shade
  secondary: '#FFDFAE',               // lighter accent shade
  accent: '#FFB870',                  // warm orange accent
  
  // Text colors
  textPrimary: '#2E2E2E',             // dark text
  textSecondary: '#6B6B6B',           // muted text
  textTertiary: '#9A9A9A',            // light muted text
  textLight: '#B8B8B8',               // very light text
  
  // Functional colors
  success: '#A5D6A7',                 // calm green (e.g., progress)
  danger: '#E57373',                  // soft red (mood icons)
  warning: '#FFB74D',
  info: '#81D4FA',
  
  // UI elements
  divider: '#E0D5C3',                 // subtle line color (warmer)
  border: 'rgba(0, 0, 0, 0.06)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  icon: '#3A3A3A',                    // general icon tint
  iconActive: '#2E2E2E',              // active icon color
  iconInactive: '#9A9A9A',            // inactive icon color
  
  // Mood colors
  moodHappy: '#FCE38A',               // yellow happy mood
  moodCalm: '#A8E6CF',                // green calm mood
  moodAngry: '#F38181',               // red/pink angry mood
  moodSad: '#81D4FA',                 // blue sad mood
  moodNeutral: '#DCEDC1',             // neutral green-yellow
  moodExcited: '#FFE29F',             // excited yellow-orange
  
  // Mood palette for charts
  moodPalette: ['#FCE38A', '#A8E6CF', '#F38181', '#81D4FA', '#DCEDC1', '#FFE29F'],
  
  // Overlay colors
  cardShadow: 'rgba(0, 0, 0, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.04)',
  overlayMedium: 'rgba(0, 0, 0, 0.08)',
  overlayStrong: 'rgba(0, 0, 0, 0.16)',
  overlayLight: 'rgba(0, 0, 0, 0.02)',
  
  // Basic colors
  white: '#FAF5EB',                   // off-white cream (no pure white)
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Background gradient (enriched warm cream to golden beige)
  background: {
    colors: ['#F5EFE1', '#E8DBC5', '#DCC9A7'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    angle: 180,
  },
  
  // Button gradient (enriched warm yellow to coral/pink)
  button: {
    colors: ['#FFD97D', '#FF9F85', '#FF8D8D'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Highlight alias
  highlight: {
    colors: ['#FFD97D', '#FF9F85', '#FF8D8D'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Happy mood gradient (enriched golden to coral)
  moodHappy: {
    colors: ['#FFD966', '#FF9966', '#FF7F7F'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Calm mood gradient (enriched sage to mint)
  moodCalm: {
    colors: ['#9FD9BD', '#B8E6A8', '#D5EDB8'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Primary accent gradient (enriched golden honey)
  primary: {
    colors: ['#F5C55A', '#FFD17D', '#FFE0A3'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
    angle: 90,
  },
  
  // Card subtle gradient (warm cream to beige)
  card: {
    colors: ['#FAF5EB', '#F7F1E3', '#F0E9D8'],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    angle: 180,
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: 'System',              // Primary font family
  fontFamilySystem: 'System',         // Fallback to system font
  
  // Display/Hero text
  h1: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  
  // Large heading
  h2: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  
  // Section heading
  h3: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  
  // Card heading
  h4: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Small heading
  h5: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Smallest heading
  h6: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Body text - large
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Body text - regular
  body: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Body text - small
  bodySmall: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  
  // Caption text
  caption: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textTertiary,
  },
  
  // Caption small
  captionSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
    color: colors.textTertiary,
  },
  
  // Button text
  button: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  
  // Label text
  label: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: colors.textSecondary,
  },
  
  // Overline text
  overline: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.textTertiary,
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  
  // Semantic spacing
  screenHorizontal: 20,
  screenVertical: 20,
  cardPadding: 16,
  sectionGap: 24,
  elementGap: 12,
  chipGap: 8,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  card: 24,
  pill: 999,
  circle: 9999,
  
  // Component-specific
  button: 12,
  chip: 16,
  modal: 28,
  bottomNav: 32,
};

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

export const shadows = {
  // iOS shadow styles
  ios: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    xlarge: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
  },
  
  // Android elevation mapping
  android: {
    small: 2,
    medium: 4,
    large: 8,
    xlarge: 12,
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
  overlay: 0.04,
  overlayMedium: 0.08,
  overlayStrong: 0.16,
  pressed: 0.12,
  hover: 0.06,
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
  // Card variants
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...elevation.small,
  },
  
  cardElevated: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...elevation.medium,
  },
  
  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  
  // Button variants
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...elevation.small,
  },
  
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...elevation.small,
  },
  
  buttonOutlined: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.lg - 1,
  },
  
  // Text input
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
  
  // Chip/pill
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...elevation.small,
  },
  
  chipActive: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
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
  
  // Bottom navigation
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
  
  // Mood circle
  moodCircle: {
    size: 56,
    borderRadius: radii.circle,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...elevation.small,
  },
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get linear gradient configuration
 * @param {string} name - Gradient name from gradients object
 * @returns {object} Gradient configuration
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
 * @param {string} size - Shadow size (small, medium, large, xlarge)
 * @returns {object} Platform-specific shadow styles
 */
export function getShadow(size: keyof typeof elevation = 'small') {
  return elevation[size] || elevation.small;
}

/**
 * Get spacing value by multiplier
 * @param {number} multiplier - Spacing multiplier
 * @returns {number} Calculated spacing
 */
export function getSpacing(multiplier: number): number {
  return spacing.sm * multiplier;
}

/**
 * Apply opacity to a color
 * @param {string} color - Base color
 * @param {number} opacityValue - Opacity (0-1)
 * @returns {string} Color with opacity
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



