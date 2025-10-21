import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimeRange } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';

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
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.filterButton,
            selectedRange === range.key && [styles.activeFilterButton, { backgroundColor: theme.colors.primary }],
          ]}
          onPress={() => onRangeChange(range.key)}
        >
          <Text
            style={[
              styles.filterText,
              { color: selectedRange === range.key ? theme.colors.text : theme.colors.textSecondary },
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#1F2937',
    fontWeight: '600',
  },
});