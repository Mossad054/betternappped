/**
 * Pattern Detection Service
 * 
 * Identifies patterns in user wellness data:
 * - Successful routines (activity sequences that consistently boost wellness)
 * - Cyclical patterns (day-of-week effects, time-of-month patterns)
 * - Warning signs (declining trends, sleep debt, burnout indicators)
 * - Peak performance times
 * 
 * Based on approach.md Phase 1 specifications
 */

export interface Pattern {
  id: string;
  type: 'routine' | 'cyclical' | 'warning' | 'success' | 'peak-time';
  name: string;
  description: string;
  confidence: number; // 0-1 score based on sample size and consistency
  evidence: Array<{
    date: string;
    metric: string;
    value: number;
    context?: string;
  }>;
  actionable: boolean;
  recommendation?: string;
  impact: 'positive' | 'negative' | 'neutral';
  frequency: number; // How often pattern occurs
}

export interface RoutinePattern extends Pattern {
  type: 'routine';
  activities: string[];
  sequenceLength: number;
  avgMoodImprovement: number;
  avgEnergyBoost: number;
  bestTimeOfDay?: string;
}

export interface CyclicalPattern extends Pattern {
  type: 'cyclical';
  cycle: 'day-of-week' | 'time-of-month';
  peak: string; // "Monday", "Week 1", etc.
  trough: string;
  peakValue: number;
  troughValue: number;
  metric: string;
}

export interface WarningPattern extends Pattern {
  type: 'warning';
  severity: 'low' | 'medium' | 'high';
  metric: string;
  trend: 'declining' | 'volatile' | 'depleted';
  daysAffected: number;
  threshold: number;
  currentValue: number;
}

export class PatternsService {
  private static readonly MIN_PATTERN_OCCURRENCES = 3;
  private static readonly CONFIDENCE_THRESHOLD = 0.6;

  /**
   * Detect all patterns for a user
   */
  static async detectPatterns(
    userId: string,
    lookbackDays: number = 30
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    try {
      // Detect different pattern types in parallel
      const [routines, cyclical, warnings] = await Promise.all([
        this.detectRoutines(userId, lookbackDays),
        this.detectCyclicalPatterns(userId, lookbackDays),
        this.detectWarningPatterns(userId, lookbackDays)
      ]);

      patterns.push(...routines, ...cyclical, ...warnings);

      // Filter by confidence and sort by importance
      const filteredPatterns = patterns
        .filter(p => p.confidence >= this.CONFIDENCE_THRESHOLD)
        .sort((a, b) => {
          // Sort by: warnings first, then by confidence
          if (a.type === 'warning' && b.type !== 'warning') return -1;
          if (a.type !== 'warning' && b.type === 'warning') return 1;
          return b.confidence - a.confidence;
        });

      return filteredPatterns.slice(0, 10); // Top 10 patterns
    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }

  /**
   * Detect successful routines (activity sequences that boost wellness)
   */
  private static async detectRoutines(
    userId: string,
    lookbackDays: number
  ): Promise<RoutinePattern[]> {
    const routines: RoutinePattern[] = [];

    try {
      // Import services
      const { ActivitiesService } = await import('../activities.service');
      const { MoodsService } = await import('../moods.service');

      // Fetch activities and wellness data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [activitiesResult, moodsResult] = await Promise.all([
        ActivitiesService.getByDateRange(userId, startDateStr, endDate),
        MoodsService.getByDateRange(userId, startDateStr, endDate)
      ]);

      if (!activitiesResult.data || !moodsResult.data) {
        return routines;
      }

      // Group activities by date
      const activitiesByDate = new Map<string, string[]>();
      activitiesResult.data.forEach(activity => {
        if (!activitiesByDate.has(activity.date)) {
          activitiesByDate.set(activity.date, []);
        }
        activitiesByDate.get(activity.date)!.push(activity.name);
      });

      // Create mood map
      const moodMap = new Map(moodsResult.data.map(m => [m.date, m.score]));

      // Find common activity combinations
      const sequenceMap = new Map<string, { dates: string[]; moodDeltas: number[] }>();

      activitiesByDate.forEach((activities, date) => {
        if (activities.length >= 2) {
          // Sort activities to create consistent sequence key
          const sequence = activities.sort().join(' → ');
          
          if (!sequenceMap.has(sequence)) {
            sequenceMap.set(sequence, { dates: [], moodDeltas: [] });
          }

          const sequenceData = sequenceMap.get(sequence)!;
          sequenceData.dates.push(date);

          // Calculate mood improvement (compare to previous day)
          const currentMood = moodMap.get(date);
          const prevDate = new Date(date);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevMood = moodMap.get(prevDate.toISOString().split('T')[0]);

          if (currentMood && prevMood) {
            sequenceData.moodDeltas.push(currentMood - prevMood);
          }
        }
      });

      // Filter to sequences that occur at least MIN_PATTERN_OCCURRENCES times
      sequenceMap.forEach((data, sequence) => {
        if (data.dates.length >= this.MIN_PATTERN_OCCURRENCES && data.moodDeltas.length > 0) {
          const activities = sequence.split(' → ');
          const avgMoodImprovement = data.moodDeltas.reduce((sum, d) => sum + d, 0) / data.moodDeltas.length;
          
          // Only include if mood improves
          if (avgMoodImprovement > 0.3) {
            const variance = this.calculateVariance(data.moodDeltas);
            const confidence = this.calculateConfidence(data.dates.length, lookbackDays / 7, variance);

            routines.push({
              id: `routine-${Date.now()}-${Math.random()}`,
              type: 'routine',
              name: `${activities.slice(0, 2).join(' + ')} routine`,
              description: `Doing ${activities.join(', ')} together consistently improves your mood.`,
              confidence,
              evidence: data.dates.slice(0, 5).map(date => ({
                date,
                metric: 'mood',
                value: moodMap.get(date) || 0,
                context: sequence
              })),
              actionable: true,
              recommendation: `Try this routine ${Math.min(data.dates.length, 3)}x per week for best results.`,
              impact: 'positive',
              frequency: data.dates.length,
              activities,
              sequenceLength: activities.length,
              avgMoodImprovement,
              avgEnergyBoost: 0 // Would need energy tracking data
            });
          }
        }
      });
    } catch (error) {
      console.error('Error detecting routines:', error);
    }

    return routines;
  }

  /**
   * Calculate variance of an array
   */
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }

  /**
   * Detect cyclical patterns (day-of-week, time-of-month effects)
   */
  private static async detectCyclicalPatterns(
    userId: string,
    lookbackDays: number
  ): Promise<CyclicalPattern[]> {
    const patterns: CyclicalPattern[] = [];

    try {
      // Import services
      const { MoodsService } = await import('../moods.service');
      const { SleepService } = await import('../sleep.service');
      const { ProductivityService } = await import('../productivity.service');

      // Fetch wellness data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [moodsResult, sleepResult, productivityResult] = await Promise.all([
        MoodsService.getByDateRange(userId, startDateStr, endDate),
        SleepService.getByDateRange(userId, startDateStr, endDate),
        ProductivityService.getByDateRange(userId, startDateStr, endDate)
      ]);

      // Analyze mood by day of week
      if (moodsResult.data && moodsResult.data.length >= 14) {
        const moodPattern = await this.analyzeDayOfWeekMetric(moodsResult.data, 'mood');
        if (moodPattern && moodPattern.hasSignificantPattern) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          patterns.push({
            id: `cyclical-mood-${Date.now()}`,
            type: 'cyclical',
            name: 'Weekly Mood Pattern',
            description: `Your mood tends to be ${moodPattern.bestDay === moodPattern.worstDay ? 'consistent' : `highest on ${dayNames[parseInt(moodPattern.bestDay)]}s and lowest on ${dayNames[parseInt(moodPattern.worstDay)]}s`}.`,
            confidence: 0.7,
            evidence: Object.entries(moodPattern.dayAverages).map(([day, value]) => ({
              date: dayNames[parseInt(day)],
              metric: 'mood',
              value
            })),
            actionable: true,
            recommendation: moodPattern.bestDay !== moodPattern.worstDay 
              ? `Schedule important tasks on ${dayNames[parseInt(moodPattern.bestDay)]}s when your mood is typically higher.`
              : 'Your mood is consistent throughout the week.',
            impact: 'neutral',
            frequency: Math.floor(lookbackDays / 7),
            cycle: 'day-of-week',
            peak: dayNames[parseInt(moodPattern.bestDay)],
            trough: dayNames[parseInt(moodPattern.worstDay)],
            peakValue: moodPattern.dayAverages[moodPattern.bestDay],
            troughValue: moodPattern.dayAverages[moodPattern.worstDay],
            metric: 'mood'
          });
        }
      }

      // Analyze sleep by day of week
      if (sleepResult.data && sleepResult.data.length >= 14) {
        const sleepPattern = await this.analyzeDayOfWeekMetric(
          sleepResult.data.map(s => ({ date: s.date, value: Number(s.hours) })),
          'sleep'
        );
        if (sleepPattern && sleepPattern.hasSignificantPattern) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const peakDay = parseInt(sleepPattern.bestDay);
          const troughDay = parseInt(sleepPattern.worstDay);
          
          if (peakDay !== troughDay) {
            patterns.push({
              id: `cyclical-sleep-${Date.now()}`,
              type: 'cyclical',
              name: 'Weekly Sleep Pattern',
              description: `You sleep ${sleepPattern.dayAverages[sleepPattern.bestDay].toFixed(1)}h on ${dayNames[peakDay]}s but only ${sleepPattern.dayAverages[sleepPattern.worstDay].toFixed(1)}h on ${dayNames[troughDay]}s.`,
              confidence: 0.7,
              evidence: [],
              actionable: true,
              recommendation: `Try to get more consistent sleep, especially on ${dayNames[troughDay]}s.`,
              impact: sleepPattern.dayAverages[sleepPattern.worstDay] < 6.5 ? 'negative' : 'neutral',
              frequency: Math.floor(lookbackDays / 7),
              cycle: 'day-of-week',
              peak: dayNames[peakDay],
              trough: dayNames[troughDay],
              peakValue: sleepPattern.dayAverages[sleepPattern.bestDay],
              troughValue: sleepPattern.dayAverages[sleepPattern.worstDay],
              metric: 'sleep'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error detecting cyclical patterns:', error);
    }

    return patterns;
  }

  /**
   * Analyze day-of-week pattern for a metric
   */
  private static async analyzeDayOfWeekMetric(
    data: Array<{ date: string; value?: number; score?: number }>,
    metricType: string
  ): Promise<{
    dayAverages: { [day: string]: number };
    bestDay: string;
    worstDay: string;
    variance: number;
    hasSignificantPattern: boolean;
  } | null> {
    try {
      // Group by day of week (0 = Sunday, 6 = Saturday)
      const dayGroups: { [key: number]: number[] } = {};

      data.forEach(entry => {
        const value = entry.value !== undefined ? entry.value : (entry.score || 0);
        const date = new Date(entry.date);
        const dayOfWeek = date.getDay();

        if (!dayGroups[dayOfWeek]) {
          dayGroups[dayOfWeek] = [];
        }
        dayGroups[dayOfWeek].push(value);
      });

      // Calculate averages for each day
      const dayAverages: { [day: string]: number } = {};
      Object.entries(dayGroups).forEach(([day, values]) => {
        if (values.length >= 2) { // Need at least 2 occurrences
          dayAverages[day] = values.reduce((sum, v) => sum + v, 0) / values.length;
        }
      });

      if (Object.keys(dayAverages).length < 3) {
        return null; // Not enough data
      }

      // Find best and worst days
      const sortedDays = Object.entries(dayAverages).sort((a, b) => b[1] - a[1]);
      const bestDay = sortedDays[0][0];
      const worstDay = sortedDays[sortedDays.length - 1][0];

      // Calculate variance to determine if pattern is significant
      const allAverages = Object.values(dayAverages);
      const mean = allAverages.reduce((sum, v) => sum + v, 0) / allAverages.length;
      const variance = this.calculateVariance(allAverages);
      
      // Pattern is significant if best day is at least 20% better than worst day
      const hasSignificantPattern = dayAverages[bestDay] > dayAverages[worstDay] * 1.2;

      return {
        dayAverages,
        bestDay,
        worstDay,
        variance,
        hasSignificantPattern
      };
    } catch (error) {
      console.error('Error analyzing day-of-week pattern:', error);
      return null;
    }
  }

  /**
   * Detect warning patterns (declining trends, sleep debt, burnout)
   */
  private static async detectWarningPatterns(
    userId: string,
    lookbackDays: number
  ): Promise<WarningPattern[]> {
    const warnings: WarningPattern[] = [];

    try {
      // Import services
      const { MoodsService } = await import('../moods.service');
      const { SleepService } = await import('../sleep.service');
      const { HabitsService } = await import('../habits.service');

      // Fetch recent wellness data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lookbackDays);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [moodsResult, sleepResult, habitsResult] = await Promise.all([
        MoodsService.getByDateRange(userId, startDateStr, endDate),
        SleepService.getByDateRange(userId, startDateStr, endDate),
        HabitsService.getAll(userId)
      ]);

      // Check for declining mood trend
      if (moodsResult.data && moodsResult.data.length >= 7) {
        const recentMoods = moodsResult.data.slice(-7);
        const olderMoods = moodsResult.data.slice(-14, -7);

        if (olderMoods.length > 0) {
          const recentAvg = recentMoods.reduce((sum, m) => sum + m.score, 0) / recentMoods.length;
          const olderAvg = olderMoods.reduce((sum, m) => sum + m.score, 0) / olderMoods.length;

          if (recentAvg < olderAvg - 0.5 && recentAvg < 3.5) {
            warnings.push({
              id: `warning-mood-${Date.now()}`,
              type: 'warning',
              name: 'Declining Mood Trend',
              description: `Your mood has dropped from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)} over the past week.`,
              confidence: 0.8,
              evidence: recentMoods.map(m => ({
                date: m.date,
                metric: 'mood',
                value: m.score
              })),
              actionable: true,
              recommendation: 'Consider reaching out to someone or trying stress-relief activities.',
              impact: 'negative',
              frequency: 1,
              severity: recentAvg < 2.5 ? 'high' : recentAvg < 3 ? 'medium' : 'low',
              metric: 'mood',
              trend: 'declining',
              daysAffected: 7,
              threshold: 3.5,
              currentValue: recentAvg
            });
          }
        }
      }

      // Check for sleep debt accumulation
      if (sleepResult.data && sleepResult.data.length >= 7) {
        const recentSleep = sleepResult.data.slice(-7);
        const avgSleep = recentSleep.reduce((sum, s) => sum + Number(s.hours), 0) / recentSleep.length;
        const lowSleepDays = recentSleep.filter(s => Number(s.hours) < 6.5).length;

        if (avgSleep < 6.5 || lowSleepDays >= 4) {
          const totalDebt = recentSleep.reduce((sum, s) => {
            const hours = Number(s.hours);
            return sum + (hours < 7.5 ? 7.5 - hours : 0);
          }, 0);

          warnings.push({
            id: `warning-sleep-${Date.now()}`,
            type: 'warning',
            name: 'Sleep Debt Accumulating',
            description: `You're averaging ${avgSleep.toFixed(1)}h of sleep with ${totalDebt.toFixed(1)}h accumulated debt.`,
            confidence: 0.9,
            evidence: recentSleep.map(s => ({
              date: s.date,
              metric: 'sleep',
              value: Number(s.hours)
            })),
            actionable: true,
            recommendation: 'Prioritize 7-8 hours of sleep tonight to start recovering.',
            impact: 'negative',
            frequency: lowSleepDays,
            severity: totalDebt > 10 ? 'high' : totalDebt > 5 ? 'medium' : 'low',
            metric: 'sleep',
            trend: 'depleted',
            daysAffected: lowSleepDays,
            threshold: 7.5,
            currentValue: avgSleep
          });
        }
      }

      // Check for habit streak breaks
      if (habitsResult.data && habitsResult.data.length > 0) {
        const brokenStreaks = habitsResult.data.filter(h => 
          (h.best_streak || 0) > 7 && (h.streak || 0) === 0
        );

        if (brokenStreaks.length > 0) {
          warnings.push({
            id: `warning-habits-${Date.now()}`,
            type: 'warning',
            name: 'Habit Streaks Broken',
            description: `${brokenStreaks.length} habit streak${brokenStreaks.length > 1 ? 's' : ''} broken recently.`,
            confidence: 0.7,
            evidence: brokenStreaks.slice(0, 3).map(h => ({
              date: endDate,
              metric: 'habit',
              value: h.streak || 0,
              context: h.name
            })),
            actionable: true,
            recommendation: 'Start small - focus on rebuilding one habit at a time.',
            impact: 'negative',
            frequency: brokenStreaks.length,
            severity: brokenStreaks.length > 2 ? 'medium' : 'low',
            metric: 'habits',
            trend: 'declining',
            daysAffected: 1,
            threshold: 1,
            currentValue: 0
          });
        }
      }
    } catch (error) {
      console.error('Error detecting warning patterns:', error);
    }

    return warnings;
  }

  /**
   * Analyze day-of-week patterns for a metric
   */
  static async analyzeDayOfWeekPattern(
    userId: string,
    metricType: 'mood' | 'sleep' | 'productivity' | 'clarity',
    lookbackDays: number = 30
  ): Promise<{
    dayAverages: { [day: string]: number };
    bestDay: string;
    worstDay: string;
    variance: number;
    hasSignificantPattern: boolean;
  } | null> {
    try {
      // TODO: Implement actual analysis
      // Will aggregate metric by day of week and identify patterns
      return null;
    } catch (error) {
      console.error('Error analyzing day-of-week pattern:', error);
      return null;
    }
  }

  /**
   * Detect sleep debt accumulation
   */
  static async detectSleepDebt(
    userId: string,
    daysToCheck: number = 7
  ): Promise<{
    totalDebt: number; // Hours of sleep debt
    consecutiveLowSleepDays: number;
    avgSleepThisWeek: number;
    avgSleepNeeded: number;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    recommendation: string;
  } | null> {
    try {
      // TODO: Implement actual sleep debt calculation
      return null;
    } catch (error) {
      console.error('Error detecting sleep debt:', error);
      return null;
    }
  }

  /**
   * Detect burnout warning signs
   */
  static async detectBurnoutRisk(
    userId: string,
    lookbackDays: number = 14
  ): Promise<{
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    indicators: string[];
    score: number; // 0-100
    recommendation: string;
  } | null> {
    try {
      // TODO: Implement burnout detection based on:
      // - Declining mood trend
      // - Reduced activity variety
      // - Poor sleep quality
      // - Low productivity
      // - Missed habits
      return null;
    } catch (error) {
      console.error('Error detecting burnout risk:', error);
      return null;
    }
  }

  /**
   * Find optimal time windows for activities
   */
  static async findPeakPerformanceTimes(
    userId: string,
    activityCategory: string,
    lookbackDays: number = 30
  ): Promise<{
    morning: { score: number; count: number };
    afternoon: { score: number; count: number };
    evening: { score: number; count: number };
    bestTime: 'morning' | 'afternoon' | 'evening';
    confidence: number;
  } | null> {
    try {
      // TODO: Implement time-of-day analysis
      return null;
    } catch (error) {
      console.error('Error finding peak performance times:', error);
      return null;
    }
  }

  /**
   * Calculate pattern confidence based on sample size and consistency
   */
  private static calculateConfidence(
    occurrences: number,
    expectedOccurrences: number,
    variance: number
  ): number {
    // Sample size component (0-0.5)
    const sampleScore = Math.min(occurrences / expectedOccurrences, 1) * 0.5;

    // Consistency component (0-0.5) - lower variance = higher confidence
    const consistencyScore = Math.max(0, 1 - variance) * 0.5;

    return Math.min(1, sampleScore + consistencyScore);
  }

  /**
   * Generate actionable recommendation from pattern
   */
  static generatePatternRecommendation(pattern: Pattern): string {
    switch (pattern.type) {
      case 'routine':
        if (pattern.impact === 'positive') {
          return `This routine works well for you! Try to maintain it ${pattern.frequency}x per week.`;
        }
        return `This routine might need adjustment. Consider modifying or replacing it.`;

      case 'cyclical':
        const cyclical = pattern as CyclicalPattern;
        if (cyclical.peakValue > cyclical.troughValue * 1.2) {
          return `Your ${cyclical.metric} peaks on ${cyclical.peak}. Schedule important tasks then!`;
        }
        return `Your ${cyclical.metric} dips on ${cyclical.trough}. Plan lighter activities on these days.`;

      case 'warning':
        const warning = pattern as WarningPattern;
        if (warning.severity === 'high') {
          return `⚠️ ${warning.description} Take immediate action to address this.`;
        }
        return `Pay attention to your ${warning.metric}. ${warning.description}`;

      case 'success':
        return `✨ ${pattern.description} Keep up this positive trend!`;

      default:
        return pattern.recommendation || pattern.description;
    }
  }

  /**
   * Get summary of all detected patterns
   */
  static summarizePatterns(patterns: Pattern[]): {
    totalPatterns: number;
    positivePatterns: number;
    warningPatterns: number;
    topInsight: string;
    actionableCount: number;
  } {
    const positivePatterns = patterns.filter(p => p.impact === 'positive').length;
    const warningPatterns = patterns.filter(p => p.type === 'warning').length;
    const actionableCount = patterns.filter(p => p.actionable).length;

    // Generate top insight
    let topInsight = 'Continue tracking to discover patterns.';
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      topInsight = this.generatePatternRecommendation(topPattern);
    }

    return {
      totalPatterns: patterns.length,
      positivePatterns,
      warningPatterns,
      topInsight,
      actionableCount
    };
  }
}
