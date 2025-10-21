📅 Objective

Refactor the entire app for Jungle Green (#34B27B) consistency, fully implement Dark Mode, improve the Home Page habit system, refine Sleep Wellness Hub, expand Impact Analysis, and optimize Analytics & Calendar integrations.

🟢

🏠 3. HOME PAGE ENHANCEMENTS
🔹 A. Active Habits Cards

Improvements:

Suggested habits should appear first (leftmost) among the active habit cards.

Suggested habit card should be same size as the rest.

Add clear text cue: “👉 Swipe right to add this habit.”

Swiping right adds the habit automatically to the Active Habits list.

If user already has 3+ active habits, show a ‘More Habits →’ button at the end for scrolling (avoiding clutter).

Each Active Habit Card Should Include:

Habit title + icon

Short description

Reminder toggle with time picker (allow user to select notification time)

“Added” state visual (glow or border highlight when active)

🔹 B. Browse Habit Library + Create Custom Habit

When user clicks “Browse Habit Library” or “Create Custom Habit”,
→ Redirect to Habit Library Modal.

Habit Library Structure:

Group habits by category:

Intimacy

Health

Anxiety

Mood

Sleep

Productivity

Mindfulness

Each habit card contains:

Title

Short description

Expected outcome

Icon / illustration

Button: “Add to Active Habits”

On click → move to Active Habit Cards on Home Page

🌙 4. SLEEP WELLNESS HUB ENHANCEMENT
 1. Make UI/UX of the hub align with rest of the app. (currently its different from the rest. designs cards well.)
When user clicks “Improve My Sleep”, redirect to Sleep Wellness Hub.
This page contains six cards:
Sleep Tracking & Insights, Guided Sleep Playlists, Night Routines & Experiments, Tutorials & Education, Achievements, Smart Recommendations

🔹 A. Night Routines & Experiments

When user clicks it → redirect to Experiment Hub Page (already implemented earlier).

User can then create or run Sleep-related experiments.

After completing experiment → redirect back to Sleep Wellness Hub.

🔹 B. Achievements

Align icons vertically to conserve space.

On tap → open Popup Modal describing:

What the achievement represents

What user did to earn it

Measured outcomes / insights

🔹 C. Smart Recommendations

When user clicks “Try This Tonight”,
a feedback modal appears:

“Did you try this activity tonight?”

Options: ✅ Yes / ❌ No

If Yes → save as a logged activity.

Logged activities should:

Appear in Activities Section

Be visible on Calendar View

📈 5. IMPACT ANALYSIS SECTION
🧠 Add Intro Text:

“How your activities affect your wellbeing”

🧩 Card Layout:

Add a simple summary card such as:

“Your biggest mood booster is 🏋️ Exercise, which improved your mood by 150% this week! Try doing this more often.”

These insights should be generated dynamically from analyzed logs.

🔹 Activity Impact Cards:

Only activities logged in the last 7 days should appear.

For each activity, display correlations with:

Mood

Sleep

Mental Clarity

Use color indicators:

🟢 Green ↑ (Improved)

🔴 Red ↓ (Worsened)

🟡 Yellow → (Neutral)

🧾 Popup Modal (On Activity Click):

Detailed breakdown showing:

Activity frequency

Impact metrics (e.g., mood ↑20%, sleep ↓10%)

Visual mini-charts

Bottom section: AI Recommendations

“Try limiting screen time 1 hour before bed for better sleep.”

🤖 6. AI RECOMMENDATIONS SECTION (Home Page)

Each recommendation card:

Should include a popup modal with:

Detailed explanation of the recommendation

Option → Convert to Active Habit

Optional dismiss or save for later

📊 7. ANALYTICS PAGE REFINEMENT
🔹 Mood Tracking:

Replace current weekly chart with a Donut / Pie Chart.

Represent all 10 moods (good, sad, unsure, happy, stressed, bored, anxious, etc.)

Color-code each mood consistently (e.g., happy = yellow, sad = blue, angry = red).

If user had 2 good days, 3 sad days, etc. → show proportional slices.

🔹 Activity Tracking:

Align bars inside the card (no overflow).

Maintain minimal, clean chart style with consistent padding.

🔹 Sleep Tracking:

Replace with a mini 7-day calendar:

Show days (Mon–Sun) + dates.

Each day color-coded by actual sleep vs. target (green, yellow, red).

If user logs 6h vs. 8h target → show color difference.

On click for a specific day → popup shows:

“Sleep: 11:00 PM → Wake: 6:00 AM”

Sleep duration and difference from target.

🔹 Habit Tracking:

Use mini calendar layout:

Each day color-coded:

🟢 Completed

🔴 Missed

Display streak count

Tooltip when tapped: “You’ve completed this habit 5 days in a row!”

❤️ 8. PERSONALIZED INTIMACY PLAN PAGE
  develop and add mock plans for testing.

Add option to integrate plan into calendar:

Choices: Daily / Weekly / Monthly

Allow marking as “Done” and providing feedback.

Logged plans appear in calendar with intimacy icon.

📝 9. ENTRY PAGE OPTIMIZATION

Under “What did you do today,”
sub-activities (e.g., running, yoga, journaling) should appear vertically to reduce horizontal scroll clutter.

Maintain collapsible sections for emotions and activities as previously implemented.

🗓️ 10. CALENDAR PAGE UPGRADES

Add a summary card below the calendar showing:

Overall Mental Clarity (monthly average)

Sleep Pattern Overview

Streak Performance (habit consistency, logged days, etc.)

Small progress indicators and emoji summaries

💾 Implementation Architecture Notes

Data Syncing:

Sleep & experiment data should feed into analytics engine for correlation.

Impact Analysis should query recent logs from past 7 days.