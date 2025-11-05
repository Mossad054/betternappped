# Add Instruction Column to Habits Table

## Issue
The app is trying to insert habits with an `instruction` field, but the database column doesn't exist yet.

**Error:**
```
Could not find the 'instruction' column of 'habits' in the schema cache
```

## Solution

You need to run the migration to add the `instruction` column to your Supabase database.

### Option 1: Run Migration via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Add instruction column to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS instruction TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.habits.instruction IS 'Detailed instructions for completing the habit and expected outcomes';
```

5. Click **Run** to execute the migration
6. Verify the column was added by going to **Table Editor** > **habits** table

### Option 2: Run Migration via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project directory
cd "c:\Users\ROLSS_IWCF TC 6\projects\Betternapped"

# Apply the migration
supabase db push

# Or apply specific migration file
psql -h [your-db-host] -U postgres -d postgres -f database/migrations/005_add_instruction_to_habits.sql
```

### Option 3: Run via Terminal with psql

If you have direct database access:

```bash
psql postgresql://postgres:[your-password]@[your-host]:5432/postgres -f database/migrations/005_add_instruction_to_habits.sql
```

## Verification

After running the migration, verify it worked:

1. In Supabase Dashboard, go to **Table Editor** > **habits**
2. You should see the new `instruction` column (type: TEXT)
3. Try adding a habit from the app - it should work without errors

## After Migration

Once the column is added:
- Existing habits will have `NULL` for instruction (which is fine)
- New habits will be created with their specific instructions
- The app will display habit-specific instructions instead of generic text

## Rollback (if needed)

If you need to remove the column:

```sql
ALTER TABLE public.habits DROP COLUMN IF EXISTS instruction;
```

## Migration File Location

The migration file is located at:
```
database/migrations/005_add_instruction_to_habits.sql
```
