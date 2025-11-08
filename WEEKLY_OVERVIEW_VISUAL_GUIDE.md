# Weekly Overview Card - Visual Reference

## Calendar Layout

### Sleep Times Calendar (Top Section)

```
┌──────────────────────────────────────────────────────────────┐
│  🌙 Sleep & Wake Times                                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   MON    TUE    WED    THU    FRI    SAT    SUN             │
│    15     16     17     18     19     20     21             │
│   ───    ───    ───    ───    ───    ───    ───             │
│   ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐            │
│   │🌙│    │🌙│    │🌙│    │🌙│    │ •│    │🌙│    │🌙│            │
│   │ │    │ │    │ │    │ │    │ │    │ │    │ │            │
│   └─┘    └─┘    └─┘    └─┘    └─┘    └─┘    └─┘            │
│   Green  Green   Red   Green   Gray  Green  Green           │
│                                                               │
│  🌙11PM  🌙11PM  🌙12AM 🌙11PM   --   🌙11PM 🌙11PM          │
│  ☀️7AM   ☀️7AM   ☀️8AM  ☀️7AM    --   ☀️7AM  ☀️7AM           │
│  8.0h   8.0h   8.0h   8.0h    --   8.0h   8.0h              │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  Target: 🌙 11:00PM    ☀️ 7:00AM                            │
└──────────────────────────────────────────────────────────────┘

Legend:
🟢 Green  = On target (met bedtime goal)
🔴 Red    = Missed target (too early/late)
⚪ Gray   = No data logged
```

### Sleep Habits Calendar (Bottom Section)

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ Sleep Habits Completed                                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   MON    TUE    WED    THU    FRI    SAT    SUN             │
│    15     16     17     18     19     20     21             │
│   ───    ───    ───    ───    ───    ───    ───             │
│   ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐    ┌─┐            │
│   │💜│    │💜│    │💜│    │💜│    │ •│    │💜│    │💜│            │
│   │ │    │🌊│    │🌊│    │ │    │ │    │ │    │🌊│            │
│   └─┘    └─┘    │📖│    └─┘    └─┘    └─┘    │+2│           │
│         Overlap └─┘                           Badge          │
│          +1      +3                                           │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  Legend:                                                      │
│  💜 Meditation  🌊 Bath  📖 Reading  ☕ No Caffeine           │
└──────────────────────────────────────────────────────────────┘
```

## Icon Clustering Examples

### Single Habit
```
┌─────┐
│     │
│  💜 │  ← One icon centered
│     │
└─────┘
```

### Two Habits (Overlapping)
```
┌─────┐
│ 💜  │
│  🌊 │  ← Two icons overlap slightly
│     │
└─────┘
```

### Three+ Habits (Clustered with Badge)
```
┌─────┐
│ 💜  │
│  🌊 │  ← First two overlap
│  +2 │  ← Badge shows remaining count
└─────┘
```

## Modal Popup (Tap on Day)

```
┌──────────────────────────────────────┐
│  Monday, November 18              ✕  │
├──────────────────────────────────────┤
│  Completed Sleep Habits              │
│                                      │
│  ┌──┐                                │
│  │💜│  Meditation                    │
│  └──┘                                │
│                                      │
│  ┌──┐                                │
│  │🌊│  Bath/Shower                   │
│  └──┘                                │
│                                      │
│  ┌──┐                                │
│  │📖│  Reading                       │
│  └──┘                                │
│                                      │
│  ┌──┐                                │
│  │☕│  No Caffeine                   │
│  └──┘                                │
└──────────────────────────────────────┘
```

## Color Palette

### Sleep Times Calendar
- **Success (Green)**: `theme.colors.success` - #10B981
- **Error (Red)**: `theme.colors.error` - #EF4444
- **No Data (Gray)**: `theme.colors.border` - #E5E7EB
- **Today Border**: `theme.colors.primary` - #6366F1

### Sleep Habits Icons
- **Meditation** (Heart): #8B5CF6 (Purple)
- **Bath** (Droplets): #06B6D4 (Cyan)
- **Reading** (Book): #F59E0B (Amber)
- **No Caffeine** (Coffee): #EF4444 (Red)
- **Exercise** (Zap): #10B981 (Green)
- **Music** (Music): #EC4899 (Pink)
- **Breathing** (Moon): #6366F1 (Indigo)

## Interaction Flow

```
┌─────────────────────────────────────────────┐
│ User taps on a day in Sleep Times Calendar  │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ Navigate to Sleep Wellness with date param  │
│ router.push(`/sleep-wellness?date=${date}`) │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ User taps on a day in Habits Calendar       │
│ (only if habits.length > 0)                 │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│ Show modal with full list of habits         │
│ - Day name and date                         │
│ - All completed habits with icons           │
│ - Tap X or outside to close                 │
└─────────────────────────────────────────────┘
```

## Responsive Sizing

### Sleep Times Calendar Circles
- **Circle Size**: 36x36px
- **Icon Size**: 18px
- **Gap Between Days**: 4px
- **Time Text**: 9px
- **Day Label**: 11px (uppercase)
- **Day Number**: 14px

### Habits Calendar Circles
- **Circle Size**: 44x44px
- **Single Icon**: 20px
- **Clustered Icon**: 14px (in 24x24 container)
- **+N Badge**: 20x20px with 9px text
- **Gap Between Days**: Auto-justified
- **Day Label**: 11px (uppercase)
- **Day Number**: 13px

## Spacing & Layout

```
Card Padding: 20px
Section Gap: 12px
Calendar Header Gap: 8px
Divider Margin: 20px vertical
Legend Gap: 12px
```

## Typography

```
Card Title: 20px, Bold (700)
Card Subtitle: 13px, Medium (500)
Calendar Header: 16px, Bold (700)
Day Label: 11px, Semibold (600), UPPERCASE
Day Number: 13-14px, Semibold (600)
Time Text: 9px, Medium (500)
Hours Badge: 10px, Bold (700)
Legend Text: 12px, Medium (500)
```

## Data Format

### Sleep Times Data
```typescript
{
  date: "2024-11-18",
  dayOfWeek: "Monday",
  dayNumber: 18,
  bedtime: "23:00",      // 24h format
  wakeTime: "07:00",     // 24h format
  hoursSlept: 8.0,
  onTarget: true,
  hasData: true
}
```

### Habits Data
```typescript
{
  date: "2024-11-18",
  dayOfWeek: "Monday",
  dayNumber: 18,
  habits: ["meditation", "bath", "reading"],
  onTarget: true
}
```

## Empty States

### Sleep Times - No Data
```
┌─────┐
│     │
│  •  │  ← Gray dot
│     │
│  -- │  ← No times shown
└─────┘
```

### Habits - No Habits
```
┌─────┐
│     │
│  •  │  ← Empty gray circle
│     │
└─────┘
```

## Accessibility

- All interactive elements are tappable (44x44px minimum)
- Clear color contrast for text
- Icons have semantic meaning
- Modal can be dismissed with X button or tap outside
- Today's date is visually highlighted
- Clear labels for all data points
