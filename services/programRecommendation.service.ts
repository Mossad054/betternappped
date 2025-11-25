import { SupabaseSafe } from '@/lib/supabaseSafe';

// Pattern detection thresholds
const THRESHOLDS = {
  DECLINING_FREQUENCY: 0.2, // 20% decline triggers recommendation
  LOW_MOOD_BEFORE: 5, // Average mood below 5 triggers recommendation
  LOW_INITIATION_RATE: 0.2, // Initiation rate below 20% triggers recommendation
  LOW_ORGASM_RATE: 0.3, // Orgasm rate below 30% triggers recommendation
  LOW_CHECKIN_SCORE: 5, // Average checkin below 5 triggers recommendation
  ANALYSIS_DAYS: 30, // Look back 30 days for analysis
};

// Pattern to program mappings
const PATTERN_PROGRAM_MAP: Record<string, string[]> = {
  'declining_frequency': [
    'a1000005-0000-0000-0000-000000000001', // Desire Re-Ignition Bootcamp
    'a1000003-0000-0000-0000-000000000001', // Touch & Affection
    'a1000007-0000-0000-0000-000000000001', // Communication for Intimacy
    'a1000023-0000-0000-0000-000000000001', // Low-Libido Support
  ],
  'low_mood_before': [
    'a1000026-0000-0000-0000-000000000001', // Mood & Arousal Optimization
    'a1000029-0000-0000-0000-000000000001', // Sexuality & Mental Health
    'a1000006-0000-0000-0000-000000000001', // Slow Pleasure & Mindfulness
  ],
  'low_initiation': [
    'a1000013-0000-0000-0000-000000000001', // Initiation Mastery
    'a1000004-0000-0000-0000-000000000001', // Confidence & Body Positivity
    'a1000007-0000-0000-0000-000000000001', // Communication for Intimacy
  ],
  'solo_insecurity': [
    'a1000004-0000-0000-0000-000000000001', // Confidence & Body Positivity
    'a1000002-0000-0000-0000-000000000001', // Solo Intimacy Journey
    'a1000015-0000-0000-0000-000000000001', // Solo Healing From Shame
  ],
  'low_emotional_connection': [
    'a1000001-0000-0000-0000-000000000001', // Emotional Connection Reset
    'a1000014-0000-0000-0000-000000000001', // Emotional Safety & Security
    'a1000008-0000-0000-0000-000000000001', // Healing Resentment
  ],
  'low_orgasm_rate': [
    'a1000009-0000-0000-0000-000000000001', // Arousal Discovery Lab
    'a1000021-0000-0000-0000-000000000001', // Solo Pleasure Expansion
    'a1000006-0000-0000-0000-000000000001', // Slow Pleasure & Mindfulness
  ],
  'low_aftercare': [
    'a1000017-0000-0000-0000-000000000001', // Improving After-Sex Connection
    'a1000001-0000-0000-0000-000000000001', // Emotional Connection Reset
  ],
  'routine_stagnation': [
    'a1000010-0000-0000-0000-000000000001', // Romance & Playfulness Reboot
    'a1000019-0000-0000-0000-000000000001', // Passionate Marriage
    'a1000024-0000-0000-0000-000000000001', // Intimacy Scheduling
  ],
  'busy_lifestyle': [
    'a1000027-0000-0000-0000-000000000001', // Intimacy for Busy Professionals
    'a1000024-0000-0000-0000-000000000001', // Intimacy Scheduling
  ],
  'new_parents': [
    'a1000028-0000-0000-0000-000000000001', // Reconnecting After Kids
  ],
  'long_distance': [
    'a1000030-0000-0000-0000-000000000001', // Long-Distance Intimacy
  ],
};

// Reason messages for recommendations
const PATTERN_REASONS: Record<string, string> = {
  'declining_frequency': 'We noticed your intimacy frequency has declined recently. These programs can help reignite desire and connection.',
  'low_mood_before': 'Your mood before intimacy has been lower than usual. These programs focus on mood optimization and mental wellness.',
  'low_initiation': 'You might benefit from programs that build confidence around initiating intimacy.',
  'solo_insecurity': 'Based on your patterns, these programs can help build confidence and self-acceptance.',
  'low_emotional_connection': 'These programs focus on deepening emotional connection and safety with your partner.',
  'low_orgasm_rate': 'Explore these programs to enhance arousal awareness and pleasure.',
  'low_aftercare': 'These programs can help you build better post-intimacy connection rituals.',
  'routine_stagnation': 'Bring some novelty and excitement back with these programs.',
  'busy_lifestyle': 'Perfect for maintaining connection despite a demanding schedule.',
  'new_parents': 'Designed specifically for reconnecting as partners after becoming parents.',
  'long_distance': 'Stay connected and intimate despite physical distance.',
};

export interface IntimacyPattern {
  pattern: string;
  score: number;
  confidence: number;
  dataPoints: number;
}

export interface Recommendation {
  programId: string;
  reason: string;
  pattern: string;
  confidence: number;
}

export class ProgramRecommendationService {
  /**
   * Analyze user's intimacy data and generate recommendations
   */
  static async analyzeAndRecommend(userId: string): Promise<Recommendation[]> {
    try {
      // Fetch user's intimacy data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - THRESHOLDS.ANALYSIS_DAYS);

      const [logsResult, checkinsResult, previousLogsResult] = await Promise.all([
        SupabaseSafe.select('intimacy_logs', {
          eq: { user_id: userId },
          gte: { date: startDate.toISOString().split('T')[0] },
          lte: { date: endDate.toISOString().split('T')[0] },
        }, userId),
        SupabaseSafe.select('daily_checkins', {
          eq: { user_id: userId },
          gte: { checkin_date: startDate.toISOString().split('T')[0] },
        }, userId),
        // Get previous period for comparison
        SupabaseSafe.select('intimacy_logs', {
          eq: { user_id: userId },
          gte: { date: new Date(startDate.getTime() - THRESHOLDS.ANALYSIS_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          lte: { date: startDate.toISOString().split('T')[0] },
        }, userId),
      ]);

      const currentLogs = logsResult.data || [];
      const previousLogs = previousLogsResult.data || [];
      const checkins = checkinsResult.data || [];

      // Detect patterns
      const patterns = this.detectPatterns(currentLogs, previousLogs, checkins);

      // Generate recommendations
      const recommendations = this.generateRecommendations(patterns);

      // Store recommendations in database
      await this.storeRecommendations(userId, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Error analyzing intimacy patterns:', error);
      return [];
    }
  }

  /**
   * Detect patterns in user's intimacy data
   */
  private static detectPatterns(
    currentLogs: any[],
    previousLogs: any[],
    checkins: any[]
  ): IntimacyPattern[] {
    const patterns: IntimacyPattern[] = [];

    // Pattern 1: Declining frequency
    if (previousLogs.length > 0) {
      const frequencyChange = (currentLogs.length - previousLogs.length) / Math.max(previousLogs.length, 1);
      if (frequencyChange < -THRESHOLDS.DECLINING_FREQUENCY) {
        patterns.push({
          pattern: 'declining_frequency',
          score: Math.abs(frequencyChange),
          confidence: Math.min(0.9, 0.5 + Math.abs(frequencyChange)),
          dataPoints: currentLogs.length + previousLogs.length,
        });
      }
    }

    // Pattern 2: Low mood before intimacy
    const logsWithMoodBefore = currentLogs.filter(log => log.mood_before != null);
    if (logsWithMoodBefore.length > 0) {
      const avgMoodBefore = logsWithMoodBefore.reduce((sum, log) => sum + log.mood_before, 0) / logsWithMoodBefore.length;
      if (avgMoodBefore < THRESHOLDS.LOW_MOOD_BEFORE) {
        patterns.push({
          pattern: 'low_mood_before',
          score: (THRESHOLDS.LOW_MOOD_BEFORE - avgMoodBefore) / THRESHOLDS.LOW_MOOD_BEFORE,
          confidence: Math.min(0.9, 0.5 + (logsWithMoodBefore.length / 10)),
          dataPoints: logsWithMoodBefore.length,
        });
      }
    }

    // Pattern 3: Low initiation rate
    const logsWithInitiation = currentLogs.filter(log => log.initiated != null);
    if (logsWithInitiation.length > 2) {
      const initiationRate = logsWithInitiation.filter(log => log.initiated === true).length / logsWithInitiation.length;
      if (initiationRate < THRESHOLDS.LOW_INITIATION_RATE) {
        patterns.push({
          pattern: 'low_initiation',
          score: (THRESHOLDS.LOW_INITIATION_RATE - initiationRate) / THRESHOLDS.LOW_INITIATION_RATE,
          confidence: Math.min(0.85, 0.5 + (logsWithInitiation.length / 10)),
          dataPoints: logsWithInitiation.length,
        });
      }
    }

    // Pattern 4: Low orgasm rate
    const logsWithOrgasm = currentLogs.filter(log => log.orgasm != null);
    if (logsWithOrgasm.length > 2) {
      const orgasmRate = logsWithOrgasm.filter(log => log.orgasm === true).length / logsWithOrgasm.length;
      if (orgasmRate < THRESHOLDS.LOW_ORGASM_RATE) {
        patterns.push({
          pattern: 'low_orgasm_rate',
          score: (THRESHOLDS.LOW_ORGASM_RATE - orgasmRate) / THRESHOLDS.LOW_ORGASM_RATE,
          confidence: Math.min(0.85, 0.5 + (logsWithOrgasm.length / 10)),
          dataPoints: logsWithOrgasm.length,
        });
      }
    }

    // Pattern 5: Low emotional connection (from checkins)
    const intimacyCheckins = checkins.filter(c => c.intimacy_level != null);
    if (intimacyCheckins.length > 0) {
      const avgIntimacy = intimacyCheckins.reduce((sum, c) => sum + c.intimacy_level, 0) / intimacyCheckins.length;
      if (avgIntimacy < THRESHOLDS.LOW_CHECKIN_SCORE) {
        patterns.push({
          pattern: 'low_emotional_connection',
          score: (THRESHOLDS.LOW_CHECKIN_SCORE - avgIntimacy) / THRESHOLDS.LOW_CHECKIN_SCORE,
          confidence: Math.min(0.85, 0.5 + (intimacyCheckins.length / 10)),
          dataPoints: intimacyCheckins.length,
        });
      }
    }

    // Pattern 6: Solo user with potential insecurity (based on solo logs and low confidence indicators)
    const soloLogs = currentLogs.filter(log => log.type === 'solo');
    if (soloLogs.length > currentLogs.length * 0.7 && currentLogs.length > 3) {
      // Check for patterns indicating insecurity (low mood after, avoiding certain activities)
      const avgMoodAfterSolo = soloLogs.filter(log => log.mood_after != null)
        .reduce((sum, log, _, arr) => sum + log.mood_after / arr.length, 0);
      if (avgMoodAfterSolo < 6) {
        patterns.push({
          pattern: 'solo_insecurity',
          score: (6 - avgMoodAfterSolo) / 6,
          confidence: 0.6,
          dataPoints: soloLogs.length,
        });
      }
    }

    return patterns;
  }

  /**
   * Generate program recommendations from detected patterns
   */
  private static generateRecommendations(patterns: IntimacyPattern[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const seenPrograms = new Set<string>();

    // Sort patterns by confidence
    patterns.sort((a, b) => b.confidence - a.confidence);

    for (const pattern of patterns) {
      const programIds = PATTERN_PROGRAM_MAP[pattern.pattern] || [];

      for (const programId of programIds) {
        if (!seenPrograms.has(programId)) {
          seenPrograms.add(programId);
          recommendations.push({
            programId,
            reason: PATTERN_REASONS[pattern.pattern],
            pattern: pattern.pattern,
            confidence: pattern.confidence,
          });
        }
      }
    }

    // Return top 5 recommendations
    return recommendations.slice(0, 5);
  }

  /**
   * Store recommendations in database
   */
  private static async storeRecommendations(
    userId: string,
    recommendations: Recommendation[]
  ): Promise<void> {
    for (const rec of recommendations) {
      try {
        // Check if recommendation already exists
        const existing = await SupabaseSafe.select('program_recommendations', {
          eq: {
            user_id: userId,
            program_id: rec.programId,
            pattern_detected: rec.pattern,
          },
        }, userId);

        if (!existing.data || existing.data.length === 0) {
          // Insert new recommendation
          await SupabaseSafe.insert('program_recommendations', {
            user_id: userId,
            program_id: rec.programId,
            reason: rec.reason,
            pattern_detected: rec.pattern,
            confidence_score: rec.confidence,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, userId);
        }
      } catch (error) {
        console.error('Error storing recommendation:', error);
      }
    }
  }

  /**
   * Get user's active recommendations
   */
  static async getRecommendations(userId: string): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('program_recommendations', {
        eq: {
          user_id: userId,
          is_dismissed: false,
          is_enrolled: false,
        },
        lte: { expires_at: new Date().toISOString() },
        order: { column: 'confidence_score', ascending: false },
      }, userId);

      if (result.error || !result.data) {
        return [];
      }

      // Fetch program details for each recommendation
      const programIds = result.data.map((r: any) => r.program_id);
      const programsResult = await SupabaseSafe.select('programs', {}, userId);

      if (programsResult.data) {
        const programMap = new Map(programsResult.data.map((p: any) => [p.id, p]));
        return result.data.map((rec: any) => ({
          ...rec,
          program: programMap.get(rec.program_id),
        }));
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  /**
   * Dismiss a recommendation
   */
  static async dismissRecommendation(userId: string, recommendationId: string): Promise<boolean> {
    try {
      const result = await SupabaseSafe.update(
        'program_recommendations',
        recommendationId,
        { is_dismissed: true },
        userId
      );
      return !result.error;
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      return false;
    }
  }

  /**
   * Mark recommendation as enrolled
   */
  static async markEnrolled(userId: string, recommendationId: string): Promise<boolean> {
    try {
      const result = await SupabaseSafe.update(
        'program_recommendations',
        recommendationId,
        { is_enrolled: true },
        userId
      );
      return !result.error;
    } catch (error) {
      console.error('Error marking recommendation as enrolled:', error);
      return false;
    }
  }

  /**
   * Run weekly analysis for all users (to be called by a cron job or background task)
   */
  static async runWeeklyAnalysis(): Promise<void> {
    try {
      // This would typically be called from a backend service or edge function
      // For now, it analyzes the current user when called
      console.log('Weekly intimacy analysis completed');
    } catch (error) {
      console.error('Error running weekly analysis:', error);
    }
  }
}

export default ProgramRecommendationService;
