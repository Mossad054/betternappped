/**
 * Supabase Edge Function: Deliver Notifications
 * Date: 2025-11-05
 * Purpose: Worker function to process queued notifications and send via providers
 * 
 * DEPLOYMENT: supabase functions deploy deliver-notifications
 * TRIGGER: Cron schedule every 5 minutes or database trigger on notifications insert
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Notification channel handlers
interface DeliveryResult {
  success: boolean;
  error?: string;
}

/**
 * Main handler - processes queued notifications
 */
Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // Fetch queued notifications ready to send
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'queued')
      .lte('send_after', now)
      .order('send_after', { ascending: true })
      .limit(100); // Process in batches

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
    };

    // Process each notification
    for (const notification of notifications || []) {
      results.processed++;

      let deliveryResult: DeliveryResult;

      // Route to appropriate channel handler
      switch (notification.channel) {
        case 'push':
          deliveryResult = await sendPushNotification(supabase, notification);
          break;
        case 'email':
          deliveryResult = await sendEmailNotification(supabase, notification);
          break;
        case 'in_app':
          deliveryResult = await sendInAppNotification(supabase, notification);
          break;
        default:
          deliveryResult = { success: false, error: 'Unknown channel' };
      }

      // Update notification status
      const newStatus = deliveryResult.success ? 'sent' : 'failed';
      const updateData: any = {
        status: newStatus,
        sent_at: deliveryResult.success ? now : null,
        error_message: deliveryResult.error || null,
        retry_count: notification.retry_count + 1,
      };

      await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', notification.id);

      if (deliveryResult.success) {
        results.succeeded++;
      } else {
        results.failed++;
      }
    }

    console.log(`[Deliver Notifications] Processed: ${results.processed}, Success: ${results.succeeded}, Failed: ${results.failed}`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Deliver Notifications] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Send push notification via Expo Push Service or FCM
 */
async function sendPushNotification(supabase: any, notification: any): Promise<DeliveryResult> {
  // Fetch user devices
  const { data: devices } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', notification.user_id)
    .eq('push_enabled', true);

  if (!devices || devices.length === 0) {
    return { success: false, error: 'No devices registered' };
  }

  // TODO: Integrate with actual push service (Expo Push or FCM)
  // Example Expo Push integration:
  /*
  const expoPushToken = devices[0].device_token;
  const message = {
    to: expoPushToken,
    title: notification.payload.title,
    body: notification.payload.body,
    data: notification.payload.data,
  };
  
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  
  return { success: response.ok };
  */

  // Placeholder success for now
  console.log(`[Push] Would send to ${devices.length} device(s):`, notification.payload.title);
  return { success: true };
}

/**
 * Send email notification via SendGrid, SES, or transactional email service
 */
async function sendEmailNotification(supabase: any, notification: any): Promise<DeliveryResult> {
  // Fetch user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', notification.user_id)
    .single();

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // TODO: Integrate with email service (SendGrid, SES, etc.)
  // Example SendGrid integration:
  /*
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: user.email }] }],
      from: { email: 'notifications@betternapped.com' },
      subject: notification.payload.title,
      content: [{ type: 'text/plain', value: notification.payload.body }],
    }),
  });
  
  return { success: response.ok };
  */

  // Placeholder success for now
  console.log(`[Email] Would send to ${user.email}:`, notification.payload.title);
  return { success: true };
}

/**
 * Send in-app notification (already in database)
 */
async function sendInAppNotification(supabase: any, notification: any): Promise<DeliveryResult> {
  // In-app notifications are already stored in the database
  // Just mark as sent - the client will fetch them
  console.log(`[In-App] Notification ready for ${notification.user_id}:`, notification.payload.title);
  return { success: true };
}

/*
 * INTEGRATION CHECKLIST:
 * 
 * 1. Expo Push Notifications:
 *    - Install expo-notifications in main app
 *    - Register device tokens in user_devices table
 *    - Set EXPO_ACCESS_TOKEN env variable
 * 
 * 2. Email Service (Choose one):
 *    - SendGrid: Set SENDGRID_API_KEY
 *    - AWS SES: Set AWS credentials
 *    - Mailgun: Set MAILGUN_API_KEY
 * 
 * 3. Deploy function:
 *    supabase functions deploy deliver-notifications
 * 
 * 4. Set up cron (every 5 minutes):
 *    Run via Supabase cron or external scheduler
 */
