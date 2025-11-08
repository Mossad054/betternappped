// Daily Habit Check-In Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react-native';
import { CheckInResponse, SkipReason } from '@/services/SleepProgrammeService';

interface DailyCheckInModalProps {
  visible: boolean;
  habitName: string;
  habitIcon: string;
  onComplete: (response: CheckInResponse, skipReason?: SkipReason, notes?: string) => void;
  onClose: () => void;
}

export default function DailyCheckInModal({
  visible,
  habitName,
  habitIcon,
  onComplete,
  onClose,
}: DailyCheckInModalProps) {
  const { theme } = useTheme();
  const [selectedResponse, setSelectedResponse] = useState<CheckInResponse | null>(null);
  const [showBarrierPrompt, setShowBarrierPrompt] = useState(false);
  const [selectedBarrier, setSelectedBarrier] = useState<SkipReason | null>(null);

  const handleResponseSelect = (response: CheckInResponse) => {
    setSelectedResponse(response);

    if (response === 'completed') {
      // Show success message and complete
      onComplete(response);
      resetAndClose();
    } else {
      // Show barrier prompt for attempted/skipped
      setShowBarrierPrompt(true);
    }
  };

  const handleBarrierSelect = (reason: SkipReason) => {
    setSelectedBarrier(reason);
  };

  const handleSubmit = () => {
    if (selectedResponse && selectedResponse !== 'completed') {
      onComplete(selectedResponse, selectedBarrier || undefined);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setTimeout(() => {
      setSelectedResponse(null);
      setShowBarrierPrompt(false);
      setSelectedBarrier(null);
      onClose();
    }, 300);
  };

  const barrierOptions: { value: SkipReason; label: string; emoji: string }[] = [
    { value: 'forgot', label: 'I forgot', emoji: '🤔' },
    { value: 'busy', label: 'I was too busy', emoji: '⏰' },
    { value: 'environment', label: 'Environment wasn\'t right', emoji: '🏠' },
    { value: 'other', label: 'Other reason', emoji: '💭' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {!showBarrierPrompt ? (
            // Main Check-In Screen
            <>
              {/* Header */}
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={styles.habitIcon}>{habitIcon}</Text>
              </View>

              <Text style={[styles.title, { color: theme.colors.text }]}>
                Today's Task
              </Text>

              <Text style={[styles.habitName, { color: theme.colors.primary }]}>
                {habitName}
              </Text>

              <Text style={[styles.question, { color: theme.colors.textSecondary }]}>
                How did you do today?
              </Text>

              {/* Response Options */}
              <View style={styles.responseOptions}>
                <TouchableOpacity
                  style={[
                    styles.responseOption,
                    { backgroundColor: '#10B981' + '15', borderColor: '#10B981' },
                  ]}
                  onPress={() => handleResponseSelect('completed')}
                >
                  <CheckCircle2 size={32} color="#10B981" />
                  <Text style={[styles.responseLabel, { color: '#10B981' }]}>
                    I completed the task
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.responseOption,
                    { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' },
                  ]}
                  onPress={() => handleResponseSelect('attempted')}
                >
                  <AlertCircle size={32} color="#F59E0B" />
                  <Text style={[styles.responseLabel, { color: '#F59E0B' }]}>
                    I attempted, but did not complete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.responseOption,
                    { backgroundColor: '#EF4444' + '15', borderColor: '#EF4444' },
                  ]}
                  onPress={() => handleResponseSelect('skipped')}
                >
                  <XCircle size={32} color="#EF4444" />
                  <Text style={[styles.responseLabel, { color: '#EF4444' }]}>
                    I skipped today
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Barrier Prompt Screen
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.barrierTitle, { color: theme.colors.text }]}>
                No worries — what was the barrier?
              </Text>

              <Text style={[styles.barrierSubtitle, { color: theme.colors.textSecondary }]}>
                Let's pick one thing to adjust
              </Text>

              <View style={styles.barrierOptions}>
                {barrierOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.barrierOption,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor:
                          selectedBarrier === option.value
                            ? theme.colors.primary
                            : theme.colors.border,
                        borderWidth: selectedBarrier === option.value ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleBarrierSelect(option.value)}
                  >
                    <Text style={styles.barrierEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.barrierLabel,
                        {
                          color:
                            selectedBarrier === option.value
                              ? theme.colors.primary
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: selectedBarrier ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!selectedBarrier}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>

              <Text style={[styles.encouragement, { color: theme.colors.textSecondary }]}>
                Thanks for sharing — we'll keep supporting you. 💙
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  habitIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  habitName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  question: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
  },
  responseOptions: {
    gap: 12,
  },
  responseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  responseLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  barrierTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  barrierSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  barrierOptions: {
    gap: 12,
    marginBottom: 24,
  },
  barrierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
  },
  barrierEmoji: {
    fontSize: 28,
  },
  barrierLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  encouragement: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
