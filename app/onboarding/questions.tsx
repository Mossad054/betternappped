import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingTheme } from '@/constants/onboardingTheme';

interface Question {
  id: string;
  goalType: string;
  text: string;
  options: { value: string; label: string }[];
}

// Adaptive questions based on selected goals
const QUESTIONS_BY_GOAL: Record<string, Question[]> = {
  sleep: [
    {
      id: 'sleep_issue',
      goalType: 'sleep',
      text: 'What sleep challenge affects you most?',
      options: [
        { value: 'falling_asleep', label: 'Falling asleep' },
        { value: 'staying_asleep', label: 'Staying asleep' },
        { value: 'waking_tired', label: 'Waking up tired' },
        { value: 'irregular_schedule', label: 'Irregular schedule' },
      ],
    },
    {
      id: 'sleep_hours',
      goalType: 'sleep',
      text: 'How many hours of sleep do you typically get?',
      options: [
        { value: 'less_5', label: 'Less than 5 hours' },
        { value: '5_6', label: '5-6 hours' },
        { value: '6_7', label: '6-7 hours' },
        { value: '7_plus', label: '7+ hours' },
      ],
    },
  ],
  energy: [
    {
      id: 'energy_time',
      goalType: 'energy',
      text: 'When do you feel most drained?',
      options: [
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon slump' },
        { value: 'evening', label: 'After work' },
        { value: 'all_day', label: 'All day' },
      ],
    },
    {
      id: 'caffeine_use',
      goalType: 'energy',
      text: 'How much caffeine do you consume daily?',
      options: [
        { value: 'none', label: 'None' },
        { value: '1_2', label: '1-2 cups' },
        { value: '3_4', label: '3-4 cups' },
        { value: 'more', label: 'More than 4 cups' },
      ],
    },
  ],
  stress: [
    {
      id: 'stress_source',
      goalType: 'stress',
      text: 'What causes you the most stress?',
      options: [
        { value: 'work', label: 'Work/Career' },
        { value: 'relationships', label: 'Relationships' },
        { value: 'health', label: 'Health concerns' },
        { value: 'finances', label: 'Finances' },
      ],
    },
    {
      id: 'stress_coping',
      goalType: 'stress',
      text: 'How do you currently manage stress?',
      options: [
        { value: 'exercise', label: 'Exercise' },
        { value: 'meditation', label: 'Meditation' },
        { value: 'social', label: 'Talking to others' },
        { value: 'nothing', label: 'Not much yet' },
      ],
    },
  ],
  intimacy: [
    {
      id: 'intimacy_focus',
      goalType: 'intimacy',
      text: 'What would you like to improve?',
      options: [
        { value: 'communication', label: 'Communication' },
        { value: 'quality_time', label: 'Quality time together' },
        { value: 'physical', label: 'Physical connection' },
        { value: 'emotional', label: 'Emotional bonding' },
      ],
    },
    {
      id: 'relationship_status',
      goalType: 'intimacy',
      text: 'Your current relationship status?',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'dating', label: 'Dating' },
        { value: 'committed', label: 'In a committed relationship' },
        { value: 'married', label: 'Married/Long-term' },
      ],
    },
  ],
  clarity: [
    {
      id: 'clarity_challenge',
      goalType: 'clarity',
      text: 'What mental challenge do you face most?',
      options: [
        { value: 'focus', label: 'Staying focused' },
        { value: 'memory', label: 'Memory recall' },
        { value: 'brain_fog', label: 'Brain fog' },
        { value: 'overthinking', label: 'Overthinking' },
      ],
    },
    {
      id: 'work_type',
      goalType: 'clarity',
      text: 'What type of mental work do you do most?',
      options: [
        { value: 'creative', label: 'Creative work' },
        { value: 'analytical', label: 'Analytical/Numbers' },
        { value: 'communication', label: 'Communication/Writing' },
        { value: 'mixed', label: 'Mixed/Varied' },
      ],
    },
  ],
};

export default function QuestionsScreen() {
  const router = useRouter();
  const theme = OnboardingTheme;
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const goalsJson = await AsyncStorage.getItem('onboarding_goals');
      const selectedGoals = goalsJson ? JSON.parse(goalsJson) : [];

      // Build question list based on selected goals
      const allQuestions: Question[] = [];
      selectedGoals.forEach((goalId: string) => {
        if (QUESTIONS_BY_GOAL[goalId]) {
          allQuestions.push(...QUESTIONS_BY_GOAL[goalId]);
        }
      });

      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    if (!questions[currentIndex]) return;

    const newAnswers = {
      ...answers,
      [questions[currentIndex].id]: value,
    };
    setAnswers(newAnswers);

    // Auto-advance to next question or complete
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    try {
      // Store answers for program generation
      await AsyncStorage.setItem('onboarding_answers', JSON.stringify(answers));
      await AsyncStorage.setItem('onboarding_completed', 'true');

      // Navigate to auth
      router.push('/auth/auth');
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  };

  if (loading) {
    return (
      <GradientBackground useGradient={true}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // No questions (shouldn't happen, but fallback)
  if (questions.length === 0) {
    router.push('/auth/auth');
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = currentQuestion && answers[currentQuestion.id];

  return (
    <GradientBackground useGradient={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header with progress */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.border }
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${progress}%`,
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {currentIndex + 1} of {questions.length}
              </Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              {currentQuestion.text}
            </Text>
          </View>

          {/* Options */}
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleAnswer(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? theme.colors.primary : theme.colors.text,
                        fontWeight: isSelected ? '600' : '400',
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Continue button (only on last question) */}
          {isLastQuestion && hasAnswered && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleComplete}
              >
                <Text style={styles.continueButtonText}>Get Started</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
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
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  optionCard: {
    padding: 18,
    borderRadius: 16,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
