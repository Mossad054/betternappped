import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Removed Colors import - using hardcoded values

interface FloatingAddButtonProps {
  onPress?: () => void;
}

export default function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
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
          bottom: insets.bottom + 20,
          right: 20,
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
    borderRadius: 28,
    backgroundColor: '#34B27B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34B27B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
});