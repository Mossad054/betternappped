# 🚀 Notification System - Quick Start Guide

Get the complete notification system running in 5 minutes!

---

## ✅ Prerequisites

- Expo app running
- User authentication working
- Supabase database connected

---

## 📦 Step 1: Verify Dependencies

All required packages are already installed:

```json
{
  "expo-notifications": "~0.30.5",
  "expo-device": "~7.0.1"
}
```

✅ No additional installation needed!

---

## 🗄️ Step 2: Run Database Migration

The notification tables already exist in your schema. Verify they're in your Supabase database:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'notifications',
  'notification_preferences',
  'user_devices',
  'item_notification_overrides'
);
```

**Expected Output**: 4 tables

If any are missing, run:
```sql
-- In Supabase SQL Editor
-- Copy and paste from: database/migrations/001_create_notifications_system.sql
```

---

## 🎯 Step 3: Test the System

The system is **already integrated** and will start automatically when a user logs in!

### Automatic Initialization

When a user logs in, the `NotificationInitializer` component automatically:

1. ✅ Requests notification permissions
2. ✅ Gets Expo push token
3. ✅ Registers device in database
4. ✅ Schedules all reminders

### Manual Testing

#### Test 1: Check Scheduled Notifications

```typescript
import { NotificationSchedulerService } from '@/services/notificationScheduler.service';

// View all scheduled notifications
const scheduled = await NotificationSchedulerService.getScheduledNotifications();
console.log('📅 Scheduled:', scheduled.length);
scheduled.forEach(n => {
  console.log(`- ${n.content.title} at ${JSON.stringify(n.trigger)}`);
});
```

#### Test 2: Send Test Push Notification

```typescript
import { PushNotificationService } from '@/services/pushNotification.service';

// Send test notification
const success = await PushNotificationService.sendTestNotification(userId);
console.log('Test notification sent:', success);
```

#### Test 3: Schedule a Habit Reminder

```typescript
import { NotificationSchedulerService } from '@/services/notificationScheduler.service';

// Schedule reminder at 9:00 AM daily
await NotificationSchedulerService.scheduleHabitReminder(
  userId,
  habitId,
  'Morning Exercise',
  { hour: 9, minute: 0 }
);

console.log('✅ Habit reminder scheduled for 9:00 AM daily');
```

---

## 🔔 Step 4: Test in Settings Screen

1. Open app and log in
2. Go to **Settings → Notifications**
3. Enable notifications for any type
4. Click **"Send Test"** button
5. You should receive a notification! 🎉

---

## 📱 Step 5: Test on Device

### iOS Testing

```bash
# Build for iOS
npx expo run:ios
```

1. App opens → Notification permission dialog appears
2. Click "Allow"
3. Log in with a user account
4. Check console for:
   ```
   🔔 Initializing notifications for user: [user_id]
   ✅ Notification permissions granted
   ✅ Push token registered
   🎉 Notification system fully initialized!
   ```

### Android Testing

```bash
# Build for Android
npx expo run:android
```

Same steps as iOS.

---

## 🎨 Step 6: Customize Default Times

Edit default notification times in `services/notificationScheduler.service.ts`:

```typescript
// Current defaults:
Morning Mood:        8:00 AM
Default Habit:       9:00 AM
Mental Clarity:     10:00 AM
Sleep Logging:       7:30 AM
Activity Logging:    7:00 PM
Experiment Logging:  8:00 PM
Intimacy Check-in:   9:00 PM
Bedtime:            10:00 PM
```

To change, find the relevant `schedule*Reminder` method and update the time:

```typescript
// Example: Change morning mood from 8 AM to 7 AM
{ hour: 7, minute: 0, repeats: true }  // Changed from hour: 8
```

---

## 🔍 Debugging

### Check Permissions

```typescript
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.getPermissionsAsync();
console.log('Permission:', status); // Should be "granted"
```

### Check Device Token

```typescript
import { PushNotificationService } from '@/services/pushNotification.service';

const tokens = await PushNotificationService.getUserDeviceTokens(userId);
console.log('Device tokens:', tokens);
// Should show at least one token like: "ExponentPushToken[xxxxx]"
```

### View Notification History

```sql
-- In Supabase SQL Editor
SELECT
  type,
  channel,
  payload->>'title' as title,
  created_at
FROM notifications
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🐛 Troubleshooting

### Problem: No notifications showing

**Solutions**:
1. Check device notification settings (System Settings → App → Notifications)
2. Verify permission granted: `Notifications.getPermissionsAsync()`
3. Check console for errors during initialization

### Problem: Push token not registered

**Solutions**:
1. Ensure user is logged in
2. Check console for registration errors
3. Verify `user_devices` table exists in database
4. Try on physical device (push notifications don't work in simulator)

### Problem: Notifications fire but don't navigate

**Solutions**:
1. This is expected - navigation integration is in the data payload
2. Check `NotificationInitializer.tsx` response listener
3. Implement navigation based on `data.action.target`

### Problem: Too many notifications

**Solutions**:
1. User can disable in Settings → Notifications
2. Enable Quiet Hours (10 PM - 7 AM)
3. Adjust default times in scheduler service

---

## 📊 Expected Behavior

### On Login

```
Console Output:
🔔 Initializing notifications for user: abc123
✅ Notification permissions granted
✅ Push token registered: ExponentPushToken[xxxxx]
📅 Scheduling all habit reminders...
📅 Scheduling all experiment reminders...
📅 Scheduling mood reminders...
📅 Scheduling sleep reminders...
📅 Scheduling mental clarity reminder...
📅 Scheduling intimacy check-in reminder...
📅 Scheduling activity reminder...
📅 Scheduling weekly summary...
🎉 Notification system fully initialized!
```

### When Habit Completed

```
Console Output:
✅ Push notification sent: Morning Exercise Completed!
📬 In-app notification created
```

### Daily at 9 AM (if habit has 9 AM reminder)

```
Notification appears:
Title: "Time for Morning Exercise! 🎯"
Body: "Keep your 5 day streak alive! 🔥"
```

---

## 🎯 Quick Reference

### Schedule All Notifications

```typescript
await NotificationSchedulerService.initializeAllNotifications(userId);
```

### Schedule Specific Feature

```typescript
// Habits
await NotificationSchedulerService.scheduleAllHabitReminders(userId);

// Experiments
await NotificationSchedulerService.scheduleAllExperimentReminders(userId);

// Mood
await NotificationSchedulerService.scheduleMoodReminders(userId);

// Sleep
await NotificationSchedulerService.scheduleSleepReminders(userId);

// Mental Clarity
await NotificationSchedulerService.scheduleMentalClarityReminder(userId);

// Intimacy
await NotificationSchedulerService.scheduleIntimacyCheckInReminder(userId);
```

### Cancel All Notifications

```typescript
await NotificationSchedulerService.cancelAllNotifications(userId);
```

### Refresh After Settings Change

```typescript
await NotificationSchedulerService.refreshAllNotifications(userId);
```

### Send Immediate Push

```typescript
await PushNotificationService.sendToUser(
  userId,
  'Your Title',
  'Your message here',
  { custom: 'data' }
);
```

---

## 🎉 Success Criteria

You'll know the system is working when:

✅ Permission request appears on first app open
✅ Console shows "Notification system fully initialized"
✅ Device token appears in `user_devices` table
✅ Test notification from Settings works
✅ Scheduled notifications appear at correct times
✅ In-app notification widget shows notifications
✅ Tapping notification opens relevant screen (when navigation implemented)

---

## 📚 Next Steps

1. **Test all notification types** - Use Settings → Notifications → Send Test
2. **Customize times** - Adjust default reminder times for your users
3. **Implement navigation** - Add deep linking for notification taps
4. **Add analytics** - Track notification open rates
5. **Enable digest mode** - Batch notifications for less interruption

---

## 💡 Pro Tips

1. **Test on real device**: Push notifications don't work in iOS Simulator
2. **Check quiet hours**: Default is 10 PM - 7 AM
3. **Daily limit**: Only one reminder per feature per day (non-nagging)
4. **Refresh on changes**: Call `refreshAllNotifications()` when user updates habits/experiments
5. **Monitor logs**: Console shows all notification activity

---

## 🔗 Related Docs

- [Complete System Documentation](./NOTIFICATION_SYSTEM_COMPLETE.md)
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Notification Settings UI](./components/settings/NotificationSettings.tsx)

---

**Ready to go!** 🚀 The notification system is fully set up and will start working as soon as a user logs in.

Any issues? Check the troubleshooting section above or the complete documentation.
