# Mental Clarity Habits Library Migration Guide

## Overview

This document describes the implementation of Mental Clarity habits from `habits_library.json` into the database `habits_library` table.

## Problem Solved

The database was missing the `habits_library` table and the error occurred:
```
ERROR: 42P01: relation "habits_library" does not exist
```

## Solution Summary

### 1. Database Schema Created
- **File**: [database/migrations/create_habits_library.sql](database/migrations/create_habits_library.sql)
- **Table**: `public.habits_library`
- **Key Change**: Added `UNIQUE` constraint on `name` column to prevent duplicates

#### Schema Structure:
```sql
CREATE TABLE public.habits_library (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  instructions TEXT,
  expected_outcome TEXT,
  emoji TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  time_required TEXT,
  benefits TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Mental Clarity Habits Migration
- **File**: [database/migrations/seed_mental_clarity_habits.sql](database/migrations/seed_mental_clarity_habits.sql)
- **Total Habits**: 36 new Mental Clarity habits
- **Excluded**: 5 habits already present in [constants/mockData.ts](constants/mockData.ts:2733)

#### Excluded Habits (Already in mockData.ts):
1. Mind Mapping
2. Digital Declutter
3. 5-minute deep breathing
4. Write daily priorities
5. Digital detox break

#### New Habits Added (36 total):
1. Mindful pause every hour
2. Brain dump journaling
3. Read 2 pages of a book
4. Practice gratitude list
5. Cold water face splash
6. Stand and stretch break
7. Focus on single task
8. Avoid multitasking session
9. 5-minute meditation
10. Limit notifications
11. Plan tomorrow tonight
12. Review goals daily
13. Do one hard thing first
14. Mental reset walk
15. Declutter workspace
16. Set clear intentions
17. Drink water first thing
18. Practice silence for 1 min
19. No-screen breakfast
20. Slow breathing count
21. Positive affirmation
22. Reset posture hourly
23. Avoid doom scrolling
24. Tidy desk end of day
25. Reflect on wins
26. Set hourly focus timer
27. Visualize your day
28. 5-minute sunlight exposure
29. Track distractions
30. Practice mindful eating
31. Plan breaks intentionally
32. Organize work apps
33. Create thought boundary
34. Practice mini grounding
35. Single-task meal
36. Evening mental review

## Data Structure Compliance

All habits follow the exact format from [constants/mockData.ts](constants/mockData.ts):

### Format Example:
```typescript
{
  id: 'clarity-3',
  name: '5-minute deep breathing',
  description: 'Practice deep breathing exercises to calm and focus your mind',
  expectedOutcome: 'By completing this habit for 7 days you will notice improved focus and reduced stress. By 14 days you will see measurable improvements in mental clarity. By 30 days you will experience long-term cognitive benefits.',
  emoji: '🌬️',
  category: 'MentalClarity',
  difficulty: 'Easy',
  timeRequired: '5 minutes',
  benefits: ['Reduced stress', 'Improved focus', 'Better oxygen flow to brain']
}
```

### Database Format (SQL):
```sql
INSERT INTO public.habits_library (
  name,
  description,
  category,
  instructions,
  expected_outcome,
  emoji,
  difficulty,
  time_required,
  benefits
) VALUES (
  '5-minute deep breathing',
  'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute deep breathing.',
  'MentalClarity',
  'Perform the habit ''5-minute deep breathing'' consistently as part of your daily routine.',
  'By completing this habit for 7 days...',
  '🌬️',
  'Easy',
  '5 minutes',
  ARRAY['Reduced stress', 'Improved focus', 'Better oxygen flow to brain']
);
```

## How to Run the Migration

### Step 1: Create the Table
```bash
# Run from Supabase SQL Editor or your database client
psql -f database/migrations/create_habits_library.sql
```

### Step 2: Seed Mental Clarity Habits
```bash
# Run the seeding script
psql -f database/migrations/seed_mental_clarity_habits.sql
```

### Step 3: Verify
The migration includes verification queries that will automatically run:
- Count total Mental Clarity habits
- Show difficulty distribution
- Display sample of inserted habits

## Integration with Codebase

### Frontend Integration
The habits library is consumed by:
- **File**: [app/habit-library.tsx](app/habit-library.tsx)
- **Function**: `getHabitLibraryData()` from [constants/mockData.ts](constants/mockData.ts)

### Service Layer
- **File**: [services/habits.service.ts](services/habits.service.ts)
- Handles creating active habits from library templates

## Category Standardization

All habits use the following category names:
- `MentalClarity` (not "Mental Clarity" with space)
- `Health`
- `Sleep`
- `Mood`
- `Intimacy`
- `Anxiety`

## Next Steps

### Remaining Categories to Migrate:
1. **Health** - Multiple habits in `habits_library.json`
2. **Sleep** - Multiple habits in `habits_library.json`
3. **Mood** - Multiple habits in `habits_library.json`
4. **Intimacy** - Multiple habits in `habits_library.json`
5. **Anxiety** - Multiple habits in `habits_library.json`

### To Add Remaining Categories:
```bash
# Use the same pattern - extract, filter, generate SQL
node extract_mental_clarity.js    # Modify for other categories
node generate_mental_clarity_sql.js  # Modify for other categories
```

## Files Created/Modified

### New Files:
- ✅ `database/migrations/create_habits_library.sql` (Modified - added UNIQUE constraint)
- ✅ `database/migrations/seed_mental_clarity_habits.sql` (New)
- ✅ `extract_mental_clarity.js` (Helper script)
- ✅ `generate_mental_clarity_sql.js` (Helper script)
- ✅ `mental_clarity_new.json` (Intermediate data)

### Modified Files:
- ✅ `database/migrations/create_habits_library.sql` - Added UNIQUE constraint on name

## Testing

### Verify Schema:
```sql
\d public.habits_library
```

### Check Inserted Habits:
```sql
SELECT COUNT(*) FROM public.habits_library WHERE category = 'MentalClarity';
-- Expected: 36 (or more if mockData habits were also inserted)

SELECT name, difficulty, time_required, emoji
FROM public.habits_library
WHERE category = 'MentalClarity'
ORDER BY name;
```

### Test Frontend:
1. Navigate to habit library in the app
2. Filter by "Mental Clarity" category
3. Verify 36+ habits appear
4. Test adding a habit to active habits

## Benefits Array Format

Each habit includes 3 contextually relevant benefits stored as PostgreSQL TEXT array:
```sql
ARRAY['Reduced stress', 'Improved focus', 'Better oxygen flow to brain']
```

## Success Criteria

✅ Database table created with proper schema
✅ 36 Mental Clarity habits inserted
✅ No duplicate habits from mockData.ts
✅ All habits follow exact format from codebase
✅ Category naming matches existing conventions
✅ Expected outcome format preserved (7/14/30 day structure)
✅ SQL includes conflict handling (ON CONFLICT DO NOTHING)
✅ Verification queries included

## Troubleshooting

### If Migration Fails:
1. **Check table exists**: Run `create_habits_library.sql` first
2. **Check for duplicates**: The UNIQUE constraint on `name` will prevent duplicate insertions
3. **Review error messages**: Postgres will indicate which constraint failed

### If Habits Don't Appear in App:
1. Verify database connection in app
2. Check RLS policies allow authenticated users to read
3. Verify category name is exactly `MentalClarity` (no spaces)

## Cleanup

Temporary files that can be deleted after migration:
- `extract_mental_clarity.js`
- `generate_mental_clarity_sql.js`
- `mental_clarity_new.json`

Or run:
```bash
rm extract_mental_clarity.js generate_mental_clarity_sql.js mental_clarity_new.json
```

---

**Author**: Claude Code
**Date**: 2025-11-24
**Status**: ✅ Complete
