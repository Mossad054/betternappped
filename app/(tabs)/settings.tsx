import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Bell, 
  User, 
  Shield, 
  Palette, 
  HelpCircle, 
  Globe, 
  Lock,
  ChevronRight
} from 'lucide-react-native';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { HelpSettings } from '@/components/settings/HelpSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

type SettingSection = 'notifications' | 'account' | 'privacy' | 'theme' | 'help' | 'language' | 'security' | null;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingSection>(null);
  
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
        style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
        onPress={() => setActiveSection(section.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${section.color}15` }]}>
          <IconComponent size={24} color={section.color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{section.title}</Text>
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{section.subtitle}</Text>
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
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Customize your wellness tracking experience</Text>
        
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
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});