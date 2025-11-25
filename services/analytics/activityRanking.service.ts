/**
 * Activity Ranking Service
 *
 * Intelligent ranking algorithm that combines:
 * 1. Post-activity ratings (immediate feedback)
 * 2. Correlation with daily outcomes (mood, sleep, clarity)
 * 3. Frequency and consistency
 * 4. Recency and trends
 * 5. Statistical confidence
 *
 * Provides dynamic, personalized activity rankings by time period
 */

import { RatingCorrelationService, ActivityWithRatings, RatingCorrelation } from './ratingCorrelation.service';
import { ActivityImpactService, EnhancedActivityImpact } from './activityImpact.service';

export interface RankedActivity {
  name: string;
  category: string;
  emoji: string;

  // Ranking metrics
  rankScore: number;              // 0-100 composite ranking score
  rank: number;                   // Position in ranking (1 = best)

  // Component scores
  ratingScore: number;            // Based on post-activity ratings
  correlationScore: number;       // Based on correlation with outcomes
  frequencyScore: number;         // Based on how often done
  trendScore: number;             // Based on improvement/decline
  confidenceScore: number;        // Based on data quality

  // Detailed metrics
  occurrences: number;
  frequencyPercent: number;
  avgRating: number;              // 1-5 average from post-activity ratings
  overallBenefit: number;         // 0-100 from correlation analysis

  // Time-based stats
  lastDone: string;               // ISO date
  daysAgo: number;
  streak: number;                 // Consecutive days/weeks

  // Insights
  primaryBenefit: string;
  trend: 'improving' | 'stable' | 'declining' | 'new';
  confidence: 'low' | 'medium' | 'high' | 'very-high';
  recommendation: string;

  // Full correlation data (optional)
  ratingCorrelation?: RatingCorrelation;
  impactAnalysis?: EnhancedActivityImpact;
}

export interface RankingResult {
  period: 'today' | 'week' | 'month' | 'year';
  rankedActivities: RankedActivity[];
  totalActivities: number;

  // Top categories
  topByRating: RankedActivity | null;
  topByCorrelation: RankedActivity | null;
  topByFrequency: RankedActivity | null;
  mostImproved: RankedActivity | null;
  needsAttention: RankedActivity | null;

  // Summary stats
  avgRatingScore: number;
  avgCorrelationScore: number;
  avgConfidence: number;

  // Insights
  insights: string[];
}

export class ActivityRankingService {
  /**
   * Rank activities for a given time period
   */
  static async rankActivities(
    userId: string,
    period: 'today' | 'week' | 'month' | 'year',
    activities: ActivityWithRatings[],
    dailyMoods?: Map<string, number>,
    dailySleep?: Map<string, { quality: number; hours: number }>,
    dailyClarity?: Map<string, number>
  ): Promise<RankingResult> {

    if (activities.length === 0) {
      return this.emptyRanking(period);
    }

    // Group activities by name
    const activityGroups = new Map<string, ActivityWithRatings[]>();
    activities.forEach(activity => {
      if (!activityGroups.has(activity.name)) {
        activityGroups.set(activity.name, []);
      }
      activityGroups.get(activity.name)!.push(activity);
    });

    // Analyze each activity
    const rankedActivities: RankedActivity[] = [];

    for (const [activityName, activityLogs] of activityGroups.entries()) {
      const ranked = await this.rankIndividualActivity(
        activityName,
        activityLogs,
        activities,
        period,
        dailyMoods,
        dailySleep,
        dailyClarity
      );

      rankedActivities.push(ranked);
    }

    // Sort by rank score
    rankedActivities.sort((a, b) => b.rankScore - a.rankScore);

    // Assign rank positions
    rankedActivities.forEach((activity, index) => {
      activity.rank = index + 1;
    });

    // Identify top activities
    const topByRating = [...rankedActivities].sort((a, b) => b.ratingScore - a.ratingScore)[0] || null;
    const topByCorrelation = [...rankedActivities].sort((a, b) => b.correlationScore - a.correlationScore)[0] || null;
    const topByFrequency = [...rankedActivities].sort((a, b) => b.frequencyScore - a.frequencyScore)[0] || null;
    const mostImproved = [...rankedActivities].find(a => a.trend === 'improving' && a.confidence !== 'low') || null;
    const needsAttention = [...rankedActivities].find(a => a.rankScore < 40 && a.occurrences >= 5) || null;

    // Calculate summary stats
    const avgRatingScore = rankedActivities.reduce((sum, a) => sum + a.ratingScore, 0) / rankedActivities.length || 0;
    const avgCorrelationScore = rankedActivities.reduce((sum, a) => sum + a.correlationScore, 0) / rankedActivities.length || 0;
    const avgConfidence = this.calculateAverageConfidence(rankedActivities);

    // Generate insights
    const insights = this.generateRankingInsights(rankedActivities, period);

    return {
      period,
      rankedActivities,
      totalActivities: activities.length,
      topByRating,
      topByCorrelation,
      topByFrequency,
      mostImproved,
      needsAttention,
      avgRatingScore,
      avgCorrelationScore,
      avgConfidence,
      insights,
    };
  }

  /**
   * Rank an individual activity
   */
  private static async rankIndividualActivity(
    activityName: string,
    activityLogs: ActivityWithRatings[],
    allActivities: ActivityWithRatings[],
    period: 'today' | 'week' | 'month' | 'year',
    dailyMoods?: Map<string, number>,
    dailySleep?: Map<string, { quality: number; hours: number }>,
    dailyClarity?: Map<string, number>
  ): Promise<RankedActivity> {

    const sampleActivity = activityLogs[0];
    const occurrences = activityLogs.length;
    const frequencyPercent = Math.round((occurrences / allActivities.length) * 100);

    // 1. Calculate rating-based correlation
    const ratingCorrelation = RatingCorrelationService.calculateRatingCorrelation(
      activityName,
      activityLogs,
      allActivities,
      dailyMoods,
      dailySleep,
      dailyClarity
    );

    // 2. Calculate traditional correlation (from ActivityImpactService)
    // Note: This requires converting our data to the format ActivityImpactService expects
    const impactAnalysis = await this.calculateImpactAnalysis(
      activityLogs,
      dailyMoods,
      dailySleep,
      dailyClarity,
      allActivities.length
    );

    // 3. Calculate component scores
    const ratingScore = ratingCorrelation.impactScore;
    const correlationScore = impactAnalysis.overallBenefit;

    const frequencyScore = this.calculateFrequencyScore(occurrences, allActivities.length, period);

    const trendScore = this.calculateTrendScore(activityLogs, ratingCorrelation);

    const confidenceScore = this.calculateConfidenceScore(
      ratingCorrelation.reliability,
      impactAnalysis.confidence,
      occurrences
    );

    // 4. Calculate composite rank score (weighted)
    const rankScore = this.calculateRankScore({
      ratingScore,
      correlationScore,
      frequencyScore,
      trendScore,
      confidenceScore,
    });

    // 5. Time-based stats
    const sortedByDate = [...activityLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastDone = sortedByDate[0].date;
    const daysAgo = this.calculateDaysAgo(lastDone);
    const streak = this.calculateStreak(sortedByDate, period);

    // 6. Average rating
    const ratings = activityLogs
      .flatMap(a => [a.mood_rating, a.sleep_rating, a.clarity_rating, a.energy_rating])
      .filter((r): r is number => r !== null);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // 7. Determine trend
    const trend = this.determineTrend(activityLogs, ratingCorrelation);

    // 8. Overall confidence
    const confidence = this.getOverallConfidence(
      ratingCorrelation.reliability,
      impactAnalysis.confidence
    );

    // 9. Recommendation
    const recommendation = this.generateRecommendation(
      activityName,
      rankScore,
      ratingCorrelation.primaryBenefit,
      trend,
      confidence
    );

    return {
      name: activityName,
      category: sampleActivity.category,
      emoji: sampleActivity.name || '📌',
      rankScore,
      rank: 0, // Will be set after sorting
      ratingScore,
      correlationScore,
      frequencyScore,
      trendScore,
      confidenceScore,
      occurrences,
      frequencyPercent,
      avgRating,
      overallBenefit: impactAnalysis.overallBenefit,
      lastDone,
      daysAgo,
      streak,
      primaryBenefit: ratingCorrelation.primaryBenefit,
      trend,
      confidence,
      recommendation,
      ratingCorrelation,
      impactAnalysis,
    };
  }

  /**
   * Calculate frequency score (0-100)
   */
  private static calculateFrequencyScore(
    occurrences: number,
    totalActivities: number,
    period: 'today' | 'week' | 'month' | 'year'
  ): number {
    const percentage = (occurrences / totalActivities) * 100;

    // Optimal frequency depends on period
    const optimalRanges = {
      today: { min: 20, max: 40 },    // 20-40% of daily activities
      week: { min: 15, max: 35 },     // 15-35% of weekly activities
      month: { min: 10, max: 30 },    // 10-30% of monthly activities
      year: { min: 5, max: 25 },      // 5-25% of yearly activities
    };

    const range = optimalRanges[period];

    // Score based on how close to optimal range
    if (percentage >= range.min && percentage <= range.max) {
      return 100; // Perfect frequency
    } else if (percentage < range.min) {
      // Under-represented
      return Math.max(0, (percentage / range.min) * 100);
    } else {
      // Over-represented (diminishing returns)
      const excess = percentage - range.max;
      const maxExcess = 100 - range.max;
      return Math.max(50, 100 - (excess / maxExcess) * 50);
    }
  }

  /**
   * Calculate trend score (-50 to +50)
   */
  private static calculateTrendScore(
    activityLogs: ActivityWithRatings[],
    ratingCorrelation: RatingCorrelation
  ): number {
    if (activityLogs.length < 6) return 0; // Neutral for insufficient data

    // Split into first half and second half
    const midpoint = Math.floor(activityLogs.length / 2);
    const sorted = [...activityLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    // Get average ratings for each half
    const firstAvg = this.getAverageRating(firstHalf);
    const secondAvg = this.getAverageRating(secondHalf);

    if (firstAvg === 0 || secondAvg === 0) return 0;

    // Calculate change (normalize to -50 to +50 scale)
    const change = secondAvg - firstAvg;
    const normalizedChange = (change / 4) * 100; // 4 is max change on 1-5 scale

    return Math.max(-50, Math.min(50, Math.round(normalizedChange)));
  }

  /**
   * Get average rating from activity logs
   */
  private static getAverageRating(logs: ActivityWithRatings[]): number {
    const ratings = logs
      .flatMap(a => [a.mood_rating, a.sleep_rating, a.clarity_rating, a.energy_rating])
      .filter((r): r is number => r !== null);

    if (ratings.length === 0) return 0;

    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  /**
   * Calculate confidence score (0-100)
   */
  private static calculateConfidenceScore(
    ratingReliability: 'low' | 'medium' | 'high' | 'very-high',
    impactConfidence: 'low' | 'medium' | 'high',
    occurrences: number
  ): number {
    // Convert categorical to numerical
    const reliabilityScore = {
      'low': 25,
      'medium': 50,
      'high': 75,
      'very-high': 100,
    }[ratingReliability];

    const confidenceScoreMap = {
      'low': 33,
      'medium': 66,
      'high': 100,
    }[impactConfidence];

    // Sample size bonus
    const sampleBonus = Math.min(20, occurrences * 2);

    return Math.min(100, Math.round((reliabilityScore + confidenceScoreMap) / 2 + sampleBonus));
  }

  /**
   * Calculate composite rank score (0-100)
   */
  private static calculateRankScore(components: {
    ratingScore: number;
    correlationScore: number;
    frequencyScore: number;
    trendScore: number;     // -50 to +50
    confidenceScore: number;
  }): number {
    // Weights
    const weights = {
      rating: 0.35,        // Post-activity ratings are most immediate
      correlation: 0.30,   // Outcome correlation is important
      frequency: 0.15,     // Frequency matters but not too much
      trend: 0.10,         // Trending up/down is valuable
      confidence: 0.10,    // Data quality matters
    };

    // Normalize trend score to 0-100
    const normalizedTrend = components.trendScore + 50;

    const score =
      components.ratingScore * weights.rating +
      components.correlationScore * weights.correlation +
      components.frequencyScore * weights.frequency +
      normalizedTrend * weights.trend +
      components.confidenceScore * weights.confidence;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate impact analysis (compatibility layer for ActivityImpactService)
   */
  private static async calculateImpactAnalysis(
    activityLogs: ActivityWithRatings[],
    moodMap?: Map<string, number>,
    sleepMap?: Map<string, { quality: number; hours: number }>,
    clarityMap?: Map<string, number>,
    totalActivityCount: number = 1
  ): Promise<EnhancedActivityImpact> {
    // For now, create a simplified version
    // In production, you'd call ActivityImpactService properly

    const sampleActivity = activityLogs[0];
    const occurrences = activityLogs.length;

    return {
      activityName: sampleActivity.name,
      category: sampleActivity.category,
      emoji: sampleActivity.name || '📌',
      occurrences,
      frequencyPercent: Math.round((occurrences / totalActivityCount) * 100),
      impacts: {
        mood: { immediate: 0, nextDay: 0, cumulative: 0, confidence: 0.5 },
        sleep: { immediate: 0, nextDay: 0, cumulative: 0, confidence: 0.5 },
        clarity: { immediate: 0, nextDay: 0, cumulative: 0, confidence: 0.5 },
        productivity: { immediate: 0, nextDay: 0, cumulative: 0, confidence: 0.5 },
      },
      overallBenefit: 50,
      trend: 'stable',
      confidence: 'medium',
      correlations: {
        mood: 0,
        sleep: 0,
        clarity: 0,
        productivity: 0,
      },
      recommendation: 'Continue tracking for better insights.',
    };
  }

  /**
   * Calculate days since last activity
   */
  private static calculateDaysAgo(lastDate: string): number {
    const now = new Date();
    const last = new Date(lastDate);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate streak
   */
  private static calculateStreak(
    sortedLogs: ActivityWithRatings[],
    period: 'today' | 'week' | 'month' | 'year'
  ): number {
    if (sortedLogs.length === 0) return 0;

    const intervalDays = {
      today: 1,
      week: 7,
      month: 30,
      year: 365,
    }[period];

    let streak = 1;
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = new Date(sortedLogs[i].date);
      const next = new Date(sortedLogs[i + 1].date);
      const daysDiff = Math.abs(current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= intervalDays) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Determine trend
   */
  private static determineTrend(
    activityLogs: ActivityWithRatings[],
    ratingCorrelation: RatingCorrelation
  ): 'improving' | 'stable' | 'declining' | 'new' {
    if (activityLogs.length < 3) return 'new';
    if (activityLogs.length < 6) return 'stable';

    const midpoint = Math.floor(activityLogs.length / 2);
    const sorted = [...activityLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstAvg = this.getAverageRating(sorted.slice(0, midpoint));
    const secondAvg = this.getAverageRating(sorted.slice(midpoint));

    if (firstAvg === 0 || secondAvg === 0) return 'stable';

    const change = secondAvg - firstAvg;

    if (change >= 0.4) return 'improving';
    if (change <= -0.4) return 'declining';
    return 'stable';
  }

  /**
   * Get overall confidence
   */
  private static getOverallConfidence(
    ratingReliability: 'low' | 'medium' | 'high' | 'very-high',
    impactConfidence: 'low' | 'medium' | 'high'
  ): 'low' | 'medium' | 'high' | 'very-high' {
    const scores = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'very-high': 4,
    };

    const ratingScore = scores[ratingReliability];
    const impactScore = scores[impactConfidence as keyof typeof scores] || 1;

    const avg = (ratingScore + impactScore) / 2;

    if (avg >= 3.5) return 'very-high';
    if (avg >= 2.5) return 'high';
    if (avg >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendation
   */
  private static generateRecommendation(
    activityName: string,
    rankScore: number,
    primaryBenefit: string,
    trend: string,
    confidence: string
  ): string {
    if (rankScore >= 75 && confidence !== 'low') {
      return `⭐ ${activityName} is excellent! Best for ${primaryBenefit}. ${trend === 'improving' ? 'Improving over time!' : 'Keep it up!'}`;
    } else if (rankScore >= 60) {
      return `✅ ${activityName} is beneficial. Primary benefit: ${primaryBenefit}.`;
    } else if (rankScore >= 45) {
      return `📊 ${activityName} has moderate impact. ${trend === 'declining' ? 'Benefits declining - consider reducing frequency.' : 'Continue as desired.'}`;
    } else if (rankScore >= 30) {
      return `⚠️ ${activityName} may not be ideal. Consider alternatives.`;
    } else {
      return `🔴 ${activityName} shows limited benefit. ${trend === 'declining' ? 'Declining over time.' : 'Consider replacement.'}`;
    }
  }

  /**
   * Calculate average confidence across all activities
   */
  private static calculateAverageConfidence(activities: RankedActivity[]): number {
    if (activities.length === 0) return 0;

    const confidenceScores = activities.map(a => {
      switch (a.confidence) {
        case 'very-high': return 100;
        case 'high': return 75;
        case 'medium': return 50;
        case 'low': return 25;
        default: return 0;
      }
    });

    return Math.round(confidenceScores.reduce((sum, s) => sum + s, 0) / confidenceScores.length);
  }

  /**
   * Generate insights from rankings
   */
  private static generateRankingInsights(
    activities: RankedActivity[],
    period: string
  ): string[] {
    const insights: string[] = [];

    // Top performer
    if (activities.length > 0 && activities[0].rankScore >= 70) {
      insights.push(`${activities[0].emoji} ${activities[0].name} is your top activity this ${period}!`);
    }

    // Improving activity
    const improving = activities.find(a => a.trend === 'improving' && a.confidence !== 'low');
    if (improving) {
      insights.push(`📈 ${improving.name} is showing great improvement over time!`);
    }

    // High frequency but low benefit
    const overused = activities.find(a => a.frequencyPercent >= 25 && a.rankScore < 50);
    if (overused) {
      insights.push(`💡 You do ${overused.name} often (${overused.frequencyPercent}%), but it ranks low. Consider reducing.`);
    }

    // Declining activity
    const declining = activities.find(a => a.trend === 'declining' && a.occurrences >= 5);
    if (declining) {
      insights.push(`⚠️ ${declining.name} benefits are declining. Possible habituation.`);
    }

    if (insights.length === 0) {
      insights.push(`Keep tracking activities to discover personalized insights!`);
    }

    return insights.slice(0, 3);
  }

  /**
   * Empty ranking result
   */
  private static emptyRanking(period: 'today' | 'week' | 'month' | 'year'): RankingResult {
    return {
      period,
      rankedActivities: [],
      totalActivities: 0,
      topByRating: null,
      topByCorrelation: null,
      topByFrequency: null,
      mostImproved: null,
      needsAttention: null,
      avgRatingScore: 0,
      avgCorrelationScore: 0,
      avgConfidence: 0,
      insights: ['No activities tracked yet. Start logging to see rankings!'],
    };
  }
}
