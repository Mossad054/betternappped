# Activities Redesign - Implementation Plan

## Overview
Transform the activities system from card-based to circular icon grid matching the design screenshots, with context-aware detail modals.

## Current State Analysis

**Existing Files:**
- `app/(tabs)/journal.tsx` - Main entry creation screen
- `services/activities.service.ts` - Database service for activities
- Data stored in `activities` table

**Issues Identified:**
1. Large card-based UI doesn't match screenshots
2. Inline follow-up questions instead of modal
3. Missing activity detail modal
4. Limited activity categories (missing Weather, Productivity)
5. No icon mapping system

## Implementation Phases

### Phase 1: Data Structure (COMPLETED ✓)
- [x] Updated activity categories in journal.tsx
- [x] Created activityIcons.tsx with icon mapping
- [x] Created ACTIVITIES_REDESIGN_SPECS.md documentation

### Phase 2: UI Components (IN PROGRESS)
Need to create:

**2a. ActivityIconGrid Component**
```typescript
// components/ActivityIconGrid.tsx
// Renders 5 icons per row in circular containers
// Props: items[], onSelect, selectedIds[]
```

**2b. ActivityDetailModal Component**
```typescript
// components/ActivityDetailModal.tsx
// Slide-up modal with context-aware fields
// Props: activity, onSave, onCancel, visible
```

**2c. Update journal.tsx Activities Section**
- Replace current card-based rendering
- Use ActivityIconGrid for each category
- Trigger ActivityDetailModal on icon tap

### Phase 3: Modal Logic
**Context-Aware Fields per Activity:**
- Beauty → duration, location, cost, notes
- Weather → temperature, notes
- Cooking → meal type, duration, recipe
- Meditation → duration, technique (guided/unguided)
- etc.

### Phase 4: Data Persistence
**Update ActivitiesService:**
- Ensure `details` field can store JSON
- Add fields: intensity, location, cost, meal_type, technique
- Migration if needed

### Phase 5: Routing Audit
**Check these files:**
- `app/(tabs)/journal.tsx` - Entry creation
- `app/add-entry.tsx` - Duplicate?
- Any "Log Entry" buttons
- Intimacy hub button routing

### Phase 6: Testing
- [ ] Category expand/collapse
- [ ] Icon selection
- [ ] Modal opens with correct fields
- [ ] Data saves to DB
- [ ] Calendar updates
- [ ] All routes work correctly

## File Changes Required

### New Files
1. `components/ActivityIconGrid.tsx`
2. `components/ActivityDetailModal.tsx`
3. `constants/activityIcons.tsx` ✓
4. `ACTIVITIES_REDESIGN_SPECS.md` ✓

### Modified Files
1. `app/(tabs)/journal.tsx` - Replace activities UI
2. `services/activities.service.ts` - Add details field support
3. `database/schema.ts` - Update if needed
4. `changes.md` - Log all changes
5. `impacts.md` - Document impacts

## Next Steps

1. **Create ActivityIconGrid component** with circular icon layout
2. **Create ActivityDetailModal** with slide-up animation
3. **Update journal.tsx** to use new components
4. **Test data flow** end-to-end
5. **Audit routing** and fix broken links
6. **Polish animations** and accessibility

## Complexity Assessment

**High Complexity Items:**
- Modal with dynamic form fields based on activity type
- Ensuring data compatibility with existing DB schema
- Routing audit across entire app

**Medium Complexity:**
- Icon grid component
- Modal slide-up animation
- Activity icon mapping

**Low Complexity:**
- Updating activity data structure
- Documentation

## Estimated Effort
- Total: 8-12 hours of focused development
- Phase 2-3 (UI): 4-5 hours
- Phase 4 (Data): 2-3 hours
- Phase 5-6 (Testing): 2-4 hours

## Risk Mitigation
1. **Data Loss Risk:** Backup existing activities before schema changes
2. **Breaking Changes:** Keep old structure until new is fully tested
3. **User Confusion:** Add tooltips/hints in new UI
4. **Performance:** Lazy load icons, optimize modal rendering

## Success Criteria
✅ Activities render in circular icon grid (5 per row)
✅ Category expand/collapse works smoothly
✅ Modal opens with relevant fields per activity
✅ Data saves correctly with all details
✅ No routing errors
✅ Passes accessibility checks
✅ Matches screenshot design

---

## Current Progress
- Phase 1: 100% ✓
- Phase 2: 10% (icon mapping done, need components)
- Phase 3: 0%
- Phase 4: 0%
- Phase 5: 0%
- Phase 6: 0%

**Overall: ~15% complete**
