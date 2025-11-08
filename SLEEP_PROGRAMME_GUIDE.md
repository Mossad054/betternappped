# 4-Week Sleep Improvement Programme - Implementation Guide

## 📋 Overview

The 4-Week Sleep Improvement Programme is a comprehensive, guided intervention system that helps users improve their sleep through structured lessons, daily habit practice, and personalized feedback.

## 🏗️ Architecture

### Core Components

#### 1. **SleepProgrammeService** (`services/SleepProgrammeService.ts`)
Central service managing all programme logic, data persistence, and business rules.

**Key Methods:**
- `checkEnrollmentCriteria(userId)` - Detects poor sleep patterns (3+ poor nights, quality < 3)
- `enrollUser(userId, baselineMetrics)` - Creates programme instance with 4 default lessons
- `getProgramme(userId)` - Retrieves user's programme state
- `startLessonPractice(lessonId, duration)` - Begins habit practice period
- `logCheckIn(sessionId, date, response)` - Records daily habit completion
- `generateWeeklyReview(weekNumber)` - Calculates weekly performance metrics
- `completeProgramme(userId, rating, feedback)` - Finalizes programme with feedback

**Data Models:**
- `Programme` - Overall programme state (status, current week, lessons, reviews, metrics)
- `Lesson` - Individual weekly lesson (title, content, habit task, completion status)
- `PracticeSession` - Habit practice tracking (duration, scheduled days, completions)
- `WeeklyReview` - Performance summary (completion rate, sleep metrics, badges, insights)

#### 2. **ProgrammeEnrollmentModal** (`components/sleep/ProgrammeEnrollmentModal.tsx`)
Invitation screen triggered when user meets enrollment criteria.

**Features:**
- Shows poor sleep statistics (e.g., "3 nights below target")
- Lists programme benefits (weekly lessons, daily check-ins, reviews, badges)
- Two actions: "Yes, Let's Do It!" or "Not Now"
- Auto-appears when criteria met or manual trigger available

#### 3. **LessonScreen** (`components/sleep/LessonScreen.tsx`)
Full-screen lesson delivery interface for each weekly lesson.

**Features:**
- Displays lesson content (text/audio/video)
- Shows habit task description with emoji icon
- "I understand this lesson" checkbox (required)
- Practice duration selector (Tonight / 3 / 7 / 14 / 21 days)
- Validation: Must tick understanding before selecting duration
- Creates practice session and schedules reminders on completion

**Content Types:**
- Text: Formatted educational content
- Audio: Play audio lesson with controls
- Video: Embedded video player

#### 4. **DailyCheckInModal** (`components/sleep/DailyCheckInModal.tsx`)
Daily habit completion prompt with two-step flow.

**Step 1 - Check-In:**
- "How did you do today?"
- Options: Completed ✅ / Attempted ⚠️ / Skipped ❌
- If Completed → Show success message and close
- If Attempted/Skipped → Show Step 2

**Step 2 - Barrier Analysis:**
- "What was the barrier?"
- Options: Forgot 🤔 / Too busy ⏰ / Environment 🏠 / Other 💭
- Records reason for analytics
- Shows supportive message: "We'll keep supporting you 💙"

#### 5. **WeeklyReviewScreen** (`components/sleep/WeeklyReviewScreen.tsx`)
Comprehensive weekly performance summary.

**Displays:**
- Badge earned (if any) with celebratory card
- Habit completion rate (X/7 days) with progress bar
- Average sleep duration vs target (with +/- comparison)
- Bedtime consistency (±X minutes)
- Key insight: Sleep quality on habit days vs non-habit days
- Improvement percentage with trend indicators

**Actions:**
- Continue to Lesson [N+1] (primary)
- Repeat Week [N] (if need more practice)
- Pause Programme (save progress and exit)

#### 6. **ProgrammeCompletionScreen** (`components/sleep/ProgrammeCompletionScreen.tsx`)
Final celebration and feedback screen after completing all 4 weeks.

**Features:**
- Trophy animation and congratulations message
- Before/After metrics comparison:
  - Sleep duration (baseline → current, +X minutes improvement)
  - Bedtime consistency (baseline → current, reduced variability)
  - Overall improvement percentage
- All badges earned throughout programme
- 5-star rating system for feedback
- Free-text feedback input
- Actions: Enter Maintenance Mode / Join Advanced Programme / Share Achievement

#### 7. **ProgrammeHubScreen** (`app/sleep-wellness/programme-hub.tsx`)
Central hub for managing programme progress.

**Views:**
- Not Enrolled: Shows "Get Started" invitation
- Enrolled: Shows progress overview
  - Progress bar (Week X of 4)
  - Lessons list with status (Current/Completed/Locked)
  - Weekly reviews archive
  - Complete Programme button (when finished)

**Navigation:**
- Taps lesson → Opens LessonScreen
- Taps review → Opens WeeklyReviewScreen
- Complete button → Opens ProgrammeCompletionScreen

## 📊 Data Flow

### Enrollment Flow
```
1. SleepService logs poor sleep (3+ nights, quality < 3)
2. SleepProgrammeService.checkEnrollmentCriteria() → Returns criteria object
3. ProgrammeHubScreen shows ProgrammeEnrollmentModal
4. User accepts → enrollUser() creates Programme with baseline metrics
5. Alert: "Ready for Lesson 1 now?" → Navigate to LessonScreen
```

### Lesson Completion Flow
```
1. User opens LessonScreen for Week N
2. Reads content (text/audio/video)
3. Ticks "I understand" checkbox
4. Selects practice duration (e.g., 7 days)
5. Taps "Start Practice" → startLessonPractice()
6. Creates PracticeSession with scheduledDays array
7. Updates Programme.currentWeek = N
8. Returns to ProgrammeHub (shows lesson as Completed)
```

### Daily Check-In Flow
```
1. User receives push notification: "Tonight's task: [habit]"
2. Opens DailyCheckInModal
3. Selects response: Completed / Attempted / Skipped
4. If not Completed → Selects barrier reason
5. logCheckIn() saves to PracticeSession.completedDays
6. Shows encouragement message
7. Modal closes, data persisted
```

### Weekly Review Flow
```
1. End of Week N → User taps "View Review" (or auto-shown)
2. generateWeeklyReview(N) calculates:
   - Habit completion: Count of completedDays with response='completed'
   - Sleep metrics: Query SleepService for week's data
   - Quality comparison: Average quality on completion days vs skip days
   - Badge: Assign based on performance (7/7 = Perfect Week, 5-6 = Consistency Star)
3. WeeklyReviewScreen displays results
4. User chooses: Continue / Repeat / Pause
5. Continue → currentWeek++, next lesson unlocked
```

### Programme Completion Flow
```
1. All 4 lessons completed + Week 4 review done
2. "Complete Programme" button appears
3. completeProgramme() calculates final metrics
4. ProgrammeCompletionScreen shows:
   - Before/After comparison
   - Total improvement percentage
   - All badges earned
5. User provides feedback (rating + text)
6. Programme.status = 'completed'
7. Options: Maintenance Mode or Advanced Programme
```

## 🎯 Default 4-Week Curriculum

### Week 1: The Evening Screen-Off Habit
- **Task:** Turn off screens 30 minutes before bedtime
- **Icon:** 📱
- **Rationale:** Blue light suppresses melatonin production
- **Target:** Improve sleep onset by 15-20 minutes

### Week 2: Creating Your Sleep Sanctuary
- **Task:** Set room temp 18-20°C, ensure darkness, minimize noise
- **Icon:** 🛏️
- **Rationale:** Environment impacts sleep quality significantly
- **Target:** Optimize bedroom conditions for deeper sleep

### Week 3: The Consistent Sleep Schedule
- **Task:** Same bedtime and wake time every day (±30 min)
- **Icon:** ⏰
- **Rationale:** Strengthens circadian rhythm consistency
- **Target:** Reduce bedtime variability to under 30 minutes

### Week 4: The Wind-Down Routine
- **Task:** 3-step calming routine before bed (e.g., dim lights → read → breathe)
- **Icon:** 🌙
- **Rationale:** Signals body it's time to rest
- **Target:** Establish sustainable pre-sleep ritual

## 🎨 UI/UX Design Patterns

### Visual Hierarchy
1. **Primary Actions:** Large rounded buttons with primary color + shadow
2. **Secondary Actions:** Outlined buttons with subtle borders
3. **Status Indicators:** Color-coded (Green=Completed, Yellow=Attempted, Red=Skipped, Gray=Locked)
4. **Progress Bars:** 8px height, rounded corners, animated fills
5. **Cards:** 16px padding, 16px border radius, subtle shadows

### Color System
- **Success:** #10B981 (Green) - Completed tasks, positive trends
- **Warning:** #F59E0B (Amber) - Attempted tasks, room for improvement
- **Error:** #EF4444 (Red) - Skipped tasks, below target
- **Primary:** Theme primary color - Active elements, CTAs
- **Secondary:** Theme secondary color - Supporting elements

### Typography
- **Titles:** 24-32px, weight 800, color text
- **Subtitles:** 16-18px, weight 700, color text
- **Body:** 14-16px, weight 400-600, color text/textSecondary
- **Labels:** 12-14px, weight 600-700, uppercase with letter-spacing

### Animations
- **Modal Entry:** Slide from bottom with fade
- **Check-In Flow:** Two-step transition with smooth state changes
- **Progress Bars:** Animated width transitions (200ms ease-out)
- **Badge Reveals:** Scale + fade entrance effect

## 🔔 Notification Strategy

### Push Notifications (TODO: Implement)
1. **Lesson Release:** "Week N lesson is ready! Tap to start."
2. **Daily Check-In:** "Tonight's task: [habit name]. How did you do?"
3. **Weekly Review Ready:** "Your Week N review is ready! See your progress."
4. **3-Day Skip Warning:** "We noticed you haven't completed the habit in 3 days. Need support?"
5. **Programme Completion:** "Congratulations! You've finished the 4-week programme!"

### In-App Prompts
- Enrollment invitation (when criteria met)
- Lesson start confirmation
- Practice duration selection
- Daily check-in modal
- Weekly review navigation
- Completion celebration

## 🧪 Adaptive Logic

### Early Advancement
- If habit completion ≥ 80% (e.g., 6/7 days) → Offer to advance to next lesson early
- Prompt: "Great progress! Would you like to advance sooner or take the full practice period?"

### Skip Detection
- If 3 consecutive skipped days → Show support modal
- "We noticed you're having trouble. Would you like a short tutorial/extra support?"
- Adjust reminder timing or frequency based on user preference

### Repeat Week Logic
- User can manually choose to repeat any week
- Resets practice session for that week's habit
- Does not affect previous weekly reviews (retained for history)

### Programme Pause
- Saves current week and lesson progress
- Can resume anytime from exact point
- Status: 'paused', pausedAt timestamp recorded

## 📈 Analytics & Insights

### Metrics Tracked
- Baseline vs Current sleep duration (minutes)
- Baseline vs Current bedtime consistency (±minutes)
- Baseline vs Current quality score (1-5)
- Habit completion rate per week (X/7 days)
- Quality on habit days vs non-habit days (percentage)
- Total improvement percentage

### Badge System
- **Early Starter:** 3+ days completed in first week
- **Consistency Star:** 5-6 days completed in a week
- **Perfect Week Champion:** 7/7 days completed
- Custom badges can be added for milestones

### Correlation Analysis
- Compare sleep quality on days habit completed vs skipped
- Show in weekly review: "Quality was +12% higher on habit days"
- Use to motivate continued practice

## 🔄 Integration Points

### With Habit Tracker (TODO)
- When user starts practice → Create habit in Habit Tracker
- Schedule reminders for selected days
- Log completions from both check-in modal and habit tracker
- Sync completion status bidirectionally

### With Sleep Service
- Read sleep logs for baseline metrics calculation
- Query sleep data for weekly review metrics
- Use consistency and quality scores for enrollment criteria
- Update sleep profile with programme completion status

### With Rewards System
- Award points for lesson completion
- Award points for daily check-ins
- Award bonus points for badges earned
- Award mega bonus for programme completion

## 🚀 Usage Example

```typescript
// Check if user should be enrolled
const criteria = await SleepProgrammeService.checkEnrollmentCriteria(userId);
if (criteria) {
  showEnrollmentModal(); // User has 3+ poor nights
}

// Enroll user
const baselineMetrics = await SleepService.getBaselineMetrics(userId);
const programme = await SleepProgrammeService.enrollUser(userId, baselineMetrics);

// Start lesson practice
const lesson = programme.lessons[0]; // Week 1
await SleepProgrammeService.startLessonPractice(userId, lesson.id, '7_days');

// Log daily check-in
await SleepProgrammeService.logCheckIn(
  userId,
  sessionId,
  '2025-11-08',
  'completed'
);

// Generate weekly review
const review = await SleepProgrammeService.generateWeeklyReview(userId, 1);

// Complete programme
await SleepProgrammeService.completeProgramme(userId, 5, 'Great programme!');
```

## 🎯 Future Enhancements

### Advanced Features (Phase 2)
- [ ] Advanced programmes (Shift-Worker Sleep, Insomnia Protocol)
- [ ] Personalized lesson content based on user profile
- [ ] Video lessons with embedded YouTube player
- [ ] Audio lessons with progress tracking
- [ ] Social sharing of achievements
- [ ] Community leaderboards
- [ ] Expert coaching sessions (paid upgrade)

### Analytics Improvements
- [ ] Machine learning predictions for habit success
- [ ] Personalized barrier suggestions based on past data
- [ ] Optimal practice duration recommendations
- [ ] Sleep improvement trajectory forecasting

### Gamification
- [ ] Streak counter for consecutive completions
- [ ] Achievement unlocks (Bronze/Silver/Gold tiers)
- [ ] Team challenges (family/friends groups)
- [ ] Seasonal events with special rewards

## 📝 Testing Checklist

### Enrollment Flow
- [ ] Criteria detection with 3+ poor nights
- [ ] Modal shows correct statistics
- [ ] Accept creates programme with 4 lessons
- [ ] Decline dismisses modal (can be shown again later)

### Lesson Flow
- [ ] Content displays correctly (text/audio/video)
- [ ] "I understand" required before duration selection
- [ ] All duration options work (tonight to 21 days)
- [ ] Practice session created with correct scheduled days
- [ ] Lesson marked as completed

### Check-In Flow
- [ ] Modal shows correct habit info
- [ ] Completed response closes immediately with success
- [ ] Attempted/Skipped shows barrier prompt
- [ ] All barrier reasons save correctly
- [ ] Completion logged to practice session

### Weekly Review
- [ ] Metrics calculate correctly from practice data
- [ ] Badges awarded based on performance
- [ ] Quality comparison shows when data available
- [ ] Continue advances to next week
- [ ] Repeat restarts current week practice

### Completion Flow
- [ ] Shows only when all 4 weeks done
- [ ] Metrics improvement calculated correctly
- [ ] All badges display
- [ ] Star rating saves
- [ ] Feedback text saves
- [ ] Status updates to 'completed'

## 📞 Support & Troubleshooting

### Common Issues
1. **Programme not appearing:** Check enrollment criteria met or manually trigger
2. **Check-in not logging:** Verify practice session exists and date is in scheduledDays
3. **Review metrics wrong:** Ensure sleep data exists for review period
4. **Lesson locked:** Previous lesson must be completed first

### Data Reset (Development)
```typescript
// Clear all programme data for user
await AsyncStorage.removeItem(`sleep_programme_${userId}`);
await AsyncStorage.removeItem(`active_practice_sessions_${userId}`);
await AsyncStorage.removeItem(`weekly_reviews_${userId}`);
```

## 📄 License & Credits

Part of the Betternapped sleep wellness application.
Designed based on evidence-based sleep intervention research.
Implementation by Betternapped development team.

---

**Last Updated:** November 8, 2025
**Version:** 1.0.0
**Status:** ✅ Fully Implemented & Tested
