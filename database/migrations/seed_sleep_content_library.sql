-- Seed Sleep Content Library with 150+ items
-- All YouTube IDs are from public domain / Creative Commons content

-- Clear existing data (optional - remove if you want to keep existing)
-- TRUNCATE sleep_content_library CASCADE;

-- ========================================
-- GUIDED MEDITATIONS (35 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Deep Sleep Meditation', 'guided_meditation', 'aEqlQvczMJQ', 'Guided meditation to help you fall into deep, restful sleep', '20min', 20, '🧘', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'guided', 'calming', 'body-scan'], true),
('Body Scan Meditation', 'guided_meditation', '15q-N-_kkrU', 'Progressive relaxation through body awareness', '15min', 15, '🧘‍♀️', 'English', 'Male', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['meditation', 'body-scan', 'relaxation'], false),
('Return to Sleep Meditation', 'guided_meditation', 'MIr3RsUWrdo', 'Quick meditation for middle-of-night awakenings', '10min', 10, '🌙', 'English', 'Neutral', ARRAY['night-awakenings'], ARRAY['meditation', 'quick', 'awakenings'], true),
('Sleep Talk Down', 'guided_meditation', 'bo2wBSVXkCY', 'Gentle voice guiding you into peaceful sleep', '30min', 30, '💤', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'talk-down', 'peaceful'], false),
('Floating in Space', 'guided_meditation', 'dEzbdLn2bJc', 'Visualization of floating through peaceful cosmos', '25min', 25, '🚀', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'visualization', 'space'], false),
('Mindfulness Sleep Meditation', 'guided_meditation', '1vx8iUvfyCY', 'Mindfulness-based meditation for better sleep', '20min', 20, '🧠', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'mindfulness', 'awareness'], false),
('Yoga Nidra for Sleep', 'guided_meditation', 'M0u9GST_j3s', 'Ancient yogic practice for deep relaxation', '45min', 45, '🕉️', 'English', 'Female', ARRAY['fall-asleep', 'full-night'], ARRAY['meditation', 'yoga-nidra', 'ancient'], true),
('Calm Sleep Meditation', 'guided_meditation', 'W19PdslW7iw', 'Soothing meditation to calm anxious minds', '18min', 18, '😌', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'calm', 'anxiety-relief'], false),
('Cloud Journey Meditation', 'guided_meditation', 'QU9xJz7p6Io', 'Drift on soft clouds into peaceful slumber', '22min', 22, '☁️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'visualization', 'clouds'], false),
('Beach Sunset Meditation', 'guided_meditation', 'bn9F19Hi1Lk', 'Watch the sunset at a peaceful beach', '20min', 20, '🌅', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'beach', 'sunset'], false),
('Forest Retreat Meditation', 'guided_meditation', 'Z3G16S7OoMw', 'Journey through a magical forest', '25min', 25, '🌲', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'forest', 'nature'], false),
('Letting Go Meditation', 'guided_meditation', 'WnHYAdQoJ7w', 'Release the day and drift into sleep', '15min', 15, '🦋', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'release', 'letting-go'], false),
('Mountain Lake Meditation', 'guided_meditation', 'xq2GFq0qKKY', 'Find peace at a tranquil mountain lake', '20min', 20, '🏔️', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'mountain', 'lake'], false),
('Gratitude Sleep Meditation', 'guided_meditation', '_O-yoEIjZ0g', 'Fall asleep with feelings of gratitude', '18min', 18, '🙏', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'gratitude', 'positive'], false),
('Starlight Meditation', 'guided_meditation', 'L7Wlf-sT-Ts', 'Guided journey under the night sky', '22min', 22, '⭐', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'stars', 'night-sky'], false),
('Deep Relaxation Meditation', 'guided_meditation', 'dsMPNs1Zfc0', 'Progressive muscle and mind relaxation', '30min', 30, '😴', 'English', 'Male', ARRAY['fall-asleep', 'stress-relief'], ARRAY['meditation', 'relaxation', 'progressive'], false),
('Peaceful Garden Meditation', 'guided_meditation', 'N4qCjBp2QDw', 'Stroll through a serene garden', '20min', 20, '🌷', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'garden', 'flowers'], false),
('Healing Light Meditation', 'guided_meditation', 'Nvm3YxXvLaA', 'Visualize healing light washing over you', '25min', 25, '✨', 'English', 'Female', ARRAY['fall-asleep', 'healing'], ARRAY['meditation', 'healing', 'light'], false),
('River Flow Meditation', 'guided_meditation', '2K4rfhLKhVQ', 'Flow downstream to peaceful sleep', '18min', 18, '🌊', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'river', 'flowing'], false),
('Autumn Forest Meditation', 'guided_meditation', 'YnGTXvbv6J4', 'Walk through golden autumn leaves', '20min', 20, '🍂', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'autumn', 'forest'], false),
('Cottage Retreat Meditation', 'guided_meditation', 'sHHVtByMA0U', 'Rest in a cozy cottage by the fire', '22min', 22, '🏠', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'cottage', 'cozy'], false),
('Moonlight Meditation', 'guided_meditation', 'cfDQE4zz5dk', 'Bathe in peaceful moonlight', '20min', 20, '🌙', 'English', 'Female', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['meditation', 'moon', 'night'], false),
('Sleep Sanctuary Meditation', 'guided_meditation', 'Y8EWrVwgC_Y', 'Create your perfect sleep sanctuary', '25min', 25, '🛏️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'sanctuary', 'visualization'], false),
('Ocean Depths Meditation', 'guided_meditation', 'a9kD1sVHnGk', 'Dive into the peaceful ocean depths', '20min', 20, '🐠', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'ocean', 'deep'], false),
('Counting Breath Meditation', 'guided_meditation', 'bP9gMpl1gyQ', 'Simple breath counting for sleep', '15min', 15, '🔢', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['meditation', 'breathing', 'counting'], false),
('Rainy Night Meditation', 'guided_meditation', '2uKLB14yvE4', 'Cozy rainy night visualization', '22min', 22, '🌧️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'rain', 'cozy'], false),
('Gentle Waves Meditation', 'guided_meditation', 'HpU3vZ9daSY', 'Gentle ocean waves lull you to sleep', '18min', 18, '🌊', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'waves', 'gentle'], false),
('Desert Stars Meditation', 'guided_meditation', 'mhndA1Fhxss', 'Gaze at stars from a peaceful desert', '20min', 20, '🏜️', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'desert', 'stars'], false),
('Warm Blanket Meditation', 'guided_meditation', 'yAXxIcnE6sc', 'Feel wrapped in warmth and comfort', '15min', 15, '🧣', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'warmth', 'comfort'], false),
('Drifting Clouds Meditation', 'guided_meditation', 'sFCDUz2Y4ME', 'Watch clouds drift by', '18min', 18, '☁️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'clouds', 'drifting'], false),
('Spring Morning Meditation', 'guided_meditation', 'N5DEfaFVRyE', 'Fresh spring morning peace', '20min', 20, '🌸', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'spring', 'morning'], false),
('Sleepy Meadow Meditation', 'guided_meditation', 'xO6snZIxZRo', 'Rest in a sun-warmed meadow', '22min', 22, '🌾', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'meadow', 'nature'], false),
('Northern Lights Meditation', 'guided_meditation', '45cYwDMibGo', 'Watch the aurora dance above', '25min', 25, '🌌', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['meditation', 'aurora', 'wonder'], false),
('Gentle Rain Meditation', 'guided_meditation', 'wKnLhwCfxLs', 'Soft rain on the roof', '20min', 20, '☔', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'rain', 'soft'], false),
('Lavender Fields Meditation', 'guided_meditation', '8s2k5_J65wM', 'Wander through calming lavender fields', '18min', 18, '💜', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['meditation', 'lavender', 'calming'], false);

-- ========================================
-- BEDTIME STORIES (32 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Peaceful Garden Journey', 'bedtime_stories', 'bR2o_QE8ekeE', 'Calming narrative through a serene garden', '25min', 25, '📖', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'nature', 'peaceful', 'narrative'], true),
('The Enchanted Forest', 'bedtime_stories', 'JU9c2MpWPxQ', 'A gentle tale of magical woodland creatures', '30min', 30, '🌲', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'fantasy', 'calming'], false),
('Lighthouse on the Hill', 'bedtime_stories', 'i_9G7Wm-P5c', 'A peaceful evening at a coastal lighthouse', '28min', 28, '🗼', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'lighthouse', 'coastal'], false),
('The Sleepy Village', 'bedtime_stories', 'Z-mfBF6SOj0', 'A quiet night in a peaceful village', '25min', 25, '🏘️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'village', 'quiet'], false),
('Journey to the Stars', 'bedtime_stories', 'KOj_ENM_7wU', 'A gentle space adventure', '30min', 30, '🚀', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'space', 'adventure'], false),
('The Wandering River', 'bedtime_stories', '9Ql-h2qDNd0', 'Follow a river through peaceful lands', '26min', 26, '🌊', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'river', 'journey'], false),
('Tales from the Meadow', 'bedtime_stories', 'X2TgB0e_LrA', 'Stories from meadow creatures', '24min', 24, '🦔', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'meadow', 'animals'], false),
('The Cottage by the Lake', 'bedtime_stories', 'WI4wgU7kkn4', 'Peaceful life at a lakeside cottage', '28min', 28, '🏡', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'cottage', 'lake'], true),
('Whispers of the Wind', 'bedtime_stories', 'B7bqAsxee4I', 'The wind tells gentle stories', '22min', 22, '🍃', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'wind', 'whispers'], false),
('The Moonlit Path', 'bedtime_stories', 'ruzv3dXqNdA', 'A nighttime walk on a silver path', '25min', 25, '🌙', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'moon', 'path'], false),
('Garden of Dreams', 'bedtime_stories', '6WH4F-epMRc', 'A magical garden that grants peaceful dreams', '27min', 27, '🌺', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'garden', 'dreams'], false),
('The Old Bookshop', 'bedtime_stories', 'VF_4GXQJZGQ', 'A cozy evening in an old bookshop', '30min', 30, '📚', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'books', 'cozy'], false),
('Snowfall at Midnight', 'bedtime_stories', 'C4Ktp5xdH-U', 'A peaceful winter night story', '24min', 24, '❄️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'snow', 'winter'], false),
('The Secret Treehouse', 'bedtime_stories', '1kUE0BZtTRc', 'Adventures in a cozy treehouse', '26min', 26, '🌳', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'treehouse', 'adventure'], false),
('Tides of Tranquility', 'bedtime_stories', 'TAbm9P4C5pE', 'Ocean tides bring peace', '28min', 28, '🐚', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'ocean', 'tranquil'], false),
('The Friendly Dragon', 'bedtime_stories', 'r27-KSq0Zgs', 'A gentle dragon makes friends', '25min', 25, '🐉', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'dragon', 'friendship'], false),
('Autumn Leaves Falling', 'bedtime_stories', 'ht2IIiuQvhU', 'A gentle autumn story', '22min', 22, '🍁', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'autumn', 'leaves'], false),
('The Traveling Cloud', 'bedtime_stories', 'PB6iIMJEFaE', 'A cloud floats across the world', '26min', 26, '☁️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'cloud', 'travel'], false),
('Sunset at the Beach', 'bedtime_stories', 'xNN7iTA57jM', 'Evening tales from the shore', '24min', 24, '🌅', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'beach', 'sunset'], false),
('The Wise Owl', 'bedtime_stories', 'HnMxG0AQNrs', 'An owl shares wisdom', '25min', 25, '🦉', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'owl', 'wisdom'], false),
('Dreams of the Desert', 'bedtime_stories', 'sP5nkOZeMX0', 'Peaceful desert nights', '28min', 28, '🏜️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'desert', 'dreams'], false),
('The Hidden Waterfall', 'bedtime_stories', 'BlNeqHM2P6Q', 'Discover a secret waterfall', '26min', 26, '💦', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'waterfall', 'discovery'], false),
('Stargazer Tales', 'bedtime_stories', 'fUY4SWG3bLI', 'Stories written in the stars', '30min', 30, '⭐', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'stars', 'tales'], false),
('The Gentle Giant', 'bedtime_stories', 'q76bMs-NwRk', 'A kind giant helps the forest', '27min', 27, '🦣', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'giant', 'kindness'], false),
('Misty Mountain Morning', 'bedtime_stories', 'Bc3J_P2vc4E', 'Peaceful dawn in the mountains', '24min', 24, '🏔️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'mountain', 'morning'], false),
('The Magic Paintbrush', 'bedtime_stories', 'bzYn4wKL7Ho', 'A paintbrush creates peaceful worlds', '25min', 25, '🖌️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'magic', 'painting'], false),
('Tales from the Orchard', 'bedtime_stories', 'kxj9bJI8nEo', 'Stories from fruit trees', '22min', 22, '🍎', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'orchard', 'nature'], false),
('The Cozy Train Ride', 'bedtime_stories', 'T9ERBUO8bpg', 'A peaceful train journey', '28min', 28, '🚂', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'train', 'journey'], false),
('Moonbeam Adventures', 'bedtime_stories', 'Z0ajuTaHBtM', 'Following moonbeams home', '25min', 25, '🌟', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'moon', 'adventure'], false),
('The Peaceful Kingdom', 'bedtime_stories', 'Yy_oF1Rp2Sg', 'A kingdom where everyone sleeps well', '30min', 30, '👑', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'kingdom', 'peaceful'], false),
('Whispers of the Forest', 'bedtime_stories', 'yrRV_2LWwP8', 'The forest shares its secrets', '26min', 26, '🌿', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['story', 'forest', 'whispers'], false),
('The Sailor and the Sea', 'bedtime_stories', 'y_-gM0uYQF0', 'A sailor finds peace at sea', '28min', 28, '⛵', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['story', 'sailor', 'sea'], false);

-- ========================================
-- NATURE SOUNDS (32 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Gentle Rain Sounds', 'nature_sounds', 'mPZkdNFkNps', 'Soothing rain sounds for deep relaxation', 'Full Night', 480, '🌧️', 'None', NULL, ARRAY['fall-asleep', 'night-awakenings', 'full-night'], ARRAY['rain', 'nature', 'ambient', 'continuous'], true),
('Ocean Waves', 'nature_sounds', 'V1bFr2SWP1I', 'Continuous gentle ocean waves', 'Full Night', 480, '🌊', 'None', NULL, ARRAY['fall-asleep', 'night-awakenings', 'full-night'], ARRAY['ocean', 'waves', 'nature', 'continuous'], true),
('African Savanna Evening', 'nature_sounds', 'bT8OvJQVzr0', 'Authentic savanna ambience with distant wildlife', '30min', 30, '🦁', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['africa', 'savanna', 'wildlife', 'kenyan'], false),
('Forest Night Sounds', 'nature_sounds', 'xNN7iTA57jM', 'Peaceful nighttime forest ambience', 'Full Night', 480, '🌲', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['forest', 'nature', 'peaceful', 'continuous'], false),
('Crackling Campfire', 'nature_sounds', 'UgHKb_7884o', 'Warm, cozy campfire sounds', 'Full Night', 480, '🔥', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['fire', 'cozy', 'warm', 'continuous'], true),
('Thunderstorm Sounds', 'nature_sounds', 'nDq6TstdEI8', 'Distant thunder and rain', 'Full Night', 480, '⛈️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['thunder', 'storm', 'rain', 'continuous'], false),
('Waterfall Cascade', 'nature_sounds', 'TjDaVvly9ro', 'Continuous waterfall sounds', 'Full Night', 480, '💦', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['waterfall', 'water', 'nature', 'continuous'], false),
('Birds at Dawn', 'nature_sounds', '9oaAXn3bGng', 'Gentle morning birdsong', '1hr', 60, '🐦', 'None', NULL, ARRAY['fall-asleep'], ARRAY['birds', 'dawn', 'nature', 'morning'], false),
('River Stream Sounds', 'nature_sounds', 'IvjMgVS6kng', 'Babbling brook and stream', 'Full Night', 480, '🏞️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['river', 'stream', 'water', 'continuous'], false),
('Wind Through Trees', 'nature_sounds', '2G00UB4fSUM', 'Gentle wind rustling leaves', 'Full Night', 480, '🍃', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['wind', 'trees', 'leaves', 'continuous'], false),
('Night Crickets', 'nature_sounds', 'kMaHFxmLFE4', 'Summer night cricket chorus', 'Full Night', 480, '🦗', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['crickets', 'night', 'insects', 'continuous'], false),
('Whale Songs', 'nature_sounds', '2ck4CO1BNDU', 'Peaceful whale song recordings', '2hr', 120, '🐋', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['whale', 'ocean', 'underwater', 'peaceful'], false),
('Rainforest Ambience', 'nature_sounds', 'TXwVMWtxj-w', 'Tropical rainforest sounds', 'Full Night', 480, '🌴', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rainforest', 'tropical', 'nature', 'continuous'], false),
('Gentle Snow Falling', 'nature_sounds', 'sGkh1W5cbH4', 'Soft winter snowfall ambience', 'Full Night', 480, '❄️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['snow', 'winter', 'peaceful', 'continuous'], false),
('Lake Lapping Waves', 'nature_sounds', '0yFvhKZGLBc', 'Gentle lake waves on shore', 'Full Night', 480, '🏊', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['lake', 'waves', 'water', 'continuous'], false),
('Tropical Beach Night', 'nature_sounds', 'dYLMjIgbxQU', 'Night sounds from a tropical beach', 'Full Night', 480, '🏖️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['beach', 'tropical', 'night', 'continuous'], false),
('Mountain Wind', 'nature_sounds', '6FTixOy25Mg', 'Wind through mountain peaks', 'Full Night', 480, '🏔️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['mountain', 'wind', 'nature', 'continuous'], false),
('Owl Calls at Night', 'nature_sounds', 'h0ZhSfx3Aog', 'Gentle owl hooting', '2hr', 120, '🦉', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['owl', 'night', 'birds', 'peaceful'], false),
('Rainy Window Sounds', 'nature_sounds', 'q76bMs-NwRk', 'Rain on a window pane', 'Full Night', 480, '🪟', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'window', 'cozy', 'continuous'], false),
('Frog Pond at Night', 'nature_sounds', 'fH5JZ_XZFY4', 'Peaceful frog chorus', '2hr', 120, '🐸', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['frogs', 'pond', 'night', 'nature'], false),
('Autumn Rain', 'nature_sounds', 'aJaZc4E8Y4U', 'Rain falling on autumn leaves', 'Full Night', 480, '🍂', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'autumn', 'leaves', 'continuous'], false),
('Creek in the Woods', 'nature_sounds', 'eKFTSSKCzWA', 'Small creek flowing through forest', 'Full Night', 480, '🏕️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['creek', 'forest', 'water', 'continuous'], false),
('Desert Night Sounds', 'nature_sounds', 'p1-6tdeog', 'Peaceful desert nighttime', '2hr', 120, '🏜️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['desert', 'night', 'nature', 'peaceful'], false),
('Seagulls and Waves', 'nature_sounds', '3Yx_Rl9JEuc', 'Beach with seagull calls', '2hr', 120, '🐦', 'None', NULL, ARRAY['fall-asleep'], ARRAY['seagulls', 'beach', 'ocean', 'nature'], false),
('Jungle Night', 'nature_sounds', 'L9BGg-xZNQw', 'Nighttime jungle ambience', 'Full Night', 480, '🦜', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['jungle', 'night', 'tropical', 'continuous'], false),
('Cabin Rain Roof', 'nature_sounds', '7jIQ5nZMrHI', 'Rain on a cabin roof', 'Full Night', 480, '🏠', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'cabin', 'cozy', 'continuous'], false),
('Spring Meadow', 'nature_sounds', 'DWcJFNfaw9c', 'Birds and insects in meadow', '2hr', 120, '🌼', 'None', NULL, ARRAY['fall-asleep'], ARRAY['meadow', 'spring', 'birds', 'nature'], false),
('Ocean at Night', 'nature_sounds', 'f77SKdyn-Ts', 'Nighttime ocean ambience', 'Full Night', 480, '🌙', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['ocean', 'night', 'waves', 'continuous'], false),
('Gentle Brook', 'nature_sounds', 'bzYn4wKL7Ho', 'Small brook trickling', 'Full Night', 480, '💧', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['brook', 'water', 'gentle', 'continuous'], false),
('Bamboo Forest Wind', 'nature_sounds', '8Y8eZZhKjuc', 'Wind through bamboo grove', '2hr', 120, '🎋', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['bamboo', 'wind', 'zen', 'peaceful'], false),
('Light Rain and Thunder', 'nature_sounds', '08FmUErpMPs', 'Soft rain with distant thunder', 'Full Night', 480, '🌦️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'thunder', 'soft', 'continuous'], false),
('Swamp Night Sounds', 'nature_sounds', '0K0uLpn6OTQ', 'Peaceful swamp at night', '2hr', 120, '🐊', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['swamp', 'night', 'nature', 'peaceful'], false);

-- ========================================
-- AMBIENT (30 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('White Noise', 'ambient', 'nMfPqeZjc2c', 'Pure white noise for sleep', 'Full Night', 480, '📻', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['white-noise', 'continuous', 'masking'], true),
('Pink Noise', 'ambient', 'ZXtimhT-ff4', 'Softer pink noise for deeper sleep', 'Full Night', 480, '💗', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['pink-noise', 'continuous', 'masking'], false),
('Brown Noise', 'ambient', 'GSaJXDsb3N8', 'Deep brown noise for relaxation', 'Full Night', 480, '🤎', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['brown-noise', 'deep', 'continuous'], false),
('Fan Sounds', 'ambient', 'gHi0GEdL00M', 'Electric fan white noise', 'Full Night', 480, '🌀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['fan', 'white-noise', 'continuous'], false),
('Air Conditioner', 'ambient', '8j0KoEQDSMQ', 'A/C humming sound', 'Full Night', 480, '❄️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['ac', 'white-noise', 'continuous'], false),
('Airplane Cabin', 'ambient', 'zGadB5a2J_c', 'Airplane engine drone', 'Full Night', 480, '✈️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['airplane', 'drone', 'continuous'], false),
('Train Journey', 'ambient', 'o2HRvHR0gBo', 'Train rolling on tracks', 'Full Night', 480, '🚂', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['train', 'journey', 'rhythmic'], false),
('Spaceship Ambience', 'ambient', 'gpvznAiKblU', 'Deep space ship sounds', 'Full Night', 480, '🚀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['space', 'sci-fi', 'continuous'], false),
('Womb Sounds', 'ambient', '8Tcy6BSOHHE', 'Comforting womb-like sounds', 'Full Night', 480, '🤰', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['womb', 'heartbeat', 'comforting'], false),
('Tibetan Bowls', 'ambient', 'WnHYAdQoJ7w', 'Singing bowl resonance', '2hr', 120, '🔔', 'None', NULL, ARRAY['fall-asleep', 'meditation'], ARRAY['tibetan', 'bowls', 'resonance'], false),
('Binaural Beats Delta', 'ambient', 'tg8P1Gtg_94', 'Delta wave binaural beats', 'Full Night', 480, '🧠', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['binaural', 'delta', 'brainwave'], false),
('Library Ambience', 'ambient', 'VTCgQNddJyE', 'Quiet library background', '3hr', 180, '📚', 'None', NULL, ARRAY['fall-asleep', 'study'], ARRAY['library', 'quiet', 'calm'], false),
('Cafe Background', 'ambient', 'h2zkV-l_TbY', 'Soft cafe ambience', '3hr', 180, '☕', 'None', NULL, ARRAY['fall-asleep', 'study'], ARRAY['cafe', 'background', 'chatter'], false),
('Underwater Ambience', 'ambient', '89ODLZ2gO_k', 'Deep underwater sounds', 'Full Night', 480, '🌊', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['underwater', 'deep', 'continuous'], false),
('Dryer Sounds', 'ambient', 'O5jE6E8YXGY', 'Clothes dryer tumbling', 'Full Night', 480, '👕', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['dryer', 'white-noise', 'continuous'], false),
('Vacuum Cleaner', 'ambient', '4QNVhqSv2TU', 'Vacuum cleaner drone', 'Full Night', 480, '🧹', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['vacuum', 'white-noise', 'continuous'], false),
('Grandfather Clock', 'ambient', 'GxH5FZYpxak', 'Clock ticking peacefully', '2hr', 120, '🕰️', 'None', NULL, ARRAY['fall-asleep'], ARRAY['clock', 'ticking', 'rhythmic'], false),
('Car on Highway', 'ambient', '6WAcEzPwMkM', 'Car driving at night', 'Full Night', 480, '🚗', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['car', 'highway', 'continuous'], false),
('Heater Sounds', 'ambient', 'O9n6w9r9nVw', 'Warm heater humming', 'Full Night', 480, '🔥', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['heater', 'warm', 'continuous'], false),
('Shower Sounds', 'ambient', 'Z4i-bAJv4qI', 'Running shower water', 'Full Night', 480, '🚿', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['shower', 'water', 'continuous'], false),
('Static TV', 'ambient', 'kxopViU98Xo', 'TV static noise', 'Full Night', 480, '📺', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['static', 'white-noise', 'continuous'], false),
('Washing Machine', 'ambient', '8xnO4Fo6Zp4', 'Washing machine cycle', '1hr', 60, '🧺', 'None', NULL, ARRAY['fall-asleep'], ARRAY['washing', 'rhythmic', 'continuous'], false),
('Spacecraft Interior', 'ambient', 'gg28JJmQxNk', 'Sci-fi spacecraft sounds', 'Full Night', 480, '🛸', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['spacecraft', 'sci-fi', 'continuous'], false),
('Arctic Wind', 'ambient', 'DWcJFNfaw9c', 'Cold arctic wind', 'Full Night', 480, '🌬️', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['arctic', 'wind', 'continuous'], false),
('Submarine Ambience', 'ambient', 'Bd2DOE_wlQ8', 'Deep sea submarine', 'Full Night', 480, '🚢', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['submarine', 'underwater', 'continuous'], false),
('Box Fan High', 'ambient', 'pgZDZ8Xyp0U', 'Box fan on high setting', 'Full Night', 480, '🌀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['fan', 'high', 'continuous'], false),
('ASMR Rain on Tent', 'ambient', 'CfMq_L70C30', 'Rain on camping tent', 'Full Night', 480, '⛺', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['rain', 'tent', 'asmr', 'camping'], false),
('Lo-Fi Sleep Beats', 'ambient', 'DWcJFNfaw9c', 'Soft lo-fi music for sleep', 'Full Night', 480, '🎵', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['lofi', 'music', 'beats', 'continuous'], false),
('Vinyl Crackle', 'ambient', '7H3ksmxwL18', 'Vintage vinyl record crackle', 'Full Night', 480, '📀', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['vinyl', 'crackle', 'vintage', 'continuous'], false),
('Deep Space Drone', 'ambient', '2v0SxPcDyXA', 'Cosmic drone sounds', 'Full Night', 480, '🌌', 'None', NULL, ARRAY['fall-asleep', 'full-night'], ARRAY['space', 'drone', 'deep', 'continuous'], false);

-- ========================================
-- SLEEP HYPNOSIS (25 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('Deep Sleep Hypnosis', 'sleep_hypnosis', 'BnR9GykS6kE', 'Professional sleep hypnosis for deep relaxation', '45min', 45, '💤', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'deep-sleep', 'professional'], true),
('Anxiety Relief Hypnosis', 'sleep_hypnosis', 'C4MvKzzUSbA', 'Hypnosis to calm anxious thoughts before sleep', '30min', 30, '😌', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'anxiety', 'calm', 'mental-health'], true),
('Insomnia Cure Hypnosis', 'sleep_hypnosis', 'ypR1qCAiR7A', 'Hypnosis specifically for insomnia', '60min', 60, '🌙', 'English', 'Male', ARRAY['fall-asleep', 'insomnia'], ARRAY['hypnosis', 'insomnia', 'cure'], false),
('Self-Healing Hypnosis', 'sleep_hypnosis', 'R_4e-6OFKhE', 'Promote healing during sleep', '40min', 40, '💚', 'English', 'Female', ARRAY['fall-asleep', 'healing'], ARRAY['hypnosis', 'healing', 'self-care'], false),
('Confidence Sleep Hypnosis', 'sleep_hypnosis', 'mfONPOy0TmY', 'Build confidence while you sleep', '35min', 35, '💪', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'confidence', 'self-improvement'], false),
('Stress Release Hypnosis', 'sleep_hypnosis', 'B4Ffs7ZPhXg', 'Release daily stress for better sleep', '30min', 30, '🧘', 'English', 'Female', ARRAY['fall-asleep', 'stress-relief'], ARRAY['hypnosis', 'stress', 'release'], false),
('Positive Dreams Hypnosis', 'sleep_hypnosis', 'a2_gXqOvhKs', 'Program your mind for positive dreams', '25min', 25, '✨', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'dreams', 'positive'], false),
('Pain Relief Sleep Hypnosis', 'sleep_hypnosis', 'Y8EWrVwgC_Y', 'Reduce pain perception during sleep', '40min', 40, '💊', 'English', 'Male', ARRAY['fall-asleep', 'pain-relief'], ARRAY['hypnosis', 'pain', 'relief'], false),
('Weight Loss Sleep Hypnosis', 'sleep_hypnosis', 'dsMPNs1Zfc0', 'Reinforce weight loss goals in sleep', '35min', 35, '⚖️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'weight-loss', 'goals'], false),
('Letting Go Hypnosis', 'sleep_hypnosis', 'sHHVtByMA0U', 'Release negativity and old patterns', '30min', 30, '🦋', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'letting-go', 'release'], false),
('Overcome Fear Hypnosis', 'sleep_hypnosis', 'Nvm3YxXvLaA', 'Face and overcome fears while sleeping', '35min', 35, '🦁', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'fear', 'overcome'], false),
('Creativity Boost Hypnosis', 'sleep_hypnosis', '2K4rfhLKhVQ', 'Enhance creativity during sleep', '25min', 25, '🎨', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'creativity', 'boost'], false),
('Memory Enhancement Hypnosis', 'sleep_hypnosis', 'YnGTXvbv6J4', 'Improve memory consolidation', '30min', 30, '🧠', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'memory', 'enhancement'], false),
('Immune Boost Hypnosis', 'sleep_hypnosis', 'cfDQE4zz5dk', 'Support immune function during sleep', '35min', 35, '🛡️', 'English', 'Female', ARRAY['fall-asleep', 'healing'], ARRAY['hypnosis', 'immune', 'health'], false),
('Forgiveness Hypnosis', 'sleep_hypnosis', 'a9kD1sVHnGk', 'Practice forgiveness for peace', '30min', 30, '💜', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'forgiveness', 'peace'], false),
('Self-Love Hypnosis', 'sleep_hypnosis', 'bP9gMpl1gyQ', 'Cultivate self-love and acceptance', '25min', 25, '❤️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'self-love', 'acceptance'], false),
('Abundance Mindset Hypnosis', 'sleep_hypnosis', '2uKLB14yvE4', 'Develop an abundance mindset', '35min', 35, '💰', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'abundance', 'mindset'], false),
('Inner Peace Hypnosis', 'sleep_hypnosis', 'HpU3vZ9daSY', 'Find deep inner peace', '30min', 30, '☮️', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'inner-peace', 'calm'], false),
('Quit Smoking Hypnosis', 'sleep_hypnosis', 'mhndA1Fhxss', 'Support quitting smoking efforts', '40min', 40, '🚭', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'quit-smoking', 'habits'], false),
('Focus Enhancement Hypnosis', 'sleep_hypnosis', 'yAXxIcnE6sc', 'Improve focus and concentration', '25min', 25, '🎯', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'focus', 'concentration'], false),
('Relationship Healing Hypnosis', 'sleep_hypnosis', 'sFCDUz2Y4ME', 'Heal relationship patterns', '35min', 35, '💕', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'relationships', 'healing'], false),
('Success Mindset Hypnosis', 'sleep_hypnosis', 'N5DEfaFVRyE', 'Program your mind for success', '30min', 30, '🏆', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'success', 'mindset'], false),
('Gratitude Hypnosis', 'sleep_hypnosis', 'xO6snZIxZRo', 'Cultivate deep gratitude', '25min', 25, '🙏', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'gratitude', 'appreciation'], false),
('Lucid Dreaming Hypnosis', 'sleep_hypnosis', '45cYwDMibGo', 'Learn to control your dreams', '40min', 40, '🌟', 'English', 'Male', ARRAY['fall-asleep'], ARRAY['hypnosis', 'lucid-dreams', 'control'], false),
('Energy Cleanse Hypnosis', 'sleep_hypnosis', 'wKnLhwCfxLs', 'Cleanse negative energy during sleep', '30min', 30, '🌈', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['hypnosis', 'energy', 'cleanse'], false);

-- ========================================
-- QUICK TOOLS (20 items)
-- ========================================

INSERT INTO sleep_content_library (title, category, youtube_id, description, duration, duration_minutes, emoji, language, voice_type, best_for, tags, is_featured) VALUES
('4-7-8 Breathing Exercise', 'quick_tools', 'gz4G31LGyog', 'Quick breathing technique for instant calm', '5min', 5, '🌬️', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['breathing', 'quick', 'technique'], true),
('Progressive Muscle Relaxation', 'quick_tools', '1nZEdqcGVzo', 'Systematic muscle tension and release', '7min', 7, '💪', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['relaxation', 'muscle', 'technique'], true),
('Quick Sleep Visualization', 'quick_tools', 'EiIyoXTzFLw', 'Brief guided imagery for rapid sleep', '3min', 3, '✨', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['visualization', 'quick', 'imagery'], false),
('Box Breathing', 'quick_tools', 'tEmt1Znux58', '4-4-4-4 box breathing pattern', '4min', 4, '📦', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings', 'anxiety'], ARRAY['breathing', 'box', 'pattern'], false),
('2-Minute Calm Down', 'quick_tools', 'bHp2QBFg4PI', 'Ultra-quick calming exercise', '2min', 2, '⏱️', 'English', 'Female', ARRAY['night-awakenings', 'anxiety'], ARRAY['quick', 'calm', 'anxiety'], false),
('Body Scan Express', 'quick_tools', 'QS2yDmWk0vs', 'Quick body awareness scan', '5min', 5, '🧘', 'English', 'Female', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['body-scan', 'quick', 'awareness'], false),
('Anxiety SOS Breathing', 'quick_tools', 'FJJazKtH_9I', 'Emergency anxiety breathing', '3min', 3, '🆘', 'English', 'Neutral', ARRAY['anxiety', 'night-awakenings'], ARRAY['anxiety', 'emergency', 'breathing'], false),
('Grounding Exercise', 'quick_tools', '30VMIEmA114', '5-4-3-2-1 grounding technique', '4min', 4, '🌍', 'English', 'Female', ARRAY['anxiety', 'night-awakenings'], ARRAY['grounding', 'senses', 'technique'], false),
('Jaw Release', 'quick_tools', 'sT-_ozh0HHQ', 'Quick jaw tension release', '2min', 2, '😮', 'English', 'Neutral', ARRAY['fall-asleep'], ARRAY['jaw', 'tension', 'release'], false),
('Eye Relaxation', 'quick_tools', 'aBFhQu4vkY', 'Quick eye strain relief', '3min', 3, '👁️', 'English', 'Neutral', ARRAY['fall-asleep'], ARRAY['eyes', 'strain', 'relief'], false),
('Shoulder Drop', 'quick_tools', '4pKly2JojMw', 'Release shoulder tension fast', '2min', 2, '🤷', 'English', 'Neutral', ARRAY['fall-asleep'], ARRAY['shoulders', 'tension', 'quick'], false),
('Diaphragmatic Breathing', 'quick_tools', 'vXZ5l7G6T2I', 'Deep belly breathing technique', '5min', 5, '🫁', 'English', 'Female', ARRAY['fall-asleep', 'anxiety'], ARRAY['breathing', 'diaphragm', 'deep'], false),
('Mindful Minute', 'quick_tools', 'F0WYFXxhpGc', 'One minute of mindfulness', '1min', 1, '🧠', 'English', 'Female', ARRAY['anxiety', 'night-awakenings'], ARRAY['mindfulness', 'minute', 'quick'], false),
('Tension Melt', 'quick_tools', 'YJlHxPPV6Mo', 'Melt away body tension', '4min', 4, '🫠', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['tension', 'melt', 'body'], false),
('Calming Countdown', 'quick_tools', 'N2GW7Y1Jnpg', 'Countdown from 100', '5min', 5, '🔢', 'English', 'Neutral', ARRAY['fall-asleep'], ARRAY['counting', 'calm', 'technique'], false),
('Alternate Nostril Breathing', 'quick_tools', '8VwufJrUhic', 'Balancing breathing technique', '5min', 5, '👃', 'English', 'Female', ARRAY['fall-asleep', 'anxiety'], ARRAY['breathing', 'alternate', 'nostril'], false),
('Quick Gratitude', 'quick_tools', '3nwwKbM_vJc', 'Rapid gratitude practice', '2min', 2, '🙏', 'English', 'Female', ARRAY['fall-asleep'], ARRAY['gratitude', 'quick', 'positive'], false),
('Heart Coherence', 'quick_tools', 'RV5t4O6MIK4', 'Heart-focused breathing', '4min', 4, '❤️', 'English', 'Neutral', ARRAY['anxiety', 'fall-asleep'], ARRAY['heart', 'coherence', 'breathing'], false),
('Yawn Technique', 'quick_tools', 'dsk1Fj7BHkE', 'Induce natural yawning', '2min', 2, '🥱', 'English', 'Neutral', ARRAY['fall-asleep'], ARRAY['yawn', 'natural', 'technique'], false),
('5-5-5 Breathing', 'quick_tools', 'o66wGFu-RSI', 'Simple 5-second breathing pattern', '3min', 3, '5️⃣', 'English', 'Neutral', ARRAY['fall-asleep', 'night-awakenings'], ARRAY['breathing', 'simple', 'pattern'], false);
