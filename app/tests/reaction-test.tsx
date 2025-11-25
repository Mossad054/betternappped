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
import { X, Timer } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

export default function ReactionTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const [saving, setSaving] = useState(false);

  const TOTAL_ROUNDS = 10;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (started && !finished && currentRound < TOTAL_ROUNDS) {
      startRound();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [started, currentRound]);

  const startRound = () => {
    setWaiting(true);
    setShowTarget(false);
    setTooEarly(false);

    // Random delay between 1-4 seconds
    const delay = 1000 + Math.random() * 3000;

    timerRef.current = setTimeout(() => {
      setShowTarget(true);
      setTargetTime(Date.now());

      // Animate target appearance
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  };

  const handleTap = () => {
    if (!waiting) return;

    if (!showTarget) {
      // Tapped too early
      setTooEarly(true);
      setWaiting(false);
      if (timerRef.current) clearTimeout(timerRef.current);

      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS - 1) {
          setCurrentRound(prev => prev + 1);
        } else {
          handleFinish();
        }
      }, 1000);
      return;
    }

    // Valid reaction
    const reactionTime = Date.now() - targetTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setWaiting(false);

    if (currentRound < TOTAL_ROUNDS - 1) {
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
      }, 500);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Calculate score based on average reaction time
    const validTimes = reactionTimes.filter(t => t > 0);
    const avgReactionTime = validTimes.length > 0
      ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
      : 1000;

    // Scoring: faster is better
    // Optimal: 200ms = 100 points, 800ms = 0 points
    const speedScore = Math.max(0, Math.min(100, 100 * (1 - (avgReactionTime - 200) / 600)));

    // Consistency bonus (lower std dev = higher bonus)
    const mean = avgReactionTime;
    const variance = validTimes.length > 1
      ? validTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / validTimes.length
      : 0;
    const stdDev = Math.sqrt(variance);
    const consistencyBonus = Math.max(0, 10 * (1 - stdDev / 200));

    // Penalty for early taps
    const earlyTapPenalty = (TOTAL_ROUNDS - validTimes.length) * 5;

    const score = Math.max(0, Math.min(100, speedScore + consistencyBonus - earlyTapPenalty));

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'speed', // Using speed type for now
        score: Math.round(score),
        date: today,
        metrics: {
          avgReactionTime: Math.round(avgReactionTime),
          speedCorrectMatches: validTimes.length,
          incorrectMatches: TOTAL_ROUNDS - validTimes.length,
          totalAttempts: TOTAL_ROUNDS,
        },
        timestamp: new Date().toISOString(),
        synced: true,
      });

      await MentalClarityService.calculateClarityIndex(user.id, today);
    }
    setSaving(false);
  };

  const validTimes = reactionTimes.filter(t => t > 0);
  const avgReactionTime = validTimes.length > 0
    ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
    : 0;
  const fastestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;
  const speedScore = avgReactionTime > 0
    ? Math.max(0, Math.min(100, 100 * (1 - (avgReactionTime - 200) / 600)))
    : 0;

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
      backgroundColor: '#06B6D415',
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
    instructionsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      width: '100%',
      ...theme.shadows.small,
    },
    instructionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    instructionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    startButton: {
      backgroundColor: '#06B6D4',
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
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      width: '100%',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#06B6D4',
    },
    roundInfo: {
      padding: 20,
      alignItems: 'center',
    },
    roundText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    tapArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    waitingCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.large,
    },
    targetCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.large,
    },
    tooEarlyCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.large,
    },
    circleText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    waitingText: {
      color: theme.colors.textSecondary,
    },
    hint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 30,
    },
    scoreCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#06B6D415',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 8,
      borderColor: '#06B6D4',
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#06B6D4',
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Reaction Speed',
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
            <Timer size={40} color="#06B6D4" />
          </View>
          <Text style={styles.title}>Reaction Speed</Text>
          <Text style={styles.description}>
            Test how quickly you can respond
          </Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionTitle}>How it Works</Text>
            <Text style={styles.instructionText}>
              {'\u2022'} Wait for the circle to turn GREEN{'\n'}
              {'\u2022'} Tap as fast as you can when it changes{'\n'}
              {'\u2022'} Don't tap too early or you'll get a penalty{'\n'}
              {'\u2022'} Complete 10 rounds
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={() => setStarted(true)}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      ) : !finished ? (
        <View style={styles.testContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentRound / TOTAL_ROUNDS) * 100}%` }]} />
          </View>

          <View style={styles.roundInfo}>
            <Text style={styles.roundText}>Round {currentRound + 1} of {TOTAL_ROUNDS}</Text>
          </View>

          <TouchableOpacity
            style={styles.tapArea}
            onPress={handleTap}
            activeOpacity={0.9}
          >
            {tooEarly ? (
              <View style={styles.tooEarlyCircle}>
                <Text style={styles.circleText}>Too Early!</Text>
              </View>
            ) : showTarget ? (
              <Animated.View style={[styles.targetCircle, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.circleText}>TAP!</Text>
              </Animated.View>
            ) : (
              <View style={styles.waitingCircle}>
                <Text style={[styles.circleText, styles.waitingText]}>Wait...</Text>
              </View>
            )}

            <Text style={styles.hint}>
              {tooEarly ? 'Wait for the green circle' : showTarget ? 'Tap now!' : 'Wait for the green target'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(speedScore)}</Text>
            <Text style={styles.scoreLabel}>Reaction Score</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Average Time</Text>
              <Text style={styles.resultValue}>{Math.round(avgReactionTime)}ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Fastest Time</Text>
              <Text style={styles.resultValue}>{Math.round(fastestTime)}ms</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Valid Taps</Text>
              <Text style={styles.resultValue}>{validTimes.length}/{TOTAL_ROUNDS}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Early Taps</Text>
              <Text style={styles.resultValue}>{TOTAL_ROUNDS - validTimes.length}</Text>
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
