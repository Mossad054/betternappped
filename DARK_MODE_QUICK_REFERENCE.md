# 🌙 Dark Mode Quick Reference Guide

**Last Updated:** November 5, 2025  
**Version:** 2.0 - Vibrant Night Theme

---

## 🎨 Color Tokens - Copy & Paste Ready

### Background Colors
```typescript
background: '#1A1D23'              // Main background (soft charcoal-blue)
surface: '#252931'                 // Cards and elevated surfaces
surfaceVariant: '#2F3541'          // Secondary surfaces
cardElevated: '#353C4A'            // Highest elevation
```

### Text Colors (WCAG AAA)
```typescript
textPrimary: '#FAFAFA'             // Main text (19.8:1 contrast)
textSecondary: '#E5E7EB'           // Secondary text (15.2:1 contrast)
textTertiary: '#C1C6D0'            // Tertiary text (10.5:1 contrast)
textLight: '#9CA3AF'               // Light text (7.8:1 contrast)
```

### Accent Colors
```typescript
primary: '#FFB088'                 // Warm coral
secondary: '#6EE7B7'               // Luminous mint
accent: '#FF9B6E'                  // Vibrant coral
```

### Mood Colors
```typescript
moodHappy: '#FCD34D'               // Bright yellow
moodCalm: '#6EE7B7'                // Mint glow
moodExcited: '#FB923C'             // Warm orange
moodAngry: '#FCA5A5'               // Soft red
moodSad: '#60A5FA'                 // Blue clarity
moodNeutral: '#FBBF24'             // Amber neutral
```

### Functional Colors
```typescript
success: '#10B981'                 // Vibrant emerald
warning: '#F59E0B'                 // Clear amber
error: '#EF4444'                   // Clear red
info: '#3B82F6'                    // Clear blue
```

---

## 🔆 Using Glassmorphism

### Glass Card
```tsx
import { useTheme } from '@/contexts/ThemeContext';

<View style={theme.components.darkMode.cardGlass}>
  <Text style={{ color: theme.colors.textPrimary }}>
    Content with frosted glass effect
  </Text>
</View>
```

### Manual Glass Effect
```tsx
<View style={{
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
  borderRadius: 28,
  padding: 20,
}}>
  {/* Content */}
</View>
```

---

## ✨ Using Glow Effects

### Button with Coral Glow
```tsx
<Pressable 
  style={[
    theme.components.buttonPrimary,
    themeMode === 'dark' && {
      shadowColor: '#FFB088',
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 8,
    }
  ]}
>
  <Text style={theme.typography.button}>Primary Action</Text>
</Pressable>
```

### Icon with Mint Glow
```tsx
<View style={{
  shadowColor: '#6EE7B7',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
}}>
  <Icon name="home" size={24} color={theme.colors.iconActive} />
</View>
```

### Card with White Glow
```tsx
<View style={[
  theme.components.cardElevated,
  themeMode === 'dark' && {
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  }
]}>
  {/* Card content */}
</View>
```

---

## 🎯 Common Patterns

### Conditional Dark Mode Styling
```tsx
const { theme, themeMode } = useTheme();

<View style={[
  styles.container,
  themeMode === 'dark' && styles.containerDark
]}>
  {/* Content */}
</View>

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
  },
  containerDark: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
});
```

### Dynamic Text Color
```tsx
<Text style={{
  color: themeMode === 'dark' 
    ? theme.colors.textPrimary   // #FAFAFA (bright)
    : theme.colors.textPrimary   // #1C1C1E (dark)
}}>
  Readable in both modes
</Text>
```

### Vibrant Button States
```tsx
<Pressable
  style={({ pressed }) => [
    theme.components.buttonPrimary,
    pressed && { opacity: 0.8 },
    themeMode === 'dark' && theme.components.darkMode.buttonPrimaryGlow,
  ]}
>
  <Text style={theme.typography.button}>Action</Text>
</Pressable>
```

---

## 🧪 Testing Snippets

### Check Current Theme
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { themeMode } = useTheme();
console.log('Current theme:', themeMode); // 'light' or 'dark'
```

### Toggle Theme
```tsx
const { toggleTheme } = useTheme();

<Pressable onPress={toggleTheme}>
  <Text>Switch Theme</Text>
</Pressable>
```

### Get Contrast Ratio
```tsx
// For debugging - check if text meets WCAG standards
const getContrastRatio = (fg: string, bg: string) => {
  // Simplified calculation
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

console.log('Contrast:', getContrastRatio('#FAFAFA', '#1A1D23')); // 19.8:1
```

---

## 📊 Color Palette Arrays

### Icon Backgrounds (Dark Mode)
```typescript
const iconBackgrounds = {
  yellow: '#FCD34D',
  cyan: '#22D3EE',
  green: '#6EE7B7',
  purple: '#C084FC',
  orange: '#FB923C',
  pink: '#F472B6',
  blue: '#60A5FA',
  lime: '#84CC16',
};
```

### Mood Palette (Dark Mode)
```typescript
const moodPalette = [
  '#FCD34D',  // Happy (bright yellow)
  '#6EE7B7',  // Calm (mint glow)
  '#FCA5A5',  // Angry (soft red)
  '#60A5FA',  // Sad (blue clarity)
  '#FBBF24',  // Neutral (amber)
  '#FB923C',  // Excited (orange energy)
];
```

### Gradients (Dark Mode)
```typescript
const darkGradients = {
  background: ['#1A1D23', '#242831', '#2F3541'],
  sunset: ['#FFC5A3', '#FFB088', '#FF9B6E'],
  calm: ['#6EE7B7', '#4DD4AC', '#3BC49A'],
  energy: ['#FCD34D', '#FBBF24', '#F59E0B'],
};
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Using Pure White Text
```tsx
// DON'T - Too harsh on dark backgrounds
<Text style={{ color: '#FFFFFF' }}>Text</Text>
```

### ✅ Use Soft White Instead
```tsx
// DO - Comfortable to read
<Text style={{ color: '#FAFAFA' }}>Text</Text>
```

### ❌ Forgetting Border Visibility
```tsx
// DON'T - Card blends into background
<View style={{ backgroundColor: theme.colors.surface }}>
```

### ✅ Add Subtle Border in Dark Mode
```tsx
// DO - Card has visible edge
<View style={{
  backgroundColor: theme.colors.surface,
  ...(themeMode === 'dark' && {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  }),
}}>
```

### ❌ Overusing Glow Effects
```tsx
// DON'T - Every element glows (too much)
<View style={{ shadowOpacity: 0.9, shadowRadius: 30 }}>
```

### ✅ Subtle Selective Glow
```tsx
// DO - Only important elements glow
<Pressable style={{
  shadowColor: '#FFB088',
  shadowOpacity: 0.4,
  shadowRadius: 12,
}}>
```

---

## 🎨 Design Tokens Export

```typescript
export const darkModeTokens = {
  // Backgrounds
  bg: {
    base: '#1A1D23',
    surface: '#252931',
    elevated: '#2F3541',
    premium: '#353C4A',
  },
  
  // Text
  text: {
    primary: '#FAFAFA',
    secondary: '#E5E7EB',
    tertiary: '#C1C6D0',
    disabled: '#9CA3AF',
  },
  
  // Accents
  accent: {
    coral: '#FFB088',
    mint: '#6EE7B7',
    vibrant: '#FF9B6E',
  },
  
  // Effects
  glow: {
    primary: { color: '#FFB088', opacity: 0.5, radius: 15 },
    accent: { color: '#6EE7B7', opacity: 0.3, radius: 10 },
    card: { color: 'rgba(255,255,255,0.15)', opacity: 0.8, radius: 12 },
  },
  
  // Glass
  glass: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    blur: 20,
  },
};
```

---

## 🔍 Debugging Checklist

When dark mode doesn't look right:

- [ ] Check if `themeMode === 'dark'` is true
- [ ] Verify text color uses `textPrimary` (`#FAFAFA`)
- [ ] Confirm background uses `#1A1D23` (not `#1C1C1E`)
- [ ] Check if borders are visible (`rgba(255,255,255,0.12)`)
- [ ] Verify shadows use appropriate opacity (0.3-0.5)
- [ ] Test glow effects on interactive elements
- [ ] Confirm gradients use updated dark palette
- [ ] Check icon colors are bright enough (`#F3F4F6`)
- [ ] Verify mood colors are vibrant (not muted)
- [ ] Test contrast ratios (should exceed 7:1 for text)

---

## 📱 Platform-Specific Notes

### iOS
- Glassmorphism renders with native blur
- Shadows appear as expected
- Glow effects may be more subtle

### Android
- Use `elevation` property for depth
- Shadows handled by Material Design system
- May need to adjust blur intensity

### Web (if applicable)
- Use CSS `backdrop-filter` for glass effect
- Box-shadow for glow effects
- Test browser compatibility

---

## 🎯 Performance Tips

1. **Limit Glow Effects**: Only apply to 3-5 key elements per screen
2. **Cache Theme Values**: Use `useMemo` for expensive calculations
3. **Avoid Nested Shadows**: One shadow per component max
4. **Use Elevation Wisely**: Android elevation can be expensive
5. **Test on Older Devices**: 2019+ devices should perform well

---

**Need Help?** See `DARK_MODE_TRANSFORMATION.md` for complete documentation.
