/**
 * Supabase Edge Function: Schedule Notifications
 * Date: 2025-11-05
 * Purpose: Cron-driven function to generate digests and queue notifications
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Install Supabase CLI: https://supabase.com/docs/guides/cli
 * 2. Navigate to project root
 * 3. Deploy: supabase functions deploy schedule-notifications
 * 
 * CRON SCHEDULE:
 * - Daily digests: Run at configured digest times (default 8 PM user local time)
 * - Weekly digests: Run on configured day (default Sunday 9 AM user local time)
 * - Immediate checks: Run every 15 minutes to check for pending notifications
 */

// Import Supabase client for Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Timezone helper for Nairobi (EAT = UTC+3)
const NAIROBI_TZ_OFFSET = 3;

interface NotificationPreference {
  id: string;
  user_id: string;
  type: string;
  channels: string[];
  frequency: string;
  priority: string;
  time_of_day?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  enabled: boolean;
}

interface QueuedNotification {
  user_id: string;
  type: string;
  channel: string;
  payload: {
    title: string;
    body: string;
    data?: any;
  };
  send_after: string;
}

/**
 * Main function handler
 */
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time in Nairobi timezone
    const now = new Date();
    const nairobiTime = new Date(now.getTime() + NAIROBI_TZ_OFFSET * 60 * 60 * 1000);
    const currentHour = nairobiTime.getHours();
    const currentMinute = nairobiTime.getMinutes();
    const currentDay = nairobiTime.getDay(); // 0 = Sunday, 6 = Saturday

    console.log(`[Schedule Notifications] Running at ${nairobiTime.toISOString()}`);

    // Fetch all enabled preferences
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      return new Response(JSON.stringify({ error: prefError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const notifications: QueuedNotification[] = [];

    // Process daily digests
    if (preferences) {
      for (const pref of preferences as NotificationPreference[]) {
        // Skip if not time for this user's digest
        if (pref.frequency === 'daily_digest' && pref.time_of_day) {
          const [prefHour, prefMinute] = pref.time_of_day.split(':').map(Number);
          
          // Check if it's time for daily digest (within 15-minute window)
          if (currentHour === prefHour && currentMinute >= prefMinute && currentMinute < prefMinute + 15) {
            // Generate daily digest
            const digest = await generateDailyDigest(supabase, pref.user_id, pref.type);
            if (digest) {
              for (const channel of pref.channels) {
                notifications.push({
                  user_id: pref.user_id,
                  type: pref.type,
                  channel,
                  payload: digest,
                  send_after: now.toISOString(),
                });
              }
            }
          }
        }

        // Process weekly digests
        if (pref.frequency === 'weekly_digest' && currentDay === 0) { // Sunday
          const digest = await generateWeeklyDigest(supabase, pref.user_id, pref.type);
          if (digest) {
            for (const channel of pref.channels) {
              notifications.push({
                user_id: pref.user_id,
                type: pref.type,
                channel,
                payload: digest,
                send_after: now.toISOString(),
              });
            }
          }
        }

        // Process immediate notifications (check for pending events)
        if (pref.frequency === 'immediate') {
          const immediate = await checkImmediateNotifications(supabase, pref.user_id, pref.type);
          if (immediate) {
            for (const channel of pref.channels) {
              notifications.push({
                user_id: pref.user_id,
                type: pref.type,
                channel,
                payload: immediate,
                send_after: now.toISOString(),
              });
            }
          }
        }
      }
    }

    // Insert all notifications into queue
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(
          notifications.map((n) => ({
            ...n,
            status: 'queued',
          }))
        );

      if (insertError) {
        console.error('Error queueing notifications:', insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log(`[Schedule Notifications] Queued ${notifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        queued: notifications.length,
        timestamp: now.toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Schedule Notifications] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Generate daily digest for a user
 */
async function generateDailyDigest(supabase: any, userId: string, type: string) {
  // TODO: Implement digest generation logic
  // Example: Fetch today's events, summarize, and create notification payload
  
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch relevant data based on type
  // This is a placeholder - implement actual logic
  
  return {
    title: `Daily ${type} Digest`,
    body: `Your wellness summary for ${today}`,
    data: {
      type: 'daily_digest',
      date: today,
    },
  };
}

/**
 * Generate weekly digest for a user
 */
async function generateWeeklyDigest(supabase: any, userId: string, type: string) {
  // TODO: Implement weekly digest logic
  // Example: Fetch last 7 days of data, analyze trends, create summary
  
  return {
    title: `Weekly ${type} Digest`,
    body: 'Your wellness summary for the past week',
    data: {
      type: 'weekly_digest',
    },
  };
}

/**
 * Check for immediate notifications
 */
async function checkImmediateNotifications(supabase: any, userId: string, type: string) {
  // TODO: Implement immediate notification checks
  // Example: Check for streak milestones, missed logs, experiment reminders
  
  // Check for streak milestones
  if (type === 'streak_alert') {
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);
      
    for (const habit of habits || []) {
      if ([7, 30, 60, 100].includes(habit.streak)) {
        return {
          title: '🔥 Streak Milestone!',
          body: `Congrats! ${habit.streak}-day streak for ${habit.name}!`,
          data: {
            type: 'streak_milestone',
            habit_id: habit.id,
            streak: habit.streak,
          },
        };
      }
    }
  }
  
  // Check for experiment reminders
  if (type === 'experiment_reminder') {
    const today = new Date().toISOString().split('T')[0];
    const { data: experiments } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    for (const exp of experiments || []) {
      // Check if user logged today
      const { data: logs } = await supabase
        .from('experiment_logs')
        .select('*')
        .eq('experiment_id', exp.id)
        .eq('date', today);
        
      if (!logs || logs.length === 0) {
        return {
          title: '🎯 Experiment Reminder',
          body: `Don't forget to log your ${exp.activity_name} today!`,
          data: {
            type: 'experiment_reminder',
            experiment_id: exp.id,
          },
        };
      }
    }
  }
  
  return null;
}

/* 
 * DEPLOYMENT CONFIGURATION
 * 
 * 1. Create function in Supabase dashboard or via CLI:
 *    supabase functions new schedule-notifications
 * 
 * 2. Set up cron schedule in Supabase dashboard:
 *    - Function: schedule-notifications
 *    - Schedule: */15 * * * * (every 15 minutes)
 *    - Or use pg_cron directly in Supabase SQL editor
 * 
 * 3. Set required environment variables:
 *    - SUPABASE_URL (automatically available)
 *    - SUPABASE_SERVICE_ROLE_KEY (automatically available)
 * 
 * 4. Test locally:
 *    supabase functions serve schedule-notifications
 * 
 * 5. Deploy:
 *    supabase functions deploy schedule-notifications
 */
