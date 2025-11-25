1. BACKEND ARCHITECTURE OVERVIEW
Technology Stack Recommendation
Backend Core:
├── API Layer: Node.js + Express/Fastify OR Python + FastAPI
├── Database: PostgreSQL (relational) + Redis (caching)
├── Queue System: Bull/BullMQ (for async processing)
├── AI Integration: OpenAI API / Anthropic Claude API
└── Mobile Integration: RESTful API + WebSocket (real-time)
System Architecture
Mobile App
    ↓
API Gateway (Rate Limiting, Auth)
    ↓
┌─────────────────────────────────────┐
│   Core Services Layer               │
│  ├── User Service                   │
│  ├── Data Collection Service        │
│  ├── Analytics Engine               │
│  └── Insight Generation Service     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Processing Layer (Async)          │
│  ├── Correlation Calculator         │
│  ├── Pattern Detector               │
│  ├── Score Normalizer               │
│  └── AI Insight Generator           │
└─────────────────────────────────────┘
    ↓
Database (PostgreSQL) + Cache (Redis)

2. DATABASE SCHEMA DESIGN
Core Tables (Already Defined)
Your existing schema is solid. Add these supporting tables:
sql-- Store calculated baselines for each user
CREATE TABLE user_baselines (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    metric_type VARCHAR(50), -- 'mood', 'sleep', 'clarity', etc.
    p10 DECIMAL(5,2),
    p25 DECIMAL(5,2),
    p50 DECIMAL(5,2),
    p75 DECIMAL(5,2),
    p90 DECIMAL(5,2),
    sample_size INT,
    last_calculated TIMESTAMP,
    UNIQUE(user_id, metric_type)
);

-- Cache correlation results
CREATE TABLE correlation_cache (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    factor_type VARCHAR(50), -- 'sleep', 'exercise', etc.
    outcome_type VARCHAR(50), -- 'mood', 'clarity', etc.
    coefficient DECIMAL(5,3),
    p_value DECIMAL(10,8),
    confidence_low DECIMAL(5,3),
    confidence_high DECIMAL(5,3),
    sample_size INT,
    significance VARCHAR(20),
    calculated_at TIMESTAMP,
    valid_until TIMESTAMP,
    UNIQUE(user_id, factor_type, outcome_type)
);

-- Store generated insights
CREATE TABLE insights (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    insight_type VARCHAR(50), -- 'discovery', 'confirmation', etc.
    category VARCHAR(50), -- 'sleep', 'mood', 'activity', etc.
    title VARCHAR(200),
    message TEXT,
    action_text TEXT,
    confidence VARCHAR(20),
    priority INT,
    data_source JSONB, -- Store the data that led to this insight
    shown_to_user BOOLEAN DEFAULT false,
    user_feedback INT, -- 1-5 rating
    created_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Track recommendations given and outcomes
CREATE TABLE recommendations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    recommendation_type VARCHAR(50),
    action_recommended TEXT,
    reasoning TEXT,
    expected_benefit TEXT,
    priority VARCHAR(20),
    given_at TIMESTAMP,
    acted_upon BOOLEAN,
    outcome_score DECIMAL(3,2), -- Did it help? (measured)
    user_feedback INT
);

-- Store activity impact scores
CREATE TABLE activity_impacts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    activity_name VARCHAR(100),
    activity_category VARCHAR(50),
    occurrences INT,
    mood_impact_immediate DECIMAL(4,2),
    mood_impact_next_day DECIMAL(4,2),
    sleep_quality_impact DECIMAL(4,2),
    sleep_duration_impact DECIMAL(4,2),
    clarity_impact DECIMAL(4,2),
    energy_impact DECIMAL(4,2),
    overall_benefit_score DECIMAL(5,2),
    confidence_score DECIMAL(3,2),
    last_calculated TIMESTAMP
);

3. CORE ALGORITHM IMPLEMENTATIONS
A. Statistical Correlation Engine
typescript// services/analytics/correlation.service.ts

interface CorrelationInput {
  userId: string;
  factorType: 'sleep' | 'activity' | 'habit';
  outcomeType: 'mood' | 'clarity' | 'productivity';
  lagDays?: number; // 0 = same day, 1 = next day, etc.
  minSampleSize?: number;
}

interface CorrelationResult {
  coefficient: number;
  pValue: number;
  confidenceInterval: [number, number];
  sampleSize: number;
  strength: 'none' | 'weak' | 'moderate' | 'strong';
  significance: 'none' | 'low' | 'significant' | 'highly-significant';
  direction: 'positive' | 'negative' | 'none';
}

class CorrelationService {
  
  async calculateCorrelation(input: CorrelationInput): Promise<CorrelationResult> {
    const { userId, factorType, outcomeType, lagDays = 0, minSampleSize = 10 } = input;
    
    // 1. Fetch paired data
    const pairedData = await this.fetchPairedData(userId, factorType, outcomeType, lagDays);
    
    if (pairedData.length < minSampleSize) {
      return this.insufficientDataResult(pairedData.length);
    }
    
    // 2. Calculate Pearson correlation
    const coefficient = this.pearsonCorrelation(
      pairedData.map(d => d.factor),
      pairedData.map(d => d.outcome)
    );
    
    // 3. Calculate statistical significance
    const pValue = this.calculatePValue(coefficient, pairedData.length);
    
    // 4. Calculate confidence interval (using Fisher's z-transformation)
    const ci = this.confidenceInterval(coefficient, pairedData.length, 0.95);
    
    // 5. Interpret results
    return {
      coefficient,
      pValue,
      confidenceInterval: ci,
      sampleSize: pairedData.length,
      strength: this.interpretStrength(Math.abs(coefficient)),
      significance: this.interpretSignificance(pValue),
      direction: this.interpretDirection(coefficient)
    };
  }
  
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt(
      ((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY))
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  private calculatePValue(r: number, n: number): number {
    // Using t-distribution for correlation significance
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2;
    
    // Simplified p-value calculation (use a proper stats library in production)
    return this.tDistributionPValue(t, df);
  }
  
  private confidenceInterval(r: number, n: number, confidence: number): [number, number] {
    // Fisher's z-transformation
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zCrit = 1.96; // For 95% confidence
    
    const zLow = z - zCrit * se;
    const zHigh = z + zCrit * se;
    
    // Transform back to correlation scale
    const rLow = (Math.exp(2 * zLow) - 1) / (Math.exp(2 * zLow) + 1);
    const rHigh = (Math.exp(2 * zHigh) - 1) / (Math.exp(2 * zHigh) + 1);
    
    return [rLow, rHigh];
  }
  
  private interpretStrength(absR: number): string {
    if (absR < 0.3) return 'weak';
    if (absR < 0.5) return 'moderate';
    return 'strong';
  }
  
  private interpretSignificance(p: number): string {
    if (p > 0.05) return 'none';
    if (p > 0.01) return 'low';
    if (p > 0.001) return 'significant';
    return 'highly-significant';
  }
  
  private interpretDirection(r: number): string {
    if (Math.abs(r) < 0.1) return 'none';
    return r > 0 ? 'positive' : 'negative';
  }
  
  private async fetchPairedData(
    userId: string, 
    factorType: string, 
    outcomeType: string, 
    lagDays: number
  ): Promise<Array<{date: string, factor: number, outcome: number}>> {
    // Implementation depends on your specific data structure
    // This is a pseudocode example
    
    const query = `
      WITH factor_data AS (
        SELECT date, value as factor_value
        FROM ${this.getFactorTable(factorType)}
        WHERE user_id = $1
      ),
      outcome_data AS (
        SELECT date, value as outcome_value
        FROM ${this.getOutcomeTable(outcomeType)}
        WHERE user_id = $1
      )
      SELECT 
        f.date,
        f.factor_value as factor,
        o.outcome_value as outcome
      FROM factor_data f
      JOIN outcome_data o ON o.date = f.date + INTERVAL '${lagDays} days'
      WHERE f.factor_value IS NOT NULL 
        AND o.outcome_value IS NOT NULL
      ORDER BY f.date
    `;
    
    return db.query(query, [userId]);
  }
}

B. Personal Baseline Calculator
typescript// services/analytics/baseline.service.ts

interface BaselineResult {
  metricType: string;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  sampleSize: number;
  calculatedAt: Date;
}

class BaselineService {
  
  async calculateBaseline(userId: string, metricType: string): Promise<BaselineResult> {
    // 1. Fetch historical data (last 90 days minimum)
    const historicalData = await this.fetchMetricHistory(userId, metricType, 90);
    
    if (historicalData.length < 10) {
      throw new Error('Insufficient data for baseline calculation');
    }
    
    // 2. Calculate percentiles
    const sorted = historicalData.sort((a, b) => a - b);
    const percentiles = {
      p10: this.percentile(sorted, 10),
      p25: this.percentile(sorted, 25),
      p50: this.percentile(sorted, 50),
      p75: this.percentile(sorted, 75),
      p90: this.percentile(sorted, 90)
    };
    
    // 3. Store in database for reuse
    await this.storeBaseline(userId, metricType, percentiles, historicalData.length);
    
    return {
      metricType,
      percentiles,
      sampleSize: historicalData.length,
      calculatedAt: new Date()
    };
  }
  
  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  
  async normalizeScore(userId: string, metricType: string, rawScore: number): Promise<number> {
    // Get baseline
    const baseline = await this.getBaseline(userId, metricType);
    
    // Normalize to 0-100 scale using p10 and p90
    const normalized = ((rawScore - baseline.p10) / (baseline.p90 - baseline.p10)) * 100;
    
    // Clamp to 0-100
    return Math.max(0, Math.min(100, normalized));
  }
  
  async getPersonalContext(userId: string, metricType: string, currentScore: number): Promise<string> {
    const baseline = await this.getBaseline(userId, metricType);
    
    if (currentScore >= baseline.p90) {
      return "exceptional for you (top 10%)";
    } else if (currentScore >= baseline.p75) {
      return "above your average (top 25%)";
    } else if (currentScore >= baseline.p50) {
      return "around your typical level";
    } else if (currentScore >= baseline.p25) {
      return "below your usual average";
    } else {
      return "lower than usual (bottom 25%)";
    }
  }
}

C. Activity Impact Analyzer
typescript// services/analytics/activity-impact.service.ts

interface ActivityImpactResult {
  activityName: string;
  category: string;
  occurrences: number;
  impacts: {
    mood: ImpactScore;
    sleep: ImpactScore;
    clarity: ImpactScore;
    energy: ImpactScore;
  };
  overallBenefit: number;
  confidence: number;
  recommendation: string;
}

interface ImpactScore {
  immediate: number;      // Same-day change
  nextDay: number;        // Next-day effect
  sustained: number;      // 3-7 day average after
  confidence: number;     // Statistical confidence
}

class ActivityImpactService {
  
  async analyzeActivityImpact(
    userId: string, 
    activityName: string,
    lookbackDays: number = 90
  ): Promise<ActivityImpactResult> {
    
    // 1. Get all instances of this activity
    const activityDates = await this.getActivityDates(userId, activityName, lookbackDays);
    
    if (activityDates.length < 5) {
      throw new Error('Insufficient activity data (minimum 5 occurrences)');
    }
    
    // 2. Calculate impacts on each metric
    const moodImpact = await this.calculateMetricImpact(
      userId, 'mood', activityDates
    );
    
    const sleepImpact = await this.calculateMetricImpact(
      userId, 'sleep', activityDates
    );
    
    const clarityImpact = await this.calculateMetricImpact(
      userId, 'clarity', activityDates
    );
    
    const energyImpact = await this.calculateMetricImpact(
      userId, 'energy', activityDates
    );
    
    // 3. Calculate overall benefit (weighted)
    const overallBenefit = this.calculateOverallBenefit({
      mood: moodImpact,
      sleep: sleepImpact,
      clarity: clarityImpact,
      energy: energyImpact
    });
    
    // 4. Generate recommendation
    const recommendation = this.generateRecommendation(
      activityName,
      overallBenefit,
      Math.min(moodImpact.confidence, sleepImpact.confidence)
    );
    
    return {
      activityName,
      category: await this.getActivityCategory(userId, activityName),
      occurrences: activityDates.length,
      impacts: {
        mood: moodImpact,
        sleep: sleepImpact,
        clarity: clarityImpact,
        energy: energyImpact
      },
      overallBenefit,
      confidence: Math.min(
        moodImpact.confidence,
        sleepImpact.confidence,
        clarityImpact.confidence
      ),
      recommendation
    };
  }
  
  private async calculateMetricImpact(
    userId: string,
    metricType: string,
    activityDates: Date[]
  ): Promise<ImpactScore> {
    
    // Get metric values on activity days vs non-activity days
    const activityDayScores = await this.getMetricOnDates(
      userId, metricType, activityDates, 0 // Same day
    );
    
    const nextDayScores = await this.getMetricOnDates(
      userId, metricType, activityDates, 1 // Next day
    );
    
    const sustainedScores = await this.getMetricOnDates(
      userId, metricType, activityDates, 3, 7 // Days 3-7 after
    );
    
    // Get baseline (all other days)
    const baselineScore = await this.getMetricBaseline(userId, metricType);
    
    // Calculate differences
    const immediate = this.average(activityDayScores) - baselineScore;
    const nextDay = this.average(nextDayScores) - baselineScore;
    const sustained = this.average(sustainedScores) - baselineScore;
    
    // Calculate confidence based on sample size and consistency
    const confidence = this.calculateConfidence(activityDayScores);
    
    return { immediate, nextDay, sustained, confidence };
  }
  
  private calculateOverallBenefit(impacts: {
    mood: ImpactScore;
    sleep: ImpactScore;
    clarity: ImpactScore;
    energy: ImpactScore;
  }): number {
    // Weighted combination (adjust weights based on user goals)
    const weights = {
      mood: 0.35,
      sleep: 0.25,
      clarity: 0.20,
      energy: 0.20
    };
    
    return (
      impacts.mood.immediate * weights.mood +
      impacts.sleep.nextDay * weights.sleep +
      impacts.clarity.immediate * weights.clarity +
      impacts.energy.nextDay * weights.energy
    );
  }
  
  private generateRecommendation(
    activityName: string,
    benefit: number,
    confidence: number
  ): string {
    if (benefit > 0.5 && confidence > 0.7) {
      return `Highly recommended! ${activityName} consistently boosts your wellbeing.`;
    } else if (benefit > 0.2 && confidence > 0.5) {
      return `${activityName} tends to help you feel better.`;
    } else if (benefit < -0.3 && confidence > 0.6) {
      return `Consider reducing ${activityName} - it may be impacting you negatively.`;
    } else {
      return `Not enough data yet to determine ${activityName}'s impact.`;
    }
  }
}

D. Pattern Detection Engine
typescript// services/analytics/pattern.service.ts

interface Pattern {
  type: 'routine' | 'cyclical' | 'warning' | 'success';
  name: string;
  description: string;
  confidence: number;
  evidence: any[];
  actionable: boolean;
  recommendation?: string;
}

class PatternDetectionService {
  
  async detectPatterns(userId: string): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    // 1. Detect successful routines
    const routines = await this.detectRoutines(userId);
    patterns.push(...routines);
    
    // 2. Detect day-of-week patterns
    const cyclical = await this.detectCyclicalPatterns(userId);
    patterns.push(...cyclical);
    
    // 3. Detect warning signs
    const warnings = await this.detectWarningPatterns(userId);
    patterns.push(...warnings);
    
    // 4. Rank by confidence and actionability
    return patterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Top 10 patterns
  }
  
  private async detectRoutines(userId: string): Promise<Pattern[]> {
    // Find sequences of activities that often occur together
    const query = `
      WITH activity_sequences AS (
        SELECT 
          a1.activity_name as first_activity,
          a2.activity_name as second_activity,
          AVG(ml.mood_score) as avg_mood_after,
          COUNT(*) as occurrences
        FROM activities a1
        JOIN activities a2 
          ON a1.user_id = a2.user_id 
          AND a1.date = a2.date
          AND a2.created_at > a1.created_at
          AND a2.created_at - a1.created_at < INTERVAL '4 hours'
        LEFT JOIN mood_logs ml 
          ON ml.user_id = a1.user_id 
          AND ml.date = a1.date
          AND ml.created_at > a2.created_at
        WHERE a1.user_id = $1
        GROUP BY a1.activity_name, a2.activity_name
        HAVING COUNT(*) >= 3
      )
      SELECT * FROM activity_sequences
      ORDER BY avg_mood_after DESC, occurrences DESC
      LIMIT 5
    `;
    
    const sequences = await db.query(query, [userId]);
    
    return sequences.map(seq => ({
      type: 'routine',
      name: `${seq.first_activity} → ${seq.second_activity}`,
      description: `You've done this sequence ${seq.occurrences} times, with an average mood of ${seq.avg_mood_after.toFixed(1)}/5`,
      confidence: Math.min(seq.occurrences / 10, 0.95),
      evidence: [seq],
      actionable: true,
      recommendation: seq.avg_mood_after > 3.5 
        ? `Continue this pattern - it seems to work well for you!`
        : null
    }));
  }
  
  private async detectCyclicalPatterns(userId: string): Promise<Pattern[]> {
    // Analyze day-of-week effects
    const query = `
      SELECT 
        EXTRACT(DOW FROM date) as day_of_week,
        AVG(mood_score) as avg_mood,
        STDDEV(mood_score) as mood_variance,
        COUNT(*) as sample_size
      FROM mood_logs
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY EXTRACT(DOW FROM date)
      HAVING COUNT(*) >= 5
    `;
    
    const dayStats = await db.query(query, [userId]);
    const patterns: Pattern[] = [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const overallAvg = dayStats.reduce((sum, d) => sum + d.avg_mood, 0) / dayStats.length;
    
    dayStats.forEach(day => {
      const deviation = day.avg_mood - overallAvg;
      if (Math.abs(deviation) > 0.5) {
        patterns.push({
          type: 'cyclical',
          name: `${dayNames[day.day_of_week]} Pattern`,
          description: deviation > 0 
            ? `Your mood is typically ${Math.abs(deviation).toFixed(1)} points higher on ${dayNames[day.day_of_week]}s`
            : `Your mood tends to dip on ${dayNames[day.day_of_week]}s`,
          confidence: Math.min(day.sample_size / 15, 0.9),
          evidence: [day],
          actionable: deviation < 0,
          recommendation: deviation < 0 
            ? `Consider scheduling self-care activities on ${dayNames[day.day_of_week]}s`
            : null
        });
      }
    });
    
    return patterns;
  }
  
  private async detectWarningPatterns(userId: string): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    
    // Detect declining trends
    const recentMood = await this.getRecentTrend(userId, 'mood', 7);
    const previousMood = await this.getRecentTrend(userId, 'mood', 14, 7);
    
    if (recentMood < previousMood - 0.5) {
      patterns.push({
        type: 'warning',
        name: 'Declining Mood Trend',
        description: `Your mood has decreased by ${(previousMood - recentMood).toFixed(1)} points over the past week`,
        confidence: 0.85,
        evidence: [{ recent: recentMood, previous: previousMood }],
        actionable: true,
        recommendation: 'Consider reaching out to a friend or practicing self-care activities that have helped you before'
      });
    }
    
    // Detect sleep debt accumulation
    const avgSleep = await this.getAverageSleep(userId, 7);
    if (avgSleep < 6.5) {
      patterns.push({
        type: 'warning',
        name: 'Sleep Deficit',
        description: `You've been averaging only ${avgSleep.toFixed(1)} hours of sleep this week`,
        confidence: 0.9,
        evidence: [{ avgSleep }],
        actionable: true,
        recommendation: 'Prioritize getting to bed 30 minutes earlier tonight'
      });
    }
    
    return patterns;
  }
}

4. API ENDPOINT STRUCTURE
typescript// routes/analytics.routes.ts

/**
 * GET /api/analytics/dashboard
 * Returns comprehensive analytics for the dashboard
 */
router.get('/dashboard', async (req, res) => {
  const userId = req.user.id;
  const timeframe = req.query.timeframe || '30'; // days
  
  const [
    baselines,
    correlations,
    insights,
    patterns,
    activityImpacts
  ] = await Promise.all([
    baselineService.getAllBaselines(userId),
    correlationService.getSignificantCorrelations(userId, timeframe),
    insightService.getActiveInsights(userId),
    patternService.detectPatterns(userId),
    activityImpactService.getTopActivities(userId, 10)
  ]);
  
  res.json({
    baselines,
    correlations,
    insights,
    patterns,
    activityImpacts,
    generatedAt: new Date()
  });
});

/**
 * POST /api/analytics/calculate
 * Triggers analytics recalculation (async job)
 */
router.post('/calculate', async (req, res) => {
  const userId = req.user.id;
  
  // Queue analytics job
  await analyticsQueue.add('full-calculation', {
    userId,
    requestedAt: new Date()
  });
  
  res.json({ 
    status: 'queued',
    message: 'Analytics calculation started. Results will be available shortly.'
  });
});

/**
 * GET /api/analytics/activity/:activityName/impact
 * Get detailed impact analysis for a specific activity
 */
router.get('/activity/:activityName/impact', async (req, res) => {
  const userId = req.user.id;
  const { activityName } = req.params;
  
  const impact = await activityImpactService.analyzeActivityImpact(
    userId,
    decodeURIComponent(activityName)
  );
  
  res.json(impact);
});

/**
 * GET /api/recommendations/daily
 * Get personalized daily recommendations
 */
router.get('/recommendations/daily', async (req, res) => {
  const userId = req.user.id;
  
  const recommendations = await recommendationService.generateDailyRecommendations(
    userId
  );
  
  res.json(recommendations);
});

/**
 * POST /api/insights/feedback
 * User feedback on insights
 */
router.post('/insights/feedback', async (req, res) => {
  const { insightId, rating, helpful } = req.body;
  
  await insightService.recordFeedback(insightId, rating, helpful);
  
  res.json({ success: true });
});

5. ASYNC PROCESSING STRATEGY
typescript// workers/analytics.worker.ts

import { Queue, Worker } from 'bullmq';

const analyticsQueue = new Queue('analytics', {
  connection: redisConnection
});

// Worker to process analytics jobs
const worker = new Worker('analytics', async (job) => {
  const { userId } = job.data;
  
  switch (job.name) {
    case 'full-calculation':
      await performFullCalculation(userId);
      break;
      
    case 'correlation-update':
      await updateCorrelations(userId);
      break;
      
    case 'baseline-recalc':
      await recalculateBaselines(userId);
      break;
      
    case 'generate-insights':
      await generateInsights(userId);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 5
});

async function performFullCalculation(userId: string) {
  // 1. Recalculate baselines (if enough new data)
  await baselineService.updateAllBaselines(userId);
  
  // 2. Update correlations
  await correlationService.calculateAllCorrelations(userId);
  
  // 3. Analyze activity impacts
  await activityImpactService.updateAllImpacts(userId);
  
  // 4. Detect patterns
  await patternService.detectAndStorePatterns(userId);
  
  // 5. Generate AI insights
  await insightService.generateNewInsights(userId);
  
  // 6. Update recommendations
  await recommendationService.updateRecommendations(userId);
}

// Schedule daily analytics updates for all users
cron.schedule('0 2 * * *', async () => {
  const activeUsers = await getActiveUsers(); // Users with data in last 7 days
  
  for (const user of activeUsers) {
    await analyticsQueue.add('full-calculation', {
      userId: user.id
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }
});

6. CACHING STRATEGY
typescript// services/cache.service.ts

class CacheService {
  private redis: Redis;
  
  async getCachedAnalytics(userId: string, key: string): Promise<any | null> {
    const cached = await this.redis.get(`analytics:${userId}:${key}`);
    return cached ? JSON.parse(cached) : null;RetryGContinue2 / 2}
async setCachedAnalytics(
userId: string,
key: string,
data: any,
ttlSeconds: number = 3600
): Promise<void> {
await this.redis.setex(
analytics:${userId}:${key},
ttlSeconds,
JSON.stringify(data)
);
}
async invalidateUserAnalytics(userId: string): Promise<void> {
const keys = await this.redis.keys(analytics:${userId}:*);
if (keys.length > 0) {
await this.redis.del(...keys);
}
}
// Cache correlation results for 24 hours
async getCachedCorrelation(
userId: string,
factor: string,
outcome: string
): Promise<CorrelationResult | null> {
return this.getCachedAnalytics(userId, correlation:${factor}:${outcome});
}
async setCachedCorrelation(
userId: string,
factor: string,
outcome: string,
result: CorrelationResult
): Promise<void> {
await this.setCachedAnalytics(
userId,
correlation:${factor}:${outcome},
result,
86400 // 24 hours
);
}
}

---

## 7. AI INSIGHT GENERATION SERVICE
```typescript
// services/ai/insight-generator.service.ts

interface UserDataSummary {
  userId: string;
  timeframe: number; // days
  
  // Aggregate stats
  avgMood: number;
  avgSleep: number;
  avgClarity: number;
  avgProductivity: number;
  
  // Baselines
  baselineMood: number;
  baselineSleep: number;
  
  // Top activities
  topActivities: Array<{name: string, count: number, avgImpact: number}>;
  
  // Correlations
  significantCorrelations: CorrelationResult[];
  
  // Patterns
  patterns: Pattern[];
  
  // Trends
  moodTrend: 'improving' | 'stable' | 'declining';
  sleepTrend: 'improving' | 'stable' | 'declining';
  
  // User profile
  trackingDays: number;
  goals: string[];
  concerns: string[];
}

class InsightGeneratorService {
  private openai: OpenAI;
  private cacheService: CacheService;
  
  async generateInsights(userId: string): Promise<Insight[]> {
    // 1. Check cache first
    const cached = await this.cacheService.getCachedAnalytics(userId, 'insights');
    if (cached && this.isFresh(cached.generatedAt, 12 * 60 * 60)) { // 12 hours
      return cached.insights;
    }
    
    // 2. Gather user data summary
    const summary = await this.buildUserSummary(userId);
    
    // 3. Generate insights using AI
    const aiInsights = await this.generateAIInsights(summary);
    
    // 4. Generate rule-based insights (faster, deterministic)
    const ruleInsights = await this.generateRuleBasedInsights(summary);
    
    // 5. Combine and rank
    const allInsights = [...aiInsights, ...ruleInsights];
    const ranked = this.rankInsights(allInsights);
    
    // 6. Store in database
    await this.storeInsights(userId, ranked);
    
    // 7. Cache results
    await this.cacheService.setCachedAnalytics(
      userId, 
      'insights', 
      { insights: ranked, generatedAt: new Date() },
      12 * 60 * 60
    );
    
    return ranked;
  }
  
  private async buildUserSummary(userId: string): Promise<UserDataSummary> {
    const timeframe = 14; // Last 14 days
    
    const [
      moodStats,
      sleepStats,
      clarityStats,
      topActivities,
      correlations,
      patterns,
      userProfile
    ] = await Promise.all([
      this.getMoodStats(userId, timeframe),
      this.getSleepStats(userId, timeframe),
      this.getClarityStats(userId, timeframe),
      this.getTopActivities(userId, timeframe),
      correlationService.getSignificantCorrelations(userId, timeframe),
      patternService.detectPatterns(userId),
      this.getUserProfile(userId)
    ]);
    
    return {
      userId,
      timeframe,
      avgMood: moodStats.average,
      avgSleep: sleepStats.average,
      avgClarity: clarityStats.average,
      avgProductivity: 0, // Add if available
      baselineMood: userProfile.baselineMood,
      baselineSleep: userProfile.baselineSleep,
      topActivities,
      significantCorrelations: correlations,
      patterns,
      moodTrend: this.calculateTrend(moodStats.values),
      sleepTrend: this.calculateTrend(sleepStats.values),
      trackingDays: userProfile.trackingDays,
      goals: userProfile.goals || [],
      concerns: userProfile.concerns || []
    };
  }
  
  private async generateAIInsights(summary: UserDataSummary): Promise<Insight[]> {
    const prompt = this.buildInsightPrompt(summary);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a wellness coach analyzing user data. Generate 3-5 personalized, actionable insights. 
            Return JSON array of insights with format:
            {
              "type": "discovery" | "confirmation" | "opportunity" | "warning" | "achievement",
              "category": "mood" | "sleep" | "activity" | "habits",
              "title": "Short headline (max 60 chars)",
              "message": "2-3 sentences explanation",
              "action": "One specific thing to do",
              "confidence": "high" | "medium" | "low"
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message.content;
      const insights = JSON.parse(content);
      
      return insights.map((insight: any) => ({
        ...insight,
        source: 'ai',
        userId: summary.userId,
        dataSource: { summary }
      }));
      
    } catch (error) {
      console.error('AI insight generation failed:', error);
      return []; // Fall back to rule-based only
    }
  }
  
  private buildInsightPrompt(summary: UserDataSummary): string {
    return `
USER WELLNESS PROFILE (Last ${summary.timeframe} days):

METRICS:
- Average Mood: ${summary.avgMood.toFixed(1)}/5 (Baseline: ${summary.baselineMood.toFixed(1)}, Trend: ${summary.moodTrend})
- Average Sleep: ${summary.avgSleep.toFixed(1)} hours (Baseline: ${summary.baselineSleep.toFixed(1)}, Trend: ${summary.sleepTrend})
- Mental Clarity: ${summary.avgClarity.toFixed(1)}/10
- Tracking Duration: ${summary.trackingDays} days

TOP ACTIVITIES:
${summary.topActivities.map(a => `- ${a.name}: ${a.count} times, impact score ${a.avgImpact.toFixed(2)}`).join('\n')}

SIGNIFICANT CORRELATIONS:
${summary.significantCorrelations.slice(0, 5).map(c => 
  `- ${c.factor} → ${c.outcome}: ${c.coefficient.toFixed(2)} (${c.significance})`
).join('\n')}

DETECTED PATTERNS:
${summary.patterns.slice(0, 3).map(p => `- ${p.name}: ${p.description}`).join('\n')}

USER GOALS: ${summary.goals.join(', ') || 'Not specified'}
CONCERNS: ${summary.concerns.join(', ') || 'None specified'}

Based on this data, generate insights that are:
1. Specific and personalized (use actual numbers and activity names)
2. Actionable with clear next steps
3. Evidence-based (reference correlations or patterns)
4. Encouraging and non-judgmental
5. Varied in type (mix of discoveries, confirmations, opportunities)

Focus on the most impactful findings. Avoid generic advice.
`.trim();
  }
  
  private async generateRuleBasedInsights(summary: UserDataSummary): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Rule 1: Mood improvement trend
    if (summary.moodTrend === 'improving' && summary.avgMood > summary.baselineMood + 0.3) {
      insights.push({
        type: 'achievement',
        category: 'mood',
        title: '🎉 Your mood is improving!',
        message: `Your mood has been ${((summary.avgMood - summary.baselineMood) / summary.baselineMood * 100).toFixed(0)}% higher than your baseline over the past ${summary.timeframe} days. Keep up whatever you're doing!`,
        action: 'Reflect on what activities or habits contributed to this improvement',
        confidence: 'high',
        source: 'rule',
        userId: summary.userId,
        dataSource: { trend: summary.moodTrend, comparison: summary.avgMood - summary.baselineMood }
      });
    }
    
    // Rule 2: Sleep deficit warning
    if (summary.avgSleep < 6.5 && summary.sleepTrend === 'declining') {
      insights.push({
        type: 'warning',
        category: 'sleep',
        title: '⚠️ Sleep deficit detected',
        message: `You've been averaging only ${summary.avgSleep.toFixed(1)} hours of sleep, which is below the recommended 7-9 hours. This may be affecting your mood and energy.`,
        action: 'Try going to bed 30 minutes earlier tonight',
        confidence: 'high',
        source: 'rule',
        userId: summary.userId,
        dataSource: { avgSleep: summary.avgSleep, trend: summary.sleepTrend }
      });
    }
    
    // Rule 3: Strong activity correlation
    const strongCorr = summary.significantCorrelations
      .filter(c => Math.abs(c.coefficient) > 0.5 && c.significance === 'highly-significant')
      .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))[0];
    
    if (strongCorr && strongCorr.coefficient > 0) {
      insights.push({
        type: 'discovery',
        category: 'activity',
        title: `💡 ${strongCorr.factor} strongly boosts ${strongCorr.outcome}`,
        message: `We found a strong correlation (${strongCorr.coefficient.toFixed(2)}) between ${strongCorr.factor} and improved ${strongCorr.outcome}. This relationship is statistically significant with high confidence.`,
        action: `Try to incorporate ${strongCorr.factor} into your routine more regularly`,
        confidence: 'high',
        source: 'rule',
        userId: summary.userId,
        dataSource: strongCorr
      });
    }
    
    // Rule 4: Successful pattern
    const successPattern = summary.patterns.find(p => p.type === 'routine' && p.confidence > 0.7);
    if (successPattern) {
      insights.push({
        type: 'confirmation',
        category: 'habits',
        title: `✅ ${successPattern.name} is working`,
        message: successPattern.description,
        action: successPattern.recommendation || 'Continue this pattern',
        confidence: 'medium',
        source: 'rule',
        userId: summary.userId,
        dataSource: successPattern
      });
    }
    
    // Rule 5: Activity opportunity
    const underutilizedActivity = summary.topActivities
      .filter(a => a.avgImpact > 0.5 && a.count < 5)
      .sort((a, b) => b.avgImpact - a.avgImpact)[0];
    
    if (underutilizedActivity) {
      insights.push({
        type: 'opportunity',
        category: 'activity',
        title: `🌟 Try more ${underutilizedActivity.name}`,
        message: `${underutilizedActivity.name} has a high positive impact (${underutilizedActivity.avgImpact.toFixed(2)}), but you've only done it ${underutilizedActivity.count} times. Consider doing it more often.`,
        action: `Schedule ${underutilizedActivity.name} for this week`,
        confidence: 'medium',
        source: 'rule',
        userId: summary.userId,
        dataSource: underutilizedActivity
      });
    }
    
    return insights;
  }
  
  private rankInsights(insights: Insight[]): Insight[] {
    // Ranking algorithm based on:
    // 1. Type priority (warning > opportunity > discovery > confirmation > achievement)
    // 2. Confidence level
    // 3. Recency of data
    // 4. Actionability
    
    const typePriority = {
      warning: 5,
      opportunity: 4,
      discovery: 3,
      confirmation: 2,
      achievement: 1
    };
    
    const confidenceScore = {
      high: 3,
      medium: 2,
      low: 1
    };
    
    return insights
      .map(insight => ({
        ...insight,
        score: (typePriority[insight.type] || 0) * 10 + 
               (confidenceScore[insight.confidence] || 0) * 3 +
               (insight.action ? 2 : 0)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 insights
  }
  
  private async storeInsights(userId: string, insights: Insight[]): Promise<void> {
    // Clear old insights (older than 7 days)
    await db.query(
      'DELETE FROM insights WHERE user_id = $1 AND created_at < NOW() - INTERVAL \'7 days\'',
      [userId]
    );
    
    // Insert new insights
    for (const insight of insights) {
      await db.query(`
        INSERT INTO insights (
          id, user_id, insight_type, category, title, message, 
          action_text, confidence, priority, data_source, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (user_id, title) DO UPDATE SET
          message = EXCLUDED.message,
          updated_at = NOW()
      `, [
        uuidv4(),
        userId,
        insight.type,
        insight.category,
        insight.title,
        insight.message,
        insight.action,
        insight.confidence,
        insight.score || 0,
        JSON.stringify(insight.dataSource),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ]);
    }
  }
  
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
    if (values.length < 3) return 'stable';
    
    // Simple linear regression slope
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    const slope = numerator / denominator;
    
    if (slope > 0.05) return 'improving';
    if (slope < -0.05) return 'declining';
    return 'stable';
  }
  
  private isFresh(timestamp: Date, maxAgeSeconds: number): boolean {
    const age = (Date.now() - new Date(timestamp).getTime()) / 1000;
    return age < maxAgeSeconds;
  }
}
```

---

## 8. RECOMMENDATION ENGINE
```typescript
// services/recommendations/recommendation-engine.service.ts

interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'sleep' | 'activity' | 'mood' | 'habits' | 'social';
  title: string;
  action: string;
  reasoning: string;
  expectedBenefit: string;
  timeCommitment: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  alternatives: string[];
  confidence: number;
  evidenceScore: number;
}

class RecommendationEngineService {
  
  async generateDailyRecommendations(userId: string): Promise<Recommendation[]> {
    // 1. Get user context
    const context = await this.getUserContext(userId);
    
    // 2. Generate recommendations from different sources
    const recommendations: Recommendation[] = [];
    
    // High-impact activities
    recommendations.push(...await this.recommendHighImpactActivities(context));
    
    // Address deficits
    recommendations.push(...await this.recommendDeficitAddressing(context));
    
    // Reinforce successes
    recommendations.push(...await this.recommendSuccessReinforcement(context));
    
    // Experimentation
    recommendations.push(...await this.recommendExperimentation(context));
    
    // 3. Rank and filter
    const ranked = this.rankRecommendations(recommendations, context);
    
    // 4. Return top recommendations (tiered)
    return this.tierRecommendations(ranked);
  }
  
  private async recommendHighImpactActivities(context: UserContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Get activities with proven high impact for this user
    const highImpactActivities = await activityImpactService.getTopActivities(
      context.userId,
      5,
      { minConfidence: 0.6, minBenefit: 0.4 }
    );
    
    for (const activity of highImpactActivities) {
      // Check if user hasn't done this recently
      const lastDone = await this.getLastActivityDate(context.userId, activity.name);
      const daysSince = lastDone ? this.daysBetween(lastDone, new Date()) : 999;
      
      if (daysSince >= 3) {
        recommendations.push({
          id: uuidv4(),
          priority: 'high',
          category: this.mapCategory(activity.category),
          title: `Do ${activity.name} today`,
          action: `Set aside time for ${activity.name}`,
          reasoning: `${activity.name} has consistently boosted your wellbeing. When you do this activity, your mood improves by an average of ${(activity.impacts.mood.immediate * 20).toFixed(0)}%.`,
          expectedBenefit: `Better mood and ${activity.impacts.sleep.nextDay > 0 ? 'improved sleep tonight' : 'sustained energy'}`,
          timeCommitment: this.estimateTimeCommitment(activity.name),
          difficulty: 'easy',
          alternatives: await this.findSimilarActivities(activity),
          confidence: activity.confidence,
          evidenceScore: activity.occurrences * activity.confidence
        });
      }
    }
    
    return recommendations;
  }
  
  private async recommendDeficitAddressing(context: UserContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Sleep deficit
    if (context.recentAvgSleep < 7 && context.baselineSleep >= 7) {
      recommendations.push({
        id: uuidv4(),
        priority: 'critical',
        category: 'sleep',
        title: 'Prioritize sleep tonight',
        action: 'Get to bed 30-60 minutes earlier than usual',
        reasoning: `You've been averaging ${context.recentAvgSleep.toFixed(1)} hours of sleep, which is below your usual ${context.baselineSleep.toFixed(1)} hours. Sleep deprivation can significantly impact mood and cognitive function.`,
        expectedBenefit: 'Improved mood, energy, and mental clarity tomorrow',
        timeCommitment: 'Start winding down at 9:30 PM',
        difficulty: 'moderate',
        alternatives: [
          'Take a 20-minute power nap this afternoon',
          'Skip evening commitments to rest'
        ],
        confidence: 0.95,
        evidenceScore: 10
      });
    }
    
    // Mood decline
    if (context.moodTrend === 'declining' && context.recentAvgMood < context.baselineMood - 0.5) {
      const topMoodBooster = await this.getTopMoodBooster(context.userId);
      
      recommendations.push({
        id: uuidv4(),
        priority: 'high',
        category: 'mood',
        title: 'Take action on declining mood',
        action: topMoodBooster 
          ? `Try ${topMoodBooster.name} - it usually helps you feel better`
          : 'Reach out to a friend or do something you enjoy',
        reasoning: `Your mood has been lower than usual this week (${context.recentAvgMood.toFixed(1)} vs your baseline of ${context.baselineMood.toFixed(1)}). Taking proactive steps can help reverse this trend.`,
        expectedBenefit: 'Mood boost and prevention of further decline',
        timeCommitment: '20-30 minutes',
        difficulty: 'easy',
        alternatives: [
          'Take a walk outside',
          'Listen to uplifting music',
          'Journal about your feelings'
        ],
        confidence: 0.75,
        evidenceScore: 8
      });
    }
    
    // Social connection gap
    const daysSinceLastSocial = await this.getDaysSinceLastActivity(context.userId, 'Social');
    if (daysSinceLastSocial > 7) {
      recommendations.push({
        id: uuidv4(),
        priority: 'medium',
        category: 'social',
        title: 'Reconnect with others',
        action: 'Reach out to a friend or family member',
        reasoning: `It's been ${daysSinceLastSocial} days since you logged a social activity. Social connection is important for wellbeing, and your data shows social activities typically improve your mood.`,
        expectedBenefit: 'Increased sense of connection and mood improvement',
        timeCommitment: '30-60 minutes',
        difficulty: 'easy',
        alternatives: [
          'Send a text to 3 people you care about',
          'Video call with a friend',
          'Join a group activity or class'
        ],
        confidence: 0.70,
        evidenceScore: 6
      });
    }
    
    return recommendations;
  }
  
  private async recommendSuccessReinforcement(context: UserContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Active habit streaks
    const activeHabits = await this.getActiveHabitStreaks(context.userId);
    
    for (const habit of activeHabits.filter(h => h.currentStreak >= 7)) {
      recommendations.push({
        id: uuidv4(),
        priority: 'medium',
        category: 'habits',
        title: `Keep your ${habit.name} streak going`,
        action: `Complete ${habit.name} today (${habit.currentStreak} day streak!)`,
        reasoning: `You're on a ${habit.currentStreak}-day streak with ${habit.name}! Maintaining this consistency is contributing to your overall wellbeing.`,
        expectedBenefit: 'Continued progress and motivation',
        timeCommitment: this.estimateTimeCommitment(habit.name),
        difficulty: 'easy',
        alternatives: [],
        confidence: 0.85,
        evidenceScore: habit.currentStreak
      });
    }
    
    return recommendations;
  }
  
  private async recommendExperimentation(context: UserContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Suggest trying new activities based on similar users or research
    const suggestions = [
      {
        activity: 'Morning meditation',
        category: 'self-care',
        reasoning: 'Research shows morning meditation can improve focus and reduce stress throughout the day',
        benefit: 'Improved mental clarity and reduced stress',
        time: '10 minutes',
        difficulty: 'easy'
      },
      {
        activity: 'Evening walk',
        category: 'exercise',
        reasoning: 'Evening physical activity can help improve sleep quality',
        benefit: 'Better sleep and mood',
        time: '20 minutes',
        difficulty: 'easy'
      },
      {
        activity: 'Gratitude journaling',
        category: 'self-care',
        reasoning: 'Writing down 3 things you\'re grateful for can boost mood and perspective',
        benefit: 'Enhanced mood and positive mindset',
        time: '5 minutes',
        difficulty: 'easy'
      }
    ];
    
    // Only recommend experiments if user is in a stable state
    if (context.recentAvgMood >= context.baselineMood && context.recentAvgSleep >= 6.5) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      recommendations.push({
        id: uuidv4(),
        priority: 'low',
        category: randomSuggestion.category as any,
        title: `Try: ${randomSuggestion.activity}`,
        action: `Experiment with ${randomSuggestion.activity} today`,
        reasoning: randomSuggestion.reasoning,
        expectedBenefit: randomSuggestion.benefit,
        timeCommitment: randomSuggestion.time,
        difficulty: randomSuggestion.difficulty as any,
        alternatives: [],
        confidence: 0.50, // Lower confidence for untested activities
        evidenceScore: 2
      });
    }
    
    return recommendations;
  }
  
  private rankRecommendations(
    recommendations: Recommendation[],
    context: UserContext
  ): Recommendation[] {
    return recommendations.sort((a, b) => {
      // Priority score
      const priorityScore = {
        critical: 100,
        high: 75,
        medium: 50,
        low: 25
      };
      
      // Calculate total score
      const scoreA = priorityScore[a.priority] + (a.confidence * 50) + (a.evidenceScore * 2);
      const scoreB = priorityScore[b.priority] + (b.confidence * 50) + (b.evidenceScore * 2);
      
      return scoreB - scoreA;
    });
  }
  
  private tierRecommendations(ranked: Recommendation[]): Recommendation[] {
    // Return top recommendations across tiers:
    // - 1-2 critical/high priority
    // - 2-3 medium priority
    // - 1-2 low priority (experimentation)
    
    const critical = ranked.filter(r => r.priority === 'critical' || r.priority === 'high').slice(0, 2);
    const medium = ranked.filter(r => r.priority === 'medium').slice(0, 3);
    const low = ranked.filter(r => r.priority === 'low').slice(0, 2);
    
    return [...critical, ...medium, ...low];
  }
  
  private async getUserContext(userId: string): Promise<UserContext> {
    // Aggregate recent data for context
    const [
      recentMood,
      recentSleep,
      baselines,
      lastActivities
    ] = await Promise.all([
      this.getAverageMood(userId, 7),
      this.getAverageSleep(userId, 7),
      baselineService.getAllBaselines(userId),
      this.getRecentActivities(userId, 7)
    ]);
    
    return {
      userId,
      recentAvgMood: recentMood.average,
      recentAvgSleep: recentSleep.average,
      baselineMood: baselines.mood?.p50 || recentMood.average,
      baselineSleep: baselines.sleep?.p50 || recentSleep.average,
      moodTrend: this.calculateTrend(recentMood.values),
      lastActivities,
      trackingDays: await this.getTrackingDays(userId)
    };
  }
}
```

---

## 9. PERFORMANCE OPTIMIZATION STRATEGIES
```typescript
// strategies/performance-optimization.ts

class PerformanceOptimizer {
  
  /**
   * Strategy 1: Incremental calculation
   * Only recalculate when new data is added
   */
  async incrementalUpdate(userId: string, newDataType: string) {
    // Check what needs updating based on new data
    const updates = this.determineRequiredUpdates(newDataType);
    
    for (const update of updates) {
      await this.performUpdate(userId, update);
    }
  }
  
  private determineRequiredUpdates(dataType: string): string[] {
    const updateMap = {
      'mood_log': ['baselines_mood', 'correlations_mood', 'insights'],
      'sleep_log': ['baselines_sleep', 'correlations_sleep', 'activity_impact'],
      'activity': ['activity_impact', 'patterns', 'recommendations'],
      'habit_log': ['habit_streaks', 'patterns']
    };
    
    return updateMap[dataType] || [];
  }
  
  /**
   * Strategy 2: Batch processing
   * Process multiple users' analytics together
   */
  async batchProcessUsers(userIds: string[]) {
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(userId => 
          analyticsQueue.add('full-calculation', { userId })
        )
      );
      
      // Small delay to prevent overload
      await this.sleep(1000);
    }
  }
  
  /**
   * Strategy 3: Materialized views
   * Pre-calculate common aggregations
   */
  async createMaterializedViews() {
    // Create materialized view for daily summaries
    await db.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS daily_summaries AS
      SELECT 
        user_id,
        date,
        AVG(mood_score) as avg_mood,
        COUNT(DISTINCT activity_id) as activity_count,
        MAX(sleep_quality) as sleep_quality
      FROM (
        SELECT user_id, date::date, mood_score, NULL as activity_id, NULL as sleep_quality
        FROM mood_logs
        UNION ALL
        SELECT user_id, date::date, NULL, id, NULL
        FROM activities
        UNION ALL
        SELECT user_id, date::date, NULL, NULL, quality
        FROM sleep_