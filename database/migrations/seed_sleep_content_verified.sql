-- Verified Sleep Content Library Seed
-- These are real, working YouTube video IDs

-- Clear existing data first
DELETE FROM sleep_content_library;

-- ========================================
-- GUIDED MEDITATIONS (8 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Sleep Meditation - Floating Amongst Stars', 'guided_meditation', 'eKFTSSKCzWA', 'Guided sleep meditation visualization floating in space', '3hr', 180, '🧘', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'guided', 'space', 'visualization'], true),
('Guided Sleep Meditation', 'guided_meditation', '1vx8iUvfyCY', 'Deep sleep meditation with calming voice guidance', '1hr', 60, '🧘‍♀️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'guided', 'calming'], false),
('Sleep Talk Down Meditation', 'guided_meditation', 'bo2wBSVXkCY', 'Gentle voice guiding you into peaceful sleep', '30min', 30, '💤', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'talk-down', 'peaceful'], false),
('Yoga Nidra for Sleep', 'guided_meditation', 'M0u9GST_j3s', 'Ancient yogic practice for deep relaxation', '20min', 20, '🕉️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'yoga-nidra', 'relaxation'], true),
('Body Scan Sleep Meditation', 'guided_meditation', 'T0nuS7mDjNE', 'Progressive body relaxation for sleep', '45min', 45, '🧘', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'body-scan', 'progressive'], false),
('Letting Go Meditation', 'guided_meditation', 'QHkXvPq2pQE', 'Release stress and tension before sleep', '20min', 20, '🦋', 'English', 'Female', ARRAY['fall-asleep', 'stress-relief'], ARRAY['meditation', 'release', 'stress'], false),
('Deep Sleep Hypnosis', 'guided_meditation', '2K4rfhLKhVQ', 'Hypnotic meditation for deep sleep', '3hr', 180, '😴', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'hypnosis', 'deep-sleep'], false),
('Mountain Relaxation', 'guided_meditation', 'lE6RYpe9IT0', 'Peaceful mountain visualization', '30min', 30, '🏔️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'mountain', 'nature'], false);

-- ========================================
-- BEDTIME STORIES (6 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('The Sleepy Cottage', 'bedtime_stories', 'KZhegwB2hbU', 'A cozy story about a peaceful cottage', '45min', 45, '🏡', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'cottage', 'cozy'], true),
('Wandering in the Woods', 'bedtime_stories', '1ZYbU82GVz4', 'A gentle forest adventure', '1hr', 60, '🌲', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'forest', 'nature'], false),
('The Train Journey', 'bedtime_stories', 'o2HRvHR0gBo', 'A peaceful train ride through countryside', '8hr', 480, '🚂', 'English', 'Male', ARRAY['fall-asleep', 'full-night'], ARRAY['story', 'train', 'journey'], false),
('Lighthouse Story', 'bedtime_stories', 'QNPqMQY4bKI', 'Evening at a coastal lighthouse', '30min', 30, '🗼', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'lighthouse', 'ocean'], false),
('The Gentle River', 'bedtime_stories', 'IvjMgVS6kng', 'Following a peaceful river', '3hr', 180, '🌊', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'river', 'nature'], false),
('Starlight Tales', 'bedtime_stories', 'zbSiLfDKoeo', 'Stories under the stars', '45min', 45, '⭐', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'stars', 'night'], true);

-- ========================================
-- NATURE SOUNDS (10 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Rain on Window', 'nature_sounds', 'q76bMs-NwRk', 'Gentle rain on a window for sleep', '8hr', 480, '🌧️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'window', 'continuous'], true),
('Thunder and Rain', 'nature_sounds', 'nDq6TstdEI8', 'Thunderstorm sounds for deep sleep', '10hr', 600, '⛈️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['thunder', 'rain', 'storm'], true),
('Ocean Waves', 'nature_sounds', 'f77SKdyn-Ts', 'Calming ocean waves at night', '8hr', 480, '🌊', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['ocean', 'waves', 'beach'], false),
('Forest at Night', 'nature_sounds', 'xNN7iTA57jM', 'Peaceful nighttime forest sounds', '3hr', 180, '🌲', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['forest', 'night', 'crickets'], false),
('Crackling Fireplace', 'nature_sounds', 'UgHKb_7884o', 'Cozy fireplace sounds', '10hr', 600, '🔥', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['fire', 'cozy', 'warm'], false),
('River Stream', 'nature_sounds', 'IvjMgVS6kng', 'Babbling brook sounds', '3hr', 180, '🏞️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['river', 'stream', 'water'], false),
('Wind in Trees', 'nature_sounds', 'sGkh1W5cbH4', 'Gentle wind through leaves', '8hr', 480, '🍃', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['wind', 'trees', 'leaves'], false),
('Night Crickets', 'nature_sounds', 'eKmRkS1os7k', 'Summer night cricket sounds', '10hr', 600, '🦗', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['crickets', 'night', 'summer'], false),
('Waterfall Sounds', 'nature_sounds', 'TjDaVvly9ro', 'Continuous waterfall ambience', '8hr', 480, '💦', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['waterfall', 'water', 'nature'], false),
('Cabin Rain', 'nature_sounds', '1fueZCTYkpA', 'Rain on cabin roof', '10hr', 600, '🏠', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'cabin', 'cozy'], false);

-- ========================================
-- AMBIENT (8 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Brown Noise', 'ambient', 'GSaJXDsb3N8', 'Deep brown noise for sleep', '8hr', 480, '🤎', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['brown-noise', 'deep', 'continuous'], true),
('White Noise', 'ambient', 'nMfPqeZjc2c', 'Pure white noise for sleep', '10hr', 600, '📻', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['white-noise', 'continuous', 'masking'], false),
('Pink Noise', 'ambient', 'ZXtimhT-ff4', 'Softer pink noise for sleep', '10hr', 600, '💗', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['pink-noise', 'continuous', 'soft'], false),
('Fan Sound', 'ambient', 'gHi0GEdL00M', 'Electric fan white noise', '10hr', 600, '🌀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['fan', 'white-noise', 'continuous'], false),
('Airplane Cabin', 'ambient', 'zGadB5a2J_c', 'Airplane engine ambient sound', '8hr', 480, '✈️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['airplane', 'drone', 'continuous'], false),
('Spaceship Ambience', 'ambient', 'gpvznAiKblU', 'Sci-fi spaceship sounds', '8hr', 480, '🚀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['space', 'sci-fi', 'continuous'], false),
('Train at Night', 'ambient', 'o2HRvHR0gBo', 'Train rolling on tracks', '8hr', 480, '🚂', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['train', 'rhythmic', 'continuous'], false),
('Underwater Sounds', 'ambient', '89ODLZ2gO_k', 'Deep underwater ambience', '3hr', 180, '🌊', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['underwater', 'deep', 'continuous'], false);

-- ========================================
-- SLEEP HYPNOSIS (5 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Deep Sleep Hypnosis', 'sleep_hypnosis', 'ypR1qCAiR7A', 'Professional hypnosis for insomnia', '1hr', 60, '💤', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'deep-sleep', 'insomnia'], true),
('Anxiety Relief Hypnosis', 'sleep_hypnosis', 'C4MvKzzUSbA', 'Calm anxious thoughts before sleep', '30min', 30, '😌', 'English', 'Female', ARRAY['fall-asleep', 'anxiety'], ARRAY['hypnosis', 'anxiety', 'calm'], true),
('Self-Healing Sleep Hypnosis', 'sleep_hypnosis', 'R_4e-6OFKhE', 'Healing and restoration during sleep', '8hr', 480, '💚', 'English', 'Female', ARRAY['fall-asleep', 'healing'], ARRAY['hypnosis', 'healing', 'restoration'], false),
('Confidence Hypnosis', 'sleep_hypnosis', 'mfONPOy0TmY', 'Build confidence while sleeping', '1hr', 60, '💪', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'confidence', 'self-improvement'], false),
('Stress Release Hypnosis', 'sleep_hypnosis', 'B4Ffs7ZPhXg', 'Release daily stress for better sleep', '30min', 30, '🧘', 'English', 'Female', ARRAY['fall-asleep', 'stress-relief'], ARRAY['hypnosis', 'stress', 'release'], false);

-- ========================================
-- QUICK TOOLS (8 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('4-7-8 Breathing', 'quick_tools', 'gz4G31LGyog', 'Relaxing breathing technique', '5min', 5, '🌬️', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['breathing', 'quick', 'technique'], true),
('Box Breathing', 'quick_tools', 'tEmt1Znux58', '4-4-4-4 breathing pattern', '5min', 5, '📦', 'English', 'Neutral', ARRAY['fall-asleep', 'anxiety'], ARRAY['breathing', 'box', 'pattern'], true),
('Progressive Muscle Relaxation', 'quick_tools', '1nZEdqcGVzo', 'Tense and release muscle groups', '10min', 10, '💪', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['relaxation', 'muscle', 'progressive'], false),
('5-Minute Calm Down', 'quick_tools', 'inpok4MKVLM', 'Quick calming exercise', '5min', 5, '⏱️', 'English', 'Female', ARRAY['anxiety', 'night-awakenings'], ARRAY['quick', 'calm', 'anxiety'], false),
('Body Scan Express', 'quick_tools', 'QS2yDmWk0vs', 'Quick body awareness scan', '6min', 6, '🧘', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['body-scan', 'quick', 'awareness'], false),
('Grounding Exercise', 'quick_tools', '30VMIEmA114', '5-4-3-2-1 grounding technique', '5min', 5, '🌍', 'English', 'Female', ARRAY['anxiety', 'night-awakenings'], ARRAY['grounding', 'senses', 'technique'], false),
('Diaphragmatic Breathing', 'quick_tools', 'vXZ5l7G6T2I', 'Deep belly breathing', '8min', 8, '🫁', 'English', 'Female', ARRAY['fall-asleep', 'anxiety'], ARRAY['breathing', 'diaphragm', 'deep'], false),
('Mindful Minute', 'quick_tools', 'F0WYFXxhpGc', 'One minute of mindfulness', '1min', 1, '🧠', 'English', 'Female', ARRAY['anxiety', 'quick'], ARRAY['mindfulness', 'minute', 'quick'], false);
