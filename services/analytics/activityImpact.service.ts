/**
 * Enhanced Activity Impact Analyzer
 * 
 * Provides multi-dimensional activity impact analysis:
 * - Immediate effects (same-day impact)
 * - Next-day effects (lagged impact)
 * - Cumulative effects (long-term patterns)
 * - Statistical confidence levels
 * - Individual activity tracking (not just categories)
 * 
 * Based on approach.md Phase 1 specifications
 */

import { CorrelationService } from './correlation.service';

export interface ActivityImpactScore {
  immediate: number; // -1 to 1 (same-day change)
  nextDay: number; // -1 to 1 (next-day effect)
  cumulative: number; // -1 to 1 (7-day average effect)
  confidence: number; // 0-1 based on sample size
}

/**
 * Detailed impact record for a single activity occurrence
 * Tracks baseline → same-day → next-day progression with deltas
 */
export interface ImpactRecord {
  activityId: string;
  activityName: string;
  activityDate: string; // ISO date string
  
  // Baseline measurements (BEFORE activity effect)
  baseline: {
    mood: number | null;
    anxiety: number | null;
    clarity: number | null;
    productivity: number | null;
  };
  
  // Same-day outcomes (AFTER activity, typically afternoon/evening)
  sameDay: {
    mood: number | null;
    anxiety: number | null;
    clarity: number | null;
    productivity: number | null;
  };
  
  // Next-day outcomes
  nextDay: {
    mood: number | null;
    sleepQuality: number | null;
    sleepHours: number | null;
    clarity: number | null;
    productivity: number | null;
    anxiety: number | null;
  };
  
  // Calculated deltas (change from baseline)
  deltas: {
    moodSameDay: number | null;
    moodNextDay: number | null;
    claritySameDay: number | null;
    clarityNextDay: number | null;
    productivitySameDay: number | null;
    productivityNextDay: number | null;
    anxietySameDay: number | null; // Note: reduction is positive
    anxietyNextDay: number | null;
    sleepQuality: number | null;
    sleepHours: number | null;
  };
}

/**
 * Baseline measurements before activity can take effect
 */
export interface BaselineMeasures {
  mood: number;
  anxiety: number | null;
  clarity: number | null;
  productivity: number | null;
}

/**
 * Enhanced outcome impact with statistical rigor
 */
export interface OutcomeImpact {
  sameDayChange: number; // Average delta on same day
  nextDayChange: number; // Average delta next day
  sustainedChange: number; // Average delta over 3-7 days
  
  correlationCoefficient: number; // Pearson r
  pValue: number; // Statistical significance
  confidenceInterval: [number, number]; // 95% CI
  
  interpretation: {
    strength: 'none' | 'weak' | 'moderate' | 'strong' | 'very-strong';
    direction: 'improves' | 'worsens' | 'no-effect';
    confidence: 'low' | 'medium' | 'high' | 'very-high';
    description: string; // Human-readable summary
  };
  
  sampleSize: number;
  sufficientData: boolean;
}

export interface EnhancedActivityImpact {
  activityName: string;
  category: string;
  emoji: string;
  occurrences: number;
  frequencyPercent: number;
  
  // Multi-dimensional impact scores
  impacts: {
    mood: ActivityImpactScore;
    sleep: ActivityImpactScore;
    clarity: ActivityImpactScore;
    productivity: ActivityImpactScore;
  };
  
  // Overall metrics
  overallBenefit: number; // 0-100 composite score
  trend: 'improving' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
  
  // Statistical data
  correlations: {
    mood: number;
    sleep: number;
    clarity: number;
    productivity: number;
  };
  
  // Personalized insights
  recommendation: string;
  bestTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  timingReason?: string; // Explanation for timing recommendation
  optimalFrequency?: number; // Times per week
  frequencyReason?: string; // Explanation for frequency recommendation
}

export interface ActivityImpactAnalysisResult {
  activities: EnhancedActivityImpact[];
  insights: string[];
  period: string;
  totalActivities: number;
  topPositive: string | null;
  needsAttention: string | null;
}

export class ActivityImpactService {
  private static readonly MIN_OCCURRENCES = 3;
  private static readonly MIN_PAIRED_DATA = 3; // Minimum paired outcome measurements

  /**
   * Analyze activity impacts with multi-dimensional scoring
   */
  static async analyzeActivities(
    userId: string,
    period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<ActivityImpactAnalysisResult> {
    // Import services
    const { ActivitiesService } = await import('../activities.service');
    const { MoodsService } = await import('../moods.service');
    const { SleepService } = await import('../sleep.service');
    const { MentalClarityService } = await import('../mentalClarity.service');
    const { ProductivityService } = await import('../productivity.service');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch all data
    const [activitiesResult, moodsResult, sleepResult, clarityResult, productivityResult] = 
      await Promise.all([
        ActivitiesService.getByDateRange(userId, startDateStr, endDateStr),
        MoodsService.getByDateRange(userId, startDateStr, endDateStr),
        SleepService.getByDateRange(userId, startDateStr, endDateStr),
        MentalClarityService.getByDateRange(userId, startDateStr, endDateStr),
        ProductivityService.getByDateRange(userId, startDateStr, endDateStr)
      ]);

    if (!activitiesResult.data || activitiesResult.data.length === 0) {
      return {
        activities: [],
        insights: ['No activities logged yet. Start tracking to see their impact!'],
        period: this.getPeriodLabel(period),
        totalActivities: 0,
        topPositive: null,
        needsAttention: null
      };
    }

    const activities = activitiesResult.data;
    const moods = moodsResult.data || [];
    const sleeps = sleepResult.data || [];
    const clarityTests = clarityResult.data || [];
    const productivityLogs = productivityResult.data || [];

    // Create wellness maps by date
    const moodMap = new Map(moods.map(m => [m.date, m.score]));
    const sleepMap = new Map(sleeps.map(s => [s.date, { hours: Number(s.hours), quality: Number(s.quality) }]));
    const clarityMap = new Map(clarityTests.map(c => [c.date, c.score]));
    const productivityMap = new Map(productivityLogs.map(p => [p.date, p.rating]));

    // Group activities by name
    const activityGroups = new Map<string, typeof activities>();
    activities.forEach(activity => {
      const key = activity.name;
      if (!activityGroups.has(key)) {
        activityGroups.set(key, []);
      }
      activityGroups.get(key)!.push(activity);
    });

    // Analyze each activity
    const analyzedActivities: EnhancedActivityImpact[] = [];

    for (const [activityName, activityLogs] of activityGroups.entries()) {
      if (activityLogs.length < this.MIN_OCCURRENCES) {
        continue; // Skip activities with too few occurrences
      }

      const analysis = await this.analyzeIndividualActivity(
        activityName,
        activityLogs,
        moodMap,
        sleepMap,
        clarityMap,
        productivityMap,
        activities.length
      );

      analyzedActivities.push(analysis);
    }

    // Sort by overall benefit
    analyzedActivities.sort((a, b) => b.overallBenefit - a.overallBenefit);

    // Generate insights
    const insights = this.generateInsights(analyzedActivities);

    // Identify top activities
    const topPositive = analyzedActivities.find(a => a.overallBenefit >= 70)?.activityName || null;
    const needsAttention = analyzedActivities.find(a => a.overallBenefit < 40)?.activityName || null;

    return {
      activities: analyzedActivities,
      insights,
      period: this.getPeriodLabel(period),
      totalActivities: activities.length,
      topPositive,
      needsAttention
    };
  }

  /**
   * Analyze a single activity with multi-dimensional scoring
   */
  private static async analyzeIndividualActivity(
    activityName: string,
    activityLogs: any[],
    moodMap: Map<string, number>,
    sleepMap: Map<string, { hours: number; quality: number }>,
    clarityMap: Map<string, number>,
    productivityMap: Map<string, number>,
    totalActivityCount: number
  ): Promise<EnhancedActivityImpact> {
    const sampleActivity = activityLogs[0];
    const occurrences = activityLogs.length;
    const frequencyPercent = Math.round((occurrences / totalActivityCount) * 100);

    // NEW: Build impact records with proper baseline tracking
    const { MoodsService } = await import('../moods.service');
    const { BaselineService } = await import('./baseline.service');
    const userId = sampleActivity.user_id;

    const impactRecords = await this.buildImpactRecords(
      userId,
      activityLogs,
      moodMap,
      sleepMap,
      clarityMap,
      productivityMap
    );

    console.log(`📊 Built ${impactRecords.length} impact records for ${activityName}`);

    // Calculate enhanced outcome impacts using delta-based approach
    const moodImpact = await this.calculateEnhancedOutcomeImpact(
      impactRecords,
      'mood'
    );

    const sleepImpact = await this.calculateEnhancedOutcomeImpact(
      impactRecords,
      'sleep'
    );

    const clarityImpact = await this.calculateEnhancedOutcomeImpact(
      impactRecords,
      'clarity'
    );

    const productivityImpact = await this.calculateEnhancedOutcomeImpact(
      impactRecords,
      'productivity'
    );

    // Calculate correlations using enhanced correlation service
    const moodCorr = moodImpact.correlationCoefficient;
    const sleepCorr = sleepImpact.correlationCoefficient;
    const clarityCorr = clarityImpact.correlationCoefficient;
    const productivityCorr = productivityImpact.correlationCoefficient;

    // Convert OutcomeImpact to ActivityImpactScore for backward compatibility
    const moodScore: ActivityImpactScore = {
      immediate: moodImpact.sameDayChange,
      nextDay: moodImpact.nextDayChange,
      cumulative: moodImpact.sustainedChange,
      confidence: impactRecords.length >= 10 ? 1.0 : impactRecords.length / 10
    };

    const sleepScore: ActivityImpactScore = {
      immediate: 0, // Sleep doesn't have same-day impact
      nextDay: sleepImpact.nextDayChange,
      cumulative: sleepImpact.sustainedChange,
      confidence: impactRecords.length >= 10 ? 1.0 : impactRecords.length / 10
    };

    const clarityScore: ActivityImpactScore = {
      immediate: clarityImpact.sameDayChange,
      nextDay: clarityImpact.nextDayChange,
      cumulative: clarityImpact.sustainedChange,
      confidence: impactRecords.length >= 10 ? 1.0 : impactRecords.length / 10
    };

    const productivityScore: ActivityImpactScore = {
      immediate: productivityImpact.sameDayChange,
      nextDay: productivityImpact.nextDayChange,
      cumulative: productivityImpact.sustainedChange,
      confidence: impactRecords.length >= 10 ? 1.0 : impactRecords.length / 10
    };

    // Calculate overall benefit score (0-100) with confidence multiplier
    const overallBenefit = this.calculateEnhancedOverallBenefit({
      mood: moodImpact,
      sleep: sleepImpact,
      clarity: clarityImpact,
      productivity: productivityImpact
    });

    // Determine trend
    const trend = this.determineTrend(activityLogs, moodMap);

    // Determine confidence level
    const avgConfidence = this.getAverageConfidenceLevel([
      moodImpact,
      sleepImpact,
      clarityImpact,
      productivityImpact
    ]);

    // Generate recommendation
    const recommendation = this.generateEnhancedRecommendation(
      activityName,
      overallBenefit,
      {
        mood: moodImpact,
        sleep: sleepImpact,
        clarity: clarityImpact,
        productivity: productivityImpact
      },
      avgConfidence
    );

    // Determine best timing
    const timing = this.determineBestTiming(
      {
        mood: moodImpact,
        sleep: sleepImpact,
        clarity: clarityImpact,
        productivity: productivityImpact
      },
      occurrences
    );

    // Calculate optimal frequency
    const frequency = this.calculateOptimalFrequency(
      overallBenefit,
      occurrences,
      impactRecords.length,
      trend
    );

    return {
      activityName,
      category: sampleActivity.category,
      emoji: sampleActivity.emoji || '📌',
      occurrences,
      frequencyPercent,
      impacts: {
        mood: moodScore,
        sleep: sleepScore,
        clarity: clarityScore,
        productivity: productivityScore
      },
      overallBenefit,
      trend,
      confidence: avgConfidence,
      correlations: {
        mood: moodCorr,
        sleep: sleepCorr,
        clarity: clarityCorr,
        productivity: productivityCorr
      },
      recommendation,
      bestTimeOfDay: timing.bestTimeOfDay,
      timingReason: timing.reason,
      optimalFrequency: frequency.frequency,
      frequencyReason: frequency.reason
    };
  }

  /**
   * Calculate multi-dimensional impact (immediate, next-day, cumulative)
   * DEPRECATED: Use calculateEnhancedOutcomeImpact instead
   */
  private static async calculateMultiDimensionalImpact(
    activityLogs: any[],
    dataMap: Map<string, any>,
    metricType: string,
    valueExtractor?: (data: any) => number
  ): Promise<ActivityImpactScore> {
    const activityDates = new Set(activityLogs.map(a => a.date));
    
    // Get baseline (non-activity days)
    const allDates = Array.from(dataMap.keys());
    const nonActivityDates = allDates.filter(date => !activityDates.has(date));
    
    const baselineValues = nonActivityDates
      .map(date => {
        const value = dataMap.get(date);
        return valueExtractor ? valueExtractor(value) : value;
      })
      .filter(v => v !== undefined && v !== null);
    
    const baseline = baselineValues.length > 0
      ? baselineValues.reduce((sum, v) => sum + v, 0) / baselineValues.length
      : 0;

    // Calculate immediate impact (same day)
    const immediateValues = activityLogs
      .map(activity => {
        const value = dataMap.get(activity.date);
        return valueExtractor && value ? valueExtractor(value) : value;
      })
      .filter(v => v !== undefined && v !== null);

    const immediateAvg = immediateValues.length > 0
      ? immediateValues.reduce((sum, v) => sum + v, 0) / immediateValues.length
      : baseline;

    const immediate = baseline > 0 ? (immediateAvg - baseline) / baseline : 0;

    // Calculate next-day impact
    const nextDayValues = activityLogs
      .map(activity => {
        const nextDate = this.addDays(activity.date, 1);
        const value = dataMap.get(nextDate);
        return valueExtractor && value ? valueExtractor(value) : value;
      })
      .filter(v => v !== undefined && v !== null);

    const nextDayAvg = nextDayValues.length > 0
      ? nextDayValues.reduce((sum, v) => sum + v, 0) / nextDayValues.length
      : baseline;

    const nextDay = baseline > 0 ? (nextDayAvg - baseline) / baseline : 0;

    // Calculate cumulative impact (7-day average after activity)
    const cumulativeValues: number[] = [];
    activityLogs.forEach(activity => {
      for (let i = 0; i < 7; i++) {
        const futureDate = this.addDays(activity.date, i);
        const value = dataMap.get(futureDate);
        if (value !== undefined && value !== null) {
          cumulativeValues.push(valueExtractor ? valueExtractor(value) : value);
        }
      }
    });

    const cumulativeAvg = cumulativeValues.length > 0
      ? cumulativeValues.reduce((sum, v) => sum + v, 0) / cumulativeValues.length
      : baseline;

    const cumulative = baseline > 0 ? (cumulativeAvg - baseline) / baseline : 0;

    // Calculate confidence based on sample size
    const confidence = Math.min(1, activityLogs.length / 10);

    return {
      immediate: parseFloat(immediate.toFixed(3)),
      nextDay: parseFloat(nextDay.toFixed(3)),
      cumulative: parseFloat(cumulative.toFixed(3)),
      confidence: parseFloat(confidence.toFixed(2))
    };
  }

  /**
   * Calculate simple correlation coefficient
   */
  private static async calculateSimpleCorrelation(
    activityLogs: any[],
    dataMap: Map<string, any>,
    valueExtractor?: (data: any) => number
  ): Promise<number> {
    const activityDates = activityLogs.map(a => a.date);
    const allDates = Array.from(dataMap.keys());

    // Create binary presence array (1 = activity day, 0 = no activity)
    const presence: number[] = [];
    const values: number[] = [];

    allDates.forEach(date => {
      const hasActivity = activityDates.includes(date);
      const value = dataMap.get(date);
      const extractedValue = valueExtractor && value ? valueExtractor(value) : value;

      if (extractedValue !== undefined && extractedValue !== null) {
        presence.push(hasActivity ? 1 : 0);
        values.push(extractedValue);
      }
    });

    if (presence.length < 5) return 0;

    // Calculate Pearson correlation
    const meanPresence = presence.reduce((sum, v) => sum + v, 0) / presence.length;
    const meanValue = values.reduce((sum, v) => sum + v, 0) / values.length;

    let numerator = 0;
    let sumSqPresence = 0;
    let sumSqValue = 0;

    for (let i = 0; i < presence.length; i++) {
      const devPresence = presence[i] - meanPresence;
      const devValue = values[i] - meanValue;
      numerator += devPresence * devValue;
      sumSqPresence += devPresence * devPresence;
      sumSqValue += devValue * devValue;
    }

    const denominator = Math.sqrt(sumSqPresence * sumSqValue);
    if (denominator === 0) return 0;

    return parseFloat((numerator / denominator).toFixed(3));
  }

  /**
   * Calculate enhanced outcome impact using delta-based approach
   * This is the NEW method that replaces calculateMultiDimensionalImpact
   */
  private static async calculateEnhancedOutcomeImpact(
    records: ImpactRecord[],
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'productivity'
  ): Promise<OutcomeImpact> {
    
    if (records.length < this.MIN_PAIRED_DATA) {
      return this.emptyOutcomeImpact();
    }

    // Extract deltas based on outcome type
    const sameDayDeltas: number[] = [];
    const nextDayDeltas: number[] = [];
    
    records.forEach(record => {
      switch (outcomeType) {
        case 'mood':
          if (record.deltas.moodSameDay !== null) {
            sameDayDeltas.push(record.deltas.moodSameDay);
          }
          if (record.deltas.moodNextDay !== null) {
            nextDayDeltas.push(record.deltas.moodNextDay);
          }
          break;
        
        case 'sleep':
          // Sleep only has next-day impact (quality after the activity day)
          if (record.deltas.sleepQuality !== null) {
            // For sleep, we don't have a baseline, so use raw quality as "delta"
            nextDayDeltas.push(record.deltas.sleepQuality);
          }
          break;
        
        case 'clarity':
          if (record.deltas.claritySameDay !== null) {
            sameDayDeltas.push(record.deltas.claritySameDay);
          }
          if (record.deltas.clarityNextDay !== null) {
            nextDayDeltas.push(record.deltas.clarityNextDay);
          }
          break;
        
        case 'productivity':
          if (record.deltas.productivitySameDay !== null) {
            sameDayDeltas.push(record.deltas.productivitySameDay);
          }
          if (record.deltas.productivityNextDay !== null) {
            nextDayDeltas.push(record.deltas.productivityNextDay);
          }
          break;
      }
    });

    // Calculate average changes
    const sameDayChange = sameDayDeltas.length > 0
      ? sameDayDeltas.reduce((sum, d) => sum + d, 0) / sameDayDeltas.length
      : 0;

    const nextDayChange = nextDayDeltas.length > 0
      ? nextDayDeltas.reduce((sum, d) => sum + d, 0) / nextDayDeltas.length
      : 0;

    const sustainedChange = nextDayChange; // Simplified: use next-day as proxy for sustained

    // Calculate correlation coefficient using deltas
    const correlation = this.calculateDeltaCorrelation(
      sameDayDeltas.length > nextDayDeltas.length ? sameDayDeltas : nextDayDeltas
    );

    // Calculate statistical measures
    const sampleSize = Math.max(sameDayDeltas.length, nextDayDeltas.length);
    const pValue = this.calculatePValue(correlation, sampleSize);
    const confidenceInterval = this.calculateConfidenceInterval(correlation, sampleSize);

    // Interpret results
    const interpretation = this.interpretImpact(
      sameDayChange,
      nextDayChange,
      correlation,
      pValue,
      outcomeType
    );

    return {
      sameDayChange: parseFloat(sameDayChange.toFixed(3)),
      nextDayChange: parseFloat(nextDayChange.toFixed(3)),
      sustainedChange: parseFloat(sustainedChange.toFixed(3)),
      correlationCoefficient: correlation,
      pValue: parseFloat(pValue.toFixed(6)),
      confidenceInterval,
      interpretation,
      sampleSize,
      sufficientData: sampleSize >= this.MIN_PAIRED_DATA
    };
  }

  /**
   * Calculate correlation from deltas
   * Simplified: uses standard deviation to assess consistency
   */
  private static calculateDeltaCorrelation(deltas: number[]): number {
    if (deltas.length < 3) return 0;

    const mean = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    const variance = deltas.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deltas.length;
    const stdDev = Math.sqrt(variance);

    // Convert consistency to correlation-like metric
    // High consistency (low std dev) = high correlation
    // This is a simplified proxy; real correlation would need activity presence binary
    if (stdDev === 0) return mean > 0 ? 1 : mean < 0 ? -1 : 0;
    
    const consistency = Math.min(1, Math.abs(mean) / (stdDev + 0.1));
    return parseFloat((consistency * Math.sign(mean)).toFixed(3));
  }

  /**
   * Calculate p-value for correlation significance
   * Uses t-distribution: t = r * sqrt((n-2)/(1-r²))
   */
  private static calculatePValue(r: number, n: number): number {
    if (n < 3) return 1.0;

    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2;

    // Simplified p-value calculation
    const absT = Math.abs(t);
    if (absT < 1.96) return 0.10; // Not significant
    if (absT < 2.576) return 0.02; // Significant
    if (absT < 3.291) return 0.005; // Highly significant
    return 0.001; // Very highly significant
  }

  /**
   * Calculate 95% confidence interval using Fisher's z-transformation
   */
  private static calculateConfidenceInterval(r: number, n: number): [number, number] {
    if (n < 3) return [0, 0];

    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zCrit = 1.96; // 95% confidence

    const zLow = z - zCrit * se;
    const zHigh = z + zCrit * se;

    const rLow = (Math.exp(2 * zLow) - 1) / (Math.exp(2 * zLow) + 1);
    const rHigh = (Math.exp(2 * zHigh) - 1) / (Math.exp(2 * zHigh) + 1);

    return [
      parseFloat(rLow.toFixed(3)),
      parseFloat(rHigh.toFixed(3))
    ];
  }

  /**
   * Interpret impact with statistical rigor
   */
  private static interpretImpact(
    sameDayChange: number,
    nextDayChange: number,
    correlation: number,
    pValue: number,
    outcomeType: string
  ): OutcomeImpact['interpretation'] {
    
    // Determine strength based on correlation coefficient
    const absCorr = Math.abs(correlation);
    let strength: OutcomeImpact['interpretation']['strength'];
    
    if (absCorr < 0.1) strength = 'none';
    else if (absCorr < 0.3) strength = 'weak';
    else if (absCorr < 0.5) strength = 'moderate';
    else if (absCorr < 0.7) strength = 'strong';
    else strength = 'very-strong';

    // Determine direction based on average change
    const avgChange = (sameDayChange + nextDayChange) / 2;
    let direction: OutcomeImpact['interpretation']['direction'];
    
    if (Math.abs(avgChange) < 0.1) {
      direction = 'no-effect';
    } else if (avgChange > 0) {
      direction = 'improves';
    } else {
      direction = 'worsens';
    }

    // Determine confidence based on p-value
    let confidence: OutcomeImpact['interpretation']['confidence'];
    
    if (pValue > 0.05) confidence = 'low';
    else if (pValue > 0.01) confidence = 'medium';
    else if (pValue > 0.001) confidence = 'high';
    else confidence = 'very-high';

    // Generate human-readable description
    const description = this.generateImpactDescription(
      outcomeType,
      direction,
      strength,
      sameDayChange,
      nextDayChange,
      confidence
    );

    return { strength, direction, confidence, description };
  }

  /**
   * Generate human-readable impact description
   */
  private static generateImpactDescription(
    outcome: string,
    direction: string,
    strength: string,
    sameDayChange: number,
    nextDayChange: number,
    confidence: string
  ): string {
    
    if (direction === 'no-effect') {
      return `No significant effect on ${outcome}`;
    }

    const directionText = direction === 'improves' ? 'improves' : 'worsens';
    const strengthText = 
      strength === 'very-strong' ? 'significantly' :
      strength === 'strong' ? 'strongly' :
      strength === 'moderate' ? 'moderately' :
      'slightly';
    
    const confidenceText = 
      confidence === 'very-high' ? ' (very confident)' :
      confidence === 'high' ? ' (confident)' :
      confidence === 'medium' ? ' (moderately confident)' :
      ' (preliminary)';

    let timeframeText = '';
    if (Math.abs(sameDayChange) > 0.1 && Math.abs(nextDayChange) > 0.1) {
      timeframeText = ' both immediately and next day';
    } else if (Math.abs(sameDayChange) > Math.abs(nextDayChange)) {
      timeframeText = ' primarily same day';
    } else {
      timeframeText = ' primarily next day';
    }

    const changeAmount = Math.max(Math.abs(sameDayChange), Math.abs(nextDayChange));
    const changeText = this.formatChangeAmount(outcome, changeAmount);

    return `${strengthText.charAt(0).toUpperCase() + strengthText.slice(1)} ${directionText} ${outcome}${timeframeText} by ${changeText}${confidenceText}`;
  }

  /**
   * Format change amount based on outcome type
   */
  private static formatChangeAmount(outcome: string, change: number): string {
    switch (outcome) {
      case 'mood':
        return `${change.toFixed(1)} points`;
      case 'sleep':
        return `${change.toFixed(1)} quality points`;
      case 'clarity':
        return `${change.toFixed(1)} points`;
      case 'productivity':
        return `${change.toFixed(1)} points`;
      default:
        return `${change.toFixed(2)}`;
    }
  }

  /**
   * Empty outcome impact for insufficient data
   */
  private static emptyOutcomeImpact(): OutcomeImpact {
    return {
      sameDayChange: 0,
      nextDayChange: 0,
      sustainedChange: 0,
      correlationCoefficient: 0,
      pValue: 1.0,
      confidenceInterval: [0, 0],
      interpretation: {
        strength: 'none',
        direction: 'no-effect',
        confidence: 'low',
        description: 'Insufficient data'
      },
      sampleSize: 0,
      sufficientData: false
    };
  }

  /**
   * Calculate enhanced overall benefit with confidence multiplier
   */
  private static calculateEnhancedOverallBenefit(impacts: {
    mood: OutcomeImpact;
    sleep: OutcomeImpact;
    clarity: OutcomeImpact;
    productivity: OutcomeImpact;
  }): number {
    
    // Define weights for each outcome (sum to 1.0)
    const weights = {
      mood: 0.35,      // Mood is most important
      sleep: 0.25,     // Sleep quality is crucial
      clarity: 0.20,   // Mental clarity matters
      productivity: 0.20 // Productivity rounds it out
    };

    // Normalize each impact to -100 to +100 scale
    const normalizedMood = this.normalizeImpactToScore(impacts.mood, 'mood');
    const normalizedSleep = this.normalizeImpactToScore(impacts.sleep, 'sleep');
    const normalizedClarity = this.normalizeImpactToScore(impacts.clarity, 'clarity');
    const normalizedProductivity = this.normalizeImpactToScore(impacts.productivity, 'productivity');

    // Calculate weighted average
    let score = 50; // Neutral baseline
    score += normalizedMood * weights.mood;
    score += normalizedSleep * weights.sleep;
    score += normalizedClarity * weights.clarity;
    score += normalizedProductivity * weights.productivity;

    // Apply confidence multiplier (reduce score if low confidence)
    const avgConfidence = this.getAverageConfidenceScore([
      impacts.mood,
      impacts.sleep,
      impacts.clarity,
      impacts.productivity
    ]);

    const confidenceMultiplier = this.getConfidenceMultiplier(avgConfidence);
    score = 50 + (score - 50) * confidenceMultiplier; // Apply multiplier to deviation from neutral

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Normalize impact to -100 to +100 scale
   */
  private static normalizeImpactToScore(impact: OutcomeImpact, outcomeType: string): number {
    if (!impact.sufficientData) return 0;

    // Use the more significant of same-day or next-day change
    const change = Math.abs(impact.nextDayChange) > Math.abs(impact.sameDayChange)
      ? impact.nextDayChange
      : impact.sameDayChange;

    // Scale based on outcome type maximum ranges
    let normalized = 0;

    switch (outcomeType) {
      case 'mood':
        normalized = (change / 4) * 100; // Mood scale 1-10, max change ±4
        break;
      case 'sleep':
        normalized = (change / 4) * 100; // Sleep quality 1-10
        break;
      case 'clarity':
        normalized = (change / 10) * 100; // Clarity 0-10
        break;
      case 'productivity':
        normalized = (change / 5) * 100; // Productivity 1-10
        break;
    }

    return Math.max(-100, Math.min(100, normalized));
  }

  /**
   * Get average confidence score from multiple outcome impacts
   */
  private static getAverageConfidenceScore(impacts: OutcomeImpact[]): number {
    const confidenceScores = impacts
      .filter(i => i.sufficientData)
      .map(i => {
        switch (i.interpretation.confidence) {
          case 'very-high': return 1.0;
          case 'high': return 0.8;
          case 'medium': return 0.6;
          case 'low': return 0.4;
          default: return 0.2;
        }
      });

    if (confidenceScores.length === 0) return 0.2;

    return confidenceScores.reduce((sum, s) => sum + s, 0) / confidenceScores.length;
  }

  /**
   * Get average confidence level (categorical)
   */
  private static getAverageConfidenceLevel(impacts: OutcomeImpact[]): 'high' | 'medium' | 'low' {
    const avgScore = this.getAverageConfidenceScore(impacts);
    
    if (avgScore >= 0.75) return 'high';
    if (avgScore >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get confidence multiplier (reduces benefit score if low confidence)
   */
  private static getConfidenceMultiplier(confidenceScore: number): number {
    // Confidence score 0-1 maps to multiplier 0.3-1.0
    return 0.3 + (confidenceScore * 0.7);
  }

  /**
   * Generate enhanced recommendation with statistical insights
   */
  private static generateEnhancedRecommendation(
    activityName: string,
    benefit: number,
    impacts: {
      mood: OutcomeImpact;
      sleep: OutcomeImpact;
      clarity: OutcomeImpact;
      productivity: OutcomeImpact;
    },
    confidence: 'high' | 'medium' | 'low'
  ): string {
    
    if (benefit >= 70 && confidence !== 'low') {
      return `⭐ ${activityName} is excellent for you! ${this.getTopImpactSummary(impacts)}`;
    } else if (benefit >= 60) {
      return `✅ ${activityName} is beneficial. ${this.getTopImpactSummary(impacts)}`;
    } else if (benefit >= 50) {
      return `📊 ${activityName} has neutral impact. Continue if you enjoy it.`;
    } else if (benefit >= 40) {
      return `⚠️ ${activityName} may not be ideal. ${this.getWorstImpactSummary(impacts)}`;
    } else {
      return `🔴 ${activityName} shows negative effects. ${this.getWorstImpactSummary(impacts)} Consider alternatives.`;
    }
  }

  /**
   * Get summary of top positive impact
   */
  private static getTopImpactSummary(impacts: {
    mood: OutcomeImpact;
    sleep: OutcomeImpact;
    clarity: OutcomeImpact;
    productivity: OutcomeImpact;
  }): string {
    const impactArray = [
      { name: 'mood', impact: impacts.mood },
      { name: 'sleep', impact: impacts.sleep },
      { name: 'clarity', impact: impacts.clarity },
      { name: 'productivity', impact: impacts.productivity }
    ];

    const sorted = impactArray
      .filter(i => i.impact.sufficientData && i.impact.interpretation.direction === 'improves')
      .sort((a, b) => {
        const aChange = Math.max(Math.abs(a.impact.sameDayChange), Math.abs(a.impact.nextDayChange));
        const bChange = Math.max(Math.abs(b.impact.sameDayChange), Math.abs(b.impact.nextDayChange));
        return bChange - aChange;
      });

    if (sorted.length > 0) {
      return `Best for ${sorted[0].name}.`;
    }

    return 'Continue tracking for more insights.';
  }

  /**
   * Get summary of worst negative impact
   */
  private static getWorstImpactSummary(impacts: {
    mood: OutcomeImpact;
    sleep: OutcomeImpact;
    clarity: OutcomeImpact;
    productivity: OutcomeImpact;
  }): string {
    const impactArray = [
      { name: 'mood', impact: impacts.mood },
      { name: 'sleep', impact: impacts.sleep },
      { name: 'clarity', impact: impacts.clarity },
      { name: 'productivity', impact: impacts.productivity }
    ];

    const sorted = impactArray
      .filter(i => i.impact.sufficientData && i.impact.interpretation.direction === 'worsens')
      .sort((a, b) => {
        const aChange = Math.max(Math.abs(a.impact.sameDayChange), Math.abs(a.impact.nextDayChange));
        const bChange = Math.max(Math.abs(b.impact.sameDayChange), Math.abs(b.impact.nextDayChange));
        return bChange - aChange;
      });

    if (sorted.length > 0) {
      return `Negatively affects ${sorted[0].name}.`;
    }

    return 'Effects unclear.';
  }

  /**
   * Calculate overall benefit score (0-100)
   */
  private static calculateOverallBenefit(impacts: {
    mood: ActivityImpactScore;
    sleep: ActivityImpactScore;
    clarity: ActivityImpactScore;
    productivity: ActivityImpactScore;
  }): number {
    // Weighted combination with emphasis on immediate and next-day effects
    const weights = {
      mood: { immediate: 0.3, nextDay: 0.15, cumulative: 0.05 },
      sleep: { immediate: 0.1, nextDay: 0.15, cumulative: 0.05 },
      clarity: { immediate: 0.1, nextDay: 0.05, cumulative: 0.025 },
      productivity: { immediate: 0.05, nextDay: 0.025, cumulative: 0.025 }
    };

    let score = 50; // Neutral baseline

    Object.entries(impacts).forEach(([metric, impact]) => {
      const w = weights[metric as keyof typeof weights];
      score += impact.immediate * w.immediate * 100;
      score += impact.nextDay * w.nextDay * 100;
      score += impact.cumulative * w.cumulative * 100;
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Determine activity trend
   */
  private static determineTrend(
    activityLogs: any[],
    moodMap: Map<string, number>
  ): 'improving' | 'stable' | 'declining' {
    if (activityLogs.length < 6) return 'stable';

    const midpoint = Math.floor(activityLogs.length / 2);
    const recentLogs = activityLogs.slice(0, midpoint);
    const olderLogs = activityLogs.slice(midpoint);

    const recentMoods = recentLogs
      .map(a => moodMap.get(a.date))
      .filter(m => m !== undefined) as number[];
    const olderMoods = olderLogs
      .map(a => moodMap.get(a.date))
      .filter(m => m !== undefined) as number[];

    if (recentMoods.length === 0 || olderMoods.length === 0) return 'stable';

    const recentAvg = recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length;
    const olderAvg = olderMoods.reduce((sum, m) => sum + m, 0) / olderMoods.length;

    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  }

  /**
   * Generate personalized recommendation
   */
  private static generateActivityRecommendation(
    activityName: string,
    benefit: number,
    impacts: any,
    confidence: string
  ): string {
    if (benefit >= 70 && confidence !== 'low') {
      return `⭐ ${activityName} is excellent for you! Continue doing this regularly.`;
    } else if (benefit >= 60) {
      return `✅ ${activityName} is beneficial. Try to maintain consistency.`;
    } else if (benefit >= 50) {
      return `📊 ${activityName} has neutral impact. Consider if it aligns with your goals.`;
    } else if (benefit >= 40) {
      return `⚠️ ${activityName} may not be ideal for you. Consider reducing frequency.`;
    } else {
      return `🔴 ${activityName} appears to have negative impact. Consider alternatives.`;
    }
  }

  /**
   * Generate insights from activity analysis
   */
  private static generateInsights(activities: EnhancedActivityImpact[]): string[] {
    const insights: string[] = [];

    // Top positive activity
    const topActivity = activities.find(a => a.overallBenefit >= 70 && a.confidence !== 'low');
    if (topActivity) {
      insights.push(`${topActivity.emoji} ${topActivity.activityName} is your top wellness booster!`);
    }

    // High frequency low benefit
    const highFreqLowBenefit = activities.find(a => a.frequencyPercent >= 20 && a.overallBenefit < 50);
    if (highFreqLowBenefit) {
      insights.push(`💡 You do ${highFreqLowBenefit.activityName} often (${highFreqLowBenefit.frequencyPercent}%), but it may not benefit you. Consider alternatives.`);
    }

    // Improving trend
    const improving = activities.find(a => a.trend === 'improving' && a.occurrences >= 5);
    if (improving) {
      insights.push(`📈 ${improving.activityName} is showing improving benefits over time!`);
    }

    // Warning about declining
    const declining = activities.find(a => a.trend === 'declining' && a.overallBenefit < 55);
    if (declining) {
      insights.push(`📉 ${declining.activityName}'s benefit is declining. You might be overdoing it.`);
    }

    if (insights.length === 0) {
      insights.push('Continue tracking activities to discover personalized patterns.');
    }

    return insights.slice(0, 3); // Top 3 insights
  }

  /**
   * Helper: Add days to a date string
   */
  private static addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get period label
   */
  private static getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      week: 'Past Week',
      month: 'Past Month',
      quarter: 'Past 3 Months'
    };
    return labels[period] || period;
  }

  /**
   * Build impact records for activity occurrences
   * Pairs each activity with baseline, same-day, and next-day outcomes
   */
  private static async buildImpactRecords(
    userId: string,
    activities: any[],
    moodMap: Map<string, number>,
    sleepMap: Map<string, { hours: number; quality: number }>,
    clarityMap: Map<string, number>,
    productivityMap: Map<string, number>
  ): Promise<ImpactRecord[]> {
    const { MoodsService } = await import('../moods.service');
    const { BaselineService } = await import('./baseline.service');

    const records: ImpactRecord[] = [];

    for (const activity of activities) {
      try {
        // Get baseline (BEFORE activity effect)
        const baseline = await this.getBaseline(
          userId,
          activity.date,
          moodMap,
          clarityMap,
          productivityMap,
          MoodsService,
          BaselineService
        );

        // Get same-day outcomes (AFTER activity)
        const sameDay = this.getSameDayOutcomes(
          activity.date,
          moodMap,
          clarityMap,
          productivityMap
        );

        // Get next-day outcomes
        const nextDay = this.getNextDayOutcomes(
          activity.date,
          moodMap,
          sleepMap,
          clarityMap,
          productivityMap
        );

        // Calculate deltas (change from baseline)
        const deltas = this.calculateDeltas(baseline, sameDay, nextDay);

        // Only include if we have at least some outcome data
        const hasSomeData = 
          sameDay.mood !== null || 
          nextDay.mood !== null || 
          nextDay.sleepQuality !== null;

        if (hasSomeData) {
          records.push({
            activityId: activity.id,
            activityName: activity.name,
            activityDate: activity.date,
            baseline,
            sameDay,
            nextDay,
            deltas
          });
        }
      } catch (error) {
        console.warn(`Failed to build impact record for activity ${activity.name} on ${activity.date}:`, error);
      }
    }

    return records;
  }

  /**
   * Get baseline measurements (BEFORE activity can take effect)
   * Priority: 1) Morning measurement, 2) Previous day average, 3) User's percentile baseline
   */
  private static async getBaseline(
    userId: string,
    activityDate: string,
    moodMap: Map<string, number>,
    clarityMap: Map<string, number>,
    productivityMap: Map<string, number>,
    MoodsService: any,
    BaselineService: any
  ): Promise<BaselineMeasures> {
    // Try to get morning mood (before activity)
    // Note: This requires time-stamped data which we may not have in all cases
    // For now, use previous day as baseline
    
    const previousDate = this.addDays(activityDate, -1);
    
    // Get previous day measurements
    const previousMood = moodMap.get(previousDate);
    const previousClarity = clarityMap.get(previousDate);
    const previousProductivity = productivityMap.get(previousDate);

    // If no previous day data, use user's personal baseline from BaselineService
    let moodBaseline: number;
    
    if (previousMood !== undefined) {
      moodBaseline = previousMood;
    } else {
      try {
        const userBaseline = await BaselineService.calculateBaseline(userId, 'mood');
        moodBaseline = userBaseline.p50; // Use median as baseline
      } catch (error) {
        // Fallback to neutral baseline
        moodBaseline = 5; // Middle of 1-10 scale
      }
    }

    return {
      mood: moodBaseline,
      anxiety: null, // We'll add anxiety tracking later
      clarity: previousClarity !== undefined ? previousClarity : null,
      productivity: previousProductivity !== undefined ? previousProductivity : null
    };
  }

  /**
   * Get same-day outcomes (measurements after activity)
   * For now, uses the day's measurements as proxy for "after activity"
   */
  private static getSameDayOutcomes(
    activityDate: string,
    moodMap: Map<string, number>,
    clarityMap: Map<string, number>,
    productivityMap: Map<string, number>
  ): ImpactRecord['sameDay'] {
    return {
      mood: moodMap.get(activityDate) ?? null,
      anxiety: null, // Will add when we have anxiety data
      clarity: clarityMap.get(activityDate) ?? null,
      productivity: productivityMap.get(activityDate) ?? null
    };
  }

  /**
   * Get next-day outcomes
   */
  private static getNextDayOutcomes(
    activityDate: string,
    moodMap: Map<string, number>,
    sleepMap: Map<string, { hours: number; quality: number }>,
    clarityMap: Map<string, number>,
    productivityMap: Map<string, number>
  ): ImpactRecord['nextDay'] {
    const nextDate = this.addDays(activityDate, 1);
    const sleep = sleepMap.get(nextDate);

    return {
      mood: moodMap.get(nextDate) ?? null,
      sleepQuality: sleep?.quality ?? null,
      sleepHours: sleep?.hours ?? null,
      clarity: clarityMap.get(nextDate) ?? null,
      productivity: productivityMap.get(nextDate) ?? null,
      anxiety: null // Will add when we have anxiety data
    };
  }

  /**
   * Calculate deltas (change from baseline)
   * Positive delta = improvement, Negative delta = worsening
   */
  private static calculateDeltas(
    baseline: BaselineMeasures,
    sameDay: ImpactRecord['sameDay'],
    nextDay: ImpactRecord['nextDay']
  ): ImpactRecord['deltas'] {
    return {
      moodSameDay: sameDay.mood !== null ? sameDay.mood - baseline.mood : null,
      moodNextDay: nextDay.mood !== null ? nextDay.mood - baseline.mood : null,
      
      claritySameDay: 
        sameDay.clarity !== null && baseline.clarity !== null
          ? sameDay.clarity - baseline.clarity
          : null,
      clarityNextDay:
        nextDay.clarity !== null && baseline.clarity !== null
          ? nextDay.clarity - baseline.clarity
          : null,
      
      productivitySameDay:
        sameDay.productivity !== null && baseline.productivity !== null
          ? sameDay.productivity - baseline.productivity
          : null,
      productivityNextDay:
        nextDay.productivity !== null && baseline.productivity !== null
          ? nextDay.productivity - baseline.productivity
          : null,
      
      anxietySameDay: null, // Will implement when we have anxiety data
      anxietyNextDay: null,
      
      sleepQuality: nextDay.sleepQuality ?? null,
      sleepHours: nextDay.sleepHours ?? null
    };
  }

  /**
   * Determine best time of day for activity
   * Based on sleep impact, clarity impact, and overall patterns
   */
  private static determineBestTiming(
    impacts: {
      mood: OutcomeImpact;
      sleep: OutcomeImpact;
      clarity: OutcomeImpact;
      productivity: OutcomeImpact;
    },
    totalOccurrences: number
  ): {
    bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
    reason: string;
  } {
    // If insufficient data, default to anytime
    if (totalOccurrences < 5) {
      return {
        bestTimeOfDay: 'anytime',
        reason: 'Not enough data yet to determine optimal timing'
      };
    }

    // Check sleep impact (negative sleep impact suggests avoid evening)
    if (impacts.sleep.sufficientData) {
      if (impacts.sleep.interpretation.direction === 'worsens' && 
          Math.abs(impacts.sleep.nextDayChange) > 0.5) {
        return {
          bestTimeOfDay: 'morning',
          reason: 'Disrupts sleep quality. Do earlier in the day (before 5 PM) to avoid sleep interference'
        };
      }
      
      if (impacts.sleep.interpretation.direction === 'improves' && 
          impacts.sleep.nextDayChange > 0.5) {
        return {
          bestTimeOfDay: 'afternoon',
          reason: 'Improves next-night sleep. Afternoon timing (2-6 PM) maximizes sleep benefits'
        };
      }
    }

    // Check clarity impact (strong same-day clarity boost suggests morning)
    if (impacts.clarity.sufficientData) {
      if (impacts.clarity.sameDayChange > 0.5 && 
          Math.abs(impacts.clarity.sameDayChange) > Math.abs(impacts.clarity.nextDayChange)) {
        return {
          bestTimeOfDay: 'morning',
          reason: 'Boosts mental clarity. Morning timing (7-11 AM) enhances daytime performance'
        };
      }
    }

    // Check mood impact (strong immediate mood boost is flexible)
    if (impacts.mood.sufficientData) {
      if (impacts.mood.sameDayChange > 1.0) {
        return {
          bestTimeOfDay: 'anytime',
          reason: 'Improves mood immediately. Do whenever you need a mood boost'
        };
      }
    }

    // Check productivity impact (strong productivity boost suggests morning/afternoon)
    if (impacts.productivity.sufficientData) {
      if (impacts.productivity.sameDayChange > 0.5) {
        return {
          bestTimeOfDay: 'morning',
          reason: 'Enhances productivity. Morning timing (8-10 AM) maximizes work performance'
        };
      }
    }

    // Default: anytime if no strong pattern
    return {
      bestTimeOfDay: 'anytime',
      reason: 'No significant timing pattern detected. Do whenever convenient'
    };
  }

  /**
   * Calculate optimal frequency based on benefit, trend, and diminishing returns
   */
  private static calculateOptimalFrequency(
    overallBenefit: number,
    currentOccurrences: number,
    validDataPoints: number,
    trend: 'improving' | 'stable' | 'declining'
  ): {
    frequency: number; // Times per week
    reason: string;
  } {
    // Calculate current frequency (occurrences over last 30 days → weekly)
    const currentWeeklyFreq = Math.round((currentOccurrences / 30) * 7);

    // Highly beneficial activities
    if (overallBenefit >= 70) {
      if (trend === 'declining') {
        // Diminishing returns detected
        const reducedFreq = Math.max(2, Math.floor(currentWeeklyFreq * 0.75));
        return {
          frequency: reducedFreq,
          reason: `Strong benefits but showing diminishing returns. Try ${reducedFreq}x/week to maintain effectiveness`
        };
      } else {
        // Strong benefits, stable or improving
        const targetFreq = Math.min(7, Math.max(3, currentWeeklyFreq + 1));
        return {
          frequency: targetFreq,
          reason: `Excellent for you! Aim for ${targetFreq}x/week for maximum benefit`
        };
      }
    }

    // Beneficial activities (50-69)
    if (overallBenefit >= 50) {
      if (trend === 'improving') {
        return {
          frequency: Math.min(5, currentWeeklyFreq + 1),
          reason: `Benefits are improving. Increase to ${Math.min(5, currentWeeklyFreq + 1)}x/week`
        };
      } else {
        return {
          frequency: Math.max(2, currentWeeklyFreq),
          reason: `Moderate benefits. Maintain ${Math.max(2, currentWeeklyFreq)}x/week for steady improvement`
        };
      }
    }

    // Neutral activities (40-49)
    if (overallBenefit >= 40) {
      return {
        frequency: Math.max(1, Math.floor(currentWeeklyFreq * 0.5)),
        reason: `Neutral impact. Reduce to ${Math.max(1, Math.floor(currentWeeklyFreq * 0.5))}x/week or as desired`
        };
    }

    // Activities to avoid (<40)
    return {
      frequency: 0,
      reason: `Negative impact detected. Consider reducing or replacing with more beneficial activities`
    };
  }
}
