# Activities Card Redesign - Design Specifications

## Extracted from Screenshots (Mobile App)

### Visual Design System

**Color Palette:**
- Primary accent: Teal/Cyan (#4DD4AC / #5CE1BF)
- Background: Dark (#0F0F0F / #1A1A1A)
- Card background: Slightly lighter dark (#252525 / #2A2A2A)
- Text primary: White (#FFFFFF)
- Text secondary: Light gray (#A0A0A0)
- Icon color: Teal (#4DD4AC)

**Typography:**
- Category headers: 16-18px, semi-bold, white
- Activity labels: 11-12px, regular, light gray
- Modal titles: 18-20px, semi-bold

**Spacing & Layout:**
- Category card padding: 16-20px
- Gap between categories: 12-16px
- Icon container size: 64px diameter (circular)
- Icon size: 28px
- Grid: 5 items per row on mobile
- Gap between icons: 12-16px horizontal, 16-20px vertical
- Corner radius: 16px (category cards), 50% (icon circles)

**Icon Style:**
- Outline/stroke style (not filled)
- Single color (teal)
- Centered in circular container
- Consistent stroke width (~2px)

---

## Activity Categories & Items

### 1. Beauty 💅
**Items:**
- haircut ✂️
- wellness 🧘
- massage 💆
- manicure 💅
- pedicure 🦶
- skin care 🧴
- spa 🛁

**Detail Fields:**
- Duration (min)
- Location/Salon name
- Cost (optional)
- Notes

---

### 2. Weather 🌤️
**Items:**
- sunny ☀️
- clouds ☁️
- rain 🌧️
- snow ❄️
- heat 🌡️
- storm ⛈️
- wind 💨

**Detail Fields:**
- Temperature
- Notes on how it affected you

---

### 3. Chores 🧺
**Items:**
- shopping 🛒
- cleaning 🧹
- cooking 🍳
- laundry 🧺

**Detail Fields (context-specific):**
- **Cooking:** meal type, duration, who cooked, recipe
- **Shopping:** items bought, budget, location
- **Cleaning:** areas cleaned, duration
- **Laundry:** loads done

---

### 4. Places 📍
**Items:**
- home 🏠
- work 💼
- school 🎓
- visit 👥
- travel 🚗
- gym 🏋️
- cinema 🎬
- nature 🏞️
- vacation ⛱️

**Detail Fields:**
- Duration
- Activity done there
- Mood/feeling
- Notes

---

### 5. Productivity ⚡
**Items:**
- start early ⏰
- make list ✅
- focus 🎯
- take a break ☕

**Detail Fields:**
- Duration
- Tasks completed
- Effectiveness (1-5 rating)
- Notes

---

### 6. Better Me 🌿
**Items:**
- meditation 🧘
- kindness 🤝
- listen 👂
- donate 💰

**Detail Fields (context-specific):**
- **Meditation:** duration, technique, guided/unguided
- **Kindness:** what you did, for whom
- **Listen:** podcast/audiobook name, duration
- **Donate:** amount, cause

---

## UI Components

### Category Card
```
┌──────────────────────────────────────┐
│ Beauty                     [+] [^]   │
│                                      │
│  ○     ○     ○     ○     ○          │
│ ✂️    🧘    💆    💅    🦶          │
│ cut  well  mass  mani  pedi         │
│                                      │
│       ○     ○                        │
│      🧴    🛁                        │
│     skin   spa                       │
└──────────────────────────────────────┘
```

### Activity Detail Modal (Slide-up on Mobile)
```
┌──────────────────────────────────────┐
│              Meditation         [X]  │
├──────────────────────────────────────┤
│                                      │
│ Duration (minutes)                   │
│ [  -  ] [  30  ] [  +  ]            │
│                                      │
│ Type                                 │
│ ⚪ Guided    ⚪ Unguided            │
│                                      │
│ Technique                            │
│ [Dropdown: Breathing, Body scan...] │
│                                      │
│ Notes (optional)                     │
│ [Text area]                          │
│                                      │
│         [Cancel]    [Save]           │
└──────────────────────────────────────┘
```

---

## Interaction Flow

1. **View Entry Screen** → Shows collapsed activity categories
2. **Tap Category** → Expands to show activity icons in grid
3. **Tap Activity Icon** → Opens detail modal (slide-up)
4. **Fill Details** → Optional fields, defaults provided
5. **Save** → Persists to DB, closes modal, updates entry
6. **Visual Feedback** → Selected activities show checkmark or tint

---

## Technical Requirements

### Responsive Behavior
- **Mobile (<640px):** 5 icons per row
- **Tablet (640-1024px):** 6-7 icons per row
- **Desktop (>1024px):** 8-10 icons per row

### Animation
- Modal entrance: slide-up from bottom (300ms ease-out)
- Category expand: smooth height animation (200ms)
- Icon tap: subtle scale (0.95) with haptic feedback

### Accessibility
- All icons have aria-labels
- Keyboard navigation support
- Focus indicators visible
- Touch targets minimum 44x44px

---

## Database Schema Considerations

Activities should store:
```typescript
interface ActivityLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  category: string; // "Beauty", "Weather", etc.
  activity: string; // "meditation", "cooking", etc.
  details: {
    duration?: number;
    intensity?: number;
    location?: string;
    cost?: number;
    technique?: string;
    meal_type?: string;
    // ... context-specific fields
  };
  notes?: string;
  created_at: timestamp;
}
```

---

## Removed from Current Design

❌ Large card-based activity items
❌ Nested expandable subcategories (flatten structure)
❌ Follow-up questions as separate UI (integrate into modal)
❌ Duration as inline input (move to modal)

## Added in New Design

✅ Circular icon grid (5 per row)
✅ Category expand/collapse with icons
✅ Unified detail modal pattern
✅ Context-aware form fields
✅ Weather tracking category
✅ Productivity category
✅ Better Me category

---

## Implementation Priority

1. **Phase 1:** Update data structure, create new categories
2. **Phase 2:** Build circular icon grid component
3. **Phase 3:** Create activity detail modal component
4. **Phase 4:** Wire up data persistence
5. **Phase 5:** Add animations and polish
6. **Phase 6:** Test and validate all flows
