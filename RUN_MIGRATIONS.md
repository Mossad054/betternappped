# Sleep Wellness Hub - Migration Guide

**Date:** 2025-11-26
**Estimated Time:** 5-10 minutes

---

## 📋 Pre-Flight Checklist

- [ ] You have access to Supabase Dashboard
- [ ] You have selected the correct project (Betternapped)
- [ ] You have admin/owner permissions

---

## 🚀 Step-by-Step Migration

### Step 1: Create Tables (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your **Betternapped** project

2. **Navigate to SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"** button

3. **Run First Migration**
   - Copy ALL contents from: `database/migrations/create_sleep_recommendations.sql`
   - Paste into SQL editor
   - Click **"Run"** (or press Ctrl/Cmd + Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check Tables section - you should see:
     - `sleep_recommendation_rules`
     - `user_sleep_recommendations`

✅ **Checkpoint:** Tables created successfully

---

### Step 2: Seed Recommendation Rules (2 minutes)

1. **New Query**
   - Click **"New query"** in SQL Editor

2. **Run Seed Migration**
   - Copy ALL contents from: `database/migrations/seed_sleep_recommendations.sql`
   - Paste into SQL editor
   - Click **"Run"**

3. **Verify Success**
   - Scroll to bottom of results
   - You should see output like:
     ```
     total_rules | active_rules | all_tags
     ------------|--------------|----------
     30+         | 30+          | {duration,quality,consistency,...}
     ```

✅ **Checkpoint:** 30+ recommendation rules inserted

---

### Step 3: Verify Tables & Data (2 minutes)

Run these verification queries one at a time:

**Query 1: Check Tables Exist**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'sleep_%';
```

**Expected Result:**
- sleep_recommendation_rules
- user_sleep_recommendations

---

**Query 2: Count Rules**
```sql
SELECT COUNT(*) as total_rules,
       COUNT(CASE WHEN active = true THEN 1 END) as active_rules
FROM sleep_recommendation_rules;
```

**Expected Result:**
- total_rules: 30+
- active_rules: 30+

---

**Query 3: Sample Rules**
```sql
SELECT rule_name, priority, tags
FROM sleep_recommendation_rules
WHERE active = true
ORDER BY priority DESC
LIMIT 5;
```

**Expected Result:** Should show 5 rules with names like:
- very_low_sleep_duration
- low_duration_poor_quality
- very_low_consistency
- etc.

---

**Query 4: Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('sleep_recommendation_rules', 'user_sleep_recommendations');
```

**Expected Result:** Should show 5 policies:
- Anyone can view active sleep recommendation rules
- Users can view own sleep recommendations
- Users can insert own sleep recommendations
- Users can update own sleep recommendations
- Users can delete own sleep recommendations

---

**Query 5: Check Indexes**
```sql
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('sleep_recommendation_rules', 'user_sleep_recommendations');
```

**Expected Result:** Should show 3 indexes:
- idx_sleep_recommendation_rules_active
- idx_user_sleep_recommendations_user
- idx_user_sleep_recommendations_rule

✅ **All Checks Passed!** Migrations successful.

---

## 🧪 Step 4: Quick Functional Test (3 minutes)

### Test the Recommendation Matching

Run this query to simulate the recommendation engine:

```sql
-- Simulate a user with low sleep duration (5.5h average)
WITH user_metrics AS (
  SELECT
    5.5 as avgSleepHours,
    40 as consistencyScore,
    2.5 as avgQuality,
    7 as totalNights
)
SELECT
  r.rule_name,
  r.recommendation_text,
  r.reason_template,
  r.priority,
  r.min_confidence,
  r.tags
FROM sleep_recommendation_rules r, user_metrics m
WHERE r.active = true
  AND (
    -- Match avgSleepHours pattern
    (r.pattern_criteria ? 'avgSleepHours'
     AND (r.pattern_criteria->'avgSleepHours'->>'min')::numeric <= m.avgSleepHours
     AND (r.pattern_criteria->'avgSleepHours'->>'max')::numeric >= m.avgSleepHours)
    OR
    -- Match consistencyScore pattern
    (r.pattern_criteria ? 'consistencyScore'
     AND (r.pattern_criteria->'consistencyScore'->>'min')::numeric <= m.consistencyScore
     AND (r.pattern_criteria->'consistencyScore'->>'max')::numeric >= m.consistencyScore)
  )
ORDER BY r.priority DESC, r.min_confidence DESC
LIMIT 5;
```

**Expected Result:** Should return 3-5 recommendations relevant to:
- Low sleep duration (5.5h)
- Low consistency (40%)
- Poor quality (2.5/5)

Example rules that should match:
- `low_sleep_duration`
- `very_low_consistency`
- `poor_sleep_quality`

✅ **Test Passed!** Recommendation matching works.

---

## ✅ Migration Complete!

You've successfully:
- ✅ Created 2 new tables
- ✅ Seeded 30+ recommendation rules
- ✅ Set up RLS policies
- ✅ Created indexes for performance
- ✅ Verified functional recommendation matching

---

## 🎯 What's Next?

Now that the database is ready, you can:

1. **Test the Service Layer**
   - Run: `npm run test` (if you have tests)
   - Or manually test an endpoint (see next section)

2. **Test an Endpoint Manually**
   - Open your app
   - Navigate to Sleep Wellness Hub
   - The LastNightCard should load data from the service

3. **Continue Frontend Development**
   - Create WeeklyOverviewCard component
   - Create ThisWeekSection component
   - Create SleepTrendsPage

---

## 🧪 Manual Service Test (Optional)

Create a test file to verify the service works:

**File:** `test-sleep-service.ts`

```typescript
import { SleepWellnessService } from './services/sleepWellness.service';

async function testService() {
  const userId = 'YOUR_USER_ID'; // Replace with a real user ID from your database

  console.log('Testing getLastNightSummary...');
  const result = await SleepWellnessService.getLastNightSummary(userId, 7);
  console.log('Result:', JSON.stringify(result, null, 2));

  console.log('\nTesting getRecommendations...');
  const recs = await SleepWellnessService.getRecommendations(userId, 'week', 3);
  console.log('Recommendations:', JSON.stringify(recs, null, 2));
}

testService().catch(console.error);
```

**Run:**
```bash
npx ts-node test-sleep-service.ts
```

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution:** Tables not created. Re-run Step 1.

### Issue: "No rows returned" from seed
**Solution:** Rules may already exist. Run:
```sql
SELECT COUNT(*) FROM sleep_recommendation_rules;
```
If count > 0, seed already ran successfully.

### Issue: "permission denied"
**Solution:** RLS policies blocking access. Verify you're authenticated:
```sql
SELECT auth.uid(); -- Should return your user ID
```

### Issue: "duplicate key value violates unique constraint"
**Solution:** Rules already exist. This is OK - migration is idempotent.

---

## 📞 Need Help?

Check these docs:
- `SLEEP_WELLNESS_IMPLEMENTATION.md` - Complete technical docs
- `SLEEP_WELLNESS_QA_CHECKLIST.md` - Full test suite
- `SLEEP_WELLNESS_QUICKSTART.md` - Quick start guide

---

**Migration Status:** ✅ Complete
**Next Step:** Test service layer and continue frontend development

---
