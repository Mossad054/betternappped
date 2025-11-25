export type TimeRange = 'today' | 'week' | 'month' | 'year';

export type HabitCategory = 'MentalClarity' | 'Health' | 'Sleep' | 'Mood' | 'Intimacy' | 'Anxiety';

export type ExperimentStatus = 'active' | 'completed' | 'paused';

export type ExperimentOutcome = 'Mood' | 'Sleep Quality' | 'Mental Clarity' | 'Anxiety / Calmness' | 'Focus' | 'Productivity';

export interface ActiveHabit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  quote?: string;
  currentDay: number;
  totalDays: number;
  completedToday: boolean;
  reminderEnabled: boolean;
  streak: number;
  progressPercentage: number;
  feedback?: 'good' | 'neutral' | 'bad';
}

export interface SuggestedHabit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  quote: string;
  frequency: string;
  benefit: string;
}

export interface MoodData {
  date: string;
  score: number;
  emoji: string;
}

export interface ActivityData {
  category: string;
  count: number;
  color: string;
  impact: number;
}

export interface SleepData {
  date: string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  emoji: string;
}

export interface HabitData {
  date: string;
  completed: boolean;
}

export interface ExperimentData {
  id: string;
  title: string;
  emoji: string;
  currentDay: number;
  totalDays: number;
  isActive: boolean;
  beforeScore: number;
  afterScore?: number;
  insight?: string;
  category: 'mood' | 'sleep' | 'clarity';
}

export type LoggingFrequency = 'Daily' | 'Weekly' | 'After each activity';

export interface Experiment {
  id: string;
  activityName: string;
  activityEmoji: string;
  outcomes: ExperimentOutcome[];
  startDate: string;
  endDate: string;
  duration: number;
  loggingFrequency: LoggingFrequency;
  reminderTime?: string;
  status: 'active' | 'completed';
  currentDay: number;
  totalDays: number;
  logs: ExperimentLog[];
  baselineData?: {
    mood?: number;
    sleep?: number;
    clarity?: number;
    anxiety?: number;
    focus?: number;
    productivity?: number;
  };
  resultsData?: {
    mood?: number;
    sleep?: number;
    clarity?: number;
    anxiety?: number;
    focus?: number;
    productivity?: number;
  };
  insights?: string;
}

export interface ExperimentLog {
  date: string;
  completed: boolean;
  skipped: boolean;
  mood?: number;
  sleep?: number;
  clarity?: number;
  anxiety?: number;
  focus?: number;
  productivity?: number;
  notes?: string;
}

export interface SuggestedActivity {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'Exercise' | 'Meditation' | 'Screen Time' | 'Journaling' | 'Hydration' | 'Sleep Routine' | 'Social' | 'Custom';
  suggestedOutcomes: ExperimentOutcome[];
}

export interface DailyDetailData {
  date: string;
  mood: {
    score: number;
    emoji: string;
    note?: string;
  };
  activities: {
    category: string;
    name: string;
    duration: number;
    impact: number;
    emoji: string;
    color: string;
  }[];
  sleep: {
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    bedtime: string;
    wakeTime: string;
    emoji: string;
  };
  habits: {
    name: string;
    completed: boolean;
    emoji: string;
  }[];
  mentalClarity: {
    score: number;
    factors: string[];
  };
  experiments?: {
    name: string;
    emoji: string;
    status: 'completed' | 'skipped' | 'pending';
    outcomes?: {
      type: ExperimentOutcome;
      value: number;
    }[];
  }[];
  notes?: string;
}

// Generate dates for different time ranges
const generateDates = (range: TimeRange): string[] => {
  const dates: string[] = [];
  const now = new Date();
  
  switch (range) {
    case 'today':
      return [now.toISOString().split('T')[0]];
    case 'week':
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    case 'month':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    case 'year':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        dates.push(date.toISOString().split('T')[0].substring(0, 7)); // YYYY-MM format
      }
      return dates;
  }
};

// Mood data with realistic patterns
export const getMoodData = (range: TimeRange): MoodData[] => {
  if (!range || typeof range !== 'string' || range.length > 10) return [];
  const validRanges: TimeRange[] = ['today', 'week', 'month', 'year'];
  if (!validRanges.includes(range)) return [];
  
  const dates = generateDates(range);
  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  
  return dates.map((date, index) => {
    // Create realistic mood patterns - slightly better on weekends, some variation
    const baseScore = 3 + Math.sin(index * 0.3) * 0.8 + (Math.random() - 0.5) * 0.6;
    const score = Math.max(1, Math.min(5, Math.round(baseScore)));
    
    return {
      date,
      score,
      emoji: moodEmojis[score - 1],
    };
  });
};

// Activity data with categories
export const getActivityData = (range: TimeRange): ActivityData[] => {
  if (!range || typeof range !== 'string' || range.length > 10) return [];
  const validRanges: TimeRange[] = ['today', 'week', 'month', 'year'];
  if (!validRanges.includes(range)) return [];
  
  const activities = [
    { category: 'Work', color: '#3B82F6', baseCount: 8 },
    { category: 'Exercise', color: '#10B981', baseCount: 5 },
    { category: 'Social', color: '#F59E0B', baseCount: 6 },
    { category: 'Hobbies', color: '#8B5CF6', baseCount: 4 },
    { category: 'Rest', color: '#06B6D4', baseCount: 7 },
    { category: 'Learning', color: '#EF4444', baseCount: 3 },
  ];

  const multiplier = range === 'today' ? 1 : range === 'week' ? 7 : range === 'month' ? 30 : 365;
  
  return activities.map(activity => ({
    ...activity,
    count: Math.round(activity.baseCount * multiplier * (0.8 + Math.random() * 0.4)),
    impact: (Math.random() - 0.5) * 3, // -1.5 to +1.5 impact on mood
  }));
};

// Sleep data with quality patterns
export const getSleepData = (range: TimeRange): SleepData[] => {
  if (!range || typeof range !== 'string' || range.length > 10) return [];
  const validRanges: TimeRange[] = ['today', 'week', 'month', 'year'];
  if (!validRanges.includes(range)) return [];
  
  const dates = generateDates(range);
  const qualityLevels: ('poor' | 'fair' | 'good' | 'excellent')[] = ['poor', 'fair', 'good', 'excellent'];
  const sleepEmojis = ['😡', '🥱', '😴', '😌'];
  
  return dates.map((date, index) => {
    // Realistic sleep patterns - less sleep on weekends, some variation
    const baseHours = 7.5 + Math.sin(index * 0.2) * 1 + (Math.random() - 0.5) * 1.5;
    const hours = Math.max(4, Math.min(10, Math.round(baseHours * 10) / 10));
    
    // Quality correlates with hours but has some randomness
    let qualityIndex = Math.floor((hours - 4) / 1.5);
    qualityIndex = Math.max(0, Math.min(3, qualityIndex + Math.floor((Math.random() - 0.5) * 2)));
    
    return {
      date,
      hours,
      quality: qualityLevels[qualityIndex],
      emoji: sleepEmojis[qualityIndex],
    };
  });
};

// Habit data for streak calendar
export const getHabitData = (range: TimeRange): HabitData[] => {
  if (!range || typeof range !== 'string' || range.length > 10) return [];
  const validRanges: TimeRange[] = ['today', 'week', 'month', 'year'];
  if (!validRanges.includes(range)) return [];
  
  const dates = generateDates(range);
  
  return dates.map((date, index) => ({
    date,
    // Create realistic habit completion - 70% success rate with some streaks
    completed: Math.random() > 0.3 && (index === 0 || Math.random() > 0.2),
  }));
};

// Experiment data (legacy - kept for compatibility)
export const getExperimentData = (): ExperimentData[] => {
  return [
    {
      id: '1',
      title: 'Morning Exercise',
      emoji: '🏋️',
      currentDay: 4,
      totalDays: 7,
      isActive: true,
      beforeScore: 3.2,
      category: 'mood',
    },
    {
      id: '2',
      title: 'Meditation',
      emoji: '🧘',
      currentDay: 14,
      totalDays: 14,
      isActive: false,
      beforeScore: 2.8,
      afterScore: 4.1,
      insight: 'Meditation improved sleep quality by +23% and reduced stress levels significantly.',
      category: 'sleep',
    },
    {
      id: '3',
      title: 'Digital Detox',
      emoji: '📱',
      currentDay: 21,
      totalDays: 21,
      isActive: false,
      beforeScore: 3.0,
      afterScore: 4.3,
      insight: 'Limiting screen time before bed improved mental clarity by +43%.',
      category: 'clarity',
    },
  ];
};

// New experiments system
export const getExperiments = (): Experiment[] => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return [
    {
      id: 'exp-1',
      activityName: 'Morning Exercise',
      activityEmoji: '🏋️',
      outcomes: ['Mood', 'Mental Clarity', 'Productivity'],
      startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 7,
      loggingFrequency: 'Daily',
      reminderTime: '07:00',
      status: 'active',
      currentDay: 4,
      totalDays: 7,
      logs: [
        { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true, skipped: false, mood: 4, clarity: 4, productivity: 4 },
        { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true, skipped: false, mood: 4, clarity: 5, productivity: 5 },
        { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true, skipped: false, mood: 5, clarity: 4, productivity: 4 },
        { date: now.toISOString().split('T')[0], completed: false, skipped: false },
      ],
      baselineData: {
        mood: 3.2,
        clarity: 3.0,
        productivity: 2.8,
      },
    },
    {
      id: 'exp-2',
      activityName: 'Evening Meditation',
      activityEmoji: '🧘',
      outcomes: ['Sleep Quality', 'Anxiety / Calmness', 'Mental Clarity'],
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: yesterday.toISOString().split('T')[0],
      duration: 14,
      loggingFrequency: 'Daily',
      reminderTime: '20:00',
      status: 'completed',
      currentDay: 14,
      totalDays: 14,
      logs: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now.getTime() - (14 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: Math.random() > 0.2,
        skipped: Math.random() < 0.2,
        sleep: Math.round(3 + Math.random() * 2),
        anxiety: Math.round(3 + Math.random() * 2),
        clarity: Math.round(3 + Math.random() * 2),
      })),
      baselineData: {
        sleep: 2.8,
        anxiety: 2.5,
        clarity: 3.0,
      },
      resultsData: {
        sleep: 4.1,
        anxiety: 4.2,
        clarity: 4.3,
      },
      insights: 'Evening meditation significantly improved sleep quality by +46% and reduced anxiety levels by +68%. Your mental clarity increased by +43% throughout the experiment.',
    },
    {
      id: 'exp-3',
      activityName: 'Digital Detox (No screens 1h before bed)',
      activityEmoji: '📱',
      outcomes: ['Sleep Quality', 'Mental Clarity'],
      startDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 14,
      loggingFrequency: 'Daily',
      reminderTime: '21:00',
      status: 'completed',
      currentDay: 14,
      totalDays: 14,
      logs: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now.getTime() - (21 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: Math.random() > 0.15,
        skipped: Math.random() < 0.15,
        sleep: Math.round(3 + Math.random() * 2),
        clarity: Math.round(3 + Math.random() * 2),
      })),
      baselineData: {
        sleep: 3.0,
        clarity: 3.2,
      },
      resultsData: {
        sleep: 4.3,
        clarity: 4.5,
      },
      insights: 'Limiting screen time before bed improved sleep quality by +43% and mental clarity by +41%. Consider making this a permanent habit.',
    },
  ];
};

export const getSuggestedActivities = (): SuggestedActivity[] => {
  return [
    {
      id: 'act-1',
      name: 'Morning Exercise',
      emoji: '🏋️',
      description: 'Start your day with 30 minutes of physical activity',
      category: 'Exercise',
      suggestedOutcomes: ['Mood', 'Mental Clarity', 'Productivity'],
    },
    {
      id: 'act-2',
      name: 'Meditation',
      emoji: '🧘',
      description: 'Practice mindfulness for 10-20 minutes',
      category: 'Meditation',
      suggestedOutcomes: ['Anxiety / Calmness', 'Mental Clarity', 'Sleep Quality'],
    },
    {
      id: 'act-3',
      name: 'Digital Detox',
      emoji: '📱',
      description: 'Reduce screen time, especially before bed',
      category: 'Screen Time',
      suggestedOutcomes: ['Sleep Quality', 'Mental Clarity', 'Focus'],
    },
    {
      id: 'act-4',
      name: 'Journaling',
      emoji: '📝',
      description: 'Reflect on your day and thoughts',
      category: 'Journaling',
      suggestedOutcomes: ['Mood', 'Mental Clarity', 'Anxiety / Calmness'],
    },
    {
      id: 'act-5',
      name: 'Hydration Goal',
      emoji: '💧',
      description: 'Drink 8 glasses of water daily',
      category: 'Hydration',
      suggestedOutcomes: ['Mood', 'Mental Clarity', 'Productivity'],
    },
    {
      id: 'act-6',
      name: 'Sleep Routine',
      emoji: '🌙',
      description: 'Go to bed at the same time every night',
      category: 'Sleep Routine',
      suggestedOutcomes: ['Sleep Quality', 'Mood', 'Productivity'],
    },
    {
      id: 'act-7',
      name: 'Social Connection',
      emoji: '👥',
      description: 'Spend quality time with friends or family',
      category: 'Social',
      suggestedOutcomes: ['Mood', 'Anxiety / Calmness'],
    },
  ];
};

// More insights data
export const getMoreInsightsData = () => {
  return {
    mentalClarity: {
      trend: '+12%',
      description: 'Your mental clarity has improved this month',
      color: '#10B981',
    },
    goals: {
      completed: 8,
      total: 12,
      description: 'Goals completed this month',
    },
    journaling: {
      entries: 23,
      streak: 5,
      description: 'Journal entries this month',
    },
    engagement: {
      score: 87,
      description: 'Overall wellness engagement score',
      color: '#3B82F6',
    },
  };
};

// Helper function to get mood streak
export const getMoodStreak = (moodData: MoodData[]): { count: number; type: 'good' | 'neutral' | 'bad' } => {
  if (moodData.length === 0) return { count: 0, type: 'neutral' };
  
  let streak = 1;
  const latestScore = moodData[moodData.length - 1].score;
  const type = latestScore >= 4 ? 'good' : latestScore >= 3 ? 'neutral' : 'bad';
  
  // Count consecutive days of same mood type
  for (let i = moodData.length - 2; i >= 0; i--) {
    const score = moodData[i].score;
    const currentType = score >= 4 ? 'good' : score >= 3 ? 'neutral' : 'bad';
    
    if (currentType === type) {
      streak++;
    } else {
      break;
    }
  }
  
  return { count: streak, type };
};

// Helper function to get habit completion rate
export const getHabitCompletionRate = (habitData: HabitData[]): number => {
  if (habitData.length === 0) return 0;
  const completed = habitData.filter(h => h.completed).length;
  return Math.round((completed / habitData.length) * 100);
};

// Generate detailed daily data for calendar
export const getDailyDetailData = (date: string): DailyDetailData => {
  // Use date as seed for consistent data
  const dateNum = new Date(date).getTime();
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const moodScore = Math.max(1, Math.min(5, Math.round(3 + random(dateNum) * 2)));
  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  
  const sleepHours = Math.max(4, Math.min(10, Math.round((7 + random(dateNum + 1) * 2) * 10) / 10));
  const sleepQualityIndex = Math.max(0, Math.min(3, Math.floor((sleepHours - 4) / 1.5)));
  const sleepQualities: ('poor' | 'fair' | 'good' | 'excellent')[] = ['poor', 'fair', 'good', 'excellent'];
  const sleepEmojis = ['😡', '🥱', '😴', '😌'];
  
  const activities = [
    { category: 'Exercise', name: 'Morning Walk', emoji: '🚶', color: '#10B981', baseDuration: 30, baseImpact: 1.2 },
    { category: 'Work', name: 'Deep Work Session', emoji: '💻', color: '#3B82F6', baseDuration: 120, baseImpact: -0.3 },
    { category: 'Social', name: 'Coffee with Friend', emoji: '☕', color: '#F59E0B', baseDuration: 60, baseImpact: 1.5 },
    { category: 'Exercise', name: 'Gym Workout', emoji: '🏋️', color: '#10B981', baseDuration: 45, baseImpact: 1.8 },
    { category: 'Hobbies', name: 'Reading', emoji: '📚', color: '#8B5CF6', baseDuration: 40, baseImpact: 0.8 },
    { category: 'Rest', name: 'Meditation', emoji: '🧘', color: '#06B6D4', baseDuration: 20, baseImpact: 1.0 },
    { category: 'Work', name: 'Meetings', emoji: '📞', color: '#3B82F6', baseDuration: 90, baseImpact: -0.8 },
    { category: 'Social', name: 'Family Time', emoji: '👨‍👩‍👧‍👦', color: '#F59E0B', baseDuration: 80, baseImpact: 1.3 },
  ];
  
  // Select 3-5 random activities for the day
  const numActivities = Math.floor(3 + random(dateNum + 2) * 3);
  const selectedActivities = activities
    .sort(() => random(dateNum + 3) - 0.5)
    .slice(0, numActivities)
    .map(activity => ({
      ...activity,
      duration: Math.round(activity.baseDuration * (0.7 + random(dateNum + 4) * 0.6)),
      impact: activity.baseImpact * (0.8 + random(dateNum + 5) * 0.4),
    }));
  
  const habits = [
    { name: 'Drink Water', emoji: '💧' },
    { name: 'Exercise', emoji: '🏃' },
    { name: 'Meditate', emoji: '🧘' },
    { name: 'Journal', emoji: '📝' },
    { name: 'Read', emoji: '📖' },
  ].map(habit => ({
    ...habit,
    completed: random(dateNum + 6) > 0.3,
  }));
  
  const clarityScore = Math.max(1, Math.min(5, Math.round(3 + random(dateNum + 7) * 2)));
  const clarityFactors = [
    'Good sleep quality',
    'Morning exercise',
    'Healthy breakfast',
    'Meditation practice',
    'Limited screen time',
    'Social interaction',
    'Productive work session',
  ].filter(() => random(dateNum + 8) > 0.5).slice(0, 3);
  
  const bedtimeHour = Math.floor(22 + random(dateNum + 9) * 3); // 22-24
  const wakeHour = Math.floor(6 + random(dateNum + 10) * 3); // 6-8
  
  const experiments = getExperiments();
  const dayExperiments = experiments
    .filter(exp => {
      const expDate = new Date(exp.startDate);
      const endDate = new Date(exp.endDate);
      const currentDate = new Date(date);
      return currentDate >= expDate && currentDate <= endDate;
    })
    .map(exp => {
      const log = exp.logs.find(l => l.date === date);
      return {
        name: exp.activityName,
        emoji: exp.activityEmoji,
        status: (log?.completed ? 'completed' : log?.skipped ? 'skipped' : 'pending') as 'completed' | 'skipped' | 'pending',
        outcomes: log ? exp.outcomes.map(outcome => {
          let value = 3;
          if (outcome === 'Mood' && log.mood) value = log.mood;
          else if (outcome === 'Sleep Quality' && log.sleep) value = log.sleep;
          else if (outcome === 'Mental Clarity' && log.clarity) value = log.clarity;
          else if (outcome === 'Anxiety / Calmness' && log.anxiety) value = log.anxiety;
          else if (outcome === 'Focus' && log.focus) value = log.focus;
          else if (outcome === 'Productivity' && log.productivity) value = log.productivity;
          return { type: outcome, value };
        }) : undefined,
      };
    });

  return {
    date,
    mood: {
      score: moodScore,
      emoji: moodEmojis[moodScore - 1],
      note: moodScore >= 4 ? 'Feeling great today!' : moodScore <= 2 ? 'Had a tough day' : undefined,
    },
    activities: selectedActivities,
    sleep: {
      hours: sleepHours,
      quality: sleepQualities[sleepQualityIndex],
      bedtime: `${bedtimeHour}:${Math.floor(random(dateNum + 11) * 60).toString().padStart(2, '0')}`,
      wakeTime: `${wakeHour}:${Math.floor(random(dateNum + 12) * 60).toString().padStart(2, '0')}`,
      emoji: sleepEmojis[sleepQualityIndex],
    },
    habits,
    mentalClarity: {
      score: clarityScore,
      factors: clarityFactors,
    },
    experiments: dayExperiments.length > 0 ? dayExperiments : undefined,
    notes: random(dateNum + 13) > 0.7 ? 'Had an interesting conversation about mindfulness today.' : undefined,
  };
};

// Get mood color for calendar visualization
export const getMoodColor = (score: number): string => {
  if (score >= 4) return '#10B981'; // Green for good mood
  if (score >= 3) return '#F59E0B'; // Yellow for neutral mood
  return '#EF4444'; // Red for bad mood
};

// Get calendar data for a month
export const getCalendarData = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarData: { [key: string]: { mood: number; color: string } } = {};
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dailyData = getDailyDetailData(date);
    calendarData[date] = {
      mood: dailyData.mood.score,
      color: getMoodColor(dailyData.mood.score),
    };
  }
  
  return calendarData;
};

export const getActiveHabits = (): ActiveHabit[] => {
  return [
    {
      id: '1',
      name: 'Mind mapping',
      description: 'Visualize thoughts and ideas.',
      category: 'MentalClarity',
      quote: 'Clarity comes from action, not overthinking.',
      currentDay: 1,
      totalDays: 7,
      completedToday: false,
      reminderEnabled: true,
      streak: 0,
      progressPercentage: 14,
      feedback: undefined,
    },
    {
      id: '2',
      name: 'Morning workout',
      description: 'Start your day with exercise.',
      category: 'Health',
      quote: 'A healthy body brings a healthy mind.',
      currentDay: 3,
      totalDays: 7,
      completedToday: true,
      reminderEnabled: true,
      streak: 3,
      progressPercentage: 43,
      feedback: 'good',
    },
    {
      id: '3',
      name: 'Digital detox',
      description: 'Reduce screen time before bed.',
      category: 'Sleep',
      quote: 'Rest your eyes, rest your mind.',
      currentDay: 5,
      totalDays: 14,
      completedToday: false,
      reminderEnabled: false,
      streak: 5,
      progressPercentage: 36,
      feedback: undefined,
    },
  ];
};

export const getSuggestedHabits = (): SuggestedHabit[] => {
  return [
    {
      id: 's1',
      name: 'Gratitude journal',
      description: 'Write three things you\'re grateful for.',
      category: 'Mood',
      quote: 'Gratitude turns what we have into enough.',
      frequency: 'Daily',
      benefit: 'Improves mood by +15%',
    },
    {
      id: 's2',
      name: 'Cold shower',
      description: 'Take a cold shower in the morning.',
      category: 'Health',
      quote: 'Discomfort is where growth begins.',
      frequency: 'Daily',
      benefit: 'Boosts energy by +25%',
    },
    {
      id: 's3',
      name: 'Breathwork',
      description: 'Practice 5 minutes of deep breathing.',
      category: 'Anxiety',
      quote: 'Your breath is your anchor.',
      frequency: 'Daily',
      benefit: 'Reduces anxiety by +30%',
    },
    {
      id: 's4',
      name: 'Sleep routine',
      description: 'Follow a consistent bedtime routine.',
      category: 'Sleep',
      quote: 'Consistency is the key to better sleep.',
      frequency: 'Daily',
      benefit: 'Improves sleep quality by +20%',
    },
    {
      id: 's5',
      name: 'Intimacy time',
      description: 'Dedicate quality time with your partner.',
      category: 'Intimacy',
      quote: 'Connection strengthens the soul.',
      frequency: '3x per week',
      benefit: 'Enhances relationship satisfaction',
    },
    {
      id: 's6',
      name: 'Nature walk',
      description: 'Spend 20 minutes outdoors.',
      category: 'MentalClarity',
      quote: 'Nature is the best therapist.',
      frequency: 'Daily',
      benefit: 'Boosts clarity by +18%',
    },
  ];
};

// New interfaces for habit library
export interface HabitLibraryItem {
  id: string;
  name: string;
  description: string;
  expectedOutcome: string;
  emoji: string;
  category: HabitCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeRequired: string;
  benefits: string[];
}

// New interfaces for intimacy plans
export interface IntimacyPlan {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in days
  activities: IntimacyActivity[];
  expectedOutcomes: string[];
  scheduleType: 'Daily' | 'Weekly' | 'Monthly';
}

export interface IntimacyActivity {
  id: string;
  name: string;
  description: string;
  emoji: string;
  duration: number; // in minutes
  tips: string[];
  benefits: string[];
}

// New interfaces for enhanced impact analysis
export interface ActivityImpact {
  activity: string;
  moodImpact: number; // percentage change
  sleepImpact: number;
  clarityImpact: number;
  frequency: number; // times in last 7 days
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  actionText: string;
  category: 'habit' | 'activity' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
}

// Habit library data
export const getHabitLibraryData = (): { [key in HabitCategory]: HabitLibraryItem[] } => {
  return {
    Intimacy: [
      {
        id: 'int-1',
        name: 'Daily Connection',
        description: 'Spend 15 minutes of focused time with your partner daily',
        expectedOutcome: 'Strengthened emotional bond and communication',
        emoji: '💕',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Improved communication', 'Deeper emotional connection', 'Reduced relationship stress']
      },
      {
        id: 'int-2',
        name: 'Intimacy Journal',
        description: 'Write about your relationship experiences and feelings',
        expectedOutcome: 'Better self-awareness and relationship understanding',
        emoji: '📝',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '10 minutes',
        benefits: ['Enhanced self-reflection', 'Clearer communication', 'Deeper intimacy']
      },
      {
        id: 'int-3',
        name: 'Share appreciation with partner',
        description: 'Express genuine appreciation to your partner daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in relationship satisfaction. By 30 days you will experience long-term bonding benefits.',
        emoji: '💝',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better connection', 'Increased gratitude', 'Stronger bond']
      },
      {
        id: 'int-4',
        name: 'Send loving message',
        description: 'Send a thoughtful loving message to your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
        emoji: '💌',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better communication', 'Thoughtfulness', 'Stronger connection']
      },
      {
        id: 'int-5',
        name: 'Hug for 20 seconds',
        description: 'Share a 20-second hug with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice increased oxytocin. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
        emoji: '🤗',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Oxytocin release', 'Better bonding', 'Physical connection']
      },
      {
        id: 'int-6',
        name: 'Hold eye contact',
        description: 'Practice intentional eye contact with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice deeper connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term emotional bonding benefits.',
        emoji: '👁️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Deeper connection', 'Better intimacy', 'Emotional bonding']
      },
      {
        id: 'int-7',
        name: 'Ask partner about their day',
        description: 'Show genuine interest in your partner\'s daily experiences',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term connection benefits.',
        emoji: '💬',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better communication', 'Increased understanding', 'Stronger connection']
      },
      {
        id: 'int-8',
        name: 'Plan 5-min connection ritual',
        description: 'Create a daily 5-minute connection ritual with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved routine. By 14 days you will see measurable improvements in consistency. By 30 days you will experience long-term bonding benefits.',
        emoji: '⏰',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Consistent connection', 'Better routine', 'Stronger bond']
      },
      {
        id: 'int-9',
        name: 'Compliment partner',
        description: 'Give your partner a genuine compliment daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
        emoji: '✨',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better positivity', 'Increased appreciation', 'Stronger connection']
      },
      {
        id: 'int-10',
        name: 'Practice active listening',
        description: 'Listen fully without interruption when your partner speaks',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term trust benefits.',
        emoji: '👂',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '10 minutes',
        benefits: ['Better listening', 'Increased understanding', 'Improved trust']
      },
      {
        id: 'int-11',
        name: 'Hold hands',
        description: 'Hold hands with your partner intentionally',
        expectedOutcome: 'By completing this habit for 7 days you will notice increased physical connection. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term bonding benefits.',
        emoji: '🤝',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Physical connection', 'Better comfort', 'Stronger bond']
      },
      {
        id: 'int-12',
        name: 'Share emotional check-in',
        description: 'Check in with each other about emotional states',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved awareness. By 14 days you will see measurable improvements in emotional support. By 30 days you will experience long-term understanding benefits.',
        emoji: '💭',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better awareness', 'Emotional support', 'Improved understanding']
      },
      {
        id: 'int-13',
        name: 'Touch intentionally',
        description: 'Practice intentional non-sexual touch with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice increased comfort. By 14 days you will see measurable improvements in physical connection. By 30 days you will experience long-term intimacy benefits.',
        emoji: '🤲',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better comfort', 'Physical connection', 'Increased intimacy']
      },
      {
        id: 'int-14',
        name: 'Share gratitude',
        description: 'Express gratitude for your partner and relationship',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved appreciation. By 14 days you will see measurable improvements in positivity. By 30 days you will experience long-term relationship benefits.',
        emoji: '🙏',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better appreciation', 'Increased positivity', 'Stronger bond']
      },
      {
        id: 'int-15',
        name: 'Do a small act of kindness',
        description: 'Perform a thoughtful act of kindness for your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved thoughtfulness. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
        emoji: '💗',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better thoughtfulness', 'Increased appreciation', 'Stronger connection']
      },
      {
        id: 'int-16',
        name: 'Ask partner needs',
        description: 'Ask your partner what they need from you',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in support. By 30 days you will experience long-term understanding benefits.',
        emoji: '❓',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better communication', 'Improved support', 'Increased understanding']
      },
      {
        id: 'int-17',
        name: 'Sit together quietly',
        description: 'Spend quiet time together without distractions',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term peace benefits.',
        emoji: '🛋️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better presence', 'Deeper connection', 'Peaceful time']
      },
      {
        id: 'int-18',
        name: 'Cook together',
        description: 'Prepare a meal together as a bonding activity',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved teamwork. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
        emoji: '👨‍🍳',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better teamwork', 'Fun activity', 'Stronger bond']
      },
      {
        id: 'int-19',
        name: 'Plan intimacy time',
        description: 'Schedule dedicated time for physical intimacy',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved prioritization. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term connection benefits.',
        emoji: '📅',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better prioritization', 'Increased intimacy', 'Stronger connection']
      },
      {
        id: 'int-20',
        name: 'Give a gentle massage',
        description: 'Offer your partner a relaxing massage',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in physical connection. By 30 days you will experience long-term intimacy benefits.',
        emoji: '💆',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better relaxation', 'Physical connection', 'Increased intimacy']
      },
      {
        id: 'int-21',
        name: 'Practice breathing together',
        description: 'Synchronize your breathing with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
        emoji: '🌬️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better calm', 'Synchronized connection', 'Deeper bond']
      },
      {
        id: 'int-22',
        name: 'Share personal thought',
        description: 'Share a personal thought or feeling with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved vulnerability. By 14 days you will see measurable improvements in trust. By 30 days you will experience long-term intimacy benefits.',
        emoji: '💭',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better vulnerability', 'Increased trust', 'Deeper intimacy']
      },
      {
        id: 'int-23',
        name: 'Say something loving',
        description: 'Express love verbally to your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved expression. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
        emoji: '❤️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better expression', 'Increased love', 'Stronger connection']
      },
      {
        id: 'int-24',
        name: 'Laugh together',
        description: 'Share laughter and humor with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved joy. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term happiness benefits.',
        emoji: '😂',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['More joy', 'Better connection', 'Increased happiness']
      },
      {
        id: 'int-25',
        name: 'Share a memory',
        description: 'Reminisce about a positive shared memory',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved nostalgia. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
        emoji: '📸',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Positive nostalgia', 'Better bonding', 'Stronger connection']
      },
      {
        id: 'int-26',
        name: 'Do something fun together',
        description: 'Engage in a fun activity together',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved joy. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
        emoji: '🎉',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '30 minutes',
        benefits: ['More fun', 'Better connection', 'Stronger bond']
      },
      {
        id: 'int-27',
        name: 'Express physical affection',
        description: 'Show physical affection through touch',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved physical connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
        emoji: '💑',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Physical connection', 'Better intimacy', 'Stronger bond']
      },
      {
        id: 'int-28',
        name: 'Plan mini date',
        description: 'Plan a small date activity with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved planning. By 14 days you will see measurable improvements in quality time. By 30 days you will experience long-term relationship benefits.',
        emoji: '💐',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '10 minutes',
        benefits: ['Better planning', 'Quality time', 'Stronger connection']
      },
      {
        id: 'int-29',
        name: 'Surprise partner',
        description: 'Surprise your partner with something thoughtful',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved excitement. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
        emoji: '🎁',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['More excitement', 'Increased appreciation', 'Stronger bond']
      },
      {
        id: 'int-30',
        name: 'Have deep conversation',
        description: 'Engage in meaningful deep conversation',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved understanding. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
        emoji: '🗣️',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '20 minutes',
        benefits: ['Better understanding', 'Deeper connection', 'Increased intimacy']
      },
      {
        id: 'int-31',
        name: 'Discuss boundaries',
        description: 'Have open conversations about boundaries',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved clarity. By 14 days you will see measurable improvements in respect. By 30 days you will experience long-term trust benefits.',
        emoji: '🚧',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better clarity', 'Increased respect', 'Improved trust']
      },
      {
        id: 'int-32',
        name: 'Talk about desires',
        description: 'Share your desires and needs with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved openness. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term intimacy benefits.',
        emoji: '💫',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better openness', 'Increased understanding', 'Deeper intimacy']
      },
      {
        id: 'int-33',
        name: 'Share comfort touch',
        description: 'Offer comforting touch during difficult moments',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved support. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term trust benefits.',
        emoji: '🤲',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better support', 'Increased comfort', 'Improved trust']
      },
      {
        id: 'int-34',
        name: 'Express admiration',
        description: 'Tell your partner what you admire about them',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved appreciation. By 14 days you will see measurable improvements in self-esteem. By 30 days you will experience long-term relationship benefits.',
        emoji: '🌟',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better appreciation', 'Boosted self-esteem', 'Stronger connection']
      },
      {
        id: 'int-35',
        name: 'Do shared hobby',
        description: 'Participate in a shared hobby together',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved fun. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
        emoji: '🎯',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['More fun', 'Better bonding', 'Stronger connection']
      },
      {
        id: 'int-36',
        name: 'Try intimacy exercise',
        description: 'Practice an intimacy-building exercise together',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
        emoji: '💞',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better connection', 'Increased intimacy', 'Stronger bond']
      },
      {
        id: 'int-37',
        name: 'Talk about feelings',
        description: 'Share your feelings openly with your partner',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved openness. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term trust benefits.',
        emoji: '💬',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '10 minutes',
        benefits: ['Better openness', 'Increased understanding', 'Improved trust']
      },
      {
        id: 'int-38',
        name: 'Express vulnerability',
        description: 'Be vulnerable with your partner about fears or concerns',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved trust. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term connection benefits.',
        emoji: '💗',
        category: 'Intimacy',
        difficulty: 'Hard',
        timeRequired: '10 minutes',
        benefits: ['Better trust', 'Deeper intimacy', 'Stronger connection']
      },
      {
        id: 'int-39',
        name: 'Practice sensual breathing',
        description: 'Practice slow sensual breathing together',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
        emoji: '🌬️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better relaxation', 'Sensual connection', 'Increased intimacy']
      },
      {
        id: 'int-40',
        name: 'Make eye contact for 1 min',
        description: 'Maintain loving eye contact for one minute',
        expectedOutcome: 'By completing this habit for 7 days you will notice deeper connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
        emoji: '👁️',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Deeper connection', 'Better intimacy', 'Stronger bond']
      },
      {
        id: 'int-41',
        name: 'Kiss intentionally',
        description: 'Share an intentional meaningful kiss',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved affection. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
        emoji: '💋',
        category: 'Intimacy',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better affection', 'Physical connection', 'Increased intimacy']
      },
      {
        id: 'int-42',
        name: 'Be fully present',
        description: 'Be completely present with your partner without distractions',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
        emoji: '🧘',
        category: 'Intimacy',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better presence', 'Deeper connection', 'Improved relationship']
      }
    ],
    Health: [
      {
        id: 'health-1',
        name: 'Morning Stretch',
        description: 'Start your day with 10 minutes of gentle stretching',
        expectedOutcome: 'Improved flexibility and energy levels',
        emoji: '🤸',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better posture', 'Increased energy', 'Reduced muscle tension']
      },
      {
        id: 'health-2',
        name: 'Hydration Goal',
        description: 'Drink 8 glasses of water throughout the day',
        expectedOutcome: 'Better hydration and overall health',
        emoji: '💧',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: 'Throughout day',
        benefits: ['Improved skin health', 'Better energy', 'Enhanced cognitive function']
      },
      {
        id: 'health-3',
        name: '10-minute walk',
        description: 'Take a 10-minute walk to boost circulation and energy',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved energy. By 14 days you will see measurable improvements in cardiovascular health. By 30 days you will experience long-term fitness benefits.',
        emoji: '🚶',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better circulation', 'Improved mood', 'Increased energy']
      },
      {
        id: 'health-4',
        name: 'Drink 1 glass of water',
        description: 'Drink at least one glass of water at specific times',
        expectedOutcome: 'By completing this habit for 7 days you will notice better hydration. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term health benefits.',
        emoji: '🥤',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better hydration', 'Improved digestion', 'Clearer skin']
      },
      {
        id: 'health-5',
        name: 'Stretch for 5 mins',
        description: 'Do a quick 5-minute stretching routine',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stiffness. By 14 days you will see measurable improvements in flexibility. By 30 days you will experience long-term mobility benefits.',
        emoji: '🧘‍♀️',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better flexibility', 'Reduced tension', 'Improved posture']
      },
      {
        id: 'health-6',
        name: 'Eat 1 fruit',
        description: 'Eat at least one serving of fruit daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nutrition. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term health benefits.',
        emoji: '🍎',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better nutrition', 'Natural vitamins', 'Improved digestion']
      },
      {
        id: 'health-7',
        name: 'Healthy breakfast',
        description: 'Start your day with a nutritious breakfast',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved morning energy. By 14 days you will see measurable improvements in focus. By 30 days you will experience long-term metabolic benefits.',
        emoji: '🥣',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better energy', 'Improved focus', 'Stable blood sugar']
      },
      {
        id: 'health-8',
        name: 'Take vitamins',
        description: 'Take your daily vitamins or supplements',
        expectedOutcome: 'By completing this habit for 7 days you will notice consistent supplementation. By 14 days you will see measurable improvements in nutrient levels. By 30 days you will experience long-term health benefits.',
        emoji: '💊',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Nutrient support', 'Better immunity', 'Improved health']
      },
      {
        id: 'health-9',
        name: 'Walk after meals',
        description: 'Take a short walk after eating to aid digestion',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in blood sugar control. By 30 days you will experience long-term metabolic benefits.',
        emoji: '🚶‍♂️',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better digestion', 'Blood sugar control', 'Reduced bloating']
      },
      {
        id: 'health-10',
        name: 'Balance meal plate',
        description: 'Ensure each meal has balanced macronutrients',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nutrition. By 14 days you will see measurable improvements in energy levels. By 30 days you will experience long-term health benefits.',
        emoji: '🍽️',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better nutrition', 'Stable energy', 'Improved satiety']
      },
      {
        id: 'health-11',
        name: 'Reduce sugar intake',
        description: 'Consciously reduce added sugar consumption',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced cravings. By 14 days you will see measurable improvements in energy stability. By 30 days you will experience long-term metabolic benefits.',
        emoji: '🍬',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Stable blood sugar', 'Better energy', 'Improved health']
      },
      {
        id: 'health-12',
        name: 'Sleep before 11pm',
        description: 'Get to bed before 11pm for optimal rest',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep quality. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term circadian benefits.',
        emoji: '🛏️',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better sleep', 'Improved recovery', 'More energy']
      },
      {
        id: 'health-13',
        name: 'Stand every hour',
        description: 'Stand up and move around every hour',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stiffness. By 14 days you will see measurable improvements in circulation. By 30 days you will experience long-term posture benefits.',
        emoji: '🧍',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better circulation', 'Reduced back pain', 'Improved posture']
      },
      {
        id: 'health-14',
        name: 'Hydrate morning',
        description: 'Drink water first thing in the morning',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved alertness. By 14 days you will see measurable improvements in hydration. By 30 days you will experience long-term health benefits.',
        emoji: '🌅',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better hydration', 'Improved metabolism', 'Mental clarity']
      },
      {
        id: 'health-15',
        name: 'Healthy snack swap',
        description: 'Replace unhealthy snacks with nutritious alternatives',
        expectedOutcome: 'By completing this habit for 7 days you will notice better choices. By 14 days you will see measurable improvements in nutrition. By 30 days you will experience long-term health benefits.',
        emoji: '🥕',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better nutrition', 'Improved energy', 'Healthier habits']
      },
      {
        id: 'health-16',
        name: 'Limit caffeine',
        description: 'Reduce caffeine intake to moderate levels',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep. By 14 days you will see measurable improvements in energy stability. By 30 days you will experience long-term balance benefits.',
        emoji: '☕',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better sleep', 'Reduced anxiety', 'Stable energy']
      },
      {
        id: 'health-17',
        name: 'Home-cooked meal',
        description: 'Prepare at least one home-cooked meal daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nutrition control. By 14 days you will see measurable improvements in diet quality. By 30 days you will experience long-term health benefits.',
        emoji: '👨‍🍳',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better nutrition', 'Cost savings', 'Healthier ingredients']
      },
      {
        id: 'health-18',
        name: 'Bodyweight workout',
        description: 'Do a quick bodyweight exercise routine',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved strength. By 14 days you will see measurable improvements in fitness. By 30 days you will experience long-term muscle benefits.',
        emoji: '💪',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better strength', 'Improved fitness', 'No equipment needed']
      },
      {
        id: 'health-19',
        name: 'Track water intake',
        description: 'Monitor and track your daily water consumption',
        expectedOutcome: 'By completing this habit for 7 days you will notice hydration awareness. By 14 days you will see measurable improvements in intake. By 30 days you will experience long-term hydration benefits.',
        emoji: '📊',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better awareness', 'Improved hydration', 'Healthier habits']
      },
      {
        id: 'health-20',
        name: 'Take deep breaths',
        description: 'Practice deep breathing for relaxation and oxygenation',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stress. By 14 days you will see measurable improvements in relaxation. By 30 days you will experience long-term calm benefits.',
        emoji: '🌬️',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Reduced stress', 'Better oxygenation', 'Improved calm']
      },
      {
        id: 'health-21',
        name: 'Meal prep Sunday',
        description: 'Prepare meals for the week on Sunday',
        expectedOutcome: 'By completing this habit for 7 days you will notice better planning. By 14 days you will see measurable improvements in nutrition consistency. By 30 days you will experience long-term health benefits.',
        emoji: '📦',
        category: 'Health',
        difficulty: 'Hard',
        timeRequired: '60 minutes',
        benefits: ['Better planning', 'Time savings', 'Healthier eating']
      },
      {
        id: 'health-22',
        name: 'Avoid junk food',
        description: 'Consciously avoid processed and junk food',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced cravings. By 14 days you will see measurable improvements in diet quality. By 30 days you will experience long-term health benefits.',
        emoji: '🚫',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better nutrition', 'Improved energy', 'Healthier weight']
      },
      {
        id: 'health-23',
        name: 'Add veggies to meal',
        description: 'Include vegetables in every meal',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nutrition. By 14 days you will see measurable improvements in fiber intake. By 30 days you will experience long-term health benefits.',
        emoji: '🥦',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better nutrition', 'More fiber', 'Improved digestion']
      },
      {
        id: 'health-24',
        name: 'Daily sunlight',
        description: 'Get natural sunlight exposure daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in vitamin D. By 30 days you will experience long-term circadian benefits.',
        emoji: '☀️',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Vitamin D', 'Better mood', 'Improved sleep']
      },
      {
        id: 'health-25',
        name: 'Maintain good posture',
        description: 'Be mindful of maintaining proper posture',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced discomfort. By 14 days you will see measurable improvements in alignment. By 30 days you will experience long-term posture benefits.',
        emoji: '🧍‍♂️',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better alignment', 'Reduced pain', 'Improved breathing']
      },
      {
        id: 'health-26',
        name: 'Reduce late-night eating',
        description: 'Avoid eating close to bedtime',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep. By 14 days you will see measurable improvements in digestion. By 30 days you will experience long-term metabolic benefits.',
        emoji: '🌙',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better sleep', 'Improved digestion', 'Weight management']
      },
      {
        id: 'health-27',
        name: 'No sugary drink',
        description: 'Avoid sugary beverages and sodas',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced sugar intake. By 14 days you will see measurable improvements in energy stability. By 30 days you will experience long-term health benefits.',
        emoji: '🥤',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less sugar', 'Stable energy', 'Better hydration']
      },
      {
        id: 'health-28',
        name: 'Drink herbal tea',
        description: 'Enjoy a cup of herbal tea for relaxation',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in hydration. By 30 days you will experience long-term wellness benefits.',
        emoji: '🍵',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better relaxation', 'Improved hydration', 'Antioxidants']
      },
      {
        id: 'health-29',
        name: 'Healthy lunch',
        description: 'Eat a nutritious and balanced lunch',
        expectedOutcome: 'By completing this habit for 7 days you will notice better afternoon energy. By 14 days you will see measurable improvements in productivity. By 30 days you will experience long-term health benefits.',
        emoji: '🥗',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '20 minutes',
        benefits: ['Better energy', 'Improved focus', 'Balanced nutrition']
      },
      {
        id: 'health-30',
        name: 'Limit fried foods',
        description: 'Reduce consumption of fried and oily foods',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term cardiovascular benefits.',
        emoji: '🍟',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better digestion', 'Improved heart health', 'Less inflammation']
      },
      {
        id: 'health-31',
        name: 'Eat slowly',
        description: 'Practice eating slowly and mindfully',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in satiety. By 30 days you will experience long-term eating habit benefits.',
        emoji: '🍴',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better digestion', 'Improved satiety', 'Mindful eating']
      },
      {
        id: 'health-32',
        name: '10 push-ups',
        description: 'Do 10 push-ups daily for upper body strength',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved strength. By 14 days you will see measurable improvements in endurance. By 30 days you will experience long-term fitness benefits.',
        emoji: '🏋️',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '3 minutes',
        benefits: ['Better strength', 'Improved posture', 'Increased energy']
      },
      {
        id: 'health-33',
        name: 'Take probiotics',
        description: 'Take probiotics for gut health',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved digestion. By 14 days you will see measurable improvements in gut health. By 30 days you will experience long-term immunity benefits.',
        emoji: '🦠',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better digestion', 'Improved immunity', 'Gut health']
      },
      {
        id: 'health-34',
        name: 'Warm-up stretches',
        description: 'Do warm-up stretches before physical activity',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced injury risk. By 14 days you will see measurable improvements in flexibility. By 30 days you will experience long-term mobility benefits.',
        emoji: '🤸‍♂️',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Injury prevention', 'Better flexibility', 'Improved performance']
      },
      {
        id: 'health-35',
        name: 'Healthy dessert swap',
        description: 'Replace unhealthy desserts with healthier options',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced sugar. By 14 days you will see measurable improvements in cravings. By 30 days you will experience long-term health benefits.',
        emoji: '🍓',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less sugar', 'Better nutrition', 'Healthier treats']
      },
      {
        id: 'health-36',
        name: 'Track food intake',
        description: 'Monitor and log your daily food consumption',
        expectedOutcome: 'By completing this habit for 7 days you will notice better awareness. By 14 days you will see measurable improvements in nutrition. By 30 days you will experience long-term health benefits.',
        emoji: '📝',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '10 minutes',
        benefits: ['Better awareness', 'Improved nutrition', 'Accountability']
      },
      {
        id: 'health-37',
        name: 'Avoid overeating',
        description: 'Practice portion control and stop when satisfied',
        expectedOutcome: 'By completing this habit for 7 days you will notice better satiety awareness. By 14 days you will see measurable improvements in digestion. By 30 days you will experience long-term weight benefits.',
        emoji: '🍽️',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better portions', 'Improved digestion', 'Weight management']
      },
      {
        id: 'health-38',
        name: 'Daily movement goal',
        description: 'Set and achieve a daily movement or step goal',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved activity. By 14 days you will see measurable improvements in fitness. By 30 days you will experience long-term health benefits.',
        emoji: '👟',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better fitness', 'Increased energy', 'Weight management']
      },
      {
        id: 'health-39',
        name: 'Healthy hydration',
        description: 'Stay consistently hydrated throughout the day',
        expectedOutcome: 'By completing this habit for 7 days you will notice better energy. By 14 days you will see measurable improvements in skin health. By 30 days you will experience long-term hydration benefits.',
        emoji: '💦',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better energy', 'Improved skin', 'Enhanced cognition']
      },
      {
        id: 'health-40',
        name: 'Replace snack with nuts',
        description: 'Swap processed snacks with healthy nuts',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nutrition. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term health benefits.',
        emoji: '🥜',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Healthy fats', 'Better protein', 'Sustained energy']
      },
      {
        id: 'health-41',
        name: 'Take stairs',
        description: 'Choose stairs over elevators when possible',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved fitness. By 14 days you will see measurable improvements in leg strength. By 30 days you will experience long-term cardiovascular benefits.',
        emoji: '🪜',
        category: 'Health',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better cardio', 'Leg strength', 'Burns calories']
      },
      {
        id: 'health-42',
        name: 'Practice mindful cooking',
        description: 'Cook with awareness and intention',
        expectedOutcome: 'By completing this habit for 7 days you will notice better food choices. By 14 days you will see measurable improvements in cooking skills. By 30 days you will experience long-term nutrition benefits.',
        emoji: '🍳',
        category: 'Health',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better nutrition', 'Mindfulness', 'Improved skills']
      }
    ],
    Anxiety: [
      {
        id: 'anx-1',
        name: 'Breathing Exercise',
        description: 'Practice 4-7-8 breathing technique when feeling anxious',
        expectedOutcome: 'Reduced anxiety and improved calmness',
        emoji: '🫁',
        category: 'Anxiety',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Immediate anxiety relief', 'Better stress management', 'Improved focus']
      },
      {
        id: 'anx-2',
        name: 'Grounding Technique',
        description: 'Use 5-4-3-2-1 sensory grounding when overwhelmed',
        expectedOutcome: 'Better emotional regulation and presence',
        emoji: '🌱',
        category: 'Anxiety',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Quick anxiety relief', 'Improved mindfulness', 'Better emotional control']
      }
    ],
    Mood: [
      {
        id: 'mood-1',
        name: 'Gratitude Practice',
        description: 'Write down three things you\'re grateful for each day',
        expectedOutcome: 'Improved mood and positive outlook',
        emoji: '🙏',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Increased happiness', 'Better perspective', 'Reduced negativity']
      },
      {
        id: 'mood-2',
        name: 'Mood Check-in',
        description: 'Take a moment to identify and acknowledge your current emotions',
        expectedOutcome: 'Better emotional awareness and regulation',
        emoji: '😊',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Emotional awareness', 'Better mood tracking', 'Improved self-care']
      },
      {
        id: 'mood-3',
        name: 'Write 3 gratitude items',
        description: 'List three things you are grateful for each day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term happiness benefits.',
        emoji: '📝',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better perspective', 'Increased positivity', 'Reduced negativity']
      },
      {
        id: 'mood-4',
        name: 'Compliment someone',
        description: 'Give a genuine compliment to someone each day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relationships. By 14 days you will see measurable improvements in social connection. By 30 days you will experience long-term positivity benefits.',
        emoji: '💬',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better connections', 'Increased positivity', 'Improved relationships']
      },
      {
        id: 'mood-5',
        name: '2-minute breathing',
        description: 'Practice focused breathing for two minutes',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stress. By 14 days you will see measurable improvements in calm. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🌬️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Reduced stress', 'Better calm', 'Improved focus']
      },
      {
        id: 'mood-6',
        name: 'Walk outside',
        description: 'Take a walk outdoors for fresh air and movement',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term wellness benefits.',
        emoji: '🚶',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better mood', 'Fresh air', 'Improved energy']
      },
      {
        id: 'mood-7',
        name: 'Journal emotions',
        description: 'Write about your emotions and feelings',
        expectedOutcome: 'By completing this habit for 7 days you will notice better emotional awareness. By 14 days you will see measurable improvements in processing. By 30 days you will experience long-term emotional health benefits.',
        emoji: '📓',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Emotional processing', 'Better awareness', 'Reduced stress']
      },
      {
        id: 'mood-8',
        name: 'Talk to a friend',
        description: 'Have a conversation with a friend or loved one',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in social wellbeing. By 30 days you will experience long-term relationship benefits.',
        emoji: '👥',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Social connection', 'Better mood', 'Reduced loneliness']
      },
      {
        id: 'mood-9',
        name: 'Listen to music',
        description: 'Listen to music that uplifts your mood',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in emotional state. By 30 days you will experience long-term happiness benefits.',
        emoji: '🎵',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better mood', 'Emotional uplift', 'Stress relief']
      },
      {
        id: 'mood-10',
        name: 'Watch something funny',
        description: 'Watch comedy or funny videos to boost mood',
        expectedOutcome: 'By completing this habit for 7 days you will notice more laughter. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term joy benefits.',
        emoji: '😂',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['More laughter', 'Better mood', 'Stress relief']
      },
      {
        id: 'mood-11',
        name: 'Stretch body',
        description: 'Do a full body stretch to release tension',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced tension. By 14 days you will see measurable improvements in physical comfort. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🧘',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less tension', 'Better comfort', 'Improved mood']
      },
      {
        id: 'mood-12',
        name: 'Drink water',
        description: 'Stay hydrated throughout the day',
        expectedOutcome: 'By completing this habit for 7 days you will notice better energy. By 14 days you will see measurable improvements in clarity. By 30 days you will experience long-term health benefits.',
        emoji: '💧',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better hydration', 'Improved energy', 'Mental clarity']
      },
      {
        id: 'mood-13',
        name: 'Avoid negative news',
        description: 'Limit exposure to negative news and media',
        expectedOutcome: 'By completing this habit for 7 days you will notice less anxiety. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term peace benefits.',
        emoji: '📰',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less anxiety', 'Better mood', 'Mental peace']
      },
      {
        id: 'mood-14',
        name: 'Practice self-kindness',
        description: 'Speak kindly to yourself and practice self-compassion',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved self-esteem. By 14 days you will see measurable improvements in self-talk. By 30 days you will experience long-term confidence benefits.',
        emoji: '💝',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better self-esteem', 'Kinder self-talk', 'Improved confidence']
      },
      {
        id: 'mood-15',
        name: 'Hug someone',
        description: 'Give or receive a heartfelt hug',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in oxytocin levels. By 30 days you will experience long-term bonding benefits.',
        emoji: '🤗',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better connection', 'Oxytocin boost', 'Improved mood']
      },
      {
        id: 'mood-16',
        name: 'Affirmations',
        description: 'Repeat positive affirmations to yourself',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mindset. By 14 days you will see measurable improvements in self-belief. By 30 days you will experience long-term confidence benefits.',
        emoji: '💪',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better mindset', 'Increased confidence', 'Positive outlook']
      },
      {
        id: 'mood-17',
        name: 'Do something creative',
        description: 'Engage in a creative activity like drawing or writing',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved expression. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term creativity benefits.',
        emoji: '🎨',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Creative expression', 'Better mood', 'Stress relief']
      },
      {
        id: 'mood-18',
        name: 'Spend time in nature',
        description: 'Spend time outdoors in a natural setting',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term wellness benefits.',
        emoji: '🌳',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '20 minutes',
        benefits: ['Better calm', 'Improved mood', 'Connection to nature']
      },
      {
        id: 'mood-19',
        name: 'Morning sunlight',
        description: 'Get natural sunlight exposure in the morning',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved energy. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term circadian benefits.',
        emoji: '☀️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better energy', 'Improved mood', 'Vitamin D']
      },
      {
        id: 'mood-20',
        name: 'Write positive thoughts',
        description: 'Write down positive thoughts and reflections',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in mindset. By 30 days you will experience long-term optimism benefits.',
        emoji: '✨',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better positivity', 'Improved mindset', 'Reduced negativity']
      },
      {
        id: 'mood-21',
        name: 'Take break from phone',
        description: 'Take intentional breaks from your phone',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in focus. By 30 days you will experience long-term mental clarity benefits.',
        emoji: '📱',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better presence', 'Improved focus', 'Reduced anxiety']
      },
      {
        id: 'mood-22',
        name: 'Declutter small area',
        description: 'Tidy up a small area of your space',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved order. By 14 days you will see measurable improvements in calm. By 30 days you will experience long-term organization benefits.',
        emoji: '🧹',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better order', 'Improved calm', 'Sense of control']
      },
      {
        id: 'mood-23',
        name: 'Smile intentionally',
        description: 'Practice smiling even when you do not feel like it',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in positivity. By 30 days you will experience long-term happiness benefits.',
        emoji: '😊',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better mood', 'Increased positivity', 'Improved outlook']
      },
      {
        id: 'mood-24',
        name: 'Check in with feelings',
        description: 'Pause to identify how you are feeling',
        expectedOutcome: 'By completing this habit for 7 days you will notice better awareness. By 14 days you will see measurable improvements in emotional intelligence. By 30 days you will experience long-term self-awareness benefits.',
        emoji: '💭',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better awareness', 'Emotional intelligence', 'Improved regulation']
      },
      {
        id: 'mood-25',
        name: 'Set small win goal',
        description: 'Set and achieve a small goal each day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved confidence. By 14 days you will see measurable improvements in motivation. By 30 days you will experience long-term achievement benefits.',
        emoji: '🎯',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better confidence', 'Increased motivation', 'Sense of achievement']
      },
      {
        id: 'mood-26',
        name: 'Celebrate tiny win',
        description: 'Acknowledge and celebrate small accomplishments',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in motivation. By 30 days you will experience long-term confidence benefits.',
        emoji: '🎉',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better positivity', 'Increased motivation', 'Improved self-esteem']
      },
      {
        id: 'mood-27',
        name: 'Avoid complaining',
        description: 'Consciously reduce complaining throughout the day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in mindset. By 30 days you will experience long-term optimism benefits.',
        emoji: '🚫',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better positivity', 'Improved mindset', 'Reduced negativity']
      },
      {
        id: 'mood-28',
        name: 'Forgive yourself',
        description: 'Practice self-forgiveness for mistakes',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced guilt. By 14 days you will see measurable improvements in self-compassion. By 30 days you will experience long-term peace benefits.',
        emoji: '💗',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less guilt', 'Better self-compassion', 'Improved peace']
      },
      {
        id: 'mood-29',
        name: 'Do mindful breathing',
        description: 'Practice mindful breathing exercises',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in focus. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🧘‍♂️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better calm', 'Improved focus', 'Reduced stress']
      },
      {
        id: 'mood-30',
        name: 'Slow down morning',
        description: 'Start your morning at a slower, intentional pace',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced rush. By 14 days you will see measurable improvements in calm. By 30 days you will experience long-term peace benefits.',
        emoji: '🌅',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Less rush', 'Better calm', 'Improved mood']
      },
      {
        id: 'mood-31',
        name: 'Eat nourishing food',
        description: 'Choose nutritious foods that nourish your body',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved energy. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term health benefits.',
        emoji: '🥗',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better energy', 'Improved mood', 'Better nutrition']
      },
      {
        id: 'mood-32',
        name: 'Dance for 1 minute',
        description: 'Dance freely for one minute to boost mood',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved energy. By 14 days you will see measurable improvements in mood. By 30 days you will experience long-term joy benefits.',
        emoji: '💃',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better energy', 'Improved mood', 'Fun movement']
      },
      {
        id: 'mood-33',
        name: 'Check posture',
        description: 'Check and correct your posture throughout the day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved confidence. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term posture benefits.',
        emoji: '🧍',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better posture', 'Improved confidence', 'Less pain']
      },
      {
        id: 'mood-34',
        name: 'Do something relaxing',
        description: 'Engage in an activity that relaxes you',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in stress levels. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🛋️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better calm', 'Reduced stress', 'Improved mood']
      },
      {
        id: 'mood-35',
        name: 'Connect with loved one',
        description: 'Reach out to a loved one for connection',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in relationships. By 30 days you will experience long-term bonding benefits.',
        emoji: '❤️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better connection', 'Improved relationships', 'Reduced loneliness']
      },
      {
        id: 'mood-36',
        name: 'Practice acceptance',
        description: 'Practice accepting things you cannot change',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced frustration. By 14 days you will see measurable improvements in peace. By 30 days you will experience long-term serenity benefits.',
        emoji: '🙏',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less frustration', 'Better peace', 'Improved serenity']
      },
      {
        id: 'mood-37',
        name: 'Reflect on good moments',
        description: 'Reflect on positive moments from your day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in gratitude. By 30 days you will experience long-term happiness benefits.',
        emoji: '✨',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better positivity', 'Increased gratitude', 'Improved mood']
      },
      {
        id: 'mood-38',
        name: 'Limit social media',
        description: 'Reduce time spent on social media platforms',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced comparison. By 14 days you will see measurable improvements in self-esteem. By 30 days you will experience long-term peace benefits.',
        emoji: '📵',
        category: 'Mood',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Less comparison', 'Better self-esteem', 'Improved focus']
      },
      {
        id: 'mood-39',
        name: 'Say thank you',
        description: 'Express gratitude by saying thank you more often',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in relationships. By 30 days you will experience long-term gratitude benefits.',
        emoji: '🙏',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better positivity', 'Improved relationships', 'Increased gratitude']
      },
      {
        id: 'mood-40',
        name: 'Practice deep breaths',
        description: 'Take several deep breaths when feeling stressed',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stress. By 14 days you will see measurable improvements in calm. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🌬️',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Reduced stress', 'Better calm', 'Improved focus']
      },
      {
        id: 'mood-41',
        name: 'Journal gratitude',
        description: 'Write in a gratitude journal regularly',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in perspective. By 30 days you will experience long-term happiness benefits.',
        emoji: '📔',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better positivity', 'Improved perspective', 'Increased gratitude']
      },
      {
        id: 'mood-42',
        name: 'Stretch upper body',
        description: 'Stretch your upper body to release tension',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced tension. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🤸',
        category: 'Mood',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less tension', 'Better comfort', 'Improved mood']
      }
    ],
    Sleep: [
      {
        id: 'sleep-1',
        name: 'Digital Sunset',
        description: 'Stop using screens 1 hour before bedtime',
        expectedOutcome: 'Better sleep quality and faster sleep onset',
        emoji: '📱',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '1 hour',
        benefits: ['Better sleep quality', 'Faster sleep onset', 'Reduced eye strain']
      },
      {
        id: 'sleep-2',
        name: 'Bedtime Routine',
        description: 'Follow a consistent 30-minute wind-down routine',
        expectedOutcome: 'Improved sleep consistency and quality',
        emoji: '🌙',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '30 minutes',
        benefits: ['Better sleep consistency', 'Reduced sleep anxiety', 'Improved rest']
      },
      {
        id: 'sleep-3',
        name: 'Sleep before 10:30 PM',
        description: 'Get to bed by 10:30 PM for optimal rest and recovery',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved morning energy. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term circadian benefits.',
        emoji: '🛏️',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better sleep quality', 'Improved energy', 'Optimal recovery']
      },
      {
        id: 'sleep-4',
        name: 'No screens 30 mins before bed',
        description: 'Avoid all screens 30 minutes before sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice faster sleep onset. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term melatonin benefits.',
        emoji: '📵',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Better melatonin', 'Faster sleep', 'Reduced eye strain']
      },
      {
        id: 'sleep-5',
        name: 'Nighttime stretch',
        description: 'Do gentle stretches before bed to relax muscles',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced tension. By 14 days you will see measurable improvements in sleep comfort. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🧘‍♀️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Muscle relaxation', 'Better comfort', 'Reduced tension']
      },
      {
        id: 'sleep-6',
        name: 'Warm shower before bed',
        description: 'Take a warm shower to signal your body for sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🚿',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Body relaxation', 'Temperature regulation', 'Better sleep onset']
      },
      {
        id: 'sleep-7',
        name: 'Read before sleep',
        description: 'Read a physical book before bed instead of screens',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer mind. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term relaxation benefits.',
        emoji: '📚',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Mental relaxation', 'No blue light', 'Better wind-down']
      },
      {
        id: 'sleep-8',
        name: 'Avoid caffeine after 3 PM',
        description: 'Stop consuming caffeine after 3 PM',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep onset. By 14 days you will see measurable improvements in sleep depth. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '☕',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better sleep onset', 'Deeper sleep', 'Less restlessness']
      },
      {
        id: 'sleep-9',
        name: 'Drink herbal tea',
        description: 'Enjoy calming herbal tea before bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term calm benefits.',
        emoji: '🍵',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Relaxation', 'Hydration', 'Calming ritual']
      },
      {
        id: 'sleep-10',
        name: 'Set a sleep schedule',
        description: 'Go to bed and wake up at the same time daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice more consistent energy. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term circadian benefits.',
        emoji: '⏰',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Consistent rhythm', 'Better sleep', 'Improved energy']
      },
      {
        id: 'sleep-11',
        name: 'Dim lights in evening',
        description: 'Lower light levels in your home after sunset',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved melatonin production. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term circadian benefits.',
        emoji: '💡',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better melatonin', 'Natural wind-down', 'Improved sleep']
      },
      {
        id: 'sleep-12',
        name: 'Light dinner',
        description: 'Eat a lighter meal in the evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in sleep comfort. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🥗',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '20 minutes',
        benefits: ['Better digestion', 'Less discomfort', 'Improved sleep']
      },
      {
        id: 'sleep-13',
        name: 'Write thoughts before bed',
        description: 'Journal your thoughts to clear your mind before sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice a clearer mind. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term mental calm benefits.',
        emoji: '📝',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Mental clarity', 'Reduced worry', 'Better sleep onset']
      },
      {
        id: 'sleep-14',
        name: 'Sleep in cool room',
        description: 'Keep your bedroom cool for optimal sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep comfort. By 14 days you will see measurable improvements in sleep depth. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '❄️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better temperature', 'Deeper sleep', 'Less waking']
      },
      {
        id: 'sleep-15',
        name: 'Avoid heavy meals late',
        description: 'Avoid large meals close to bedtime',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in sleep comfort. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🍽️',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better digestion', 'Less discomfort', 'Improved sleep']
      },
      {
        id: 'sleep-16',
        name: 'Bedtime affirmation',
        description: 'Repeat a calming affirmation before sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer mind. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term relaxation benefits.',
        emoji: '💭',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Mental calm', 'Positive mindset', 'Better sleep']
      },
      {
        id: 'sleep-17',
        name: 'No phone in bed',
        description: 'Keep your phone out of the bedroom',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep onset. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term sleep hygiene benefits.',
        emoji: '📱',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['No distractions', 'Better sleep', 'Less blue light']
      },
      {
        id: 'sleep-18',
        name: 'Evening meditation',
        description: 'Practice meditation before bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term calm benefits.',
        emoji: '🧘',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Mental calm', 'Better relaxation', 'Improved sleep']
      },
      {
        id: 'sleep-19',
        name: 'Lower room lights',
        description: 'Use dimmer or softer lighting in the evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice better melatonin. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term circadian benefits.',
        emoji: '🔆',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better melatonin', 'Natural wind-down', 'Improved sleep']
      },
      {
        id: 'sleep-20',
        name: 'Relaxing music',
        description: 'Listen to calming music before bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term calm benefits.',
        emoji: '🎵',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better relaxation', 'Calming routine', 'Improved mood']
      },
      {
        id: 'sleep-21',
        name: 'Deep breathing in bed',
        description: 'Practice deep breathing while lying in bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice faster sleep onset. By 14 days you will see measurable improvements in relaxation. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🌬️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better relaxation', 'Faster sleep', 'Reduced anxiety']
      },
      {
        id: 'sleep-22',
        name: 'Evening walk',
        description: 'Take a gentle walk in the evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term wellness benefits.',
        emoji: '🚶‍♂️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better digestion', 'Mental relaxation', 'Improved sleep']
      },
      {
        id: 'sleep-23',
        name: 'No social media before bed',
        description: 'Avoid social media in the hour before sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer mind. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term mental peace benefits.',
        emoji: '🚫',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less stimulation', 'Better sleep', 'Calmer mind']
      },
      {
        id: 'sleep-24',
        name: 'Journal before sleep',
        description: 'Write in a journal to process your day',
        expectedOutcome: 'By completing this habit for 7 days you will notice clearer thoughts. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term mental clarity benefits.',
        emoji: '📓',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Mental processing', 'Reduced worry', 'Better sleep']
      },
      {
        id: 'sleep-25',
        name: 'Plan next day early',
        description: 'Plan tomorrow before the evening to avoid bedtime stress',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced bedtime anxiety. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term organization benefits.',
        emoji: '📋',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less worry', 'Better preparation', 'Improved sleep']
      },
      {
        id: 'sleep-26',
        name: 'Stretch neck/shoulders',
        description: 'Release tension in neck and shoulders before bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced tension. By 14 days you will see measurable improvements in sleep comfort. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🤸',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less tension', 'Better comfort', 'Improved relaxation']
      },
      {
        id: 'sleep-27',
        name: 'Avoid naps after 4 PM',
        description: 'Skip late afternoon naps to protect nighttime sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice better nighttime sleep. By 14 days you will see measurable improvements in sleep consistency. By 30 days you will experience long-term sleep schedule benefits.',
        emoji: '😴',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better nighttime sleep', 'Consistent schedule', 'Improved energy']
      },
      {
        id: 'sleep-28',
        name: 'Keep bedroom quiet',
        description: 'Maintain a quiet sleep environment',
        expectedOutcome: 'By completing this habit for 7 days you will notice fewer disturbances. By 14 days you will see measurable improvements in sleep depth. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🤫',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Less disruption', 'Better sleep', 'Deeper rest']
      },
      {
        id: 'sleep-29',
        name: 'Use sleep mask',
        description: 'Wear a sleep mask to block out light',
        expectedOutcome: 'By completing this habit for 7 days you will notice better darkness. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term melatonin benefits.',
        emoji: '😎',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Complete darkness', 'Better melatonin', 'Improved sleep']
      },
      {
        id: 'sleep-30',
        name: 'Wake same time daily',
        description: 'Wake up at the same time every day including weekends',
        expectedOutcome: 'By completing this habit for 7 days you will notice more consistent energy. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term circadian benefits.',
        emoji: '⏰',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Consistent rhythm', 'Better energy', 'Improved sleep']
      },
      {
        id: 'sleep-31',
        name: 'Clean sheets weekly',
        description: 'Change your sheets weekly for better sleep hygiene',
        expectedOutcome: 'By completing this habit for 7 days you will notice fresher sleep environment. By 14 days you will see measurable improvements in sleep comfort. By 30 days you will experience long-term hygiene benefits.',
        emoji: '🛏️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        benefits: ['Better hygiene', 'Improved comfort', 'Fresher sleep']
      },
      {
        id: 'sleep-32',
        name: 'Track sleep quality',
        description: 'Monitor and log your sleep quality daily',
        expectedOutcome: 'By completing this habit for 7 days you will notice sleep patterns. By 14 days you will see measurable improvements in awareness. By 30 days you will experience long-term optimization benefits.',
        emoji: '📊',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better awareness', 'Pattern recognition', 'Improved optimization']
      },
      {
        id: 'sleep-33',
        name: 'Avoid alcohol at night',
        description: 'Skip alcoholic drinks close to bedtime',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep quality. By 14 days you will see measurable improvements in sleep depth. By 30 days you will experience long-term rest benefits.',
        emoji: '🍷',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better sleep quality', 'Deeper rest', 'Less disruption']
      },
      {
        id: 'sleep-34',
        name: 'Screen blue-light filter',
        description: 'Enable blue light filter on devices in evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced eye strain. By 14 days you will see measurable improvements in melatonin. By 30 days you will experience long-term sleep onset benefits.',
        emoji: '🔵',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Less blue light', 'Better melatonin', 'Reduced eye strain']
      },
      {
        id: 'sleep-35',
        name: 'Practice gratitude',
        description: 'Reflect on things you are grateful for before bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice a more positive mindset. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term mental peace benefits.',
        emoji: '🙏',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Positive mindset', 'Better sleep', 'Reduced worry']
      },
      {
        id: 'sleep-36',
        name: 'Limit late-night TV',
        description: 'Avoid watching TV close to bedtime',
        expectedOutcome: 'By completing this habit for 7 days you will notice better wind-down. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '📺',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less stimulation', 'Better wind-down', 'Improved sleep']
      },
      {
        id: 'sleep-37',
        name: 'Turn off bright lights',
        description: 'Switch off bright overhead lights in the evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice better melatonin. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term circadian benefits.',
        emoji: '💡',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better melatonin', 'Natural wind-down', 'Improved sleep']
      },
      {
        id: 'sleep-38',
        name: 'Avoid stressful convos at night',
        description: 'Save difficult conversations for daytime',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer evening. By 14 days you will see measurable improvements in sleep quality. By 30 days you will experience long-term peace benefits.',
        emoji: '🚫',
        category: 'Sleep',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Less stress', 'Calmer mind', 'Better sleep']
      },
      {
        id: 'sleep-39',
        name: 'Keep sleep diary',
        description: 'Maintain a diary of your sleep patterns and quality',
        expectedOutcome: 'By completing this habit for 7 days you will notice pattern awareness. By 14 days you will see measurable improvements in sleep understanding. By 30 days you will experience long-term optimization benefits.',
        emoji: '📔',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better tracking', 'Pattern awareness', 'Improved habits']
      },
      {
        id: 'sleep-40',
        name: 'Set wind-down routine',
        description: 'Create a consistent pre-sleep routine',
        expectedOutcome: 'By completing this habit for 7 days you will notice better sleep signals. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term sleep quality benefits.',
        emoji: '🌅',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '20 minutes',
        benefits: ['Sleep signals', 'Better routine', 'Improved quality']
      },
      {
        id: 'sleep-41',
        name: 'Drink water earlier',
        description: 'Finish drinking water well before bedtime',
        expectedOutcome: 'By completing this habit for 7 days you will notice fewer nighttime awakenings. By 14 days you will see measurable improvements in sleep continuity. By 30 days you will experience long-term uninterrupted sleep benefits.',
        emoji: '💧',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Fewer awakenings', 'Better continuity', 'Uninterrupted sleep']
      },
      {
        id: 'sleep-42',
        name: 'Mindful breathing before bed',
        description: 'Practice mindful breathing as you prepare for sleep',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in sleep onset. By 30 days you will experience long-term calm benefits.',
        emoji: '🌬️',
        category: 'Sleep',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better relaxation', 'Calmer mind', 'Faster sleep']
      }
    ],
    MentalClarity: [
      {
        id: 'clarity-1',
        name: 'Mind Mapping',
        description: 'Create visual maps of your thoughts and ideas',
        expectedOutcome: 'Clearer thinking and better organization',
        emoji: '🧠',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Clearer thinking', 'Better organization', 'Enhanced creativity']
      },
      {
        id: 'clarity-2',
        name: 'Digital Declutter',
        description: 'Organize your digital spaces and reduce information overload',
        expectedOutcome: 'Reduced mental clutter and improved focus',
        emoji: '🗂️',
        category: 'MentalClarity',
        difficulty: 'Hard',
        timeRequired: '45 minutes',
        benefits: ['Reduced overwhelm', 'Better focus', 'Improved productivity']
      },
      {
        id: 'clarity-3',
        name: '5-minute deep breathing',
        description: 'Practice deep breathing exercises to calm and focus your mind',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved focus and reduced stress. By 14 days you will see measurable improvements in mental clarity. By 30 days you will experience long-term cognitive benefits.',
        emoji: '🌬️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Reduced stress', 'Improved focus', 'Better oxygen flow to brain']
      },
      {
        id: 'clarity-4',
        name: 'Write daily priorities',
        description: 'List your top priorities each morning to guide your day',
        expectedOutcome: 'By completing this habit for 7 days you will notice better task management. By 14 days you will see measurable improvements in productivity. By 30 days you will experience long-term organizational benefits.',
        emoji: '📝',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better focus', 'Improved productivity', 'Reduced decision fatigue']
      },
      {
        id: 'clarity-5',
        name: 'Digital detox break',
        description: 'Take regular breaks from screens to rest your mind',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced eye strain. By 14 days you will see measurable improvements in attention span. By 30 days you will experience long-term mental clarity benefits.',
        emoji: '📵',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Reduced eye strain', 'Better attention', 'Improved presence']
      },
      {
        id: 'clarity-6',
        name: 'Mindful pause every hour',
        description: 'Take a brief mindful pause each hour to reset your focus',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved awareness. By 14 days you will see measurable improvements in sustained focus. By 30 days you will experience long-term mindfulness benefits.',
        emoji: '⏸️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better awareness', 'Reduced burnout', 'Improved focus']
      },
      {
        id: 'clarity-7',
        name: 'Brain dump journaling',
        description: 'Write down all thoughts to clear mental clutter',
        expectedOutcome: 'By completing this habit for 7 days you will notice a clearer mind. By 14 days you will see measurable improvements in mental organization. By 30 days you will experience long-term cognitive clarity.',
        emoji: '📓',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Mental clarity', 'Reduced anxiety', 'Better organization']
      },
      {
        id: 'clarity-8',
        name: 'Read 2 pages of a book',
        description: 'Read at least two pages daily to stimulate your mind',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved focus. By 14 days you will see measurable improvements in knowledge retention. By 30 days you will experience long-term cognitive benefits.',
        emoji: '📖',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Mental stimulation', 'Better focus', 'Knowledge growth']
      },
      {
        id: 'clarity-9',
        name: 'Practice gratitude list',
        description: 'Write down things you are grateful for each day',
        expectedOutcome: 'By completing this habit for 7 days you will notice a more positive mindset. By 14 days you will see measurable improvements in mental outlook. By 30 days you will experience long-term emotional clarity.',
        emoji: '🙏',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Positive mindset', 'Reduced negativity', 'Better perspective']
      },
      {
        id: 'clarity-10',
        name: 'Cold water face splash',
        description: 'Splash cold water on your face to refresh and awaken your mind',
        expectedOutcome: 'By completing this habit for 7 days you will notice increased alertness. By 14 days you will see measurable improvements in morning clarity. By 30 days you will experience long-term wakefulness benefits.',
        emoji: '💦',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Instant alertness', 'Improved circulation', 'Mental reset']
      },
      {
        id: 'clarity-11',
        name: 'Stand and stretch break',
        description: 'Stand up and stretch to improve blood flow and focus',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stiffness. By 14 days you will see measurable improvements in energy levels. By 30 days you will experience long-term posture and focus benefits.',
        emoji: '🧘',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better circulation', 'Reduced tension', 'Improved focus']
      },
      {
        id: 'clarity-12',
        name: 'Focus on single task',
        description: 'Dedicate your attention to one task at a time',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved concentration. By 14 days you will see measurable improvements in task completion. By 30 days you will experience long-term productivity benefits.',
        emoji: '🎯',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '30 minutes',
        benefits: ['Deep focus', 'Better quality work', 'Reduced errors']
      },
      {
        id: 'clarity-13',
        name: 'Avoid multitasking session',
        description: 'Commit to avoiding multitasking during focused work sessions',
        expectedOutcome: 'By completing this habit for 7 days you will notice better task quality. By 14 days you will see measurable improvements in efficiency. By 30 days you will experience long-term focus benefits.',
        emoji: '🚫',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '60 minutes',
        benefits: ['Improved efficiency', 'Better focus', 'Reduced mental fatigue']
      },
      {
        id: 'clarity-14',
        name: '5-minute meditation',
        description: 'Practice brief meditation to center your thoughts',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer mind. By 14 days you will see measurable improvements in mental clarity. By 30 days you will experience long-term mindfulness benefits.',
        emoji: '🧘‍♂️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Mental calm', 'Better focus', 'Reduced stress']
      },
      {
        id: 'clarity-15',
        name: 'Limit notifications',
        description: 'Turn off non-essential notifications to reduce distractions',
        expectedOutcome: 'By completing this habit for 7 days you will notice fewer interruptions. By 14 days you will see measurable improvements in deep work. By 30 days you will experience long-term focus benefits.',
        emoji: '🔕',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Fewer distractions', 'Better focus', 'Improved productivity']
      },
      {
        id: 'clarity-16',
        name: 'Plan tomorrow tonight',
        description: 'Plan your next day before going to bed',
        expectedOutcome: 'By completing this habit for 7 days you will notice smoother mornings. By 14 days you will see measurable improvements in daily productivity. By 30 days you will experience long-term organizational benefits.',
        emoji: '🌙',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better preparation', 'Reduced morning stress', 'Improved productivity']
      },
      {
        id: 'clarity-17',
        name: 'Review goals daily',
        description: 'Review your goals each day to stay aligned and motivated',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved motivation. By 14 days you will see measurable improvements in goal progress. By 30 days you will experience long-term achievement benefits.',
        emoji: '🎯',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better alignment', 'Increased motivation', 'Faster progress']
      },
      {
        id: 'clarity-18',
        name: 'Do one hard thing first',
        description: 'Tackle your most challenging task first thing in the morning',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced procrastination. By 14 days you will see measurable improvements in productivity. By 30 days you will experience long-term achievement benefits.',
        emoji: '💪',
        category: 'MentalClarity',
        difficulty: 'Hard',
        timeRequired: '30 minutes',
        benefits: ['Reduced procrastination', 'Sense of accomplishment', 'Better momentum']
      },
      {
        id: 'clarity-19',
        name: 'Mental reset walk',
        description: 'Take a short walk to reset and refresh your mind',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in creative thinking. By 30 days you will experience long-term mental clarity benefits.',
        emoji: '🚶',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Mental reset', 'Improved creativity', 'Better mood']
      },
      {
        id: 'clarity-20',
        name: 'Declutter workspace',
        description: 'Organize and tidy your workspace for better focus',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced visual distractions. By 14 days you will see measurable improvements in focus. By 30 days you will experience long-term productivity benefits.',
        emoji: '🗄️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '10 minutes',
        benefits: ['Better focus', 'Reduced stress', 'Improved efficiency']
      },
      {
        id: 'clarity-21',
        name: 'Set clear intentions',
        description: 'Set clear intentions for what you want to accomplish',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved focus. By 14 days you will see measurable improvements in goal achievement. By 30 days you will experience long-term clarity benefits.',
        emoji: '✨',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better direction', 'Improved focus', 'Clearer purpose']
      },
      {
        id: 'clarity-22',
        name: 'Drink water first thing',
        description: 'Drink a glass of water immediately upon waking',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved alertness. By 14 days you will see measurable improvements in morning energy. By 30 days you will experience long-term hydration benefits.',
        emoji: '💧',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better hydration', 'Improved alertness', 'Mental clarity']
      },
      {
        id: 'clarity-23',
        name: 'Practice silence for 1 min',
        description: 'Sit in complete silence for one minute to center yourself',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in mental clarity. By 30 days you will experience long-term mindfulness benefits.',
        emoji: '🤫',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Mental calm', 'Better awareness', 'Reduced noise fatigue']
      },
      {
        id: 'clarity-24',
        name: 'No-screen breakfast',
        description: 'Eat breakfast without looking at any screens',
        expectedOutcome: 'By completing this habit for 7 days you will notice a calmer morning. By 14 days you will see measurable improvements in mindful eating. By 30 days you will experience long-term presence benefits.',
        emoji: '🍳',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '20 minutes',
        benefits: ['Mindful eating', 'Better digestion', 'Calmer start']
      },
      {
        id: 'clarity-25',
        name: 'Slow breathing count',
        description: 'Practice slow counted breathing to calm your nervous system',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced stress. By 14 days you will see measurable improvements in calmness. By 30 days you will experience long-term relaxation benefits.',
        emoji: '🔢',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Reduced stress', 'Better focus', 'Calmer mind']
      },
      {
        id: 'clarity-26',
        name: 'Positive affirmation',
        description: 'Repeat a positive affirmation to start your day',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved confidence. By 14 days you will see measurable improvements in mindset. By 30 days you will experience long-term self-belief benefits.',
        emoji: '💬',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better mindset', 'Increased confidence', 'Positive outlook']
      },
      {
        id: 'clarity-27',
        name: 'Reset posture hourly',
        description: 'Check and correct your posture every hour',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced back tension. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term posture benefits.',
        emoji: '🪑',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better posture', 'Reduced pain', 'Improved breathing']
      },
      {
        id: 'clarity-28',
        name: 'Avoid doom scrolling',
        description: 'Consciously avoid endless scrolling on social media',
        expectedOutcome: 'By completing this habit for 7 days you will notice more free time. By 14 days you will see measurable improvements in mental clarity. By 30 days you will experience long-term focus benefits.',
        emoji: '📱',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['More time', 'Better focus', 'Reduced anxiety']
      },
      {
        id: 'clarity-29',
        name: 'Tidy desk end of day',
        description: 'Clean and organize your desk at the end of each workday',
        expectedOutcome: 'By completing this habit for 7 days you will notice a better morning start. By 14 days you will see measurable improvements in organization. By 30 days you will experience long-term productivity benefits.',
        emoji: '🧹',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Fresh start', 'Better organization', 'Reduced stress']
      },
      {
        id: 'clarity-30',
        name: 'Reflect on wins',
        description: 'Reflect on your daily accomplishments and wins',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved confidence. By 14 days you will see measurable improvements in motivation. By 30 days you will experience long-term positivity benefits.',
        emoji: '🏆',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Increased motivation', 'Better self-awareness', 'Positive mindset']
      },
      {
        id: 'clarity-31',
        name: 'Set hourly focus timer',
        description: 'Use a timer to maintain focused work sessions',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved time management. By 14 days you will see measurable improvements in productivity. By 30 days you will experience long-term efficiency benefits.',
        emoji: '⏱️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        benefits: ['Better time management', 'Improved focus', 'Increased productivity']
      },
      {
        id: 'clarity-32',
        name: 'Visualize your day',
        description: 'Mentally visualize how you want your day to unfold',
        expectedOutcome: 'By completing this habit for 7 days you will notice better preparation. By 14 days you will see measurable improvements in goal achievement. By 30 days you will experience long-term success benefits.',
        emoji: '👁️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '3 minutes',
        benefits: ['Better preparation', 'Increased motivation', 'Clearer goals']
      },
      {
        id: 'clarity-33',
        name: '5-minute sunlight exposure',
        description: 'Get natural sunlight exposure to boost alertness',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved mood. By 14 days you will see measurable improvements in energy. By 30 days you will experience long-term circadian rhythm benefits.',
        emoji: '☀️',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better mood', 'Improved energy', 'Vitamin D']
      },
      {
        id: 'clarity-34',
        name: 'Track distractions',
        description: 'Note down what distracts you to identify patterns',
        expectedOutcome: 'By completing this habit for 7 days you will notice distraction patterns. By 14 days you will see measurable improvements in focus strategies. By 30 days you will experience long-term concentration benefits.',
        emoji: '📊',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better awareness', 'Improved focus', 'Reduced distractions']
      },
      {
        id: 'clarity-35',
        name: 'Practice mindful eating',
        description: 'Eat slowly and mindfully, focusing on your food',
        expectedOutcome: 'By completing this habit for 7 days you will notice better digestion. By 14 days you will see measurable improvements in presence. By 30 days you will experience long-term mindfulness benefits.',
        emoji: '🍽️',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '20 minutes',
        benefits: ['Better digestion', 'Increased presence', 'Improved satisfaction']
      },
      {
        id: 'clarity-36',
        name: 'Plan breaks intentionally',
        description: 'Schedule and take intentional breaks throughout your day',
        expectedOutcome: 'By completing this habit for 7 days you will notice reduced burnout. By 14 days you will see measurable improvements in sustained focus. By 30 days you will experience long-term energy benefits.',
        emoji: '⏰',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Reduced burnout', 'Better energy', 'Improved focus']
      },
      {
        id: 'clarity-37',
        name: 'Organize work apps',
        description: 'Organize your digital workspace and apps for efficiency',
        expectedOutcome: 'By completing this habit for 7 days you will notice faster navigation. By 14 days you will see measurable improvements in workflow. By 30 days you will experience long-term efficiency benefits.',
        emoji: '📱',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        benefits: ['Better efficiency', 'Reduced clutter', 'Faster access']
      },
      {
        id: 'clarity-38',
        name: 'Create thought boundary',
        description: 'Set mental boundaries for work and personal thoughts',
        expectedOutcome: 'By completing this habit for 7 days you will notice better work-life balance. By 14 days you will see measurable improvements in mental separation. By 30 days you will experience long-term boundary benefits.',
        emoji: '🚧',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '5 minutes',
        benefits: ['Better boundaries', 'Reduced overwhelm', 'Improved balance']
      },
      {
        id: 'clarity-39',
        name: 'Practice mini grounding',
        description: 'Use quick grounding techniques to center yourself',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in calmness. By 30 days you will experience long-term grounding benefits.',
        emoji: '🌱',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '2 minutes',
        benefits: ['Better presence', 'Reduced anxiety', 'Improved focus']
      },
      {
        id: 'clarity-40',
        name: 'Single-task meal',
        description: 'Eat one meal per day without any distractions',
        expectedOutcome: 'By completing this habit for 7 days you will notice improved awareness. By 14 days you will see measurable improvements in mindfulness. By 30 days you will experience long-term presence benefits.',
        emoji: '🥗',
        category: 'MentalClarity',
        difficulty: 'Medium',
        timeRequired: '20 minutes',
        benefits: ['Better awareness', 'Improved digestion', 'Mental rest']
      },
      {
        id: 'clarity-41',
        name: 'Evening mental review',
        description: 'Review your day and mental state each evening',
        expectedOutcome: 'By completing this habit for 7 days you will notice better self-awareness. By 14 days you will see measurable improvements in mental patterns. By 30 days you will experience long-term clarity benefits.',
        emoji: '🌆',
        category: 'MentalClarity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        benefits: ['Better self-awareness', 'Improved patterns', 'Mental closure']
      }
    ]
  };
};

// Intimacy plans data
export const getIntimacyPlans = (): IntimacyPlan[] => {
  return [
    {
      id: 'plan-1',
      title: 'Connection Foundation',
      description: 'Build deeper emotional intimacy through daily connection practices',
      level: 'Beginner',
      duration: 14,
      scheduleType: 'Daily',
      activities: [
        {
          id: 'act-1',
          name: 'Daily Check-in',
          description: 'Spend 10 minutes sharing your day with your partner',
          emoji: '💬',
          duration: 10,
          tips: ['Choose a quiet time', 'Listen without judgment', 'Share both good and challenging moments'],
          benefits: ['Improved communication', 'Deeper understanding', 'Stronger emotional bond']
        },
        {
          id: 'act-2',
          name: 'Gratitude Exchange',
          description: 'Share one thing you appreciate about each other',
          emoji: '🙏',
          duration: 5,
          tips: ['Be specific', 'Focus on actions, not just traits', 'Make it a daily practice'],
          benefits: ['Increased appreciation', 'Positive relationship focus', 'Enhanced intimacy']
        }
      ],
      expectedOutcomes: ['Improved communication', 'Deeper emotional connection', 'Stronger relationship foundation']
    },
    {
      id: 'plan-2',
      title: 'Intimacy Deepening',
      description: 'Advanced practices for couples ready to explore deeper intimacy',
      level: 'Intermediate',
      duration: 21,
      scheduleType: 'Weekly',
      activities: [
        {
          id: 'act-3',
          name: 'Vulnerability Sharing',
          description: 'Share something personal and vulnerable with your partner',
          emoji: '💝',
          duration: 20,
          tips: ['Start small', 'Create a safe space', 'Be patient with each other'],
          benefits: ['Deeper trust', 'Enhanced intimacy', 'Stronger emotional connection']
        },
        {
          id: 'act-4',
          name: 'Intimacy Planning',
          description: 'Plan special intimate moments together',
          emoji: '💕',
          duration: 15,
          tips: ['Be creative', 'Consider both partners\' preferences', 'Make it special'],
          benefits: ['Anticipation building', 'Shared planning', 'Enhanced connection']
        }
      ],
      expectedOutcomes: ['Deeper emotional intimacy', 'Enhanced trust', 'Stronger relationship bond']
    },
    {
      id: 'plan-3',
      title: 'Soul Connection',
      description: 'Advanced spiritual and emotional intimacy practices',
      level: 'Advanced',
      duration: 30,
      scheduleType: 'Monthly',
      activities: [
        {
          id: 'act-5',
          name: 'Shared Meditation',
          description: 'Practice meditation together to deepen spiritual connection',
          emoji: '🧘',
          duration: 30,
          tips: ['Start with guided meditations', 'Be patient with the process', 'Focus on connection'],
          benefits: ['Spiritual intimacy', 'Deep relaxation', 'Enhanced presence']
        },
        {
          id: 'act-6',
          name: 'Relationship Vision',
          description: 'Create and share your vision for your relationship',
          emoji: '🌟',
          duration: 45,
          tips: ['Be open and honest', 'Listen to each other\'s dreams', 'Create shared goals'],
          benefits: ['Shared purpose', 'Deeper understanding', 'Stronger commitment']
        }
      ],
      expectedOutcomes: ['Spiritual intimacy', 'Shared purpose', 'Deep relationship fulfillment']
    }
  ];
};

// Enhanced impact analysis data
export const getActivityImpactData = (): ActivityImpact[] => {
  return [
    {
      activity: 'Exercise',
      moodImpact: 25,
      sleepImpact: 15,
      clarityImpact: 20,
      frequency: 5,
      trend: 'up',
      color: '#10B981'
    },
    {
      activity: 'Meditation',
      moodImpact: 18,
      sleepImpact: 22,
      clarityImpact: 35,
      frequency: 4,
      trend: 'up',
      color: '#8B5CF6'
    },
    {
      activity: 'Social Time',
      moodImpact: 30,
      sleepImpact: -5,
      clarityImpact: 10,
      frequency: 3,
      trend: 'up',
      color: '#F59E0B'
    },
    {
      activity: 'Screen Time',
      moodImpact: -12,
      sleepImpact: -25,
      clarityImpact: -15,
      frequency: 8,
      trend: 'down',
      color: '#EF4444'
    },
    {
      activity: 'Reading',
      moodImpact: 8,
      sleepImpact: 12,
      clarityImpact: 28,
      frequency: 2,
      trend: 'neutral',
      color: '#06B6D4'
    }
  ];
};

// AI Recommendations data
export const getAIRecommendations = (): AIRecommendation[] => {
  return [
    {
      id: 'rec-1',
      title: 'Morning Exercise Boost',
      description: 'You feel more energized and positive on days when you exercise in the morning.',
      reasoning: 'Based on your mood data, exercise days show 25% higher mood scores.',
      actionText: 'Try adding 15 minutes of morning movement to your routine.',
      category: 'habit',
      priority: 'high'
    },
    {
      id: 'rec-2',
      title: 'Screen Time Reduction',
      description: 'Reducing screen time before bed could improve your sleep quality significantly.',
      reasoning: 'Your sleep quality drops by 25% on high screen time days.',
      actionText: 'Try limiting screens 1 hour before bedtime.',
      category: 'lifestyle',
      priority: 'high'
    },
    {
      id: 'rec-3',
      title: 'Meditation for Clarity',
      description: 'Meditation sessions correlate with 35% better mental clarity scores.',
      reasoning: 'Your clarity is highest on days when you meditate, even for just 10 minutes.',
      actionText: 'Consider adding a short meditation to your daily routine.',
      category: 'habit',
      priority: 'medium'
    }
  ];
};