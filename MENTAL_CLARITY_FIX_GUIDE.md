# Mental Clarity Schema Fix Guide

## 🐛 Issues Fixed

This guide fixes the following database errors:

1. ❌ `ERROR: column mental_clarity_tests.timestamp does not exist`
2. ❌ `ERROR: column mental_clarity_tests.test_type does not exist`
3. ❌ `ERROR: Could not find the table 'public.clarity_index'`

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your **Betternapped** project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Fix Script

1. Open the file: [`database/FIX_MENTAL_CLARITY_SCHEMA.sql`](./database/FIX_MENTAL_CLARITY_SCHEMA.sql)
2. Copy the **entire contents** of the file
3. Paste it into the SQL Editor
4. Click the **Run** button

### Step 3: Verify Success

After running the script, you should see messages like:
```
✅ Schema fix successful!
   - test_type column: EXISTS
   - timestamp column: EXISTS
   - clarity_index table: EXISTS
```

### Step 4: Test the App

1. Restart your app
2. Navigate to **Mental Clarity Tests**
3. The errors should be gone! 🎉

---

## 📋 What the Fix Does

### Creates Missing Table: `clarity_index`
This table stores the combined daily mental clarity scores:
- Focus score (0-100)
- Flexibility score (0-100)
- Speed score (0-100)
- Memory score (0-100)
- Combined score (weighted average)

### Updates Table: `mental_clarity_tests`
Adds missing columns:
- **`test_type`**: Type of test ('focus', 'flexibility', 'speed', 'memory')
- **`timestamp`**: When the test was taken
- **`metrics`**: JSONB field for detailed test metrics
- **`synced`**: Whether the test result is synced

### Old Schema (BEFORE)
```sql
CREATE TABLE mental_clarity_tests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  factors JSONB DEFAULT '[]'
);
```

### New Schema (AFTER)
```sql
CREATE TABLE mental_clarity_tests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  test_type TEXT CHECK (test_type IN ('focus', 'flexibility', 'speed', 'memory')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  date DATE NOT NULL,
  metrics JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced BOOLEAN DEFAULT true
);
```

---

## 🔒 Data Safety

- **Backup Created**: Your old data is backed up to `mental_clarity_tests_backup`
- **RLS Policies**: Row Level Security is enabled to protect user data
- **Indexes**: Performance indexes are created for fast queries

---

## 🧪 Testing Checklist

After running the fix, test these features:

- [ ] Navigate to Mental Clarity Tests screen (no errors in console)
- [ ] Select tests and start a test
- [ ] Complete a focus test
- [ ] View your clarity index score
- [ ] Check test history
- [ ] Verify daily completion tracking works

---

## 🚨 Troubleshooting

### "Permission denied" error
**Solution**: Make sure you're logged in as the database owner or have admin privileges.

### Script runs but errors still appear
**Solution**:
1. Check the Supabase logs for any error details
2. Verify the tables were created: Run `SELECT * FROM clarity_index LIMIT 1;`
3. Restart your development server

### Old data not migrating
**Solution**: The old schema was incompatible, so old data is preserved in `mental_clarity_tests_backup`. You can manually migrate if needed.

---

## 📱 Overlay Issue Check

✅ **No overlay issues found** in the mental clarity test screens:
- No Modal components causing overlays
- No `position: absolute` or `position: fixed` issues
- All test screens render correctly without overlapping UI elements

The tests use proper React Native layout with `ScrollView` and `View` components.

---

## 🔗 Related Files

- **Service**: [services/mental-clarity.service.ts](./services/mental-clarity.service.ts)
- **Test Screen**: [app/mental-clarity-test.tsx](./app/mental-clarity-test.tsx)
- **Focus Test**: [app/tests/focus-test.tsx](./app/tests/focus-test.tsx)
- **Speed Test**: [app/tests/speed-test.tsx](./app/tests/speed-test.tsx)
- **Flexibility Test**: [app/tests/flexibility-test.tsx](./app/tests/flexibility-test.tsx)
- **Memory Test**: [app/tests/memory-test.tsx](./app/tests/memory-test.tsx)
- **Migration File**: [database/migrations/update_mental_clarity_schema.sql](./database/migrations/update_mental_clarity_schema.sql)

---

## 💡 Need Help?

If you encounter any issues:
1. Check Supabase logs in the Dashboard
2. Review the console errors in your app
3. Verify your Supabase connection is active
4. Make sure you're using the correct project

Good luck! 🚀
