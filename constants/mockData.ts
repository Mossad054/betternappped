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