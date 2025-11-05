# 🎨 Theme System Quick Reference

## Quick Start

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export default function MyComponent() {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
  });
  
  return <View style={styles.container}>...</View>;
}
```

---

## 🎯 Most Common Tokens

### Backgrounds
```typescript
theme.colors.background      // Main app background
theme.colors.surface          // Cards, modals
theme.colors.surfaceVariant   // Input fields, secondary cards
```

### Text
```typescript
theme.colors.textPrimary      // Headings, main content
theme.colors.textSecondary    // Descriptions, labels
theme.colors.textTertiary     // Placeholders, hints
```

### Borders & Dividers
```typescript
theme.colors.border           // Card borders, input outlines
theme.colors.divider          // Section dividers
```

### Semantic Colors
```typescript
theme.colors.primary          // Brand color, CTAs
theme.colors.success          // Positive actions
theme.colors.error            // Errors, destructive
theme.colors.warning          // Warnings, alerts
theme.colors.info             // Information, neutral
```

### Icons
```typescript
theme.colors.icon             // Default icon color
theme.colors.iconActive       // Active/selected icons
theme.colors.iconInactive     // Disabled icons
```

---

## 🌓 Dark Mode Patterns

### Semi-Transparent Overlays
```typescript
backgroundColor: theme.mode === 'dark' 
  ? 'rgba(77, 212, 172, 0.2)'  // 20% opacity
  : '#D1FAE5'                   // Solid color
```

### Conditional Styles
```typescript
{
  ...(theme.mode === 'dark' && {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.1,
  }),
}
```

---

## 🎨 Shadow System

```typescript
...theme.shadows.small        // Cards, buttons
...theme.shadows.medium       // Modals, elevated cards
...theme.shadows.large        // Floating elements
```

---

## 🔍 Common Replacements

| Hardcoded | Theme Token |
|-----------|-------------|
| `#FFFFFF` | `theme.colors.surface` |
| `#000000` | Use sparingly or `theme.colors.textPrimary` |
| `#F9FAFB` | `theme.colors.background` |
| `#F3F4F6` | `theme.colors.surfaceVariant` |
| `#1F2937` | `theme.colors.textPrimary` |
| `#6B7280` | `theme.colors.textSecondary` |
| `#9CA3AF` | `theme.colors.textTertiary` |
| `#E5E7EB` | `theme.colors.border` |

---

## ⚡ Pro Tips

1. **Always provide fallbacks** for optional colors:
   ```typescript
   backgroundColor: theme.colors.primary || '#34B27B'
   ```

2. **Use theme.mode for complex logic**:
   ```typescript
   color: theme.mode === 'dark' ? '#FFFFFF' : '#000000'
   ```

3. **Placeholder colors**:
   ```typescript
   placeholderTextColor={theme.colors.textTertiary}
   ```

4. **Test both modes** before committing!

---

## 🚫 Don't Do This

❌ Static styles outside component:
```typescript
const styles = StyleSheet.create({...});  // Can't access theme!

export default function Component() {
  const { theme } = useTheme();
  // ...
}
```

✅ Dynamic styles inside component:
```typescript
export default function Component() {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({...});  // ✅ Can access theme!
  // ...
}
```

---

## 📚 Full Documentation

See `THEME_REFACTOR_COMPLETE.md` for detailed migration guide.
