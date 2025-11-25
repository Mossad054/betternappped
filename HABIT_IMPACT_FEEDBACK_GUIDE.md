# Habit Impact Feedback System - Complete Implementation Guide

## 🎯 Overview

This guide documents the comprehensive habit impact feedback and correlation analysis system that collects detailed user feedback after completing habits and analyzes the impact on mood, sleep, anxiety, productivity, and energy levels.

## ✅ What Has Been Implemented

### 1. **Database Schema** ([database/migrations/create_habit_impact_feedback.sql](database/migrations/create_habit_impact_feedback.sql))

Two new tables for storing and analyzing habit impact:

#### `habit_impact_feedback` Table
Stores detailed feedback for each habit completion:
- **Overall Feeling**: good/neutral/bad (required)
- **Impact Ratings** (1-5 scale):
  - Mood Impact
  - Sleep Impact
  - Anxiety Impact
  - Productivity Impact
  - Energy Impact
- **Additional Context**:
  - Difficulty Level (1-5)
  - Enjoyment Level (1-5)
  - Time Taken (minutes)
  - Notes (optional text)

#### `habit_correlations` Table
Automatically calculated aggregates and correlations:
- Average impact scores for each category
- Total completions
- Confidence score (based on data points)
- Last calculation timestamp

**Auto-Calculation Trigger**: When feedback is added, correlations are automatically recalculated via database trigger.

---

### 2. **Feedback Collection Modal** ([components/HabitImpactFeedbackModal.tsx](components/HabitImpactFeedbackModal.tsx))

Beautiful, comprehensive modal for collecting detailed feedback:

**Features:**
- **Step 1**: Overall feeling (good/neutral/bad) - REQUIRED
- **Step 2**: 5 impact ratings with visual sliders
- **Step 3**: Additional context (difficulty, enjoyment, time, notes)
- **UX**: Smooth animations, clear labels, helpful descriptions
- **Validation**: Ensures overall feeling is selected before submit

**Rating Categories:**
1. 😊 **Mood Impact** - How much did this improve your mood?
2. 🌙 **Sleep Quality** - How much will this help your sleep tonight?
3. 🛡️ **Anxiety Reduction** - How much did this reduce your anxiety?
4. 📈 **Productivity Boost** - How much did this boost your focus/productivity?
5. ⚡ **Energy Level** - How much did this increase your energy?

---

### 3. **Service Layer** ([services/habitImpact.service.ts](services/habitImpact.service.ts))

Complete service for managing habit impact data:

**Core Functions:**
```typescript
// Save/update feedback
HabitImpactService.saveFeedback(habitId, userId, data, date)

// Get feedback by date
HabitImpactService.getFeedbackByDate(habitId, userId, date)

// Get all feedback for a habit
HabitImpactService.getAllFeedbackForHabit(habitId, userId, limit?)

// Get correlation data
HabitImpactService.getHabitCorrelation(habitId, userId)

// Get all habits with impact scores
HabitImpactService.getAllHabitsWithImpact(userId)

// Get top impact habits by category
HabitImpactService.getTopImpactHabits(userId, 'mood' | 'sleep' | 'anxiety' | 'productivity' | 'energy', limit)

// Get feedback summary statistics
HabitImpactService.getFeedbackSummary(habitId, userId)
```

---

### 4. **Integration with Home Screen** ([app/(tabs)/home.tsx](app/(tabs)/home.tsx))

Enhanced user flow with comprehensive feedback:

**When User Marks Habit Complete:**
1. Habit is logged as complete in database
2. Streak is updated
3. **Feedback modal appears automatically** 🎉
4. User provides detailed impact ratings
5. Data is saved and correlations are calculated
6. Motivational message is shown based on feedback

**When User Clicks Feedback Buttons (😊 😐 😔):**
1. **Good/Neutral**: Opens detailed impact feedback modal
2. **Bad**: Triggers pause/calibrate flow:
   - Option 1: "Calibrate" → Redirect to habit library
   - Option 2: "Cancel" → Show pause option
   - Pause: Temporarily disable habit (future feature)

**New Handlers:**
- `handleToggleComplete()` - Now opens feedback modal on completion
- `handleFeedback()` - Handles good/neutral/bad feedback with pause/calibrate flow
- `handleImpactFeedbackSubmit()` - Saves detailed impact data

---

## 🚀 How to Use the System

### Step 1: Run the Database Migration

```sql
-- Run this in your Supabase SQL Editor
-- File: database/migrations/create_habit_impact_feedback.sql
```

This will create:
- `habit_impact_feedback` table
- `habit_correlations` table
- Auto-calculation trigger
- RLS policies
- Indexes for performance

### Step 2: Test the Flow

1. **Open the app** and go to the home screen
2. **Mark a habit as complete** by clicking "Mark as Complete"
3. **Feedback modal appears** asking "How did it go?"
4. **Select overall feeling** (good/neutral/bad)
5. **Rate the impact** on mood, sleep, anxiety, productivity, energy
6. **Add optional context** (difficulty, enjoyment, time, notes)
7. **Submit** - Data is saved and you see a motivational message!

### Step 3: Test Feedback Buttons

1. Click one of the emoji buttons (😊 😐 😔) on a habit card
2. **If Good/Neutral**: Feedback modal opens
3. **If Bad**: Pause/Calibrate flow appears:
   - "Calibrate" opens habit library
   - "Cancel" shows pause option

---

## 📊 Data Analysis & Correlation

### Automatic Correlation Calculation

Every time feedback is submitted, the database automatically:
1. Recalculates average impact scores
2. Updates total completion count
3. Calculates confidence score (based on data points)
4. Stores in `habit_correlations` table

**Confidence Score Formula:**
```
confidence = min(total_completions / 30, 1.0)
```
- 0 completions = 0% confidence
- 15 completions = 50% confidence
- 30+ completions = 100% confidence

### Querying Impact Data

**Get Top Mood-Boosting Habits:**
```typescript
const { data } = await HabitImpactService.getTopImpactHabits(
  userId,
  'mood',
  5 // top 5
);
```

**Get Habit Correlation Summary:**
```typescript
const { data } = await HabitImpactService.getHabitCorrelation(
  habitId,
  userId
);

console.log(data.avg_mood_impact); // 4.2
console.log(data.avg_sleep_impact); // 3.8
console.log(data.confidence_score); // 0.87
```

**Get All Habits Ranked by Impact:**
```typescript
const { data } = await HabitImpactService.getAllHabitsWithImpact(userId);

// Results include all correlation data
data.forEach(habit => {
  console.log(`${habit.name}:`);
  console.log(`  Mood Impact: ${habit.avg_mood_impact}`);
  console.log(`  Sleep Impact: ${habit.avg_sleep_impact}`);
  console.log(`  Confidence: ${habit.confidence_score}`);
});
```

---

## 🎨 UI/UX Flow

### Flow 1: Complete Habit (New)
```
User clicks "Mark as Complete"
  ↓
Habit marked complete in DB
  ↓
Streak updated
  ↓
✨ Feedback Modal Appears ✨
  ↓
User rates impact (1-5 for each category)
  ↓
User submits feedback
  ↓
Data saved to habit_impact_feedback
  ↓
Correlations auto-calculated via trigger
  ↓
Motivational message shown
```

### Flow 2: Bad Feedback (Pause/Calibrate)
```
User clicks 😔 Bad button
  ↓
Confirmation dialog appears:
"This habit seems challenging..."
  ↓
Option 1: "Calibrate"
  ↓ (opens habit library)
User explores alternative habits
  ↓
Option 2: "Cancel"
  ↓
Pause dialog appears:
"Would you like to pause this habit?"
  ↓
User chooses:
  - Keep Active
  - Pause It (future: update status field)
```

### Flow 3: Good/Neutral Feedback
```
User clicks 😊 Good or 😐 Neutral button
  ↓
Feedback Modal Appears
  ↓
User provides detailed ratings
  ↓
Data saved & motivational message shown
```

---

## 📱 Analytics Page Integration (Next Steps)

### Recommended Visualizations

#### 1. **Top Impact Habits Dashboard**
Show which habits have the best impact on each category:
```typescript
// Example implementation for analytics page
const { data: topMoodHabits } = await HabitImpactService.getTopImpactHabits(
  userId,
  'mood',
  3
);

// Display:
// 1. Morning Meditation 🧘 - Mood Impact: 4.8/5 ⭐
// 2. Evening Walk 🚶 - Mood Impact: 4.5/5 ⭐
// 3. Gratitude Practice 🙏 - Mood Impact: 4.3/5 ⭐
```

#### 2. **Habit Effectiveness Chart**
Radar/spider chart showing multi-dimensional impact:
```
       Mood (4.5)
          /  \
Energy (3.2) Sleep (4.8)
    \       /
  Productivity (4.0)
        |
   Anxiety (4.2)
```

#### 3. **Correlation Heatmap**
Matrix showing which habits correlate with which outcomes:

```
                Mood  Sleep  Anxiety  Productivity  Energy
Meditation      4.5   4.0    4.8      3.5          3.0
Exercise        4.0   4.5    4.0      4.2          4.5
Journaling      4.2   3.5    4.5      3.8          3.0
```

#### 4. **Confidence Indicators**
Show reliability of insights based on data points:
```
🟢 High Confidence (30+ completions)
🟡 Medium Confidence (10-29 completions)
🔴 Low Confidence (<10 completions)
```

#### 5. **Personal Insights**
AI-generated recommendations based on correlations:
```
✨ Based on your data:
- "Morning Meditation" consistently improves your mood by 90%
- "Evening Walk" helps you sleep better 85% of the time
- You enjoy "Journaling" most (4.8/5 enjoyment)
- Consider adding more anxiety-reducing habits
```

---

## 🔧 Implementation Example for Analytics Page

```typescript
// File: app/(tabs)/analytics.tsx

import { HabitImpactService } from '@/services/habitImpact.service';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [topHabits, setTopHabits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    if (!user) return;

    const [moodHabits, sleepHabits, anxietyHabits, productivityHabits, energyHabits] =
      await Promise.all([
        HabitImpactService.getTopImpactHabits(user.id, 'mood', 3),
        HabitImpactService.getTopImpactHabits(user.id, 'sleep', 3),
        HabitImpactService.getTopImpactHabits(user.id, 'anxiety', 3),
        HabitImpactService.getTopImpactHabits(user.id, 'productivity', 3),
        HabitImpactService.getTopImpactHabits(user.id, 'energy', 3),
      ]);

    setTopHabits({
      mood: moodHabits.data,
      sleep: sleepHabits.data,
      anxiety: anxietyHabits.data,
      productivity: productivityHabits.data,
      energy: energyHabits.data,
    });

    setLoading(false);
  };

  return (
    <View>
      <Text>🎯 Your Best Habits for Mood</Text>
      {topHabits.mood?.map((habit) => (
        <HabitImpactCard
          key={habit.id}
          habit={habit}
          impactType="mood"
          score={habit.avg_mood_impact}
          confidence={habit.confidence_score}
        />
      ))}

      <Text>💤 Your Best Habits for Sleep</Text>
      {topHabits.sleep?.map((habit) => (
        <HabitImpactCard
          key={habit.id}
          habit={habit}
          impactType="sleep"
          score={habit.avg_sleep_impact}
          confidence={habit.confidence_score}
        />
      ))}

      {/* ... more sections ... */}
    </View>
  );
}
```

---

## 🎨 UI Components Needed for Analytics

### 1. **HabitImpactCard Component**
```typescript
interface HabitImpactCardProps {
  habit: HabitWithImpact;
  impactType: 'mood' | 'sleep' | 'anxiety' | 'productivity' | 'energy';
  score: number; // 1-5
  confidence: number; // 0-1
}

// Shows:
// - Habit name & emoji
// - Impact score (e.g., 4.5/5 stars)
// - Confidence indicator (colored dot)
// - Total completions
// - Progress bar
```

### 2. **ImpactRadarChart Component**
```typescript
// Spider/radar chart showing multi-dimensional impact
// Uses library like react-native-chart-kit or react-native-svg-charts
```

### 3. **CorrelationMatrix Component**
```typescript
// Heatmap showing habit-to-outcome correlations
// Color-coded cells (green = high impact, red = low impact)
```

---

## 📝 Database Queries for Analytics

### Query 1: Best Habits Overall
```sql
SELECT
  h.name,
  h.emoji,
  hc.total_completions,
  hc.avg_mood_impact,
  hc.avg_sleep_impact,
  hc.avg_anxiety_impact,
  hc.avg_productivity_impact,
  hc.avg_energy_impact,
  hc.confidence_score,
  (hc.avg_mood_impact + hc.avg_sleep_impact + hc.avg_anxiety_impact +
   hc.avg_productivity_impact + hc.avg_energy_impact) / 5.0 AS overall_impact
FROM habits h
JOIN habit_correlations hc ON h.id = hc.habit_id
WHERE h.user_id = $1
  AND hc.confidence_score >= 0.3
ORDER BY overall_impact DESC
LIMIT 10;
```

### Query 2: Impact Trends Over Time
```sql
SELECT
  date_trunc('week', date) AS week,
  AVG(mood_impact) AS avg_mood,
  AVG(sleep_impact) AS avg_sleep,
  AVG(anxiety_impact) AS avg_anxiety
FROM habit_impact_feedback
WHERE user_id = $1
  AND date >= NOW() - INTERVAL '3 months'
GROUP BY week
ORDER BY week;
```

### Query 3: Habit Difficulty vs Enjoyment
```sql
SELECT
  h.name,
  hc.avg_difficulty,
  hc.avg_enjoyment,
  hc.total_completions,
  CASE
    WHEN hc.avg_difficulty < 3 AND hc.avg_enjoyment >= 4 THEN 'Easy & Fun'
    WHEN hc.avg_difficulty >= 4 AND hc.avg_enjoyment >= 4 THEN 'Challenging but Rewarding'
    WHEN hc.avg_difficulty >= 4 AND hc.avg_enjoyment < 3 THEN 'Needs Adjustment'
    ELSE 'Moderate'
  END AS habit_category
FROM habits h
JOIN habit_correlations hc ON h.id = hc.habit_id
WHERE h.user_id = $1
ORDER BY hc.avg_enjoyment DESC, hc.avg_difficulty ASC;
```

---

## 🔮 Future Enhancements

### 1. **Habit Pause Functionality**
Add a `status` field to the habits table:
```sql
ALTER TABLE habits ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived'));
```

Update queries to filter by status:
```typescript
// Only show active habits
.eq('status', 'active')
```

### 2. **Smart Recommendations**
Use correlation data to suggest habits:
```typescript
// "Users with similar profiles found these habits most effective for mood:"
// - Morning Meditation (4.8/5 avg mood impact)
// - Gratitude Practice (4.6/5 avg mood impact)
```

### 3. **Personalized Goals**
```typescript
// "Based on your feedback, you tend to skip habits with difficulty > 4"
// "Consider: Reduce Morning Exercise from 30min to 20min"
```

### 4. **Impact Predictions**
```typescript
// "Completing 'Morning Meditation' today will likely:"
// - Improve mood by 85% (based on your history)
// - Help sleep quality tonight by 75%
// - Reduce anxiety by 90%
```

### 5. **Streak Bonus Insights**
```typescript
// "Your 7-day streak shows:"
// - 40% improvement in average mood
// - 2 hours more sleep per week
// - 30% reduction in anxiety
```

---

## ✅ Testing Checklist

- [ ] Run database migration successfully
- [ ] Complete a habit and verify feedback modal appears
- [ ] Submit detailed impact feedback
- [ ] Check `habit_impact_feedback` table for saved data
- [ ] Check `habit_correlations` table for calculated aggregates
- [ ] Click "Good" feedback button and verify modal appears
- [ ] Click "Bad" feedback button and verify pause/calibrate flow
- [ ] Test with multiple habits over multiple days
- [ ] Verify confidence scores increase with more data
- [ ] Query top impact habits for each category
- [ ] Test edge cases (no feedback, minimal feedback, etc.)

---

## 📚 Summary

You now have a complete habit impact feedback and correlation analysis system that:

✅ **Collects** detailed feedback after every habit completion
✅ **Stores** multi-dimensional impact data (mood, sleep, anxiety, productivity, energy)
✅ **Calculates** correlations and aggregates automatically
✅ **Provides** pause/calibrate flow for struggling habits
✅ **Enables** powerful analytics and insights
✅ **Maintains** UX/UI consistency with existing design

The foundation is complete. Next step is building the analytics visualizations using the service layer methods!
