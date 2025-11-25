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
import { X, Grid3X3 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

const GRID_SIZE = 4;
const INITIAL_PATTERN_LENGTH = 3;

export default function PatternTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(1);
  const [correctPatterns, setCorrectPatterns] = useState(0);
  const [totalPatterns, setTotalPatterns] = useState(0);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnims = useRef<Animated.Value[]>(
    Array(GRID_SIZE * GRID_SIZE).fill(null).map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (started && !finished) {
      generatePattern();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [started]);

  const generatePattern = () => {
    const patternLength = INITIAL_PATTERN_LENGTH + level - 1;
    const newPattern: number[] = [];

    while (newPattern.length < patternLength) {
      const cell = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      if (!newPattern.includes(cell)) {
        newPattern.push(cell);
      }
    }

    setPattern(newPattern);
    setUserPattern([]);
    setCurrentIndex(0);
    setPhase('showing');
    setTotalPatterns(prev => prev + 1);

    // Show pattern to user
    showPattern(newPattern);
  };

  const showPattern = (patternToShow: number[]) => {
    let index = 0;

    const showNext = () => {
      if (index >= patternToShow.length) {
        setTimeout(() => {
          setPhase('input');
        }, 500);
        return;
      }

      const cell = patternToShow[index];

      // Animate the cell
      Animated.sequence([
        Animated.timing(scaleAnims[cell], {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[cell], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentIndex(index);
      index++;

      timerRef.current = setTimeout(showNext, 600);
    };

    showNext();
  };

  const handleCellPress = (cellIndex: number) => {
    if (phase !== 'input') return;

    const newUserPattern = [...userPattern, cellIndex];
    setUserPattern(newUserPattern);

    // Animate tap
    Animated.sequence([
      Animated.timing(scaleAnims[cellIndex], {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[cellIndex], {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      const isCorrect = pattern.every((cell, i) => cell === newUserPattern[i]);

      if (isCorrect) {
        setCorrectPatterns(prev => prev + 1);
        setScore(prev => prev + level * 10);
        setMaxLevel(Math.max(maxLevel, level + 1));

        setPhase('feedback');
        setTimeout(() => {
          if (level < 7) { // Max 7 levels
            setLevel(prev => prev + 1);
            generatePattern();
          } else {
            handleFinish();
          }
        }, 1000);
      } else {
        setPhase('feedback');
        setTimeout(() => {
          if (level > 1) {
            setLevel(prev => prev - 1);
          }

          if (totalPatterns >= 10) { // End after 10 patterns
            handleFinish();
          } else {
            generatePattern();
          }
        }, 1000);
      }
    }
  };

  const handleFinish = async () => {
    setFinished(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Calculate final score
    const accuracy = totalPatterns > 0 ? (correctPatterns / totalPatterns) * 100 : 0;

    // Scoring: accuracy (60%) + level bonus (40%)
    const accuracyScore = accuracy * 0.6;
    const levelBonus = Math.min(40, maxLevel * 6);
    const finalScore = Math.max(0, Math.min(100, accuracyScore + levelBonus));

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'memory', // Using memory type
        score: Math.round(finalScore),
        date: today,
        metrics: {
          memoryCorrectMatches: correctPatterns,
          missedMatches: totalPatterns - correctPatterns,
          nLevel: maxLevel,
          memoryAccuracy: Math.round(accuracy),
        },
        timestamp: new Date().toISOString(),
        synced: true,
      });

      await MentalClarityService.calculateClarityIndex(user.id, today);
    }
    setSaving(false);
  };

  const accuracy = totalPatterns > 0 ? (correctPatterns / totalPatterns) * 100 : 0;
  const accuracyScore = accuracy * 0.6;
  const levelBonus = Math.min(40, maxLevel * 6);
  const finalScore = Math.max(0, Math.min(100, accuracyScore + levelBonus));

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
      backgroundColor: '#A855F715',
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
      backgroundColor: '#A855F7',
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
    levelBar: {
      padding: 20,
      alignItems: 'center',
    },
    levelText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#A855F7',
    },
    phaseText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    gridContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 280,
      height: 280,
    },
    cell: {
      width: 65,
      height: 65,
      margin: 2.5,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    cellDefault: {
      backgroundColor: theme.colors.surface,
    },
    cellHighlighted: {
      backgroundColor: '#A855F7',
    },
    cellSelected: {
      backgroundColor: '#10B981',
    },
    cellWrong: {
      backgroundColor: '#EF4444',
    },
    feedbackContainer: {
      padding: 20,
      alignItems: 'center',
    },
    feedbackText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    scoreCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#A855F715',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 8,
      borderColor: '#A855F7',
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#A855F7',
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

  const getCellStyle = (index: number) => {
    if (phase === 'showing' && pattern[currentIndex] === index) {
      return styles.cellHighlighted;
    }
    if (phase === 'input' && userPattern.includes(index)) {
      return styles.cellSelected;
    }
    if (phase === 'feedback') {
      const isCorrect = pattern.every((cell, i) => cell === userPattern[i]);
      if (pattern.includes(index)) {
        return isCorrect ? styles.cellSelected : styles.cellWrong;
      }
    }
    return styles.cellDefault;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Pattern Recall',
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
            <Grid3X3 size={40} color="#A855F7" />
          </View>
          <Text style={styles.title}>Pattern Recall</Text>
          <Text style={styles.description}>
            Remember and recreate the patterns
          </Text>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionTitle}>How it Works</Text>
            <Text style={styles.instructionText}>
              {'\u2022'} Watch as cells light up in sequence{'\n'}
              {'\u2022'} Tap the cells in the same order{'\n'}
              {'\u2022'} Patterns get longer as you level up{'\n'}
              {'\u2022'} Complete as many patterns as you can
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={() => setStarted(true)}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      ) : !finished ? (
        <View style={styles.testContainer}>
          <View style={styles.levelBar}>
            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.phaseText}>
              {phase === 'showing' ? 'Watch the pattern...' :
               phase === 'input' ? 'Your turn - tap the sequence!' :
               'Checking...'}
            </Text>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleCellPress(index)}
                  disabled={phase !== 'input'}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.cell,
                      getCellStyle(index),
                      { transform: [{ scale: scaleAnims[index] }] },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(finalScore)}</Text>
            <Text style={styles.scoreLabel}>Pattern Score</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Max Level Reached</Text>
              <Text style={styles.resultValue}>{maxLevel}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct Patterns</Text>
              <Text style={styles.resultValue}>{correctPatterns}/{totalPatterns}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Accuracy</Text>
              <Text style={styles.resultValue}>{Math.round(accuracy)}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Score</Text>
              <Text style={styles.resultValue}>{score}</Text>
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
