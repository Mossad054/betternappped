# Authentication Fix Guide

## Problem Identified
Your app shows: **"Database error saving new user"**

This means the database trigger `handle_new_user()` is either:
1. Missing from your new database
2. Not working correctly
3. Being blocked by RLS policies

## Solution Steps

### Step 1: Run the Fix SQL Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ujeuntzazwtajjhoyebz
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `database/fix-auth-simple.sql`
5. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify the Fix

After running the SQL script, verify it worked:

1. In the SQL Editor, run this query:
```sql
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';
```

You should see one row with:
- trigger_name: `on_auth_user_created`
- table_name: `auth.users`
- function_name: `handle_new_user`
- enabled: `O` (meaning enabled)

### Step 3: Test Authentication

Run the test script:
```bash
node test-auth-flow.js
```

Expected output:
```
✅ Sign Up Successful!
✅ User record found in users table
✅ Profile record found in profiles table
✅ User preferences found
```

### Step 4: Test in Your App

1. Restart your Expo app (press `r` in the terminal)
2. Try to sign up with a new account
3. Try to sign in

## What the Fix Does

The SQL script:
1. **Drops** the old trigger and function (if they exist)
2. **Creates** a new, bulletproof trigger function that:
   - Inserts into `users` table
   - Inserts into `profiles` table
   - Inserts into `user_preferences` table
   - Uses `ON CONFLICT DO NOTHING` to prevent errors
   - Runs as `SECURITY DEFINER` to bypass RLS policies
3. **Recreates** the trigger on `auth.users`
4. **Grants** proper permissions
5. **Ensures** RLS is enabled but won't block the trigger

## Alternative: Disable Email Confirmation (Development Only)

If you want to skip email confirmation during development:

1. Go to: https://supabase.com/dashboard/project/ujeuntzazwtajjhoyebz/auth/settings
2. Scroll to **Email Auth**
3. Find **Confirm email** toggle
4. Turn it **OFF** for development
5. Remember to turn it **ON** before production!

## Troubleshooting

### Still getting "Database error"?

1. Check Supabase logs:
   - Go to **Logs** > **Postgres Logs** in your dashboard
   - Look for errors around the time you tried to sign up

2. Verify tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'user_preferences');
```

3. Check if RLS is blocking:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('users', 'profiles', 'user_preferences');
```

### Email confirmation issues?

If sign in fails with "Email not confirmed":
- This is normal if email confirmation is enabled
- Check the Supabase logs for the confirmation email
- Or disable email confirmation (see above)

## Files Reference

- `database/fix-auth-simple.sql` - Simple, bulletproof fix
- `database/fix-auth-trigger.sql` - Comprehensive fix with detailed policies
- `test-auth-flow.js` - Test authentication flow
- `test-new-db-connection.js` - Test database connection

## Need More Help?

If the issue persists:
1. Check Supabase Postgres logs
2. Share the error message from the logs
3. Verify your schema matches `database/newschema.sql`
