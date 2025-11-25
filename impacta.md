# Activity Impact Analysis - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Rating System](#rating-system)
3. [Correlation Algorithms](#correlation-algorithms)
4. [Ranking Algorithm](#ranking-algorithm)
5. [Database Schema](#database-schema)
6. [Implementation Details](#implementation-details)
7. [Mathematical Foundations](#mathematical-foundations)
8. [Usage Examples](#usage-examples)

---

## Overview

The Activity Impact Analysis system uses a **multi-layered approach** to understand which activities benefit users most. It combines:

1. **Immediate Feedback** - Post-activity ratings (1-5 scale)
2. **Outcome Correlation** - Correlation with daily mood, sleep, clarity
3. **Temporal Analysis** - Same-day, next-day, and cumulative effects
4. **Statistical Rigor** - Confidence intervals, p-values, sample size weighting
5. **Trend Detection** - Improvement/decline patterns over time

### Why This Approach?

**Problem with traditional mood tracking:**
- Users log daily mood (1-10)
- Activities are tracked separately
- Hard to connect specific activities to mood changes
- Multiple activities per day create attribution issues
- Relies on correlation which is weak signal

**Our Enhanced Solution:**
- Users rate activities **immediately** after completing them (1-5 scale)
- Rate multiple dimensions: mood, sleep expectation, clarity, energy
- More granular data (activity-specific, not just daily aggregate)
- Better causal inference (immediate feedback vs delayed correlation)
- Multi-dimensional analysis reveals nuanced benefits

---

## Rating System

### Post-Activity Ratings Modal

When a user completes an activity, they're prompted with a beautiful modal to rate 4 dimensions:

#### 1. Mood Rating (1-5) 😊
**Question:** "How did you feel during or right after this activity?"

| Rating | Emoji | Label | Meaning |
|--------|-------|-------|---------|
| 1 | 😞 | Terrible | Activity made me feel worse |
| 2 | 😕 | Bad | Not enjoyable |
| 3 | 😐 | Okay | Neutral experience |
| 4 | 😊 | Good | Enjoyable, positive |
| 5 | 😄 | Excellent | Amazing, euphoric |

**Use Case:** Immediate emotional response to the activity

---

#### 2. Sleep Rating (1-5) 😴
**Question:** "How will this activity affect your sleep tonight?"

| Rating | Emoji | Label | Meaning |
|--------|-------|-------|---------|
| 1 | 😰 | Terrible | Will severely disrupt sleep |
| 2 | 😓 | Poor | Will hurt sleep quality |
| 3 | 😴 | Fair | Neutral effect on sleep |
| 4 | 😌 | Good | Should help sleep |
| 5 | 😇 | Perfect | Will definitely improve sleep |

**Use Case:** Predictive rating for sleep impact. Validated against actual sleep quality logs.

**Example Insights:**
- Exercise in the evening: User rates sleep=2, actual sleep quality confirms (poor)
- Meditation before bed: User rates sleep=5, sleep logs show improvement

---

#### 3. Clarity Rating (1-5) 🧠
**Question:** "How clear and focused is your mind right now?"

| Rating | Emoji | Label | Meaning |
|--------|-------|-------|---------|
| 1 | 😵 | Foggy | Brain fog, can't think clearly |
| 2 | 😕 | Unclear | Struggling to focus |
| 3 | 🙂 | Moderate | Normal clarity |
| 4 | 😊 | Clear | Sharp, focused |
| 5 | 🤩 | Sharp | Peak mental performance |

**Use Case:** Immediate cognitive impact measurement. Correlated with mental clarity test scores.

---

#### 4. Energy Rating (1-5) ⚡
**Question:** "How energized do you feel after this activity?"

| Rating | Emoji | Label | Meaning |
|--------|-------|-------|---------|
| 1 | 🪫 | Drained | Completely exhausted |
| 2 | 😮‍💨 | Low | Tired, low energy |
| 3 | 😐 | Moderate | Normal energy level |
| 4 | ⚡ | Energized | Feeling energetic |
| 5 | 🔋 | Full | Peak energy, ready to go |

**Use Case:** Physical and mental energy assessment

---

### Data Collection

**When ratings are collected:**
1. User logs an activity in their journal
2. Modal appears asking for ratings
3. User can rate all 4 dimensions or skip
4. At least 1 rating required for submission
5. Ratings stored in `activities` table alongside the activity

**Data storage:**
```sql
activities (
  id,
  user_id,
  date,
  name,
  category,
  emoji,
  mood_rating INTEGER (1-5),
  sleep_rating INTEGER (1-5),
  clarity_rating INTEGER (1-5),
  energy_rating INTEGER (1-5),
  created_at
)
```

---

## Correlation Algorithms

### Algorithm 1: Rating-Based Correlation

**Purpose:** Analyze activity impact using post-activity ratings

**Input:**
- Activity logs with ratings
- Daily mood logs (optional, for validation)
- Daily sleep logs (optional, for validation)
- Daily clarity tests (optional, for validation)

**Output:**
- Average ratings per dimension
- Consistency scores
- Correlation with daily logs (validation)
- Overall impact score (0-100)
- Confidence level

**Mathematical Process:**

#### Step 1: Calculate Average Ratings

For activity A with n occurrences:

```
avg_mood = (Σ mood_ratings) / n
avg_sleep = (Σ sleep_ratings) / n
avg_clarity = (Σ clarity_ratings) / n
avg_energy = (Σ energy_ratings) / n
```

#### Step 2: Calculate Consistency

Consistency measures how reliable the ratings are (low variance = high consistency).

```
μ = mean rating
σ = standard deviation

Coefficient of Variation (CV) = σ / μ

Consistency Score = max(0, 1 - CV)
```

**Interpretation:**
- Consistency = 1.0 → Perfect consistency (all ratings identical)
- Consistency = 0.7 → Good consistency
- Consistency < 0.4 → High variability (unreliable)

**Example:**
```
Exercise activity:
mood_ratings = [4, 5, 4, 5, 4]
μ = 4.4
σ = 0.49
CV = 0.49/4.4 = 0.11
Consistency = 1 - 0.11 = 0.89  (Very consistent!)
```

#### Step 3: Validate Against Daily Logs

**Mood Validation:**

For each activity occurrence:
1. Get the activity's mood_rating (1-5 scale)
2. Get the daily mood log for that date (1-10 scale)
3. Normalize both to 0-1 scale
4. Calculate Pearson correlation

```
normalized_rating = (rating - 1) / 4     // 1-5 → 0-1
normalized_log = (mood - 1) / 9          // 1-10 → 0-1

r = Pearson_Correlation(normalized_ratings, normalized_logs)
```

**Sleep Validation:**

For each activity:
1. Get activity's sleep_rating (predicted impact)
2. Get **next day's** actual sleep quality
3. Calculate correlation

```
r = Pearson_Correlation(sleep_ratings, next_day_sleep_quality)
```

**High correlation (r > 0.6)** = User's predictions are accurate!

**Example:**
```
User does evening caffeine:
- Rates sleep_impact = 1 (terrible)
- Next day sleep quality = 2 (poor)
- Correlation = 0.85 (user is self-aware!)
```

#### Step 4: Calculate Impact Score

Weighted composite score (0-100):

```javascript
weights = {
  mood: 0.35,     // Mood is most important
  sleep: 0.30,    // Sleep quality crucial
  clarity: 0.20,  // Mental clarity matters
  energy: 0.15    // Energy rounds it out
}

// Normalize each rating to 0-100
mood_score = ((avg_mood - 1) / 4) × 100
sleep_score = ((avg_sleep - 1) / 4) × 100
clarity_score = ((avg_clarity - 1) / 4) × 100
energy_score = ((avg_energy - 1) / 4) × 100

// Apply weights
base_score = (
  mood_score × 0.35 +
  sleep_score × 0.30 +
  clarity_score × 0.20 +
  energy_score × 0.15
)

// Apply consistency bonus (0-10 points)
consistency_bonus = avg_consistency × 10

// Apply confidence multiplier based on sample size
confidence_mult = min(1, sample_size / 10)

impact_score = (base_score + consistency_bonus) × confidence_mult
```

**Example Calculation:**

```
Activity: Morning Run
Ratings:
- mood: 4.5/5 (avg)
- sleep: 4.2/5 (avg)
- clarity: 4.0/5 (avg)
- energy: 4.8/5 (avg)
Consistency: 0.85
Sample size: 12

Normalized scores:
- mood_score = (4.5-1)/4 × 100 = 87.5
- sleep_score = (4.2-1)/4 × 100 = 80.0
- clarity_score = (4.0-1)/4 × 100 = 75.0
- energy_score = (4.8-1)/4 × 100 = 95.0

Weighted:
base_score = 87.5×0.35 + 80×0.30 + 75×0.20 + 95×0.15
           = 30.625 + 24 + 15 + 14.25
           = 83.875

Consistency bonus:
bonus = 0.85 × 10 = 8.5

Confidence:
mult = min(1, 12/10) = 1.0

Final impact score:
= (83.875 + 8.5) × 1.0
= 92.375
≈ 92/100

✅ Excellent activity!
```

#### Step 5: Determine Primary Benefit

```javascript
ratings = {
  mood: 4.5,
  sleep: 4.2,
  clarity: 4.0,
  energy: 4.8
}

// Filter non-zero, sort by value
sorted = [energy(4.8), mood(4.5), sleep(4.2), clarity(4.0)]

// If top 2 are close (within 0.3), it's "mixed"
if (sorted[0] - sorted[1] < 0.3) {
  return "mixed"
}

// Otherwise, return top dimension
return sorted[0].name  // "energy"
```

---

### Algorithm 2: Outcome-Based Correlation

**Purpose:** Analyze activity impact through correlation with daily outcomes

**Input:**
- Activity occurrences (dates)
- Daily mood logs
- Daily sleep logs
- Daily clarity scores
- Daily productivity ratings

**Process:**

#### Build Impact Records

For each activity occurrence, create an impact record:

```javascript
{
  activityDate: "2024-01-15",

  baseline: {
    mood: 6,          // Previous day's mood
    clarity: 7,       // Previous day's clarity
    productivity: 5   // Previous day's productivity
  },

  sameDay: {
    mood: 8,          // Same day mood (after activity)
    clarity: 8,
    productivity: 7
  },

  nextDay: {
    mood: 7,
    sleepQuality: 4,
    sleepHours: 8.5,
    clarity: 8,
    productivity: 6
  },

  deltas: {
    moodSameDay: +2,      // 8 - 6
    moodNextDay: +1,      // 7 - 6
    claritySameDay: +1,   // 8 - 7
    clarityNextDay: +1,
    productivitySameDay: +2,
    sleepQuality: 4       // (no baseline for sleep)
  }
}
```

#### Calculate Delta Correlations

Using deltas provides more accurate causal inference:

```javascript
// Collect all same-day mood deltas
sameDayMoodDeltas = [+2, +1, +3, +2, +1]  // 5 occurrences

// Average change
avgSameDayChange = mean(sameDayMoodDeltas) = +1.8

// Consistency (using std dev)
σ = stdDev(sameDayMoodDeltas) = 0.75
consistency = abs(mean) / (σ + 0.1)  // High mean, low σ = consistent effect
```

#### Statistical Significance

Calculate p-value using t-distribution:

```
t = r × sqrt((n-2) / (1-r²))

where:
  r = correlation coefficient
  n = sample size

p-value thresholds:
  p < 0.05: Statistically significant
  p < 0.01: Highly significant
  p < 0.001: Very highly significant
```

---

## Ranking Algorithm

### Dynamic Activity Ranking

**Purpose:** Create a personalized, time-period-specific ranking of activities

**Components:**

#### 1. Rating Score (Weight: 35%)

Based on post-activity ratings (immediate feedback)

```
rating_score = impact_score  // From RatingCorrelation algorithm
```

**Why 35% weight?**
- Immediate feedback is most reliable
- User's subjective experience is paramount
- Captures nuances that daily logs miss

---

#### 2. Correlation Score (Weight: 30%)

Based on correlation with daily outcomes

```
correlation_score = overall_benefit  // From ActivityImpact algorithm
```

**Why 30% weight?**
- Objective measurement validation
- Catches long-term effects
- Balance between immediate and delayed benefits

---

#### 3. Frequency Score (Weight: 15%)

Optimal frequency varies by time period

**Algorithm:**
```javascript
optimal_ranges = {
  today:  { min: 20%, max: 40% },  // % of daily activities
  week:   { min: 15%, max: 35% },
  month:  { min: 10%, max: 30% },
  year:   { min: 5%,  max: 25% }
}

actual_percentage = (activity_count / total_activities) × 100

if (within optimal range):
  frequency_score = 100
else if (below range):
  frequency_score = (actual / min) × 100  // Penalize under-use
else:
  // Penalize over-use (diminishing returns)
  excess = actual - max
  frequency_score = max(50, 100 - (excess/100) × 50)
```

**Example:**
```
Weekly analysis:
- User does "Reading" 25 times out of 100 total activities
- Percentage: 25%
- Optimal range: 15-35%
- Within range → frequency_score = 100 ✅

- User does "Social Media" 50 times
- Percentage: 50%
- Exceeds range (35%)
- Excess: 50 - 35 = 15
- frequency_score = 100 - (15/100)×50 = 92.5 ⚠️
```

---

#### 4. Trend Score (Weight: 10%)

Detects improvement or decline over time

**Algorithm:**
```javascript
// Split activity logs into first half and second half
logs_sorted_by_date
first_half = logs[0 ... mid]
second_half = logs[mid ... end]

first_avg = average_rating(first_half)
second_avg = average_rating(second_half)

change = second_avg - first_avg

// Normalize to -50 to +50 scale
// (max change on 1-5 scale is ±4)
trend_score = (change / 4) × 100

// Then add 50 to make it 0-100 for ranking
normalized_trend = trend_score + 50
```

**Example:**
```
Activity: "Yoga"

First half (older):
  Ratings: [3, 3, 4, 3]
  Avg: 3.25

Second half (recent):
  Ratings: [4, 5, 4, 5]
  Avg: 4.5

Change: +1.25
Trend score: (1.25/4) × 100 = +31.25
Normalized: 31.25 + 50 = 81.25

Interpretation: Strongly improving! ↗️
```

---

#### 5. Confidence Score (Weight: 10%)

Based on data quality and sample size

**Algorithm:**
```javascript
reliability_scores = {
  'very-high': 100,
  'high': 75,
  'medium': 50,
  'low': 25
}

impact_confidence_scores = {
  'high': 100,
  'medium': 66,
  'low': 33
}

// Average the two confidence measures
base_confidence = (
  reliability_scores[rating_reliability] +
  impact_confidence_scores[impact_confidence]
) / 2

// Bonus for sample size
sample_bonus = min(20, occurrences × 2)

confidence_score = min(100, base_confidence + sample_bonus)
```

**Example:**
```
Activity with:
- Rating reliability: 'high' (75)
- Impact confidence: 'medium' (66)
- Occurrences: 8

base = (75 + 66) / 2 = 70.5
bonus = min(20, 8 × 2) = 16
confidence_score = 70.5 + 16 = 86.5
```

---

### Final Rank Score

**Weighted composite:**

```javascript
rank_score = (
  rating_score      × 0.35 +
  correlation_score × 0.30 +
  frequency_score   × 0.15 +
  trend_score       × 0.10 +
  confidence_score  × 0.10
)
```

**Ranking:**
- Sort activities by rank_score (descending)
- Assign rank positions (1 = best)

**Score Interpretation:**

| Score | Category | Recommendation |
|-------|----------|----------------|
| 80-100 | ⭐ Excellent | Continue regularly, primary wellness booster |
| 60-79 | ✅ Beneficial | Maintain current frequency |
| 45-59 | 📊 Moderate | Continue if enjoyable, not priority |
| 30-44 | ⚠️ Questionable | Consider reducing or replacing |
| 0-29 | 🔴 Negative | Avoid or replace with better alternatives |

---

## Database Schema

### Activities Table (Enhanced)

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  duration INTEGER,

  -- NEW: Post-activity ratings
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  sleep_rating INTEGER CHECK (sleep_rating BETWEEN 1 AND 5),
  clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
  energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 5),

  post_activity_feeling TEXT,  -- Legacy emoji feeling
  follow_up_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_ratings
ON activities(user_id, date, mood_rating, sleep_rating, clarity_rating, energy_rating);
```

### Activities with Ratings View

```sql
CREATE VIEW activities_with_ratings AS
SELECT
  id,
  user_id,
  date,
  category,
  name,
  emoji,
  mood_rating,
  sleep_rating,
  clarity_rating,
  energy_rating,

  -- Calculate average impact score (0-100)
  CASE
    WHEN (mood_rating IS NOT NULL OR sleep_rating IS NOT NULL
          OR clarity_rating IS NOT NULL OR energy_rating IS NOT NULL)
    THEN ROUND(
      (COALESCE(mood_rating,0) + COALESCE(sleep_rating,0) +
       COALESCE(clarity_rating,0) + COALESCE(energy_rating,0)) * 100.0 /
      (
        (CASE WHEN mood_rating IS NOT NULL THEN 5 ELSE 0 END) +
        (CASE WHEN sleep_rating IS NOT NULL THEN 5 ELSE 0 END) +
        (CASE WHEN clarity_rating IS NOT NULL THEN 5 ELSE 0 END) +
        (CASE WHEN energy_rating IS NOT NULL THEN 5 ELSE 0 END)
      )
    )
    ELSE NULL
  END as avg_impact_score,

  created_at
FROM activities
WHERE mood_rating IS NOT NULL
   OR sleep_rating IS NOT NULL
   OR clarity_rating IS NOT NULL
   OR energy_rating IS NOT NULL;
```

---

## Implementation Details

### Component: ActivityImpactRatingModal

**Location:** `components/ActivityImpactRatingModal.tsx`

**Features:**
- Beautiful, modern UI with emoji-based ratings
- 1-5 scale for each dimension (mood, sleep, clarity, energy)
- Progressive indicators
- Skip option (but requires at least 1 rating)
- Smooth animations
- Theme-aware styling

**Usage:**
```tsx
<ActivityImpactRatingModal
  visible={showModal}
  activityName="Morning Run"
  activityCategory="Exercise"
  onClose={() => setShowModal(false)}
  onSubmit={(ratings) => {
    // Save ratings to database
    saveActivityRatings(activityId, ratings);
  }}
/>
```

### Service: RatingCorrelationService

**Location:** `services/analytics/ratingCorrelation.service.ts`

**Key Methods:**

```typescript
// Calculate correlation for a single activity
RatingCorrelationService.calculateRatingCorrelation(
  activityName: string,
  activities: ActivityWithRatings[],
  allActivities: ActivityWithRatings[],
  dailyMoods?: Map<string, number>,
  dailySleep?: Map<string, {quality: number}>,
  dailyClarity?: Map<string, number>
): RatingCorrelation

// Generate insights from multiple correlations
RatingCorrelationService.generateInsights(
  correlations: RatingCorrelation[]
): RatingBasedInsight[]
```

### Service: ActivityRankingService

**Location:** `services/analytics/activityRanking.service.ts`

**Key Methods:**

```typescript
// Rank all activities for a period
ActivityRankingService.rankActivities(
  userId: string,
  period: 'today' | 'week' | 'month' | 'year',
  activities: ActivityWithRatings[],
  dailyMoods?: Map<string, number>,
  dailySleep?: Map<string, {quality: number; hours: number}>,
  dailyClarity?: Map<string, number>
): Promise<RankingResult>
```

**Returns:**
- `rankedActivities`: Sorted list with ranks
- `topByRating`: Best by immediate feedback
- `topByCorrelation`: Best by outcome correlation
- `topByFrequency`: Most frequently done
- `mostImproved`: Biggest improvement trend
- `needsAttention`: Low score but high frequency
- `insights`: Personalized insights

---

## Mathematical Foundations

### Pearson Correlation Coefficient

Used to measure linear relationship between two variables.

**Formula:**
```
       Σ(xi - x̄)(yi - ȳ)
r = ─────────────────────────
    √[Σ(xi - x̄)²] √[Σ(yi - ȳ)²]

where:
  xi, yi = individual data points
  x̄, ȳ = means
  r = correlation coefficient (-1 to +1)
```

**Interpretation:**
- r = +1: Perfect positive correlation
- r = +0.7: Strong positive correlation
- r = +0.3: Moderate positive correlation
- r = 0: No correlation
- r = -0.3: Moderate negative correlation
- r = -0.7: Strong negative correlation
- r = -1: Perfect negative correlation

**Example in our system:**
```
Activity: "Evening Coffee"
Dates: 10 occurrences
Sleep ratings: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
Actual sleep quality: [2, 2, 1, 3, 2, 3, 2, 2, 1, 2]

Normalize to 0-1:
  Ratings: [0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25]
  Quality: [0.25, 0.25, 0, 0.5, 0.25, 0.5, 0.25, 0.25, 0, 0.25]

Calculate r:
  r = 0.72 (strong positive correlation!)

Interpretation:
User's predicted sleep impact aligns well with actual sleep quality.
User is self-aware about caffeine's effects.
```

### Standard Deviation & Consistency

**Standard Deviation (σ):**
```
σ = √[Σ(xi - x̄)² / n]
```

**Coefficient of Variation (CV):**
```
CV = σ / x̄
```

**Consistency Score:**
```
consistency = max(0, 1 - CV)
```

**Example:**
```
Activity: "Meditation"
Mood ratings: [4, 4, 5, 4, 5, 4, 4, 5]

Mean (x̄): 4.375
Variance: Σ(xi - 4.375)² / 8 = 0.234
Std Dev (σ): √0.234 = 0.484
CV: 0.484 / 4.375 = 0.111
Consistency: 1 - 0.111 = 0.889 (very consistent!)
```

### Confidence Intervals

**Fisher's z-transformation for correlation:**

```
z = 0.5 × ln[(1 + r) / (1 - r)]

SE = 1 / √(n - 3)

95% CI:
  z_low = z - 1.96 × SE
  z_high = z + 1.96 × SE

Convert back:
  r_low = (e^(2×z_low) - 1) / (e^(2×z_low) + 1)
  r_high = (e^(2×z_high) - 1) / (e^(2×z_high) + 1)
```

**Example:**
```
r = 0.65
n = 15

z = 0.5 × ln[(1+0.65)/(1-0.65)] = 0.775
SE = 1/√12 = 0.289

95% CI:
  z_low = 0.775 - 1.96×0.289 = 0.208
  z_high = 0.775 + 1.96×0.289 = 1.342

  r_low = 0.205
  r_high = 0.869

Interpretation:
We're 95% confident the true correlation is between 0.21 and 0.87
```

---

## Usage Examples

### Example 1: Top Activities for the Week

```typescript
import { ActivityRankingService } from '@/services/analytics/activityRanking.service';

// Fetch activities for past week
const activities = await fetchActivitiesWithRatings(userId, startDate, endDate);
const moods = await fetchDailyMoods(userId, startDate, endDate);
const sleep = await fetchSleepLogs(userId, startDate, endDate);

// Rank activities
const ranking = await ActivityRankingService.rankActivities(
  userId,
  'week',
  activities,
  moods,
  sleep
);

// Display top 5
ranking.rankedActivities.slice(0, 5).forEach(activity => {
  console.log(`
    #${activity.rank} ${activity.emoji} ${activity.name}
    Score: ${activity.rankScore}/100
    ${activity.recommendation}
  `);
});
```

**Output:**
```
#1 🏃 Morning Run
Score: 92/100
⭐ Morning Run is excellent! Best for energy. Improving over time!

#2 🧘 Meditation
Score: 87/100
⭐ Meditation is excellent! Best for clarity. Keep it up!

#3 📚 Reading
Score: 78/100
✅ Reading is beneficial. Primary benefit: clarity.

#4 👥 Social Time
Score: 71/100
✅ Social Time is beneficial. Primary benefit: mood.

#5 🎮 Gaming
Score: 58/100
📊 Gaming has moderate impact. Continue as desired.
```

### Example 2: Activity Insights

```typescript
const insights = ranking.insights;

insights.forEach(insight => {
  console.log(insight);
});
```

**Output:**
```
🏃 Morning Run is your top activity this week!
📈 Meditation is showing great improvement over time!
💡 You do Social Media often (28%), but it ranks low. Consider reducing.
```

### Example 3: Rating Correlation Analysis

```typescript
import { RatingCorrelationService } from '@/services/analytics/ratingCorrelation.service';

const correlation = RatingCorrelationService.calculateRatingCorrelation(
  'Morning Run',
  runActivities,
  allActivities,
  moodMap,
  sleepMap,
  clarityMap
);

console.log(`
Activity: ${correlation.activityName}
Overall Rating: ${correlation.overallRating}/100
Impact Score: ${correlation.impactScore}/100

Mood Impact: ${correlation.moodImpact.average}/5 (${correlation.moodImpact.confidence})
Sleep Impact: ${correlation.sleepImpact.average}/5 (${correlation.sleepImpact.confidence})
Clarity Impact: ${correlation.clarityImpact.average}/5 (${correlation.clarityImpact.confidence})
Energy Impact: ${correlation.energyImpact.average}/5 (${correlation.energyImpact.confidence})

Primary Benefit: ${correlation.primaryBenefit}
Consistency: ${(correlation.consistency * 100).toFixed(0)}%
Reliability: ${correlation.reliability}

Recommendation: ${correlation.recommendation}

Warnings:
${correlation.warnings.join('\n')}
`);
```

---

## Best Practices

### 1. Encourage Consistent Rating
- Show progress indicators (2/4 rated)
- Make it quick and easy (emoji-based)
- Optional but encourage at least 2 dimensions

### 2. Handle Missing Data Gracefully
- Don't require all 4 ratings
- Use available data for calculations
- Indicate confidence based on completeness

### 3. Respect User Time
- Modal can be skipped
- Doesn't block activity logging
- Can be completed later

### 4. Provide Value Early
- Show insights even with minimal data
- Use "preliminary" confidence indicators
- Encourage more tracking with early insights

### 5. Validate and Learn
- Compare ratings with actual outcomes
- Show users how accurate their predictions are
- Highlight when their intuition is correct

---

## Future Enhancements

### Planned Improvements

1. **Time-of-Day Analysis**
   - Track when activities are done
   - Recommend optimal timing
   - "Morning Run at 7am has 15% higher mood impact than at 5pm"

2. **Activity Combinations**
   - Detect synergistic activities
   - "Meditation + Exercise has 25% higher benefit than either alone"

3. **Predictive Recommendations**
   - "Based on your mood today (6/10), try activities that typically boost you 2+ points"
   - ML-based suggestions

4. **Social Comparisons (Anonymous)**
   - "95% of users rate exercise positively for sleep"
   - Benchmark against similar users

5. **Goal-Oriented Tracking**
   - "To improve sleep, prioritize these activities..."
   - Personalized activity plans

6. **Habit Formation Insights**
   - Track how benefit changes over time (habituation curve)
   - Optimal frequency before diminishing returns

---

## Conclusion

This comprehensive activity impact system provides:

✅ **Accurate Attribution** - Immediate ratings beat delayed correlation
✅ **Multi-Dimensional Analysis** - Mood, sleep, clarity, energy
✅ **Statistical Rigor** - Confidence intervals, p-values, validation
✅ **Personalized Rankings** - Dynamic, period-specific
✅ **Actionable Insights** - Clear recommendations
✅ **User-Friendly** - Beautiful UI, optional but encouraged

The combination of immediate feedback (ratings) and outcome validation (daily logs) provides the most accurate activity impact analysis available.

---

**Version:** 1.0.0
**Last Updated:** 2025-01-16
**Author:** Claude Code Agent
**License:** MIT
