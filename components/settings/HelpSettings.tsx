import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  BookOpen,
  Play,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown
} from 'lucide-react-native';

interface HelpSettingsProps {
  onBack: () => void;
}

export function HelpSettings({ onBack }: HelpSettingsProps) {
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'How do I track my mood?',
      answer: 'Tap the "+" button on the home screen or calendar, select your mood from the emoji scale (1-5), and optionally add activities and notes. Your mood data will be automatically saved and appear in your statistics.'
    },
    {
      id: '2',
      question: 'Can I export my data?',
      answer: 'Yes! Go to Settings > Privacy & Data > Export Data. You can export your data in JSON or CSV format. This includes all your mood entries, activities, sleep data, and habit tracking information.'
    },
    {
      id: '3',
      question: 'How do experiments work?',
      answer: 'Experiments help you test how different activities affect your wellbeing. Set up an experiment with a specific activity (like morning exercise), track it for a set period, and the app will analyze the impact on your mood, sleep, and mental clarity.'
    },
    {
      id: '4',
      question: 'Is my data private and secure?',
      answer: 'Absolutely. Your data is encrypted and stored securely. We never sell or share your personal information. You can choose to sync data across devices or keep it local only. See our Privacy Policy for full details.'
    },
    {
      id: '5',
      question: 'How do I set up notifications?',
      answer: 'Go to Settings > Notifications to customize your reminder preferences. You can set daily reminders, streak alerts, and experiment notifications. Choose the time that works best for your routine.'
    },
    {
      id: '6',
      question: 'What if I miss a day of tracking?',
      answer: 'No worries! You can add entries for previous dates by tapping on any date in the calendar view. Your streaks will be adjusted accordingly, and you can maintain your tracking consistency.'
    }
  ];

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to get help:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email Support',
          onPress: () => {
            Linking.openURL('mailto:support@wellnessapp.com?subject=Support Request');
          }
        },
        {
          text: 'Live Chat',
          onPress: () => {
            console.log('Opening live chat...');
            Alert.alert('Live Chat', 'Live chat feature would open here.');
          }
        }
      ]
    );
  };

  const handleTutorial = () => {
    console.log('Starting app tutorial...');
    Alert.alert('Tutorial', 'App tutorial would start here, walking through key features.');
  };

  const handleOpenLink = (url: string, title: string) => {
    Alert.alert(
      title,
      `This would open: ${url}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            console.log(`Opening ${url}`);
            // In a real app: Linking.openURL(url);
          }
        }
      ]
    );
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderFAQItem = (faq: typeof faqs[0]) => {
    const isExpanded = expandedFAQ === faq.id;
    
    return (
      <View key={faq.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => toggleFAQ(faq.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.faqQuestionText}>{faq.question}</Text>
          {isExpanded ? (
            <ChevronDown size={20} color="#6B7280" />
          ) : (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{faq.answer}</Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Get Help</Text>
        
        {renderActionItem(
          'Contact Support',
          'Get help from our support team',
          handleContactSupport,
          MessageCircle,
          '#3B82F6'
        )}

        {renderActionItem(
          'App Tutorial',
          'Learn how to use all features',
          handleTutorial,
          Play,
          '#10B981'
        )}

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {faqs.map(renderFAQItem)}
        </View>

        <Text style={styles.sectionTitle}>Resources</Text>
        
        {renderActionItem(
          'User Guide',
          'Comprehensive guide to all features',
          () => handleOpenLink('https://wellnessapp.com/guide', 'User Guide'),
          BookOpen,
          '#8B5CF6'
        )}

        {renderActionItem(
          'Video Tutorials',
          'Watch step-by-step video guides',
          () => handleOpenLink('https://wellnessapp.com/videos', 'Video Tutorials'),
          Play,
          '#F59E0B'
        )}

        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Wellness Tracker</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            A comprehensive wellness tracking app designed to help you monitor and improve your mental health, habits, and overall wellbeing.
          </Text>
        </View>

        {renderActionItem(
          'Privacy Policy',
          'How we protect your data',
          () => handleOpenLink('https://wellnessapp.com/privacy', 'Privacy Policy'),
          ExternalLink,
          '#6B7280'
        )}

        {renderActionItem(
          'Terms of Service',
          'Terms and conditions',
          () => handleOpenLink('https://wellnessapp.com/terms', 'Terms of Service'),
          ExternalLink,
          '#6B7280'
        )}

        {renderActionItem(
          'Rate the App',
          'Help us improve with your feedback',
          () => {
            console.log('Opening app store rating...');
            Alert.alert('Rate App', 'This would open the app store rating page.');
          },
          Info,
          '#EC4899'
        )}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>💬 Need More Help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to help! Reach out via email or live chat for personalized assistance with any questions or issues.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <Mail size={16} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  aboutCard: {
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
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});