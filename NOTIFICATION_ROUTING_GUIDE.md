# Notification Routing & Deep Linking Guide

## Overview

This guide documents how notifications route users to the correct screens and actions when clicked. All notifications include routing metadata that enables deep linking throughout the app.

## Routing Structure

Every notification includes an `action` object with the following structure:

```typescript
action: {
  type: 'navigate' | 'deeplink',
  target: string,  // The route/screen to navigate to
  params?: Record<string, any>  // Optional parameters
}
```

Additionally, notifications include:
- `itemId`: The ID of the specific item (habit, experiment, activity, etc.)
- `itemType`: The type of item ('habit', 'experiment', 'activity', 'program', 'sleep', 'mood')

## Notification Types & Routes

### 1. Habit Notifications

#### Habit Reminder
**When**: Scheduled daily at user-configured time
**Route**: `/habits` with `habitId` param
**Action**: Opens habit list, scrolls to specific habit
**Example**:
```typescript
{
  action: { type: 'navigate', target: '/habits', params: { habitId: 'abc123' } },
  itemId: 'abc123',
  itemType: 'habit'
}
```

#### Habit Completed
**When**: User completes a habit
**Route**: `/habits` with `habitId` param
**Action**: Opens habit details showing completion stats

#### Streak Alert (High Priority)
**When**: User's streak is at risk (e.g., 2 hours before day ends)
**Route**: `/habits` with `habitId` param
**Action**: Opens habit directly for quick logging
**Priority**: HIGH (bypasses quiet hours)

#### Missed Habit Log
**When**: User hasn't logged habits by end of day
**Route**: `/habits`
**Action**: Opens habit list showing missed habits

### 2. Experiment Notifications

#### Experiment Reminder
**When**: Daily reminder to log experiment day
**Route**: `/create-experiment` with `experimentId` param
**Action**: Opens experiment logging screen
**Example**:
```typescript
{
  action: { type: 'navigate', target: '/create-experiment', params: { experimentId: 'exp_123' } },
  itemId: 'exp_123',
  itemType: 'experiment'
}
```

#### Experiment Completed
**When**: User completes an experiment
**Route**: `/experiments-hub`
**Action**: Opens experiments hub showing results
**Priority**: HIGH

### 3. Activity Notifications

#### Activity Reminder
**When**: Scheduled activity reminder
**Route**: `/journal` with `activityId` param
**Action**: Opens journal, pre-selects activity for logging
**Example**:
```typescript
{
  action: { type: 'navigate', target: '/journal', params: { activityId: 'activity_123' } },
  itemId: 'activity_123',
  itemType: 'activity'
}
```

### 4. Sleep Notifications

#### Sleep Reminder
**When**: Bedtime reminder
**Route**: `/journal` with `focusSection: 'sleep'` param
**Action**: Opens journal, scrolls to sleep section
**Example**:
```typescript
{
  action: { type: 'navigate', target: '/journal', params: { focusSection: 'sleep' } },
  itemType: 'sleep'
}
```

#### Sleep Tip
**When**: Weekly sleep improvement tips
**Route**: `/journal` with `focusSection: 'sleep'`
**Action**: Opens journal sleep section

### 5. Mood & Mental Clarity

#### Mood Check-in Reminder
**When**: Scheduled mood check time
**Route**: `/journal` with `focusSection: 'mood'` param
**Action**: Opens journal, scrolls to mood section
**Example**:
```typescript
{
  action: { type: 'navigate', target: '/journal', params: { focusSection: 'mood' } },
  itemType: 'mood'
}
```

#### Mood Insight
**When**: AI detects mood pattern
**Route**: `/journal` with `focusSection: 'mood'`
**Action**: Opens mood section with insight displayed

### 6. Program Notifications

#### Program Step Reminder
**When**: Daily program step reminder
**Route**: `/intimacy-hub/programs` with `programId` and `stepId` params
**Action**: Opens specific program step
**Example**:
```typescript
{
  action: {
    type: 'navigate',
    target: '/intimacy-hub/programs',
    params: { programId: 'prog_123', stepId: 'step_5' }
  },
  itemId: 'prog_123',
  itemType: 'program'
}
```

### 7. General Insights & Achievements

#### Activity Insight
**When**: AI generates insight from user data
**Route**: `/home`
**Action**: Opens home screen with insight highlighted

#### Weekly Summary
**When**: End of week
**Route**: `/home`
**Action**: Opens home screen

#### Milestone Reached
**When**: User reaches milestone (7-day streak, 30-day streak, etc.)
**Route**: `/home`
**Action**: Opens home with celebration animation
**Priority**: HIGH

## Implementation in Notification Handler

### Setup Notification Click Listener

```typescript
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

// In your root component or notification initializer:
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    handleNotificationClick(data);
  });

  return () => subscription.remove();
}, []);

function handleNotificationClick(data: any) {
  const { action, itemId, itemType } = data;

  if (!action) return;

  // Navigate to target
  if (action.type === 'navigate') {
    router.push({
      pathname: action.target,
      params: {
        ...action.params,
        itemId,
        itemType,
        fromNotification: 'true',
      },
    });
  }

  // Handle deep links
  if (action.type === 'deeplink') {
    Linking.openURL(action.target);
  }
}
```

### Handling Navigation in Target Screens

Each screen should check for notification params:

```typescript
// In /habits screen
export default function HabitsScreen() {
  const params = useLocalSearchParams();
  const { habitId, fromNotification } = params;

  useEffect(() => {
    if (fromNotification === 'true' && habitId) {
      // Scroll to specific habit
      scrollToHabit(habitId as string);

      // Optionally open habit details modal
      openHabitDetails(habitId as string);
    }
  }, [habitId, fromNotification]);

  // ... rest of component
}
```

## Notification States & Lifecycle

### When App is Closed
- Push notification appears in system tray
- User taps → App opens → Navigates to target
- Data is passed via `Notifications.getLastNotificationResponseAsync()`

### When App is in Background
- Push notification appears in system tray
- User taps → App comes to foreground → Navigates to target
- Data is passed via notification response listener

### When App is in Foreground
- In-app notification appears in notification widget
- User taps → Navigates to target
- Handled by in-app notification click handler

## Testing Notification Routing

### Test Checklist

- [ ] Habit reminder → Opens habits screen → Scrolls to correct habit
- [ ] Experiment reminder → Opens experiment screen → Shows correct experiment
- [ ] Activity reminder → Opens journal → Pre-selects activity
- [ ] Sleep reminder → Opens journal → Scrolls to sleep section
- [ ] Mood reminder → Opens journal → Scrolls to mood section
- [ ] Program reminder → Opens program → Shows correct step
- [ ] Streak alert → Opens habit quickly for logging
- [ ] Milestone → Shows celebration on home screen

### Test from Different App States

- [ ] App completely closed
- [ ] App in background (iOS)
- [ ] App in background (Android)
- [ ] App in foreground
- [ ] Device locked
- [ ] Device rotated

## Debugging

### Enable Notification Logging

```typescript
// Add to notification engine
console.log('📍 Notification routed to:', action.target);
console.log('📦 Notification data:', { itemId, itemType, params: action.params });
```

### Common Issues

1. **Navigation not working from closed state**
   - Check `Notifications.getLastNotificationResponseAsync()` in app root
   - Ensure navigation is called after navigation container is ready

2. **Params not being passed**
   - Verify `action.params` is included in notification payload
   - Check that target screen is reading params correctly

3. **Deep linking fails**
   - Ensure deep link URLs are registered in `app.json`
   - Check URL scheme configuration

## Future Enhancements

- [ ] Add notification action buttons (e.g., "Complete Now", "Snooze")
- [ ] Add notification categories for iOS
- [ ] Add notification grouping (multiple habits → one notification)
- [ ] Add rich notifications with images
- [ ] Add notification history in settings
