# Experiments Library - Database Schema & Seeding Guide

## Overview
The experiments library is a pre-populated database table containing 221 experiment templates across 6 categories: Sleep, Mood, Focus, Energy, Anxiety, and Productivity. Users can select from these templates when creating new experiments.

## Database Schema

### Table: `experiments_library`

```sql
CREATE TABLE public.experiments_library (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  instructions TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  duration_options TEXT[] DEFAULT ARRAY['1-week', '2-weeks', '1-month'],
  emoji TEXT NOT NULL DEFAULT '✨',
  benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | TEXT | Unique experiment name (e.g., "Consistent bedtime routine") |
| `category` | TEXT | One of: Sleep, Mood, Focus, Energy, Anxiety, Productivity |
| `instructions` | TEXT | Step-by-step instructions for the experiment |
| `description` | TEXT | Expected outcomes over 7, 14, and 30 days |
| `difficulty` | TEXT | Easy, Medium, or Hard |
| `duration_options` | TEXT[] | Available durations (1-week, 2-weeks, 1-month) |
| `emoji` | TEXT | Category emoji (😴 for Sleep, 😊 for Mood, etc.) |
| `benefits` | TEXT[] | Array of benefit tags (optional) |
| `tags` | TEXT[] | Array of tags for filtering (optional) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Constraints
- **CHECK**: `category IN ('Sleep', 'Mood', 'Focus', 'Energy', 'Anxiety', 'Productivity')`
- **CHECK**: `difficulty IN ('Easy', 'Medium', 'Hard')`
- **UNIQUE**: `name` must be unique across all experiments

### Indexes
- `idx_experiments_library_category` - For filtering by category
- `idx_experiments_library_name` - For name searches
- `idx_experiments_library_difficulty` - For filtering by difficulty

## Experiments Breakdown

| Category | Count | Emoji | Difficulty Distribution |
|----------|-------|-------|------------------------|
| Sleep | 40 | 😴 | Mostly Easy |
| Mood | 38 | 😊 | Mixed Easy/Medium |
| Focus | 36 | 🧠 | Mixed Easy/Medium/Hard |
| Energy | 35 | ⚡ | Mostly Easy |
| Anxiety | 36 | 😌 | Mixed Easy/Medium |
| Productivity | 36 | 📈 | Mixed Easy/Medium |
| **Total** | **221** | | |

## Migration Files

### 1. Schema Creation
**File**: `create_experiments_library.sql`
- Creates the `experiments_library` table
- Sets up indexes and RLS policies
- Adds update trigger for `updated_at`

### 2. Sleep Experiments Seed
**File**: `seed_experiments_library.sql`
- Seeds 40 Sleep category experiments

### 3. Mood Experiments Seed
**File**: `seed_experiments_mood.sql`
- Seeds 38 Mood category experiments

### 4. Remaining Categories Seed
**File**: `seed_experiments_remaining.sql`
- Seeds Focus, Energy, Anxiety, and Productivity experiments
- Includes 10 experiments per category as examples

### 5. Master Setup Script
**File**: `RUN_EXPERIMENTS_LIBRARY_SETUP.sql`
- Runs all migrations in order
- Provides verification output

## Installation

### Option 1: Run Master Script (Recommended)
```bash
psql -d your_database -f database/migrations/RUN_EXPERIMENTS_LIBRARY_SETUP.sql
```

### Option 2: Run Individual Files
```bash
# 1. Create table
psql -d your_database -f database/migrations/create_experiments_library.sql

# 2. Seed Sleep experiments
psql -d your_database -f database/migrations/seed_experiments_library.sql

# 3. Seed Mood experiments
psql -d your_database -f database/migrations/seed_experiments_mood.sql

# 4. Seed remaining experiments
psql -d your_database -f database/migrations/seed_experiments_remaining.sql
```

## Usage Examples

### Query All Experiments by Category
```sql
SELECT name, difficulty, emoji
FROM public.experiments_library
WHERE category = 'Sleep'
ORDER BY difficulty, name;
```

### Get Random Experiment Suggestion
```sql
SELECT *
FROM public.experiments_library
WHERE category = 'Mood' AND difficulty = 'Easy'
ORDER BY RANDOM()
LIMIT 1;
```

### Filter by Difficulty
```sql
SELECT category, COUNT(*) as count
FROM public.experiments_library
WHERE difficulty = 'Easy'
GROUP BY category;
```

### Search by Name
```sql
SELECT *
FROM public.experiments_library
WHERE name ILIKE '%meditation%';
```

## Integration with App

### ExperimentsService Methods

```typescript
// Fetch all experiments from library
static async getExperimentsLibrary(category?: string) {
  let query = supabase
    .from('experiments_library')
    .select('*')
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  return await query;
}

// Get experiment by ID
static async getExperimentTemplate(id: string) {
  return await supabase
    .from('experiments_library')
    .select('*')
    .eq('id', id)
    .single();
}

// Filter by difficulty
static async getExperimentsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard') {
  return await supabase
    .from('experiments_library')
    .select('*')
    .eq('difficulty', difficulty)
    .order('category', { ascending: true });
}
```

## Row Level Security (RLS)

### Read Policy
All users (authenticated and anonymous) can read from experiments_library:
```sql
CREATE POLICY "Experiments library is publicly readable"
  ON public.experiments_library
  FOR SELECT
  USING (true);
```

### Write Policy
Only authenticated users can insert (admin use):
```sql
CREATE POLICY "Only authenticated users can insert experiments"
  ON public.experiments_library
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

## Verification Queries

### Check Total Count
```sql
SELECT COUNT(*) FROM public.experiments_library;
-- Expected: 221 (or more)
```

### Verify Categories
```sql
SELECT category, COUNT(*) as count
FROM public.experiments_library
GROUP BY category
ORDER BY category;
```

### Check Difficulty Distribution
```sql
SELECT difficulty, COUNT(*) as count
FROM public.experiments_library
GROUP BY difficulty
ORDER BY difficulty;
```

## Maintenance

### Update Experiment
```sql
UPDATE public.experiments_library
SET description = 'Updated description...'
WHERE name = 'Consistent bedtime routine';
```

### Add New Experiment
```sql
INSERT INTO public.experiments_library (name, category, instructions, description, emoji, difficulty)
VALUES (
  'New experiment name',
  'Sleep',
  'Instructions here...',
  'Expected outcomes...',
  '😴',
  'Medium'
);
```

### Delete Experiment
```sql
DELETE FROM public.experiments_library
WHERE name = 'Experiment to remove';
```

## Future Enhancements

- [ ] Add `benefits` array with specific benefit tags
- [ ] Add `tags` array for advanced filtering
- [ ] Add `popularity_score` based on usage
- [ ] Add `success_rate` based on user completions
- [ ] Add `related_experiments` array for recommendations
- [ ] Add `scientific_references` for evidence-based experiments

## Troubleshooting

### Issue: "relation already exists"
**Solution**: Drop the existing table first:
```sql
DROP TABLE IF EXISTS public.experiments_library CASCADE;
```

### Issue: Duplicate key violations
**Solution**: The seed scripts use `ON CONFLICT (name) DO NOTHING` to prevent duplicates. Run again safely.

### Issue: RLS policies blocking access
**Solution**: Verify RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'experiments_library';
```

## Related Files
- [experiments.json](../experiments.json) - Source JSON data
- [create_experiments_library.sql](migrations/create_experiments_library.sql) - Schema
- [seed_experiments_library.sql](migrations/seed_experiments_library.sql) - Sleep seeds
- [seed_experiments_mood.sql](migrations/seed_experiments_mood.sql) - Mood seeds
- [seed_experiments_remaining.sql](migrations/seed_experiments_remaining.sql) - Other categories

## Support
For questions or issues, check the main project documentation or create an issue in the repository.
