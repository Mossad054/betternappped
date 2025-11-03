# How to Verify Supabase Integration

This guide provides step-by-step instructions to verify that the Supabase integration is working correctly.

## Prerequisites

1. **Environment Setup**: Ensure your `.env` file contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Database Schema**: Ensure your Supabase database has the required tables:
   - `users`
   - `mood_logs`
   - `sleep_logs`
   - `activities`
   - `habits`
   - `habit_logs`
   - `productivity_logs`
   - `intimacy_logs`
   - `mental_clarity_tests`
   - `experiments`
   - `experiment_logs`

## Manual Verification Steps

### 1. Authentication Flow

#### Sign Up Test
1. Open the app
2. Navigate to Auth screen
3. Switch to "Sign Up" mode
4. Enter test email: `test@example.com`
5. Enter password: `testpassword123`
6. Tap "Create Account"
7. **Expected**: Success message or email verification prompt
8. **Check Console**: Look for `✅ Auth: Sign up successful` log

#### Sign In Test
1. Use the same credentials from sign up
2. Tap "Sign In"
3. **Expected**: Success message and navigation to main app
4. **Check Console**: Look for `✅ Auth: Sign in successful` log

#### Session Persistence Test
1. Close and reopen the app
2. **Expected**: User remains logged in
3. **Check Console**: Look for `✅ AuthContext: Session retrieved: Valid` log

### 2. CRUD Operations Test

#### Create Mood Log
1. Navigate to "Add Entry" screen
2. Select a mood (e.g., 😊 Happy)
3. Add optional notes
4. Tap "Save Entry"
5. **Expected**: Success message
6. **Check Console**: Look for `✅ SupabaseSafe INSERT mood_logs` log

#### Read Data Test
1. Navigate to Home screen
2. **Expected**: Today's mood appears in snapshot
3. **Check Console**: Look for `✅ SupabaseSafe SELECT mood_logs` log

#### Update Data Test
1. Go back to "Add Entry"
2. Modify the mood selection
3. Tap "Save Entry"
4. **Expected**: Updated mood appears on Home screen
5. **Check Console**: Look for `✅ SupabaseSafe UPDATE mood_logs` log

#### Delete Data Test
1. Use the dev tools screen (see below) to test deletion
2. **Expected**: Record removed from database
3. **Check Console**: Look for `✅ SupabaseSafe DELETE mood_logs` log

### 3. Offline Support Test

#### Offline Write Test
1. Turn off device internet connection
2. Try to create a new mood log
3. **Expected**: Data saved locally, pending sync indicator appears
4. **Check Console**: Look for `📝 Added to offline queue: insert mood_logs` log

#### Sync Test
1. Turn internet connection back on
2. **Expected**: Automatic sync occurs
3. **Check Console**: Look for `🔄 Starting manual sync...` and `✅ Sync completed` logs

### 4. Empty State UX Test

#### No Data State
1. Sign up with a new account
2. Navigate to Home screen
3. **Expected**: 
   - Skeleton loading for ~500ms
   - Empty state message: "No Active Habits Yet"
   - Call-to-action button: "Add First Habit"
4. **No indefinite loading spinners**

#### With Data State
1. Add some mood logs and habits
2. Navigate to Home screen
3. **Expected**: Data displays normally with proper styling

### 5. Dev Tools Screen Test

#### Access Dev Tools
1. In development mode, navigate to `/dev-tools` tab
2. **Expected**: Dev tools screen loads (only visible in `__DEV__` mode)

#### Connection Status
1. Check "Connection Status" section
2. **Expected**: Green checkmark with "Connected" status
3. Tap refresh button to test connection

#### CRUD Tests
1. Tap "Run CRUD Tests" button
2. **Expected**: 
   - Test runs for ~5-10 seconds
   - Results show 5/5 tests passed
   - Alert shows success message
3. **Check Console**: Detailed test logs for each operation

#### Offline Status
1. Check "Offline Status" section
2. **Expected**: Shows online/offline status and pending writes count
3. Test "Force Sync" button

### 6. Error Handling Test

#### Network Error Test
1. Turn off internet connection
2. Try to load data on Home screen
3. **Expected**: 
   - Error message displayed
   - Retry button available
   - No app crash

#### Invalid Credentials Test
1. Try to sign in with wrong password
2. **Expected**: 
   - User-friendly error message
   - No technical error details exposed
   - App remains stable

## Expected Console Logs

### Successful Operations
```
✅ Auth: Sign up successful
✅ Auth: Sign in successful
✅ AuthContext: Session retrieved: Valid
✅ SupabaseSafe INSERT mood_logs: [data]
✅ SupabaseSafe SELECT mood_logs: [data]
✅ SupabaseSafe UPDATE mood_logs: [data]
✅ SupabaseSafe DELETE mood_logs: [data]
```

### Error Handling
```
❌ Auth: Sign up error: [error details]
❌ SupabaseSafe INSERT mood_logs: [error details]
📝 Added to offline queue: insert mood_logs [payload]
```

### Offline/Sync Operations
```
📴 Offline, cannot sync
🔄 Starting manual sync...
✅ Sync completed: 3 successful, 0 failed
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env` file exists and has correct variable names
   - Restart development server after adding env vars

2. **"Connection Failed" in dev tools**
   - Verify Supabase URL and key are correct
   - Check Supabase project is active
   - Ensure database tables exist

3. **"No user logged in" errors**
   - Complete sign up process first
   - Check AuthContext is properly wrapping the app

4. **Data not syncing offline**
   - Check NetInfo is properly installed
   - Verify offline queue is working in dev tools

### Debug Steps

1. **Check Environment**: Use dev tools to verify env vars are set
2. **Test Connection**: Use dev tools connection test
3. **Run CRUD Tests**: Use dev tools to test all operations
4. **Check Console**: Look for error logs and success confirmations
5. **Verify Database**: Check Supabase dashboard for data

## Performance Expectations

- **Initial Load**: < 2 seconds with skeleton loading
- **CRUD Operations**: < 1 second response time
- **Offline Sync**: < 5 seconds for typical queue
- **Error Recovery**: Immediate retry capability

## Success Criteria

✅ **Authentication**: Sign up/in works, sessions persist  
✅ **CRUD Operations**: Create, read, update, delete all functional  
✅ **Offline Support**: Data saves offline, syncs when online  
✅ **Empty States**: No indefinite loaders, helpful empty messages  
✅ **Error Handling**: Graceful error messages, no crashes  
✅ **Dev Tools**: All tests pass, connection status accurate  

If all criteria are met, the Supabase integration is working correctly!





