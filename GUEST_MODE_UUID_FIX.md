# Guest Mode UUID Error Fix

## Problem
The app was crashing with a UUID validation error when running in guest mode:
```
ERROR ❌ SupabaseSafe SELECT mental_clarity_tests: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type uuid: \"guest_user\""}
```

## Root Cause
When users weren't logged in (guest mode), the code used `'guest_user'` string as a fallback:
```typescript
const effectiveUserId = user?.id || 'guest_user';
```

The `MentalClarityService` had several methods that didn't check for guest mode before calling the database:
- `getByDateRange()`
- `getAverageScore()`
- `getScoreTrend()`
- `getTopFactors()`

These methods passed the `'guest_user'` string directly to Supabase queries expecting a UUID, causing PostgreSQL to reject the invalid format.

## Solution
Added guest mode checks to all four methods following the same pattern used in other methods (`create`, `getAll`, `getById`, etc.):

```typescript
static async getByDateRange(userId: string, startDate: string, endDate: string) {
  if (await isGuestMode()) {
    return guestDataStore.getAll('mentalClarity');
  }
  // ... database query
}
```

### Methods Fixed
1. **getByDateRange()** - Now returns all guest data (filtering by date would require implementing date range support in guestDataStore)
2. **getAverageScore()** - Calculates average from guest data stored locally
3. **getScoreTrend()** - Returns score trends from guest data
4. **getTopFactors()** - Analyzes factors from guest data

## Changes Made
**File: `services/mentalClarity.service.ts`**
- Added `if (await isGuestMode())` guards to 4 methods
- Guest mode now returns data from `guestDataStore` instead of querying Supabase
- Maintains consistency with other service methods

## Status
✅ **FIXED** - Guest users can now use the app without UUID validation errors
- Mental clarity tracking works in guest mode
- Data is stored locally via guestDataStore
- No more infinite retry loops on database queries

## Related Services
**Already Correct:**
- `MoodsService.getByDateRange()` - ✅ Has guest mode check
- `SleepService.getByDateRange()` - ✅ Has guest mode check
- Other CRUD methods in all services - ✅ Have guest mode checks

## Testing
To test the fix:
1. Launch app without signing in (guest mode)
2. Navigate to home dashboard
3. Verify no UUID errors in console
4. Confirm mental clarity data can be viewed and created

## Prevention
Consider centralizing guest mode handling in `SupabaseSafe` layer to automatically detect and handle `'guest_user'` strings before they reach database queries.
