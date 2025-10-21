import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import {
  X,
  Search,
  Plus,
  Clock,
  Star,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react-native';
import {
  getHabitLibraryData,
  HabitLibraryItem,
  HabitCategory,
  getActiveHabits,
  ActiveHabit,
} from '@/constants/mockData';

export default function HabitLibraryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'All'>('All');
  const [selectedHabit, setSelectedHabit] = useState<HabitLibraryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeHabits, setActiveHabits] = useState<ActiveHabit[]>(getActiveHabits());

  const habitLibraryData = getHabitLibraryData();
  const categories: (HabitCategory | 'All')[] = ['All', 'Intimacy', 'Health', 'Anxiety', 'Mood', 'Sleep', 'MentalClarity'];

  const filteredHabits = () => {
    let habits: HabitLibraryItem[] = [];
    
    if (selectedCategory === 'All') {
      Object.values(habitLibraryData).forEach(categoryHabits => {
        habits = [...habits, ...categoryHabits];
      });
    } else {
      habits = habitLibraryData[selectedCategory] || [];
    }

    if (searchQuery.trim()) {
      habits = habits.filter(habit =>
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return habits;
  };

  const handleAddHabit = (habit: HabitLibraryItem) => {
    const newActiveHabit: ActiveHabit = {
      id: `active-${Date.now()}`,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      quote: habit.expectedOutcome,
      currentDay: 1,
      totalDays: 7,
      completedToday: false,
      reminderEnabled: true,
      streak: 0,
      progressPercentage: 14,
      feedback: undefined,
    };

    setActiveHabits(prev => [...prev, newActiveHabit]);
    setModalVisible(false);
    setSelectedHabit(null);
  };

  const isHabitActive = (habit: HabitLibraryItem) => {
    return activeHabits.some(active => active.name === habit.name);
  };

  const getCategoryEmoji = (category: HabitCategory) => {
    const emojis = {
      Intimacy: '💕',
      Health: '❤️',
      Anxiety: '🧘',
      Mood: '😊',
      Sleep: '🌙',
      MentalClarity: '🧠',
    };
    return emojis[category];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return theme.colors.primary;
      case 'Medium': return theme.colors.warning;
      case 'Hard': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Habit Library',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search habits..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.colors.card },
                selectedCategory === category && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: theme.colors.textSecondary },
                selectedCategory === category && { color: '#FFFFFF' },
              ]}>
                {category === 'All' ? 'All' : `${getCategoryEmoji(category as HabitCategory)} ${category}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habits Grid */}
        <View style={styles.habitsGrid}>
          {filteredHabits().map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                setSelectedHabit(habit);
                setModalVisible(true);
              }}
              disabled={isHabitActive(habit)}
            >
              {isHabitActive(habit) && (
                <View style={[styles.activeBadge, { backgroundColor: theme.colors.primary }]}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}

              <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
              <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>
                {habit.description}
              </Text>

              <View style={styles.habitMeta}>
                <View style={styles.metaItem}>
                  <Clock size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {habit.timeRequired}
                  </Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(habit.difficulty) }]}>
                  <Text style={styles.difficultyText}>{habit.difficulty}</Text>
                </View>
              </View>

              <View style={styles.benefitsContainer}>
                {habit.benefits.slice(0, 2).map((benefit, index) => (
                  <View key={index} style={styles.benefitChip}>
                    <Text style={[styles.benefitText, { color: theme.colors.primary }]}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Custom Habit Button */}
        <TouchableOpacity
          style={[styles.createCustomButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            // TODO: Implement custom habit creation
            console.log('Create custom habit');
          }}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createCustomText}>Create Custom Habit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Habit Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {selectedHabit && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.habitEmojiLarge}>{selectedHabit.emoji}</Text>
                    <View>
                      <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                        {selectedHabit.name}
                      </Text>
                      <Text style={[styles.modalCategory, { color: theme.colors.textSecondary }]}>
                        {selectedHabit.category}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
                    {selectedHabit.description}
                  </Text>

                  <View style={styles.expectedOutcome}>
                    <Text style={[styles.outcomeTitle, { color: theme.colors.text }]}>Expected Outcome</Text>
                    <Text style={[styles.outcomeText, { color: theme.colors.textSecondary }]}>
                      {selectedHabit.expectedOutcome}
                    </Text>
                  </View>

                  <View style={styles.habitDetails}>
                    <View style={styles.detailItem}>
                      <Clock size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Time Required</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {selectedHabit.timeRequired}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Star size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Difficulty</Text>
                      <Text style={[styles.detailValue, { color: getDifficultyColor(selectedHabit.difficulty) }]}>
                        {selectedHabit.difficulty}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.benefitsSection}>
                    <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>Benefits</Text>
                    {selectedHabit.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <View style={[styles.benefitBullet, { backgroundColor: theme.colors.primary }]} />
                        <Text style={[styles.benefitItemText, { color: theme.colors.textSecondary }]}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  {isHabitActive(selectedHabit) ? (
                    <View style={[styles.alreadyActiveButton, { backgroundColor: theme.colors.success }]}>
                      <CheckCircle size={20} color="#FFFFFF" />
                      <Text style={styles.alreadyActiveText}>Already Active</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleAddHabit(selectedHabit)}
                    >
                      <Plus size={20} color="#FFFFFF" />
                      <Text style={styles.addHabitText}>Add to Active Habits</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  habitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  habitEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  benefitChip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  benefitText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10B981',
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  createCustomText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmojiLarge: {
    fontSize: 40,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 20,
  },
  expectedOutcome: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  outcomeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  outcomeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  habitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
    marginRight: 12,
  },
  benefitItemText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addHabitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alreadyActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  alreadyActiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
