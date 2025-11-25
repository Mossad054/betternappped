/**
 * Floating Notification Button
 * Bell icon button with unread badge
 * Matches Betternapped soft pastel design
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationWidget } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FloatingNotificationButton() {
  const { unreadCount, togglePanel, isPanelOpen } = useNotificationWidget();
  const { theme, themeMode } = useTheme();
  const colors = theme.colors;
  const scale = useSharedValue(1);

  // Pulse animation for unread notifications
  React.useEffect(() => {
    if (unreadCount > 0 && !isPanelOpen) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }
  }, [unreadCount, isPanelOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    togglePanel();
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: themeMode === 'dark' ? colors.surface : colors.primary,
          shadowColor: colors.shadow,
        },
        animatedStyle,
      ]}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isPanelOpen ? 'close' : unreadCount > 0 ? 'notifications' : 'notifications-outline'}
        size={24}
        color={themeMode === 'dark' ? colors.primary : colors.white}
      />
      
      {unreadCount > 0 && !isPanelOpen && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={[styles.badgeText, { color: colors.white }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
