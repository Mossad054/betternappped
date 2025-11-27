import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModernTimePicker, { TimeValue } from '@/components/ModernTimePicker';
import {
  ArrowLeft,
  Clock,
  Bell,
  Zap,
  Target,
  Moon,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  Check,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationService } from '@/services/notifications.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
  NotificationPriority,
  NotificationPreference,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  FREQUENCY_DESCRIPTIONS,
  TIME_PRESETS,
  DEFAULT_QUIET_HOURS,
  parseTimeString,
  formatTimeString,
  formatTimeLabel,
  TimeObject,
  WEEKDAY_LABELS,
  WEEKDAY_PRESETS,
} from '@/lib/notificationConstants';

interface NotificationSettingsProps {
  onBack: () => void;
}

interface NotificationTypeConfig {
  type: NotificationType;
  icon: React.ComponentType<any>;
  color: string;
  defaultChannels: NotificationChannel[];
  defaultFrequency: NotificationFrequency;
  priority: NotificationPriority;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  
  // Global quiet hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState<TimeObject>(DEFAULT_QUIET_HOURS.start);
  const [quietHoursEnd, setQuietHoursEnd] = useState<TimeObject>(DEFAULT_QUIET_HOURS.end);
  
  // Modals
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  
  // Modal context
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);
  const [tempChannels, setTempChannels] = useState<NotificationChannel[]>([]);
  const [tempFrequency, setTempFrequency] = useState<NotificationFrequency>(NotificationFrequency.IMMEDIATE);
  const [tempTime, setTempTime] = useState<TimeValue>({ hour: 9, minute: 0 });

  // Time pickers for quiet hours - using new modern picker
  const [quietHoursEditMode, setQuietHoursEditMode] = useState<'start' | 'end' | null>(null);

  // Notification type configurations
  const notificationTypes: NotificationTypeConfig[] = [
    {
      type: NotificationType.DAILY_REMINDER,
      icon: Bell,
      color: theme.colors.primary,
      defaultChannels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.IMMEDIATE,
      priority: NotificationPriority.NORMAL,
    },
    {
      type: NotificationType.STREAK_ALERT,
      icon: Zap,
      color: theme.colors.warning,
      defaultChannels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.IMMEDIATE,
      priority: NotificationPriority.HIGH,
    },
    {
      type: NotificationType.EXPERIMENT_REMINDER,
      icon: Target,
      color: theme.colors.accent,
      defaultChannels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.IMMEDIATE,
      priority: NotificationPriority.NORMAL,
    },
    {
      type: NotificationType.ACTIVITY_INSIGHT,
      icon: TrendingUp,
      color: theme.colors.info,
      defaultChannels: [NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.DAILY_DIGEST,
      priority: NotificationPriority.NORMAL,
    },
    {
      type: NotificationType.SLEEP_TIP,
      icon: Moon,
      color: theme.colors.secondary,
      defaultChannels: [NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.WEEKLY_DIGEST,
      priority: NotificationPriority.NORMAL,
    },
    {
      type: NotificationType.HABIT_SUGGESTION,
      icon: Lightbulb,
      color: theme.colors.success,
      defaultChannels: [NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.WEEKLY_DIGEST,
      priority: NotificationPriority.NORMAL,
    },
    {
      type: NotificationType.MISSED_LOG,
      icon: AlertCircle,
      color: theme.colors.error,
      defaultChannels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      defaultFrequency: NotificationFrequency.IMMEDIATE,
      priority: NotificationPriority.NORMAL,
    },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  // ============================================================
  // Data Loading
  // ============================================================

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const result = await NotificationService.getAllPreferences(userId);
      if (result.error) {
        Alert.alert('Error', 'Failed to load notification preferences');
        console.error('Load preferences error:', result.error);
      } else if (result.data) {
        setPreferences(result.data);
        
        // Load quiet hours from first preference (they're global)
        const firstPref = result.data[0];
        if (firstPref?.quiet_hours_start && firstPref?.quiet_hours_end) {
          setQuietHoursEnabled(true);
          setQuietHoursStart(parseTimeString(firstPref.quiet_hours_start));
          setQuietHoursEnd(parseTimeString(firstPref.quiet_hours_end));
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Preference Management
  // ============================================================

  const getPreference = (type: NotificationType): NotificationPreference | undefined => {
    return preferences.find((p) => p.type === type);
  };

  const toggleEnabled = async (type: NotificationType, enabled: boolean) => {
    setSaving(true);
    try {
      const result = await NotificationService.togglePreference(userId, type, enabled);
      if (result.error) {
        Alert.alert('Error', 'Failed to update notification preference');
        console.error('Toggle error:', result.error);
      } else {
        // Update local state
        setPreferences((prev) =>
          prev.map((p) => (p.type === type ? { ...p, enabled } : p))
        );
      }
    } catch (error) {
      console.error('Error toggling preference:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const updateChannels = async (type: NotificationType, channels: NotificationChannel[]) => {
    setSaving(true);
    try {
      const result = await NotificationService.upsertPreference(userId, { type, channels });
      if (result.error) {
        Alert.alert('Error', 'Failed to update channels');
      } else {
        setPreferences((prev) =>
          prev.map((p) => (p.type === type ? { ...p, channels } : p))
        );
      }
    } catch (error) {
      console.error('Error updating channels:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const updateFrequency = async (type: NotificationType, frequency: NotificationFrequency) => {
    setSaving(true);
    try {
      const result = await NotificationService.upsertPreference(userId, { type, frequency });
      if (result.error) {
        Alert.alert('Error', 'Failed to update frequency');
      } else {
        setPreferences((prev) =>
          prev.map((p) => (p.type === type ? { ...p, frequency } : p))
        );
      }
    } catch (error) {
      console.error('Error updating frequency:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const updateTime = async (type: NotificationType, timeOfDay: string) => {
    setSaving(true);
    try {
      const result = await NotificationService.upsertPreference(userId, {
        type,
        time_of_day: timeOfDay,
      });
      if (result.error) {
        Alert.alert('Error', 'Failed to update time');
      } else {
        setPreferences((prev) =>
          prev.map((p) => (p.type === type ? { ...p, time_of_day: timeOfDay } : p))
        );
      }
    } catch (error) {
      console.error('Error updating time:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const updateQuietHours = async () => {
    setSaving(true);
    try {
      const startStr = quietHoursEnabled ? formatTimeString(quietHoursStart) : undefined;
      const endStr = quietHoursEnabled ? formatTimeString(quietHoursEnd) : undefined;

      const result = await NotificationService.updateQuietHours(userId, startStr, endStr);
      if (result.error) {
        Alert.alert('Error', 'Failed to update quiet hours');
      } else {
        // Update local state
        setPreferences((prev) =>
          prev.map((p) => ({
            ...p,
            quiet_hours_start: startStr,
            quiet_hours_end: endStr,
          }))
        );
        Alert.alert('Success', 'Quiet hours updated');
      }
    } catch (error) {
      console.error('Error updating quiet hours:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // Render Methods
  // ============================================================

  const renderNotificationTypeCard = (config: NotificationTypeConfig) => {
    const preference = getPreference(config.type);
    const IconComponent = config.icon;
    const enabled = preference?.enabled || false;
    const channels = preference?.channels || config.defaultChannels;
    const frequency = preference?.frequency || config.defaultFrequency;
    const timeOfDay = preference?.time_of_day;

    return (
      <View
        key={config.type}
        style={[
          styles.notificationCard,
          { 
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadows.small,
          },
        ]}
      >
        {/* Header with toggle */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
            <IconComponent size={20} color={config.color} />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              {NOTIFICATION_TYPE_LABELS[config.type]}
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                },
              ]}
            >
              {NOTIFICATION_TYPE_DESCRIPTIONS[config.type]}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(value) => toggleEnabled(config.type, value)}
            trackColor={{ false: theme.colors.border, true: config.color }}
            thumbColor="#FFFFFF"
            disabled={saving}
          />
        </View>

        {/* Options (only show when enabled) */}
        {enabled && (
          <View style={styles.cardOptions}>
            {/* Channels */}
            <TouchableOpacity
              style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
              onPress={() => {
                setSelectedType(config.type);
                setTempChannels(channels);
                setShowChannelModal(true);
              }}
              disabled={saving}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Channels</Text>
              <View style={styles.optionValue}>
                <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
                  {channels.map((c) => CHANNEL_LABELS[c]).join(', ')}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Frequency */}
            <TouchableOpacity
              style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
              onPress={() => {
                setSelectedType(config.type);
                setTempFrequency(frequency);
                setShowFrequencyModal(true);
              }}
              disabled={saving}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Frequency</Text>
              <View style={styles.optionValue}>
                <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
                  {FREQUENCY_LABELS[frequency]}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Time (if applicable) */}
            {frequency === NotificationFrequency.IMMEDIATE && timeOfDay && (
              <TouchableOpacity
                style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
                onPress={() => {
                  setSelectedType(config.type);
                  const time = parseTimeString(timeOfDay);
                  setTempTime({ hour: time.hour, minute: time.minute });
                  setShowTimePickerModal(true);
                }}
                disabled={saving}
              >
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Time</Text>
                <View style={styles.optionValue}>
                  <View style={{ marginRight: 4 }}>
                    <Clock size={16} color={theme.colors.textSecondary} />
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.textSecondary }]}>
                    {formatTimeLabel(parseTimeString(timeOfDay))}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderQuietHoursSection = () => (
    <View style={[styles.section, { marginTop: theme.spacing.xl }]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
          },
        ]}
      >
        Quiet Hours
      </Text>
      <Text
        style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing.base,
          },
        ]}
      >
        Prevent low-priority notifications during specified hours
      </Text>

      <View
        style={[
          styles.notificationCard,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            ...theme.shadows.small,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.secondary}15` }]}>
            <Moon size={20} color={theme.colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              Enable Quiet Hours
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                },
              ]}
            >
              {quietHoursEnabled
                ? `${formatTimeLabel(quietHoursStart)} - ${formatTimeLabel(quietHoursEnd)}`
                : 'Not configured'}
            </Text>
          </View>
          <Switch
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
            thumbColor="#FFFFFF"
            disabled={saving}
          />
        </View>

        {quietHoursEnabled && (
          <TouchableOpacity
            style={[
              styles.optionRow,
              { borderTopWidth: 1, borderTopColor: theme.colors.border },
            ]}
            onPress={() => setShowQuietHoursModal(true)}
            disabled={saving}
          >
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
              Configure Hours
            </Text>
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );


  // ============================================================
  // Modal Renders
  // ============================================================

  const renderChannelModal = () => (
    <Modal
      visible={showChannelModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowChannelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              Select Channels
            </Text>
            <TouchableOpacity onPress={() => setShowChannelModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {Object.values(NotificationChannel).map((channel) => {
            const isSelected = tempChannels.includes(channel);
            return (
              <TouchableOpacity
                key={channel}
                style={[
                  styles.modalOption,
                  { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
                onPress={() => {
                  if (isSelected) {
                    setTempChannels(tempChannels.filter((c) => c !== channel));
                  } else {
                    setTempChannels([...tempChannels, channel]);
                  }
                }}
              >
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                  {CHANNEL_LABELS[channel]}
                </Text>
                {isSelected && <Check size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: theme.colors.primary, marginTop: theme.spacing.base },
            ]}
            onPress={() => {
              if (selectedType && tempChannels.length > 0) {
                updateChannels(selectedType, tempChannels);
              }
              setShowChannelModal(false);
            }}
          >
            <Text
              style={[
                styles.modalButtonText,
                { color: '#FFFFFF', fontWeight: theme.typography.fontWeight.semibold },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFrequencyModal = () => (
    <Modal
      visible={showFrequencyModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowFrequencyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              Select Frequency
            </Text>
            <TouchableOpacity onPress={() => setShowFrequencyModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {[
            NotificationFrequency.IMMEDIATE,
            NotificationFrequency.DAILY_DIGEST,
            NotificationFrequency.WEEKLY_DIGEST,
          ].map((frequency) => {
            const isSelected = tempFrequency === frequency;
            return (
              <TouchableOpacity
                key={frequency}
                style={[
                  styles.modalOption,
                  { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
                ]}
                onPress={() => setTempFrequency(frequency)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                    {FREQUENCY_LABELS[frequency]}
                  </Text>
                  <Text
                    style={[
                      styles.modalOptionDescription,
                      {
                        color: theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.sm,
                      },
                    ]}
                  >
                    {FREQUENCY_DESCRIPTIONS[frequency]}
                  </Text>
                </View>
                {isSelected && <Check size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: theme.colors.primary, marginTop: theme.spacing.base },
            ]}
            onPress={() => {
              if (selectedType) {
                updateFrequency(selectedType, tempFrequency);
              }
              setShowFrequencyModal(false);
            }}
          >
            <Text
              style={[
                styles.modalButtonText,
                { color: '#FFFFFF', fontWeight: theme.typography.fontWeight.semibold },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTimePickerModal = () => (
    <ModernTimePicker
      visible={showTimePickerModal}
      onClose={() => setShowTimePickerModal(false)}
      onConfirm={(time) => {
        if (selectedType) {
          const timeStr = formatTimeString(time);
          updateTime(selectedType, timeStr);
        }
        setShowTimePickerModal(false);
      }}
      initialTime={tempTime}
      is24Hour={false}
      title="Select Notification Time"
    />
  );

  const renderQuietHoursModal = () => (
    <Modal
      visible={showQuietHoursModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowQuietHoursModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              Configure Quiet Hours
            </Text>
            <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Start Time */}
          <TouchableOpacity
            style={[styles.modalOption, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
            onPress={() => setQuietHoursEditMode('start')}
          >
            <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>Start Time</Text>
            <Text style={[styles.modalOptionValue, { color: theme.colors.textSecondary }]}>
              {formatTimeLabel(quietHoursStart)}
            </Text>
          </TouchableOpacity>

          {/* End Time */}
          <TouchableOpacity
            style={[styles.modalOption, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
            onPress={() => setQuietHoursEditMode('end')}
          >
            <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>End Time</Text>
            <Text style={[styles.modalOptionValue, { color: theme.colors.textSecondary }]}>
              {formatTimeLabel(quietHoursEnd)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: theme.colors.primary, marginTop: theme.spacing.base },
            ]}
            onPress={() => {
              updateQuietHours();
              setShowQuietHoursModal(false);
            }}
            disabled={saving}
          >
            <Text
              style={[
                styles.modalButtonText,
                { color: '#FFFFFF', fontWeight: theme.typography.fontWeight.semibold },
              ]}
            >
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  // ============================================================
  // Main Render
  // ============================================================

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
              },
            ]}
          >
            Notifications & Reminders
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            },
          ]}
        >
          Notifications & Reminders
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.info + '15', borderLeftColor: theme.colors.info }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.info }]}>💡 Smart Notifications</Text>
          <Text style={[styles.infoText, { color: theme.colors.info }]}>
            Customize what notifications you receive, how you receive them, and when. We'll batch low-priority updates and respect your quiet hours.
          </Text>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                marginBottom: theme.spacing.base,
              },
            ]}
          >
            Notification Types
          </Text>
          {notificationTypes.map((config) => renderNotificationTypeCard(config))}
        </View>

        {/* Quiet Hours */}
        {renderQuietHoursSection()}

        {/* Footer Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.warning + '15', borderLeftColor: theme.colors.warning, marginTop: theme.spacing.xl }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.warning }]}>⚙️ Advanced Settings</Text>
          <Text style={[styles.infoText, { color: theme.colors.warning }]}>
            • High-priority notifications (streaks) always deliver immediately{'\n'}
            • Digest notifications combine multiple updates{'\n'}
            • Maximum 10 push notifications per day
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderChannelModal()}
      {renderFrequencyModal()}
      {renderTimePickerModal()}
      {renderQuietHoursModal()}

      {/* Modern Time Pickers for Quiet Hours */}
      <ModernTimePicker
        visible={quietHoursEditMode === 'start'}
        onClose={() => setQuietHoursEditMode(null)}
        onConfirm={(time) => {
          setQuietHoursStart(time);
          setQuietHoursEditMode(null);
        }}
        initialTime={quietHoursStart}
        is24Hour={false}
        title="Quiet Hours Start Time"
      />

      <ModernTimePicker
        visible={quietHoursEditMode === 'end'}
        onClose={() => setQuietHoursEditMode(null)}
        onConfirm={(time) => {
          setQuietHoursEnd(time);
          setQuietHoursEditMode(null);
        }}
        initialTime={quietHoursEnd}
        is24Hour={false}
        title="Quiet Hours End Time"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardOptions: {
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  testButton: {
    padding: 16,
  },
  testButtonText: {
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  modalOptionValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  timePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  iosTimePicker: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});