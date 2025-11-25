/**
 * Rating-Based Correlation Service
 *
 * Enhanced correlation analysis using post-activity ratings (1-5 scale)
 * This provides more accurate impact analysis by using immediate user feedback
 * rather than relying solely on daily mood/sleep logs.
 *
 * Key improvements over basic correlation:
 * 1. Uses activity-specific ratings (mood, sleep, clarity, energy)
 * 2. Immediate feedback (captured right after activity)
 * 3. Multi-dimensional impact assessment
 * 4. Better handles same-day multiple activities
 * 5. More granular correlation (1-5 scale vs binary presence)
 */

export interface ActivityWithRatings {
  id: string;
  user_id: string;
  date: string;
  category: string;
  name: string;
  mood_rating: number | null;
  sleep_rating: number | null;
  clarity_rating: number | null;
  energy_rating: number | null;
  created_at: string;
}

export interface RatingCorrelation {
  activityName: string;
  category: string;

  // Rating-based impacts (immediate feedback)
  moodImpact: {
    average: number;        // Average mood rating (1-5)
    correlation: number;    // Correlation with overall mood
    sampleSize: number;
    confidence: 'low' | 'medium' | 'high';
  };

  sleepImpact: {
    average: number;
    correlation: number;
    sampleSize: number;
    confidence: 'low' | 'medium' | 'high';
  };

  clarityImpact: {
    average: number;
    correlation: number;
    sampleSize: number;
    confidence: 'low' | 'medium' | 'high';
  };

  energyImpact: {
    average: number;
    correlation: number;
    sampleSize: number;
    confidence: 'low' | 'medium' | 'high';
  };

  // Combined metrics
  overallRating: number;       // 0-100 composite score
  impactScore: number;         // 0-100 weighted impact
  consistency: number;         // 0-1 how consistent the ratings are
  reliability: 'low' | 'medium' | 'high' | 'very-high';

  // Comparison with daily logs
  ratingVsLogCorrelation: {
    mood: number;              // How well ratings match daily mood logs
    sleep: number;             // How well ratings match actual sleep quality
    clarity: number;           // Correlation with clarity tests
  };

  // Insights
  primaryBenefit: 'mood' | 'sleep' | 'clarity' | 'energy' | 'mixed';
  recommendation: string;
  warnings: string[];
}

export interface RatingBasedInsight {
  type: 'positive' | 'negative' | 'mixed' | 'neutral';
  activityName: string;
  message: string;
  confidence: 'low' | 'medium' | 'high';
  priority: number; // 1-5, higher = more important
}

export class RatingCorrelationService {
  private static readonly MIN_SAMPLES = 3;
  private static readonly CONFIDENCE_THRESHOLDS = {
    low: 3,
    medium: 7,
    high: 12,
  };

  /**
   * Calculate rating-based correlations for an activity
   */
  static calculateRatingCorrelation(
    activityName: string,
    activities: ActivityWithRatings[],
    allActivities: ActivityWithRatings[],
    dailyMoods?: Map<string, number>,
    dailySleep?: Map<string, { quality: number }>,
    dailyClarity?: Map<string, number>
  ): RatingCorrelation {

    // Filter activities for this specific activity
    const activityLogs = activities.filter(a => a.name === activityName);

    if (activityLogs.length < this.MIN_SAMPLES) {
      return this.emptyCorrelation(activityName, activityLogs[0]?.category || 'Unknown');
    }

    const sampleActivity = activityLogs[0];

    // Extract ratings
    const moodRatings = activityLogs
      .map(a => a.mood_rating)
      .filter((r): r is number => r !== null);

    const sleepRatings = activityLogs
      .map(a => a.sleep_rating)
      .filter((r): r is number => r !== null);

    const clarityRatings = activityLogs
      .map(a => a.clarity_rating)
      .filter((r): r is number => r !== null);

    const energyRatings = activityLogs
      .map(a => a.energy_rating)
      .filter((r): r is number => r !== null);

    // Calculate averages
    const moodAvg = this.calculateAverage(moodRatings);
    const sleepAvg = this.calculateAverage(sleepRatings);
    const clarityAvg = this.calculateAverage(clarityRatings);
    const energyAvg = this.calculateAverage(energyRatings);

    // Calculate correlations with daily logs (if available)
    const ratingVsLogCorr = {
      mood: dailyMoods ? this.correlateRatingWithDailyLog(activityLogs, 'mood_rating', dailyMoods) : 0,
      sleep: dailySleep ? this.correlateRatingWithSleepLog(activityLogs, 'sleep_rating', dailySleep) : 0,
      clarity: dailyClarity ? this.correlateRatingWithDailyLog(activityLogs, 'clarity_rating', dailyClarity) : 0,
    };

    // Calculate rating consistency (standard deviation)
    const moodConsistency = this.calculateConsistency(moodRatings);
    const sleepConsistency = this.calculateConsistency(sleepRatings);
    const clarityConsistency = this.calculateConsistency(clarityRatings);
    const energyConsistency = this.calculateConsistency(energyRatings);

    const avgConsistency = (
      moodConsistency + sleepConsistency + clarityConsistency + energyConsistency
    ) / 4;

    // Determine confidence levels
    const moodConfidence = this.getConfidenceLevel(moodRatings.length);
    const sleepConfidence = this.getConfidenceLevel(sleepRatings.length);
    const clarityConfidence = this.getConfidenceLevel(clarityRatings.length);
    const energyConfidence = this.getConfidenceLevel(energyRatings.length);

    // Calculate overall rating (normalize to 0-100)
    const overallRating = this.calculateOverallRating({
      mood: moodAvg,
      sleep: sleepAvg,
      clarity: clarityAvg,
      energy: energyAvg,
    });

    // Calculate weighted impact score
    const impactScore = this.calculateImpactScore({
      mood: { avg: moodAvg, consistency: moodConsistency, sampleSize: moodRatings.length },
      sleep: { avg: sleepAvg, consistency: sleepConsistency, sampleSize: sleepRatings.length },
      clarity: { avg: clarityAvg, consistency: clarityConsistency, sampleSize: clarityRatings.length },
      energy: { avg: energyAvg, consistency: energyConsistency, sampleSize: energyRatings.length },
    });

    // Determine primary benefit
    const primaryBenefit = this.determinePrimaryBenefit({
      mood: moodAvg,
      sleep: sleepAvg,
      clarity: clarityAvg,
      energy: energyAvg,
    });

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      activityName,
      overallRating,
      impactScore,
      primaryBenefit,
      {
        mood: moodConfidence,
        sleep: sleepConfidence,
        clarity: clarityConfidence,
        energy: energyConfidence,
      }
    );

    // Detect warnings
    const warnings = this.detectWarnings({
      moodAvg,
      sleepAvg,
      clarityAvg,
      energyAvg,
      moodRatings,
      sleepRatings,
      clarityRatings,
      energyRatings,
    });

    // Determine overall reliability
    const reliability = this.getReliabilityLevel(
      Math.max(moodRatings.length, sleepRatings.length, clarityRatings.length, energyRatings.length),
      avgConsistency
    );

    return {
      activityName,
      category: sampleActivity.category,

      moodImpact: {
        average: moodAvg,
        correlation: ratingVsLogCorr.mood,
        sampleSize: moodRatings.length,
        confidence: moodConfidence,
      },

      sleepImpact: {
        average: sleepAvg,
        correlation: ratingVsLogCorr.sleep,
        sampleSize: sleepRatings.length,
        confidence: sleepConfidence,
      },

      clarityImpact: {
        average: clarityAvg,
        correlation: ratingVsLogCorr.clarity,
        sampleSize: clarityRatings.length,
        confidence: clarityConfidence,
      },

      energyImpact: {
        average: energyAvg,
        correlation: 0, // No daily energy log to correlate with yet
        sampleSize: energyRatings.length,
        confidence: energyConfidence,
      },

      overallRating,
      impactScore,
      consistency: avgConsistency,
      reliability,
      ratingVsLogCorrelation: ratingVsLogCorr,
      primaryBenefit,
      recommendation,
      warnings,
    };
  }

  /**
   * Generate insights from multiple activity correlations
   */
  static generateInsights(correlations: RatingCorrelation[]): RatingBasedInsight[] {
    const insights: RatingBasedInsight[] = [];

    // Sort by impact score
    const sorted = [...correlations].sort((a, b) => b.impactScore - a.impactScore);

    // Top performer
    if (sorted.length > 0 && sorted[0].impactScore >= 70 && sorted[0].reliability !== 'low') {
      insights.push({
        type: 'positive',
        activityName: sorted[0].activityName,
        message: `${sorted[0].activityName} is your top wellness booster! ${sorted[0].recommendation}`,
        confidence: sorted[0].reliability === 'very-high' ? 'high' : sorted[0].reliability === 'high' ? 'high' : 'medium',
        priority: 5,
      });
    }

    // Consistent high performer
    const consistentWinner = sorted.find(
      c => c.impactScore >= 65 && c.consistency >= 0.8 && c.reliability !== 'low'
    );
    if (consistentWinner && consistentWinner !== sorted[0]) {
      insights.push({
        type: 'positive',
        activityName: consistentWinner.activityName,
        message: `${consistentWinner.activityName} consistently boosts your ${consistentWinner.primaryBenefit}. Very reliable!`,
        confidence: 'high',
        priority: 4,
      });
    }

    // Warning: high frequency but low benefit
    const frequentButPoor = correlations.find(
      c => c.moodImpact.sampleSize >= 8 && c.impactScore < 45
    );
    if (frequentButPoor) {
      insights.push({
        type: 'negative',
        activityName: frequentButPoor.activityName,
        message: `You do ${frequentButPoor.activityName} often, but it consistently rates low (avg: ${frequentButPoor.overallRating.toFixed(0)}/100). Consider reducing frequency.`,
        confidence: frequentButPoor.reliability === 'very-high' ? 'high' : 'medium',
        priority: 4,
      });
    }

    // Mixed signals
    const mixed = correlations.find(
      c => c.primaryBenefit === 'mixed' && c.reliability !== 'low'
    );
    if (mixed) {
      insights.push({
        type: 'mixed',
        activityName: mixed.activityName,
        message: `${mixed.activityName} has mixed effects. ${mixed.recommendation}`,
        confidence: 'medium',
        priority: 3,
      });
    }

    // Surprising correlation
    const surprisingGood = correlations.find(
      c => c.overallRating >= 60 &&
          c.ratingVsLogCorrelation.mood > 0.6 &&
          c.reliability !== 'low'
    );
    if (surprisingGood) {
      insights.push({
        type: 'positive',
        activityName: surprisingGood.activityName,
        message: `Great match! Your ${surprisingGood.activityName} ratings align perfectly with your actual mood improvements.`,
        confidence: 'high',
        priority: 3,
      });
    }

    // Inconsistent activity
    const inconsistent = correlations.find(
      c => c.consistency < 0.4 && c.impactScore > 50
    );
    if (inconsistent) {
      insights.push({
        type: 'neutral',
        activityName: inconsistent.activityName,
        message: `${inconsistent.activityName} shows inconsistent results. Try noting what makes it work better for you.`,
        confidence: 'low',
        priority: 2,
      });
    }

    // Sort by priority
    return insights.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  /**
   * Calculate average from array of numbers
   */
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Calculate consistency (inverse of coefficient of variation)
   * Returns 0-1, where 1 = perfectly consistent, 0 = highly variable
   */
  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 1; // Perfect consistency with < 2 samples

    const mean = this.calculateAverage(values);
    if (mean === 0) return 1;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation
    const cv = stdDev / mean;

    // Convert to consistency score (0-1)
    // CV of 0 = perfectly consistent (score 1)
    // CV of 1+ = very inconsistent (score approaches 0)
    return Math.max(0, 1 - cv);
  }

  /**
   * Correlate activity rating with daily log
   */
  private static correlateRatingWithDailyLog(
    activities: ActivityWithRatings[],
    ratingField: 'mood_rating' | 'clarity_rating',
    dailyLogs: Map<string, number>
  ): number {
    const pairs: { rating: number; log: number }[] = [];

    activities.forEach(activity => {
      const rating = activity[ratingField];
      const log = dailyLogs.get(activity.date);

      if (rating !== null && log !== undefined) {
        // Normalize both to same scale (0-1)
        const normalizedRating = (rating - 1) / 4; // 1-5 → 0-1
        const normalizedLog = (log - 1) / 9;        // Assuming mood is 1-10 → 0-1

        pairs.push({ rating: normalizedRating, log: normalizedLog });
      }
    });

    if (pairs.length < 3) return 0;

    // Calculate Pearson correlation
    return this.pearsonCorrelation(
      pairs.map(p => p.rating),
      pairs.map(p => p.log)
    );
  }

  /**
   * Correlate sleep rating with actual sleep quality
   */
  private static correlateRatingWithSleepLog(
    activities: ActivityWithRatings[],
    ratingField: 'sleep_rating',
    sleepLogs: Map<string, { quality: number }>
  ): number {
    const pairs: { rating: number; quality: number }[] = [];

    activities.forEach(activity => {
      const rating = activity[ratingField];

      // Look at next day's sleep (activity affects sleep that night)
      const nextDate = this.addDays(activity.date, 1);
      const sleep = sleepLogs.get(nextDate);

      if (rating !== null && sleep) {
        // Normalize both to 0-1
        const normalizedRating = (rating - 1) / 4;      // 1-5 → 0-1
        const normalizedQuality = (sleep.quality - 1) / 4; // Assuming 1-5 → 0-1

        pairs.push({ rating: normalizedRating, quality: normalizedQuality });
      }
    });

    if (pairs.length < 3) return 0;

    return this.pearsonCorrelation(
      pairs.map(p => p.rating),
      pairs.map(p => p.quality)
    );
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const meanX = this.calculateAverage(x);
    const meanY = this.calculateAverage(y);

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < n; i++) {
      const devX = x[i] - meanX;
      const devY = y[i] - meanY;
      numerator += devX * devY;
      sumSqX += devX * devX;
      sumSqY += devY * devY;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);
    if (denominator === 0) return 0;

    return parseFloat((numerator / denominator).toFixed(3));
  }

  /**
   * Calculate overall rating (0-100)
   */
  private static calculateOverallRating(averages: {
    mood: number;
    sleep: number;
    clarity: number;
    energy: number;
  }): number {
    const { mood, sleep, clarity, energy } = averages;

    // Count how many ratings we have
    const count = [mood, sleep, clarity, energy].filter(v => v > 0).length;
    if (count === 0) return 0;

    // Convert 1-5 scale to 0-100, then average
    const moodScore = mood > 0 ? ((mood - 1) / 4) * 100 : 0;
    const sleepScore = sleep > 0 ? ((sleep - 1) / 4) * 100 : 0;
    const clarityScore = clarity > 0 ? ((clarity - 1) / 4) * 100 : 0;
    const energyScore = energy > 0 ? ((energy - 1) / 4) * 100 : 0;

    return Math.round((moodScore + sleepScore + clarityScore + energyScore) / count);
  }

  /**
   * Calculate weighted impact score (0-100)
   * Accounts for sample size and consistency
   */
  private static calculateImpactScore(metrics: {
    mood: { avg: number; consistency: number; sampleSize: number };
    sleep: { avg: number; consistency: number; sampleSize: number };
    clarity: { avg: number; consistency: number; sampleSize: number };
    energy: { avg: number; consistency: number; sampleSize: number };
  }): number {

    // Weights for each dimension
    const weights = {
      mood: 0.35,
      sleep: 0.30,
      clarity: 0.20,
      energy: 0.15,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(metrics).forEach(([key, metric]) => {
      if (metric.avg === 0 || metric.sampleSize === 0) return;

      // Base score (1-5 → 0-100)
      const baseScore = ((metric.avg - 1) / 4) * 100;

      // Confidence multiplier based on sample size
      const confidenceMult = Math.min(1, metric.sampleSize / 10);

      // Consistency bonus (consistent high scores are better)
      const consistencyBonus = metric.consistency * 10; // 0-10 bonus points

      // Final score for this dimension
      const dimensionScore = (baseScore + consistencyBonus) * confidenceMult;

      const weight = weights[key as keyof typeof weights];
      totalScore += dimensionScore * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) return 0;

    return Math.min(100, Math.max(0, Math.round(totalScore / totalWeight)));
  }

  /**
   * Determine primary benefit from ratings
   */
  private static determinePrimaryBenefit(averages: {
    mood: number;
    sleep: number;
    clarity: number;
    energy: number;
  }): 'mood' | 'sleep' | 'clarity' | 'energy' | 'mixed' {
    const { mood, sleep, clarity, energy } = averages;

    // Filter out zero values (not rated)
    const ratings = [
      { type: 'mood' as const, value: mood },
      { type: 'sleep' as const, value: sleep },
      { type: 'clarity' as const, value: clarity },
      { type: 'energy' as const, value: energy },
    ].filter(r => r.value > 0);

    if (ratings.length === 0) return 'mixed';
    if (ratings.length === 1) return ratings[0].type;

    // Sort by value
    ratings.sort((a, b) => b.value - a.value);

    // If top 2 are very close (within 0.3), it's mixed
    if (ratings.length >= 2 && Math.abs(ratings[0].value - ratings[1].value) < 0.3) {
      return 'mixed';
    }

    return ratings[0].type;
  }

  /**
   * Get confidence level based on sample size
   */
  private static getConfidenceLevel(sampleSize: number): 'low' | 'medium' | 'high' {
    if (sampleSize >= this.CONFIDENCE_THRESHOLDS.high) return 'high';
    if (sampleSize >= this.CONFIDENCE_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  /**
   * Get overall reliability level
   */
  private static getReliabilityLevel(
    maxSampleSize: number,
    consistency: number
  ): 'low' | 'medium' | 'high' | 'very-high' {
    if (maxSampleSize < 5) return 'low';
    if (maxSampleSize < 10) return consistency >= 0.7 ? 'medium' : 'low';
    if (maxSampleSize < 15) return consistency >= 0.8 ? 'high' : 'medium';
    return consistency >= 0.8 ? 'very-high' : 'high';
  }

  /**
   * Generate recommendation
   */
  private static generateRecommendation(
    activityName: string,
    overallRating: number,
    impactScore: number,
    primaryBenefit: string,
    confidence: Record<string, 'low' | 'medium' | 'high'>
  ): string {
    const highestConfidence = Object.values(confidence).filter(c => c === 'high').length > 0;

    if (impactScore >= 75 && highestConfidence) {
      return `⭐ Excellent for you! Keep doing ${activityName} regularly - especially great for ${primaryBenefit}.`;
    } else if (impactScore >= 65) {
      return `✅ ${activityName} is beneficial. Primary benefit: ${primaryBenefit}.`;
    } else if (impactScore >= 50) {
      return `📊 ${activityName} has moderate impact. Best for: ${primaryBenefit}.`;
    } else if (impactScore >= 35) {
      return `⚠️ ${activityName} shows mixed results. Consider reducing frequency.`;
    } else {
      return `🔴 ${activityName} may not be ideal for you. Consider alternatives.`;
    }
  }

  /**
   * Detect warnings
   */
  private static detectWarnings(data: {
    moodAvg: number;
    sleepAvg: number;
    clarityAvg: number;
    energyAvg: number;
    moodRatings: number[];
    sleepRatings: number[];
    clarityRatings: number[];
    energyRatings: number[];
  }): string[] {
    const warnings: string[] = [];

    // Consistently low mood ratings
    if (data.moodRatings.length >= 5 && data.moodAvg <= 2.0) {
      warnings.push('Consistently rates low on mood. May want to reduce or replace.');
    }

    // Poor sleep impact
    if (data.sleepRatings.length >= 5 && data.sleepAvg <= 2.0) {
      warnings.push('Predicted to hurt sleep quality. Consider doing earlier in the day.');
    }

    // Declining trend (if available)
    if (data.moodRatings.length >= 8) {
      const firstHalf = data.moodRatings.slice(0, Math.floor(data.moodRatings.length / 2));
      const secondHalf = data.moodRatings.slice(Math.floor(data.moodRatings.length / 2));
      const firstAvg = this.calculateAverage(firstHalf);
      const secondAvg = this.calculateAverage(secondHalf);

      if (firstAvg - secondAvg >= 0.5) {
        warnings.push('Benefits may be declining over time. Possible habituation.');
      }
    }

    return warnings;
  }

  /**
   * Helper: Add days to date string
   */
  private static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Return empty correlation for insufficient data
   */
  private static emptyCorrelation(activityName: string, category: string): RatingCorrelation {
    return {
      activityName,
      category,
      moodImpact: { average: 0, correlation: 0, sampleSize: 0, confidence: 'low' },
      sleepImpact: { average: 0, correlation: 0, sampleSize: 0, confidence: 'low' },
      clarityImpact: { average: 0, correlation: 0, sampleSize: 0, confidence: 'low' },
      energyImpact: { average: 0, correlation: 0, sampleSize: 0, confidence: 'low' },
      overallRating: 0,
      impactScore: 0,
      consistency: 0,
      reliability: 'low',
      ratingVsLogCorrelation: { mood: 0, sleep: 0, clarity: 0 },
      primaryBenefit: 'mixed',
      recommendation: 'Need more data to provide recommendations. Keep rating this activity!',
      warnings: [],
    };
  }
}
