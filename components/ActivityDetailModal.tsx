import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import PostActivityFeeling from './PostActivityFeeling';
import { shouldAskDuration, shouldAskIntensity } from '@/constants/activityFeelings';

interface ActivityDetailModalProps {
  visible: boolean;
  activityId: string;
  activityName: string;
  categoryId: string;
  onSave: (details: ActivityDetails) => void;
  onCancel: () => void;
}

export interface ActivityDetails {
  duration?: number;
  intensity?: number;
  notes?: string;
  postActivityFeeling?: string;
}

export default function ActivityDetailModal({
  visible,
  activityId,
  activityName,
  categoryId,
  onSave,
  onCancel,
}: ActivityDetailModalProps) {
  const { theme } = useTheme();
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [postActivityFeeling, setPostActivityFeeling] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState<boolean>(false);

  const handleSave = () => {
    const details: ActivityDetails = {
      duration: showDuration ? duration : undefined,
      intensity: showIntensity ? intensity : undefined,
      notes: notes || undefined,
      postActivityFeeling: postActivityFeeling || undefined,
    };

    onSave(details);
  };

  // Use smart helper functions to determine which fields to show
  const showDuration = shouldAskDuration(categoryId, activityId);
  const showIntensity = shouldAskIntensity(categoryId, activityId);
  const isWeatherActivity = categoryId === 'weather';

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 32,
      maxHeight: '85%',
      minHeight: 300,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    fieldContainer: {
      marginBottom: 24,
    },
    fieldLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    durationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    durationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    durationButtonText: {
      fontSize: 24,
      color: theme.colors.primary || '#4DD4AC',
      fontWeight: '600',
    },
    durationInput: {
      width: 80,
      height: 44,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    presetButtonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
    },
    presetButton: {
      minWidth: 80,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetButtonActive: {
      backgroundColor: theme.colors.primary + '20' || 'rgba(77, 212, 172, 0.2)',
      borderColor: theme.colors.primary || '#4DD4AC',
    },
    presetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    presetButtonTextActive: {
      color: theme.colors.primary || '#4DD4AC',
    },
    customLinkContainer: {
      marginTop: 12,
      alignItems: 'center',
    },
    customLink: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary || '#4DD4AC',
      textDecorationLine: 'underline',
    },
    intensitySlider: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    intensityDot: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    intensityDotActive: {
      backgroundColor: theme.colors.primary || '#4DD4AC',
      borderColor: theme.colors.primary || '#4DD4AC',
    },
    intensityText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textTertiary,
    },
    intensityTextActive: {
      color: '#FFFFFF',
    },
    intensityLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    intensityLabelText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    notesInput: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      fontSize: 16,
      color: theme.colors.textPrimary,
      minHeight: 80,
    },
    charCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
      marginTop: 6,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.primary || '#4DD4AC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.mode === 'dark' ? theme.colors.textPrimary : '#0F0F0F',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{activityName}</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Post-Activity Feeling - Always show first for quick feedback */}
              <PostActivityFeeling
                categoryId={categoryId}
                selectedFeeling={postActivityFeeling}
                onFeelingSelect={setPostActivityFeeling}
              />

              {/* Duration - Only for relevant activities */}
              {showDuration && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Duration</Text>

                  {!customDuration ? (
                    <>
                      <View style={styles.presetButtonsContainer}>
                        {[
                          { label: '30 mins', value: 30 },
                          { label: '1 hr', value: 60 },
                          { label: '2 hrs', value: 120 },
                          { label: '3 hrs', value: 180 },
                          { label: '3+ hrs', value: 240 },
                        ].map((preset) => (
                          <TouchableOpacity
                            key={preset.value}
                            style={[
                              styles.presetButton,
                              duration === preset.value && styles.presetButtonActive,
                            ]}
                            onPress={() => setDuration(preset.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.presetButtonText,
                                duration === preset.value && styles.presetButtonTextActive,
                              ]}
                            >
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.customLinkContainer}>
                        <TouchableOpacity onPress={() => setCustomDuration(true)}>
                          <Text style={styles.customLink}>Custom duration</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.durationControls}>
                        <TouchableOpacity
                          style={styles.durationButton}
                          onPress={() => setDuration(Math.max(30, duration - 30))}
                        >
                          <Text style={styles.durationButtonText}>−</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.durationInput}
                          value={duration.toString()}
                          onChangeText={(text) => setDuration(parseInt(text) || 30)}
                          keyboardType="numeric"
                          placeholderTextColor={theme.colors.textTertiary}
                        />
                        <TouchableOpacity
                          style={styles.durationButton}
                          onPress={() => setDuration(duration + 30)}
                        >
                          <Text style={styles.durationButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.customLinkContainer}>
                        <TouchableOpacity onPress={() => setCustomDuration(false)}>
                          <Text style={styles.customLink}>Use presets</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Intensity - Only for relevant activities */}
              {showIntensity && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Intensity</Text>
                  <View style={styles.intensitySlider}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.intensityDot,
                          intensity === level && styles.intensityDotActive,
                        ]}
                        onPress={() => setIntensity(level)}
                      >
                        <Text
                          style={[
                            styles.intensityText,
                            intensity === level && styles.intensityTextActive,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.intensityLabels}>
                    <Text style={styles.intensityLabelText}>Light</Text>
                    <Text style={styles.intensityLabelText}>Intense</Text>
                  </View>
                </View>
              )}

              {/* Notes (Optional) */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  {isWeatherActivity ? 'How did it affect you?' : 'Notes (optional)'}
                </Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder={
                    isWeatherActivity 
                      ? "e.g., 'Made me feel energized' or 'Hard to sleep in the heat'"
                      : "Add any relevant notes..."
                  }
                  placeholderTextColor={theme.colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{notes.length}/200</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
