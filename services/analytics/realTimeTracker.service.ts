/**
 * Real-Time Impact Tracker Service
 * 
 * Provides instant feedback when users log activities or outcomes
 * - Predicts expected impact based on historical data
 * - Compares actual outcomes to expected
 * - Generates real-time insights
 * 
 * Based on AI_RECOMMENDATIONS_IMPLEMENTATION.md specifications
 */

export interface InstantFeedback {
  hasData: boolean;
  message: string;
  predictions: ActivityPredictions | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

export interface ActivityPredictions {
  mood: OutcomePrediction | null;
  sleep: OutcomePrediction | null;
  clarity: OutcomePrediction | null;
  productivity: OutcomePrediction | null;
}

export interface OutcomePrediction {
  expectedChange: number; // Expected delta from baseline
  confidence: 'high' | 'medium' | 'low';
  direction: 'improves' | 'worsens' | 'no-effect';
  description: string;
  timeframe: 'immediate' | 'next-day' | 'both';
}

export interface OutcomeComparison {
  hasRelevantActivities: boolean;
  message: string | null;
  actualVsExpected: {
    actual: number;
    expected: number;
    difference: number;
    interpretation: string;
  } | null;
}

export class RealTimeImpactTrackerService {
  
  /**
   * Called when user logs a new activity
   * Provides immediate feedback based on historical correlations
   */
  static async onActivityLogged(
    userId: string,
    activityName: string,
    activityDate: string
  ): Promise<InstantFeedback> {
    console.log(`🎯 Generating instant feedback for: ${activityName}`);

    try {
      // Check if we have existing correlation data for this activity
      const correlations = await this.getExistingCorrelations(userId, activityName);

      if (!correlations || correlations.length === 0) {
        return {
          hasData: false,
          message: `Great! We'll start tracking how ${activityName} affects your wellbeing. Keep logging to see patterns!`,
          predictions: null,
          confidence: 'none'
        };
      }

      // Generate predictions based on historical data
      const predictions = this.generatePredictions(correlations);
      
      // Determine overall confidence
      const confidence = this.determineOverallConfidence(correlations);

      // Create instant feedback message
      const message = this.createFeedbackMessage(activityName, predictions, confidence);

      return {
        hasData: true,
        message,
        predictions,
        confidence
      };
    } catch (error) {
      console.error('Error generating instant feedback:', error);
      return {
        hasData: false,
        message: `${activityName} logged successfully!`,
        predictions: null,
        confidence: 'none'
      };
    }
  }

  /**
   * Called when user logs mood/sleep after an activity
   * Shows how today compares to typical impact
   */
  static async onOutcomeLogged(
    userId: string,
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'productivity',
    outcomeValue: number,
    date: string
  ): Promise<OutcomeComparison> {
    console.log(`📊 Comparing ${outcomeType} outcome: ${outcomeValue}`);

    try {
      // Get activities done today or yesterday (depending on outcome type)
      const relevantDate = outcomeType === 'sleep' 
        ? this.addDays(date, -1) // Sleep is affected by previous day's activities
        : date;

      const recentActivities = await this.getActivitiesOnDate(userId, relevantDate);

      if (recentActivities.length === 0) {
        return {
          hasRelevantActivities: false,
          message: null,
          actualVsExpected: null
        };
      }

      // Get expected impacts based on activities
      const expectedImpacts = await this.getExpectedImpacts(
        userId,
        recentActivities,
        outcomeType
      );

      if (expectedImpacts.length === 0) {
        return {
          hasRelevantActivities: true,
          message: `We're tracking how your activities today affect ${outcomeType}. Log consistently to see patterns!`,
          actualVsExpected: null
        };
      }

      // Calculate combined expected change
      const expectedChange = expectedImpacts.reduce(
        (sum, impact) => sum + impact.expectedChange,
        0
      );

      // Get baseline for comparison
      const baseline = await this.getBaselineForOutcome(userId, outcomeType);
      
      // Compare actual vs expected
      const actualChange = outcomeValue - baseline;
      const difference = actualChange - expectedChange;

      // Generate interpretation
      const interpretation = this.interpretComparison(
        difference,
        outcomeType,
        recentActivities.map(a => a.name)
      );

      const message = this.createComparisonMessage(
        outcomeType,
        actualChange,
        expectedChange,
        interpretation
      );

      return {
        hasRelevantActivities: true,
        message,
        actualVsExpected: {
          actual: actualChange,
          expected: expectedChange,
          difference,
          interpretation
        }
      };
    } catch (error) {
      console.error('Error comparing outcome:', error);
      return {
        hasRelevantActivities: false,
        message: null,
        actualVsExpected: null
      };
    }
  }

  /**
   * Get existing correlation data for an activity
   */
  private static async getExistingCorrelations(
    userId: string,
    activityName: string
  ): Promise<any[]> {
    try {
      const { SupabaseSafe } = await import('../../lib/supabaseSafe');

      const result = await SupabaseSafe.select(
        'activity_outcome_correlations',
        { 
          user_id: userId,
          activity_name: activityName,
          is_valid: true
        },
        userId
      );

      if (result.error) {
        console.warn('Error fetching correlations:', result.error);
        return [];
      }

      return result.data || [];
    } catch (error) {
      console.warn('Error in getExistingCorrelations:', error);
      return [];
    }
  }

  /**
   * Generate predictions from correlation data
   */
  private static generatePredictions(correlations: any[]): ActivityPredictions {
    const predictions: ActivityPredictions = {
      mood: null,
      sleep: null,
      clarity: null,
      productivity: null
    };

    for (const corr of correlations) {
      const outcomeType = corr.outcome_type as keyof ActivityPredictions;
      
      // Only predict if impact is significant
      if (corr.statistical_significance === 'none') continue;

      const prediction: OutcomePrediction = {
        expectedChange: corr.next_day_impact || 0,
        confidence: this.mapSignificanceToConfidence(corr.statistical_significance),
        direction: corr.impact_direction,
        description: this.formatPredictionDescription(
          outcomeType,
          corr.next_day_impact,
          corr.same_day_impact,
          corr.impact_direction
        ),
        timeframe: this.determineTimeframe(
          corr.same_day_impact,
          corr.next_day_impact
        )
      };

      predictions[outcomeType] = prediction;
    }

    return predictions;
  }

  /**
   * Determine overall confidence from correlations
   */
  private static determineOverallConfidence(correlations: any[]): 'high' | 'medium' | 'low' | 'none' {
    if (correlations.length === 0) return 'none';

    const significantCount = correlations.filter(
      c => c.statistical_significance === 'significant' || 
           c.statistical_significance === 'highly-significant'
    ).length;

    const avgOccurrences = correlations.reduce(
      (sum, c) => sum + (c.total_occurrences || 0),
      0
    ) / correlations.length;

    if (significantCount >= 2 && avgOccurrences >= 10) return 'high';
    if (significantCount >= 1 && avgOccurrences >= 5) return 'medium';
    return 'low';
  }

  /**
   * Create feedback message for activity logging
   */
  private static createFeedbackMessage(
    activityName: string,
    predictions: ActivityPredictions,
    confidence: 'high' | 'medium' | 'low' | 'none'
  ): string {
    // Find most significant predictions
    const significantPredictions = Object.entries(predictions)
      .filter(([_, pred]) => pred !== null && Math.abs(pred.expectedChange) >= 0.2)
      .sort((a, b) => Math.abs(b[1]!.expectedChange) - Math.abs(a[1]!.expectedChange));

    if (significantPredictions.length === 0) {
      return `${activityName} logged! Based on your history, this activity has neutral effects.`;
    }

    const topPrediction = significantPredictions[0];
    const [outcome, pred] = topPrediction as [string, OutcomePrediction];

    const confidenceText = confidence === 'high' 
      ? ' (high confidence)' 
      : confidence === 'medium' 
      ? ' (moderate confidence)' 
      : '';

    return `${activityName} logged! ${pred!.description}${confidenceText}`;
  }

  /**
   * Format prediction description
   */
  private static formatPredictionDescription(
    outcomeType: string,
    nextDayChange: number,
    sameDayChange: number,
    direction: string
  ): string {
    if (Math.abs(nextDayChange) < 0.1 && Math.abs(sameDayChange) < 0.1) {
      return `No significant effect on ${outcomeType} expected`;
    }

    const primaryChange = Math.abs(nextDayChange) > Math.abs(sameDayChange)
      ? nextDayChange
      : sameDayChange;

    const timeframe = Math.abs(nextDayChange) > Math.abs(sameDayChange)
      ? 'tomorrow'
      : 'today';

    const magnitude = Math.abs(primaryChange) >= 1.0 
      ? 'significantly' 
      : Math.abs(primaryChange) >= 0.5 
      ? 'moderately' 
      : 'slightly';

    const verb = direction === 'improves' ? 'boost' : 'lower';

    return `Expect a ${magnitude} ${verb} in ${outcomeType} ${timeframe} (${this.formatChange(outcomeType, primaryChange)})`;
  }

  /**
   * Format change amount
   */
  private static formatChange(outcomeType: string, change: number): string {
    const sign = change > 0 ? '+' : '';
    switch (outcomeType) {
      case 'mood':
        return `${sign}${change.toFixed(1)} pts`;
      case 'sleep':
        return `${sign}${change.toFixed(1)} quality pts`;
      case 'clarity':
        return `${sign}${change.toFixed(1)} pts`;
      case 'productivity':
        return `${sign}${change.toFixed(1)} pts`;
      default:
        return `${sign}${change.toFixed(2)}`;
    }
  }

  /**
   * Determine timeframe for impact
   */
  private static determineTimeframe(
    sameDayImpact: number,
    nextDayImpact: number
  ): 'immediate' | 'next-day' | 'both' {
    const sameDayAbs = Math.abs(sameDayImpact || 0);
    const nextDayAbs = Math.abs(nextDayImpact || 0);

    if (sameDayAbs >= 0.2 && nextDayAbs >= 0.2) return 'both';
    if (sameDayAbs > nextDayAbs) return 'immediate';
    return 'next-day';
  }

  /**
   * Map statistical significance to confidence level
   */
  private static mapSignificanceToConfidence(
    significance: string
  ): 'high' | 'medium' | 'low' {
    switch (significance) {
      case 'highly-significant':
        return 'high';
      case 'significant':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get activities done on a specific date
   */
  private static async getActivitiesOnDate(
    userId: string,
    date: string
  ): Promise<Array<{ name: string; id: string }>> {
    try {
      const { ActivitiesService } = await import('../activities.service');
      
      const result = await ActivitiesService.getByDateRange(userId, date, date);
      
      if (!result.data) return [];

      return result.data.map(a => ({ name: a.name, id: a.id }));
    } catch (error) {
      console.warn('Error fetching activities:', error);
      return [];
    }
  }

  /**
   * Get expected impacts for activities
   */
  private static async getExpectedImpacts(
    userId: string,
    activities: Array<{ name: string; id: string }>,
    outcomeType: string
  ): Promise<Array<{ activityName: string; expectedChange: number }>> {
    const impacts: Array<{ activityName: string; expectedChange: number }> = [];

    for (const activity of activities) {
      const correlations = await this.getExistingCorrelations(userId, activity.name);
      
      const outcomeCorr = correlations.find(c => c.outcome_type === outcomeType);
      
      if (outcomeCorr && outcomeCorr.statistical_significance !== 'none') {
        impacts.push({
          activityName: activity.name,
          expectedChange: outcomeCorr.next_day_impact || 0
        });
      }
    }

    return impacts;
  }

  /**
   * Get baseline for an outcome
   */
  private static async getBaselineForOutcome(
    userId: string,
    outcomeType: string
  ): Promise<number> {
    try {
      const { BaselineService } = await import('./baseline.service');
      
      const baseline = await BaselineService.calculateBaseline(userId, outcomeType);
      
      return baseline.percentiles.p50; // Use median as baseline
    } catch (error) {
      console.warn('Error getting baseline:', error);
      // Return neutral baseline
      switch (outcomeType) {
        case 'mood':
          return 5;
        case 'sleep':
          return 7;
        case 'clarity':
          return 5;
        case 'productivity':
          return 5;
        default:
          return 5;
      }
    }
  }

  /**
   * Interpret comparison between actual and expected
   */
  private static interpretComparison(
    difference: number,
    outcomeType: string,
    activityNames: string[]
  ): string {
    const absDiff = Math.abs(difference);

    if (absDiff < 0.5) {
      return 'as-expected';
    } else if (difference > 0) {
      return 'better-than-expected';
    } else {
      return 'worse-than-expected';
    }
  }

  /**
   * Create comparison message
   */
  private static createComparisonMessage(
    outcomeType: string,
    actualChange: number,
    expectedChange: number,
    interpretation: string
  ): string {
    if (interpretation === 'as-expected') {
      return `Your ${outcomeType} is right on track with expectations!`;
    } else if (interpretation === 'better-than-expected') {
      const bonus = actualChange - expectedChange;
      return `Great! Your ${outcomeType} is ${this.formatChange(outcomeType, bonus)} better than expected!`;
    } else {
      const shortfall = expectedChange - actualChange;
      return `Your ${outcomeType} is ${this.formatChange(outcomeType, shortfall)} lower than expected. Consider your sleep and stress levels.`;
    }
  }

  /**
   * Helper: Add days to a date string
   */
  private static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
