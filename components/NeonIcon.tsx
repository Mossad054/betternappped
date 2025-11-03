import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface NeonIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  glowColor?: string;
  withGlow?: boolean;
}

export default function NeonIcon({ 
  Icon, 
  size = 24, 
  color,
  glowColor,
  withGlow = true 
}: NeonIconProps) {
  const { theme } = useTheme();
  
  const iconColor = color || theme.colors.accent;
  const iconGlowColor = glowColor || theme.colors.accent;
  
  return (
    <View style={withGlow && [styles.glowContainer, { shadowColor: iconGlowColor }]}>
      <Icon size={size} color={iconColor} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
});

