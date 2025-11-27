# Notes Feature - Migration Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Apply Database Migration
Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Add new columns to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS intensity INTEGER,
ADD COLUMN IF NOT EXISTS post_activity_feeling TEXT;

-- Add notes column to sleep_logs table
ALTER TABLE sleep_logs
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN activities.notes IS 'Optional user notes about the activity (max 200 characters recommended)';
COMMENT ON COLUMN activities.intensity IS 'Optional intensity level of the activity (1-5 scale)';
COMMENT ON COLUMN activities.post_activity_feeling IS 'Optional feeling after completing the activity';
COMMENT ON COLUMN sleep_logs.notes IS 'Optional user notes about the sleep session';
```

### Step 2: Verify Migration
Run this query to confirm columns were added:

```sql
-- Check activities table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND column_name IN ('notes', 'intensity', 'post_activity_feeling');

-- Check sleep_logs table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sleep_logs'
AND column_name = 'notes';
```

You should see:
- `activities.notes` - TEXT - YES
- `activities.intensity` - INTEGER - YES
- `activities.post_activity_feeling` - TEXT - YES
- `sleep_logs.notes` - TEXT - YES

### Step 3: Test the Feature
1. Open your app
2. Navigate to Journal page
3. Select an activity (e.g., "Exercise")
4. In the activity detail modal, you'll see:
   - Duration field (if applicable)
   - Intensity slider (if applicable)
   - **Notes field** (now saves to database!)
   - Post-activity feeling selector
5. Fill in notes and save
6. Check database to confirm data saved:

```sql
SELECT id, name, notes, intensity, post_activity_feeling
FROM activities
WHERE notes IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## ✅ That's it!

The feature is now fully functional. All code changes are already in place:
- ✅ TypeScript types updated
- ✅ Journal save logic updated
- ✅ UI components ready
- ✅ Services configured

## 📋 What Users Can Now Do

### For Activities:
- Add personal notes (up to 200 characters)
- Rate intensity (1-5 scale)
- Record how they felt after the activity

### For Sleep:
- Add sleep-related notes (dreams, disturbances, etc.)

### For Moods:
- Already supported! (No changes needed)

## 🔍 Troubleshooting

### Notes not saving?
1. Verify migration was applied successfully
2. Check browser console for errors
3. Ensure app code is up to date

### Database error?
- The migration uses `IF NOT EXISTS`, so it's safe to re-run
- All fields are optional, so existing data is unaffected

## 📚 Full Documentation
See [NOTES_IMPLEMENTATION_COMPLETE.md](NOTES_IMPLEMENTATION_COMPLETE.md) for:
- Complete technical details
- Testing checklist
- Rollback procedures
- Future enhancement ideas

---

**Migration File:** [database/migrations/add_notes_fields.sql](database/migrations/add_notes_fields.sql)
**Modified Files:**
- [lib/supabase.ts](lib/supabase.ts) - Type definitions
- [app/(tabs)/journal.tsx](app/(tabs)/journal.tsx) - Save logic

**Safe to deploy:** ✅ Backwards compatible, no breaking changes
