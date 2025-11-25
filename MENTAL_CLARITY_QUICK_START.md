# Mental Clarity - Quick Start Guide

Get your Mental Clarity feature up and running in 5 minutes!

---

## Step 1: Database Migration (2 minutes)

### Open Supabase
1. Go to https://app.supabase.com
2. Click on your **Betternapped** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Run the Migration
1. Open this file: [database/FIX_MENTAL_CLARITY_SCHEMA.sql](database/FIX_MENTAL_CLARITY_SCHEMA.sql)
2. Copy **all the contents** (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor (Ctrl+V)
4. Click the green **Run** button

### Verify Success
You should see:
```
✅ Schema fix successful!
   - test_type column: EXISTS
   - timestamp column: EXISTS
   - clarity_index table: EXISTS
```

If you see this, you're good! If not, check the [troubleshooting section](#troubleshooting) below.

---

## Step 2: Restart Your App (1 minute)

### Terminal
```bash
# Stop your current dev server (Ctrl+C)

# Restart
npm start
# or
bun start
```

### App Should Load
- No errors in terminal
- No errors in app console
- App opens successfully

---

## Step 3: Test the Feature (2 minutes)

### Navigate to Mental Clarity
1. Open your app
2. Navigate to **Mental Clarity Tests** screen
   - (Location depends on your navigation setup)

### Select Tests
1. You'll see 4 test cards:
   - 🎯 **Focus Test** (90 sec)
   - 📈 **Mental Flexibility** (60 sec)
   - ⚡ **Processing Speed** (45 sec)
   - 🧠 **Working Memory** (60 sec)

2. Tap to select at least **2 tests**
   - Checkboxes will fill
   - Card borders will highlight
   - "Ready to start!" message appears

### Start Testing
1. Click **Start X Selected Tests** button
2. Complete the first test
3. Test results will auto-save
4. You'll see your score and metrics
5. Click "Next Test" or "Done"

### View Results
1. Navigate back to Mental Clarity Tests screen
2. You'll see:
   - ✅ Completed tests with "Done" badges
   - 📊 Your **Clarity Index** score
   - 🎯 Progress bar showing completion

---

## What Each Test Does

### 🎯 Focus Test (90 seconds)
**What it tests**: Sustained attention and response inhibition

**How to play**:
- Shapes will appear on screen
- Only tap when you see the ⭐ **STAR**
- Don't tap other shapes
- Be fast but accurate

**Scoring**:
- Higher score = Better focus
- Based on accuracy and reaction time

---

### 📈 Mental Flexibility (60 seconds)
**What it tests**: Cognitive adaptability and rule switching

**How to play**:
- The rule changes between "Match Color" and "Match Shape"
- Tap the correct shape based on current rule
- Adapt quickly when rule switches

**Scoring**:
- Higher score = Better adaptability
- Based on accuracy during rule switches

---

### ⚡ Processing Speed (45 seconds)
**What it tests**: Quick thinking and pattern recognition

**How to play**:
- Two shapes appear
- Quickly decide if they match
- Tap "Match" or "No Match"
- Go as fast as you can

**Scoring**:
- Higher score = Faster processing
- Based on speed and accuracy

---

### 🧠 Working Memory (60 seconds)
**What it tests**: Short-term recall under pressure

**How to play**:
- Shapes appear one at a time
- Remember shapes from N positions back
- Tap when current shape matches N-back
- N increases as you improve

**Scoring**:
- Higher score = Better working memory
- Based on accuracy and N-level achieved

---

## Understanding Your Clarity Index

After completing tests, you'll get a **Clarity Index** (0-100):

### Score Breakdown
```
Combined Score = (
  Focus × 30% +
  Memory × 30% +
  Flexibility × 20% +
  Speed × 20%
)
```

### What Your Score Means

| Score | Interpretation |
|-------|----------------|
| 80-100 | 🌟 **Excellent mental clarity!** You're operating at peak cognitive performance. |
| 60-79 | ✅ **Good cognitive balance** - Your mental clarity is above average. |
| 40-59 | 🔔 **Moderate clarity** - There's room for improvement. |
| 0-39 | 💡 **Room for improvement** - Consider lifestyle changes to boost clarity. |

---

## Important Features

### ⏱️ 24-Hour Rate Limiting
- You can only take tests **once every 24 hours**
- This ensures accurate baseline measurements
- A countdown timer shows when you can test again
- Tests are locked until cooldown expires

### 📊 Progress Tracking
- See which tests you've completed today
- Track your Clarity Index over time
- View detailed metrics from each test

### 💾 Auto-Save
- All results automatically sync to Supabase
- No need to manually save
- Data persists across devices (if logged in)

---

## Troubleshooting

### "Column does not exist" error
**Problem**: Database schema not updated

**Solution**:
1. Go to Supabase SQL Editor
2. Run the migration script from Step 1
3. Restart your app

---

### Tests not saving
**Problem**: Supabase connection issue

**Solution**:
1. Check you're logged in to the app
2. Verify Supabase URL and API key in `.env`
3. Check console for error details
4. Ensure RLS policies are enabled

**Quick check**:
```typescript
// In your app console
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
// Should show your Supabase URL
```

---

### "Could not find table clarity_index" error
**Problem**: Migration didn't run completely

**Solution**:
1. Go to Supabase SQL Editor
2. Check if tables exist:
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('mental_clarity_tests', 'clarity_index');
   ```
3. If missing, re-run the full migration script
4. Check for any error messages in Supabase

---

### Clarity Index not showing
**Problem**: No tests completed yet

**Solution**:
1. Complete at least **one test**
2. Clarity Index will calculate automatically
3. Navigate back to main screen to see it

---

### Tests are locked immediately
**Problem**: Already tested within 24 hours

**Solution**:
- **Production**: Wait for the cooldown timer
- **Development/Testing**: Manually reset in database:
  ```sql
  -- Run in Supabase SQL Editor
  DELETE FROM mental_clarity_tests
  WHERE user_id = 'YOUR_USER_ID'
  AND date = CURRENT_DATE;
  ```
- Then restart app

---

### App crashes on test screen
**Problem**: Component error or missing dependencies

**Solution**:
1. Check console for error details
2. Ensure all dependencies installed:
   ```bash
   npm install
   # or
   bun install
   ```
3. Clear cache:
   ```bash
   npx expo start -c
   ```

---

## Advanced Usage

### View Test History
Check your past test results in Supabase:

```sql
SELECT
  test_type,
  score,
  date,
  metrics
FROM mental_clarity_tests
WHERE user_id = 'YOUR_USER_ID'
ORDER BY timestamp DESC
LIMIT 20;
```

### View Clarity Index History
See your progress over time:

```sql
SELECT
  date,
  combined_score,
  focus_score,
  flexibility_score,
  speed_score,
  memory_score
FROM clarity_index
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC
LIMIT 30;
```

### Export Data
To export your mental clarity data:

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `mental_clarity_tests` or `clarity_index`
4. Click **Export** → **CSV**

---

## Tips for Best Results

### 🌅 Take Tests at the Same Time Daily
- Morning: Measure baseline clarity
- Consistent timing = Better tracking

### 🧘 Optimal Testing Conditions
- Quiet environment
- Good lighting
- Well-rested
- Not immediately after meals
- Minimize distractions

### 📈 Track Your Patterns
- Note what affects your scores
- Sleep quality
- Diet
- Exercise
- Stress levels
- Caffeine intake

### 🎯 Use Results to Optimize
- Low scores? Adjust lifestyle
- High scores? Note what you did right
- Track correlations over weeks/months

---

## What's Next?

Now that Mental Clarity is working:

1. ✅ Complete your first test battery
2. 📊 Check your Clarity Index
3. 🗓️ Test daily for a week
4. 📈 Analyze your patterns
5. 💪 Optimize your cognitive health!

---

## Documentation

For more details, see:
- [MENTAL_CLARITY_IMPLEMENTATION_COMPLETE.md](MENTAL_CLARITY_IMPLEMENTATION_COMPLETE.md) - Full implementation details
- [MENTAL_CLARITY_FIX_GUIDE.md](MENTAL_CLARITY_FIX_GUIDE.md) - Database fix guide
- [MENTAL_CLARITY_TESTING_CHECKLIST.md](MENTAL_CLARITY_TESTING_CHECKLIST.md) - Complete testing checklist

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review console errors
3. Check Supabase logs
4. Verify database schema
5. Ensure proper authentication

---

**You're all set! 🚀**

Start testing your mental clarity and unlock insights into your cognitive performance!
