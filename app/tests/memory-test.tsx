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
import { X, Brain } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export default function MemoryTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [nLevel, setNLevel] = useState(2);
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentLetter, setCurrentLetter] = useState('');
  const [showingLetter, setShowingLetter] = useState(false);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [incorrectTaps, setIncorrectTaps] = useState(0);
  const [missedMatches, setMissedMatches] = useState(0);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const letterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      showNextLetter();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (letterTimerRef.current) clearTimeout(letterTimerRef.current);
      };
    }
  }, [started, finished]);

  useEffect(() => {
    // Increase difficulty after 10 correct matches
    if (correctMatches > 0 && correctMatches % 10 === 0 && nLevel < 4) {
      setNLevel((prev) => prev + 1);
    }
  }, [correctMatches]);

  const showNextLetter = () => {
    if (finished) return;

    const newLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setCurrentLetter(newLetter);
    setShowingLetter(true);

    // Animate in
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if this is an N-back match
    const newSequence = [...sequence, newLetter];
    setSequence(newSequence);

    const isMatch = newSequence.length > nLevel && newSequence[newSequence.length - 1] === newSequence[newSequence.length - 1 - nLevel];

    // Hide after 1.5 seconds
    letterTimerRef.current = setTimeout(() => {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowingLetter(false);
        
        // Check if user missed the match
        if (isMatch) {
          setMissedMatches((prev) => prev + 1);
        }

        // Show next letter after short pause
        if (!finished) {
          setTimeout(() => showNextLetter(), 500);
        }
      });
    }, 1500);
  };

  const handleTap = () => {
    if (!showingLetter || sequence.length <= nLevel) return;

    const isMatch = sequence[sequence.length - 1] === sequence[sequence.length - 1 - nLevel];

    if (isMatch) {
      setCorrectMatches((prev) => prev + 1);
    } else {
      setIncorrectTaps((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (letterTimerRef.current) clearTimeout(letterTimerRef.current);

    const totalMatches = correctMatches + missedMatches;
    const accuracy = totalMatches > 0 ? (correctMatches / totalMatches) : 0;
    const falsePositiveRate = (correctMatches + incorrectTaps) > 0 ? (incorrectTaps / (correctMatches + incorrectTaps)) : 0;
    
    // Score = (Accuracy − FalsePositives) × 100
    const score = Math.max(0, (accuracy - falsePositiveRate) * 100);

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'memory',
        score: Math.round(score),
        date: today,
        metrics: {
          nLevel,
          memoryCorrectMatches: correctMatches,
          missedMatches,
          falsePositives: incorrectTaps,
          memoryAccuracy: Math.round(accuracy * 100),
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
      backgroundColor: '#EC489915',
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
      marginBottom: 12,
    },
    exampleBox: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    exampleText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },
    startButton: {
      backgroundColor: '#EC4899',
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
      backgroundColor: '#EC4899',
    },
    nLevelBadge: {
      alignSelf: 'center',
      backgroundColor: '#EC489920',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 20,
    },
    nLevelText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#EC4899',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      marginTop: 12,
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
    letterArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    letterCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#EC4899',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 60,
      ...theme.shadows.large,
    },
    letterText: {
      fontSize: 100,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    tapButton: {
      backgroundColor: '#10B981',
      paddingVertical: 24,
      paddingHorizontal: 60,
      borderRadius: 16,
      ...theme.shadows.large,
      marginHorizontal: 20,
    },
    tapButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    hint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    scoreCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#EC489915',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 8,
      borderColor: '#EC4899',
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#EC4899',
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

  const totalMatches = correctMatches + missedMatches;
  const accuracy = totalMatches > 0 ? (correctMatches / totalMatches) : 0;
  const falsePositiveRate = (correctMatches + incorrectTaps) > 0 ? (incorrectTaps / (correctMatches + incorrectTaps)) : 0;
  const finalScore = Math.max(0, (accuracy - falsePositiveRate) * 100);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Working Memory',
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
            <Brain size={40} color="#EC4899" />
          </View>
          <Text style={styles.title}>Working Memory</Text>
          <Text style={styles.description}>
            Test your working memory with the N-back challenge
          </Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionTitle}>How it Works</Text>
            <Text style={styles.instructionText}>
              • Letters will appear one at a time{'\n'}
              • Tap when the current letter matches the one from N positions back{'\n'}
              • Start with 2-back, difficulty increases as you improve
            </Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>Example (2-back):</Text>
              <Text style={styles.exampleText}>A → B → A (MATCH! Tap now)</Text>
              <Text style={styles.exampleText}>B → C → B (MATCH! Tap now)</Text>
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

          <View style={styles.nLevelBadge}>
            <Text style={styles.nLevelText}>{nLevel}-Back Challenge</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeLeft}s</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{correctMatches}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{missedMatches}</Text>
              <Text style={styles.statLabel}>Missed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{incorrectTaps}</Text>
              <Text style={styles.statLabel}>False+</Text>
            </View>
          </View>

          <View style={styles.letterArea}>
            {showingLetter && (
              <Animated.View
                style={[
                  styles.letterCircle,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <Text style={styles.letterText}>{currentLetter}</Text>
              </Animated.View>
            )}

            <Text style={styles.hint}>
              Tap when the letter matches {nLevel} positions back
            </Text>

            <TouchableOpacity
              style={styles.tapButton}
              onPress={handleTap}
              disabled={!showingLetter}
            >
              <Text style={styles.tapButtonText}>TAP MATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(finalScore)}</Text>
            <Text style={styles.scoreLabel}>Memory Score</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Final N-Level</Text>
              <Text style={styles.resultValue}>{nLevel}-back</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct Matches</Text>
              <Text style={styles.resultValue}>{correctMatches}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Missed Matches</Text>
              <Text style={styles.resultValue}>{missedMatches}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>False Positives</Text>
              <Text style={styles.resultValue}>{incorrectTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Accuracy</Text>
              <Text style={styles.resultValue}>{Math.round(accuracy * 100)}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>False Positive Rate</Text>
              <Text style={styles.resultValue}>{Math.round(falsePositiveRate * 100)}%</Text>
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
