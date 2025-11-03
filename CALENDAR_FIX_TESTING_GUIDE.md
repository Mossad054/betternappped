# 🔧 Calendar Fix - Testing Guide

## 🎯 What Was Fixed

### Problem Identified
The calendar was storing ALL dates (even empty ones) in `calendarData`, making it ambiguous whether a date had actual data or not. This caused:
- ❌ Empty dates being treated as "filled" 
- ❌ Incorrect modal behavior (summary showing for empty dates)
- ❌ Visual indicators not matching actual data state

### Solution Applied
1. **Only store days with actual data** in `calendarData` object
2. **Simplified hasData check** - if date exists in calendarData, it has data
3. **Enhanced logging** - detailed console output for debugging
4. **Clearer conditional logic** - explicit `dayData.hasData === true` checks

---

## 🧪 Testing Steps

### Test 1: Empty Date Click (e.g., November 1, 2025)
**Prerequisites**: No data logged for Nov 1

1. Open calendar screen
2. Look at console logs - should see:
   ```
   Fetching calendar data from 2025-11-01 to 2025-11-30
   Calendar data loaded: X days with data [array of dates]
   ```
3. Click on November 1 (empty date)
4. Console should show:
   ```
   === DATE PRESS: 2025-11-01 ===
   Today: 2025-11-03
   dayData exists: false
   dayData: null
   hasData decision: false
   ===================
   
   ✗ No data for 2025-11-01 - showing confirmation modal
   ```
5. **Expected UI**: 
   - ✅ "Log Data for Past Date" confirmation modal appears
   - ✅ Shows formatted date: "Friday, November 1, 2025"
   - ✅ Has Cancel and "Log Data" buttons

6. Click "Log Data"
7. **Expected**: Navigate to `/add-entry?date=2025-11-01`
8. Console should show:
   ```
   Navigating to add-entry for date: 2025-11-01
   📅 Calendar screen UNFOCUSED
   ```

---

### Test 2: Log Data for November 1
**Prerequisites**: Confirmation modal just appeared

1. After clicking "Log Data", you're on add-entry page
2. **Verify**: 
   - ✅ Date picker shows November 1, 2025
   - ✅ Backdated notice banner appears (blue background)
   - ✅ Banner text: "📅 You're logging data for a past date..."

3. Fill out some data:
   - Mood: Select any emoji (e.g., 😊 Happy)
   - Sleep: 7 hours, quality 4/5
   - Activity: Add "Exercise" 30 min

4. Click "Save Entry"
5. **Expected**: Success message, then navigate back to calendar
6. Console should show:
   ```
   📅 Calendar screen FOCUSED - triggering refresh
   Current year: 2025 month: 11
   Fetching calendar data from 2025-11-01 to 2025-11-30
   Calendar data loaded: Y days with data ["2025-11-01", ...]
   ```

---

### Test 3: Verify November 1 Now Shows Data
**Prerequisites**: Just saved data for Nov 1

1. Look at November 1 cell on calendar
2. **Expected Visual Indicators**:
   - ✅ Colored background tint (green/blue/yellow based on mood)
   - ✅ Colored ring border
   - ✅ Mood emoji (😊)
   - ✅ Micro-dots for sleep (blue), activity (purple)
   - ✅ NO dashed border (only empty dates have dashed border)

3. Click on November 1 again
4. Console should show:
   ```
   === DATE PRESS: 2025-11-01 ===
   Today: 2025-11-03
   dayData exists: true
   dayData: {
     "mood": { "score": 5, "emoji": "😊" },
     "sleep": { "hours": 7, "quality": 4 },
     "activities": ["Exercise"],
     "hasData": true,
     ...
   }
   hasData decision: true
   ===================
   
   ✓ Data exists for 2025-11-01 - showing summary modal
   ✓ Loaded detailed data for 2025-11-01
   ```

5. **Expected UI**:
   - ✅ Summary modal appears (NOT confirmation modal)
   - ✅ Shows mood score and emoji
   - ✅ Shows sleep hours and quality
   - ✅ Shows activities list
   - ✅ Shows "Impact Analysis" section
   - ✅ Has close button (X)

---

### Test 4: Navigate Away and Back
**Prerequisites**: Summary modal is open

1. Close the summary modal
2. Navigate to a different tab (e.g., Home, Experiments)
3. Console should show:
   ```
   📅 Calendar screen UNFOCUSED
   ```

4. Navigate back to Calendar tab
5. Console should show:
   ```
   📅 Calendar screen FOCUSED - triggering refresh
   Fetching calendar data from 2025-11-01 to 2025-11-30
   Calendar data loaded: Y days with data [...]
   ```

6. **Expected**:
   - ✅ November 1 still shows colored indicators
   - ✅ Data is fresh (not stale)
   - ✅ No duplicate API calls (debounce working)

---

### Test 5: Today's Date Behavior
**Prerequisites**: Some data logged for today (Nov 3)

1. Look at today's date (November 3)
2. **Expected Visual**:
   - ✅ Bold blue border (today indicator)
   - ✅ Blue background tint
   - ✅ If data exists: colored ring + emoji + dots
   - ✅ If no data: only blue border, no ring

3. Click today's date WITH data
4. **Expected**: Summary modal (same as Test 3)

5. If today has NO data, click it
6. **Expected**: Confirmation modal to log data

---

### Test 6: Future Date Prevention
**Prerequisites**: Any date after today

1. Try clicking November 4, 2025 (future)
2. **Expected**:
   - ✅ Alert appears: "Future Date"
   - ✅ Message: "You cannot log data for future dates..."
   - ✅ NO modal appears (confirmation or summary)
   - ✅ Console shows date check prevented action

---

### Test 7: Empty vs Filled Visual Comparison

**Expected Calendar Grid**:
```
Nov 2024 Calendar:
┌─────────────────────────────────────────────┐
│ Sun  Mon  Tue  Wed  Thu  Fri  Sat           │
├─────────────────────────────────────────────┤
│                       1⃣    2⃣    3⃣  ← Empty │
│ 4⃣    5⃣    6⃣    7⃣    8⃣    9⃣    🟢  ← Has data │
│ 11⃣   12⃣   13⃣   14⃣   🔵   16⃣   17⃣  ← Today │
└─────────────────────────────────────────────┘

Legend:
⃣ = Dashed border + small plus icon (empty)
🟢 = Green/blue/yellow ring + emoji + dots (has data)
🔵 = Blue border (today, may or may not have data)
```

---

### Test 8: Month Navigation
**Prerequisites**: November with some logged data

1. Click left arrow to go to October
2. **Expected**:
   - ✅ Console: "Fetching calendar data from 2024-10-01 to 2024-10-31"
   - ✅ Calendar shows October dates
   - ✅ If no data in October: all dates have dashed border
   - ✅ Debounce prevents rapid fetches

3. Click right arrow to return to November
4. **Expected**:
   - ✅ November data reappears immediately
   - ✅ Colored indicators still visible for Nov 1
   - ✅ No stale data

---

### Test 9: Pull-to-Refresh
**Prerequisites**: Calendar is open

1. Swipe down on calendar screen
2. **Expected**:
   - ✅ Refresh spinner appears
   - ✅ Console: Force refresh triggered
   - ✅ Data reloads from Supabase
   - ✅ Calendar updates

3. On another device/browser, log data for Nov 2
4. Pull to refresh on first device
5. **Expected**:
   - ✅ Nov 2 now shows data
   - ✅ Colored indicators appear

---

### Test 10: Realtime Updates (if Supabase Realtime enabled)
**Prerequisites**: Two devices/browser tabs open

1. Device A: Calendar screen open, viewing November
2. Device B: Navigate to add-entry, log data for Nov 2
3. Device B: Save entry
4. Device A: Watch calendar (don't touch anything)
5. **Expected on Device A**:
   - ✅ Console: "Realtime update detected - refreshing calendar"
   - ✅ Nov 2 automatically updates with colored ring
   - ✅ No manual refresh needed

---

## 🐛 Debugging Console Logs

### Normal Flow Console Output:
```bash
# On calendar mount
Fetching calendar data from 2025-11-01 to 2025-11-30
Calendar data loaded: 5 days with data ["2025-11-01", "2025-11-03", ...]

# On empty date click
=== DATE PRESS: 2025-11-01 ===
Today: 2025-11-03
dayData exists: false
dayData: null
hasData decision: false
===================
✗ No data for 2025-11-01 - showing confirmation modal

# After logging and returning
📅 Calendar screen FOCUSED - triggering refresh
Fetching calendar data from 2025-11-01 to 2025-11-30
Calendar data loaded: 6 days with data ["2025-11-01", ...]

# On filled date click
=== DATE PRESS: 2025-11-01 ===
dayData exists: true
hasData decision: true
===================
✓ Data exists for 2025-11-01 - showing summary modal
✓ Loaded detailed data for 2025-11-01
```

---

## ✅ Success Criteria

All tests should pass with these results:

| Test | Expected Behavior | Status |
|------|------------------|--------|
| Empty date click | Confirmation modal | ⬜ |
| Log data navigation | Redirect to add-entry with date param | ⬜ |
| Save and return | Calendar auto-refreshes | ⬜ |
| Filled date click | Summary modal with data | ⬜ |
| Visual indicators | Colored ring for filled, dashed for empty | ⬜ |
| Today highlight | Blue border always visible | ⬜ |
| Future date block | Alert prevents logging | ⬜ |
| Month navigation | Correct date range fetched | ⬜ |
| Focus refresh | Auto-refresh on tab switch | ⬜ |
| Realtime sync | Updates without manual refresh | ⬜ |

---

## 🚨 Common Issues & Solutions

### Issue: Calendar not showing logged data
**Symptoms**: Saved data but cell still shows dashed border
**Debug**:
1. Check console for "Calendar data loaded: X days"
2. Verify the date is in the logged array
3. Check `dayData.hasData` is `true`
**Solution**: Force refresh (pull down) or check Supabase connection

### Issue: Wrong modal appears
**Symptoms**: Summary modal for empty date, or confirmation for filled
**Debug**:
1. Look at `hasData decision` in console
2. Check `dayData exists` value
3. Verify `calendarData` structure
**Solution**: Ensure `hasData` flag is correctly set during data transformation

### Issue: Calendar doesn't refresh after logging
**Symptoms**: Need to manually pull-to-refresh
**Debug**:
1. Check `useFocusEffect` logs ("FOCUSED", "UNFOCUSED")
2. Verify navigation works (going to different tab and back)
3. Check debounce timing
**Solution**: Ensure expo-router `useFocusEffect` is imported correctly

### Issue: Excessive API calls
**Symptoms**: Slow performance, many "Fetching calendar data" logs
**Debug**:
1. Count how many fetches happen in 10 seconds
2. Check debounce logic (should be max 1 per 2 seconds)
**Solution**: Verify `lastFetchTime` state is working

---

## 📊 Performance Benchmarks

**Target Metrics**:
- Initial load: < 2 seconds
- Date click response: < 100ms
- Focus refresh: < 1 second
- API calls: Max 1 per 2 seconds (unless forced)
- Month navigation: < 500ms

---

## 🎉 What to Look For (Success Indicators)

✅ **Visual**: Clear difference between empty (dashed) and filled (colored) dates  
✅ **Functional**: Correct modal (summary vs confirmation) every time  
✅ **Performance**: No lag, smooth animations  
✅ **Sync**: Data appears immediately after logging  
✅ **Logs**: Clean, informative console output  
✅ **UX**: No confusion about which dates have data  

---

**Last Updated**: 2025-11-03  
**Test Environment**: React Native + Expo + Supabase  
**Expected Test Duration**: 15-20 minutes
