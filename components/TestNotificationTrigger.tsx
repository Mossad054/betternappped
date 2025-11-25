/**
 * Test Notification Trigger
 * Use this component to test the notification widget
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNotificationWidget } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';

export function TestNotificationTrigger() {
  const { addNotification } = useNotificationWidget();
  const { theme } = useTheme();

  const sendTestNotification = (category: any) => {
    const notifications: Record<string, any> = {
      experiment: {
        category: 'experiments',
        title: 'Meditation Progress 🧪',
        message: 'Day 5 complete! Your sleep improved by 12%',
        icon: '🧪',
        actionLabel: 'View Analysis',
        actionRoute: '/experiments-hub',
      },
      habit: {
        category: 'habits',
        title: '7-Day Streak! 🎯',
        message: 'Amazing consistency with morning walks',
        icon: '🎯',
        actionLabel: 'Keep Going',
        actionRoute: '/home',
      },
      mood: {
        category: 'moods',
        title: 'Pattern Detected 😊',
        message: 'You feel happiest after exercise',
        icon: '😊',
        actionLabel: 'Explore',
        actionRoute: '/journal',
      },
      sleep: {
        category: 'sleep',
        title: 'Great Sleep! 😴',
        message: '8.5 hours - your best week yet',
        icon: '😴',
        actionLabel: 'Details',
        actionRoute: '/sleep-wellness-hub',
      },
      achievement: {
        category: 'achievements',
        title: 'Wellness Warrior! 🏆',
        message: '30 days of consistent tracking',
        icon: '🏆',
        actionLabel: 'Celebrate',
        actionRoute: '/home',
      },
    };

    addNotification(notifications[category]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Test Notification Widget
      </Text>
      <View style={styles.buttonGrid}>
        {['experiment', 'habit', 'mood', 'sleep', 'achievement'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => sendTestNotification(type)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.white }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
