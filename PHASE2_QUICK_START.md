# Phase 2 Quick Start Guide

## Overview
This guide will help you quickly implement Phase 2 of the onboarding and authentication updates.

**Estimated Time**: 9-14 hours
**Difficulty**: Medium

## Prerequisites
- ✅ Phase 1 is complete (check `ONBOARDING_UPDATE_PHASE1_COMPLETE.md`)
- ✅ Test Phase 1 features first to ensure no issues
- ✅ Have reference design photos handy

## Task List

### Part 1: Apply AuthGuard (2-3 hours)

#### 1.1 Habit Library
**File**: `app/habit-library.tsx`

Add at the top:
```tsx
import { AuthGuard } from '@/components/AuthGuard';
```

Wrap the return statement:
```tsx
export default function HabitLibraryScreen() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true}>
      {/* All existing JSX */}
    </AuthGuard>
  );
}
```

**Test**:
- Open app as guest
- Try to access Habit Library
- Verify auth prompt appears
- Sign in and verify page works

#### 1.2 Sleep & Wellness Hub
**File**: `app/sleep-wellness-hub.tsx`

Apply same pattern:
```tsx
import { AuthGuard } from '@/components/AuthGuard';

export default function SleepWellnessHub() {
  return (
    <AuthGuard requireAuth={true}>
      {/* All existing JSX */}
    </AuthGuard>
  );
}
```

#### 1.3 Journal Tab
**File**: `app/(tabs)/journal.tsx`

Apply same pattern.

#### 1.4 Experiment Creation (Conditional)
**File**: `app/create-experiment.tsx`

This one is slightly different - guest users can browse experiments but need auth to save. Consider adding auth check in the save function instead of wrapping entire page.

### Part 2: Update Onboarding Screens (6-8 hours)

For **each** onboarding screen, follow this pattern:

#### Template for Each Screen

**Before**:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

export default function OnboardingScreen() {
  const { theme } = useTheme(); // ❌ Remove this

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* content */}
    </View>
  );
}
```

**After**:
```tsx
import { OnboardingTheme } from '@/constants/onboardingTheme';
// Remove: import { useTheme } from '@/contexts/ThemeContext';

export default function OnboardingScreen() {
  const theme = OnboardingTheme; // ✅ Use fixed theme

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* content with decorative elements */}
    </View>
  );
}
```

#### Screens to Update (in order):

1. **welcome.tsx** (Start here)
   - Replace theme
   - Add decorative elements
   - Test in light/dark mode

2. **track-wellness.tsx**
3. **experiments.tsx**
4. **insights.tsx**
5. **get-started.tsx**
6. **goals.tsx** (if exists)
7. **questions.tsx** (if exists)

#### For Each Screen:

1. **Remove** `import { useTheme } from '@/contexts/ThemeContext';`
2. **Add** `import { OnboardingTheme } from '@/constants/onboardingTheme';`
3. **Replace** `const { theme } = useTheme();` with `const theme = OnboardingTheme;`
4. **Add decorative elements** (doodles, icons):
   ```tsx
   <View style={styles.doodlesContainer}>
     {/* Add decorative SVGs or icons here */}
     <View style={[styles.doodle, styles.doodle1]}>
       {/* Carrot icon, for example */}
     </View>
     <View style={[styles.doodle, styles.doodle2]}>
       {/* Book icon */}
     </View>
   </View>
   ```
5. **Test** the screen in both light and dark modes
6. **Verify** it matches reference photos

### Part 3: Testing (2-3 hours)

#### Test Checklist

**AuthGuard Tests**:
- [ ] Guest user sees auth prompt on habit library
- [ ] Guest user sees auth prompt on sleep & wellness hub
- [ ] Guest user sees auth prompt on journal
- [ ] "Create Account" button works
- [ ] "Sign In" button works
- [ ] "Go Back" button works
- [ ] After signing in, user can access restricted pages
- [ ] Authenticated users don't see auth prompt

**Onboarding Theme Tests**:
- [ ] Enable dark mode → Onboarding still uses light cream/peach colors
- [ ] Disable dark mode → Onboarding looks correct
- [ ] Customize app theme → Onboarding unaffected
- [ ] All onboarding screens use consistent colors
- [ ] Text is readable on all screens
- [ ] Decorative elements are visible
- [ ] Buttons are tappable
- [ ] Navigation works correctly

**Preferred Name Tests** (from Phase 1):
- [ ] Sign up with preferred name → Name saved to profile
- [ ] Sign up without preferred name → No errors
- [ ] Name appears in app after signup
- [ ] Email verification flow works with preferred name

**Responsive Tests**:
- [ ] Test on iPhone (iOS simulator or device)
- [ ] Test on Android (emulator or device)
- [ ] Test on tablet (if applicable)
- [ ] All screen sizes look correct

## Quick Commands

### Start the app
```bash
npx expo start
```

### Check for TypeScript errors
```bash
npx tsc --noEmit
```

### Test on iOS simulator
```bash
npx expo start --ios
```

### Test on Android emulator
```bash
npx expo start --android
```

## Common Issues & Solutions

### Issue: AuthGuard not showing
**Solution**: Make sure you're in guest mode. Check `AsyncStorage` for `guest_mode` key.

### Issue: Onboarding still uses dark mode colors
**Solution**: You may have forgotten to replace `useTheme()` with `OnboardingTheme`. Check imports.

### Issue: Decorative elements not showing
**Solution**: Check z-index and positioning. Ensure SVGs/icons are imported correctly.

### Issue: Preferred name not saving
**Solution**: Check console logs for errors. Verify `ProfileService` is imported in `AuthContext`.

## Code Snippets

### Add Decorative Circle
```tsx
// In your onboarding screen
<View style={[styles.decorativeCircle, {
  backgroundColor: theme.colors.decorative1,
  position: 'absolute',
  top: 50,
  right: 20,
  width: 80,
  height: 80,
  borderRadius: 40,
  opacity: 0.6,
}]} />
```

### Add Simple Doodle Icon
```tsx
import { BookOpen } from 'lucide-react-native';

// In your JSX
<View style={styles.doodleIcon}>
  <BookOpen
    size={48}
    color={theme.colors.decorative4}
    strokeWidth={2}
  />
</View>
```

### Gradient Background (if needed)
```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingGradients } from '@/constants/onboardingTheme';

// In your JSX
<LinearGradient
  colors={OnboardingGradients.primary.colors}
  start={OnboardingGradients.primary.start}
  end={OnboardingGradients.primary.end}
  style={styles.gradient}
>
  {/* Your content */}
</LinearGradient>
```

## Design Guidelines

### Colors to Use (from OnboardingTheme)
- **Background**: `theme.colors.background` (#FFF8E7 - Cream)
- **Cards**: `theme.colors.card` (#FFFFFF - White)
- **Primary Actions**: `theme.colors.primary` (#FF6B35 - Orange)
- **Text**: `theme.colors.text` (#2D3142 - Dark blue-gray)
- **Secondary Text**: `theme.colors.textSecondary` (#6B7280 - Gray)
- **Decorative**: Use `theme.colors.decorative1` through `decorative6`

### Spacing
- Screen padding: `theme.spacing.screenHorizontal` (24px)
- Sections: `theme.spacing.sectionGap` (40px)
- Elements: `theme.spacing.md` (16px)

### Typography
- Titles: `theme.typography.h2` (32px, bold)
- Subtitles: `theme.typography.subtitle` (18px, medium)
- Body: `theme.typography.body` (16px, regular)
- Buttons: `theme.typography.button` (16px, semi-bold)

## Progress Tracking

As you complete each screen, check it off:

**AuthGuard Applied**:
- [ ] `app/habit-library.tsx`
- [ ] `app/sleep-wellness-hub.tsx`
- [ ] `app/(tabs)/journal.tsx`
- [ ] Conditional auth in experiments

**Onboarding Screens Updated**:
- [ ] `app/onboarding/welcome.tsx`
- [ ] `app/onboarding/track-wellness.tsx`
- [ ] `app/onboarding/experiments.tsx`
- [ ] `app/onboarding/insights.tsx`
- [ ] `app/onboarding/get-started.tsx`
- [ ] `app/onboarding/goals.tsx`
- [ ] `app/onboarding/questions.tsx`

**Testing Complete**:
- [ ] All AuthGuard tests passing
- [ ] All onboarding theme tests passing
- [ ] All preferred name tests passing
- [ ] All responsive tests passing

## When You're Done

1. **Run through the entire app flow**:
   - Clear app data
   - Go through onboarding as guest
   - Try to access restricted pages
   - Sign up with preferred name
   - Access restricted pages after auth
   - Verify everything works

2. **Document any issues or deviations**:
   - Note any design changes you made
   - Document any bugs encountered
   - List any features that need follow-up

3. **Create a summary**:
   - Screenshot key screens
   - Note completion time
   - List any remaining tasks

## Need Help?

Refer to these documents:
- `ONBOARDING_UPDATE_PHASE1_COMPLETE.md` - What was completed in Phase 1
- `ONBOARDING_AND_AUTH_UPDATE_PLAN.md` - Full implementation plan
- `constants/onboardingTheme.ts` - Theme constants and usage

---

**Ready to start?** Begin with Part 1.1 (Habit Library AuthGuard) and test thoroughly before moving to the next task!

Good luck! 🚀
