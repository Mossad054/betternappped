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
import { X, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

// Expanded symbol pool for randomization
const ALL_SYMBOLS = ['🔺', '⚫', '🔷', '⭐', '🔶', '🟣', '🔸', '🟥', '🟢'];

interface Match {
  symbol: string;
  number: number;
}

export default function SpeedTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentMatch, setCurrentMatch] = useState<Match>({ symbol: '🔺', number: 1 });
  const [correctMatches, setCorrectMatches] = useState(0);
  const [incorrectMatches, setIncorrectMatches] = useState(0);
  const [saving, setSaving] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolMap, setSymbolMap] = useState<{[key: string]: number}>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize symbols on component mount
    initializeSymbols();
  }, []);

  useEffect(() => {
    if (started && !finished) {
      generateNewMatch();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [started, finished]);

  const initializeSymbols = () => {
    // Randomly select 3 symbols from the pool to prevent pattern memorization
    const shuffled = [...ALL_SYMBOLS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    setSymbols(selected);

    // Create symbol map
    const map: {[key: string]: number} = {};
    selected.forEach((symbol, index) => {
      map[symbol] = index + 1;
    });
    setSymbolMap(map);
  };

  const generateNewMatch = () => {
    if (symbols.length === 0) return;

    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    setCurrentMatch({ symbol: randomSymbol, number: randomNumber });

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
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

  const handleAnswer = (isMatch: boolean) => {
    const actualMatch = symbolMap[currentMatch.symbol] === currentMatch.number;

    if (isMatch === actualMatch) {
      setCorrectMatches((prev) => prev + 1);
    } else {
      setIncorrectMatches((prev) => prev + 1);
    }

    generateNewMatch();
  };

  const handleStart = () => {
    // Re-randomize symbols for a fresh test
    initializeSymbols();
    setStarted(true);
  };

  const handleFinish = async () => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalAttempts = correctMatches + incorrectMatches;
    // Improved scoring: combines accuracy and throughput
    // - Accuracy component (50%): percentage of correct answers
    // - Throughput component (50%): rewards more attempts, optimal ~40 in 45s
    const accuracy = totalAttempts > 0 ? (correctMatches / totalAttempts) * 100 : 0;
    const throughputScore = Math.min(50, (correctMatches / 40) * 50);
    const score = Math.min(100, (accuracy * 0.5) + throughputScore);

    setSaving(true);
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      await MentalClarityService.saveTestResult({
        user_id: user.id,
        test_type: 'speed',
        score: Math.round(score),
        date: today,
        metrics: {
          speedCorrectMatches: correctMatches,
          incorrectMatches,
          totalAttempts,
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
      backgroundColor: '#F59E0B15',
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
    keyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      width: '100%',
      ...theme.shadows.small,
    },
    keyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
    },
    keyRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    keyItem: {
      alignItems: 'center',
    },
    keySymbol: {
      fontSize: 40,
      marginBottom: 8,
    },
    keyNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#F59E0B',
    },
    startButton: {
      backgroundColor: '#F59E0B',
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
      backgroundColor: '#F59E0B',
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
    matchArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    matchDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 40,
      marginBottom: 60,
    },
    matchSymbol: {
      fontSize: 80,
    },
    matchEquals: {
      fontSize: 40,
      color: theme.colors.textSecondary,
    },
    matchNumber: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#F59E0B',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 20,
      paddingHorizontal: 20,
    },
    answerButton: {
      flex: 1,
      paddingVertical: 20,
      borderRadius: 12,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    matchButton: {
      backgroundColor: '#10B981',
    },
    noMatchButton: {
      backgroundColor: '#EF4444',
    },
    answerButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    scoreCircle: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#F59E0B15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      borderWidth: 8,
      borderColor: '#F59E0B',
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#F59E0B',
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

  const totalAttempts = correctMatches + incorrectMatches;
  const accuracy = totalAttempts > 0 ? (correctMatches / totalAttempts) * 100 : 0;
  const throughputScore = Math.min(50, (correctMatches / 40) * 50);
  const finalScore = Math.min(100, (accuracy * 0.5) + throughputScore);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Processing Speed',
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
            <Zap size={40} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Processing Speed</Text>
          <Text style={styles.description}>
            Match symbols to numbers as fast as you can
          </Text>

          <View style={styles.keyCard}>
            <Text style={styles.keyTitle}>Symbol Key</Text>
            <View style={styles.keyRow}>
              {symbols.map((symbol, index) => (
                <View key={symbol} style={styles.keyItem}>
                  <Text style={styles.keySymbol}>{symbol}</Text>
                  <Text style={styles.keyNumber}>{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Test (45s)</Text>
          </TouchableOpacity>
        </View>
      ) : !finished ? (
        <View style={styles.testContainer}>
          <View style={styles.timerBar}>
            <View style={[styles.timerFill, { width: `${(timeLeft / 45) * 100}%` }]} />
          </View>

          {/* Timer Only - Hide stats to prevent cramming */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeLeft}s</Text>
              <Text style={styles.statLabel}>Time Remaining</Text>
            </View>
          </View>

          <View style={styles.matchArea}>
            <Animated.View style={[styles.matchDisplay, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.matchSymbol}>{currentMatch.symbol}</Text>
              <Text style={styles.matchEquals}>=</Text>
              <Text style={styles.matchNumber}>{currentMatch.number}</Text>
            </Animated.View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.answerButton, styles.matchButton]}
                onPress={() => handleAnswer(true)}
              >
                <Text style={styles.answerButtonText}>✓ Match</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerButton, styles.noMatchButton]}
                onPress={() => handleAnswer(false)}
              >
                <Text style={styles.answerButtonText}>✗ No Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{Math.round(finalScore)}</Text>
            <Text style={styles.scoreLabel}>Speed Score</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct Matches</Text>
              <Text style={styles.resultValue}>{correctMatches}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Incorrect</Text>
              <Text style={styles.resultValue}>{incorrectMatches}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Attempts</Text>
              <Text style={styles.resultValue}>{totalAttempts}</Text>
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
