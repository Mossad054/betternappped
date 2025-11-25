/**
 * Experiment Correlation Analysis Service
 * 
 * Provides sophisticated analysis of experiment impacts on wellness metrics:
 * - Statistical correlation analysis (Pearson, Spearman)
 * - Effect size calculation (Cohen's d)
 * - Baseline vs during-experiment comparison
 * - Multi-dimensional impact scoring
 * - Confidence intervals and p-values
 * - Personalized recommendations
 * 
 * Adapted from experimentsrule.md specifications
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';

export interface ExperimentCorrelationResult {
  experimentId: string;
  experimentName: string;
  activityName: string;
  emoji: string;
  status: 'active' | 'completed' | 'paused';
  
  // Sample data
  totalDays: number;
  completedDays: number;
  skippedDays: number;
  completionRate: number;
  
  // Impact analysis - Wellness Impact on 4 metrics
  moodImpact: OutcomeCorrelation;
  sleepImpact: OutcomeCorrelation;
  clarityImpact: OutcomeCorrelation;
  productivityImpact: OutcomeCorrelation;
  
  // Overall assessment
  overallImpactScore: number; // -100 to +100
  impactLevel: 'highly-positive' | 'positive' | 'neutral' | 'negative' | 'highly-negative';
  confidence: 'high' | 'medium' | 'low';
  
  // Recommendations
  recommendation: string;
  shouldContinue: boolean;
  convertToHabit: boolean;
  
  // Insights
  keyFindings: string[];
  
  // Time series data for visualization (last 30 days)
  timeSeriesData?: {
    dates: string[];
    moodScores: (number | null)[];
    sleepHours: (number | null)[];
    clarityScores: (number | null)[];
    productivityScores: (number | null)[];
    experimentDays: boolean[]; // Whether experiment was completed on that day
  };
}

export interface OutcomeCorrelation {
  // Baseline (before experiment)
  baselineAverage: number;
  baselineSampleSize: number;
  
  // During experiment (only on completed days)
  duringAverage: number;
  duringSampleSize: number;
  
  // Analysis
  absoluteChange: number;
  percentageChange: number;
  effectSize: number; // Cohen's d
  
  // Statistical
  correlationCoefficient: number; // Pearson r
  pValue: number;
  isSignificant: boolean;
  confidenceInterval: [number, number]; // 95% CI
  
  // Interpretation
  direction: 'improves' | 'worsens' | 'no-effect';
  strength: 'none' | 'small' | 'medium' | 'large';
  interpretation: string;
}

export interface ExperimentComparisonResult {
  experiments: ExperimentCorrelationResult[];
  rankings: {
    byMoodImpact: string[];
    bySleepImpact: string[];
    byClarityImpact: string[];
    byProductivityImpact: string[];
    byOverallImpact: string[];
  };
  insights: string[];
  recommendations: string[];
}

export class ExperimentCorrelationService {
  private static readonly MIN_BASELINE_DAYS = 7; // Minimum baseline period
  private static readonly MIN_EXPERIMENT_DAYS = 3; // Minimum completed days for analysis

  /**
   * Analyze single experiment with comprehensive correlation analysis
   */
  static async analyzeExperiment(
    userId: string,
    experimentId: string
  ): Promise<{ data: ExperimentCorrelationResult | null; error: any }> {
    try {
      console.log(`🧪 Analyzing experiment ${experimentId}...`);
      
      // 1. Fetch experiment details
      const experimentResult = await SupabaseSafe.select('experiments', { eq: { id: experimentId } }, userId);
      
      if (experimentResult.error || !experimentResult.data || experimentResult.data.length === 0) {
        return { data: null, error: experimentResult.error || 'Experiment not found' };
      }
      
      const experiment = experimentResult.data[0];
      
      const startDate = new Date(experiment.start_date);
      const endDate = new Date(experiment.end_date);
      const now = new Date();
      const effectiveEndDate = endDate < now ? endDate : now;
      
      // 2. Fetch experiment logs
      const logsResult = await SupabaseSafe.select('experiment_logs', {
        eq: { experiment_id: experimentId },
        order: { date: 'asc' }
      }, userId);
      
      if (logsResult.error) {
        return { data: null, error: logsResult.error };
      }
      
      const experimentLogs = (logsResult.data || []).filter((log: any) =>
        log.date >= experiment.start_date && 
        log.date <= effectiveEndDate.toISOString().split('T')[0]
      );
      const completedDays = experimentLogs.filter(log => log.completed).length;
      const skippedDays = experimentLogs.filter(log => log.skipped).length;
      const totalDays = experimentLogs.length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      console.log(`📊 Experiment: ${completedDays}/${totalDays} days completed (${completionRate.toFixed(0)}%)`);
      
      // Check if we have enough data
      if (completedDays < this.MIN_EXPERIMENT_DAYS) {
        return {
          data: this.getInsufficientDataResult(experiment, totalDays, completedDays, skippedDays),
          error: null
        };
      }
      
      // 3. Define baseline period (14-30 days before experiment start)
      const baselineEndDate = new Date(startDate);
      baselineEndDate.setDate(startDate.getDate() - 1);
      const baselineStartDate = new Date(startDate);
      baselineStartDate.setDate(startDate.getDate() - 30);
      
      const baselineStart = baselineStartDate.toISOString().split('T')[0];
      const baselineEnd = baselineEndDate.toISOString().split('T')[0];
      const experimentStart = experiment.start_date;
      const experimentEnd = effectiveEndDate.toISOString().split('T')[0];
      
      // 4. Fetch baseline wellness data
      const [baselineMood, baselineSleep, baselineClarity, baselineProductivity] = await Promise.all([
        this.fetchMoodData(userId, baselineStart, baselineEnd),
        this.fetchSleepData(userId, baselineStart, baselineEnd),
        this.fetchClarityData(userId, baselineStart, baselineEnd),
        this.fetchProductivityData(userId, baselineStart, baselineEnd)
      ]);
      
      // 5. Fetch during-experiment wellness data (only on days activity was COMPLETED)
      const completedDates = experimentLogs
        .filter(log => log.completed)
        .map(log => log.date);
      
      const [duringMood, duringSleep, duringClarity, duringProductivity] = await Promise.all([
        this.fetchMoodDataForDates(userId, completedDates),
        this.fetchSleepDataForDates(userId, completedDates),
        this.fetchClarityDataForDates(userId, completedDates),
        this.fetchProductivityDataForDates(userId, completedDates)
      ]);
      
      // 6. Calculate correlations for each outcome
      const moodImpact = this.calculateOutcomeCorrelation(
        baselineMood,
        duringMood,
        'Mood',
        1,
        5
      );
      
      const sleepImpact = this.calculateOutcomeCorrelation(
        baselineSleep,
        duringSleep,
        'Sleep',
        0,
        12
      );
      
      const clarityImpact = this.calculateOutcomeCorrelation(
        baselineClarity,
        duringClarity,
        'Clarity',
        0,
        10
      );
      
      const productivityImpact = this.calculateOutcomeCorrelation(
        baselineProductivity,
        duringProductivity,
        'Productivity',
        1,
        5
      );
      
      // 7. Calculate overall impact score
      const overallImpactScore = this.calculateOverallImpactScore({
        moodImpact,
        sleepImpact,
        clarityImpact,
        productivityImpact
      });
      
      // 8. Determine impact level
      const impactLevel = this.determineImpactLevel(overallImpactScore);
      
      // 9. Determine confidence based on sample sizes and significance
      const confidence = this.determineConfidence(
        completedDays,
        baselineMood.length + baselineSleep.length + baselineClarity.length + baselineProductivity.length,
        moodImpact.isSignificant || sleepImpact.isSignificant || clarityImpact.isSignificant || productivityImpact.isSignificant
      );
      
      // 10. Generate recommendations
      const { recommendation, shouldContinue, convertToHabit } = this.generateRecommendation(
        experiment.activity_name,
        overallImpactScore,
        impactLevel,
        confidence,
        experiment.status,
        completionRate
      );
      
      // 11. Generate key findings
      const keyFindings = this.generateKeyFindings(
        experiment.activity_name,
        moodImpact,
        sleepImpact,
        clarityImpact,
        productivityImpact,
        confidence
      );
      
      // 12. Fetch time series data for visualization (last 30 days)
      const timeSeriesData = await this.fetchTimeSeriesData(
        userId,
        experimentStart,
        experimentEnd,
        completedDates
      );
      
      console.log(`✅ Analysis complete: Overall impact ${overallImpactScore.toFixed(0)}, ${impactLevel}, ${confidence} confidence`);
      
      return {
        data: {
          experimentId: experiment.id,
          experimentName: experiment.title || experiment.activity_name,
          activityName: experiment.activity_name,
          emoji: experiment.activity_emoji || '🧪',
          status: experiment.status,
          totalDays,
          completedDays,
          skippedDays,
          completionRate: parseFloat(completionRate.toFixed(1)),
          moodImpact,
          sleepImpact,
          clarityImpact,
          productivityImpact,
          overallImpactScore: parseFloat(overallImpactScore.toFixed(1)),
          impactLevel,
          confidence,
          recommendation,
          shouldContinue,
          convertToHabit,
          keyFindings,
          timeSeriesData
        },
        error: null
      };
      
    } catch (error) {
      console.error('❌ Error analyzing experiment:', error);
      return { data: null, error };
    }
  }

  /**
   * Helper: Fetch mood data for date range
   */
  private static async fetchMoodData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const result = await SupabaseSafe.select('mood_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((m: any) => m.date >= startDate && m.date <= endDate)
      .map((m: any) => m.score);
  }
  
  /**
   * Helper: Fetch mood data for specific dates
   */
  private static async fetchMoodDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const result = await SupabaseSafe.select('mood_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((m: any) => dates.includes(m.date))
      .map((m: any) => m.score);
  }
  
  /**
   * Helper: Fetch sleep data for date range
   */
  private static async fetchSleepData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const result = await SupabaseSafe.select('sleep_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((s: any) => s.date >= startDate && s.date <= endDate)
      .map((s: any) => Number(s.hours));
  }
  
  /**
   * Helper: Fetch sleep data for specific dates
   */
  private static async fetchSleepDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const result = await SupabaseSafe.select('sleep_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((s: any) => dates.includes(s.date))
      .map((s: any) => Number(s.hours));
  }
  
  /**
   * Helper: Fetch clarity data for date range
   */
  private static async fetchClarityData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const result = await SupabaseSafe.select('mental_clarity_tests', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((c: any) => c.date >= startDate && c.date <= endDate)
      .map((c: any) => c.score);
  }
  
  /**
   * Helper: Fetch clarity data for specific dates
   */
  private static async fetchClarityDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const result = await SupabaseSafe.select('mental_clarity_tests', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((c: any) => dates.includes(c.date))
      .map((c: any) => c.score);
  }
  
  /**
   * Helper: Fetch productivity data for date range
   */
  private static async fetchProductivityData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const result = await SupabaseSafe.select('productivity_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((p: any) => p.date >= startDate && p.date <= endDate)
      .map((p: any) => p.rating);
  }
  
  /**
   * Helper: Fetch productivity data for specific dates
   */
  private static async fetchProductivityDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const result = await SupabaseSafe.select('productivity_logs', {
      order: { date: 'asc' }
    }, userId);
    
    if (result.error || !result.data) return [];
    
    return result.data
      .filter((p: any) => dates.includes(p.date))
      .map((p: any) => p.rating);
  }
  
  /**
   * Calculate correlation for a single outcome with statistical rigor
   */
  private static calculateOutcomeCorrelation(
    baseline: number[],
    during: number[],
    outcomeType: string,
    minScale: number,
    maxScale: number
  ): OutcomeCorrelation {
    
    // Calculate averages
    const baselineAverage = baseline.length > 0
      ? baseline.reduce((sum, val) => sum + val, 0) / baseline.length
      : 0;
    
    const duringAverage = during.length > 0
      ? during.reduce((sum, val) => sum + val, 0) / during.length
      : 0;
    
    // Calculate changes
    const absoluteChange = duringAverage - baselineAverage;
    const percentageChange = baselineAverage > 0
      ? (absoluteChange / baselineAverage) * 100
      : 0;
    
    // Calculate effect size (Cohen's d)
    const effectSize = this.calculateCohenD(baseline, during);
    
    // Calculate correlation coefficient (Pearson r)
    const correlationCoefficient = this.calculatePearsonCorrelation(baseline, during);
    
    // Calculate p-value (simplified t-test)
    const pValue = this.calculatePValue(baseline, during);
    const isSignificant = pValue < 0.05;
    
    // Calculate 95% confidence interval for mean difference
    const confidenceInterval = this.calculateConfidenceInterval(baseline, during);
    
    // Determine direction
    let direction: 'improves' | 'worsens' | 'no-effect';
    if (Math.abs(absoluteChange) < 0.1 || !isSignificant) {
      direction = 'no-effect';
    } else if (absoluteChange > 0) {
      direction = 'improves';
    } else {
      direction = 'worsens';
    }
    
    // Determine strength (based on Cohen's d effect size)
    let strength: 'none' | 'small' | 'medium' | 'large';
    const absEffectSize = Math.abs(effectSize);
    if (absEffectSize < 0.2) strength = 'none';
    else if (absEffectSize < 0.5) strength = 'small';
    else if (absEffectSize < 0.8) strength = 'medium';
    else strength = 'large';
    
    // Generate interpretation
    const interpretation = this.generateOutcomeInterpretation(
      outcomeType,
      absoluteChange,
      percentageChange,
      direction,
      strength,
      isSignificant
    );
    
    return {
      baselineAverage: parseFloat(baselineAverage.toFixed(2)),
      baselineSampleSize: baseline.length,
      duringAverage: parseFloat(duringAverage.toFixed(2)),
      duringSampleSize: during.length,
      absoluteChange: parseFloat(absoluteChange.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      effectSize: parseFloat(effectSize.toFixed(3)),
      correlationCoefficient: parseFloat(correlationCoefficient.toFixed(3)),
      pValue: parseFloat(pValue.toFixed(4)),
      isSignificant,
      confidenceInterval: [
        parseFloat(confidenceInterval[0].toFixed(2)),
        parseFloat(confidenceInterval[1].toFixed(2))
      ],
      direction,
      strength,
      interpretation
    };
  }
  
  /**
   * Calculate Cohen's d effect size
   * Small effect: d = 0.2, Medium effect: d = 0.5, Large effect: d = 0.8
   */
  private static calculateCohenD(group1: number[], group2: number[]): number {
    if (group1.length === 0 || group2.length === 0) return 0;
    
    const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
    const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
    
    const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (group1.length - 1 || 1);
    const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (group2.length - 1 || 1);
    
    const pooledSD = Math.sqrt((variance1 + variance2) / 2);
    
    if (pooledSD === 0) return 0;
    
    return (mean2 - mean1) / pooledSD;
  }
  
  /**
   * Calculate Pearson correlation coefficient
   */
  private static calculatePearsonCorrelation(baseline: number[], during: number[]): number {
    // Create combined dataset with binary indicator (0 = baseline, 1 = during)
    const allValues = [...baseline, ...during];
    const binaryVar = [
      ...Array(baseline.length).fill(0),
      ...Array(during.length).fill(1)
    ];
    
    if (allValues.length < 2) return 0;
    
    const n = allValues.length;
    const sumX = binaryVar.reduce((a, b) => a + b, 0);
    const sumY = allValues.reduce((a, b) => a + b, 0);
    const sumXY = binaryVar.reduce((sum, xi, i) => sum + xi * allValues[i], 0);
    const sumX2 = binaryVar.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = allValues.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  }
  
  /**
   * Calculate p-value using Welch's t-test
   */
  private static calculatePValue(group1: number[], group2: number[]): number {
    if (group1.length < 2 || group2.length < 2) return 1.0;
    
    const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
    const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
    
    const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (group1.length - 1);
    const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (group2.length - 1);
    
    const standardError = Math.sqrt(variance1 / group1.length + variance2 / group2.length);
    
    if (standardError === 0) return 1.0;
    
    const tStatistic = Math.abs((mean2 - mean1) / standardError);
    
    // Simplified p-value approximation based on t-statistic
    if (tStatistic < 1.96) return 0.06; // Not significant
    if (tStatistic < 2.576) return 0.02; // Significant at 5%
    if (tStatistic < 3.291) return 0.005; // Significant at 1%
    return 0.001; // Highly significant
  }
  
  /**
   * Calculate 95% confidence interval for mean difference
   */
  private static calculateConfidenceInterval(group1: number[], group2: number[]): [number, number] {
    if (group1.length < 2 || group2.length < 2) return [0, 0];
    
    const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
    const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
    const meanDiff = mean2 - mean1;
    
    const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (group1.length - 1);
    const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (group2.length - 1);
    
    const standardError = Math.sqrt(variance1 / group1.length + variance2 / group2.length);
    
    // Use 1.96 for 95% CI (z-score)
    const margin = 1.96 * standardError;
    
    return [meanDiff - margin, meanDiff + margin];
  }
  
  /**
   * Generate interpretation text for outcome
   */
  private static generateOutcomeInterpretation(
    outcomeType: string,
    absoluteChange: number,
    percentageChange: number,
    direction: string,
    strength: string,
    isSignificant: boolean
  ): string {
    
    if (direction === 'no-effect') {
      return `No significant effect on ${outcomeType}.`;
    }
    
    const verb = direction === 'improves' ? 'improved' : 'declined';
    const strengthText = strength === 'large' ? 'significantly' : strength === 'medium' ? 'moderately' : 'slightly';
    const significance = isSignificant ? '(statistically significant)' : '(not statistically significant)';
    
    const changeText = Math.abs(percentageChange) >= 10
      ? `${Math.abs(percentageChange).toFixed(0)}%`
      : `${Math.abs(absoluteChange).toFixed(1)} points`;
    
    return `${outcomeType} ${verb} ${strengthText} by ${changeText} ${significance}.`;
  }
  
  /**
   * Calculate overall impact score (-100 to +100)
   * Weights: Mood 35%, Sleep 25%, Clarity 20%, Productivity 20%
   */
  private static calculateOverallImpactScore(impacts: {
    moodImpact: OutcomeCorrelation;
    sleepImpact: OutcomeCorrelation;
    clarityImpact: OutcomeCorrelation;
    productivityImpact: OutcomeCorrelation;
  }): number {
    
    // Weights for each outcome
    const weights = {
      mood: 0.35,
      sleep: 0.25,
      clarity: 0.20,
      productivity: 0.20
    };
    
    // Convert each outcome to -100 to +100 scale based on effect size and direction
    const moodScore = this.effectSizeToScore(impacts.moodImpact.effectSize, impacts.moodImpact.isSignificant);
    const sleepScore = this.effectSizeToScore(impacts.sleepImpact.effectSize, impacts.sleepImpact.isSignificant);
    const clarityScore = this.effectSizeToScore(impacts.clarityImpact.effectSize, impacts.clarityImpact.isSignificant);
    const productivityScore = this.effectSizeToScore(impacts.productivityImpact.effectSize, impacts.productivityImpact.isSignificant);
    
    // Weighted average
    const overallScore = 
      moodScore * weights.mood +
      sleepScore * weights.sleep +
      clarityScore * weights.clarity +
      productivityScore * weights.productivity;
    
    return overallScore;
  }
  
  /**
   * Convert effect size to -100 to +100 score
   */
  private static effectSizeToScore(effectSize: number, isSignificant: boolean): number {
    // Effect size scale (Cohen's d):
    // 0.2 = small, 0.5 = medium, 0.8 = large
    // Map to -100 to +100 scale
    
    let score = effectSize * 100;
    
    // Cap at -100 to +100
    score = Math.max(-100, Math.min(100, score));
    
    // Reduce score if not statistically significant
    if (!isSignificant) {
      score = score * 0.6;
    }
    
    return score;
  }
  
  /**
   * Determine impact level from overall score
   */
  private static determineImpactLevel(score: number): 'highly-positive' | 'positive' | 'neutral' | 'negative' | 'highly-negative' {
    if (score >= 40) return 'highly-positive';
    if (score >= 15) return 'positive';
    if (score >= -15) return 'neutral';
    if (score >= -40) return 'negative';
    return 'highly-negative';
  }
  
  /**
   * Determine confidence level
   */
  private static determineConfidence(
    completedDays: number,
    baselineSampleSize: number,
    hasSignificantResults: boolean
  ): 'high' | 'medium' | 'low' {
    
    if (completedDays >= 14 && baselineSampleSize >= 14 && hasSignificantResults) {
      return 'high';
    }
    
    if (completedDays >= 7 && baselineSampleSize >= 7) {
      return 'medium';
    }
    
    return 'low';
  }
  
  /**
   * Generate personalized recommendation
   */
  private static generateRecommendation(
    activityName: string,
    overallScore: number,
    impactLevel: string,
    confidence: string,
    status: string,
    completionRate: number
  ): { recommendation: string; shouldContinue: boolean; convertToHabit: boolean } {
    
    let recommendation = '';
    let shouldContinue = true;
    let convertToHabit = false;
    
    // Highly positive impact
    if (impactLevel === 'highly-positive') {
      if (confidence === 'high') {
        recommendation = `🌟 Excellent results! "${activityName}" significantly improves your wellness (+${overallScore.toFixed(0)} impact). This is a game-changer - consider making it a permanent habit.`;
        convertToHabit = true;
      } else {
        recommendation = `💪 Great early results with "${activityName}"! Continue for a few more weeks to confirm these ${overallScore.toFixed(0)}% benefits.`;
      }
    }
    
    // Positive impact
    else if (impactLevel === 'positive') {
      if (completionRate >= 70) {
        recommendation = `✨ "${activityName}" is helping (+${overallScore.toFixed(0)} impact)! Keep going to maximize these positive benefits.`;
      } else {
        recommendation = `📈 "${activityName}" shows promise (+${overallScore.toFixed(0)} impact), but consistency matters. Try to complete it more regularly to see full benefits.`;
      }
    }
    
    // Neutral impact
    else if (impactLevel === 'neutral') {
      if (status === 'completed') {
        recommendation = `🤔 "${activityName}" didn't show clear impact on tracked metrics (${overallScore.toFixed(0)} impact). Consider trying something different or tracking other outcomes.`;
        shouldContinue = false;
      } else {
        recommendation = `⏳ No clear impact yet from "${activityName}" (${overallScore.toFixed(0)} impact). Give it more time, improve consistency, or adjust your approach.`;
      }
    }
    
    // Negative impact
    else if (impactLevel === 'negative' || impactLevel === 'highly-negative') {
      recommendation = `⚠️ "${activityName}" may be negatively affecting your wellness (${overallScore.toFixed(0)} impact). Consider stopping, modifying timing/intensity, or consulting with a healthcare professional.`;
      shouldContinue = false;
    }
    
    return { recommendation, shouldContinue, convertToHabit };
  }
  
  /**
   * Generate key findings with emojis
   */
  private static generateKeyFindings(
    activityName: string,
    moodImpact: OutcomeCorrelation,
    sleepImpact: OutcomeCorrelation,
    clarityImpact: OutcomeCorrelation,
    productivityImpact: OutcomeCorrelation,
    confidence: string
  ): string[] {
    
    const findings: string[] = [];
    
    // Sort impacts by absolute effect size
    const impacts = [
      { name: 'Mood', impact: moodImpact, emoji: '😊' },
      { name: 'Sleep', impact: sleepImpact, emoji: '😴' },
      { name: 'Clarity', impact: clarityImpact, emoji: '🧠' },
      { name: 'Productivity', impact: productivityImpact, emoji: '⚡' }
    ].sort((a, b) => Math.abs(b.impact.effectSize) - Math.abs(a.impact.effectSize));
    
    // Add findings for significant impacts
    for (const item of impacts) {
      if (item.impact.strength !== 'none' && item.impact.duringSampleSize >= 3) {
        const direction = item.impact.direction === 'improves' ? 'boosted' : 'reduced';
        const changeText = `${Math.abs(item.impact.absoluteChange).toFixed(1)} points`;
        const percentage = Math.abs(item.impact.percentageChange) >= 10 
          ? ` (${Math.abs(item.impact.percentageChange).toFixed(0)}%)`
          : '';
        
        if (Math.abs(item.impact.effectSize) >= 0.3) {
          findings.push(
            `${item.emoji} ${activityName} ${direction} your ${item.name.toLowerCase()} by ${changeText}${percentage}`
          );
        }
      }
    }
    
    // If no significant findings, add baseline info
    if (findings.length === 0) {
      findings.push(`📊 Not enough data yet to detect clear patterns. Complete more days with ${activityName} for better insights.`);
    }
    
    // Add confidence note for low confidence
    if (confidence === 'low' && findings.length > 0) {
      findings.push(`⚠️ Limited data collected. Continue tracking for more reliable results.`);
    }
    
    // Add strongest impact with statistical details
    const strongest = impacts[0];
    if (strongest.impact.isSignificant && strongest.impact.strength !== 'none') {
      const strengthLabel = strongest.impact.strength === 'large' ? 'Strong' : strongest.impact.strength === 'medium' ? 'Moderate' : 'Mild';
      findings.push(
        `🎯 Strongest impact: ${strongest.name} (${strengthLabel} effect, ${strongest.impact.strength}, p=${strongest.impact.pValue.toFixed(3)})`
      );
    }
    
    return findings.slice(0, 4); // Top 4 findings
  }
  
  /**
   * Fetch time series data for visualization
   */
  private static async fetchTimeSeriesData(
    userId: string,
    startDate: string,
    endDate: string,
    completedDates: string[]
  ): Promise<ExperimentCorrelationResult['timeSeriesData']> {
    try {
      // Generate date range
      const dates: string[] = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Fetch all data for the period
      const [moods, sleeps, clarityTests, productivityLogs] = await Promise.all([
        SupabaseSafe.select('mood_logs', { order: { date: 'asc' } }, userId),
        SupabaseSafe.select('sleep_logs', { order: { date: 'asc' } }, userId),
        SupabaseSafe.select('mental_clarity_tests', { order: { date: 'asc' } }, userId),
        SupabaseSafe.select('productivity_logs', { order: { date: 'asc' } }, userId)
      ]);
      
      // Create maps for quick lookup
      const moodMap = new Map(
        (moods.data || [])
          .filter((m: any) => m.date >= startDate && m.date <= endDate)
          .map((m: any) => [m.date, m.score])
      );
      const sleepMap = new Map(
        (sleeps.data || [])
          .filter((s: any) => s.date >= startDate && s.date <= endDate)
          .map((s: any) => [s.date, Number(s.hours)])
      );
      const clarityMap = new Map(
        (clarityTests.data || [])
          .filter((c: any) => c.date >= startDate && c.date <= endDate)
          .map((c: any) => [c.date, c.score])
      );
      const productivityMap = new Map(
        (productivityLogs.data || [])
          .filter((p: any) => p.date >= startDate && p.date <= endDate)
          .map((p: any) => [p.date, p.rating])
      );
      
      // Build time series arrays
      const moodScores: (number | null)[] = dates.map(date => moodMap.get(date) || null);
      const sleepHours: (number | null)[] = dates.map(date => sleepMap.get(date) || null);
      const clarityScores: (number | null)[] = dates.map(date => clarityMap.get(date) || null);
      const productivityScores: (number | null)[] = dates.map(date => productivityMap.get(date) || null);
      const experimentDays: boolean[] = dates.map(date => completedDates.includes(date));
      
      return {
        dates,
        moodScores,
        sleepHours,
        clarityScores,
        productivityScores,
        experimentDays
      };
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return undefined;
    }
  }
  
  /**
   * Get insufficient data result
   */
  private static getInsufficientDataResult(
    experiment: any,
    totalDays: number,
    completedDays: number,
    skippedDays: number
  ): ExperimentCorrelationResult {
    const emptyCorrelation: OutcomeCorrelation = {
      baselineAverage: 0,
      baselineSampleSize: 0,
      duringAverage: 0,
      duringSampleSize: 0,
      absoluteChange: 0,
      percentageChange: 0,
      effectSize: 0,
      correlationCoefficient: 0,
      pValue: 1.0,
      isSignificant: false,
      confidenceInterval: [0, 0],
      direction: 'no-effect',
      strength: 'none',
      interpretation: 'Insufficient data for analysis'
    };
    
    return {
      experimentId: experiment.id,
      experimentName: experiment.title || experiment.activity_name,
      activityName: experiment.activity_name,
      emoji: experiment.activity_emoji || '🧪',
      status: experiment.status,
      totalDays,
      completedDays,
      skippedDays,
      completionRate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
      moodImpact: emptyCorrelation,
      sleepImpact: emptyCorrelation,
      clarityImpact: emptyCorrelation,
      productivityImpact: emptyCorrelation,
      overallImpactScore: 0,
      impactLevel: 'neutral',
      confidence: 'low',
      recommendation: `📊 Not enough data yet. Complete at least ${this.MIN_EXPERIMENT_DAYS} days of "${experiment.activity_name}" to see meaningful insights about how it affects your mood, sleep, clarity, and productivity.`,
      shouldContinue: true,
      convertToHabit: false,
      keyFindings: [
        `📝 ${completedDays} of ${this.MIN_EXPERIMENT_DAYS}+ days completed`,
        `🎯 Keep logging to unlock insights about Mood, Sleep, Clarity, and Productivity`,
        `💡 Consistency is key - aim for at least 70% completion rate`
      ]
    };
  }
}
