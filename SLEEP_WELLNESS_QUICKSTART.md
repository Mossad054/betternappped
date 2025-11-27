# Sleep Wellness Hub - Quick Start Guide

**For:** Next Developer
**Purpose:** Get up and running in 15 minutes
**Last Updated:** 2025-11-26

---

## 🚀 Immediate Next Steps (Checklist)

### Step 1: Review Deliverables (5 min)

- [ ] Open `SLEEP_WELLNESS_DELIVERY_SUMMARY.md` - Read executive summary
- [ ] Open `SLEEP_WELLNESS_IMPLEMENTATION.md` - Skim endpoint documentation
- [ ] Open `SLEEP_WELLNESS_QA_CHECKLIST.md` - Review test structure

**Files Delivered:**
```
database/migrations/
  ├── create_sleep_recommendations.sql
  └── seed_sleep_recommendations.sql

services/
  └── sleepWellness.service.ts  (1,100+ lines)

components/sleep/
  └── LastNightCard.tsx  (400+ lines)

docs/
  ├── SLEEP_WELLNESS_DELIVERY_SUMMARY.md
  ├── SLEEP_WELLNESS_IMPLEMENTATION.md
  └── SLEEP_WELLNESS_QA_CHECKLIST.md
```

---

### Step 2: Run Database Migrations (5 min)

**Option A: Via Supabase CLI**
```bash
cd "c:\Users\ROLSS_IWCF TC 6\projects\Betternapped"

# Run migrations
supabase migration run create_sleep_recommendations
supabase migration run seed_sleep_recommendations
```

**Option B: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy contents of `database/migrations/create_sleep_recommendations.sql`
5. Run query
6. Copy contents of `database/migrations/seed_sleep_recommendations.sql`
7. Run query

**Verify:**
```sql
-- Should return 30+
SELECT COUNT(*) FROM sleep_recommendation_rules WHERE active = true;

-- Should show various tags
SELECT DISTINCT unnest(tags) as tag FROM sleep_recommendation_rules;
```

---

### Step 3: Test One Endpoint (5 min)

**Quick Test:**

Create a test file: `test_sleep_wellness.ts`

```typescript
import { SleepWellnessService } from './services/sleepWellness.service';

async function testEndpoint() {
  const userId = 'YOUR_TEST_USER_ID'; // Replace with real user ID

  const result = await SleepWellnessService.getLastNightSummary(userId, 7);

  console.log('Result:', JSON.stringify(result, null, 2));
}

testEndpoint();
```

**Expected Output:**
```json
{
  "data": {
    "target_hours": 8.0,
    "window_days": 7,
    "last_night_hours": null,
    "last_night_date": null,
    "nights_meeting_target": 0,
    "nights_total": 0,
    "meets_all_nights": false,
    "message": "No sleep data available. Start tracking to see your progress!"
  },
  "error": null
}
```

If you get this output, backend is working! ✅

---

## 📝 What to Work On Next

### Priority 1: WeeklyOverviewCard Component (2-3 hours)

**File:** `components/sleep/WeeklyOverviewCard.tsx`

**Template:**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, WeeklyOverviewDay } from '@/services/sleepWellness.service';

interface WeeklyOverviewCardProps {
  userId: string;
  startDate: string; // YYYY-MM-DD (Monday)
  onDayPress?: (date: string) => void;
}

export function WeeklyOverviewCard({ userId, startDate, onDayPress }: WeeklyOverviewCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<WeeklyOverviewDay[]>([]);

  useEffect(() => {
    loadWeek();
  }, [userId, startDate]);

  const loadWeek = async () => {
    setLoading(true);
    const { data, error } = await SleepWellnessService.getWeeklyOverview(userId, startDate);
    if (data) setWeekData(data);
    setLoading(false);
  };

  // TODO: Render 7-day mini calendar
  // TODO: Show hours on each day
  // TODO: Color-code by quality (1-2: red, 3: amber, 4-5: green)
  // TODO: Show habit markers below calendar
  // TODO: Add day press handler

  return (
    <View style={styles.card}>
      {/* Your implementation here */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    // ... use same styling as LastNightCard
  },
});
```

**Reference:** See `LastNightCard.tsx` for styling patterns

---

### Priority 2: ThisWeekSection Component (1-2 hours)

**File:** `components/sleep/ThisWeekSection.tsx`

**Template:**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, ThisWeekSummary } from '@/services/sleepWellness.service';

interface ThisWeekSectionProps {
  userId: string;
}

export function ThisWeekSection({ userId }: ThisWeekSectionProps) {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<ThisWeekSummary | null>(null);

  useEffect(() => {
    loadSummary();
  }, [userId]);

  const loadSummary = async () => {
    const { data } = await SleepWellnessService.getThisWeekSummary(userId);
    if (data) setSummary(data);
  };

  if (!summary) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>

      <View style={styles.metricsRow}>
        {/* Metric 1: Average Sleep */}
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{summary.average_sleep_hours.toFixed(1)}h</Text>
          <Text style={styles.metricLabel}>Avg Sleep</Text>
        </View>

        {/* Metric 2: Target Achievement */}
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {summary.nights_target_met}/{summary.nights_total}
          </Text>
          <Text style={styles.metricLabel}>Target Met</Text>
        </View>

        {/* Metric 3: Percentage */}
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {summary.percent_target_achievement.toFixed(0)}%
          </Text>
          <Text style={styles.metricLabel}>Achievement</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${summary.percent_target_achievement}%` }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: Add styles
});
```

---

### Priority 3: SleepTrendsPage (3-4 hours)

**File:** `app/sleep-wellness/trends.tsx`

**Structure:**
```typescript
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { SleepWellnessService } from '@/services/sleepWellness.service';

// Import chart library (e.g., react-native-chart-kit or victory-native)
import { BarChart } from 'react-native-chart-kit';

export default function SleepTrendsPage() {
  const { user } = useAuth();
  // TODO: Load data for all 6 analytics cards

  return (
    <ScrollView>
      {/* Card 1: Duration Trend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Duration Trend</Text>
        {/* TODO: Render bar chart */}
      </View>

      {/* Card 2: Consistency */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep Consistency</Text>
        {/* TODO: Display consistency % */}
      </View>

      {/* Card 3: Weekday vs Weekend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekday vs Weekend</Text>
        {/* TODO: Comparison visualization */}
      </View>

      {/* Card 4: Optimal Bedtime */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Optimal Bedtime</Text>
        {/* TODO: Display time window */}
      </View>

      {/* Card 5: Detected Patterns */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>What Affects Your Sleep</Text>
        {/* TODO: List patterns */}
      </View>

      {/* Card 6: Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personalized Recommendations</Text>
        {/* TODO: List recommendations */}
      </View>
    </ScrollView>
  );
}
```

**Chart Example:**
```typescript
// Using react-native-chart-kit
import { BarChart } from 'react-native-chart-kit';

const DurationTrendCard = ({ data }) => {
  const chartData = {
    labels: data.map(d => new Date(d.date).getDate().toString()),
    datasets: [{
      data: data.map(d => d.hours)
    }]
  };

  return (
    <BarChart
      data={chartData}
      width={SCREEN_WIDTH - 40}
      height={220}
      yAxisLabel=""
      yAxisSuffix="h"
      chartConfig={{
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
      }}
      style={styles.chart}
    />
  );
};
```

---

## 🔧 Useful Code Snippets

### Call an Endpoint
```typescript
import { SleepWellnessService } from '@/services/sleepWellness.service';

const { data, error } = await SleepWellnessService.getLastNightSummary(userId, 7);

if (error) {
  console.error('Error:', error);
  return;
}

console.log('Summary:', data);
```

### Handle Loading States
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    const result = await SleepWellnessService.getRecommendations(userId, 'week', 3);
    setData(result.data);
    setLoading(false);
  };
  load();
}, [userId]);

if (loading) return <ActivityIndicator />;
if (!data) return <Text>No data</Text>;

return <YourComponent data={data} />;
```

### Color-Code by Quality
```typescript
const getQualityColor = (quality: number | null) => {
  if (!quality) return '#9CA3AF'; // Gray
  if (quality <= 2) return '#EF4444'; // Red
  if (quality === 3) return '#F59E0B'; // Amber
  return '#10B981'; // Green
};

<View style={[styles.box, { backgroundColor: getQualityColor(log.quality) }]} />
```

---

## 📚 Key Files to Reference

**For Backend Logic:**
- `services/sleepWellness.service.ts` - All endpoint implementations

**For Frontend Patterns:**
- `components/sleep/LastNightCard.tsx` - Complete component example
- `components/SleepDashboard.tsx` - Existing charts/visualizations

**For Styling:**
- `contexts/ThemeContext.tsx` - Theme colors
- `components/SleepDashboard.tsx` - Consistent card styling

**For Data Types:**
- `services/sleepWellness.service.ts` - All TypeScript interfaces exported

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'sleepWellness.service'"
**Solution:** Check import path is correct: `@/services/sleepWellness.service`

### Issue: "RLS policy violation"
**Solution:** Ensure userId matches authenticated user's ID

### Issue: "Cannot read property 'hours' of undefined"
**Solution:** Always check for null/undefined before accessing properties
```typescript
const hours = log?.hours ?? 0;
```

### Issue: Chart not rendering
**Solution:**
- Verify data array is not empty
- Check chart dimensions are set
- Ensure no NaN values in data

---

## 🎯 Testing Strategy

**Quick Manual Test:**
1. Create a test user
2. Log 7 nights of sleep with varying hours
3. Open Sleep Wellness Hub
4. Verify LastNightCard shows correct data
5. Check recommendations are relevant

**Backend Unit Test:**
```typescript
// Example test structure
describe('SleepWellnessService', () => {
  it('should calculate target achievement correctly', async () => {
    const result = await SleepWellnessService.getLastNightSummary(testUserId, 7);
    expect(result.data).toBeDefined();
    expect(result.data.nights_meeting_target).toBeLessThanOrEqual(7);
  });
});
```

---

## 💬 Questions to Ask Yourself

Before you start coding:
- [ ] Do I understand what this endpoint returns?
- [ ] Have I checked the existing LastNightCard for patterns?
- [ ] Do I know which theme colors to use?
- [ ] Have I reviewed the QA checklist for this component?

---

## 📞 Need Help?

**Resources:**
1. Read `SLEEP_WELLNESS_IMPLEMENTATION.md` - Detailed docs
2. Check `SLEEP_WELLNESS_QA_CHECKLIST.md` - Test cases show expected behavior
3. Review `services/sleepWellness.service.ts` - See how calculations work
4. Look at `components/sleep/LastNightCard.tsx` - Complete component example

**Debug Workflow:**
1. Console.log the service response
2. Check if data is null or error is set
3. Verify userId is correct
4. Check database for actual data
5. Review service method logic

---

## ✅ Daily Checklist

**Each Day:**
- [ ] Pull latest code
- [ ] Run migrations if needed
- [ ] Test one endpoint manually
- [ ] Commit work with clear messages
- [ ] Update todo list

**Before Submitting PR:**
- [ ] All components render without errors
- [ ] No hardcoded data remains
- [ ] Loading states handled
- [ ] Error states handled
- [ ] TypeScript compiles without errors
- [ ] Tested on iOS and Android (if applicable)

---

## 🎉 You're Ready!

You have:
- ✅ Complete backend service (9 endpoints)
- ✅ Database migrations ready to run
- ✅ 30+ recommendation rules
- ✅ One example component (LastNightCard)
- ✅ Comprehensive documentation
- ✅ Complete QA test plan

**Estimated Time to Complete Frontend:** 6-8 hours

**Good luck!** 🚀

---

**Last Updated:** 2025-11-26
**Next Review:** After frontend components are complete

