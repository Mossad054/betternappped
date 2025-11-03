# Supabase Authentication Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `betternapped-app`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Update App Configuration

1. Open `app.json` in your project
2. Replace the placeholder values in the `extra` section:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-actual-project-id.supabase.co",
      "supabaseAnonKey": "your-actual-anon-key-here"
    }
  }
}
```

### Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema
5. You should see "Success. No rows returned" for each table creation

### Step 5: Enable Auto-Seed Data (Optional)

1. In Supabase SQL Editor, create a new query
2. Copy and paste the contents of `database/auto-seed-new-user.sql`
3. Click "Run" to create the auto-seed function
4. This will automatically create sample data when users sign up

### Step 6: Test Your Setup

1. Restart your Expo development server:
   ```bash
   npx expo start --clear
   ```
2. Check the console logs for:
   - ✅ "Supabase connection verified successfully"
   - No error messages about connection failures

3. Try signing up a new user:
   - Go to the signup screen
   - Enter a test email and password
   - Check console logs for detailed auth flow
   - Check Supabase dashboard → Authentication → Users to see the new user

## 🔧 Troubleshooting

### Issue: "Supabase connection test failed"

**Possible causes:**
1. **Placeholder credentials**: Make sure you replaced the placeholder values in `app.json`
2. **Invalid URL/Key**: Double-check you copied the correct values from Supabase dashboard
3. **Network issues**: Check your internet connection
4. **Project not ready**: Wait a few more minutes if you just created the project

**Solution:**
```bash
# Check your app.json has real values
cat app.json | grep -A 2 "extra"
```

### Issue: "Sign up button does nothing"

**Check console logs for:**
- "AUTH ATTEMPT: SIGNUP" - Button is working
- "Supabase response" - API call is made
- Any error messages

**Common fixes:**
1. Ensure Supabase URL/key are correct
2. Check internet connection
3. Verify database schema was created

### Issue: "User created but can't sign in"

**Check:**
1. Supabase dashboard → Authentication → Users
2. Look for your test user
3. Check if email confirmation is required
4. Try the "forgot password" flow

### Issue: "No data appears after login"

**Solution:**
1. Run the auto-seed function: `database/auto-seed-new-user.sql`
2. Or manually seed data: `database/seed-mock-data.sql`
3. Check Supabase dashboard → Table Editor to see if data exists

## 📊 Verifying Your Setup

### Check Supabase Dashboard

1. **Authentication → Users**: Should show your test users
2. **Table Editor**: Should show tables (users, mood_logs, activities, etc.)
3. **SQL Editor**: Should be able to run queries

### Check App Console Logs

Look for these success messages:
```
🚀 App starting - testing Supabase connection...
✅ Supabase connection verified successfully
🔐 AUTH ATTEMPT: SIGNUP
✅ AUTH RESULT: SIGNUP
```

### Test Complete Flow

1. **Sign Up**: Create a new account
2. **Check Dashboard**: User appears in Supabase
3. **Sign In**: Login with the account
4. **Check Data**: Sample data should be visible in app
5. **Add Entry**: Try adding new mood/activity data

## 🎯 Next Steps

Once authentication is working:

1. **Test all features**: Mood tracking, activities, sleep logs, habits
2. **Add real data**: Use the app normally to build up your data
3. **Check analytics**: Verify insights and correlations work
4. **Test offline**: Ensure app handles network issues gracefully

## 🆘 Still Having Issues?

1. **Check the console logs** - they now provide detailed debugging info
2. **Verify Supabase project** - make sure it's active and not paused
3. **Test with a simple email/password** - avoid special characters initially
4. **Try the forgot password flow** - this tests the full auth pipeline

## 📝 Manual Data Seeding

If auto-seed doesn't work, you can manually add test data:

1. Get your user ID from Supabase dashboard → Authentication → Users
2. Copy the UUID (looks like: `12345678-1234-1234-1234-123456789abc`)
3. Open `database/seed-mock-data.sql`
4. Replace `USER_ID_HERE` with your actual user ID
5. Run the script in Supabase SQL Editor

This will create 30 days of realistic sample data for testing all app features.

