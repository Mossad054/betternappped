import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getActivityIcon } from '@/constants/activityIcons';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ActivityItem {
  id: string;
  name: string;
  selected: boolean;
}

interface ActivityIconGridProps {
  items: ActivityItem[];
  onActivitySelect: (activityId: string) => void;
  selectedIds: string[];
}

export default function ActivityIconGrid({ 
  items, 
  onActivitySelect,
  selectedIds 
}: ActivityIconGridProps) {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 12,
    },
    iconContainer: {
      width: '18%', // ~5 items per row (100% / 5 ≈ 19%, minus gaps)
      alignItems: 'center',
      marginBottom: 8,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      position: 'relative',
    },
    iconCircleSelected: {
      backgroundColor: 'rgba(77, 212, 172, 0.15)',
      borderWidth: 2,
      borderColor: theme.colors.primary || '#4DD4AC',
    },
    checkmark: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: 14,
    },
    labelSelected: {
      color: theme.colors.primary || '#4DD4AC',
      fontWeight: '600',
    },
  });
  
  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const IconComponent = getActivityIcon(item.id);
        const isSelected = selectedIds.includes(item.id);
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.iconContainer}
            onPress={() => onActivitySelect(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
              <IconComponent 
                size={28} 
                color={isSelected ? (theme.colors.primary || "#4DD4AC") : theme.colors.textSecondary} 
                strokeWidth={2}
              />
              {isSelected && (
                <View style={styles.checkmark}>
                  <Check size={14} color={theme.colors.primary || "#4DD4AC"} />
                </View>
              )}
            </View>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
