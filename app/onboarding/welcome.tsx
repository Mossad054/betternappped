import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import { OnboardingTheme } from '@/constants/onboardingTheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = OnboardingTheme;

  const handleNext = () => {
    router.push('/onboarding/track-wellness');
  };

  const handleSkip = () => {
    router.push('/onboarding/get-started');
  };

  return (
    <GradientBackground useGradient={true} gradientType="primary">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[
              styles.skipText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.body.fontWeight
              }
            ]}>
              Skip
            </Text>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: theme.colors.primaryLight + '40',
                borderRadius: theme.radii.circle
              }
            ]}>
              <Heart size={80} color={theme.colors.primary} />
            </View>

            <Text style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight
              }
            ]}>
              Welcome to Betternapped
            </Text>

            <Text style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.bodyLarge.fontSize,
                fontWeight: theme.typography.bodyLarge.fontWeight
              }
            ]}>
              Your personal wellness companion for tracking, experimenting, and optimizing your life
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.full,
                ...theme.shadows.md
              }
            ]}
            onPress={handleNext}
          >
            <Text style={[
              styles.nextButtonText,
              {
                color: '#FFFFFF',
                fontSize: theme.typography.button.fontSize,
                fontWeight: theme.typography.button.fontWeight
              }
            ]}>Get Started</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
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
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  nextButtonText: {
    marginRight: 8,
  },
});

