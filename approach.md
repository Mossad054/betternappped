# DATA ANALYSIS & AI-POWERED INSIGHTS IMPROVEMENT APPROACH

## Executive Summary
This document outlines a comprehensive approach to enhance the BetterNapped wellness app's data analysis, correlation algorithms, scoring systems, and AI-powered insights. The goal is to provide users with clearer, more actionable, and personalized recommendations based on their comprehensive wellness data.
## 1. CURRENT DATA COLLECTION AUDIT

### 1.1 Data Points Collected

#### **Primary Wellness Metrics**
1. **Mood Logs** (`mood_logs`)
   - Mood selections (array of mood IDs)
   - Mood score (1-5 scale)
   - Emoji representation
   - Emotional triggers (JSON object)
   - Notes (text)
   - Date/timestamp

2. **Sleep Logs** (`sleep_logs`)
   - Bedtime (timestamp)
   - Wake time (timestamp)
   - Total hours (calculated)
   - Quality rating (1-5 scale)
   - Waking feeling (categorical: Refreshed, Tired, etc.)
   - Date

3. **Activities** (`activities`)
   - Category (Social, Exercise, Self-care, etc.)
   - Activity name
   - Duration (optional)
   - Emoji
   - Follow-up answer (context/details)
   - Date

4. **Mental Clarity** (`mental_clarity_tests`)
   - Clarity score (calculated from test)
   - Test scores/metrics (JSON)
   - Factors affecting clarity (array)
   - Date

5. **Productivity** (`productivity_logs`)
   - Rating (1-5 scale)
   - Focused hours
   - Contributing factors (array)
   - Other factors (text)
   - Date

6. **Intimacy Logs** (`intimacy_logs`)
   - Type (solo/couple)
   - Time of day
   - Orgasm (boolean)
   - Location
   - Toy used (boolean)
   - Time to sleep (minutes)
   - Mood before (1-5)
   - Mood after (1-5)
   - Date

7. **Intimacy Check-ins** (`intimacy_check_ins`)
   - Mood (1-10)
   - Stress level (1-10)
   - Connection with self (1-10)
   - Connection with partner (1-10)
   - Energy level (1-10)
   - Intimacy frequency (numeric)
   - Intimacy quality (1-10)
   - Emotional distance (boolean)
   - What made you feel close (text)
   - What appreciated (text)
   - Notes

8. **Connection Scores** (`connection_scores`)
   - Overall score (0-100)
   - Mood contribution
   - Intimacy contribution
   - Communication contribution
   - Stress penalty
   - Trend (up/down/stable)
   - Date

#### **Behavioral Tracking**
9. **Habits** (`habits`)
   - Name
   - Description
   - Category
   - Frequency (daily, weekly)
   - Target count
   - Icon/color
   - Current streak
   - Best streak

10. **Habit Logs** (`habit_logs`)
    - Habit ID (reference)
    - Completed (boolean)
    - Notes
    - Date

11. **Experiments** (`experiments`)
    - Activity name
    - Hypothesis
    - Duration (days)
    - Start/end dates
    - Status (active/completed)
    - Current day progress
    - Results data (JSON)
    - Insights (text)

12. **Experiment Logs** (`experiment_logs`)
    - Experiment ID (reference)
    - Completed (boolean)
    - Mood before/after (1-5)
    - Sleep quality before/after (1-5)
    - Effectiveness rating (1-5)
    - Notes
    - Date

#### **Program & Learning**
13. **Intimacy Programs** (`intimacy_programs`)
    - Program type
    - Title
    - Description
    - Start date
    - Target end date
    - Current lesson number
    - Total lessons
    - Pace (daily/custom)
    - Status (active/paused/completed)

14. **Program Lessons** (`program_lessons`)
    - Program ID (reference)
    - Lesson number
    - Title
    - Content
    - Action item
    - Practice timeline
    - Reminder date
    - Completed (boolean)
    - Feedback rating
    - Feedback note

15. **Intimacy Experiments** (`intimacy_experiments`)
    - Title
    - Description
    - Hypothesis
    - Duration days
    - Start/end dates
    - Parameters tracked (array)
    - Frequency (daily/alternate)
    - Reminder time
    - Status
    - Completion rate

---

## 2. CURRENT ANALYTICS CAPABILITIES

### 2.1 Existing Algorithms

#### **Correlation Calculations**
- **Sleep-Mood Correlation**: Pearson correlation between sleep hours and mood scores
- **Exercise-Mood Correlation**: Compares mood on exercise days vs non-exercise days
- **Sleep-Clarity Correlation**: Relates sleep quality to mental clarity scores
- **Activity Impact Scoring**: Calculates impact of activity categories on mood, sleep, and clarity

#### **Aggregation Methods**
- **Averages**: Simple arithmetic means for mood, sleep, clarity, productivity
- **Frequency Counting**: Activity occurrences, habit completions
- **Streak Tracking**: Consecutive day calculations for habits
- **Before/After Comparisons**: Intimacy mood impacts, experiment effectiveness

#### **Current Scoring Systems**
1. **Mood Score**: Average of selected mood intensities (1-5 scale)
2. **Sleep Quality**: User-rated quality (1-5 scale)
3. **Mental Clarity**: Test-based score (0-10 scale)
4. **Productivity**: Self-rated (1-5 scale)
5. **Connection Score**: Calculated formula:
   ```
   score = (mood/10 * 40) + (intimacy_quality/10 * 30) + (connection_self/10 * 20) - (stress_level/10 * 10)
   ```
6. **Activity Impact**: Normalized scores based on before/after changes in metrics

---

## 3. IDENTIFIED GAPS & WEAKNESSES

### 3.1 Data Collection Gaps
❌ **Missing temporal patterns**: No hour-of-day tracking for most activities
❌ **Limited context**: Minimal environmental/situational factors (weather, location, social context)
❌ **No baseline measurements**: Lack of initial assessment for personalization
❌ **Incomplete relationships**: Activities not linked to outcomes consistently

### 3.2 Algorithm Limitations

#### **Correlation Issues**
- Simple Pearson correlation doesn't account for non-linear relationships
- No lag analysis (activity today → outcome tomorrow)
- Insufficient data validation (minimum sample sizes not enforced)
- No confidence intervals or statistical significance testing
- Confounding variables not controlled

#### **Scoring Problems**
- Different scales (1-5, 1-10, 0-100) make comparisons difficult
- Equal weighting assumptions (all factors weighted the same)
- No personalization (same formula for everyone)
- Static thresholds (e.g., "good mood" = 4+ doesn't adapt)

#### **Insight Generation Weaknesses**
- Template-based insights lack depth
- No multi-factor analysis (e.g., sleep + exercise + stress → mood)
- Missing trend detection (improving, declining, plateauing)
- No predictive capabilities
- Insights not actionable enough
- No prioritization of recommendations

### 3.3 User Experience Issues
- Overwhelming amount of data without clear narrative
- No personalized baselines ("What's good for YOU?")
- Insights appear generic
- No goal-setting integration
- Missing "What should I do today?" recommendations

---

## 4. ENHANCED DATA STRATEGY

### 4.1 Additional Data Collection

#### **Phase 1: Quick Wins (No schema changes)**
1. **Derive from existing data**:
   - Day of week patterns
   - Time between activities
   - Activity combinations on same day
   - Sequence patterns
   - Consistency metrics

2. **Metadata enrichment**:
   - First occurrence tracking
   - Frequency percentiles
   - Personal benchmarks

#### **Phase 2: New Data Points (Schema additions)**
1. **Contextual factors**:
   - Time of day for activities
   - Social context (alone, with partner, with friends)
   - Location type (home, outdoor, gym)

2. **Baseline assessments**:
   - Initial wellness quiz
   - Personality indicators
   - Goals and priorities
   - Known sensitivities

3. **Outcome tracking**:
   - Goal progress
   - Achievement markers
   - User feedback on recommendations

---

## 5. IMPROVED CORRELATION ENGINE

### 5.1 Advanced Statistical Methods

#### **Multi-Level Correlation Analysis**
```
LEVEL 1: Direct Correlations
- Activity X → Mood change (same day)
- Sleep hours → Next-day clarity
- Stress level → Sleep quality

LEVEL 2: Lagged Correlations
- Activity X today → Mood tomorrow
- Sleep debt accumulation → Weekly mood trend
- Exercise frequency → Long-term energy levels

LEVEL 3: Multi-Factor Models
- (Sleep + Exercise + Social) → Mood prediction
- (Stress + Intimacy + Sleep) → Connection score
- (Activities + Habits + Experiments) → Overall wellbeing
```

#### **Statistical Rigor**
```typescript
interface CorrelationResult {
  coefficient: number;      // Pearson r
  pValue: number;           // Statistical significance
  confidenceInterval: [number, number]; // 95% CI
  sampleSize: number;
  strength: 'weak' | 'moderate' | 'strong';
  significance: 'none' | 'low' | 'significant' | 'highly-significant';
  direction: 'positive' | 'negative' | 'none';
}
```

#### **Minimum Data Requirements**
- Correlations: At least 10 data points
- Trends: At least 7 consecutive days
- Comparisons: At least 5 instances per group

### 5.2 Time-Series Analysis

#### **Trend Detection**
- Moving averages (7-day, 30-day)
- Trend lines (improving, stable, declining)
- Seasonal patterns (day of week, time of month)
- Change point detection (sudden improvements/declines)

#### **Forecasting**
- Simple extrapolation for short-term predictions
- Confidence intervals for forecasts
- "If you continue this pattern..." projections

---

## 6. UNIFIED SCORING SYSTEM

### 6.1 Normalized Wellness Score (NWS)

**Concept**: Convert all metrics to a common 0-100 scale for comparability

```typescript
interface WellnessScore {
  overall: number;          // 0-100 composite score
  components: {
    emotional: number;      // 0-100 (from mood)
    physical: number;       // 0-100 (from sleep, energy)
    mental: number;         // 0-100 (from clarity, productivity)
    social: number;         // 0-100 (from activities, connection)
  };
  trend: 'improving' | 'stable' | 'declining';
  percentile: number;       // Compared to user's history
}
```

#### **Normalization Formula**
```
NormalizedScore = ((RawScore - PersonalMin) / (PersonalMax - PersonalMin)) * 100

Where:
- PersonalMin = User's 10th percentile value
- PersonalMax = User's 90th percentile value
```

### 6.2 Personalized Thresholds

Instead of fixed thresholds (e.g., mood >= 4 is "good"), use personal baselines:

```typescript
interface PersonalBaseline {
  metric: string;
  percentiles: {
    p10: number;  // Bottom 10% (concerning)
    p25: number;  // Below average
    p50: number;  // Personal median
    p75: number;  // Above average
    p90: number;  // Top 10% (excellent)
  };
  lastUpdated: Date;
}
```

**Usage**:
- "Your mood today (4.2) is in your top 25% - that's great for you!"
- "Sleep quality (3) is below your usual average of 3.8"

---

## 7. MULTI-DIMENSIONAL IMPACT SCORING

### 7.1 Activity Impact Matrix

Instead of single impact scores, calculate multi-dimensional impacts:

```typescript
interface ActivityImpact {
  activityName: string;
  category: string;
  occurrences: number;
  
  impacts: {
    mood: {
      immediate: number;    // Same-day change
      nextDay: number;      // Next-day effect
      cumulative: number;   // Long-term pattern
      confidence: number;   // Statistical confidence
    };
    sleep: {
      quality: number;
      duration: number;
      confidence: number;
    };
    energy: {
      nextDay: number;
      sustained: number;
      confidence: number;
    };
    clarity: {
      immediate: number;
      sustained: number;
      confidence: number;
    };
  };
  
  overallBenefit: number;   // Weighted composite
  recommendationStrength: 'low' | 'medium' | 'high';
  personalizedInsight: string;
}
```

### 7.2 Combination Effects

Detect synergies between activities:
```typescript
interface ActivityCombination {
  activities: string[];
  frequency: number;
  combinedImpact: number;
  synergy: number;  // Positive if > sum of individual impacts
  insight: string;  // e.g., "Exercise + Social together boost mood 40% more"
}
```

---

## 8. AI-POWERED INSIGHTS FRAMEWORK

### 8.1 Insight Generation System

#### **Insight Categories**
1. **Discoveries**: "We noticed..." (new patterns)
2. **Confirmations**: "This continues to work well..." (reinforcing positives)
3. **Opportunities**: "You could try..." (actionable suggestions)
4. **Warnings**: "Watch out for..." (risk factors)
5. **Achievements**: "You've made progress..." (motivational)

#### **Insight Quality Criteria**
- **Specific**: Names actual activities/metrics
- **Actionable**: Clear next steps
- **Personalized**: Uses user's data
- **Evidence-based**: Cites correlation strength
- **Time-bound**: References recent period

#### **Example Evolution**

**Current (Generic)**:
> "Sleep affects mood. Try getting more sleep."

**Enhanced (Personalized & Actionable)**:
> "Over the past 2 weeks, you averaged a 4.3 mood on days with 7.5+ hours of sleep, compared to 3.1 with less. Tonight, aim for bed by 10:30pm to hit your optimal sleep window."

### 8.2 Recommendation Engine

#### **Tiered Recommendations**

**Tier 1: Proven for User** (High Confidence)
- Activities user has done with consistently positive outcomes
- "Do more of what works"

**Tier 2: Highly Likely** (Medium-High Confidence)
- Similar users' successes
- General research-backed practices

**Tier 3: Worth Trying** (Low-Medium Confidence)
- Exploratory suggestions
- Addressing gaps in routine

#### **Daily Recommendation Format**
```typescript
interface DailyRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  action: string;
  why: string;              // Personalized reasoning
  expectedBenefit: string;  // What user can expect
  timeCommitment: string;   // How long it takes
  difficulty: 'easy' | 'moderate' | 'challenging';
  alternativesOffered: string[];
}
```

**Example**:
```json
{
  "priority": "high",
  "category": "Movement",
  "action": "Take a 20-minute walk outside",
  "why": "You've walked 4 times in the past 2 weeks, and your mood averaged 4.5 on those days vs 3.2 on other days (+41% boost).",
  "expectedBenefit": "Likely mood boost and better sleep tonight based on your pattern.",
  "timeCommitment": "20 minutes",
  "difficulty": "easy",
  "alternativesOffered": ["15-minute yoga", "Dance to 3 songs"]
}
```

---

## 9. ADVANCED ANALYTICS FEATURES

### 9.1 Pattern Recognition

#### **Routine Patterns**
- Identify successful routines (e.g., "Exercise → Shower → Meditation" sequence)
- Detect disruptive patterns
- Morning vs evening activity impacts

#### **Cyclical Patterns**
- Day of week effects (Monday blues, Friday energy)
- Time of month patterns (hormonal influences)
- Seasonal variations

#### **Risk Patterns**
- Early warning signs of decline
- Burnout indicators
- Stress accumulation

### 9.2 Comparative Analytics

#### **Personal Comparisons**
- This week vs last week
- This month vs last month
- This month vs same month last year
- Current streak vs best streak

#### **Contextual Comparisons** (Anonymous/Aggregated)
- "Users with similar sleep patterns..."
- "Others who also practice meditation..."
- Percentile rankings

### 9.3 Goal-Oriented Analytics

#### **Goal Setting Integration**
```typescript
interface WellnessGoal {
  id: string;
  type: 'mood' | 'sleep' | 'habit' | 'activity' | 'custom';
  target: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  currentProgress: number;
  onTrack: boolean;
  recommendations: string[];
  blockers: string[];      // What's preventing goal achievement
  enablers: string[];      // What's helping
}
```

#### **Predictive Goal Tracking**
- "At current pace, you'll reach your goal in X days"
- "To reach your goal, increase Y activity by Z%"

---

## 10. TECHNICAL IMPLEMENTATION PLAN

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Improve existing correlations and scoring

1. **Enhance Correlation Calculator**
   - Add minimum sample size validation
   - Implement confidence intervals
   - Add statistical significance testing
   - Create lagged correlation analysis

2. **Build Normalization System**
   - Calculate personal baselines (percentiles)
   - Normalize all scores to 0-100 scale
   - Store baselines in user preferences

3. **Improve Insight Templates**
   - Create 50+ specific insight templates
   - Add confidence levels to insights
   - Implement insight ranking algorithm

### Phase 2: Advanced Analytics (Weeks 3-4)
**Goal**: Add multi-factor analysis and predictions

1. **Multi-Factor Models**
   - Implement regression analysis for mood prediction
   - Build activity combination detector
   - Create synergy calculator

2. **Time-Series Analysis**
   - Add moving average calculations
   - Implement trend detection
   - Build forecast models

3. **Pattern Recognition**
   - Day of week analysis
   - Routine identification
   - Warning signal detection

### Phase 3: AI Integration (Weeks 5-6)
**Goal**: Leverage AI for personalized insights

1. **AI Insight Generation**
   - Integrate OpenAI API (or similar)
   - Create prompt engineering templates
   - Build insight caching system

2. **Recommendation Engine**
   - Implement tiered recommendation system
   - Add alternative suggestions
   - Create daily recommendation generator

3. **Natural Language Explanations**
   - Convert statistics to plain English
   - Generate personalized narratives
   - Add contextual help text

### Phase 4: User Experience (Weeks 7-8)
**Goal**: Present insights beautifully

1. **Insight Cards**
   - Redesign insight presentation
   - Add visual indicators (confidence, impact)
   - Implement expand/collapse for details

2. **Interactive Charts**
   - Add correlation visualizations
   - Create before/after comparisons
   - Build trend line charts

3. **Action Buttons**
   - "Start habit from insight" button
   - "Create experiment" from recommendation
   - "Set reminder" for suggestions

---

## 11. AI PROMPTING STRATEGY

### 11.1 Prompt Structure for Insights

```typescript
const generateInsightPrompt = (userData: UserDataSummary) => `
You are a wellness coach analyzing user data. Generate 3-5 personalized insights.

USER PROFILE:
- Tracking for: ${userData.daysSinceStart} days
- Primary goals: ${userData.goals.join(', ')}
- Concerns: ${userData.concerns.join(', ')}

DATA SUMMARY (Last 14 days):
- Avg Mood: ${userData.avgMood}/5 (baseline: ${userData.baselineMood})
- Avg Sleep: ${userData.avgSleep}h (baseline: ${userData.baselineSleep}h)
- Top Activities: ${userData.topActivities.join(', ')}
- Habits Completed: ${userData.habitCompletionRate}%

CORRELATIONS FOUND:
${userData.correlations.map(c => 
  `- ${c.factor} → ${c.outcome}: ${c.coefficient} (${c.significance})`
).join('\n')}

NOTABLE PATTERNS:
${userData.patterns.join('\n')}

Generate insights that are:
1. Specific to this user's data
2. Actionable with clear next steps
3. Encouraging and non-judgmental
4. Evidence-based (reference the correlations)
5. Varied in type (discoveries, confirmations, opportunities)

Format each insight as:
{
  "type": "discovery" | "confirmation" | "opportunity" | "warning" | "achievement",
  "title": "Short headline",
  "message": "2-3 sentences explanation",
  "action": "One specific thing to do",
  "confidence": "high" | "medium" | "low"
}
`;
```

### 11.2 Personalization Variables

```typescript
interface UserContext {
  demographics: {
    trackingDuration: number;  // Days
    dataCompleteness: number;  // 0-100%
    engagementLevel: 'low' | 'medium' | 'high';
  };
  
  goals: {
    primary: string[];
    secondary: string[];
    achieved: string[];
  };
  
  preferences: {
    toneStyle: 'casual' | 'professional' | 'friendly';
    insightDepth: 'brief' | 'detailed';
    motivationStyle: 'encouraging' | 'challenging' | 'neutral';
  };
  
  baselines: {
    mood: number;
    sleep: number;
    energy: number;
    stress: number;
  };
  
  successFactors: string[];    // What works for this user
  challenges: string[];          // What they struggle with
}
```

---

## 12. DATA QUALITY & VALIDATION

### 12.1 Data Validation Rules

```typescript
interface ValidationRule {
  field: string;
  checks: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
  errorMessage: string;
}

const dataValidationRules: ValidationRule[] = [
  {
    field: 'mood_score',
    checks: { required: true, min: 1, max: 5 },
    errorMessage: 'Mood score must be between 1 and 5'
  },
  {
    field: 'sleep_hours',
    checks: { min: 0, max: 24 },
    errorMessage: 'Sleep hours must be between 0 and 24'
  },
  {
    field: 'date',
    checks: {
      custom: (date) => {
        const d = new Date(date);
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return d >= threeMonthsAgo && d <= now;
      }
    },
    errorMessage: 'Date must be within the last 3 months'
  }
];
```

### 12.2 Data Completeness Scoring

```typescript
interface DataCompleteness {
  overall: number;  // 0-100%
  byMetric: {
    mood: number;
    sleep: number;
    activities: number;
    habits: number;
    productivity: number;
    mentalClarity: number;
  };
  daysLogged: number;
  daysInPeriod: number;
  missingDays: string[];  // Dates
}
```

---

## 13. SUCCESS METRICS

### 13.1 Technical Metrics
- **Correlation Accuracy**: % of correlations that remain significant over time
- **Prediction Accuracy**: How well forecasts match actual outcomes
- **Data Coverage**: % of days with complete data
- **Computation Performance**: Time to generate insights < 2 seconds

### 13.2 User Metrics
- **Insight Helpfulness Rating**: User feedback on insights (1-5 stars)
- **Action Rate**: % of recommendations acted upon
- **Goal Achievement**: % of users reaching their goals
- **Engagement**: Daily active usage, data logging consistency

### 13.3 KPIs
- **Insight Quality Score**: Composite of specificity, actionability, personalization
- **Recommendation Success Rate**: % of recommendations that lead to improved outcomes
- **User Satisfaction**: NPS score for analytics features

---

## 14. PRIVACY & ETHICS

### 14.1 Data Privacy
- All user data remains on-device or in user's personal database
- AI prompts anonymize data (no PII sent to external APIs)
- Option to opt-out of AI-powered insights
- Data export and deletion capabilities

### 14.2 Ethical Considerations
- **Non-judgmental Language**: Insights should never shame or blame
- **Realistic Expectations**: Acknowledge limitations of correlations
- **Mental Health Disclaimers**: Clear that app is not medical advice
- **Diverse Perspectives**: Avoid assumptions about "normal" or "healthy"

---

## 15. NEXT STEPS

### Immediate Actions
1. ✅ **Audit Complete**: Document created
2. 🔄 **Team Review**: Discuss priorities and timeline
3. 📝 **Technical Specs**: Detail Phase 1 implementation
4. 🧪 **Prototype**: Build correlation engine v2.0
5. 👥 **User Testing**: Validate insight quality with beta users

### Long-term Vision
- **Predictive Wellness**: "Your patterns suggest you'll have a great day tomorrow"
- **Proactive Interventions**: "Based on your stress levels, consider a break today"
- **Community Insights**: "People like you found success with..."
- **Integration**: Wearables, calendar, weather APIs
- **Export to Healthcare**: Shareable reports for doctors/therapists

---

## APPENDIX: CODE STRUCTURE RECOMMENDATIONS

### A. Services Layer
```
services/
  ├── analytics/
  │   ├── correlation.service.ts      # Enhanced correlation engine
  │   ├── scoring.service.ts          # Unified scoring system
  │   ├── patterns.service.ts         # Pattern recognition
  │   ├── predictions.service.ts      # Forecasting
  │   └── insights.service.ts         # Insight generation
  ├── ai/
  │   ├── prompt-builder.service.ts   # AI prompt generation
  │   ├── openai.service.ts           # AI API integration
  │   └── insight-cache.service.ts    # Cache AI responses
  └── recommendations/
      ├── recommendation-engine.ts    # Tiered recommendations
      └── alternative-suggester.ts    # Alternative actions
```

### B. Data Models
```
models/
  ├── wellness-score.model.ts
  ├── correlation-result.model.ts
  ├── insight.model.ts
  ├── recommendation.model.ts
  ├── personal-baseline.model.ts
  └── activity-impact.model.ts
```

### C. Utilities
```
utils/
  ├── statistics.ts       # Statistical functions (correlation, regression)
  ├── normalization.ts    # Score normalization
  ├── validation.ts       # Data validation
  └── date-utils.ts       # Date range, lag calculations
```

---

**End of Approach Document**

*This document will be updated as implementation progresses and new insights are discovered.*
