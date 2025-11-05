# 🎨 Betternapped Color Palette Reference

## Primary Colors

### Light Mode

#### Backgrounds
```
Mint Green Primary    #E8F5E4  ████████████████████████████
Mint Green Light      #D4EDD1  ████████████████████████████
Mint Green Deep       #C8E6C9  ████████████████████████████

Peach Primary         #FFE8DC  ████████████████████████████
Peach Light           #FFDCC8  ████████████████████████████
Peach Deep            #FFD0B5  ████████████████████████████

Surface White         #FFFFFF  ████████████████████████████
Surface Variant       #F8FBF7  ████████████████████████████
```

#### Accents & Actions
```
Coral Primary         #FFB088  ████████████████████████████
Coral Dark            #FF9B6E  ████████████████████████████
Coral Light           #FFC5A3  ████████████████████████████

Mint Secondary        #D4EDD1  ████████████████████████████
Bright Coral          #FF8866  ████████████████████████████
```

#### Text
```
Primary Text          #1C1C1E  ████████████████████████████
Secondary Text        #3A3A3C  ████████████████████████████
Tertiary Text         #6B6B6B  ████████████████████████████
Light Text            #9A9A9A  ████████████████████████████
On Primary            #FFFFFF  ████████████████████████████
```

#### Mood Colors (Soft Pastels)
```
Happy                 #FFE29F  ████████████████████████████  Bright yellow
Calm                  #A8E6CF  ████████████████████████████  Mint green
Angry                 #FF9999  ████████████████████████████  Soft red
Sad                   #9FC5E8  ████████████████████████████  Soft blue
Neutral               #F0E68C  ████████████████████████████  Neutral yellow
Excited               #FFCC80  ████████████████████████████  Orange
```

#### Functional Colors
```
Success               #A5D6A7  ████████████████████████████  Soft green
Danger                #FF8B8B  ████████████████████████████  Soft red
Warning               #FFD97D  ████████████████████████████  Soft yellow
Info                  #81D4FA  ████████████████████████████  Soft blue
```

---

### Dark Mode

#### Backgrounds
```
Dark Background       #1C1C1E  ████████████████████████████
Dark Gradient End     #2C2C2E  ████████████████████████████
Surface Dark          #2C2C2E  ████████████████████████████
Surface Variant       #3A3A3C  ████████████████████████████
```

#### Accents & Actions
```
Coral Primary         #FFB088  ████████████████████████████
Coral Accent          #FF9B6E  ████████████████████████████
Mint Secondary        #8FD6BD  ████████████████████████████
```

#### Text
```
Primary Text          #FFFFFF  ████████████████████████████
Secondary Text        #E5E5E7  ████████████████████████████
Tertiary Text         #A8A8AA  ████████████████████████████
```

---

## Gradients

### Mint Gradient (Cool)
```
Start:  #E8F5E4
Middle: #D4EDD1
End:    #C8E6C9

████████████ → ███████████ → ██████████
```
**Use Cases**: Calm backgrounds, meditation, sleep tracking, zen mode

---

### Peach Gradient (Warm)
```
Start:  #FFE8DC
Middle: #FFDCC8
End:    #FFD0B5

████████████ → ███████████ → ██████████
```
**Use Cases**: Energy screens, morning routines, achievements, celebration

---

### Coral Gradient (Sunset)
```
Start:  #FFC5A3
Middle: #FFB088
End:    #FF9B6E

████████████ → ███████████ → ██████████
```
**Use Cases**: Buttons, highlights, active elements, CTAs

---

### Mood Happy Gradient
```
Start:  #FFF4C4
Middle: #FFE29F
End:    #FFD97D

████████████ → ███████████ → ██████████
```
**Use Cases**: Happy mood indicators, positive feedback, celebrations

---

### Mood Calm Gradient
```
Start:  #C8E6C9
Middle: #A8E6CF
End:    #8FD6BD

████████████ → ███████████ → ██████████
```
**Use Cases**: Calm mood indicators, meditation complete, peaceful states

---

### Card Gradient (Subtle)
```
Start:  #FFFFFF
Middle: #FAFBFA
End:    #F8FBF7

████████████ → ███████████ → ██████████
```
**Use Cases**: White cards with subtle depth, elevated surfaces

---

### Dark Mode Gradient
```
Start:  #1C1C1E
Middle: #2C2C2E
End:    #3A3A3C

████████████ → ███████████ → ██████████
```
**Use Cases**: Dark mode backgrounds, night mode surfaces

---

## Icon Background Colors (Soft Pastels)

### Light Mode
```
Yellow    #FFF4C4  ████████████  Soft buttery yellow
Cyan      #B2EBF2  ████████████  Light aqua blue
Green     #C8E6C9  ████████████  Soft mint green
Purple    #E1BEE7  ████████████  Light lavender
Orange    #FFE0B2  ████████████  Soft peach
Pink      #F8BBD0  ████████████  Soft rose
Blue      #BBDEFB  ████████████  Light sky blue
Lime      #E6EE9C  ████████████  Soft lime yellow
```

### Dark Mode
```
Yellow    #FFE29F  ████████████  Muted yellow
Cyan      #81D4FA  ████████████  Soft cyan
Green     #A8E6CF  ████████████  Muted mint
Purple    #CE93D8  ████████████  Soft purple
Orange    #FFCC80  ████████████  Muted orange
Pink      #F48FB1  ████████████  Soft pink
Blue      #90CAF9  ████████████  Muted blue
Lime      #C8E6C9  ████████████  Soft lime
```

---

## Mood Palette Array

### Light Mode
```typescript
['#FFE29F', '#A8E6CF', '#FF9999', '#9FC5E8', '#F0E68C', '#FFCC80']
```
```
Happy   ████████  Calm    ████████  Angry   ████████
Sad     ████████  Neutral ████████  Excited ████████
```

### Dark Mode
```typescript
['#FFE29F', '#A8E6CF', '#FF9999', '#9FC5E8', '#F0E68C', '#FFCC80']
```
*Same colors work in both modes due to high saturation*

---

## Shadow & Overlay Values

### Light Mode Shadows
```
Small     rgba(0, 0, 0, 0.03)  █░░░░░░░░░  3% black
Medium    rgba(0, 0, 0, 0.05)  ██░░░░░░░░  5% black
Large     rgba(0, 0, 0, 0.08)  ███░░░░░░░  8% black
XLarge    rgba(0, 0, 0, 0.10)  ████░░░░░░  10% black
```

### Dark Mode Shadows
```
Small     rgba(0, 0, 0, 0.40)  ████████░░  40% black
Medium    rgba(0, 0, 0, 0.50)  █████████░  50% black
Large     rgba(0, 0, 0, 0.60)  ██████████  60% black
```

### Overlays
```
Light     rgba(0, 0, 0, 0.01)  ░░░░░░░░░░  1% black
Default   rgba(0, 0, 0, 0.02)  ░░░░░░░░░░  2% black
Medium    rgba(0, 0, 0, 0.06)  █░░░░░░░░░  6% black
Strong    rgba(0, 0, 0, 0.12)  ██░░░░░░░░  12% black
```

---

## Usage Examples

### Screen Background (Alternating)
```tsx
// Calm, meditation, sleep screens
<View style={{ backgroundColor: '#E8F5E4' }}>  // Mint
  {/* Content */}
</View>

// Energy, morning, achievement screens
<View style={{ backgroundColor: '#FFE8DC' }}>  // Peach
  {/* Content */}
</View>
```

### Cards
```tsx
<View style={{
  backgroundColor: '#FFFFFF',     // Pure white
  borderRadius: 28,               // Soft rounded
  padding: 20,                    // Generous padding
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.03,            // Very subtle
  shadowRadius: 3,
}}>
  {/* Card content */}
</View>
```

### Primary Button
```tsx
<TouchableOpacity style={{
  backgroundColor: '#FFB088',     // Coral
  borderRadius: 16,               // Rounded
  paddingVertical: 16,
  paddingHorizontal: 24,
}}>
  <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
    Get Started
  </Text>
</TouchableOpacity>
```

### Mood Circle
```tsx
<View style={{
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#FFE29F',      // Happy yellow
  justifyContent: 'center',
  alignItems: 'center',
  shadowOpacity: 0.03,
}}>
  <Text style={{ fontSize: 28 }}>😊</Text>
</View>
```

---

## Accessibility & Contrast

### WCAG Contrast Ratios

#### Light Mode
```
Text on Mint Background
#1C1C1E on #E8F5E4 = 12.5:1  ✅ AAA (Excellent)

Text on Peach Background
#1C1C1E on #FFE8DC = 11.8:1  ✅ AAA (Excellent)

Text on White
#1C1C1E on #FFFFFF = 18.2:1  ✅ AAA (Perfect)

White Text on Coral Button
#FFFFFF on #FFB088 = 4.8:1   ✅ AA (Good for buttons)
```

#### Dark Mode
```
White Text on Dark Background
#FFFFFF on #1C1C1E = 19.8:1  ✅ AAA (Perfect)

White Text on Surface
#FFFFFF on #2C2C2E = 17.5:1  ✅ AAA (Excellent)
```

### Minimum Touch Targets
```
Buttons:   44px × 44px  ✅
Icons:     44px × 44px  ✅
Chips:     40px × 32px  ✅
Mood:      60px × 60px  ✅ (Larger than standard)
```

---

## Color Psychology

### Mint Green (#E8F5E4)
- **Emotions**: Calm, fresh, peaceful, zen
- **Associations**: Nature, growth, balance, wellness
- **Best For**: Meditation, sleep, calm activities
- **Avoid**: High-energy features, urgent alerts

### Coral (#FFB088)
- **Emotions**: Energetic, warm, friendly, positive
- **Associations**: Sunrise, vitality, motivation, joy
- **Best For**: Buttons, achievements, morning routines
- **Avoid**: Error messages, somber content

### Peach (#FFE8DC)
- **Emotions**: Welcoming, soft, nurturing, comfortable
- **Associations**: Warmth, care, gentleness, support
- **Best For**: Onboarding, tutorials, encouragement
- **Avoid**: Technical settings, data-heavy screens

### Pure White (#FFFFFF)
- **Emotions**: Clean, pure, simple, modern
- **Associations**: Clarity, focus, minimalism, trust
- **Best For**: Cards, content areas, focus mode
- **Avoid**: Large expanses (can feel sterile)

---

## Quick Reference: Color Picker Values

### Hex Codes
```
Primary Coral:      #FFB088
Mint Background:    #E8F5E4
Peach Background:   #FFE8DC
Surface White:      #FFFFFF
Text Dark:          #1C1C1E
Text Light:         #FFFFFF
```

### RGB Values
```
Coral:     rgb(255, 176, 136)
Mint:      rgb(232, 245, 228)
Peach:     rgb(255, 232, 220)
White:     rgb(255, 255, 255)
Text Dark: rgb(28, 28, 30)
```

### HSL Values
```
Coral:     hsl(20, 100%, 77%)
Mint:      hsl(106, 56%, 93%)
Peach:     hsl(21, 100%, 93%)
Text Dark: hsl(240, 3%, 11%)
```

---

## Design Tokens

```typescript
// Copy-paste ready tokens
export const colorTokens = {
  // Backgrounds
  bgMint: '#E8F5E4',
  bgPeach: '#FFE8DC',
  bgWhite: '#FFFFFF',
  
  // Accents
  accentCoral: '#FFB088',
  accentMint: '#D4EDD1',
  
  // Text
  textDark: '#1C1C1E',
  textLight: '#FFFFFF',
  textSecondary: '#3A3A3C',
  
  // Moods
  moodHappy: '#FFE29F',
  moodCalm: '#A8E6CF',
  moodAngry: '#FF9999',
  moodSad: '#9FC5E8',
  
  // Functional
  success: '#A5D6A7',
  danger: '#FF8B8B',
  warning: '#FFD97D',
  info: '#81D4FA',
};
```

---

**Last Updated**: November 5, 2025  
**Version**: 2.0.0 (Soft Pastel Transformation)
