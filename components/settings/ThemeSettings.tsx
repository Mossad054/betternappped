import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Palette, 
  Smile,
  Image,
  Brush
} from 'lucide-react-native';

interface ThemeSettingsProps {
  onBack: () => void;
}

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(themeMode === 'dark');
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>('default');
  const [selectedIconPack, setSelectedIconPack] = useState<string>('default');

  const colorSchemes = [
    { id: 'default', name: 'Default', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] },
    { id: 'warm', name: 'Warm', colors: ['#F97316', '#EAB308', '#DC2626', '#EC4899'] },
    { id: 'cool', name: 'Cool', colors: ['#0EA5E9', '#06B6D4', '#8B5CF6', '#6366F1'] },
    { id: 'nature', name: 'Nature', colors: ['#059669', '#65A30D', '#CA8A04', '#DC2626'] },
    { id: 'pastel', name: 'Pastel', colors: ['#A78BFA', '#FB7185', '#FBBF24', '#34D399'] },
  ];

  const iconPacks = [
    { id: 'default', name: 'Default', description: 'Clean and minimal icons' },
    { id: 'rounded', name: 'Rounded', description: 'Soft, rounded icon style' },
    { id: 'outlined', name: 'Outlined', description: 'Outlined icon style' },
    { id: 'filled', name: 'Filled', description: 'Bold, filled icons' },
  ];

  useEffect(() => {
    setIsDarkMode(themeMode === 'dark');
  }, [themeMode]);

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    toggleTheme();
    console.log('Dark mode toggled:', enabled);
  };

  const handleColorSchemeSelect = (schemeId: string) => {
    setSelectedColorScheme(schemeId);
    console.log('Color scheme selected:', schemeId);
  };

  const handleIconPackSelect = (packId: string) => {
    setSelectedIconPack(packId);
    console.log('Icon pack selected:', packId);
  };

  const renderColorScheme = (scheme: typeof colorSchemes[0]) => {
    const isSelected = selectedColorScheme === scheme.id;
    
    return (
      <TouchableOpacity
        key={scheme.id}
        style={[styles.colorSchemeItem, isSelected && styles.selectedColorScheme]}
        onPress={() => handleColorSchemeSelect(scheme.id)}
        activeOpacity={0.7}
      >
        <View style={styles.colorSchemeHeader}>
          <Text style={[styles.colorSchemeName, isSelected && styles.selectedText]}>
            {scheme.name}
          </Text>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.colorPalette}>
          {scheme.colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorSwatch, { backgroundColor: color }]}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderIconPack = (pack: typeof iconPacks[0]) => {
    const isSelected = selectedIconPack === pack.id;
    
    return (
      <TouchableOpacity
        key={pack.id}
        style={[styles.iconPackItem, isSelected && styles.selectedIconPack]}
        onPress={() => handleIconPackSelect(pack.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconPackContent}>
          <View style={styles.iconPackHeader}>
            <Text style={[styles.iconPackName, isSelected && styles.selectedText]}>
              {pack.name}
            </Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.iconPackDescription}>{pack.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Theme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#F59E0B15' }]}>
            {isDarkMode ? (
              <Moon size={20} color="#F59E0B" />
            ) : (
              <Sun size={20} color="#F59E0B" />
            )}
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingSubtitle}>
              {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <Text style={styles.sectionTitle}>Color Schemes</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a color palette that matches your style
        </Text>
        
        <View style={styles.colorSchemesContainer}>
          {colorSchemes.map(renderColorScheme)}
        </View>

        <Text style={styles.sectionTitle}>Icon Packs</Text>
        <Text style={styles.sectionSubtitle}>
          Select your preferred icon style
        </Text>
        
        <View style={styles.iconPacksContainer}>
          {iconPacks.map(renderIconPack)}
        </View>

        <Text style={styles.sectionTitle}>Emoji Customization</Text>
        
        <TouchableOpacity style={styles.emojiCustomizationItem} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#EC489915' }]}>
            <Smile size={20} color="#EC4899" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Mood Emojis</Text>
            <Text style={styles.settingSubtitle}>Customize mood tracking emojis</Text>
          </View>
          <Text style={styles.customizeText}>Customize</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emojiCustomizationItem} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B5CF615' }]}>
            <Image size={20} color="#8B5CF6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Activity Icons</Text>
            <Text style={styles.settingSubtitle}>Customize activity tracking icons</Text>
          </View>
          <Text style={styles.customizeText}>Customize</Text>
        </TouchableOpacity>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>🎨 Theme Preview</Text>
          <View style={styles.previewContent}>
            <View style={styles.previewMoodCard}>
              <Text style={styles.previewCardTitle}>Mood Tracking</Text>
              <View style={styles.previewMoodRow}>
                <Text style={styles.previewEmoji}>😊</Text>
                <Text style={styles.previewEmoji}>😐</Text>
                <Text style={styles.previewEmoji}>😔</Text>
              </View>
            </View>
            <View style={styles.previewActivityCard}>
              <Text style={styles.previewCardTitle}>Activities</Text>
              <View style={styles.previewActivityRow}>
                <View style={[styles.previewActivityDot, { backgroundColor: colorSchemes.find(s => s.id === selectedColorScheme)?.colors[0] }]} />
                <Text style={styles.previewActivityText}>Exercise</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✨ Personalization Tips</Text>
          <Text style={styles.infoText}>
            • Dark mode can help reduce eye strain in low light{'\n'}
            • Color schemes affect charts, buttons, and accent colors{'\n'}
            • Icon packs change the visual style throughout the app{'\n'}
            • Custom emojis make tracking more personal and fun{'\n'}
            • Changes apply immediately across the entire app
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  colorSchemesContainer: {
    gap: 8,
  },
  colorSchemeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  selectedColorScheme: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  colorSchemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSchemeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  selectedText: {
    color: '#3B82F6',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconPacksContainer: {
    gap: 8,
  },
  iconPackItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  selectedIconPack: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  iconPackContent: {
    flex: 1,
  },
  iconPackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconPackName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  iconPackDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  emojiCustomizationItem: {
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
  customizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    gap: 12,
  },
  previewMoodCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  previewActivityCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  previewCardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  previewMoodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  previewEmoji: {
    fontSize: 20,
  },
  previewActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewActivityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewActivityText: {
    fontSize: 12,
    color: '#1F2937',
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