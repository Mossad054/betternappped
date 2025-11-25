import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, Heart, MessageCircle, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { IntimacyCheckInService, CheckInRecommendation } from '@/services/intimacyCheckIn.service';

interface DailyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function DailyCheckInModal({
  visible,
  onClose,
  onComplete,
}: DailyCheckInModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Check-in data
  const [overallFeeling, setOverallFeeling] = useState<string>('');
  const [emotionalConnection, setEmotionalConnection] = useState(5);
  const [physicalConnection, setPhysicalConnection] = useState(5);
  const [communicationQuality, setCommunicationQuality] = useState(5);
  const [desires, setDesires] = useState('');
  const [challenges, setChallenges] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [needsAttention, setNeedsAttention] = useState<string[]>([]);
  const [relationshipType, setRelationshipType] = useState<'solo' | 'partnered' | 'exploring'>('partnered');
  const [recommendations, setRecommendations] = useState<CheckInRecommendation[]>([]);

  const feelings = [
    { id: 'amazing', emoji: '🤩', label: 'Amazing' },
    { id: 'good', emoji: '😊', label: 'Good' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'struggling', emoji: '😔', label: 'Struggling' },
    { id: 'disconnected', emoji: '💔', label: 'Disconnected' },
  ];

  const needs = [
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'physical-intimacy', label: 'Physical Intimacy', icon: '💑' },
    { id: 'emotional-closeness', label: 'Emotional Closeness', icon: '💕' },
    { id: 'quality-time', label: 'Quality Time', icon: '⏰' },
    { id: 'conflict', label: 'Conflict Resolution', icon: '🤝' },
  ];

  useEffect(() => {
    if (visible) {
      checkExistingCheckIn();
    }
  }, [visible]);

  const checkExistingCheckIn = async () => {
    if (!user) return;

    const { data } = await IntimacyCheckInService.getTodayCheckIn(user.id);
    if (data) {
      // Load existing data
      setOverallFeeling(data.overall_feeling || '');
      setEmotionalConnection(data.emotional_connection || 5);
      setPhysicalConnection(data.physical_connection || 5);
      setCommunicationQuality(data.communication_quality || 5);
      setDesires(data.desires || '');
      setChallenges(data.challenges || '');
      setGratitude(data.gratitude || '');
      setReflectionNotes(data.reflection_notes || '');
      setNeedsAttention(data.needs_attention || []);
      if (data.relationship_type) setRelationshipType(data.relationship_type);

      // Show recommendations
      if (data.id) {
        const { data: recs } = await IntimacyCheckInService.getRecommendations(data.id);
        if (recs) setRecommendations(recs);
        setStep(4); // Go to recommendations
      }
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setOverallFeeling('');
    setEmotionalConnection(5);
    setPhysicalConnection(5);
    setCommunicationQuality(5);
    setDesires('');
    setChallenges('');
    setGratitude('');
    setReflectionNotes('');
    setNeedsAttention([]);
    setRecommendations([]);
  };

  const handleSave = async () => {
    if (!user || !overallFeeling) {
      Alert.alert('Missing Information', 'Please select how you\'re feeling today.');
      return;
    }

    setSaving(true);

    try {
      const checkInData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        overall_feeling: overallFeeling as any,
        emotional_connection: emotionalConnection,
        physical_connection: physicalConnection,
        communication_quality: communicationQuality,
        desires,
        challenges,
        gratitude,
        reflection_notes: reflectionNotes,
        needs_attention: needsAttention,
        relationship_type: relationshipType,
      };

      const { data, error } = await IntimacyCheckInService.saveCheckIn(checkInData);

      if (error) throw error;

      // Get recommendations
      if (data?.id) {
        const { data: recs } = await IntimacyCheckInService.getRecommendations(data.id);
        if (recs) setRecommendations(recs);
      }

      setStep(4); // Show recommendations
      onComplete?.();
    } catch (error) {
      console.error('Error saving check-in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleNeed = (needId: string) => {
    setNeedsAttention((prev) =>
      prev.includes(needId) ? prev.filter((n) => n !== needId) : [...prev, needId]
    );
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: 60,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 24,
    },
    feelingsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    feelingOption: {
      width: '30%',
      aspectRatio: 1,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedFeeling: {
      borderColor: '#EC4899',
      backgroundColor: '#FDF2F8',
    },
    feelingEmoji: {
      fontSize: 32,
      marginBottom: 8,
    },
    feelingLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    sliderContainer: {
      marginBottom: 24,
    },
    sliderLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    slider: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    sliderDot: {
      flex: 1,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedDot: {
      backgroundColor: '#EC4899',
    },
    sliderText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    selectedSliderText: {
      color: '#FFFFFF',
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.textPrimary,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    needsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    needChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedNeed: {
      borderColor: '#EC4899',
      backgroundColor: '#FDF2F8',
    },
    needIcon: {
      fontSize: 16,
    },
    needLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textPrimary,
    },
    recommendationCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.small,
    },
    recommendationType: {
      fontSize: 12,
      fontWeight: '600',
      color: '#EC4899',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    recommendationTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    recommendationDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    recommendationButton: {
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: '#EC4899',
      alignItems: 'center',
    },
    recommendationButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    footer: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    backButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    nextButton: {
      backgroundColor: '#EC4899',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    backButtonText: {
      color: theme.colors.textPrimary,
    },
    nextButtonText: {
      color: '#FFFFFF',
    },
  });

  const renderStep1 = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>How are you feeling?</Text>
      <Text style={styles.stepSubtitle}>
        Let's check in on your intimacy wellness today
      </Text>

      <View style={styles.feelingsGrid}>
        {feelings.map((feeling) => (
          <TouchableOpacity
            key={feeling.id}
            style={[
              styles.feelingOption,
              overallFeeling === feeling.id && styles.selectedFeeling,
            ]}
            onPress={() => setOverallFeeling(feeling.id)}
          >
            <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
            <Text style={styles.feelingLabel}>{feeling.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Emotional Connection (1-10)</Text>
        <View style={styles.slider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.sliderDot, emotionalConnection === num && styles.selectedDot]}
              onPress={() => setEmotionalConnection(num)}
            >
              <Text
                style={[
                  styles.sliderText,
                  emotionalConnection === num && styles.selectedSliderText,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Physical Connection (1-10)</Text>
        <View style={styles.slider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.sliderDot, physicalConnection === num && styles.selectedDot]}
              onPress={() => setPhysicalConnection(num)}
            >
              <Text
                style={[
                  styles.sliderText,
                  physicalConnection === num && styles.selectedSliderText,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Communication Quality (1-10)</Text>
        <View style={styles.slider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.sliderDot, communicationQuality === num && styles.selectedDot]}
              onPress={() => setCommunicationQuality(num)}
            >
              <Text
                style={[
                  styles.sliderText,
                  communicationQuality === num && styles.selectedSliderText,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Reflection</Text>
      <Text style={styles.stepSubtitle}>Share your thoughts and feelings</Text>

      <TextInput
        style={styles.input}
        placeholder="What do you desire in your intimate life?"
        placeholderTextColor={theme.colors.textTertiary}
        value={desires}
        onChangeText={setDesires}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Any challenges you're facing?"
        placeholderTextColor={theme.colors.textTertiary}
        value={challenges}
        onChangeText={setChallenges}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="What are you grateful for?"
        placeholderTextColor={theme.colors.textTertiary}
        value={gratitude}
        onChangeText={setGratitude}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Additional thoughts or reflections..."
        placeholderTextColor={theme.colors.textTertiary}
        value={reflectionNotes}
        onChangeText={setReflectionNotes}
        multiline
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>What needs attention?</Text>
      <Text style={styles.stepSubtitle}>Select areas you'd like to improve</Text>

      <View style={styles.needsGrid}>
        {needs.map((need) => (
          <TouchableOpacity
            key={need.id}
            style={[styles.needChip, needsAttention.includes(need.id) && styles.selectedNeed]}
            onPress={() => toggleNeed(need.id)}
          >
            <Text style={styles.needIcon}>{need.icon}</Text>
            <Text style={styles.needLabel}>{need.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Recommendations for You</Text>
      <Text style={styles.stepSubtitle}>
        Based on your check-in, here are personalized suggestions
      </Text>

      {recommendations.length === 0 ? (
        <Text style={[styles.stepSubtitle, { textAlign: 'center', marginTop: 40 }]}>
          No recommendations at this time. Keep up the great work!
        </Text>
      ) : (
        recommendations.map((rec) => (
          <View key={rec.id} style={styles.recommendationCard}>
            <Text style={styles.recommendationType}>{rec.type}</Text>
            <Text style={styles.recommendationTitle}>{rec.title}</Text>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            <TouchableOpacity style={styles.recommendationButton}>
              <Text style={styles.recommendationButtonText}>Start Now</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modal}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daily Check-In</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <View style={styles.footer}>
            {step > 1 && step < 4 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={() => setStep(step - 1)}
              >
                <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
              </TouchableOpacity>
            )}
            {step < 3 && (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={() => setStep(step + 1)}
                disabled={step === 1 && !overallFeeling}
              >
                <Text style={[styles.buttonText, styles.nextButtonText]}>Next</Text>
              </TouchableOpacity>
            )}
            {step === 3 && (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={[styles.buttonText, styles.nextButtonText]}>
                  {saving ? 'Saving...' : 'Complete Check-In'}
                </Text>
              </TouchableOpacity>
            )}
            {step === 4 && (
              <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={onClose}>
                <Text style={[styles.buttonText, styles.nextButtonText]}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
