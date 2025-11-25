# 🎨 Past Date Habit Completion - Visual Guide

## 📱 User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CALENDAR SCREEN                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  November 2025                            🔄         │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  Sun  Mon  Tue  Wed  Thu  Fri  Sat                  │  │
│  │                                                       │  │
│  │   10   11   12  [13]  14   15   16                  │  │
│  │        😊   😐   ⭕   [Today]                        │  │
│  │                  ↑                                    │  │
│  │             Click Here!                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     User Clicks Date
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              LOG DATA FOR PAST DATE MODAL                   │
│                                                             │
│  📅  Log Data for Past Date                                │
│      Wednesday, November 13, 2025                          │
│                                                             │
│  You're about to log wellness data for a past date.        │
│  You can track your mood, activities, sleep, and more.     │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │   Just Habits    │  │   Full Entry     │              │
│  │      ⚡          │  │      📝          │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                             │
│  [Cancel]                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  Select "Just Habits"
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            PAST DATE HABIT COMPLETION MODAL                 │
│                                                             │
│  📅 Mark Habits Complete                        ❌         │
│     Wednesday, November 13, 2025                           │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  Select the habits you completed on this day.              │
│  Streaks will be automatically calculated.                 │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ✓ 🧘 Morning Meditation          🔥 7 days        │   │
│  │   Mind & Soul                    Day 7/30         │   │
│  │                                                     │   │
│  │   How did it feel?                                │   │
│  │   [😊 Good]  [😐 Neutral]  [😔 Hard]            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ⭕ 🚶 Evening Walk                🔥 0 days        │   │
│  │   Physical Health                Day 0/30         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ✓ 📵 No Phone Before Bed         🔥 3 days        │   │
│  │   Digital Wellness               Day 3/30         │   │
│  │                                                     │   │
│  │   How did it feel?                                │   │
│  │   [😊 Good]  [😐 Neutral]  [😔 Hard]            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  2 of 3 habits selected                                    │
│                                                             │
│  [ Cancel ]                              [ ✓ Save ]        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                     User Clicks Save
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUCCESS ALERT                            │
│                                                             │
│                    Success! ✅                              │
│                                                             │
│  2 habits marked as complete for                           │
│  Wednesday, November 13, 2025                              │
│                                                             │
│                     [ OK ]                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   Calendar Auto-Refreshes
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     CALENDAR SCREEN                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  November 2025                            🔄         │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  Sun  Mon  Tue  Wed  Thu  Fri  Sat                  │  │
│  │                                                       │  │
│  │   10   11   12  [13]  14   15   16                  │  │
│  │        😊   😐   🟢  [Today]                         │  │
│  │                  ↑                                    │  │
│  │         Now has green indicator!                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│          Frontend (React Native)                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │     PastDateHabitModal.tsx                  │  │
│  │  - Load habits for date                     │  │
│  │  - Show checkboxes                          │  │
│  │  - Collect feedback                         │  │
│  │  - Handle save                              │  │
│  └───────────────┬─────────────────────────────┘  │
│                  │                                  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ↓ HabitsService.bulkLogHabitsForDate()
┌─────────────────────────────────────────────────────┐
│          Service Layer (TypeScript)                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │     habits.service.ts                       │  │
│  │  - Format request data                      │  │
│  │  - Call Supabase RPC                        │  │
│  │  - Handle errors                            │  │
│  │  - Return formatted response                │  │
│  └───────────────┬─────────────────────────────┘  │
│                  │                                  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ↓ supabase.rpc('bulk_log_habits_for_date')
┌─────────────────────────────────────────────────────┐
│          Database (PostgreSQL + Supabase)           │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  bulk_log_habits_for_date()                 │  │
│  │    ↓                                        │  │
│  │  FOR EACH habit:                            │  │
│  │    ├─ log_habit_for_date()                 │  │
│  │    │    ├─ INSERT/UPDATE habit_logs        │  │
│  │    │    ├─ calculate_habit_streak()        │  │
│  │    │    ├─ UPDATE habits.streak            │  │
│  │    │    └─ calculate_habit_cycle_day()     │  │
│  │    └─ Return result                        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Tables Updated:                                   │
│  ├─ habit_logs (INSERT/UPDATE)                    │
│  └─ habits (streak updated)                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ Response
┌─────────────────────────────────────────────────────┐
│          Frontend Updates                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  1. Show success alert                      │  │
│  │  2. Close habit modal                       │  │
│  │  3. Refresh calendar data                   │  │
│  │  4. Update UI with new indicators           │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 💾 Database Operations

```
┌───────────────────────────────────────────────────────────┐
│              STREAK CALCULATION LOGIC                     │
└───────────────────────────────────────────────────────────┘

Input: habit_id, user_id
Current Date: November 14, 2025

Step 1: Get all completed logs
┌─────────────────────────────────────┐
│  Date         │  Completed          │
├─────────────────────────────────────┤
│  Nov 14       │  ✓                  │  ← Today
│  Nov 13       │  ✓                  │
│  Nov 12       │  ✓                  │
│  Nov 11       │  ✗                  │  ← Break!
│  Nov 10       │  ✓                  │
└─────────────────────────────────────┘

Step 2: Count backward from today
┌─────────────────────────────────────┐
│  Nov 14  →  Count: 1                │
│  Nov 13  →  Count: 2                │
│  Nov 12  →  Count: 3                │
│  Nov 11  →  STOP (not completed)    │
└─────────────────────────────────────┘

Result: Streak = 3 days 🔥


┌───────────────────────────────────────────────────────────┐
│              CYCLE DAY CALCULATION                        │
└───────────────────────────────────────────────────────────┘

Input: habit_id (30-day cycle), user_id

Step 1: Count total completed logs
┌─────────────────────────────────────┐
│  Total Completed Logs: 15           │
└─────────────────────────────────────┘

Step 2: Calculate cycle day
┌─────────────────────────────────────┐
│  Cycle Day = 15 + 1 = 16            │
│  Display: "Day 16/30"               │
│  Progress: 53%                      │
└─────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
└── (tabs)
    └── calendar.tsx
        ├── Calendar View (dates)
        ├── DayDetailModal
        │   └── PastDateHabitModal (trigger: "Mark Complete" button)
        └── PastDateHabitModal (trigger: empty date click)
            ├── Habit List
            │   ├── Habit Card 1
            │   │   ├── Checkbox
            │   │   ├── Stats (streak, cycle)
            │   │   └── Feedback Buttons
            │   ├── Habit Card 2
            │   └── Habit Card N
            └── Footer
                ├── Selection Count
                └── Action Buttons
```

## 📊 State Management

```
PastDateHabitModal State:
┌────────────────────────────────────┐
│  habits: Habit[]                   │  ← All user habits
│  loading: boolean                  │  ← Loading state
│  saving: boolean                   │  ← Save in progress
│  selectedHabits: Set<string>       │  ← Selected habit IDs
│  habitFeedback: Map<id, feedback>  │  ← Feedback per habit
└────────────────────────────────────┘

State Transitions:
1. Modal Opens  → loading = true
2. Data Loaded  → loading = false, habits populated
3. User Selects → selectedHabits updated
4. User Saves   → saving = true
5. Save Success → saving = false, modal closes
6. Calendar     → refreshes automatically
```

## 🔐 Security Flow

```
User Request
     ↓
┌─────────────────────────────────────┐
│  Frontend Validation                │
│  ├─ User authenticated?             │
│  ├─ Date in valid range?            │
│  └─ Data format correct?            │
└──────────────┬──────────────────────┘
               ↓ PASS
┌─────────────────────────────────────┐
│  Supabase RLS (Row Level Security)  │
│  ├─ Check auth.uid() = user_id      │
│  ├─ Verify habit ownership          │
│  └─ Apply table policies            │
└──────────────┬──────────────────────┘
               ↓ PASS
┌─────────────────────────────────────┐
│  Database Function Validation       │
│  ├─ Check date not in future        │
│  ├─ Check date < 3 months old       │
│  ├─ Verify habit exists             │
│  └─ Validate feedback values        │
└──────────────┬──────────────────────┘
               ↓ PASS
┌─────────────────────────────────────┐
│  Execute Operations                 │
│  ├─ Insert/Update habit_logs        │
│  ├─ Calculate streaks               │
│  ├─ Update habits table             │
│  └─ Return success                  │
└─────────────────────────────────────┘
```

## 🎯 Performance Optimization

```
Query Optimization:
┌────────────────────────────────────────────┐
│  Without Index:                            │
│  Sequential Scan → 1000ms                  │
└────────────────────────────────────────────┘
                ↓
┌────────────────────────────────────────────┐
│  With Index:                               │
│  idx_habit_logs_habit_user_date_completed  │
│  Index Scan → 10ms (100x faster!)          │
└────────────────────────────────────────────┘

Bulk Operations:
┌────────────────────────────────────────────┐
│  Individual Calls (3 habits):              │
│  Call 1: 200ms                             │
│  Call 2: 200ms                             │
│  Call 3: 200ms                             │
│  Total: 600ms                              │
└────────────────────────────────────────────┘
                ↓
┌────────────────────────────────────────────┐
│  Bulk Call (3 habits):                     │
│  Single Call: 250ms                        │
│  Total: 250ms (2.4x faster!)               │
└────────────────────────────────────────────┘
```

This visual guide helps understand how all the pieces fit together! 🎨✨
