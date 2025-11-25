# 🚀 Notification Widget - Quick Start Guide

## ⚡ Setup in 3 Steps

### **Step 1: Add Provider to Root Layout**

Edit `app/_layout.tsx`:

```tsx
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>  {/* ← Add this */}
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### **Step 2: Add Widget to Screen**

Edit `app/(tabs)/activity.tsx`:

```tsx
import { FloatingNotificationButton, NotificationPanel } from '@/components/notifications';

export default function ActivityScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your existing content */}
      
      {/* Add these two lines at the end */}
      <FloatingNotificationButton />
      <NotificationPanel />
    </View>
  );
}
```

### **Step 3: Send Notifications**

Anywhere in your code:

```tsx
import { useNotificationWidget } from '@/contexts/NotificationContext';

function YourComponent() {
  const { addNotification } = useNotificationWidget();

  const sendNotification = () => {
    addNotification({
      category: 'experiments',
      title: 'Experiment Logged! 🎯',
      message: 'Great progress on your meditation practice',
      icon: '🧪',
      actionLabel: 'View Insights',
      actionRoute: '/experiments-hub',
    });
  };

  return <Button onPress={sendNotification} title="Log Progress" />;
}
```

---

## ✨ That's It!

You now have:
- ✅ Floating bell button with badge
- ✅ Slide-up panel with 8 categories
- ✅ Smooth animations
- ✅ Light/dark mode support
- ✅ Backend sync with Supabase

---

## 📱 Where to Add the Widget

Add `<FloatingNotificationButton />` and `<NotificationPanel />` to:

- ✅ `app/(tabs)/activity.tsx` - Main activity tracking
- ✅ `app/(tabs)/home.tsx` - Home dashboard
- ✅ `app/(tabs)/journal.tsx` - Journal entries
- ✅ `app/(tabs)/calendar.tsx` - Calendar view
- ❌ Don't add to modals or popups

---

## 🎯 When to Send Notifications

```tsx
// After logging experiment
addNotification({
  category: 'experiments',
  title: 'Day 5 Complete! 🧪',
  message: 'Meditation is improving your sleep by 12%',
  icon: '🧪',
});

// After habit completion
addNotification({
  category: 'habits',
  title: '7-Day Streak! 🎯',
  message: 'Amazing consistency!',
  icon: '🎯',
});

// When pattern detected
addNotification({
  category: 'moods',
  title: 'Pattern Found 😊',
  message: 'You feel best after morning exercise',
  icon: '😊',
});

// Achievement unlocked
addNotification({
  category: 'achievements',
  title: 'Wellness Warrior! 🏆',
  message: '30 days of consistent tracking',
  icon: '🏆',
});
```

---

## 🎨 Category Reference

| Category | Icon | Use For |
|----------|------|---------|
| experiments | 🧪 | Experiment milestones, insights |
| habits | 🎯 | Habit completions, streaks |
| moods | 😊 | Mood patterns, check-ins |
| sleep | 😴 | Sleep analysis, quality alerts |
| clarity | 🧠 | Mental clarity tests, insights |
| recommendations | 💡 | Tips, personalized advice |
| achievements | 🏆 | Milestones, celebrations |

---

## 🔥 Pro Tips

1. **Don't Spam** - Be thoughtful about when to notify
2. **Be Specific** - Clear titles and actionable messages
3. **Add Actions** - Include `actionLabel` and `actionRoute` when relevant
4. **Use Right Category** - Helps users filter notifications
5. **Celebrate Wins** - Use achievements for milestones

---

## 📖 Full Documentation

See `NOTIFICATION_WIDGET_COMPLETE.md` for:
- Architecture details
- Theme customization
- Backend integration
- Advanced usage
- Troubleshooting

---

## 🎉 You're Ready!

Start sending notifications and enhance your app's engagement! 🚀
