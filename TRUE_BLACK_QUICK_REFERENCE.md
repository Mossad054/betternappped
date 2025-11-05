# ⚫ True Black Mode - Visual Comparison

**Quick Reference Guide for Developers**

---

## 🎨 Color Palette - Copy & Paste

### Backgrounds (Pure Black System)
```typescript
// Main backgrounds
background: '#000000'              // Pure black (OLED perfect)
surface: '#0F0F0F'                // Elevated surface
surfaceVariant: '#1A1A1A'         // Modal/sheet background
cardElevated: '#252525'           // Premium elevation

// Gradient
dark: ['#000000', '#0A0A0A', '#1A1A1A']
```

### Text (Maximum Contrast)
```typescript
// Text colors
textPrimary: '#FFFFFF'            // Pure white (21:1 contrast)
textSecondary: '#EEEEEE'          // Near white (20.1:1)
textTertiary: '#CCCCCC'           // Light gray (14.8:1)
textLight: '#B3B3B3'              // Medium gray (10.2:1)

// Icons
icon: '#FFFFFF'                   // Pure white
iconInactive: '#999999'           // Muted gray
```

### Borders & Dividers
```typescript
border: 'rgba(255, 255, 255, 0.15)'
borderLight: 'rgba(255, 255, 255, 0.10)'
divider: 'rgba(255, 255, 255, 0.12)'
```

### Accents
```typescript
primary: '#FFB088'                // Coral
secondary: '#6EE7B7'              // Mint
success: '#00C853'                // Bright emerald
warning: '#FFB300'                // Bright amber
error: '#FF3D00'                  // Bright red
info: '#2196F3'                   // Bright blue
```

---

## 📊 Before & After Comparison

### Background Evolution
```
v1.0 (Original)     → #1C1C1E  (Charcoal)
v2.0 (Vibrant Dark) → #1A1D23  (Charcoal-blue)
v3.0 (True Black)   → #000000  (Pure black) ✓
```

### Text Evolution
```
v1.0 (Original)     → #E5E5E7  (Light gray)
v2.0 (Vibrant Dark) → #FAFAFA  (Soft white)
v3.0 (True Black)   → #FFFFFF  (Pure white) ✓
```

### Contrast Ratios
```
v1.0: 16.5:1 (AAA)
v2.0: 19.8:1 (AAA)
v3.0: 21:1   (AAA Maximum) ✓
```

---

## 🔧 Component Usage

### Standard Card
```tsx
<View style={{
  backgroundColor: '#0F0F0F',
  borderRadius: 28,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
}}>
  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
    Card Title
  </Text>
  <Text style={{ color: '#EEEEEE', fontWeight: '500' }}>
    Body text
  </Text>
</View>
```

### Intense Glow Button
```tsx
<Pressable style={{
  backgroundColor: '#FFB088',
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 32,
  shadowColor: '#FFB088',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 22,
  elevation: 12,
}}>
  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
    Primary Action
  </Text>
</Pressable>
```

### True Black Card (Theme Component)
```tsx
import { useTheme } from '@/contexts/ThemeContext';

<View style={theme.components.darkMode.trueBlack.cardDeep}>
  <Text style={{ color: theme.colors.textPrimary }}>
    Pure black card
  </Text>
</View>
```

---

## ⚡ OLED Benefits

### Battery Savings
- **Pure Black Pixels**: Turn off completely on OLED
- **Estimated Savings**: 30-40% vs light mode
- **Best Devices**: iPhone 12+, Samsung Galaxy S series

### Display Quality
- **Infinite Contrast**: Pure black vs bright white
- **No Backlight Bleed**: OLED pixels off = perfect black
- **Cooler Display**: Less heat from fewer active pixels

---

## ✅ Testing Quick Check

**Visual:**
- [ ] Background is pure black (#000000)
- [ ] Text is pure white (#FFFFFF) on headings
- [ ] Body text is near white (#EEEEEE)
- [ ] Cards have visible white borders
- [ ] Buttons glow intensely

**Functional:**
- [ ] No white flash on theme toggle
- [ ] Smooth scrolling (no lag from glows)
- [ ] Battery usage lower on OLED

**Device:**
- [ ] iPhone (OLED) - Test battery, check text clarity
- [ ] Android (AMOLED) - Test elevation rendering
- [ ] Dark room - Ensure not too harsh

---

## 🎯 Common Patterns

### List Item
```tsx
<View style={{
  backgroundColor: '#0F0F0F',
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
}}>
  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
    Title
  </Text>
  <Text style={{ color: '#CCCCCC', fontWeight: '500' }}>
    Subtitle
  </Text>
</View>
```

### Modal Overlay
```tsx
<View style={{
  backgroundColor: '#1A1A1A',
  borderRadius: 32,
  padding: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.15)',
}}>
  {/* Modal content */}
</View>
```

### Icon with Glow
```tsx
<View style={{
  shadowColor: '#6EE7B7',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 10,
}}>
  <Icon name="check" size={24} color="#FFFFFF" />
</View>
```

---

## 🚨 Watch Out For

### ❌ Avoid Pure White Backgrounds
```tsx
// DON'T - Too much white on black
<View style={{ backgroundColor: '#FFFFFF' }}>
```

### ✅ Use Elevated Black Instead
```tsx
// DO - Subtle elevation
<View style={{ backgroundColor: '#0F0F0F' }}>
```

### ❌ Avoid Too Many Glows
```tsx
// DON'T - Every element glowing
// Use glows sparingly (1-2 per screen)
```

### ✅ Selective Glow
```tsx
// DO - Only important CTAs glow
<Pressable style={{ 
  shadowColor: '#FFB088',
  shadowOpacity: 0.6,
  // ... only on primary button
}}>
```

---

## 💡 Pro Tips

1. **Pure White for Emphasis**: Use #FFFFFF only for headings and CTAs
2. **Near White for Body**: Use #EEEEEE for comfortable reading
3. **Border Everything**: On true black, borders are essential
4. **Glow for Focus**: Apply to 1-2 elements max per screen
5. **Test on OLED**: Looks different than LCD

---

**See `TRUE_BLACK_MODE.md` for complete documentation**
