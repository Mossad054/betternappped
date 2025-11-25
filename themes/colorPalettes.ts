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
    name: 'Mindful Pastels',
    description: 'Soft mint and coral wellness tones',
    light: {
      primary: '#FFB088',
      secondary: '#D4EDD1',
      accent: '#FF8866',
      background: '#F0FAED',
      surface: '#FFFFFF',
      text: '#1C1C1E',
      textSecondary: '#3A3A3C',
      border: 'rgba(0, 0, 0, 0.06)',
      success: '#A5D6A7',
      warning: '#FFD97D',
      error: '#FF8B8B',
      info: '#81D4FA',
    },
    dark: {
      primary: '#FFB088',
      secondary: '#6EE7B7',
      accent: '#FF9B6E',
      background: '#000000',
      surface: '#0F0F0F',
      text: '#B8B8B8',
      textSecondary: '#A0A0A0',
      border: 'rgba(255, 255, 255, 0.15)',
      success: '#00C853',
      warning: '#FFB300',
      error: '#FF3D00',
      info: '#2196F3',
    },
    preview: ['#FFB088', '#D4EDD1', '#FF8866', '#A5D6A7'],
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
  
  peppermint: {
    id: 'peppermint',
    name: 'Peppermint',
    description: 'Fresh red, orange, blue and green blend',
    light: {
      primary: '#EF4444',
      secondary: '#F97316',
      accent: '#3B82F6',
      background: '#FEF2F2',
      surface: '#FFFBF5',
      text: '#1C1917',
      textSecondary: '#78716C',
      border: 'rgba(239, 68, 68, 0.15)',
      success: '#22C55E',
      warning: '#F97316',
      error: '#EF4444',
      info: '#06B6D4',
    },
    dark: {
      primary: '#F87171',
      secondary: '#FB923C',
      accent: '#60A5FA',
      background: '#1C1917',
      surface: '#292524',
      text: '#FAFAF9',
      textSecondary: '#A8A29E',
      border: 'rgba(248, 113, 113, 0.2)',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#F87171',
      info: '#22D3EE',
    },
    preview: ['#EF4444', '#F97316', '#3B82F6', '#22C55E'],
  },
  
  original: {
    id: 'original',
    name: 'Original',
    description: 'Classic orange, green, purple and blue mix',
    light: {
      primary: '#F97316',
      secondary: '#22C55E',
      accent: '#A855F7',
      background: '#FFF7ED',
      surface: '#FFFBF5',
      text: '#1C1917',
      textSecondary: '#737373',
      border: 'rgba(249, 115, 22, 0.15)',
      success: '#22C55E',
      warning: '#F97316',
      error: '#EF4444',
      info: '#3B82F6',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#4ADE80',
      accent: '#C084FC',
      background: '#1C1917',
      surface: '#292524',
      text: '#FAFAF9',
      textSecondary: '#A3A3A3',
      border: 'rgba(251, 146, 60, 0.2)',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#F87171',
      info: '#60A5FA',
    },
    preview: ['#F97316', '#22C55E', '#A855F7', '#3B82F6'],
  },
  
  popsicle: {
    id: 'popsicle',
    name: 'Popsicle',
    description: 'Sweet magenta, pink, orange and yellow',
    light: {
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#F97316',
      background: '#FFF1F2',
      surface: '#FFFBF5',
      text: '#831843',
      textSecondary: '#78716C',
      border: 'rgba(236, 72, 153, 0.15)',
      success: '#84CC16',
      warning: '#EAB308',
      error: '#EC4899',
      info: '#F97316',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#FB7185',
      accent: '#FB923C',
      background: '#1E1020',
      surface: '#2D1B2E',
      text: '#FFF1F2',
      textSecondary: '#A8A29E',
      border: 'rgba(244, 114, 182, 0.2)',
      success: '#A3E635',
      warning: '#FDE047',
      error: '#FB7185',
      info: '#FB923C',
    },
    preview: ['#EC4899', '#F472B6', '#F97316', '#EAB308'],
  },
  
  traffic: {
    id: 'traffic',
    name: 'Traffic',
    description: 'Bold traffic light greens, yellows and reds',
    light: {
      primary: '#22C55E',
      secondary: '#84CC16',
      accent: '#EAB308',
      background: '#F0FDF4',
      surface: '#F7FEF9',
      text: '#14532D',
      textSecondary: '#6B7280',
      border: 'rgba(34, 197, 94, 0.15)',
      success: '#22C55E',
      warning: '#F97316',
      error: '#EF4444',
      info: '#84CC16',
    },
    dark: {
      primary: '#4ADE80',
      secondary: '#A3E635',
      accent: '#FDE047',
      background: '#0A2817',
      surface: '#1B3A2F',
      text: '#F0FDF4',
      textSecondary: '#9CA3AF',
      border: 'rgba(74, 222, 128, 0.2)',
      success: '#4ADE80',
      warning: '#FB923C',
      error: '#F87171',
      info: '#A3E635',
    },
    preview: ['#22C55E', '#84CC16', '#F97316', '#EF4444'],
  },
  
  camouflage: {
    id: 'camouflage',
    name: 'Camouflage',
    description: 'Earthy lime, green, cyan and gray tones',
    light: {
      primary: '#84CC16',
      secondary: '#22C55E',
      accent: '#06B6D4',
      background: '#F7FEE7',
      surface: '#FEFDF5',
      text: '#365314',
      textSecondary: '#71717A',
      border: 'rgba(132, 204, 22, 0.15)',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#78716C',
      info: '#06B6D4',
    },
    dark: {
      primary: '#A3E635',
      secondary: '#4ADE80',
      accent: '#22D3EE',
      background: '#1A1F16',
      surface: '#2A3420',
      text: '#F7FEE7',
      textSecondary: '#A1A1AA',
      border: 'rgba(163, 230, 53, 0.2)',
      success: '#4ADE80',
      warning: '#FDE047',
      error: '#A8A29E',
      info: '#22D3EE',
    },
    preview: ['#84CC16', '#22C55E', '#06B6D4', '#78716C'],
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
