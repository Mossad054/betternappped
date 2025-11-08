/**
 * Advanced Sleep Analytics Service
 * 
 * Provides comprehensive data-driven insights, pattern detection,
 * correlations, and personalized recommendations for sleep wellness.
 */

import { SleepService } from './sleep.service';

// ===========================
// Type Definitions
// ===========================

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  quality: number; // 1-5 scale
  bedtime: string; // HH:mm format
  wake_time: string; // HH:mm format
  waking_feeling?: string;
  created_at?: string;
  mood?: string;
  notes?: string;
  tags?: string[];
}

export interface AnalyticsPeriod {
  days: number;
  label: string;
}

export interface SleepPattern {
  type: 'weekday_vs_weekend' | 'quality_trend' | 'duration_trend' | 'consistency' | 'optimal_window';
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
  title: string;
  description: string;
  dataPoints: any;
  confidence: number; // 0-100
}

export interface Correlation {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  description: string;
  recommendation: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'duration' | 'quality' | 'consistency' | 'environment' | 'habits';
  title: string;
  description: string;
  rationale: string;
  actionSteps: string[];
  estimatedImpact: string;
  relatedHabits?: string[];
}

export interface SleepMetrics {
  averageDuration: number;
  averageQuality: number;
  consistencyScore: number; // 0-100
  sleepDebt: number; // hours
  optimalBedtimeWindow: { start: string; end: string };
  qualityTrend: 'improving' | 'declining' | 'stable';
  durationTrend: 'improving' | 'declining' | 'stable';
}

export interface WeekdayComparison {
  weekday: { avgHours: number; avgQuality: number; count: number };
  weekend: { avgHours: number; avgQuality: number; count: number };
  difference: { hours: number; quality: number };
  analysis: string;
}

export interface DetailedInsights {
  metrics: SleepMetrics;
  patterns: SleepPattern[];
  correlations: Correlation[];
  recommendations: Recommendation[];
  weekdayComparison: WeekdayComparison | null;
  predictedOptimalBedtime: string;
  sleepEfficiencyScore: number; // 0-100
}

// ===========================
// Analytics Engine
// ===========================

export class SleepAnalyticsService {
  /**
   * Generate comprehensive insights from sleep data
   */
  static async generateDetailedInsights(
    userId: string,
    days: number = 30
  ): Promise<DetailedInsights> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: logs } = await SleepService.getByDateRange(userId, startDate, endDate);

    if (!logs || logs.length < 3) {
      return this.getDefaultInsights();
    }

    const metrics = this.calculateMetrics(logs);
    const patterns = this.detectPatterns(logs);
    const correlations = await this.analyzeCorrelations(userId, logs);
    const recommendations = this.generateRecommendations(logs, metrics, patterns, correlations);
    const weekdayComparison = this.compareWeekdayWeekend(logs);
    const predictedOptimalBedtime = this.predictOptimalBedtime(logs);
    const sleepEfficiencyScore = this.calculateSleepEfficiency(logs, metrics);

    return {
      metrics,
      patterns,
      correlations,
      recommendations,
      weekdayComparison,
      predictedOptimalBedtime,
      sleepEfficiencyScore,
    };
  }

  /**
   * Calculate comprehensive sleep metrics
   */
  private static calculateMetrics(logs: SleepLog[]): SleepMetrics {
    const validLogs = logs.filter(log => log.hours && log.quality);
    
    if (validLogs.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        consistencyScore: 0,
        sleepDebt: 0,
        optimalBedtimeWindow: { start: '22:00', end: '23:00' },
        qualityTrend: 'stable',
        durationTrend: 'stable',
      };
    }

    // Average duration
    const avgDuration = validLogs.reduce((sum, log) => sum + log.hours, 0) / validLogs.length;

    // Average quality
    const avgQuality = validLogs.reduce((sum, log) => sum + log.quality, 0) / validLogs.length;

    // Consistency score (based on bedtime variance)
    const consistencyScore = this.calculateConsistencyScore(validLogs);

    // Sleep debt (assuming 7.5h optimal)
    const optimalHours = 7.5;
    const totalDebt = validLogs.reduce((debt, log) => {
      return debt + Math.max(0, optimalHours - log.hours);
    }, 0);
    const sleepDebt = totalDebt;

    // Optimal bedtime window (based on highest quality nights)
    const optimalBedtimeWindow = this.findOptimalBedtimeWindow(validLogs);

    // Trends
    const qualityTrend = this.analyzeTrend(validLogs.map(l => l.quality));
    const durationTrend = this.analyzeTrend(validLogs.map(l => l.hours));

    return {
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      consistencyScore,
      sleepDebt,
      optimalBedtimeWindow,
      qualityTrend,
      durationTrend,
    };
  }

  /**
   * Calculate consistency score (0-100) based on bedtime variance
   */
  private static calculateConsistencyScore(logs: SleepLog[]): number {
    const bedtimeMinutes = logs.map(log => {
      const [hour, min] = log.bedtime.split(':').map(Number);
      return hour * 60 + min;
    });

    const avgBedtime = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const variance =
      bedtimeMinutes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) /
      bedtimeMinutes.length;
    const stdDev = Math.sqrt(variance);

    // Convert to 0-100 score (lower variance = higher score)
    // Variance of 0 = 100, variance of 120 (2 hours) = 0
    const score = Math.max(0, 100 - (stdDev / 120) * 100);
    return score;
  }

  /**
   * Find optimal bedtime window based on quality data
   */
  private static findOptimalBedtimeWindow(logs: SleepLog[]): { start: string; end: string } {
    // Group logs by bedtime hour
    const hourGroups: { [hour: number]: { quality: number[]; count: number } } = {};

    logs.forEach(log => {
      const hour = parseInt(log.bedtime.split(':')[0]);
      if (!hourGroups[hour]) {
        hourGroups[hour] = { quality: [], count: 0 };
      }
      hourGroups[hour].quality.push(log.quality);
      hourGroups[hour].count++;
    });

    // Find hour with highest average quality (min 3 samples)
    let bestHour = 22; // Default
    let bestQuality = 0;

    Object.keys(hourGroups).forEach(hourStr => {
      const hour = parseInt(hourStr);
      const group = hourGroups[hour];
      if (group.count >= 3) {
        const avgQuality = group.quality.reduce((a, b) => a + b, 0) / group.count;
        if (avgQuality > bestQuality) {
          bestQuality = avgQuality;
          bestHour = hour;
        }
      }
    });

    return {
      start: `${bestHour.toString().padStart(2, '0')}:00`,
      end: `${((bestHour + 1) % 24).toString().padStart(2, '0')}:00`,
    };
  }

  /**
   * Analyze trend direction
   */
  private static analyzeTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 7) return 'stable';

    const recentAvg = values.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const previousAvg = values.slice(-14, -7).reduce((a, b) => a + b, 0) / Math.min(7, values.length - 7);

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  /**
   * Detect sleep patterns
   */
  private static detectPatterns(logs: SleepLog[]): SleepPattern[] {
    const patterns: SleepPattern[] = [];

    // Pattern 1: Weekday vs Weekend
    const weekdayWeekendPattern = this.detectWeekdayWeekendPattern(logs);
    if (weekdayWeekendPattern) patterns.push(weekdayWeekendPattern);

    // Pattern 2: Quality decline over week
    const qualityDeclinePattern = this.detectQualityDeclinePattern(logs);
    if (qualityDeclinePattern) patterns.push(qualityDeclinePattern);

    // Pattern 3: Late bedtime cascade
    const lateBedtimePattern = this.detectLateBedtimePattern(logs);
    if (lateBedtimePattern) patterns.push(lateBedtimePattern);

    // Pattern 4: Optimal window consistency
    const optimalWindowPattern = this.detectOptimalWindowPattern(logs);
    if (optimalWindowPattern) patterns.push(optimalWindowPattern);

    // Pattern 5: Duration-Quality correlation
    const durationQualityPattern = this.detectDurationQualityCorrelation(logs);
    if (durationQualityPattern) patterns.push(durationQualityPattern);

    return patterns;
  }

  private static detectWeekdayWeekendPattern(logs: SleepLog[]): SleepPattern | null {
    const weekdayLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day !== 0 && day !== 6;
    });

    const weekendLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day === 0 || day === 6;
    });

    if (weekdayLogs.length < 5 || weekendLogs.length < 2) return null;

    const weekdayAvg = weekdayLogs.reduce((sum, log) => sum + log.hours, 0) / weekdayLogs.length;
    const weekendAvg = weekendLogs.reduce((sum, log) => sum + log.hours, 0) / weekendLogs.length;
    const difference = Math.abs(weekendAvg - weekdayAvg);

    if (difference < 1) return null;

    const severity = difference > 2 ? 'warning' : difference > 1.5 ? 'neutral' : 'positive';

    return {
      type: 'weekday_vs_weekend',
      severity,
      title: 'Weekday vs Weekend Sleep Pattern',
      description: `You sleep ${difference.toFixed(1)} hours ${weekendAvg > weekdayAvg ? 'more' : 'less'} on weekends (${weekendAvg.toFixed(1)}h) compared to weekdays (${weekdayAvg.toFixed(1)}h). This indicates potential sleep debt accumulation during the week.`,
      dataPoints: { weekdayAvg, weekendAvg, difference },
      confidence: 85,
    };
  }

  private static detectQualityDeclinePattern(logs: SleepLog[]): SleepPattern | null {
    if (logs.length < 7) return null;

    const recentWeek = logs.slice(-7);
    const qualities = recentWeek.map(log => log.quality);

    // Check if quality declines from start to end of week
    const startAvg = qualities.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const endAvg = qualities.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const decline = startAvg - endAvg;

    if (decline < 0.5) return null;

    return {
      type: 'quality_trend',
      severity: decline > 1 ? 'warning' : 'neutral',
      title: 'Weekly Quality Decline Pattern',
      description: `Your sleep quality tends to decline as the week progresses. Quality drops from ${startAvg.toFixed(1)}/5 at week start to ${endAvg.toFixed(1)}/5 by week end. This suggests accumulated fatigue or inconsistent sleep hygiene.`,
      dataPoints: { startAvg, endAvg, decline },
      confidence: 70,
    };
  }

  private static detectLateBedtimePattern(logs: SleepLog[]): SleepPattern | null {
    if (logs.length < 5) return null;

    const lateBedtimes = logs.filter(log => {
      const hour = parseInt(log.bedtime.split(':')[0]);
      return hour >= 0 && hour < 6 || hour >= 23;
    });

    const percentage = (lateBedtimes.length / logs.length) * 100;

    if (percentage < 40) return null;

    const avgQualityLate = lateBedtimes.reduce((sum, log) => sum + log.quality, 0) / lateBedtimes.length;
    const avgQualityEarly = logs.filter(log => !lateBedtimes.includes(log))
      .reduce((sum, log) => sum + log.quality, 0) / (logs.length - lateBedtimes.length);

    return {
      type: 'consistency',
      severity: avgQualityLate < avgQualityEarly ? 'warning' : 'neutral',
      title: 'Late Bedtime Pattern',
      description: `You go to bed late (after 11 PM) ${percentage.toFixed(0)}% of the time. Late bedtimes correlate with ${avgQualityLate < avgQualityEarly ? 'lower' : 'similar'} sleep quality (${avgQualityLate.toFixed(1)}/5 vs ${avgQualityEarly.toFixed(1)}/5 for earlier bedtimes).`,
      dataPoints: { percentage, avgQualityLate, avgQualityEarly },
      confidence: 75,
    };
  }

  private static detectOptimalWindowPattern(logs: SleepLog[]): SleepPattern | null {
    if (logs.length < 10) return null;

    const optimalWindow = this.findOptimalBedtimeWindow(logs);
    const [optimalHour] = optimalWindow.start.split(':').map(Number);

    const inWindowLogs = logs.filter(log => {
      const hour = parseInt(log.bedtime.split(':')[0]);
      return hour === optimalHour;
    });

    if (inWindowLogs.length < 3) return null;

    const inWindowQuality = inWindowLogs.reduce((sum, log) => sum + log.quality, 0) / inWindowLogs.length;
    const overallQuality = logs.reduce((sum, log) => sum + log.quality, 0) / logs.length;
    const improvement = ((inWindowQuality - overallQuality) / overallQuality) * 100;

    if (improvement < 5) return null;

    return {
      type: 'optimal_window',
      severity: 'positive',
      title: 'Optimal Bedtime Window Identified',
      description: `Sleeping around ${optimalWindow.start} results in ${improvement.toFixed(0)}% better sleep quality (${inWindowQuality.toFixed(1)}/5 vs ${overallQuality.toFixed(1)}/5 overall). You've hit this window ${inWindowLogs.length} times.`,
      dataPoints: { optimalWindow, inWindowQuality, overallQuality, improvement, count: inWindowLogs.length },
      confidence: 80,
    };
  }

  private static detectDurationQualityCorrelation(logs: SleepLog[]): SleepPattern | null {
    if (logs.length < 10) return null;

    // Group by duration ranges
    const short = logs.filter(log => log.hours < 6.5);
    const optimal = logs.filter(log => log.hours >= 6.5 && log.hours <= 8.5);
    const long = logs.filter(log => log.hours > 8.5);

    if (optimal.length < 3) return null;

    const optimalQuality = optimal.reduce((sum, log) => sum + log.quality, 0) / optimal.length;
    const shortQuality = short.length > 0 ? short.reduce((sum, log) => sum + log.quality, 0) / short.length : 0;
    const longQuality = long.length > 0 ? long.reduce((sum, log) => sum + log.quality, 0) / long.length : 0;

    const hasPattern = (short.length > 0 && shortQuality < optimalQuality - 0.3) ||
                       (long.length > 0 && longQuality < optimalQuality - 0.3);

    if (!hasPattern) return null;

    return {
      type: 'duration_trend',
      severity: 'neutral',
      title: 'Duration Sweet Spot Found',
      description: `Your optimal sleep duration appears to be 6.5-8.5 hours (quality: ${optimalQuality.toFixed(1)}/5). ${short.length > 0 ? `Sleeping less results in ${shortQuality.toFixed(1)}/5 quality.` : ''} ${long.length > 0 ? `Sleeping more than 8.5h results in ${longQuality.toFixed(1)}/5 quality.` : ''}`,
      dataPoints: { optimalQuality, shortQuality, longQuality, counts: { short: short.length, optimal: optimal.length, long: long.length } },
      confidence: 75,
    };
  }

  /**
   * Analyze correlations between sleep and other factors
   */
  private static async analyzeCorrelations(userId: string, logs: SleepLog[]): Promise<Correlation[]> {
    const correlations: Correlation[] = [];

    // Try to get habit data to find correlations
    try {
      // Correlation: Bedtime consistency
      const consistencyCorr = this.analyzeConsistencyCorrelation(logs);
      if (consistencyCorr) correlations.push(consistencyCorr);

      // Correlation: Weekend effect
      const weekendCorr = this.analyzeWeekendCorrelation(logs);
      if (weekendCorr) correlations.push(weekendCorr);

      // Correlation: Duration and quality
      const durationCorr = this.analyzeDurationQualityCorrelation(logs);
      if (durationCorr) correlations.push(durationCorr);

    } catch (error) {
      console.error('Error analyzing correlations:', error);
    }

    return correlations;
  }

  private static analyzeConsistencyCorrelation(logs: SleepLog[]): Correlation | null {
    if (logs.length < 7) return null;

    // Calculate variance for each week
    const weeks = Math.floor(logs.length / 7);
    let consistentWeeks = 0;
    let inconsistentWeeks = 0;
    let consistentAvgQuality = 0;
    let inconsistentAvgQuality = 0;

    for (let i = 0; i < weeks; i++) {
      const weekLogs = logs.slice(i * 7, (i + 1) * 7);
      const variance = this.calculateBedtimeVariance(weekLogs);
      const avgQuality = weekLogs.reduce((sum, log) => sum + log.quality, 0) / weekLogs.length;

      if (variance < 60) { // Less than 1 hour variance
        consistentWeeks++;
        consistentAvgQuality += avgQuality;
      } else {
        inconsistentWeeks++;
        inconsistentAvgQuality += avgQuality;
      }
    }

    if (consistentWeeks === 0 || inconsistentWeeks === 0) return null;

    consistentAvgQuality /= consistentWeeks;
    inconsistentAvgQuality /= inconsistentWeeks;

    const difference = consistentAvgQuality - inconsistentAvgQuality;
    if (Math.abs(difference) < 0.3) return null;

    const strength = Math.min(1, Math.abs(difference) / 2);

    return {
      factor: 'Bedtime Consistency',
      impact: difference > 0 ? 'positive' : 'negative',
      strength,
      description: `Consistent bedtimes (±1 hour) correlate with ${Math.abs(difference).toFixed(1)} points ${difference > 0 ? 'higher' : 'lower'} sleep quality.`,
      recommendation: 'Maintain consistent bedtimes within a 1-hour window, even on weekends.',
    };
  }

  private static calculateBedtimeVariance(logs: SleepLog[]): number {
    const bedtimeMinutes = logs.map(log => {
      const [hour, min] = log.bedtime.split(':').map(Number);
      return hour * 60 + min;
    });

    const avg = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const variance = bedtimeMinutes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / bedtimeMinutes.length;
    return Math.sqrt(variance);
  }

  private static analyzeWeekendCorrelation(logs: SleepLog[]): Correlation | null {
    const weekdayLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day !== 0 && day !== 6;
    });

    const weekendLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day === 0 || day === 6;
    });

    if (weekdayLogs.length < 5 || weekendLogs.length < 2) return null;

    const weekdayQuality = weekdayLogs.reduce((sum, log) => sum + log.quality, 0) / weekdayLogs.length;
    const weekendQuality = weekendLogs.reduce((sum, log) => sum + log.quality, 0) / weekendLogs.length;
    const difference = weekendQuality - weekdayQuality;

    if (Math.abs(difference) < 0.3) return null;

    return {
      factor: 'Weekend Sleep',
      impact: difference > 0 ? 'positive' : 'negative',
      strength: Math.min(1, Math.abs(difference) / 2),
      description: `Weekend sleep quality is ${Math.abs(difference).toFixed(1)} points ${difference > 0 ? 'higher' : 'lower'} than weekdays (${weekendQuality.toFixed(1)} vs ${weekdayQuality.toFixed(1)}).`,
      recommendation: difference < 0 ? 'Investigate weekend factors affecting sleep (late nights, alcohol, different routine).' : 'Apply weekend sleep practices to weekdays for better quality.',
    };
  }

  private static analyzeDurationQualityCorrelation(logs: SleepLog[]): Correlation | null {
    if (logs.length < 10) return null;

    // Calculate correlation coefficient
    const avgDuration = logs.reduce((sum, log) => sum + log.hours, 0) / logs.length;
    const avgQuality = logs.reduce((sum, log) => sum + log.quality, 0) / logs.length;

    let covariance = 0;
    let durationVariance = 0;
    let qualityVariance = 0;

    logs.forEach(log => {
      const durationDiff = log.hours - avgDuration;
      const qualityDiff = log.quality - avgQuality;
      covariance += durationDiff * qualityDiff;
      durationVariance += durationDiff * durationDiff;
      qualityVariance += qualityDiff * qualityDiff;
    });

    const correlation = covariance / Math.sqrt(durationVariance * qualityVariance);
    const absCorrelation = Math.abs(correlation);

    if (absCorrelation < 0.3) return null;

    return {
      factor: 'Sleep Duration',
      impact: correlation > 0 ? 'positive' : 'negative',
      strength: absCorrelation,
      description: `Sleep duration shows ${absCorrelation > 0.6 ? 'strong' : 'moderate'} ${correlation > 0 ? 'positive' : 'negative'} correlation with quality (r=${correlation.toFixed(2)}).`,
      recommendation: correlation > 0 ? 'Longer sleep duration improves quality - aim for 7-9 hours.' : 'More sleep does not always mean better quality - focus on consistency and sleep hygiene.',
    };
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    logs: SleepLog[],
    metrics: SleepMetrics,
    patterns: SleepPattern[],
    correlations: Correlation[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let idCounter = 1;

    // Recommendation 1: Sleep Duration
    if (metrics.averageDuration < 7) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 'high',
        category: 'duration',
        title: 'Increase Sleep Duration',
        description: `You're averaging ${metrics.averageDuration.toFixed(1)} hours - below the recommended 7-9 hours.`,
        rationale: `With a current sleep debt of ${metrics.sleepDebt.toFixed(1)} hours, you're at risk of impaired cognitive function, mood issues, and health problems.`,
        actionSteps: [
          `Move bedtime 15 minutes earlier each week until reaching ${metrics.optimalBedtimeWindow.start}`,
          'Set a bedtime alarm 30 minutes before target sleep time',
          'Eliminate screen time 1 hour before bed',
          'Create a wind-down routine (reading, stretching, meditation)',
        ],
        estimatedImpact: 'Reaching 7-8 hours can improve alertness by 25% and mood by 30% within 2 weeks',
        relatedHabits: ['screen-off-before-bed', 'bedtime-routine', 'caffeine-cutoff'],
      });
    }

    // Recommendation 2: Consistency
    if (metrics.consistencyScore < 60) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 'high',
        category: 'consistency',
        title: 'Improve Sleep Schedule Consistency',
        description: `Your consistency score is ${metrics.consistencyScore.toFixed(0)}%. Irregular sleep times disrupt your circadian rhythm.`,
        rationale: 'Studies show that consistent sleep-wake times improve sleep quality by 20-30% and reduce daytime sleepiness.',
        actionSteps: [
          `Aim for bedtime between ${metrics.optimalBedtimeWindow.start} - ${metrics.optimalBedtimeWindow.end} every night`,
          'Wake up at the same time daily, even weekends (within 1 hour variation)',
          'Avoid naps after 3 PM',
          'Get morning sunlight exposure to regulate circadian rhythm',
        ],
        estimatedImpact: 'Consistent schedule can improve quality by 1-1.5 points within 2 weeks',
        relatedHabits: ['consistent-bedtime', 'consistent-wake-time', 'morning-sunlight'],
      });
    }

    // Recommendation 3: Quality Improvement
    if (metrics.averageQuality < 3.5) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 'high',
        category: 'quality',
        title: 'Enhance Sleep Quality',
        description: `Your average quality is ${metrics.averageQuality.toFixed(1)}/5 - there's significant room for improvement.`,
        rationale: 'Low sleep quality often stems from poor sleep environment, stress, or disruptive habits.',
        actionSteps: [
          'Optimize bedroom: cool (60-67°F), dark (blackout curtains), quiet (white noise)',
          'Limit caffeine after 2 PM and alcohol within 3 hours of bedtime',
          'Exercise regularly but not within 3 hours of bedtime',
          'Practice relaxation techniques before bed (deep breathing, progressive muscle relaxation)',
        ],
        estimatedImpact: 'Environmental and behavioral changes can boost quality by 1-2 points',
        relatedHabits: ['bedroom-optimization', 'caffeine-cutoff', 'evening-exercise-limit', 'relaxation-routine'],
      });
    }

    // Recommendation 4: Weekend Pattern
    const weekendPattern = patterns.find(p => p.type === 'weekday_vs_weekend');
    if (weekendPattern && weekendPattern.dataPoints.difference > 1.5) {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 'medium',
        category: 'consistency',
        title: 'Reduce Weekend Sleep Variability',
        description: `You sleep ${weekendPattern.dataPoints.difference.toFixed(1)} hours more on weekends, indicating weekday sleep debt.`,
        rationale: '"Social jet lag" from weekend schedule changes disrupts your circadian rhythm and makes Monday mornings harder.',
        actionSteps: [
          'Increase weekday sleep by going to bed 30-60 minutes earlier',
          'Limit weekend bedtime variation to within 1 hour of weekday schedule',
          'Use weekends to catch up gradually, not all at once',
          'Consider afternoon power naps (20 min) instead of sleeping in',
        ],
        estimatedImpact: 'Reducing variability improves Monday energy levels by 40% and overall consistency score',
        relatedHabits: ['consistent-weekend-schedule', 'weekday-sleep-priority'],
      });
    }

    // Recommendation 5: Optimal Window
    const optimalPattern = patterns.find(p => p.type === 'optimal_window');
    if (optimalPattern) {
      const inWindowPercentage = (optimalPattern.dataPoints.count / logs.length) * 100;
      if (inWindowPercentage < 50) {
        recommendations.push({
          id: `rec_${idCounter++}`,
          priority: 'medium',
          category: 'consistency',
          title: 'Target Your Optimal Bedtime Window',
          description: `Sleeping around ${optimalPattern.dataPoints.optimalWindow.start} gives you ${optimalPattern.dataPoints.improvement.toFixed(0)}% better quality, but you only hit this ${inWindowPercentage.toFixed(0)}% of the time.`,
          rationale: 'Your body has shown a clear preference for this sleep timing. Consistency within this window will compound benefits.',
          actionSteps: [
            `Set daily bedtime reminder for ${optimalPattern.dataPoints.optimalWindow.start}`,
            'Start wind-down routine 90 minutes before target bedtime',
            'Track adherence and celebrate hitting the window 5+ nights/week',
            'Adjust evening commitments to protect this bedtime',
          ],
          estimatedImpact: 'Hitting optimal window 80% of the time can increase average quality by 0.5-1 point',
          relatedHabits: ['optimal-bedtime-target', 'evening-schedule-protection'],
        });
      }
    }

    // Recommendation 6: Quality Trend
    if (metrics.qualityTrend === 'declining') {
      recommendations.push({
        id: `rec_${idCounter++}`,
        priority: 'high',
        category: 'quality',
        title: 'Address Declining Sleep Quality',
        description: 'Your sleep quality has been declining recently. Early intervention prevents long-term issues.',
        rationale: 'Declining trends often indicate accumulating stress, changing habits, or environmental factors that need addressing.',
        actionSteps: [
          'Review recent changes: new stressors, medications, diet, exercise, screen time',
          'Implement sleep hygiene audit: temperature, noise, light, comfort',
          'Consider stress management: meditation, journaling, therapy',
          'Track potential disruptors: caffeine, alcohol, late meals, blue light',
        ],
        estimatedImpact: 'Identifying and addressing root causes can reverse decline within 1-2 weeks',
        relatedHabits: ['stress-management', 'sleep-hygiene-checklist', 'evening-routine'],
      });
    }

    // Recommendation 7: Based on correlations
    correlations.forEach(corr => {
      if (corr.strength > 0.5 && corr.impact === 'positive') {
        recommendations.push({
          id: `rec_${idCounter++}`,
          priority: 'medium',
          category: 'habits',
          title: `Leverage ${corr.factor} Impact`,
          description: corr.description,
          rationale: `Strong positive correlation (${(corr.strength * 100).toFixed(0)}%) indicates ${corr.factor.toLowerCase()} significantly benefits your sleep.`,
          actionSteps: [
            corr.recommendation,
            'Track this factor daily to maintain the positive impact',
            'Share this insight with sleep partners or family for support',
          ],
          estimatedImpact: 'Maintaining positive factors preserves current gains and enables further improvement',
        });
      } else if (corr.strength > 0.5 && corr.impact === 'negative') {
        recommendations.push({
          id: `rec_${idCounter++}`,
          priority: 'high',
          category: 'habits',
          title: `Mitigate ${corr.factor} Impact`,
          description: corr.description,
          rationale: `Strong negative correlation (${(corr.strength * 100).toFixed(0)}%) shows ${corr.factor.toLowerCase()} is harming your sleep.`,
          actionSteps: [
            corr.recommendation,
            'Experiment with eliminating or modifying this factor for 1 week',
            'Track changes in sleep quality to confirm impact',
          ],
          estimatedImpact: 'Addressing negative factors can improve quality by 0.5-1 point within 1 week',
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 6); // Return top 6
  }

  /**
   * Compare weekday vs weekend sleep
   */
  private static compareWeekdayWeekend(logs: SleepLog[]): WeekdayComparison | null {
    const weekdayLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day !== 0 && day !== 6;
    });

    const weekendLogs = logs.filter(log => {
      const day = new Date(log.date).getDay();
      return day === 0 || day === 6;
    });

    if (weekdayLogs.length < 3 || weekendLogs.length < 2) return null;

    const weekdayAvgHours = weekdayLogs.reduce((sum, log) => sum + log.hours, 0) / weekdayLogs.length;
    const weekdayAvgQuality = weekdayLogs.reduce((sum, log) => sum + log.quality, 0) / weekdayLogs.length;

    const weekendAvgHours = weekendLogs.reduce((sum, log) => sum + log.hours, 0) / weekendLogs.length;
    const weekendAvgQuality = weekendLogs.reduce((sum, log) => sum + log.quality, 0) / weekendLogs.length;

    const hoursDiff = weekendAvgHours - weekdayAvgHours;
    const qualityDiff = weekendAvgQuality - weekdayAvgQuality;

    let analysis = '';
    if (Math.abs(hoursDiff) < 0.5 && Math.abs(qualityDiff) < 0.3) {
      analysis = 'Great consistency! Your weekday and weekend sleep are well-balanced.';
    } else if (hoursDiff > 1.5) {
      analysis = `You're sleeping ${hoursDiff.toFixed(1)} hours more on weekends, suggesting weekday sleep debt. Try earlier weekday bedtimes.`;
    } else if (hoursDiff < -1) {
      analysis = `You sleep less on weekends. This might indicate social activities disrupting sleep. Protect weekend sleep for recovery.`;
    } else if (qualityDiff > 0.5) {
      analysis = `Weekend sleep quality is higher. Consider what's different (stress levels, routines, environment) and apply to weekdays.`;
    } else if (qualityDiff < -0.5) {
      analysis = `Weekend sleep quality is lower. Late nights or alcohol might be factors. Maintain weekday routines on weekends.`;
    } else {
      analysis = 'Minor differences detected. Continue monitoring for patterns.';
    }

    return {
      weekday: { avgHours: weekdayAvgHours, avgQuality: weekdayAvgQuality, count: weekdayLogs.length },
      weekend: { avgHours: weekendAvgHours, avgQuality: weekendAvgQuality, count: weekendLogs.length },
      difference: { hours: hoursDiff, quality: qualityDiff },
      analysis,
    };
  }

  /**
   * Predict optimal bedtime based on historical data
   */
  private static predictOptimalBedtime(logs: SleepLog[]): string {
    if (logs.length < 5) return '22:00';

    // Find bedtimes with highest quality (top 25%)
    const sortedByQuality = [...logs].sort((a, b) => b.quality - a.quality);
    const topQuarter = sortedByQuality.slice(0, Math.ceil(logs.length / 4));

    // Average their bedtimes
    const bedtimeMinutes = topQuarter.map(log => {
      const [hour, min] = log.bedtime.split(':').map(Number);
      return hour * 60 + min;
    });

    const avgMinutes = bedtimeMinutes.reduce((a, b) => a + b, 0) / bedtimeMinutes.length;
    const hours = Math.floor(avgMinutes / 60);
    const mins = Math.round(avgMinutes % 60);

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate overall sleep efficiency score
   */
  private static calculateSleepEfficiency(logs: SleepLog[], metrics: SleepMetrics): number {
    // Composite score based on multiple factors
    const durationScore = Math.min(100, (metrics.averageDuration / 8) * 100);
    const qualityScore = (metrics.averageQuality / 5) * 100;
    const consistencyScore = metrics.consistencyScore;
    const debtScore = Math.max(0, 100 - (metrics.sleepDebt / logs.length) * 20);

    // Weighted average
    const efficiency = (
      durationScore * 0.25 +
      qualityScore * 0.35 +
      consistencyScore * 0.25 +
      debtScore * 0.15
    );

    return Math.round(efficiency);
  }

  /**
   * Get default insights when no data available
   */
  private static getDefaultInsights(): DetailedInsights {
    return {
      metrics: {
        averageDuration: 0,
        averageQuality: 0,
        consistencyScore: 0,
        sleepDebt: 0,
        optimalBedtimeWindow: { start: '22:00', end: '23:00' },
        qualityTrend: 'stable',
        durationTrend: 'stable',
      },
      patterns: [],
      correlations: [],
      recommendations: [
        {
          id: 'rec_default_1',
          priority: 'high',
          category: 'duration',
          title: 'Start Tracking Your Sleep',
          description: 'Begin logging your sleep to get personalized insights and recommendations.',
          rationale: 'Data-driven insights require at least 7 days of sleep tracking.',
          actionSteps: [
            'Log your bedtime and wake time daily',
            'Rate your sleep quality each morning',
            'Track for at least 1 week to see initial patterns',
            'Add notes about factors affecting sleep',
          ],
          estimatedImpact: 'Awareness alone can improve sleep quality by 15-20%',
        },
      ],
      weekdayComparison: null,
      predictedOptimalBedtime: '22:00',
      sleepEfficiencyScore: 0,
    };
  }
}
