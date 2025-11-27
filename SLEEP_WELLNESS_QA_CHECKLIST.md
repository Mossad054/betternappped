# Sleep Wellness Hub - QA Test Plan & Checklist

**Date:** 2025-11-26
**Version:** 1.0
**Status:** Ready for Testing

---

## 📋 Test Environment Setup

### Prerequisites
- [ ] Database migrations run successfully
- [ ] Seed data inserted (30+ recommendation rules)
- [ ] Test users created with various data profiles
- [ ] Development environment running

### Test User Profiles

Create the following test users with different data patterns:

**User 1: "No Data Newbie"**
- 0 sleep logs
- **Expected:** Empty states, welcome messages, baseline recommendations

**User 2: "Inconsistent Sleeper"**
- 14 sleep logs
- Bedtimes vary by 2-3 hours
- Hours range: 5-9h
- Quality: mixed (2-4)
- **Expected:** Consistency recommendations, irregular pattern detection

**User 3: "Optimal Performer"**
- 30 sleep logs
- Consistent bedtime (±15 minutes)
- Hours: 7-8.5h
- Quality: 4-5
- **Expected:** Positive reinforcement, maintenance recommendations

**User 4: "Sleep Deprived"**
- 20 sleep logs
- Hours: 4-6h consistently
- Quality: 1-3
- **Expected:** Critical duration recommendations, quality improvement tips

**User 5: "Weekend Warrior"**
- 30 sleep logs
- Weekdays: 6h average
- Weekends: 10h average
- **Expected:** Social jet lag detection, consistency recommendations

---

## 🗄️ Database & Migration Tests

### Migration Execution
- [ ] **Test:** Run `create_sleep_recommendations.sql`
  - [ ] Tables created without errors
  - [ ] Check: `sleep_recommendation_rules` exists
  - [ ] Check: `user_sleep_recommendations` exists
  - [ ] Verify columns match schema
  - [ ] Verify indexes created

- [ ] **Test:** Run `seed_sleep_recommendations.sql`
  - [ ] Seed completes without errors
  - [ ] Verify count: `SELECT COUNT(*) FROM sleep_recommendation_rules WHERE active = true;`
  - [ ] Expected: ≥ 30 rows
  - [ ] Verify tags: `SELECT DISTINCT unnest(tags) FROM sleep_recommendation_rules;`
  - [ ] Expected: Multiple tag categories

### RLS Policies
- [ ] **Test:** User A cannot see User B's recommendations
  - [ ] Create recommendation for User A
  - [ ] Query as User B
  - [ ] Expected: Empty result

- [ ] **Test:** User can insert own recommendations
  - [ ] Attempt insert with matching user_id
  - [ ] Expected: Success

- [ ] **Test:** User cannot insert for other user
  - [ ] Attempt insert with different user_id
  - [ ] Expected: Permission denied error

### Triggers
- [ ] **Test:** Auto-update timestamps
  - [ ] Insert recommendation rule
  - [ ] Note created_at
  - [ ] Update rule
  - [ ] Verify updated_at > created_at

---

## 🔧 Backend Service Tests

### Test: getLastNightSummary()

**Test Case 1.1: User with No Data**
```typescript
const result = await SleepWellnessService.getLastNightSummary('user_1_id', 7);
```
- [ ] Returns data (not null)
- [ ] `nights_total` = 0
- [ ] `last_night_hours` = null
- [ ] `message` contains "No sleep data available"
- [ ] No errors thrown

**Test Case 1.2: User with 7 Nights, All Met Target (8h)**
```typescript
// Setup: Insert 7 logs, all 8h or more
const result = await SleepWellnessService.getLastNightSummary('user_3_id', 7);
```
- [ ] `nights_meeting_target` = 7
- [ ] `nights_total` = 7
- [ ] `meets_all_nights` = true
- [ ] `message` contains "Excellent" or "met your target"
- [ ] `last_night_hours` ≥ 8

**Test Case 1.3: User with Mixed Performance**
```typescript
// Setup: 3 nights met target, 4 didn't
const result = await SleepWellnessService.getLastNightSummary('user_2_id', 7);
```
- [ ] `nights_meeting_target` = 3
- [ ] `nights_total` = 7
- [ ] `meets_all_nights` = false
- [ ] `message` contains "3/7 nights"

**Test Case 1.4: Last Night Below Target**
```typescript
// Setup: Last night = 5h, target = 8h
const result = await SleepWellnessService.getLastNightSummary('user_4_id', 7);
```
- [ ] `last_night_hours` < `target_hours`
- [ ] `message` mentions "slept {X}h (target: 8h)"

**Test Case 1.5: Custom Target**
```typescript
const result = await SleepWellnessService.getLastNightSummary('user_3_id', 7, 9.0);
```
- [ ] `target_hours` = 9.0
- [ ] Achievement calculated against 9h, not 8h

**Test Case 1.6: Bedtime/Wake Time Calculation**
```typescript
// Setup: Log with bedtime="22:30", wake_time="06:30", hours=null
const result = await SleepWellnessService.getLastNightSummary('user_id', 1);
```
- [ ] `last_night_hours` calculated as 8.0h
- [ ] Calculation handles midnight crossing

---

### Test: getWeeklyOverview()

**Test Case 2.1: Full Week with Data**
```typescript
const result = await SleepWellnessService.getWeeklyOverview('user_3_id', '2025-11-18');
```
- [ ] Returns array of 7 days
- [ ] Each day has: date, hours_slept, sleep_quality, habits_completed
- [ ] Dates are sequential (Mon-Sun)
- [ ] Hours calculated correctly

**Test Case 2.2: Partial Week (Only 3 Days)**
```typescript
// Setup: Logs for Mon, Wed, Fri only
const result = await SleepWellnessService.getWeeklyOverview('user_2_id', '2025-11-18');
```
- [ ] Returns 7 days (all days present)
- [ ] Days without data have hours_slept = null
- [ ] Days with data show correct hours

**Test Case 2.3: Habit Completions Integrated**
```typescript
// Setup: User has 2 sleep habits, completed Mon & Wed
const result = await SleepWellnessService.getWeeklyOverview('user_id', '2025-11-18');
```
- [ ] Monday's habits_completed array has 2 items
- [ ] Completed flags match completion log
- [ ] Habit names populated from habits_library
- [ ] Days without completions have empty array

**Test Case 2.4: Quality Ratings**
```typescript
const result = await SleepWellnessService.getWeeklyOverview('user_3_id', '2025-11-18');
```
- [ ] sleep_quality populated where available
- [ ] null for days with no quality rating

---

### Test: getThisWeekSummary()

**Test Case 3.1: Current Week (Partial)**
```typescript
// Today is Wednesday
const result = await SleepWellnessService.getThisWeekSummary('user_3_id');
```
- [ ] week_start = last Monday
- [ ] week_end = today (Wednesday)
- [ ] nights_total = 3 (Mon, Tue, Wed)
- [ ] average_sleep_hours calculated from 3 nights

**Test Case 3.2: Target Achievement Calculation**
```typescript
// Setup: 4 nights, 2 met target
const result = await SleepWellnessService.getThisWeekSummary('user_2_id');
```
- [ ] nights_target_met = 2
- [ ] percent_target_achievement = 50.0
- [ ] Calculation matches manual: (2/4) * 100

**Test Case 3.3: No Data This Week**
```typescript
const result = await SleepWellnessService.getThisWeekSummary('user_1_id');
```
- [ ] average_sleep_hours = 0
- [ ] nights_total = 0
- [ ] percent_target_achievement = 0

---

### Test: getSleepDurationTrend()

**Test Case 4.1: 30-Day Trend**
```typescript
const result = await SleepWellnessService.getSleepDurationTrend('user_3_id', 30);
```
- [ ] Returns array sorted by date (ascending)
- [ ] Each entry has: date, hours, quality
- [ ] No duplicate dates
- [ ] Quality is null when not available

**Test Case 4.2: Empty Data**
```typescript
const result = await SleepWellnessService.getSleepDurationTrend('user_1_id', 30);
```
- [ ] Returns empty array []
- [ ] No error thrown

---

### Test: getSleepConsistency()

**Test Case 5.1: High Consistency**
```typescript
// Setup: Bedtimes all within 10 minutes of each other
const result = await SleepWellnessService.getSleepConsistency('user_3_id', 30);
```
- [ ] consistency_percent > 80
- [ ] avg_bedtime_variance_minutes < 20

**Test Case 5.2: Low Consistency**
```typescript
// Setup: Bedtimes vary by 2-3 hours
const result = await SleepWellnessService.getSleepConsistency('user_2_id', 30);
```
- [ ] consistency_percent < 50
- [ ] avg_bedtime_variance_minutes > 60

**Test Case 5.3: Insufficient Data (< 2 nights)**
```typescript
const result = await SleepWellnessService.getSleepConsistency('user_1_id', 30);
```
- [ ] consistency_percent = 0
- [ ] days_analyzed < 2

---

### Test: getWeekdayWeekendComparison()

**Test Case 6.1: Weekend Sleeper**
```typescript
// Setup: Weekdays avg 6h, weekends avg 10h
const result = await SleepWellnessService.getWeekdayWeekendComparison('user_5_id', 30);
```
- [ ] weekday_avg ≈ 6.0
- [ ] weekend_avg ≈ 10.0
- [ ] difference ≈ 4.0 (positive)
- [ ] weekday_count + weekend_count = 30

**Test Case 6.2: Consistent Sleeper**
```typescript
// Setup: Both weekdays and weekends ~7.5h
const result = await SleepWellnessService.getWeekdayWeekendComparison('user_3_id', 30);
```
- [ ] weekday_avg ≈ weekend_avg
- [ ] difference ≈ 0 (< 0.5)

---

### Test: getOptimalBedtime()

**Test Case 7.1: Clear Optimal Window**
```typescript
// Setup: Best nights all between 22:00-23:00
const result = await SleepWellnessService.getOptimalBedtime('user_3_id', 60);
```
- [ ] optimal_bedtime_start ≈ "22:00" (±30 min)
- [ ] optimal_bedtime_end ≈ "23:00" (±30 min)
- [ ] confidence > 60
- [ ] explanation contains sample size and avg quality

**Test Case 7.2: Insufficient Data (< 7 nights)**
```typescript
const result = await SleepWellnessService.getOptimalBedtime('user_1_id', 60);
```
- [ ] Returns default window (e.g., 22:00-23:00)
- [ ] confidence = 0
- [ ] explanation mentions "Not enough data"

---

### Test: getDetectedPatterns()

**Test Case 8.1: Consistency Pattern Detected**
```typescript
// Setup: User with consistent bedtime and high quality
const result = await SleepWellnessService.getDetectedPatterns('user_3_id', 60);
```
- [ ] positive_patterns includes "Consistent bedtime"
- [ ] impact mentions quality improvement
- [ ] confidence ≥ 0.7

**Test Case 8.2: Social Jet Lag Detected**
```typescript
// Setup: Weekend sleep differs by 3h from weekday
const result = await SleepWellnessService.getDetectedPatterns('user_5_id', 60);
```
- [ ] negative_patterns includes "Social jet lag"
- [ ] impact mentions weekend sleep difference
- [ ] explanation mentions disrupted rhythm

**Test Case 8.3: Late Bedtime Pattern**
```typescript
// Setup: User goes to bed after midnight, lower quality
const result = await SleepWellnessService.getDetectedPatterns('user_id', 60);
```
- [ ] negative_patterns includes "Late bedtime impact"
- [ ] explanation mentions quality reduction %

**Test Case 8.4: Insufficient Data**
```typescript
// < 14 nights
const result = await SleepWellnessService.getDetectedPatterns('user_1_id', 60);
```
- [ ] Returns pattern: "Insufficient data"
- [ ] explanation mentions tracking for 14+ days

---

### Test: getRecommendations()

**Test Case 9.1: Low Duration User**
```typescript
// Setup: avgSleepHours = 5.5
const result = await SleepWellnessService.getRecommendations('user_4_id', 'week', 3);
```
- [ ] Returns recommendations
- [ ] Contains "low_sleep_duration" or "very_low_sleep_duration" rule
- [ ] recommendation_text mentions adding hours
- [ ] reason contains actual user metric: "5.5h"
- [ ] tags include 'duration'

**Test Case 9.2: Inconsistent User**
```typescript
// Setup: consistencyScore = 40
const result = await SleepWellnessService.getRecommendations('user_2_id', 'week', 3);
```
- [ ] Contains consistency-related recommendation
- [ ] reason mentions consistency score (e.g., "40%")
- [ ] tags include 'consistency'

**Test Case 9.3: Optimal User**
```typescript
// Setup: avgSleepHours = 7.5, avgQuality = 4.5, consistencyScore = 90
const result = await SleepWellnessService.getRecommendations('user_3_id', 'week', 3);
```
- [ ] Contains positive reinforcement recommendations
- [ ] Tags include 'positive'
- [ ] Confidence scores reasonable (0.5-0.9)

**Test Case 9.4: New User (No Data)**
```typescript
// totalNights = 0
const result = await SleepWellnessService.getRecommendations('user_1_id', 'week', 3);
```
- [ ] Returns "getting started" recommendations
- [ ] No critical errors
- [ ] Message appropriate for new user

**Test Case 9.5: Limit Parameter**
```typescript
const result = await SleepWellnessService.getRecommendations('user_3_id', 'week', 5);
```
- [ ] Returns at most 5 recommendations
- [ ] Sorted by confidence/priority

**Test Case 9.6: Context Parameter**
```typescript
const resultWeek = await SleepWellnessService.getRecommendations('user_3_id', 'week', 3);
const resultMonth = await SleepWellnessService.getRecommendations('user_3_id', 'month', 3);
```
- [ ] Both return recommendations
- [ ] May differ based on different date ranges

---

## 🎨 Frontend Component Tests

### LastNightCard Component

**Test Case FC-1.1: Loading State**
- [ ] Open page with LastNightCard
- [ ] Verify spinner shows during load
- [ ] "Loading sleep summary..." text displays

**Test Case FC-1.2: Success State**
```typescript
// Mock: summary with last_night_hours = 7.5, target = 8
```
- [ ] Large hours value "7.5h" displays
- [ ] Color is green (≥ target) or amber (close) or red (below)
- [ ] Target bar shows progress
- [ ] Message text is dynamic (from backend)
- [ ] "Window: 7 nights" displays
- [ ] Status shows "On Track" or "In Progress"

**Test Case FC-1.3: Error State**
```typescript
// Mock: service returns error
```
- [ ] Error icon displays
- [ ] Error message shows
- [ ] "Retry" button visible
- [ ] Clicking "Retry" re-fetches data

**Test Case FC-1.4: No Data State**
```typescript
// Mock: user has 0 logs
```
- [ ] Empty state message displays
- [ ] No crash or undefined errors

**Test Case FC-1.5: Color Coding**
```typescript
// Test multiple scenarios:
// 1. hours = 8.5, target = 8 → Green
// 2. hours = 7.6, target = 8 → Amber
// 3. hours = 6.0, target = 8 → Red
```
- [ ] Colors match expected values
- [ ] Icon changes (CheckCircle for green, AlertCircle for red)

**Test Case FC-1.6: Achievement Bar**
```typescript
// Mock: 5/7 nights met target = 71.43%
```
- [ ] Progress bar fills to ~71%
- [ ] "71% achievement rate" displays
- [ ] Bar color matches performance (green/amber/red)

---

### WeeklyOverviewCard Component

**(To be implemented - similar test structure)**

**Test Case FC-2.1: 7 Days Rendered**
- [ ] Mini calendar shows 7 days (Mon-Sun)
- [ ] Each day cell has date label

**Test Case FC-2.2: Hours Display**
- [ ] Hours show on or near each day cell
- [ ] Missing days show "–" or blank

**Test Case FC-2.3: Quality Color Coding**
- [ ] Quality 1-2: Red background/border
- [ ] Quality 3: Amber
- [ ] Quality 4-5: Green

**Test Case FC-2.4: Habit Markers**
- [ ] Habit completion dots show below calendar
- [ ] Each habit type has distinct color
- [ ] Legend displays habit types and colors

**Test Case FC-2.5: Day Press Interaction**
- [ ] Tapping a day opens detail modal
- [ ] Modal shows day's sleep data and habits

---

### ThisWeekSection Component

**(To be implemented)**

**Test Case FC-3.1: Metrics Display**
- [ ] Average sleep hours displays (e.g., "7.2h")
- [ ] Target achievement displays (e.g., "5/7 nights (71%)")
- [ ] Weekly total displays (e.g., "50.4h")

**Test Case FC-3.2: Progress Bar**
- [ ] Bar fills according to achievement %
- [ ] Color matches performance

---

### SleepTrendsPage

**(To be implemented - comprehensive tests)**

**Test Case FC-4.1: Duration Trend Chart**
- [ ] Chart renders without overflow
- [ ] X-axis shows date labels
- [ ] Y-axis shows hour labels (0-10h)
- [ ] Bars are correct height (proportional to hours)
- [ ] Tooltip/press shows exact value

**Test Case FC-4.2: Consistency Card**
- [ ] Percentage displays (e.g., "85%")
- [ ] Variance in minutes shows
- [ ] Visual indicator (circle or bar) updates

**Test Case FC-4.3: Weekday vs Weekend Card**
- [ ] Both averages display
- [ ] Difference highlighted
- [ ] Visual comparison (dual bars or similar)

**Test Case FC-4.4: Optimal Bedtime Card**
- [ ] Time range displays (HH:MM - HH:MM)
- [ ] Confidence indicator visible
- [ ] Explanation text readable

**Test Case FC-4.5: Patterns Card**
- [ ] Positive patterns in green section
- [ ] Negative patterns in amber/red section
- [ ] Each pattern expandable/collapsible
- [ ] Icons present

**Test Case FC-4.6: Recommendations Card**
- [ ] 3 recommendations show
- [ ] Reason text personalized (user metrics filled)
- [ ] "Try This" button functional
- [ ] Clicking button triggers action (TBD)

---

### Updated Sleep Wellness Hub

**Test Case FC-5.1: Components Integrated**
- [ ] LastNightCard appears on page
- [ ] WeeklyOverviewCard appears
- [ ] ThisWeekSection appears
- [ ] Recommendations section uses dynamic data (not hardcoded)

**Test Case FC-5.2: Link to Trends**
- [ ] "View Detailed Trends" link/button visible
- [ ] Clicking navigates to Trends page

---

### Duplicate Close Buttons Audit

**Test Case FC-6.1: Wind Down Page**
- [ ] Open wind down page/modal
- [ ] Count close buttons: Expected = 1
- [ ] Close button in consistent position (top-right)
- [ ] Pressing close button dismisses modal/returns to previous screen

**Test Case FC-6.2: Check-in Page**
- [ ] Open check-in page/modal
- [ ] Count close buttons: Expected = 1
- [ ] Position consistent

**Test Case FC-6.3: Content Library**
- [ ] Open content library page/modal
- [ ] Count close buttons: Expected = 1
- [ ] Position consistent

---

## ⚡ Performance Tests

**Test Case P-1: Endpoint Response Time**
- [ ] All endpoints respond in < 2 seconds (on reasonable dataset ≤ 1000 logs)
- [ ] Measure:
  - getLastNightSummary: ___ ms
  - getWeeklyOverview: ___ ms
  - getThisWeekSummary: ___ ms
  - getSleepDurationTrend: ___ ms
  - getSleepConsistency: ___ ms
  - getWeekdayWeekendComparison: ___ ms
  - getOptimalBedtime: ___ ms
  - getDetectedPatterns: ___ ms
  - getRecommendations: ___ ms

**Test Case P-2: Chart Rendering**
- [ ] Duration trend chart renders smoothly (no lag or jitter)
- [ ] No frame drops when scrolling

**Test Case P-3: Memory Leaks**
- [ ] Open and close LastNightCard 10 times
- [ ] Check memory usage (shouldn't grow unbounded)

---

## ♿ Accessibility Tests

**Test Case A-1: Screen Reader Labels**
- [ ] All buttons have accessible labels
- [ ] Chart data has text alternatives (e.g., "Sleep duration: 7.5 hours")
- [ ] Error messages are announced

**Test Case A-2: Color Contrast**
- [ ] Text on green background meets WCAG AA
- [ ] Text on amber background meets WCAG AA
- [ ] Text on red background meets WCAG AA
- [ ] Secondary text readable

**Test Case A-3: Touch Targets**
- [ ] All buttons ≥ 44x44pt
- [ ] Close buttons large enough
- [ ] Chart bars tappable (if interactive)

---

## 🔄 Edge Cases & Boundary Tests

**Test Case E-1: Date Boundaries**
- [ ] End of month: February 28 → March 1
- [ ] End of year: December 31 → January 1
- [ ] Leap year: February 29 handled

**Test Case E-2: Midnight Crossing**
```typescript
// Bedtime = 23:30, wake_time = 07:00
```
- [ ] Calculates 7.5 hours (not negative)

**Test Case E-3: Very Large Dataset**
```typescript
// User with 1000+ sleep logs
```
- [ ] Queries don't timeout
- [ ] Pagination or limits applied correctly

**Test Case E-4: Incomplete Data**
- [ ] Log with null bedtime, null wake_time, null quality
- [ ] Service doesn't crash
- [ ] Returns sensible defaults or null

**Test Case E-5: Extreme Values**
```typescript
// hours = 0.5 (30 minutes)
// hours = 15 (very long sleep)
```
- [ ] Charts handle outliers gracefully
- [ ] Recommendations don't crash

---

## 🗂️ Data Consistency Tests

**Test Case D-1: Same Metrics Across Pages**
- [ ] "Average sleep" on Sleep Wellness Hub = "Average sleep" on Trends page
- [ ] "Target achievement" consistent everywhere
- [ ] No conflicting numbers

**Test Case D-2: Rounding Consistency**
- [ ] Hours always rounded to 1 decimal (e.g., "7.5h")
- [ ] Percentages always rounded to 0 decimals (e.g., "85%")

**Test Case D-3: Date Format Consistency**
- [ ] Dates displayed consistently (e.g., "Nov 20" vs "11/20/2025")

---

## 🚀 Integration Tests

**Test Case I-1: Log New Sleep → See Updated Stats**
1. [ ] Note current "Last Night" hours
2. [ ] Log a new sleep entry for tonight
3. [ ] Refresh LastNightCard
4. [ ] Verify "Last Night" updates to new entry
5. [ ] Verify "This Week" average updates

**Test Case I-2: Complete Habit → See in Weekly Overview**
1. [ ] Complete a sleep habit for today
2. [ ] Refresh WeeklyOverviewCard
3. [ ] Verify habit marker appears for today

**Test Case I-3: Change Target → See Updated Recommendations**
1. [ ] Set target to 9h
2. [ ] Log several nights at 7-8h
3. [ ] Fetch recommendations
4. [ ] Verify recommendations mention being below 9h target

---

## 📊 Test Results Template

| Test Case ID | Description | Status | Notes | Tester | Date |
|-------------|-------------|--------|-------|--------|------|
| 1.1 | getLastNightSummary - No Data | ☐ Pass ☐ Fail | | | |
| 1.2 | getLastNightSummary - All Met Target | ☐ Pass ☐ Fail | | | |
| ... | ... | ... | ... | ... | ... |

---

## 🐛 Bug Report Template

**Bug ID:** SLEEP-###
**Severity:** Critical / High / Medium / Low
**Component:** Backend / Frontend / Database
**Test Case:** [e.g., Test Case 1.2]

**Description:**
[Clear description of the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Logs:**
[Attach relevant materials]

**Environment:**
- Device: [e.g., iPhone 14, Android Emulator]
- OS: [e.g., iOS 17.1]
- App Version: [e.g., 1.0.0]

---

## ✅ Sign-Off Checklist

- [ ] All database migration tests passed
- [ ] All backend service tests passed (9 endpoints)
- [ ] All frontend component tests passed
- [ ] Performance benchmarks met
- [ ] Accessibility requirements met
- [ ] Edge cases handled gracefully
- [ ] Data consistency verified
- [ ] Integration tests passed
- [ ] No P1/P2 bugs remain open
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Ready for production deployment

---

**QA Lead Signature:** ________________
**Date:** ________________

**Product Owner Approval:** ________________
**Date:** ________________

---

