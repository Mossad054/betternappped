# Database and Feature Implementation Documentation

## Overview

This document outlines the comprehensive implementation of onboarding, guest mode navigation, CRUD services, database seeding, and analytics engine for the Betternapped wellness tracking app.

## 1. Onboarding System

### Architecture
The onboarding system consists of 5 screens that guide new users through the app's features:

```
onboarding/
├── welcome.tsx          # Welcome screen with app branding
├── track-wellness.tsx   # Feature highlight: Comprehensive tracking
├── experiments.tsx      # Feature highlight: Self-experiments
├── insights.tsx         # Feature highlight: AI-powered insights
└── get-started.tsx      # Final screen with auth options
```

### Navigation Flow
- **First Launch**: Users see onboarding screens
- **Skip Option**: Available on each screen (top-right)
- **Progress Indicators**: Dots showing current position
- **Completion**: Stored in `AsyncStorage` with key `onboarding_completed`

### AsyncStorage Keys Used
- `onboarding_completed`: Boolean flag indicating if user completed onboarding
- `guest_mode`: Boolean flag indicating if user is in guest mode

### Navigation Logic
```typescript
// app/index.tsx
if (!onboardingCompleted) {
  return <Redirect href="/onboarding/welcome" />;
}
```

## 2. Guest Mode Implementation

### AuthContext Modifications
Added guest mode support to the authentication context:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;  // New property
  continueAsGuest: () => Promise<void>;  // New method
  // ... existing methods
}
```

### Guest Mode State Management
- **Storage**: Guest mode preference stored in `AsyncStorage` with key `guest_mode`
- **Persistence**: Guest mode persists across app restarts
- **Clearance**: Guest mode is cleared when user signs in or signs out

### Demo User Setup
- **Email**: `demo@betternapped.com`
- **Purpose**: Provides realistic demo data for guest users
- **Data Volume**: 60 days of comprehensive wellness data

### Read-Only Restrictions
Implemented across multiple components:

#### Home Screen Banner
```typescript
{isGuest && (
  <View style={styles.guestBanner}>
    <Text>👤 You're viewing demo data. Sign up to track your own wellness journey!</Text>
    <TouchableOpacity onPress={() => router.push('/auth/signup')}>
      <Text>Sign Up</Text>
    </TouchableOpacity>
  </View>
)}
```

#### Floating Add Button
```typescript
if (isGuest) {
  Alert.alert(
    'Sign Up Required',
    'Please sign up to add your own entries and track your wellness journey!',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Up', onPress: () => router.push('/auth/signup') }
    ]
  );
  return;
}
```

#### Add Entry Screen
```typescript
useEffect(() => {
  if (isGuest) {
    Alert.alert(
      'Sign Up Required',
      'Please sign up to add your own entries and track your wellness journey!',
      [
        { text: 'Cancel', onPress: () => router.back() },
        { text: 'Sign Up', onPress: () => router.push('/auth/signup') }
      ]
    );
  }
}, [isGuest]);
```

## 3. CRUD Services

### Service File Organization
All services follow a consistent pattern:

```
services/
├── moods.service.ts
├── sleep.service.ts
├── activities.service.ts
├── habits.service.ts
├── experiments.service.ts
├── productivity.service.ts
├── intimacy.service.ts
├── mentalClarity.service.ts
└── analytics.service.ts
```

### Common Patterns
Each service implements standard CRUD operations:

```typescript
export const ServiceName = {
  // Create
  create: async (userId: string, data: ServiceData) => {
    const { data: result, error } = await supabase
      .from('table_name')
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  },

  // Read
  getByDateRange: async (userId: string, startDate: Date, endDate: Date) => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  },

  // Update
  update: async (id: string, data: Partial<ServiceData>) => {
    const { data: result, error } = await supabase
      .from('table_name')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  },

  // Delete
  delete: async (id: string) => {
    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  }
};
```

### Error Handling Approach
- **Consistent Return Format**: All functions return `{ data, error }` or `{ error }`
- **Error Propagation**: Errors are thrown and caught at component level
- **User Feedback**: Alert dialogs for user-facing errors
- **Console Logging**: Detailed logging for debugging

### Guest Mode Support
Services check for guest mode and use demo user ID:

```typescript
const getUserId = (isGuest: boolean, user: User | null) => {
  if (isGuest) {
    return 'DEMO_USER_ID'; // Replace with actual demo user ID
  }
  return user?.id;
};
```

## 4. Mock Data Seeding

### Demo User Creation Steps
1. **Sign Up**: Create account with `demo@betternapped.com` via app
2. **Get User ID**: Query `SELECT id FROM auth.users WHERE email = 'demo@betternapped.com';`
3. **Update Script**: Replace `DEMO_USER_ID` in `database/comprehensive-seed-data.sql`
4. **Run Script**: Execute in Supabase SQL Editor
5. **Verify**: Check data appears in all tables

### Seed Script Structure
The comprehensive seed script (`database/comprehensive-seed-data.sql`) includes:

#### Data Volume and Variety
- **Mood Logs**: 60 entries with realistic patterns
- **Sleep Logs**: 60 entries with weekend/weekday variations
- **Activities**: ~300 entries (2-6 per day)
- **Habits**: 8 habits with 60 days of completion tracking
- **Experiments**: 4 experiments (2 active, 2 completed)
- **Productivity Logs**: 60 entries with focus scores
- **Intimacy Logs**: 20 entries over 60 days
- **Mental Clarity Tests**: 10 tests over 60 days

#### Realistic Data Patterns
```sql
-- Mood patterns based on day of week
mood_score := CASE 
  WHEN i % 7 = 0 THEN 4 + (random() * 2)::INTEGER -- Sundays tend to be good
  WHEN i % 7 = 1 THEN 3 + (random() * 2)::INTEGER -- Mondays vary
  -- ... etc
END;

-- Sleep patterns with weekend variations
sleep_hours := CASE 
  WHEN i % 7 IN (0, 6) THEN 8.0 + (random() * 2.0) -- Weekends: longer sleep
  ELSE 6.5 + (random() * 1.5) -- Weekdays: shorter
END;
```

#### Habit Completion Rates
- **70% completion rate** on average
- **Realistic patterns** with some streaks and misses
- **Varied notes** for completed vs missed days

## 5. Analytics Engine

### Correlation Analysis Functions
Enhanced `services/analytics.service.ts` with correlation analysis:

```typescript
export const AnalyticsService = {
  // Sleep-Mood Correlation
  analyzeSleepMoodCorrelation: async (userId: string, days: number = 30) => {
    // Fetch sleep hours & mood scores for date range
    // Calculate Pearson correlation coefficient
    // Return: { correlation: number, trend: string, insights: string[] }
  },

  // Activity-Energy Correlation
  analyzeActivityEnergyCorrelation: async (userId: string, days: number = 30) => {
    // Compare activity types with mood/energy scores
    // Identify activities that boost or drain energy
    // Return: { activities: Array<{name, impact, correlation}> }
  },

  // Habits-Wellness Correlation
  analyzeHabitsWellnessCorrelation: async (userId: string, habitId: string) => {
    // Compare habit completion with overall wellness scores
    // Track mood/sleep on days habit completed vs not
    // Return: { impact, recommendation, data: Array<{date, completed, wellness}> }
  },

  // Weekly Insights Generation
  generateWeeklyInsights: async (userId: string) => {
    // Run all correlations
    // Generate 3-5 actionable insights
    // Return: Array<{ title, description, priority, data }>
  },

  // Helper: Calculate correlation coefficient
  calculateCorrelation: (xValues: number[], yValues: number[]) => {
    // Pearson correlation formula
    // Return value between -1 and 1
  }
};
```

### Correlation Calculations
Uses Pearson correlation coefficient:

```typescript
calculateCorrelation(xValues: number[], yValues: number[]) {
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return correlation;
}
```

### Insight Generation Logic
1. **Data Collection**: Fetch relevant data for correlation analysis
2. **Correlation Calculation**: Run correlation analysis on different metrics
3. **Pattern Recognition**: Identify significant correlations (>0.3 or <-0.3)
4. **Insight Generation**: Create actionable recommendations based on patterns
5. **Priority Assignment**: Rank insights by correlation strength and impact

### Performance Considerations
- **Caching**: Cache correlation results to avoid repeated calculations
- **Date Ranges**: Limit analysis to recent data (30-90 days) for performance
- **Batch Processing**: Process multiple correlations in single database query
- **Error Handling**: Graceful degradation when data is insufficient

## 6. Testing Checklist

### Onboarding Flow
- [ ] Onboarding screens display correctly
- [ ] Progress indicators work properly
- [ ] Skip functionality works on all screens
- [ ] Navigation between screens is smooth
- [ ] Completion flag is set correctly
- [ ] Users don't see onboarding after completion

### Guest Mode
- [ ] Guest mode can be enabled from onboarding
- [ ] Guest users see demo data
- [ ] Guest banner displays on home screen
- [ ] Add entry button shows signup alert for guests
- [ ] Add entry screen redirects guests
- [ ] Guest mode persists across app restarts
- [ ] Guest mode is cleared on sign in/out

### CRUD Operations
- [ ] All services have create, read, update, delete functions
- [ ] Data is saved correctly to database
- [ ] Data is retrieved correctly from database
- [ ] Updates modify existing records properly
- [ ] Deletes remove records from database
- [ ] Error handling works for all operations

### Database Seeding
- [ ] Demo user can be created via app
- [ ] Seed script runs without errors
- [ ] All tables are populated with data
- [ ] Data relationships are maintained
- [ ] Data volume matches expected amounts
- [ ] Data patterns are realistic

### Analytics Engine
- [ ] Correlation calculations are accurate
- [ ] Insights are generated correctly
- [ ] Performance is acceptable with large datasets
- [ ] Error handling works for insufficient data
- [ ] Results are displayed in UI components

## 7. File Structure

```
app/
├── onboarding/
│   ├── welcome.tsx
│   ├── track-wellness.tsx
│   ├── experiments.tsx
│   ├── insights.tsx
│   └── get-started.tsx
├── auth/
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
├── (tabs)/
│   ├── home.tsx (updated with guest banner)
│   ├── activity.tsx
│   ├── calendar.tsx
│   └── settings.tsx
└── add-entry.tsx (updated with guest redirect)

components/
├── FloatingAddButton.tsx (updated with guest alert)
├── GradientBackground.tsx
├── NeonIcon.tsx
└── NeonButton.tsx

contexts/
└── AuthContext.tsx (updated with guest mode)

services/
├── moods.service.ts
├── sleep.service.ts
├── activities.service.ts
├── habits.service.ts
├── experiments.service.ts
├── productivity.service.ts
├── intimacy.service.ts
├── mentalClarity.service.ts
└── analytics.service.ts (enhanced with correlations)

database/
├── schema.sql
├── seed-mock-data.sql
├── auto-seed-new-user.sql
└── comprehensive-seed-data.sql (new)
```

## 8. Implementation Summary

This implementation provides:

1. **Complete Onboarding Flow**: 5-screen guided tour with feature highlights
2. **Guest Mode Support**: Read-only access with demo data and signup prompts
3. **Comprehensive CRUD Services**: Full data operations for all wellness tracking
4. **Realistic Demo Data**: 60 days of varied, realistic wellness data
5. **Analytics Engine**: Correlation analysis and insight generation
6. **Seamless User Experience**: Smooth transitions between guest and authenticated modes

The system is designed to be maintainable, scalable, and user-friendly while providing comprehensive wellness tracking capabilities.

