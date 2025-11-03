Goal:
Audit and fix the app’s Supabase integration so that:

Auth (signup/login) reliably creates/saves user records and sessions in Supabase.

All CRUD operations (create/update/delete/read) for key features — especially sleep logs, mood logs, activities, and user profile — actually save and read from Supabase.

UI pages (Home/Dashboard, Insights, Calendar) show the app UI even when there’s no data; display a friendly, non-blocking notice like: “No saved data yet — any saved activity will appear here.” Do NOT show an indefinite loader.

Add robust error handling and retries for network failures; add local caching/offline support and sync logic so the app can save locally and sync when online.

Pull the Supabase database schema locally and optionally seed the database with mock data for testing (which can be deleted later).

Provide tests and manual verification steps to confirm everything works end-to-end.

Constraints:

Do not change business logic beyond what's necessary to fix bugs.

Keep UX consistent with existing components and theme.

Any mock/test data inserted must be clearly marked (e.g., __dev__ flag) and removable by script.

High-level plan (what I want you to implement):

Automated repo scan

Search the codebase for all places that call Supabase (e.g., supabase.auth.*, supabase.from(...).insert/update/delete/select, or helper wrappers).

Produce a report listing file paths + functions that perform auth or CRUD operations.

Auth flow verification & fix

Ensure signUp and signIn functions call supabase.auth.signUp / supabase.auth.signInWithPassword correctly and await the results.

Ensure after signup the app creates any necessary users row in the DB (if your app expects a users table row separate from Supabase Auth). If missing, add server-side insertion (or client-side after signUp succeeds) to create the user profile row with a __dev__createdAt timestamp.

Add explicit error handling: parse Supabase errors and return { success, error, needsVerification } objects to the UI.

Add console logs for dev and structured errors for production.

CRUD reliability fixes

For each feature (sleep logs, mood logs, activities, habits, profile updates), ensure the following:

Function uses await and handles { data, error } returned by Supabase.

On error, surface a user-friendly message and add a dev console log with full error.

After successful write, update local state optimistically (or re-fetch) so UI immediately reflects the saved record.

Add retries (3 attempts with exponential backoff) for transient network errors (fetch failures, 502/504).

Add a central api/supabaseClient helper or update existing one to standardize responses and retries (e.g., safeInsert(table, payload), safeSelect(table, query), safeUpdate, safeDelete).

UI fallback & no-data UX

Replace indefinite loading states on Home, Insights, Calendar, and any list view with this behavior:

Show skeleton loaders for a short time (300–800ms) while first query runs.

If query returns empty array, display the full UI with an unobtrusive notice area at top or inside each widget:
"No saved data yet — your saved sessions, logs and insights will appear here."

Provide CTAs in the empty state to create test data or quick actions: e.g., “Log your first sleep”, “Start a quick lesson”, “Add mock data (dev)”.

Ensure accessibility and that the empty-state copy is translatable.

Offline caching & sync

Implement simple local cache using AsyncStorage (or existing local DB if present). For each write action:

Attempt remote write. If it fails, save to a local pendingWrites queue with metadata (table, payload, op type, timestamp).

When the app regains connectivity (use NetInfo or AppState), attempt to flush the queue with retries.

Add visual indicator when device is offline and number of pending writes.

For reads: use cached data first (if available) then refresh from remote and merge.

Provide a small sync utility and expose a dev button to force sync.

Local DB dump / Pull & seeding

Pull the Supabase schema and a copy of selected tables locally for testing. Use the Supabase CLI or pg_dump if available. (If CLI is needed, ask for credentials or instruct the developer to run the CLI commands locally — but script the process).

Create a scripts/seed-dev-data.ts script that can insert idempotent mock rows into users, sleep_logs, mood_logs, and activities with a __dev boolean or source: 'dev-seed' marker. This script must:

Read DB URL from env.

Confirm with the user (or run with --yes for CI) before inserting.

Print inserted rows and return a cleanup script to delete seeded rows later.

Add instructions (README) on how to run the script and how to remove the seed data.

End-to-end verification & test

Add a SupabaseHealthCheck dev screen (or reuse the test screen you created) that:

Shows env status, Supabase connection, latest user session, sample select from sleep_logs and users.

Has buttons to run the seed script and to delete seeded test data.

Add unit / integration tests (Jest or simple test scripts) that:

Create a test user (using a test email) and verify it exists in Supabase auth users and users table (if used).

Insert a sleep_log, read it back, update it, and then delete it. Verify each step.

Produce a checklist of manual verification steps for QA (signup, signin, create sleep log, see it on Calendar, force offline save, reconnect and verify sync).

Logging & monitoring

Add structured logging for all CRUD calls (success and failure).

For dev builds, output full { data, error } objects. For prod builds, sanitize errors and only send necessary info to console.

Developer safety & cleanup

Ensure any dev-only code (seed, mock insertion, verbose logs) is guarded behind __DEV__ or an environment flag.

Ensure seeded mock data can be removed with a scripts/cleanup-dev-seed.ts script.

Acceptance criteria (what I want you to deliver):

A code-change PR (or patch) that:

Standardizes Supabase CRUD helpers with retries and consistent error handling.

Fixes auth flow so signup/login creates expected DB rows and returns explicit statuses.

Implements UI empty-state behavior (no indefinite loader) across Home, Insights, and Calendar; includes CTAs.

Adds local pending write queue with background sync and an explicit sync button.

Includes scripts/seed-dev-data.ts and scripts/cleanup-dev-seed.ts plus README usage instructions.

Adds Supabase health-check screen and test scripts that run the E2E CRUD flow (create → read → update → delete).

A HOWTO-VERIFY.md file with step-by-step manual QA instructions and expected console log messages.

A short report summarizing the fixes and any places where the agent could not make automatic changes (with recommended manual steps).

Technical hints & implementation details for the agent:

Create a small helper wrapper: lib/supabaseSafe.ts exporting safeInsert, safeSelect, safeUpdate, safeDelete, safeAuthSignUp, safeAuthSignIn. Use these across the app.

Use exponential backoff for retries: delay = 300 * 2^attemptMs. Limit attempts to 3.

For local pending write queue store structure: { id, op: 'insert'|'update'|'delete', table, payload, attempts, createdAt }. Store queue in AsyncStorage key @pending_writes.

Use NetInfo (import @react-native-community/netinfo) or AppState + try pinging Supabase to detect regained connectivity.

For seeding, include a dev_seed flag in records and created_by: 'dev-seed' property.

Ensure the seed script uses transactions where possible so partial writes can roll back on error.

Add tests that clean up after themselves (delete test user/rows).