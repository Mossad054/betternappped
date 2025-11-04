# Intelligent Habit Tracking & Wellness Correlation

## Overview
The Intelligent Habit Tracking Card analyzes how user habits correlate with wellness outcomes (mood, sleep quality, and mental clarity). It provides smart recommendations based on completion rates, correlation strength, and trend analysis.

---

## Backend Implementation

### Analytics Service Method: `analyzeUserHabits()`

**Location:** `services/analytics.service.ts`

**Signature:**
```typescript
static async analyzeUserHabits(
  userId: string,
  period: 'week' | 'month' | 'all' = 'month'
): Promise<{
  data: {
    habits: Array<HabitAnalysis>;
    summary: SummaryStats;
    insights: string[];
    period: string;
  } | null;
  error: any;
}>
```

**Features:**
1. **Data Fetching**: Parallel fetches of habits, habit logs, moods, sleep logs, and mental clarity tests
2. **Date Range Calculation**: 
   - Week: Last 7 days
   - Month: Last 30 days
   - All: Last 90 days

3. **Per-Habit Analysis**:
   - **Completion Rate**: Percentage of days habit was completed
   - **Current Streak**: Consecutive days of completion
   - **Best Streak**: Longest streak ever achieved
   - **Wellness Correlations**: Impact on mood, sleep, and clarity
   - **Impact Level**: High/Medium/Low/None based on average correlation
   - **Trend**: Up/Down/Stable based on recent vs older completion rates
   - **Smart Recommendation**: Personalized advice based on all metrics

4. **Correlation Calculation**:
   - Compares average wellness scores on days habit was completed vs. not completed
   - Normalized to -1 to 1 range
   - Positive = habit improves wellness metric
   - Negative = habit correlates with lower wellness

5. **Summary Statistics**:
   - Total active habits
   - Average progress across all habits
   - Average completion rate
   - Most positive habit (highest wellness impact)
   - Habit needing attention (low completion + declining)
   - Best performing category

6. **Insight Generation**:
   - Overall completion rate assessment
   - Most impactful habit identification
   - Category performance highlights
   - Attention alerts for struggling habits
   - Streak celebrations

---

## Frontend Implementation

### Component: `HabitTrackingCard`

**Location:** `components/HabitTrackingCard.tsx`

**Props:**
```typescript
interface HabitTrackingCardProps {
  userId: string;
  period?: 'week' | 'month' | 'all';
}
```

**Features:**

#### 1. Header Section
- Title: "Habit Tracking & Progress"
- Mini donut chart showing overall progress
- SVG with blue-to-purple gradient

#### 2. Period Filter Tabs
- Week / Month / All Time
- Active tab highlighted in blue (#60A5FA)
- Smooth transitions between periods

#### 3. Summary Cards
- **Active Habits**: Count of currently active habits (blue)
- **Avg Completion**: Overall completion rate percentage (purple)

#### 4. Insights Section
- 💡 Key Insights header
- Up to 4 smart insights based on user's habit patterns
- Color-coded by theme

#### 5. Habit List
- Scrollable list of all habits
- Each card displays:
  - **Emoji + Name + Category**
  - **Trend Indicator**: 🟩 (up/good), 🟨 (stable), 🟥 (down/poor)
  - **Statistics Row**: Completion %, Current Streak, Impact Level
  - **Progress Bar**: Gradient colored by impact level
    - High impact: Green (#10B981 → #34D399)
    - Medium impact: Blue (#60A5FA → #818CF8)
    - Low impact: Amber (#F59E0B → #FBBF24)
    - None: Purple gradient (default)
  - **Recommendation**: Smart advice text

#### 6. Detail Modal (Tap any habit card)
- **Header**: Large emoji + habit name
- **Progress Summary Section**:
  - Completion Rate (blue)
  - Current Streak (purple)
  - Best Streak (green)
  
- **Wellness Impact Section**:
  - Bar charts for Mood, Sleep, Clarity correlations
  - Green bars = positive impact
  - Red bars = negative correlation
  - Percentage values displayed
  
- **Smart Recommendation Section**:
  - Full recommendation text
  
- **Action Buttons**:
  - ⭐ Make Core Habit
  - ✏️ Edit Habit
  - ⏸️ Pause Habit

---

## Color Scheme

### Gradients
- **Primary**: Blue to Purple (`#60A5FA` → `#A78BFA`)
- **High Impact**: Green (`#10B981` → `#34D399`)
- **Medium Impact**: Blue (`#60A5FA` → `#818CF8`)
- **Low Impact**: Amber (`#F59E0B` → `#FBBF24`)

### Indicators
- 🟩 Green Square: Improving trend + good completion
- 🟨 Yellow Square: Stable trend or moderate completion
- 🟥 Red Square: Declining trend or poor completion

---

## Smart Recommendation Logic

### Decision Tree

1. **High Impact + High Completion (≥80%)**
   - "🌟 Excellent! This habit significantly improves your [top metric]. Keep it up!"

2. **High Impact + Declining Trend**
   - "⚠️ This habit really helps your wellness. Try to get back on track!"

3. **Medium/High Impact + Medium Completion (50-79%)**
   - "💪 You're making progress! Stay consistent to maximize the benefits."

4. **Low Completion (<50%) + Declining**
   - "📉 Your progress is slipping. Consider adjusting this habit or removing it."

5. **Strong Streak (≥7 days)**
   - "🔥 [X]-day streak! Don't break the chain now!"

6. **Improving Trend**
   - "📈 You're building momentum! Keep pushing forward."

7. **No Clear Impact + High Completion**
   - "🤔 Consistent completion, but unclear impact. Consider modifying this habit."

8. **Default**
   - "💫 Stay committed to this habit to see results!"

---

## Integration

### Activity Page
**File:** `app/(tabs)/activity.tsx`

```typescript
import HabitTrackingCard from '@/components/HabitTrackingCard';

// In render section (after SleepDashboard)
<HabitTrackingCard 
  userId={user?.id || ''} 
  period={selectedRange === 'today' ? 'week' : 
          selectedRange === 'year' ? 'all' : 
          selectedRange as 'week' | 'month' | 'all'}
/>
```

---

## Database Requirements

### Tables Used

#### `habits`
- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `category` (text)
- `emoji` (text)
- `streak` (integer)
- `streak_goal` (integer)
- `created_at` (timestamp)

#### `habit_logs`
- `id` (uuid)
- `habit_id` (uuid)
- `user_id` (uuid)
- `date` (date)
- `completed` (boolean)
- `feedback` (text)
- `created_at` (timestamp)

#### Related Tables (for correlation)
- `mood_logs`: date, score (1-10)
- `sleep_logs`: date, hours, quality
- `mental_clarity_tests`: date, score

---

## New Service Method

### `HabitsService.getHabitLogsByDateRange()`

**Location:** `services/habits.service.ts`

```typescript
static async getHabitLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: HabitLog[] | null; error: any }>
```

**Purpose**: Fetch all habit logs for a user within a date range for correlation analysis.

**Query**:
- Filter by `user_id`
- Range: `date >= startDate AND date <= endDate`
- Ordered by `date DESC`

---

## Performance Considerations

1. **Parallel Data Fetching**: All data sources fetched simultaneously
2. **In-Memory Processing**: Correlations calculated client-side after fetch
3. **Lazy Loading**: Modal content only rendered when opened
4. **Efficient Maps**: Uses Map data structures for O(1) lookups
5. **Memoization**: React hooks prevent unnecessary re-renders

---

## Testing Scenarios

### Test Case 1: High Impact Habit
- **Setup**: User completes "Morning Exercise" 25/30 days
- **Expected**: 
  - High completion rate (~83%)
  - Positive mood/sleep correlations
  - Green progress bar
  - "Keep it up!" recommendation

### Test Case 2: Struggling Habit
- **Setup**: User completes "Read 30 min" 5/30 days, declining trend
- **Expected**:
  - Low completion rate (~17%)
  - Red trend indicator 🟥
  - Amber progress bar
  - "Consider adjusting or removing" recommendation

### Test Case 3: Strong Streak
- **Setup**: User has 15-day streak on "Meditation"
- **Expected**:
  - Purple progress bar
  - "🔥 15-day streak!" recommendation
  - High current streak display

### Test Case 4: No Data
- **Setup**: No habits tracked yet
- **Expected**:
  - Empty state message
  - "Start tracking habits" prompt
  - No crashes or errors

---

## Future Enhancements

1. **Core Habits System**: Mark high-impact habits as "core" for priority tracking
2. **Habit Templates**: Pre-built habit suggestions based on wellness goals
3. **Sharing**: Export habit analytics as image/PDF
4. **Notifications**: Smart reminders based on completion patterns
5. **AI Insights**: GPT-powered personalized habit coaching
6. **Habit Chains**: Visualize dependencies between habits
7. **Time-of-Day Analysis**: When user completes habits most successfully
8. **Social Features**: Compare anonymized stats with community

---

## Error Handling

1. **No Habits**: Graceful empty state with encouraging message
2. **API Errors**: Logs error, shows generic message to user
3. **Missing Wellness Data**: Correlations default to 0 (no data)
4. **Guest Mode**: Returns empty arrays (no correlation data stored)
5. **Network Failures**: Loading states prevent UI freezes

---

## Accessibility

1. **Color Independence**: Emojis (🟩🟨🟥) supplement color indicators
2. **Touch Targets**: All buttons ≥44px touch area
3. **Readable Text**: Minimum 12px font size
4. **Contrast**: All text meets WCAG AA standards
5. **Theme Support**: Full light/dark mode compatibility

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         HabitTrackingCard               │
│  (components/HabitTrackingCard.tsx)     │
└─────────────────┬───────────────────────┘
                  │
                  │ loadHabitData()
                  ▼
┌─────────────────────────────────────────┐
│      AnalyticsService                   │
│  analyzeUserHabits(userId, period)      │
└─────────────────┬───────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────────┐
│ HabitsService   │ │ MoodsService        │
│ - getAll()      │ │ SleepService        │
│ - getLogs()     │ │ ClarityService      │
└─────────────────┘ └─────────────────────┘
         │                 │
         └────────┬────────┘
                  ▼
         Correlation Analysis
         - calculateCorrelations()
         - generateRecommendations()
         - calculateTrends()
                  │
                  ▼
         Return Analyzed Data
         - habits[]
         - summary{}
         - insights[]
```

---

## Implementation Checklist

✅ Backend `analyzeUserHabits()` method (400+ lines)
✅ `HabitsService.getHabitLogsByDateRange()` method
✅ Correlation calculation logic
✅ Smart recommendation engine
✅ Insight generation system
✅ Frontend `HabitTrackingCard` component (700+ lines)
✅ Mini donut chart with gradient
✅ Progress bars with dynamic colors
✅ Trend indicators with emojis
✅ Detail modal with wellness correlations
✅ Period filter tabs
✅ Integration into activity.tsx
✅ Theme support (light/dark mode)
✅ TypeScript type safety
✅ Error handling and loading states
✅ Documentation

---

## Summary

The Intelligent Habit Tracking Card provides users with:
- **Visibility**: Clear view of all habit progress and streaks
- **Insights**: Understanding which habits truly impact wellness
- **Motivation**: Smart recommendations and trend indicators
- **Actionability**: Identify habits to prioritize or modify
- **Correlation**: Data-driven connections between habits and wellness

This feature transforms habit tracking from simple checkboxes into an intelligent wellness optimization tool.
