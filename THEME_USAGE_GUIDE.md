# Theme System Usage Guide

## Quick Start

### Import the Theme
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  // Use theme.colors, theme.typography, etc.
}
```

## Common Patterns

### 1. Using Colors
```tsx
// Text colors
color: theme.colors.textPrimary   // Main text (#2E2E2E)
color: theme.colors.textSecondary // Muted text (#6B6B6B)
color: theme.colors.textTertiary  // Light text (#9A9A9A)

// Backgrounds
backgroundColor: theme.colors.background  // Main app bg (#F5EFE1)
backgroundColor: theme.colors.surface     // Cards, containers (#FAF5EB)
backgroundColor: theme.colors.surfaceVariant // Variant (#F7F1E3)

// Accents
backgroundColor: theme.colors.primary  // Warm yellow (#F9CF73)
backgroundColor: theme.colors.accent   // Warm orange (#FFB870)

// Moods
backgroundColor: theme.colors.moodHappy   // #FCE38A
backgroundColor: theme.colors.moodCalm    // #A8E6CF
backgroundColor: theme.colors.moodSad     // #81D4FA
```

### 2. Using Typography
```tsx
// Headings
<Text style={theme.typography.h1}>Hero Text</Text>
<Text style={theme.typography.h2}>Large Heading</Text>
<Text style={theme.typography.h3}>Section Heading</Text>
<Text style={theme.typography.h4}>Card Heading</Text>

// Body text
<Text style={theme.typography.bodyLarge}>Large body text</Text>
<Text style={theme.typography.body}>Regular body text</Text>
<Text style={theme.typography.bodySmall}>Small body text</Text>

// Other
<Text style={theme.typography.caption}>Caption text</Text>
<Text style={theme.typography.label}>Label text</Text>
<Text style={theme.typography.button}>Button text</Text>
```

### 3. Using Spacing
```tsx
// Standard spacing
padding: theme.spacing.xs   // 4
padding: theme.spacing.sm   // 8
padding: theme.spacing.md   // 16
padding: theme.spacing.lg   // 24
padding: theme.spacing.xl   // 32

// Semantic spacing
marginHorizontal: theme.spacing.screenHorizontal  // 20
marginVertical: theme.spacing.screenVertical      // 20
padding: theme.spacing.cardPadding                // 16
marginBottom: theme.spacing.sectionGap            // 24
gap: theme.spacing.elementGap                     // 12
```

### 4. Using Border Radius
```tsx
borderRadius: theme.radii.xs      // 4
borderRadius: theme.radii.sm      // 6
borderRadius: theme.radii.md      // 12
borderRadius: theme.radii.lg      // 16
borderRadius: theme.radii.xl      // 20
borderRadius: theme.radii.card    // 24
borderRadius: theme.radii.pill    // 999
borderRadius: theme.radii.circle  // 9999
```

### 5. Using Elevation (Shadows)
```tsx
// Apply shadows
...theme.elevation.small
...theme.elevation.medium
...theme.elevation.large
...theme.elevation.xlarge

// Example
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    ...theme.elevation.medium,
  },
});
```

### 6. Using Component Tokens
```tsx
// Cards
<View style={theme.components.card}>
<View style={theme.components.cardElevated}>
<View style={theme.components.cardFlat}>

// Buttons
<TouchableOpacity style={theme.components.buttonPrimary}>
<TouchableOpacity style={theme.components.buttonSecondary}>
<TouchableOpacity style={theme.components.buttonOutlined}>

// Chips
<View style={theme.components.chip}>
<View style={theme.components.chipActive}>

// Text Input
<TextInput style={theme.components.textInput}>
```

### 7. Using Gradients
```tsx
import { LinearGradient } from 'expo-linear-gradient';

// Get gradient props
const gradientProps = theme.getLinearGradientProps('background');

<LinearGradient
  colors={gradientProps.colors}
  start={gradientProps.start}
  end={gradientProps.end}
>
  {children}
</LinearGradient>

// Or use GradientBackground component
import GradientBackground from '@/components/GradientBackground';

<GradientBackground gradientType="background">
  {children}
</GradientBackground>
```

## Creating Theme-Aware Styles

### Pattern 1: createStyles Function (Recommended)
```tsx
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    ...theme.components.card,
    marginHorizontal: theme.spacing.screenHorizontal,
  },
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
});
```

### Pattern 2: Inline Styles (for simple cases)
```tsx
<View style={[styles.staticStyle, { backgroundColor: theme.colors.surface }]}>
```

## Helper Functions

### hexToRgba
```tsx
const semiTransparent = theme.hexToRgba('#F9CF73', 0.5);
// Returns: 'rgba(249, 207, 115, 0.5)'
```

### withOpacity
```tsx
const transparent = theme.withOpacity(theme.colors.primary, 0.3);
```

### getShadow
```tsx
const cardShadow = theme.getShadow('medium');
```

### getSpacing
```tsx
const customSpacing = theme.getSpacing(2); // 2 * 8 = 16
```

## Full Component Example

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Heart } from 'lucide-react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export default function FeatureCard({ title, description, onPress }: FeatureCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Heart size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    ...theme.components.card,
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.circle,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
  },
});
```

## Theme Toggle (Dark Mode)

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Current: {themeMode}</Text>
    </TouchableOpacity>
  );
}
```

## Available Theme Properties

### `theme.colors`
- `background`, `surface`, `surfaceVariant`
- `primary`, `primaryDark`, `secondary`, `accent`
- `textPrimary`, `textSecondary`, `textTertiary`, `textLight`
- `success`, `danger`, `warning`, `info`
- `moodHappy`, `moodCalm`, `moodAngry`, `moodSad`, `moodNeutral`, `moodExcited`
- `moodPalette` (array for charts)
- `divider`, `border`, `borderLight`
- `icon`, `iconActive`, `iconInactive`

### `theme.typography`
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `bodyLarge`, `body`, `bodySmall`
- `caption`, `captionSmall`
- `button`, `label`, `overline`

### `theme.spacing`
- `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`
- `screenHorizontal`, `screenVertical`, `cardPadding`, `sectionGap`, `elementGap`, `chipGap`

### `theme.radii`
- `none`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`
- `card`, `pill`, `circle`, `button`, `chip`, `modal`, `bottomNav`

### `theme.elevation`
- `small`, `medium`, `large`, `xlarge`

### `theme.components`
- `card`, `cardElevated`, `cardFlat`
- `buttonPrimary`, `buttonSecondary`, `buttonOutlined`
- `textInput`, `textInputFocused`
- `chip`, `chipActive`
- `avatar.small`, `avatar.medium`, `avatar.large`
- `listItem`
- `bottomNav.container`, `bottomNav.item`, `bottomNav.itemActive`
- `moodCircle`

### `theme.gradients`
- `background`, `button`, `highlight`, `primary`, `card`
- `moodHappy`, `moodCalm`

## Best Practices

1. **Always use theme tokens** instead of hardcoded values
2. **Use createStyles pattern** for components with multiple styles
3. **Spread component tokens** first, then override specific properties
4. **Use semantic spacing** (screenHorizontal, sectionGap) when appropriate
5. **Test in both light and dark modes** to ensure colors work
6. **Use typography presets** for consistent text styling
7. **Apply elevation consistently** for visual hierarchy

## Migration Example

### Before (Hardcoded)
```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});
```

### After (Theme-aware)
```tsx
const createStyles = (theme: any) => StyleSheet.create({
  card: {
    ...theme.components.card,
  },
  title: {
    ...theme.typography.h4,
  },
});
```

---

For more details, see `themes/design.ts` and `THEME_IMPLEMENTATION_SUMMARY.md`.



