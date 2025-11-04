import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface FloatingAddButtonProps {
  onPress?: () => void;
}

export default function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isGuest } = useAuth();
  const { theme } = useTheme();

  const handlePress = () => {
    if (isGuest) {
      Alert.alert(
        'Sign Up Required',
        'Please sign up to add your own entries and track your wellness journey!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => router.push('/auth/auth') }
        ]
      );
      return;
    }

    if (onPress) {
      onPress();
    } else {
      router.push('/add-entry');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          bottom: insets.bottom + theme.spacing.lg,
          right: theme.spacing.lg,
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.full,
          ...theme.shadows.medium,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel="Add new entry"
      accessibilityRole="button"
      accessibilityHint="Opens the add entry form to log your daily activities and mood"
    >
      <Plus size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});