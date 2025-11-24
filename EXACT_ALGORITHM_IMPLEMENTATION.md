# Exact Algorithm Implementation

## Overview
Algorithm ab exact specification ke according implement ho gaya hai.

---

## Algorithm Steps

### STEP 1: Exclude Users

Do NOT show users who are:
- ✅ Already liked by U
- ✅ Already disliked (passed) by U
- ✅ Already matched with U
- ✅ Blocked (if feature exists)
- ✅ Incomplete profile (< 60% completion)

**Implementation:**
```javascript
const likedUserIds = interactions.filter(i => i.type === 'like').map(i => i.toUser);
const dislikedUserIds = interactions.filter(i => i.type === 'pass').map(i => i.toUser);
const matchedUserIds = matches.flatMap(m => m.users.filter(u => u.toString() !== userId.toString()));

const excludedUserIds = [
  userId,
  ...likedUserIds,
  ...dislikedUserIds,
  ...matchedUserIds
];

query.completionPercentage = { $gte: 60 };
```

---

### STEP 2: Filter by Preferences

**Gender Preference:**
- Show only users whose gender fits U's "lookingFor" preference
- `men` → `male`
- `women` → `female`
- `everyone` → `['male', 'female', 'other']`

**Age Preference:**
- Include only users whose age is between:
  - `U.ageRange.min <= candidate.age <= U.ageRange.max`
  - If max is empty, only check min age

**Distance Preference:**
- Distance must be ≤ U.distancePref (default 25 km)
- Uses MongoDB geospatial query with `$near` and `$maxDistance`

**Implementation:**
```javascript
// Gender filter
query.gender = { $in: targetGenders };

// Age filter
query.age = {
  $gte: Number(userProfile.ageRange.min),
  $lte: Number(userProfile.ageRange.max)
};

// Distance filter
query['location.coordinates'] = {
  $near: {
    $geometry: {
      type: 'Point',
      coordinates: coordinates
    },
    $maxDistance: distancePref * 1000 // Convert km to meters
  }
};
```

---

### STEP 3: Score Each Candidate

**Formula:**
```
finalScore = distanceScore + activeScore + profileScore + mutualInterestScore + ageScore
```

#### (A) Distance Score (30 points max)
```
distanceScore = (maxDistance - distance) / maxDistance * 30
```

- If `distance <= maxDistance`: Calculate score
- If `distance > maxDistance`: 0 points
- If no coordinates: Use city-based matching (same city = 25, different = 10)

**Example:**
- Distance: 10 km, Max: 25 km
- Score: `(25 - 10) / 25 * 30 = 18 points`

#### (B) Last Active Score (20 points max)
```
activeScore = (1 / hoursSinceActive) * 20
```

**Tiers:**
- **Online** (≤ 5 min): 20 points
- **Recently Active** (≤ 30 min): 18 points
- **Active 1h ago**: 15 points
- **Active 1 day**: `(1 / hoursSinceActive) * 20` (min 5)
- **Active 1 week**: `(1 / hoursSinceActive) * 20` (min 2)
- **Offline** (> 1 week): 0 points

#### (C) Profile Completeness Score (20 points max)
```
profileScore = candidate.profileCompleted * 0.2
```

- 100% complete = 20 points
- 80% complete = 16 points
- 60% complete = 12 points

#### (D) Mutual Interests Score (20 points max)
```
mutualInterestScore = min(mutualInterests, 5) * 4
```

- Max 5 interests counted
- Each interest = 4 points
- Example: 3 common interests = 12 points
- Example: 5+ common interests = 20 points

#### (E) Age Compatibility Score (10 points)
```
if candidate.age in U.ageRange:
    ageScore = 10
else:
    ageScore = 0
```

- Within age range: 10 points
- Outside age range: 0 points

---

### STEP 4: Sort

```javascript
profilesWithScores.sort((a, b) => b.matchScore - a.matchScore);
```

Sort by `finalScore` in **descending order** (highest first).

---

### STEP 5: Return Results

**For Discovery Feed:**
- Return paginated results (after sorting)
- Show top matches first

**For Next User:**
- Return only the **top 1 user** (best match)

---

## Swipe System

### Swipe Left (Dislike/Pass)

1. Add candidate ID to `U.swipes.disliked` (or `Interaction` with type `'pass'`)
2. Nothing else happens
3. User won't see this profile again

**Implementation:**
```javascript
await Interaction.create({
  fromUser: userId,
  toUser: targetUserId,
  type: 'pass'
});
```

### Swipe Right (Like)

**Step 1:** Add to `U.swipes.liked` (or `Interaction` with type `'like'`)

**Step 2:** Check if candidate already liked U
```javascript
const existingLike = await Interaction.findOne({
  fromUser: targetUserId,
  toUser: userId,
  type: 'like'
});
```

**Step 3:** If Match
- Add each other to `matched[]`
- Remove from `liked/disliked` lists if present
- Create `Match` document
- Send notification (optional)
- Create chat room (optional)

**Match Logic:**
```
if U likes C AND C already liked U:
    → It's a MATCH!
    → U.matched.push(C)
    → C.matched.push(U)
```

---

## Example Score Calculation

### User Profile (U):
- Age Range: 18-23
- Distance Pref: 25 km
- Interests: Photography, Traveling, Karaoke
- Location: Indore (coordinates available)

### Candidate Profile (C):
- Age: 22
- Distance: 15 km
- Last Active: 2 hours ago
- Profile Complete: 90%
- Interests: Photography, Music, Traveling
- Location: Indore

### Score Calculation:

1. **Distance Score:**
   - `(25 - 15) / 25 * 30 = 12 points`

2. **Last Active Score:**
   - `(1 / 2) * 20 = 10 points`

3. **Profile Completeness:**
   - `90 * 0.2 = 18 points`

4. **Mutual Interests:**
   - Common: Photography, Traveling (2 interests)
   - `min(2, 5) * 4 = 8 points`

5. **Age Compatibility:**
   - 22 is in range 18-23: `10 points`

**Final Score: 12 + 10 + 18 + 8 + 10 = 58 points**

---

## Key Changes Made

### ✅ Updated Scoring Function
- Replaced complex algorithm with exact 5-component formula
- Distance: 30 points (was removed, now back)
- Active: 20 points (simplified formula)
- Completeness: 20 points (direct percentage)
- Interests: 20 points (max 5 interests)
- Age: 10 points (binary: in range or not)

### ✅ Updated Exclusion Logic
- Separate `liked`, `disliked`, `matched` arrays
- Filter by completion percentage (≥ 60%)

### ✅ Updated Filtering
- Gender preference filter
- Age range filter (handles empty max)
- Distance preference filter (geospatial query)

### ✅ Updated Sorting
- Score all candidates first
- Sort by score (DESC)
- Apply pagination after sorting

### ✅ Updated Return Logic
- Discovery feed: Paginated results
- Next user: Top 1 only

---

## Testing Checklist

- [ ] Exclude already liked users
- [ ] Exclude already disliked users
- [ ] Exclude matched users
- [ ] Exclude incomplete profiles (< 60%)
- [ ] Filter by gender preference
- [ ] Filter by age range
- [ ] Filter by distance preference
- [ ] Calculate distance score correctly
- [ ] Calculate active score correctly
- [ ] Calculate completeness score correctly
- [ ] Calculate mutual interests score correctly
- [ ] Calculate age compatibility score correctly
- [ ] Sort by score (highest first)
- [ ] Return top user for next-user endpoint
- [ ] Handle match detection on like
- [ ] Create match document on mutual like

---

## Files Updated

1. **`backend/src/controllers/discovery.controller.js`**
   - `calculateMatchScore()` - Updated to exact formula
   - `getDiscoveryFeed()` - Updated exclusion, filtering, scoring, sorting
   - `getNextUser()` - Updated exclusion, filtering, scoring, sorting
   - `likeProfile()` - Already handles match detection
   - `passProfile()` - Already handles dislike

---

## Next Steps

1. Test the algorithm with dummy data
2. Verify match detection works
3. Check distance calculations
4. Verify active status scoring
5. Test with incomplete profiles (< 60%)



