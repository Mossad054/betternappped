# Intelligent Experiment Results Card

## Overview
The Experiment Results Card intelligently analyzes users' ongoing and completed experiments by correlating their outcomes with wellness data (mood, sleep, mental clarity, productivity). It provides actionable insights and recommendations in a minimal, intuitive interface.

---

## Backend Implementation

### Analytics Service Method: `analyzeUserExperiments()`

**Location:** `services/analytics.service.ts`

**Signature:**
```typescript
static async analyzeUserExperiments(
  userId: string,
  filter: 'all' | 'active' | 'completed' = 'all'
): Promise<{
  data: {
    experiments: Array<ExperimentAnalysis>;
    summary: SummaryStats;
    insights: string[];
  } | null;
  error: any;
}>
```

#### Features

**1. Data Fetching**
- Fetches all experiments for user
- Applies filter (all/active/completed)
- Fetches 90 days of wellness data:
  - Mood logs (score 1-10)
  - Sleep logs (hours + quality)
  - Mental clarity tests (score)
  - Productivity logs (rating 1-5)

**2. Per-Experiment Analysis**

For each experiment, calculates:

- **Progress**: Current day vs total duration (percentage)
- **Completion**: Number of days actually completed
- **Baseline Period**: 14 days before experiment start
- **Experiment Period**: Start date to current/end date

**3. Wellness Impact Calculation**

Compares average wellness scores:
- **Before experiment** (baseline): 14-day average
- **During experiment**: Daily averages throughout experiment
- **Percentage change**: `(after - before) / before`

Metrics tracked:
- 😊 **Mood** impact
- 😴 **Sleep** impact
- 🧠 **Clarity** impact
- ⚡ **Productivity** impact

**4. Impact Classification**

```typescript
if (positiveCount >= 2 && negativeCount === 0) → 'positive'
else if (negativeCount >= 2) → 'negative'
else → 'neutral'
```

Where:
- Positive = change ≥ +5%
- Negative = change ≤ -5%
- Neutral = change between -5% and +5%

**5. Smart Recommendations**

Decision logic:
- **Positive + Completed**: "Convert to long-term habit"
- **Positive + Active**: "Keep going to validate"
- **Negative + 70%+ complete**: "Consider stopping or modifying"
- **Negative + Active**: "Tweak experiment or try different approach"
- **Neutral + <50% progress**: "Keep running for more data"
- **Neutral + Completed**: "No clear impact detected"

**6. Summary Statistics**

Returns:
```typescript
{
  active: number,
  completed: number,
  paused: number,
  positiveExperiments: number,
  neutralExperiments: number,
  negativeExperiments: number,
  totalExperiments: number
}
```

**7. Insights Generation**

Generates up to 4 smart insights:
- Completion count celebration
- Best performing experiment highlight
- Active experiments encouragement
- Negative experiments warning
- Success rate analysis (if ≥60%)

---

## Frontend Implementation

### Component: `ExperimentResultsCard`

**Location:** `components/ExperimentResultsCard.tsx`

**Props:**
```typescript
interface ExperimentResultsCardProps {
  userId: string;
  filter?: 'all' | 'active' | 'completed';
}
```

### UI Sections

#### 1. Header
- **Title**: "Experiment Results"
- **Subtitle**: "Discover how your experiments affect your wellness"
- **Donut Chart**: Shows distribution of experiment outcomes
  - 🟩 Green segment: Positive experiments
  - 🟧 Orange segment: Neutral experiments
  - 🟥 Red segment: Negative experiments
  - Center displays total count

#### 2. Filter Tabs
- **All** / **Active** / **Completed**
- Active tab highlighted in blue (#60A5FA)
- Smooth filter transitions

#### 3. Summary Stats Row
Four mini cards showing:
- **Active**: Count (blue #60A5FA)
- **Completed**: Count (purple #A78BFA)
- **Positive**: Count (green #10B981)
- **Negative**: Count (red #EF4444)

#### 4. Insights Section
- 💡 **Key Insights** header
- Up to 4 AI-generated insights
- Based on experiment patterns

#### 5. Experiment List (Scrollable)

Each experiment card displays:

**Header:**
- Emoji + Name
- Status badge with current day (e.g., "Active • Day 5/14")
- Impact badge: 🟩🟧🟥

**Progress Bar:**
- Colored by impact level
- Shows completion percentage

**Trend Indicators:**
- 😊 Mood: ↑↑ / ↑ / → / ↓ / ↓↓
- 😴 Sleep: ↑↑ / ↑ / → / ↓ / ↓↓
- 🧠 Clarity: ↑↑ / ↑ / → / ↓ / ↓↓
- ⚡ Productivity: ↑↑ / ↑ / → / ↓ / ↓↓

**Text:**
- **Summary**: Changes detected (e.g., "Mood improved 12%, Sleep decreased 8%")
- **Recommendation**: Personalized advice

#### 6. Detail Modal

Tap any experiment card to open modal showing:

**Header:**
- Large emoji + experiment name
- Close button (✕)

**Impact Badge:**
- 🟩 Positive Impact / 🟧 Neutral Impact / 🟥 Negative Impact
- Full-width colored background

**Timeline Section:**
- Start date
- End date
- Progress (Day X of Y - Z%)

**Wellness Impact Section:**
- Before → After values for each metric
- Percentage change (green for positive, red for negative)
- Example: "😊 Mood: 6.2 → 7.5 (+21%)"

**Summary Section:**
- Full text summary of all changes

**Recommendation Section:**
- Complete recommendation text

**Action Buttons:**
- **⭐ Convert to Habit** (only for positive experiments)
  - Navigates to `/habit-library`
- **✏️ Modify Experiment**
  - Navigates to `/create-experiment?id={id}`
- **📦 Archive**
  - Archives experiment (placeholder)

---

## Visual Design

### Color Scheme

**Impact Levels:**
- 🟩 **Positive**: #10B981 (Green)
- 🟧 **Neutral**: #F59E0B (Amber)
- 🟥 **Negative**: #EF4444 (Red)

**Accent Colors:**
- **Blue**: #60A5FA (primary actions)
- **Purple**: #A78BFA (secondary stats)

**Progress Bars:**
- Colored solid fill based on impact level
- Subtle gray background (#E5E7EB in light mode)

### Trend Indicators

**Arrow Logic:**
```typescript
change >= 15%  → ↑↑ (strong increase)
change >= 5%   → ↑ (increase)
-5% to +5%     → → (stable)
change <= -5%  → ↓ (decrease)
change <= -15% → ↓↓ (strong decrease)
```

### Layout Principles
- Rounded corners (16-20px radius)
- Generous padding (16-20px)
- Clean typography hierarchy
- Theme-aware colors (light/dark)
- Touch targets ≥44px
- Smooth animations

---

## Integration

### Activity Page
**File:** `app/(tabs)/activity.tsx`

```typescript
import ExperimentResultsCard from '@/components/ExperimentResultsCard';

<ExperimentResultsCard 
  userId={user?.id || ''} 
  filter="all"
/>
```

**Position:** After `HabitTrackingCard`, before `MoreInsights`

---

## Database Schema

### Tables Used

#### `experiments`
```sql
id UUID PRIMARY KEY
user_id UUID
activity_name TEXT
activity_emoji TEXT
outcomes JSONB (array of outcome names)
start_date DATE
end_date DATE
duration INTEGER (total days)
status TEXT ('active' | 'completed' | 'paused')
current_day INTEGER
baseline_data JSONB
results_data JSONB
insights TEXT
created_at TIMESTAMP
```

#### `experiment_logs`
```sql
id UUID PRIMARY KEY
experiment_id UUID
user_id UUID
date DATE
completed BOOLEAN
skipped BOOLEAN
outcome_scores JSONB
notes TEXT
created_at TIMESTAMP
```

#### Related Wellness Tables
- `mood_logs`: date, score (1-10)
- `sleep_logs`: date, hours, quality
- `mental_clarity_tests`: date, score
- `productivity_logs`: date, rating (1-5)

---

## User Insight Examples

### Positive Results
> "Your 'No Coffee After 3PM' experiment improved sleep by 22% and mood by 10%. Keep it going!"

> "🌟 Great results! Convert 'Morning Meditation' into a long-term habit to maintain these benefits."

### Neutral Results
> "Skipping evening screen time didn't significantly affect clarity — maybe tweak experiment duration."

> "🤔 No clear impact detected. This activity may not significantly affect your tracked metrics."

### Negative Results
> "Caffeine reduction worsened mood and productivity by 15%. Consider moderating rather than eliminating."

> "⚠️ This experiment shows negative impact. Consider stopping or modifying your approach."

---

## Performance Considerations

1. **Parallel Fetching**: All wellness data fetched simultaneously
2. **90-Day Window**: Limited data fetch prevents performance issues
3. **In-Memory Processing**: Calculations done client-side after fetch
4. **Lazy Modal Rendering**: Detail modal only renders when opened
5. **Efficient Maps**: O(1) lookup for date-based wellness data

---

## Error Handling

1. **No Experiments**: Graceful empty state with call-to-action
2. **API Errors**: Logs error, shows loading state
3. **Missing Wellness Data**: Defaults to 0 impact (no correlation)
4. **Guest Mode**: Works with guest data store
5. **Network Failures**: Loading indicator prevents UI freezes

---

## Testing Scenarios

### Test Case 1: Positive Experiment
**Setup:**
- User runs "Morning Exercise" for 14 days
- Mood: 6.2 → 7.8 (+26%)
- Sleep: 6.5 → 7.2 (+11%)

**Expected:**
- 🟩 Positive impact badge
- Green progress bar
- ↑ trends for mood and sleep
- Recommendation: "Convert to habit"

### Test Case 2: Active In-Progress
**Setup:**
- User 5 days into 30-day "No Sugar" experiment
- Early data shows mood improvement

**Expected:**
- Progress: 17%
- Status: "Active • Day 5/30"
- Recommendation: "Keep going to validate"

### Test Case 3: Negative Experiment
**Setup:**
- User completed "Intermittent Fasting"
- Productivity: -18%
- Mood: -12%

**Expected:**
- 🟥 Negative impact badge
- Red progress bar
- ↓↓ trends for productivity and mood
- Recommendation: "Consider stopping or modifying"

### Test Case 4: Neutral/Inconclusive
**Setup:**
- User tried "Cold Showers" for 7 days
- All metrics changed <5%

**Expected:**
- 🟧 Neutral impact badge
- Amber progress bar
- → stable trends
- Recommendation: "Keep running for more data"

---

## Future Enhancements

1. **Experiment Templates**: Pre-built experiments based on goals
2. **Social Comparison**: Anonymous aggregated results
3. **AI Coach**: GPT-powered experiment suggestions
4. **Timeline Charts**: Visual graphs in modal
5. **Export Results**: PDF/image sharing
6. **Baseline Optimization**: Smarter baseline period selection
7. **Statistical Significance**: P-value calculations
8. **Multi-Variable**: Track multiple activities simultaneously
9. **Goal Alignment**: Link experiments to wellness goals
10. **Reminders**: Smart notifications to log experiment data

---

## Accessibility

1. **Color Independence**: Emojis supplement color indicators
2. **Large Touch Targets**: All buttons ≥44px
3. **Readable Text**: Minimum 12px font size
4. **Contrast**: WCAG AA compliant
5. **Theme Support**: Full light/dark mode
6. **Screen Readers**: Semantic HTML structure

---

## API Response Example

```json
{
  "experiments": [
    {
      "id": "uuid-1",
      "name": "No Coffee After 3PM",
      "emoji": "☕",
      "status": "completed",
      "progress": 100,
      "startDate": "2025-10-01",
      "endDate": "2025-10-14",
      "duration": 14,
      "currentDay": 14,
      "outcomes": ["Better Sleep", "Morning Energy"],
      "impact": {
        "mood": 0.10,
        "sleep": 0.22,
        "clarity": 0.15,
        "productivity": -0.05
      },
      "impactLevel": "positive",
      "summary": "Sleep improved 22%, Mood improved 10%, Clarity improved 15%, Productivity decreased 5%.",
      "recommendation": "🌟 Great results! Convert 'No Coffee After 3PM' into a long-term habit to maintain these benefits.",
      "changeDetails": {
        "mood": { "before": 6.8, "after": 7.5, "change": 0.10 },
        "sleep": { "before": 6.2, "after": 7.6, "change": 0.22 },
        "clarity": { "before": 75, "after": 86, "change": 0.15 },
        "productivity": { "before": 4.0, "after": 3.8, "change": -0.05 }
      }
    }
  ],
  "summary": {
    "active": 1,
    "completed": 3,
    "paused": 0,
    "positiveExperiments": 2,
    "neutralExperiments": 1,
    "negativeExperiments": 1,
    "totalExperiments": 4
  },
  "insights": [
    "✅ You've completed 3 experiments. Great dedication to self-improvement!",
    "🌟 'No Coffee After 3PM' shows the strongest positive results. Consider making it a habit!",
    "🧪 1 active experiment in progress. Stay consistent for best results.",
    "🎯 50% of your experiments show positive results. You're great at identifying what works!"
  ]
}
```

---

## Implementation Checklist

✅ Backend `analyzeUserExperiments()` method (380+ lines)
✅ Wellness data correlation engine
✅ Impact classification logic (positive/neutral/negative)
✅ Smart recommendation system
✅ Summary insights generation
✅ Frontend `ExperimentResultsCard` component (750+ lines)
✅ Donut chart showing outcome distribution
✅ Filter tabs (all/active/completed)
✅ Summary stats cards
✅ Scrollable experiment list
✅ Trend indicators (↑↑ ↑ → ↓ ↓↓)
✅ Progress bars colored by impact
✅ Detail modal with full analysis
✅ Action buttons (Convert to Habit, Modify, Archive)
✅ Integration into activity.tsx
✅ Theme support (light/dark mode)
✅ TypeScript type safety
✅ Error handling and loading states
✅ Documentation

---

## Summary

The Intelligent Experiment Results Card transforms raw experiment data into actionable wellness insights by:

- **Analyzing** how experiments correlate with mood, sleep, clarity, and productivity
- **Classifying** experiments as positive, neutral, or negative based on impact
- **Recommending** whether to convert to habit, continue, modify, or stop
- **Visualizing** results through intuitive progress bars, trend indicators, and donut charts
- **Empowering** users to make data-driven decisions about their wellness routines

This feature elevates experiment tracking from basic logging to an intelligent self-optimization tool powered by correlation analysis and personalized recommendations.
