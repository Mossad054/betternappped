/**
 * Modern Time Picker Component
 *
 * A beautiful, minimalist time picker inspired by Apple Bedtime Clock and Google Clock Material You.
 * Features:
 * - Touch-optimized clock dial interface
 * - Smooth animations and haptic feedback
 * - 12h/24h format support
 * - Dark/light theme support
 * - Responsive design for all screen sizes
 * - Accessible tap targets (minimum 44x44pt)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing based on screen width
const CLOCK_SIZE = Math.min(SCREEN_WIDTH * 0.7, 300);
const CENTER_CIRCLE_SIZE = 60;
const NUMBER_SIZE = 44; // Accessible tap target size

export interface TimeValue {
  hour: number;
  minute: number;
}

interface ModernTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: TimeValue) => void;
  initialTime?: TimeValue;
  is24Hour?: boolean;
  title?: string;
}

export default function ModernTimePicker({
  visible,
  onClose,
  onConfirm,
  initialTime = { hour: 9, minute: 0 },
  is24Hour = false,
  title = 'Select Time',
}: ModernTimePickerProps) {
  const { theme } = useTheme();
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [isPM, setIsPM] = useState(initialTime.hour >= 12);
  const [selecting, setSelecting] = useState<'hour' | 'minute'>('hour');

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setHour(initialTime.hour);
      setMinute(initialTime.minute);
      setIsPM(initialTime.hour >= 12);
      setSelecting('hour');

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getDisplayHour = () => {
    if (is24Hour) {
      return hour;
    }
    const h = hour % 12;
    return h === 0 ? 12 : h;
  };

  const getHourNumbers = () => {
    if (is24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    }
    return Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  };

  const getMinuteNumbers = () => {
    return Array.from({ length: 12 }, (_, i) => i * 5);
  };

  const handleHourSelect = (selectedHour: number) => {
    triggerHaptic();
    let actualHour = selectedHour;

    if (!is24Hour) {
      if (selectedHour === 12) {
        actualHour = isPM ? 12 : 0;
      } else {
        actualHour = isPM ? selectedHour + 12 : selectedHour;
      }
    }

    setHour(actualHour);
    setSelecting('minute');
  };

  const handleMinuteSelect = (selectedMinute: number) => {
    triggerHaptic();
    setMinute(selectedMinute);
  };

  const handleConfirm = () => {
    triggerHaptic();
    onConfirm({ hour, minute });
    handleClose();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const renderClockDial = () => {
    const numbers = selecting === 'hour' ? getHourNumbers() : getMinuteNumbers();
    const radius = (CLOCK_SIZE - NUMBER_SIZE) / 2;
    const centerX = CLOCK_SIZE / 2;
    const centerY = CLOCK_SIZE / 2;

    return (
      <View style={[styles.clockContainer, { width: CLOCK_SIZE, height: CLOCK_SIZE }]}>
        {/* Clock circle background */}
        <View
          style={[
            styles.clockCircle,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
        />

        {/* Hour/Minute numbers */}
        {numbers.map((num, index) => {
          const angle = (index * 360) / numbers.length - 90;
          const radian = (angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(radian) - NUMBER_SIZE / 2;
          const y = centerY + radius * Math.sin(radian) - NUMBER_SIZE / 2;

          const isSelected = selecting === 'hour'
            ? (is24Hour ? num === hour : num === getDisplayHour())
            : num === minute;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberButton,
                {
                  left: x,
                  top: y,
                  width: NUMBER_SIZE,
                  height: NUMBER_SIZE,
                  backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                },
              ]}
              onPress={() => {
                if (selecting === 'hour') {
                  handleHourSelect(num);
                } else {
                  handleMinuteSelect(num);
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.numberText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {num.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Center circle */}
        <View
          style={[
            styles.centerCircle,
            {
              backgroundColor: theme.colors.primary,
              width: CENTER_CIRCLE_SIZE,
              height: CENTER_CIRCLE_SIZE,
              borderRadius: CENTER_CIRCLE_SIZE / 2,
            },
          ]}
        >
          <Text style={[styles.centerTime, { fontSize: theme.typography.fontSize.xl }]}>
            {getDisplayHour().toString().padStart(2, '0')}
            <Text style={{ opacity: 0.5 }}>:</Text>
            {minute.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.card,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              {title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <TouchableOpacity
              style={[
                styles.timeSegment,
                selecting === 'hour' && [styles.timeSegmentActive, { backgroundColor: theme.colors.primary + '20' }],
              ]}
              onPress={() => {
                triggerHaptic();
                setSelecting('hour');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeText,
                  {
                    color: selecting === 'hour' ? theme.colors.primary : theme.colors.text,
                    fontSize: theme.typography.fontSize.huge || 48,
                    fontWeight: '700',
                  },
                ]}
              >
                {getDisplayHour().toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.timeSeparator,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.huge || 48,
                },
              ]}
            >
              :
            </Text>

            <TouchableOpacity
              style={[
                styles.timeSegment,
                selecting === 'minute' && [styles.timeSegmentActive, { backgroundColor: theme.colors.primary + '20' }],
              ]}
              onPress={() => {
                triggerHaptic();
                setSelecting('minute');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeText,
                  {
                    color: selecting === 'minute' ? theme.colors.primary : theme.colors.text,
                    fontSize: theme.typography.fontSize.huge || 48,
                    fontWeight: '700',
                  },
                ]}
              >
                {minute.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>

            {!is24Hour && (
              <View style={styles.ampmContainer}>
                <TouchableOpacity
                  style={[
                    styles.ampmButton,
                    !isPM && [styles.ampmButtonActive, { backgroundColor: theme.colors.primary }],
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setIsPM(false);
                    if (hour >= 12) setHour(hour - 12);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.ampmText,
                      {
                        color: !isPM ? '#FFFFFF' : theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: !isPM ? '700' : '500',
                      },
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ampmButton,
                    isPM && [styles.ampmButtonActive, { backgroundColor: theme.colors.primary }],
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setIsPM(true);
                    if (hour < 12) setHour(hour + 12);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.ampmText,
                      {
                        color: isPM ? '#FFFFFF' : theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: isPM ? '700' : '500',
                      },
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Selection Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selecting === 'hour' && [styles.modeButtonActive, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => {
                triggerHaptic();
                setSelecting('hour');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: selecting === 'hour' ? '#FFFFFF' : theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: selecting === 'hour' ? '600' : '500',
                  },
                ]}
              >
                Hour
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selecting === 'minute' && [styles.modeButtonActive, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => {
                triggerHaptic();
                setSelecting('minute');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: selecting === 'minute' ? '#FFFFFF' : theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: selecting === 'minute' ? '600' : '500',
                  },
                ]}
              >
                Minute
              </Text>
            </TouchableOpacity>
          </View>

          {/* Clock Dial */}
          {renderClockDial()}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: '#FFFFFF',
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: Math.min(SCREEN_WIDTH - 40, 400),
    maxHeight: SCREEN_HEIGHT - 100,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  timeSegment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timeSegmentActive: {
    backgroundColor: '#3B82F610',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: '300',
    opacity: 0.5,
  },
  ampmContainer: {
    marginLeft: 12,
    gap: 8,
  },
  ampmButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  ampmButtonActive: {
    backgroundColor: '#3B82F6',
  },
  ampmText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  modeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clockContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  clockCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderWidth: 2,
    position: 'absolute',
  },
  numberButton: {
    position: 'absolute',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '500',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  centerTime: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
