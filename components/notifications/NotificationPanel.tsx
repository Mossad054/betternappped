/**
 * Notification Panel
 * Slide-up panel with horizontal category tabs
 * All categories in single row (horizontal scroll)
 * Matches Betternapped soft pastel design
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationWidget, type NotificationCategory } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationCard } from './NotificationCard';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface CategoryTab {
  id: NotificationCategory;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All', icon: '🔔' },
  { id: 'experiments', label: 'Experiments', icon: '🧪' },
  { id: 'habits', label: 'Habits', icon: '🎯' },
  { id: 'moods', label: 'Moods', icon: '😊' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'clarity', label: 'Clarity', icon: '🧠' },
  { id: 'recommendations', label: 'Tips', icon: '💡' },
  { id: 'achievements', label: 'Wins', icon: '🏆' },
];

export function NotificationPanel() {
  const {
    notifications,
    isPanelOpen,
    closePanel,
    activeCategory,
    setActiveCategory,
    markAllAsRead,
    clearAll,
  } = useNotificationWidget();
  const { theme, themeMode } = useTheme();
  const colors = theme.colors;

  const translateY = useSharedValue(PANEL_HEIGHT);

  React.useEffect(() => {
    translateY.value = isPanelOpen
      ? withSpring(0, { damping: 20, stiffness: 90 })
      : withTiming(PANEL_HEIGHT, { duration: 250 });
  }, [isPanelOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Pan gesture to close
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(PANEL_HEIGHT, { duration: 250 }, () => {
          runOnJS(closePanel)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20 });
      }
    });

  // Filter notifications by category
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.category === activeCategory);
  }, [notifications, activeCategory]);

  const unreadInCategory = filteredNotifications.filter((n) => !n.read).length;
  const totalInCategory = filteredNotifications.length;

  if (!isPanelOpen) return null;

  return (
    <Modal
      visible={isPanelOpen}
      transparent
      animationType="fade"
      onRequestClose={closePanel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={closePanel}
      >
        <BlurView
          intensity={themeMode === 'dark' ? 20 : 40}
          style={StyleSheet.absoluteFillObject}
          tint={themeMode === 'dark' ? 'dark' : 'light'}
        />
      </TouchableOpacity>

      {/* Panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
            animatedStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.dragHandleContainer}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: colors.textTertiary + '40' },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {unreadInCategory > 0
                  ? `${unreadInCategory} unread`
                  : `${totalInCategory} notification${
                      totalInCategory !== 1 ? 's' : ''
                    }`}
              </Text>
            </View>

            <View style={styles.headerActions}>
              {unreadInCategory > 0 && (
                <TouchableOpacity
                  onPress={() => markAllAsRead(activeCategory)}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              {totalInCategory > 0 && (
                <TouchableOpacity
                  onPress={() => clearAll(activeCategory)}
                  style={styles.headerButton}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Horizontal Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => {
              const categoryCount = notifications.filter(
                (n) => category.id === 'all' || n.category === category.id
              ).length;
              const isActive = activeCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : themeMode === 'dark'
                        ? colors.surface
                        : colors.cardSecondary,
                      borderColor: isActive
                        ? colors.primary
                        : colors.borderLight,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: isActive
                          ? colors.white
                          : colors.textPrimary,
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                  {categoryCount > 0 && (
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: isActive
                            ? colors.white + '30'
                            : colors.primary + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryBadgeText,
                          {
                            color: isActive
                              ? colors.white
                              : colors.primary,
                          },
                        ]}
                      >
                        {categoryCount > 99 ? '99+' : categoryCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Notifications List */}
          <ScrollView
            style={styles.notificationsList}
            contentContainerStyle={styles.notificationsContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔕</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No notifications yet
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: colors.textTertiary }]}
                >
                  You're all caught up!
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
  },
  categoryBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
