# Palette-Based Border Colors Implementation

**Date:** 2025-01-XX  
**Status:** ✅ Complete

## Overview
All card borders now dynamically match the selected color palette's accent color. Previously, all cards had hardcoded yellow (#FFD700) borders regardless of the selected theme.

## Changes Made

### 1. ThemeContext.tsx
**Location:** `contexts/ThemeContext.tsx`

Added `getCustomComponents()` function that dynamically creates card components with the selected palette's accent color:

```typescript
const getCustomComponents = useCallback(() => {
  const customColors = getCustomColors();
  const baseComponents = designSystem.components;
  
  // Override card components with palette accent color for borders
  return {
    ...baseComponents,
    card: {
      ...baseComponents.card,
      borderColor: customColors.accent,
    },
    cardElevated: {
      ...baseComponents.cardElevated,
      borderColor: customColors.accent,
    },
    cardFlat: {
      ...baseComponents.cardFlat,
      borderColor: customColors.accent,
    },
    // Override dark mode card variants
    darkMode: {
      ...baseComponents.darkMode,
      cardGlass: {
        ...baseComponents.darkMode.cardGlass,
        borderColor: customColors.accent,
      },
      cardElevatedGlow: {
        ...baseComponents.darkMode.cardElevatedGlow,
        borderColor: customColors.accent,
      },
      trueBlack: {
        ...baseComponents.darkMode.trueBlack,
        cardDeep: {
          ...baseComponents.darkMode.trueBlack.cardDeep,
          borderColor: customColors.accent,
        },
        surfaceElevated: {
          ...baseComponents.darkMode.trueBlack.surfaceElevated,
          borderColor: customColors.accent,
        },
      },
    },
  };
}, [getCustomColors]);
```

Updated theme object creation to use `getCustomComponents()` instead of static `designSystem.components`.

### 2. home.tsx
**Location:** `app/(tabs)/home.tsx`

- Removed hardcoded `borderColor: '#FFD700'` from static styles
- Added `borderColor: theme.colors.accent` to all inline card styles:
  - Today's Snapshot card
  - Weekly Overview card
  - Impact Analysis card
  - AI Recommendations card
  - Debug Info card
  - Success Message card
  - SkeletonCard component
  - EmptyStateCard component

### 3. design.ts
**Location:** `themes/design.ts`

No changes needed - static yellow borders remain as fallback, but are overridden by ThemeContext.

## How It Works

1. **Color Palette Selection**: User selects a color palette (e.g., Forest Green, Warm Sunset, etc.)
2. **Theme Context**: `ThemeContext` detects the selected palette via `colorPalette` state
3. **Dynamic Components**: `getCustomComponents()` creates card components with the palette's accent color
4. **Render**: All cards automatically use the dynamic border color from `theme.colors.accent`

## Palette Examples

| Palette | Accent Color (Light) | Accent Color (Dark) |
|---------|---------------------|---------------------|
| Default | #FF8866 (Coral) | #FF9B6E (Light Coral) |
| Warm Sunset | #EC4899 (Pink) | #F472B6 (Light Pink) |
| Nature/Forest Green | #CA8A04 (Gold) | #EAB308 (Yellow) |
| Deep Forest | #65A30D (Lime) | #84CC16 (Bright Lime) |
| Pastel | #FB7185 (Rose) | #FDA4AF (Light Rose) |
| Lavender | #D946EF (Magenta) | #E879F9 (Light Magenta) |

## Testing

To test the implementation:
1. Go to app settings/themes
2. Select different color palettes (Forest Green, Warm Sunset, etc.)
3. Verify all card borders change to match the palette's accent color
4. Test in both light and dark modes
5. Verify the change persists across app restarts

## Benefits

✅ Visual consistency with selected theme  
✅ Better brand cohesion across the app  
✅ Enhanced user experience with personalized colors  
✅ Automatic dark mode support  
✅ Easy to extend to other components

## Related Files

- `themes/colorPalettes.ts` - Color palette definitions
- `contexts/ThemeContext.tsx` - Theme management
- `app/(tabs)/home.tsx` - Home screen with cards
- `components/HabitCard.tsx` - Habit cards (inherits from theme)
- `themes/design.ts` - Design system (static fallback)

## Notes

- The default palette uses coral/orange accent (#FF8866 light, #FF9B6E dark)
- Forest green palette uses gold/lime accents (#CA8A04 light, #EAB308 dark)
- All changes are backwards compatible
- No database migrations required
- Works in guest mode
