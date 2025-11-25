# Intimacy Growth Hub - Implementation Status

## 🎯 Overview
A comprehensive behavioral wellness system for tracking, understanding, and improving intimacy through structured coaching programs, self-experiments, daily reflections, and actionable insights.

---

## ✅ COMPLETED: Backend & Database Layer

### 1. Database Schema (`create_intimacy_hub.sql`)
**16 interconnected tables** with full relational integrity:

#### Coaching Programs (4 tables)
- `programs` - Pre-developed coaching journeys (4 seed programs included)
- `lessons` - Individual teaching modules with media content
- `user_programs` - Enrollment and progress tracking
- `user_lessons` - Lesson completion, reflections, task scheduling

#### Experiments (3 tables)
- `experiments` - Experiment templates (user or system-created)
- `user_experiments` - Active experiments with config and results
- `experiment_logs` - Daily check-ins with metrics and reflections

#### Check-ins & Metrics (3 tables)
- `daily_checkins` - Emotional, physical, and intimacy tracking
- `user_streaks` - Cached streak counters for gamification
- `user_metrics` - Aggregated analytics (connection score, trends, insights)

#### Assessments (2 tables)
- `assessments` - Standardized intimacy health tests
- `user_assessments` - Results with personalized recommendations

#### Achievements (2 tables)
- `achievements` - Badge definitions (8 seed achievements included)
- `user_achievements` - Unlocked achievements per user

#### Features:
- ✅ Row Level Security (RLS) on all user data
- ✅ Automatic progress calculation triggers
- ✅ Indexes for performance optimization
- ✅ Cascade deletes for data integrity
- ✅ Seed data for programs and achievements

---

### 2. Service Layer (`intimacyHub.service.ts`)
**30+ methods** organized by module:

#### Programs Service (8 methods)
```typescript
getPrograms() // Get all available programs
getProgramWithLessons() // Get program details + lessons
enrollInProgram() // Enroll user and create lesson records
getUserLessons() // Get user's lesson progress
startLesson() // Mark lesson as in-progress
completeLesson() // Complete with reflection + unlock next
completeTask() // Mark action task as done
unlockNextLesson() // Auto-unlock after completion
```

#### Experiments Service (6 methods)
```typescript
getExperimentTemplates() // Get all templates
createUserExperiment() // Start new experiment with config
getUserExperiments() // Get active/completed experiments
logExperimentCheckin() // Daily check-in with metrics
getExperimentLogs() // Get all logs for analysis
completeExperiment() // Finish with summary
```

#### Check-ins Service (3 methods)
```typescript
createDailyCheckin() // Log daily emotional/intimacy state
getCheckins() // Get check-ins for date range
updateStreak() // Auto-update streak counters
```

#### Assessments Service (3 methods)
```typescript
getAssessments() // Get all active assessments
submitAssessment() // Submit answers + calculate score
getUserAssessments() // Get assessment history
```

#### Metrics & Analytics (2 methods)
```typescript
calculateUserMetrics() // Aggregate data → connection score
getUserMetrics() // Get cached or calculated metrics
```

#### Achievements Service (4 methods)
```typescript
getAchievements() // Get all achievement definitions
getUserAchievements() // Get user's unlocked achievements
checkAndUnlockAchievements() // Auto-check criteria + unlock
markAchievementViewed() // Mark as seen (for animation)
```

---

## 📋 TODO: Frontend Implementation

### Phase 1: Core Screens (Priority)

#### 1. Dashboard Screen (`app/(tabs)/intimacy-hub.tsx`)
**Purpose:** Central hub showing all insights and quick actions

**Components Needed:**
- `ConnectionScoreCard` - Circular progress with trend indicator
- `StreakCard` - Fire emoji + current streak
- `ActiveProgramCard` - Current program progress
- `ActiveExperimentCard` - Experiment progress + check-in button
- `QuickCheckinButton` - Fast access to daily log
- `InsightsCarousel` - Swipeable recommendations
- `TrendGraphs` - Mood/intimacy line charts

**Data Flow:**
```typescript
const metrics = await IntimacyHubService.getUserMetrics(userId);
const activePrograms = await IntimacyHubService.getUserExperiments(userId, 'active');
const achievements = await IntimacyHubService.checkAndUnlockAchievements(userId);
```

---

#### 2. Coaching Programs (`app/programs/index.tsx` + `app/programs/[id].tsx`)
**Purpose:** Browse and complete coaching journeys

**Screens:**
- **Program List** - Grid of available programs with filters
- **Program Detail** - Lessons list with lock/unlock states
- **Lesson Viewer** - Content + reflection form
- **Task Scheduler** - Timeline picker (tonight/3 days/7 days etc.)

**Components Needed:**
- `ProgramCard` - Preview with duration, difficulty, tags
- `LessonCard` - Title, duration, lock state
- `LessonContent` - Text/video/audio renderer
- `ReflectionForm` - Effectiveness rating + feeling selector
- `TimelineSelector` - Task scheduling buttons
- `ProgressBar` - Visual completion percentage

**User Flow:**
```
Browse Programs → Select Program → Enroll → 
Start Lesson 1 → Read Content → Complete Task → Reflect → 
Lesson 2 Unlocks → Continue...
```

---

#### 3. Experiments Hub (`app/experiments/index.tsx` + `app/experiments/[id].tsx`)
**Purpose:** Test habits and track effectiveness

**Screens:**
- **Experiment Templates** - Library of experiments
- **Create Experiment** - Duration, metrics, schedule config
- **Active Experiment** - Daily check-in interface
- **Experiment Summary** - Charts + results + convert to habit

**Components Needed:**
- `ExperimentCard` - Template preview
- `ExperimentConfigForm` - Duration, metrics selector
- `DailyCheckinForm` - Yes/No + mood/energy sliders
- `ProgressCalendar` - Heatmap of completed days
- `ResultsChart` - Line graph of tracked metrics
- `HabitConversionModal` - Convert successful experiment

**Data Flow:**
```typescript
// Start experiment
const experimentId = await IntimacyHubService.createUserExperiment(userId, templateId, {
  durationDays: 14,
  startDate: new Date(),
  metricsToTrack: ['mood', 'intimacy', 'energy']
});

// Daily check-in
await IntimacyHubService.logExperimentCheckin(userId, experimentId, {
  logDate: new Date(),
  dayNumber: 3,
  completed: true,
  moodScore: 8,
  intimacyScore: 7
});
```

---

#### 4. Daily Check-In (`app/check-in.tsx`)
**Purpose:** Quick daily emotional/intimacy logging

**Screens:**
- **Check-in Form** - Multi-step slider interface
- **Streak Display** - Current streak + celebration
- **Optional Notes** - Gratitude, wins, challenges

**Components Needed:**
- `SliderInput` - Animated slider (1-10) for each metric
- `EmojiScale` - Visual feedback (😞 → 😐 → 😊)
- `StreakCounter` - Fire emoji + number
- `NotesInput` - Optional text fields
- `SubmitButton` - Save + update streak

**Metrics to Capture:**
- Mood (1-10)
- Energy (1-10)
- Stress (1-10)
- Intimacy Level (1-10)
- Desire Level (1-10)
- Comfort Level (1-10)
- Communication Quality (1-10)

---

### Phase 2: Supporting Features

#### 5. Assessments (`app/assessments/index.tsx` + `app/assessments/[id].tsx`)
**Purpose:** Evaluate intimacy health and get recommendations

**Screens:**
- **Assessment List** - Available tests
- **Question Flow** - Multi-step questionnaire
- **Results Screen** - Score + category + recommendations
- **Recommended Actions** - Suggested programs/experiments

**Components:**
- `AssessmentCard` - Test preview with duration
- `QuestionCard` - Single question with input type (scale/choice)
- `ProgressIndicator` - Question X of Y
- `ResultsSummary` - Score circle + interpretation
- `RecommendationsList` - Programs/experiments to start

---

#### 6. Activity Library (`app/activity-library.tsx`)
**Purpose:** Unified view of all ongoing/completed activities

**Screens:**
- **Tabs:** Active | Completed | Archived
- **Filters:** Experiments | Lessons | All
- **Activity Cards:** Status, progress, reflection summary

**Components:**
- `ActivityCard` - Unified card for lessons/experiments
- `FilterButtons` - Tab switching
- `StatusBadge` - Visual status indicator
- `ProgressRing` - Circular progress

---

#### 7. Achievements (`app/achievements.tsx`)
**Purpose:** Gamification and motivation

**Screens:**
- **Badges Grid** - All achievements (locked/unlocked)
- **Unlock Animation** - Celebration when new badge earned
- **Progress Rings** - Partial progress (e.g., 5/7 days)

**Components:**
- `AchievementBadge` - Icon + title + description
- `UnlockAnimation` - Confetti + modal popup
- `ProgressCircle` - Partial completion indicator

---

## 📊 Key Data Flows

### 1. Program Completion Flow
```
User enrolls → All lessons created (locked) → First lesson available →
User completes lesson → Trigger updates program progress → Unlock next lesson →
When all complete → Program status = 'completed' → Check achievements
```

### 2. Experiment Flow
```
User creates experiment → Daily reminders sent →
User logs check-in → Progress % calculated →
Experiment ends → Summary generated →
User converts to habit OR archives
```

### 3. Metrics Calculation
```
Daily check-ins accumulate → Weekly aggregation runs →
Calculate: Avg mood, avg intimacy, connection score, trends →
Generate recommendations based on patterns →
Update dashboard
```

### 4. Achievement Unlocking
```
User action (complete lesson, log check-in, etc.) →
Service checks all achievement criteria →
If criteria met → Insert user_achievement →
Show unlock animation → Mark as viewed
```

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Warm & Private:** Soft colors, intimate language, safe space
2. **Data-Driven:** Charts, progress rings, visual feedback
3. **Low Friction:** Quick taps, minimal text input, smart defaults
4. **Motivating:** Streaks, badges, encouraging copy
5. **Personalized:** Recommendations based on user data

### Color Palette (Suggested)
- Primary: Soft Coral (`#FF9F8A`)
- Secondary: Warm Purple (`#B084CC`)
- Accent: Peach (`#FFD4C4`)
- Success: Sage Green (`#8FBC8F`)
- Background: Cream/Off-white (`#FFF8F0`)
- Text: Deep Charcoal (`#2C3E50`)

### Typography
- Headers: Bold, warm (e.g., Poppins, Quicksand)
- Body: Readable, friendly (e.g., Inter, Source Sans)
- Numbers/Scores: Tabular, clear

---

## 🔧 Integration Points

### 1. Navigation
Add to tab bar:
```typescript
<Tabs.Screen
  name="intimacy-hub"
  options={{
    title: 'Intimacy Hub',
    tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
  }}
/>
```

### 2. Notifications
- Daily check-in reminder (user-configured time)
- Experiment check-in reminder
- Lesson task due reminder
- Achievement unlock notification
- Streak-about-to-break warning

### 3. Existing App Integration
- Link from main dashboard: "Intimacy Growth Hub" card
- Activity logging integration (if intimacy tracked elsewhere)
- Profile screen: Show connection score
- Settings: Hub preferences, reminder times

---

## 📈 Analytics & Insights

### Auto-Generated Recommendations
Based on `user_metrics` data:

1. **Low Connection Score (<40):**
   - "Your connection score suggests starting with 'Rebuilding Intimacy' program"
   - "Try the 'Daily Gratitude' experiment"

2. **High Stress Correlation:**
   - "Your intimacy decreases when stress is high. Try stress-reduction experiments"

3. **Consistent Patterns:**
   - "You feel most connected on Fridays. Consider scheduling intimacy on Thursdays"

4. **Broken Streaks:**
   - "You're 1 day away from losing your 14-day streak. Log today!"

5. **Successful Experiments:**
   - "Your 'Morning Connection' experiment improved mood by 2 points. Convert to habit?"

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# In Supabase Dashboard → SQL Editor
# Run: database/migrations/create_intimacy_hub.sql
```

### 2. Service Testing
```typescript
// Test service methods
const programs = await IntimacyHubService.getPrograms(userId);
console.log('Programs:', programs);
```

### 3. Build Screens (Recommended Order)
1. Dashboard (foundation)
2. Daily Check-in (quick win)
3. Coaching Programs (core feature)
4. Experiments Hub (core feature)
5. Assessments (growth tool)
6. Activity Library (organization)
7. Achievements (gamification)

### 4. Add Navigation
- Update tab bar
- Create routes
- Add deep linking

### 5. Testing
- Complete end-to-end flows
- Test data aggregation
- Verify RLS policies
- Check notification delivery

---

## 📱 Screen Wireframes (Text-Based)

### Dashboard
```
┌─────────────────────────────────────┐
│ Intimacy Growth Hub         🌸      │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────┐      │
│   │   Connection Score       │      │
│   │        ╱ 72 ╲            │      │
│   │       ⟨     ⟩  ↗️ +5     │      │
│   │        ╲___╱             │      │
│   │     Improving            │      │
│   └─────────────────────────┘      │
│                                     │
│  🔥 14 Day Streak    📚 Programs   │
│                                     │
│  Active Program:                    │
│  ┌───────────────────────────────┐ │
│  │ Rebuilding Intimacy  [60%]   │ │
│  │ Lesson 4 of 7                │ │
│  │ [Continue →]                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  Active Experiment:                 │
│  ┌───────────────────────────────┐ │
│  │ Morning Connection  Day 5/14 │ │
│  │ [Log Today ✓]                │ │
│  └───────────────────────────────┘ │
│                                     │
│  📈 Insights                        │
│  • Mood trending up this week      │
│  • Best days: Friday, Saturday     │
│                                     │
│  [Quick Check-In]                   │
└─────────────────────────────────────┘
```

### Program Lesson Viewer
```
┌─────────────────────────────────────┐
│ ← Lesson 3: Vulnerable Sharing      │
├─────────────────────────────────────┤
│                                     │
│ Duration: 15 min  •  Lesson 3 of 7 │
│                                     │
│ ━━━━━━━━━━━━━━━━━━ 40%             │
│                                     │
│ [Content Area]                      │
│ Vulnerability creates intimacy...   │
│ [Read more...]                      │
│                                     │
│ 🎯 Today's Action:                  │
│ Share something you've been         │
│ holding back with your partner      │
│                                     │
│ When will you practice this?        │
│ [ Tonight ] [ 3 days ] [ 7 days ]  │
│                                     │
│ How effective was this lesson?      │
│ ⭐️⭐️⭐️⭐️☆                          │
│                                     │
│ How did you feel?                   │
│ [ Inspired ] [ Hopeful ] [More...] │
│                                     │
│ Reflection (optional):              │
│ [Text area]                         │
│                                     │
│ [Complete Lesson]                   │
└─────────────────────────────────────┘
```

### Daily Check-In
```
┌─────────────────────────────────────┐
│ Daily Check-In        🔥 14 days    │
├─────────────────────────────────────┤
│                                     │
│ How are you feeling today?          │
│                                     │
│ Mood                                │
│ 😞 ─────●──────── 😊  (7/10)        │
│                                     │
│ Energy                              │
│ 😴 ──────●─────── ⚡  (6/10)        │
│                                     │
│ Intimacy Level                      │
│ 😐 ────────●───── 💕  (8/10)        │
│                                     │
│ Stress                              │
│ 😌 ───●────────── 😰  (3/10)        │
│                                     │
│ ✍️ Today's Gratitude (optional)     │
│ [Text area]                         │
│                                     │
│ [Save Check-In]                     │
│                                     │
│ Streak will continue! 🔥            │
└─────────────────────────────────────┘
```

---

## 🎉 Expected User Experience

### Week 1: Onboarding
- User takes "Connection Health Assessment"
- Gets personalized program recommendation
- Enrolls in "Rebuilding Intimacy" (7 lessons)
- Starts daily check-ins
- Unlocks "First Step" achievement

### Week 2: Engagement
- Completes 3 lessons
- Starts "Morning Connection" experiment (14 days)
- Logs daily check-ins consistently
- Reaches 7-day streak
- Unlocks "Week Warrior" achievement
- Connection score: 55 → 62

### Week 3: Growth
- Completes program (all 7 lessons)
- Experiment shows mood +1.5 points
- Logs 14 days straight
- Unlocks "Committed Learner" achievement
- Starts second program based on insights
- Connection score: 62 → 71

### Month 2+: Maintenance
- Tries multiple experiments
- Completes 3 programs total
- Hits 30-day streak
- Connection score stabilizes at 75+
- Receives insights: "Your intimacy peaks on weekends"
- Converts successful experiments to habits

---

## 📊 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Weekly Check-in Rate
- Program Completion Rate
- Experiment Start Rate
- Experiment Completion Rate
- Average Session Length

### Outcome Metrics
- Average Connection Score Improvement
- User-Reported Intimacy Satisfaction
- Relationship Quality Change
- Retention Rate (30/60/90 days)

### Content Metrics
- Most Popular Programs
- Most Effective Experiments
- Highest-Rated Lessons
- Common Drop-off Points

---

## 🔐 Privacy & Security

### Data Protection
- ✅ All intimacy data encrypted at rest
- ✅ Row Level Security (RLS) enforced
- ✅ No data sharing across users
- ✅ Export/delete user data on request

### User Control
- Toggle program/experiment visibility
- Delete check-in history
- Pause/abandon programs without penalty
- Opt out of recommendations

### Sensitive Content
- Flag lessons for mature content
- Consent before intimacy-specific questions
- Option to skip uncomfortable topics
- Clear "This is not therapy" disclaimer

---

## 🚧 Future Enhancements (Post-MVP)

### Phase 2 Features
- Partner mode (share experiments with partner)
- Custom program creator (user-generated)
- Voice notes for reflections
- Journaling integration
- Calendar integration for task scheduling

### Phase 3 Features
- Community (anonymous sharing)
- Expert Q&A sessions
- Live coaching webinars
- Couples coaching tracks
- Therapist referrals

### Advanced Analytics
- Predictive insights (ML-based)
- Pattern detection (e.g., "Low intimacy correlates with high screen time")
- Personalized experiment generator
- Connection forecast ("Based on trends, your score may reach 80 next month")

---

**Status:** ✅ Backend Complete (Database + Service Layer)
**Next Steps:** Implement Dashboard screen and Daily Check-In flow
**Timeline:** Core features can be built in 2-3 weeks with dedicated frontend work

