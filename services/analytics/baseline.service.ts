/**
 * Baseline & Normalization Service
 * 
 * Provides personalized baseline calculations and score normalization:
 * - Calculates personal percentiles (p10, p25, p50, p75, p90) for each metric
 * - Normalizes all scores to consistent 0-100 scale
 * - Provides context like "top 25% for you" vs generic thresholds
 * - Stores baselines for reuse and tracks when recalculation is needed
 * 
 * Based on approach.md Phase 1 specifications
 */

export interface PersonalBaseline {
  userId: string;
  metricType: string; // 'mood', 'sleep_hours', 'sleep_quality', 'clarity', 'productivity'
  percentiles: {
    p10: number; // Bottom 10% (concerning)
    p25: number; // Below average
    p50: number; // Personal median
    p75: number; // Above average
    p90: number; // Top 10% (excellent)
  };
  sampleSize: number;
  dataRange: {
    min: number;
    max: number;
    mean: number;
    stdDev: number;
  };
  lastCalculated: Date;
  validUntil: Date; // Recalculate after this date
}

export interface NormalizedScore {
  rawScore: number;
  normalizedScore: number; // 0-100 scale
  percentileRank: number; // User's percentile (0-100)
  context: string; // "top 25% for you", "below your usual average"
  baseline: PersonalBaseline;
}

export class BaselineService {
  private static readonly MIN_SAMPLE_SIZE = 10;
  private static readonly RECALC_DAYS = 14; // Recalculate baselines every 2 weeks
  private static readonly LOOKBACK_DAYS = 90; // Use last 90 days of data

  /**
   * Calculate personal baseline for a specific metric
   */
  static async calculateBaseline(
    userId: string,
    metricType: string
  ): Promise<PersonalBaseline> {
    // Fetch historical data (last 90 days)
    const historicalData = await this.fetchMetricHistory(
      userId,
      metricType,
      this.LOOKBACK_DAYS
    );

    if (historicalData.length < this.MIN_SAMPLE_SIZE) {
      throw new Error(
        `Insufficient data for baseline calculation. Need at least ${this.MIN_SAMPLE_SIZE} data points, found ${historicalData.length}.`
      );
    }

    // Sort data for percentile calculation
    const sortedData = [...historicalData].sort((a, b) => a - b);

    // Calculate percentiles
    const percentiles = {
      p10: this.calculatePercentile(sortedData, 10),
      p25: this.calculatePercentile(sortedData, 25),
      p50: this.calculatePercentile(sortedData, 50),
      p75: this.calculatePercentile(sortedData, 75),
      p90: this.calculatePercentile(sortedData, 90)
    };

    // Calculate data range statistics
    const min = sortedData[0];
    const max = sortedData[sortedData.length - 1];
    const mean = sortedData.reduce((sum, val) => sum + val, 0) / sortedData.length;

    // Calculate standard deviation
    const variance =
      sortedData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      sortedData.length;
    const stdDev = Math.sqrt(variance);

    // Set validity period (recalculate in 14 days)
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(now.getDate() + this.RECALC_DAYS);

    const baseline: PersonalBaseline = {
      userId,
      metricType,
      percentiles,
      sampleSize: historicalData.length,
      dataRange: {
        min,
        max,
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2))
      },
      lastCalculated: now,
      validUntil
    };

    // Store baseline for reuse
    await this.storeBaseline(baseline);

    return baseline;
  }

  /**
   * Calculate percentile value from sorted array
   * Uses linear interpolation for fractional indices
   */
  private static calculatePercentile(sortedData: number[], percentile: number): number {
    if (sortedData.length === 0) return 0;
    if (sortedData.length === 1) return sortedData[0];

    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sortedData[lower];
    }

    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  /**
   * Normalize a raw score to 0-100 scale using personal baseline
   */
  static async normalizeScore(
    userId: string,
    metricType: string,
    rawScore: number
  ): Promise<NormalizedScore> {
    // Get or calculate baseline
    let baseline = await this.getBaseline(userId, metricType);

    // If baseline doesn't exist or is expired, calculate new one
    if (!baseline || new Date() > baseline.validUntil) {
      try {
        baseline = await this.calculateBaseline(userId, metricType);
      } catch (error) {
        // Not enough data for personal baseline, use default normalization
        return this.defaultNormalization(rawScore, metricType);
      }
    }

    // Normalize using p10 (0) and p90 (100) as bounds
    const { p10, p90 } = baseline.percentiles;
    const range = p90 - p10;

    let normalizedScore: number;
    if (range === 0) {
      // No variation in data, score at 50
      normalizedScore = 50;
    } else {
      normalizedScore = ((rawScore - p10) / range) * 100;
      // Clamp to 0-100
      normalizedScore = Math.max(0, Math.min(100, normalizedScore));
    }

    // Calculate percentile rank (where does this score fall?)
    const percentileRank = this.calculatePercentileRank(rawScore, baseline);

    // Generate context
    const context = this.generateContext(percentileRank, rawScore, baseline);

    return {
      rawScore,
      normalizedScore: parseFloat(normalizedScore.toFixed(1)),
      percentileRank: Math.round(percentileRank),
      context,
      baseline
    };
  }

  /**
   * Calculate what percentile the score falls into
   */
  private static calculatePercentileRank(
    score: number,
    baseline: PersonalBaseline
  ): number {
    const { p10, p25, p50, p75, p90 } = baseline.percentiles;

    if (score <= p10) return 5; // Bottom 10%
    if (score <= p25) return 17.5; // Between 10-25%
    if (score <= p50) return 37.5; // Between 25-50%
    if (score <= p75) return 62.5; // Between 50-75%
    if (score <= p90) return 82.5; // Between 75-90%
    return 95; // Top 10%
  }

  /**
   * Generate human-readable context for the score
   */
  private static generateContext(
    percentileRank: number,
    rawScore: number,
    baseline: PersonalBaseline
  ): string {
    const { p50, p75, p90 } = baseline.percentiles;

    if (percentileRank >= 90) {
      return `exceptional for you (top 10%)`;
    } else if (percentileRank >= 75) {
      return `above your average (top 25%)`;
    } else if (percentileRank >= 50) {
      return `around your typical level`;
    } else if (percentileRank >= 25) {
      return `below your usual average`;
    } else {
      return `lower than usual (bottom 25%)`;
    }
  }

  /**
   * Default normalization when no personal baseline exists
   */
  private static defaultNormalization(
    rawScore: number,
    metricType: string
  ): NormalizedScore {
    // Default scales for different metrics
    const scales: { [key: string]: { min: number; max: number } } = {
      mood: { min: 1, max: 5 },
      sleep_hours: { min: 4, max: 10 },
      sleep_quality: { min: 1, max: 5 },
      clarity: { min: 0, max: 10 },
      productivity: { min: 1, max: 5 }
    };

    const scale = scales[metricType] || { min: 0, max: 10 };
    const range = scale.max - scale.min;
    const normalizedScore = ((rawScore - scale.min) / range) * 100;

    return {
      rawScore,
      normalizedScore: Math.max(0, Math.min(100, parseFloat(normalizedScore.toFixed(1)))),
      percentileRank: 50, // Unknown without personal data
      context: 'insufficient personal data for comparison',
      baseline: this.createDefaultBaseline(metricType, scale)
    };
  }

  /**
   * Create a default baseline for metrics without personal data
   */
  private static createDefaultBaseline(
    metricType: string,
    scale: { min: number; max: number }
  ): PersonalBaseline {
    const range = scale.max - scale.min;
    const now = new Date();

    return {
      userId: '',
      metricType,
      percentiles: {
        p10: scale.min + range * 0.1,
        p25: scale.min + range * 0.25,
        p50: scale.min + range * 0.5,
        p75: scale.min + range * 0.75,
        p90: scale.min + range * 0.9
      },
      sampleSize: 0,
      dataRange: {
        min: scale.min,
        max: scale.max,
        mean: scale.min + range * 0.5,
        stdDev: 0
      },
      lastCalculated: now,
      validUntil: now
    };
  }

  /**
   * Batch normalize multiple scores
   */
  static async normalizeBatch(
    userId: string,
    scores: Array<{ metricType: string; rawScore: number }>
  ): Promise<NormalizedScore[]> {
    return Promise.all(
      scores.map(({ metricType, rawScore }) =>
        this.normalizeScore(userId, metricType, rawScore)
      )
    );
  }

  /**
   * Calculate unified wellness score (0-100) from multiple normalized metrics
   */
  static calculateUnifiedWellnessScore(
    normalizedScores: { [metricType: string]: number }
  ): number {
    // Weighted average based on metric importance
    const weights: { [key: string]: number } = {
      mood: 0.3,
      sleep_hours: 0.25,
      sleep_quality: 0.15,
      clarity: 0.15,
      productivity: 0.15
    };

    let totalWeight = 0;
    let weightedSum = 0;

    Object.entries(normalizedScores).forEach(([metricType, score]) => {
      const weight = weights[metricType] || 0.1;
      weightedSum += score * weight;
      totalWeight += weight;
    });

    if (totalWeight === 0) return 0;

    return parseFloat((weightedSum / totalWeight).toFixed(1));
  }

  /**
   * Fetch metric history from services
   */
  private static async fetchMetricHistory(
    userId: string,
    metricType: string,
    lookbackDays: number
  ): Promise<number[]> {
    // Import services dynamically to avoid circular dependencies
    const { MoodsService } = await import('../moods.service');
    const { SleepService } = await import('../sleep.service');
    const { MentalClarityService } = await import('../mentalClarity.service');
    const { ProductivityService } = await import('../productivity.service');

    // Calculate date range
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - lookbackDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    const values: number[] = [];

    try {
      switch (metricType) {
        case 'mood': {
          const moodsResult = await MoodsService.getByDateRange(userId, startDateStr, endDate);
          if (moodsResult.data) {
            values.push(...moodsResult.data.map(m => m.score));
          }
          break;
        }

        case 'sleep_hours': {
          const sleepResult = await SleepService.getByDateRange(userId, startDateStr, endDate);
          if (sleepResult.data) {
            values.push(...sleepResult.data.map(s => Number(s.hours)));
          }
          break;
        }

        case 'sleep_quality': {
          const sleepResult = await SleepService.getByDateRange(userId, startDateStr, endDate);
          if (sleepResult.data) {
            values.push(...sleepResult.data.map(s => Number(s.quality)));
          }
          break;
        }

        case 'clarity': {
          const clarityResult = await MentalClarityService.getByDateRange(userId, startDateStr, endDate);
          if (clarityResult.data) {
            values.push(...clarityResult.data.map(c => c.score));
          }
          break;
        }

        case 'productivity': {
          const productivityResult = await ProductivityService.getByDateRange(userId, startDateStr, endDate);
          if (productivityResult.data) {
            values.push(...productivityResult.data.map(p => p.rating));
          }
          break;
        }

        default:
          console.warn(`Unknown metric type: ${metricType}`);
      }
    } catch (error) {
      console.error(`Error fetching ${metricType} history:`, error);
    }

    return values;
  }

  /**
   * Store baseline in local storage or database
   * Placeholder - will be implemented with actual storage
   */
  private static async storeBaseline(baseline: PersonalBaseline): Promise<void> {
    // TODO: Implement storage (could use AsyncStorage or database)
    // For now, baselines will be recalculated on each request
  }

  /**
   * Retrieve baseline from storage
   * Placeholder - will be implemented with actual retrieval
   */
  private static async getBaseline(
    userId: string,
    metricType: string
  ): Promise<PersonalBaseline | null> {
    // TODO: Implement retrieval from storage
    return null;
  }

  /**
   * Generate insight about score relative to baseline
   */
  static generateBaselineInsight(normalized: NormalizedScore): string {
    const { rawScore, percentileRank, baseline, context } = normalized;

    const metricLabel = this.getMetricLabel(baseline.metricType);
    const scoreText = this.formatScore(rawScore, baseline.metricType);

    if (percentileRank >= 90) {
      return `🌟 Your ${metricLabel} (${scoreText}) is ${context}. Excellent!`;
    } else if (percentileRank >= 75) {
      return `📈 Your ${metricLabel} (${scoreText}) is ${context}. Great work!`;
    } else if (percentileRank >= 50) {
      return `✓ Your ${metricLabel} (${scoreText}) is ${context}.`;
    } else if (percentileRank >= 25) {
      return `📊 Your ${metricLabel} (${scoreText}) is ${context}. Room for improvement.`;
    } else {
      return `⚠️ Your ${metricLabel} (${scoreText}) is ${context}. Consider focusing on this.`;
    }
  }

  /**
   * Get human-readable metric label
   */
  private static getMetricLabel(metricType: string): string {
    const labels: { [key: string]: string } = {
      mood: 'mood score',
      sleep_hours: 'sleep duration',
      sleep_quality: 'sleep quality',
      clarity: 'mental clarity',
      productivity: 'productivity rating'
    };
    return labels[metricType] || metricType;
  }

  /**
   * Format score with appropriate units
   */
  private static formatScore(score: number, metricType: string): string {
    if (metricType === 'sleep_hours') {
      return `${score.toFixed(1)}h`;
    } else if (metricType === 'clarity') {
      return `${score.toFixed(1)}/10`;
    } else {
      return `${score.toFixed(1)}/5`;
    }
  }
}
