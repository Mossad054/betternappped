import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Brain,
  X,
  Target,
  Zap,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';
import { Typography } from '@/constants/Typography';

interface TestCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  duration: string;
  route: string;
}

export default function MentalClarityTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [clarityIndex, setClarityIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadDailyProgress();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadDailyProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const completion = await MentalClarityService.checkDailyCompletion(user.id, today);
    setCompletedTests(completion.completed as string[]);

    if (completion.allCompleted) {
      const { data } = await MentalClarityService.getLatestClarityIndex(user.id);
      if (data) {
        setClarityIndex(data.combined_score);
      }
    }

    setLoading(false);
  };

  const tests: TestCard[] = [
    {
      id: 'focus',
      title: 'Focus Test',
      description: 'Measure sustained attention and response inhibition',
      icon: <Target size={28} color="#8B5CF6" />,
      color: '#8B5CF6',
      duration: '90 sec',
      route: '/tests/focus-test',
    },
    {
      id: 'flexibility',
      title: 'Mental Flexibility',
      description: 'Test cognitive adaptability and rule switching',
      icon: <TrendingUp size={28} color="#EC4899" />,
      color: '#EC4899',
      duration: '60 sec',
      route: '/tests/flexibility-test',
    },
    {
      id: 'speed',
      title: 'Processing Speed',
      description: 'Assess quick thinking and pattern recognition',
      icon: <Zap size={28} color="#F59E0B" />,
      color: '#F59E0B',
      duration: '45 sec',
      route: '/tests/speed-test',
    },
    {
      id: 'memory',
      title: 'Working Memory',
      description: 'Evaluate short-term recall under pressure',
      icon: <Brain size={28} color="#10B981" />,
      color: '#10B981',
      duration: '60 sec',
      route: '/tests/memory-test',
    },
    {
      id: 'subjective',
      title: 'Self Check-In',
      description: 'Rate your perceived mental clarity',
      icon: <Sparkles size={28} color="#3B82F6" />,
      color: '#3B82F6',
      duration: '30 sec',
      route: '/tests/subjective-test',
    },
  ];

  const completedCount = completedTests.length;
  const progress = (completedCount / tests.length) * 100;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 30,
    },
    headerTitle: {
      fontSize: Typography.fontSize.title,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: Typography.fontSize.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    progressSection: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      ...theme.shadows.medium,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    progressCount: {
      fontSize: Typography.fontSize.medium,
      fontWeight: '600',
      color: '#8B5CF6',
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 16,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#8B5CF6',
    },
    clarityIndexContainer: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    clarityIndexLabel: {
      fontSize: Typography.fontSize.medium,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    clarityIndexValue: {
      fontSize: Typography.fontSize.display,
      fontWeight: 'bold',
      color: '#8B5CF6',
    },
    clarityIndexSubtext: {
      fontSize: Typography.fontSize.medium,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    testsContainer: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    testCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      ...theme.shadows.small,
    },
    testCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    testIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    testInfo: {
      flex: 1,
    },
    testTitle: {
      fontSize: Typography.fontSize.large,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    testDuration: {
      fontSize: Typography.fontSize.small,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
    testDescription: {
      fontSize: Typography.fontSize.medium,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    testButton: {
      backgroundColor: theme.colors.primary || '#8B5CF6',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    testButtonCompleted: {
      backgroundColor: theme.colors.success || '#10B981',
    },
    testButtonText: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#D1FAE5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    completedBadgeText: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
      color: '#059669',
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mental Clarity Tests',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Mental Clarity Tests</Text>
          <Text style={styles.headerSubtitle}>
            Complete all 5 tests to get your daily Clarity Index
          </Text>
        </Animated.View>

        {/* Progress Section */}
        <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressCount}>
              {completedCount}/{tests.length} completed
            </Text>
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${progress}%`],
                  }),
                },
              ]}
            />
          </View>

          {clarityIndex !== null && (
            <View style={styles.clarityIndexContainer}>
              <Text style={styles.clarityIndexLabel}>Your Clarity Index</Text>
              <Text style={styles.clarityIndexValue}>{clarityIndex}</Text>
              <Text style={styles.clarityIndexSubtext}>
                {clarityIndex >= 80
                  ? 'Excellent mental clarity!'
                  : clarityIndex >= 60
                  ? 'Good cognitive balance'
                  : clarityIndex >= 40
                  ? 'Moderate clarity'
                  : 'Room for improvement'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Test Cards */}
        <Animated.View style={[styles.testsContainer, { opacity: fadeAnim }]}>
          {tests.map((test, index) => {
            const isCompleted = completedTests.includes(test.id);
            
            return (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testCardHeader}>
                  <View
                    style={[
                      styles.testIconContainer,
                      {
                        backgroundColor: `${test.color}15`,
                      },
                    ]}
                  >
                    {test.icon}
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    <Text style={styles.testDuration}>⏱️ {test.duration}</Text>
                  </View>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <CheckCircle size={14} color="#059669" />
                      <Text style={styles.completedBadgeText}>Done</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.testDescription}>{test.description}</Text>

                <TouchableOpacity
                  style={[
                    styles.testButton,
                    isCompleted && styles.testButtonCompleted,
                  ]}
                  onPress={() => router.push(test.route as any)}
                >
                  <Text style={styles.testButtonText}>
                    {isCompleted ? 'Retake Test' : 'Start Test'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
