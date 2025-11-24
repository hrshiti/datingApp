# Simplified Matching Algorithm

## Overview
Algorithm ab sirf **onboarding data** use karta hai - coordinates/distance ki zarurat nahi hai.

---

## Algorithm Components (Total 100 points)

### 1. Last Active Status (15-20 points max)
- **Online** (last 5 min): 15 points + 5 boost = **20 points**
- **Recently Active** (last 30 min): 12 points + 5 boost = **17 points**
- **Active Today** (last 24 hours): 10 points + 5 boost = **15 points**
- **Active This Week** (last 7 days): Decay formula (0-15 points)
- **Offline**: 0 points

### 2. City Match (10 points max)
- **Same City**: +10 points
- **Different City**: +2 points (small bonus, no penalty)

### 3. Mutual Interests (25 points max) ⬆️ Increased
- Formula: `25 * (commonInterests / maxInterests)`
- Example: 3 common interests out of 3 = **25 points**
- Example: 2 common interests out of 5 = **10 points**

### 4. Age Preference Match (20 points) ⬆️ Increased
- **Within Age Range**: +20 points
- **Outside Age Range**: -5 points (small penalty, still show)
- **Empty Max Age**: Only checks min age (no max limit)

### 5. Profile Completeness (10 points max)
- Formula: `10 * (completionPercentage / 100)`
- Example: 100% complete = **10 points**
- Example: 80% complete = **8 points**

### 6. Personality Compatibility (15 points max) ⬆️ Increased
- Formula: `15 * (matchingTraits / 8)`
- 8 personality traits checked
- Example: 4 matching traits = **7.5 points**
- Example: 8 matching traits = **15 points**

### 6.5. Optional Info Match (5 points max) ✨ NEW
- **Education Match**: +2.5 points
- **Common Languages**: +1.25 points per common language
- Max: **5 points**

### 7. Dealbreakers Check (10 points or -20 penalty) ⬆️ Balanced
- **All Match**: +10 points
- **Some Match**: +5 points
- **Mismatch**: -20 points (reduced from -30)
- Checks: kids, smoking, pets, drinking

### 8. Premium Boost (10% boost)
- If premium user: `score * 1.1`
- Example: 50 points → **55 points**

### 9. New User Boost (+5 points)
- If created in last 7 days: +5 points

### 10. Photo Quality Boost (+3 points)
- If 6+ photos: +3 points

---

## Updated Algorithm Formula

```
Final Score = 
  (Last Active Score × 0-20) +
  (City Match × 0-10) +
  (Mutual Interests × 0-25) +
  (Age Match × 20 or -5) +
  (Profile Completeness × 0-10) +
  (Personality Match × 0-15) +
  (Optional Info × 0-5) +
  (Dealbreakers × 10 or -20) +
  (Premium Boost × 10%) +
  (New User Boost +5) +
  (Photo Quality Boost +3)

Capped at 100 points maximum
```

---

## Key Changes

### ✅ Removed:
- **Distance calculation** (coordinates-based)
- **Geospatial queries** ($near, $maxDistance)
- **Distance preference filtering**

### ✅ Added/Updated:
- **City-based matching** (simple string comparison)
- **Optional info matching** (education, languages)
- **Increased weights** for interests, age, personality
- **Balanced dealbreakers** (reduced penalty from -30 to -20)
- **Empty max age handling** (shows all ages above min)

---

## Example Match Score Calculation

### User Profile (Aditi):
- Age: 19, Looking For: Men, Age Range: 18-23
- Interests: Photography, Traveling, Karaoke
- City: Indore
- Personality: social, planning, romantic, morning, homebody, serious, decision, communication
- Dealbreakers: want-kids, smoker, have-pets, socially

### Match with Dummy User (Age 22, Male):
1. **Last Active**: 15 points (active today)
2. **City Match**: 2 points (different city)
3. **Interests**: 8 points (1 common out of 3)
4. **Age Match**: 20 points (within range)
5. **Completeness**: 9 points (90% complete)
6. **Personality**: 7 points (4 matching traits)
7. **Optional Info**: 2 points (common language)
8. **Dealbreakers**: 10 points (all match) or -20 (mismatch)
9. **New User**: 0 points (not new)
10. **Photos**: 0 points (4 photos, need 6+)

**Total**: ~63-73 points (if dealbreakers match) or ~33-43 points (if mismatch)

---

## Benefits

1. ✅ **No coordinates needed** - Simple city name matching
2. ✅ **Uses only onboarding data** - All fields from user input
3. ✅ **More matches** - No distance filtering
4. ✅ **Better scoring** - Increased weights for important factors
5. ✅ **Flexible age range** - Empty max age shows all ages above min

---

## Testing

Algorithm ab test karein:
1. Backend server restart karein
2. Discovery feed check karein
3. Match scores verify karein
4. City matching test karein



