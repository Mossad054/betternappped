# Experiments Flow - Complete Implementation Plan

## ✅ Current Status

The experiments-hub already has:
- Active experiments display with progress tracking
- Completed experiments with insights
- Daily logging modal with outcome ratings (1-5)
- Activity completion tracking (Yes/No/Skipped)
- Notes input
- Convert to habit functionality
- Progress bars and status indicators

## 🎯 Implementation Needed

### Step 1: Experiment Library (PRIORITY)

**Location**: experiments-hub.tsx

**Add Sections**:
- Popular Experiments
- Sleep Experiments
- Mood Boosters
- Focus Builders
- Energy Enhancers

**Each Template Card Shows**:
```tsx
- Emoji icon
- Title (e.g., "No Screen Before Bed")
- Duration badge (e.g., "7 days")
- Goal (e.g., "Better Sleep Quality")
- "Try This" button → opens detail modal
```

**Experiment Templates Added**:
```javascript
EXPERIMENT_LIBRARY = {
  popular: [
    { title: 'No Screen Before Bed', duration: 7, goal: 'Better Sleep', outcomes: ['Sleep Quality', 'Anxiety'] },
    { title: 'Morning Meditation', duration: 14, goal: 'Improved Focus', outcomes: ['Focus', 'Mental Clarity'] },
    { title: 'Daily Exercise', duration: 21, goal: 'Better Mood & Energy', outcomes: ['Mood', 'Energy', 'Sleep'] }
  ],
  sleep: [...],
  mood: [...],
  focus: [...],
  energy: [...]
}
```

### Step 2: Template Detail Modal (IN PROGRESS)

**Trigger**: Click "Try This" on any library experiment

**Modal Content**:
```tsx
- Title: "About this Experiment"
- Full description
- Duration & Goals
- Outcomes tracked
- Buttons:
  - "Start Experiment" → creates experiment immediately
  - "Customize First" → routes to /create-experiment with pre-filled data
```

### Step 3: Enhanced Customization (EXISTING - create-experiment.tsx)

**Current Fields** (already exists):
- Activity name
- Activity emoji picker
- Outcomes selection (1-3 from predefined list)
- Duration selection
- Start date picker

**Need to Add**:
- Logging frequency selector (once/twice/custom per day)
- Reminder toggle & time picker
- Expected result text input (optional)
- Midway adjustments toggle

### Step 4: Daily Logging (ALREADY IMPLEMENTED ✅)

Current modal has:
- Did you complete activity? (Yes/No/Skipped)
- Rate outcomes 1-5
- Optional notes

Already shows: Day X of Y

### Step 5: Push Notifications (NEEDS IMPLEMENTATION)

**Requirements**:
```typescript
- Request permissions on experiment start
- Schedule daily reminder at user-selected time
- Notification text: "Day 3 of your 'No Phone Before Bed' experiment"
- Deep link to logging modal
```

### Step 6: Midway Recalibration (NEEDS IMPLEMENTATION)

**Add to Active Experiment Card**:
```tsx
- "Recalibrate" button next to "Log Today"
- Modal allows:
  - Change duration
  - Adjust reminder time
  - Modify outcomes tracked
  - Add/edit notes
```

### Step 7: Completion Summary (PARTIALLY IMPLEMENTED)

**Current**:
- Completed experiments show in separate section
- Can convert to habit

**Need to Add**:
```tsx
Completion Modal (triggered on final day log):
- "Experiment Complete 🎉" title
- Completion rate (6/7 days)
- Average outcome ratings
- AI-generated insight from analytics
- Action buttons:
  - "Convert to Habit" ✅
  - "Recalibrate & Try Again" 🔄
  - "Archive" 📦
```

### Step 8: Dashboard Tabs (NEEDS IMPLEMENTATION)

**Add Tab Navigation**:
```tsx
- Library (default) - browse templates
- Ongoing - active experiments
- Completed - finished experiments  
- Archived - stored past experiments
```

## 📂 Files Structure

```
app/
├── experiments-hub.tsx (Main hub with library)
├── create-experiment.tsx (Customization screen)
└── experiment-detail.tsx (NEW - template details)

components/
├── ExperimentTemplateCard.tsx (NEW)
├── ExperimentLibrarySection.tsx (NEW)
└── CompletionSummaryModal.tsx (NEW)

services/
├── experiments.service.ts (existing)
└── notifications.service.ts (NEW - for reminders)
```

## 🎨 UI Components Needed

### 1. ExperimentTemplateCard
```tsx
<TouchableOpacity style={styles.templateCard}>
  <Text style={styles.emoji}>{emoji}</Text>
  <Text style={styles.title}>{title}</Text>
  <View style={styles.badge}>
    <Text>{duration} days</Text>
  </View>
  <Text style={styles.goal}>{goal}</Text>
  <TouchableOpacity style={styles.tryButton}>
    <Text>Try This</Text>
  </TouchableOpacity>
</TouchableOpacity>
```

### 2. Category Pills (Similar to home experiments button)
```tsx
<View style={styles.categoryPills}>
  <TouchableOpacity style={[styles.pill, selected && styles.pillSelected]}>
    <Text>Popular</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.pill}>
    <Text>Sleep</Text>
  </TouchableOpacity>
  // etc.
</View>
```

### 3. Progress Indicator (Already exists ✅)
Shows on active experiments

### 4. Completion Badge
```tsx
<View style={styles.completionBadge}>
  <Text>✅ 6/7 days</Text>
  <Text>86% completion</Text>
</View>
```

## 🔄 Data Flow

```
Library Template Selection
    ↓
Detail Modal (About Experiment)
    ↓ [Start] or [Customize]
    ↓
Create/Customize Screen
    ↓
Start Experiment (creates DB record)
    ↓
Daily Reminder Notification
    ↓
Log Modal (record daily data)
    ↓
Update Progress (increment day)
    ↓
Check if Complete
    ↓
Completion Modal
    ↓
Convert to Habit / Archive
```

## 🗄️ Database Schema (Supabase)

Already has `experiments` table with:
- id, user_id
- activity_name, activity_emoji
- outcomes (array)
- start_date, end_date, duration
- status (active/completed)
- current_day
- baseline_data, results_data
- insights

**Need to Add**:
- logging_frequency (text)
- reminder_enabled (boolean)
- reminder_time (time)
- expected_result (text, nullable)
- allow_midway_adjustments (boolean)
- archived (boolean, default false)
- completion_rate (decimal)
- template_id (text, nullable)

## 🚀 Implementation Priority

1. **HIGH**: Library view with categories ⭐
2. **HIGH**: Template detail modal
3. **MEDIUM**: Enhanced customization fields
4. **MEDIUM**: Completion summary modal
5. **MEDIUM**: Tab navigation
6. **LOW**: Push notifications
7. **LOW**: Recalibration modal
8. **LOW**: Archive functionality

## 💡 Quick Wins

1. Show library by default instead of "Start New Experiment" button
2. Add category pills at top (Popular/Sleep/Mood/Focus/Energy)
3. Display template cards in grid (2 per row)
4. Modal on card tap with "Start" / "Customize" buttons
5. Pre-fill create-experiment when "Customize" clicked

## 📝 Next Steps

1. Add EXPERIMENT_LIBRARY constant with all templates
2. Create category state and filter logic
3. Build ExperimentTemplateCard component
4. Add template detail modal
5. Link "Customize" to create-experiment with query params
6. Add completion modal when experiment finishes

---

**Note**: Most infrastructure already exists. Main work is UI/UX for library browsing and template selection.
