// Programme Enrollment Invitation Modal
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Award, BookOpen, TrendingUp, X } from 'lucide-react-native';

interface ProgrammeEnrollmentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  poorSleepNights?: number;
  averageQuality?: number;
}

export default function ProgrammeEnrollmentModal({
  visible,
  onAccept,
  onDecline,
  poorSleepNights = 3,
  averageQuality = 2.5,
}: ProgrammeEnrollmentModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onDecline}
          >
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <BookOpen size={48} color={theme.colors.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Join Our Sleep Improvement Programme
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            We've noticed your sleep has been below target for the last{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {poorSleepNights} nights
            </Text>
            . Would you like a personalised 4-week programme to guide you step-by-step?
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <BookOpen size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Weekly Lessons
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  One lesson per week with practical habits
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <TrendingUp size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Daily Check-Ins
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  Track your progress with gentle reminders
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Award size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Weekly Reviews
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>
                  See your improvements and earn badges
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onAccept}
            >
              <Text style={styles.primaryButtonText}>Yes, Let's Do It!</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={onDecline}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                Not Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={[styles.footerNote, { color: theme.colors.textSecondary }]}>
            You can pause or stop the programme at any time
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    gap: 16,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
