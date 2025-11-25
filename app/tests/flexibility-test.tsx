import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { X, Shuffle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

const COLORS = ['#EF4444', '#3B82F6'];
const COLOR_NAMES = ['Red', 'Blue'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type Rule = 'even' | 'color';

interface Stimulus {
  number: number;
  colorIndex: number;
}

export default function FlexibilityTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentRule, setCurrentRule] = useState<Rule>('even');
  const [stimulus, setStimulus] = useState<Stimulus>({ number: 2, colorIndex: 0 });
  const [correctTaps, setCorrectTaps] = useState(0);
  const [incorrectTaps, setIncorrectTaps] = useState(0);
  const [ruleSwitches, setRuleSwitches] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionTimesBeforeSwitch, setReactionTimesBeforeSwitch] = useState<number[]>([]);
  const [reactionTimesAfterSwitch, setReactionTimesAfterSwitch] = useState<number[]>([]);
  const [tapStartTime, setTapStartTime] = useState<number>(0);
  const [hasSwwitched, setHasSwitched] = useState(false);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (started && !finished) {
      generateNewStimulus();
      setTapStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      scheduleSwitchRule();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      };
    }
  }, [started, finished]);

  const scheduleSwitchRule = () => {
    const delay = 30000; // Switch after 30 seconds (halfway through 60s test)
    switchTimerRef.current = setTimeout(() => {
      setCurrentRule((prev) => {
        setRuleSwitches((count) => count + 1);
        setHasSwitched(true);
        flashRule();
        Alert.alert('Rule Switch!', 'New Rule: Tap if color is RED', [{ text: 'Got it!' }]);
        return prev === 'even' ? 'color' : 'even';
      });
    }, delay);
  };

  const flashRule = () => {
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const generateNewStimulus = () => {
    const newNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const newColorIndex = Math.floor(Math.random() * 2);
    setStimulus({ number: newNumber, colorIndex: newColorIndex });
    setTapStartTime(Date.now());

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAnswer = (tapped: boolean) => {
    const reactionTime = Date.now() - tapStartTime;
    
    let shouldTap = false;
    if (currentRule === 'even') {
      shouldTap = stimulus.number % 2 === 0;
    } else {
      shouldTap = stimulus.colorIndex === 0; // Red
    }

    if (tapped === shouldTap) {
      setCorrectTaps((prev) => prev + 1);
    } else {
      setIncorrectTaps((prev) => prev + 1);
    }

    // Track reaction times
    setReactionTimes((prev) => [...prev, reactionTime]);
    if (!hasSwwitched) {
      setReactionTimesBeforeSwitch((prev) => [...prev, reactionTime]);
    } else {
      setReactionTimesAfterSwitch((prev) => [...prev, reactionTime]);
    }

    generateNewStimulus();
  };

  const handleFinish = async () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

    const totalAttempts = correctTaps + incorrectTaps;
    const accuracy = totalAttempts > 0 ? (correctTaps / totalAttempts) * 100 : 0;

    // Calculate switch cost (RT after switch - RT before switch)
    const avgRTBefore = reactionTimesBeforeSwitch.length > 0
      ? reactionTimesBeforeSwitch.reduce((a, b) => a + b, 0) / reactionTimesBeforeSwitch.length
      : 0;
    const avgRTAfter = reactionTimesAfterSwitch.length > 0
      ? reactionTimesAfterSwitch.reduce((a, b) => a + b, 0) / reactionTimesAfterSwitch.length
      : 0;
    const switchCost = Math.max(0, avgRTAfter - avgRTBefore);

    // Improved scoring:
    // - Accuracy (60%): percentage correct
    // - Adaptability (40%): lower switch cost = higher score
    const accuracyScore = accuracy * 0.6;
    const adaptabilityScore = Math.max(0, 40 * (1 - Math.min(switchCost / 500, 1)));
    const score = Math.max(0, Math.min(100, accuracyScore + adaptabilityScore));

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'flexibility',
        score: Math.round(score),
        date: today,
        metrics: {
          switchReactionTime: Math.round(switchCost),
          accuracyBefore: reactionTimesBeforeSwitch.length > 0 ? Math.round((correctTaps / totalAttempts) * 100) : 0,
          accuracyAfter: reactionTimesAfterSwitch.length > 0 ? Math.round((correctTaps / totalAttempts) * 100) : 0,
          switchCost: Math.round(switchCost),
          errorRate: Math.round(errorRate * 100),
          correctResponses: correctTaps,
          errors: incorrectTaps,
          flexibilityAccuracy: Math.round(accuracy),
        },
        timestamp: new Date().toISOString(),
        synced: true,
      });

      await MentalClarityService.calculateClarityIndex(user.id, today);
    }
    setSaving(false);
  };

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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#8B5CF615',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    rulesCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      width: '100%',
      ...theme.shadows.small,
    },
    ruleItem: {
      marginBottom: 16,
    },
    ruleTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    ruleText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    startButton: {
      backgroundColor: '#8B5CF6',
      paddingHorizontal: 48,
      paddingVertical: 16,
      borderRadius: 12,
      ...theme.shadows.medium,
    },
    startButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    testContainer: {
      flex: 1,
      width: '100%',
    },
    timerBar: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      width: '100%',
    },
    timerFill: {
      height: '100%',
      backgroundColor: '#8B5CF6',
    },
    ruleDisplay: {
      padding: 20,
      alignItems: 'center',
    },
    currentRuleLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    currentRuleText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#8B5CF6',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    stimulusArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stimulusCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 60,
      ...theme.shadows.large,
    },
    stimulusNumber: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 20,
      paddingHorizontal: 20,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 20,
      borderRadius: 12,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    tapButton: {
      backgroundColor: '#10B981',
    },
    skipButton: {
      backgroundColor: '#6B7280',
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    scoreCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#8B5CF615',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 8,
      borderColor: '#8B5CF6',
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#8B5CF6',
    },
    scoreLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    resultCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      marginBottom: 20,
      ...theme.shadows.small,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    resultLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    resultValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    doneButton: {
      backgroundColor: '#10B981',
      paddingHorizontal: 48,
      paddingVertical: 16,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    doneButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  const totalAttempts = correctTaps + incorrectTaps;
  const accuracy = totalAttempts > 0 ? (correctTaps / totalAttempts) * 100 : 0;
  const avgRTBefore = reactionTimesBeforeSwitch.length > 0
    ? reactionTimesBeforeSwitch.reduce((a, b) => a + b, 0) / reactionTimesBeforeSwitch.length
    : 0;
  const avgRTAfter = reactionTimesAfterSwitch.length > 0
    ? reactionTimesAfterSwitch.reduce((a, b) => a + b, 0) / reactionTimesAfterSwitch.length
    : 0;
  const switchCost = Math.max(0, avgRTAfter - avgRTBefore);
  const accuracyScore = accuracy * 0.6;
  const adaptabilityScore = Math.max(0, 40 * (1 - Math.min(switchCost / 500, 1)));
  const finalScore = Math.max(0, Math.min(100, accuracyScore + adaptabilityScore));

  const ruleBackgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surface, '#8B5CF630'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mental Flexibility',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (started && !finished) {
                  Alert.alert('Exit Test?', 'Your progress will be lost.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Exit', style: 'destructive', onPress: () => router.back() },
                  ]);
                } else {
                  router.back();
                }
              }}
              style={styles.headerButton}
            >
              <X size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          ),
        }}
      />

      {!started ? (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Shuffle size={40} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>Mental Flexibility</Text>
          <Text style={styles.description}>
            The rules will switch during the test. Stay flexible!
          </Text>

          <View style={styles.rulesCard}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleTitle}>Rule 1: Even Numbers</Text>
              <Text style={styles.ruleText}>Tap when you see an even number (2, 4, 6, 8)</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleTitle}>Rule 2: Red Color</Text>
              <Text style={styles.ruleText}>Tap when you see a RED number</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={() => setStarted(true)}>
            <Text style={styles.startButtonText}>Start Test (60s)</Text>
          </TouchableOpacity>
        </View>
      ) : !finished ? (
        <View style={styles.testContainer}>
          <View style={styles.timerBar}>
            <View style={[styles.timerFill, { width: `${(timeLeft / 60) * 100}%` }]} />
          </View>

          <Animated.View style={[styles.ruleDisplay, { backgroundColor: ruleBackgroundColor }]}>
            <Text style={styles.currentRuleLabel}>Current Rule</Text>
            <Text style={styles.currentRuleText}>
              {currentRule === 'even' ? 'TAP IF EVEN' : 'TAP IF RED'}
            </Text>
          </Animated.View>

          {/* Timer Only - Hide stats to prevent cramming */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeLeft}s</Text>
              <Text style={styles.statLabel}>Time Remaining</Text>
            </View>
          </View>

          <View style={styles.stimulusArea}>
            <Animated.View
              style={[
                styles.stimulusCircle,
                {
                  backgroundColor: COLORS[stimulus.colorIndex],
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.stimulusNumber}>{stimulus.number}</Text>
            </Animated.View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.tapButton]}
                onPress={() => checkAnswer(true)}
              >
                <Text style={styles.actionButtonText}>TAP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.skipButton]}
                onPress={() => checkAnswer(false)}
              >
                <Text style={styles.actionButtonText}>SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(finalScore)}</Text>
            <Text style={styles.scoreLabel}>Flexibility</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Switch Cost (RT)</Text>
              <Text style={styles.resultValue}>{Math.round(switchCost)}ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Error Rate</Text>
              <Text style={styles.resultValue}>{Math.round(errorRate * 100)}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct Responses</Text>
              <Text style={styles.resultValue}>{correctTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Errors</Text>
              <Text style={styles.resultValue}>{incorrectTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Accuracy</Text>
              <Text style={styles.resultValue}>{Math.round(accuracy)}%</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.doneButtonText}>{saving ? 'Saving...' : 'Done'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
