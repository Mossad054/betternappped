/**
 * Hook for fetching experiment insights and analysis
 * 
 * Provides real-time analysis of how an experiment affects:
 * - 😊 Mood
 * - 😴 Sleep
 * - 🧠 Clarity
 * - ⚡ Productivity
 */

import { useState, useEffect } from 'react';
import { ExperimentsService } from '@/services/experiments.service';

export interface WellnessImpact {
  metric: string;
  emoji: string;
  change: number;
  percentageChange: number;
  direction: 'improves' | 'worsens' | 'no-effect';
  strength: 'none' | 'small' | 'medium' | 'large';
  isSignificant: boolean;
  interpretation: string;
  baseline: number;
  current: number;
}

export interface ExperimentInsights {
  experimentId: string;
  experimentName: string;
  emoji: string;
  status: string;
  
  progress: {
    completedDays: number;
    totalDays: number;
    completionRate: number;
    confidence: 'high' | 'medium' | 'low';
  };
  
  wellnessImpact: WellnessImpact[];
  
  overall: {
    score: number;
    level: 'highly-positive' | 'positive' | 'neutral' | 'negative' | 'highly-negative';
    recommendation: string;
    shouldContinue: boolean;
    convertToHabit: boolean;
  };
  
  keyFindings: string[];
  
  timeSeriesData?: {
    dates: string[];
    moodScores: (number | null)[];
    sleepHours: (number | null)[];
    clarityScores: (number | null)[];
    productivityScores: (number | null)[];
    experimentDays: boolean[];
  };
}

export function useExperimentInsights(experimentId: string | null, userId: string | null) {
  const [insights, setInsights] = useState<ExperimentInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!experimentId || !userId) {
      setInsights(null);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await ExperimentsService.getExperimentInsights(experimentId, userId);
        
        if (err) {
          setError(typeof err === 'string' ? err : 'Failed to load insights');
          setInsights(null);
        } else {
          setInsights(data);
        }
      } catch (err) {
        console.error('Error fetching experiment insights:', err);
        setError('Failed to load insights');
        setInsights(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [experimentId, userId]);

  const refetch = async () => {
    if (!experimentId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await ExperimentsService.getExperimentInsights(experimentId, userId);
      
      if (err) {
        setError(typeof err === 'string' ? err : 'Failed to load insights');
        setInsights(null);
      } else {
        setInsights(data);
      }
    } catch (err) {
      console.error('Error fetching experiment insights:', err);
      setError('Failed to load insights');
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    loading,
    error,
    refetch
  };
}
