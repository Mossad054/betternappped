# Mental Clarity Test - Database Migration Guide

## Issue
The mental clarity test page is showing database errors because the current database schema is outdated and doesn't match the new test structure.

### Errors You're Seeing:
```
ERROR column mental_clarity_tests.timestamp does not exist
ERROR column mental_clarity_tests.test_type does not exist
ERROR table 'public.clarity_index' does not exist
```

## Solution
Run the database migration to update the mental clarity tables.

### Step 1: Run the Migration

Go to your Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your Betternapped project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `database/migrations/update_mental_clarity_schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify the Migration

After running the migration, verify it worked by running this query:

```sql
-- Check mental_clarity_tests table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'mental_clarity_tests';

-- Check clarity_index table exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clarity_index';
```

You should see:
- **mental_clarity_tests** with columns: `id`, `user_id`, `test_type`, `score`, `date`, `metrics`, `timestamp`, `synced`, `created_at`
- **clarity_index** with columns: `id`, `user_id`, `focus_score`, `flexibility_score`, `speed_score`, `memory_score`, `combined_score`, `date`, `timestamp`, `created_at`

### Step 3: Test the App

1. Restart your app: `npm start` (or `npx expo start`)
2. Navigate to Mental Clarity Tests
3. The errors should be gone!

## What This Migration Does

### Old Schema (Simple):
```sql
mental_clarity_tests:
  - id
  - user_id
  - date
  - score (1-5)
  - factors (jsonb)
  - created_at
```

### New Schema (Advanced):
```sql
mental_clarity_tests:
  - id
  - user_id
  - test_type (focus/flexibility/speed/memory)
  - score (0-100)
  - date
  - metrics (detailed test metrics)
  - timestamp
  - synced
  - created_at

clarity_index (NEW TABLE):
  - id
  - user_id
  - focus_score
  - flexibility_score
  - speed_score
  - memory_score
  - combined_score
  - date
  - timestamp
  - created_at
```

## Features Enabled by This Migration

✅ **Individual Test Types**: Focus, Flexibility, Speed, Memory
✅ **Detailed Metrics**: Stores reaction times, accuracy, etc.
✅ **Combined Clarity Index**: Weighted score from all tests
✅ **Test Selection**: Users can choose which tests to take
✅ **24-Hour Rate Limiting**: Prevents test cramming
✅ **Randomized Patterns**: Different each session

## Troubleshooting

### If you still see errors after migration:
1. Clear your app cache: Stop the app, delete `.expo` folder, restart
2. Check RLS policies are enabled (they're in the migration)
3. Verify your user has authentication token

### If migration fails:
The migration includes `DROP TABLE IF EXISTS` so it's safe to run multiple times. If you have existing data you want to keep, contact me first.

## Changes Made to Code

1. ✅ **Fixed animated width error** - Removed unsupported animation
2. ✅ **Hidden real-time stats** - Tests now only show timer during test
3. ✅ **Database migration created** - Ready to run in Supabase
4. ✅ **Test selection UI** - Checkboxes and minimum 2 tests
5. ✅ **Rate limiting** - 24-hour cooldown between tests
6. ✅ **Randomization** - Different patterns each session
