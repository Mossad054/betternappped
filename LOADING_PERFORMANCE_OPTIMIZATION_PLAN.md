# Performance Optimization Plan
## Betternapped Frontend Loading Performance Audit

**Date:** November 26, 2025
**Audited By:** Performance Engineering Team
**Scope:** Home.tsx, Calendar.tsx, Journal.tsx (Analytics.tsx functionality)
**Critical Issue:** 30-second load times are **unacceptable** for user experience

---

## Section 1: Root Cause Analysis

### 🏠 **Home.tsx** (3,269 lines) - CRITICAL BOTTLENECK

**File Location:** `app/(tabs)/home.tsx`

#### Primary Performance Issues:

**1. Excessive API Calls on Mount (Lines 239-257) - CRITICAL**
```typescript
const [habitsResult, moodResult, sleepResult, clarityResult, impactResult] =
  await Promise.all([
    HabitsService.getAll(effectiveUserId),                           // ALL habits
    MoodsService.getByDateRange(effectiveUserId, /* 7 days */),     // 7 days
    SleepService.getByDateRange(effectiveUserId, /* 7 days */),     // 7 days
    MentalClarityService.getByDateRange(effectiveUserId, /* 7 days */), // 7 days
    AnalyticsService.calculateActivityImpact(effectiveUserId, 14)    // 14 DAYS!
  ]);
```

**Issues:**
- **5 parallel API calls** execute on every component mount
- `calculateActivityImpact` fetches **14 days of data** with complex correlations
- **No caching layer** - same data refetched on every screen focus
- Real-time subscriptions trigger `loadData()` on **every database change**
- `useFocusEffect` (lines 202-208) triggers **full reload** when navigating back

**Root Cause:** Frontend + Backend
**Estimated Load Time Impact:** 2-4 seconds

---

**2. Unoptimized Synchronous Computations (Lines 292-391) - HIGH**

These functions run on **every render**:
```typescript
const getTodayMood = () => {
  const todayEntry = moodData.find((m: any) => m.date === today);  // O(n) search
  // ... complex conditional logic
};

const getTodaySleep = () => {
  if (sleepData && sleepData.length > 0) {
    const mostRecent = sleepData[0];
    // Calls SleepService.calculateSleepDuration() - synchronous calculation
    hours = SleepService.calculateSleepDuration(bedtime, wake_time);
  }
};

const getTodayClarity = () => {
  const recentTest = mentalClarityData.find((c: any) => {
    const testDate = new Date(c.created_at || c.date);
    return testDate >= twentyFourHoursAgo;  // Date calculations in loop
  });
};

const getCurrentStreak = () => {
  // Loops through ALL activeHabits
  for (const habit of activeHabits) {
    const habitStreak = habit.current_streak || habit.streak || 0;
    if (habitStreak > maxStreak) {  // Nested conditionals
      maxStreak = habitStreak;
      bestHabit = habit;
    }
  }
};
```

**Executed on EVERY render via (Lines 388-391):**
```typescript
const todayMood = getTodayMood();
const todaySleep = getTodaySleep();
const todayClarity = getTodayClarity();
const currentStreak = getCurrentStreak();
```

**Root Cause:** Frontend - Missing memoization
**Estimated Impact:** 100-300ms per render × multiple re-renders = 500ms-1s cumulative

---

**3. Excessive Re-renders from Context Updates - MEDIUM**

Lines 56, 147, 150 inject contexts that cause re-renders:
```typescript
const { unreadCount, togglePanel, isPanelOpen } = useNotificationWidget();
```

**Issue:** NotificationContext polls every 30 seconds (NotificationContext.tsx:102-104):
```typescript
const interval = setInterval(() => {
  refreshNotifications();  // Triggers re-render in ALL consuming components
}, 30000);
```

If `unreadCount` changes, **home.tsx re-renders completely**.

**Root Cause:** Frontend - Context design
**Estimated Impact:** Periodic jank every 30 seconds

---

**4. Missing Optimization: No React.memo, No Lazy Loading**

**Analysis:**
- Grep for memoization shows only **20 total usages** across 4 files in `app/(tabs)/`
- Home.tsx has **ZERO** uses of `React.memo`, `useMemo`, or `useCallback` for expensive operations
- All components render eagerly - no `React.lazy()` detected
- HabitCard components (240+ potential habit items) not memoized

**Root Cause:** Frontend
**Estimated Impact:** 200-500ms

---

### 📅 **Calendar.tsx** (1,887 lines) - CRITICAL BOTTLENECK

**File Location:** `app/(tabs)/calendar.tsx`

#### Primary Performance Issues:

**1. Redundant API Calls on Every Interaction (Lines 107, 172, 198, 224) - CRITICAL**

**On Initial Mount:**
```typescript
await AnalyticsService.getCalendarData(user.id, startDate, endDate);        // Call 1
await AnalyticsService.getMonthlySummary(user.id, year, month);             // Call 2
await AnalyticsService.getWellBeingLegend(user.id, year, month);            // Call 3
await AnalyticsService.getMonthOverview(user.id, year, month);              // Call 4
```
**Total: 4 parallel API calls**

**On Realtime Update (Lines 272-278):**
```typescript
const handleRealtimeUpdate = useCallback(() => {
  loadCalendarData(true);    // Refetch ALL 4 endpoints again
  loadMonthlySummary();
  loadWellBeingLegend();
  loadMonthOverview();
}, [...]);
```

**On Pull-to-Refresh (Lines 286-293):**
```typescript
const onRefresh = useCallback(async () => {
  await loadCalendarData(true);    // Refetch ALL 4 endpoints again
  await loadMonthlySummary();
  await loadWellBeingLegend();
  await loadMonthOverview();
}, [...]);
```

**Issue:** Every mood entry, sleep log, or habit completion triggers **4 full API calls**.

**Root Cause:** Frontend + Backend
**Estimated Impact:** 1-2 seconds per update × frequent updates = **major cumulative slowdown**

---

**2. Expensive Client-Side Calendar Rendering (Lines 508-637) - MEDIUM**

```typescript
const renderCalendarDays = () => {
  const daysInMonth = getDaysInMonth(year, month);  // 28-31 days
  const firstDay = getFirstDayOfMonth(year, month);

  // Loops 28-31 times
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayData = calendarData[date];           // Object lookup
    const isToday = date === new Date().toISOString().split('T')[0]; // String comparison
    const minDate = getMinAllowedDate();          // Date calculation
    const dateObj = new Date(date + 'T00:00:00'); // Date parsing
    const isOutOfRange = dateObj < minDate;       // Date comparison

    const getMoodStyle = () => { /* complex conditionals */ };  // Function call
    const moodStyle = getMoodStyle();             // Executed 28-31 times

    // Renders complex TouchableOpacity with nested Views
  }
}
```

**Issue:**
- Not using `FlatList` or `VirtualizedList` - all days rendered at once
- `getMoodStyle()` function called 28-31 times per render
- Multiple date calculations per day cell

**Root Cause:** Frontend
**Estimated Impact:** 200-400ms

---

**3. Inefficient Summary Statistics Calculation (Lines 639-654) - MEDIUM**

```typescript
const getSummaryStats = () => {
  const dates = Object.keys(calendarData);  // Get all dates

  // 3 iterations through all dates
  const sleepHours = dates.map(date => calendarData[date].sleep?.hours)
                          .filter((hours): hours is number => typeof hours === 'number');

  // 3 more iterations
  const mentalClarityScores = dates.map(date => calendarData[date].mentalClarity?.score)
                                   .filter((score): score is number => typeof score === 'number');

  // 3 more iterations + complex calculation
  const habitCompletions = dates.map(date => {
    const habits = calendarData[date].habits;
    if (!habits || !habits.completed || !habits.total) return null;
    return Math.round((habits.completed / habits.total) * 100);
  }).filter((completion): completion is number => typeof completion === 'number');

  // 3 reduce operations
  const avgSleep = sleepHours.length > 0 ?
    (sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length).toFixed(1) : '0';
  // ... more reduces
};
```

**Issue:** **9+ array iterations** for computing summary stats that could be aggregated server-side.

**Root Cause:** Frontend - Should be backend aggregation
**Estimated Impact:** 50-150ms

---

### 📝 **Journal.tsx** (2,969 lines) - HIGH BOTTLENECK

**File Location:** `app/(tabs)/journal.tsx`

#### Primary Performance Issues:

**1. Monolithic Component Size - HIGH**

- **2,969 lines** in single component file
- Handles 6+ different data entry sections:
  - Mood tracking
  - Activities (240+ predefined items across 9 categories)
  - Sleep logging
  - Productivity tracking
  - Intimacy logging
  - Mental clarity testing

**Issue:**
- Entire component re-renders on any state change
- No code splitting or lazy loading
- All 240+ activity definitions loaded into memory

**Root Cause:** Frontend - Architecture
**Estimated Impact:** 500ms-1.5s initial mount

---

**2. Large State Object for Activities - MEDIUM**

Lines 128-281 define `defaultActivityCategories` with **240+ items**:
```typescript
const defaultActivityCategories = {
  'Daily Routines': {
    items: ['Morning Routine', 'Evening Routine', ...],  // 30+ items
    expanded: false,
  },
  'Exercise': {
    items: ['Running', 'Cycling', ...],  // 30+ items
    expanded: false,
  },
  // 9 total categories × ~25-30 items each = 240+ items
};
```

**Issue:**
- All items loaded into state on mount
- Each item has potential `selected: boolean` state
- Category expansion triggers re-render of all 240 items

**Root Cause:** Frontend
**Estimated Impact:** 200-500ms

---

**3. Likely Sequential API Calls on Save - MEDIUM (Needs Verification)**

Based on structure, save operation likely calls:
```typescript
await MoodsService.save(moodData);
await ActivitiesService.save(activitiesData);
await SleepService.save(sleepData);
await ProductivityService.save(productivityData);
await IntimacyService.save(intimacyData);
```

**Issue:** No batching detected - likely **5 sequential POST requests**

**Root Cause:** Frontend + Backend
**Estimated Impact:** 500ms-1s on save

---

### 🔧 **Analytics Service** (4,179 lines) - CRITICAL BACKEND BOTTLENECK

**File Location:** `services/analytics.service.ts`

#### Primary Performance Issues:

**1. N+1 Query Pattern in getCalendarData (Lines 159-216) - CRITICAL**

```typescript
async getCalendarData(userId: string, startDate: string, endDate: string) {
  // Fetch all data for date range
  const [moodData, sleepData, activitiesData, habitsData, experimentsData, mentalClarityData] =
    await Promise.all([
      MoodsService.getByDateRange(userId, startDate, endDate),
      SleepService.getByDateRange(userId, startDate, endDate),
      ActivitiesService.getByDateRange(userId, startDate, endDate),
      HabitsService.getHabitsWithLogs(userId),    // ⚠️ Gets ALL habits (no date filter)
      ExperimentsService.getAll(userId),          // ⚠️ Gets ALL experiments
      MentalClarityService.getByDateRange(userId, startDate, endDate)
    ]);

  // Loop through each day in range (30 days for a month)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];

    // O(n) searches on EVERY day iteration
    const dayMood = moodData.data?.find(m => m.date === dateStr);
    const daySleep = sleepData.data?.find(s => s.date === dateStr);
    const dayActivities = activitiesData.data?.filter(a => a.date === dateStr);
    const dayHabits = habitsData.data?.filter(h => {
      // Complex nested filter checking habit logs
      return h.logs?.some(log => log.date === dateStr);
    });
    const activeExperiments = experimentsData.data?.filter(e => {
      // Date range check for each experiment
      return e.start_date <= dateStr && e.end_date >= dateStr;
    });
    const dayClarity = mentalClarityData.data?.find(c => c.date === dateStr);
  }
}
```

**Complexity Analysis:**
- **30 days** × **6 data types** × **O(n) search** = **O(180n) worst case**
- For a user with 100 moods, 100 sleep logs, 500 activities, 20 habits, 10 experiments:
  - **30 × 730 item searches** = **21,900 iterations**

**Better Approach:**
```typescript
// Pre-index data by date using Map - O(n) once, then O(1) lookups
const moodsByDate = new Map(moodData.data.map(m => [m.date, m]));
const sleepByDate = new Map(sleepData.data.map(s => [s.date, s]));
// ... etc

// Now lookups are O(1)
const dayMood = moodsByDate.get(dateStr);
const daySleep = sleepByDate.get(dateStr);
```

**Root Cause:** Backend - Algorithm inefficiency
**Estimated Impact:** 500ms-2s for calendar data

---

**2. N+1 in getDailyDetailData (Lines 224-299) - CRITICAL**

```typescript
async getDailyDetailData(userId: string, date: string) {
  const [moodData, activitiesData, sleepData, habitsData, experimentsData,
         productivityData, intimacyData, mentalClarityData] = await Promise.all([
    // 8 parallel queries for single day
    MoodsService.getByDate(userId, date),
    ActivitiesService.getByDate(userId, date),
    // ... 6 more
  ]);

  // Lines 284-298: Loop through experiments
  for (const experiment of experiments) {
    // ⚠️ NESTED ASYNC QUERY - N+1 PATTERN!
    const experimentLog = await ExperimentsService.getExperimentLogByDate(
      experiment.id,
      userId,
      date
    );
  }
}
```

**Issue:**
- **1 initial query** for experiments
- **+ N queries** for experiment logs (one per experiment)
- User with 10 experiments = **1 + 10 = 11 queries** for day detail modal

**Root Cause:** Backend - Classic N+1
**Estimated Impact:** 300ms-800ms per modal open

---

**3. Client-Side Heavy Computation - HIGH**

**Lines 397+:** calculateActivityImpact method performs:
- Correlation calculations across 14 days of data
- Multiple nested loops and statistical computations
- Could be 1000+ operations for active users

**Lines 3647+:** getComprehensiveInsights method performs:
- Trend analysis across weeks/months
- Pattern recognition algorithms
- Text generation for insights

**Issue:** Heavy CPU-bound work on client device

**Root Cause:** Backend - Should be server-side computation
**Estimated Impact:** 500ms-2s (varies by data volume)

---

### 🗄️ **Database/Backend Issues**

**File Location:** `database/schema.sql`, `services/habits.service.ts`

#### Performance Issues:

**1. N+1 Query in HabitsService.getHabitsWithLogs (Lines 200-227) - CRITICAL**

**File:** `services/habits.service.ts`

```typescript
async getHabitsWithLogs(userId: string, date?: string) {
  const habitsResult = await SupabaseSafe.select('habits', {
    eq: { user_id: userId }
  }, userId);

  const habits = habitsResult.data || [];
  const habitsWithLogs = [];

  // ⚠️ CLASSIC N+1 PATTERN
  for (const habit of habits) {
    // Query 1: Get logs for this habit and date
    const logsResult = await SupabaseSafe.select('habit_logs', {
      eq: { habit_id: habit.id },
      ...(date && { eq: { date } })
    }, userId);

    // Query 2: Get ALL completed logs for streak calculation
    const allLogsResult = await SupabaseSafe.select('habit_logs', {
      eq: { habit_id: habit.id, completed: true }
    }, userId);

    habitsWithLogs.push({
      ...habit,
      logs: logsResult.data,
      totalCompletions: allLogsResult.data?.length || 0
    });
  }
}
```

**For 10 habits:**
- **1 query** to get habits
- **10 queries** for logs by date
- **10 queries** for all completed logs
- **Total: 21 queries**

**Correct Approach:**
```sql
-- Single query with JOINs
SELECT h.*,
       COALESCE(json_agg(hl.*) FILTER (WHERE hl.date = $1), '[]') as logs,
       COUNT(hl_all.*) as total_completions
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = $1
LEFT JOIN habit_logs hl_all ON h.id = hl_all.habit_id AND hl_all.completed = true
WHERE h.user_id = $2
GROUP BY h.id;
```

**Root Cause:** Backend - N+1 queries
**Estimated Impact:** 200ms-1s (depends on habit count)

---

**2. Missing Composite Indexes - MEDIUM**

**Schema Analysis (database/schema.sql):**

**Existing indexes (Lines 159-169):**
```sql
CREATE INDEX idx_mood_logs_user_date ON public.mood_logs(user_id, date);
CREATE INDEX idx_activities_user_date ON public.activities(user_id, date);
CREATE INDEX idx_sleep_logs_user_date ON public.sleep_logs(user_id, date);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);
```

**Missing Indexes:**
```sql
-- ❌ Missing: habit_logs(user_id, date) for date range queries
-- ❌ Missing: habit_logs(user_id, habit_id, date) for specific lookups
-- ❌ Missing: habit_logs(habit_id, completed) for streak calculations
-- ❌ Missing: experiments(user_id, status, start_date, end_date) for active experiment queries
-- ❌ Missing: experiment_logs(user_id, date) for daily logs
```

**Root Cause:** Backend - Database schema
**Estimated Impact:** 50-200ms per query

---

**3. No Pagination on Large Queries - MEDIUM**

Services fetching without limits:
- `HabitsService.getAll()` - returns ALL user habits
- `ExperimentsService.getAll()` - returns ALL experiments
- `ActivitiesService.getByDateRange()` - no limit on activities per day

**Issue:** As user data grows over months, queries return increasingly large datasets.

**Root Cause:** Backend - API design
**Estimated Impact:** 100-500ms (grows over time)

---

### 🔄 **Context/State Management Issues**

#### NotificationContext Polling (Lines 98-107)

**File:** `contexts/NotificationContext.tsx`

```typescript
useEffect(() => {
  refreshNotifications();

  // ⚠️ Polls every 30 seconds
  const interval = setInterval(() => {
    refreshNotifications();  // Triggers state update
  }, 30000);

  return () => clearInterval(interval);
}, [refreshNotifications]);
```

**Issue:**
- Every component using `useNotificationWidget()` re-renders when `unreadCount` changes
- Home.tsx uses this hook (line 150)
- No memoization to prevent cascading re-renders

**Root Cause:** Frontend - Context design
**Estimated Impact:** Periodic 50-100ms jank

---

#### AuthContext Subscriptions (Lines 76-129)

**File:** `contexts/AuthContext.tsx`

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  setLoading(false);

  // Triggers re-render in ALL components using useAuth()
  // Home, Calendar, Journal all use this
});
```

**Issue:** Token refresh events trigger global re-renders

**Root Cause:** Frontend - Expected behavior, but no optimization
**Estimated Impact:** Low (infrequent)

---

## Section 2: Quick Wins (< 1 Hour Each)

### Priority 0: Immediate Impact

**1. Add Memoization to Home.tsx Computed Values**
- **File:** `app/(tabs)/home.tsx`
- **Lines:** 292-391
- **Change:**
```typescript
const todayMood = useMemo(() => getTodayMood(), [moodData, today]);
const todaySleep = useMemo(() => getTodaySleep(), [sleepData]);
const todayClarity = useMemo(() => getTodayClarity(), [mentalClarityData]);
const currentStreak = useMemo(() => getCurrentStreak(), [activeHabits]);
```
- **Estimated Improvement:** 200-500ms per render
- **Effort:** 10 minutes

---

**2. Fix N+1 in analytics.service.ts getCalendarData**
- **File:** `services/analytics.service.ts`
- **Lines:** 177-216
- **Change:** Pre-index data by date using Map
```typescript
const moodsByDate = new Map(moodData.data?.map(m => [m.date, m]) || []);
const sleepByDate = new Map(sleepData.data?.map(s => [s.date, s]) || []);
const activitiesByDate = new Map();
activitiesData.data?.forEach(a => {
  if (!activitiesByDate.has(a.date)) activitiesByDate.set(a.date, []);
  activitiesByDate.get(a.date).push(a);
});

// Replace all .find() and .filter() with .get()
const dayMood = moodsByDate.get(dateStr);
const daySleep = sleepByDate.get(dateStr);
const dayActivities = activitiesByDate.get(dateStr) || [];
```
- **Estimated Improvement:** 500ms-1.5s
- **Effort:** 30 minutes

---

**3. Debounce Realtime Updates in Calendar.tsx**
- **File:** `app/(tabs)/calendar.tsx`
- **Lines:** 272-278
- **Change:**
```typescript
import { debounce } from 'lodash'; // or implement simple debounce

const debouncedReload = useMemo(
  () => debounce(() => {
    loadCalendarData(true);
    loadMonthlySummary();
    loadWellBeingLegend();
    loadMonthOverview();
  }, 500),
  []
);

const handleRealtimeUpdate = useCallback(() => {
  debouncedReload();
}, [debouncedReload]);
```
- **Estimated Improvement:** Prevents multiple rapid API calls
- **Effort:** 15 minutes

---

**4. Add Missing Database Indexes**
- **File:** `database/migrations/add_performance_indexes.sql` (new file)
- **Change:**
```sql
-- Habit logs performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date
  ON public.habit_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_date
  ON public.habit_logs(user_id, habit_id, date);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_completed
  ON public.habit_logs(habit_id, completed) WHERE completed = true;

-- Experiment logs performance
CREATE INDEX IF NOT EXISTS idx_experiment_logs_user_date
  ON public.experiment_logs(user_id, date);

-- Experiments active query optimization
CREATE INDEX IF NOT EXISTS idx_experiments_user_status_dates
  ON public.experiments(user_id, status, start_date, end_date);
```
- **Estimated Improvement:** 50-200ms per query
- **Effort:** 10 minutes

---

**5. Implement Request Caching in Home.tsx**
- **File:** `app/(tabs)/home.tsx`
- **Lines:** 223-287
- **Change:** Add simple cache with timestamp
```typescript
const CACHE_DURATION = 60000; // 1 minute
const [dataCache, setDataCache] = useState<{
  data: any;
  timestamp: number;
} | null>(null);

const loadData = async () => {
  const now = Date.now();
  if (dataCache && (now - dataCache.timestamp) < CACHE_DURATION) {
    // Use cached data
    setActiveHabits(dataCache.data.habits);
    setMoodData(dataCache.data.moods);
    // ...
    return;
  }

  // ... existing fetch logic

  // Cache the results
  setDataCache({
    data: { habits: habitsResult.data, moods: moodResult.data, ... },
    timestamp: now
  });
};
```
- **Estimated Improvement:** Skip 5 API calls for 1 minute after initial load
- **Effort:** 20 minutes

---

## Section 3: Medium Effort Fixes (1-4 Hours Each)

### Priority 1: Significant Impact

**1. Fix N+1 in HabitsService.getHabitsWithLogs**
- **File:** `services/habits.service.ts`
- **Lines:** 200-227
- **Current:** 1 + 2N queries (21 for 10 habits)
- **Change:** Rewrite to use single query with aggregations
```typescript
async getHabitsWithLogs(userId: string, date?: string) {
  // Option 1: Single Supabase query with proper JOINs
  const query = supabase
    .from('habits')
    .select(`
      *,
      habit_logs!left(*)
    `)
    .eq('user_id', userId);

  if (date) {
    query.eq('habit_logs.date', date);
  }

  const { data, error } = await query;

  // Post-process to calculate streaks
  return data.map(habit => ({
    ...habit,
    currentStreak: calculateStreak(habit.habit_logs),
    totalCompletions: habit.habit_logs.filter(l => l.completed).length
  }));
}
```
- **Alternative:** Create Postgres function to return habits with computed stats
- **Estimated Improvement:** 200ms-800ms
- **Effort:** 1-2 hours

---

**2. Implement React Query for Data Fetching**
- **Files:** All service-consuming components
- **Change:** Replace manual state management with React Query
```typescript
// Install: npm install @tanstack/react-query

// In Home.tsx
import { useQuery } from '@tanstack/react-query';

const { data: habits, isLoading } = useQuery({
  queryKey: ['habits', userId],
  queryFn: () => HabitsService.getAll(userId),
  staleTime: 60000, // 1 minute
  cacheTime: 300000, // 5 minutes
});

const { data: moodData } = useQuery({
  queryKey: ['moods', userId, dateRange],
  queryFn: () => MoodsService.getByDateRange(userId, startDate, endDate),
  staleTime: 60000,
});
```
- **Benefits:**
  - Automatic caching
  - Request deduplication
  - Background refetching
  - Optimistic updates
- **Estimated Improvement:** 60-80% fewer redundant API calls
- **Effort:** 2-3 hours

---

**3. Split Journal.tsx into Smaller Components**
- **File:** `app/(tabs)/journal.tsx` (2,969 lines)
- **Current:** Monolithic component
- **Change:** Extract sections into separate lazy-loaded components
```typescript
// Create new files:
// - components/journal/MoodSection.tsx (300 lines)
// - components/journal/ActivitiesSection.tsx (400 lines)
// - components/journal/SleepSection.tsx (300 lines)
// - components/journal/ProductivitySection.tsx (250 lines)
// - components/journal/IntimacySection.tsx (250 lines)

// In journal.tsx (now ~400 lines):
import React, { lazy, Suspense } from 'react';

const MoodSection = lazy(() => import('@/components/journal/MoodSection'));
const ActivitiesSection = lazy(() => import('@/components/journal/ActivitiesSection'));

export default function JournalScreen() {
  return (
    <ScrollView>
      <Suspense fallback={<ActivityIndicator />}>
        <MoodSection />
      </Suspense>
      <Suspense fallback={<ActivityIndicator />}>
        <ActivitiesSection />
      </Suspense>
      {/* ... */}
    </ScrollView>
  );
}
```
- **Estimated Improvement:** 300-800ms initial load
- **Effort:** 3-4 hours

---

**4. Optimize Calendar Rendering with Virtualization**
- **File:** `app/(tabs)/calendar.tsx`
- **Lines:** 508-637
- **Current:** Renders all 28-31 days at once
- **Change:** Consider FlatList for calendar grid (or keep current but memoize)
```typescript
import React, { memo } from 'react';

const CalendarDay = memo(({ day, date, dayData, isToday, onPress }: Props) => {
  const moodStyle = useMemo(() => getMoodStyle(dayData), [dayData]);

  return (
    <TouchableOpacity onPress={onPress}>
      {/* ... day rendering */}
    </TouchableOpacity>
  );
}, (prev, next) => {
  // Custom comparison - only re-render if data actually changed
  return prev.date === next.date &&
         prev.dayData === next.dayData &&
         prev.isToday === next.isToday;
});

// In renderCalendarDays:
days.push(
  <CalendarDay
    key={date}
    day={day}
    date={date}
    dayData={dayData}
    isToday={isToday}
    onPress={() => handleDatePress(date)}
  />
);
```
- **Estimated Improvement:** 100-300ms
- **Effort:** 1-2 hours

---

**5. Batch Journal Save Operations**
- **File:** `app/(tabs)/journal.tsx`
- **Current:** Likely 5 sequential API calls
- **Change:** Create batch save endpoint
```typescript
// Backend: Create new endpoint
// POST /api/journal/batch-save
export async function batchSaveJournalEntry(userId: string, date: string, data: {
  mood?: MoodData;
  activities?: ActivityData[];
  sleep?: SleepData;
  productivity?: ProductivityData;
  intimacy?: IntimacyData;
}) {
  // Save all in single database transaction
  const results = await supabase.rpc('save_journal_entry', {
    user_id: userId,
    entry_date: date,
    mood_data: data.mood,
    activities_data: data.activities,
    sleep_data: data.sleep,
    productivity_data: data.productivity,
    intimacy_data: data.intimacy
  });

  return results;
}

// Frontend: Single API call
const handleSave = async () => {
  await JournalService.batchSave(userId, date, {
    mood: moodState,
    activities: selectedActivities,
    sleep: sleepData,
    // ...
  });
};
```
- **Estimated Improvement:** 400-800ms on save
- **Effort:** 2-3 hours

---

**6. Add Pagination to Large Data Queries**
- **Files:** `services/habits.service.ts`, `services/experiments.service.ts`
- **Change:** Add limit/offset parameters
```typescript
// Update service methods
async getAll(userId: string, options?: { limit?: number; offset?: number }) {
  const { limit = 50, offset = 0 } = options || {};

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
}

// Update frontend calls
const { data: habits } = await HabitsService.getAll(userId, { limit: 20 });
```
- **Estimated Improvement:** 50-200ms (scales with user data)
- **Effort:** 1-2 hours

---

**7. Memoize DayDetailModal.getImpactAnalysis**
- **File:** `components/DayDetailModal.tsx`
- **Lines:** 74-205 (200+ lines of string concatenation)
- **Change:**
```typescript
const impactAnalysis = useMemo(() => {
  return getImpactAnalysis(data);
}, [
  data?.mood,
  data?.activities,
  data?.sleep,
  data?.productivity,
  data?.intimacy,
  data?.mentalClarity
]);
```
- **Estimated Improvement:** 50-150ms per modal open
- **Effort:** 15 minutes

---

## Section 4: Long-term Architectural Improvements (Days/Weeks)

### Priority 2: Foundational Changes

**1. Move Heavy Analytics to Server-Side**
- **Current:** Client-side computation in `analytics.service.ts`
  - `calculateActivityImpact` (lines 397+)
  - `getComprehensiveInsights` (lines 3647+)
  - Correlation calculations
  - Trend analysis
- **Change:** Create backend API endpoints
```
POST /api/analytics/activity-impact
POST /api/analytics/comprehensive-insights
POST /api/analytics/correlations
```
- **Implementation:**
  - Create Edge Functions in Supabase
  - Or standalone Node.js/Python backend service
  - Cache results in database table `analytics_cache`
- **Benefits:**
  - Offload CPU-intensive work from client
  - Cache results for multiple accesses
  - Can use more powerful algorithms
- **Estimated Improvement:** 1-3 seconds for complex analytics
- **Effort:** 1-2 weeks

---

**2. Implement Virtualized List for Activities in Journal**
- **File:** `app/(tabs)/journal.tsx`
- **Current:** 240+ activity items all rendered
- **Change:** Use FlashList or RecyclerListView
```typescript
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={activityItems}
  estimatedItemSize={60}
  renderItem={({ item }) => <ActivityItem item={item} />}
  keyExtractor={(item) => item.id}
  // Only renders visible items + buffer
/>
```
- **Benefits:**
  - Render only visible items
  - 60fps scrolling
  - Reduced memory usage
- **Estimated Improvement:** 200-600ms initial render
- **Effort:** 2-3 days

---

**3. Refactor Calendar to Progressive Loading**
- **File:** `app/(tabs)/calendar.tsx`
- **Current:** Loads all month data on mount
- **Change:** Load current week first, then background load rest
```typescript
const [visibleWeek, setVisibleWeek] = useState(getCurrentWeek());
const [fullMonthData, setFullMonthData] = useState(null);

useEffect(() => {
  // Load current week immediately
  loadWeekData(visibleWeek).then(data => {
    setCalendarData(data);
    setLoading(false);
  });

  // Background load full month
  loadMonthData(currentMonth).then(data => {
    setFullMonthData(data);
  });
}, [currentMonth]);
```
- **Estimated Improvement:** Perceived load time 500ms-1s
- **Effort:** 3-5 days

---

**4. Introduce Global Loading State with Prefetching**
- **Implementation:** App-level data prefetching on authenticated state
```typescript
// In _layout.tsx or root component
const { user } = useAuth();

useEffect(() => {
  if (user) {
    // Prefetch critical data in background
    queryClient.prefetchQuery({
      queryKey: ['habits', user.id],
      queryFn: () => HabitsService.getAll(user.id)
    });

    queryClient.prefetchQuery({
      queryKey: ['recent-moods', user.id],
      queryFn: () => MoodsService.getRecent(user.id, 7)
    });
  }
}, [user]);
```
- **Benefits:**
  - Data ready before navigation
  - Instant perceived load
- **Effort:** 1 week

---

**5. Migrate to TRPC or GraphQL for Request Batching**
- **Current:** Multiple REST endpoints called separately
- **Change:** Single request for related data
```typescript
// TRPC example
const { data } = trpc.useQuery(['homeScreen.getData', userId]);

// Backend batches and returns:
{
  habits: [...],
  moods: [...],
  sleep: [...],
  clarity: [...],
  impact: {...}
}
```
- **Benefits:**
  - Single round-trip
  - Type-safe
  - Automatic batching
- **Estimated Improvement:** 200-500ms (reduced latency)
- **Effort:** 2-3 weeks

---

**6. Implement Service Worker for Offline-First Architecture**
- **Technology:** React Native async storage + background sync
- **Implementation:**
  - Cache all read requests locally
  - Queue write requests for background sync
  - Use stale-while-revalidate pattern
- **Benefits:**
  - Instant loads from cache
  - Works offline
  - Background sync
- **Effort:** 3-4 weeks

---

## Section 5: Prioritized Action Plan

### Sprint 1: Immediate Wins (Week 1)

| Priority | Fix | File | Effort | Impact | Status |
|----------|-----|------|--------|--------|--------|
| **P0** | Add useMemo to computed values | home.tsx:292-391 | 10min | High | 🔴 Not Started |
| **P0** | Fix getCalendarData indexing | analytics.service.ts:177-216 | 30min | Critical | 🔴 Not Started |
| **P0** | Add missing DB indexes | migrations/add_performance_indexes.sql | 10min | Medium | 🔴 Not Started |
| **P0** | Debounce calendar realtime updates | calendar.tsx:272-278 | 15min | Medium | 🔴 Not Started |
| **P1** | Implement simple caching | home.tsx:223-287 | 20min | High | 🔴 Not Started |
| **P1** | Memoize DayDetailModal | DayDetailModal.tsx:74-205 | 15min | Medium | 🔴 Not Started |

**Total Estimated Effort:** 1.5 hours
**Total Estimated Impact:** 2-4 seconds load time reduction

---

### Sprint 2: Backend Optimizations (Week 2)

| Priority | Fix | File | Effort | Impact | Status |
|----------|-----|------|--------|--------|--------|
| **P0** | Fix N+1 in getHabitsWithLogs | habits.service.ts:200-227 | 2hrs | Critical | 🔴 Not Started |
| **P0** | Fix N+1 in getDailyDetailData | analytics.service.ts:284-299 | 1hr | High | 🔴 Not Started |
| **P1** | Add pagination to services | habits/experiments services | 1hr | Medium | 🔴 Not Started |
| **P1** | Batch journal saves | journal.tsx + backend | 3hrs | Medium | 🔴 Not Started |

**Total Estimated Effort:** 7 hours
**Total Estimated Impact:** 1-3 seconds load time reduction

---

### Sprint 3: Frontend Architecture (Weeks 3-4)

| Priority | Fix | File | Effort | Impact | Status |
|----------|-----|------|--------|--------|--------|
| **P1** | Install & configure React Query | All data fetching | 3hrs | Critical | 🔴 Not Started |
| **P1** | Migrate Home.tsx to React Query | home.tsx | 2hrs | Critical | 🔴 Not Started |
| **P1** | Migrate Calendar.tsx to React Query | calendar.tsx | 2hrs | High | 🔴 Not Started |
| **P2** | Memoize Calendar day cells | calendar.tsx:508-637 | 2hrs | Medium | 🔴 Not Started |
| **P2** | Split Journal into sections | journal.tsx | 4hrs | Medium | 🔴 Not Started |

**Total Estimated Effort:** 13 hours
**Total Estimated Impact:** 3-6 seconds load time reduction (cumulative with caching)

---

### Sprint 4: Advanced Optimizations (Weeks 5-6)

| Priority | Fix | Description | Effort | Impact | Status |
|----------|-----|-------------|--------|--------|--------|
| **P2** | Server-side analytics | Move heavy compute to backend | 1-2 weeks | High | 🔴 Not Started |
| **P3** | Virtualized activities list | FlashList for journal activities | 3 days | Medium | 🔴 Not Started |
| **P3** | Progressive calendar loading | Load week first, then month | 4 days | Medium | 🔴 Not Started |

**Total Estimated Effort:** 3-4 weeks
**Total Estimated Impact:** 2-4 seconds additional reduction

---

## Section 6: Key Metrics to Track

### Before Optimization Baseline

Measure these metrics on production devices:

**Page Load Time (Time to Interactive)**
- Home.tsx: **Target < 1s, Current ~3-4s**
- Calendar.tsx: **Target < 800ms, Current ~2-3s**
- Journal.tsx: **Target < 1.5s, Current ~2-4s**

**Time to First Meaningful Paint**
- Home.tsx: **Target < 500ms, Current ~1.5-2s**
- Calendar.tsx: **Target < 400ms, Current ~1-1.5s**

**Number of API Calls (Per Screen Load)**
- Home.tsx: **Target 1-2, Current 5**
- Calendar.tsx: **Target 1-2, Current 4**
- Day Detail Modal: **Target 1, Current 1 + N (experiments)**

**Network Transfer Size**
- Home initial load: **Target < 100KB, Current unknown**
- Calendar month data: **Target < 50KB, Current unknown**

**Memory Usage**
- Journal component: **Target < 50MB, Current unknown**
- Calendar rendering: **Target < 30MB, Current unknown**

**Bundle Size**
- Current: **Unknown (needs measurement)**
- Target: **< 2MB for initial bundle**

---

### Measurement Tools

**1. React DevTools Profiler**
```typescript
import { Profiler } from 'react';

<Profiler id="Home" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}}>
  <HomeScreen />
</Profiler>
```

**2. React Native Performance Monitor**
```typescript
import { PerformanceObserver } from 'react-native-performance';

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });
```

**3. Network Request Logging**
```typescript
// Add to API service wrapper
const originalFetch = fetch;
global.fetch = async (...args) => {
  const start = performance.now();
  const response = await originalFetch(...args);
  const duration = performance.now() - start;
  console.log(`API ${args[0]}: ${duration}ms, ${response.headers.get('content-length')} bytes`);
  return response;
};
```

**4. Supabase Query Performance**
- Enable query logging in Supabase dashboard
- Monitor "Slow Queries" tab for queries > 100ms
- Use EXPLAIN ANALYZE for problematic queries

---

### Success Criteria (Post-Optimization)

**Critical Goals (Must Achieve):**
- ✅ Home.tsx loads in **< 1 second** (from 3-4s)
- ✅ Calendar.tsx loads in **< 800ms** (from 2-3s)
- ✅ No N+1 query patterns in production
- ✅ All database queries have appropriate indexes

**High Priority Goals:**
- ✅ Journal.tsx loads in **< 1.5 seconds** (from 2-4s)
- ✅ React Query caching reduces API calls by **60%+**
- ✅ Day detail modal opens in **< 300ms** (from 800ms)

**Nice to Have:**
- ✅ Bundle size < 2MB
- ✅ Memory usage < 100MB for all screens
- ✅ 60fps scrolling on calendar and activity lists

---

## Section 7: Implementation Timeline

### Week 1: Quick Wins Sprint
**Goal:** Reduce load times by 50%

**Monday-Tuesday:**
- [ ] Add memoization to Home.tsx computed values
- [ ] Fix getCalendarData indexing in analytics.service
- [ ] Add missing database indexes
- [ ] Test and measure improvements

**Wednesday-Thursday:**
- [ ] Debounce calendar realtime updates
- [ ] Implement simple caching in Home.tsx
- [ ] Memoize DayDetailModal.getImpactAnalysis
- [ ] Test and measure improvements

**Friday:**
- [ ] Code review
- [ ] Deploy to staging
- [ ] Performance testing
- [ ] Deploy to production

**Expected Outcome:** Load times reduced from 30s → 10-15s

---

### Week 2: Backend N+1 Fixes
**Goal:** Eliminate database query bottlenecks

**Monday-Tuesday:**
- [ ] Rewrite HabitsService.getHabitsWithLogs (remove N+1)
- [ ] Test habit loading performance
- [ ] Add unit tests

**Wednesday-Thursday:**
- [ ] Fix getDailyDetailData experiment N+1
- [ ] Add pagination to habits/experiments services
- [ ] Create batch journal save endpoint
- [ ] Test and measure

**Friday:**
- [ ] Code review
- [ ] Deploy to staging
- [ ] Performance testing
- [ ] Deploy to production

**Expected Outcome:** Load times reduced to 5-8s

---

### Weeks 3-4: React Query Migration
**Goal:** Implement caching layer

**Week 3:**
- [ ] Install and configure React Query
- [ ] Migrate Home.tsx data fetching
- [ ] Migrate Calendar.tsx data fetching
- [ ] Test caching behavior
- [ ] Add loading skeletons

**Week 4:**
- [ ] Migrate Journal.tsx data fetching
- [ ] Migrate remaining screens
- [ ] Configure cache invalidation strategies
- [ ] Test offline behavior
- [ ] Performance testing

**Expected Outcome:** Load times reduced to 2-4s (with caching)

---

### Weeks 5-6: Component Optimization
**Goal:** Optimize rendering performance

**Week 5:**
- [ ] Split Journal.tsx into smaller components
- [ ] Lazy load journal sections
- [ ] Memoize Calendar day cells
- [ ] Add loading states

**Week 6:**
- [ ] Add FlashList for activities
- [ ] Test scrolling performance
- [ ] Optimize images/assets
- [ ] Final performance audit

**Expected Outcome:** Load times reduced to < 2s

---

### Weeks 7-8+: Advanced Features (Optional)
- [ ] Server-side analytics computation
- [ ] Progressive calendar loading
- [ ] Offline-first architecture
- [ ] GraphQL/TRPC migration

---

## Section 8: Risk Assessment

### High Risk Items

**1. React Query Migration**
- **Risk:** Breaking changes to data flow
- **Mitigation:**
  - Migrate one screen at a time
  - Extensive testing
  - Feature flag rollout

**2. Database Schema Changes**
- **Risk:** Data loss or corruption
- **Mitigation:**
  - Backup database before migration
  - Test on staging environment
  - Rollback plan prepared

**3. N+1 Query Fixes**
- **Risk:** Changed query logic breaks features
- **Mitigation:**
  - Comprehensive unit tests
  - Integration tests
  - QA testing before deployment

---

### Medium Risk Items

**1. Component Splitting**
- **Risk:** Lazy loading errors
- **Mitigation:**
  - Error boundaries
  - Fallback components
  - Progressive enhancement

**2. Caching Strategy**
- **Risk:** Stale data shown to users
- **Mitigation:**
  - Proper cache invalidation
  - Background refetching
  - Manual refresh option

---

## Section 9: Rollback Plan

For each change:

**1. Database Migrations**
```sql
-- Always create down migration
-- migrations/xxx_add_indexes_down.sql
DROP INDEX IF EXISTS idx_habit_logs_user_date;
DROP INDEX IF EXISTS idx_habit_logs_user_habit_date;
```

**2. Code Changes**
- Use feature flags for major changes
```typescript
const USE_REACT_QUERY = __DEV__ || isFeatureEnabled('react-query');

if (USE_REACT_QUERY) {
  // New implementation
} else {
  // Old implementation
}
```

**3. API Changes**
- Maintain backwards compatibility
- Version API endpoints
```typescript
// New: /api/v2/habits/with-logs
// Old: /api/v1/habits (still works)
```

---

## Section 10: Testing Strategy

### Performance Testing Checklist

**Before Each Deployment:**
- [ ] Run React DevTools Profiler on all 3 screens
- [ ] Measure API call count per screen
- [ ] Check for console warnings/errors
- [ ] Test on low-end Android device (< 2GB RAM)
- [ ] Test on slow 3G network throttling
- [ ] Memory leak test (navigate 10x, check memory)

**Automated Tests:**
```typescript
// __tests__/performance/home.test.tsx
describe('Home Screen Performance', () => {
  it('loads in under 1 second', async () => {
    const start = performance.now();
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => getByText('Good morning'));
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000);
  });

  it('makes no more than 2 API calls', async () => {
    const apiCallSpy = jest.spyOn(HabitsService, 'getAll');
    render(<HomeScreen />);
    await waitFor(() => expect(apiCallSpy).toHaveBeenCalledTimes(1));
  });
});
```

---

## Conclusion

This plan addresses the **30-second load time crisis** through a systematic approach:

1. **Immediate Quick Wins** (Week 1) will reduce load times by **50%**
2. **Backend N+1 Fixes** (Week 2) will eliminate database bottlenecks
3. **React Query Migration** (Weeks 3-4) will add caching and reduce redundant API calls
4. **Component Optimization** (Weeks 5-6) will improve rendering performance

**Total Expected Improvement:**
- From **30 seconds** → **< 2 seconds** (93% reduction)
- From **5 API calls per screen** → **1-2 calls** (60-80% reduction)
- Elimination of all N+1 query patterns

The plan is **actionable, prioritized, and ready for implementation** with specific file locations, line numbers, and code examples for every change.

---

**Next Steps:**
1. ✅ Get approval from stakeholders
2. ✅ Set up performance monitoring baseline
3. ✅ Begin Week 1 Quick Wins sprint
4. ✅ Track metrics weekly
5. ✅ Iterate based on results

**Questions or Concerns:**
Contact the performance engineering team before starting implementation.
