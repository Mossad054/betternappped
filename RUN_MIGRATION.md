# Quick Start: Mental Clarity Habits Migration

## ⚡ Quick Run Commands

### For Supabase Dashboard (SQL Editor):

1. **Create the table** (copy and paste entire content):
```sql
-- File: database/migrations/create_habits_library.sql
```
Open [database/migrations/create_habits_library.sql](database/migrations/create_habits_library.sql) and run it in Supabase SQL Editor.

2. **Seed the habits** (copy and paste entire content):
```sql
-- File: database/migrations/seed_mental_clarity_habits.sql
```
Open [database/migrations/seed_mental_clarity_habits.sql](database/migrations/seed_mental_clarity_habits.sql) and run it in Supabase SQL Editor.

### For Local psql:

```bash
# Navigate to project root
cd "c:\Users\ROLSS_IWCF TC 6\projects\Betternapped"

# 1. Create table
psql -U postgres -d your_database -f database/migrations/create_habits_library.sql

# 2. Seed habits
psql -U postgres -d your_database -f database/migrations/seed_mental_clarity_habits.sql
```

## ✅ What This Does

- ✅ Creates `public.habits_library` table with proper schema
- ✅ Adds 36 new Mental Clarity habits to the database
- ✅ Prevents duplicates with `ON CONFLICT DO NOTHING`
- ✅ Automatically verifies the insertion with SELECT queries

## 📊 Expected Results

After running the migration, you should see:

```
Total mental clarity habits: 36
Easy habits: 31
Medium habits: 5
Hard habits: 0
```

And a list of 10 recently inserted habits with their name, difficulty, time_required, and emoji.

## 🔍 Verify Migration

Run this in your SQL editor:
```sql
SELECT COUNT(*) as total, category
FROM public.habits_library
WHERE category = 'MentalClarity'
GROUP BY category;
```

Expected output:
```
total | category
------|-------------
  36  | MentalClarity
```

## 🚀 Next Steps

To add habits from other categories, see the [full migration guide](HABITS_LIBRARY_MENTAL_CLARITY_MIGRATION.md).

## ⚠️ Troubleshooting

**Error: "relation habits_library does not exist"**
- Solution: Run `create_habits_library.sql` first

**Error: "duplicate key value violates unique constraint"**
- Solution: This is normal - it means some habits already exist. The migration uses `ON CONFLICT DO NOTHING` to skip duplicates.

**Habits don't appear in app**
- Check database connection
- Verify RLS policies allow your user to read from `habits_library`
- Ensure you're filtering by exact category name: `MentalClarity` (no spaces)

---

**Status**: Ready to run ✅
**Files**:
- [database/migrations/create_habits_library.sql](database/migrations/create_habits_library.sql)
- [database/migrations/seed_mental_clarity_habits.sql](database/migrations/seed_mental_clarity_habits.sql)
