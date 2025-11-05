# 🔧 URGENT: Database Tables Missing

## ❌ Current Error
```
Could not find the table 'public.profiles' in the schema cache
Could not find the table 'public.user_preferences' in the schema cache
```

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your **Betternapped** project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Run This SQL to Fix Missing Columns

**If you already created the tables**, run this to add missing columns:

```sql
-- Add missing theme columns to user_preferences
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS icon_pack TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS emoji_palette TEXT DEFAULT 'apple';
```

**OR if tables don't exist yet**, run the full migration from:
📁 `database/migrations/add-profiles-and-preferences.sql`

### Step 3: Click "Run" Button
Press `Ctrl+Enter` or click **Run** button

### Step 4: IMPORTANT - Refresh Schema Cache
1. In Supabase Dashboard, go to **API** section (left sidebar)
2. Scroll down and click **"Refresh schema cache"** button
3. Wait for confirmation

### Step 5: Verify Success
1. Go to **Table Editor**
2. Click on `user_preferences` table
3. Verify you see columns: `color_theme`, `theme_mode`, `icon_pack`, `emoji_palette`

### Step 6: Restart App
```powershell
# Stop current Expo (Ctrl+C)
npx expo start
```

## 🎯 Done!
The errors should be gone. The app will now work properly.

## 📚 For More Details
See: `DATABASE_MIGRATION_GUIDE.md`
