# Mental Clarity Hub - Complete Fix & Deployment Guide 🚀

## TL;DR - Quick Fix

**Problem**: Database schema mismatch prevents tests from saving
**Solution**: Run 1 SQL migration file
**Time**: 5 minutes
**Risk**: Low

---

## 📋 Pre-Flight Checklist

Before starting, ensure you have:

- [ ] Access to Supabase dashboard (https://app.supabase.com)
- [ ] Betternapped project open in Supabase
- [ ] Backup of current database (optional but recommended)
- [ ] Code editor open with project
- [ ] Development server running for testing

---

## 🔧 Step-by-Step Fix

### Step 1: Backup Current Data (Optional - 2 minutes)

**If you have important data in the current `mental_clarity_tests` table**, backup first:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select `mental_clarity_tests` table
4. Click **Export** → **CSV**
5. Save file locally

**Note**: If this is a fresh install or development environment, skip this step.

---

### Step 2: Run Database Migration (Required - 3 minutes)

1. **Open Supabase SQL Editor**:
   - Go to https://app.supabase.com
   - Open your Betternapped project
   - Click **SQL Editor** in left sidebar
   - Click **+ New Query**

2. **Copy Migration Script**:
   - Open [database/migrations/update_mental_clarity_schema.sql](database/migrations/update_mental_clarity_schema.sql)
   - Select **ALL** content (Ctrl/Cmd + A)
   - Copy to clipboard (Ctrl/Cmd + C)

3. **Execute Migration**:
   - Paste into Supabase SQL Editor
   - Click **Run** (bottom right)
   - Wait for "Success. No rows returned" message

4. **Verify Success**:
   You should see output like:
   ```
   Success. No rows returned.
   Statement 1 of 15 completed.
   ```

---

### Step 3: Verify Database Schema (1 minute)

Run this verification query in SQL Editor:

```sql
-- Check mental_clarity_tests schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'mental_clarity_tests'
ORDER BY ordinal_position;
```

**Expected Output** (should see these columns):
```
id                 | uuid
user_id            | uuid
test_type          | text
score              | integer
date               | date
metrics            | jsonb
timestamp          | timestamp with time zone
synced             | boolean
created_at         | timestamp with time zone
```

**If you don't see `test_type` column**: Migration failed. Check errors and try again.

---

### Step 4: Test the Application (5-10 minutes)

1. **Restart Development Server**:
   ```bash
   # Stop server (Ctrl+C)
   # Start server
   npm start
   # or
   expo start
   ```

2. **Open App and Navigate to Mental Clarity Tests**:
   - Log in (if not already)
   - Navigate to Mental Clarity hub
   - Select at least 2 tests (e.g., Focus + Speed)
   - Click "Start Tests"

3. **Complete First Test (Focus Test - 90 seconds)**:
   - Read instructions
   - Click "Start Test"
   - Tap ONLY when you see the target shape
   - Complete 90-second test
   - Verify results screen shows
   - **CHECK**: No console errors

4. **Complete Second Test (Speed Test - 45 seconds)**:
   - Automatically continues to next test
   - Match symbols to numbers
   - Complete 45-second test
   - Verify results screen shows
   - **CHECK**: No console errors

5. **Verify Data Saved**:
   - Go to Supabase → **Table Editor**
   - Select `mental_clarity_tests` table
   - **CHECK**: You should see 2 rows (one for each test)
   - **CHECK**: `test_type` column shows "focus" and "speed"
   - **CHECK**: `metrics` column contains JSONB data

6. **Verify Clarity Index**:
   - Go to Supabase → **Table Editor**
   - Select `clarity_index` table
   - **CHECK**: You should see 1 row with today's date
   - **CHECK**: `combined_score` is calculated (not 0)

---

## ✅ Success Criteria

The fix is successful when:

✅ Migration runs without errors
✅ `test_type` column exists in `mental_clarity_tests`
✅ `clarity_index` table exists
✅ Tests complete without crashing
✅ Results save to database (verify in Table Editor)
✅ Clarity Index calculates automatically
✅ No console errors during test completion
✅ 24-hour rate limiting prevents immediate retake

---

## 🐛 Troubleshooting

### Error: "column test_type does not exist"

**Cause**: Migration didn't run successfully
**Fix**:
1. Re-run the migration SQL
2. Check for syntax errors in console
3. Verify you have admin access to Supabase project

---

### Error: "relation clarity_index does not exist"

**Cause**: Migration only partially completed
**Fix**:
1. Check Supabase logs for errors
2. Re-run the full migration script
3. Verify both tables were created:
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND (tablename = 'mental_clarity_tests' OR tablename = 'clarity_index');
   ```

---

### Error: "new row violates row-level security policy"

**Cause**: RLS policies not set correctly
**Fix**:
1. Check if you're logged in with auth token
2. Re-run migration (it drops and recreates RLS policies)
3. Verify auth.uid() is not null:
   ```sql
   SELECT auth.uid();
   ```

---

### Tests Save But Clarity Index Shows Null

**Cause**: Calculation failed or not triggered
**Fix**:
1. Check console for calculation errors
2. Manually trigger calculation:
   ```typescript
   await MentalClarityService.calculateClarityIndex(userId, todayDate);
   ```
3. Verify at least one test was completed

---

### 24-Hour Limit Immediately Active

**This is expected behavior** if you completed tests in the last 24 hours.

**To bypass for testing**:
```sql
-- Delete recent test results (DEVELOPMENT ONLY)
DELETE FROM mental_clarity_tests
WHERE user_id = 'YOUR_USER_ID'
AND timestamp > NOW() - INTERVAL '24 hours';
```

---

## 📊 Database Schema Reference

### mental_clarity_tests Table

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Unique test result ID |
| user_id | UUID | FOREIGN KEY → users | User who took test |
| test_type | TEXT | CHECK IN ('focus', 'flexibility', 'speed', 'memory') | Type of test |
| score | INTEGER | CHECK 0-100 | Final score |
| date | DATE | NOT NULL | Date test was taken |
| metrics | JSONB | NOT NULL | Detailed test metrics |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Exact time test completed |
| synced | BOOLEAN | DEFAULT TRUE | Cloud sync status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Row creation time |

**Indexes**:
- `idx_mental_clarity_tests_user_date` (user_id, date)
- `idx_mental_clarity_tests_user_timestamp` (user_id, timestamp DESC)
- `idx_mental_clarity_tests_user_type_date` (user_id, test_type, date)

**RLS Policies**:
- Users can only access their own test results
- All operations (SELECT, INSERT, UPDATE, DELETE) allowed for own data

---

### clarity_index Table

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | UUID | PRIMARY KEY | Unique index ID |
| user_id | UUID | FOREIGN KEY → users | User |
| focus_score | INTEGER | CHECK 0-100 | Latest focus test score |
| flexibility_score | INTEGER | CHECK 0-100 | Latest flexibility test score |
| speed_score | INTEGER | CHECK 0-100 | Latest speed test score |
| memory_score | INTEGER | CHECK 0-100 | Latest memory test score |
| combined_score | INTEGER | CHECK 0-100 | Weighted average (see formula) |
| date | DATE | NOT NULL | Date of index calculation |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Calculation time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Row creation time |

**Unique Constraint**: (user_id, date) - One index per user per day

**Clarity Index Formula**:
```
combined_score = (
  focus_score × 30% +
  memory_score × 30% +
  flexibility_score × 20% +
  speed_score × 20%
)
```

---

## 🧪 Test Data Examples

### Example: Focus Test Result

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user123",
  "test_type": "focus",
  "score": 87,
  "date": "2025-01-17",
  "metrics": {
    "correctTaps": 42,
    "missedTargets": 8,
    "falseTaps": 3,
    "avgReactionTime": 420,
    "focusAccuracy": 84.0
  },
  "timestamp": "2025-01-17T14:30:00Z",
  "synced": true
}
```

### Example: Clarity Index

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "user_id": "user123",
  "focus_score": 87,
  "flexibility_score": 82,
  "speed_score": 90,
  "memory_score": 78,
  "combined_score": 84,
  "date": "2025-01-17",
  "timestamp": "2025-01-17T14:35:00Z"
}
```

**Calculation**:
```
combined_score = (87 × 0.30) + (78 × 0.30) + (82 × 0.20) + (90 × 0.20)
               = 26.1 + 23.4 + 16.4 + 18.0
               = 83.9
               ≈ 84 (rounded)
```

---

## 🔒 Security Verification

After migration, verify RLS policies work:

```sql
-- This should return your test results
SELECT * FROM mental_clarity_tests WHERE user_id = auth.uid();

-- This should return 0 rows (can't access other users' data)
SELECT * FROM mental_clarity_tests WHERE user_id != auth.uid();
```

---

## 📈 Performance Verification

Check query performance after migration:

```sql
-- Should use index (fast)
EXPLAIN ANALYZE
SELECT * FROM mental_clarity_tests
WHERE user_id = 'YOUR_USER_ID'
AND date >= '2025-01-01'
ORDER BY timestamp DESC;

-- Look for "Index Scan" in output (not "Seq Scan")
```

---

## 🚀 Post-Deployment Checklist

After successful fix and testing:

- [ ] Migration completed successfully
- [ ] All 4 test types work (Focus, Flexibility, Speed, Memory)
- [ ] Results save to database
- [ ] Clarity Index calculates correctly
- [ ] 24-hour rate limiting works
- [ ] No console errors
- [ ] RLS policies verified
- [ ] Performance indexes verified
- [ ] Documentation updated
- [ ] Team notified of changes

---

## 📱 User-Facing Features Working

After fix, users can:

✅ Select which tests to take (minimum 2)
✅ Complete cognitive tests with clear instructions
✅ See immediate results and scores
✅ View their daily Clarity Index
✅ Track progress over time
✅ Be prevented from over-testing (24-hour cooldown)
✅ Have all data securely saved and synced

---

## 🔮 Future Enhancements (Not in Scope)

These features are NOT included but could be added later:

- Historical charts and trends
- Achievement badges
- Social comparison features
- Customizable test difficulty
- Export test results
- Email reports
- AI-powered insights
- Correlation with sleep/mood data

---

## 📞 Support

If you encounter issues not covered in troubleshooting:

1. Check [MENTAL_CLARITY_BUGS_AND_FIXES.md](MENTAL_CLARITY_BUGS_AND_FIXES.md)
2. Review Supabase logs (Dashboard → Logs)
3. Check browser/app console for errors
4. Verify all migration steps were completed
5. Try creating fresh user account for testing

---

## ✨ Summary

**What We Fixed**:
- ✅ Critical database schema mismatch
- ✅ Missing clarity_index table
- ✅ Incorrect RLS policies
- ✅ Missing performance indexes

**What You Need to Do**:
1. Run database migration (5 minutes)
2. Test the feature (10 minutes)
3. Verify data in Supabase (2 minutes)

**Result**:
- Fully functional Mental Clarity testing system
- 4 cognitive tests (Focus, Flexibility, Speed, Memory)
- Automated Clarity Index calculation
- Secure, performant, production-ready

---

**Ready?** Follow Step 1 above and let's fix this! 🚀

---

Last Updated: 2025-01-17
Estimated Time to Fix: 15 minutes
Risk Level: Low
Complexity: Low (one SQL migration)
