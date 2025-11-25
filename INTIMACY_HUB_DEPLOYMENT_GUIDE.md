# Intimacy Hub - Deployment Guide (New Implementation)

## 🎉 What's Ready to Deploy

You now have a complete intimacy hub system with:
- ✅ Connection scoring algorithm
- ✅ Daily check-ins with AI recommendations
- ✅ Learning programs system
- ✅ Analytics and achievements
- ✅ UI components (Score Card, Check-In Modal, Programs Screen)

---

## 📋 Step-by-Step Deployment

### Step 1: Run Database Migrations

Go to **Supabase Dashboard** → **SQL Editor** and run these **4 migration files in order**:

#### 1.1 Connection Score Tables
```sql
-- File: database/migrations/create_intimacy_connection_score.sql
-- This creates: intimacy_metrics, connection_score tables
-- Run the entire file
```

#### 1.2 Check-Ins Tables
```sql
-- File: database/migrations/create_intimacy_check_ins.sql
-- This creates: intimacy_check_ins, check_in_recommendations tables
-- Run the entire file
```

#### 1.3 Programs Tables
```sql
-- File: database/migrations/create_intimacy_programs.sql
-- This creates: intimacy_programs, program_lessons, user_program_progress, lesson_reflections tables
-- Run the entire file
```

#### 1.4 Seed Sample Programs ⭐
```sql
-- File: database/migrations/seed_intimacy_programs.sql
-- This adds 5 learning programs with lessons
-- Run the entire file
```

**Verify migrations worked:**
```sql
-- Should return 8 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%intimacy%' OR table_name LIKE '%connection%';

-- Should return 5 programs
SELECT title FROM intimacy_programs;
```

---

### Step 2: Add New Components to Intimacy Hub Main

You have two options:

#### Option A: Add Components to Existing Page (Recommended)

Update `app/intimacy-hub-main.tsx`:

```typescript
// Add imports at the top
import ConnectionScoreCard from '@/components/intimacy/ConnectionScoreCard';
import DailyCheckInModal from '@/components/intimacy/DailyCheckInModal';
import { ConnectionScoreService } from '@/services/connectionScore.service';

// Add state
const [showCheckIn, setShowCheckIn] = useState(false);

// Replace existing Connection Score Card section with:
<ConnectionScoreCard
  onPress={() => router.push('/intimacy-hub/analytics' as any)}
/>

// Add Daily Check-In button somewhere in the UI:
<TouchableOpacity
  style={styles.checkInButton}
  onPress={() => setShowCheckIn(true)}
>
  <Text>Daily Check-In</Text>
</TouchableOpacity>

// Add at the end, before closing tags:
<DailyCheckInModal
  visible={showCheckIn}
  onClose={() => setShowCheckIn(false)}
  onComplete={() => {
    setShowCheckIn(false);
    loadDashboardData(); // Refresh data
  }}
/>

// Add Programs Section:
<TouchableOpacity
  style={styles.card}
  onPress={() => router.push('/intimacy-hub/programs' as any)}
>
  <BookOpen size={24} color={theme.colors.primary} />
  <Text style={styles.cardTitle}>Learning Programs</Text>
  <Text style={styles.cardSubtitle}>
    Structured courses to deepen intimacy
  </Text>
  <ChevronRight size={20} color={theme.colors.textTertiary} />
</TouchableOpacity>
```

#### Option B: Create Standalone New Hub Page

Create `app/intimacy-hub/index.tsx` as a new standalone page with all new components.

---

### Step 3: Test the System

#### 3.1 Test Connection Score

```typescript
import { ConnectionScoreService } from '@/services/connectionScore.service';

// Save test metrics
await ConnectionScoreService.saveMetrics({
  user_id: userId,
  date: '2025-01-16',
  intimacy_frequency: 1,
  activity_types: ['quality-time', 'physical'],
  quality_rating: 8,
  satisfaction_rating: 9,
  emotional_connection: 7,
  time_spent: 45,
});

// Calculate score
const { data: score } = await ConnectionScoreService.calculateDailyScore(
  userId,
  '2025-01-16'
);
console.log('Connection Score:', score);

// Get breakdown
const { data: breakdown } = await ConnectionScoreService.getScoreBreakdown(
  userId,
  '2025-01-16'
);
console.log('Score Breakdown:', breakdown);
```

**Expected Result:**
- Total score: 70-80 (based on sample data)
- Components: frequency, quality, emotional, consistency, variety
- Insights: Personalized messages

#### 3.2 Test Daily Check-In

Open app → Navigate to Intimacy Hub → Tap "Daily Check-In"

1. Select mood: "Good" or "Amazing"
2. Rate emotional connection: 7
3. Rate physical connection: 6
4. Rate communication: 8
5. Add optional reflections
6. Select needs: "Physical intimacy", "Quality time"
7. Complete check-in

**Expected Result:**
- Check-in saved to database
- AI recommendations generated (5-8 recommendations)
- Recommendations shown based on your inputs

#### 3.3 Test Programs

Navigate to `/intimacy-hub/programs`:

1. View 5 sample programs
2. Filter by category ("Communication", "Emotional", etc.)
3. Tap "Enroll Now" on "Communication Mastery"
4. See program detail page (you'll need to build this next)

**Expected Result:**
- Programs loaded from database
- Can filter by category
- Can enroll (creates user_program_progress record)

---

## 🎯 What Works Now

### ✅ Backend Services (Ready to Use)

**1. ConnectionScoreService**
```typescript
// Calculate daily score
ConnectionScoreService.calculateDailyScore(userId, date)

// Get score history (for trends)
ConnectionScoreService.getScoreHistory(userId, startDate, endDate)

// Get breakdown with insights
ConnectionScoreService.getScoreBreakdown(userId, date)

// Save intimacy metrics
ConnectionScoreService.saveMetrics({ user_id, date, quality_rating, ...})
```

**2. IntimacyCheckInService**
```typescript
// Save check-in (auto-generates recommendations)
IntimacyCheckInService.saveCheckIn({ user_id, date, overall_feeling, ...})

// Get today's check-in
IntimacyCheckInService.getTodayCheckIn(userId)

// Get recommendations
IntimacyCheckInService.getRecommendations(checkInId)

// Get active recommendations
IntimacyCheckInService.getActiveRecommendations(userId)
```

**3. IntimacyProgramService**
```typescript
// Browse programs
IntimacyProgramService.getPrograms(category?, difficulty?)

// Enroll in program
IntimacyProgramService.enrollInProgram(userId, programId)

// Get program with lessons
IntimacyProgramService.getProgramWithLessons(programId)

// Complete lesson
IntimacyProgramService.completeLesson(userId, programId, lessonId, reflection)

// Convert action to habit
IntimacyProgramService.convertActionToHabit(userId, lessonId, actionItem)
```

**4. IntimacyAnalyticsService**
```typescript
// Get dashboard overview
IntimacyAnalyticsService.getOverview(userId)

// Get trends (for charts)
IntimacyAnalyticsService.getTrends(userId, days = 30)

// Analyze patterns
IntimacyAnalyticsService.getPatterns(userId)

// Get achievements
IntimacyAnalyticsService.getAchievements(userId)

// Analyze program impact
IntimacyAnalyticsService.getProgramImpact(userId)
```

### ✅ UI Components (Ready to Use)

**1. ConnectionScoreCard**
```tsx
<ConnectionScoreCard onPress={() => router.push('/analytics')} />
```
- Shows connection score 0-100
- Color-coded (green/yellow/red)
- Score breakdown with bars
- Trend indicator (up/down/stable)

**2. DailyCheckInModal**
```tsx
<DailyCheckInModal
  visible={visible}
  onClose={() => setVisible(false)}
  onComplete={() => {
    // Refresh data
    setVisible(false);
  }}
/>
```
- 4-step check-in flow
- Mood selection with emojis
- Rating sliders (1-10)
- Reflection prompts
- Recommendations display

**3. Programs Screen**
```
/intimacy-hub/programs
```
- Browse all programs
- Filter by category
- Enroll in programs
- See enrollment status

---

## 🚧 What's Still Needed

### Priority 1: Essential
1. **Program Detail Page** (`app/intimacy-hub/program-detail.tsx`)
   - Show lessons list
   - Lock/unlock state
   - Start lesson button

2. **Lesson Viewer** (`app/intimacy-hub/lesson-viewer.tsx`)
   - Display lesson content (markdown)
   - Reflection form
   - Action items
   - Convert to habit button

### Priority 2: Nice to Have
3. **Achievement Analytics Page** (`app/intimacy-hub/analytics.tsx`)
   - Connection score trends chart
   - Pattern analysis
   - Achievements display
   - Program impact assessment

4. **Experiments Filter**
   - Link intimacy experiments to experiments hub
   - Filter experiments by "intimacy" tag

---

## 🎨 Sample Program Data

After running `seed_intimacy_programs.sql`, you'll have:

**5 Programs:**
1. Communication Mastery (6 lessons) - Beginner
2. Emotional Intimacy Building (5 lessons) - Beginner
3. Physical Connection Exploration (4 lessons) - Intermediate
4. Conflict Resolution Skills (5 lessons) - Intermediate
5. Self-Love & Self-Intimacy (4 lessons) - Beginner

**Communication Mastery Lessons:**
1. The Art of Listening
2. Speaking Your Truth
3. Navigating Conflict
4. Non-Verbal Communication
5. Asking for What You Want
6. Daily Connection Rituals

---

## 📊 How It All Works Together

### User Journey Example:

**Day 1:**
1. User opens intimacy hub
2. Sees connection score: 0 (no data yet)
3. Completes daily check-in
4. Rates emotional/physical/communication: 5/4/6
5. Selects needs: "Communication", "Emotional closeness"
6. Gets 6 AI recommendations including "Communication Mastery" program

**Day 2:**
7. User enrolls in "Communication Mastery"
8. Starts Lesson 1: "The Art of Listening"
9. Reads content, reflects, commits to action item
10. Completes lesson
11. Lesson 2 unlocks automatically

**Day 3:**
12. Logs intimacy activity via check-in or directly
13. Connection score calculated: 52
14. Continues program lessons

**Week 2:**
15. Completes all 6 lessons
16. Connection score: 68 (improved!)
17. Unlocks "First Program Complete" achievement
18. Starts second program based on new insights

**Month 2:**
19. Connection score stabilizes at 75+
20. Has completed 3 programs
21. Analytics show: "Best connection days are Friday & Saturday"
22. Converts successful action items to habits

---

## 🔧 Troubleshooting

### Issue: "No data found" errors

**Fix:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE '%intimacy%';
```

### Issue: "Foreign key violation - user not in users table"

**Fix:**
```sql
-- Ensure user exists in public.users
SELECT id, email FROM public.users WHERE id = auth.uid();

-- If missing, insert:
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;
```

### Issue: Programs not showing

**Fix:**
```sql
-- Check if seed data ran
SELECT title, category FROM intimacy_programs;

-- If empty, re-run seed_intimacy_programs.sql
```

---

## 📈 Performance Tips

1. **Cache connection score**: Calculate once daily, not on every load
2. **Limit check-in history**: Only fetch last 30 days for patterns
3. **Lazy load lessons**: Don't load all lesson content upfront
4. **Index optimization**: All key queries have indexes
5. **Batch recommendations**: Generate all at once, not one by one

---

## 🎉 You're Ready!

**To Deploy:**
1. ✅ Run 4 migrations in Supabase
2. ✅ Add components to intimacy-hub-main.tsx
3. ✅ Test connection score with sample data
4. ✅ Test check-in flow
5. ✅ Test program enrollment

**What Works:**
- Connection scoring with 5 components
- AI-powered check-in recommendations
- Learning programs with 5 sample programs
- Achievement tracking
- Pattern analysis

**What's Next:**
- Build lesson viewer
- Build analytics dashboard
- Add more programs
- Create experiments integration

---

**Questions or issues?** Check the service files for detailed JSDoc comments and method signatures.

Good luck! 🚀
