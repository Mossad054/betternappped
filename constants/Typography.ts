/**
 * Global Typography System for Betternapped
 * Based on App Store HIG guidelines and habit_library.tsx styles
 * Minimum body text: 16px for accessibility
 */

import { TextStyle } from 'react-native';

// Font Sizes - Following HIG guidelines
export const FONT_SIZES = {
  xs: 11,      // Caption, badges, difficulty tags
  sm: 12,      // Meta text, timestamps
  md: 13,      // Small descriptions
  base: 14,    // Category chips, secondary text
  lg: 16,      // Body text, inputs, buttons (minimum readable)
  xl: 18,      // Section headers, h4
  '2xl': 20,   // Modal titles, h3
  '3xl': 24,   // Page titles, h2
  '4xl': 32,   // Large headers, h1
  display: 48, // Large display numbers
} as const;

// Font Weights
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Line Heights (multipliers of font size)
export const LINE_HEIGHTS = {
  tight: 1.2,    // Headers
  normal: 1.4,   // Body text
  relaxed: 1.6,  // Descriptions, readable paragraphs
  loose: 1.8,    // Extra spacing for accessibility
};

// Pre-composed Typography Styles
export const Typography = {
  // Legacy support
  fontSize: FONT_SIZES,
  fontWeight: FONT_WEIGHTS,
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
  },

  // Headers
  h1: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
  } as TextStyle,

  h2: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
  } as TextStyle,

  h3: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.tight,
  } as TextStyle,

  h4: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
  } as TextStyle,

  // Body Text
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  } as TextStyle,

  body: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.relaxed,
  } as TextStyle,

  bodyBold: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.relaxed,
  } as TextStyle,

  bodySmall: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.base * LINE_HEIGHTS.normal,
  } as TextStyle,

  // Small Text
  small: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
  } as TextStyle,

  meta: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
  } as TextStyle,

  caption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
  } as TextStyle,

  // Interactive Elements
  button: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
  } as TextStyle,

  buttonSmall: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.base * LINE_HEIGHTS.tight,
  } as TextStyle,

  link: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  } as TextStyle,

  // Form Elements
  input: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  } as TextStyle,

  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
  } as TextStyle,

  // Cards & Lists
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
  } as TextStyle,

  cardDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
  } as TextStyle,

  listItem: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  } as TextStyle,

  // Badges & Tags
  badge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.tight,
  } as TextStyle,

  chip: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.base * LINE_HEIGHTS.tight,
  } as TextStyle,

  // Tab & Navigation
  tabLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.tight,
  } as TextStyle,

  navTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
  } as TextStyle,

  // Analytics Page - Enhanced Readability
  analytics: {
    pageTitle: {
      fontSize: FONT_SIZES['4xl'],
      fontWeight: '800' as const,
      lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
    } as TextStyle,

    cardTitle: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
    } as TextStyle,

    sectionTitle: {
      fontSize: FONT_SIZES['2xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.tight,
    } as TextStyle,

    subsectionTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
    } as TextStyle,

    kpiValue: {
      fontSize: FONT_SIZES.display,
      fontWeight: '800' as const,
      lineHeight: FONT_SIZES.display * LINE_HEIGHTS.tight,
    } as TextStyle,

    kpiLabel: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    } as TextStyle,

    statValue: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
    } as TextStyle,

    statLabel: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.normal,
    } as TextStyle,

    bodyText: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.relaxed,
    } as TextStyle,

    caption: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
    } as TextStyle,

    pillButton: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
    } as TextStyle,

    modalTitle: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
    } as TextStyle,

    modalBody: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.relaxed,
    } as TextStyle,
  },
};

// Helper function to add color to typography
export const withColor = (style: TextStyle, color: string): TextStyle => ({
  ...style,
  color,
});

// Spacing constants for consistency
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export default Typography;
