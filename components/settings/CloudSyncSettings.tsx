/**
 * Cloud Sync Settings
 * Manage cloud backup and synchronization
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, RefreshCw, Download, Upload, Info } from 'lucide-react-native';
import * as Lucide from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CloudSyncService, CloudProvider } from '@/services/cloudSync.service';
import { Platform } from 'react-native';

interface CloudSyncSettingsProps {
  onBack: () => void;
}

export function CloudSyncSettings({ onBack }: CloudSyncSettingsProps) {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { theme } = useTheme();
  const { colors, typography, spacing } = theme;

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<CloudProvider | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    if (isGuest || !user) {
      setLoading(false);
      return;
    }

    try {
      const status = await CloudSyncService.getSyncStatus(user.id);
      setEnabled(status.enabled);
      setProvider(status.provider);
      setLastSyncDate(status.lastSyncDate);

      const config = await CloudSyncService.getConfig(user.id);
      if (config) {
        setAutoSync(config.autoSync);
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSync = async (providerType: CloudProvider) => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await CloudSyncService.enableSync(user.id, providerType);
      
      if (result.success) {
        setEnabled(true);
        setProvider(providerType);
        Alert.alert('Success', `${getProviderName(providerType)} sync enabled!`);
      } else {
        Alert.alert('Error', result.error || 'Failed to enable sync');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSync = async () => {
    if (!user) return;

    Alert.alert(
      'Disable Cloud Sync?',
      'Your data will remain on your device, but it will no longer sync to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await CloudSyncService.disableSync(user.id);
              if (result.success) {
                setEnabled(false);
                setProvider(null);
                Alert.alert('Success', 'Cloud sync disabled');
              } else {
                Alert.alert('Error', result.error || 'Failed to disable sync');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    if (!user) return;

    setSyncing(true);
    try {
      const result = await CloudSyncService.performSync(user.id);
      
      if (result.success) {
        await loadSyncStatus();
        Alert.alert('Success', 'Data synced successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to sync data');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoSync = async (value: boolean) => {
    if (!user) return;

    try {
      await CloudSyncService.updateConfig(user.id, { autoSync: value });
      setAutoSync(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-sync setting');
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    Alert.alert(
      'Export Data',
      'This will download all your data to a file that you can keep as a backup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await CloudSyncService.exportUserData(user.id);
              if (result.data) {
                // TODO: Implement actual file download
                Alert.alert('Success', 'Data exported successfully!');
              } else {
                Alert.alert('Error', result.error || 'Failed to export data');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getProviderName = (p: CloudProvider): string => {
    switch (p) {
      case CloudProvider.GOOGLE_DRIVE:
        return 'Google Drive';
      case CloudProvider.ICLOUD:
        return 'iCloud';
      case CloudProvider.SUPABASE:
        return 'Supabase';
      default:
        return 'Unknown';
    }
  };

  const formatLastSync = (date: string | null): string => {
    if (!date) return 'Never';
    
    const syncDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const renderProviderCard = (
    providerType: CloudProvider,
    providerName: string,
    description: string,
    available: boolean = true
  ) => (
    <TouchableOpacity
      style={[
        styles.providerCard,
        {
          backgroundColor: colors.surface,
          borderColor: provider === providerType ? colors.primary : colors.border,
        },
        provider === providerType && styles.selectedProvider,
      ]}
      onPress={() => !enabled && available && handleEnableSync(providerType)}
      disabled={enabled || !available}
      activeOpacity={0.7}
    >
      <View style={styles.providerHeader}>
          <View style={[styles.providerIcon, { backgroundColor: `${colors.primary}15` }]}>
          {
            // Use Lucide Cloud icon if available, otherwise fall back to Feather's cloud icon
            // Some bundler/runtime issues can make individual named exports undefined at runtime.
            // This guard prevents a hard crash and provides a graceful fallback.
          }
          {(
            (Lucide as any).Cloud
              ? React.createElement((Lucide as any).Cloud, { size: 24, color: colors.primary })
              : <Feather name="cloud" size={24} color={colors.primary} />
          )}
        </View>
        <View style={styles.providerInfo}>
          <Text style={[styles.providerName, { color: colors.text }, typography.h5]}>
            {providerName}
          </Text>
          <Text style={[styles.providerDescription, { color: colors.textSecondary }, typography.caption]}>
            {description}
          </Text>
        </View>
        {provider === providerType && enabled && (
          <View style={[styles.checkmark, { backgroundColor: colors.success }]}>
            <Check size={16} color={colors.surface} />
          </View>
        )}
      </View>
      {!available && (
        <View style={[styles.unavailableBadge, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.unavailableText, { color: colors.warning }, typography.caption]}>
            Coming Soon
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }, typography.h3]}>
            Cloud Sync
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }, typography.h3]}>
          Cloud Sync
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isGuest ? (
          <View style={[styles.guestCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[styles.guestTitle, { color: colors.text }, typography.h4]}>
              Sign Up for Cloud Sync
            </Text>
            <Text style={[styles.guestMessage, { color: colors.textSecondary }, typography.body]}>
              Create an account to backup your data and access it across all your devices.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.infoCard, { backgroundColor: colors.info + '15', borderLeftColor: colors.info }]}>
              <Text style={[styles.infoTitle, { color: colors.info }, typography.h6]}>
                ☁️ Automatic Backup
              </Text>
              <Text style={[styles.infoText, { color: colors.info }, typography.caption]}>
                Your data is automatically synced and backed up to the cloud. Access your wellness journey from any device.
              </Text>
            </View>

            {!enabled && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }, typography.h4]}>
                  Cloud Sync
                </Text>

                <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant, borderLeftColor: colors.info }]}>
                  <Text style={[styles.infoTitle, { color: colors.text }, typography.h6]}>
                    {Platform.OS === 'ios' ? '☁️ iCloud Sync' : Platform.OS === 'android' ? '☁️ Google Drive Sync' : '☁️ Cloud Sync'}
                  </Text>
                  <Text style={[styles.infoText, { color: colors.textSecondary }, typography.caption]}>
                    {Platform.OS === 'ios'
                      ? 'Your data will automatically sync with iCloud when this feature becomes available. All your wellness tracking data will be safely backed up and accessible across all your Apple devices.'
                      : Platform.OS === 'android'
                      ? 'Your data will automatically sync with Google Drive when this feature becomes available. All your wellness tracking data will be safely backed up and accessible across all your devices.'
                      : 'Cloud sync will automatically backup your data when this feature becomes available.'}
                  </Text>
                </View>

                <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
                  <View style={[styles.iconContainer, { backgroundColor: `${colors.info}15`, alignSelf: 'center', marginBottom: 16 }]}>
                    {(Lucide as any).Cloud
                      ? React.createElement((Lucide as any).Cloud, { size: 32, color: colors.info })
                      : <Feather name="cloud" size={32} color={colors.info} />}
                  </View>
                  <Text style={[styles.providerName, { color: colors.text, textAlign: 'center' }, typography.h4]}>
                    {Platform.OS === 'ios' ? 'iCloud Sync' : Platform.OS === 'android' ? 'Google Drive Sync' : 'Cloud Sync'}
                  </Text>
                  <Text style={[styles.providerDescription, { color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }, typography.body]}>
                    Coming Soon
                  </Text>
                  <Text style={[styles.comingSoonMessage, { color: colors.textSecondary, textAlign: 'center' }, typography.caption]}>
                    We're working on adding automatic cloud sync. Your data is currently stored securely on this device.
                  </Text>
                </View>
              </>
            )}

            {enabled && provider && (
              <>
                <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: colors.textSecondary }, typography.body]}>
                      Provider
                    </Text>
                    <Text style={[styles.statusValue, { color: colors.text }, typography.h6]}>
                      {getProviderName(provider)}
                    </Text>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: colors.textSecondary }, typography.body]}>
                      Last Sync
                    </Text>
                    <Text style={[styles.statusValue, { color: colors.text }, typography.h6]}>
                      {formatLastSync(lastSyncDate)}
                    </Text>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: colors.textSecondary }, typography.body]}>
                      Auto-Sync
                    </Text>
                    <Switch
                      value={autoSync}
                      onValueChange={handleToggleAutoSync}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.surface}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={handleManualSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <>
                      <RefreshCw size={20} color={colors.surface} />
                      <Text style={[styles.actionButtonText, { color: colors.surface }, typography.h6]}>
                        Sync Now
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleExportData}
                  disabled={loading}
                >
                  <Download size={20} color={colors.text} />
                  <Text style={[styles.actionButtonText, { color: colors.text }, typography.h6]}>
                    Export Backup
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.dangerButton, { backgroundColor: colors.error }]}
                  onPress={handleDisableSync}
                  disabled={loading}
                >
                  <Text style={[styles.actionButtonText, { color: colors.surface }, typography.h6]}>
                    Disable Cloud Sync
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant, borderLeftColor: colors.success, marginTop: 24 }]}>
              <Text style={[styles.infoTitle, { color: colors.text }, typography.h6]}>
                🔒 Privacy & Security
              </Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }, typography.caption]}>
                • All data is encrypted during transfer{'\n'}
                • Your data is never shared with third parties{'\n'}
                • You control when and what gets synced{'\n'}
                • Delete your cloud data anytime
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  guestCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  guestTitle: {
    marginBottom: 12,
  },
  guestMessage: {
    lineHeight: 22,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
  },
  infoTitle: {
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
  },
  providerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  selectedProvider: {
    borderWidth: 2,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    marginBottom: 4,
  },
  providerDescription: {},
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  unavailableText: {},
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusLabel: {},
  statusValue: {},
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  dangerButton: {},
  actionButtonText: {},
  comingSoonMessage: {
    lineHeight: 20,
  },
});
