import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Palette, 
  Smile,
  Image,
  Check,
  Eye,
  Home,
  Heart,
  Star,
  Shapes,
  Sparkles
} from 'lucide-react-native';
import { getAllPalettes, type ColorPalette } from '@/themes/colorPalettes';
import { getAllIconPalettes, type IconPalette } from '@/themes/iconPalettes';
import { getAllEmojiPalettes, type EmojiPalette } from '@/themes/emojiPalettes';
import { UserPreferencesService } from '@/services/userPreferences.service';
import ThemedIcon from '@/components/ThemedIcon';

interface ThemeSettingsProps {
  onBack: () => void;
}

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, colorPalette, iconPalette, emojiPalette, emojiOpacity, toggleTheme, setColorPalette, setIconPalette, setEmojiPalette } = useTheme();
  const { user, isGuest } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(themeMode === 'dark');
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>(colorPalette || 'default');
  const [selectedIconPalette, setSelectedIconPalette] = useState<string>(iconPalette || 'default');
  const [selectedEmojiPalette, setSelectedEmojiPalette] = useState<string>(emojiPalette || 'apple');
  const [hoveredColorScheme, setHoveredColorScheme] = useState<string | null>(null);
  const [hoveredIconPalette, setHoveredIconPalette] = useState<string | null>(null);
  const [hoveredEmojiPalette, setHoveredEmojiPalette] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedIconChanges, setHasUnsavedIconChanges] = useState(false);
  const [hasUnsavedEmojiChanges, setHasUnsavedEmojiChanges] = useState(false);

  const colorPalettes = getAllPalettes();
  const iconPalettes = getAllIconPalettes();
  const emojiPalettes = getAllEmojiPalettes();

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  // Sync with theme context
  useEffect(() => {
    if (colorPalette !== selectedColorScheme) {
      setSelectedColorScheme(colorPalette);
    }
  }, [colorPalette]);

  useEffect(() => {
    if (iconPalette !== selectedIconPalette) {
      setSelectedIconPalette(iconPalette);
    }
  }, [iconPalette]);

  useEffect(() => {
    if (emojiPalette !== selectedEmojiPalette) {
      setSelectedEmojiPalette(emojiPalette);
    }
  }, [emojiPalette]);

  useEffect(() => {
    setIsDarkMode(themeMode === 'dark');
  }, [themeMode]);

  const loadUserPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await UserPreferencesService.getUserPreferences(user.id);
      if (result.data) {
        setSelectedColorScheme(result.data.color_theme);
        setSelectedIconPalette(result.data.icon_pack);
        setSelectedEmojiPalette(result.data.emoji_palette);
        
        // Apply the saved preferences immediately
        if (result.data.color_theme !== colorPalette) {
          await setColorPalette(result.data.color_theme);
        }
        if (result.data.icon_pack !== iconPalette) {
          await setIconPalette(result.data.icon_pack);
        }
        if (result.data.emoji_palette !== emojiPalette) {
          await setEmojiPalette(result.data.emoji_palette);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    toggleTheme();
    
    // Save theme mode preference
    if (user) {
      UserPreferencesService.updateThemeMode(
        user.id,
        enabled ? 'dark' : 'light'
      ).catch(error => {
        console.error('Failed to save theme mode:', error);
      });
    }
  };

  const handleColorSchemeSelect = async (schemeId: string) => {
    setSelectedColorScheme(schemeId);
    
    // Apply immediately for instant preview
    await setColorPalette(schemeId);
    
    // Mark as unsaved for database persistence
    setHasUnsavedChanges(true);
  };

  const handleColorSchemeHover = (schemeId: string | null) => {
    setHoveredColorScheme(schemeId);
  };

  const handleSaveColorScheme = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your theme preferences.');
      return;
    }

    setSaving(true);
    try {
      const result = await UserPreferencesService.updateColorTheme(user.id, selectedColorScheme);
      if (result.success) {
        setHasUnsavedChanges(false);
        Alert.alert('Success', 'Your color scheme has been saved permanently!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save color scheme');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleIconPaletteSelect = async (paletteId: string) => {
    setSelectedIconPalette(paletteId);
    
    // Apply immediately for instant preview
    await setIconPalette(paletteId);
    
    // Mark as unsaved for database persistence
    setHasUnsavedIconChanges(true);
  };

  const handleIconPaletteHover = (paletteId: string | null) => {
    setHoveredIconPalette(paletteId);
  };

  const handleSaveIconPalette = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your theme preferences.');
      return;
    }

    setSaving(true);
    try {
      const result = await UserPreferencesService.updateIconPack(user.id, selectedIconPalette);
      if (result.success) {
        setHasUnsavedIconChanges(false);
        Alert.alert('Success', 'Your icon style has been saved permanently!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save icon style');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleEmojiPaletteSelect = async (paletteId: string) => {
    setSelectedEmojiPalette(paletteId);
    
    // Apply immediately for instant preview
    await setEmojiPalette(paletteId);
    
    // Mark as unsaved for database persistence
    setHasUnsavedEmojiChanges(true);
  };

  const handleEmojiPaletteHover = (paletteId: string | null) => {
    setHoveredEmojiPalette(paletteId);
  };

  const handleSaveEmojiPalette = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your theme preferences.');
      return;
    }

    setSaving(true);
    try {
      const result = await UserPreferencesService.updateEmojiPalette(user.id, selectedEmojiPalette);
      if (result.success) {
        setHasUnsavedEmojiChanges(false);
        Alert.alert('✨ Success', 'Your emoji palette has been updated!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save emoji palette');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const renderColorScheme = (palette: ColorPalette) => {
    const isSelected = selectedColorScheme === palette.id;
    const isHovered = hoveredColorScheme === palette.id;
    const isPreview = isHovered && !isSelected;
    
    return (
      <TouchableOpacity
        key={palette.id}
        style={[
          styles.colorSchemeItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          },
          (isSelected || isPreview) && {
            borderColor: theme.colors.accent,
            borderWidth: 2,
            backgroundColor: theme.colors.accent + '10'
          }
        ]}
        onPress={() => handleColorSchemeSelect(palette.id)}
        onPressIn={() => handleColorSchemeHover(palette.id)}
        onPressOut={() => handleColorSchemeHover(null)}
        activeOpacity={0.7}
      >
        <View style={styles.colorSchemeHeader}>
          <View style={styles.colorSchemeInfo}>
            <Text style={[
              styles.colorSchemeName,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium
              },
              (isSelected || isPreview) && { color: theme.colors.accent }
            ]}>
              {palette.name}
            </Text>
            <Text style={[
              styles.colorSchemeDescription,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              {palette.description}
            </Text>
          </View>
          {isSelected && (
            <View style={[styles.checkmarkContainer, { backgroundColor: theme.colors.accent }]}>
              <Check size={16} color={theme.colors.white} />
            </View>
          )}
          {isPreview && (
            <View style={[styles.eyeContainer, { backgroundColor: theme.colors.accent + '20' }]}>
              <Eye size={16} color={theme.colors.accent} />
            </View>
          )}
        </View>
        <View style={styles.colorPalette}>
          {palette.preview.map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorSwatch, 
                { 
                  backgroundColor: color,
                  borderRadius: theme.borderRadius.sm,
                  borderColor: theme.colors.borderLight,
                  borderWidth: 1
                }
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderIconPalette = (palette: IconPalette) => {
    const isSelected = selectedIconPalette === palette.id;
    const isHovered = hoveredIconPalette === palette.id;
    const isPreview = isHovered && !isSelected;
    
    // Map icon names to components
    const iconMap: Record<string, any> = {
      Home, Heart, Star, Smile
    };
    
    return (
      <TouchableOpacity
        key={palette.id}
        style={[
          styles.iconPaletteItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          },
          (isSelected || isPreview) && {
            borderColor: theme.colors.accent,
            borderWidth: 2,
            shadowColor: theme.colors.accent,
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }
        ]}
        onPress={() => handleIconPaletteSelect(palette.id)}
        onPressIn={() => handleIconPaletteHover(palette.id)}
        onPressOut={() => handleIconPaletteHover(null)}
      >
        {/* Active/Preview indicator */}
        {isSelected && (
          <View style={[styles.checkmarkContainer, { backgroundColor: theme.colors.success }]}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
        {isPreview && !isSelected && (
          <View style={[styles.eyeContainer, { backgroundColor: theme.colors.info }]}>
            <Eye size={14} color="#FFFFFF" strokeWidth={2} />
          </View>
        )}

        <View style={styles.iconPaletteInfo}>
          <Text style={[
            styles.iconPaletteName,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>{palette.name}</Text>
          <Text style={[
            styles.iconPaletteDescription,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm
            }
          ]}>{palette.description}</Text>
        </View>

        {/* Icon Preview */}
        <View style={styles.iconPreviewContainer}>
          {palette.previewIcons.slice(0, 4).map((iconName, index) => {
            const IconComponent = iconMap[iconName];
            if (!IconComponent) return null;
            
            return (
              <View 
                key={index} 
                style={[
                  styles.iconPreviewItem,
                  {
                    backgroundColor: `${theme.colors.primary}10`,
                    borderRadius: theme.borderRadius.sm
                  }
                ]}
              >
                <ThemedIcon 
                  Icon={IconComponent} 
                  size={20} 
                  color={theme.colors.primary}
                  paletteOverride={palette.id}
                />
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmojiPalette = (palette: EmojiPalette) => {
    const isSelected = selectedEmojiPalette === palette.id;
    const isHovered = hoveredEmojiPalette === palette.id;
    const isPreview = isHovered && !isSelected;
    
    return (
      <TouchableOpacity
        key={palette.id}
        style={[
          styles.emojiPaletteItem,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.small
          },
          (isSelected || isPreview) && {
            borderColor: theme.colors.accent,
            borderWidth: 2,
            shadowColor: theme.colors.accent,
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }
        ]}
        onPress={() => handleEmojiPaletteSelect(palette.id)}
        onPressIn={() => handleEmojiPaletteHover(palette.id)}
        onPressOut={() => handleEmojiPaletteHover(null)}
      >
        {/* Active/Preview indicator */}
        {isSelected && (
          <View style={[styles.checkmarkContainer, { backgroundColor: theme.colors.success }]}>
            <Check size={14} color="#FFFFFF" strokeWidth={3} />
          </View>
        )}
        {isPreview && !isSelected && (
          <View style={[styles.eyeContainer, { backgroundColor: theme.colors.info }]}>
            <Eye size={14} color="#FFFFFF" strokeWidth={2} />
          </View>
        )}

        <View style={styles.emojiPaletteInfo}>
          <Text style={[
            styles.emojiPaletteName,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>{palette.name}</Text>
          <Text style={[
            styles.emojiPaletteDescription,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm
            }
          ]}>{palette.description}</Text>
        </View>

        {/* Emoji Preview */}
        <View style={styles.emojiPreviewContainer}>
          {palette.previewEmojis.map((emoji, index) => (
            <View 
              key={index} 
              style={[
                styles.emojiPreviewItem,
                {
                  backgroundColor: `${theme.colors.primary}08`,
                  borderRadius: theme.borderRadius.sm
                }
              ]}
            >
              <Text 
                style={[
                  styles.emojiPreviewText,
                  {
                    opacity: isPreview || isSelected ? emojiOpacity : 0.8
                  }
                ]}
              >
                {emoji}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
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
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>Theme</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

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
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Theme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
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
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.medium
              }
            ]}>Dark Mode</Text>
            <Text style={[
              styles.settingSubtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
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

        {/* Color Schemes Section */}
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Color Schemes</Text>
        <Text style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>
          Choose a color palette that matches your style. Press and hold to preview.
        </Text>
        
        <View style={styles.colorSchemesContainer}>
          {colorPalettes.map(renderColorScheme)}
        </View>

        {/* Save Button */}
        {hasUnsavedChanges && !isGuest && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                ...theme.shadows.medium
              }
            ]}
            onPress={handleSaveColorScheme}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Check size={20} color={theme.colors.white} />
                <Text style={[
                  styles.saveButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold
                  }
                ]}>
                  Save as Default
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Guest Mode Notice */}
        {isGuest && (
          <View style={[
            styles.guestNotice,
            {
              backgroundColor: theme.colors.warning + '20',
              borderRadius: theme.borderRadius.md,
              borderLeftColor: theme.colors.warning
            }
          ]}>
            <Text style={[
              styles.guestNoticeText,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              🔒 Sign in to save your theme preferences permanently
            </Text>
          </View>
        )}

        {/* Icon Palettes Section */}
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Icon Styles</Text>
        <Text style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>
          Choose how icons appear across the entire app. Changes apply instantly.
        </Text>
        
        <View style={styles.iconPalettesContainer}>
          {iconPalettes.map(renderIconPalette)}
        </View>

        {/* Save Icon Palette Button */}
        {hasUnsavedIconChanges && !isGuest && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                ...theme.shadows.medium
              }
            ]}
            onPress={handleSaveIconPalette}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Check size={20} color={theme.colors.white} />
                <Text style={[
                  styles.saveButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold
                  }
                ]}>
                  Save Icon Style
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Icon Palette Guest Mode Notice */}
        {isGuest && hasUnsavedIconChanges && (
          <View style={[
            styles.guestNotice,
            {
              backgroundColor: theme.colors.warning + '20',
              borderRadius: theme.borderRadius.md,
              borderLeftColor: theme.colors.warning
            }
          ]}>
            <Text style={[
              styles.guestNoticeText,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              🔒 Sign in to save your icon style permanently
            </Text>
          </View>
        )}

        {/* Emoji Palettes Section */}
        <Text style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.semibold
          }
        ]}>Emoji Palettes</Text>
        <Text style={[
          styles.sectionSubtitle,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.regular
          }
        ]}>
          Choose your preferred emoji style. Changes apply instantly across mood tracking, notifications, and achievements.
        </Text>
        
        <View style={styles.emojiPalettesContainer}>
          {emojiPalettes.map(renderEmojiPalette)}
        </View>

        {/* Save Emoji Palette Button */}
        {hasUnsavedEmojiChanges && !isGuest && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.borderRadius.md,
                ...theme.shadows.medium
              }
            ]}
            onPress={handleSaveEmojiPalette}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Sparkles size={20} color={theme.colors.white} />
                <Text style={[
                  styles.saveButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold
                  }
                ]}>
                  Save Emoji Palette
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Emoji Palette Guest Mode Notice */}
        {isGuest && hasUnsavedEmojiChanges && (
          <View style={[
            styles.guestNotice,
            {
              backgroundColor: theme.colors.warning + '20',
              borderRadius: theme.borderRadius.md,
              borderLeftColor: theme.colors.warning
            }
          ]}>
            <Text style={[
              styles.guestNoticeText,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              🔒 Sign in to save your emoji palette permanently
            </Text>
          </View>
        )}

        {/* Preview Card */}
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
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>🎨 Live Preview</Text>
          <View style={styles.previewContent}>
            <View style={[
              styles.previewMoodCard,
              {
                backgroundColor: theme.colors.cardSecondary,
                borderRadius: theme.borderRadius.sm
              }
            ]}>
              <Text style={[
                styles.previewCardTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.xs,
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
                backgroundColor: theme.colors.cardSecondary,
                borderRadius: theme.borderRadius.sm
              }
            ]}>
              <Text style={[
                styles.previewCardTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.medium
                }
              ]}>Activities</Text>
              <View style={styles.previewActivityRow}>
                <View style={[styles.previewActivityDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[
                  styles.previewActivityText,
                  {
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.xs
                  }
                ]}>Exercise</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tips Card */}
        <View style={[
          styles.infoCard,
          {
            backgroundColor: theme.colors.warning + '20',
            borderRadius: theme.borderRadius.md,
            borderLeftColor: theme.colors.warning
          }
        ]}>
          <Text style={[
            styles.infoTitle,
            {
              color: theme.colors.warning,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold
            }
          ]}>✨ Personalization Tips</Text>
          <Text style={[
            styles.infoText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.regular
            }
          ]}>
            • Dark mode helps reduce eye strain in low light{'\n'}
            • Color schemes affect charts, buttons, and accent colors{'\n'}
            • Icon styles change how icons look throughout the app{'\n'}
            • Emoji palettes personalize mood expressions and notifications{'\n'}
            • Press and hold a palette to preview it instantly{'\n'}
            • Changes apply immediately across the entire app{'\n'}
            • Saved preferences persist across all your devices
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
  colorSchemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSchemeInfo: {
    flex: 1,
  },
  colorSchemeName: {
    marginBottom: 4,
  },
  colorSchemeDescription: {
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
  },
  iconPalettesContainer: {
    gap: 8,
  },
  iconPaletteItem: {
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconPaletteInfo: {
    marginBottom: 12,
  },
  iconPaletteName: {
    marginBottom: 4,
  },
  iconPaletteDescription: {
  },
  iconPreviewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconPreviewItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Emoji Palette Styles
  emojiPalettesContainer: {
    gap: 12,
  },
  emojiPaletteItem: {
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiPaletteInfo: {
    marginBottom: 12,
  },
  emojiPaletteName: {
    marginBottom: 4,
  },
  emojiPaletteDescription: {
    lineHeight: 18,
  },
  emojiPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  emojiPreviewItem: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPreviewText: {
    fontSize: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  saveButtonText: {
  },
  guestNotice: {
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  guestNoticeText: {
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
