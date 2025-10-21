import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronDown, ChevronUp, Brain, Target, BookOpen, TrendingUp } from 'lucide-react-native';
import { getMoreInsightsData } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';

export default function MoreInsights() {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const insightsData = getMoreInsightsData();

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <Text style={[styles.title, { color: theme.colors.text }]}>More Insights</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={theme.colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>

      <Animated.View style={[styles.content, { maxHeight, opacity }]}>
        <View style={styles.insightGrid}>
          <View style={[styles.insightCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.insightHeader}>
              <Brain size={20} color={theme.colors.primary} />
              <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Mental Clarity</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.colors.text }]}>{insightsData.mentalClarity.trend}</Text>
            <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
              {insightsData.mentalClarity.description}
            </Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.insightHeader}>
              <Target size={20} color={theme.colors.warning} />
              <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Goals</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.colors.text }]}>
              {insightsData.goals.completed}/{insightsData.goals.total}
            </Text>
            <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
              {insightsData.goals.description}
            </Text>
          </View>

          <View style={[styles.insightCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.insightHeader}>
              <BookOpen size={20} color={theme.colors.primary} />
              <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Journaling</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.colors.text }]}>{insightsData.journaling.entries}</Text>
            <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
              {insightsData.journaling.description}
            </Text>
            <View style={[styles.streakBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.streakText, { color: theme.colors.text }]}>🔥 {insightsData.journaling.streak} day streak</Text>
            </View>
          </View>

          <View style={[styles.insightCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Engagement</Text>
            </View>
            <Text style={[styles.insightValue, { color: theme.colors.text }]}>{insightsData.engagement.score}%</Text>
            <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>
              {insightsData.engagement.description}
            </Text>
            <View style={styles.engagementBar}>
              <View 
                style={[
                  styles.engagementFill, 
                  { width: `${insightsData.engagement.score}%`, backgroundColor: theme.colors.primary }
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.additionalInsights}>
          <Text style={[styles.additionalTitle, { color: theme.colors.text }]}>Weekly Highlights</Text>
          <View style={styles.highlightsList}>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightEmoji}>🌟</Text>
              <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                Best mood day was Tuesday after morning exercise
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightEmoji}>💤</Text>
              <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                Sleep quality improved 15% with consistent bedtime
              </Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightEmoji}>🎯</Text>
              <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                Completed 3 new habits this week
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    overflow: 'hidden',
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    minHeight: 120,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  streakBadge: {
    backgroundColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  engagementBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  additionalInsights: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightEmoji: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  highlightText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
});