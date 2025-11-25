# Modal Design Standards

## Overview

This document defines the unified modal design system for the Betternapped application. All modals must follow these standards to ensure consistency, accessibility, and optimal user experience across all devices.

## UniversalModal Component

Location: `components/UniversalModal.tsx`

### Usage

```typescript
import UniversalModal from '@/components/UniversalModal';
import { Typography, SPACING } from '@/constants/Typography';

<UniversalModal
  visible={isVisible}
  onClose={handleClose}
  title="Modal Title"
  subtitle="Optional subtitle"
  footerButtons={[
    { label: 'Cancel', onPress: onCancel, variant: 'secondary' },
    { label: 'Save', onPress: onSave, variant: 'primary' },
  ]}
  scrollable={true}
>
  {/* Modal content */}
</UniversalModal>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | boolean | required | Controls modal visibility |
| `onClose` | () => void | required | Close handler |
| `title` | string | undefined | Modal title |
| `subtitle` | string | undefined | Modal subtitle |
| `children` | ReactNode | required | Modal content |
| `footerButtons` | FooterButton[] | undefined | Footer action buttons |
| `scrollable` | boolean | true | Enable scroll behavior |
| `fullHeight` | boolean | false | Use full screen height |
| `maxHeight` | number \| string | 85% | Maximum modal height |
| `showCloseButton` | boolean | true | Show X close button |
| `closeOnBackdrop` | boolean | true | Close when tapping backdrop |
| `animationType` | 'slide' \| 'fade' \| 'none' | 'slide' | Animation type |
| `headerRight` | ReactNode | undefined | Custom header right content |

### Footer Button Options

```typescript
interface FooterButton {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}
```

## Design Specifications

### Colors & Theming

- **Background**: Always use `theme.colors.card`
- **Text**: Use `theme.colors.text` for primary, `theme.colors.textSecondary` for secondary
- **Borders**: Use `theme.colors.border`
- **Never use hardcoded colors** - always reference theme

### Border Radius

- Modal container: `24px` (top corners for bottom sheets)
- Tablet center modals: `24px` all corners
- Inner elements: `12-16px`

### Shadows

- Bottom sheet backdrop: `rgba(0, 0, 0, 0.5)`
- Elevation handled by modal container

### Spacing

Use constants from `@/constants/Typography`:

```typescript
import { SPACING } from '@/constants/Typography';

// Values:
// xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32, 4xl: 40
```

- Header padding: `SPACING.xl` (20px)
- Content padding: `SPACING.xl` (20px) horizontal, `SPACING.lg` (16px) vertical
- Footer padding: `SPACING.xl` (20px) horizontal, `SPACING.lg` (16px) vertical
- Section spacing: `SPACING.lg` (16px)
- Element gaps: `SPACING.md` (12px)

### Typography

Always use Typography constants:

```typescript
import { Typography } from '@/constants/Typography';

// Headers
<Text style={[Typography.h3, { color: theme.colors.text }]}>Title</Text>

// Body
<Text style={[Typography.body, { color: theme.colors.text }]}>Content</Text>

// Meta/Small
<Text style={[Typography.meta, { color: theme.colors.textSecondary }]}>Info</Text>
```

Available styles:
- `h1`, `h2`, `h3`, `h4` - Headers
- `body`, `bodyBold`, `bodySmall` - Body text
- `meta`, `caption`, `small` - Small text
- `button`, `buttonSmall` - Button text
- `cardTitle`, `cardDescription` - Card content
- `label`, `input` - Form elements

## Responsive Design

### Device Breakpoints

- Small phones: `height < 700px`
- Tablets: `width >= 768px`

### Adaptive Behaviors

1. **Phones**: Bottom sheet style (rounded top corners)
2. **Tablets**: Centered dialog (rounded all corners, max-width 600px)
3. **Small screens**: Reduced padding, smaller fonts

### Safe Area Support

UniversalModal automatically handles:
- Top safe area inset
- Bottom safe area inset (home indicator, notch)
- Keyboard avoidance

## Accessibility

### Requirements

- Minimum touch target: 48x48px for buttons
- Minimum font size: 16px for body text (HIG guidelines)
- High contrast: Use theme colors
- Screen reader support: Use `accessibilityLabel` and `accessibilityRole`

### Implementation

```typescript
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  accessibilityLabel="Save changes"
  accessibilityRole="button"
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Text>Save</Text>
</TouchableOpacity>
```

## Migration Guide

### Before (Old Pattern)

```typescript
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.overlay}>
    <View style={styles.container}>
      <View style={styles.header}>...</View>
      <ScrollView>...</ScrollView>
      <View style={styles.footer}>...</View>
    </View>
  </View>
</Modal>
```

### After (New Pattern)

```typescript
<UniversalModal
  visible={visible}
  onClose={onClose}
  title="Title"
  footerButtons={buttons}
>
  {/* Just the content */}
</UniversalModal>
```

## QA Checklist

### Visual Consistency

- [ ] Uses theme colors (no hardcoded values)
- [ ] Correct border radius (24px container)
- [ ] Consistent spacing using SPACING constants
- [ ] Typography uses Typography constants
- [ ] Shadows match design system

### Responsive Behavior

- [ ] Works on iPhone SE (small screen)
- [ ] Works on iPhone 13-16 series
- [ ] Works on iPad Mini
- [ ] Works on iPad Full
- [ ] Works on Android phones (various sizes)
- [ ] Works on Samsung Galaxy Fold
- [ ] Landscape orientation supported

### Functionality

- [ ] Scrollable content works correctly
- [ ] Long content doesn't clip
- [ ] Keyboard doesn't cover inputs
- [ ] Close button works
- [ ] Backdrop tap closes (if enabled)
- [ ] Footer buttons accessible
- [ ] Safe areas respected

### Accessibility

- [ ] Touch targets ≥ 48px
- [ ] Body text ≥ 16px
- [ ] Color contrast sufficient
- [ ] Screen reader labels present

### Performance

- [ ] No inline styles inside render functions
- [ ] StyleSheet defined outside component
- [ ] Memoization for expensive calculations

## Modals to Refactor

Complete list of modals requiring migration to UniversalModal:

### Completed
- [x] PastDateHabitModal.tsx
- [x] ActivityImpactRatingModal.tsx

### Pending
- [ ] DayDetailModal.tsx
- [ ] HabitImpactFeedbackModal.tsx
- [ ] ActivityDetailModal.tsx
- [ ] sleep/DailyCheckInModal.tsx
- [ ] sleep/ProgrammeEnrollmentModal.tsx
- [ ] intimacy/DailyCheckInModal.tsx
- [ ] Modals in experiments-hub.tsx
- [ ] Modals in habit-library.tsx
- [ ] Modals in home.tsx
- [ ] Modals in calendar.tsx
- [ ] Modals in journal.tsx
- [ ] Modals in settings screens
- [ ] Modals in sleep-wellness-hub.tsx

## Example Implementation

See `components/PastDateHabitModal.tsx` and `components/ActivityImpactRatingModal.tsx` for complete examples of properly migrated modals.

## Contact

For questions about modal design standards, refer to this document or the UniversalModal component source code.
