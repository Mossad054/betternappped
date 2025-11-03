 🧩 Rules for Supabase Integration Task

## 🎯 Objective
Replace all mock data in the app with live data from Supabase.  
Ensure every user interaction (logging, tracking, analytics, insights) reads and writes to the database in real time.

---

## 🧠 General Rules
1. **Do not create new files unless necessary.**  
   Use the existing project structure and integrate new code into the proper modules or services.

2. **Never break existing UI/UX design.**  
   Preserve all layouts, styles, and user flows. Only change data sources and logic.

3. **Follow the .env configuration** already defined for Supabase.  
   Use the existing keys for client initialization.

4. **All user data must be linked to authenticated user IDs.**  
   Every Supabase operation (insert, update, delete, select) must filter by `user_id`.

5. **No mock data or placeholders** should remain in the final implementation.  
   All visible data should come directly from Supabase.

---

## ⚙️ Functional Rules

### 1. Database Connection
- Initialize Supabase client using `.env` variables.
- Use a centralized file (e.g., `supabaseClient.ts`) to import the instance everywhere.
- All queries must be async and handle both success and failure states.

### 2. Schema & Tables
The agent must ensure the following logical tables exist (if not, generate SQL definitions): add any other tables that are neccessary.
- `users`
- `habits`
- `activities`
- `mood_logs`
- `sleep_logs`
- `experiments`
- `analytics_feedback`

Each must include:
- `id`, `user_id`, `created_at`
- Relevant attributes (e.g., `mood_type`, `sleep_hours`, `habit_name`, etc.)

### 3. Data Flow Rules
- **On Create:** When user logs or saves something → Insert into Supabase → Refresh local state/UI.
- **On Load:** On page load → Fetch all relevant data from Supabase → Render dynamically.
- **On Update/Delete:** Reflect instantly in both Supabase and the UI.
- **On Calendar Click:** Fetch all entries from that date (mood, sleep, habits, activities).

### 4. Analytics & Insights
- Use Supabase data for correlation analysis (e.g., sleep vs mood).
- Run analytics either via local logic or Supabase Edge Functions.
- AI or logic-based insights must be data-driven (not static).

### 5. Real-time Updates
- Implement Supabase’s real-time subscriptions for live data sync.
- Update UI whenever new entries or updates are detected.

---

## 🎨 UI Rules
- Keep **color themes and dark mode** consistent with Jungle Green (#34B27B) design system.
- Maintain responsive layout and visual consistency across all screens.
- Loading and empty states must be handled gracefully.

---

## 🧰 Error Handling & Validation
- Always check for null, undefined, or empty Supabase responses.
- Display user-friendly messages for errors or failed operations.
- Log technical errors to the console for debugging.

---

## 🔄 Performance Rules
- Cache Supabase responses where appropriate (e.g., use state or local storage).
- Avoid redundant network calls.
- Paginate or limit large data queries (e.g., fetch recent 30 logs by default).

---

## 🧪 Testing & Verification
Before task completion:
1. Verify that **all previously mock-driven features** now use live data.  
2. Test data persistence by logging out and back in — all data should reload.  
3. Ensure analytics and calendar sections render data correctly.  
4. Test light and dark mode compatibility

---

## 📐 Project Architecture Rules

### File Structure Conventions
```
app/                    # Screens and routes (Expo Router)
├── (tabs)/            # Tab navigation screens
├── onboarding/        # Onboarding flow screens
├── auth/              # Authentication screens
└── [feature-hubs]/    # Feature-specific hub screens

components/            # Reusable UI components
├── settings/         # Settings-specific components
└── [shared]/         # Shared components across features

services/             # Data access layer (service classes)
contexts/             # React Context providers
hooks/                # Custom React hooks
lib/                  # Utilities and configuration
themes/               # Design system and theming
database/             # SQL schema and seed files
```

### Service Layer Pattern
**All data operations MUST go through service classes.**

- Each database table has a corresponding service (e.g., `MoodsService`, `HabitsService`)
- Services provide consistent CRUD methods: `create`, `getAll`, `getById`, `getByDate`, `getByDateRange`, `update`, `delete`
- Services handle both authenticated and guest mode data operations
- Services use `SupabaseSafe` wrapper for database queries with automatic user_id filtering

**Example Service Structure:**
```typescript
export class MoodsService {
  static async create(data: Omit<MoodLogInsert, 'user_id'>, userId: string) {
    if (await isGuestMode()) {
      return guestDataStore.create('moods', data);
    }
    const result = await SupabaseSafe.insert('mood_logs', data, userId);
    return { data: result.data, error: result.error };
  }
  // ... other methods
}
```

### Component Organization
- **Screens**: Placed in `app/` directory, represent full page views
- **Reusable Components**: Placed in `components/` directory
- **Feature-specific Components**: Grouped in subdirectories (e.g., `components/settings/`)
- **Modals**: Can be colocated with parent component or in `components/` if shared

### TypeScript Strict Typing
- All functions must have explicit return types
- Props interfaces required for all components
- Database types generated from Supabase schema (see `lib/supabase.ts`)
- Avoid `any` type unless absolutely necessary (document reason)
- Use type aliases for complex types used in multiple places

---

## 💻 Code Conventions

### Naming Conventions
- **Components**: PascalCase (e.g., `HabitCard`, `MoodTracking`)
- **Functions/Methods**: camelCase (e.g., `loadData`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `GUEST_USER_ID`, `API_TIMEOUT`)
- **Files**: Match primary export (e.g., `HabitCard.tsx`, `moods.service.ts`)
- **Service Files**: `[entity].service.ts` pattern
- **Context Files**: `[Name]Context.tsx` pattern

### Import Order
Organize imports in the following order:
1. React and React Native core
2. Third-party libraries (Expo, navigation, etc.)
3. Local contexts and hooks
4. Local components
5. Local services and utilities
6. Types and interfaces
7. Assets and styles

**Example:**
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import HabitCard from '@/components/HabitCard';
import { HabitsService } from '@/services/habits.service';
import { Database } from '@/lib/supabase';
```

### Component Structure
Follow this standard structure for React components:

```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

// 3. Component Definition
export default function MyComponent({ title, onPress }: MyComponentProps) {
  // 4. Hooks
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // 5. Event Handlers
  const handlePress = async () => {
    setLoading(true);
    await onPress();
    setLoading(false);
  };
  
  // 6. Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

// 7. Styles
const styles = StyleSheet.create({
  // ...
});
```

### Error Handling Patterns
**Always provide user-friendly error messages:**

```typescript
try {
  const { data, error } = await SomeService.getData(userId);
  
  if (error) {
    Alert.alert('Error', 'Failed to load data. Please try again.');
    console.error('Service error:', error);
    return;
  }
  
  // Success handling
} catch (err) {
  console.error('Unexpected error:', err);
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

**Error handling requirements:**
- Log technical errors to console for debugging
- Show user-friendly messages in alerts or UI
- Gracefully degrade functionality when possible
- Never expose technical details to end users

---

## ⚡ Feature Development Rules

### Guest Mode Support
**ALL features must support guest mode** (unauthenticated users with demo data).

Requirements:
- Check guest mode status: `if (await isGuestMode())`
- Use `guestDataStore` for CRUD operations in guest mode
- Initialize sample data on first guest mode entry
- Display guest mode banner on relevant screens
- Prompt sign-up for data persistence

**Example:**
```typescript
const { user, isGuest } = useAuth();
const effectiveUserId = user?.id || 'guest_user';

// Service layer automatically handles guest mode
const { data, error } = await MoodsService.getAll(effectiveUserId);
```

### Real-time Data Subscriptions
Set up real-time subscriptions for live data updates:

```typescript
// Use custom hooks from hooks/useRealtimeData.ts
useRealtimeMoods(user?.id || '', () => {
  loadData(); // Refresh callback
});
```

**Rules:**
- Set up subscriptions for user-specific data
- Provide refresh callback to update UI
- Clean up subscriptions on unmount (handled by hooks)
- Only subscribe when user is authenticated

### Loading States
**Every async operation must have loading feedback:**

- Use loading state variable: `const [loading, setLoading] = useState(true)`
- Show skeleton loaders for initial data loads
- Show ActivityIndicator for ongoing operations
- Disable interactive elements during loading
- Handle loading errors gracefully

**Example:**
```typescript
if (loading) {
  return <SkeletonCard />;
}

if (error) {
  return <ErrorState onRetry={loadData} />;
}

return <DataView data={data} />;
```

### Pull-to-Refresh
All data-heavy screens must implement pull-to-refresh:

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
    />
  }
>
```

---

## 🎨 UI/UX Standards

### Theme System Usage
**Always use theme values instead of hardcoded colors/sizes.**

```typescript
const { theme } = useTheme();

// Colors
backgroundColor: theme.colors.background
color: theme.colors.text
borderColor: theme.colors.border

// Typography
fontSize: theme.typography.fontSize.lg
fontWeight: theme.typography.fontWeight.semibold

// Spacing
padding: theme.spacing.lg
margin: theme.spacing.base

// Border Radius
borderRadius: theme.borderRadius.base

// Shadows
...theme.shadows.medium
```

**Theme Structure:**
- Colors: primary, secondary, accent, background, card, text, textSecondary, border, error, success, warning, info
- Typography: fontSize (xs, sm, base, lg, xl, xxl, huge), fontWeight (regular, medium, semibold, bold)
- Spacing: xs, sm, base, lg, xl, xxl
- Border Radius: sm, base, lg, xl, full
- Shadows: small, medium, large, button

### Responsive Design
- Use relative units (%, flex) over absolute pixels
- Test on multiple screen sizes
- Use `Dimensions.get('window')` when necessary
- Respect safe area insets: `useSafeAreaInsets()`
- Ensure touch targets are at least 44x44 points

### Accessibility
- Provide meaningful labels for interactive elements
- Ensure sufficient color contrast (use theme colors)
- Support both light and dark modes
- Test with screen readers when possible
- Use semantic HTML-like structure

### Empty States
Every list/data view needs an empty state:

```typescript
{data.length === 0 ? (
  <EmptyStateCard
    title="No Data Yet"
    message="Start tracking to see your insights"
    ctaText="Add Entry"
    onCtaPress={handleAddEntry}
    icon={<Icon size={48} color={theme.colors.accent} />}
  />
) : (
  <DataList data={data} />
)}
```

**Empty state requirements:**
- Clear title explaining what's missing
- Helpful message guiding next action
- Call-to-action button
- Relevant icon or illustration

### Skeleton Loaders
Use skeleton loaders for better perceived performance:

```typescript
const SkeletonCard = () => (
  <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
    <View style={[styles.skeletonLine, { backgroundColor: theme.colors.borderLight, width: '60%' }]} />
    <View style={[styles.skeletonLine, { backgroundColor: theme.colors.borderLight, width: '40%' }]} />
  </View>
);
```

---

## 💾 Data Management Rules

### Service Class Usage
**Never query Supabase directly from components.**

❌ **Wrong:**
```typescript
const { data } = await supabase.from('moods').select('*').eq('user_id', userId);
```

✅ **Correct:**
```typescript
const { data, error } = await MoodsService.getAll(userId);
```

### User ID Filtering
**All queries must filter by user_id for security.**

- Service layer automatically adds user_id filter via `SupabaseSafe`
- Row Level Security (RLS) enforced at database level
- Never expose other users' data
- Guest mode uses consistent `guest_user` ID

### Date Formats
**Always use ISO format (YYYY-MM-DD) for date-based data.**

```typescript
// Get today's date
const today = new Date().toISOString().split('T')[0];

// Date range
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
```

**Rules:**
- Store dates as DATE type in database
- Use ISO format for consistency
- Display dates using locale formatting for users
- Handle time zones appropriately

### JSONB Fields
Use JSONB for flexible, structured data:

```typescript
// Moods array
moods: ['Happy', 'Energetic', 'Relaxed']

// Triggers object
triggers: {
  Happy: { hasTrigger: 'yes', text: 'Great workout' },
  Stressed: { hasTrigger: 'no', text: '' }
}

// Experiment outcomes
outcomes: ['Mood', 'Sleep Quality', 'Energy']
```

**JSONB best practices:**
- Use for variable-length arrays
- Use for key-value pairs
- Validate structure in application layer
- Document expected schema in comments

---

## 🧪 Testing Requirements

### Service Layer Unit Tests
All services must have unit tests:

```typescript
// __tests__/services/moods.service.test.ts
describe('MoodsService', () => {
  it('should create mood log', async () => {
    const result = await MoodsService.create(mockMoodData, userId);
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });
});
```

**Test coverage required:**
- All CRUD operations
- Error handling
- Guest mode fallbacks
- Edge cases (empty data, invalid inputs)

### Mock Data
Use mock data for development and testing:

- Mock data in `constants/mockData.ts`
- Guest data store provides sample data
- Seed scripts in `database/` for development database

### Supabase Connection Verification
Verify Supabase connection on startup:

```typescript
// Already implemented in app/index.tsx
const result = await testSupabaseConnection();
if (!result.success) {
  console.warn('⚠️ Supabase connection test failed:', result.error);
}
```

---

## 🔄 State Management

### Local State
Use React hooks for component-local state:
- `useState` for simple values
- `useReducer` for complex state logic
- `useEffect` for side effects

### Global State
Use React Context for global state:
- `AuthContext` - User authentication and session
- `ThemeContext` - Theme and appearance settings

**When to use Context:**
- Data needed across many components
- User session and preferences
- Theme and configuration
- Avoid prop drilling

### Server State
Use service layer + local state for server data:
- Fetch on component mount
- Real-time subscriptions for updates
- Pull-to-refresh for manual updates
- Consider adding React Query for advanced caching (future)

---

## 🔐 Security Rules

### Authentication
- All protected routes check authentication status
- Session managed by Supabase Auth
- Auto-refresh tokens enabled
- Secure session storage in AsyncStorage

### Data Access
- Row Level Security (RLS) policies on all tables
- User ID filtering in all queries
- No direct database access from client
- Service layer provides abstraction

### Input Validation
- Validate all user inputs before submission
- Sanitize text inputs
- Enforce constraints (e.g., rating 1-5)
- Show validation errors clearly

---

## 📱 Platform-Specific Considerations

### iOS
- Respect safe area insets (notch, home indicator)
- Use native date/time pickers
- Follow iOS Human Interface Guidelines

### Android
- Respect system navigation
- Use native date/time pickers
- Follow Material Design guidelines

### Cross-platform
- Test on both iOS and Android
- Use `Platform.OS` for platform-specific code
- Keep platform-specific code minimal
- Document platform differences

---

## 🚀 Performance Rules

### Optimization
- Minimize re-renders with `useMemo` and `useCallback`
- Virtualize long lists with FlatList
- Lazy load images and heavy components
- Paginate or limit large data queries

### Network
- Cache responses where appropriate
- Batch related requests
- Handle offline scenarios gracefully
- Show loading states immediately

### Bundle Size
- Avoid importing entire icon libraries
- Code split large features
- Remove unused dependencies
- Monitor bundle size in builds

---

## 📝 Documentation Rules

### Code Comments
- Comment complex logic and algorithms
- Document public API methods
- Explain non-obvious decisions
- Keep comments up-to-date with code

### Type Documentation
- Use TypeScript JSDoc for complex types
- Document expected data structures
- Note any constraints or validations

### Change Documentation
- Update `changes.md` for all modifications
- Document breaking changes clearly
- Reference related files and features
- Include date and reason for changes

---

## 🎯 Development Workflow

### Before Starting a Feature
1. Review relevant user flows in `userflow.md`
2. Check existing patterns in similar features
3. Plan data model and service methods
4. Design component hierarchy
5. Consider guest mode support

### During Development
1. Write service layer first
2. Add TypeScript types
3. Build UI components
4. Implement error handling
5. Add loading states
6. Test both auth and guest modes

### Before Committing
1. Test functionality thoroughly
2. Check TypeScript compilation
3. Run linter (if configured)
4. Test on both light and dark modes
5. Update `changes.md`
6. Review code for conventions adherence

---

## ⚠️ Common Pitfalls to Avoid

1. **Hardcoding values** - Always use theme system
2. **Skipping error handling** - Always wrap async operations
3. **Forgetting guest mode** - Test both authenticated and guest flows
4. **Ignoring loading states** - Show feedback for all async operations
5. **Direct database access** - Always use service layer
6. **Missing user_id filters** - Security vulnerability
7. **Inconsistent date formats** - Use ISO format
8. **Platform-specific bugs** - Test on both iOS and Android
9. **Prop drilling** - Consider Context for deeply nested data
10. **Not updating documentation** - Keep `changes.md` current

---

## 📚 Reference Links

- **Expo Documentation**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Supabase**: https://supabase.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Expo Router**: https://docs.expo.dev/router/introduction/

---

**Last Updated**: October 30, 2025  
**Maintained By**: Development Team