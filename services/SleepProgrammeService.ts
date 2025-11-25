// Sleep Programme Service - 4-Week Sleep Improvement Programme
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepService } from './sleep.service';
import { HabitsService } from './habits.service';

const PROGRAMME_KEY = 'sleep_programme';
const ACTIVE_PRACTICE_KEY = 'active_practice_sessions';
const WEEKLY_REVIEWS_KEY = 'weekly_reviews';

export type PracticeDuration = 'tonight' | '3_days' | '7_days' | '14_days' | '21_days';
export type CheckInResponse = 'completed' | 'attempted' | 'skipped';
export type SkipReason = 'forgot' | 'busy' | 'environment' | 'other';
export type ProgrammeStatus = 'not_enrolled' | 'active' | 'paused' | 'completed';

export interface Lesson {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  content: {
    type: 'text' | 'audio' | 'video';
    text?: string;
    audioUrl?: string;
    videoUrl?: string;
  };
  habitTask: {
    name: string;
    description: string;
    icon: string;
    category: string;
  };
  completedAt?: string;
  understood?: boolean;
}

export interface PracticeSession {
  id: string;
  lessonId: string;
  habitName: string;
  duration: PracticeDuration;
  startDate: string;
  endDate: string;
  scheduledDays: string[]; // ISO date strings
  completedDays: {
    date: string;
    response: CheckInResponse;
    skipReason?: SkipReason;
    notes?: string;
  }[];
  isActive: boolean;
}

export interface WeeklyReview {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  habitCompletionRate: number; // X out of 7 days
  averageSleepDuration: number; // in minutes
  targetSleepDuration: number;
  bedtimeVariability: number; // in minutes
  qualityWithHabit: number; // percentage
  qualityWithoutHabit: number; // percentage
  badgeEarned?: string;
  completedAt: string;
}

export interface Programme {
  id: string;
  userId: string;
  status: ProgrammeStatus;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  currentWeek: number;
  currentLessonId?: string;
  totalWeeks: number;
  lessons: Lesson[];
  weeklyReviews: WeeklyReview[];
  baselineMetrics: {
    averageSleepDuration: number;
    bedtimeConsistency: number;
    qualityScore: number;
    recordedAt: string;
  };
  currentMetrics?: {
    averageSleepDuration: number;
    bedtimeConsistency: number;
    qualityScore: number;
    improvementPercentage: number;
  };
  feedbackRating?: number;
  feedbackText?: string;
}

export interface EnrollmentCriteria {
  poorSleepNights: number; // e.g., 3 nights
  lowQualityThreshold: number; // e.g., below 3/5
  manualRequest: boolean;
}

class SleepProgrammeService {
  // Default 4-week programme lessons
  private defaultLessons: Lesson[] = [
    {
      id: 'lesson_1',
      weekNumber: 1,
      title: 'The Evening Screen-Off Habit',
      description: 'Learn why screen time before bed disrupts sleep and how to implement a screen-off routine.',
      content: {
        type: 'text',
        text: 'Blue light from screens suppresses melatonin production, making it harder to fall asleep. Research shows that avoiding screens 30-60 minutes before bedtime can improve sleep onset by 15-20 minutes.\n\nYour Task: Turn off all screens (phone, TV, tablet, computer) 30 minutes before your target bedtime. Use this time for calming activities like reading, journaling, or gentle stretching.',
      },
      habitTask: {
        name: 'Screen-Free Evening',
        description: 'Turn off screens 30 minutes before bedtime',
        icon: '📱',
        category: 'sleep',
      },
    },
    {
      id: 'lesson_2',
      weekNumber: 2,
      title: 'Creating Your Sleep Sanctuary',
      description: 'Optimize your bedroom environment for better sleep quality.',
      content: {
        type: 'text',
        text: 'Your bedroom environment plays a crucial role in sleep quality. Temperature, light, and noise all impact how well you sleep.\n\nYour Task: Set your room temperature to 18-20°C (64-68°F), ensure complete darkness (use blackout curtains or eye mask), and minimize noise (use earplugs or white noise if needed).',
      },
      habitTask: {
        name: 'Optimal Sleep Environment',
        description: 'Set room temp to 18-20°C, ensure darkness, minimize noise',
        icon: '🛏️',
        category: 'sleep',
      },
    },
    {
      id: 'lesson_3',
      weekNumber: 3,
      title: 'The Consistent Sleep Schedule',
      description: 'Discover the power of going to bed and waking up at the same time every day.',
      content: {
        type: 'text',
        text: 'Your body has a natural circadian rhythm that thrives on consistency. Going to bed and waking up at the same time every day—even on weekends—strengthens this rhythm and improves sleep quality.\n\nYour Task: Choose a consistent bedtime and wake time. Stick to it within 30 minutes, even on weekends.',
      },
      habitTask: {
        name: 'Consistent Sleep Schedule',
        description: 'Same bedtime and wake time every day (±30 minutes)',
        icon: '⏰',
        category: 'sleep',
      },
    },
    {
      id: 'lesson_4',
      weekNumber: 4,
      title: 'The Wind-Down Routine',
      description: 'Build a calming pre-sleep routine that signals your body it\'s time to rest.',
      content: {
        type: 'text',
        text: 'A consistent wind-down routine prepares your mind and body for sleep. This 30-60 minute routine should include calming activities that you enjoy.\n\nYour Task: Create a 3-step wind-down routine (e.g., dim lights → light reading → 5-minute breathing exercise). Perform it in the same order every night.',
      },
      habitTask: {
        name: 'Wind-Down Routine',
        description: 'Follow your 3-step calming pre-sleep routine',
        icon: '🌙',
        category: 'sleep',
      },
    },
  ];

  // Check if user meets enrollment criteria
  async checkEnrollmentCriteria(userId: string): Promise<EnrollmentCriteria | null> {
    try {
      // Get last 7 days of sleep data
      const sleepDataKey = `sleep_logs_${userId}`;
      const dataJson = await AsyncStorage.getItem(sleepDataKey);
      
      if (!dataJson) return null;

      const sleepLogs = JSON.parse(dataJson);
      const last7Days = sleepLogs.slice(-7);

      // Count poor sleep nights (quality < 3 or duration < 6 hours)
      const poorNights = last7Days.filter((log: any) => 
        log.quality < 3 || log.duration < 360
      ).length;

      // Calculate average quality
      const avgQuality = last7Days.reduce((sum: number, log: any) => 
        sum + log.quality, 0
      ) / last7Days.length;

      if (poorNights >= 3 || avgQuality < 3) {
        return {
          poorSleepNights: poorNights,
          lowQualityThreshold: avgQuality,
          manualRequest: false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking enrollment criteria:', error);
      return null;
    }
  }

  // Enroll user in programme
  async enrollUser(userId: string, baselineMetrics: Programme['baselineMetrics']): Promise<Programme> {
    try {
      const programme: Programme = {
        id: `prog_${Date.now()}`,
        userId,
        status: 'active',
        enrolledAt: new Date().toISOString(),
        currentWeek: 0, // Will start at week 1 when first lesson begins
        totalWeeks: 4,
        lessons: JSON.parse(JSON.stringify(this.defaultLessons)), // Deep copy
        weeklyReviews: [],
        baselineMetrics,
      };

      await AsyncStorage.setItem(
        `${PROGRAMME_KEY}_${userId}`,
        JSON.stringify(programme)
      );

      return programme;
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }

  // Get user's programme
  async getProgramme(userId: string): Promise<Programme | null> {
    try {
      const data = await AsyncStorage.getItem(`${PROGRAMME_KEY}_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting programme:', error);
      return null;
    }
  }

  // Update programme
  async updateProgramme(userId: string, updates: Partial<Programme>): Promise<Programme | null> {
    try {
      const programme = await this.getProgramme(userId);
      if (!programme) return null;

      const updated = { ...programme, ...updates };
      await AsyncStorage.setItem(
        `${PROGRAMME_KEY}_${userId}`,
        JSON.stringify(updated)
      );

      return updated;
    } catch (error) {
      console.error('Error updating programme:', error);
      return null;
    }
  }

  // Mark lesson as understood and start practice
  async startLessonPractice(
    userId: string,
    lessonId: string,
    duration: PracticeDuration
  ): Promise<PracticeSession> {
    try {
      const programme = await this.getProgramme(userId);
      if (!programme) throw new Error('Programme not found');

      // Update lesson
      const lesson = programme.lessons.find(l => l.id === lessonId);
      if (!lesson) throw new Error('Lesson not found');

      lesson.understood = true;
      lesson.completedAt = new Date().toISOString();

      // Calculate practice dates
      const startDate = new Date();
      let daysCount = 1;
      switch (duration) {
        case 'tonight': daysCount = 1; break;
        case '3_days': daysCount = 3; break;
        case '7_days': daysCount = 7; break;
        case '14_days': daysCount = 14; break;
        case '21_days': daysCount = 21; break;
      }

      const scheduledDays: string[] = [];
      for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        scheduledDays.push(date.toISOString().split('T')[0]);
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + daysCount - 1);

      // Create practice session
      const session: PracticeSession = {
        id: `practice_${Date.now()}`,
        lessonId,
        habitName: lesson.habitTask.name,
        duration,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        scheduledDays,
        completedDays: [],
        isActive: true,
      };

      // Save session
      const sessionsKey = `${ACTIVE_PRACTICE_KEY}_${userId}`;
      const sessionsJson = await AsyncStorage.getItem(sessionsKey);
      const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      sessions.push(session);
      await AsyncStorage.setItem(sessionsKey, JSON.stringify(sessions));

      // Create active habit from lesson
      try {
        // Check if habit already exists
        const existingHabitsResult = await HabitsService.getAll(userId);
        const existingHabits = existingHabitsResult.data || [];
        const habitExists = existingHabits.some(h => h.name === lesson.habitTask.name);

        if (!habitExists) {
          // Create the habit
          const habitData = {
            name: lesson.habitTask.name,
            description: lesson.habitTask.description,
            category: 'Sleep' as const,
            emoji: lesson.habitTask.icon,
            instruction: lesson.habitTask.description,
            total_days: daysCount,
            streak: 0,
            streak_goal: daysCount,
            reminder_enabled: true,
            reminder_time: '21:00', // Default to 9 PM
          };

          await HabitsService.create(habitData, userId);
          console.log('✅ Habit created successfully:', lesson.habitTask.name);
        } else {
          console.log('ℹ️ Habit already exists, skipping creation:', lesson.habitTask.name);
        }
      } catch (habitError) {
        // Log error but don't fail the entire operation
        console.error('Error creating habit:', habitError);
        // Practice session was still created successfully
      }

      // Update programme
      await this.updateProgramme(userId, {
        lessons: programme.lessons,
        currentLessonId: lessonId,
        currentWeek: lesson.weekNumber,
        startedAt: programme.startedAt || new Date().toISOString(),
      });

      return session;
    } catch (error) {
      console.error('Error starting lesson practice:', error);
      throw error;
    }
  }

  // Log daily check-in
  async logCheckIn(
    userId: string,
    sessionId: string,
    date: string,
    response: CheckInResponse,
    skipReason?: SkipReason,
    notes?: string
  ): Promise<void> {
    try {
      const sessionsKey = `${ACTIVE_PRACTICE_KEY}_${userId}`;
      const sessionsJson = await AsyncStorage.getItem(sessionsKey);
      if (!sessionsJson) return;

      const sessions: PracticeSession[] = JSON.parse(sessionsJson);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      // Add or update completed day
      const existingIndex = session.completedDays.findIndex(d => d.date === date);
      const checkIn = { date, response, skipReason, notes };

      if (existingIndex >= 0) {
        session.completedDays[existingIndex] = checkIn;
      } else {
        session.completedDays.push(checkIn);
      }

      await AsyncStorage.setItem(sessionsKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error logging check-in:', error);
    }
  }

  // Get active practice sessions
  async getActiveSessions(userId: string): Promise<PracticeSession[]> {
    try {
      const sessionsKey = `${ACTIVE_PRACTICE_KEY}_${userId}`;
      const sessionsJson = await AsyncStorage.getItem(sessionsKey);
      if (!sessionsJson) return [];

      const sessions: PracticeSession[] = JSON.parse(sessionsJson);
      const today = new Date().toISOString().split('T')[0];

      return sessions.filter(s => 
        s.isActive && s.scheduledDays.includes(today)
      );
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // Generate weekly review
  async generateWeeklyReview(
    userId: string,
    weekNumber: number
  ): Promise<WeeklyReview> {
    try {
      // Get practice session for the week
      const sessionsKey = `${ACTIVE_PRACTICE_KEY}_${userId}`;
      const sessionsJson = await AsyncStorage.getItem(sessionsKey);
      const sessions: PracticeSession[] = sessionsJson ? JSON.parse(sessionsJson) : [];

      const programme = await this.getProgramme(userId);
      const weekSession = sessions.find(s => {
        const lesson = programme?.lessons.find(l => l.id === s.lessonId);
        return lesson?.weekNumber === weekNumber;
      });

      // Calculate completion rate
      const completedCount = weekSession?.completedDays.filter(d => 
        d.response === 'completed'
      ).length || 0;

      // Get real sleep data for the week
      const weekStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekEndDate = new Date().toISOString().split('T')[0];
      
      const sleepLogsResult = await SleepService.getByDateRange(userId, weekStartDate, weekEndDate);
      const sleepLogs = sleepLogsResult.data || [];

      // Calculate average sleep duration for this week (0 if no data)
      let avgSleepDuration = 0;
      if (sleepLogs.length > 0) {
        const totalMinutes = sleepLogs.reduce((sum, log) => sum + (Number(log.hours) * 60), 0);
        avgSleepDuration = Math.round(totalMinutes / sleepLogs.length);
      }

      // Get target from programme or use 0 if not set
      const targetSleepDuration = programme?.lessons[0]?.habitTask?.targetHours 
        ? programme.lessons[0].habitTask.targetHours * 60 
        : 0;

      // Calculate bedtime variability (0 if insufficient data)
      let bedtimeVariability = 0;
      const bedtimes = sleepLogs.filter(log => log.bedtime).map(log => {
        const time = new Date(`2000-01-01T${log.bedtime}`);
        return time.getHours() * 60 + time.getMinutes();
      });
      
      if (bedtimes.length > 1) {
        const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
        bedtimeVariability = Math.round(
          bedtimes.reduce((sum, time) => sum + Math.abs(time - avgBedtime), 0) / bedtimes.length
        );
      }

      // Calculate quality with/without habit (based on actual sleep quality scores)
      const completedDays = weekSession?.completedDays.filter(d => d.response === 'completed') || [];
      const skippedDays = weekSession?.completedDays.filter(d => d.response === 'skipped') || [];
      
      // Map completed/skipped days to sleep quality
      const completedDates = new Set(completedDays.map(d => d.date));
      const skippedDates = new Set(skippedDays.map(d => d.date));
      
      // Calculate quality score (0-100) for days with habit vs without
      const logsWithHabit = sleepLogs.filter(log => completedDates.has(log.date));
      const logsWithoutHabit = sleepLogs.filter(log => skippedDates.has(log.date));
      
      const qualityWithHabit = logsWithHabit.length > 0
        ? Math.round(logsWithHabit.reduce((sum, log) => sum + (Number(log.quality) * 20), 0) / logsWithHabit.length)
        : 0;
        
      const qualityWithoutHabit = logsWithoutHabit.length > 0
        ? Math.round(logsWithoutHabit.reduce((sum, log) => sum + (Number(log.quality) * 20), 0) / logsWithoutHabit.length)
        : 0;

      // Assign badge based on performance
      let badgeEarned: string | undefined;
      if (completedCount >= 7) badgeEarned = 'Perfect Week Champion';
      else if (completedCount >= 5) badgeEarned = 'Consistency Star';
      else if (completedCount >= 3) badgeEarned = 'Early Starter';

      const review: WeeklyReview = {
        id: `review_${Date.now()}`,
        weekNumber,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        habitCompletionRate: completedCount,
        averageSleepDuration: avgSleepDuration,
        targetSleepDuration: targetSleepDuration,
        bedtimeVariability: bedtimeVariability,
        qualityWithHabit,
        qualityWithoutHabit,
        badgeEarned,
        completedAt: new Date().toISOString(),
      };

      // Save review
      const reviewsKey = `${WEEKLY_REVIEWS_KEY}_${userId}`;
      const reviewsJson = await AsyncStorage.getItem(reviewsKey);
      const reviews = reviewsJson ? JSON.parse(reviewsJson) : [];
      reviews.push(review);
      await AsyncStorage.setItem(reviewsKey, JSON.stringify(reviews));

      // Update programme
      if (programme) {
        programme.weeklyReviews.push(review);
        await this.updateProgramme(userId, { weeklyReviews: programme.weeklyReviews });
      }

      return review;
    } catch (error) {
      console.error('Error generating weekly review:', error);
      throw error;
    }
  }

  // Complete programme
  async completeProgramme(
    userId: string,
    feedbackRating?: number,
    feedbackText?: string
  ): Promise<Programme | null> {
    try {
      const programme = await this.getProgramme(userId);
      if (!programme) return null;

      // Calculate final metrics from real sleep data (last 7 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const sleepLogsResult = await SleepService.getByDateRange(userId, startDate, endDate);
      const recentLogs = sleepLogsResult.data || [];

      let avgSleepDuration = 0; // 0 if no data
      let bedtimeConsistency = 0; // 0 if no data
      let qualityScore = 0; // 0 if no data

      if (recentLogs.length > 0) {
        // Calculate average sleep duration
        const totalMinutes = recentLogs.reduce((sum, log) => sum + (Number(log.hours) * 60), 0);
        avgSleepDuration = Math.round(totalMinutes / recentLogs.length);

        // Calculate bedtime consistency
        const bedtimes = recentLogs.filter(log => log.bedtime).map(log => {
          const time = new Date(`2000-01-01T${log.bedtime}`);
          return time.getHours() * 60 + time.getMinutes();
        });
        
        if (bedtimes.length > 1) {
          const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
          bedtimeConsistency = Math.round(
            bedtimes.reduce((sum, time) => sum + Math.abs(time - avgBedtime), 0) / bedtimes.length
          );
        }

        // Calculate average quality
        qualityScore = recentLogs.reduce((sum, log) => sum + Number(log.quality || 0), 0) / recentLogs.length;
        qualityScore = Number(qualityScore.toFixed(1));
      }

      // Calculate improvement percentage (handle division by zero)
      const improvementPercentage = programme.baselineMetrics.averageSleepDuration > 0
        ? Math.round(
            ((avgSleepDuration - programme.baselineMetrics.averageSleepDuration) /
              programme.baselineMetrics.averageSleepDuration) * 100
          )
        : 0;

      return await this.updateProgramme(userId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        currentMetrics: {
          averageSleepDuration: avgSleepDuration,
          bedtimeConsistency,
          qualityScore,
          improvementPercentage,
        },
        feedbackRating,
        feedbackText,
      });
    } catch (error) {
      console.error('Error completing programme:', error);
      return null;
    }
  }

  // Pause programme
  async pauseProgramme(userId: string): Promise<void> {
    await this.updateProgramme(userId, {
      status: 'paused',
      pausedAt: new Date().toISOString(),
    });
  }

  // Resume programme
  async resumeProgramme(userId: string): Promise<void> {
    await this.updateProgramme(userId, {
      status: 'active',
      pausedAt: undefined,
    });
  }

  // Check if user should see 3-day skip warning
  checkConsecutiveSkips(session: PracticeSession): boolean {
    const last3Days = session.completedDays.slice(-3);
    return last3Days.length >= 3 && last3Days.every(d => d.response === 'skipped');
  }

  // Check if user can advance to next lesson early (80% completion)
  canAdvanceEarly(session: PracticeSession): boolean {
    const completedCount = session.completedDays.filter(d => 
      d.response === 'completed'
    ).length;
    const completionRate = completedCount / session.scheduledDays.length;
    return completionRate >= 0.8;
  }
}

export default new SleepProgrammeService();
