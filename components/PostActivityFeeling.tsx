import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Feeling, getFeelingsForActivity } from '@/constants/activityFeelings';

interface PostActivityFeelingProps {
  categoryId: string;
  selectedFeeling: string | null;
  onFeelingSelect: (feelingId: string) => void;
}

/**
 * Smart post-activity feeling selector
 * Displays context-aware emotions based on activity category
 * Quick, emoji-based interface for minimal friction
 */
export default function PostActivityFeeling({
  categoryId,
  selectedFeeling,
  onFeelingSelect,
}: PostActivityFeelingProps) {
  const { theme } = useTheme();

  const config = getFeelingsForActivity(categoryId);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    question: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    feelingsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    feelingButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 80,
      gap: 6,
    },
    feelingButtonSelected: {
      backgroundColor: theme.colors.primary ? `${theme.colors.primary}15` : 'rgba(77, 212, 172, 0.15)',
      borderColor: theme.colors.primary || '#4DD4AC',
    },
    emoji: {
      fontSize: 28,
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    labelSelected: {
      color: theme.colors.primary || '#4DD4AC',
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{config.question}</Text>
      <View style={styles.feelingsGrid}>
        {config.feelings.map((feeling: Feeling) => (
          <TouchableOpacity
            key={feeling.id}
            style={[
              styles.feelingButton,
              selectedFeeling === feeling.id && styles.feelingButtonSelected,
            ]}
            onPress={() => onFeelingSelect(feeling.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{feeling.emoji}</Text>
            <Text
              style={[
                styles.label,
                selectedFeeling === feeling.id && styles.labelSelected,
              ]}
            >
              {feeling.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
