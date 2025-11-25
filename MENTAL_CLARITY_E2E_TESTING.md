# Mental Clarity Hub - End-to-End Testing Guide 🧪

## Overview

This guide provides step-by-step instructions for thoroughly testing the Mental Clarity Hub feature to ensure all functionality works correctly.

---

## Prerequisites

Before testing:

- ✅ Database migration has been run
- ✅ Development server is running
- ✅ You have a test user account
- ✅ Supabase dashboard access for verification
- ✅ Browser/app console open for monitoring errors

---

## Test Suite Structure

```
1. Database Verification Tests
2. UI/UX Tests
3. Test Execution Tests
4. Data Persistence Tests
5. Business Logic Tests
6. Error Handling Tests
7. Performance Tests
```

---

## 1. Database Verification Tests

### Test 1.1: Verify Schema Exists

**Steps**:
1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_schema = 'public'
   AND table_name = 'mental_clarity_tests';
   ```

**Expected Result**:
```
id                 | uuid
user_id            | uuid
test_type          | text
score              | integer
date               | date
metrics            | jsonb
timestamp          | timestamp with time zone
synced             | boolean
created_at         | timestamp with time zone
```

**Status**: ☐ Pass ☐ Fail

---

### Test 1.2: Verify Indexes Exist

**Steps**:
1. In Supabase SQL Editor, run:
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'mental_clarity_tests';
   ```

**Expected Result**:
Should see at least 3 indexes:
- `idx_mental_clarity_tests_user_date`
- `idx_mental_clarity_tests_user_timestamp`
- `idx_mental_clarity_tests_user_type_date`

**Status**: ☐ Pass ☐ Fail

---

### Test 1.3: Verify RLS Policies

**Steps**:
1. Run:
   ```sql
   SELECT policyname, cmd
   FROM pg_policies
   WHERE tablename = 'mental_clarity_tests';
   ```

**Expected Result**:
Should see 4 policies:
- SELECT policy
- INSERT policy
- UPDATE policy
- DELETE policy

**Status**: ☐ Pass ☐ Fail

---

## 2. UI/UX Tests

### Test 2.1: Main Screen Loads

**Steps**:
1. Navigate to Mental Clarity hub
2. Wait for screen to load

**Expected Result**:
- ✅ Screen loads without errors
- ✅ Header shows "Mental Clarity Tests"
- ✅ Progress section visible
- ✅ 4 test cards displayed (Focus, Flexibility, Speed, Memory)
- ✅ Start button visible

**Status**: ☐ Pass ☐ Fail

---

### Test 2.2: Test Selection Works

**Steps**:
1. Click on Focus test card
2. Verify checkbox toggles
3. Click on Speed test card
4. Click Focus test card again to deselect
5. Click Focus test card to reselect

**Expected Result**:
- ✅ Checkboxes toggle on/off correctly
- ✅ Card border highlights when selected
- ✅ Selection count updates in real-time
- ✅ "Select at least X more tests" message updates

**Status**: ☐ Pass ☐ Fail

---

### Test 2.3: Minimum Selection Enforced

**Steps**:
1. Deselect all tests
2. Click "Start Tests" button

**Expected Result**:
- ✅ Alert shows "Minimum Tests Required"
- ✅ Message says "Select at least 2 tests"
- ✅ Button is disabled/grayed out

**Status**: ☐ Pass ☐ Fail

---

### Test 2.4: Instructions Display Before Test

**Steps**:
1. Select 2+ tests
2. Click "Start Tests"
3. Observe intro screen for first test

**Expected Result**:
- ✅ Intro screen shows before test starts
- ✅ Instructions clearly explain how to play
- ✅ Test duration mentioned
- ✅ Visual example provided (for Focus test, shows target shape)
- ✅ "Start Test" button visible

**Status**: ☐ Pass ☐ Fail

---

## 3. Test Execution Tests

### Test 3.1: Focus Test Execution

**Steps**:
1. Select Focus test
2. Click "Start Tests"
3. Read instructions
4. Click "Start Test"
5. Wait for shapes to appear
6. Tap ONLY when target shape appears
7. Complete 90-second test

**Expected Result**:
- ✅ Timer counts down from 90 seconds
- ✅ Timer bar decreases visually
- ✅ Different shapes appear randomly
- ✅ Tapping correct shape increases "Correct" counter
- ✅ Tapping wrong shape increases "False Taps"
- ✅ Missing target increases "Missed"
- ✅ Visual feedback on tap (shape pulses)
- ✅ Test ends when timer reaches 0
- ✅ Results screen shows

**Status**: ☐ Pass ☐ Fail

**Score Achieved**: ______ / 100

---

### Test 3.2: Speed Test Execution

**Steps**:
1. Select Speed test
2. Click "Start Tests"
3. Study symbol-to-number mapping
4. Click "Start Test"
5. Match symbols to numbers quickly
6. Complete 45-second test

**Expected Result**:
- ✅ 3 random symbols shown with number mapping
- ✅ Timer counts down from 45 seconds
- ✅ Symbol and number displayed clearly
- ✅ "Match" and "No Match" buttons work
- ✅ Correct answers increase score
- ✅ Incorrect answers count as errors
- ✅ Test ends when timer reaches 0
- ✅ Results screen shows

**Status**: ☐ Pass ☐ Fail

**Score Achieved**: ______ / 100

---

### Test 3.3: Flexibility Test Execution

**Steps**:
1. Select Flexibility test
2. Complete test following instructions

**Expected Result**:
- ✅ Test runs without crashes
- ✅ Instructions are clear
- ✅ Scoring works correctly
- ✅ Results save to database

**Status**: ☐ Pass ☐ Fail

**Score Achieved**: ______ / 100

---

### Test 3.4: Memory Test Execution

**Steps**:
1. Select Memory test
2. Complete test following instructions

**Expected Result**:
- ✅ Test runs without crashes
- ✅ Instructions are clear
- ✅ Scoring works correctly
- ✅ Results save to database

**Status**: ☐ Pass ☐ Fail

**Score Achieved**: ______ / 100

---

## 4. Data Persistence Tests

### Test 4.1: Focus Test Result Saved

**Steps**:
1. Complete Focus test
2. Wait for "saving" to complete
3. Open Supabase → Table Editor
4. Select `mental_clarity_tests` table
5. Find row with `test_type = 'focus'` for today

**Expected Result**:
- ✅ Row exists in database
- ✅ `user_id` matches your user ID
- ✅ `test_type` = 'focus'
- ✅ `score` is between 0-100
- ✅ `date` is today's date
- ✅ `metrics` contains:
  - `correctTaps`
  - `missedTargets`
  - `falseTaps`
  - `avgReactionTime`
  - `focusAccuracy`
- ✅ `timestamp` is recent
- ✅ `synced` = true

**Status**: ☐ Pass ☐ Fail

**Database Row Screenshot**: _______________

---

### Test 4.2: Speed Test Result Saved

**Steps**:
1. Complete Speed test
2. Verify in Supabase Table Editor

**Expected Result**:
- ✅ Row with `test_type = 'speed'` exists
- ✅ `metrics` contains:
  - `speedCorrectMatches`
  - `incorrectMatches`
  - `totalAttempts`

**Status**: ☐ Pass ☐ Fail

---

### Test 4.3: Clarity Index Calculated

**Steps**:
1. Complete at least 2 tests
2. Open Supabase → Table Editor
3. Select `clarity_index` table
4. Find row for today

**Expected Result**:
- ✅ Row exists for today's date
- ✅ `focus_score` matches Focus test score (or 0 if not done)
- ✅ `speed_score` matches Speed test score (or 0 if not done)
- ✅ `combined_score` is calculated (not 0)
- ✅ Formula is correct:
  ```
  combined_score = (
    focus_score × 30% +
    memory_score × 30% +
    flexibility_score × 20% +
    speed_score × 20%
  )
  ```

**Status**: ☐ Pass ☐ Fail

**Manual Calculation**:
- Focus: _____ × 0.30 = _____
- Memory: _____ × 0.30 = _____
- Flexibility: _____ × 0.20 = _____
- Speed: _____ × 0.20 = _____
- **Total**: _____
- **Database Value**: _____
- **Match**: ☐ Yes ☐ No

---

## 5. Business Logic Tests

### Test 5.1: 24-Hour Rate Limiting

**Steps**:
1. Complete all 4 tests
2. Navigate back to main screen
3. Try to start tests again immediately

**Expected Result**:
- ✅ Warning banner shows "Test Cooldown Active"
- ✅ Timer shows "Next test available in XX h XX m"
- ✅ Start button is disabled
- ✅ Clicking button shows alert: "Test Limit Reached"

**Status**: ☐ Pass ☐ Fail

---

### Test 5.2: Bypass Rate Limit (Dev Only)

**Steps**:
1. In Supabase SQL Editor, run:
   ```sql
   DELETE FROM mental_clarity_tests
   WHERE user_id = 'YOUR_USER_ID'
   AND timestamp > NOW() - INTERVAL '24 hours';
   ```
2. Refresh app
3. Try to start tests again

**Expected Result**:
- ✅ Tests are now available
- ✅ No "Test Cooldown" warning
- ✅ Start button is enabled

**Status**: ☐ Pass ☐ Fail

---

### Test 5.3: Progress Tracking

**Steps**:
1. Delete recent tests (using SQL above)
2. Select 3 tests (e.g., Focus, Speed, Flexibility)
3. Complete only Focus test
4. Navigate back to main screen

**Expected Result**:
- ✅ Progress shows "1/3 completed"
- ✅ Progress bar shows 33%
- ✅ Completed tests have "Done" badge
- ✅ Incomplete tests don't have badge

**Status**: ☐ Pass ☐ Fail

---

### Test 5.4: Clarity Index Display

**Steps**:
1. Complete at least 2 tests
2. View main screen

**Expected Result**:
- ✅ "Your Clarity Index" section shows
- ✅ Large number displays combined score
- ✅ Subtext shows appropriate message:
  - "Excellent mental clarity!" (≥80)
  - "Good cognitive balance" (60-79)
  - "Moderate clarity" (40-59)
  - "Room for improvement" (<40)

**Status**: ☐ Pass ☐ Fail

**Clarity Index**: ______ / 100
**Message Shown**: ___________________

---

## 6. Error Handling Tests

### Test 6.1: No Internet Connection

**Steps**:
1. Disable internet/WiFi
2. Complete a test
3. Observe behavior

**Expected Result**:
- ✅ Test completes locally
- ✅ Alert shows "Failed to save test result"
- ✅ Error message is user-friendly
- ✅ App doesn't crash

**Status**: ☐ Pass ☐ Fail

---

### Test 6.2: User Not Logged In

**Steps**:
1. Log out
2. Navigate to Mental Clarity Tests
3. Try to start a test

**Expected Result**:
- ✅ Appropriate message shows (e.g., "Please log in")
- ✅ Or redirect to login screen
- ✅ No crash or undefined errors

**Status**: ☐ Pass ☐ Fail

---

### Test 6.3: Test Interruption

**Steps**:
1. Start a test
2. Exit screen mid-test (press back button)
3. Observe behavior

**Expected Result**:
- ✅ Confirmation alert shows: "Exit Test? Your progress will be lost"
- ✅ Clicking "Cancel" returns to test
- ✅ Clicking "Exit" navigates away
- ✅ No crash

**Status**: ☐ Pass ☐ Fail

---

## 7. Performance Tests

### Test 7.1: Load Time

**Steps**:
1. Clear app cache/data
2. Navigate to Mental Clarity Tests
3. Time how long it takes to load

**Expected Result**:
- ✅ Screen loads in < 3 seconds
- ✅ No visible lag or stuttering
- ✅ Animations are smooth

**Load Time**: ______ seconds

**Status**: ☐ Pass ☐ Fail

---

### Test 7.2: Test Animation Smoothness

**Steps**:
1. Complete Focus test
2. Observe shape animations and transitions

**Expected Result**:
- ✅ Shapes appear smoothly
- ✅ Tap feedback is immediate
- ✅ Timer bar animates smoothly
- ✅ No frame drops or stuttering

**Status**: ☐ Pass ☐ Fail

---

### Test 7.3: Database Query Performance

**Steps**:
1. In Supabase SQL Editor, run:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM mental_clarity_tests
   WHERE user_id = 'YOUR_USER_ID'
   AND date >= CURRENT_DATE - INTERVAL '30 days'
   ORDER BY timestamp DESC;
   ```

**Expected Result**:
- ✅ Query plan shows "Index Scan" (not "Seq Scan")
- ✅ Execution time < 50ms
- ✅ No sequential scans on large tables

**Execution Time**: ______ ms

**Status**: ☐ Pass ☐ Fail

---

## 8. Security Tests

### Test 8.1: RLS Prevents Cross-User Access

**Steps**:
1. Create two test users
2. As User A, complete tests
3. Log in as User B
4. Try to query User A's data:
   ```sql
   SELECT * FROM mental_clarity_tests
   WHERE user_id = 'USER_A_ID';
   ```

**Expected Result**:
- ✅ Query returns 0 rows (no access to other users' data)
- ✅ Only own data is visible

**Status**: ☐ Pass ☐ Fail

---

### Test 8.2: SQL Injection Prevention

**Steps**:
1. Try to inject malicious SQL through any input

**Expected Result**:
- ✅ All queries use parameterized statements
- ✅ No direct string concatenation
- ✅ Supabase client handles escaping

**Status**: ☐ Pass ☐ Fail

---

## Test Summary Report

**Total Tests**: 23
**Tests Passed**: _____ / 23
**Tests Failed**: _____ / 23
**Pass Rate**: _____ %

---

## Critical Failures

List any critical failures that prevent deployment:

1. _____________________________________
2. _____________________________________
3. _____________________________________

---

## Non-Critical Issues

List minor issues that can be fixed later:

1. _____________________________________
2. _____________________________________
3. _____________________________________

---

## Recommendations

Based on testing:

☐ **READY FOR PRODUCTION** - All critical tests passed
☐ **NEEDS FIXES** - Critical issues found (see above)
☐ **NEEDS MORE TESTING** - Insufficient testing completed

---

## Sign-Off

**Tested By**: ___________________
**Date**: ___________________
**Environment**: ☐ Development ☐ Staging ☐ Production
**App Version**: ___________________
**Database Version**: ___________________

---

**Notes**: ___________________________________________________
___________________________________________________________
___________________________________________________________

---

## Appendix: Test Data Cleanup

After testing, clean up test data:

```sql
-- Delete all test data for user
DELETE FROM mental_clarity_tests
WHERE user_id = 'YOUR_USER_ID';

DELETE FROM clarity_index
WHERE user_id = 'YOUR_USER_ID';
```

---

Last Updated: 2025-01-17
