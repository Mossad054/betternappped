# Scripts Directory

This directory contains utility scripts for the Betternapped app.

## Quick Start

```bash
# See all available commands
npm run demo-seeding

# Test data generation (no database required)
npm run test-data

# Preview data before inserting
npm run seed-data:dry

# Insert 30 days of data
npm run seed-data
```

## Data Seeding Script

### `seed-supabase-data.ts`

A comprehensive script that generates and inserts realistic mock data into your Supabase database for testing purposes.

#### Prerequisites

1. **Supabase Setup**: Ensure your Supabase credentials are configured in `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "https://your-project-id.supabase.co",
         "supabaseAnonKey": "your-anon-key-here"
       }
     }
   }
   ```

2. **Database Schema**: Run the SQL schema from `database/schema.sql` in your Supabase SQL editor.

3. **User Authentication**: Either:
   - Sign in to your app first (script will use authenticated user), or
   - Provide a specific user ID via command line

#### Usage

```bash
# Basic usage - seed 30 days of data for current user
npm run seed-data

# Seed 90 days of data
npm run seed-data:90

# Preview data without inserting (dry run)
npm run seed-data:dry

# Clear existing data before seeding
npm run seed-data:clear

# Advanced usage with command line arguments
npm run seed-data -- --days=60 --user-id="your-user-id-here" --dry-run
```

#### Command Line Options

- `--days=N` - Number of days to generate data for (default: 30)
- `--user-id="uuid"` - Specific user ID to seed data for
- `--dry-run` - Preview generated data without inserting
- `--clear` - Clear existing data before seeding

#### Generated Data

The script generates realistic mock data for:

**Mood Logs** (`mood_logs` table):
- Mood scores (1-5) with realistic patterns
- Weekend moods tend to be more positive
- Monday blues effect
- Varied mood arrays and emojis
- Optional notes

**Sleep Logs** (`sleep_logs` table):
- Sleep duration (5-10 hours)
- Realistic bedtime/wake time calculations
- Quality scores correlating with duration
- Weekend sleep tends to be longer
- Various waking feelings

**Activities** (`activities` table):
- Categories: exercise, social, work, hobbies, relaxation, outdoor
- Realistic activity names and durations
- Appropriate emojis per activity
- More work activities on weekdays
- More social/outdoor activities on weekends

#### Data Patterns

The script uses realistic patterns to make the data feel authentic:

- **Weekends**: More positive moods, longer sleep, more social activities
- **Weekdays**: More work activities, consistent sleep patterns
- **Monday**: Slight mood dip (Monday blues)
- **Sleep Quality**: Correlates with sleep duration
- **Activity Frequency**: 1-4 activities per day, varies by day type

#### Output

The script provides detailed progress information:

```
🌱 Starting Supabase data seeding...

🔌 Testing Supabase connection...
✅ Connected to Supabase successfully

👤 Getting user ID from auth.users...
✅ Using user ID: abc123-def456-ghi789

📊 Generating 30 days of mock data...
   📝 Mood logs: 30
   😴 Sleep logs: 30
   🎯 Activities: 87

💾 Inserting data into Supabase...
   📝 Inserting mood logs...
   😴 Inserting sleep logs...
   🎯 Inserting activities...

🎉 Data seeding completed successfully!
📊 Summary:
   📝 Mood logs: 30 inserted
   😴 Sleep logs: 30 inserted
   🎯 Activities: 87 inserted
   👤 User ID: abc123-def456-ghi789
   📅 Days: 30
```

#### Troubleshooting

**Connection Issues**:
- Verify Supabase credentials in `app.json`
- Check that your Supabase project is active
- Ensure database tables exist

**User ID Issues**:
- Sign in to your app first, or
- Use `--user-id` with a valid UUID from your `auth.users` table

**Permission Issues**:
- Ensure your Supabase anon key has insert permissions
- Check Row Level Security (RLS) policies

**Data Conflicts**:
- Use `--clear` to remove existing data first
- Check for unique constraints (mood_logs and sleep_logs have unique user_id + date)

#### Examples

```bash
# Quick test with 7 days
npm run seed-data -- --days=7

# Full 3 months of data
npm run seed-data -- --days=90

# Preview what would be generated
npm run seed-data -- --days=14 --dry-run

# Clear and reseed
npm run seed-data -- --clear --days=30
```

This script is perfect for testing your app's UI, analytics features, and data visualization components with realistic, varied data.