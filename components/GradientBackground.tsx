import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: any;
  useGradient?: boolean;
  gradientType?: 'background' | 'primary' | 'secondary' | 'warm' | 'cool' | 'accent' | 'peach' | 'sunset' | 'calm' | 'energy' | 'dark' | 'button' | 'card';
}

export default function GradientBackground({ 
  children, 
  style, 
  useGradient = true, // Default to gradient for design system consistency
  gradientType = 'background' // Use background gradient by default
}: GradientBackgroundProps) {
  const { theme } = useTheme();
  
  // Use solid background when gradient is disabled
  if (!useGradient) {
    return (
      <View style={[styles.solidBackground, { backgroundColor: theme.colors.background }, style]}>
        {children}
      </View>
    );
  }

  // Get gradient colors from theme
  const gradientColors = theme.gradients[gradientType];
  
  // Get gradient configuration for proper rendering
  const gradientConfig = theme.getLinearGradientProps(gradientType as any);

  return (
    <LinearGradient
      colors={gradientConfig.colors}
      start={gradientConfig.start}
      end={gradientConfig.end}
      locations={gradientConfig.colors.length === 3 ? [0, 0.5, 1] : [0, 1]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  solidBackground: {
    flex: 1,
  },
});

