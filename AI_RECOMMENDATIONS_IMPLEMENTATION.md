 DATA STRUCTURE & RELATIONSHIP MODEL
Core Relationships to Track
typescript// The fundamental relationship we're modeling:
Activity → Outcome(s)

// With these dimensions:
- Temporal: Same day, next day, sustained effect
- Directional: Positive, negative, or neutral impact
- Magnitude: How much it affects the outcome
- Confidence: How certain we are about the relationship
Database Schema for Correlation Storage
sql-- Main correlation table
CREATE TABLE activity_outcome_correlations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Activity identification
    activity_name VARCHAR(100) NOT NULL,
    activity_category VARCHAR(50), -- 'Exercise', 'Social', 'Self-care', etc.
    
    -- Outcome being measured
    outcome_type VARCHAR(50) NOT NULL, -- 'mood', 'sleep', 'clarity', 'anxiety'
    
    -- Impact measurements
    same_day_impact DECIMAL(5,3),      -- Effect on same day (-5.00 to +5.00)
    next_day_impact DECIMAL(5,3),      -- Effect next day
    sustained_impact DECIMAL(5,3),     -- Effect over 3-7 days
    
    -- Statistical measures
    correlation_coefficient DECIMAL(5,3), -- Pearson r (-1 to +1)
    p_value DECIMAL(10,8),              -- Statistical significance
    confidence_interval_low DECIMAL(5,3),
    confidence_interval_high DECIMAL(5,3),
    
    -- Sample data
    total_occurrences INT,              -- How many times activity logged
    paired_data_points INT,             -- Data points with outcome measured
    
    -- Interpretation
    impact_strength VARCHAR(20),        -- 'none', 'weak', 'moderate', 'strong'
    impact_direction VARCHAR(20),       -- 'positive', 'negative', 'neutral'
    statistical_significance VARCHAR(30), -- 'none', 'low', 'significant', 'highly-significant'
    
    -- Metadata
    first_calculated TIMESTAMP,
    last_updated TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,      -- Invalidate if data becomes insufficient
    
    UNIQUE(user_id, activity_name, outcome_type)
);

CREATE INDEX idx_activity_correlations_user ON activity_outcome_correlations(user_id);
CREATE INDEX idx_activity_correlations_outcome ON activity_outcome_correlations(outcome_type);
CREATE INDEX idx_activity_correlations_strength ON activity_outcome_correlations(impact_strength);

-- Detailed impact records (for granular analysis)
CREATE TABLE activity_impact_records (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    activity_id UUID REFERENCES activities(id),
    activity_name VARCHAR(100) NOT NULL,
    activity_date DATE NOT NULL,
    
    -- Baseline scores (before activity or same day morning)
    baseline_mood DECIMAL(3,2),
    baseline_anxiety DECIMAL(3,2),
    baseline_clarity DECIMAL(3,2),
    
    -- Same-day outcomes
    same_day_mood DECIMAL(3,2),
    same_day_anxiety DECIMAL(3,2),
    same_day_clarity DECIMAL(3,2),
    
    -- Next-day outcomes
    next_day_mood DECIMAL(3,2),
    next_day_sleep_quality DECIMAL(3,2),
    next_day_sleep_hours DECIMAL(4,2),
    next_day_clarity DECIMAL(3,2),
    next_day_anxiety DECIMAL(3,2),
    
    -- Calculated deltas
    mood_delta_same_day DECIMAL(4,2),
    mood_delta_next_day DECIMAL(4,2),
    sleep_quality_delta DECIMAL(4,2),
    clarity_delta_same_day DECIMAL(4,2),
    anxiety_delta_same_day DECIMAL(4,2),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_impact_records_user_date ON activity_impact_records(user_id, activity_date);
CREATE INDEX idx_impact_records_activity ON activity_impact_records(activity_name);

2. CORE ALGORITHM: ACTIVITY-OUTCOME IMPACT CALCULATOR
typescript// services/analytics/activity-impact-calculator.service.ts

interface ActivityImpactAnalysis {
  activityName: string;
  category: string;
  
  // Sample size
  totalOccurrences: number;
  validDataPoints: number;
  dataQuality: 'insufficient' | 'limited' | 'good' | 'excellent';
  
  // Impact on each outcome
  moodImpact: OutcomeImpact;
  sleepImpact: OutcomeImpact;
  clarityImpact: OutcomeImpact;
  anxietyImpact: OutcomeImpact;
  
  // Overall assessment
  overallImpactScore: number;        // -100 to +100
  recommendationLevel: 'avoid' | 'neutral' | 'beneficial' | 'highly-beneficial';
  
  // Insights
  keyFindings: string[];
  recommendations: string[];
}

interface OutcomeImpact {
  sameDayChange: number;              // Average change on same day
  nextDayChange: number;              // Average change next day
  sustainedChange: number;            // Average change over days 2-7
  
  correlationCoefficient: number;     // Statistical correlation
  pValue: number;
  confidenceInterval: [number, number];
  
  interpretation: {
    strength: 'none' | 'weak' | 'moderate' | 'strong' | 'very-strong';
    direction: 'improves' | 'worsens' | 'no-effect';
    confidence: 'low' | 'medium' | 'high' | 'very-high';
    description: string;
  };
  
  // Sample data
  sampleSize: number;
  sufficientData: boolean;
}

class ActivityImpactCalculatorService {
  
  private readonly MIN_OCCURRENCES = 5;    // Minimum times activity must be logged
  private readonly MIN_PAIRED_DATA = 3;     // Minimum paired outcome measurements
  
  /**
   * Main method: Calculate comprehensive impact of an activity
   */
  async calculateActivityImpact(
    userId: string,
    activityName: string,
    lookbackDays: number = 90
  ): Promise<ActivityImpactAnalysis> {
    
    // 1. Gather all activity occurrences
    const activityOccurrences = await this.getActivityOccurrences(
      userId, 
      activityName, 
      lookbackDays
    );
    
    if (activityOccurrences.length < this.MIN_OCCURRENCES) {
      return this.insufficientDataResponse(activityName, activityOccurrences.length);
    }
    
    // 2. Build impact records for each occurrence
    const impactRecords = await this.buildImpactRecords(userId, activityOccurrences);
    
    // 3. Calculate impact on each outcome
    const moodImpact = await this.calculateOutcomeImpact(
      impactRecords,
      'mood',
      userId
    );
    
    const sleepImpact = await this.calculateOutcomeImpact(
      impactRecords,
      'sleep',
      userId
    );
    
    const clarityImpact = await this.calculateOutcomeImpact(
      impactRecords,
      'clarity',
      userId
    );
    
    const anxietyImpact = await this.calculateOutcomeImpact(
      impactRecords,
      'anxiety',
      userId
    );
    
    // 4. Calculate overall impact score
    const overallScore = this.calculateOverallImpactScore({
      moodImpact,
      sleepImpact,
      clarityImpact,
      anxietyImpact
    });
    
    // 5. Generate insights and recommendations
    const keyFindings = this.generateKeyFindings({
      moodImpact,
      sleepImpact,
      clarityImpact,
      anxietyImpact
    });
    
    const recommendations = this.generateRecommendations(
      activityName,
      overallScore,
      { moodImpact, sleepImpact, clarityImpact, anxietyImpact }
    );
    
    // 6. Store correlation results
    await this.storeCorrelationResults(
      userId,
      activityName,
      { moodImpact, sleepImpact, clarityImpact, anxietyImpact }
    );
    
    return {
      activityName,
      category: activityOccurrences[0]?.category || 'Unknown',
      totalOccurrences: activityOccurrences.length,
      validDataPoints: impactRecords.length,
      dataQuality: this.assessDataQuality(activityOccurrences.length, impactRecords.length),
      moodImpact,
      sleepImpact,
      clarityImpact,
      anxietyImpact,
      overallImpactScore: overallScore,
      recommendationLevel: this.getRecommendationLevel(overallScore),
      keyFindings,
      recommendations
    };
  }
  
  /**
   * Build impact records by pairing activities with outcomes
   */
  private async buildImpactRecords(
    userId: string,
    activities: Array<{id: string, name: string, date: Date}>
  ): Promise<ImpactRecord[]> {
    
    const records: ImpactRecord[] = [];
    
    for (const activity of activities) {
      // Get baseline (morning or previous day average)
      const baseline = await this.getBaseline(userId, activity.date);
      
      // Get same-day outcomes (afternoon/evening measurements)
      const sameDay = await this.getSameDayOutcomes(userId, activity.date);
      
      // Get next-day outcomes
      const nextDay = await this.getNextDayOutcomes(userId, activity.date);
      
      // Only include if we have at least some outcome data
      if (sameDay.mood || nextDay.mood || nextDay.sleepQuality) {
        records.push({
          activityId: activity.id,
          activityName: activity.name,
          activityDate: activity.date,
          
          baseline: baseline,
          sameDay: sameDay,
          nextDay: nextDay,
          
          // Calculate deltas
          deltas: this.calculateDeltas(baseline, sameDay, nextDay)
        });
      }
    }
    
    return records;
  }
  
  /**
   * Get baseline measurements (before activity effect)
   */
  private async getBaseline(userId: string, activityDate: Date): Promise<BaselineMeasures> {
    const date = new Date(activityDate);
    const previousDay = new Date(date);
    previousDay.setDate(date.getDate() - 1);
    
    // Try to get morning measurement (before activity)
    const morningMood = await db.queryOne(`
      SELECT mood_score 
      FROM mood_logs 
      WHERE user_id = $1 
        AND date = $2 
        AND EXTRACT(HOUR FROM created_at) < 12
      ORDER BY created_at ASC 
      LIMIT 1
    `, [userId, activityDate]);
    
    // Fall back to previous day's average if no morning data
    const previousDayMood = await db.queryOne(`
      SELECT AVG(mood_score) as avg_mood
      FROM mood_logs
      WHERE user_id = $1 AND date = $2
    `, [userId, previousDay]);
    
    // Get user's overall baseline from baselines table
    const userBaseline = await baselineService.getBaseline(userId, 'mood');
    
    return {
      mood: morningMood?.mood_score || previousDayMood?.avg_mood || userBaseline.p50,
      anxiety: await this.getBaselineAnxiety(userId, activityDate),
      clarity: await this.getBaselineClarity(userId, activityDate)
    };
  }
  
  /**
   * Get same-day outcomes (after activity)
   */
  private async getSameDayOutcomes(userId: string, activityDate: Date): Promise<SameDayOutcomes> {
    // Get afternoon/evening mood (after activity effect)
    const eveningMood = await db.queryOne(`
      SELECT AVG(mood_score) as avg_mood
      FROM mood_logs
      WHERE user_id = $1 
        AND date = $2
        AND EXTRACT(HOUR FROM created_at) >= 12
    `, [userId, activityDate]);
    
    const clarity = await db.queryOne(`
      SELECT clarity_score
      FROM mental_clarity_tests
      WHERE user_id = $1 AND date = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId, activityDate]);
    
    const anxiety = await this.getSameDayAnxiety(userId, activityDate);
    
    return {
      mood: eveningMood?.avg_mood || null,
      clarity: clarity?.clarity_score || null,
      anxiety: anxiety
    };
  }
  
  /**
   * Get next-day outcomes
   */
  private async getNextDayOutcomes(userId: string, activityDate: Date): Promise<NextDayOutcomes> {
    const nextDay = new Date(activityDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const mood = await db.queryOne(`
      SELECT AVG(mood_score) as avg_mood
      FROM mood_logs
      WHERE user_id = $1 AND date = $2
    `, [userId, nextDay]);
    
    const sleep = await db.queryOne(`
      SELECT quality, total_hours
      FROM sleep_logs
      WHERE user_id = $1 AND date = $2
    `, [userId, nextDay]);
    
    const clarity = await db.queryOne(`
      SELECT AVG(clarity_score) as avg_clarity
      FROM mental_clarity_tests
      WHERE user_id = $1 AND date = $2
    `, [userId, nextDay]);
    
    const anxiety = await this.getNextDayAnxiety(userId, nextDay);
    
    return {
      mood: mood?.avg_mood || null,
      sleepQuality: sleep?.quality || null,
      sleepHours: sleep?.total_hours || null,
      clarity: clarity?.avg_clarity || null,
      anxiety: anxiety
    };
  }
  
  /**
   * Calculate deltas (change from baseline)
   */
  private calculateDeltas(
    baseline: BaselineMeasures,
    sameDay: SameDayOutcomes,
    nextDay: NextDayOutcomes
  ): Deltas {
    return {
      moodSameDay: sameDay.mood ? sameDay.mood - baseline.mood : null,
      moodNextDay: nextDay.mood ? nextDay.mood - baseline.mood : null,
      claritySameDay: sameDay.clarity && baseline.clarity 
        ? sameDay.clarity - baseline.clarity 
        : null,
      clarityNextDay: nextDay.clarity && baseline.clarity
        ? nextDay.clarity - baseline.clarity
        : null,
      anxietySameDay: sameDay.anxiety && baseline.anxiety
        ? baseline.anxiety - sameDay.anxiety  // Note: reduction in anxiety is positive
        : null,
      anxietyNextDay: nextDay.anxiety && baseline.anxiety
        ? baseline.anxiety - nextDay.anxiety
        : null,
      sleepQuality: nextDay.sleepQuality || null
    };
  }
  
  /**
   * Calculate impact on a specific outcome
   */
  private async calculateOutcomeImpact(
    records: ImpactRecord[],
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'anxiety',
    userId: string
  ): Promise<OutcomeImpact> {
    
    // Extract relevant deltas
    const sameDayDeltas: number[] = [];
    const nextDayDeltas: number[] = [];
    const sustainedDeltas: number[] = [];
    
    for (const record of records) {
      switch (outcomeType) {
        case 'mood':
          if (record.deltas.moodSameDay !== null) sameDayDeltas.push(record.deltas.moodSameDay);
          if (record.deltas.moodNextDay !== null) nextDayDeltas.push(record.deltas.moodNextDay);
          break;
        case 'sleep':
          if (record.deltas.sleepQuality !== null) nextDayDeltas.push(record.deltas.sleepQuality);
          break;
        case 'clarity':
          if (record.deltas.claritySameDay !== null) sameDayDeltas.push(record.deltas.claritySameDay);
          if (record.deltas.clarityNextDay !== null) nextDayDeltas.push(record.deltas.clarityNextDay);
          break;
        case 'anxiety':
          if (record.deltas.anxietySameDay !== null) sameDayDeltas.push(record.deltas.anxietySameDay);
          if (record.deltas.anxietyNextDay !== null) nextDayDeltas.push(record.deltas.anxietyNextDay);
          break;
      }
    }
    
    // Calculate averages
    const sameDayChange = sameDayDeltas.length > 0
      ? this.average(sameDayDeltas)
      : 0;
    
    const nextDayChange = nextDayDeltas.length > 0
      ? this.average(nextDayDeltas)
      : 0;
    
    const sustainedChange = sustainedDeltas.length > 0
      ? this.average(sustainedDeltas)
      : nextDayChange; // Use next day as proxy if no sustained data
    
    // Calculate statistical measures
    const hasSufficientData = sameDayDeltas.length >= this.MIN_PAIRED_DATA || 
                              nextDayDeltas.length >= this.MIN_PAIRED_DATA;
    
    let correlation = 0;
    let pValue = 1.0;
    let confidenceInterval: [number, number] = [0, 0];
    
    if (hasSufficientData) {
      // For correlation, we need activity presence (1) vs absence (0)
      const activityPresence = records.map(r => 1); // Activity occurred
      const outcomes = nextDayDeltas.length > 0 ? nextDayDeltas : sameDayDeltas;
      
      if (outcomes.length >= this.MIN_PAIRED_DATA) {
        // Calculate point-biserial correlation (binary variable vs continuous)
        correlation = this.calculatePointBiserialCorrelation(
          activityPresence.slice(0, outcomes.length),
          outcomes
        );
        
        pValue = this.calculatePValue(correlation, outcomes.length);
        confidenceInterval = this.calculateConfidenceInterval(correlation, outcomes.length);
      }
    }
    
    // Interpret results
    const interpretation = this.interpretImpact(
      sameDayChange,
      nextDayChange,
      correlation,
      pValue,
      outcomeType
    );
    
    return {
      sameDayChange,
      nextDayChange,
      sustainedChange,
      correlationCoefficient: correlation,
      pValue,
      confidenceInterval,
      interpretation,
      sampleSize: Math.max(sameDayDeltas.length, nextDayDeltas.length),
      sufficientData: hasSufficientData
    };
  }
  
  /**
   * Calculate point-biserial correlation
   * Used when one variable is binary (activity done/not done) and other is continuous (mood score)
   */
  private calculatePointBiserialCorrelation(
    binary: number[],
    continuous: number[]
  ): number {
    const n = binary.length;
    
    // Separate continuous values by binary groups
    const group1: number[] = [];
    const group0: number[] = [];
    
    for (let i = 0; i < n; i++) {
      if (binary[i] === 1) {
        group1.push(continuous[i]);
      } else {
        group0.push(continuous[i]);
      }
    }
    
    if (group0.length === 0 || group1.length === 0) {
      return 0; // Cannot calculate if one group is empty
    }
    
    const mean1 = this.average(group1);
    const mean0 = this.average(group0);
    const sd = this.standardDeviation(continuous);
    
    if (sd === 0) return 0;
    
    const p1 = group1.length / n;
    const p0 = group0.length / n;
    
    const rpb = ((mean1 - mean0) / sd) * Math.sqrt(p1 * p0);
    
    return rpb;
  }
  
  /**
   * Interpret the impact
   */
  private interpretImpact(
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
    
    // Generate description
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
  private generateImpactDescription(
    outcome: string,
    direction: string,
    strength: string,
    sameDayChange: number,
    nextDayChange: number,
    confidence: string
  ): string {
    
    if (direction === 'no-effect') {
      return `This activity shows no significant effect on your ${outcome}.`;
    }
    
    const directionText = direction === 'improves' ? 'improves' : 'worsens';
    const strengthText = strength === 'very-strong' ? 'significantly' : strength;
    const confidenceText = confidence === 'very-high' ? '(very confident)' : 
                          confidence === 'high' ? '(confident)' : 
                          confidence === 'medium' ? '(moderately confident)' : 
                          '(preliminary finding)';
    
    let timeframeText = '';
    if (Math.abs(sameDayChange) > 0.1 && Math.abs(nextDayChange) > 0.1) {
      timeframeText = 'both immediately and the next day';
    } else if (Math.abs(sameDayChange) > Math.abs(nextDayChange)) {
      timeframeText = 'primarily on the same day';
    } else {
      timeframeText = 'primarily the next day';
    }
    
    // Format change amounts
    const changeText = this.formatChangeAmount(outcome, Math.max(Math.abs(sameDayChange), Math.abs(nextDayChange)));
    
    return `This activity ${strengthText} ${directionText} your ${outcome} ${timeframeText}, with an average change of ${changeText} ${confidenceText}.`;
  }
  
  /**
   * Format change amount based on outcome type
   */
  private formatChangeAmount(outcome: string, change: number): string {
    switch (outcome) {
      case 'mood':
        return `${change.toFixed(1)} points (${(change / 5 * 100).toFixed(0)}%)`;
      case 'sleep':
        return `${change.toFixed(1)} points in quality`;
      case 'clarity':
        return `${change.toFixed(1)} points (${(change / 10 * 100).toFixed(0)}%)`;
      case 'anxiety':
        const direction = change > 0 ? 'reduction' : 'increase';
        return `${Math.abs(change).toFixed(1)} point ${direction}`;
      default:
        return `${change.toFixed(2)}`;
    }
  }
  
  /**
   * Calculate overall impact score (normalized to -100 to +100)
   */
  private calculateOverallImpactScore(impacts: {
    moodImpact: OutcomeImpact;
    sleepImpact: OutcomeImpact;
    clarityImpact: OutcomeImpact;
    anxietyImpact: OutcomeImpact;
  }): number {
    
    // Define weights for each outcome (adjust based on user priorities)
    const weights = {
      mood: 0.35,
      sleep: 0.25,
      clarity: 0.20,
      anxiety: 0.20
    };
    
    // Normalize each impact to -100 to +100 scale
    const normalizedMood = this.normalizeImpactToScore(impacts.moodImpact, 'mood');
    const normalizedSleep = this.normalizeImpactToScore(impacts.sleepImpact, 'sleep');
    const normalizedClarity = this.normalizeImpactToScore(impacts.clarityImpact, 'clarity');
    const normalizedAnxiety = this.normalizeImpactToScore(impacts.anxietyImpact, 'anxiety');
    
    // Calculate weighted average
    const score = (
      normalizedMood * weights.mood +
      normalizedSleep * weights.sleep +
      normalizedClarity * weights.clarity +
      normalizedAnxiety * weights.anxiety
    );
    
    // Apply confidence penalty (reduce score if low confidence)
    const avgConfidence = this.getAverageConfidence([
      impacts.moodImpact,
      impacts.sleepImpact,
      impacts.clarityImpact,
      impacts.anxietyImpact
    ]);
    
    const confidenceMultiplier = this.getConfidenceMultiplier(avgConfidence);
    
    return score * confidenceMultiplier;
  }
  
  /**
   * Normalize impact to -100 to +100 scale
   */
  private normalizeImpactToScore(impact: OutcomeImpact, outcomeType: string): number {
    if (!impact.sufficientData) return 0;
    
    // Use the more significant of same-day or next-day change
    const change = Math.abs(impact.nextDayChange) > Math.abs(impact.sameDayChange)
      ? impact.nextDayChange
      : impact.sameDayChange;
    
    // Scale based on outcome type maximum ranges
    let normalized = 0;
    
    switch (outcomeType) {
      case 'mood':
        // Mood scale is 1-5, so max change is ±4
        normalized = (change / 4) * 100;
        break;
      case 'sleep':
        // Sleep quality is 1-5
        normalized = (change / 4) * 100;
        break;
      case 'clarity':
        // Clarity is 0-10
        normalized = (change / 10) * 100;
        break;
      case 'anxiety':
        // Anxiety reduction is positive
        normalized = (change / 5) * 100;
        break;
    }
    
    // Clamp to -100 to +100
    return Math.max(-100, Math.min(100, normalized));
  }
  
  /**
   * Get recommendation level based on overall score
   */
  private getRecommendationLevel(score: number): ActivityImpactAnalysis['recommendationLevel'] {
    if (score >= 40) return 'highly-beneficial';
    if (score >= 15) return 'beneficial';
    if (score >= -15) return 'neutral';
    return 'avoid';
  }
  
  /**
   * Generate key findings
   */
  private generateKeyFindings(impacts: {
    moodImpact: OutcomeImpact;
    sleepImpact: OutcomeImpact;
    clarityImpact: OutcomeImpact;
    anxietyImpact: OutcomeImpact;
  }): string[] {
    
    const findings: string[] = [];
    
    // Find strongest impacts
    const impactArray = [
      { name: 'mood', impact: impacts.moodImpact },
      { name: 'sleep quality', impact: impacts.sleepImpact },
      { name: 'mental clarity', impact: impacts.clarityImpact },
      { name: 'anxiety levels', impact: impacts.anxietyImpact }
    ];
    
    // Sort by absolute impact
    const sorted = impactArray
      .filter(i => i.impact.sufficientData)
      .sort((a, b) => {
        const aChange = Math.abs(a.impact.nextDayChange);
        const bChange = Math.abs(b.impact.nextDayChange);
        return bChange - aChange;
      });
    
    for (const item of sorted.slice(0, 3)) {
      if (item.impact.interpretation.strength !== 'none') {
        findings.push(item.impact.interpretation.description);
      }
    }
    
    if (findings.length === 0) {
      findings.push('Not enough data yet to determine clear patterns.');
    }
    
    return findings;
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(
    activityName: string,
    overallScore: number,
    impacts: {
      moodImpact: OutcomeImpact;
      sleepImpact: OutcomeImpact;
      clarityImpact: OutcomeImpact;
      anxietyImpact: OutcomeImpact;
    }
  ): string[] {
    
    const recommendations: string[] = [];
    
    if (overallScore >= 40) {
      recommendations.push(`${activityName} has a strong positive effect on your wellbeing. Try to do this activity 3-4 times per week.`);
      
      // Find best time
      const bestTiming = this.determineBestTiming(impacts);
      if (bestTiming) {
        recommendations.push(bestTiming);
      }
      
    } else if (overallScore >= 15) {
      recommendations.push(`${activityName} appears beneficial for you. Consider incorporating it into your routine more regularly.`);
      
    } else if (overallScore <= -20) {RetryGContinuetypescript      recommendations.push(`${activityName} may be having a negative impact on your wellbeing. Consider reducing frequency or timing differently.`);
      
      // Identify which outcomes are most affected negatively
      const negativeImpacts = [];
      if (impacts.moodImpact.interpretation.direction === 'worsens') {
        negativeImpacts.push('mood');
      }
      if (impacts.sleepImpact.interpretation.direction === 'worsens') {
        negativeImpacts.push('sleep');
      }
      if (impacts.anxietyImpact.interpretation.direction === 'worsens') {
        negativeImpacts.push('anxiety');
      }
      
      if (negativeImpacts.length > 0) {
        recommendations.push(`Particularly watch for negative effects on: ${negativeImpacts.join(', ')}`);
      }
      
    } else {
      recommendations.push(`${activityName} shows neutral effects. Continue if you enjoy it, but it may not be a key factor in your wellbeing.`);
    }
    
    // Add specific recommendations based on individual impacts
    if (impacts.sleepImpact.interpretation.direction === 'worsens' && 
        impacts.sleepImpact.interpretation.confidence !== 'low') {
      recommendations.push(`This activity negatively affects your sleep. Try doing it earlier in the day.`);
    }
    
    if (impacts.anxietyImpact.interpretation.direction === 'improves' &&
        impacts.anxietyImpact.interpretation.strength === 'strong') {
      recommendations.push(`This is particularly effective for reducing your anxiety. Use it as a go-to stress management tool.`);
    }
    
    return recommendations;
  }
  
  /**
   * Determine best timing for activity
   */
  private determineBestTiming(impacts: {
    moodImpact: OutcomeImpact;
    sleepImpact: OutcomeImpact;
    clarityImpact: OutcomeImpact;
    anxietyImpact: OutcomeImpact;
  }): string | null {
    
    // If sleep is positively affected, suggest morning/afternoon
    if (impacts.sleepImpact.interpretation.direction === 'improves') {
      return 'For best results, try doing this activity in the morning or early afternoon to maximize sleep benefits.';
    }
    
    // If sleep is negatively affected, suggest earlier timing
    if (impacts.sleepImpact.interpretation.direction === 'worsens') {
      return 'To avoid sleep disruption, do this activity earlier in the day (before 5 PM).';
    }
    
    // If clarity improves same-day, suggest morning
    if (impacts.clarityImpact.sameDayChange > 0.5) {
      return 'This activity boosts your mental clarity. Consider doing it in the morning for peak daytime performance.';
    }
    
    return null;
  }
  
  /**
   * Statistical helper: Calculate p-value from correlation
   */
  private calculatePValue(r: number, n: number): number {
    if (n < 3) return 1.0;
    
    // t-statistic for correlation
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2;
    
    // Use t-distribution (simplified - use proper stats library in production)
    return this.tDistributionPValue(Math.abs(t), df);
  }
  
  /**
   * Simplified t-distribution p-value calculation
   * NOTE: Use a proper statistics library like jstat or simple-statistics in production
   */
  private tDistributionPValue(t: number, df: number): number {
    // This is a rough approximation
    // For production, use: const jstat = require('jstat'); return 2 * (1 - jstat.studentt.cdf(t, df));
    
    if (t < 1.96) return 0.05; // Not significant
    if (t < 2.576) return 0.01; // Significant
    if (t < 3.291) return 0.001; // Highly significant
    return 0.0001; // Very highly significant
  }
  
  /**
   * Calculate confidence interval for correlation
   */
  private calculateConfidenceInterval(r: number, n: number): [number, number] {
    if (n < 3) return [0, 0];
    
    // Fisher z-transformation
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zCrit = 1.96; // 95% confidence
    
    const zLow = z - zCrit * se;
    const zHigh = z + zCrit * se;
    
    // Transform back
    const rLow = (Math.exp(2 * zLow) - 1) / (Math.exp(2 * zLow) + 1);
    const rHigh = (Math.exp(2 * zHigh) - 1) / (Math.exp(2 * zHigh) + 1);
    
    return [rLow, rHigh];
  }
  
  /**
   * Statistical helpers
   */
  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  private standardDeviation(arr: number[]): number {
    const avg = this.average(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
  
  private getAverageConfidence(impacts: OutcomeImpact[]): string {
    const confidenceScores = impacts
      .filter(i => i.sufficientData)
      .map(i => {
        switch (i.interpretation.confidence) {
          case 'very-high': return 4;
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 0;
        }
      });
    
    if (confidenceScores.length === 0) return 'low';
    
    const avg = this.average(confidenceScores);
    if (avg >= 3.5) return 'very-high';
    if (avg >= 2.5) return 'high';
    if (avg >= 1.5) return 'medium';
    return 'low';
  }
  
  private getConfidenceMultiplier(confidence: string): number {
    switch (confidence) {
      case 'very-high': return 1.0;
      case 'high': return 0.9;
      case 'medium': return 0.7;
      case 'low': return 0.5;
      default: return 0.3;
    }
  }
  
  /**
   * Store correlation results in database
   */
  private async storeCorrelationResults(
    userId: string,
    activityName: string,
    impacts: {
      moodImpact: OutcomeImpact;
      sleepImpact: OutcomeImpact;
      clarityImpact: OutcomeImpact;
      anxietyImpact: OutcomeImpact;
    }
  ): Promise<void> {
    
    const outcomes = [
      { type: 'mood', impact: impacts.moodImpact },
      { type: 'sleep', impact: impacts.sleepImpact },
      { type: 'clarity', impact: impacts.clarityImpact },
      { type: 'anxiety', impact: impacts.anxietyImpact }
    ];
    
    for (const outcome of outcomes) {
      if (outcome.impact.sufficientData) {
        await db.query(`
          INSERT INTO activity_outcome_correlations (
            id, user_id, activity_name, outcome_type,
            same_day_impact, next_day_impact, sustained_impact,
            correlation_coefficient, p_value,
            confidence_interval_low, confidence_interval_high,
            total_occurrences, paired_data_points,
            impact_strength, impact_direction, statistical_significance,
            last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
          ON CONFLICT (user_id, activity_name, outcome_type) DO UPDATE SET
            same_day_impact = EXCLUDED.same_day_impact,
            next_day_impact = EXCLUDED.next_day_impact,
            sustained_impact = EXCLUDED.sustained_impact,
            correlation_coefficient = EXCLUDED.correlation_coefficient,
            p_value = EXCLUDED.p_value,
            confidence_interval_low = EXCLUDED.confidence_interval_low,
            confidence_interval_high = EXCLUDED.confidence_interval_high,
            total_occurrences = EXCLUDED.total_occurrences,
            paired_data_points = EXCLUDED.paired_data_points,
            impact_strength = EXCLUDED.impact_strength,
            impact_direction = EXCLUDED.impact_direction,
            statistical_significance = EXCLUDED.statistical_significance,
            last_updated = NOW()
        `, [
          uuidv4(),
          userId,
          activityName,
          outcome.type,
          outcome.impact.sameDayChange,
          outcome.impact.nextDayChange,
          outcome.impact.sustainedChange,
          outcome.impact.correlationCoefficient,
          outcome.impact.pValue,
          outcome.impact.confidenceInterval[0],
          outcome.impact.confidenceInterval[1],
          outcome.impact.sampleSize,
          outcome.impact.sampleSize,
          outcome.impact.interpretation.strength,
          outcome.impact.interpretation.direction,
          this.mapConfidenceToSignificance(outcome.impact.interpretation.confidence)
        ]);
      }
    }
  }
  
  private mapConfidenceToSignificance(confidence: string): string {
    switch (confidence) {
      case 'very-high': return 'highly-significant';
      case 'high': return 'significant';
      case 'medium': return 'low';
      default: return 'none';
    }
  }
  
  /**
   * Handle insufficient data case
   */
  private insufficientDataResponse(
    activityName: string,
    occurrences: number
  ): ActivityImpactAnalysis {
    
    const needed = this.MIN_OCCURRENCES - occurrences;
    
    return {
      activityName,
      category: 'Unknown',
      totalOccurrences: occurrences,
      validDataPoints: 0,
      dataQuality: 'insufficient',
      moodImpact: this.emptyOutcomeImpact(),
      sleepImpact: this.emptyOutcomeImpact(),
      clarityImpact: this.emptyOutcomeImpact(),
      anxietyImpact: this.emptyOutcomeImpact(),
      overallImpactScore: 0,
      recommendationLevel: 'neutral',
      keyFindings: [
        `Not enough data yet. Log this activity ${needed} more time${needed > 1 ? 's' : ''} to see patterns.`
      ],
      recommendations: [
        'Keep tracking this activity and your mood/sleep to build a clearer picture.',
        'Make sure to log your mood and sleep on days you do this activity.'
      ]
    };
  }
  
  private emptyOutcomeImpact(): OutcomeImpact {
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
        description: 'Insufficient data to determine impact.'
      },
      sampleSize: 0,
      sufficientData: false
    };
  }
  
  private assessDataQuality(occurrences: number, validPairs: number): 
    'insufficient' | 'limited' | 'good' | 'excellent' {
    
    if (occurrences < this.MIN_OCCURRENCES || validPairs < this.MIN_PAIRED_DATA) {
      return 'insufficient';
    }
    if (occurrences < 10 || validPairs < 7) {
      return 'limited';
    }
    if (occurrences < 20 || validPairs < 15) {
      return 'good';
    }
    return 'excellent';
  }
  
  /**
   * Get activity occurrences
   */
  private async getActivityOccurrences(
    userId: string,
    activityName: string,
    lookbackDays: number
  ): Promise<Array<{id: string, name: string, category: string, date: Date}>> {
    
    const query = `
      SELECT id, activity_name as name, category, date
      FROM activities
      WHERE user_id = $1
        AND activity_name = $2
        AND date >= CURRENT_DATE - INTERVAL '${lookbackDays} days'
      ORDER BY date ASC
    `;
    
    return db.query(query, [userId, activityName]);
  }
}

3. BATCH CORRELATION CALCULATOR
This service calculates correlations for ALL activities at once:
typescript// services/analytics/batch-correlation.service.ts

class BatchCorrelationService {
  
  /**
   * Calculate correlations for all activities the user has logged
   */
  async calculateAllActivityCorrelations(
    userId: string,
    lookbackDays: number = 90
  ): Promise<ActivityCorrelationSummary> {
    
    // 1. Get all unique activities user has logged
    const activities = await this.getAllUserActivities(userId, lookbackDays);
    
    console.log(`Calculating correlations for ${activities.length} activities...`);
    
    // 2. Calculate impact for each activity
    const results: ActivityImpactAnalysis[] = [];
    
    for (const activity of activities) {
      try {
        const impact = await activityImpactCalculatorService.calculateActivityImpact(
          userId,
          activity.name,
          lookbackDays
        );
        
        results.push(impact);
      } catch (error) {
        console.error(`Error calculating impact for ${activity.name}:`, error);
      }
    }
    
    // 3. Rank activities by overall impact
    const ranked = results.sort((a, b) => b.overallImpactScore - a.overallImpactScore);
    
    // 4. Categorize activities
    const categorized = this.categorizeActivities(ranked);
    
    // 5. Generate summary insights
    const summaryInsights = this.generateSummaryInsights(categorized);
    
    return {
      totalActivities: activities.length,
      analyzedActivities: results.length,
      topBeneficial: categorized.highlyBeneficial,
      beneficial: categorized.beneficial,
      neutral: categorized.neutral,
      toAvoid: categorized.avoid,
      summaryInsights,
      lastCalculated: new Date()
    };
  }
  
  /**
   * Get all unique activities user has logged
   */
  private async getAllUserActivities(
    userId: string,
    lookbackDays: number
  ): Promise<Array<{name: string, category: string, count: number}>> {
    
    const query = `
      SELECT 
        activity_name as name,
        category,
        COUNT(*) as count
      FROM activities
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '${lookbackDays} days'
      GROUP BY activity_name, category
      HAVING COUNT(*) >= 3  -- Only activities logged at least 3 times
      ORDER BY COUNT(*) DESC
    `;
    
    return db.query(query, [userId]);
  }
  
  /**
   * Categorize activities by impact level
   */
  private categorizeActivities(activities: ActivityImpactAnalysis[]) {
    return {
      highlyBeneficial: activities.filter(a => a.recommendationLevel === 'highly-beneficial'),
      beneficial: activities.filter(a => a.recommendationLevel === 'beneficial'),
      neutral: activities.filter(a => a.recommendationLevel === 'neutral'),
      avoid: activities.filter(a => a.recommendationLevel === 'avoid')
    };
  }
  
  /**
   * Generate summary insights across all activities
   */
  private generateSummaryInsights(categorized: any): string[] {
    const insights: string[] = [];
    
    // Top mood boosters
    const topMoodBoosters = [...categorized.highlyBeneficial, ...categorized.beneficial]
      .sort((a, b) => b.moodImpact.nextDayChange - a.moodImpact.nextDayChange)
      .slice(0, 3)
      .filter(a => a.moodImpact.interpretation.direction === 'improves');
    
    if (topMoodBoosters.length > 0) {
      insights.push(
        `Your top mood boosters: ${topMoodBoosters.map(a => a.activityName).join(', ')}`
      );
    }
    
    // Best for sleep
    const bestForSleep = [...categorized.highlyBeneficial, ...categorized.beneficial]
      .sort((a, b) => b.sleepImpact.nextDayChange - a.sleepImpact.nextDayChange)
      .slice(0, 2)
      .filter(a => a.sleepImpact.interpretation.direction === 'improves');
    
    if (bestForSleep.length > 0) {
      insights.push(
        `For better sleep, do: ${bestForSleep.map(a => a.activityName).join(', ')}`
      );
    }
    
    // Anxiety reducers
    const anxietyReducers = [...categorized.highlyBeneficial, ...categorized.beneficial]
      .sort((a, b) => b.anxietyImpact.nextDayChange - a.anxietyImpact.nextDayChange)
      .slice(0, 2)
      .filter(a => a.anxietyImpact.interpretation.direction === 'improves');
    
    if (anxietyReducers.length > 0) {
      insights.push(
        `Most effective for anxiety: ${anxietyReducers.map(a => a.activityName).join(', ')}`
      );
    }
    
    // Clarity boosters
    const clarityBoosters = [...categorized.highlyBeneficial, ...categorized.beneficial]
      .sort((a, b) => b.clarityImpact.sameDayChange - a.clarityImpact.sameDayChange)
      .slice(0, 2)
      .filter(a => a.clarityImpact.interpretation.direction === 'improves');
    
    if (clarityBoosters.length > 0) {
      insights.push(
        `Sharpens your focus: ${clarityBoosters.map(a => a.activityName).join(', ')}`
      );
    }
    
    // Activities to reconsider
    if (categorized.avoid.length > 0) {
      insights.push(
        `Consider reducing: ${categorized.avoid.slice(0, 2).map(a => a.activityName).join(', ')}`
      );
    }
    
    return insights;
  }
}

4. REAL-TIME IMPACT TRACKING
Track impacts in real-time as users log activities:
typescript// services/analytics/real-time-tracker.service.ts

class RealTimeImpactTrackerService {
  
  /**
   * Called when user logs a new activity
   * Provides immediate feedback based on historical data
   */
  async onActivityLogged(
    userId: string,
    activityName: string,
    activityDate: Date
  ): Promise<InstantFeedback> {
    
    // 1. Check if we have existing correlation data
    const existingCorrelations = await this.getExistingCorrelations(userId, activityName);
    
    if (!existingCorrelations || existingCorrelations.length === 0) {
      return {
        hasData: false,
        message: `We'll start tracking how ${activityName} affects your wellbeing. Keep logging to see patterns!`,
        predictions: null
      };
    }
    
    // 2. Generate predictions based on historical data
    const predictions = this.generatePredictions(existingCorrelations);
    
    // 3. Create instant feedback message
    const feedback = this.createFeedbackMessage(activityName, predictions);
    
    return {
      hasData: true,
      message: feedback,
      predictions
    };
  }
  
  /**
   * Called when user logs mood/sleep after an activity
   * Shows how today compares to typical impact
   */
  async onOutcomeLogged(
    userId: string,
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'anxiety',
    outcomeValue: number,
    date: Date
  ): Promise<OutcomeComparison> {
    
    // 1. Get activities done today or yesterday
    const recentActivities = await this.getRecentActivities(userId, date);
    
    if (recentActivities.length === 0) {
      return {
        hasRelevantActivities: false,
        message: null
      };
    }
    
    // 2. Get expected outcomes based on activities
    const expectedImpacts = await this.getExpectedImpacts(
      userId,
      recentActivities,
      outcomeType
    );
    
    // 3. Compare actual vs expected
    const comparison = this.compareActualVsExpected(
      outcomeValue,
      expectedImpacts,
      outcomeType
    );
    
    return comparison;
  }
  
  private async getExistingCorrelations(
    userId: string,
    activityName: string
  ): Promise<any[]> {
    
    return db.query(`
      SELECT *
      FROM activity_outcome_correlations
      WHERE user_id = $1
        AND activity_name = $2
        AND is_valid = true
      ORDER BY last_updated DESC
    `, [userId, activityName]);
  }
  
  private generatePredictions(correlations: any[]): ActivityPredictions {
    const predictions: ActivityPredictions = {
      mood: null,
      sleep: null,
      clarity: null,
      anxiety: null
    };
    
    for (const corr of correlations) {
      const prediction = {
        expectedChange: corr.next_day_impact,
        confidence: corr.statistical_significance,
        direction: corr.impact_direction,
        description: this.formatPrediction(
          corr.outcome_type,
          corr.next_day_impact,
          corr.impact_direction
        )
      };
      
      predictions[corr.outcome_type] = prediction;
    }
    
    return predictions;
  }
  
  private formatPrediction(
    outcomeType: string,
    change: number,
    direction: string
  ): string {
    
    if (Math.abs(change) < 0.1) {
      return `No significant effect on ${outcomeType} expected`;
    }
    
    const verb = direction === 'improves' ? 'boost' : 'dip';
    const magnitude = Math.abs(change) > 0.5 ? 'significant' : 'moderate';
    
    return `Expect a ${magnitude} ${verb} in ${outcomeType} (${this.formatChange(change, outcomeType)})`;
  }
  
  private formatChange(change: number, outcomeType: string): string {
    switch (outcomeType) {
      case 'mood':
        return `${change > 0 ? '+' : ''}${change.toFixed(1)} points`;
      case 'sleep':
        return `${change > 0 ? '+' : ''}${change.toFixed(1)} quality points`;
      case 'clarity':
        return `${change > 0 ? '+' : ''}${(change * 10).toFixed(0)}%`;
      case 'anxiety':
        return `${Math.abs(change).toFixed(1)} point ${change > 0 ? 'reduction' : 'increase'}`;
      default:
        return `${change.toFixed(2)}`;
    }
  }
  
  private createFeedbackMessage(
    activityName: string,
    predictions: ActivityPredictions
  ): string {
    
    const significantPredictions = Object.entries(predictions)
      .filter(([_, pred]) => pred && Math.abs(pred.expectedChange) >= 0.2)
      .sort((a, b) => Math.abs(b[1].expectedChange) - Math.abs(a[1].expectedChange));
    
    if (significantPredictions.length === 0) {
      return `Great! You've logged ${activityName}. We're tracking its effects.`;
    }
    
    const topPrediction = significantPredictions[0];
    const [outcome, pred] = topPrediction;
    
    return `Based on your history, ${activityName} typically ${pred.description}. Keep tracking to confirm!`;
  }
}

5. API ENDPOINTS
typescript// routes/activity-analytics.routes.ts

/**
 * GET /api/analytics/activities/impact/:activityName
 * Get detailed impact analysis for a specific activity
 */
router.get('/activities/impact/:activityName', async (req, res) => {
  const userId = req.user.id;
  const { activityName } = req.params;
  const { lookbackDays = 90 } = req.query;
  
  try {
    const impact = await activityImpactCalculatorService.calculateActivityImpact(
      userId,
      decodeURIComponent(activityName),
      parseInt(lookbackDays)
    );
    
    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/activities/all-correlations
 * Get correlation summary for all activities
 */
router.get('/activities/all-correlations', async (req, res) => {
  const userId = req.user.id;
  const { lookbackDays = 90 } = req.query;
  
  try {
    const summary = await batchCorrelationService.calculateAllActivityCorrelations(
      userId,
      parseInt(lookbackDays)
    );
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/activities/top-impacts
 * Get top activities by impact type
 */
router.get('/activities/top-impacts', async (req, res) => {
  const userId = req.user.id;
  const { outcomeType, limit = 10 } = req.query;
  
  try {
    const query = `
      SELECT 
        activity_name,
        next_day_impact as impact,
        impact_strength,
        impact_direction,
        statistical_significance,
        total_occurrences
      FROM activity_outcome_correlations
      WHERE user_id = $1
        ${outcomeType ? `AND outcome_type = $2` : ''}
        AND is_valid = true
        AND statistical_significance IN ('significant', 'highly-significant')
      ORDER BY ABS(next_day_impact) DESC
      LIMIT $${outcomeType ? 3 : 2}
    `;
    
    const params = outcomeType ? [userId, outcomeType, limit] : [userId, limit];
    const results = await db.query(query, params);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/activities/instant-feedback
 * Get instant feedback when logging an activity
 */
router.post('/activities/instant-feedback', async (req, res) => {
  const userId = req.user.id;
  const { activityName, activityDate } = req.body;
  
  try {
    const feedback = await realTimeImpactTrackerService.onActivityLogged(
      userId,
      activityName,
      new Date(activityDate)
    );
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/recalculate
 * Trigger recalculation of all correlations (async job)
 */
router.post('/analytics/recalculate', async (req, res) => {
  const userId = req.user.id;
  
  try {
    await analyticsQueue.add('batch-correlation', {
      userId,
      requestedAt: new Date()
    });
    
    res.json({
      status: 'queued',
      message: 'Correlation calculation started. Check back in a few minutes.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

6. SCORING SYSTEM INTEGRATION
typescript// services/scoring/unified-scoring.service.ts

class UnifiedScoringService {
  
  /**
   * Convert raw outcome values to normalized 0-100 scores
   */
  async normalizeOutcomeScore(
    userId: string,
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'anxiety',
    rawValue: number
  ): Promise<NormalizedScore> {
    
    // Get user's baseline percentiles
    const baseline = await baselineService.getBaseline(userId, outcomeType);
    
    // Normalize to 0-100 scale using p10 and p90
    const normalized = ((rawValue - baseline.p10) / (baseline.p90 - baseline.p10)) * 100;
    const clamped = Math.max(0, Math.min(100, normalized));
    
    // Determine quality level
    const quality = this.determineQualityLevel(clamped);
    
    // Get percentile rank
    const percentile = this.calculatePercentile(rawValue, baseline);
    
    return {
      raw: rawValue,
      normalized: clamped,
      quality,
      percentile,
      context: this.getContextualMessage(quality, outcomeType)
    };
  }
  
  private determineQualityLevel(normalizedScore: number): string {
    if (normalizedScore >= 80) return 'excellent';
    if (normalizedScore >= 60) return 'good';
    if (normalizedScore >= 40) return 'fair';
    if (normalizedScore >= 20) return 'poor';
    return 'very-poor';
  }
  
  private calculatePercentile(value: number, baseline: any): number {
    if (value >= baseline.p90) return 90;
    if (value >= baseline.p75) return 75;
    if (value >= baseline.p50) return 50;
    if (value >= baseline.p25) return 25;
    return 10;
  }
  
  private getContextualMessage(quality: string, outcomeType: string): string {
    const messages = {
      excellent: {
        mood: "You're feeling great - in your top 20%!",
        sleep: "Excellent sleep quality for you!",
        clarity: "Your mental clarity is at its peak!",
        anxiety: "Your anxiety is very low - great