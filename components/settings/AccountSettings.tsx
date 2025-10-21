import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Trash2,
  Edit3,
  ChevronRight
} from 'lucide-react-native';

interface AccountSettingsProps {
  onBack: () => void;
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  const insets = useSafeAreaInsets();
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2024'
  });
  const [editData, setEditData] = useState(profileData);

  const handleSaveProfile = () => {
    setProfileData(editData);
    setIsEditingProfile(false);
    console.log('Profile updated:', editData);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditData(profileData);
    setIsEditingProfile(false);
  };

  const handleChangePassword = () => {
    console.log('Change password requested');
    Alert.alert(
      'Change Password',
      'This would typically open a secure password change flow.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('User logged out');
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: () => {
                    console.log('Account deletion confirmed');
                    Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                  }
                }
              ]
            );
          }
        }
      ]
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
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
              <Text style={styles.joinDate}>Member since {profileData.joinDate}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditingProfile(!isEditingProfile)}
              style={styles.editButton}
            >
              <Edit3 size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {isEditingProfile && (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.email}
                  onChangeText={(text) => setEditData({ ...editData, email: text })}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Account Actions</Text>

        {renderActionItem(
          'Change Password',
          'Update your account password',
          handleChangePassword,
          Lock,
          '#3B82F6'
        )}

        {renderActionItem(
          'Logout',
          'Sign out of your account',
          handleLogout,
          LogOut,
          '#F59E0B'
        )}

        {renderActionItem(
          'Delete Account',
          'Permanently delete your account and data',
          handleDeleteAccount,
          Trash2,
          '#EF4444',
          true
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 Account Security</Text>
          <Text style={styles.infoText}>
            • Your data is encrypted and securely stored{'\n'}
            • We never share your personal information{'\n'}
            • Account deletion is permanent and cannot be undone{'\n'}
            • Contact support if you need help with your account
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
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
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
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  destructiveText: {
    color: '#EF4444',
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
});