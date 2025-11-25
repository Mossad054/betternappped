import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, TrendingUp, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import { OnboardingTheme } from '@/constants/onboardingTheme';

export default function InsightsScreen() {
  const router = useRouter();
  const theme = OnboardingTheme;

  const handleNext = () => {
    router.push('/onboarding/experiments');
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
            <View style={styles.iconContainer}>
              <Brain size={80} color={theme.colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text }]}>
              AI-Powered Insights
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Discover patterns and correlations in your data to optimize your life
            </Text>

            {/* Insight Cards */}
            <View style={styles.insightsContainer}>
              <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                <TrendingUp size={32} color={theme.colors.primary} />
                <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                  Pattern Recognition
                </Text>
                <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
                  Identify trends in your mood, sleep, and activities
                </Text>
              </View>

              <View style={[styles.insightCard, { backgroundColor: theme.colors.card }]}>
                <Lightbulb size={32} color={theme.colors.primary} />
                <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                  Personalized Recommendations
                </Text>
                <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
                  Get actionable advice based on your unique patterns
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, styles.inactiveDot]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(209, 255, 78, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  insightsContainer: {
    width: '100%',
    gap: 16,
  },
  insightCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  insightDescription: {
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

