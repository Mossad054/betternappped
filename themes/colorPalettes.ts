/**
 * Color Palettes Configuration
 * Date: 2025-11-05
 * Purpose: Predefined color schemes for user customization
 * Each palette supports both light and dark modes
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  light: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  dark: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  preview: string[]; // 4 colors for preview cards
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Warm and welcoming cream tones',
    light: {
      primary: '#F9CF73',
      secondary: '#FFDFAE',
      accent: '#FFB870',
      background: '#eee9dd',
      surface: '#FAF5EB',
      text: '#1b1b1b',
      textSecondary: '#6B6B6B',
      border: 'rgba(0, 0, 0, 0.06)',
      success: '#A5D6A7',
      warning: '#FFB74D',
      error: '#E57373',
      info: '#81D4FA',
    },
    dark: {
      primary: '#F9CF73',
      secondary: '#FFDFAE',
      accent: '#FFB870',
      background: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#FFFFFF',
      textSecondary: '#B8B8B8',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#81C784',
      warning: '#FFB74D',
      error: '#E57373',
      info: '#64B5F6',
    },
    preview: ['#F9CF73', '#FFDFAE', '#FFB870', '#A5D6A7'],
  },
  
  warm: {
    id: 'warm',
    name: 'Warm Sunset',
    description: 'Cozy oranges and warm coral tones',
    light: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#EC4899',
      background: '#FFF7ED',
      surface: '#FFFBF5',
      text: '#1C1917',
      textSecondary: '#78716C',
      border: 'rgba(251, 146, 60, 0.15)',
      success: '#84CC16',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#06B6D4',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#FDBA74',
      accent: '#F472B6',
      background: '#1C1917',
      surface: '#292524',
      text: '#FAFAF9',
      textSecondary: '#A8A29E',
      border: 'rgba(251, 146, 60, 0.2)',
      success: '#A3E635',
      warning: '#FDE047',
      error: '#F87171',
      info: '#22D3EE',
    },
    preview: ['#F97316', '#FB923C', '#EC4899', '#EAB308'],
  },
  
  cool: {
    id: 'cool',
    name: 'Ocean Breeze',
    description: 'Refreshing blues and cool cyans',
    light: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      accent: '#8B5CF6',
      background: '#F0F9FF',
      surface: '#F8FCFF',
      text: '#0C4A6E',
      textSecondary: '#64748B',
      border: 'rgba(14, 165, 233, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
    dark: {
      primary: '#38BDF8',
      secondary: '#7DD3FC',
      accent: '#A78BFA',
      background: '#0C1821',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      border: 'rgba(56, 189, 248, 0.2)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#22D3EE',
    },
    preview: ['#0EA5E9', '#38BDF8', '#8B5CF6', '#06B6D4'],
  },
  
  nature: {
    id: 'nature',
    name: 'Forest Green',
    description: 'Earthy greens and natural tones',
    light: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#CA8A04',
      background: '#F0FDF4',
      surface: '#F7FEF9',
      text: '#064E3B',
      textSecondary: '#6B7280',
      border: 'rgba(5, 150, 105, 0.15)',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#EAB308',
      background: '#0A2817',
      surface: '#1B3A2F',
      text: '#ECFDF5',
      textSecondary: '#9CA3AF',
      border: 'rgba(16, 185, 129, 0.2)',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    preview: ['#059669', '#10B981', '#CA8A04', '#22C55E'],
  },
  
  pastel: {
    id: 'pastel',
    name: 'Soft Pastel',
    description: 'Gentle purples and soft pinks',
    light: {
      primary: '#A78BFA',
      secondary: '#C4B5FD',
      accent: '#FB7185',
      background: '#FAF5FF',
      surface: '#FEFCFF',
      text: '#581C87',
      textSecondary: '#71717A',
      border: 'rgba(167, 139, 250, 0.15)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#FB7185',
      info: '#60A5FA',
    },
    dark: {
      primary: '#C4B5FD',
      secondary: '#DDD6FE',
      accent: '#FDA4AF',
      background: '#1E1233',
      surface: '#2E1F47',
      text: '#FAF5FF',
      textSecondary: '#A1A1AA',
      border: 'rgba(196, 181, 253, 0.2)',
      success: '#6EE7B7',
      warning: '#FDE047',
      error: '#FDA4AF',
      info: '#93C5FD',
    },
    preview: ['#A78BFA', '#C4B5FD', '#FB7185', '#FBBF24'],
  },
  
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Rich teals and deep sea blues',
    light: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#06B6D4',
      background: '#F0FDFA',
      surface: '#F7FFFE',
      text: '#134E4A',
      textSecondary: '#64748B',
      border: 'rgba(13, 148, 136, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    dark: {
      primary: '#14B8A6',
      secondary: '#2DD4BF',
      accent: '#22D3EE',
      background: '#042F2E',
      surface: '#134E4A',
      text: '#F0FDFA',
      textSecondary: '#94A3B8',
      border: 'rgba(20, 184, 166, 0.2)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
    },
    preview: ['#0D9488', '#14B8A6', '#06B6D4', '#10B981'],
  },
  
  sunset: {
    id: 'sunset',
    name: 'Golden Sunset',
    description: 'Vibrant golds and sunset oranges',
    light: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#F97316',
      background: '#FFFBEB',
      surface: '#FEFDF5',
      text: '#78350F',
      textSecondary: '#78716C',
      border: 'rgba(245, 158, 11, 0.15)',
      success: '#84CC16',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#FBBF24',
      secondary: '#FCD34D',
      accent: '#FB923C',
      background: '#1C1917',
      surface: '#292524',
      text: '#FFFBEB',
      textSecondary: '#A8A29E',
      border: 'rgba(251, 191, 36, 0.2)',
      success: '#A3E635',
      warning: '#FDE047',
      error: '#F87171',
      info: '#60A5FA',
    },
    preview: ['#F59E0B', '#FBBF24', '#F97316', '#EAB308'],
  },
  
  forest: {
    id: 'forest',
    name: 'Deep Forest',
    description: 'Dark emeralds and forest greens',
    light: {
      primary: '#047857',
      secondary: '#059669',
      accent: '#65A30D',
      background: '#ECFDF5',
      surface: '#F7FEF9',
      text: '#064E3B',
      textSecondary: '#6B7280',
      border: 'rgba(4, 120, 87, 0.15)',
      success: '#10B981',
      warning: '#CA8A04',
      error: '#DC2626',
      info: '#0891B2',
    },
    dark: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#84CC16',
      background: '#022C22',
      surface: '#064E3B',
      text: '#ECFDF5',
      textSecondary: '#9CA3AF',
      border: 'rgba(5, 150, 105, 0.2)',
      success: '#34D399',
      warning: '#EAB308',
      error: '#F87171',
      info: '#06B6D4',
    },
    preview: ['#047857', '#059669', '#65A30D', '#10B981'],
  },
  
  lavender: {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft lavenders and gentle purples',
    light: {
      primary: '#9333EA',
      secondary: '#A855F7',
      accent: '#D946EF',
      background: '#FAF5FF',
      surface: '#FEFCFF',
      text: '#581C87',
      textSecondary: '#71717A',
      border: 'rgba(147, 51, 234, 0.15)',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EC4899',
      info: '#8B5CF6',
    },
    dark: {
      primary: '#A855F7',
      secondary: '#C084FC',
      accent: '#E879F9',
      background: '#1A0B2E',
      surface: '#2E1F47',
      text: '#FAF5FF',
      textSecondary: '#A1A1AA',
      border: 'rgba(168, 85, 247, 0.2)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F472B6',
      info: '#A78BFA',
    },
    preview: ['#9333EA', '#A855F7', '#D946EF', '#8B5CF6'],
  },
};

// Helper function to get palette by ID
export function getPalette(id: string): ColorPalette {
  return COLOR_PALETTES[id] || COLOR_PALETTES.default;
}

// Helper function to get palette colors by mode
export function getPaletteColors(id: string, mode: 'light' | 'dark') {
  const palette = getPalette(id);
  return palette[mode];
}

// Get all palette IDs
export function getAllPaletteIds(): string[] {
  return Object.keys(COLOR_PALETTES);
}

// Get all palettes as array
export function getAllPalettes(): ColorPalette[] {
  return Object.values(COLOR_PALETTES);
}
