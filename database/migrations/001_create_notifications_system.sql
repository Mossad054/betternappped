-- Migration: Create Notifications & Reminders System
-- Date: 2025-11-05
-- Description: Comprehensive notification preferences, per-item overrides, outbox, and device tracking

-- ============================================================
-- Table: notification_preferences
-- Purpose: Stores user-level notification preferences by type
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily_reminder', 'streak_alert', 'experiment_reminder', 'activity_insight', 'sleep_tip', 'habit_suggestion', 'missed_log')),
  
  -- Channel preferences (array of: 'push', 'email', 'in_app')
  channels JSONB NOT NULL DEFAULT '["in_app"]'::jsonb,
  
  -- Frequency: 'immediate', 'daily_digest', 'weekly_digest'
  frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest')),
  
  -- Priority: 'normal', 'high'
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  
  -- Timing preferences
  time_of_day TIME, -- Preferred time for daily notifications (e.g., '20:00:00')
  
  -- Quiet hours
  quiet_hours_start TIME, -- Start of do-not-disturb (e.g., '22:00:00')
  quiet_hours_end TIME,   -- End of do-not-disturb (e.g., '07:00:00')
  
  -- Enable/disable
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one preference row per user per type
  UNIQUE(user_id, type)
);

-- ============================================================
-- Table: item_notification_overrides
-- Purpose: Per-habit or per-experiment notification overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.item_notification_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Item reference (habit_id or experiment_id)
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('habit', 'experiment')),
  
  -- Override channels
  channels JSONB DEFAULT '["push"]'::jsonb,
  
  -- Override frequency
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest', 'on_milestone', 'when_missed')),
  
  -- Override time
  time_of_day TIME,
  
  -- Weekdays filter (array of integers: 0=Sunday, 6=Saturday)
  -- Example: [1,2,3,4,5] = weekdays only
  weekdays JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, item_id, item_type)
);

-- ============================================================
-- Table: notifications
-- Purpose: Notification outbox and delivery history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification type (matches notification_preferences.type)
  type TEXT NOT NULL,
  
  -- Channel: 'push', 'email', 'in_app'
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'in_app')),
  
  -- Status: 'queued', 'sent', 'failed', 'delivered', 'read'
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'delivered', 'read')),
  
  -- Payload (flexible JSON structure)
  -- Example: { "title": "Daily Reminder", "body": "Time to log your mood", "data": {...} }
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Scheduling
  send_after TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Delivery timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Table: user_devices
-- Purpose: Track user devices for push notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Device token from Expo/FCM/APNS
  device_token TEXT NOT NULL,
  
  -- Platform: 'ios', 'android', 'web'
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  
  -- Push notifications enabled on this device
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Last activity timestamp
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, device_token)
);

-- ============================================================
-- Indexes for Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON public.notification_preferences(type);

CREATE INDEX IF NOT EXISTS idx_item_overrides_user ON public.item_notification_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_item_overrides_item ON public.item_notification_overrides(item_id, item_type);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_send_after ON public.notifications(send_after);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_token ON public.user_devices(device_token);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_notification_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: notification_preferences
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences" ON public.notification_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: item_notification_overrides
CREATE POLICY "Users can view own item overrides" ON public.item_notification_overrides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item overrides" ON public.item_notification_overrides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own item overrides" ON public.item_notification_overrides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own item overrides" ON public.item_notification_overrides
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: user_devices
CREATE POLICY "Users can view own devices" ON public.user_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON public.user_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON public.user_devices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON public.user_devices
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_notification_updated_at();

-- Trigger for item_notification_overrides
CREATE TRIGGER update_item_overrides_updated_at
  BEFORE UPDATE ON public.item_notification_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_notification_updated_at();

-- ============================================================
-- Default Notification Preferences
-- Purpose: Initialize default preferences for new users
-- ============================================================

-- Function to initialize default notification preferences
CREATE OR REPLACE FUNCTION public.initialize_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Daily reminder (enabled by default)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, time_of_day, enabled)
  VALUES (NEW.id, 'daily_reminder', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '20:00:00', true);
  
  -- Streak alerts (enabled by default, high priority)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, enabled)
  VALUES (NEW.id, 'streak_alert', '["push", "in_app"]'::jsonb, 'immediate', 'high', true);
  
  -- Experiment reminders (enabled by default)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, time_of_day, enabled)
  VALUES (NEW.id, 'experiment_reminder', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '19:00:00', true);
  
  -- Activity insights (daily digest)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, enabled)
  VALUES (NEW.id, 'activity_insight', '["in_app"]'::jsonb, 'daily_digest', 'normal', false);
  
  -- Sleep tips (weekly digest)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, enabled)
  VALUES (NEW.id, 'sleep_tip', '["in_app"]'::jsonb, 'weekly_digest', 'normal', false);
  
  -- Habit suggestions (disabled by default)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, enabled)
  VALUES (NEW.id, 'habit_suggestion', '["in_app"]'::jsonb, 'weekly_digest', 'normal', false);
  
  -- Missed log reminders (enabled)
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, time_of_day, enabled)
  VALUES (NEW.id, 'missed_log', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '21:00:00', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize preferences for new users
CREATE TRIGGER on_user_created_initialize_notifications
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_notification_preferences();

-- ============================================================
-- Comments for Documentation
-- ============================================================
COMMENT ON TABLE public.notification_preferences IS 'User-level notification preferences by type with channel, frequency, and timing controls';
COMMENT ON TABLE public.item_notification_overrides IS 'Per-habit or per-experiment notification overrides with weekday filters';
COMMENT ON TABLE public.notifications IS 'Notification outbox and delivery history with status tracking';
COMMENT ON TABLE public.user_devices IS 'User device registry for push notification token management';

COMMENT ON COLUMN public.notification_preferences.channels IS 'Array of enabled channels: push, email, in_app';
COMMENT ON COLUMN public.notification_preferences.frequency IS 'Delivery frequency: immediate, daily_digest, weekly_digest';
COMMENT ON COLUMN public.notification_preferences.priority IS 'Priority level: normal (batchable), high (always immediate)';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_start IS 'Do-not-disturb start time (e.g., 22:00)';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_end IS 'Do-not-disturb end time (e.g., 07:00)';

COMMENT ON COLUMN public.item_notification_overrides.weekdays IS 'Array of weekday numbers (0=Sunday, 6=Saturday) when notifications allowed';
COMMENT ON COLUMN public.item_notification_overrides.frequency IS 'Override frequency: immediate, daily_digest, weekly_digest, on_milestone, when_missed';

COMMENT ON COLUMN public.notifications.payload IS 'Notification content as JSON: { title, body, data }';
COMMENT ON COLUMN public.notifications.send_after IS 'Timestamp when notification should be sent (for scheduling/batching)';
COMMENT ON COLUMN public.notifications.status IS 'Lifecycle: queued → sent → delivered → read';
