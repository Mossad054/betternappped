/**
 * Global Emoji Score Mapping
 * Single source of truth for emoji → numerical score conversions
 * Used across all activity feedback, mood tracking, and correlations
 */

// Core feeling scores (1-5 scale)
export const FEELING_SCORES = {
  VERY_BAD: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  VERY_GOOD: 5,
} as const;

// Emoji to score mapping for activity feedback
export const ACTIVITY_EMOJI_SCORES: Record<string, number> = {
  // Very positive (5)
  '😄': 5,
  '🤩': 5,
  '😁': 5,
  '🥳': 5,
  '💪': 5,
  '🔥': 5,
  '⚡': 5,
  '🎉': 5,

  // Positive (4)
  '😊': 4,
  '🙂': 4,
  '😌': 4,
  '👍': 4,
  '✨': 4,
  '💚': 4,
  '🌟': 4,

  // Neutral (3)
  '😐': 3,
  '🤔': 3,
  '😶': 3,
  '➖': 3,

  // Negative (2)
  '😕': 2,
  '😓': 2,
  '😔': 2,
  '👎': 2,
  '😮‍💨': 2,

  // Very negative (1)
  '😞': 1,
  '😢': 1,
  '😰': 1,
  '😵': 1,
  '🪫': 1,
  '💔': 1,
};

// Mood emoji scores
export const MOOD_EMOJI_SCORES: Record<string, number> = {
  // Excellent (5)
  '😄': 5,
  '🤩': 5,
  '😁': 5,
  '🥳': 5,

  // Good (4)
  '😊': 4,
  '🙂': 4,
  '😌': 4,

  // Okay (3)
  '😐': 3,
  '🤔': 3,

  // Bad (2)
  '😕': 2,
  '😓': 2,

  // Terrible (1)
  '😞': 1,
  '😢': 1,
  '😰': 1,
};

// Sleep quality emoji scores
export const SLEEP_EMOJI_SCORES: Record<string, number> = {
  // Perfect (5)
  '😇': 5,
  '🌟': 5,

  // Good (4)
  '😌': 4,
  '😴': 4,

  // Fair (3)
  '🙂': 3,
  '😐': 3,

  // Poor (2)
  '😓': 2,
  '😕': 2,

  // Terrible (1)
  '😰': 1,
  '😵': 1,
};

// Mental clarity emoji scores
export const CLARITY_EMOJI_SCORES: Record<string, number> = {
  // Sharp (5)
  '🤩': 5,
  '🧠': 5,
  '💡': 5,

  // Clear (4)
  '😊': 4,
  '✨': 4,

  // Moderate (3)
  '🙂': 3,
  '😐': 3,

  // Unclear (2)
  '😕': 2,
  '🌫️': 2,

  // Foggy (1)
  '😵': 1,
  '🤯': 1,
};

// Energy level emoji scores
export const ENERGY_EMOJI_SCORES: Record<string, number> = {
  // Full (5)
  '🔋': 5,
  '⚡': 5,
  '💪': 5,

  // Energized (4)
  '😊': 4,
  '🌟': 4,

  // Moderate (3)
  '😐': 3,
  '🙂': 3,

  // Low (2)
  '😮‍💨': 2,
  '😓': 2,

  // Drained (1)
  '🪫': 1,
  '😴': 1,
};

// Standardized feedback options for activities
export interface FeedbackOption {
  emoji: string;
  label: string;
  score: number;
  color: string;
}

export const ACTIVITY_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { emoji: '😞', label: 'Terrible', score: 1, color: '#EF4444' },
  { emoji: '😕', label: 'Bad', score: 2, color: '#F59E0B' },
  { emoji: '😐', label: 'Okay', score: 3, color: '#6B7280' },
  { emoji: '😊', label: 'Good', score: 4, color: '#10B981' },
  { emoji: '😄', label: 'Excellent', score: 5, color: '#8B5CF6' },
];

export const SLEEP_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { emoji: '😰', label: 'Terrible', score: 1, color: '#EF4444' },
  { emoji: '😓', label: 'Poor', score: 2, color: '#F59E0B' },
  { emoji: '😴', label: 'Fair', score: 3, color: '#6B7280' },
  { emoji: '😌', label: 'Good', score: 4, color: '#10B981' },
  { emoji: '😇', label: 'Perfect', score: 5, color: '#8B5CF6' },
];

export const CLARITY_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { emoji: '😵', label: 'Foggy', score: 1, color: '#EF4444' },
  { emoji: '😕', label: 'Unclear', score: 2, color: '#F59E0B' },
  { emoji: '🙂', label: 'Moderate', score: 3, color: '#6B7280' },
  { emoji: '😊', label: 'Clear', score: 4, color: '#10B981' },
  { emoji: '🤩', label: 'Sharp', score: 5, color: '#8B5CF6' },
];

export const ENERGY_FEEDBACK_OPTIONS: FeedbackOption[] = [
  { emoji: '🪫', label: 'Drained', score: 1, color: '#EF4444' },
  { emoji: '😮‍💨', label: 'Low', score: 2, color: '#F59E0B' },
  { emoji: '😐', label: 'Moderate', score: 3, color: '#6B7280' },
  { emoji: '⚡', label: 'Energized', score: 4, color: '#10B981' },
  { emoji: '🔋', label: 'Full', score: 5, color: '#8B5CF6' },
];

// Helper functions
export function getScoreFromEmoji(emoji: string, type: 'activity' | 'mood' | 'sleep' | 'clarity' | 'energy' = 'activity'): number {
  switch (type) {
    case 'mood':
      return MOOD_EMOJI_SCORES[emoji] || 3;
    case 'sleep':
      return SLEEP_EMOJI_SCORES[emoji] || 3;
    case 'clarity':
      return CLARITY_EMOJI_SCORES[emoji] || 3;
    case 'energy':
      return ENERGY_EMOJI_SCORES[emoji] || 3;
    default:
      return ACTIVITY_EMOJI_SCORES[emoji] || 3;
  }
}

export function getEmojiFromScore(score: number, type: 'activity' | 'sleep' | 'clarity' | 'energy' = 'activity'): string {
  const options = type === 'activity' ? ACTIVITY_FEEDBACK_OPTIONS :
                  type === 'sleep' ? SLEEP_FEEDBACK_OPTIONS :
                  type === 'clarity' ? CLARITY_FEEDBACK_OPTIONS :
                  ENERGY_FEEDBACK_OPTIONS;

  const option = options.find(o => o.score === Math.round(score));
  return option?.emoji || '😐';
}

export function getLabelFromScore(score: number, type: 'activity' | 'sleep' | 'clarity' | 'energy' = 'activity'): string {
  const options = type === 'activity' ? ACTIVITY_FEEDBACK_OPTIONS :
                  type === 'sleep' ? SLEEP_FEEDBACK_OPTIONS :
                  type === 'clarity' ? CLARITY_FEEDBACK_OPTIONS :
                  ENERGY_FEEDBACK_OPTIONS;

  const option = options.find(o => o.score === Math.round(score));
  return option?.label || 'Unknown';
}

export function getColorFromScore(score: number): string {
  if (score >= 4.5) return '#8B5CF6';
  if (score >= 3.5) return '#10B981';
  if (score >= 2.5) return '#6B7280';
  if (score >= 1.5) return '#F59E0B';
  return '#EF4444';
}

// Correlation strength labels
export function getCorrelationLabel(correlation: number): string {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'No correlation';
}

export function getCorrelationColor(correlation: number): string {
  const abs = Math.abs(correlation);
  if (correlation > 0) {
    if (abs >= 0.7) return '#10B981';
    if (abs >= 0.4) return '#34D399';
    return '#6EE7B7';
  } else {
    if (abs >= 0.7) return '#EF4444';
    if (abs >= 0.4) return '#F87171';
    return '#FCA5A5';
  }
}
