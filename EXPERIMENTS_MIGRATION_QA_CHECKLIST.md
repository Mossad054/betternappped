# Experiments Migration - QA Testing Checklist

## 🎯 Purpose
This checklist ensures the migration from hardcoded experiment data to database-driven experiments is working correctly across all app flows.

---

## ✅ Pre-Testing Setup

### Database Verification
- [ ] **Database migration completed**
  ```sql
  SELECT COUNT(*) FROM public.experiments_library;
  -- Expected: 221 experiments
  ```

- [ ] **Category breakdown correct**
  ```sql
  SELECT category, COUNT(*) as count
  FROM public.experiments_library
  GROUP BY category
  ORDER BY category;
  -- Expected:
  -- Anxiety: 36
  -- Energy: 35
  -- Focus: 36
  -- Mood: 38
  -- Productivity: 36
  -- Sleep: 40
  ```

- [ ] **RLS policies enabled**
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'experiments_library';
  -- Expected: Read policy for public, Insert/Update/Delete for authenticated
  ```

### App Setup
- [ ] **Dependencies installed**: `npm install` completed
- [ ] **Metro bundler running**: `npx expo start` active
- [ ] **Connected to correct Supabase instance**: Check .env file
- [ ] **User logged in**: Have test account ready

---

## 🧪 Test Scenarios

## 1. Experiments Hub - Basic Loading

### Test 1.1: Initial Page Load
**Steps**:
1. Launch app
2. Navigate to Experiments Hub (from home screen or navigation)
3. Observe initial load

**Expected Results**:
- [ ] Loading indicator appears briefly
- [ ] Experiments Hub screen loads without errors
- [ ] No console errors or warnings
- [ ] Popular tab is selected by default
- [ ] Experiment cards render with correct data

**Failure Indicators**:
- ❌ Infinite loading spinner
- ❌ "No experiments available" when there should be data
- ❌ Error messages in console
- ❌ App crashes or freezes

---

### Test 1.2: Popular Tab
**Steps**:
1. Ensure "Popular" tab is selected
2. Scroll through experiment cards

**Expected Results**:
- [ ] Displays Easy difficulty experiments from all categories
- [ ] Each card shows:
  - [ ] Experiment name
  - [ ] Emoji icon
  - [ ] Category label
  - [ ] Difficulty badge
- [ ] Cards are tappable
- [ ] Smooth scrolling performance

**Verify Data**:
- [ ] At least 10-20 experiment cards visible
- [ ] No duplicate experiments
- [ ] No placeholder or undefined values

---

### Test 1.3: Sleep Category
**Steps**:
1. Tap "Sleep" category tab
2. Wait for load
3. Review displayed experiments

**Expected Results**:
- [ ] Shows only Sleep category experiments
- [ ] Loading indicator appears during fetch
- [ ] ~40 Sleep experiments available
- [ ] All cards show 😴 emoji
- [ ] Category label shows "Sleep"

**Sample Experiments to Verify**:
- [ ] "Consistent bedtime routine"
- [ ] "Avoid screens 1 hour before bed"
- [ ] "Cool bedroom temperature"

---

### Test 1.4: Mood Category
**Steps**:
1. Tap "Mood" category tab
2. Wait for load

**Expected Results**:
- [ ] Shows only Mood category experiments
- [ ] ~38 Mood experiments available
- [ ] All cards show 😊 emoji
- [ ] Category label shows "Mood"

**Sample Experiments to Verify**:
- [ ] "Daily gratitude practice"
- [ ] "Morning sunlight exposure"
- [ ] "Social connections"

---

### Test 1.5: Focus Category
**Steps**:
1. Tap "Focus" category tab
2. Review experiments

**Expected Results**:
- [ ] Shows only Focus category experiments
- [ ] ~36 Focus experiments available
- [ ] All cards show 🧠 emoji
- [ ] Mix of Easy/Medium/Hard difficulties

**Sample Experiments to Verify**:
- [ ] "Pomodoro 25-minute focus sessions"
- [ ] "Daily single-tasking hour"
- [ ] "Morning meditation for focus"

---

### Test 1.6: Energy Category
**Steps**:
1. Tap "Energy" category tab

**Expected Results**:
- [ ] Shows only Energy category experiments
- [ ] ~35 Energy experiments available
- [ ] All cards show ⚡ emoji

**Sample Experiments to Verify**:
- [ ] "Morning sunlight exposure"
- [ ] "Drink a glass of water upon waking"
- [ ] "High-protein breakfast"

---

### Test 1.7: Anxiety Category
**Steps**:
1. Tap "Anxiety" category tab

**Expected Results**:
- [ ] Shows only Anxiety category experiments
- [ ] ~36 Anxiety experiments available
- [ ] All cards show 😌 emoji

**Sample Experiments to Verify**:
- [ ] "Practice 5-minute mindful breathing"
- [ ] "Write a daily worry journal"
- [ ] "Limit caffeine intake"

---

## 2. Experiment Template Details

### Test 2.1: Open Template Modal
**Steps**:
1. From any category, tap an experiment card
2. Observe modal/detail view

**Expected Results**:
- [ ] Modal opens smoothly
- [ ] Template details display:
  - [ ] **Name**: Experiment title (from `name` field)
  - [ ] **Emoji**: Correct icon
  - [ ] **Category**: e.g., "Sleep", "Mood"
  - [ ] **Difficulty**: Easy/Medium/Hard badge
  - [ ] **Duration Options**: e.g., "1-week" or "7 days"
  - [ ] **Instructions**: Full instructions text
  - [ ] **Description**: Expected outcomes (7 days, 14 days, 30 days)
- [ ] Close button (X) works
- [ ] Modal is scrollable if content is long

**Failure Indicators**:
- ❌ Shows "undefined" or "null" for any field
- ❌ Shows old field names (e.g., "title" instead of "name")
- ❌ Missing emoji or incorrect emoji

---

### Test 2.2: Start Experiment from Template
**Steps**:
1. Open a template detail modal
2. Tap "Start Experiment" or "Use This Template" button
3. Follow creation flow

**Expected Results**:
- [ ] Navigates to experiment creation screen
- [ ] Pre-fills with template data:
  - [ ] Activity name = template.name
  - [ ] Emoji = template.emoji
  - [ ] Suggested duration = template.duration_options[0]
- [ ] User can modify and save
- [ ] Experiment is created in database
- [ ] New experiment appears in "Active Experiments" list

---

## 3. Category Switching & Performance

### Test 3.1: Rapid Category Switching
**Steps**:
1. Quickly switch between tabs: Popular → Sleep → Mood → Focus → Energy → Anxiety
2. Repeat 3 times

**Expected Results**:
- [ ] No crashes or freezes
- [ ] Each tab loads correct category
- [ ] No duplicate data appears
- [ ] No console errors
- [ ] Loading states work correctly

**Performance Check**:
- [ ] Category switching feels responsive (< 1 second)
- [ ] No memory leaks (check Metro logs)

---

### Test 3.2: Pull-to-Refresh
**Steps**:
1. On Experiments Hub, pull down to refresh
2. Observe behavior

**Expected Results**:
- [ ] Refresh indicator appears
- [ ] Data refetches from database
- [ ] Experiments reload correctly
- [ ] No duplicate data

---

## 4. Edge Cases & Error Handling

### Test 4.1: No Internet Connection
**Steps**:
1. Disable device network connection
2. Open Experiments Hub
3. Try switching categories

**Expected Results**:
- [ ] Shows appropriate error message
- [ ] Doesn't crash the app
- [ ] User can retry when connection restored

---

### Test 4.2: Empty Category (if any)
**Steps**:
1. If a category has no experiments (shouldn't happen with seed data):
2. Navigate to that category

**Expected Results**:
- [ ] Shows "No experiments available" message
- [ ] No loading spinner stuck
- [ ] No crash

---

### Test 4.3: Database Connection Failure
**Steps**:
1. Temporarily break Supabase connection (wrong URL in .env)
2. Launch Experiments Hub

**Expected Results**:
- [ ] Shows error message to user
- [ ] Logs error to console for debugging
- [ ] App doesn't crash
- [ ] User can navigate away

---

## 5. Integration with Other Features

### Test 5.1: Create Experiment Flow
**Steps**:
1. Navigate to Create New Experiment screen
2. Verify tracking options layout:
   - [ ] Buttons arranged 2 per row
   - [ ] Not elongated on x-axis
   - [ ] Order: Mood, Sleep Quality, Energy, Focus, Anxiety, Productivity
3. Complete experiment creation

**Expected Results**:
- [ ] Can create experiment successfully
- [ ] Experiment saves to database
- [ ] Appears in Active Experiments list

---

### Test 5.2: Active Experiments List
**Steps**:
1. Create 2-3 experiments using templates
2. View "Active Experiments" section

**Expected Results**:
- [ ] All created experiments appear
- [ ] Correct details displayed (name, emoji, progress)
- [ ] Can tap to view experiment details

---

### Test 5.3: Complete Experiment Journey
**Steps**:
1. Select a template from library
2. Create experiment
3. Log daily activities
4. Complete experiment
5. View results

**Expected Results**:
- [ ] Full flow works end-to-end
- [ ] All data persists correctly
- [ ] No references to mock data appear

---

## 6. Data Integrity Checks

### Test 6.1: Field Mapping Correctness
**For each category, verify at least 3 experiments**:

| Field | Old (Mock) | New (DB) | Status |
|-------|-----------|----------|---------|
| Name | `title` | `name` | [ ] ✅ |
| Duration | `duration` | `duration_options[0]` | [ ] ✅ |
| Category | Hardcoded | `category` | [ ] ✅ |
| Difficulty | N/A | `difficulty` | [ ] ✅ |
| Instructions | `description` | `instructions` | [ ] ✅ |
| Outcomes | `outcomes` | `description` | [ ] ✅ |
| Emoji | `emoji` | `emoji` | [ ] ✅ |

---

### Test 6.2: No Mock Data References
**Search codebase**:
```bash
# Should return NO results
grep -r "EXPERIMENT_LIBRARY" app/
```

**Expected**:
- [ ] No hardcoded EXPERIMENT_LIBRARY constant found
- [ ] Only database fetching code present

---

## 7. Performance Testing

### Test 7.1: Load Time
**Measure**:
1. Time from app launch to Experiments Hub fully loaded
2. Time to switch between categories

**Benchmarks**:
- [ ] Initial load: < 2 seconds
- [ ] Category switch: < 1 second
- [ ] No noticeable lag

---

### Test 7.2: Memory Usage
**Steps**:
1. Open Experiments Hub
2. Switch between all categories multiple times
3. Check memory usage (use React Native Debugger or Metro logs)

**Expected**:
- [ ] No memory leaks
- [ ] Memory usage stable after initial load

---

## 8. Cross-Platform Testing

### iOS
- [ ] Test on iOS simulator
- [ ] Test on physical iOS device
- [ ] Verify all features work

### Android
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Verify all features work

### Web (if applicable)
- [ ] Test on web browser
- [ ] Verify responsive layout

---

## 9. Regression Testing

### Test 9.1: Existing Features Still Work
**Verify unaffected features**:
- [ ] Home screen loads correctly
- [ ] Calendar view works
- [ ] Journal entry works
- [ ] Habit tracking works
- [ ] Settings work
- [ ] Authentication works

---

## 10. Accessibility Testing

### Test 10.1: Screen Reader Support
**Steps**:
1. Enable VoiceOver (iOS) or TalkBack (Android)
2. Navigate Experiments Hub

**Expected**:
- [ ] All buttons are announced
- [ ] Experiment cards are accessible
- [ ] Modal content is readable

---

### Test 10.2: Font Scaling
**Steps**:
1. Increase system font size to maximum
2. View Experiments Hub

**Expected**:
- [ ] Text scales appropriately
- [ ] Layout doesn't break
- [ ] All content remains readable

---

## 📊 Test Results Summary

### Pass/Fail Criteria
- **Critical**: All basic loading tests (Section 1) must pass
- **High Priority**: Template details (Section 2) and integration (Section 5) must pass
- **Medium Priority**: Edge cases (Section 4) and performance (Section 7) should pass
- **Low Priority**: Accessibility (Section 10) nice to have

### Sign-Off

| Test Section | Status | Notes | Tester | Date |
|--------------|--------|-------|--------|------|
| 1. Basic Loading | [ ] Pass / [ ] Fail | | | |
| 2. Template Details | [ ] Pass / [ ] Fail | | | |
| 3. Category Switching | [ ] Pass / [ ] Fail | | | |
| 4. Edge Cases | [ ] Pass / [ ] Fail | | | |
| 5. Integration | [ ] Pass / [ ] Fail | | | |
| 6. Data Integrity | [ ] Pass / [ ] Fail | | | |
| 7. Performance | [ ] Pass / [ ] Fail | | | |
| 8. Cross-Platform | [ ] Pass / [ ] Fail | | | |
| 9. Regression | [ ] Pass / [ ] Fail | | | |
| 10. Accessibility | [ ] Pass / [ ] Fail | | | |

---

## 🐛 Bug Reporting Template

**If you find issues, use this template**:

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Test Section**: [e.g., Test 1.3 - Sleep Category]

**Steps to Reproduce**:
1.
2.
3.

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Logs**:
[Attach if available]

**Environment**:
- Platform: iOS / Android / Web
- Device: [Model]
- OS Version: [Version]
- App Version: [Version]
```

---

## ✅ Final Acceptance

**Migration is approved when**:
- [ ] All Critical and High Priority tests pass
- [ ] No P0/P1 bugs remain
- [ ] Performance benchmarks met
- [ ] Database migrations verified in production
- [ ] Rollback plan documented (if needed)

**Approved By**: ___________________
**Date**: ___________________

---

## 📚 Related Documentation
- [EXPERIMENTS_MIGRATION_COMPLETE.md](EXPERIMENTS_MIGRATION_COMPLETE.md) - Migration summary
- [EXPERIMENTS_LIBRARY_IMPLEMENTATION.md](EXPERIMENTS_LIBRARY_IMPLEMENTATION.md) - Implementation details
- [database/EXPERIMENTS_LIBRARY_README.md](database/EXPERIMENTS_LIBRARY_README.md) - Database schema docs
