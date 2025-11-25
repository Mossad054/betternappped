import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
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
  Square,
  CheckSquare,
  Timer,
  Grid3X3,
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
  selected: boolean;
}

export default function MentalClarityTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tests, setTests] = useState<TestCard[]>([]);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [clarityIndex, setClarityIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [canTakeTest, setCanTakeTest] = useState(true);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);
  const [timeUntilNextTest, setTimeUntilNextTest] = useState<string>('');
  const [savingResults, setSavingResults] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start at 1 to avoid overlay

  useEffect(() => {
    initializeTests();
    loadDailyProgress();
  }, []);

  useEffect(() => {
    // Update countdown timer every minute
    if (!canTakeTest && lastTestTime) {
      const interval = setInterval(() => {
        updateTimeUntilNextTest();
      }, 60000); // Update every minute

      updateTimeUntilNextTest();
      return () => clearInterval(interval);
    }
  }, [canTakeTest, lastTestTime]);

  const initializeTests = () => {
    const initialTests: TestCard[] = [
      {
        id: 'focus',
        title: 'Focus Test',
        description: 'Measure sustained attention and response inhibition',
        icon: <Target size={28} color="#8B5CF6" />,
        color: '#8B5CF6',
        duration: '90 sec',
        route: '/tests/focus-test',
        selected: true,
      },
      {
        id: 'flexibility',
        title: 'Mental Flexibility',
        description: 'Test cognitive adaptability and rule switching',
        icon: <TrendingUp size={28} color="#EC4899" />,
        color: '#EC4899',
        duration: '60 sec',
        route: '/tests/flexibility-test',
        selected: true,
      },
      {
        id: 'speed',
        title: 'Processing Speed',
        description: 'Assess quick thinking and pattern recognition',
        icon: <Zap size={28} color="#F59E0B" />,
        color: '#F59E0B',
        duration: '45 sec',
        route: '/tests/speed-test',
        selected: false,
      },
      {
        id: 'memory',
        title: 'Working Memory',
        description: 'Evaluate short-term recall under pressure',
        icon: <Brain size={28} color="#10B981" />,
        color: '#10B981',
        duration: '60 sec',
        route: '/tests/memory-test',
        selected: false,
      },
      {
        id: 'reaction',
        title: 'Reaction Speed',
        description: 'Test how quickly you can respond to stimuli',
        icon: <Timer size={28} color="#06B6D4" />,
        color: '#06B6D4',
        duration: '~60 sec',
        route: '/tests/reaction-test',
        selected: false,
      },
      {
        id: 'pattern',
        title: 'Pattern Recall',
        description: 'Remember and recreate visual patterns',
        icon: <Grid3X3 size={28} color="#A855F7" />,
        color: '#A855F7',
        duration: '~90 sec',
        route: '/tests/pattern-test',
        selected: false,
      },
    ];
    setTests(initialTests);
  };

  const updateTimeUntilNextTest = () => {
    if (!lastTestTime) return;

    const now = new Date();
    const nextTestTime = new Date(lastTestTime.getTime() + 24 * 60 * 60 * 1000);
    const diff = nextTestTime.getTime() - now.getTime();

    if (diff <= 0) {
      setCanTakeTest(true);
      setTimeUntilNextTest('');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeUntilNextTest(`${hours}h ${minutes}m`);
  };

  const loadDailyProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check last test timestamp for 24-hour rate limiting
    const { data: recentTests } = await MentalClarityService.getTestResults(
      user.id,
      new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    if (recentTests && recentTests.length > 0) {
      const lastTest = new Date(recentTests[0].timestamp);
      const hoursSinceLastTest = (Date.now() - lastTest.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastTest < 24) {
        setCanTakeTest(false);
        setLastTestTime(lastTest);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const completion = await MentalClarityService.checkDailyCompletion(user.id, today);
    setCompletedTests(completion.completed as string[]);

    // Get latest clarity index
    const { data } = await MentalClarityService.getLatestClarityIndex(user.id);
    if (data) {
      setClarityIndex(data.combined_score);
    }

    setLoading(false);
  };

  const handleTestSelection = (testId: string) => {
    const updatedTests = tests.map(test =>
      test.id === testId ? { ...test, selected: !test.selected } : test
    );
    setTests(updatedTests);
  };

  const handleStartTests = () => {
    const selectedTests = tests.filter(t => t.selected);

    if (selectedTests.length < 2) {
      Alert.alert(
        'Minimum Tests Required',
        'Please select at least 2 tests to get an accurate clarity score.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!canTakeTest) {
      Alert.alert(
        'Test Limit Reached',
        `You can take another test in ${timeUntilNextTest}. Mental clarity tests are limited to once per 24 hours for accurate results.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to first selected test
    router.push(selectedTests[0].route as any);
  };

  const handleSaveResults = async () => {
    if (!user) return;

    setSavingResults(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await MentalClarityService.calculateClarityIndex(user.id, today);

      if (result.data) {
        setClarityIndex(result.data.combined_score);
        Alert.alert(
          'Results Saved!',
          `Your Mental Clarity Index is ${result.data.combined_score}/100.\n\nBreakdown:\n• Focus: ${result.data.focus_score}\n• Flexibility: ${result.data.flexibility_score}\n• Speed: ${result.data.speed_score}\n• Memory: ${result.data.memory_score}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to save results. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save results. Please try again.');
    } finally {
      setSavingResults(false);
    }
  };

  const selectedCount = tests.filter(t => t.selected).length;
  const completedCount = completedTests.length;
  const selectedTestsIds = tests.filter(t => t.selected).map(t => t.id);
  const selectedCompletedCount = completedTests.filter(id => selectedTestsIds.includes(id)).length;
  const progress = selectedCount > 0 ? (selectedCompletedCount / selectedCount) * 100 : 0;

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
    warningBanner: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
    },
    warningTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      marginBottom: 4,
    },
    warningText: {
      fontSize: Typography.fontSize.medium,
    },
    selectionInfo: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    selectionInfoText: {
      fontSize: Typography.fontSize.medium,
      fontWeight: '500',
    },
    checkbox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    startButtonContainer: {
      paddingHorizontal: 20,
      paddingBottom: 30,
      paddingTop: 8,
    },
    startButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.medium,
    },
    startButtonText: {
      fontSize: Typography.fontSize.body,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    saveResultsSection: {
      marginHorizontal: 20,
      marginBottom: 20,
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.medium,
    },
    saveResultsTitle: {
      fontSize: Typography.fontSize.large,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    saveResultsSubtitle: {
      fontSize: Typography.fontSize.medium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    saveButton: {
      backgroundColor: '#10B981',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...theme.shadows.medium,
    },
    saveButtonText: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mental Clarity Tests</Text>
          <Text style={styles.headerSubtitle}>
            Select at least 2 tests to measure your cognitive performance
          </Text>
        </View>

        {/* Rate Limiting Warning */}
        {!canTakeTest && (
          <View style={[styles.warningBanner, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
            <Lock size={20} color={theme.colors.warning} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.warningTitle, { color: theme.colors.text }]}>
                Test Cooldown Active
              </Text>
              <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
                Next test available in {timeUntilNextTest}
              </Text>
            </View>
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Selected Tests Progress</Text>
            <Text style={styles.progressCount}>
              {selectedCompletedCount}/{selectedCount} completed
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
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
        </View>

        {/* Test Selection Info */}
        <View style={[styles.selectionInfo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.selectionInfoText, { color: theme.colors.textSecondary }]}>
            {selectedCount < 2
              ? `Select at least ${2 - selectedCount} more test${2 - selectedCount > 1 ? 's' : ''} to continue`
              : `${selectedCount} test${selectedCount > 1 ? 's' : ''} selected - Ready to start!`}
          </Text>
        </View>

        {/* Test Cards */}
        <View style={styles.testsContainer}>
          {tests.map((test, index) => {
            const isCompleted = completedTests.includes(test.id);

            return (
              <TouchableOpacity
                key={test.id}
                style={[
                  styles.testCard,
                  test.selected && { borderColor: test.color, borderWidth: 2 }
                ]}
                onPress={() => handleTestSelection(test.id)}
                activeOpacity={0.7}
              >
                <View style={styles.testCardHeader}>
                  {/* Selection Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      test.selected && { backgroundColor: test.color, borderColor: test.color }
                    ]}
                    onPress={() => handleTestSelection(test.id)}
                  >
                    {test.selected && <CheckSquare size={20} color="#FFFFFF" />}
                    {!test.selected && <Square size={20} color={theme.colors.textTertiary} />}
                  </TouchableOpacity>

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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Results Section - Show when 2+ tests completed */}
        {selectedCompletedCount >= 2 && (
          <View style={styles.saveResultsSection}>
            <Text style={styles.saveResultsTitle}>Tests Completed!</Text>
            <Text style={styles.saveResultsSubtitle}>
              You've completed {selectedCompletedCount} tests. Save your results to calculate your Mental Clarity Index.
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveResults}
              disabled={savingResults}
            >
              {savingResults ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Results & Calculate Index</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Start Tests Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: theme.colors.primary || '#8B5CF6' },
              (selectedCount < 2 || !canTakeTest) && { opacity: 0.5 }
            ]}
            onPress={handleStartTests}
            disabled={selectedCount < 2 || !canTakeTest}
          >
            <Text style={styles.startButtonText}>
              {!canTakeTest
                ? `Test Locked (${timeUntilNextTest})`
                : selectedCount < 2
                ? 'Select at Least 2 Tests'
                : `Start ${selectedCount} Selected Test${selectedCount > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
