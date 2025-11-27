# Modern Time Picker - Visual & Usage Guide

## 🎨 Component Appearance

```
┌─────────────────────────────────────┐
│  ✕    Select Bedtime            │  ← Header with close button
├─────────────────────────────────────┤
│                                     │
│        [09] : [30]  ┌─AM─┐        │  ← Large time display
│                      └─PM─┘         │     with AM/PM toggle
│                                     │
│      ┌────────────────┐            │
│      │  Hour | Minute │            │  ← Mode toggle
│      └────────────────┘            │
│                                     │
│         🕐 Clock Dial              │
│      ╱                 ╲           │
│    12                    3         │
│   ╱         [09:30]       ╲        │  ← Center displays
│  9            ⦿            6       │     current selection
│   ╲                       ╱        │
│     6                   9          │
│      ╲                 ╱           │
│                                     │
│   ┌────────┐  ┌──────────┐       │
│   │ Cancel │  │ ✓ Confirm │       │  ← Action buttons
│   └────────┘  └──────────┘       │
└─────────────────────────────────────┘
```

---

## 🎯 Interactive Elements

### 1. Time Display (Top)
- **Large digits**: Hour and minute in 48px font
- **Tap hour**: Switch to hour selection mode
- **Tap minute**: Switch to minute selection mode
- **AM/PM buttons**: Toggle between AM and PM (12-hour mode only)

### 2. Mode Toggle
- **Hour button**: Select hours from clock dial
- **Minute button**: Select minutes from clock dial
- **Visual feedback**: Active mode is highlighted with primary color

### 3. Clock Dial
- **12 numbers**: Positioned in circle (hours: 12/1-11, minutes: 00/05-55)
- **Tap any number**: Immediately select that time
- **Selected number**: Highlighted with primary color background
- **Center circle**: Shows current selection (HH:MM)

### 4. Action Buttons
- **Cancel**: Dismisses picker without saving
- **Confirm**: Saves time and closes picker

---

## 💡 Usage Examples

### Example 1: Notification Time
```typescript
import ModernTimePicker, { TimeValue } from '@/components/ModernTimePicker';

const [showPicker, setShowPicker] = useState(false);
const [notificationTime, setNotificationTime] = useState({ hour: 9, minute: 0 });

<ModernTimePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onConfirm={(time) => {
    setNotificationTime(time);
    // Save to backend: "09:00"
    NotificationService.updateTime(`${time.hour}:${time.minute}`);
    setShowPicker(false);
  }}
  initialTime={notificationTime}
  is24Hour={false}
  title="Daily Reminder Time"
/>
```

### Example 2: Sleep Logging
```typescript
const [bedtime, setBedtime] = useState(new Date());
const [showBedtimePicker, setShowBedtimePicker] = useState(false);

<ModernTimePicker
  visible={showBedtimePicker}
  onClose={() => setShowBedtimePicker(false)}
  onConfirm={(time) => {
    const newBedtime = new Date(bedtime);
    newBedtime.setHours(time.hour, time.minute);
    setBedtime(newBedtime);
    setShowBedtimePicker(false);
  }}
  initialTime={{
    hour: bedtime.getHours(),
    minute: bedtime.getMinutes(),
  }}
  is24Hour={false}
  title="Select Bedtime"
/>
```

### Example 3: Habit Reminder
```typescript
const [reminderTime, setReminderTime] = useState('14:30'); // HH:mm format

<ModernTimePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onConfirm={(time) => {
    const hours = time.hour.toString().padStart(2, '0');
    const minutes = time.minute.toString().padStart(2, '0');
    setReminderTime(`${hours}:${minutes}`);
    setShowPicker(false);
  }}
  initialTime={{
    hour: parseInt(reminderTime.split(':')[0]),
    minute: parseInt(reminderTime.split(':')[1]),
  }}
  is24Hour={false}
  title="Set Habit Reminder"
/>
```

---

## 🎨 Theming

The component automatically adapts to your app's theme:

### Light Mode
- **Background**: `theme.colors.card` (white/light gray)
- **Text**: `theme.colors.text` (dark)
- **Primary**: `theme.colors.primary` (brand color)
- **Secondary**: `theme.colors.textSecondary` (gray)
- **Border**: `theme.colors.border` (light gray)

### Dark Mode
- **Background**: `theme.colors.card` (dark gray/black)
- **Text**: `theme.colors.text` (white/light gray)
- **Primary**: `theme.colors.primary` (brand color)
- **Secondary**: `theme.colors.textSecondary` (gray)
- **Border**: `theme.colors.border` (dark gray)

---

## 📱 Responsive Behavior

### Small Screens (iPhone SE, 5.5")
- Clock size: 245px (70% of screen width)
- Font scales proportionally
- All elements remain accessible
- No horizontal scrolling

### Medium Screens (iPhone 11-14, 6.1")
- Clock size: 280px
- Optimal viewing experience
- Generous tap targets

### Large Screens (iPhone 15 Pro Max, 6.7")
- Clock size: 300px (maximum)
- Extra padding and spacing
- Enhanced visual hierarchy

### Tablets (iPad, 9.7"+)
- Clock size: 300px (capped for ergonomics)
- Centered with ample margins
- Easy one-handed operation

---

## 🎬 Animation Flow

### Opening
1. **Fade in**: Background overlay (200ms)
2. **Scale up**: Picker modal springs from 0 to 1 (spring animation)
3. **Haptic**: Light impact feedback (iOS)
4. **Total duration**: ~300ms

### Selecting Time
1. **Tap number**: Immediate visual feedback
2. **Haptic**: Light impact (iOS)
3. **Auto-advance**: Hour → Minute mode
4. **Update display**: Smooth number change

### Closing
1. **Fade out**: Background overlay (150ms)
2. **Scale down**: Picker modal springs from 1 to 0
3. **Haptic**: Light impact on confirm (iOS)
4. **Total duration**: ~250ms

---

## ♿ Accessibility

### Touch Targets
- **Minimum size**: 44x44pt (Apple HIG compliant)
- **Number buttons**: 44x44pt
- **AM/PM buttons**: 44x36pt
- **Action buttons**: 50pt height

### Visual Contrast
- **Selected state**: Primary color background
- **Unselected state**: Transparent with border
- **Text contrast**: WCAG AA compliant
- **Focus indicators**: Clear visual feedback

### Screen Readers (Future Enhancement)
- Add aria labels for all interactive elements
- Announce current selection
- Provide navigation hints

---

## 🔊 Haptic Feedback (iOS Only)

### When Triggered
- ✓ Opening picker
- ✓ Selecting hour
- ✓ Selecting minute
- ✓ Toggling AM/PM
- ✓ Switching mode (Hour/Minute)
- ✓ Confirming selection

### Feedback Style
- **Type**: `ImpactFeedbackStyle.Light`
- **Intensity**: Subtle, non-intrusive
- **Platform**: iOS only (gracefully skipped on Android)

---

## 🐛 Troubleshooting

### Issue: Picker not appearing
**Solution**: Ensure `visible={true}` prop is set

### Issue: Time not updating
**Solution**: Check `onConfirm` handler is correctly updating state

### Issue: Wrong initial time
**Solution**: Verify `initialTime` object format: `{ hour: number, minute: number }`

### Issue: Theme not applying
**Solution**: Ensure ThemeContext provider wraps your component tree

### Issue: Haptics not working
**Solution**: iOS only feature, check device settings and permissions

---

## 📊 Comparison: Before vs After

| Feature | Old DateTimePicker | New ModernTimePicker |
|---------|-------------------|---------------------|
| Design | Native OS (inconsistent) | Custom, consistent UI |
| Theme | System default | Fully theme-aware |
| Animations | None | Smooth spring animations |
| Haptics | None | Light impact feedback |
| Touch Targets | Variable (small) | 44x44pt minimum |
| Clock UI | Spinner/wheel | Modern clock dial |
| AM/PM Toggle | Part of wheel | Dedicated buttons |
| Mobile Optimization | Limited | Fully optimized |
| Responsive | Basic | Full responsive design |
| Visual Feedback | Minimal | Rich, animated feedback |

---

## 🎓 Best Practices

### 1. Always Provide Context
```typescript
// ✅ Good: Clear title
title="Select Bedtime"

// ❌ Bad: Generic title
title="Select Time"
```

### 2. Match Format to Backend
```typescript
// If backend uses 24-hour format
is24Hour={true}

// If backend uses 12-hour format
is24Hour={false}
```

### 3. Handle Time Conversion
```typescript
// Always convert between Date, TimeValue, and string formats
const timeValue = {
  hour: date.getHours(),
  minute: date.getMinutes()
};
```

### 4. Close Picker After Confirm
```typescript
onConfirm={(time) => {
  updateTime(time);
  setShowPicker(false); // Always close!
}}
```

### 5. Provide Initial Time
```typescript
// ✅ Good: Use current/saved time
initialTime={{ hour: savedHour, minute: savedMinute }}

// ❌ Bad: Hardcoded default
initialTime={{ hour: 0, minute: 0 }}
```

---

## 🚀 Quick Start

### Step 1: Import
```typescript
import ModernTimePicker, { TimeValue } from '@/components/ModernTimePicker';
```

### Step 2: Add State
```typescript
const [showPicker, setShowPicker] = useState(false);
const [time, setTime] = useState<TimeValue>({ hour: 9, minute: 0 });
```

### Step 3: Render
```typescript
<ModernTimePicker
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onConfirm={(time) => {
    setTime(time);
    setShowPicker(false);
  }}
  initialTime={time}
  is24Hour={false}
  title="Select Time"
/>
```

### Step 4: Trigger
```typescript
<TouchableOpacity onPress={() => setShowPicker(true)}>
  <Text>Set Time</Text>
</TouchableOpacity>
```

---

## 🎉 You're Done!

The ModernTimePicker is now integrated and ready to use. Enjoy the beautiful, consistent time selection experience across your entire app!

**Happy coding! 🚀**
