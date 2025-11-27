# Analytics Page Redesign - Implementation Guide

## Overview
This document outlines the comprehensive redesign of the Analytics page with improved typography, data-driven components, and enhanced user experience based on the reference design.

## ✅ Completed Tasks

### 1. Typography System Enhancement
**File**: `constants/Typography.ts`

Added new analytics-specific typography tokens for consistent, readable fonts across the analytics page:

```typescript
analytics: {
  pageTitle: 32px bold (H1)
  cardTitle: 24px bold (H2)
  sectionTitle: 20px bold (H3)
  subsectionTitle: 18px semibold (H4)
  kpiValue: 48px extra-bold (Large numbers)
  kpiLabel: 16px medium (KPI labels)
  statValue: 24px bold (Stats)
  statLabel: 14px medium (Stat labels)
  bodyText: 16px regular (Body)
  caption: 13px regular (Small text)
  pillButton: 16px semibold (Buttons)
  modalTitle: 24px bold (Modal headers)
  modalBody: 18px regular (Modal content)
}
```

### 2. Mood Score Card - COMPLETE ✅
**File**: `components/MoodScoreCard.tsx`

**Changes Made**:
- ✅ Removed "around your typical level" section (personalizedContext)
- ✅ Enhanced Best Day display:
  - Shows actual score and date
  - Hides when period is "Today"
  - Format: "Best Day: 4.5 \n Oct 21"
  - Color-coded with success color
- ✅ Applied enhanced typography:
  - Card title: 24px bold
  - KPI values: 48px extra-bold
  - Stat values: 24px bold
  - Body text: 16px
  - Captions: 13px
- ✅ Data is already backend-driven via `AnalyticsService.getMoodScoreAnalysis()`

**Backend Endpoint**: Already exists
- `AnalyticsService.getMoodScoreAnalysis()` returns `bestMoodDay` object with date, score, and emoji

### 3. Activity Impact Card - COMPLETE ✅
**File**: `components/ActivityImpactCard.tsx`

**Changes Made**:
- ✅ Converted activity rows to pill-shaped buttons
- ✅ Pills are color-coded by impact score:
  - Green border: Positive impact (≥70)
  - Amber border: Neutral impact (50-69)
  - Red border: Negative impact (<50)
- ✅ Each pill shows:
  - Activity emoji
  - Activity name (18px semibold)
  - Frequency (13px caption)
  - Impact score in circular badge
- ✅ Applied enhanced typography
- ✅ Data-driven from `ActivityImpactService.analyzeActivities()`

**Modal Enhancement** (Already in place):
- Impact breakdown by metric
- Recommendations section exists
- Statistical correlations displayed

**Remaining Enhancement Needed**:
- **Remove** statistical correlation block from modal
- **Add** data-driven recommendations endpoint:
  ```
  GET /analytics/activity/recommendations
  ?userId=&activityId=&date=
  Returns: { recommendations: string[] }
  ```

## 📋 Remaining Tasks

### 4. Sleep Tracker Card
**File**: `components/SleepDashboard.tsx`

**Required Changes**:

#### A. Metrics Display
Replace hardcoded calculations with real backend data:

```typescript
// Current (lines 838-863):
Deep Sleep: data.summary.avgSleep * 0.85 // HARDCODED
Light Sleep: data.summary.avgSleep * 0.15 // HARDCODED
Naps: 0 // NOT IMPLEMENTED

// Required: Add to SleepService
interface SleepSummary {
  totalHours: number;
  deepSleep: number;
  lightSleep: number;
  napHours: number;
  remSleep?: number;
}

// Endpoint needed:
GET /sleep/summary?userId=&range=week|month|year
Returns: SleepSummary
```

#### B. Sleep Duration Trend - Mini-Calendar Bar View
Replace area chart (lines 355-477) with compact bar chart:

```typescript
// New implementation needed:
- X-axis: Day labels (M, T, W, T, F, S, S)
- Y-axis: Hours (0h, 2.5h, 5h, 7.5h, 10h)
- Color-code bars:
  - Green: Met target (≥ user sleepTarget)
  - Amber: Near target (sleepTarget - 1 to sleepTarget)
  - Red: Below target (< sleepTarget - 1)
- Compress layout with proper margins
- Add axis labels

// Endpoint needed:
GET /sleep/daily?userId=&start=YYYY-MM-DD&end=YYYY-MM-DD
Returns: Array<{ date: string; hours: number; quality: number }>
```

#### C. Typography Updates
```typescript
// In styles section:
title: { ...Typography.analytics.cardTitle }
sectionTitle: { ...Typography.analytics.sectionTitle }
statValue: { ...Typography.analytics.statValue }
statLabel: { ...Typography.analytics.statLabel }
correlationTitle: { ...Typography.analytics.subsectionTitle }
```

### 5. Sleep Correlation Card (NEW COMPONENT)
**File**: Create `components/SleepCorrelationCard.tsx`

**Design**:
```typescript
interface SleepCorrelationCardProps {
  userId: string;
  period: 'week' | 'month' | 'year';
  sleepTarget: number;
}

// Card structure:
1. Header: "Sleep Correlations" (20px bold)
2. Subtitle: "How sleep affects your wellness" (13px)
3. Three metric buttons:
   - Mental Clarity
   - Productivity
   - Mood Score

// Each button shows:
- Metric icon + name
- Correlation score bar
- "View Recommendations" CTA

// On click → Show modal with:
- Detailed correlation data
- Data-driven recommendations from backend

// Endpoints needed:
GET /analytics/sleep/correlation
  ?userId=&metric=clarity|productivity|mood&range=week|month|year

Returns: {
  coefficient: number;
  strength: 'strong' | 'moderate' | 'weak';
  recommendations: string[];
  goodSleepAvg: number;
  poorSleepAvg: number;
  difference: number;
}
```

### 6. Habit Card
**File**: `components/HabitTrackingCard.tsx`

**Required Changes**:

#### A. Color-Coded Borders
```typescript
// Update habit rendering (around line 190-248):
// Get impact color from backend
const habitImpact = await HabitImpactService.getLatestImpact(
  habit.id,
  userId,
  selectedMetric
);

// Apply to card:
<View style={[
  styles.habitItem,
  {
    borderColor: getImpactColor(habitImpact.score),
    borderWidth: 3,
  }
]}>

// Color mapping:
- Green: Positive impact (score ≥ 0.3)
- Gray: Neutral impact (-0.3 to 0.3)
- Red: Negative impact (score < -0.3)
```

#### B. Backend Endpoint Needed
```
GET /analytics/habits/impact?userId=&range=week|month|year

Returns: Array<{
  habitId: string;
  habitName: string;
  impactScore: number;
  colorHint: 'green' | 'gray' | 'red';
  metric: 'mood' | 'sleep' | 'clarity' | 'productivity';
}>
```

#### C. Typography Updates
Already partially done, ensure all use:
```typescript
header: { ...Typography.analytics.cardTitle }
habitName: { ...Typography.analytics.subsectionTitle }
statValue: { ...Typography.analytics.statValue }
```

### 7. Experiments Results Card
**File**: `components/ExperimentResultsCard.tsx`

**Required Changes**:

#### A. Pill/Border Button Style
```typescript
// Update experiment items (lines 221-290):
<TouchableOpacity
  style={[
    styles.experimentPillButton,
    {
      borderColor: badge.color,
      borderWidth: 2,
      backgroundColor: badge.color + '10',
    }
  ]}
>
  <View style={styles.pillContent}>
    <Text style={styles.emoji}>{experiment.emoji}</Text>
    <View style={styles.info}>
      <Text style={styles.name}>{experiment.name}</Text>
      <Text style={styles.meta}>
        Day {experiment.currentDay}/{experiment.duration}
      </Text>
    </View>
    <View style={styles.statusBadge}>
      <Text>{experiment.status}</Text>
    </View>
  </View>
</TouchableOpacity>

// Add styles:
experimentPillButton: {
  borderRadius: 100,
  paddingVertical: 14,
  paddingHorizontal: 18,
  marginBottom: 12,
}
```

#### B. Typography Updates
```typescript
header: { ...Typography.analytics.cardTitle }
experimentName: { ...Typography.analytics.subsectionTitle }
experimentMeta: { ...Typography.analytics.caption }
```

#### C. Backend - Already exists
Data from `AnalyticsService.analyzeUserExperiments()` is already backend-driven.

### 8. More Insights Card
**File**: `components/MoreInsights.tsx`

**Required Changes**:

#### A. Fix Overall Wellness Score
**Current Issue**: May return hardcoded 100/100

**Required Implementation**:
```typescript
// Backend endpoint needed:
GET /analytics/overall-score?userId=&range=week|month|year

// Algorithm (implement server-side):
interface OverallScore {
  overall: number; // 0-100
  breakdown: {
    sleep: number;      // 35% weight
    mood: number;       // 25% weight
    habits: number;     // 20% weight
    clarity: number;    // 20% weight
  };
}

// Calculation:
1. Normalize each metric to 0-100:
   - Sleep: (avgHours / targetHours) * 100, capped at 100
   - Mood: (avgMood / 5) * 100
   - Habits: avgCompletionRate (already 0-100)
   - Clarity: (avgClarity / 5) * 100

2. Apply weights:
   overall = (sleep * 0.35) + (mood * 0.25) + (habits * 0.20) + (clarity * 0.20)

3. Cap at 100
```

#### B. Typography Updates
```typescript
title: { ...Typography.analytics.cardTitle }
sectionTitle: { ...Typography.analytics.sectionTitle }
wellnessScoreValue: { ...Typography.analytics.kpiValue }
metricValue: { ...Typography.analytics.statValue }
```

## 🔧 Backend Endpoints Summary

### Required New Endpoints:

1. **Activity Recommendations**
   ```
   GET /analytics/activity/recommendations
   ?userId=&activityId=&date=
   Returns: { recommendations: string[] }
   ```

2. **Sleep Summary**
   ```
   GET /sleep/summary?userId=&range=week|month|year
   Returns: {
     totalHours: number;
     deepSleep: number;
     lightSleep: number;
     napHours: number;
   }
   ```

3. **Sleep Daily Data**
   ```
   GET /sleep/daily?userId=&start=YYYY-MM-DD&end=YYYY-MM-DD
   Returns: Array<{
     date: string;
     hours: number;
     quality: number;
   }>
   ```

4. **Sleep Correlations**
   ```
   GET /analytics/sleep/correlation
   ?userId=&metric=clarity|productivity|mood&range=week|month|year
   Returns: {
     coefficient: number;
     recommendations: string[];
     goodSleepAvg: number;
     poorSleepAvg: number;
   }
   ```

5. **Habit Impact**
   ```
   GET /analytics/habits/impact?userId=&range=week|month|year
   Returns: Array<{
     habitId: string;
     impactScore: number;
     colorHint: 'green' | 'gray' | 'red';
   }>
   ```

6. **Overall Wellness Score**
   ```
   GET /analytics/overall-score?userId=&range=week|month|year
   Returns: {
     overall: number;
     breakdown: {
       sleep: number;
       mood: number;
       habits: number;
       clarity: number;
     };
   }
   ```

## 📱 Responsive Design & Accessibility

All components must ensure:
- Minimum touch target: 44x44 points
- Color contrast ratio ≥ 4.5:1
- Text scales with system font size settings
- Works on both phone (320px+) and tablet (768px+)
- Support for dark mode via theme.colors

## 🎨 Design System Compliance

**Typography Scale** (from reference image):
- Page titles: 32px bold
- Card titles: 24px bold
- Section titles: 20px bold
- Subsection titles: 18px semibold
- Body text: 16px regular
- Captions/metadata: 13-14px regular
- KPI numbers: 48px extra-bold

**Spacing**:
- Card padding: 20px
- Card margins: 16px
- Element gaps: 8-12px
- Section spacing: 20-24px

**Colors** (via theme):
- Success: theme.colors.success (green)
- Warning: theme.colors.warning (amber)
- Error: theme.colors.error (red)
- Primary: theme.colors.primary (blue)
- Text: theme.colors.text
- Secondary text: theme.colors.textSecondary

## ✅ Quality Assurance Checklist

Before marking complete:
- [ ] All hardcoded values replaced with backend data
- [ ] Typography matches reference image (16px+ body text)
- [ ] All cards are responsive (phone + tablet)
- [ ] Dark mode works correctly
- [ ] No console errors or warnings
- [ ] Loading states display properly
- [ ] Empty states show helpful messages
- [ ] Modals open with larger fonts (18px+ body)
- [ ] Pills/buttons have 2-3px colored borders
- [ ] Statistical correlations removed from Activity modal
- [ ] Recommendations are data-driven (not hardcoded)
- [ ] Wellness score is calculated (not 100/100)
- [ ] Sleep metrics show real data (not 0.85x calculations)
- [ ] Habit cards have impact-based border colors
- [ ] Best Day hidden when period = "Today"

## 📸 Testing & Screenshots

Test each card with:
1. **Empty state**: No data logged
2. **Partial data**: 1-3 entries
3. **Full data**: 7+ entries
4. **Edge cases**: Very high/low scores
5. **Different periods**: Today, Week, Month, Year
6. **Dark mode**: All colors readable
7. **Long text**: Activity names, recommendations

Take screenshots of:
- Each card in normal state
- Modal views
- Empty states
- Dark mode
- Tablet layout

## 🚀 Implementation Order

Recommended sequence:
1. ✅ Typography constants
2. ✅ Mood Score Card
3. ✅ Activity Impact Card (partial - needs recommendations endpoint)
4. Sleep Tracker Card metrics + bar chart
5. Sleep Correlation Card (new component)
6. Habit Card border colors
7. Experiments Results pills
8. More Insights wellness score
9. Backend endpoints
10. End-to-end testing

## 📝 Notes

- All components import Typography from `@/constants/Typography`
- Use `Typography.analytics.*` for consistent sizing
- Replace hardcoded fontSize values with typography tokens
- Test with real user data when available
- Ensure all API calls handle errors gracefully
- Loading spinners should use theme.colors.primary
- Maintain existing component structure where possible
