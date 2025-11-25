import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Zap, Brain, Heart, Sparkles, ArrowRight, Check } from 'lucide-react-native';
import GradientBackground from '@/components/GradientBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingTheme } from '@/constants/onboardingTheme';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function GoalsScreen() {
  const router = useRouter();
  const theme = OnboardingTheme;
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<string | null>(null);

  const goals: Goal[] = [
    {
      id: 'sleep',
      title: 'Better Sleep',
      description: 'Improve sleep quality and wake up refreshed',
      icon: <Moon size={28} color={theme.colors.primary} />,
      color: '#6366F1',
    },
    {
      id: 'energy',
      title: 'More Energy',
      description: 'Feel energized throughout the day',
      icon: <Zap size={28} color="#F59E0B" />,
      color: '#F59E0B',
    },
    {
      id: 'stress',
      title: 'Reduce Stress',
      description: 'Manage stress and find calm',
      icon: <Sparkles size={28} color="#10B981" />,
      color: '#10B981',
    },
    {
      id: 'intimacy',
      title: 'Better Connection',
      description: 'Strengthen relationships and intimacy',
      icon: <Heart size={28} color="#EC4899" />,
      color: '#EC4899',
    },
    {
      id: 'clarity',
      title: 'Mental Clarity',
      description: 'Sharpen focus and mental performance',
      icon: <Brain size={28} color="#8B5CF6" />,
      color: '#8B5CF6',
    },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        // Removing goal
        if (primaryGoal === goalId) {
          setPrimaryGoal(null);
        }
        return prev.filter(id => id !== goalId);
      } else {
        // Adding goal
        const newGoals = [...prev, goalId];
        // Set as primary if it's the first goal
        if (newGoals.length === 1) {
          setPrimaryGoal(goalId);
        }
        return newGoals;
      }
    });
  };

  const setPrimary = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setPrimaryGoal(goalId);
    }
  };

  const handleNext = async () => {
    // Store goals temporarily for the adaptive questions screen
    await AsyncStorage.setItem('onboarding_goals', JSON.stringify(selectedGoals));
    await AsyncStorage.setItem('onboarding_primary_goal', primaryGoal || selectedGoals[0]);

    // Navigate to adaptive questions
    router.push('/onboarding/questions');
  };

  const canProceed = selectedGoals.length > 0;

  return (
    <GradientBackground useGradient={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              What are your goals?
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Select all that apply. Tap again to set your primary goal.
            </Text>
          </View>

          {/* Goals List */}
          <ScrollView
            style={styles.goalsContainer}
            contentContainerStyle={styles.goalsContent}
            showsVerticalScrollIndicator={false}
          >
            {goals.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              const isPrimary = primaryGoal === goal.id;

              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: isSelected ? goal.color : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    isPrimary && { borderWidth: 3 }
                  ]}
                  onPress={() => isSelected ? setPrimary(goal.id) : toggleGoal(goal.id)}
                  onLongPress={() => toggleGoal(goal.id)}
                >
                  <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                    {goal.icon}
                  </View>

                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: theme.colors.text }]}>
                      {goal.title}
                    </Text>
                    <Text style={[styles.goalDescription, { color: theme.colors.textSecondary }]}>
                      {goal.description}
                    </Text>
                  </View>

                  <View style={styles.goalStatus}>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: goal.color }]}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                    {isPrimary && (
                      <Text style={[styles.primaryBadge, { color: goal.color }]}>
                        Primary
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Next Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor: canProceed ? theme.colors.primary : theme.colors.border,
                  opacity: canProceed ? 1 : 0.5,
                }
              ]}
              onPress={handleNext}
              disabled={!canProceed}
            >
              <Text style={[styles.nextButtonText, { color: canProceed ? '#FFFFFF' : theme.colors.textSecondary }]}>
                Continue
              </Text>
              <ArrowRight size={20} color={canProceed ? '#FFFFFF' : theme.colors.textSecondary} />
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  goalsContainer: {
    flex: 1,
  },
  goalsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
  },
  goalStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
