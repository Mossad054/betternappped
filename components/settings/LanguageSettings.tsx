import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Globe, Check } from 'lucide-react-native';

interface LanguageSettingsProps {
  onBack: () => void;
}

export function LanguageSettings({ onBack }: LanguageSettingsProps) {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    
    Alert.alert(
      'Change Language',
      `Switch to ${language?.name} (${language?.nativeName})? The app will restart to apply the new language.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            setSelectedLanguage(languageCode);
            console.log('Language changed to:', languageCode);
            
            // Simulate app restart notification
            setTimeout(() => {
              Alert.alert(
                'Language Changed',
                `App language has been changed to ${language?.name}. Some changes may require restarting the app.`
              );
            }, 500);
          }
        }
      ]
    );
  };

  const renderLanguageItem = (language: typeof languages[0]) => {
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <Text style={styles.flag}>{language.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, isSelected && styles.selectedText]}>
              {language.name}
            </Text>
            <Text style={[styles.nativeName, isSelected && styles.selectedNativeText]}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkContainer}>
            <Check size={20} color="#3B82F6" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === selectedLanguage);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.currentLanguageCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#3B82F615' }]}>
            <Globe size={20} color="#3B82F6" />
          </View>
          <View style={styles.currentLanguageContent}>
            <Text style={styles.currentLanguageTitle}>Current Language</Text>
            <Text style={styles.currentLanguageText}>
              {getCurrentLanguage()?.flag} {getCurrentLanguage()?.name} ({getCurrentLanguage()?.nativeName})
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Languages</Text>
        <Text style={styles.sectionSubtitle}>
          Select your preferred language for the app interface
        </Text>
        
        <View style={styles.languagesContainer}>
          {languages.map(renderLanguageItem)}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🌍 Language Support</Text>
          <Text style={styles.infoText}>
            • Interface language affects all app text and labels{'\n'}
            • Date and time formats will adjust to your selected language{'\n'}
            • Some features may require app restart to fully apply{'\n'}
            • Your data and entries remain unchanged when switching languages{'\n'}
            • More languages are being added regularly
          </Text>
        </View>

        <View style={styles.translationCard}>
          <Text style={styles.translationTitle}>📝 Help Us Translate</Text>
          <Text style={styles.translationText}>
            Don't see your language? We're always looking for help with translations. 
            Contact us if you'd like to contribute to making the app available in your language.
          </Text>
          <TouchableOpacity
            style={styles.contributeButton}
            onPress={() => {
              console.log('Opening translation contribution...');
              Alert.alert(
                'Contribute Translation',
                'Thank you for your interest! This would open our translation contribution page.'
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.contributeButtonText}>Contribute Translation</Text>
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
  currentLanguageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  currentLanguageContent: {
    flex: 1,
  },
  currentLanguageTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  currentLanguageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  languagesContainer: {
    gap: 8,
  },
  languageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedLanguageItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  nativeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedText: {
    color: '#3B82F6',
  },
  selectedNativeText: {
    color: '#1E40AF',
  },
  checkContainer: {
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
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
  translationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  translationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 16,
  },
  contributeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  contributeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});