# Multiple Moods Per Day - Implementation Guide

## 🎯 Overview
This feature allows users to log multiple moods throughout the day with individual timestamps, providing a more accurate picture of emotional fluctuations.

## ✨ Key Features

### 1. **Timestamp-Based Mood Logging**
- Users can log moods multiple times per day (e.g., morning, midday, evening)
- Each mood entry has a unique timestamp (`logged_at`)
- No limit on number of moods per day

### 2. **Calendar Visualization**
- **Latest mood displays on top** (most recent emoji and color)
- **Badge indicator** shows count when multiple moods exist (e.g., "3" badge)
- Click date to see **full mood timeline** with timestamps

### 3. **Day Detail Modal**
- Shows **timeline of all moods** for the day
- Each mood displays:
  - Emoji
  - Score (1-5)
  - Time logged (e.g., "9:30 AM")
- Latest mood highlighted with blue border

### 4. **Analytics Integration**
- Daily analytics calculate **average mood** from all entries
- Weekly/monthly trends use **daily averages**
- Supports mood fluctuation analysis

## 📊 Database Changes

### Migration File
**Location**: `database/migrations/003_multiple_moods_per_day.sql`

**Key Changes**:
1. Removed `UNIQUE(user_id, date)` constraint
2. Added `logged_at TIMESTAMP WITH TIME ZONE` column
3. Created new composite index: `(user_id, date, logged_at)`
4. Added performance indexes for time-based queries

**To Apply Migration**:
```sql
-- Run in Supabase SQL Editor
\i database/migrations/003_multiple_moods_per_day.sql
```

### Schema Changes
```sql
ALTER TABLE mood_logs 
  DROP CONSTRAINT mood_logs_user_id_date_key;
  
ALTER TABLE mood_logs 
  ADD COLUMN logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  
CREATE UNIQUE INDEX idx_mood_logs_user_date_time 
  ON mood_logs(user_id, date, logged_at);
```

## 🔧 Service Updates

### MoodsService (`services/moods.service.ts`)

**Breaking Changes**:
- `getByDate()` now returns **array** instead of single object
  ```typescript
  // Before
  const { data } = await MoodsService.getByDate(userId, date);
  // data is MoodLog | null
  
  // After
  const { data } = await MoodsService.getByDate(userId, date);
  // data is MoodLog[] | null (sorted by logged_at DESC)
  ```

**New Methods**:
- `getLatestByDate(userId, date)` - Get most recent mood for a date
  ```typescript
  const { data } = await MoodsService.getLatestByDate(userId, '2025-11-10');
  // Returns single MoodLog | null
  ```

**Deprecated**:
- `upsert()` - Use `create()` instead for multiple moods per day

### AnalyticsService (`services/analytics.service.ts`)

**Interface Updates**:
```typescript
interface CalendarData {
  date: string;
  moods?: Array<{
    id: string;
    score: number;
    emoji: string;
    logged_at: string;
    moods: any[];
  }>;
  mood?: { score: number; emoji: string }; // Latest mood (backward compatible)
  // ... other fields
}

interface DailyDetailData {
  date: string;
  moods: any[]; // Array of all moods
  mood?: any; // Latest mood (backward compatible)
  // ... other fields
}
```

**Behavior Changes**:
- `getCalendarData()` returns both `moods[]` and `mood` (latest)
- `getDailyDetailData()` includes full mood timeline
- Analytics calculations use **daily averages** when multiple moods exist

## 📱 UI Components

### Calendar (`app/(tabs)/calendar.tsx`)
**Visual Changes**:
- Latest mood emoji displays in colored circle
- Badge with count shows when moods > 1 (e.g., "3")
- Badge style: Black circle with white text, positioned top-right

**Rendering Logic**:
```typescript
// Prioritizes moods array over single mood
if (dayData.moods && dayData.moods.length > 0) {
  const latestMood = dayData.moods[0]; // Already sorted DESC
  // Show latestMood.emoji with count badge
}
```

### Journal (`app/(tabs)/journal.tsx`)
**Functional Changes**:
- Changed from `MoodsService.upsert()` to `MoodsService.create()`
- Each save creates **new mood entry** instead of updating existing
- Timestamp automatically set to `NOW()` by database

**User Flow**:
1. User selects mood and completes form
2. Clicks "Save Entry"
3. New mood entry created with current timestamp
4. Form resets, ready for next entry
5. User can log another mood later same day

### Day Detail Modal (`components/DayDetailModal.tsx`)
**Display Format**:
```
📅 Monday, November 10, 2025

😊 4/5    ← Latest mood (blue border)
2:30 PM

😐 3/5
12:15 PM

😔 2/5
9:00 AM
```

**Styling**:
- Horizontal timeline layout
- Latest mood highlighted with blue background
- Timestamp in 12-hour format
- Responsive wrapping for many moods

## 🧪 Testing Checklist

### Database Migration
- [ ] Run migration SQL successfully
- [ ] Verify `logged_at` column exists
- [ ] Check `UNIQUE(user_id, date)` constraint removed
- [ ] Confirm new indexes created

### Mood Logging
- [ ] Log mood in morning → Save successful
- [ ] Log another mood at midday → Creates new entry (not update)
- [ ] Log third mood in evening → All three saved
- [ ] Check database has 3 separate rows for same date

### Calendar Display
- [ ] Single mood shows normal emoji circle
- [ ] Multiple moods show badge with count
- [ ] Badge displays correct number (2, 3, etc.)
- [ ] Latest mood emoji displays (not oldest)

### Day Detail Modal
- [ ] Click date with multiple moods → Modal opens
- [ ] All moods display in timeline
- [ ] Latest mood has blue highlight
- [ ] Timestamps show correct times
- [ ] Times in correct order (newest first)

### Analytics
- [ ] Daily summary shows average mood
- [ ] Weekly trend calculates from daily averages
- [ ] Monthly analytics include all mood data
- [ ] Correlations work with multiple moods

## 📈 Analytics Behavior

### Daily Average Calculation
When multiple moods exist for a day:
```typescript
const dailyScores = [2, 3, 4]; // Morning, midday, evening
const dailyAverage = (2 + 3 + 4) / 3 = 3.0
```

### Weekly Trends
Uses daily averages, not individual mood entries:
```typescript
// Day 1: 3 moods → avg 3.5
// Day 2: 2 moods → avg 4.0
// Day 3: 1 mood → 3.0
const weeklyAverage = (3.5 + 4.0 + 3.0) / 3 = 3.5
```

### Calendar Color
Shows color based on **latest mood score** only:
- Latest mood: 4/5 → Green circle ✓
- Earlier moods ignored for color display
- Click date to see full history

## 🔄 Backward Compatibility

### Existing Data
- Old mood logs without `logged_at` → Migration sets to `created_at` or midday
- Single mood per day still works perfectly
- No data loss during migration

### API Compatibility
- `mood` field maintained in responses for backward compatibility
- Components can still use `data.mood` if needed
- Recommended: Migrate to `data.moods` array

## 🚀 Usage Examples

### Logging Multiple Moods
```typescript
// Morning mood
await MoodsService.create({
  date: '2025-11-10',
  score: 2,
  emoji: '😔',
  moods: [{ id: 1, name: 'Sad' }],
  notes: 'Rough morning'
}, userId);

// Afternoon mood
await MoodsService.create({
  date: '2025-11-10',
  score: 4,
  emoji: '😊',
  moods: [{ id: 8, name: 'Happy' }],
  notes: 'Great workout!'
}, userId);
```

### Fetching Day's Moods
```typescript
// Get all moods for date
const { data: moods } = await MoodsService.getByDate(userId, '2025-11-10');
console.log(moods); // [{ score: 4, logged_at: '2:30 PM' }, { score: 2, logged_at: '9:00 AM' }]

// Get only latest
const { data: latest } = await MoodsService.getLatestByDate(userId, '2025-11-10');
console.log(latest); // { score: 4, logged_at: '2:30 PM' }
```

### Rendering Timeline
```tsx
{data.moods?.map((mood, index) => (
  <View key={mood.id} style={index === 0 && styles.highlightLatest}>
    <Text>{mood.emoji} {mood.score}/5</Text>
    <Text>{formatTime(mood.logged_at)}</Text>
  </View>
))}
```

## 🎨 UI Mockup

```
CALENDAR VIEW:
┌─────────────────────────────────────┐
│  November 2025                      │
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat  │
│                           1    2    │
│   3    4    5    6    7    8    9   │
│  10   [😊]  12   13   14   15   16  │
│      └─3─┘  ← Badge shows 3 moods   │
│  17   18   19   20   21   22   23   │
└─────────────────────────────────────┘

DAY DETAIL MODAL (Clicking 11):
┌─────────────────────────────────────┐
│  Monday, November 11, 2025      [X] │
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │😊 4/5  │ │😌 3/5  │ │😔 2/5  │  │
│  │2:30 PM │ │12:15PM │ │9:00 AM │  │
│  └────────┘ └────────┘ └────────┘  │
│   ↑ Latest (blue border)            │
│                                     │
│  Daily Impact Analysis              │
│  ├─ Morning started rough but...    │
│  └─ Afternoon workout boosted mood  │
└─────────────────────────────────────┘
```

## 📝 Notes

- Timestamps use user's local timezone
- No limit on moods per day
- Each mood is independent (can have different triggers, notes)
- Delete individual mood entries if needed
- Calendar performance optimized with proper indexes

## ⚠️ Important

1. **Run database migration** before deploying code changes
2. **Test with existing user data** to ensure no issues
3. **Update mobile app** if using separate mobile codebase
4. **Inform users** about new multi-mood logging capability

---

**Implementation Date**: November 10, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete
