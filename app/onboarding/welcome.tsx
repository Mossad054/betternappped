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
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

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
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.medium
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
                backgroundColor: theme.colors.accent + '20',
                borderRadius: theme.borderRadius.full
              }
            ]}>
              <Heart size={80} color={theme.colors.accent} />
            </View>
            
            <Text style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.huge,
                fontWeight: theme.typography.fontWeight.bold
              }
            ]}>
              Welcome to Betternapped
            </Text>
            
            <Text style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.lg,
                fontWeight: theme.typography.fontWeight.regular
              }
            ]}>
              Your personal wellness companion for tracking, experimenting, and optimizing your life
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: theme.colors.accent }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.textSecondary + '30' }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.textSecondary + '30' }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.textSecondary + '30' }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.textSecondary + '30' }]} />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.colors.accent,
                borderRadius: theme.borderRadius.full,
                ...theme.shadows.button
              }
            ]}
            onPress={handleNext}
          >
            <Text style={[
              styles.nextButtonText,
              {
                color: theme.colors.textInverted,
                fontSize: theme.typography.md,
                fontWeight: theme.typography.fontWeight.semibold
              }
            ]}>Get Started</Text>
            <ArrowRight size={20} color={theme.colors.textInverted} />
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

