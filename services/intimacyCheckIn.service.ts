import { supabase } from '@/lib/supabase';

export interface IntimacyCheckIn {
  id?: string;
  user_id: string;
  date: string;
  overall_feeling: 'amazing' | 'good' | 'neutral' | 'struggling' | 'disconnected';
  emotional_connection?: number;
  physical_connection?: number;
  communication_quality?: number;
  desires?: string;
  challenges?: string;
  gratitude?: string;
  reflection_notes?: string;
  needs_attention?: string[];
  relationship_type?: 'solo' | 'partnered' | 'exploring';
  mood_tags?: string[];
  timestamp?: string;
}

export interface CheckInRecommendation {
  id?: string;
  check_in_id: string;
  user_id: string;
  type: 'activity' | 'program' | 'experiment' | 'resource' | 'reflection';
  title: string;
  description: string;
  category?: string;
  action_type?: string;
  action_data?: any;
  priority?: number;
  relevance_score?: number;
  viewed?: boolean;
  completed?: boolean;
  dismissed?: boolean;
}

export class IntimacyCheckInService {
  // Save daily check-in
  static async saveCheckIn(
    checkIn: Omit<IntimacyCheckIn, 'id'>
  ): Promise<{ data: IntimacyCheckIn | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_check_ins')
        .upsert(
          {
            ...checkIn,
            timestamp: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,date',
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Generate recommendations based on check-in
      if (data?.id) {
        await this.generateRecommendations(data);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error saving check-in:', error);
      return { data: null, error };
    }
  }

  // Generate AI recommendations based on check-in responses
  static async generateRecommendations(
    checkIn: IntimacyCheckIn
  ): Promise<{ data: CheckInRecommendation[] | null; error: any }> {
    try {
      const recommendations: Omit<CheckInRecommendation, 'id'>[] = [];

      // Analyze overall feeling
      if (checkIn.overall_feeling === 'disconnected' || checkIn.overall_feeling === 'struggling') {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'program',
          title: 'Reconnection Journey',
          description: 'A 7-day program to rebuild intimacy and emotional connection',
          category: 'emotional',
          action_type: 'redirect',
          action_data: { program_id: 'reconnection-journey' },
          priority: 10,
          relevance_score: 0.95,
        });

        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'activity',
          title: 'Heart-to-Heart Conversation',
          description: 'Set aside 20 minutes for open, vulnerable dialogue',
          category: 'communication',
          priority: 9,
          relevance_score: 0.9,
        });
      }

      // Analyze emotional connection score
      if (checkIn.emotional_connection && checkIn.emotional_connection < 5) {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'program',
          title: 'Emotional Intimacy Building',
          description: 'Learn to deepen emotional bonds through vulnerability and trust',
          category: 'emotional',
          priority: 8,
          relevance_score: 0.85,
        });

        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'reflection',
          title: 'Gratitude Practice',
          description: 'Write down 3 things you appreciate about your partner/yourself',
          category: 'self-awareness',
          priority: 7,
          relevance_score: 0.8,
        });
      }

      // Analyze physical connection score
      if (checkIn.physical_connection && checkIn.physical_connection < 5) {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'experiment',
          title: 'Touch Connection Challenge',
          description: 'A 5-day experiment to rediscover physical intimacy',
          category: 'physical',
          action_type: 'redirect',
          action_data: { experiment_type: 'intimacy', tag: 'physical-touch' },
          priority: 8,
          relevance_score: 0.85,
        });

        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'activity',
          title: 'Sensual Massage Session',
          description: 'Practice non-sexual touch to rebuild physical connection',
          category: 'physical',
          priority: 7,
          relevance_score: 0.8,
        });
      }

      // Analyze communication quality
      if (checkIn.communication_quality && checkIn.communication_quality < 5) {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'program',
          title: 'Communication Mastery',
          description: 'Transform your relationship through better communication',
          category: 'communication',
          priority: 9,
          relevance_score: 0.9,
        });

        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'activity',
          title: 'Active Listening Exercise',
          description: 'Practice truly hearing and understanding each other',
          category: 'communication',
          priority: 7,
          relevance_score: 0.85,
        });
      }

      // Check for specific needs
      if (checkIn.needs_attention && checkIn.needs_attention.length > 0) {
        checkIn.needs_attention.forEach((need) => {
          const needRecommendations = this.getRecommendationsForNeed(
            need,
            checkIn.id!,
            checkIn.user_id
          );
          recommendations.push(...needRecommendations);
        });
      }

      // Relationship type specific recommendations
      if (checkIn.relationship_type === 'solo') {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'program',
          title: 'Self-Love & Self-Intimacy',
          description: 'Build a deeper relationship with yourself',
          category: 'self-awareness',
          priority: 8,
          relevance_score: 0.85,
        });
      }

      // Always add positive reinforcement activities
      if (checkIn.overall_feeling === 'amazing' || checkIn.overall_feeling === 'good') {
        recommendations.push({
          check_in_id: checkIn.id!,
          user_id: checkIn.user_id,
          type: 'activity',
          title: 'Celebrate Your Connection',
          description: 'Plan a special date or experience to honor your bond',
          category: 'quality-time',
          priority: 6,
          relevance_score: 0.75,
        });
      }

      // Save recommendations
      if (recommendations.length > 0) {
        const { data, error } = await supabase
          .from('check_in_recommendations')
          .insert(recommendations)
          .select();

        if (error) throw error;

        return { data, error: null };
      }

      return { data: [], error: null };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return { data: null, error };
    }
  }

  // Get recommendations for specific needs
  private static getRecommendationsForNeed(
    need: string,
    checkInId: string,
    userId: string
  ): Omit<CheckInRecommendation, 'id'>[] {
    const recommendations: Omit<CheckInRecommendation, 'id'>[] = [];

    const needMap: { [key: string]: Omit<CheckInRecommendation, 'id'> } = {
      communication: {
        check_in_id: checkInId,
        user_id: userId,
        type: 'program',
        title: 'Better Communication',
        description: 'Learn to express yourself clearly and listen deeply',
        category: 'communication',
        priority: 9,
        relevance_score: 0.9,
      },
      'physical-intimacy': {
        check_in_id: checkInId,
        user_id: userId,
        type: 'program',
        title: 'Physical Connection',
        description: 'Rediscover physical intimacy and sensuality',
        category: 'physical',
        priority: 8,
        relevance_score: 0.85,
      },
      'emotional-closeness': {
        check_in_id: checkInId,
        user_id: userId,
        type: 'program',
        title: 'Emotional Intimacy',
        description: 'Build deeper emotional bonds',
        category: 'emotional',
        priority: 8,
        relevance_score: 0.85,
      },
      'quality-time': {
        check_in_id: checkInId,
        user_id: userId,
        type: 'activity',
        title: 'Date Night Ideas',
        description: 'Creative ways to spend meaningful time together',
        category: 'quality-time',
        priority: 7,
        relevance_score: 0.8,
      },
      conflict: {
        check_in_id: checkInId,
        user_id: userId,
        type: 'program',
        title: 'Healthy Conflict Resolution',
        description: 'Turn disagreements into opportunities for growth',
        category: 'conflict',
        priority: 9,
        relevance_score: 0.9,
      },
    };

    if (needMap[need]) {
      recommendations.push(needMap[need]);
    }

    return recommendations;
  }

  // Get check-in history
  static async getCheckInHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: IntimacyCheckIn[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_check_ins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching check-in history:', error);
      return { data: null, error };
    }
  }

  // Get today's check-in
  static async getTodayCheckIn(
    userId: string
  ): Promise<{ data: IntimacyCheckIn | null; error: any }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('intimacy_check_ins')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching today check-in:', error);
      return { data: null, error };
    }
  }

  // Get recommendations for a check-in
  static async getRecommendations(
    checkInId: string
  ): Promise<{ data: CheckInRecommendation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('check_in_recommendations')
        .select('*')
        .eq('check_in_id', checkInId)
        .eq('dismissed', false)
        .order('priority', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { data: null, error };
    }
  }

  // Mark recommendation as viewed/completed/dismissed
  static async updateRecommendationStatus(
    recommendationId: string,
    status: { viewed?: boolean; completed?: boolean; dismissed?: boolean }
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('check_in_recommendations')
        .update(status)
        .eq('id', recommendationId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      return { error };
    }
  }

  // Get all active recommendations for user
  static async getActiveRecommendations(
    userId: string
  ): Promise<{ data: CheckInRecommendation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('check_in_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('dismissed', false)
        .eq('completed', false)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching active recommendations:', error);
      return { data: null, error };
    }
  }
}
