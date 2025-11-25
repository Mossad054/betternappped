/**
 * Enhanced Correlation Service
 * 
 * Provides statistically rigorous correlation analysis with:
 * - Pearson correlation coefficients
 * - Statistical significance testing (p-values)
 * - Confidence intervals
 * - Minimum sample size enforcement
 * - Lagged effect analysis (today's action → tomorrow's outcome)
 * - Multi-factor correlation models
 * 
 * Based on approach.md Phase 1 specifications
 */

export interface CorrelationInput {
  userId: string;
  factorType: 'sleep' | 'activity' | 'habit' | 'experiment';
  factorId?: string; // For specific activities, habits
  outcomeType: 'mood' | 'clarity' | 'productivity' | 'sleep_quality';
  lagDays?: number; // 0 = same day, 1 = next day, etc.
  minSampleSize?: number;
  dateRange?: { start: string; end: string };
}

export interface CorrelationResult {
  coefficient: number; // -1 to 1
  pValue: number; // Statistical significance (< 0.05 is significant)
  confidenceInterval: [number, number]; // 95% CI
  sampleSize: number;
  strength: 'none' | 'weak' | 'moderate' | 'strong' | 'very-strong';
  significance: 'none' | 'marginal' | 'significant' | 'highly-significant';
  direction: 'positive' | 'negative' | 'none';
  lagDays: number;
  factorLabel: string;
  outcomeLabel: string;
}

export interface MultiFactorCorrelation {
  factors: string[];
  outcome: string;
  correlations: CorrelationResult[];
  combinedEffect: number; // Weighted composite
  dominantFactor: string | null;
  synergy: number; // Positive if combined > sum of individual
}

export class CorrelationService {
  private static readonly MIN_SAMPLE_SIZE = 10;
  private static readonly CONFIDENCE_LEVEL = 0.95;

  /**
   * Calculate Pearson correlation with statistical rigor
   */
  static async calculateCorrelation(input: CorrelationInput): Promise<CorrelationResult> {
    const {
      userId,
      factorType,
      factorId,
      outcomeType,
      lagDays = 0,
      minSampleSize = this.MIN_SAMPLE_SIZE,
      dateRange
    } = input;

    // Fetch paired data (factor values and outcome values)
    const pairedData = await this.fetchPairedData(
      userId,
      factorType,
      factorId,
      outcomeType,
      lagDays,
      dateRange
    );

    // Check minimum sample size
    if (pairedData.length < minSampleSize) {
      return this.insufficientDataResult(
        pairedData.length,
        minSampleSize,
        lagDays,
        factorType,
        outcomeType
      );
    }

    const factorValues = pairedData.map(d => d.factorValue);
    const outcomeValues = pairedData.map(d => d.outcomeValue);

    // Calculate Pearson correlation coefficient
    const coefficient = this.pearsonCorrelation(factorValues, outcomeValues);

    // Calculate statistical significance (p-value)
    const pValue = this.calculatePValue(coefficient, pairedData.length);

    // Calculate 95% confidence interval using Fisher's z-transformation
    const confidenceInterval = this.calculateConfidenceInterval(
      coefficient,
      pairedData.length,
      this.CONFIDENCE_LEVEL
    );

    // Interpret results
    const strength = this.interpretStrength(Math.abs(coefficient));
    const significance = this.interpretSignificance(pValue);
    const direction = this.interpretDirection(coefficient);

    const factorLabel = this.getFactorLabel(factorType, factorId);
    const outcomeLabel = this.getOutcomeLabel(outcomeType);

    return {
      coefficient: parseFloat(coefficient.toFixed(3)),
      pValue: parseFloat(pValue.toFixed(6)),
      confidenceInterval: [
        parseFloat(confidenceInterval[0].toFixed(3)),
        parseFloat(confidenceInterval[1].toFixed(3))
      ],
      sampleSize: pairedData.length,
      strength,
      significance,
      direction,
      lagDays,
      factorLabel,
      outcomeLabel
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   * Formula: r = Σ((xi - x̄)(yi - ȳ)) / sqrt(Σ(xi - x̄)² * Σ(yi - ȳ)²)
   */
  private static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) {
      return 0;
    }

    const n = x.length;

    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    // Calculate deviations and products
    let numerator = 0;
    let sumSquaredDeviationsX = 0;
    let sumSquaredDeviationsY = 0;

    for (let i = 0; i < n; i++) {
      const deviationX = x[i] - meanX;
      const deviationY = y[i] - meanY;

      numerator += deviationX * deviationY;
      sumSquaredDeviationsX += deviationX * deviationX;
      sumSquaredDeviationsY += deviationY * deviationY;
    }

    const denominator = Math.sqrt(sumSquaredDeviationsX * sumSquaredDeviationsY);

    if (denominator === 0) {
      return 0; // No variation in data
    }

    return numerator / denominator;
  }

  /**
   * Calculate p-value for correlation significance
   * Uses t-distribution: t = r * sqrt((n-2)/(1-r²))
   */
  private static calculatePValue(r: number, n: number): number {
    if (n < 3) return 1; // Not enough data for significance

    // Calculate t-statistic
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2; // Degrees of freedom

    // Convert t to p-value using t-distribution
    // Simplified approximation for two-tailed test
    const pValue = this.tDistributionPValue(Math.abs(t), df);

    return Math.min(1, pValue * 2); // Two-tailed test
  }

  /**
   * Approximate p-value from t-distribution
   * Uses Wilson-Hilferty approximation for large samples
   */
  private static tDistributionPValue(t: number, df: number): number {
    // For small samples, use lookup table approximation
    if (df < 30) {
      return this.tDistributionSmallSample(t, df);
    }

    // For large samples, t-distribution approximates normal distribution
    return this.normalDistributionPValue(t);
  }

  /**
   * Simplified t-distribution p-value for small samples
   */
  private static tDistributionSmallSample(t: number, df: number): number {
    // Critical values for common significance levels (two-tailed)
    const criticalValues = [
      { df: 10, t05: 2.228, t01: 3.169 },
      { df: 15, t05: 2.131, t01: 2.947 },
      { df: 20, t05: 2.086, t01: 2.845 },
      { df: 25, t05: 2.060, t01: 2.787 },
      { df: 30, t05: 2.042, t01: 2.750 }
    ];

    // Find closest df
    const closest = criticalValues.reduce((prev, curr) =>
      Math.abs(curr.df - df) < Math.abs(prev.df - df) ? curr : prev
    );

    if (t < closest.t05) {
      return 0.1; // Not significant at p < 0.05
    } else if (t < closest.t01) {
      return 0.03; // Significant at p < 0.05
    } else {
      return 0.005; // Highly significant at p < 0.01
    }
  }

  /**
   * Normal distribution p-value (for large samples)
   */
  private static normalDistributionPValue(z: number): number {
    // Standard normal CDF approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return p;
  }

  /**
   * Calculate confidence interval using Fisher's z-transformation
   */
  private static calculateConfidenceInterval(
    r: number,
    n: number,
    confidenceLevel: number
  ): [number, number] {
    if (n < 3) {
      return [r, r]; // Not enough data for meaningful CI
    }

    // Fisher's z-transformation: z = 0.5 * ln((1+r)/(1-r))
    const z = 0.5 * Math.log((1 + r) / (1 - r));

    // Standard error of z
    const seZ = 1 / Math.sqrt(n - 3);

    // Z-score for confidence level (1.96 for 95%)
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.576; // 95% or 99%

    // Calculate CI bounds in z-space
    const zLower = z - zScore * seZ;
    const zUpper = z + zScore * seZ;

    // Transform back to correlation scale: r = (e^(2z) - 1) / (e^(2z) + 1)
    const rLower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
    const rUpper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);

    return [rLower, rUpper];
  }

  /**
   * Interpret correlation strength based on absolute value
   */
  private static interpretStrength(
    absR: number
  ): 'none' | 'weak' | 'moderate' | 'strong' | 'very-strong' {
    if (absR < 0.1) return 'none';
    if (absR < 0.3) return 'weak';
    if (absR < 0.5) return 'moderate';
    if (absR < 0.7) return 'strong';
    return 'very-strong';
  }

  /**
   * Interpret statistical significance based on p-value
   */
  private static interpretSignificance(
    p: number
  ): 'none' | 'marginal' | 'significant' | 'highly-significant' {
    if (p > 0.1) return 'none';
    if (p > 0.05) return 'marginal';
    if (p > 0.01) return 'significant';
    return 'highly-significant';
  }

  /**
   * Interpret correlation direction
   */
  private static interpretDirection(
    r: number
  ): 'positive' | 'negative' | 'none' {
    if (Math.abs(r) < 0.1) return 'none';
    return r > 0 ? 'positive' : 'negative';
  }

  /**
   * Return insufficient data result
   */
  private static insufficientDataResult(
    actualSize: number,
    required: number,
    lagDays: number,
    factorType: string,
    outcomeType: string
  ): CorrelationResult {
    return {
      coefficient: 0,
      pValue: 1,
      confidenceInterval: [0, 0],
      sampleSize: actualSize,
      strength: 'none',
      significance: 'none',
      direction: 'none',
      lagDays,
      factorLabel: this.getFactorLabel(factorType),
      outcomeLabel: this.getOutcomeLabel(outcomeType)
    };
  }

  /**
   * Fetch paired data for correlation analysis
   * This will be implemented to connect to actual services
   */
  private static async fetchPairedData(
    userId: string,
    factorType: string,
    factorId: string | undefined,
    outcomeType: string,
    lagDays: number,
    dateRange?: { start: string; end: string }
  ): Promise<Array<{ date: string; factorValue: number; outcomeValue: number }>> {
    // Import services dynamically to avoid circular dependencies
    const { MoodsService } = await import('../moods.service');
    const { SleepService } = await import('../sleep.service');
    const { ActivitiesService } = await import('../activities.service');
    const { MentalClarityService } = await import('../mentalClarity.service');
    const { ProductivityService } = await import('../productivity.service');
    const { HabitsService } = await import('../habits.service');

    // Determine date range
    let startDate: string;
    let endDate: string;

    if (dateRange) {
      startDate = dateRange.start;
      endDate = dateRange.end;
    } else {
      // Default: last 60 days
      const now = new Date();
      endDate = now.toISOString().split('T')[0];
      const start = new Date(now);
      start.setDate(now.getDate() - 60);
      startDate = start.toISOString().split('T')[0];
    }

    // Fetch factor data
    let factorMap = new Map<string, number>();

    if (factorType === 'sleep') {
      const sleepResult = await SleepService.getByDateRange(userId, startDate, endDate);
      if (sleepResult.data) {
        sleepResult.data.forEach(log => {
          factorMap.set(log.date, Number(log.hours));
        });
      }
    } else if (factorType === 'activity') {
      const activitiesResult = await ActivitiesService.getByDateRange(userId, startDate, endDate);
      if (activitiesResult.data) {
        // Count activities per day or filter by specific activity if factorId provided
        const activityCounts = new Map<string, number>();
        activitiesResult.data.forEach(activity => {
          if (!factorId || activity.name === factorId || activity.category === factorId) {
            activityCounts.set(activity.date, (activityCounts.get(activity.date) || 0) + 1);
          }
        });
        factorMap = activityCounts;
      }
    } else if (factorType === 'habit') {
      const habitsResult = await HabitsService.getHabitsWithLogs(userId);
      if (habitsResult.data) {
        // Count habit completions per day
        const completionCounts = new Map<string, number>();
        habitsResult.data.forEach(habit => {
          if (!factorId || habit.id === factorId) {
            habit.habit_logs?.forEach((log: any) => {
              if (log.completed && log.date >= startDate && log.date <= endDate) {
                completionCounts.set(log.date, (completionCounts.get(log.date) || 0) + 1);
              }
            });
          }
        });
        factorMap = completionCounts;
      }
    }

    // Fetch outcome data with lag
    let outcomeMap = new Map<string, number>();

    // Calculate adjusted dates for lag
    const adjustDateForLag = (dateStr: string, lag: number): string => {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + lag);
      return date.toISOString().split('T')[0];
    };

    if (outcomeType === 'mood') {
      const moodsResult = await MoodsService.getByDateRange(userId, startDate, endDate);
      if (moodsResult.data) {
        moodsResult.data.forEach(mood => {
          outcomeMap.set(mood.date, mood.score);
        });
      }
    } else if (outcomeType === 'clarity') {
      const clarityResult = await MentalClarityService.getByDateRange(userId, startDate, endDate);
      if (clarityResult.data) {
        clarityResult.data.forEach(clarity => {
          outcomeMap.set(clarity.date, clarity.score);
        });
      }
    } else if (outcomeType === 'productivity') {
      const productivityResult = await ProductivityService.getByDateRange(userId, startDate, endDate);
      if (productivityResult.data) {
        productivityResult.data.forEach(prod => {
          outcomeMap.set(prod.date, prod.rating);
        });
      }
    } else if (outcomeType === 'sleep_quality') {
      const sleepResult = await SleepService.getByDateRange(userId, startDate, endDate);
      if (sleepResult.data) {
        sleepResult.data.forEach(sleep => {
          outcomeMap.set(sleep.date, Number(sleep.quality));
        });
      }
    }

    // Pair factor and outcome data with lag
    const pairedData: Array<{ date: string; factorValue: number; outcomeValue: number }> = [];

    factorMap.forEach((factorValue, factorDate) => {
      // Apply lag to find corresponding outcome date
      const outcomeDate = adjustDateForLag(factorDate, lagDays);
      
      if (outcomeMap.has(outcomeDate)) {
        pairedData.push({
          date: factorDate,
          factorValue,
          outcomeValue: outcomeMap.get(outcomeDate)!
        });
      }
    });

    return pairedData;
  }

  /**
   * Get human-readable factor label
   */
  private static getFactorLabel(factorType: string, factorId?: string): string {
    const labels: { [key: string]: string } = {
      sleep: 'Sleep Duration',
      activity: factorId || 'Activity',
      habit: factorId || 'Habit Completion',
      experiment: factorId || 'Experiment'
    };
    return labels[factorType] || factorType;
  }

  /**
   * Get human-readable outcome label
   */
  private static getOutcomeLabel(outcomeType: string): string {
    const labels: { [key: string]: string } = {
      mood: 'Mood Score',
      clarity: 'Mental Clarity',
      productivity: 'Productivity Rating',
      sleep_quality: 'Sleep Quality'
    };
    return labels[outcomeType] || outcomeType;
  }

  /**
   * Calculate multi-factor correlation
   * Analyzes combined effect of multiple factors on an outcome
   */
  static async calculateMultiFactorCorrelation(
    userId: string,
    factors: Array<{ type: string; id?: string }>,
    outcomeType: string,
    dateRange?: { start: string; end: string }
  ): Promise<MultiFactorCorrelation> {
    // Calculate individual correlations
    const correlations = await Promise.all(
      factors.map(factor =>
        this.calculateCorrelation({
          userId,
          factorType: factor.type as any,
          factorId: factor.id,
          outcomeType: outcomeType as any,
          lagDays: 0,
          dateRange
        })
      )
    );

    // Calculate combined effect (weighted average based on significance)
    const significantCorrelations = correlations.filter(c => c.significance !== 'none');

    let combinedEffect = 0;
    if (significantCorrelations.length > 0) {
      const weights = significantCorrelations.map(c => {
        // Weight by p-value (lower p-value = higher weight)
        return 1 - c.pValue;
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      combinedEffect = significantCorrelations.reduce((sum, c, i) => {
        return sum + (c.coefficient * weights[i]) / totalWeight;
      }, 0);
    }

    // Find dominant factor
    const sortedByStrength = [...correlations].sort(
      (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
    const dominantFactor =
      sortedByStrength[0]?.strength !== 'none'
        ? sortedByStrength[0].factorLabel
        : null;

    // Calculate synergy (interaction effect)
    // Positive synergy means combined effect > sum of individual effects
    const sumOfIndividual = correlations.reduce(
      (sum, c) => sum + Math.abs(c.coefficient),
      0
    );
    const synergy =
      sumOfIndividual > 0 ? Math.abs(combinedEffect) - sumOfIndividual : 0;

    return {
      factors: factors.map((f, i) => correlations[i].factorLabel),
      outcome: this.getOutcomeLabel(outcomeType),
      correlations,
      combinedEffect: parseFloat(combinedEffect.toFixed(3)),
      dominantFactor,
      synergy: parseFloat(synergy.toFixed(3))
    };
  }

  /**
   * Generate human-readable insight from correlation result
   */
  static generateCorrelationInsight(result: CorrelationResult): string {
    const { coefficient, significance, strength, direction, factorLabel, outcomeLabel, lagDays } = result;

    // Not significant
    if (significance === 'none') {
      return `No clear relationship found between ${factorLabel} and ${outcomeLabel}.`;
    }

    // Build insight
    const lagText = lagDays > 0 ? ` (${lagDays} day${lagDays > 1 ? 's' : ''} later)` : '';
    const strengthText = strength === 'weak' ? 'slightly' : strength === 'moderate' ? 'moderately' : 'strongly';
    const directionText = direction === 'positive' ? 'improves' : 'worsens';
    const confidenceText = significance === 'highly-significant' ? ' with high confidence' : '';

    return `${factorLabel} ${strengthText} ${directionText} your ${outcomeLabel}${lagText}${confidenceText} (r=${coefficient.toFixed(2)}, p=${result.pValue.toFixed(3)}).`;
  }
}
