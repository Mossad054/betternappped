# Migration Guide: Old Schema → New Schema

## Quick Reference

| Document | Purpose |
|----------|---------|
| `newschema.sql` | Complete normalized schema (ready to execute) |
| `SCHEMA_ANALYSIS_SUMMARY.md` | Full analysis and design rationale |
| This file | Step-by-step migration instructions |

---

## 🚦 Pre-Migration Checklist

- [ ] Backup current database
- [ ] Review `SCHEMA_ANALYSIS_SUMMARY.md`
- [ ] Test on staging environment first
- [ ] Notify team of maintenance window
- [ ] Prepare rollback plan

---

## 📋 Migration Options

### Option A: Fresh Install (Development/Staging)

**When to use:** New deployment, testing, or development environment

```bash
# 1. Connect to Supabase/PostgreSQL
psql -h your-project.supabase.co -U postgres -d postgres

# 2. Run the new schema
\i database/newschema.sql

# 3. Verify installation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Output:** 33 tables

---

### Option B: Incremental Migration (Production)

**When to use:** Existing production database with user data

#### Step 1: Add New Tables (Safe)

```sql
-- Run these CREATE TABLE statements from newschema.sql
-- (Only for tables that don't exist yet)

-- New Intimacy Hub Tables
CREATE TABLE IF NOT EXISTS public.programs (...);
CREATE TABLE IF NOT EXISTS public.lessons (...);
CREATE TABLE IF NOT EXISTS public.user_programs (...);
CREATE TABLE IF NOT EXISTS public.user_lessons (...);
CREATE TABLE IF NOT EXISTS public.intimacy_experiments (...);
CREATE TABLE IF NOT EXISTS public.intimacy_experiment_logs (...);
CREATE TABLE IF NOT EXISTS public.daily_checkins (...);
CREATE TABLE IF NOT EXISTS public.user_streaks (...);
CREATE TABLE IF NOT EXISTS public.assessments (...);
CREATE TABLE IF NOT EXISTS public.user_assessments (...);
CREATE TABLE IF NOT EXISTS public.user_metrics (...);
CREATE TABLE IF NOT EXISTS public.achievements (...);
CREATE TABLE IF NOT EXISTS public.user_achievements (...);

-- New Correlation Tables
CREATE TABLE IF NOT EXISTS public.activity_outcome_correlations (...);
CREATE TABLE IF NOT EXISTS public.activity_impact_records (...);
CREATE TABLE IF NOT EXISTS public.user_activity_insights (...);
```

#### Step 2: Add Missing Columns (Safe)

```sql
-- Check if column exists before adding
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='sleep_logs' AND column_name='sleep_target'
    ) THEN
        ALTER TABLE public.sleep_logs ADD COLUMN sleep_target DECIMAL(3,1) DEFAULT 8.0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='sleep_logs' AND column_name='sleep_debt'
    ) THEN
        ALTER TABLE public.sleep_logs ADD COLUMN sleep_debt DECIMAL(3,1) 
        GENERATED ALWAYS AS (GREATEST(0, sleep_target - hours)) STORED;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='activities' AND column_name='post_activity_feeling'
    ) THEN
        ALTER TABLE public.activities ADD COLUMN post_activity_feeling TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_preferences' AND column_name='emoji_palette'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN emoji_palette TEXT DEFAULT 'default' NOT NULL;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='mental_clarity_tests' AND column_name='test_results'
    ) THEN
        ALTER TABLE public.mental_clarity_tests ADD COLUMN test_results JSONB;
    END IF;
END $$;
```

#### Step 3: Add Indexes (Safe - but may take time)

```sql
-- Add indexes one by one
-- Monitor with: SELECT * FROM pg_stat_progress_create_index;

-- Critical performance indexes first
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_logs_user_date 
ON public.mood_logs(user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_date 
ON public.activities(user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sleep_logs_user_date 
ON public.sleep_logs(user_id, date DESC);

-- Continue with remaining indexes from newschema.sql
-- Use CONCURRENTLY to avoid locking tables
```

#### Step 4: Add/Update RLS Policies (Safe)

```sql
-- Enable RLS on new tables
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all new tables)

-- Add policies
CREATE POLICY "Anyone can read programs" ON public.programs 
FOR SELECT USING (true);

CREATE POLICY "Users access own program progress" ON public.user_programs 
FOR ALL USING (auth.uid() = user_id);

-- ... (continue with remaining policies)
```

#### Step 5: Add Functions & Triggers (Safe)

```sql
-- Copy functions from newschema.sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ... (continue with remaining functions and triggers)
```

#### Step 6: Seed Data (Safe)

```sql
-- Insert default programs
INSERT INTO public.programs (title, description, duration_days, total_lessons, category, difficulty, tags)
VALUES
('Rebuilding Intimacy', 'A gentle journey to reconnect...', 21, 7, 'connection', 'beginner', ARRAY['couples', 'communication', 'emotional']),
('Desire Discovery', '...', 14, 5, 'desire', 'intermediate', ARRAY['solo', 'self-awareness', 'communication']),
('Conflict to Connection', '...', 14, 6, 'conflict', 'intermediate', ARRAY['couples', 'communication']),
('Self-Love Foundation', '...', 21, 8, 'self-love', 'beginner', ARRAY['solo', 'self-care', 'emotional'])
ON CONFLICT DO NOTHING;

-- Insert default achievements
INSERT INTO public.achievements (title, description, icon, category, criteria_type, criteria_value, badge_color, rarity)
VALUES
('First Step', 'Completed your first lesson', '🌱', 'programs', 'total_lessons', 1, 'bronze', 'common'),
('Committed Learner', 'Completed 3 programs', '📚', 'programs', 'program_complete', 3, 'silver', 'rare'),
-- ... (continue with remaining achievements)
ON CONFLICT DO NOTHING;
```

---

## 🔍 Post-Migration Verification

### 1. Table Count Check

```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 33
```

### 2. Data Integrity Check

```sql
-- Check no orphaned records
SELECT 'habits' as table_name, COUNT(*) as orphaned 
FROM habits h 
LEFT JOIN users u ON h.user_id = u.id 
WHERE u.id IS NULL

UNION ALL

SELECT 'mood_logs', COUNT(*) 
FROM mood_logs m 
LEFT JOIN users u ON m.user_id = u.id 
WHERE u.id IS NULL

UNION ALL

SELECT 'activities', COUNT(*) 
FROM activities a 
LEFT JOIN users u ON a.user_id = u.id 
WHERE u.id IS NULL;

-- Expected: 0 orphaned records for all tables
```

### 3. Index Check

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: 60+ indexes
```

### 4. RLS Check

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: 30+ policies
```

### 5. Function & Trigger Check

```sql
-- Check functions
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 🧪 Application Testing Checklist

After migration, test these critical flows:

### User Management
- [ ] User signup creates profile and preferences
- [ ] Profile picture upload works
- [ ] PIN lock can be set and verified
- [ ] Theme preferences save and load

### Core Tracking
- [ ] Mood logging (multiple per day)
- [ ] Activity logging with post-activity feelings
- [ ] Sleep logging with sleep debt calculation
- [ ] Mental clarity tests
- [ ] Productivity tracking

### Habits & Experiments
- [ ] Habit creation and logging
- [ ] Streak counting works
- [ ] Experiment creation and daily logging
- [ ] Progressive day counting (Day 1/30 → Day 2/30)

### Intimacy Hub
- [ ] Program enrollment
- [ ] Lesson completion
- [ ] Daily check-ins
- [ ] Assessments
- [ ] Achievements unlocking

### Analytics
- [ ] Activity-outcome correlations calculate
- [ ] Impact analysis displays correctly
- [ ] Dashboard metrics load

### Notifications
- [ ] Notification preferences save
- [ ] Notifications are created
- [ ] Quiet hours respected

---

## 🔄 Rollback Procedure

If issues occur during migration:

```sql
-- 1. Stop application
-- Prevent new writes during rollback

-- 2. Restore from backup
psql -h your-project.supabase.co -U postgres -d postgres < backup_YYYYMMDD.sql

-- 3. Verify restoration
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM activities;
SELECT COUNT(*) FROM mood_logs;

-- 4. Check data integrity
SELECT MAX(created_at) FROM activities;
-- Should match backup timestamp

-- 5. Restart application
-- Monitor for errors
```

---

## 📊 Performance Monitoring

After migration, monitor these metrics:

### Query Performance

```sql
-- Top 20 slowest queries
SELECT 
    query,
    calls,
    total_exec_time / 1000 as total_seconds,
    mean_exec_time / 1000 as mean_seconds,
    max_exec_time / 1000 as max_seconds
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Index Usage

```sql
-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename, indexname;
```

### Table Sizes

```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Success Criteria

Migration is successful when:

- ✅ All 33 tables exist
- ✅ All 60+ indexes created
- ✅ All RLS policies active
- ✅ No orphaned records
- ✅ All application tests pass
- ✅ Performance metrics acceptable
- ✅ No error logs in application
- ✅ Users can login and access data

---

## 📞 Support

**Issues?** Check:
1. `SCHEMA_ANALYSIS_SUMMARY.md` for design rationale
2. `newschema.sql` for complete schema reference
3. Application logs for specific errors
4. Supabase dashboard for database health

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Table already exists" | Use `IF NOT EXISTS` or skip that table |
| "Column already exists" | Check column existence before ALTER |
| "Index creation too slow" | Use `CREATE INDEX CONCURRENTLY` |
| "RLS blocks queries" | Verify policy conditions match query |
| "Foreign key violation" | Check referenced records exist first |

---

**Last Updated:** November 13, 2025  
**Schema Version:** 2.0
