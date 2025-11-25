# Intimacy Hub Restructure - Progress Report

## ✅ COMPLETED: Navigation Restructure

### Changes Made:

**1. Removed from Home Screen**
- ❌ Deleted "Intimacy Growth Hub" button from `app/(tabs)/home.tsx`
- ❌ Removed `Heart` icon import from home.tsx

**2. Added to Journal Screen**
- ✅ Added "Improve My Intimacy" button to `app/(tabs)/journal.tsx`
- ✅ Positioned after "Date Selection Card" for prominence
- ✅ Routes to `/intimacy-hub-main` (main dashboard)
- ✅ Added feature card styles matching Sleep Wellness Hub
- ✅ Removed old duplicate intimacy button from intimacy section
- ✅ Icon: Heart (32px), warm color scheme

**Button Design:**
```tsx
<TouchableOpacity 
  style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
  onPress={() => router.push('/intimacy-hub-main' as any)}
>
  <View style={styles.featureContent}>
    <Heart size={32} color={theme.colors.primary} />
    <View style={styles.featureText}>
      <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
        Improve My Intimacy
      </Text>
      <Text style={[styles.featureSubtitle, { color: theme.colors.textSecondary }]}>
        Track, understand & grow your intimate connection
      </Text>
    </View>
  </View>
  <ChevronRight size={24} color={theme.colors.textSecondary} />
</TouchableOpacity>
```

**User Flow:**
```
Journal Tab → Date Selection → [Improve My Intimacy Button] → Intimacy Hub Dashboard
```

---

## 🚧 TODO: Major Restructure Required

### 1. Redesign Check-In System (HIGH PRIORITY)

**Current State:**
- Single check-in screen with 9 generic sliders
- File: `app/intimacy-hub/check-in.tsx`

**Required Changes:**

#### A. Create 3 Separate Check-In Types

**Pre-Intimacy Check-In**
- **Purpose:** Track feelings/anticipation before intimate moment
- **Questions:**
  - How connected do you feel? (1-10) 😞 → 💖
  - Desire level? (1-10) 🥱 → 🔥
  - Stress level? (1-10) 😰 → 😌
  - Communication quality today? (1-10) 😶 → 💬
  - Optional: What are you looking forward to?
- **Save to:** `daily_checkins` with `checkin_type = 'pre_intimacy'`

**Post-Intimacy Check-In**
- **Purpose:** Reflect on intimate experience
- **Questions:**
  - How satisfied do you feel? (1-10) 😔 → 😊
  - Emotional closeness? (1-10) 😐 → 💕
  - Physical satisfaction? (1-10) 😕 → 🌟
  - Communication during? (1-10) 😶 → 💬
  - Optional: How do you feel right now? (text)
- **Save to:** `daily_checkins` with `checkin_type = 'post_intimacy'`
- **Extra Field:** `had_intimacy = true`

**Evening Wind-Down Check-In**
- **Purpose:** Track how intimacy affected sleep
- **Show When:** Time is after 8 PM
- **Questions:**
  - How long until you fell asleep? (minutes slider: 0-120)
  - Sleep quality expectation? (1-5) ⭐
  - Mood going to bed? (1-10) 😞 → 😊
  - Feeling connected? (Yes/No toggle)
- **Save to:** `daily_checkins` with `checkin_type = 'evening'`
- **Link:** Optional link to `user_experiments` if sleep experiment active

#### B. Dashboard Check-In Cards

**New Dashboard Layout (replace current quick check-in):**

```tsx
// Show cards based on context
{!hasDonePreCheckinToday && (
  <TouchableOpacity style={styles.checkInCard}>
    <View style={styles.cardIcon}>💖</View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>Pre-Intimacy Check-In</Text>
      <Text style={styles.cardSubtitle}>How are you feeling right now?</Text>
    </View>
    <ChevronRight />
  </TouchableOpacity>
)}

{hasHadIntimacyToday && !hasDonePostCheckinToday && (
  <TouchableOpacity style={styles.checkInCard}>
    <View style={styles.cardIcon}>✨</View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>Post-Intimacy Check-In</Text>
      <Text style={styles.cardSubtitle}>Reflect on your experience</Text>
    </View>
    <ChevronRight />
  </TouchableOpacity>
)}

{isEvening && !hasDoneEveningCheckinToday && (
  <TouchableOpacity style={styles.checkInCard}>
    <View style={styles.cardIcon}>🌙</View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>Evening Wind-Down</Text>
      <Text style={styles.cardSubtitle}>How did intimacy affect your sleep?</Text>
    </View>
    <ChevronRight />
  </TouchableOpacity>
)}
```

**Implementation Files:**
- Create: `app/intimacy-hub/check-in-pre.tsx`
- Create: `app/intimacy-hub/check-in-post.tsx`
- Create: `app/intimacy-hub/check-in-evening.tsx`
- Update: `app/intimacy-hub-main.tsx` (dashboard to show contextual cards)

---

### 2. Build Onboarding Flow (HIGH PRIORITY)

**Purpose:** Welcome new users, assess needs, personalize experience

**Onboarding Screens:**

#### Screen 1: Welcome
```
Welcome to Your Intimacy Growth Journey 💕

This is a private, judgment-free space to:
• Track your intimate connection
• Understand patterns and triggers
• Grow closer with science-backed programs
• Experiment with new approaches

Everything you share stays private.

[Get Started →]
```

#### Screen 2: About You
```
Help us personalize your experience

Relationship status:
[ ] In a relationship
[ ] Married
[ ] Exploring solo intimacy
[ ] Prefer not to say

Current intimacy satisfaction (1-10):
😞 ─────●─────── 😊

[Continue →]
```

#### Screen 3: Your Goals
```
What would you like to improve? (select all that apply)

[ ] Physical intimacy frequency
[ ] Emotional connection
[ ] Communication during intimacy
[ ] Desire/libido levels
[ ] Confidence and comfort
[ ] Understanding my needs
[ ] Trying new experiences
[ ] Other: ____________

[Continue →]
```

#### Screen 4: Challenges
```
What challenges do you face? (optional)

[ ] Stress affecting intimacy
[ ] Communication difficulties
[ ] Mismatched desires
[ ] Time/scheduling issues
[ ] Past trauma/healing
[ ] Low confidence
[ ] Physical concerns
[ ] Prefer not to share

[Continue →]
```

#### Screen 5: Personalized Recommendations
```
Based on your responses, we recommend:

🎯 Programs:
• Rebuilding Intimacy (7 lessons)
• Communication Foundations (5 lessons)

🔬 Experiments:
• Daily Connection Ritual (14 days)
• Stress-Free Evenings (7 days)

🎖️ Your first goal:
Complete 3 check-ins to unlock "Getting Started" badge

[Start Your Journey →]
```

**Implementation:**
- Create: `app/intimacy-hub/onboarding/*.tsx` (5 screens)
- Save responses to: `user_profiles` table (create new table)
- Auto-enroll in recommended programs
- Set `onboarding_completed = true` in user record

**Trigger Onboarding:**
```typescript
// In intimacy-hub-main.tsx
useEffect(() => {
  if (!user.intimacy_onboarding_completed) {
    router.push('/intimacy-hub/onboarding/welcome');
  }
}, []);
```

---

### 3. Build Experiments Library (MEDIUM PRIORITY)

**Current State:**
- experiments/index.tsx shows templates in list
- No categories, no filters, no search

**Required Changes:**

#### A. Experiments Library Screen

**New File:** `app/intimacy-hub/experiments-library.tsx`

**Features:**
- **Category Tabs:**
  - 💬 Communication (12 experiments)
  - 🤝 Connection (8 experiments)
  - 🔥 Physical (10 experiments)
  - ❤️ Emotional (7 experiments)
  - 🏡 Environmental (5 experiments)
  - ⭐ Recommended (personalized)

- **Search Bar:** Filter by name/description
- **Sort Options:** Popularity, Duration, Difficulty
- **Filters:** Duration (7/14/30 days), Difficulty (Easy/Medium/Hard)

**Card Design (per experiment):**
```tsx
<TouchableOpacity style={styles.experimentCard}>
  <View style={styles.experimentIcon}>🔥</View>
  <View style={styles.experimentContent}>
    <Text style={styles.experimentTitle}>Morning Connection Ritual</Text>
    <Text style={styles.experimentDescription}>
      Start each day with 5 minutes of intentional connection
    </Text>
    <View style={styles.experimentMeta}>
      <View style={styles.badge}>🕐 14 days</View>
      <View style={styles.badge}>⭐ Easy</View>
      <View style={styles.badge}>👥 24 active</View>
    </View>
  </View>
  <ChevronRight />
</TouchableOpacity>
```

#### B. Personalized Recommendations

**"Recommended For You" Logic:**
```typescript
const getRecommendedExperiments = (userMetrics, checkins) => {
  const recommendations = [];
  
  // Low connection score → suggest connection experiments
  if (userMetrics.connection_score < 50) {
    recommendations.push('daily_gratitude', 'morning_connection');
  }
  
  // High stress patterns → suggest stress-reduction
  const avgStress = checkins.reduce((sum, c) => sum + c.stress, 0) / checkins.length;
  if (avgStress > 7) {
    recommendations.push('stress_free_evenings', 'mindful_touch');
  }
  
  // Low communication scores → suggest communication experiments
  const avgComm = checkins.reduce((sum, c) => sum + c.communication_quality, 0) / checkins.length;
  if (avgComm < 6) {
    recommendations.push('daily_checkin_ritual', 'active_listening');
  }
  
  return recommendations;
};
```

**Update Navigation:**
```tsx
// In experiments/index.tsx, add button at top
<TouchableOpacity 
  style={styles.libraryButton}
  onPress={() => router.push('/intimacy-hub/experiments-library')}
>
  <Library size={20} color={theme.colors.primary} />
  <Text>Browse All Experiments</Text>
</TouchableOpacity>
```

---

### 4. Implement Programs Curation (MEDIUM PRIORITY)

**Current State:**
- Programs shown without personalization
- No "Recommended For You" section

**Required Changes:**

#### A. Add Recommendation Logic

**File:** `app/intimacy-hub/programs/index.tsx`

**New Section at Top:**
```tsx
{recommendedPrograms.length > 0 && (
  <View style={styles.recommendedSection}>
    <View style={styles.sectionHeader}>
      <Sparkles size={20} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>Recommended For You</Text>
    </View>
    <Text style={styles.sectionSubtitle}>
      Based on your connection score and recent check-ins
    </Text>
    
    {recommendedPrograms.map(program => (
      <TouchableOpacity 
        key={program.id}
        style={styles.recommendedCard}
      >
        <View style={styles.recommendedBadge}>⭐ Recommended</View>
        <Text style={styles.programTitle}>{program.title}</Text>
        <Text style={styles.recommendationReason}>
          {program.recommendationReason}
        </Text>
        <TouchableOpacity style={styles.enrollButton}>
          <Text>Start This Program →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ))}
  </View>
)}
```

#### B. Recommendation Logic

```typescript
const getRecommendedPrograms = async (userId: string) => {
  const metrics = await IntimacyHubService.getUserMetrics(userId);
  const checkins = await IntimacyHubService.getCheckins(userId, ...last30Days);
  const allPrograms = await IntimacyHubService.getPrograms(userId);
  
  const recommendations = [];
  
  // Connection score < 50 → Rebuilding Intimacy
  if (metrics.connection_score < 50) {
    const program = allPrograms.find(p => p.title.includes('Rebuilding'));
    if (program) {
      recommendations.push({
        ...program,
        recommendationReason: 'Your connection score suggests focusing on rebuilding foundations'
      });
    }
  }
  
  // Low communication → Communication program
  const avgComm = checkins.reduce((sum, c) => sum + c.communication_quality, 0) / checkins.length;
  if (avgComm < 5) {
    const program = allPrograms.find(p => p.title.includes('Communication'));
    if (program) {
      recommendations.push({
        ...program,
        recommendationReason: 'Improve clarity and understanding in your conversations'
      });
    }
  }
  
  // High desire mismatch → Desire Alignment program
  const desireLevels = checkins.map(c => c.desire_level);
  const desireVariance = calculateVariance(desireLevels);
  if (desireVariance > 3) {
    const program = allPrograms.find(p => p.title.includes('Desire'));
    if (program) {
      recommendations.push({
        ...program,
        recommendationReason: 'Address mismatched desire levels with evidence-based techniques'
      });
    }
  }
  
  return recommendations.slice(0, 3); // Max 3 recommendations
};
```

---

### 5. Apply Sleep Wellness Hub Theme (MEDIUM PRIORITY)

**Current State:**
- Basic theme applied
- Some hardcoded colors
- Inconsistent card styles

**Required Changes:**

**Match Sleep Wellness Hub Design Patterns:**

#### A. Color Palette
```typescript
// Update theme/colors for intimacy hub
const intimacyColors = {
  primary: '#EC4899', // Pink-500 (warm, intimate)
  primaryLight: '#FBB5D8', // Pink-300
  primaryDark: '#BE185D', // Pink-700
  accent: '#F97316', // Orange-500 (passion)
  accentLight: '#FDBA74', // Orange-300
  success: '#8FBC8F', // Sage green (growth)
  info: '#B084CC', // Purple (connection)
};
```

#### B. Card Layout Pattern

**From Sleep Wellness Hub:**
```tsx
// Stat Card Pattern
<View style={styles.statCard}>
  <View style={styles.statIcon}>
    <Moon size={24} color={theme.colors.primary} />
  </View>
  <View style={styles.statContent}>
    <Text style={styles.statValue}>7.2h</Text>
    <Text style={styles.statLabel}>Avg Sleep</Text>
  </View>
  <View style={styles.statTrend}>
    <TrendingUp size={16} color={theme.colors.success} />
    <Text style={styles.trendText}>+0.3h</Text>
  </View>
</View>
```

**Apply to Intimacy Hub:**
```tsx
// Connection Score Card
<View style={styles.statCard}>
  <View style={styles.statIcon}>
    <Heart size={24} color={theme.colors.primary} />
  </View>
  <View style={styles.statContent}>
    <Text style={styles.statValue}>{metrics.connection_score}</Text>
    <Text style={styles.statLabel}>Connection Score</Text>
  </View>
  <View style={styles.statTrend}>
    <TrendingUp size={16} color={theme.colors.success} />
    <Text style={styles.trendText}>+{metrics.connection_trend}</Text>
  </View>
</View>
```

#### C. Section Header Pattern

**Sleep Wellness Hub:**
```tsx
<View style={styles.sectionHeader}>
  <View style={styles.sectionTitleRow}>
    <Music size={20} color={theme.colors.primary} />
    <Text style={styles.sectionTitle}>Sound Library</Text>
  </View>
  <TouchableOpacity>
    <Text style={styles.seeAllText}>See All →</Text>
  </TouchableOpacity>
</View>
```

**Apply to All Intimacy Sections**

#### D. Modal Pattern

**Sleep Wellness Hub uses:**
- Backdrop blur
- Slide-up animation
- Rounded top corners
- Header with close button
- Scrollable content

**Apply to:**
- Experiment creation modal
- Program enrollment confirmation
- Achievement unlock celebration
- Assessment results modal

---

### 6. Enhance Achievements System (LOW PRIORITY)

**Current State:**
- Basic badge grid
- No animations
- Manual check required

**Required Enhancements:**

#### A. Auto-Check After Actions

```typescript
// After every action, check achievements
const actions = {
  async completeCheckin(userId: string) {
    await IntimacyHubService.createDailyCheckin(...);
    await IntimacyHubService.checkAndUnlockAchievements(userId);
  },
  
  async completeLesson(userId: string, lessonId: string) {
    await IntimacyHubService.completeLesson(userId, lessonId);
    await IntimacyHubService.checkAndUnlockAchievements(userId);
  },
  
  async completeExperiment(userId: string, experimentId: string) {
    await IntimacyHubService.completeExperiment(userId, experimentId);
    await IntimacyHubService.checkAndUnlockAchievements(userId);
  }
};
```

#### B. Unlock Celebration Modal

```tsx
// Show when achievement unlocked
<Modal visible={showAchievementModal} animationType="slide">
  <View style={styles.celebrationContainer}>
    <ConfettiAnimation /> {/* Use react-native-confetti-cannon */}
    
    <View style={styles.achievementBadge}>
      <Text style={styles.badgeIcon}>{achievement.icon}</Text>
    </View>
    
    <Text style={styles.congratsText}>Achievement Unlocked!</Text>
    <Text style={styles.achievementTitle}>{achievement.title}</Text>
    <Text style={styles.achievementDescription}>
      {achievement.description}
    </Text>
    
    <View style={styles.rewardInfo}>
      <Star size={20} color="#FFD700" />
      <Text style={styles.rewardText}>+{achievement.reward_points} points</Text>
    </View>
    
    <TouchableOpacity 
      style={styles.closeButton}
      onPress={() => setShowAchievementModal(false)}
    >
      <Text>Continue</Text>
    </TouchableOpacity>
  </View>
</Modal>
```

#### C. Progress Indicators

```tsx
// For achievements not yet unlocked, show progress
<View style={styles.achievementCard}>
  <View style={styles.achievementIcon}>
    <Text style={styles.iconEmoji}>{achievement.icon}</Text>
    {!achievement.unlocked && <View style={styles.lockOverlay}>🔒</View>}
  </View>
  
  <View style={styles.achievementContent}>
    <Text style={styles.achievementTitle}>{achievement.title}</Text>
    <Text style={styles.achievementDescription}>{achievement.description}</Text>
    
    {!achievement.unlocked && achievement.progress && (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(achievement.progress / achievement.total) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {achievement.progress}/{achievement.total}
        </Text>
      </View>
    )}
  </View>
</View>
```

---

## 📊 Implementation Priority

### Phase 1 (This Week)
1. ✅ Move button from home to journal
2. 🚧 Redesign check-in system (3 separate cards)
3. 🚧 Build onboarding flow (5 screens)

### Phase 2 (Next Week)
4. Build experiments library with categories
5. Implement programs curation logic
6. Apply Sleep Wellness Hub theme to all screens

### Phase 3 (Following Week)
7. Enhance achievements system with animations
8. Add recommendation engine for personalized suggestions
9. Polish UI/UX across all screens

---

## 🎯 Success Metrics

**After Restructure:**
- Users discover Intimacy Hub from Journal tab (natural flow)
- 80%+ new users complete onboarding
- 60%+ users complete at least one check-in type per week
- Personalized program recommendations increase enrollment by 30%+
- Achievement unlocks increase engagement by 25%+

---

## 🔗 File Structure After Restructure

```
app/
├── intimacy-hub-main.tsx (dashboard with contextual check-in cards)
├── intimacy-hub/
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── about-you.tsx
│   │   ├── goals.tsx
│   │   ├── challenges.tsx
│   │   └── recommendations.tsx
│   ├── check-in-pre.tsx (before intimacy)
│   ├── check-in-post.tsx (after intimacy)
│   ├── check-in-evening.tsx (wind-down)
│   ├── experiments-library.tsx (comprehensive library)
│   ├── programs/ (existing, enhanced with curation)
│   ├── experiments/ (existing, link to library)
│   └── achievements.tsx (existing, add animations)
```

---

**Status:** ✅ Navigation complete, major restructure planned
**Next Step:** Build 3 separate check-in screens (pre/post/evening)
