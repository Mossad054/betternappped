# Coaching Programme - Complete Flow Diagram

## 📱 User Journey Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SLEEP WELLNESS HUB                           │
│  Quick Actions: [4-Week Sleep Programme] [Experiments] [...]    │
└────────────────────────────┬────────────────────────────────────┘
                             │ User taps
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRAMME HUB SCREEN                         │
│                                                                 │
│  IF NOT ENROLLED:                                              │
│    → Auto-detect poor sleep (3+ nights, quality < 3)          │
│    → Show Enrollment Modal ──────────────────────┐            │
│                                                   │            │
│  IF ENROLLED:                                    │            │
│    → Progress Bar: Week X of 4                   │            │
│    → Lessons List (Current/Completed/Locked)     │            │
│    → Weekly Reviews Archive                      │            │
│    → Complete Programme Button                   │            │
└──────────────────────────────────────────────────┴────────────┘
                             │                     │
        ┌────────────────────┤                     │
        │                    │                     │
        │                    │          ┌──────────┴──────────┐
        │                    │          │ ENROLLMENT MODAL     │
        │                    │          │                      │
        │                    │          │ "We've noticed..."  │
        │                    │          │ [Yes] [Not Now]     │
        │                    │          └──────────┬──────────┘
        │                    │                     │
        │                    │                     │ Accept
        │                    │                     ↓
        │                    │          ┌─────────────────────┐
        │                    │          │ Create Programme    │
        │                    │          │ + Baseline Metrics  │
        │                    │          └──────────┬──────────┘
        │                    │                     │
        │                    ↓                     ↓
        │          ┌─────────────────────────────────┐
        │          │      LESSON SCREEN (Week N)     │
        │          │                                 │
        │          │  📱 [Icon] Lesson Title         │
        │          │  Content (Text/Audio/Video)     │
        │          │  Habit Task Card                │
        │          │  ☐ "I understand this lesson"   │
        │          │                                 │
        │          │  When understood checked:       │
        │          │  "How long will you practice?"  │
        │          │  [Tonight][3][7][14][21 days]   │
        │          │                                 │
        │          │  [Start Practice] ──────────┐   │
        │          └─────────────────────────────┘   │
        │                                           │
        │                                           │ Creates Practice Session
        │                                           │ Schedules Reminders
        │                                           ↓
        │                               ┌──────────────────────┐
        │                               │  DAILY CHECK-IN      │
        │                               │  (Each scheduled day)│
        │                               │                      │
        │                               │  "Today's Task:"     │
        │                               │  [Habit Name]        │
        │                               │                      │
        │                               │  "How did you do?"   │
        │                               │  • Completed  ✅      │
        │                               │  • Attempted  ⚠️      │
        │                               │  • Skipped    ❌      │
        │                               └────┬────────┬────────┘
        │                                    │        │
        │                         Completed  │        │ Attempted/Skipped
        │                                    │        │
        │                                    │        ↓
        │                                    │   ┌────────────────────┐
        │                                    │   │ BARRIER PROMPT     │
        │                                    │   │                    │
        │                                    │   │ "What stopped you?"│
        │                                    │   │ • Forgot           │
        │                                    │   │ • Too busy         │
        │                                    │   │ • Environment      │
        │                                    │   │ • Other            │
        │                                    │   └────────┬───────────┘
        │                                    │            │
        │                                    ↓            ↓
        │                               "Well done!"  "Thanks for sharing"
        │                                    │            │
        │                                    │ Log to Practice Session
        │                                    │            │
        │                                    └────────────┘
        │                                         │
        │                              After 7 days / End of Week
        │                                         │
        │                                         ↓
        │                               ┌──────────────────────┐
        │                               │  WEEKLY REVIEW       │
        │                               │                      │
        │                               │  🏆 Badge Earned     │
        │                               │  Habit: X/7 days     │
        │                               │  Sleep: Yh Zm vs Zh  │
        │                               │  Consistency: ±W min │
        │                               │                      │
        │                               │  💡 Insight:         │
        │                               │  "Quality +B% on     │
        │                               │   habit days"        │
        │                               │                      │
        │                               │  [Continue ▶]        │
        │                               │  [Repeat 🔄]         │
        │                               │  [Pause ⏸]          │
        │                               └────┬──────┬──────────┘
        │                                    │      │
        │                         Continue   │      │ Repeat
        │                                    │      │
        │                                    │      └─────────┐
        │                         Next Week++│                │
        │                                    │                │
        └────────────────────────────────────┘                │
                                                              │
                                      Restart Current Week ───┘
                                                              
                                      
        After Week 4 Complete
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│              PROGRAMME COMPLETION SCREEN                        │
│                                                                 │
│               🏆 "Congratulations!" 🎉                          │
│                                                                 │
│  Progress Summary:                                             │
│  ┌─────────────────────────────────────────┐                  │
│  │ Sleep Duration: 6h 30m → 7h 30m (+60m) │                  │
│  │ Consistency: ±65min → ±25min (-40min)   │                  │
│  │ Overall Improvement: +15%               │                  │
│  └─────────────────────────────────────────┘                  │
│                                                                 │
│  Badges Earned: 🏆 Early Starter, Consistency Star, Perfect... │
│                                                                 │
│  ⭐ Rate Your Experience:                                      │
│  ⭐⭐⭐⭐⭐ (1-5 stars)                                        │
│                                                                 │
│  💭 What would make it better? [Text input]                    │
│                                                                 │
│  [Enter Maintenance Mode] [Join Advanced Programme]            │
│  [Share Your Achievement]                                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   ASYNCSTORAGE (Persistence)                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  sleep_programme_{userId}                                   │
│  ├─ id, status, enrolledAt, completedAt                     │
│  ├─ currentWeek, currentLessonId, totalWeeks                │
│  ├─ lessons[] (4 lessons with completion status)            │
│  ├─ weeklyReviews[] (review data for each week)             │
│  ├─ baselineMetrics (sleep duration, consistency, quality)  │
│  ├─ currentMetrics (improvement calculations)               │
│  └─ feedbackRating, feedbackText                            │
│                                                              │
│  active_practice_sessions_{userId}                          │
│  ├─ id, lessonId, habitName, duration                       │
│  ├─ startDate, endDate, scheduledDays[]                     │
│  ├─ completedDays[] (date, response, skipReason, notes)     │
│  └─ isActive                                                 │
│                                                              │
│  weekly_reviews_{userId}                                    │
│  ├─ id, weekNumber, startDate, endDate                      │
│  ├─ habitCompletionRate, averageSleepDuration               │
│  ├─ bedtimeVariability                                      │
│  ├─ qualityWithHabit, qualityWithoutHabit                   │
│  └─ badgeEarned                                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↕
┌──────────────────────────────────────────────────────────────┐
│              SLEEPPROGRAMMESERVICE (Business Logic)          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  checkEnrollmentCriteria(userId)                            │
│  ├─ Queries sleep logs                                      │
│  ├─ Counts poor nights (quality < 3, duration < 6h)         │
│  └─ Returns criteria object if threshold met                │
│                                                              │
│  enrollUser(userId, baselineMetrics)                        │
│  ├─ Creates Programme instance                              │
│  ├─ Loads 4 default lessons                                 │
│  ├─ Sets status: 'active'                                   │
│  └─ Saves to AsyncStorage                                   │
│                                                              │
│  startLessonPractice(userId, lessonId, duration)            │
│  ├─ Marks lesson as understood                              │
│  ├─ Calculates scheduled days array                         │
│  ├─ Creates PracticeSession                                 │
│  ├─ Updates currentWeek in Programme                        │
│  └─ Schedules reminders (TODO: notification service)        │
│                                                              │
│  logCheckIn(userId, sessionId, date, response, reason)      │
│  ├─ Finds active practice session                           │
│  ├─ Adds/updates completedDays entry                        │
│  └─ Saves to AsyncStorage                                   │
│                                                              │
│  generateWeeklyReview(userId, weekNumber)                   │
│  ├─ Queries practice session for week                       │
│  ├─ Calculates completion rate                              │
│  ├─ Queries sleep data for week                             │
│  ├─ Calculates quality correlation                          │
│  ├─ Awards badge based on performance                       │
│  ├─ Creates WeeklyReview object                             │
│  └─ Saves to archive                                        │
│                                                              │
│  completeProgramme(userId, rating, feedback)                │
│  ├─ Calculates final metrics vs baseline                    │
│  ├─ Computes improvement percentage                         │
│  ├─ Saves feedback                                          │
│  ├─ Sets status: 'completed'                                │
│  └─ Returns updated Programme                               │
│                                                              │
│  pauseProgramme(userId) / resumeProgramme(userId)           │
│  └─ Updates status and timestamps                           │
│                                                              │
│  checkConsecutiveSkips(session)                             │
│  └─ Returns true if last 3 days all skipped                 │
│                                                              │
│  canAdvanceEarly(session)                                   │
│  └─ Returns true if ≥80% completion rate                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↕
┌──────────────────────────────────────────────────────────────┐
│                  UI COMPONENTS (Presentation)                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ProgrammeHubScreen                                         │
│  ├─ Loads programme on mount                                │
│  ├─ Auto-triggers enrollment modal if criteria met          │
│  ├─ Displays progress & lessons list                        │
│  ├─ Navigates to LessonScreen / WeeklyReviewScreen          │
│  └─ Shows completion button when done                       │
│                                                              │
│  ProgrammeEnrollmentModal                                   │
│  ├─ Shows poor sleep statistics                             │
│  ├─ Lists programme benefits                                │
│  └─ Calls enrollUser() on accept                            │
│                                                              │
│  LessonScreen                                               │
│  ├─ Displays lesson content                                 │
│  ├─ Validates "I understand" checkbox                       │
│  ├─ Shows duration selector when understood                 │
│  └─ Calls startLessonPractice() on submit                   │
│                                                              │
│  DailyCheckInModal                                          │
│  ├─ Shows habit name & icon                                 │
│  ├─ Presents 3 response options                             │
│  ├─ Shows barrier prompt if not completed                   │
│  └─ Calls logCheckIn() with response                        │
│                                                              │
│  WeeklyReviewScreen                                         │
│  ├─ Displays metrics & insights                             │
│  ├─ Shows badge with celebration                            │
│  ├─ Provides Continue/Repeat/Pause actions                  │
│  └─ Updates currentWeek on continue                         │
│                                                              │
│  ProgrammeCompletionScreen                                  │
│  ├─ Shows before/after comparison                           │
│  ├─ Lists all badges earned                                 │
│  ├─ Collects star rating & feedback text                    │
│  └─ Calls completeProgramme() with feedback                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 🎯 State Machine

```
┌─────────────┐
│ NOT_ENROLLED│
└──────┬──────┘
       │ enrollUser()
       ↓
┌─────────────┐     pauseProgramme()     ┌────────┐
│   ACTIVE    │ ←─────────────────────── │ PAUSED │
└──────┬──────┘     resumeProgramme()     └────────┘
       │
       │ completeProgramme()
       ↓
┌─────────────┐
│  COMPLETED  │ (Final state)
└─────────────┘
```

## 📊 Week Progression Flow

```
Week 0 (Enrollment)
    ↓
Week 1: Screen-Off Habit 📱
    │
    ├─ Lesson 1 delivered
    ├─ Practice duration selected
    ├─ Daily check-ins for 1-21 days
    ├─ Weekly review generated
    └─ Badge awarded (if earned)
    ↓
Week 2: Sleep Sanctuary 🛏️
    │
    ├─ Lesson 2 delivered
    ├─ Practice duration selected
    ├─ Daily check-ins
    ├─ Weekly review
    └─ Badge awarded
    ↓
Week 3: Consistent Schedule ⏰
    │
    ├─ Lesson 3 delivered
    ├─ Practice duration selected
    ├─ Daily check-ins
    ├─ Weekly review
    └─ Badge awarded
    ↓
Week 4: Wind-Down Routine 🌙
    │
    ├─ Lesson 4 delivered
    ├─ Practice duration selected
    ├─ Daily check-ins
    ├─ Weekly review
    └─ Badge awarded
    ↓
Programme Complete 🎉
    │
    ├─ Completion screen shown
    ├─ Metrics comparison
    ├─ Feedback collected
    └─ Maintenance/Advanced options
```

## 🔗 Integration Points

```
┌─────────────────────┐
│  Sleep Programme    │
└──────────┬──────────┘
           │
    ┌──────┼──────────────────────────────┐
    │      │                              │
    ↓      ↓                              ↓
┌───────┐ ┌──────────────┐ ┌──────────────────────┐
│ Sleep │ │    Habit     │ │   Notification       │
│Service│ │   Tracker    │ │     Service          │
└───┬───┘ └──────┬───────┘ └──────────┬───────────┘
    │            │                     │
    │ Query      │ Create              │ Schedule
    │ Baseline   │ Habits              │ Reminders
    │ Metrics    │ Track               │ Push
    │            │ Progress            │ Alerts
    │            │                     │
    └────────────┴─────────────────────┘
                 │
                 ↓
        ┌────────────────┐
        │  Rewards       │
        │  System        │
        └────────────────┘
         Award Points
         for Completion
```

---

**Visual Flow Created:** November 8, 2025
**Status:** Complete Implementation ✅
