/**
 * Activity-Specific Feelings Configuration
 * Maps activity categories to contextually relevant post-activity emotions
 */

export interface Feeling {
  id: string;
  label: string;
  emoji: string;
  valence: 'positive' | 'negative' | 'neutral'; // Emotional valence
}

export interface ActivityFeelingConfig {
  categoryId: string;
  feelings: Feeling[];
  question: string; // The question to ask the user
}

/**
 * Comprehensive feelings mapped to activity categories
 * Each activity type gets relevant emotional responses
 */
export const ACTIVITY_FEELINGS_MAP: Record<string, ActivityFeelingConfig> = {
  // Physical activities - energy/satisfaction focused
  'sports-activities': {
    categoryId: 'sports-activities',
    question: 'How do you feel after this activity?',
    feelings: [
      { id: 'energized', label: 'Energized', emoji: '⚡', valence: 'positive' },
      { id: 'accomplished', label: 'Accomplished', emoji: '💪', valence: 'positive' },
      { id: 'refreshed', label: 'Refreshed', emoji: '😊', valence: 'positive' },
      { id: 'tired', label: 'Tired', emoji: '😮‍💨', valence: 'neutral' },
      { id: 'exhausted', label: 'Exhausted', emoji: '😫', valence: 'negative' },
      { id: 'sore', label: 'Sore', emoji: '🤕', valence: 'negative' },
    ],
  },

  // Self-care/beauty - confidence/relaxation focused
  beauty: {
    categoryId: 'beauty',
    question: 'How did this make you feel?',
    feelings: [
      { id: 'confident', label: 'Confident', emoji: '💁', valence: 'positive' },
      { id: 'relaxed', label: 'Relaxed', emoji: '😌', valence: 'positive' },
      { id: 'pampered', label: 'Pampered', emoji: '✨', valence: 'positive' },
      { id: 'refreshed', label: 'Refreshed', emoji: '🌟', valence: 'positive' },
      { id: 'indifferent', label: 'Meh', emoji: '😐', valence: 'neutral' },
      { id: 'disappointed', label: 'Disappointed', emoji: '😕', valence: 'negative' },
    ],
  },

  // Chores - accomplishment/frustration focused
  chores: {
    categoryId: 'chores',
    question: 'How do you feel after completing this?',
    feelings: [
      { id: 'accomplished', label: 'Accomplished', emoji: '✅', valence: 'positive' },
      { id: 'satisfied', label: 'Satisfied', emoji: '😊', valence: 'positive' },
      { id: 'productive', label: 'Productive', emoji: '💯', valence: 'positive' },
      { id: 'neutral', label: 'Just done', emoji: '😐', valence: 'neutral' },
      { id: 'tired', label: 'Tired', emoji: '😮‍💨', valence: 'neutral' },
      { id: 'frustrated', label: 'Frustrated', emoji: '😤', valence: 'negative' },
    ],
  },

  // Daily routines - habit/wellness focused
  'daily-routines': {
    categoryId: 'daily-routines',
    question: 'How are you feeling?',
    feelings: [
      { id: 'good', label: 'Good', emoji: '😊', valence: 'positive' },
      { id: 'energized', label: 'Energized', emoji: '⚡', valence: 'positive' },
      { id: 'refreshed', label: 'Refreshed', emoji: '😌', valence: 'positive' },
      { id: 'normal', label: 'Normal', emoji: '😐', valence: 'neutral' },
      { id: 'sluggish', label: 'Sluggish', emoji: '😴', valence: 'neutral' },
      { id: 'off', label: 'Off', emoji: '😕', valence: 'negative' },
    ],
  },

  // Hobbies - enjoyment/creativity focused
  hobby: {
    categoryId: 'hobby',
    question: 'How did you enjoy this?',
    feelings: [
      { id: 'joyful', label: 'Joyful', emoji: '😄', valence: 'positive' },
      { id: 'creative', label: 'Creative', emoji: '🎨', valence: 'positive' },
      { id: 'fulfilled', label: 'Fulfilled', emoji: '🌈', valence: 'positive' },
      { id: 'relaxed', label: 'Relaxed', emoji: '😌', valence: 'positive' },
      { id: 'bored', label: 'Bored', emoji: '😑', valence: 'negative' },
      { id: 'frustrated', label: 'Frustrated', emoji: '😤', valence: 'negative' },
    ],
  },

  // Places - experience/social focused
  places: {
    categoryId: 'places',
    question: 'How was your experience?',
    feelings: [
      { id: 'happy', label: 'Happy', emoji: '😊', valence: 'positive' },
      { id: 'peaceful', label: 'Peaceful', emoji: '😌', valence: 'positive' },
      { id: 'excited', label: 'Excited', emoji: '🤩', valence: 'positive' },
      { id: 'comfortable', label: 'Comfortable', emoji: '☺️', valence: 'positive' },
      { id: 'stressed', label: 'Stressed', emoji: '😰', valence: 'negative' },
      { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😵', valence: 'negative' },
    ],
  },

  // Health - physical/mental state focused
  health: {
    categoryId: 'health',
    question: 'How are you feeling physically?',
    feelings: [
      { id: 'better', label: 'Better', emoji: '😊', valence: 'positive' },
      { id: 'relieved', label: 'Relieved', emoji: '😌', valence: 'positive' },
      { id: 'okay', label: 'Okay', emoji: '😐', valence: 'neutral' },
      { id: 'uncomfortable', label: 'Uncomfortable', emoji: '😣', valence: 'negative' },
      { id: 'painful', label: 'Painful', emoji: '😖', valence: 'negative' },
      { id: 'worried', label: 'Worried', emoji: '😟', valence: 'negative' },
    ],
  },

  // Productivity - mental clarity/achievement focused
  productivity: {
    categoryId: 'productivity',
    question: 'How productive did you feel?',
    feelings: [
      { id: 'accomplished', label: 'Accomplished', emoji: '🎯', valence: 'positive' },
      { id: 'focused', label: 'Focused', emoji: '🧠', valence: 'positive' },
      { id: 'efficient', label: 'Efficient', emoji: '⚡', valence: 'positive' },
      { id: 'okay', label: 'Okay', emoji: '😐', valence: 'neutral' },
      { id: 'scattered', label: 'Scattered', emoji: '😵‍💫', valence: 'negative' },
      { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😰', valence: 'negative' },
    ],
  },

  // Better Me - mindfulness/growth focused
  betterme: {
    categoryId: 'betterme',
    question: 'How did this practice make you feel?',
    feelings: [
      { id: 'peaceful', label: 'Peaceful', emoji: '🕊️', valence: 'positive' },
      { id: 'centered', label: 'Centered', emoji: '🧘', valence: 'positive' },
      { id: 'grateful', label: 'Grateful', emoji: '🙏', valence: 'positive' },
      { id: 'fulfilled', label: 'Fulfilled', emoji: '✨', valence: 'positive' },
      { id: 'calm', label: 'Calm', emoji: '😌', valence: 'positive' },
      { id: 'restless', label: 'Restless', emoji: '😬', valence: 'negative' },
    ],
  },

  // Weather - environmental impact focused
  weather: {
    categoryId: 'weather',
    question: 'How did the weather affect your mood?',
    feelings: [
      { id: 'uplifted', label: 'Uplifted', emoji: '☀️', valence: 'positive' },
      { id: 'energized', label: 'Energized', emoji: '⚡', valence: 'positive' },
      { id: 'cozy', label: 'Cozy', emoji: '🛋️', valence: 'positive' },
      { id: 'neutral', label: 'No effect', emoji: '😐', valence: 'neutral' },
      { id: 'gloomy', label: 'Gloomy', emoji: '😔', valence: 'negative' },
      { id: 'drained', label: 'Drained', emoji: '😞', valence: 'negative' },
    ],
  },
};

/**
 * Get feelings for a specific activity category
 * Falls back to generic feelings if category not found
 */
export function getFeelingsForActivity(categoryId: string): ActivityFeelingConfig {
  // Return specific feelings if available
  if (ACTIVITY_FEELINGS_MAP[categoryId]) {
    return ACTIVITY_FEELINGS_MAP[categoryId];
  }

  // Fallback to generic feelings
  return {
    categoryId: 'generic',
    question: 'How do you feel after this activity?',
    feelings: [
      { id: 'happy', label: 'Happy', emoji: '😊', valence: 'positive' },
      { id: 'good', label: 'Good', emoji: '😌', valence: 'positive' },
      { id: 'okay', label: 'Okay', emoji: '😐', valence: 'neutral' },
      { id: 'tired', label: 'Tired', emoji: '😮‍💨', valence: 'neutral' },
      { id: 'meh', label: 'Meh', emoji: '😕', valence: 'negative' },
      { id: 'bad', label: 'Bad', emoji: '😞', valence: 'negative' },
    ],
  };
}

/**
 * Determine if an activity should ask for duration
 */
export function shouldAskDuration(categoryId: string, activityId?: string): boolean {
  // Categories that never need duration
  const noDurationCategories = ['weather'];
  if (noDurationCategories.includes(categoryId)) {
    return false;
  }

  // Specific activities that don't need duration
  const noDurationActivities = [
    'sunny', 'clouds', 'rain', 'snow', 'heat', 'storm', 'wind', // weather
    'period', 'pain', // health conditions (not time-bound)
    'shopping', // quick errand, duration less relevant
  ];
  
  if (activityId && noDurationActivities.includes(activityId)) {
    return false;
  }

  return true;
}

/**
 * Determine if an activity should ask for intensity
 */
export function shouldAskIntensity(categoryId: string, activityId?: string): boolean {
  // Only physical/mental effort activities need intensity
  const intensityCategories = ['sports-activities', 'productivity', 'betterme'];
  
  if (intensityCategories.includes(categoryId)) {
    return true;
  }

  // Specific chores that have physical intensity
  if (categoryId === 'chores' && activityId) {
    const intensiveChores = ['cleaning', 'cooking', 'laundry'];
    return intensiveChores.includes(activityId);
  }

  // Specific hobby activities with intensity
  if (categoryId === 'hobby' && activityId) {
    const intensiveHobbies = ['dance', 'gardening', 'cycling', 'hiking', 'camping', 'skateboarding'];
    return intensiveHobbies.includes(activityId);
  }

  // Specific places with physical activity
  if (categoryId === 'places' && activityId) {
    const intensivePlaces = ['gym', 'nature', 'hiking'];
    return intensivePlaces.includes(activityId);
  }

  return false;
}
