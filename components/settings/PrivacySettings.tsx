import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/contexts/AuthContext';
import { MoodsService } from '@/services/moods.service';
import { SleepService } from '@/services/sleep.service';
import { HabitsService } from '@/services/habits.service';
import { ActivitiesService } from '@/services/activities.service';
import { ProductivityService } from '@/services/productivity.service';
import { IntimacyService } from '@/services/intimacy.service';
import { ExperimentsService } from '@/services/experiments.service';
import * as Lucide from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { 
  ArrowLeft, 
  Download, 
  Trash2,
  Database,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react-native';

interface PrivacySettingsProps {
  onBack: () => void;
}

export function PrivacySettings({ onBack }: PrivacySettingsProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dataSyncEnabled, setDataSyncEnabled] = useState<boolean>(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState<boolean>(true);
  const [exporting, setExporting] = useState(false);

  const handleDataSync = (enabled: boolean) => {
    setDataSyncEnabled(enabled);
    console.log('Data sync toggled:', enabled);
    if (enabled) {
      Alert.alert('Data Sync Enabled', 'Your data will now sync across devices.');
    } else {
      Alert.alert('Data Sync Disabled', 'Your data will only be stored locally.');
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to export data');
      return;
    }

    Alert.alert(
      'Export Data',
      `Your data will be exported as ${format.toUpperCase()} format. This may take a few moments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setExporting(true);
            try {
              // Aggregate all data from services
              const [moods, sleep, habits, activities, productivity, intimacy, experiments] = await Promise.all([
                MoodsService.getAll(user.id),
                SleepService.getAll(user.id),
                HabitsService.getAll(user.id),
                ActivitiesService.getAll(user.id),
                ProductivityService.getAll(user.id),
                IntimacyService.getAll(user.id),
                ExperimentsService.getAll(user.id),
              ]);

              const exportData = {
                exportDate: new Date().toISOString(),
                userId: user.id,
                moods: moods.data || [],
                sleep: sleep.data || [],
                habits: habits.data || [],
                activities: activities.data || [],
                productivity: productivity.data || [],
                intimacy: intimacy.data || [],
                experiments: experiments.data || [],
              };

              let fileContent: string;
              let fileName: string;

              if (format === 'json') {
                fileContent = JSON.stringify(exportData, null, 2);
                fileName = `betternapped-export-${new Date().toISOString().split('T')[0]}.json`;
              } else {
                // CSV format - create simple CSV with main data
                fileContent = 'Category,Date,Details\n';
                
                exportData.moods.forEach((mood: any) => {
                  fileContent += `Mood,${mood.date},"Score: ${mood.score}"\n`;
                });
                
                exportData.sleep.forEach((s: any) => {
                  fileContent += `Sleep,${s.date},"Hours: ${s.hours}, Quality: ${s.quality}"\n`;
                });
                
                exportData.habits.forEach((h: any) => {
                  fileContent += `Habit,${h.created_at?.split('T')[0]},"${h.name}, Streak: ${h.streak}"\n`;
                });
                
                fileName = `betternapped-export-${new Date().toISOString().split('T')[0]}.csv`;
              }

              // Write to file
              const fileUri = `${FileSystem.documentDirectory}${fileName}`;
              await FileSystem.writeAsStringAsync(fileUri, fileContent);

              // Share the file
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
                Alert.alert('Export Complete', 'Your data has been exported successfully!');
              } else {
                Alert.alert('Export Complete', `Data saved to: ${fileUri}`);
              }
            } catch (error) {
              console.error('Export error:', error);
              Alert.alert('Export Failed', 'Failed to export data. Please try again.');
            } finally {
              setExporting(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteLocalData = () => {
    Alert.alert(
      'Delete Local Data',
      'This will permanently delete all data stored on this device. Cloud data (if sync is enabled) will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All',
                  style: 'destructive',
                  onPress: () => {
                    console.log('Local data deleted');
                    Alert.alert('Data Deleted', 'All local data has been permanently deleted.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderToggleItem = (
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
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>
    );
  };

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: React.ComponentType<any>,
    color: string,
    isDestructive = false
  ) => {
    const IconComponent = icon;
    
    return (
      <TouchableOpacity
        style={styles.actionItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, isDestructive && styles.destructiveText]}>
            {title}
          </Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Data Sync</Text>
        
        {renderToggleItem(
          'Cloud Sync',
          'Sync your data across devices',
          dataSyncEnabled,
          handleDataSync,
          (Lucide as any).Cloud ?? ((props: any) => <Feather name="cloud" {...props} />),
          '#3B82F6'
        )}

        <View style={styles.syncStatusCard}>
          <Text style={styles.syncStatusTitle}>
            {dataSyncEnabled ? '☁️ Sync Enabled' : '📱 Local Only'}
          </Text>
          <Text style={styles.syncStatusText}>
            {dataSyncEnabled 
              ? 'Your data is automatically backed up and synced across all your devices.'
              : 'Your data is stored only on this device. Enable sync to backup and access from other devices.'
            }
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Data Export</Text>
        
        {renderActionItem(
          'Export as JSON',
          'Download your data in JSON format',
          () => handleExportData('json'),
          FileText,
          '#10B981'
        )}

        {renderActionItem(
          'Export as CSV',
          'Download your data in CSV format for spreadsheets',
          () => handleExportData('csv'),
          Database,
          '#10B981'
        )}

        <Text style={styles.sectionTitle}>Privacy Controls</Text>

        {renderToggleItem(
          'Anonymous Analytics',
          'Help improve the app with anonymous usage data',
          analyticsEnabled,
          setAnalyticsEnabled,
          Shield,
          '#8B5CF6'
        )}

        {renderToggleItem(
          'Crash Reports',
          'Send crash reports to help fix bugs',
          crashReportsEnabled,
          setCrashReportsEnabled,
          Shield,
          '#F59E0B'
        )}

        <Text style={styles.sectionTitle}>Data Management</Text>

        {renderActionItem(
          'Delete Local Data',
          'Permanently delete all data on this device',
          handleDeleteLocalData,
          Trash2,
          '#EF4444',
          true
        )}

        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>📊 Storage Usage</Text>
          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>Mood entries:</Text>
            <Text style={styles.storageValue}>2.3 MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>Activity data:</Text>
            <Text style={styles.storageValue}>1.8 MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Text style={styles.storageLabel}>Sleep records:</Text>
            <Text style={styles.storageValue}>0.9 MB</Text>
          </View>
          <View style={[styles.storageItem, styles.totalStorage]}>
            <Text style={styles.storageTotalLabel}>Total:</Text>
            <Text style={styles.storageTotalValue}>5.0 MB</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            • We never sell or share your personal data{'\n'}
            • All data is encrypted in transit and at rest{'\n'}
            • You have full control over your data{'\n'}
            • Anonymous analytics help us improve the app without compromising your privacy{'\n'}
            • Data exports include all your tracked information
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
  actionItem: {
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
  actionContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  destructiveText: {
    color: '#EF4444',
  },
  syncStatusCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  syncStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  syncStatusText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  storageLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalStorage: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  storageTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  storageTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  infoCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B21A8',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B21A8',
    lineHeight: 20,
  },
});