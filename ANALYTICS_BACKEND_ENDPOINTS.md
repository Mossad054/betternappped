# Analytics Backend Endpoints - Implementation Guide

## Overview
This document specifies the new backend endpoints required for the Analytics page redesign. All endpoints should return data-driven results, not hardcoded values.

---

## 1. Activity Recommendations

### Endpoint
```
GET /analytics/activity/recommendations
```

### Query Parameters
- `userId` (string, required): User ID
- `activityId` (string, required): Activity ID to get recommendations for
- `date` (string, optional): ISO date for context, defaults to today

### Response
```json
{
  "success": true,
  "data": {
    "recommendations": [
      "Try this activity in the morning for better mood impact",
      "Pair with 8+ hours of sleep for maximum benefit",
      "Consistency matters - aim for 3x per week"
    ],
    "activityName": "Exercise",
    "generatedAt": "2025-10-26T10:30:00Z"
  }
}
```

### Implementation Logic
```typescript
// Analyze activity patterns:
1. Time of day correlation
2. Sleep duration before/after activity
3. Frequency patterns
4. Combination with other activities
5. Seasonal/weekly patterns

// Generate 3-5 actionable recommendations based on:
- Positive correlations found
- Optimal timing discovered
- Frequency analysis
- User's personal baseline
```

---

## 2. Sleep Summary

### Endpoint
```
GET /sleep/summary
```

### Query Parameters
- `userId` (string, required): User ID
- `range` (enum, required): `week` | `month` | `year`

### Response
```json
{
  "success": true,
  "data": {
    "totalHours": 52.5,
    "deepSleep": 15.2,
    "lightSleep": 28.8,
    "remSleep": 8.5,
    "napHours": 2.5,
    "avgPerNight": 7.5,
    "period": "week",
    "daysLogged": 7
  }
}
```

### Implementation Logic
```sql
-- Aggregate sleep logs for period
SELECT
  SUM(total_hours) as totalHours,
  SUM(deep_sleep_hours) as deepSleep,
  SUM(light_sleep_hours) as lightSleep,
  SUM(rem_sleep_hours) as remSleep,
  SUM(CASE WHEN is_nap THEN hours ELSE 0 END) as napHours,
  COUNT(*) as daysLogged
FROM sleep_logs
WHERE user_id = ? AND date >= ?
```

**Important**: Return REAL values from database, not calculated percentages like `totalHours * 0.85`

---

## 3. Sleep Daily Data

### Endpoint
```
GET /sleep/daily
```

### Query Parameters
- `userId` (string, required): User ID
- `start` (string, required): Start date (YYYY-MM-DD)
- `end` (string, required): End date (YYYY-MM-DD)

### Response
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-20",
      "hours": 7.5,
      "quality": 4.2,
      "deepSleep": 2.1,
      "bedTime": "23:00",
      "wakeTime": "06:30"
    },
    {
      "date": "2025-10-21",
      "hours": 6.2,
      "quality": 3.5,
      "deepSleep": 1.5,
      "bedTime": "00:15",
      "wakeTime": "06:30"
    }
  ],
  "userTarget": 8.0
}
```

### Implementation Logic
```sql
-- Get daily sleep logs
SELECT
  date,
  total_hours as hours,
  quality_rating as quality,
  deep_sleep_hours as deepSleep,
  bed_time as bedTime,
  wake_time as wakeTime
FROM sleep_logs
WHERE user_id = ? AND date BETWEEN ? AND ?
ORDER BY date ASC

-- Also fetch user's sleep target
SELECT sleep_target FROM user_preferences WHERE user_id = ?
```

---

## 4. Sleep Correlations

### Endpoint
```
GET /analytics/sleep/correlation
```

### Query Parameters
- `userId` (string, required): User ID
- `metric` (enum, required): `clarity` | `productivity` | `mood`
- `range` (enum, required): `week` | `month` | `year`

### Response
```json
{
  "success": true,
  "data": {
    "metric": "clarity",
    "coefficient": 0.68,
    "strength": "moderate",
    "recommendations": [
      "7-8 hours of sleep correlates with 25% higher mental clarity",
      "Sleep before midnight shows stronger clarity benefits",
      "Consistent sleep schedule improves clarity by 18%"
    ],
    "goodSleepAvg": 4.2,
    "poorSleepAvg": 2.8,
    "difference": 1.4,
    "sampleSize": 45
  }
}
```

### Implementation Logic
```typescript
// 1. Define good vs poor sleep (based on user target):
const goodSleep = sleepHours >= userTarget - 0.5;
const poorSleep = sleepHours < userTarget - 1.5;

// 2. Calculate metric averages for good vs poor sleep days
SELECT AVG(metric_score)
FROM (sleep + metrics joined)
WHERE sleep_quality IN (good | poor)

// 3. Compute Pearson correlation coefficient
const coefficient = pearsonCorrelation(sleepHours[], metricScores[]);

// 4. Classify strength:
- Strong: |coefficient| >= 0.7
- Moderate: 0.4 <= |coefficient| < 0.7
- Weak: |coefficient| < 0.4

// 5. Generate recommendations based on:
- Optimal sleep duration found
- Sleep timing patterns
- Consistency impact
- User's personal data
```

---

## 5. Habit Impact

### Endpoint
```
GET /analytics/habits/impact
```

### Query Parameters
- `userId` (string, required): User ID
- `range` (enum, required): `week` | `month` | `year`
- `metric` (enum, optional): `mood` | `sleep` | `clarity` | `productivity` (if omitted, use overall impact)

### Response
```json
{
  "success": true,
  "data": [
    {
      "habitId": "habit_123",
      "habitName": "Morning Exercise",
      "impactScore": 0.45,
      "colorHint": "green",
      "metric": "mood",
      "completionRate": 85,
      "sampleSize": 12
    },
    {
      "habitId": "habit_456",
      "habitName": "Late Night Snacking",
      "impactScore": -0.32,
      "colorHint": "red",
      "metric": "sleep",
      "completionRate": 70,
      "sampleSize": 8
    }
  ]
}
```

### Implementation Logic
```typescript
// For each active habit:
1. Get days when habit was completed vs not completed
2. Compare average metric scores:
   impactScore = avgMetric(completedDays) - avgMetric(notCompletedDays)

3. Normalize impact score to -1.0 to +1.0

4. Assign color hint:
   - green: impactScore >= 0.3 (positive)
   - gray: -0.3 < impactScore < 0.3 (neutral)
   - red: impactScore <= -0.3 (negative)

// Only include habits with sufficient data (≥5 days in range)
```

---

## 6. Overall Wellness Score

### Endpoint
```
GET /analytics/overall-score
```

### Query Parameters
- `userId` (string, required): User ID
- `range` (enum, required): `week` | `month` | `year`

### Response
```json
{
  "success": true,
  "data": {
    "overall": 72,
    "breakdown": {
      "sleep": 68,
      "mood": 75,
      "habits": 60,
      "clarity": 80
    },
    "weights": {
      "sleep": 35,
      "mood": 25,
      "habits": 20,
      "clarity": 20
    },
    "trend": "improving",
    "vsLastPeriod": 8,
    "sampleSize": 21
  }
}
```

### Implementation Logic
```typescript
// 1. Normalize each sub-score to 0-100:

sleep = (avgSleepHours / userSleepTarget) * 100;
sleep = Math.min(sleep, 100); // Cap at 100

mood = (avgMood / 5.0) * 100;

habits = avgHabitCompletionRate; // Already 0-100

clarity = (avgClarity / 5.0) * 100;

// 2. Apply weights and calculate overall:
const weights = {
  sleep: 0.35,    // 35%
  mood: 0.25,     // 25%
  habits: 0.20,   // 20%
  clarity: 0.20,  // 20%
};

overall = (
  sleep * weights.sleep +
  mood * weights.mood +
  habits * weights.habits +
  clarity * weights.clarity
);

overall = Math.round(Math.min(overall, 100));

// 3. Calculate trend (compare to previous period)
const previousScore = calculateOverallScore(previousPeriod);
const trend = overall > previousScore + 5 ? 'improving'
            : overall < previousScore - 5 ? 'declining'
            : 'stable';
```

**IMPORTANT**: Never return hardcoded 100/100. Always calculate from real user data.

---

## General Guidelines

### Error Handling
All endpoints should handle:
```json
// Insufficient data
{
  "success": true,
  "data": null,
  "message": "Insufficient data for this period. Log more activities to see insights."
}

// Invalid parameters
{
  "success": false,
  "error": "Invalid range parameter. Must be 'week', 'month', or 'year'."
}

// Server error
{
  "success": false,
  "error": "An error occurred while calculating correlations. Please try again."
}
```

### Performance
- All endpoints should respond within 200ms
- Use database indexes on:
  - `user_id`
  - `date` columns
  - `created_at` timestamps
- Cache expensive calculations (correlations) for 1 hour
- Use pagination for large datasets

### Security
- Validate `userId` matches authenticated user
- Sanitize all query parameters
- Rate limit: 60 requests/minute per user
- Return 404 if accessing other users' data

### Data Privacy
- Only return aggregated data (no PII in recommendations)
- Recommendations should be generic, not exposing specific log details
- Don't include actual log timestamps in responses

---

## Implementation Priority

1. **High Priority** (blocking UI):
   - Sleep Summary (endpoints 2)
   - Sleep Daily (endpoint 3)
   - Overall Wellness Score (endpoint 6)

2. **Medium Priority** (enhance UX):
   - Habit Impact (endpoint 5)
   - Sleep Correlations (endpoint 4)

3. **Low Priority** (nice-to-have):
   - Activity Recommendations (endpoint 1)

---

## Testing Checklist

For each endpoint:
- [ ] Returns valid data with sufficient logs
- [ ] Handles insufficient data gracefully
- [ ] Returns null/empty for new users
- [ ] Validates all query parameters
- [ ] Returns 401 for unauthorized access
- [ ] Performs within 200ms
- [ ] Handles date edge cases (year boundaries, leap years)
- [ ] Caches expensive calculations
- [ ] Supports all specified range values
- [ ] Returns consistent data types

---

## Example SQL Queries

### Overall Wellness Score Calculation
```sql
-- Get all components for a user in date range
WITH sleep_score AS (
  SELECT
    user_id,
    (AVG(total_hours) / (SELECT sleep_target FROM user_preferences WHERE user_id = ?)) * 100 AS score
  FROM sleep_logs
  WHERE user_id = ? AND date >= ?
  GROUP BY user_id
),
mood_score AS (
  SELECT
    user_id,
    (AVG(score) / 5.0) * 100 AS score
  FROM mood_logs
  WHERE user_id = ? AND created_at >= ?
  GROUP BY user_id
),
habit_score AS (
  SELECT
    user_id,
    AVG(completion_rate) AS score
  FROM (
    SELECT
      user_id,
      habit_id,
      (COUNT(CASE WHEN completed THEN 1 END) * 100.0 / COUNT(*)) AS completion_rate
    FROM habit_completions
    WHERE user_id = ? AND date >= ?
    GROUP BY user_id, habit_id
  ) habit_rates
  GROUP BY user_id
),
clarity_score AS (
  SELECT
    user_id,
    (AVG(score) / 5.0) * 100 AS score
  FROM mental_clarity_logs
  WHERE user_id = ? AND created_at >= ?
  GROUP BY user_id
)

SELECT
  LEAST(ROUND(
    COALESCE(s.score, 0) * 0.35 +
    COALESCE(m.score, 0) * 0.25 +
    COALESCE(h.score, 0) * 0.20 +
    COALESCE(c.score, 0) * 0.20
  ), 100) AS overall_score,
  LEAST(ROUND(COALESCE(s.score, 0)), 100) AS sleep,
  LEAST(ROUND(COALESCE(m.score, 0)), 100) AS mood,
  LEAST(ROUND(COALESCE(h.score, 0)), 100) AS habits,
  LEAST(ROUND(COALESCE(c.score, 0)), 100) AS clarity
FROM sleep_score s
FULL OUTER JOIN mood_score m USING (user_id)
FULL OUTER JOIN habit_score h USING (user_id)
FULL OUTER JOIN clarity_score c USING (user_id)
WHERE user_id = ?;
```

### Sleep Correlation Calculation
```sql
-- Get sleep hours and metric scores for correlation
SELECT
  s.date,
  s.total_hours AS sleep_hours,
  m.score AS metric_score
FROM sleep_logs s
INNER JOIN mental_clarity_logs m
  ON s.user_id = m.user_id
  AND s.date = DATE(m.created_at)
WHERE s.user_id = ?
  AND s.date >= ?
ORDER BY s.date;

-- Then calculate Pearson correlation in application code
```

---

## Deployment Notes

1. Deploy endpoints in order of priority
2. Test with production-like data volumes
3. Monitor query performance after deployment
4. Set up error logging for correlation failures
5. Create database indexes before release
6. Update API documentation
7. Version endpoints (v1, v2) for future changes

