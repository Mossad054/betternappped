/**
 * Icon Palette Demo
 * Visual demonstration of all available icon palettes
 * Useful for testing and showcasing the icon palette system
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ThemedIcon from '@/components/ThemedIcon';
import { getAllIconPalettes } from '@/themes/iconPalettes';
import { 
  Home, Heart, Star, Smile, Settings, Bell, 
  Mail, Calendar, Clock, User, Search, Menu 
} from 'lucide-react-native';

export default function IconPaletteDemo() {
  const { theme } = useTheme();
  const palettes = getAllIconPalettes();
  
  const demoIcons = [
    { Icon: Home, name: 'Home' },
    { Icon: Heart, name: 'Heart' },
    { Icon: Star, name: 'Star' },
    { Icon: Smile, name: 'Smile' },
    { Icon: Settings, name: 'Settings' },
    { Icon: Bell, name: 'Bell' },
    { Icon: Mail, name: 'Mail' },
    { Icon: Calendar, name: 'Calendar' },
    { Icon: Clock, name: 'Clock' },
    { Icon: User, name: 'User' },
    { Icon: Search, name: 'Search' },
    { Icon: Menu, name: 'Menu' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Icon Palette Demo
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          All available icon styles with live examples
        </Text>
      </View>

      {palettes.map((palette) => (
        <View 
          key={palette.id}
          style={[
            styles.paletteSection,
            {
              backgroundColor: theme.colors.card,
              borderRadius: theme.borderRadius.lg,
              ...theme.shadows.medium
            }
          ]}
        >
          {/* Palette Header */}
          <View style={styles.paletteHeader}>
            <View>
              <Text style={[styles.paletteName, { color: theme.colors.text }]}>
                {palette.name}
              </Text>
              <Text style={[styles.paletteDescription, { color: theme.colors.textSecondary }]}>
                {palette.description}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                {palette.id}
              </Text>
            </View>
          </View>

          {/* Style Properties */}
          <View style={[styles.propertiesCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.propertiesTitle, { color: theme.colors.textSecondary }]}>
              Style Properties
            </Text>
            <View style={styles.propertiesGrid}>
              <View style={styles.propertyItem}>
                <Text style={[styles.propertyLabel, { color: theme.colors.textTertiary }]}>
                  Stroke Width
                </Text>
                <Text style={[styles.propertyValue, { color: theme.colors.text }]}>
                  {palette.style.strokeWidth}
                </Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={[styles.propertyLabel, { color: theme.colors.textTertiary }]}>
                  Line Cap
                </Text>
                <Text style={[styles.propertyValue, { color: theme.colors.text }]}>
                  {palette.style.strokeLinecap || 'round'}
                </Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={[styles.propertyLabel, { color: theme.colors.textTertiary }]}>
                  Fill
                </Text>
                <Text style={[styles.propertyValue, { color: theme.colors.text }]}>
                  {palette.style.fill ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.propertyItem}>
                <Text style={[styles.propertyLabel, { color: theme.colors.textTertiary }]}>
                  Glow
                </Text>
                <Text style={[styles.propertyValue, { color: theme.colors.text }]}>
                  {palette.glowEffect ? `${(palette.glowIntensity || 0) * 100}%` : 'Off'}
                </Text>
              </View>
            </View>
          </View>

          {/* Icon Grid */}
          <View style={styles.iconGrid}>
            {demoIcons.map(({ Icon, name }) => (
              <View 
                key={name}
                style={[
                  styles.iconItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.borderRadius.md
                  }
                ]}
              >
                <ThemedIcon 
                  Icon={Icon}
                  size={28}
                  color={theme.colors.primary}
                  paletteOverride={palette.id}
                />
                <Text style={[styles.iconName, { color: theme.colors.textTertiary }]}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Usage Example */}
      <View 
        style={[
          styles.usageSection,
          {
            backgroundColor: theme.colors.info + '20',
            borderRadius: theme.borderRadius.lg,
            borderLeftColor: theme.colors.info,
          }
        ]}
      >
        <Text style={[styles.usageTitle, { color: theme.colors.info }]}>
          💡 Usage Example
        </Text>
        <Text style={[styles.usageCode, { color: theme.colors.textSecondary }]}>
          {`import ThemedIcon from '@/components/ThemedIcon';\nimport { Home } from 'lucide-react-native';\n\n<ThemedIcon \n  Icon={Home} \n  size={24} \n  color={theme.colors.primary}\n  paletteOverride="bold"\n/>`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  paletteSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paletteName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  paletteDescription: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  propertiesCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  propertiesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  propertyItem: {
    flex: 1,
    minWidth: '40%',
  },
  propertyLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconItem: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconName: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  usageSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderLeftWidth: 4,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  usageCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
