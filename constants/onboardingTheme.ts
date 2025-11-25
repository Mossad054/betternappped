/**
 * Onboarding Theme Constants
 *
 * Fixed theme for onboarding screens that is independent of user preferences,
 * dark mode, or any app-wide theme customization.
 *
 * Design inspired by warm, welcoming color palette with cream, peach, and orange tones.
 */

export const OnboardingTheme = {
  colors: {
    // Backgrounds
    background: '#FFF8E7',        // Cream - main background
    backgroundAlt: '#FFE5D9',     // Peach - alternate background
    backgroundLight: '#FFFBF3',   // Lighter cream for cards

    // Primary & Accent
    primary: '#FF6B35',           // Orange - primary actions, highlights
    primaryDark: '#E85A2A',       // Darker orange for pressed states
    primaryLight: '#FF8557',      // Lighter orange for hover
    accent: '#FFD93D',            // Yellow - secondary accent
    accentLight: '#FFE066',       // Lighter yellow

    // Text
    text: '#2D3142',              // Dark blue-gray - primary text
    textSecondary: '#6B7280',     // Gray - secondary text
    textTertiary: '#9CA3AF',      // Light gray - tertiary text, placeholders
    textLight: '#D1D5DB',         // Very light gray - disabled text

    // Semantic Colors
    success: '#10B981',           // Green
    warning: '#F59E0B',           // Amber
    error: '#EF4444',             // Red
    info: '#3B82F6',              // Blue

    // UI Elements
    card: '#FFFFFF',              // White cards
    border: '#E5E7EB',            // Light gray borders
    divider: '#F3F4F6',           // Very light gray dividers
    overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black

    // Decorative (for doodles and illustrations)
    decorative1: '#FFB5A7',       // Coral pink
    decorative2: '#FCD5CE',       // Light pink
    decorative3: '#F8EDEB',       // Very light pink
    decorative4: '#B8E0D2',       // Mint green
    decorative5: '#D6EADF',       // Light mint
    decorative6: '#EAC4D5',       // Lavender
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    screenHorizontal: 24,
    screenVertical: 32,
    sectionGap: 40,
  },

  radii: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    circle: 9999,
    full: 9999, // Alias for circle
  },

  typography: {
    // Headings
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },

    // Special
    subtitle: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
    },
    caption: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    captionSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  animations: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
  },
} as const;

/**
 * Gradient configurations for backgrounds
 */
export const OnboardingGradients = {
  primary: {
    colors: ['#FFF8E7', '#FFE5D9'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  warm: {
    colors: ['#FFE5D9', '#FCD5CE'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  soft: {
    colors: ['#FFFBF3', '#FFF8E7'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

/**
 * Icon sizes for consistent sizing across onboarding
 */
export const OnboardingIconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  hero: 80,
} as const;

export type OnboardingThemeType = typeof OnboardingTheme;
