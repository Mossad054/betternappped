/**
 * Batch Correlation Service
 * 
 * Calculates correlations for ALL user activities at once
 * - Analyzes every activity the user has logged
 * - Categorizes by benefit level (highly beneficial, beneficial, neutral, avoid)
 * - Generates summary insights across all activities
 * - Caches results for fast lookup
 * 
 * Based on AI_RECOMMENDATIONS_IMPLEMENTATION.md specifications
 */

import { ActivityImpactService, EnhancedActivityImpact } from './activityImpact.service';

export interface ActivityCorrelationSummary {
  userId: string;
  totalActivities: number;
  analyzedActivities: number;
  
  // Categorized by benefit level
  topBeneficial: EnhancedActivityImpact[]; // 70+ benefit score
  beneficial: EnhancedActivityImpact[]; // 50-69 benefit score
  neutral: EnhancedActivityImpact[]; // 40-49 benefit score
  toAvoid: EnhancedActivityImpact[]; // <40 benefit score
  
  // Top performers by outcome
  topMoodBoosters: string[];
  topSleepImprovers: string[];
  topClarityEnhancers: string[];
  topAnxietyReducers: string[];
  
  // Summary insights
  summaryInsights: string[];
  
  // Metadata
  lastCalculated: Date;
  dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
}

export class BatchCorrelationService {
  
  /**
   * Calculate correlations for all user activities
   * This is the main entry point for batch analysis
   */
  static async calculateAllActivityCorrelations(
    userId: string,
    lookbackDays: number = 90
  ): Promise<ActivityCorrelationSummary> {
    console.log(`🔄 Starting batch correlation analysis for user ${userId.substring(0, 8)}...`);
    
    const startTime = Date.now();

    // Import required services
    const { ActivitiesService } = await import('../activities.service');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - lookbackDays);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all activities in the period
    const activitiesResult = await ActivitiesService.getByDateRange(
      userId,
      startDateStr,
      endDateStr
    );

    if (!activitiesResult.data || activitiesResult.data.length === 0) {
      console.log('⚠️ No activities found for analysis');
      return this.emptyCorrelationSummary(userId);
    }

    const allActivities = activitiesResult.data;
    const uniqueActivityNames = [...new Set(allActivities.map(a => a.name))];

    console.log(`📊 Found ${allActivities.length} activity logs across ${uniqueActivityNames.length} unique activities`);

    // Analyze all activities using ActivityImpactService
    const analysisResult = await ActivityImpactService.analyzeActivities(
      userId,
      lookbackDays <= 7 ? 'week' : lookbackDays <= 30 ? 'month' : 'quarter'
    );

    const analyzedActivities = analysisResult.activities;

    // Categorize activities by benefit level
    const categorized = this.categorizeActivities(analyzedActivities);

    // Identify top performers for each outcome
    const topMoodBoosters = this.getTopActivitiesForOutcome(
      analyzedActivities,
      'mood',
      3
    );

    const topSleepImprovers = this.getTopActivitiesForOutcome(
      analyzedActivities,
      'sleep',
      3
    );

    const topClarityEnhancers = this.getTopActivitiesForOutcome(
      analyzedActivities,
      'clarity',
      3
    );

    const topAnxietyReducers = this.getTopActivitiesForOutcome(
      analyzedActivities,
      'anxiety',
      3
    );

    // Generate summary insights
    const summaryInsights = this.generateSummaryInsights({
      ...categorized,
      topMoodBoosters,
      topSleepImprovers,
      topClarityEnhancers,
      topAnxietyReducers,
      totalActivities: allActivities.length
    });

    // Assess data quality
    const dataQuality = this.assessDataQuality(
      allActivities.length,
      analyzedActivities.length
    );

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Batch correlation analysis complete in ${elapsedTime}ms`);
    console.log(`   - ${analyzedActivities.length} activities analyzed`);
    console.log(`   - ${categorized.topBeneficial.length} highly beneficial`);
    console.log(`   - ${categorized.toAvoid.length} to avoid`);

    return {
      userId,
      totalActivities: allActivities.length,
      analyzedActivities: analyzedActivities.length,
      topBeneficial: categorized.topBeneficial,
      beneficial: categorized.beneficial,
      neutral: categorized.neutral,
      toAvoid: categorized.toAvoid,
      topMoodBoosters,
      topSleepImprovers,
      topClarityEnhancers,
      topAnxietyReducers,
      summaryInsights,
      lastCalculated: new Date(),
      dataQuality
    };
  }

  /**
   * Categorize activities by overall benefit score
   */
  private static categorizeActivities(activities: EnhancedActivityImpact[]): {
    topBeneficial: EnhancedActivityImpact[];
    beneficial: EnhancedActivityImpact[];
    neutral: EnhancedActivityImpact[];
    toAvoid: EnhancedActivityImpact[];
  } {
    return {
      topBeneficial: activities.filter(a => a.overallBenefit >= 70 && a.confidence !== 'low'),
      beneficial: activities.filter(a => a.overallBenefit >= 50 && a.overallBenefit < 70),
      neutral: activities.filter(a => a.overallBenefit >= 40 && a.overallBenefit < 50),
      toAvoid: activities.filter(a => a.overallBenefit < 40)
    };
  }

  /**
   * Get top activities for a specific outcome
   */
  private static getTopActivitiesForOutcome(
    activities: EnhancedActivityImpact[],
    outcomeType: 'mood' | 'sleep' | 'clarity' | 'anxiety' | 'productivity',
    limit: number = 3
  ): string[] {
    // Filter for activities with sufficient data and positive impact
    const filtered = activities.filter(activity => {
      const impact = activity.impacts[outcomeType];
      if (!impact || impact.confidence < 0.5) return false;

      // Check if it improves the outcome
      const change = Math.max(
        Math.abs(impact.nextDay),
        Math.abs(impact.immediate)
      );
      
      return change > 0.1; // Must have meaningful impact
    });

    // Sort by impact magnitude (next-day primarily)
    const sorted = filtered.sort((a, b) => {
      const aImpact = Math.max(
        Math.abs(a.impacts[outcomeType].nextDay),
        Math.abs(a.impacts[outcomeType].immediate)
      );
      const bImpact = Math.max(
        Math.abs(b.impacts[outcomeType].nextDay),
        Math.abs(b.impacts[outcomeType].immediate)
      );
      return bImpact - aImpact;
    });

    return sorted.slice(0, limit).map(a => a.activityName);
  }

  /**
   * Generate summary insights across all activities
   */
  private static generateSummaryInsights(data: {
    topBeneficial: EnhancedActivityImpact[];
    beneficial: EnhancedActivityImpact[];
    neutral: EnhancedActivityImpact[];
    toAvoid: EnhancedActivityImpact[];
    topMoodBoosters: string[];
    topSleepImprovers: string[];
    topClarityEnhancers: string[];
    topAnxietyReducers: string[];
    totalActivities: number;
  }): string[] {
    const insights: string[] = [];

    // Overall summary
    if (data.topBeneficial.length > 0) {
      const names = data.topBeneficial.slice(0, 3).map(a => a.activityName).join(', ');
      insights.push(`🌟 Your top wellness boosters: ${names}`);
    }

    // Mood boosters
    if (data.topMoodBoosters.length > 0) {
      insights.push(`😊 Best for mood: ${data.topMoodBoosters.join(', ')}`);
    }

    // Sleep improvers
    if (data.topSleepImprovers.length > 0) {
      insights.push(`😴 For better sleep: ${data.topSleepImprovers.join(', ')}`);
    }

    // Clarity enhancers
    if (data.topClarityEnhancers.length > 0) {
      insights.push(`🧠 Sharpens focus: ${data.topClarityEnhancers.join(', ')}`);
    }

    // Anxiety reducers
    if (data.topAnxietyReducers.length > 0) {
      insights.push(`🧘 Reduces anxiety: ${data.topAnxietyReducers.join(', ')}`);
    }

    // High-frequency low-benefit warning
    const highFreqLowBenefit = [...data.neutral, ...data.toAvoid]
      .filter(a => a.frequencyPercent >= 15)
      .sort((a, b) => b.frequencyPercent - a.frequencyPercent)[0];

    if (highFreqLowBenefit) {
      insights.push(
        `⚠️ You do ${highFreqLowBenefit.activityName} often (${highFreqLowBenefit.frequencyPercent}%) but it may not help. Consider alternatives.`
      );
    }

    // Activities to reduce
    if (data.toAvoid.length > 0) {
      const worst = data.toAvoid
        .sort((a, b) => a.overallBenefit - b.overallBenefit)
        .slice(0, 2)
        .map(a => a.activityName);
      
      if (worst.length > 0) {
        insights.push(`🔴 Consider reducing: ${worst.join(', ')}`);
      }
    }

    // Improving trends
    const improvingActivities = data.topBeneficial.filter(a => a.trend === 'improving');
    if (improvingActivities.length > 0) {
      insights.push(
        `📈 ${improvingActivities[0].activityName} is showing improving benefits over time!`
      );
    }

    // Data quality message
    const totalAnalyzed = data.topBeneficial.length + data.beneficial.length + 
                          data.neutral.length + data.toAvoid.length;
    
    if (totalAnalyzed < 5) {
      insights.push(
        `💡 Log more activities consistently to discover personalized patterns.`
      );
    } else if (totalAnalyzed >= 10) {
      insights.push(
        `✅ Great data! Your insights are based on ${totalAnalyzed} activities with strong statistical confidence.`
      );
    }

    // Balance insight
    const beneficialRatio = (data.topBeneficial.length + data.beneficial.length) / 
                           Math.max(1, totalAnalyzed);
    
    if (beneficialRatio >= 0.7) {
      insights.push(`🎯 ${Math.round(beneficialRatio * 100)}% of your activities are beneficial. Keep it up!`);
    } else if (beneficialRatio < 0.4) {
      insights.push(`💪 Consider focusing more on your top beneficial activities to maximize wellness.`);
    }

    return insights.slice(0, 8); // Limit to top 8 insights
  }

  /**
   * Assess overall data quality
   */
  private static assessDataQuality(
    totalActivities: number,
    analyzedActivities: number
  ): 'excellent' | 'good' | 'limited' | 'insufficient' {
    if (analyzedActivities >= 15 && totalActivities >= 50) {
      return 'excellent';
    } else if (analyzedActivities >= 10 && totalActivities >= 30) {
      return 'good';
    } else if (analyzedActivities >= 5 && totalActivities >= 15) {
      return 'limited';
    } else {
      return 'insufficient';
    }
  }

  /**
   * Return empty summary when no data available
   */
  private static emptyCorrelationSummary(userId: string): ActivityCorrelationSummary {
    return {
      userId,
      totalActivities: 0,
      analyzedActivities: 0,
      topBeneficial: [],
      beneficial: [],
      neutral: [],
      toAvoid: [],
      topMoodBoosters: [],
      topSleepImprovers: [],
      topClarityEnhancers: [],
      topAnxietyReducers: [],
      summaryInsights: [
        'Start logging activities and your mood/sleep to discover personalized patterns!'
      ],
      lastCalculated: new Date(),
      dataQuality: 'insufficient'
    };
  }

  /**
   * Store correlation summary in cache for fast retrieval
   */
  static async storeSummaryCache(
    userId: string,
    summary: ActivityCorrelationSummary
  ): Promise<void> {
    try {
      const { SupabaseSafe } = await import('../../lib/supabaseSafe');
      const supabase = await SupabaseSafe.select('user_activity_insights', {}, userId);

      // Prepare data for storage
      const cacheData = {
        user_id: userId,
        top_mood_boosters: JSON.stringify(summary.topMoodBoosters),
        top_sleep_improvers: JSON.stringify(summary.topSleepImprovers),
        top_clarity_enhancers: JSON.stringify(summary.topClarityEnhancers),
        top_anxiety_reducers: JSON.stringify(summary.topAnxietyReducers),
        activities_to_reduce: JSON.stringify(summary.toAvoid.map(a => a.activityName)),
        total_activities_analyzed: summary.analyzedActivities,
        highly_beneficial_count: summary.topBeneficial.length,
        beneficial_count: summary.beneficial.length,
        neutral_count: summary.neutral.length,
        avoid_count: summary.toAvoid.length,
        summary_insights: JSON.stringify(summary.summaryInsights),
        last_calculated: summary.lastCalculated.toISOString(),
        next_recalculation: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      // Store in cache table (insert or update)
      // First check if record exists
      const existingResult = await SupabaseSafe.select('user_activity_insights', { user_id: userId }, userId);
      
      if (existingResult.data && existingResult.data.length > 0) {
        // Update existing record
        const recordId = (existingResult.data[0] as any).id;
        const result = await SupabaseSafe.update('user_activity_insights', recordId, cacheData, userId);
        
        if (result.error) {
          console.warn('Failed to update correlation cache:', result.error);
        } else {
          console.log('✅ Correlation summary updated successfully');
        }
      } else {
        // Insert new record
        const result = await SupabaseSafe.insert('user_activity_insights', cacheData, userId);
        
        if (result.error) {
          console.warn('Failed to insert correlation cache:', result.error);
        } else {
          console.log('✅ Correlation summary cached successfully');
        }
      }
    } catch (error) {
      console.warn('Error storing correlation cache:', error);
    }
  }

  /**
   * Retrieve cached correlation summary
   */
  static async getCachedSummary(userId: string): Promise<ActivityCorrelationSummary | null> {
    try {
      const { SupabaseSafe } = await import('../../lib/supabaseSafe');

      const result = await SupabaseSafe.select('user_activity_insights', { user_id: userId }, userId);

      if (result.error || !result.data || result.data.length === 0) {
        return null;
      }

      const data = result.data[0] as any; // Type assertion for dynamic database structure

      // Check if data is fresh enough (within 7 days)
      const lastCalc = new Date(data.last_calculated);
      const daysSince = (Date.now() - lastCalc.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince > 7) {
        console.log('Cache is stale, will recalculate');
        return null;
      }

      // Reconstruct summary from cache
      return {
        userId,
        totalActivities: data.total_activities_analyzed || 0,
        analyzedActivities: data.total_activities_analyzed || 0,
        topBeneficial: [], // Not cached, would need separate queries
        beneficial: [],
        neutral: [],
        toAvoid: [],
        topMoodBoosters: JSON.parse(data.top_mood_boosters || '[]'),
        topSleepImprovers: JSON.parse(data.top_sleep_improvers || '[]'),
        topClarityEnhancers: JSON.parse(data.top_clarity_enhancers || '[]'),
        topAnxietyReducers: JSON.parse(data.top_anxiety_reducers || '[]'),
        summaryInsights: JSON.parse(data.summary_insights || '[]'),
        lastCalculated: lastCalc,
        dataQuality: 'good' // Cached data assumed to be good quality
      };
    } catch (error) {
      console.warn('Error retrieving cached summary:', error);
      return null;
    }
  }

  /**
   * Get correlation summary with automatic caching
   */
  static async getOrCalculateSummary(
    userId: string,
    forceRecalculate: boolean = false
  ): Promise<ActivityCorrelationSummary> {
    // Try to get cached summary first
    if (!forceRecalculate) {
      const cached = await this.getCachedSummary(userId);
      if (cached) {
        console.log('✅ Using cached correlation summary');
        return cached;
      }
    }

    // Calculate fresh summary
    console.log('🔄 Calculating fresh correlation summary');
    const summary = await this.calculateAllActivityCorrelations(userId);

    // Store in cache for next time
    await this.storeSummaryCache(userId, summary);

    return summary;
  }
}
