/**
 * Icon Palettes Configuration
 * Date: 2025-11-05
 * Purpose: Predefined icon styles for user customization
 * Each palette defines a unique icon appearance across the app
 */

import { LucideProps } from 'lucide-react-native';

export interface IconStyle {
  strokeWidth: number;
  fill?: string;
  fillOpacity?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
}

export interface IconPalette {
  id: string;
  name: string;
  description: string;
  style: IconStyle;
  previewIcons: string[]; // Icon names for preview
  glowEffect?: boolean;
  glowIntensity?: number;
}

export const ICON_PALETTES: Record<string, IconPalette> = {
  default: {
    id: 'default',
    name: 'Modern',
    description: 'Balanced modern icons with medium weight',
    style: {
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.6,
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-thin strokes for a clean minimal look',
    style: {
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: false,
    glowIntensity: 0,
  },

  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Thick strokes for maximum visibility',
    style: {
      strokeWidth: 2.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.7,
  },

  rounded: {
    id: 'rounded',
    name: 'Rounded',
    description: 'Soft rounded corners for a friendly feel',
    style: {
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.5,
  },

  sharp: {
    id: 'sharp',
    name: 'Sharp',
    description: 'Angular edges for a technical appearance',
    style: {
      strokeWidth: 2,
      strokeLinecap: 'square',
      strokeLinejoin: 'miter',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: false,
    glowIntensity: 0,
  },

  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Icons with gradient glow effects',
    style: {
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.9,
  },

  outlined: {
    id: 'outlined',
    name: 'Outlined',
    description: 'Classic outlined icons with no fill',
    style: {
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'none',
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: false,
    glowIntensity: 0,
  },

  filled: {
    id: 'filled',
    name: 'Filled',
    description: 'Solid filled icons for bold emphasis',
    style: {
      strokeWidth: 0,
      fill: 'currentColor',
      fillOpacity: 1,
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.4,
  },

  duotone: {
    id: 'duotone',
    name: 'Duotone',
    description: 'Two-tone icons with subtle fill',
    style: {
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      fill: 'currentColor',
      fillOpacity: 0.2,
    },
    previewIcons: ['Home', 'Heart', 'Star', 'Smile'],
    glowEffect: true,
    glowIntensity: 0.5,
  },
};

// Helper functions
export function getIconPalette(id: string): IconPalette {
  return ICON_PALETTES[id] || ICON_PALETTES.default;
}

export function getIconStyle(id: string): IconStyle {
  const palette = getIconPalette(id);
  return palette.style;
}

export function getAllIconPaletteIds(): string[] {
  return Object.keys(ICON_PALETTES);
}

export function getAllIconPalettes(): IconPalette[] {
  return Object.values(ICON_PALETTES);
}

/**
 * Convert IconStyle to Lucide props
 */
export function iconStyleToProps(style: IconStyle, themeColor?: string): Partial<LucideProps> {
  const props: Partial<LucideProps> = {
    strokeWidth: style.strokeWidth,
  };

  if (style.fill && style.fill !== 'none') {
    props.fill = style.fill === 'currentColor' ? themeColor : style.fill;
  }

  return props;
}
