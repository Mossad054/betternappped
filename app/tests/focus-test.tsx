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
import { X, Target, Star, Circle, Square, Triangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

type Shape = 'star' | 'circle' | 'square' | 'triangle';

interface TestStats {
  correctTaps: number;
  missedTargets: number;
  falseTaps: number;
  reactionTimes: number[];
}

export default function FocusTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape>('circle');
  const [timeLeft, setTimeLeft] = useState(90);
  const [stats, setStats] = useState<TestStats>({
    correctTaps: 0,
    missedTargets: 0,
    falseTaps: 0,
    reactionTimes: [],
  });
  const [targetAppearTime, setTargetAppearTime] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [targetShape, setTargetShape] = useState<Shape>('star');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shapeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const shapes: Shape[] = ['star', 'circle', 'square', 'triangle'];

  useEffect(() => {
    if (started && !finished) {
      // Countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Shape change logic
      changeShape();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);
      };
    }
  }, [started, finished]);

  const changeShape = () => {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const isTarget = randomShape === targetShape;
    
    setCurrentShape(randomShape);
    const appearTime = Date.now();
    setTargetAppearTime(appearTime);

    // Animate shape appearance
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

    // Schedule next shape change (random interval 600-2000ms for more variety)
    const nextChangeTime = 600 + Math.random() * 1400;
    shapeTimerRef.current = setTimeout(() => {
      // If target was shown but not tapped, count as missed
      if (isTarget && Date.now() - appearTime > nextChangeTime - 100) {
        setStats((prev) => ({
          ...prev,
          missedTargets: prev.missedTargets + 1,
        }));
      }
      changeShape();
    }, nextChangeTime);
  };

  const handleShapeTap = () => {
    const reactionTime = Date.now() - targetAppearTime;

    if (currentShape === targetShape) {
      // Correct tap
      setStats((prev) => ({
        ...prev,
        correctTaps: prev.correctTaps + 1,
        reactionTimes: [...prev.reactionTimes, reactionTime],
      }));

      // Visual feedback
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // False tap
      setStats((prev) => ({
        ...prev,
        falseTaps: prev.falseTaps + 1,
      }));

      // Shake animation for wrong tap
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleFinishTest = async () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current);

    // Calculate score
    const totalTargets = stats.correctTaps + stats.missedTargets;
    const accuracy = totalTargets > 0 ? (stats.correctTaps / totalTargets) * 100 : 0;
    const avgReactionTime = stats.reactionTimes.length > 0
      ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length
      : 0;

    // Improved scoring formula:
    // - Accuracy component (60% weight): directly from accuracy
    // - Speed component (40% weight): faster = better, optimal ~250ms, max ~1000ms
    // - False tap penalty: reduces score
    const accuracyScore = accuracy * 0.6;
    const speedScore = avgReactionTime > 0
      ? Math.max(0, 40 * (1 - Math.min((avgReactionTime - 200) / 800, 1)))
      : 0;
    const falseTapPenalty = Math.min(20, stats.falseTaps * 2);
    const score = Math.max(0, Math.min(100, accuracyScore + speedScore - falseTapPenalty));

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const result = await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'focus',
        score: Math.round(score),
        date: today,
        metrics: {
          correctTaps: stats.correctTaps,
          missedTargets: stats.missedTargets,
          falseTaps: stats.falseTaps,
          avgReactionTime: Math.round(avgReactionTime),
          focusAccuracy: Math.round(accuracy * 10) / 10,
        },
        timestamp: new Date().toISOString(),
        synced: true,
      });

      if (result.error) {
        Alert.alert('Error', 'Failed to save test result. Please try again.');
        setSaving(false);
        return;
      }

      // Check if all tests completed and calculate clarity index
      await MentalClarityService.calculateClarityIndex(user.id, today);
    }
    setSaving(false);
  };

  const handleStart = () => {
    // Randomize target shape to prevent pattern memorization
    const randomTarget = shapes[Math.floor(Math.random() * shapes.length)];
    setTargetShape(randomTarget);
    setStarted(true);
  };

  const handleViewResults = () => {
    router.back();
  };

  const getShapeIcon = (shape: Shape, size: number = 120, color: string = '#8B5CF6') => {
    switch (shape) {
      case 'star':
        return <Star size={size} color={color} fill={color} />;
      case 'circle':
        return <Circle size={size} color={color} fill={color} />;
      case 'square':
        return <Square size={size} color={color} fill={color} />;
      case 'triangle':
        return <Triangle size={size} color={color} fill={color} />;
    }
  };

  const totalTargets = stats.correctTaps + stats.missedTargets;
  const accuracy = totalTargets > 0 ? (stats.correctTaps / totalTargets) * 100 : 0;
  const avgReactionTime = stats.reactionTimes.length > 0
    ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length
    : 0;
  const accuracyScore = accuracy * 0.6;
  const speedScore = avgReactionTime > 0
    ? Math.max(0, 40 * (1 - Math.min((avgReactionTime - 200) / 800, 1)))
    : 0;
  const falseTapPenalty = Math.min(20, stats.falseTaps * 2);
  const finalScore = Math.max(0, Math.min(100, accuracyScore + speedScore - falseTapPenalty));

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
    introContainer: {
      alignItems: 'center',
      maxWidth: 400,
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
    instructionCard: {
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
    instruction: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    targetExample: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      padding: 12,
      backgroundColor: '#8B5CF610',
      borderRadius: 12,
    },
    targetLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#8B5CF6',
      marginLeft: 12,
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
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
      backgroundColor: theme.colors.surface,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    shapeArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    shapeTouchable: {
      padding: 40,
    },
    resultsContainer: {
      alignItems: 'center',
      padding: 20,
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Focus Test',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (started && !finished) {
                  Alert.alert(
                    'Exit Test?',
                    'Your progress will be lost if you exit now.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Exit', style: 'destructive', onPress: () => router.back() },
                    ]
                  );
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
        // Intro Screen
        <View style={styles.content}>
          <View style={styles.introContainer}>
            <View style={styles.iconContainer}>
              <Target size={40} color="#8B5CF6" />
            </View>

            <Text style={styles.title}>Focus Test</Text>
            <Text style={styles.description}>
              Measure your sustained attention and response inhibition
            </Text>

            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>How to Play:</Text>
              <Text style={styles.instruction}>
                • Watch as different shapes appear on screen{'\n'}
                • Tap ONLY when you see the TARGET shape shown below{'\n'}
                • Ignore all other shapes{'\n'}
                • Test duration: 90 seconds{'\n'}
                • React as quickly as possible
              </Text>

              <View style={styles.targetExample}>
                {getShapeIcon(targetShape, 32, '#8B5CF6')}
                <Text style={styles.targetLabel}>Tap this shape only!</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : !finished ? (
        // Test Screen
        <View style={styles.testContainer}>
          {/* Timer Bar */}
          <View style={styles.timerBar}>
            <View
              style={[
                styles.timerFill,
                { width: `${(timeLeft / 90) * 100}%` },
              ]}
            />
          </View>

          {/* Timer Only - Hide stats to prevent cramming */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>Time Remaining</Text>
            </View>
          </View>

          {/* Shape Display Area */}
          <View style={styles.shapeArea}>
            <TouchableOpacity
              style={styles.shapeTouchable}
              onPress={handleShapeTap}
              activeOpacity={0.8}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                }}
              >
                {getShapeIcon(currentShape)}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Results Screen
        <View style={styles.content}>
          <View style={styles.resultsContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{Math.round(finalScore)}</Text>
              <Text style={styles.scoreLabel}>Focus Score</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Test Results</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Accuracy</Text>
                <Text style={styles.resultValue}>{Math.round(accuracy)}%</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Correct Taps</Text>
                <Text style={styles.resultValue}>{stats.correctTaps}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Missed Targets</Text>
                <Text style={styles.resultValue}>{stats.missedTargets}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>False Taps</Text>
                <Text style={styles.resultValue}>{stats.falseTaps}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Avg Reaction Time</Text>
                <Text style={styles.resultValue}>{Math.round(avgReactionTime)}ms</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleViewResults}
              disabled={saving}
            >
              <Text style={styles.doneButtonText}>
                {saving ? 'Saving...' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
