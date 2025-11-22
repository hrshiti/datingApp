# Profile Validation Fix

## Issues Fixed ✅

Fixed validation errors for personality fields in Profile model.

### Problems Identified:
1. **social**: Frontend sends `'social'` but backend only accepted `'introvert', 'extrovert', 'ambivert'`
2. **morning**: Frontend sends `'night'` but backend only accepted `'morning-person', 'night-owl', 'balanced'`
3. **homebody**: Frontend sends `'outgoing'` but backend only accepted `'homebody', 'adventurer', 'balanced'`
4. **decision**: Frontend sends `'quick'` but backend only accepted `'decisive', 'indecisive', 'balanced'`

### Solution:
Updated enum values in `Profile.model.js` to accept both old and new values for backward compatibility:

#### Updated Enums:

1. **social**:
   - Added: `'social'`
   - Kept: `'introvert', 'extrovert', 'ambivert'`

2. **morning**:
   - Added: `'morning', 'night'`
   - Kept: `'morning-person', 'night-owl', 'balanced'`

3. **homebody**:
   - Added: `'outgoing'`
   - Kept: `'homebody', 'adventurer', 'balanced'`

4. **decision**:
   - Added: `'quick', 'thoughtful'`
   - Kept: `'decisive', 'indecisive', 'balanced'`

### Frontend Values (from OnboardingPage.jsx):
- **social**: `'social'` or `'introvert'`
- **morning**: `'morning'` or `'night'`
- **homebody**: `'homebody'` or `'outgoing'`
- **decision**: `'quick'` or `'thoughtful'`

### File Updated:
- `src/models/Profile.model.js` - Personality enum values

### Testing:
Now the profile onboarding step 4 should work without validation errors when hitting:
```
PUT /api/profile/onboarding/4
```

