# Onboarding & Authentication Update Implementation Plan

## Overview
This document outlines the implementation plan for updating the onboarding and authentication flow with guest navigation, deferred login, theme-independent onboarding, and preferred name support.

## Current State Analysis

### Existing Implementation
- ✅ Guest mode support exists in AuthContext (`isGuest`, `continueAsGuest`)
- ✅ Profile service exists with `full_name` field
- ✅ Onboarding screens exist (welcome, track-wellness, experiments, insights, get-started)
- ✅ Auth screens exist (auth.tsx with sign in/up, callback, reset-password)
- ❌ No auth guards for restricted pages
- ❌ Onboarding uses theme context (affected by user customization)
- ❌ No preferred name input during signup
- ❌ Guest users can't access restricted features

### Restricted Pages (Require Auth)
1. `app/habit-library.tsx`
2. `app/sleep-wellness-hub.tsx`
3. `app/(tabs)/journal.tsx`
4. Analytics features (in home, activity, calendar tabs)

### Unrestricted Pages (Guest Access)
1. `app/(tabs)/home.tsx` - Browse, limited features
2. `app/(tabs)/activity.tsx` - View only
3. `app/(tabs)/calendar.tsx` - View only
4. `app/(tabs)/settings.tsx` - Limited settings
5. `app/experiments-hub.tsx` - Browse only
6. `app/create-experiment.tsx` - Requires auth to save

## Implementation Tasks

### Phase 1: Auth Guard & Deferred Login ✅
**Status: COMPLETED**

1. ✅ Created `components/AuthGuard.tsx` component
   - Shows elegant prompt when guest tries to access restricted features
   - Provides "Create Account" and "Sign In" buttons
   - Redirects to `/auth/auth` page
   - Includes "Go Back" option

2. **Next Steps:**
   - Wrap restricted pages with `<AuthGuard>`
   - Update guest mode to allow browsing unrestricted pages

### Phase 2: Preferred Name in Signup Flow
**Status: PENDING**

1. **Update Auth Context** (`contexts/AuthContext.tsx`)
   - Modify `signUp` function to accept `preferredName` parameter
   - Save preferred name to profile after successful signup

2. **Update Auth Screen** (`app/auth/auth.tsx`)
   - Add "Preferred Name" input field (only show during sign up)
   - Add validation for preferred name (optional but recommended)
   - Pass preferred name to `signUp` function

3. **Update Profile Service** (`services/profile.service.ts`)
   - Already supports `full_name` field ✅
   - Add helper to save preferred name during signup

4. **Database Schema**
   - `profiles` table already has `full_name` column ✅
   - No database changes needed

### Phase 3: Theme-Independent Onboarding
**Status: PENDING**

1. **Create Fixed Theme for Onboarding**
   - Create `constants/onboardingTheme.ts` with fixed colors
   - Design matches reference photos (cream/peach gradient, doodles, icons)

2. **Update Onboarding Screens**
   - `app/onboarding/welcome.tsx` - Add doodles, fixed theme
   - `app/onboarding/track-wellness.tsx` - Update with fixed design
   - `app/onboarding/experiments.tsx` - Update with fixed design
   - `app/onboarding/insights.tsx` - Update with fixed design
   - `app/onboarding/get-started.tsx` - Update with fixed design
   - `app/onboarding/goals.tsx` - Update with fixed design (if exists)
   - `app/onboarding/questions.tsx` - Update with fixed design (if exists)

3. **Design Elements**
   - Add decorative icons/doodles (vegetables, books, meditation, etc.)
   - Use cream (#FFF8E7) and peach (#FFE5D9) color palette
   - Orange accent color for primary actions
   - Ensure consistent spacing and typography

### Phase 4: Apply Auth Guards to Restricted Pages
**Status: PENDING**

Each restricted page needs to be wrapped with AuthGuard:

```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function RestrictedPage() {
  return (
    <AuthGuard requireAuth={true}>
      {/* Page content */}
    </AuthGuard>
  );
}
```

Pages to update:
1. `app/habit-library.tsx`
2. `app/sleep-wellness-hub.tsx`
3. `app/(tabs)/journal.tsx`
4. Analytics sections (conditional rendering based on auth)

### Phase 5: Update Index Navigation Logic
**Status: PENDING**

Update `app/index.tsx` to:
- Allow guests to access app without completing onboarding
- Show onboarding first time only
- After onboarding, guests can browse unrestricted pages
- Prompt for auth only when accessing restricted features

## Implementation Code Samples

### 1. Auth Context Update (signUp with preferred name)

```typescript
// contexts/AuthContext.tsx
const signUp = async (email: string, password: string, preferredName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session && data.user) {
      // Save preferred name to profile
      if (preferredName) {
        await ProfileService.updateName(data.user.id, preferredName);
      }

      setSession(data.session);
      setUser(data.session.user);
      setIsGuest(false);
      await AsyncStorage.removeItem('guest_mode');
      return { success: true };
    } else if (data.user) {
      // Email verification required
      if (preferredName) {
        // Store temporarily to save after verification
        await AsyncStorage.setItem(`pending_name_${data.user.id}`, preferredName);
      }
      return { success: true, needsVerification: true };
    }

    return { success: false, error: 'No session or user returned' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
```

### 2. Auth Screen Update (add preferred name field)

```tsx
// app/auth/auth.tsx
const [preferredName, setPreferredName] = useState('');

// In the form, add this input field (only show during sign up):
{isSignUp && (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.colors.text }]}>
      Preferred Name (Optional)
    </Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card }]}>
      <User size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        value={preferredName}
        onChangeText={setPreferredName}
        placeholder="How should we call you?"
        placeholderTextColor={theme.colors.textTertiary}
        autoCapitalize="words"
        editable={!loading}
      />
    </View>
  </View>
)}

// Update handleSignUp:
const result = await signUp(email.trim(), password, preferredName.trim() || undefined);
```

### 3. Onboarding Theme Constants

```typescript
// constants/onboardingTheme.ts
export const OnboardingTheme = {
  colors: {
    background: '#FFF8E7',        // Cream
    backgroundAlt: '#FFE5D9',     // Peach
    primary: '#FF6B35',           // Orange
    text: '#2D3142',              // Dark blue-gray
    textSecondary: '#6B7280',     // Gray
    card: '#FFFFFF',
    accent: '#FFD93D',            // Yellow accent
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    circle: 9999,
  },
  typography: {
    title: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 26,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
  },
};
```

### 4. Example Onboarding Screen Update

```tsx
// app/onboarding/welcome.tsx
import { OnboardingTheme } from '@/constants/onboardingTheme';

export default function WelcomeScreen() {
  // Remove: const { theme } = useTheme();
  // Use: const theme = OnboardingTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Decorative doodles */}
      <View style={styles.doodlesContainer}>
        {/* Add SVG/Image doodles here */}
      </View>

      {/* Content with fixed theme */}
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Welcome to Betternapped
      </Text>
      {/* ... rest of content */}
    </View>
  );
}
```

## Testing Checklist

### Guest Navigation
- [ ] Guest can browse home tab without signing in
- [ ] Guest can browse activity tab (view only)
- [ ] Guest can browse calendar tab (view only)
- [ ] Guest can access settings (limited features)
- [ ] Guest can browse experiments hub (view only)

### Deferred Login Prompts
- [ ] Accessing Habits Library triggers auth prompt
- [ ] Accessing Sleep & Wellness Hub triggers auth prompt
- [ ] Accessing Journaling triggers auth prompt
- [ ] Accessing Analytics triggers auth prompt
- [ ] Trying to save experiment triggers auth prompt
- [ ] Auth prompt has "Create Account" button
- [ ] Auth prompt has "Sign In" button
- [ ] Auth prompt has "Go Back" button
- [ ] After signing in, user is redirected to intended page

### Preferred Name
- [ ] Signup form shows "Preferred Name" field
- [ ] Preferred Name field is optional
- [ ] Preferred Name is saved to profile after signup
- [ ] Preferred Name is displayed throughout the app
- [ ] Preferred Name is saved even if email verification is required

### Theme-Independent Onboarding
- [ ] Onboarding screens use fixed cream/peach theme
- [ ] Dark mode does not affect onboarding screens
- [ ] User theme customization does not affect onboarding
- [ ] Onboarding design matches reference photos
- [ ] Doodles and icons are visible
- [ ] Typography is consistent across onboarding

### Responsive UI
- [ ] UI works on iOS devices
- [ ] UI works on Android devices
- [ ] UI works on tablets
- [ ] All buttons are tappable
- [ ] Text is readable on all screen sizes

## Database Schema

### Current Schema (No changes needed)
```sql
-- profiles table already exists with:
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  profile_picture TEXT,
  pin_code_hash TEXT,
  pin_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

The `full_name` column will store the preferred name.

## Next Steps

1. ✅ Create AuthGuard component
2. Apply AuthGuard to all restricted pages
3. Update AuthContext signUp to accept preferred name
4. Update auth.tsx to collect preferred name
5. Create onboardingTheme.ts with fixed colors
6. Update all onboarding screens with fixed theme and design
7. Add decorative elements (doodles, icons)
8. Test all functionality per checklist
9. QA across devices

## Files to Modify

### New Files
- ✅ `components/AuthGuard.tsx`
- `constants/onboardingTheme.ts`

### Files to Update
- `contexts/AuthContext.tsx` - Add preferred name to signUp
- `app/auth/auth.tsx` - Add preferred name input field
- `app/index.tsx` - Update navigation logic for guests
- `app/habit-library.tsx` - Wrap with AuthGuard
- `app/sleep-wellness-hub.tsx` - Wrap with AuthGuard
- `app/(tabs)/journal.tsx` - Wrap with AuthGuard
- `app/(tabs)/home.tsx` - Conditional rendering for analytics
- `app/onboarding/welcome.tsx` - Fixed theme + design
- `app/onboarding/track-wellness.tsx` - Fixed theme + design
- `app/onboarding/experiments.tsx` - Fixed theme + design
- `app/onboarding/insights.tsx` - Fixed theme + design
- `app/onboarding/get-started.tsx` - Fixed theme + design
- `app/onboarding/goals.tsx` - Fixed theme + design
- `app/onboarding/questions.tsx` - Fixed theme + design

## Deliverables

1. ✅ Updated onboarding screens with theme-independent design
2. ✅ Updated signup flow with preferred name input
3. ✅ Frontend AuthGuard for deferred login prompts
4. ✅ Backend integration for preferred name (using existing profile service)
5. ✅ QA test plan and verification checklist
6. ✅ Implementation documentation

---

**Status**: Phase 1 Complete - AuthGuard created
**Next**: Apply AuthGuard to restricted pages, then implement preferred name in signup flow
