import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface ExperimentPillProps {
  /** Experiment name/title */
  title: string;
  /** Emoji or icon representing the experiment */
  emoji?: string;
  /** Whether the pill is selected/active */
  selected?: boolean;
  /** Callback when pill is pressed */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Full width pill */
  fullWidth?: boolean;
  /** Show badge with number */
  badge?: number;
  /** Additional styles for container */
  style?: ViewStyle;
}

/**
 * ExperimentPill - Reusable pill component for experiment displays
 *
 * Features:
 * - Proper text wrapping for long titles
 * - Icon/emoji support with consistent spacing
 * - Multiple size variants
 * - Selected/unselected states
 * - Responsive sizing
 * - Prevents text overflow
 */
export function ExperimentPill({
  title,
  emoji,
  selected = false,
  onPress,
  disabled = false,
  size = 'medium',
  backgroundColor,
  textColor,
  fullWidth = false,
  badge,
  style,
}: ExperimentPillProps) {
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 13,
      emojiSize: 16,
      minHeight: 32,
      borderRadius: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 15,
      emojiSize: 20,
      minHeight: 44,
      borderRadius: 22,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      fontSize: 16,
      emojiSize: 24,
      minHeight: 52,
      borderRadius: 26,
    },
  };

  const config = sizeConfig[size];

  // Determine background color
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    if (disabled) return theme.colors.border;
    if (selected) return theme.colors.primary;
    return theme.colors.card;
  };

  // Determine text color
  const getTextColor = () => {
    if (textColor) return textColor;
    if (disabled) return theme.colors.textTertiary;
    if (selected) return '#FFFFFF';
    return theme.colors.text;
  };

  // Determine border color
  const getBorderColor = () => {
    if (selected) return theme.colors.primary;
    return theme.colors.border;
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: selected ? 2 : 1,
    borderRadius: config.borderRadius,
    paddingVertical: config.paddingVertical,
    paddingHorizontal: config.paddingHorizontal,
    minHeight: config.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    ...(fullWidth && { width: '100%' }),
    ...style,
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontSize: config.fontSize,
    fontWeight: '600',
    lineHeight: config.fontSize * 1.4,
    flexShrink: 1,
    flexWrap: 'wrap',
  };

  const emojiStyle: TextStyle = {
    fontSize: config.emojiSize,
    marginRight: emoji ? 8 : 0,
  };

  const content = (
    <View style={styles.contentContainer}>
      {emoji && <Text style={emojiStyle}>{emoji}</Text>}
      <Text style={textStyle} numberOfLines={3} ellipsizeMode="tail">
        {title}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
