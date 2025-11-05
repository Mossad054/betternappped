# Date Selection Flow - Visual Reference

## 🎯 Date Selection Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
           ┌────────▼────────┐         ┌───────▼────────┐
           │  Direct Access  │         │  From Calendar  │
           │   (Today)       │         │  (Past Date)    │
           └────────┬────────┘         └───────┬────────┘
                    │                           │
                    │                           │
                    │      ┌──────────────┐    │
                    │      │   CALENDAR   │    │
                    │      │              │    │
                    │      │ - MiniCalendar│   │
                    │      │ - calendar.tsx│   │
                    │      │              │    │
                    │      │ Handles:     │    │
                    │      │ • Date tap   │────┘
                    │      │ • hasData    │
                    │      │ • Navigation │
                    │      └──────────────┘
                    │                           
                    │                           
           ┌────────▼───────────────────────────▼────────┐
           │                                              │
           │             ADD-ENTRY SCREEN                 │
           │                                              │
           │  ┌────────────────────────────────────────┐ │
           │  │ Date Handling (Read-Only)              │ │
           │  │                                        │ │
           │  │  If (params.date) {                   │ │
           │  │    selectedDate = parseDate(params)   │ │
           │  │  } else {                             │ │
           │  │    selectedDate = new Date() // Today │ │
           │  │  }                                    │ │
           │  │                                        │ │
           │  │  isBackdated = selectedDate < today   │ │
           │  └────────────────────────────────────────┘ │
           │                                              │
           │  ┌────────────────────────────────────────┐ │
           │  │ Display Layer (No Selection Logic)     │ │
           │  │                                        │ │
           │  │  • Read-only date display              │ │
           │  │  • Backdated warning (if applicable)   │ │
           │  │  • Helper text for date selection      │ │
           │  └────────────────────────────────────────┘ │
           │                                              │
           │  ┌────────────────────────────────────────┐ │
           │  │ Data Entry Forms                       │ │
           │  │                                        │ │
           │  │  • Mood tracking                       │ │
           │  │  • Activities                          │ │
           │  │  • Sleep                               │ │
           │  │  • Productivity                        │ │
           │  │  • Intimacy                            │ │
           │  └────────────────────────────────────────┘ │
           │                                              │
           └──────────────────┬───────────────────────────┘
                              │
                              │ Save
                              ▼
                    ┌──────────────────┐
                    │    DATABASE      │
                    │                  │
                    │  date: YYYY-MM-DD│
                    │  data: {...}     │
                    └──────────────────┘
```

## 🔄 State Flow

### Today's Entry Flow
```
User Action → Direct Access
             ↓
         No URL params
             ↓
    selectedDate = today
             ↓
    isBackdated = false
             ↓
      Normal entry UI
             ↓
          Save data
```

### Backdated Entry Flow
```
User Action → Calendar tap (Nov 2)
             ↓
  router.push('/add-entry?date=2025-11-02')
             ↓
    params.date = '2025-11-02'
             ↓
    selectedDate = parse(params.date)
             ↓
    isBackdated = true
             ↓
    Show backdated warning
             ↓
          Save data
```

## 🎨 Component Responsibilities

### Calendar Components (MiniCalendar, calendar.tsx)
```
┌─────────────────────────────┐
│       RESPONSIBLE FOR       │
├─────────────────────────────┤
│ ✓ Detecting date taps       │
│ ✓ Checking data existence   │
│ ✓ Visual indicators         │
│ ✓ Navigation to add-entry   │
│ ✓ Passing date via URL      │
└─────────────────────────────┘
```

### Add-Entry Screen
```
┌─────────────────────────────┐
│       RESPONSIBLE FOR       │
├─────────────────────────────┤
│ ✓ Reading date param        │
│ ✓ Defaulting to today       │
│ ✓ Display date (read-only)  │
│ ✓ Data entry forms          │
│ ✓ Saving to database        │
│                             │
│     NOT RESPONSIBLE FOR     │
│ ✗ Date selection            │
│ ✗ Date modification         │
│ ✗ Calendar navigation       │
└─────────────────────────────┘
```

## 📱 User Experience

### Visual States

#### Normal Entry (Today)
```
┌────────────────────────────┐
│ Logging Entry For          │
│                            │
│ ┌────────────────────────┐ │
│ │ 📅 Tuesday, November 5 │ │ ← Green calendar icon
│ └────────────────────────┘ │
│                            │
│ 💡 To log for a different  │ ← Blue helper box
│    date, go to Calendar    │
└────────────────────────────┘
```

#### Backdated Entry
```
┌────────────────────────────┐
│ Logging Entry For          │
│                            │
│ ┌────────────────────────┐ │
│ │ 📅 Saturday, November 2│ │ ← Orange calendar icon
│ └────────────────────────┘ │
│                            │
│ 📅 You're logging data for │ ← Orange warning box
│    a past date (2025-11-02)│
│                            │
│ 💡 To log for a different  │ ← Blue helper box
│    date, go to Calendar    │
└────────────────────────────┘
```

### MiniCalendar Visual Indicators
```
┌──────────────────────────────────────────┐
│  Sun   Mon   Tue   Wed   Thu   Fri   Sat │
│                                          │
│  [ 3 ] [ 4 ] [★5★] [ 6 ] [ 7 ] [ 8 ] [+9]│
│   ✓     ✓    TODAY    +     +     +     +│
│                                          │
│  Legend:                                 │
│  ✓ = Has data (green border)            │
│  + = No data (gray, add button)         │
│  ★ = Today (blue border + highlight)    │
└──────────────────────────────────────────┘
```

## 🔍 Data Detection

### Has Data Check (in MiniCalendar)
```typescript
const hasData = 
  // Any habits logged?
  day.totalHabits > 0 ||
  day.completedHabits > 0 ||
  
  // Explicitly marked?
  day.hasData === true;
```

### Calendar Data Structure
```typescript
{
  date: "2025-11-05",
  completedHabits: 2,
  totalHabits: 3,
  hasData: true,  // ← NEW FIELD
  feedback: {
    good: 2,
    neutral: 0,
    bad: 0
  }
}
```

## 🚦 Navigation Flow

```
Calendar Screen
     │
     │ User taps Nov 2 (hasData = false)
     │
     ▼
router.push('/add-entry?date=2025-11-02')
     │
     ▼
Add-Entry Screen
     │
     │ Reads params.date
     │
     ▼
Displays: "📅 Saturday, November 2, 2025"
Shows: "📅 You're logging data for a past date"
     │
     │ User fills form
     │
     ▼
Save with date: "2025-11-02"
     │
     ▼
Navigate back to Calendar
     │
     ▼
Calendar updates: Nov 2 now has data ✓
```

## 🎯 Key Principles

1. **Single Source of Truth**
   - Calendar owns date selection
   - Add-entry only reads dates

2. **Unidirectional Data Flow**
   - Calendar → URL params → Add-entry
   - No circular dependencies

3. **Clear Separation**
   - Selection logic = Calendar
   - Display logic = Add-entry
   - Business logic = Services

4. **User Feedback**
   - Visual indicators (colors, borders)
   - Text messages (backdated notice)
   - Helper text (how to change date)

---

*Last Updated: November 5, 2025*
