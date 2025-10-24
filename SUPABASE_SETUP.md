# Supabase Setup Guide

## Quick Setup

The app is currently running in **mock data mode** because Supabase environment variables are not configured. Follow these steps to enable full Supabase functionality:

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `betternapped` (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Update Your Configuration

#### Option A: Update app.json (Recommended for Expo)

Edit `app.json` and replace the placeholder values:

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

#### Option B: Create .env file (Alternative)

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

### 5. Restart Your Development Server

```bash
npx expo start --clear
```

## Verification

After setup, you should see:
- ✅ No more "Missing Supabase environment variables" errors
- ✅ Real authentication (login/signup screens)
- ✅ Data persistence across app restarts
- ✅ Real-time updates when data changes

## Troubleshooting

### Still seeing mock data?
- Check that your Supabase URL and key are correct in `app.json`
- Restart the development server with `npx expo start --clear`
- Check the console for any error messages

### Database errors?
- Make sure you ran the complete `database/schema.sql` script
- Check that Row Level Security (RLS) policies are enabled
- Verify your user is authenticated before trying to access data

### Authentication issues?
- Ensure your Supabase project has authentication enabled
- Check that email confirmation is configured if needed
- Verify the auth settings in your Supabase dashboard

## Development vs Production

- **Development**: The app works with mock data if Supabase is not configured
- **Production**: Always configure Supabase for real data persistence
- **Testing**: Use the mock/live data toggle in Settings → Developer

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- Check the console logs for detailed error messages
