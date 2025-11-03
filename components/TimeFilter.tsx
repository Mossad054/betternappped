import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TimeRange = 'today' | 'week' | 'month' | 'year';

interface TimeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRanges: { key: TimeRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

export default function TimeFilter({ selectedRange, onRangeChange }: TimeFilterProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.container}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.filterButton,
            selectedRange === range.key && styles.activeFilterButton,
          ]}
          onPress={() => onRangeChange(range.key)}
        >
          <Text
            style={[
              styles.filterText,
              selectedRange === range.key && styles.activeFilterText,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.md,
    padding: theme.spacing.xs,
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.screenVertical,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.elementGap,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    ...theme.elevation.small,
  },
  filterText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  activeFilterText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});