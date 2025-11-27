import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import * as Lucide from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import { 
  Bell, 
  User, 
  Shield, 
  Palette, 
  HelpCircle, 
  Globe, 
  Lock,
  ChevronRight,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { HelpSettings } from '@/components/settings/HelpSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { CloudSyncSettings } from '@/components/settings/CloudSyncSettings';

type SettingSection = 'notifications' | 'account' | 'privacy' | 'theme' | 'help' | 'language' | 'security' | 'cloud-sync' | null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, isGuest, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingSection>(null);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Signed Out', 'You have been successfully signed out.');
            } catch (error) {
              Alert.alert('Sign Out Failed', 'There was an error signing out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      id: 'notifications' as const,
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      color: theme.colors.primary
    },
    {
      id: 'account' as const,
      title: 'Account',
      subtitle: 'Profile and authentication settings',
      icon: User,
      color: theme.colors.primary
    },
    {
      id: 'privacy' as const,
      title: 'Privacy & Data',
      subtitle: 'Data sync, export, and privacy controls',
      icon: Shield,
      color: theme.colors.primary
    },
    {
      id: 'cloud-sync' as const,
      title: 'Cloud Sync',
      subtitle: 'Backup and sync across devices',
      icon: (Lucide as any).Cloud ?? ((props: any) => <Feather name="cloud" {...props} />),
      color: theme.colors.info
    },
    {
      id: 'theme' as const,
      title: 'Theme',
      subtitle: 'Customize appearance and colors',
      icon: Palette,
      color: theme.colors.warning
    },
    {
      id: 'help' as const,
      title: 'Help & Support',
      subtitle: 'FAQs, contact support, and tutorials',
      icon: HelpCircle,
      color: theme.colors.error
    },
    {
      id: 'language' as const,
      title: 'Language',
      subtitle: 'Change app language',
      icon: Globe,
      color: theme.colors.info
    },
    {
      id: 'security' as const,
      title: 'Security',
      subtitle: 'PIN lock and security settings',
      icon: Lock,
      color: theme.colors.error
    }
  ];

  const renderSettingItem = (section: typeof settingSections[0]) => {
    const IconComponent = section.icon;
    
    return (
      <TouchableOpacity
        key={section.id}
        style={[
          styles.settingItem, 
          { 
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.base,
            ...theme.shadows.small
          }
        ]}
        onPress={() => setActiveSection(section.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${section.color}15`, borderRadius: theme.borderRadius.md }]}>
          <IconComponent size={24} color={section.color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[
            styles.settingTitle, 
            { 
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>{section.title}</Text>
          <Text style={[
            styles.settingSubtitle, 
            { 
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.regular
            }
          ]}>{section.subtitle}</Text>
        </View>
        <ChevronRight size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'notifications':
        return <NotificationSettings onBack={() => setActiveSection(null)} />;
      case 'account':
        return <AccountSettings onBack={() => setActiveSection(null)} />;
      case 'privacy':
        return <PrivacySettings onBack={() => setActiveSection(null)} />;
      case 'cloud-sync':
        return <CloudSyncSettings onBack={() => setActiveSection(null)} />;
      case 'theme':
        return <ThemeSettings onBack={() => setActiveSection(null)} />;
      case 'help':
        return <HelpSettings onBack={() => setActiveSection(null)} />;
      case 'language':
        return <LanguageSettings onBack={() => setActiveSection(null)} />;
      case 'security':
        return <SecuritySettings onBack={() => setActiveSection(null)} />;
      default:
        return null;
    }
  };

  if (activeSection) {
    return renderActiveSection();
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}>
        <Text style={[
          styles.title, 
          { 
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.xxxl,
            fontWeight: theme.typography.fontWeight.bold
          }
        ]}>Settings</Text>
        {user && (
          <Text style={[
            styles.userEmail, 
            { 
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.regular,
              marginTop: 4
            }
          ]}>{user.email}</Text>
        )}
        {isGuest && (
          <Text style={[
            styles.guestIndicator, 
            { 
              color: theme.colors.warning,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.regular,
              marginTop: 4
            }
          ]}>Guest Mode</Text>
        )}
        <Text style={[
          styles.subtitle, 
          { 
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>Customize your wellness tracking experience</Text>
        
        <View style={styles.settingsContainer}>
          {settingSections.map(renderSettingItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 4,
  },
  settingSubtitle: {
  },
});