import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Activity, Moon, Brain, ArrowRight, ArrowLeft } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';

export default function TrackWellnessScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const handleNext = () => {
    router.push('/onboarding/insights');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.push('/onboarding/get-started');
  };

  return (
    <GradientBackground useGradient={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Track Your Wellness
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Comprehensive tracking across all aspects of your life
            </Text>

            {/* Feature Cards */}
            <View style={styles.featuresContainer}>
              <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.featureIcon}>
                  <Brain size={32} color={theme.colors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Mood Tracking
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Log your daily emotions and mental state
                </Text>
              </View>

              <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.featureIcon}>
                  <Moon size={32} color={theme.colors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Sleep Analysis
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Monitor sleep patterns and quality
                </Text>
              </View>

              <View style={[styles.featureCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.featureIcon}>
                  <Activity size={32} color={theme.colors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  Activity Logging
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  Track workouts, work, and daily activities
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.border }]}
              onPress={handleBack}
            >
              <ArrowLeft size={20} color={theme.colors.text} />
              <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter',
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(209, 255, 78, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inactiveDot: {
    backgroundColor: 'rgba(110, 110, 115, 0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: '#D1FF4E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

