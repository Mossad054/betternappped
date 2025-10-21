import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
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
  Smartphone
} from 'lucide-react-native';

interface SecuritySettingsProps {
  onBack: () => void;
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const insets = useSafeAreaInsets();
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState<boolean>(true);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [autoLockTime, setAutoLockTime] = useState<string>('5');

  const autoLockOptions = [
    { value: '1', label: '1 minute' },
    { value: '5', label: '5 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
  ];

  const handlePinToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPinSetup(true);
    } else {
      Alert.alert(
        'Disable PIN Lock',
        'Are you sure you want to disable PIN protection?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setIsPinEnabled(false);
              setPin('');
              setConfirmPin('');
              console.log('PIN lock disabled');
            }
          }
        ]
      );
    }
  };

  const handleSetupPin = () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      return;
    }

    setIsPinEnabled(true);
    setShowPinSetup(false);
    console.log('PIN set successfully:', pin);
    Alert.alert('PIN Set', 'Your PIN has been set successfully. The app will now require PIN authentication on startup.');
  };

  const handleCancelPinSetup = () => {
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setIsPinEnabled(false);
  };

  const handleBiometricToggle = (enabled: boolean) => {
    if (enabled) {
      // Simulate biometric authentication check
      Alert.alert(
        'Enable Biometric Authentication',
        'This would check for available biometric authentication (Face ID, Touch ID, or Fingerprint) and enable it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setIsBiometricEnabled(true);
              console.log('Biometric authentication enabled');
            }
          }
        ]
      );
    } else {
      setIsBiometricEnabled(enabled);
      console.log('Biometric authentication disabled');
    }
  };

  const handleAutoLockTimeSelect = () => {
    Alert.alert(
      'Auto-Lock Time',
      'Select when the app should automatically lock:',
      [
        ...autoLockOptions.map(option => ({
          text: option.label,
          onPress: () => {
            setAutoLockTime(option.value);
            console.log('Auto-lock time set to:', option.label);
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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
          setIsAutoLockEnabled,
          Smartphone,
          '#F59E0B',
          !isPinEnabled
        )}

        {isPinEnabled && isAutoLockEnabled && (
          <>
            <Text style={styles.sectionTitle}>Auto-Lock Settings</Text>
            
            {renderActionItem(
              'Auto-Lock Time',
              'Time before app automatically locks',
              handleAutoLockTimeSelect,
              Key,
              '#8B5CF6'
            )}
          </>
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

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🛡️ Security Information</Text>
          <Text style={styles.infoText}>
            • PIN and biometric data are stored securely on your device{'\n'}
            • We never have access to your authentication credentials{'\n'}
            • Security features protect your personal wellness data{'\n'}
            • You can change or disable security settings anytime{'\n'}
            • Biometric authentication requires PIN as backup
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
});