# Mental Clarity - Testing Checklist

## Pre-Testing Setup

### Database Migration
- [ ] Open Supabase Dashboard at https://app.supabase.com
- [ ] Navigate to your Betternapped project
- [ ] Open SQL Editor
- [ ] Copy contents from `database/FIX_MENTAL_CLARITY_SCHEMA.sql`
- [ ] Paste and run the SQL script
- [ ] Verify success message: "✅ Schema fix successful!"

### App Setup
- [ ] Restart development server: `npm start` or `bun start`
- [ ] Clear app cache if needed
- [ ] Ensure you're logged in as a test user

---

## Functional Testing

### 1. Mental Clarity Test Screen
Navigate to Mental Clarity Tests screen

- [ ] Screen loads without errors
- [ ] All 4 test cards are displayed:
  - [ ] Focus Test (purple, 90 sec)
  - [ ] Mental Flexibility (pink, 60 sec)
  - [ ] Processing Speed (orange, 45 sec)
  - [ ] Working Memory (green, 60 sec)
- [ ] Selection checkboxes are visible
- [ ] Progress bar displays correctly
- [ ] "Select at least 2 tests" message appears initially

### 2. Test Selection
- [ ] Can select/deselect tests by tapping cards
- [ ] Can select/deselect tests by tapping checkboxes
- [ ] Checkbox visual feedback works (fills with color when selected)
- [ ] Border highlight appears on selected cards
- [ ] Selection counter updates: "X/4 tests selected"
- [ ] Info banner shows "Select at least X more test(s)" when < 2 selected
- [ ] Start button is disabled when < 2 tests selected
- [ ] Start button text says "Select at Least 2 Tests" when disabled

### 3. Focus Test
Start with Focus Test selected

- [ ] Test starts successfully
- [ ] Timer counts down from 90 seconds
- [ ] Random shapes appear (star, circle, square, triangle)
- [ ] Shapes animate when appearing
- [ ] Tapping correct shape (star) gives positive feedback
- [ ] Tapping wrong shape gives negative feedback (shake)
- [ ] Test auto-finishes at 0 seconds
- [ ] Results screen shows:
  - [ ] Score (0-100)
  - [ ] Correct taps count
  - [ ] Missed targets count
  - [ ] False taps count
  - [ ] Average reaction time
  - [ ] Accuracy percentage
- [ ] "Save Result" button appears
- [ ] Clicking save shows success message
- [ ] Navigates back to main screen

### 4. Mental Flexibility Test
Start with Flexibility Test selected

- [ ] Test starts successfully
- [ ] Timer counts down from 60 seconds
- [ ] Instructions display current rule (color/shape)
- [ ] Rule switches periodically
- [ ] Visual indicator shows rule change
- [ ] Tapping correct answer (based on rule) registers
- [ ] Tapping wrong answer shows feedback
- [ ] Test completes after 60 seconds
- [ ] Results screen shows:
  - [ ] Score (0-100)
  - [ ] Correct responses
  - [ ] Errors
  - [ ] Accuracy percentage
- [ ] Result saves successfully

### 5. Processing Speed Test
Start with Speed Test selected

- [ ] Test starts successfully
- [ ] Timer counts down from 45 seconds
- [ ] Two shapes display (reference and target)
- [ ] "Match" and "No Match" buttons appear
- [ ] Tapping correct answer registers
- [ ] New shapes appear after each answer
- [ ] Test completes after 45 seconds
- [ ] Results screen shows:
  - [ ] Score (0-100)
  - [ ] Correct matches
  - [ ] Incorrect matches
  - [ ] Total attempts
- [ ] Result saves successfully

### 6. Working Memory Test
Start with Memory Test selected

- [ ] Test starts successfully
- [ ] Timer counts down from 60 seconds
- [ ] Shapes appear one at a time
- [ ] N-back task instructions are clear
- [ ] Tap when current shape matches N positions back
- [ ] Visual feedback on correct/incorrect taps
- [ ] Difficulty increases (N-level)
- [ ] Test completes after 60 seconds
- [ ] Results screen shows:
  - [ ] Score (0-100)
  - [ ] Correct matches
  - [ ] Missed matches
  - [ ] False positives
  - [ ] N-level achieved
  - [ ] Accuracy percentage
- [ ] Result saves successfully

### 7. Clarity Index Calculation
After completing at least 2 tests

- [ ] Navigate back to Mental Clarity Tests screen
- [ ] Clarity Index section appears
- [ ] Combined score displays (0-100)
- [ ] Score interpretation text is accurate:
  - [ ] 80-100: "Excellent mental clarity!"
  - [ ] 60-79: "Good cognitive balance"
  - [ ] 40-59: "Moderate clarity"
  - [ ] 0-39: "Room for improvement"
- [ ] Completed tests show "Done" badge
- [ ] Progress bar fills based on completed tests

### 8. 24-Hour Rate Limiting
After completing any test

- [ ] Warning banner appears: "Test Cooldown Active"
- [ ] Countdown shows time until next test (e.g., "23h 59m")
- [ ] Start button is disabled
- [ ] Start button text shows: "Test Locked (Xh Ym)"
- [ ] Clicking start button shows alert: "Test Limit Reached"
- [ ] Alert message includes countdown time
- [ ] Wait 24 hours OR manually update database timestamp
- [ ] Rate limit clears after 24 hours
- [ ] Can take tests again

---

## Database Verification

### Check mental_clarity_tests Table
Run in Supabase SQL Editor:

```sql
SELECT * FROM mental_clarity_tests
WHERE user_id = 'YOUR_USER_ID'
ORDER BY timestamp DESC
LIMIT 10;
```

Verify:
- [ ] Records exist for each completed test
- [ ] `test_type` is correct ('focus', 'flexibility', 'speed', 'memory')
- [ ] `score` is between 0-100
- [ ] `date` is correct
- [ ] `metrics` JSONB contains detailed data
- [ ] `timestamp` is accurate
- [ ] `synced` is true

### Check clarity_index Table
Run in Supabase SQL Editor:

```sql
SELECT * FROM clarity_index
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC
LIMIT 5;
```

Verify:
- [ ] Record exists for today
- [ ] `focus_score`, `flexibility_score`, `speed_score`, `memory_score` are correct
- [ ] `combined_score` is weighted average (30% focus, 30% memory, 20% flexibility, 20% speed)
- [ ] `date` is today's date
- [ ] Only one record per user per day (UNIQUE constraint)

---

## Error Handling Testing

### 1. No Internet Connection
- [ ] Disable internet
- [ ] Try completing a test
- [ ] Error message displays
- [ ] App doesn't crash
- [ ] Re-enable internet and retry

### 2. Not Logged In
- [ ] Log out
- [ ] Navigate to Mental Clarity Tests
- [ ] Appropriate message/redirect occurs
- [ ] Log back in and retry

### 3. Incomplete Test
- [ ] Start a test
- [ ] Press back button mid-test
- [ ] Confirm navigation away
- [ ] No partial result saved
- [ ] Can restart test

### 4. Database Error Simulation
- [ ] Temporarily break database connection
- [ ] Try saving a test result
- [ ] Error alert appears: "Failed to save test result"
- [ ] Restore connection and retry

---

## Performance Testing

### Load Time
- [ ] Mental Clarity screen loads in < 2 seconds
- [ ] Test screens load in < 1 second
- [ ] No lag when switching between screens

### Animation Performance
- [ ] All animations are smooth (60fps)
- [ ] No jank during test gameplay
- [ ] Countdown timer is accurate
- [ ] Shape transitions are fluid

### Data Fetching
- [ ] Progress loads quickly
- [ ] Clarity Index displays without delay
- [ ] Test history fetches efficiently

---

## UI/UX Testing

### Visual Design
- [ ] All colors match theme
- [ ] Typography is consistent
- [ ] Icons are properly sized
- [ ] Shadows and elevation work correctly
- [ ] Rounded corners are consistent

### Responsive Design
- [ ] Works on small screens (iPhone SE)
- [ ] Works on large screens (iPad)
- [ ] Works on different aspect ratios
- [ ] ScrollView scrolls smoothly
- [ ] No content cut off

### Dark Mode
If your app supports dark mode:
- [ ] All screens work in dark mode
- [ ] Text is readable
- [ ] Colors are theme-aware
- [ ] No white flashes

### Accessibility
- [ ] Text is readable (sufficient contrast)
- [ ] Touch targets are at least 44x44
- [ ] Instructions are clear
- [ ] Error messages are helpful

---

## Edge Cases

### 1. Selecting All 4 Tests
- [ ] Can select all 4 tests
- [ ] Progress shows "4/4 completed" when all done
- [ ] Clarity Index includes all 4 scores
- [ ] Start button says "Start 4 Selected Tests"

### 2. Completing Tests in Different Orders
- [ ] Complete tests in order: 1, 2, 3, 4
- [ ] Complete tests in reverse: 4, 3, 2, 1
- [ ] Complete tests randomly
- [ ] Progress updates correctly in all cases

### 3. Multiple Test Sessions Per Day
- [ ] Complete 2 tests in morning
- [ ] Wait and check if can complete more
- [ ] 24-hour limit prevents additional tests
- [ ] Clarity Index updates with latest scores

### 4. Across Days
- [ ] Complete tests on Day 1
- [ ] Check Clarity Index is saved for Day 1
- [ ] Complete tests on Day 2
- [ ] Check separate Clarity Index for Day 2
- [ ] Both records exist in database

---

## Security Testing

### Row Level Security (RLS)
- [ ] User A can only see their own test results
- [ ] User A cannot see User B's test results
- [ ] User A cannot modify User B's test results
- [ ] Attempting to access other user's data fails gracefully

### SQL Injection Prevention
- [ ] Special characters in user_id don't break queries
- [ ] JSONB metrics handles special characters
- [ ] No SQL errors in console

---

## Regression Testing

Ensure existing features still work:
- [ ] Home screen loads correctly
- [ ] Other tabs work (Activity, Calendar, Journal, Settings)
- [ ] Navigation works throughout app
- [ ] No new errors in console
- [ ] App doesn't crash unexpectedly

---

## Final Checks

- [ ] All console errors resolved
- [ ] All console warnings resolved
- [ ] No memory leaks
- [ ] App bundle size is reasonable
- [ ] Database queries are optimized
- [ ] All TypeScript errors resolved
- [ ] Code is properly formatted

---

## Sign Off

### Developer Testing
- [ ] All tests pass
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] Code is production-ready

**Developer**: _________________
**Date**: _________________
**Signature**: _________________

### User Acceptance Testing (Optional)
- [ ] Feature meets requirements
- [ ] User experience is smooth
- [ ] Ready for production deployment

**Tester**: _________________
**Date**: _________________
**Signature**: _________________

---

## Notes & Issues Found

Use this space to document any issues found during testing:

1.
2.
3.

---

## Post-Testing Cleanup

After all tests pass:
- [ ] Remove any test data from database
- [ ] Clear test user accounts if needed
- [ ] Document any known issues
- [ ] Update CHANGELOG.md
- [ ] Create git commit with changes
- [ ] Tag release version (if applicable)

---

**Testing Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

**Overall Result**: [ ] Pass | [ ] Pass with Minor Issues | [ ] Fail

**Ready for Production**: [ ] Yes | [ ] No
