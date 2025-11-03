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
        style={[
          styles.colorSchemeItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          },
          isSelected && {
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.accent + '10'
          }
        ]}
        onPress={() => handleColorSchemeSelect(scheme.id)}
        activeOpacity={0.7}
      >
        <View style={styles.colorSchemeHeader}>
          <Text style={[
            styles.colorSchemeName,
            {
              color: theme.colors.text,
              fontSize: theme.typography.md,
              fontWeight: theme.typography.fontWeight.medium
            },
            isSelected && { color: theme.colors.accent }
          ]}>
            {scheme.name}
          </Text>
          {isSelected && <Text style={[styles.checkmark, { color: theme.colors.accent }]}>✓</Text>}
        </View>
        <View style={styles.colorPalette}>
          {scheme.colors.map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorSwatch, 
                { 
                  backgroundColor: color,
                  borderRadius: theme.borderRadius.sm,
                  borderColor: theme.colors.borderLight
                }
              ]}
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
        style={[
          styles.iconPackItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          },
          isSelected && {
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.accent + '10'
          }
        ]}
        onPress={() => handleIconPackSelect(pack.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconPackContent}>
          <View style={styles.iconPackHeader}>
            <Text style={[
              styles.iconPackName,
              {
                color: theme.colors.text,
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.medium
              },
              isSelected && { color: theme.colors.accent }
            ]}>
              {pack.name}
            </Text>
            {isSelected && <Text style={[styles.checkmark, { color: theme.colors.accent }]}>✓</Text>}
          </View>
          <Text style={[
            styles.iconPackDescription,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sm,
              fontWeight: theme.typography.fontWeight.regular
            }
          ]}>{pack.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + theme.spacing.base, 
          backgroundColor: theme.colors.card, 
          borderBottomColor: theme.colors.borderLight 
        }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle, 
          { 
            color: theme.colors.text,
            fontSize: theme.typography.lg,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Theme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Appearance</Text>
        
        <View style={[
          styles.settingItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          }
        ]}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.warning}15`, borderRadius: theme.borderRadius.sm }]}>
            {isDarkMode ? (
              <Moon size={20} color={theme.colors.warning} />
            ) : (
              <Sun size={20} color={theme.colors.warning} />
            )}
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.medium
              }
            ]}>Dark Mode</Text>
            <Text style={[
              styles.settingSubtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
            thumbColor={isDarkMode ? theme.colors.textInverted : theme.colors.textLight}
          />
        </View>

        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Color Schemes</Text>
        <Text style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sm,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>
          Choose a color palette that matches your style
        </Text>
        
        <View style={styles.colorSchemesContainer}>
          {colorSchemes.map(renderColorScheme)}
        </View>

        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Icon Packs</Text>
        <Text style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sm,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>
          Select your preferred icon style
        </Text>
        
        <View style={styles.iconPacksContainer}>
          {iconPacks.map(renderIconPack)}
        </View>

        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Emoji Customization</Text>
        
        <TouchableOpacity style={[
          styles.emojiCustomizationItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          }
        ]} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.accentPeach}15`, borderRadius: theme.borderRadius.sm }]}>
            <Smile size={20} color={theme.colors.accentPeach} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.medium
              }
            ]}>Mood Emojis</Text>
            <Text style={[
              styles.settingSubtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>Customize mood tracking emojis</Text>
          </View>
          <Text style={[styles.customizeText, { color: theme.colors.accent }]}>Customize</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.emojiCustomizationItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          }
        ]} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.accentLime}15`, borderRadius: theme.borderRadius.sm }]}>
            <Image size={20} color={theme.colors.accentLime} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[
              styles.settingTitle,
              {
                color: theme.colors.text,
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.medium
              }
            ]}>Activity Icons</Text>
            <Text style={[
              styles.settingSubtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>Customize activity tracking icons</Text>
          </View>
          <Text style={[styles.customizeText, { color: theme.colors.accent }]}>Customize</Text>
        </TouchableOpacity>

        <View style={[
          styles.previewCard,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          }
        ]}>
          <Text style={[
            styles.previewTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.md,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>🎨 Theme Preview</Text>
          <View style={styles.previewContent}>
            <View style={[
              styles.previewMoodCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.sm
              }
            ]}>
              <Text style={[
                styles.previewCardTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.xs,
                  fontWeight: theme.typography.fontWeight.medium
                }
              ]}>Mood Tracking</Text>
              <View style={styles.previewMoodRow}>
                <Text style={styles.previewEmoji}>😊</Text>
                <Text style={styles.previewEmoji}>😐</Text>
                <Text style={styles.previewEmoji}>😔</Text>
              </View>
            </View>
            <View style={[
              styles.previewActivityCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.sm
              }
            ]}>
              <Text style={[
                styles.previewCardTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.xs,
                  fontWeight: theme.typography.fontWeight.medium
                }
              ]}>Activities</Text>
              <View style={styles.previewActivityRow}>
                <View style={[styles.previewActivityDot, { backgroundColor: colorSchemes.find(s => s.id === selectedColorScheme)?.colors[0] }]} />
                <Text style={[
                  styles.previewActivityText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.xs
                  }
                ]}>Exercise</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.accentYellow + '20',
            borderRadius: theme.borderRadius.md,
            borderLeftColor: theme.colors.warning
          }
        ]}>
          <Text style={[
            styles.infoTitle,
            {
              color: theme.colors.warning,
              fontSize: theme.typography.md,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>✨ Personalization Tips</Text>
          <Text style={[
            styles.infoText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.sm,
              fontWeight: theme.typography.fontWeight.regular
            }
          ]}>
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  settingItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingSubtitle: {
  },
  colorSchemesContainer: {
    gap: 8,
  },
  colorSchemeItem: {
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
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
  },
  selectedText: {
    color: '#3B82F6',
  },
  checkmark: {
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
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
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
  },
  iconPackDescription: {
  },
  emojiCustomizationItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customizeText: {
  },
  previewCard: {
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  previewTitle: {
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    gap: 12,
  },
  previewMoodCard: {
    flex: 1,
    padding: 12,
  },
  previewActivityCard: {
    flex: 1,
    padding: 12,
  },
  previewCardTitle: {
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
  },
  infoCard: {
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
});