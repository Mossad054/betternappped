import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Lock,
  Shield,
  Fingerprint,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Clock,
  ChevronRight,
  Check,
  X,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SecurityService, AutoLockTime } from '@/services/security.service';

interface SecuritySettingsProps {
  onBack: () => void;
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { theme } = useTheme();
  const userId = user?.id || 'guest_user';

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Security settings state
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState<boolean>(true);
  const [autoLockTime, setAutoLockTime] = useState<AutoLockTime>('1_minute');

  // PIN setup state
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<'setup' | 'change' | 'disable'>('setup');
  const [currentPin, setCurrentPin] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [showCurrentPin, setShowCurrentPin] = useState<boolean>(false);

  // Modal state
  const [showAutoLockModal, setShowAutoLockModal] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    setLoading(true);
    try {
      const settings = await SecurityService.getSecuritySettings(userId);
      setIsPinEnabled(settings.pinEnabled);
      setIsBiometricEnabled(settings.biometricEnabled);
      setIsAutoLockEnabled(settings.autoLockEnabled);
      setAutoLockTime(settings.autoLockTime);
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoLockOptions = SecurityService.getAutoLockOptions();

  const handlePinToggle = (enabled: boolean) => {
    if (enabled) {
      setPinMode('setup');
      setPin('');
      setConfirmPin('');
      setCurrentPin('');
      setShowPinSetup(true);
    } else {
      setPinMode('disable');
      setCurrentPin('');
      setShowPinSetup(true);
    }
  };

  const handleSetupPin = async () => {
    setSaving(true);
    try {
      if (pinMode === 'setup') {
        const result = await SecurityService.setupPIN(userId, pin, confirmPin);
        if (result.success) {
          setIsPinEnabled(true);
          setShowPinSetup(false);
          setPin('');
          setConfirmPin('');
          Alert.alert('PIN Set', 'Your PIN has been securely encrypted and saved. The app will now require PIN authentication.');
        } else {
          Alert.alert('Error', result.error || 'Failed to setup PIN');
        }
      } else if (pinMode === 'change') {
        const result = await SecurityService.changePIN(userId, currentPin, pin, confirmPin);
        if (result.success) {
          setShowPinSetup(false);
          setPin('');
          setConfirmPin('');
          setCurrentPin('');
          Alert.alert('PIN Changed', 'Your PIN has been updated successfully.');
        } else {
          Alert.alert('Error', result.error || 'Failed to change PIN');
        }
      } else if (pinMode === 'disable') {
        const result = await SecurityService.disablePIN(userId, currentPin);
        if (result.success) {
          setIsPinEnabled(false);
          setShowPinSetup(false);
          setCurrentPin('');
          Alert.alert('PIN Disabled', 'PIN protection has been removed.');
        } else {
          Alert.alert('Error', result.error || 'Failed to disable PIN');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPinSetup = () => {
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setCurrentPin('');
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!isPinEnabled) {
      Alert.alert('PIN Required', 'Please enable PIN lock first to use biometric authentication.');
      return;
    }

    setSaving(true);
    try {
      const result = await SecurityService.setBiometricEnabled(userId, enabled);
      if (result.success) {
        setIsBiometricEnabled(enabled);
        Alert.alert(
          enabled ? 'Biometric Enabled' : 'Biometric Disabled',
          enabled
            ? 'You can now use Face ID, Touch ID, or Fingerprint to unlock.'
            : 'Biometric authentication has been disabled.'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update biometric setting');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoLockToggle = async (enabled: boolean) => {
    if (!isPinEnabled) {
      return;
    }

    setSaving(true);
    try {
      const result = await SecurityService.setAutoLockEnabled(userId, enabled);
      if (result.success) {
        setIsAutoLockEnabled(enabled);
      } else {
        Alert.alert('Error', result.error || 'Failed to update auto-lock setting');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoLockTimeSelect = async (time: AutoLockTime) => {
    setSaving(true);
    try {
      const result = await SecurityService.setAutoLockTime(userId, time);
      if (result.success) {
        setAutoLockTime(time);
        setShowAutoLockModal(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update auto-lock time');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePIN = () => {
    setPinMode('change');
    setPin('');
    setConfirmPin('');
    setCurrentPin('');
    setShowPinSetup(true);
  };

  const renderToggleItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: React.ComponentType<any>,
    color: string,
    disabled = false
  ) => {
    const IconComponent = icon;
    
    return (
      <View style={[styles.settingItem, disabled && styles.disabledItem]}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={disabled ? '#9CA3AF' : color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
            {subtitle}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
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
    color: string
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
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.actionValue}>
          {title.includes('Auto-Lock') ? autoLockOptions.find(opt => opt.value === autoLockTime)?.label : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  if (showPinSetup) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={handleCancelPinSetup} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set PIN</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pinSetupCard}>
            <View style={styles.pinSetupHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#3B82F615' }]}>
                <Lock size={24} color="#3B82F6" />
              </View>
              <Text style={styles.pinSetupTitle}>Create Your PIN</Text>
              <Text style={styles.pinSetupSubtitle}>
                Choose a 4-digit PIN to secure your app
              </Text>
            </View>

            <View style={styles.pinInputGroup}>
              <Text style={styles.inputLabel}>Enter PIN</Text>
              <View style={styles.pinInputContainer}>
                <TextInput
                  style={styles.pinInput}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Enter 4-digit PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showPin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pinInputGroup}>
              <Text style={styles.inputLabel}>Confirm PIN</Text>
              <View style={styles.pinInputContainer}>
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  placeholder="Confirm your PIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry={!showConfirmPin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPin(!showConfirmPin)}
                >
                  {showConfirmPin ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelPinSetup}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSetupPin}
              >
                <Text style={styles.saveButtonText}>Set PIN</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pinTipsCard}>
            <Text style={styles.pinTipsTitle}>🔐 PIN Security Tips</Text>
            <Text style={styles.pinTipsText}>
              • Choose a PIN that is easy for you to remember but hard for others to guess{'\n'}
              • Avoid using obvious combinations like 1234 or your birth year{'\n'}
              • Your PIN is stored securely on your device{'\n'}
              • You can change or disable your PIN anytime in settings
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>App Lock</Text>
        
        {renderToggleItem(
          'PIN Lock',
          'Require PIN to open the app',
          isPinEnabled,
          handlePinToggle,
          Lock,
          '#3B82F6'
        )}

        {renderToggleItem(
          'Biometric Authentication',
          'Use Face ID, Touch ID, or Fingerprint',
          isBiometricEnabled,
          handleBiometricToggle,
          Fingerprint,
          '#10B981',
          !isPinEnabled
        )}

        {renderToggleItem(
          'Auto-Lock',
          'Automatically lock app when inactive',
          isAutoLockEnabled,
          handleAutoLockToggle,
          Smartphone,
          theme.colors.warning,
          !isPinEnabled
        )}

        {isPinEnabled && isAutoLockEnabled && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Auto-Lock Settings</Text>

            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: theme.colors.card }]}
              onPress={() => setShowAutoLockModal(true)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.info}15` }]}>
                <Clock size={20} color={theme.colors.info} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Auto-Lock Time</Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                  Time before app automatically locks
                </Text>
              </View>
              <Text style={[styles.actionValue, { color: theme.colors.primary }]}>
                {SecurityService.getAutoLockLabel(autoLockTime)}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isPinEnabled && (
          <TouchableOpacity
            style={[styles.actionItem, { backgroundColor: theme.colors.card, marginTop: 16 }]}
            onPress={handleChangePIN}
            activeOpacity={0.7}
            disabled={saving}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Key size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Change PIN</Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                Update your current PIN
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Security Status</Text>
        
        <View style={styles.securityStatusCard}>
          <View style={styles.securityStatusHeader}>
            <Shield size={24} color={isPinEnabled ? '#10B981' : '#F59E0B'} />
            <Text style={styles.securityStatusTitle}>
              {isPinEnabled ? '🔒 App is Secured' : '⚠️ App is Not Secured'}
            </Text>
          </View>
          
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Text style={styles.featureIcon}>
                {isPinEnabled ? '✅' : '❌'}
              </Text>
              <Text style={styles.featureText}>PIN Protection</Text>
            </View>
            
            <View style={styles.securityFeature}>
              <Text style={styles.featureIcon}>
                {isBiometricEnabled ? '✅' : '❌'}
              </Text>
              <Text style={styles.featureText}>Biometric Authentication</Text>
            </View>
            
            <View style={styles.securityFeature}>
              <Text style={styles.featureIcon}>
                {isAutoLockEnabled && isPinEnabled ? '✅' : '❌'}
              </Text>
              <Text style={styles.featureText}>Auto-Lock</Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: `${theme.colors.warning}20`, borderLeftColor: theme.colors.warning }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.warning }]}>🛡️ Security Information</Text>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            • PIN is encrypted using AES-256 and stored securely{'\n'}
            • We never have access to your authentication credentials{'\n'}
            • Security features protect your personal wellness data{'\n'}
            • Auto-lock triggers when app goes to background{'\n'}
            • Biometric authentication requires PIN as backup
          </Text>
        </View>
      </ScrollView>

      {/* Auto-Lock Time Modal */}
      <Modal
        visible={showAutoLockModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAutoLockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Auto-Lock Time</Text>
              <TouchableOpacity onPress={() => setShowAutoLockModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              Select when the app should lock after going to background:
            </Text>

            {autoLockOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => handleAutoLockTimeSelect(option.value)}
                disabled={saving}
              >
                <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                {autoLockTime === option.value && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  disabledItem: {
    opacity: 0.5,
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
  actionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  pinSetupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pinSetupHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pinSetupTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  pinSetupSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  pinInputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  pinInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  pinTipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  pinTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  pinTipsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  securityStatusCard: {
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
  securityStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});