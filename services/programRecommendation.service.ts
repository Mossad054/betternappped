/**
 * Program Recommendation Service
 * Data-driven recommendations based on user patterns and intimacy data
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';

export interface ProgramRecommendation {
  id: string;
  user_id: string;
  program_id: string;
  reason: string;
  pattern_detected: string;
  confidence_score: number;
  created_at: string;
  dismissed: boolean;
  acted_on: boolean;
  program?: {
    id: string;
    title: string;
    description: string;
    duration_days: number;
    difficulty: string;
    category: string;
    tags: string[];
  };
}

export interface RecommendationRule {
  id: string;
  rule_name: string;
  pattern_criteria: Record<string, any>;
  program_id: string;
  reason_template: string;
  min_confidence: number;
  priority: number;
  active: boolean;
}

export class ProgramRecommendationService {
  /**
   * Analyze user data and generate personalized recommendations
   */
  static async analyzeAndRecommend(userId: string): Promise<void> {
    try {
      // Get user's intimacy data, check-ins, and current patterns
      const [checkinsResult, programsResult, rulesResult, existingRecs] = await Promise.all([
        SupabaseSafe.select('daily_checkins', {
          eq: { user_id: userId }
        }, userId),
        SupabaseSafe.select('programs', {}, undefined),
        SupabaseSafe.select('recommendation_rules', { eq: { active: true } }, undefined),
        SupabaseSafe.select('program_recommendations', {
          eq: { user_id: userId, dismissed: false }
        }, userId),
      ]);

      const checkins = checkinsResult.data || [];
      const programs = programsResult.data || [];
      const rules = (rulesResult.data || []) as RecommendationRule[];
      const existing = existingRecs.data || [];

      // Don't generate if we already have active recommendations
      if (existing.length >= 3) {
        return;
      }

      // Calculate user patterns
      const patterns = this.calculateUserPatterns(checkins);

      // Match patterns against recommendation rules
      const newRecommendations = await this.matchPatternsToRules(
        userId,
        patterns,
        rules,
        programs,
        existing
      );

      // Save new recommendations
      if (newRecommendations.length > 0) {
        await SupabaseSafe.insert('program_recommendations', newRecommendations, userId);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }

  /**
   * Calculate patterns from user check-in data
   */
  private static calculateUserPatterns(checkins: any[]): Record<string, any> {
    if (checkins.length === 0) {
      return {
        hasData: false,
        avgMood: 0,
        avgIntimacy: 0,
        avgCommunication: 0,
        avgDesire: 0,
        intimacyFrequency: 0,
        stressLevel: 0,
      };
    }

    const recent = checkins.slice(-30); // Last 30 check-ins

    const avgMood = recent.reduce((sum, c) => sum + (c.mood || 0), 0) / recent.length;
    const avgIntimacy = recent.reduce((sum, c) => sum + (c.intimacy_level || 0), 0) / recent.length;
    const avgCommunication = recent.reduce((sum, c) => sum + (c.communication_quality || 0), 0) / recent.length;
    const avgDesire = recent.reduce((sum, c) => sum + (c.desire_level || 0), 0) / recent.length;
    const avgStress = recent.reduce((sum, c) => sum + (c.stress || 0), 0) / recent.length;

    const intimacyEvents = recent.filter(c => c.had_intimacy).length;
    const intimacyFrequency = intimacyEvents / recent.length;

    const preCheckins = checkins.filter(c => c.checkin_type === 'pre_intimacy').length;
    const postCheckins = checkins.filter(c => c.checkin_type === 'post_intimacy').length;

    return {
      hasData: true,
      avgMood: Math.round(avgMood * 10) / 10,
      avgIntimacy: Math.round(avgIntimacy * 10) / 10,
      avgCommunication: Math.round(avgCommunication * 10) / 10,
      avgDesire: Math.round(avgDesire * 10) / 10,
      stressLevel: Math.round(avgStress * 10) / 10,
      intimacyFrequency: Math.round(intimacyFrequency * 100) / 100,
      hasPreCheckins: preCheckins > 0,
      hasPostCheckins: postCheckins > 0,
      totalCheckins: checkins.length,
    };
  }

  /**
   * Match user patterns to recommendation rules
   */
  private static async matchPatternsToRules(
    userId: string,
    patterns: Record<string, any>,
    rules: RecommendationRule[],
    programs: any[],
    existingRecs: any[]
  ): Promise<any[]> {
    const recommendations: any[] = [];
    const existingProgramIds = new Set(existingRecs.map(r => r.program_id));

    // Sort rules by priority
    rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const rule of rules) {
      // Skip if we already recommended this program
      if (existingProgramIds.has(rule.program_id)) {
        continue;
      }

      // Check if pattern matches criteria
      const { matches, confidence } = this.evaluateRuleCriteria(patterns, rule.pattern_criteria);

      if (matches && confidence >= (rule.min_confidence || 0.5)) {
        const program = programs.find(p => p.id === rule.program_id);

        if (program) {
          recommendations.push({
            user_id: userId,
            program_id: rule.program_id,
            reason: this.populateReasonTemplate(rule.reason_template, patterns),
            pattern_detected: JSON.stringify(rule.pattern_criteria),
            confidence_score: confidence,
            dismissed: false,
            acted_on: false,
          });

          existingProgramIds.add(rule.program_id);

          // Limit to 3 new recommendations per analysis
          if (recommendations.length >= 3) {
            break;
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Evaluate if user patterns match rule criteria
   */
  private static evaluateRuleCriteria(
    patterns: Record<string, any>,
    criteria: Record<string, any>
  ): { matches: boolean; confidence: number } {
    if (!patterns.hasData) {
      return { matches: false, confidence: 0 };
    }

    let matchedCriteria = 0;
    let totalCriteria = 0;
    let confidenceSum = 0;

    for (const [key, value] of Object.entries(criteria)) {
      totalCriteria++;

      if (typeof value === 'object' && value !== null) {
        // Handle range criteria: { min, max }
        if ('min' in value && patterns[key] !== undefined) {
          if (patterns[key] >= value.min) {
            matchedCriteria++;
            const proximity = Math.min(1, (patterns[key] - value.min) / (value.max - value.min || 1));
            confidenceSum += proximity;
          }
        } else if ('max' in value && patterns[key] !== undefined) {
          if (patterns[key] <= value.max) {
            matchedCriteria++;
            const proximity = Math.min(1, (value.max - patterns[key]) / (value.max || 1));
            confidenceSum += proximity;
          }
        }
      } else {
        // Handle exact match
        if (patterns[key] === value) {
          matchedCriteria++;
          confidenceSum += 1;
        }
      }
    }

    const matches = matchedCriteria >= Math.ceil(totalCriteria * 0.6); // At least 60% criteria match
    const confidence = totalCriteria > 0 ? confidenceSum / totalCriteria : 0;

    return { matches, confidence: Math.min(1, confidence) };
  }

  /**
   * Populate reason template with pattern data
   */
  private static populateReasonTemplate(template: string, patterns: Record<string, any>): string {
    let reason = template;

    // Replace placeholders
    reason = reason.replace(/\{avgMood\}/g, patterns.avgMood?.toFixed(1) || '0');
    reason = reason.replace(/\{avgIntimacy\}/g, patterns.avgIntimacy?.toFixed(1) || '0');
    reason = reason.replace(/\{avgCommunication\}/g, patterns.avgCommunication?.toFixed(1) || '0');
    reason = reason.replace(/\{avgDesire\}/g, patterns.avgDesire?.toFixed(1) || '0');
    reason = reason.replace(/\{intimacyFrequency\}/g, Math.round((patterns.intimacyFrequency || 0) * 100) + '%');

    return reason;
  }

  /**
   * Get user's active recommendations
   */
  static async getRecommendations(userId: string): Promise<ProgramRecommendation[]> {
    const result = await SupabaseSafe.select('program_recommendations', {
      eq: { user_id: userId, dismissed: false }
    }, userId);

    if (result.error || !result.data) {
      return [];
    }

    const recommendations = result.data as ProgramRecommendation[];

    // Fetch program details for each recommendation
    const programIds = [...new Set(recommendations.map(r => r.program_id))];
    const programsResult = await SupabaseSafe.select('programs', {
      in: { id: programIds }
    }, undefined);

    const programs = programsResult.data || [];

    // Merge program data
    return recommendations.map(rec => ({
      ...rec,
      program: programs.find((p: any) => p.id === rec.program_id),
    })).sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Dismiss a recommendation
   */
  static async dismissRecommendation(userId: string, recommendationId: string): Promise<boolean> {
    const result = await SupabaseSafe.update('program_recommendations', recommendationId, {
      dismissed: true,
    }, userId);

    return !result.error;
  }

  /**
   * Mark recommendation as acted upon (user enrolled in program)
   */
  static async markActedOn(userId: string, recommendationId: string): Promise<boolean> {
    const result = await SupabaseSafe.update('program_recommendations', recommendationId, {
      acted_on: true,
    }, userId);

    return !result.error;
  }
}
