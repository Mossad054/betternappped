/**
 * Notification Card Component
 * Individual notification display
 * Soft pastel design aligned with Betternapped theme
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotificationWidget, type AppNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface NotificationCardProps {
  notification: AppNotification;
  index: number;
}

export function NotificationCard({ notification, index }: NotificationCardProps) {
  const { markAsRead, deleteNotification } = useNotificationWidget();
  const { theme, themeMode } = useTheme();
  const router = useRouter();
  const colors = theme.colors;

  const handlePress = () => {
    markAsRead(notification.id);
    
    if (notification.actionRoute) {
      router.push(notification.actionRoute as any);
    }
  };

  const handleDelete = () => {
    deleteNotification(notification.id);
  };

  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      exiting={FadeOut}
      style={[
        styles.container,
        {
          backgroundColor: notification.read
            ? themeMode === 'dark'
              ? colors.surface
              : colors.cardSecondary
            : themeMode === 'dark'
            ? colors.surfaceVariant
            : colors.surface,
          borderColor: notification.read ? colors.borderLight : colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={styles.content}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                themeMode === 'dark'
                  ? colors.primary + '20'
                  : colors.iconBackground.cyan,
            },
          ]}
        >
          <Text style={styles.icon}>{notification.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontWeight: notification.read ? '500' : '700',
                },
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.read && (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            )}
          </View>

          <Text
            style={[styles.message, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          <View style={styles.footer}>
            <Text style={[styles.time, { color: colors.textTertiary }]}>
              {timeAgo}
            </Text>
            {notification.actionLabel && (
              <Text style={[styles.action, { color: colors.primary }]}>
                {notification.actionLabel}
              </Text>
            )}
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.textTertiary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  textContent: {
    flex: 1,
    paddingRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
});

// Helper function to format time
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
}
