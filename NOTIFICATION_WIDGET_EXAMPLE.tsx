/**
 * Example: Adding Notification Widget to Activity Screen
 * This shows how to integrate the notification system
 */

// 1. Add imports at the top of your file
import { FloatingNotificationButton, NotificationPanel } from '@/components/notifications';
import { useNotificationWidget } from '@/contexts/NotificationContext';

export default function ActivityScreen() {
  const { addNotification } = useNotificationWidget();

  // Example: Trigger notification when experiment is logged
  const handleExperimentLog = async (experimentName: string, impact: any) => {
    // Your existing log logic...
    
    // Then add notification
    addNotification({
      category: 'experiments',
      title: `${experimentName} Logged! 🎯`,
      message: `Great progress! Keep tracking to see wellness insights.`,
      icon: '🧪',
      actionLabel: 'View Analysis',
      actionRoute: '/experiments-hub',
    });
  };

  // Example: Achievement notification
  const handleMilestone = (days: number) => {
    addNotification({
      category: 'achievements',
      title: `${days}-Day Streak! 🏆`,
      message: 'Amazing consistency! Your wellness is improving.',
      icon: '🏆',
      actionLabel: 'See Progress',
      actionRoute: '/activity',
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your existing screen content */}
      <ScrollView>
        {/* ... your components ... */}
      </ScrollView>

      {/* Add notification components at the end */}
      <FloatingNotificationButton />
      <NotificationPanel />
    </View>
  );
}

// ============================================================
// More Examples: Different Notification Types
// ============================================================

// Mood Insight
addNotification({
  category: 'moods',
  title: 'Pattern Detected 😊',
  message: 'You feel happiest after morning walks!',
  icon: '😊',
  actionLabel: 'Explore',
  actionRoute: '/mood-insights',
});

// Sleep Analysis
addNotification({
  category: 'sleep',
  title: 'Sleep Quality Up 15% 😴',
  message: 'Meditation before bed is helping!',
  icon: '😴',
  actionLabel: 'Details',
  actionRoute: '/sleep-hub',
});

// Habit Reminder (from backend)
addNotification({
  category: 'habits',
  title: 'Daily Meditation ⏰',
  message: "It's time for your 10-minute session",
  icon: '🎯',
  actionLabel: 'Start',
  actionRoute: '/home',
});

// Wellness Tip
addNotification({
  category: 'recommendations',
  title: 'Hydration Tip 💡',
  message: 'Drink water before coffee for better energy',
  icon: '💡',
  actionLabel: 'Learn More',
  actionRoute: '/tips',
});

// Clarity Test
addNotification({
  category: 'clarity',
  title: 'Mental Clarity Check 🧠',
  message: 'Take a 2-minute test to track cognitive health',
  icon: '🧠',
  actionLabel: 'Take Test',
  actionRoute: '/clarity-test',
});
