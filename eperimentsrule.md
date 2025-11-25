typescript// services/analytics/experiment-correlation.service.ts

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
  
  // Impact analysis
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
}

export interface OutcomeCorrelation {
  // Baseline (before experiment)
  baselineAverage: number;
  baselineSampleSize: number;
  
  // During experiment
  duringAverage: number;
  duringSampleSize: number;
  
  // Analysis
  absoluteChange: number;
  percentageChange: number;
  effectSize: number; // Cohen's d
  
  // Statistical
  correlationCoefficient: number;
  pValue: number;
  isSignificant: boolean;
  
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
  
  /**
   * Analyze single experiment correlation with outcomes
   */
  static async analyzeExperiment(
    userId: string,
    experimentId: string
  ): Promise<{ data: ExperimentCorrelationResult | null; error: any }> {
    try {
      console.log(`🧪 Analyzing experiment ${experimentId}...`);
      
      // 1. Fetch experiment details
      const { data: experiment, error: expError } = await SupabaseSafe.from('experiments')
        .select('*')
        .eq('id', experimentId)
        .eq('user_id', userId)
        .single();
      
      if (expError || !experiment) {
        return { data: null, error: expError || 'Experiment not found' };
      }
      
      const startDate = new Date(experiment.start_date);
      const endDate = new Date(experiment.end_date);
      const now = new Date();
      const effectiveEndDate = endDate < now ? endDate : now;
      
      // 2. Fetch experiment logs
      const { data: logs, error: logsError } = await SupabaseSafe.from('experiment_logs')
        .select('*')
        .eq('experiment_id', experimentId)
        .gte('date', experiment.start_date)
        .lte('date', effectiveEndDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (logsError) {
        return { data: null, error: logsError };
      }
      
      const experimentLogs = logs || [];
      const completedDays = experimentLogs.filter(log => log.completed).length;
      const skippedDays = experimentLogs.filter(log => log.skipped).length;
      const totalDays = experimentLogs.length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      console.log(`📊 Experiment: ${completedDays}/${totalDays} days completed (${completionRate.toFixed(0)}%)`);
      
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
        'mood',
        1, // Scale: 1-5
        5
      );
      
      const sleepImpact = this.calculateOutcomeCorrelation(
        baselineSleep,
        duringSleep,
        'sleep',
        0, // Scale: hours
        12
      );
      
      const clarityImpact = this.calculateOutcomeCorrelation(
        baselineClarity,
        duringClarity,
        'clarity',
        0, // Scale: 0-10
        10
      );
      
      const productivityImpact = this.calculateOutcomeCorrelation(
        baselineProductivity,
        duringProductivity,
        'productivity',
        1, // Scale: 1-5
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
      
      // 9. Determine confidence based on sample sizes
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
          keyFindings
        },
        error: null
      };
      
    } catch (error) {
      console.error('❌ Error analyzing experiment:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Compare multiple experiments
   */
  static async compareExperiments(
    userId: string,
    experimentIds?: string[]
  ): Promise<{ data: ExperimentComparisonResult | null; error: any }> {
    try {
      console.log('🧪 Comparing experiments...');
      
      // Fetch experiments to compare
      let query = SupabaseSafe.from('experiments')
        .select('id')
        .eq('user_id', userId);
      
      if (experimentIds && experimentIds.length > 0) {
        query = query.in('id', experimentIds);
      }
      
      const { data: experiments, error: expError } = await query;
      
      if (expError || !experiments || experiments.length === 0) {
        return { data: null, error: expError || 'No experiments found' };
      }
      
      // Analyze each experiment
      const analyses = await Promise.all(
        experiments.map(exp => this.analyzeExperiment(userId, exp.id))
      );
      
      const validAnalyses = analyses
        .filter(result => result.data !== null)
        .map(result => result.data!);
      
      if (validAnalyses.length === 0) {
        return { data: null, error: 'No valid experiment analyses' };
      }
      
      // Rank experiments by different outcomes
      const rankings = {
        byMoodImpact: this.rankByOutcome(validAnalyses, 'mood'),
        bySleepImpact: this.rankByOutcome(validAnalyses, 'sleep'),
        byClarityImpact: this.rankByOutcome(validAnalyses, 'clarity'),
        byProductivityImpact: this.rankByOutcome(validAnalyses, 'productivity'),
        byOverallImpact: validAnalyses
          .sort((a, b) => b.overallImpactScore - a.overallImpactScore)
          .map(exp => exp.experimentId)
      };
      
      // Generate comparison insights
      const insights = this.generateComparisonInsights(validAnalyses, rankings);
      
      // Generate comparison recommendations
      const recommendations = this.generateComparisonRecommendations(validAnalyses);
      
      console.log(`✅ Compared ${validAnalyses.length} experiments`);
      
      return {
        data: {
          experiments: validAnalyses,
          rankings,
          insights,
          recommendations
        },
        error: null
      };
      
    } catch (error) {
      console.error('❌ Error comparing experiments:', error);
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
    const { data, error } = await SupabaseSafe.from('mood_logs')
      .select('score')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error || !data) return [];
    return data.map(m => m.score);
  }
  
  /**
   * Helper: Fetch mood data for specific dates
   */
  private static async fetchMoodDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const { data, error } = await SupabaseSafe.from('mood_logs')
      .select('score, date')
      .eq('user_id', userId)
      .in('date', dates)
      .order('date');
    
    if (error || !data) return [];
    return data.map(m => m.score);
  }
  
  /**
   * Helper: Fetch sleep data for date range
   */
  private static async fetchSleepData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const { data, error } = await SupabaseSafe.from('sleep_logs')
      .select('hours')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error || !data) return [];
    return data.map(s => Number(s.hours));
  }
  
  /**
   * Helper: Fetch sleep data for specific dates
   */
  private static async fetchSleepDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const { data, error } = await SupabaseSafe.from('sleep_logs')
      .select('hours, date')
      .eq('user_id', userId)
      .in('date', dates)
      .order('date');
    
    if (error || !data) return [];
    return data.map(s => Number(s.hours));
  }
  
  /**
   * Helper: Fetch clarity data for date range
   */
  private static async fetchClarityData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const { data, error } = await SupabaseSafe.from('mental_clarity_tests')
      .select('score')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error || !data) return [];
    return data.map(c => c.score);
  }
  
  /**
   * Helper: Fetch clarity data for specific dates
   */
  private static async fetchClarityDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const { data, error } = await SupabaseSafe.from('mental_clarity_tests')
      .select('score, date')
      .eq('user_id', userId)
      .in('date', dates)
      .order('date');
    
    if (error || !data) return [];
    return data.map(c => c.score);
  }
  
  /**
   * Helper: Fetch productivity data for date range
   */
  private static async fetchProductivityData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<number[]> {
    const { data, error } = await SupabaseSafe.from('productivity_logs')
      .select('rating')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');
    
    if (error || !data) return [];
    return data.map(p => p.rating);
  }
  
  /**
   * Helper: Fetch productivity data for specific dates
   */
  private static async fetchProductivityDataForDates(
    userId: string,
    dates: string[]
  ): Promise<number[]> {
    if (dates.length === 0) return [];
    
    const { data, error } = await SupabaseSafe.from('productivity_logs')
      .select('rating, date')
      .eq('user_id', userId)
      .in('date', dates)
      .order('date');
    
    if (error || !data) return [];
    return data.map(p => p.rating);
  }
  
  /**
   * Calculate correlation for a single outcome
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
    
    // Calculate correlation coefficient
    // Create binary variable: 0 for baseline, 1 for during
    const allValues = [...baseline, ...during];
    const binaryVar = [
      ...Array(baseline.length).fill(0),
      ...Array(during.length).fill(1)
    ];
    
    const correlationCoefficient = this.pearsonCorrelation(binaryVar, allValues);
    
    // Calculate p-value (simplified t-test)
    const pValue = this.calculatePValue(baseline, during);
    const isSignificant = pValue < 0.05;
    
    // Determine direction
    let direction: 'improves' | 'worsens' | 'no-effect';
    if (Math.abs(absoluteChange) < 0.1) {
      direction = 'no-effect';
    } else if (absoluteChange > 0) {
      direction = 'improves';
    } else {
      direction = 'worsens';
    }
    
    // Determine strength (based on effect size)
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
      effectSize: parseFloat(effectSize.toFixed(2)),
      correlationCoefficient: parseFloat(correlationCoefficient.toFixed(3)),
      pValue: parseFloat(pValue.toFixed(4)),
      isSignificant,
      direction,
      strength,
      interpretation
    };
  }
  
  /**
   * Calculate Cohen's d effect size
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
  private static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
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
    
    const tStatistic = Math.abs((mean1 - mean2) / standardError);
    
    // Simplified p-value approximation
    if (tStatistic < 1.96) return 0.05;
    if (tStatistic < 2.576) return 0.01;
    if (tStatistic < 3.291) return 0.001;
    return 0.0001;
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
    
    return `${outcomeType.charAt(0).toUpperCase() + outcomeType.slice(1)} ${verb} ${strengthText} by ${changeText} ${significance}.`;
  }
  
  /**
   * Calculate overall impact score
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
    // Effect size scale:
    // < 0.2 = small
    // 0.5 = medium
    // > 0.8 = large
    
    let score = effectSize * 100;
    
    // Cap at -100 to +100
    score = Math.max(-100, Math.min(100, score));
    
    // Reduce score if not statistically significant
    if (!isSignificant) {
      score = score * 0.7;
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
   * Generate recommendation
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
        recommendation = `🌟 Excellent results! "${activityName}" significantly improves your wellness (${overallScore.toFixed(0)}% impact). Convert this into a permanent habit.`;
        convertToHabit = true;
      } else {
        recommendation = `💪 Great early results with "${activityName}"! Continue for a few more weeks to confirm these benefits.`;
      }
    }
    
    // Positive impact
    else if (impactLevel === 'positive') {
      if (completionRate >= 70) {
        recommendation = `✨ "${activityName}" is helping! Keep going to maximize the ${overallScore.toFixed(0)}% positive impact.`;
      } else {
        recommendation = `📈 "${activityName}" shows promise, but consistency matters. Try to complete it more regularly.`;
      }
    }
    
    // Neutral impact
    else if (impactLevel === 'neutral') {
      if (status === 'completed') {
        recommendation = `🤔 "${activityName}" didn't show clear impact on tracked metrics. Consider trying something different.`;
        shouldContinue = false;
      } else {
        recommendation = `⏳ No clear impact yet from "${activityName}". Give it more time or adjust your approach.`;
      }
    }
    
    // Negative impact
    else if (impactLevel === 'negative' || impactLevel === 'highly-negative') {
      recommendation = `⚠️ "${activityName}" may be negatively affecting your wellness (${overallScore.toFixed(0)}% impact). Consider stopping or modifying this experiment.`;
      shouldContinue = false;
    }
    
    return { recommendation, shouldContinue, convertToHabit };
  }
  
  /**
   * Generate key findings
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
    
    // Sort impacts by effect size
    const impacts = [
      { name: 'mood',RetryGContinuetypescript      { name: 'mood', impact: moodImpact, emoji: '😊' },
      { name: 'sleep', impact: sleepImpact, emoji: '😴' },
      { name: 'mental clarity', impact: clarityImpact, emoji: '🧠' },
      { name: 'productivity', impact: productivityImpact, emoji: '⚡' }
    ].sort((a, b) => Math.abs(b.impact.effectSize) - Math.abs(a.impact.effectSize));
    
    // Add findings for significant impacts
    for (const item of impacts) {
      if (item.impact.strength !== 'none' && item.impact.duringSampleSize >= 3) {
        const direction = item.impact.direction === 'improves' ? 'boosted' : 'reduced';
        const changeText = `${Math.abs(item.impact.absoluteChange).toFixed(1)} points`;
        const percentage = `${Math.abs(item.impact.percentageChange).toFixed(0)}%`;
        
        if (Math.abs(item.impact.effectSize) >= 0.5) {
          findings.push(
            `${item.emoji} ${activityName} ${direction} your ${item.name} by ${changeText} (${percentage})`
          );
        }
      }
    }
    
    // If no significant findings, add baseline info
    if (findings.length === 0) {
      findings.push(`📊 Not enough data yet to detect clear patterns. Continue tracking for more insights.`);
    }
    
    // Add confidence note for low confidence
    if (confidence === 'low' && findings.length > 0) {
      findings.push(`⚠️ Limited data - continue experiment for more reliable results.`);
    }
    
    // Add strongest impact
    const strongest = impacts[0];
    if (strongest.impact.isSignificant && strongest.impact.strength !== 'none') {
      findings.push(
        `🎯 Strongest impact: ${strongest.name} (${strongest.impact.strength} effect, p=${strongest.impact.pValue.toFixed(3)})`
      );
    }
    
    return findings.slice(0, 4); // Top 4 findings
  }
  
  /**
   * Rank experiments by outcome
   */
  private static rankByOutcome(
    experiments: ExperimentCorrelationResult[],
    outcome: 'mood' | 'sleep' | 'clarity' | 'productivity'
  ): string[] {
    
    const outcomeKey = `${outcome}Impact` as keyof ExperimentCorrelationResult;
    
    return experiments
      .filter(exp => {
        const impact = exp[outcomeKey] as OutcomeCorrelation;
        return impact && impact.duringSampleSize >= 3;
      })
      .sort((a, b) => {
        const impactA = a[outcomeKey] as OutcomeCorrelation;
        const impactB = b[outcomeKey] as OutcomeCorrelation;
        return impactB.effectSize - impactA.effectSize;
      })
      .map(exp => exp.experimentId);
  }
  
  /**
   * Generate comparison insights
   */
  private static generateComparisonInsights(
    experiments: ExperimentCorrelationResult[],
    rankings: any
  ): string[] {
    
    const insights: string[] = [];
    
    // Overall best performer
    if (rankings.byOverallImpact.length > 0) {
      const topId = rankings.byOverallImpact[0];
      const topExp = experiments.find(exp => exp.experimentId === topId);
      if (topExp && topExp.overallImpactScore > 20) {
        insights.push(
          `🏆 "${topExp.activityName}" is your top performer with ${topExp.overallImpactScore.toFixed(0)}% overall wellness improvement.`
        );
      }
    }
    
    // Best for mood
    if (rankings.byMoodImpact.length > 0) {
      const topMoodId = rankings.byMoodImpact[0];
      const topMoodExp = experiments.find(exp => exp.experimentId === topMoodId);
      if (topMoodExp && topMoodExp.moodImpact.direction === 'improves' && topMoodExp.moodImpact.strength !== 'none') {
        insights.push(
          `😊 "${topMoodExp.activityName}" is best for mood (+${topMoodExp.moodImpact.absoluteChange.toFixed(1)} points).`
        );
      }
    }
    
    // Best for sleep
    if (rankings.bySleepImpact.length > 0) {
      const topSleepId = rankings.bySleepImpact[0];
      const topSleepExp = experiments.find(exp => exp.experimentId === topSleepId);
      if (topSleepExp && topSleepExp.sleepImpact.direction === 'improves' && topSleepExp.sleepImpact.strength !== 'none') {
        insights.push(
          `😴 "${topSleepExp.activityName}" improves sleep by ${topSleepExp.sleepImpact.absoluteChange.toFixed(1)} hours.`
        );
      }
    }
    
    // Best for clarity
    if (rankings.byClarityImpact.length > 0) {
      const topClarityId = rankings.byClarityImpact[0];
      const topClarityExp = experiments.find(exp => exp.experimentId === topClarityId);
      if (topClarityExp && topClarityExp.clarityImpact.direction === 'improves' && topClarityExp.clarityImpact.strength !== 'none') {
        insights.push(
          `🧠 "${topClarityExp.activityName}" sharpens mental clarity (+${topClarityExp.clarityImpact.absoluteChange.toFixed(1)} points).`
        );
      }
    }
    
    // Experiments needing attention
    const needsAttention = experiments.filter(exp => 
      exp.impactLevel === 'negative' || exp.impactLevel === 'highly-negative'
    );
    if (needsAttention.length > 0) {
      const exp = needsAttention[0];
      insights.push(
        `⚠️ "${exp.activityName}" shows negative impact (${exp.overallImpactScore.toFixed(0)}%). Consider stopping.`
      );
    }
    
    // Success rate
    const positiveCount = experiments.filter(exp => 
      exp.impactLevel === 'positive' || exp.impactLevel === 'highly-positive'
    ).length;
    const successRate = experiments.length > 0
      ? (positiveCount / experiments.length) * 100
      : 0;
    
    if (successRate >= 60) {
      insights.push(
        `📈 ${successRate.toFixed(0)}% of your experiments show positive results. Great experimentation strategy!`
      );
    }
    
    // Consistency insight
    const avgCompletionRate = experiments.reduce((sum, exp) => sum + exp.completionRate, 0) / experiments.length;
    if (avgCompletionRate < 70 && experiments.length >= 2) {
      insights.push(
        `⏰ Average ${avgCompletionRate.toFixed(0)}% completion rate. More consistency = better insights.`
      );
    }
    
    return insights.slice(0, 5); // Top 5 insights
  }
  
  /**
   * Generate comparison recommendations
   */
  private static generateComparisonRecommendations(
    experiments: ExperimentCorrelationResult[]
  ): string[] {
    
    const recommendations: string[] = [];
    
    // Convert successful experiments to habits
    const convertible = experiments.filter(exp => exp.convertToHabit);
    if (convertible.length > 0) {
      recommendations.push(
        `🌟 Convert ${convertible.length} successful experiment${convertible.length > 1 ? 's' : ''} to permanent habits: ${convertible.map(e => e.activityName).slice(0, 3).join(', ')}`
      );
    }
    
    // Stop ineffective experiments
    const shouldStop = experiments.filter(exp => !exp.shouldContinue);
    if (shouldStop.length > 0) {
      recommendations.push(
        `🛑 Consider stopping: ${shouldStop.map(e => e.activityName).slice(0, 2).join(', ')}`
      );
    }
    
    // Continue promising experiments
    const promising = experiments.filter(exp => 
      exp.impactLevel === 'positive' && 
      exp.confidence === 'medium' && 
      exp.status === 'active'
    );
    if (promising.length > 0) {
      recommendations.push(
        `⏳ Continue tracking: ${promising.map(e => e.activityName).slice(0, 2).join(', ')} (showing early promise)`
      );
    }
    
    // Suggest complementary experiments
    const hasExercise = experiments.some(exp => 
      exp.activityName.toLowerCase().includes('exercise') || 
      exp.activityName.toLowerCase().includes('workout')
    );
    const hasMeditation = experiments.some(exp => 
      exp.activityName.toLowerCase().includes('meditat') || 
      exp.activityName.toLowerCase().includes('mindful')
    );
    
    if (!hasExercise && experiments.length >= 1) {
      recommendations.push(`💪 Try an exercise experiment next - it typically shows strong wellness benefits.`);
    } else if (!hasMeditation && experiments.length >= 1) {
      recommendations.push(`🧘 Consider a meditation experiment - it often improves mental clarity and mood.`);
    }
    
    // Suggest longer duration
    const shortExperiments = experiments.filter(exp => exp.totalDays < 14);
    if (shortExperiments.length > 0 && experiments.length > 0) {
      recommendations.push(
        `📅 Run experiments for at least 14 days to see clearer patterns and more reliable results.`
      );
    }
    
    return recommendations.slice(0, 4); // Top 4 recommendations
  }
}
typescript// services/analytics/experiment-outcome-tracking.service.ts

/**
 * Real-time experiment outcome tracking
 * Provides daily feedback and progress monitoring
 */
export class ExperimentOutcomeTrackingService {
  
  /**
   * Log daily experiment outcome with wellness metrics
   */
  static async logExperimentDay(
    userId: string,
    experimentId: string,
    date: string,
    completed: boolean,
    outcomeScores?: {
      mood?: number;
      sleep?: number;
      clarity?: number;
      productivity?: number;
      energy?: number;
      notes?: string;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      console.log(`📝 Logging experiment day: ${experimentId} on ${date}`);
      
      // Insert or update experiment log
      const { data: log, error: logError } = await SupabaseSafe.from('experiment_logs')
        .upsert({
          experiment_id: experimentId,
          user_id: userId,
          date,
          completed,
          skipped: !completed,
          outcome_scores: outcomeScores || {},
          notes: outcomeScores?.notes || null
        }, {
          onConflict: 'experiment_id,date'
        })
        .select()
        .single();
      
      if (logError) {
        return { data: null, error: logError };
      }
      
      // Update experiment progress
      await this.updateExperimentProgress(userId, experimentId);
      
      // Generate daily feedback
      const feedback = await this.generateDailyFeedback(userId, experimentId, date);
      
      return { 
        data: {
          log,
          feedback
        }, 
        error: null 
      };
      
    } catch (error) {
      console.error('❌ Error logging experiment day:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Update experiment progress (current day, completion rate)
   */
  private static async updateExperimentProgress(
    userId: string,
    experimentId: string
  ): Promise<void> {
    
    // Fetch all logs for this experiment
    const { data: logs } = await SupabaseSafe.from('experiment_logs')
      .select('date, completed')
      .eq('experiment_id', experimentId)
      .order('date', { ascending: true });
    
    if (!logs || logs.length === 0) return;
    
    // Calculate current day
    const currentDay = logs.length;
    
    // Calculate completion rate
    const completedDays = logs.filter(log => log.completed).length;
    const completionRate = (completedDays / logs.length) * 100;
    
    // Update experiment
    await SupabaseSafe.from('experiments')
      .update({
        current_day: currentDay,
        completion_rate: completionRate
      })
      .eq('id', experimentId)
      .eq('user_id', userId);
  }
  
  /**
   * Generate daily feedback for user
   */
  private static async generateDailyFeedback(
    userId: string,
    experimentId: string,
    date: string
  ): Promise<{
    message: string;
    insights: string[];
    progress: number;
  }> {
    
    // Fetch experiment
    const { data: experiment } = await SupabaseSafe.from('experiments')
      .select('*')
      .eq('id', experimentId)
      .single();
    
    if (!experiment) {
      return {
        message: 'Experiment not found',
        insights: [],
        progress: 0
      };
    }
    
    // Fetch logs
    const { data: logs } = await SupabaseSafe.from('experiment_logs')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('date', { ascending: false })
      .limit(7);
    
    const currentDay = experiment.current_day || 1;
    const totalDays = experiment.duration;
    const progress = (currentDay / totalDays) * 100;
    
    // Generate message
    let message = '';
    if (progress < 25) {
      message = `Day ${currentDay}/${totalDays} of "${experiment.activity_name}". You're just getting started!`;
    } else if (progress < 50) {
      message = `Day ${currentDay}/${totalDays}. Keep going - patterns will emerge soon!`;
    } else if (progress < 75) {
      message = `Day ${currentDay}/${totalDays}. Over halfway! The data is building.`;
    } else if (progress < 100) {
      message = `Day ${currentDay}/${totalDays}. Almost done! Results will be ready soon.`;
    } else {
      message = `Experiment complete! ${currentDay} days of "${experiment.activity_name}".`;
    }
    
    // Generate insights
    const insights: string[] = [];
    
    if (logs && logs.length >= 3) {
      const recentLogs = logs.slice(0, 7);
      const completedRecent = recentLogs.filter(log => log.completed).length;
      const completionRate = (completedRecent / recentLogs.length) * 100;
      
      if (completionRate >= 80) {
        insights.push(`🔥 Excellent consistency! ${completedRecent}/${recentLogs.length} days completed recently.`);
      } else if (completionRate < 50) {
        insights.push(`⚠️ Only ${completedRecent}/${recentLogs.length} days completed recently. Try to be more consistent.`);
      }
      
      // Check for outcome patterns
      const moodScores = recentLogs
        .filter(log => log.outcome_scores?.mood)
        .map(log => log.outcome_scores.mood);
      
      if (moodScores.length >= 3) {
        const avgMood = moodScores.reduce((sum, m) => sum + m, 0) / moodScores.length;
        if (avgMood >= 4) {
          insights.push(`😊 Your mood has been great during this experiment (avg ${avgMood.toFixed(1)}/5).`);
        } else if (avgMood <= 2.5) {
          insights.push(`😔 Mood has been lower during this experiment (avg ${avgMood.toFixed(1)}/5).`);
        }
      }
    }
    
    return {
      message,
      insights,
      progress: parseFloat(progress.toFixed(1))
    };
  }
  
  /**
   * Get experiment progress summary
   */
  static async getExperimentProgress(
    userId: string,
    experimentId: string
  ): Promise<{
    data: {
      experiment: any;
      currentDay: number;
      totalDays: number;
      completedDays: number;
      skippedDays: number;
      completionRate: number;
      recentLogs: any[];
      milestones: {
        reached: string[];
        upcoming: string[];
      };
      earlyTrends: {
        mood: { avg: number; trend: 'up' | 'down' | 'stable' };
        sleep: { avg: number; trend: 'up' | 'down' | 'stable' };
        clarity: { avg: number; trend: 'up' | 'down' | 'stable' };
        productivity: { avg: number; trend: 'up' | 'down' | 'stable' };
      };
    } | null;
    error: any;
  }> {
    try {
      console.log(`📊 Getting experiment progress: ${experimentId}`);
      
      // Fetch experiment
      const { data: experiment, error: expError } = await SupabaseSafe.from('experiments')
        .select('*')
        .eq('id', experimentId)
        .eq('user_id', userId)
        .single();
      
      if (expError || !experiment) {
        return { data: null, error: expError || 'Experiment not found' };
      }
      
      // Fetch all logs
      const { data: logs } = await SupabaseSafe.from('experiment_logs')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('date', { ascending: false });
      
      const allLogs = logs || [];
      const completedDays = allLogs.filter(log => log.completed).length;
      const skippedDays = allLogs.filter(log => log.skipped).length;
      const currentDay = allLogs.length;
      const totalDays = experiment.duration;
      const completionRate = currentDay > 0 ? (completedDays / currentDay) * 100 : 0;
      
      // Recent logs (last 7 days)
      const recentLogs = allLogs.slice(0, 7);
      
      // Calculate milestones
      const milestones = this.calculateMilestones(currentDay, totalDays, completionRate);
      
      // Calculate early trends
      const earlyTrends = this.calculateEarlyTrends(allLogs);
      
      return {
        data: {
          experiment,
          currentDay,
          totalDays,
          completedDays,
          skippedDays,
          completionRate: parseFloat(completionRate.toFixed(1)),
          recentLogs,
          milestones,
          earlyTrends
        },
        error: null
      };
      
    } catch (error) {
      console.error('❌ Error getting experiment progress:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Calculate experiment milestones
   */
  private static calculateMilestones(
    currentDay: number,
    totalDays: number,
    completionRate: number
  ): { reached: string[]; upcoming: string[] } {
    
    const reached: string[] = [];
    const upcoming: string[] = [];
    
    // Day milestones
    if (currentDay >= 1) reached.push('🎯 Started experiment');
    else upcoming.push('🎯 Start experiment');
    
    if (currentDay >= 7) reached.push('📅 Completed 1 week');
    else if (totalDays >= 7) upcoming.push('📅 Complete 1 week');
    
    if (currentDay >= 14) reached.push('📅 Completed 2 weeks');
    else if (totalDays >= 14) upcoming.push('📅 Complete 2 weeks');
    
    if (currentDay >= 21) reached.push('🏆 21-day habit forming');
    else if (totalDays >= 21) upcoming.push('🏆 Reach 21-day mark');
    
    if (currentDay >= 30) reached.push('🌟 1 month milestone');
    else if (totalDays >= 30) upcoming.push('🌟 Reach 1 month');
    
    // Completion milestones
    if (completionRate >= 100) reached.push('✅ Perfect completion');
    else if (completionRate >= 80) reached.push('⭐ 80%+ completion');
    else if (completionRate >= 70) reached.push('👍 70%+ completion');
    
    // Progress milestones
    const progress = (currentDay / totalDays) * 100;
    if (progress >= 100) reached.push('🎉 Experiment complete');
    else if (progress >= 75) reached.push('🔥 75% complete');
    else if (progress >= 50) reached.push('💪 Halfway done');
    else if (progress >= 25) reached.push('🚀 25% complete');
    
    return { reached, upcoming };
  }
  
  /**
   * Calculate early trends from logs
   */
  private static calculateEarlyTrends(logs: any[]): {
    mood: { avg: number; trend: 'up' | 'down' | 'stable' };
    sleep: { avg: number; trend: 'up' | 'down' | 'stable' };
    clarity: { avg: number; trend: 'up' | 'down' | 'stable' };
    productivity: { avg: number; trend: 'up' | 'down' | 'stable' };
  } {
    
    if (logs.length < 3) {
      return {
        mood: { avg: 0, trend: 'stable' },
        sleep: { avg: 0, trend: 'stable' },
        clarity: { avg: 0, trend: 'stable' },
        productivity: { avg: 0, trend: 'stable' }
      };
    }
    
    const calcTrend = (values: number[]): 'up' | 'down' | 'stable' => {
      if (values.length < 3) return 'stable';
      
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) return 'up';
      if (secondAvg < firstAvg - 0.3) return 'down';
      return 'stable';
    };
    
    // Extract outcome scores
    const moodScores = logs
      .filter(log => log.outcome_scores?.mood)
      .map(log => log.outcome_scores.mood);
    
    const sleepScores = logs
      .filter(log => log.outcome_scores?.sleep)
      .map(log => log.outcome_scores.sleep);
    
    const clarityScores = logs
      .filter(log => log.outcome_scores?.clarity)
      .map(log => log.outcome_scores.clarity);
    
    const productivityScores = logs
      .filter(log => log.outcome_scores?.productivity)
      .map(log => log.outcome_scores.productivity);
    
    return {
      mood: {
        avg: moodScores.length > 0 
          ? parseFloat((moodScores.reduce((sum, v) => sum + v, 0) / moodScores.length).toFixed(1))
          : 0,
        trend: calcTrend(moodScores.reverse()) // Reverse to chronological order
      },
      sleep: {
        avg: sleepScores.length > 0
          ? parseFloat((sleepScores.reduce((sum, v) => sum + v, 0) / sleepScores.length).toFixed(1))
          : 0,
        trend: calcTrend(sleepScores.reverse())
      },
      clarity: {
        avg: clarityScores.length > 0
          ? parseFloat((clarityScores.reduce((sum, v) => sum + v, 0) / clarityScores.length).toFixed(1))
          : 0,
        trend: calcTrend(clarityScores.reverse())
      },
      productivity: {
        avg: productivityScores.length > 0
          ? parseFloat((productivityScores.reduce((sum, v) => sum + v, 0) / productivityScores.length).toFixed(1))
          : 0,
        trend: calcTrend(productivityScores.reverse())
      }
    };
  }
}
typescript// Example usage in API or component

// 1. Analyze single experiment
const { data: analysis } = await ExperimentCorrelationService.analyzeExperiment(
  userId,
  experimentId
);

console.log('Experiment Analysis:', {
  name: analysis.activityName,
  overallImpact: analysis.overallImpactScore,
  moodChange: analysis.moodImpact.absoluteChange,
  sleepChange: analysis.sleepImpact.absoluteChange,
  recommendation: analysis.recommendation,
  shouldConvertToHabit: analysis.convertToHabit
});

// 2. Compare all experiments
const { data: comparison } = await ExperimentCorrelationService.compareExperiments(
  userId
);

console.log('Top Experiments:', {
  bestOverall: comparison.experiments[0]?.activityName,
  bestForMood: comparison.rankings.byMoodImpact[0],
  insights: comparison.insights
});

// 3. Log daily experiment progress
const { data: logResult } = await ExperimentOutcomeTrackingService.logExperimentDay(
  userId,
  experimentId,
  '2025-01-15',
  true, // completed
  {
    mood: 4,
    sleep: 7.5,
    clarity: 8,
    productivity: 4,
    energy: 4,
    notes: 'Felt great after doing this!'
  }
);

console.log('Daily Feedback:', logResult.feedback);

// 4. Get experiment progress
const { data: progress } = await ExperimentOutcomeTrackingService.getExperimentProgress(
  userId,
  experimentId
);

console.log('Progress:', {
  day: `${progress.currentDay}/${progress.totalDays}`,
  completionRate: progress.completionRate,
  milestones: progress.milestones.reached,
  moodTrend: progress.earlyTrends.mood.trend
});