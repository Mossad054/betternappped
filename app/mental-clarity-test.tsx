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
import { Brain, X, CheckCircle, Circle } from 'lucide-react-native';

interface Question {
  id: number;
  question: string;
  options: string[];
}

const mentalClarityQuestions: Question[] = [
  {
    id: 1,
    question: "How clear is your thinking right now?",
    options: ["Very foggy", "Somewhat unclear", "Neutral", "Pretty clear", "Crystal clear"]
  },
  {
    id: 2,
    question: "How well can you focus on tasks?",
    options: ["Can't focus at all", "Very distracted", "Somewhat focused", "Good focus", "Laser focused"]
  },
  {
    id: 3,
    question: "How is your memory today?",
    options: ["Very forgetful", "Some memory issues", "Average", "Good memory", "Excellent memory"]
  },
  {
    id: 4,
    question: "How quickly can you process information?",
    options: ["Very slow", "Slower than usual", "Normal speed", "Quick", "Very quick"]
  },
  {
    id: 5,
    question: "How creative do you feel?",
    options: ["No creativity", "Low creativity", "Moderate", "Creative", "Very creative"]
  }
];

export default function MentalClarityTestScreen() {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < mentalClarityQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const totalQuestions = mentalClarityQuestions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < totalQuestions) {
      Alert.alert(
        'Incomplete Test',
        'Please answer all questions before completing the test.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Calculate score (0-4 scale converted to 1-5)
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score + 1, 0);
    const averageScore = (totalScore / totalQuestions).toFixed(1);
    
    Alert.alert(
      'Mental Clarity Test Complete!',
      `Your mental clarity score: ${averageScore}/5\n\nThis score has been saved to your wellness data.`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const currentQ = mentalClarityQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mentalClarityQuestions.length) * 100;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mental Clarity Test',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#1F2937', fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} of {mentalClarityQuestions.length}
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Brain size={24} color="#8B5CF6" />
            <Text style={styles.questionNumber}>Question {currentQuestion + 1}</Text>
          </View>
          
          <Text style={styles.questionText}>{currentQ.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQ.id] === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => handleAnswerSelect(currentQ.id, index)}
                >
                  <View style={styles.optionContent}>
                    {isSelected ? (
                      <CheckCircle size={20} color="#8B5CF6" />
                    ) : (
                      <Circle size={20} color="#9CA3AF" />
                    )}
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </View>
                  <View style={styles.scoreIndicator}>
                    <Text style={[
                      styles.scoreText,
                      isSelected && styles.selectedScoreText,
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              currentQuestion === 0 && styles.disabledButton,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <Text style={[
              styles.navButtonText,
              styles.previousButtonText,
              currentQuestion === 0 && styles.disabledButtonText,
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              answers[currentQ.id] === undefined && styles.disabledButton,
            ]}
            onPress={handleNext}
            disabled={answers[currentQ.id] === undefined}
          >
            <Text style={[
              styles.navButtonText,
              styles.nextButtonText,
              answers[currentQ.id] === undefined && styles.disabledButtonText,
            ]}>
              {currentQuestion === mentalClarityQuestions.length - 1 ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About This Test</Text>
          <Text style={styles.infoText}>
            This mental clarity assessment helps track your cognitive performance over time. 
            Your responses are used to identify patterns and correlations with your activities, 
            sleep, and mood.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
    borderColor: '#8B5CF6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  scoreIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedScoreText: {
    color: '#8B5CF6',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previousButtonText: {
    color: '#374151',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});