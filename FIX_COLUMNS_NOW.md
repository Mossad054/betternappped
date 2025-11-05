# 🚨 IMMEDIATE FIX: Missing color_theme Column

## The Error You're Seeing
```
Could not find the 'color_theme' column of 'user_preferences' in the schema cache
```

## ⚡ 2-Minute Fix

### 1️⃣ Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard
- Open your **Betternapped** project
- Click **SQL Editor** (left sidebar)
- Click **New Query**

### 2️⃣ Copy & Paste This SQL
```sql
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS icon_pack TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS emoji_palette TEXT DEFAULT 'apple';
```

### 3️⃣ Run It
Press `Ctrl+Enter` or click **Run**

### 4️⃣ Refresh Schema Cache (CRITICAL!)
1. Click **API** in left sidebar
2. Scroll down
3. Click **"Refresh schema cache"** button
4. Wait for green checkmark ✅

### 5️⃣ Verify Columns Added
1. Click **Table Editor** (left sidebar)
2. Select `user_preferences` table
3. You should now see these columns:
   - ✅ `color_theme`
   - ✅ `theme_mode`
   - ✅ `icon_pack`
   - ✅ `emoji_palette`

### 6️⃣ Restart Your App
```powershell
# Stop Expo (Ctrl+C in terminal)
npx expo start
```

## ✨ Done!
All errors should be gone now.

---

## 🤔 Why Did This Happen?
The `user_preferences` table was created but was missing the theme-related columns that the app expects. The app tries to read/write `color_theme`, `theme_mode`, `icon_pack`, and `emoji_palette`, but they didn't exist in the database.

## 📝 What These Columns Do
- `color_theme`: User's selected color palette (default, ocean, forest, etc.)
- `theme_mode`: Light/dark mode preference (light, dark, system)
- `icon_pack`: Icon style preference
- `emoji_palette`: Emoji set preference (apple, google, twitter, etc.)

---

## 🆘 Still Having Issues?

### Schema Cache Not Refreshing?
Try this in SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

### Columns Still Not Showing?
1. Verify the ALTER TABLE command succeeded
2. Check for error messages in SQL Editor
3. Try dropping and recreating the table (see full migration in `database/migrations/add-profiles-and-preferences.sql`)

### App Still Shows Errors?
1. Clear Expo cache: `npx expo start --clear`
2. Check you're using the correct Supabase project
3. Verify your `.env` has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`
