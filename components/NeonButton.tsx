import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface NeonButtonProps {
  onPress: () => void;
  icon?: React.ReactNode;
  size?: number;
}

export default function NeonButton({ 
  onPress, 
  icon, 
  size = 40 
}: NeonButtonProps) {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[
        styles.button, 
        { 
          width: size, 
          height: size,
          backgroundColor: theme.colors.accent,
          borderRadius: theme.borderRadius.full,
          ...theme.shadows.button
        }
      ]}>
        {icon || <Plus size={20} color={theme.colors.textInverted} strokeWidth={2.5} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

