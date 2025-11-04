/**
 * Themed Icon Component
 * Date: 2025-11-05
 * Purpose: Smart icon wrapper that applies current icon palette style
 * Automatically updates when user changes icon palette in settings
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getIconPalette } from '@/themes/iconPalettes';

interface ThemedIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  /** Override the global icon palette for this specific icon */
  paletteOverride?: string;
  /** Additional Lucide props */
  iconProps?: Partial<LucideProps>;
}

/**
 * ThemedIcon - Renders icons with the current icon palette style
 * 
 * Usage:
 * ```tsx
 * <ThemedIcon Icon={Home} size={24} color={theme.colors.primary} />
 * ```
 */
export default function ThemedIcon({ 
  Icon, 
  size = 24, 
  color,
  paletteOverride,
  iconProps = {},
}: ThemedIconProps) {
  const { theme, iconPalette: globalIconPalette, iconStyle } = useTheme();
  
  // Use override palette if provided, otherwise use global
  const activePalette = paletteOverride || globalIconPalette;
  const palette = getIconPalette(activePalette);
  
  // Determine icon color (priority: prop > theme > default)
  const iconColor = color || theme.colors.icon || theme.colors.textPrimary;
  
  // Build icon props based on palette style
  const styleProps: Partial<LucideProps> = {
    size,
    color: iconColor,
    strokeWidth: palette.style.strokeWidth,
    ...iconProps,
  };

  // Apply fill if palette uses it
  if (palette.style.fill && palette.style.fill !== 'none') {
    if (palette.style.fill === 'currentColor') {
      styleProps.fill = iconColor;
      styleProps.fillOpacity = palette.style.fillOpacity || 1;
    } else {
      styleProps.fill = palette.style.fill;
      styleProps.fillOpacity = palette.style.fillOpacity;
    }
  }

  // Apply glow effect if enabled
  const shouldGlow = palette.glowEffect && palette.glowIntensity && palette.glowIntensity > 0;
  
  if (shouldGlow) {
    return (
      <View style={[
        styles.glowContainer,
        {
          shadowColor: iconColor,
          shadowOpacity: palette.glowIntensity || 0.6,
        }
      ]}>
        <Icon {...styleProps} />
      </View>
    );
  }

  return <Icon {...styleProps} />;
}

const styles = StyleSheet.create({
  glowContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
});
