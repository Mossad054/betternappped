# Impact Analysis Card - Visual Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Impact Analysis                                          │
│ How your activities affect your wellbeing               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 🎉 🏃 Morning Run has the highest positive     │    │
│  │    impact!                                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 🏃 Morning│ │ 🧘 Yoga  │ │ 📚 Read  │              │
│  │   Run    │ │          │ │   Book   │              │
│  │      •   │ │      •   │ │      •   │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 🎵 Music │ │ ☕ Coffee│ │ 🚶 Walk  │              │
│  │ Meditate │ │ Morning  │ │ Evening  │              │
│  │      •   │ │      •   │ │      •   │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 🍎 Fruit │ │ 💻 Code  │ │ 📱 Social│              │
│  │ Snack    │ │ Session  │ │  Media   │              │
│  │      •   │ │      •   │ │      •   │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                          │
│              +5 more activities                         │
└─────────────────────────────────────────────────────────┘

Legend:
• Green dot = Positive impact (score >= 60)
• Yellow dot = Neutral impact (score 45-59)
• Red dot = Negative impact (score < 45)
```

## Modal Structure (When Tapping Activity)

```
┌─────────────────────────────────────────────────────────┐
│ 🏃 Morning Run                                      ✕   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                                       │
│  │   Exercise   │                                       │
│  └──────────────┘                                       │
│                                                          │
│  Overall Impact                                         │
│  ╔═══════════════╗                                      │
│  ║      78       ║ / 100                               │
│  ╚═══════════════╝                                      │
│     Positive Impact                                     │
│                                                          │
│  Activity Frequency                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐                     │
│  │   12   │ │   35%  │ │  HIGH  │                     │
│  │ Times  │ │ Of all │ │Confid. │                     │
│  └────────┘ └────────┘ └────────┘                     │
│                                                          │
│  Impact on Wellbeing Parameters                        │
│  ┌──────────────────────────────────┐                  │
│  │ 😊 Mood               +2.35      │                  │
│  ├──────────────────────────────────┤                  │
│  │ 😴 Sleep Quality      +1.80      │                  │
│  ├──────────────────────────────────┤                  │
│  │ 🧠 Mental Clarity     +2.10      │                  │
│  ├──────────────────────────────────┤                  │
│  │ ⚡ Productivity       +1.95      │                  │
│  └──────────────────────────────────┘                  │
│                                                          │
│  Correlation Strength                                   │
│  How strongly this activity relates to each parameter   │
│  ┌──────────────────────────────────┐                  │
│  │ Mood         ████████░░  85%     │                  │
│  │ Sleep        ███████░░░  72%     │                  │
│  │ Clarity      █████████░  92%     │                  │
│  │ Productivity ████████░░  80%     │                  │
│  └──────────────────────────────────┘                  │
│                                                          │
│  [Scroll for more details...]                          │
└─────────────────────────────────────────────────────────┘
```

## Color Coding System

### Positive Impact (Green)
- **Score Range**: 60-100
- **Border Color**: Theme success color
- **Background**: Success color with 15% opacity
- **Dot Color**: Solid success color
- **Meaning**: This activity has a beneficial effect on your wellbeing
- **Example**: Exercise, meditation, reading

### Neutral Impact (Yellow)
- **Score Range**: 45-59
- **Border Color**: Theme warning color
- **Background**: Warning color with 15% opacity
- **Dot Color**: Solid warning color
- **Meaning**: This activity has a mild or mixed effect
- **Example**: Social media (moderate use), coffee

### Negative Impact (Red)
- **Score Range**: 0-44
- **Border Color**: Theme error color
- **Background**: Error color with 15% opacity
- **Dot Color**: Solid error color
- **Meaning**: This activity may be reducing your wellbeing
- **Example**: Late-night screen time, junk food

## Responsive Design

### Three Pills Per Row
```
┌─────────────────────────────────────┐
│ [Pill 1] [Pill 2] [Pill 3]          │
│ [Pill 4] [Pill 5] [Pill 6]          │
│ [Pill 7] [Pill 8] [Pill 9]          │
└─────────────────────────────────────┘
```

### Calculation
- Container width: 100%
- Gap between pills: 10px
- Pills per row: 3
- Pill width: (100% - 2 gaps) / 3 = 31%
- Minimum width: 100px (prevents tiny pills)

### Dynamic Text Handling
- Text truncates with ellipsis (...) if too long
- Pill width adjusts to longest text in row
- Maintains minimum width for readability

## User Interaction Flow

### 1. Initial View
```
User opens home page
     ↓
Impact Analysis card loads
     ↓
Shows top 9 activities from last 7 days
     ↓
Activities displayed as colored pill buttons
```

### 2. Tap Interaction
```
User taps activity pill
     ↓
Modal slides up
     ↓
Shows activity details
     ↓
User can scroll for full info
     ↓
User taps X to close or taps outside
     ↓
Modal slides down
```

### 3. Empty State
```
No activities logged
     ↓
Shows empty state message
     ↓
"Log activities to see impact"
     ↓
Encourages user to start logging
```

## Data Requirements

### Minimum Data for Display
- At least 1 activity logged in last 7 days
- Activity must have:
  - Name
  - Emoji (icon)
  - Category
  - Date logged

### Optimal Data for Insights
- 5+ occurrences of activity
- Corresponding mood/sleep/clarity logs
- 7+ days of consistent logging
- High confidence level (20+ data points)

### Low Confidence Warning
Shows when:
- Less than 10 data points total
- Insufficient corresponding logs
- Limited activity occurrences

## Performance Considerations

### Data Fetching
- Loads on component mount
- Caches result for session
- Refresh on pull-to-refresh
- Background update on app focus

### Rendering Optimization
- Only renders top 9 activities initially
- Modal content lazy loads
- Uses React Native's optimized components
- Proper key props for list rendering

### Memory Management
- Modal unmounts when closed
- Images/emojis use native rendering
- No memory leaks in subscriptions
- Proper cleanup on unmount

## Accessibility Features

### Screen Reader Support
- Descriptive labels for all interactive elements
- Activity names read aloud
- Impact scores announced
- Modal headings properly structured

### Touch Targets
- Pill buttons: Minimum 44x44 pt
- Close button: 44x44 pt
- Comfortable spacing between elements

### Color Contrast
- Text meets WCAG AA standards
- Impact indicators have high contrast
- Alternative to color (text labels)

## Theme Compatibility

### Light Mode
- Clear borders and backgrounds
- Readable text on all backgrounds
- Proper contrast ratios

### Dark Mode
- Inverted color scheme
- Maintains readability
- Border colors adjusted
- Background opacity optimized

### True Black Mode
- Pure black backgrounds where appropriate
- Reduced opacity for accents
- Enhanced battery saving

## Error Handling

### Network Errors
```
Failed to fetch data
     ↓
Shows error message
     ↓
"Retry" button available
     ↓
User taps retry
     ↓
Attempts to reload data
```

### Data Errors
```
Invalid data format
     ↓
Logs error to console
     ↓
Shows fallback UI
     ↓
Graceful degradation
```

### Empty States
```
No matching activities
     ↓
Shows helpful message
     ↓
Suggests logging activities
     ↓
Provides link to activity tracker
```

---

**Quick Reference**
- 🟢 Green = Good for you (Keep doing it!)
- 🟡 Yellow = Neutral effect (Monitor it)
- 🔴 Red = Consider reducing (May harm wellbeing)

**Pro Tip**: Activities with high confidence (20+ data points) provide the most reliable insights!
