/**
 * Emoji Palettes Configuration
 * Date: 2025-11-05
 * Purpose: Predefined emoji style sets for user customization
 * Each palette represents a distinct emoji design system
 */

export interface EmojiSet {
  happy: string;
  love: string;
  moon: string;
  nature: string;
  target: string;
  fire: string;
  star: string;
  check: string;
  // Mood-specific emojis
  rad: string;
  good: string;
  meh: string;
  bad: string;
  awful: string;
  // Activity emojis
  exercise: string;
  meditation: string;
  reading: string;
  social: string;
  // Sleep emojis
  sleeping: string;
  tired: string;
  rested: string;
}

export interface EmojiPalette {
  id: string;
  name: string;
  description: string;
  style: 'default' | 'apple' | 'google' | 'twitter' | 'flat' | 'minimal';
  emojis: EmojiSet;
  previewEmojis: string[]; // 5 representative emojis for preview
  contrastAdjustment?: {
    light: number; // Opacity adjustment for light mode (0-1)
    dark: number;  // Opacity adjustment for dark mode (0-1)
  };
}

export const EMOJI_PALETTES: Record<string, EmojiPalette> = {
  apple: {
    id: 'apple',
    name: 'Apple',
    description: 'Classic iOS-style emojis with rich 3D design',
    style: 'apple',
    emojis: {
      happy: '😊',
      love: '❤️',
      moon: '🌙',
      nature: '🌿',
      target: '🎯',
      fire: '🔥',
      star: '⭐',
      check: '✅',
      rad: '😍',
      good: '😊',
      meh: '😐',
      bad: '😔',
      awful: '😢',
      exercise: '💪',
      meditation: '🧘',
      reading: '📚',
      social: '👥',
      sleeping: '😴',
      tired: '🥱',
      rested: '🌅',
    },
    previewEmojis: ['😊', '❤️', '🌙', '🌿', '🎯'],
    contrastAdjustment: {
      light: 1.0,
      dark: 0.9,
    },
  },

  google: {
    id: 'google',
    name: 'Google',
    description: 'Playful blob-style emojis with smooth gradients',
    style: 'google',
    emojis: {
      happy: '😊',
      love: '❤️',
      moon: '🌛',
      nature: '🌱',
      target: '🎯',
      fire: '🔥',
      star: '⭐',
      check: '✔️',
      rad: '🤩',
      good: '😊',
      meh: '😑',
      bad: '☹️',
      awful: '😭',
      exercise: '🏃',
      meditation: '🧘‍♀️',
      reading: '📖',
      social: '👫',
      sleeping: '💤',
      tired: '😪',
      rested: '☀️',
    },
    previewEmojis: ['😊', '❤️', '🌛', '🌱', '🎯'],
    contrastAdjustment: {
      light: 1.0,
      dark: 0.95,
    },
  },

  twitter: {
    id: 'twitter',
    name: 'Twitter',
    description: 'Colorful Twemoji set with bold outlines',
    style: 'twitter',
    emojis: {
      happy: '😄',
      love: '💖',
      moon: '🌜',
      nature: '🍃',
      target: '🎯',
      fire: '🔥',
      star: '✨',
      check: '✓',
      rad: '🤗',
      good: '😄',
      meh: '😕',
      bad: '😞',
      awful: '😭',
      exercise: '🏋️',
      meditation: '🕉️',
      reading: '📕',
      social: '🤝',
      sleeping: '😴',
      tired: '😫',
      rested: '🌞',
    },
    previewEmojis: ['😄', '💖', '🌜', '🍃', '✨'],
    contrastAdjustment: {
      light: 1.0,
      dark: 0.92,
    },
  },

  flat: {
    id: 'flat',
    name: 'Flat Minimal',
    description: 'Modern flat design with subtle colors',
    style: 'flat',
    emojis: {
      happy: '🙂',
      love: '💛',
      moon: '🌑',
      nature: '🌾',
      target: '⭕',
      fire: '🔴',
      star: '⭐',
      check: '☑️',
      rad: '😎',
      good: '🙂',
      meh: '😶',
      bad: '🙁',
      awful: '😣',
      exercise: '⚡',
      meditation: '☮️',
      reading: '📄',
      social: '👤',
      sleeping: '💤',
      tired: '😑',
      rested: '🌤️',
    },
    previewEmojis: ['🙂', '💛', '🌑', '🌾', '⭕'],
    contrastAdjustment: {
      light: 0.95,
      dark: 1.0,
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Ultra Minimal',
    description: 'Simplified symbols for clean interfaces',
    style: 'minimal',
    emojis: {
      happy: '😊',
      love: '♥',
      moon: '☾',
      nature: '☘',
      target: '◎',
      fire: '●',
      star: '★',
      check: '✓',
      rad: '☺',
      good: '◡',
      meh: '–',
      bad: '◠',
      awful: '⌢',
      exercise: '⚬',
      meditation: '◯',
      reading: '▯',
      social: '◉',
      sleeping: '☽',
      tired: '◐',
      rested: '☀',
    },
    previewEmojis: ['😊', '♥', '☾', '☘', '★'],
    contrastAdjustment: {
      light: 0.9,
      dark: 1.0,
    },
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant Colors',
    description: 'Bold and colorful emoji expressions',
    style: 'default',
    emojis: {
      happy: '😃',
      love: '💕',
      moon: '🌝',
      nature: '🌺',
      target: '🎯',
      fire: '🔥',
      star: '🌟',
      check: '✅',
      rad: '🥰',
      good: '😃',
      meh: '😐',
      bad: '😢',
      awful: '😖',
      exercise: '💪',
      meditation: '🧘',
      reading: '📚',
      social: '🎉',
      sleeping: '😴',
      tired: '😩',
      rested: '✨',
    },
    previewEmojis: ['😃', '💕', '🌝', '🌺', '🌟'],
    contrastAdjustment: {
      light: 1.0,
      dark: 0.88,
    },
  },
};

// Helper functions
export function getEmojiPalette(id: string): EmojiPalette {
  return EMOJI_PALETTES[id] || EMOJI_PALETTES.apple;
}

export function getEmojiSet(id: string): EmojiSet {
  const palette = getEmojiPalette(id);
  return palette.emojis;
}

export function getAllEmojiPaletteIds(): string[] {
  return Object.keys(EMOJI_PALETTES);
}

export function getAllEmojiPalettes(): EmojiPalette[] {
  return Object.values(EMOJI_PALETTES);
}

/**
 * Get emoji for a specific key from current palette
 */
export function getEmoji(paletteId: string, key: keyof EmojiSet): string {
  const palette = getEmojiPalette(paletteId);
  return palette.emojis[key];
}

/**
 * Get contrast adjustment for theme mode
 */
export function getEmojiOpacity(paletteId: string, themeMode: 'light' | 'dark'): number {
  const palette = getEmojiPalette(paletteId);
  if (!palette.contrastAdjustment) return 1.0;
  return themeMode === 'light' 
    ? palette.contrastAdjustment.light 
    : palette.contrastAdjustment.dark;
}
