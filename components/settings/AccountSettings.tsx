import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Trash2,
  Edit3,
  ChevronRight,
  Camera,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileService } from '@/services/profile.service';
import { AuthService } from '@/services/auth.service';
import { PINService } from '@/services/pin.service';


interface AccountSettingsProps {
  onBack: () => void;
}

interface ProfileData {
  full_name: string;
  email: string;
  profile_picture: string | null;
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isGuest, signOut } = useAuth();
  const { theme } = useTheme();
  const { colors, typography, spacing } = theme;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // PIN modal
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'change' | 'disable'>('setup');
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [isPINEnabled, setIsPINEnabled] = useState(false);
  const [processingPIN, setProcessingPIN] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleting, setDeleting] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
    checkPINStatus();
  }, []);

  const loadProfile = async () => {
    if (isGuest || !user) {
      setLoading(false);
      return;
    }

    try {
      const result = await ProfileService.getProfile(user.id);
      if (result.data) {
        setProfile(result.data);
        setEditName(result.data.full_name || '');
        setEditEmail(result.data.email || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPINStatus = async () => {
    if (isGuest || !user) return;
    try {
      const enabled = await PINService.isPINEnabled(user.id);
      setIsPINEnabled(enabled);
    } catch (error) {
      console.error('Failed to check PIN status:', error);
    }
  };

  const handleUploadAvatar = async () => {
    if (isGuest || !user) return;

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadResult = await ProfileService.uploadProfilePicture(user.id, result.assets[0].uri);
      if (uploadResult.data?.url) {
        setProfile(prev => prev ? { ...prev, profile_picture: uploadResult.data!.url } : null);
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload profile picture');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isGuest || !user || !editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setSaving(true);
    try {
      const result = await ProfileService.upsertProfile(user.id, {
        full_name: editName.trim(),
        email: editEmail.trim(),
      });

      if (result.data) {
        setProfile(prev => prev ? { ...prev, full_name: editName, email: editEmail } : null);
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(profile?.full_name || '');
    setEditEmail(profile?.email || '');
    setIsEditingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const validation = AuthService.validatePassword(newPassword);
    if (!validation.valid) {
      Alert.alert('Invalid Password', validation.errors.join('\n'));
      return;
    }

    setChangingPassword(true);
    try {
      const result = await AuthService.changePassword(newPassword, confirmPassword);
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenPINModal = (mode: 'setup' | 'change' | 'disable') => {
    setPinMode(mode);
    setCurrentPIN('');
    setNewPIN('');
    setConfirmPIN('');
    setShowPINModal(true);
  };

  const handlePINAction = async () => {
    if (!user) return;

    setProcessingPIN(true);
    try {
      if (pinMode === 'setup') {
        if (newPIN !== confirmPIN) {
          Alert.alert('Error', 'PINs do not match');
          return;
        }
        const result = await PINService.setupPIN(user.id, newPIN, confirmPIN);
        if (result.success) {
          setIsPINEnabled(true);
          setShowPINModal(false);
          Alert.alert('Success', 'PIN lock enabled successfully!');
        } else {
          Alert.alert('Error', result.error || 'Failed to setup PIN');
        }
      } else if (pinMode === 'change') {
        if (newPIN !== confirmPIN) {
          Alert.alert('Error', 'New PINs do not match');
          return;
        }
        const result = await PINService.changePIN(user.id, currentPIN, newPIN, confirmPIN);
        if (result.success) {
          setShowPINModal(false);
          Alert.alert('Success', 'PIN changed successfully!');
        } else {
          Alert.alert('Error', result.error || 'Failed to change PIN');
        }
      } else if (pinMode === 'disable') {
        const result = await PINService.disablePIN(user.id, currentPIN);
        if (result.success) {
          setIsPINEnabled(false);
          setShowPINModal(false);
          Alert.alert('Success', 'PIN lock disabled successfully!');
        } else {
          Alert.alert('Error', result.error || 'Failed to disable PIN');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setProcessingPIN(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.push('/auth/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmText('');
    setDeleteCountdown(5);
    setShowDeleteModal(true);

    const interval = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;

    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    try {
      const result = await AuthService.deleteAccount(user.id);
      if (result.success) {
        setShowDeleteModal(false);
        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
        router.push('/auth/auth');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
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
        style={[styles.actionItem, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: isDestructive ? colors.error : colors.text }, typography.body]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, { color: colors.textSecondary }, typography.caption]}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }, typography.h3]}>Account</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }, typography.h3]}>Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isGuest ? (
          <>
            <View style={[styles.guestCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Text style={[styles.guestTitle, { color: colors.text }, typography.h3]}>Guest Mode</Text>
              <Text style={[styles.guestMessage, { color: colors.textSecondary }, typography.body]}>
                Sign up to save your data and access it across devices.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h4]}>Account Actions</Text>

            {renderActionItem(
              'Create Account',
              'Sign up to save your data',
              () => router.push('/auth/auth'),
              User,
              colors.primary
            )}

            {renderActionItem(
              'Sign In',
              'Sign in to your existing account',
              () => router.push('/auth/auth'),
              LogOut,
              colors.primary
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant, borderLeftColor: colors.success }]}>
              <Text style={[styles.infoTitle, { color: colors.text }, typography.h6]}>💡 About Guest Mode</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }, typography.caption]}>
                • Your data is stored locally on this device{'\n'}
                • Create an account to sync across devices{'\n'}
                • Sign up to access your data anywhere
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h4]}>Profile Information</Text>
            
            <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
              <View style={styles.profileHeader}>
                <TouchableOpacity 
                  style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
                  onPress={handleUploadAvatar}
                  disabled={uploadingAvatar}
                >
                  {profile?.profile_picture ? (
                    <Image source={{ uri: profile.profile_picture }} style={styles.avatarImage} />
                  ) : (
                    <User size={32} color={colors.surface} />
                  )}
                  {uploadingAvatar && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator size="small" color={colors.surface} />
                    </View>
                  )}
                  {!uploadingAvatar && (
                    <View style={[styles.cameraIconContainer, { backgroundColor: colors.primary }]}>
                      <Camera size={14} color={colors.surface} />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: colors.text }, typography.h4]}>
                    {profile?.full_name || 'No name set'}
                  </Text>
                  <Text style={[styles.profileEmail, { color: colors.textSecondary }, typography.body]}>
                    {profile?.email || user?.email || ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditingProfile(!isEditingProfile)}
                  style={styles.editButton}
                >
                  <Edit3 size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {isEditingProfile && (
                <View style={[styles.editForm, { borderTopColor: colors.border }]}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Name</Text>
                    <TextInput
                      style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Email</Text>
                    <TextInput
                      style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                      onPress={handleCancelEdit}
                      disabled={saving}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.textSecondary }, typography.h6]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                      onPress={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : (
                        <Text style={[styles.saveButtonText, { color: colors.surface }, typography.h6]}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h4]}>Security</Text>

            {renderActionItem(
              'Change Password',
              'Update your account password',
              () => setShowPasswordModal(true),
              Lock,
              colors.primary
            )}

            {renderActionItem(
              isPINEnabled ? 'Manage PIN Lock' : 'Enable PIN Lock',
              isPINEnabled ? 'Change or disable your PIN' : 'Secure your app with a PIN',
              () => handleOpenPINModal(isPINEnabled ? 'change' : 'setup'),
              Shield,
              colors.secondary
            )}

            {isPINEnabled && renderActionItem(
              'Disable PIN Lock',
              'Remove PIN protection',
              () => handleOpenPINModal('disable'),
              Shield,
              colors.warning
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }, typography.h4]}>Account Actions</Text>

            {renderActionItem(
              'Sign Out',
              'Sign out of your account',
              handleSignOut,
              LogOut,
              colors.warning
            )}

            {renderActionItem(
              'Delete Account',
              'Permanently delete your account and data',
              handleDeleteAccount,
              Trash2,
              colors.error,
              true
            )}

            <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant, borderLeftColor: colors.success }]}>
              <Text style={[styles.infoTitle, { color: colors.text }, typography.h6]}>🔒 Account Security</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }, typography.caption]}>
                • Your data is encrypted and securely stored{'\n'}
                • We never share your personal information{'\n'}
                • Account deletion is permanent and cannot be undone{'\n'}
                • Contact support if you need help with your account
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }, typography.h3]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.passwordHint, { color: colors.textSecondary }, typography.caption]}>
                  At least 8 characters, 1 number, 1 special character
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: colors.surface }, typography.h6]}>Change Password</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <Modal
        visible={showPINModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPINModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }, typography.h3]}>
                {pinMode === 'setup' ? 'Enable PIN Lock' : pinMode === 'change' ? 'Change PIN' : 'Disable PIN Lock'}
              </Text>
              <TouchableOpacity onPress={() => setShowPINModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(pinMode === 'change' || pinMode === 'disable') && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Current PIN</Text>
                  <TextInput
                    style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    value={currentPIN}
                    onChangeText={setCurrentPIN}
                    placeholder="Enter current PIN"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={6}
                    secureTextEntry
                  />
                </View>
              )}

              {pinMode !== 'disable' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>
                      {pinMode === 'setup' ? 'New PIN' : 'New PIN'}
                    </Text>
                    <TextInput
                      style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      value={newPIN}
                      onChangeText={setNewPIN}
                      placeholder="Enter 4-6 digit PIN"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={6}
                      secureTextEntry
                    />
                    <Text style={[styles.passwordHint, { color: colors.textSecondary }, typography.caption]}>
                      4-6 digits
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }, typography.h6]}>Confirm PIN</Text>
                    <TextInput
                      style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      value={confirmPIN}
                      onChangeText={setConfirmPIN}
                      placeholder="Confirm PIN"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={6}
                      secureTextEntry
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: pinMode === 'disable' ? colors.error : colors.primary }]}
                onPress={handlePINAction}
                disabled={processingPIN}
              >
                {processingPIN ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: colors.surface }, typography.h6]}>
                    {pinMode === 'setup' ? 'Enable PIN' : pinMode === 'change' ? 'Change PIN' : 'Disable PIN'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.error }, typography.h3]}>Delete Account</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.warningBox, { backgroundColor: `${colors.error}15`, borderColor: colors.error }]}>
                <Text style={[styles.warningText, { color: colors.error }, typography.body]}>
                  ⚠️ This action is permanent and cannot be undone. All your data will be permanently deleted.
                </Text>
              </View>

              <Text style={[styles.deleteInstructions, { color: colors.textSecondary }, typography.body]}>
                Type <Text style={[typography.h6, { color: colors.text }]}>DELETE</Text> to confirm:
              </Text>

              <TextInput
                style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type DELETE"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.error },
                  (deleteCountdown > 0 || deleteConfirmText !== 'DELETE') && styles.disabledButton
                ]}
                onPress={confirmDeleteAccount}
                disabled={deleteCountdown > 0 || deleteConfirmText !== 'DELETE' || deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: colors.surface }, typography.h6]}>
                    {deleteCountdown > 0 ? `Wait ${deleteCountdown}s` : 'Delete Account Permanently'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 2,
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 45,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  passwordHint: {
    marginTop: 4,
    fontSize: 12,
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
    borderWidth: 1,
  },
  saveButton: {
  },
  cancelButtonText: {
  },
  saveButtonText: {
  },
  guestCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  guestTitle: {
    marginBottom: 8,
  },
  guestMessage: {
    lineHeight: 20,
  },
  actionItem: {
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    marginBottom: 2,
  },
  actionSubtitle: {
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
  },
  infoTitle: {
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    flex: 1,
  },
  modalClose: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 4,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
  },
  disabledButton: {
    opacity: 0.5,
  },
  warningBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: {
    lineHeight: 20,
  },
  deleteInstructions: {
    marginBottom: 12,
  },
});
