# Database Migration: Add Missing Tables

## Problem
The app is failing with errors about missing tables:
- `profiles` table not found
- `user_preferences` table not found

## Solution
Run the migration SQL to create these tables in your Supabase database.

## Steps to Fix

### 1. Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **Betternapped**
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Migration
1. Click **New Query**
2. Copy the entire contents of `database/migrations/add-profiles-and-preferences.sql`
3. Paste into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### 3. Verify Tables Created
1. Go to **Table Editor** in the left sidebar
2. You should now see:
   - `profiles` table
   - `user_preferences` table

### 4. Restart Your App
```powershell
# Stop the current Expo process (Ctrl+C in terminal)
# Then restart:
npx expo start
```

## What These Tables Do

### `profiles` Table
Stores user profile information:
- Full name
- Avatar URL
- Bio
- PIN code settings
- Biometric authentication settings
- Theme preference (light/dark/auto)

### `user_preferences` Table
Stores user notification and app preferences:
- Notification settings for each feature (habits, experiments, sleep, mood)
- Quiet hours (start/end time)
- Timezone
- Language preference

## Auto-Creation
Both tables will be automatically populated when:
- A new user signs up
- An existing user logs in (via the trigger function)

## Security
- Both tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Policies enforce user_id matching with authenticated user

## Tables Schema

### profiles
```sql
- id: UUID (primary key, references auth.users)
- user_id: UUID (unique, references auth.users)
- full_name: TEXT
- avatar_url: TEXT
- bio: TEXT
- pin_code: TEXT
- pin_enabled: BOOLEAN (default: false)
- biometric_enabled: BOOLEAN (default: false)
- theme_preference: TEXT (default: 'light')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### user_preferences
```sql
- id: UUID (primary key)
- user_id: UUID (unique, references auth.users)
- notification_settings: JSONB (default settings included)
- quiet_hours_start: TIME
- quiet_hours_end: TIME
- timezone: TEXT (default: 'UTC')
- language: TEXT (default: 'en')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Troubleshooting

### If migration fails
1. Check if tables already exist (they might be partially created)
2. Drop existing tables if needed:
   ```sql
   DROP TABLE IF EXISTS public.user_preferences CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   ```
3. Run the migration again

### If app still shows errors after migration
1. Refresh the Supabase schema cache:
   - In Supabase Dashboard → API → Refresh schema cache
2. Restart your app
3. Clear app cache if needed:
   ```powershell
   npx expo start --clear
   ```
