import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Bell, Zap, Target } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface NotificationSettingsProps {
  onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [dailyReminder, setDailyReminder] = useState<boolean>(true);
  const [streakAlerts, setStreakAlerts] = useState<boolean>(true);
  const [experimentReminders, setExperimentReminders] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<Date>(new Date(2024, 0, 1, 20, 0));
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setReminderTime(selectedTime);
      console.log('Notification time updated:', selectedTime.toLocaleTimeString());
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: React.ComponentType<any>,
    color: string
  ) => {
    const IconComponent = icon;
    
    return (
      <View style={styles.settingItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={(newValue) => {
            onValueChange(newValue);
            console.log(`${title} toggled:`, newValue);
          }}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        
        {renderSettingItem(
          'Enable Notifications',
          'Allow the app to send you notifications',
          notificationsEnabled,
          setNotificationsEnabled,
          Bell,
          '#3B82F6'
        )}

        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        {renderSettingItem(
          'Daily Reminders',
          'Get reminded to log your daily entries',
          dailyReminder,
          setDailyReminder,
          Clock,
          '#10B981'
        )}

        {renderSettingItem(
          'Streak Alerts',
          'Celebrate your habit streaks and milestones',
          streakAlerts,
          setStreakAlerts,
          Zap,
          '#F59E0B'
        )}

        {renderSettingItem(
          'Experiment Reminders',
          'Get notified about ongoing experiments',
          experimentReminders,
          setExperimentReminders,
          Target,
          '#8B5CF6'
        )}

        {dailyReminder && (
          <>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
                <Clock size={20} color="#10B981" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Daily Reminder Time</Text>
                <Text style={styles.settingSubtitle}>
                  Currently set for {formatTime(reminderTime)}
                </Text>
              </View>
              <Text style={styles.timeText}>{formatTime(reminderTime)}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={Platform.OS === 'ios' ? styles.iosTimePicker : undefined}
              />
            )}

            {Platform.OS === 'ios' && showTimePicker && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Notification Tips</Text>
          <Text style={styles.infoText}>
            • Enable notifications to stay consistent with your wellness tracking{'\n'}
            • Set reminder times that work with your daily routine{'\n'}
            • Streak alerts help maintain motivation and celebrate progress
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
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
});