import { supabase } from '@/lib/supabase';
import { ConnectionScoreService } from './connectionScore.service';
import { IntimacyCheckInService } from './intimacyCheckIn.service';
import { IntimacyProgramService } from './intimacyProgram.service';

export interface AnalyticsOverview {
  current_score: number;
  score_trend: 'up' | 'down' | 'stable';
  score_change: number;
  total_check_ins: number;
  active_programs: number;
  completed_programs: number;
  experiments_completed: number;
  habits_tracked: number;
  insights: string[];
}

export interface TrendData {
  date: string;
  score: number;
  frequency: number;
  quality: number;
  emotional: number;
}

export interface PatternAnalysis {
  best_days: string[];
  best_times: string[];
  quality_trends: {
    improving: boolean;
    average_quality: number;
    peak_quality: number;
  };
  frequency_trends: {
    current_average: number;
    previous_average: number;
    change_percentage: number;
  };
}

export interface ProgramImpact {
  program_name: string;
  enrolled_date: string;
  completion_percentage: number;
  score_before: number;
  score_during: number;
  score_after?: number;
  impact_rating: 'high' | 'medium' | 'low' | 'pending';
}

export interface Achievement {
  id: string;
  type: 'streak' | 'milestone' | 'improvement' | 'completion';
  title: string;
  description: string;
  icon: string;
  date_earned: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class IntimacyAnalyticsService {
  // Get comprehensive analytics overview
  static async getOverview(
    userId: string
  ): Promise<{ data: AnalyticsOverview | null; error: any }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekDate = lastWeek.toISOString().split('T')[0];

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthDate = lastMonth.toISOString().split('T')[0];

      // Get current score
      const { data: currentScore } = await ConnectionScoreService.getLatestScore(userId);

      // Get score from last week for trend
      const { data: scoreHistory } = await ConnectionScoreService.getScoreHistory(
        userId,
        lastWeekDate,
        today
      );

      let scoreTrend: 'up' | 'down' | 'stable' = 'stable';
      let scoreChange = 0;

      if (currentScore && scoreHistory && scoreHistory.length > 1) {
        const previousScore = scoreHistory[scoreHistory.length - 1].total_score;
        scoreChange = currentScore.total_score - previousScore;

        if (scoreChange > 5) scoreTrend = 'up';
        else if (scoreChange < -5) scoreTrend = 'down';
      }

      // Get check-in count
      const { data: checkIns } = await IntimacyCheckInService.getCheckInHistory(
        userId,
        lastMonthDate,
        today
      );

      // Get program progress
      const { data: programProgress } = await IntimacyProgramService.getUserProgramProgress(userId);

      const activePrograms = programProgress?.filter(
        (p) => p.status === 'in_progress' || p.status === 'enrolled'
      ).length || 0;

      const completedPrograms = programProgress?.filter(
        (p) => p.status === 'completed'
      ).length || 0;

      // Get experiments completed (intimacy category)
      const { count: experimentsCompleted } = await supabase
        .from('experiments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .ilike('name', '%intimacy%');

      // Get intimacy habits
      const { count: habitsTracked } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('category', 'intimacy')
        .eq('is_active', true);

      // Generate insights
      const insights = await this.generateInsights(
        userId,
        currentScore,
        scoreHistory,
        checkIns,
        programProgress
      );

      const overview: AnalyticsOverview = {
        current_score: currentScore?.total_score || 0,
        score_trend: scoreTrend,
        score_change: scoreChange,
        total_check_ins: checkIns?.length || 0,
        active_programs: activePrograms,
        completed_programs: completedPrograms,
        experiments_completed: experimentsCompleted || 0,
        habits_tracked: habitsTracked || 0,
        insights,
      };

      return { data: overview, error: null };
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      return { data: null, error };
    }
  }

  // Get trend data for charts
  static async getTrends(
    userId: string,
    days: number = 30
  ): Promise<{ data: TrendData[] | null; error: any }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get score history
      const { data: scores } = await ConnectionScoreService.getScoreHistory(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Get metrics for detailed breakdown
      const { data: metrics } = await ConnectionScoreService.getMetrics(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const trends: TrendData[] = [];

      scores?.forEach((score) => {
        const metric = metrics?.find((m) => m.date === score.date);

        trends.push({
          date: score.date,
          score: score.total_score,
          frequency: score.frequency_score,
          quality: score.quality_score,
          emotional: score.emotional_score,
        });
      });

      return { data: trends, error: null };
    } catch (error) {
      console.error('Error fetching trends:', error);
      return { data: null, error };
    }
  }

  // Analyze patterns
  static async getPatterns(
    userId: string
  ): Promise<{ data: PatternAnalysis | null; error: any }> {
    try {
      const last90Days = new Date();
      last90Days.setDate(last90Days.getDate() - 90);

      const { data: metrics } = await ConnectionScoreService.getMetrics(
        userId,
        last90Days.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (!metrics || metrics.length === 0) {
        return { data: null, error: 'No data available' };
      }

      // Analyze best days of week
      const dayStats: { [key: string]: { count: number; totalQuality: number } } = {};
      const timeStats: { [key: string]: { count: number; totalQuality: number } } = {};

      metrics.forEach((metric) => {
        if (metric.intimacy_frequency > 0) {
          const date = new Date(metric.date);
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

          if (!dayStats[dayOfWeek]) {
            dayStats[dayOfWeek] = { count: 0, totalQuality: 0 };
          }
          dayStats[dayOfWeek].count++;
          dayStats[dayOfWeek].totalQuality += metric.quality_rating || 0;

          // Analyze time patterns (if available in notes or metadata)
          // This is a simplified version
          if (metric.notes?.includes('morning')) {
            if (!timeStats['morning']) timeStats['morning'] = { count: 0, totalQuality: 0 };
            timeStats['morning'].count++;
            timeStats['morning'].totalQuality += metric.quality_rating || 0;
          } else if (metric.notes?.includes('evening') || metric.notes?.includes('night')) {
            if (!timeStats['evening']) timeStats['evening'] = { count: 0, totalQuality: 0 };
            timeStats['evening'].count++;
            timeStats['evening'].totalQuality += metric.quality_rating || 0;
          }
        }
      });

      // Find best days (most frequent)
      const bestDays = Object.entries(dayStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([day]) => day);

      // Find best times
      const bestTimes = Object.entries(timeStats)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([time]) => time);

      // Quality trends
      const qualityRatings = metrics
        .filter((m) => m.quality_rating)
        .map((m) => m.quality_rating!);

      const averageQuality = qualityRatings.reduce((a, b) => a + b, 0) / qualityRatings.length || 0;
      const peakQuality = Math.max(...qualityRatings, 0);

      // Check if quality is improving (last 30 days vs previous 30 days)
      const last30Days = metrics.slice(0, 30);
      const previous30Days = metrics.slice(30, 60);

      const last30Quality = last30Days
        .filter((m) => m.quality_rating)
        .reduce((sum, m) => sum + m.quality_rating!, 0) / last30Days.length || 0;

      const previous30Quality = previous30Days
        .filter((m) => m.quality_rating)
        .reduce((sum, m) => sum + m.quality_rating!, 0) / previous30Days.length || 0;

      const improving = last30Quality > previous30Quality;

      // Frequency trends
      const last30Frequency = last30Days.reduce(
        (sum, m) => sum + m.intimacy_frequency,
        0
      ) / last30Days.length || 0;

      const previous30Frequency = previous30Days.reduce(
        (sum, m) => sum + m.intimacy_frequency,
        0
      ) / previous30Days.length || 0;

      const changePercentage = previous30Frequency > 0
        ? ((last30Frequency - previous30Frequency) / previous30Frequency) * 100
        : 0;

      const patterns: PatternAnalysis = {
        best_days: bestDays,
        best_times: bestTimes.length > 0 ? bestTimes : ['No time patterns detected yet'],
        quality_trends: {
          improving,
          average_quality: Math.round(averageQuality * 10) / 10,
          peak_quality: peakQuality,
        },
        frequency_trends: {
          current_average: Math.round(last30Frequency * 10) / 10,
          previous_average: Math.round(previous30Frequency * 10) / 10,
          change_percentage: Math.round(changePercentage),
        },
      };

      return { data: patterns, error: null };
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      return { data: null, error };
    }
  }

  // Analyze program impact on connection score
  static async getProgramImpact(
    userId: string
  ): Promise<{ data: ProgramImpact[] | null; error: any }> {
    try {
      const { data: programs } = await IntimacyProgramService.getUserProgramProgress(userId);

      if (!programs || programs.length === 0) {
        return { data: [], error: null };
      }

      const impacts: ProgramImpact[] = [];

      for (const program of programs) {
        // Get score before enrollment
        const enrollDate = program.enrolled_at.split('T')[0];
        const weekBefore = new Date(program.enrolled_at);
        weekBefore.setDate(weekBefore.getDate() - 7);

        const { data: scoreBefore } = await ConnectionScoreService.getScoreHistory(
          userId,
          weekBefore.toISOString().split('T')[0],
          enrollDate
        );

        // Get current score (during program)
        const { data: currentScore } = await ConnectionScoreService.getLatestScore(userId);

        // Get score after completion (if completed)
        let scoreAfter = undefined;
        if (program.completed_at) {
          const weekAfter = new Date(program.completed_at);
          weekAfter.setDate(weekAfter.getDate() + 7);

          const { data: scoreAfterData } = await ConnectionScoreService.getScoreHistory(
            userId,
            program.completed_at.split('T')[0],
            weekAfter.toISOString().split('T')[0]
          );

          scoreAfter = scoreAfterData?.[0]?.total_score;
        }

        const beforeScore = scoreBefore?.[0]?.total_score || 0;
        const duringScore = currentScore?.total_score || 0;

        // Calculate impact
        let impactRating: 'high' | 'medium' | 'low' | 'pending' = 'pending';

        if (program.status === 'completed' && scoreAfter) {
          const improvement = scoreAfter - beforeScore;
          if (improvement >= 20) impactRating = 'high';
          else if (improvement >= 10) impactRating = 'medium';
          else impactRating = 'low';
        } else if (program.progress_percentage > 50) {
          const improvement = duringScore - beforeScore;
          if (improvement >= 15) impactRating = 'high';
          else if (improvement >= 8) impactRating = 'medium';
          else if (improvement > 0) impactRating = 'low';
        }

        impacts.push({
          program_name: program.intimacy_programs?.title || 'Unknown Program',
          enrolled_date: enrollDate,
          completion_percentage: program.progress_percentage,
          score_before: beforeScore,
          score_during: duringScore,
          score_after: scoreAfter,
          impact_rating: impactRating,
        });
      }

      return { data: impacts, error: null };
    } catch (error) {
      console.error('Error analyzing program impact:', error);
      return { data: null, error };
    }
  }

  // Get user achievements
  static async getAchievements(
    userId: string
  ): Promise<{ data: Achievement[] | null; error: any }> {
    try {
      const achievements: Achievement[] = [];

      // Get data for achievement calculation
      const { data: latestScore } = await ConnectionScoreService.getLatestScore(userId);
      const { data: allScores } = await ConnectionScoreService.getScoreHistory(
        userId,
        '2020-01-01',
        new Date().toISOString().split('T')[0]
      );
      const { data: programs } = await IntimacyProgramService.getUserProgramProgress(userId);
      const { data: checkIns } = await IntimacyCheckInService.getCheckInHistory(
        userId,
        '2020-01-01',
        new Date().toISOString().split('T')[0]
      );

      // Streak achievements
      if (latestScore) {
        if (latestScore.current_streak >= 30) {
          achievements.push({
            id: 'streak-30',
            type: 'streak',
            title: '30-Day Connection Streak',
            description: 'Maintained intimacy for 30 consecutive days',
            icon: '🔥',
            date_earned: new Date().toISOString(),
            rarity: 'epic',
          });
        } else if (latestScore.current_streak >= 14) {
          achievements.push({
            id: 'streak-14',
            type: 'streak',
            title: '2-Week Consistency',
            description: 'Maintained intimacy for 14 consecutive days',
            icon: '⭐',
            date_earned: new Date().toISOString(),
            rarity: 'rare',
          });
        } else if (latestScore.current_streak >= 7) {
          achievements.push({
            id: 'streak-7',
            type: 'streak',
            title: 'Week of Connection',
            description: 'Maintained intimacy for 7 consecutive days',
            icon: '✨',
            date_earned: new Date().toISOString(),
            rarity: 'common',
          });
        }

        // Score milestones
        if (latestScore.total_score >= 90) {
          achievements.push({
            id: 'score-90',
            type: 'milestone',
            title: 'Connection Master',
            description: 'Achieved a connection score of 90+',
            icon: '👑',
            date_earned: new Date().toISOString(),
            rarity: 'legendary',
          });
        } else if (latestScore.total_score >= 80) {
          achievements.push({
            id: 'score-80',
            type: 'milestone',
            title: 'Strong Bond',
            description: 'Achieved a connection score of 80+',
            icon: '💎',
            date_earned: new Date().toISOString(),
            rarity: 'epic',
          });
        }

        // Improvement achievements
        if (allScores && allScores.length >= 30) {
          const first30Days = allScores.slice(-30)[0];
          const improvement = latestScore.total_score - first30Days.total_score;

          if (improvement >= 30) {
            achievements.push({
              id: 'improvement-30',
              type: 'improvement',
              title: 'Transformation',
              description: 'Improved connection score by 30+ points',
              icon: '🚀',
              date_earned: new Date().toISOString(),
              rarity: 'legendary',
            });
          } else if (improvement >= 20) {
            achievements.push({
              id: 'improvement-20',
              type: 'improvement',
              title: 'Major Growth',
              description: 'Improved connection score by 20+ points',
              icon: '📈',
              date_earned: new Date().toISOString(),
              rarity: 'epic',
            });
          }
        }
      }

      // Program completions
      const completedPrograms = programs?.filter((p) => p.status === 'completed').length || 0;
      if (completedPrograms >= 5) {
        achievements.push({
          id: 'programs-5',
          type: 'completion',
          title: 'Lifelong Learner',
          description: 'Completed 5 intimacy programs',
          icon: '📚',
          date_earned: new Date().toISOString(),
          rarity: 'epic',
        });
      } else if (completedPrograms >= 3) {
        achievements.push({
          id: 'programs-3',
          type: 'completion',
          title: 'Dedicated Student',
          description: 'Completed 3 intimacy programs',
          icon: '📖',
          date_earned: new Date().toISOString(),
          rarity: 'rare',
        });
      } else if (completedPrograms >= 1) {
        achievements.push({
          id: 'programs-1',
          type: 'completion',
          title: 'First Steps',
          description: 'Completed your first intimacy program',
          icon: '🎯',
          date_earned: new Date().toISOString(),
          rarity: 'common',
        });
      }

      // Check-in consistency
      if (checkIns && checkIns.length >= 30) {
        achievements.push({
          id: 'checkins-30',
          type: 'milestone',
          title: 'Reflective Soul',
          description: 'Completed 30 daily check-ins',
          icon: '🧘',
          date_earned: new Date().toISOString(),
          rarity: 'rare',
        });
      } else if (checkIns && checkIns.length >= 7) {
        achievements.push({
          id: 'checkins-7',
          type: 'milestone',
          title: 'Self-Aware',
          description: 'Completed 7 daily check-ins',
          icon: '💭',
          date_earned: new Date().toISOString(),
          rarity: 'common',
        });
      }

      return { data: achievements, error: null };
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return { data: null, error };
    }
  }

  // Generate insights for overview
  private static async generateInsights(
    userId: string,
    currentScore: any,
    scoreHistory: any[] | null,
    checkIns: any[] | null,
    programProgress: any[] | null
  ): Promise<string[]> {
    const insights: string[] = [];

    // Score-based insights
    if (currentScore) {
      if (currentScore.total_score >= 80) {
        insights.push('🌟 Your connection is thriving! Keep nurturing this bond.');
      } else if (currentScore.total_score >= 60) {
        insights.push('✨ You\'re building a strong connection. Consider exploring new dimensions of intimacy.');
      } else if (currentScore.total_score >= 40) {
        insights.push('💫 Your connection has potential. Daily check-ins can help identify areas to improve.');
      } else {
        insights.push('💭 Every journey starts somewhere. Begin with a learning program to rebuild connection.');
      }

      // Streak insights
      if (currentScore.current_streak >= 7) {
        insights.push(`🔥 Impressive ${currentScore.current_streak}-day streak! Consistency strengthens intimacy.`);
      }
    }

    // Program engagement insights
    const activePrograms = programProgress?.filter(
      (p) => p.status === 'in_progress'
    ).length || 0;

    if (activePrograms > 0) {
      insights.push(`📚 You're enrolled in ${activePrograms} program(s). Keep learning and growing!`);
    } else {
      insights.push('📖 Consider starting a learning program to deepen your understanding of intimacy.');
    }

    // Check-in insights
    const recentCheckIns = checkIns?.slice(0, 7) || [];
    if (recentCheckIns.length >= 5) {
      insights.push('🧘 Your consistent self-reflection shows commitment to growth.');
    } else if (recentCheckIns.length < 3) {
      insights.push('💭 Daily check-ins help track patterns and identify areas for improvement.');
    }

    // Trend insights
    if (scoreHistory && scoreHistory.length >= 2) {
      const firstScore = scoreHistory[scoreHistory.length - 1].total_score;
      const latestScore = scoreHistory[0].total_score;
      const improvement = latestScore - firstScore;

      if (improvement > 10) {
        insights.push('📈 Your connection score is trending upward! Great progress.');
      } else if (improvement < -10) {
        insights.push('💬 Your score has dipped. This might be a good time for a heart-to-heart conversation.');
      }
    }

    return insights;
  }
}
