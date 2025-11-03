Goal:
We have been using mock data across the app. Now we need to fully connect the app to Supabase using the existing .env configuration. The goal is to ensure all user entries, habits, moods, sleep logs, and experiment data are stored, fetched, and analyzed from Supabase.

Instructions:
1. Scan the entire codebase to identify all areas currently using mock or static data.
   - Examples include: mood logs, activity tracking, habit tracking, sleep tracking, experiment results, and analytics.
2. Replace all mock data with real-time CRUD operations connected to Supabase.
   - Use Supabase client from the existing `.env` configuration.
   - Ensure each model (habits, activities, moods, sleep, experiments) has proper insert, update, delete, and read functions.
3. Implement real-time synchronization so that:
   - Any new entries are immediately pushed to Supabase.
   - When the app loads, all data is fetched from Supabase and rendered dynamically.
4. Add robust error handling and loading states for all Supabase operations.
5. Verify all user data is correctly filtered per authenticated user (use Supabase auth or session ID).
6. In analytics and feedback sections:
   - Use AI or data logic to correlate patterns (e.g., consistent sleep + happy mood = better mental clarity).
   - If the codebase already includes mock analysis logic, modify it to analyze real Supabase data instead.
7. Ensure calendar and summary pages dynamically reflect Supabase data:
   - When user clicks on a date, display all saved entries for that day.
   - Activities, mood, sleep, and habit data should appear together.
8. All UI components that used mock arrays (like mood history, activities list, habit cards, etc.) should now render from Supabase data responses.
9. Review backend logic to determine which data needs analytics processing and which is displayed raw.
10. Keep the existing UI/UX intact—only change data sources and integrate analytics feedback seamlessly.

Deliverables:
- All data-related features now connected to Supabase.
- No mock or hard-coded data remaining.
- Data is bi-directional (saved + retrieved correctly).
- Real-time or near-real-time updates where applicable.
- AI-based or rule-based analysis running on Supabase data.


USERFLOW DIAGRAM (for understanding & coding guidance)
1️⃣ Data Input Flow
User → App UI (mood, activity, habit, sleep, experiment input)
    ↓
Supabase Insert (through Supabase client)
    ↓
Success confirmation → Update local state/UI in real-time

2️⃣ Data Retrieval Flow
App Launch / Page Load
    ↓
Fetch user-specific data from Supabase
    ↓
Render to UI (calendar, dashboard, analytics, etc.)

3️⃣ Data Analysis Flow (AI/Logic)
Supabase data (sleep logs + mood logs + activities)
    ↓
Backend/local analytics engine (AI or statistical logic)
    ↓
Generate insights such as:
   "Your biggest mood booster is 🏋️ Exercise, improving your mood by 150%."
    ↓
Display insight cards or feedback modals

4️⃣ Calendar & Detail Rendering
User clicks a date on the calendar
    ↓
Fetch all data from Supabase for that date
    ↓
Display:
  - Mood of the day
  - Activities done
  - Sleep duration
  - Active habits
  - AI insights

5️⃣ Real-time Sync
User adds/edits/deletes entry
    ↓
Supabase event listener triggers update
    ↓
App state automatically refreshes → UI updates without reload


Scan through the codebase and identify all entities being tracked (e.g., habits, activities, mood logs, sleep logs, experiments, analytics, users).
Generate Supabase SQL schema definitions for each entity.
Ensure foreign keys link user_id to all relevant data tables.
save the schema in schema.sql file such that i will run on supabase sql editor.


Implement Supabase client initialization using the existing .env file.
Ensure all Supabase CRUD functions are defined and exported.
Replace mock fetches and arrays across the app with these Supabase CRUD functions.
Add context or service layer for data handling.

Update the calendar component to fetch real data from Supabase for the selected date.
Show activities, moods, sleep logs, and habits logged that day.
Ensure color coding and insights (positive/negative impact) are dynamically generated based on Supabase data.

Use Supabase data to generate insights. 
For example:
- If user consistently logs 8+ hours sleep and reports happy mood → display positive correlation feedback.
- If activities decrease and mood worsens → show supportive suggestions.
Implement this feedback engine either locally or via Supabase Edge Functions.

Enable Supabase's real-time subscriptions.
Whenever a user inserts or updates data, automatically refresh the corresponding UI components (dashboard, calendar, analytics).
Ensure efficient subscription cleanup to prevent memory leaks.
