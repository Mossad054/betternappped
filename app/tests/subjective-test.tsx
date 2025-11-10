import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { X, Sparkles } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MentalClarityService } from '@/services/mental-clarity.service';

export default function SubjectiveTestScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mentalFog, setMentalFog] = useState(5);
  const [concentration, setConcentration] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save results');
      return;
    }

    // Calculate score (average of all sliders × 10)
    const avgScore = ((10 - mentalFog) + concentration + energy) / 3;
    const score = Math.round(avgScore * 10);

    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const result = await MentalClarityService.saveTestResult({
      user_id: user.id,
      test_type: 'subjective',
      score: Math.min(100, Math.max(0, score)),
      date: today,
      metrics: {
        mentalFog: Math.round(mentalFog * 10),
        concentration: Math.round(concentration * 10),
        energy: Math.round(energy * 10),
      },
      timestamp: new Date().toISOString(),
      synced: true,
    });

    setSaving(false);

    if (result.error) {
      Alert.alert('Error', 'Failed to save test result. Please try again.');
      return;
    }

    // Recalculate clarity index
    await MentalClarityService.calculateClarityIndex(user.id, today);

    Alert.alert(
      'Test Complete!',
      `Your subjective clarity score: ${score}/100`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const getFogLabel = (value: number) => {
    if (value <= 2) return 'Crystal Clear';
    if (value <= 4) return 'Clear';
    if (value <= 6) return 'Slight Fog';
    if (value <= 8) return 'Foggy';
    return 'Very Foggy';
  };

  const getConcentrationLabel = (value: number) => {
    if (value <= 2) return 'Cannot Focus';
    if (value <= 4) return 'Distracted';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Focused';
    return 'Laser Focused';
  };

  const getEnergyLabel = (value: number) => {
    if (value <= 2) return 'Exhausted';
    if (value <= 4) return 'Low Energy';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Energetic';
    return 'Full Energy';
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
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#3B82F615',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    sliderCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      ...theme.shadows.small,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sliderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#3B82F6',
    },
    sliderDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    currentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#3B82F6',
      textAlign: 'center',
      marginTop: 8,
    },
    scaleLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    scaleLabel: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    previewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      ...theme.shadows.small,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    previewScore: {
      alignItems: 'center',
      marginBottom: 16,
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#3B82F6',
    },
    scoreLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    previewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    previewLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    previewValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    completeButton: {
      backgroundColor: '#3B82F6',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    completeButtonDisabled: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    completeButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    infoCard: {
      backgroundColor: '#3B82F610',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#3B82F620',
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  const avgScore = ((10 - mentalFog) + concentration + energy) / 3;
  const finalScore = Math.round(avgScore * 10);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Self Check-In',
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
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles size={40} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.subtitle}>
            Rate your current mental state
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Be honest with yourself. This self-assessment helps track your perceived clarity over time.
          </Text>
        </View>

        {/* Mental Fog Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderTitle}>Mental Fog</Text>
            <Text style={styles.sliderValue}>{mentalFog.toFixed(1)}</Text>
          </View>
          <Text style={styles.sliderDescription}>
            How foggy or unclear is your thinking?
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            value={mentalFog}
            onValueChange={setMentalFog}
            minimumTrackTintColor="#EF4444"
            maximumTrackTintColor={theme.colors.surfaceVariant}
            thumbTintColor="#EF4444"
            step={0.5}
          />
          <Text style={[styles.currentLabel, { color: '#EF4444' }]}>
            {getFogLabel(mentalFog)}
          </Text>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Clear</Text>
            <Text style={styles.scaleLabel}>Foggy</Text>
          </View>
        </View>

        {/* Concentration Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderTitle}>Concentration</Text>
            <Text style={styles.sliderValue}>{concentration.toFixed(1)}</Text>
          </View>
          <Text style={styles.sliderDescription}>
            How well can you focus on tasks?
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            value={concentration}
            onValueChange={setConcentration}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor={theme.colors.surfaceVariant}
            thumbTintColor="#10B981"
            step={0.5}
          />
          <Text style={[styles.currentLabel, { color: '#10B981' }]}>
            {getConcentrationLabel(concentration)}
          </Text>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Can't Focus</Text>
            <Text style={styles.scaleLabel}>Laser Focused</Text>
          </View>
        </View>

        {/* Energy Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderTitle}>Energy & Motivation</Text>
            <Text style={styles.sliderValue}>{energy.toFixed(1)}</Text>
          </View>
          <Text style={styles.sliderDescription}>
            How energetic and motivated do you feel?
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            value={energy}
            onValueChange={setEnergy}
            minimumTrackTintColor="#F59E0B"
            maximumTrackTintColor={theme.colors.surfaceVariant}
            thumbTintColor="#F59E0B"
            step={0.5}
          />
          <Text style={[styles.currentLabel, { color: '#F59E0B' }]}>
            {getEnergyLabel(energy)}
          </Text>
          <View style={styles.scaleLabels}>
            <Text style={styles.scaleLabel}>Exhausted</Text>
            <Text style={styles.scaleLabel}>Full Energy</Text>
          </View>
        </View>

        {/* Preview Score */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Your Clarity Score</Text>
          <View style={styles.previewScore}>
            <Text style={styles.scoreValue}>{finalScore}</Text>
            <Text style={styles.scoreLabel}>out of 100</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Mental Clarity</Text>
            <Text style={styles.previewValue}>
              {finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Good' : finalScore >= 40 ? 'Fair' : 'Needs Attention'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            saving && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={saving}
        >
          <Text style={styles.completeButtonText}>
            {saving ? 'Saving...' : 'Complete Check-In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
