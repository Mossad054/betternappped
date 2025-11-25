# Activity Impact Analysis - Critical Improvements

## Executive Summary

**Problem Identified**: Our current Activity Impact Analysis has fundamental flaws in how it calculates correlations and impact scores. The attached document (`AI_RECOMMENDATIONS_IMPLEMENTATION.md`) provides a superior approach we need to adopt.

**Status**: 🔴 CRITICAL - Current implementation provides misleading insights

---

## Current Implementation Gaps

### 1. **Baseline Calculation is Wrong**
**Current Approach**:
- Uses average of "non-activity days" as baseline
- Assumes all non-activity days have same baseline
- Ignores time-of-day variations

**Problem**:
- User's mood naturally varies daily (sleep quality, stress, etc.)
- Comparing activity day to random non-activity day average is meaningless
- Example: If user does "Exercise" on good mood days and skips on bad days, we'll incorrectly conclude exercise boosts mood

**Correct Approach** (from attached doc):
```typescript
// Get baseline BEFORE activity (morning measurement or previous day)
const baseline = await getBaseline(userId, activityDate);
// - Morning mood (before activity can take effect)
// - OR previous day's average
// - OR user's personal percentile baseline
```

### 2. **Correlation Algorithm is Flawed**
**Current Approach**:
```typescript
// Binary correlation: activity presence (1/0) vs outcome value
presence = [1, 0, 1, 0, ...] // Did activity: yes/no
outcomes = [7, 5, 8, 6, ...] // Mood scores
correlation = pearson(presence, outcomes)
```

**Problem**:
- Doesn't account for baseline variations
- Confuses causation with pre-existing conditions
- Example: User exercises when already feeling good → positive correlation, but exercise didn't CAUSE the good mood

**Correct Approach** (from attached doc):
```typescript
// Use DELTAS (change from baseline) for each activity occurrence
deltas = [
  {activityDate: '2024-01-01', moodDelta: +1.5}, // Mood improved 1.5 points from morning baseline
  {activityDate: '2024-01-05', moodDelta: +0.8}, // Mood improved 0.8 points
  {activityDate: '2024-01-10', moodDelta: -0.3}  // Mood decreased 0.3 points
]
// Now calculate: did mood CHANGE more on activity days vs non-activity days?
```

### 3. **Missing Temporal Dimensions**
**Current Approach**:
- immediate = same day average
- nextDay = next day average  
- cumulative = 7-day average

**Problem**:
- Doesn't track CHANGE from baseline
- Ignores when during the day activity happened
- Can't distinguish immediate vs delayed effects

**Correct Approach** (from attached doc):
```typescript
interface ImpactRecord {
  baseline: { mood: 6.5, anxiety: 4.2 },        // Before activity
  sameDay: { mood: 7.8, anxiety: 3.1 },         // After activity (same day)
  nextDay: { mood: 7.2, sleepQuality: 8.5 },    // Next day effects
  deltas: {
    moodSameDay: +1.3,      // 7.8 - 6.5
    anxietySameDay: -1.1,   // 4.2 - 3.1 (reduction is positive!)
    moodNextDay: +0.7,      // 7.2 - 6.5
    sleepQuality: 8.5       // Next night's sleep
  }
}
```

### 4. **No Statistical Interpretation**
**Current Approach**:
- Returns raw correlation coefficient
- No p-value, no confidence interval
- No strength categorization

**Problem**:
- Can't tell if correlation is statistically significant or just random noise
- Example: r=0.3 with N=5 is meaningless, but r=0.3 with N=50 is significant

**Correct Approach** (from attached doc):
```typescript
interface OutcomeImpact {
  sameDayChange: number,           // Average delta
  correlationCoefficient: number,  // Pearson r
  pValue: number,                  // Statistical significance
  confidenceInterval: [number, number], // 95% CI
  interpretation: {
    strength: 'weak' | 'moderate' | 'strong',
    direction: 'improves' | 'worsens' | 'no-effect',
    confidence: 'low' | 'medium' | 'high',
    description: "Exercise moderately improves your mood primarily on the same day (confident)"
  }
}
```

### 5. **Benefit Score is Arbitrary**
**Current Approach**:
```typescript
// Weights look random, no justification
score += impact.immediate * 0.3 * 100
score += impact.nextDay * 0.15 * 100
```

**Problem**:
- Why 0.3 for immediate? Why 0.15 for next day?
- Doesn't account for confidence level
- Low confidence activities get same weight as high confidence

**Correct Approach** (from attached doc):
```typescript
// Weighted by outcome importance AND confidence
const weights = { mood: 0.35, sleep: 0.25, clarity: 0.20, anxiety: 0.20 }
score = Σ(normalizedImpact[outcome] * weight[outcome])
score *= confidenceMultiplier // Reduce score if low confidence
// Result: Activities with weak evidence get lower benefit scores
```

---

## Implementation Plan

### Phase 1: Core Algorithm Fixes (THIS SPRINT)

#### Task 1: Impact Record Tracking System
```typescript
interface ImpactRecord {
  activityId: string;
  activityName: string;
  activityDate: Date;
  
  baseline: {
    mood: number;
    anxiety: number;
    clarity: number;
  };
  
  sameDay: {
    mood: number | null;
    anxiety: number | null;
    clarity: number | null;
  };
  
  nextDay: {
    mood: number | null;
    sleepQuality: number | null;
    sleepHours: number | null;
    clarity: number | null;
  };
  
  deltas: {
    moodSameDay: number | null;
    moodNextDay: number | null;
    claritySameDay: number | null;
    anxietySameDay: number | null;
    sleepQuality: number | null;
  };
}
```

**Method**: `buildImpactRecords(userId, activities)`
- For each activity occurrence, fetch:
  - Baseline (morning mood OR previous day average)
  - Same-day outcomes (afternoon/evening measurements)
  - Next-day outcomes (all measurements next day)
- Calculate deltas: `delta = outcome - baseline`

#### Task 2: Proper Baseline Calculation
```typescript
async getBaseline(userId: string, activityDate: Date): Promise<BaselineMeasures> {
  // 1. Try morning measurement (before activity effect)
  const morningMood = await db.query(`
    SELECT mood_score FROM mood_logs
    WHERE user_id = $1 AND date = $2 AND EXTRACT(HOUR FROM created_at) < 12
    ORDER BY created_at ASC LIMIT 1
  `, [userId, activityDate]);
  
  // 2. Fallback to previous day average
  if (!morningMood) {
    const previousDay = new Date(activityDate);
    previousDay.setDate(previousDay.getDate() - 1);
    return getPreviousDayAverage(userId, previousDay);
  }
  
  // 3. Fallback to user's percentile baseline
  if (!morningMood && !previousDay) {
    return BaselineService.getBaseline(userId, 'mood').p50;
  }
}
```

#### Task 3: Delta-Based Correlation
```typescript
private static calculateOutcomeImpact(
  records: ImpactRecord[],
  outcomeType: 'mood' | 'sleep' | 'clarity' | 'anxiety'
): OutcomeImpact {
  
  // Extract deltas (changes from baseline)
  const sameDayDeltas = records
    .map(r => r.deltas[`${outcomeType}SameDay`])
    .filter(d => d !== null);
  
  const nextDayDeltas = records
    .map(r => r.deltas[`${outcomeType}NextDay`])
    .filter(d => d !== null);
  
  // Calculate average changes
  const sameDayChange = average(sameDayDeltas);
  const nextDayChange = average(nextDayDeltas);
  
  // Calculate statistical significance
  const correlation = calculateDeltaCorrelation(records, outcomeType);
  const pValue = calculatePValue(correlation, records.length);
  const confidenceInterval = calculateConfidenceInterval(correlation, records.length);
  
  // Interpret
  const interpretation = interpretImpact(
    sameDayChange,
    nextDayChange,
    correlation,
    pValue,
    outcomeType
  );
  
  return {
    sameDayChange,
    nextDayChange,
    sustainedChange: nextDayChange, // Simplified for now
    correlationCoefficient: correlation,
    pValue,
    confidenceInterval,
    interpretation,
    sampleSize: records.length,
    sufficientData: records.length >= MIN_OCCURRENCES
  };
}
```

#### Task 4: Statistical Interpretation
```typescript
private static interpretImpact(
  sameDayChange: number,
  nextDayChange: number,
  correlation: number,
  pValue: number,
  outcomeType: string
) {
  // Strength based on correlation magnitude
  const absCorr = Math.abs(correlation);
  const strength = 
    absCorr < 0.1 ? 'none' :
    absCorr < 0.3 ? 'weak' :
    absCorr < 0.5 ? 'moderate' :
    absCorr < 0.7 ? 'strong' : 'very-strong';
  
  // Direction based on average delta
  const avgChange = (sameDayChange + nextDayChange) / 2;
  const direction = 
    Math.abs(avgChange) < 0.1 ? 'no-effect' :
    avgChange > 0 ? 'improves' : 'worsens';
  
  // Confidence based on p-value
  const confidence =
    pValue > 0.05 ? 'low' :
    pValue > 0.01 ? 'medium' :
    pValue > 0.001 ? 'high' : 'very-high';
  
  // Generate description
  const description = `${outcomeType} ${direction} by ${Math.abs(avgChange).toFixed(1)} points (${strength} effect, ${confidence} confidence)`;
  
  return { strength, direction, confidence, description };
}
```

### Phase 2: Database Schema (NEXT SPRINT)

```sql
-- Store correlation results for fast lookup
CREATE TABLE activity_outcome_correlations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_name VARCHAR(100),
  outcome_type VARCHAR(50),
  
  same_day_impact DECIMAL(5,3),
  next_day_impact DECIMAL(5,3),
  sustained_impact DECIMAL(5,3),
  
  correlation_coefficient DECIMAL(5,3),
  p_value DECIMAL(10,8),
  confidence_interval_low DECIMAL(5,3),
  confidence_interval_high DECIMAL(5,3),
  
  total_occurrences INT,
  impact_strength VARCHAR(20),
  impact_direction VARCHAR(20),
  statistical_significance VARCHAR(30),
  
  last_updated TIMESTAMP,
  is_valid BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, activity_name, outcome_type)
);

-- Store detailed impact records for reanalysis
CREATE TABLE activity_impact_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_name VARCHAR(100),
  activity_date DATE,
  
  baseline_mood DECIMAL(3,2),
  baseline_anxiety DECIMAL(3,2),
  baseline_clarity DECIMAL(3,2),
  
  same_day_mood DECIMAL(3,2),
  same_day_anxiety DECIMAL(3,2),
  same_day_clarity DECIMAL(3,2),
  
  next_day_mood DECIMAL(3,2),
  next_day_sleep_quality DECIMAL(3,2),
  next_day_clarity DECIMAL(3,2),
  
  mood_delta_same_day DECIMAL(4,2),
  mood_delta_next_day DECIMAL(4,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 3: Real-Time Feedback (FUTURE)

```typescript
class RealTimeImpactTrackerService {
  async onActivityLogged(
    userId: string,
    activityName: string,
    activityDate: Date
  ): Promise<InstantFeedback> {
    
    // Check existing correlations
    const correlations = await getStoredCorrelations(userId, activityName);
    
    if (!correlations || correlations.length === 0) {
      return {
        message: `We'll start tracking how ${activityName} affects you!`,
        predictions: null
      };
    }
    
    // Generate predictions based on historical data
    return {
      message: `Based on your history, ${activityName} typically boosts your mood by 1.2 points and improves next-day sleep quality.`,
      predictions: {
        mood: { expectedChange: +1.2, confidence: 'high' },
        sleep: { expectedChange: +0.8, confidence: 'medium' }
      }
    };
  }
}
```

---

## Key Differences Summary

| Aspect | ❌ Current (Wrong) | ✅ Correct (From Doc) |
|--------|-------------------|----------------------|
| **Baseline** | Average of non-activity days | Morning measurement OR previous day |
| **Correlation** | Binary presence vs outcome | Delta from baseline |
| **Impact** | Raw averages | Change from baseline (deltas) |
| **Statistics** | None (just raw r) | p-value, CI, strength, significance |
| **Benefit Score** | Arbitrary weights | Weighted by importance + confidence |
| **Interpretation** | None | Strength, direction, confidence levels |
| **Persistence** | None | Store correlations in database |
| **Real-time** | None | Instant feedback on activity logging |

---

## Testing Strategy

### Test Case 1: Baseline Tracking
```typescript
// Scenario: User exercises at 10am, logs mood at 2pm
const activity = { name: 'Exercise', date: '2024-01-15', time: '10:00' };
const morningMood = 6.5; // 8am mood
const afternoonMood = 7.8; // 2pm mood

// Expected: Delta = 7.8 - 6.5 = +1.3
// Current (wrong): Compares 7.8 to average of non-exercise days (maybe 6.8) = +1.0
```

### Test Case 2: Statistical Significance
```typescript
// Scenario: Activity done 5 times vs 50 times
const activityA = { name: 'Meditation', occurrences: 5, avgDelta: +0.8, r: 0.4 };
const activityB = { name: 'Exercise', occurrences: 50, avgDelta: +0.8, r: 0.4 };

// Expected:
// activityA: p-value = 0.12 (not significant), confidence = 'low'
// activityB: p-value = 0.002 (highly significant), confidence = 'high'

// Current (wrong): Both get same benefit score
```

### Test Case 3: Timing Effects
```typescript
// Scenario: Evening exercise affects next-day sleep
const activity = { name: 'Exercise', time: '8pm', date: '2024-01-15' };
const nextDaySleep = { quality: 6.5, baseline: 7.8 }; // Sleep got WORSE

// Expected: 
// nextDayImpact = -1.3 (worsened sleep)
// recommendation = "Do this activity earlier in the day"

// Current (wrong): Might show positive if user had good sleep other days
```

---

## Migration Path

1. **Immediate** (Today):
   - Update `calculateMultiDimensionalImpact()` to use proper baselines
   - Fix correlation to use deltas instead of binary presence

2. **This Week**:
   - Add `buildImpactRecords()` method
   - Implement `getBaseline()` with morning/previous day fallback
   - Add `calculateDeltas()` helper
   - Update `calculateOverallBenefit()` with confidence multiplier

3. **Next Week**:
   - Add statistical interpretation layer
   - Generate human-readable descriptions
   - Add p-values and confidence intervals

4. **Future Sprint**:
   - Database schema for persisting correlations
   - Batch correlation calculator for all activities
   - Real-time feedback system

---

## Success Metrics

- ✅ Baseline uses time-appropriate measurements (morning OR previous day)
- ✅ Correlations calculated on deltas, not raw presence
- ✅ p-values < 0.05 for "significant" impacts
- ✅ Confidence intervals included in all correlation results
- ✅ Benefit scores include confidence multiplier
- ✅ Human-readable interpretations generated for all impacts
- ✅ Test cases pass with statistically valid results

---

## References

- **Source Document**: `AI_RECOMMENDATIONS_IMPLEMENTATION.md`
- **Key Sections**: 
  - "Core Algorithm: Activity-Outcome Impact Calculator"
  - "buildImpactRecords() method"
  - "calculateOutcomeImpact() with deltas"
  - "interpretImpact() with statistical rigor"
- **Related Services**: 
  - `services/analytics/activityImpact.service.ts`
  - `services/analytics/correlation.service.ts`
  - `services/analytics/baseline.service.ts`
