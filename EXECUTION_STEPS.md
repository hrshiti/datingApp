# Matching Algorithm Implementation - Execution Steps

## Prerequisites
- Backend server running
- Frontend server running
- MongoDB connected
- Database cleared (optional: `npm run clear-db`)

---

## Phase 1: Backend Algorithm Enhancement

### Step 1.1: Add Last Active Status Helper Function
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Add `checkUserActiveStatus` function after `calculateDistance` function
**Location:** After line 16 (after calculateDistance function)
**Code:** Copy from plan section 1.1

### Step 1.2: Update calculateMatchScore Function
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Replace entire `calculateMatchScore` function (lines 18-96)
**Code:** Copy from plan section 1.2
**Note:** This is a complete replacement, includes all 10 scoring components

### Step 1.3: Update lastActiveAt in likeProfile
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Add `lastActiveAt` update at start of `likeProfile` function
**Location:** After line 268 (`const userId = req.user._id;`)
**Code:**
```javascript
await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
```

### Step 1.4: Update lastActiveAt in passProfile
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Add `lastActiveAt` update at start of `passProfile` function
**Location:** After line 375 (`const userId = req.user._id;`)
**Code:**
```javascript
await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
```

### Step 1.5: Update lastActiveAt in getDiscoveryFeed
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Add `lastActiveAt` update at start of `getDiscoveryFeed` function
**Location:** After line 103 (`const userId = req.user._id;`)
**Code:**
```javascript
await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
```

### Step 1.6: Update getDiscoveryFeed Response
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Update `profilesWithScores` mapping to include `activeStatus`
**Location:** Replace lines 219-236
**Code:** Copy from plan section 1.4

### Step 1.7: Create getNextUser Function
**File:** `backend/src/controllers/discovery.controller.js`
**Action:** Add new `getNextUser` function at end of file (before export)
**Location:** After `getMatches` function (after line 495)
**Code:** Copy from plan section 1.5

### Step 1.8: Add getNextUser Route
**File:** `backend/src/routes/discovery.routes.js`
**Action:** 
1. Add import: `import { getNextUser } from '../controllers/discovery.controller.js';`
2. Add route: `router.get('/next-user', getNextUser);`
**Location:** 
- Import: After line 7 (with other imports)
- Route: After line 18 (after matches route)

---

## Phase 2: Frontend Integration

### Step 2.1: Add NEXT_USER Endpoint
**File:** `frontend/src/config/api.js`
**Action:** Add `NEXT_USER: '/discovery/next-user'` to DISCOVERY object
**Location:** After line 34 (after MATCHES)
**Code:**
```javascript
NEXT_USER: '/discovery/next-user'
```

### Step 2.2: Add getNextUser Service Function
**File:** `frontend/src/services/discoveryService.js`
**Action:** Add `getNextUser` function to discoveryService object
**Location:** After line 31 (after getMatches function)
**Code:**
```javascript
getNextUser: async () => {
  const response = await api.get(API_ENDPOINTS.DISCOVERY.NEXT_USER);
  return response;
}
```

### Step 2.3: Import discoveryService in DiscoveryFeedPage
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Add import for discoveryService
**Location:** After line 8 (with other imports)
**Code:**
```javascript
import { discoveryService } from '../services/discoveryService';
```

### Step 2.4: Remove Mock Data Import
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Remove or comment out mock data import
**Location:** Line 6
**Code:** Comment out:
```javascript
// import { mockProfiles, calculateMatchScore, calculateDistance } from '../data/mockProfiles';
```

### Step 2.5: Update loadProfiles Function
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Replace `loadProfiles` function to use backend API
**Location:** Replace lines 81-114
**Code:** Copy from plan section 2.2.1

### Step 2.6: Add loadNextProfile Function
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Add new `loadNextProfile` function
**Location:** After `handlePass` function (after line 440)
**Code:** Copy from plan section 2.2.4

### Step 2.7: Update handleLike Function
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Replace `handleLike` function to use backend API
**Location:** Replace lines 363-413
**Code:** Copy from plan section 2.2.2
**Key Changes:**
- Remove localStorage logic
- Add `discoveryService.likeProfile()` call
- Handle `isMatch` from response
- Call `loadNextProfile()` after swipe

### Step 2.8: Update handlePass Function
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Replace `handlePass` function to use backend API
**Location:** Replace lines 415-440
**Code:** Copy from plan section 2.2.3
**Key Changes:**
- Remove localStorage logic
- Add `discoveryService.passProfile()` call
- Call `loadNextProfile()` after swipe

### Step 2.9: Remove filterAndScoreProfiles Function (Optional)
**File:** `frontend/src/pages/DiscoveryFeedPage.jsx`
**Action:** Remove or comment out `filterAndScoreProfiles` function if not needed
**Location:** Check if function exists and remove if backend handles filtering

---

## Phase 3: Dummy Data Seeding

### Step 3.1: Create seedDatabase.js File
**File:** `backend/seedDatabase.js` (NEW FILE)
**Action:** Create new file with complete seeding script
**Code:** Copy entire code from plan section 3.1
**Note:** This is a complete new file

### Step 3.2: Add Seed Script to package.json
**File:** `backend/package.json`
**Action:** Add `"seed": "node seedDatabase.js"` to scripts
**Location:** After line 10 (after clear-db script)
**Code:**
```json
"seed": "node seedDatabase.js"
```

### Step 3.3: Run Seed Script
**Command:** 
```bash
cd backend
npm run seed
```
**Expected Output:**
- 20 users created
- 20 profiles created
- Test interactions created
- 2 matches created
- Test account info displayed

---

## Phase 4: Testing

### Step 4.1: Test Database Seeding
**Action:** Verify seed script ran successfully
**Check:**
- Console shows 20 users created
- No errors in console
- Test accounts listed

### Step 4.2: Test Login with Seeded User
**Action:** Login with test account
**Phone:** `9876543000`
**Expected:** Should login successfully and see profile

### Step 4.3: Test Discovery Feed API
**Action:** Check if profiles load from backend
**Endpoint:** `GET /api/discovery`
**Expected:** 
- Returns profiles array
- Each profile has `matchScore`
- Each profile has `activeStatus`
- Profiles sorted by score

### Step 4.4: Test Swipe Right (Like)
**Action:** Swipe right on a profile
**Expected:**
- `lastActiveAt` updates in database
- Interaction saved
- If mutual like, match created
- Next profile loads

### Step 4.5: Test Swipe Left (Pass)
**Action:** Swipe left on a profile
**Expected:**
- `lastActiveAt` updates in database
- Pass interaction saved
- Profile doesn't show again
- Next profile loads

### Step 4.6: Test Match Detection
**Action:** 
1. Login as User 0 (phone: 9876543000)
2. User 0 already liked User 1 (pre-seeded)
3. Login as User 1 (phone: 9876543001)
4. Like User 0 back
**Expected:**
- Match modal shows
- Match saved in database
- Both users see each other in matches

### Step 4.7: Test Match Score Calculation
**Action:** Check match scores in API response
**Expected:**
- Scores range from 0-100
- Active users have higher scores
- Profiles sorted by score (highest first)
- Match reasons displayed

### Step 4.8: Test Active Status Display
**Action:** Check active status in profiles
**Expected:**
- Online users show "Online"
- Recently active show "Active Xm ago"
- Active today show "Active Xh ago"
- Offline users show "Offline"

### Step 4.9: Test getNextUser Endpoint
**Action:** Call `GET /api/discovery/next-user`
**Expected:**
- Returns single best match
- Has highest match score
- Includes activeStatus
- Excludes already interacted users

---

## Verification Checklist

### Backend Verification:
- [ ] `checkUserActiveStatus` function added
- [ ] `calculateMatchScore` updated with all 10 components
- [ ] `lastActiveAt` updates in likeProfile
- [ ] `lastActiveAt` updates in passProfile
- [ ] `lastActiveAt` updates in getDiscoveryFeed
- [ ] `getNextUser` function created
- [ ] `/next-user` route added
- [ ] Active status included in responses

### Frontend Verification:
- [ ] `NEXT_USER` endpoint added to config
- [ ] `getNextUser` service function added
- [ ] `discoveryService` imported in DiscoveryFeedPage
- [ ] Mock data import removed
- [ ] `loadProfiles` uses backend API
- [ ] `loadNextProfile` function added
- [ ] `handleLike` uses backend API
- [ ] `handlePass` uses backend API
- [ ] Match modal shows on mutual like

### Database Verification:
- [ ] Seed script created
- [ ] Seed script runs without errors
- [ ] 20 users created
- [ ] 20 profiles created
- [ ] Test interactions created
- [ ] Test matches created

### Testing Verification:
- [ ] Can login with seeded users
- [ ] Discovery feed loads profiles
- [ ] Match scores calculated correctly
- [ ] Active status displays correctly
- [ ] Swipe right saves interaction
- [ ] Swipe left saves pass
- [ ] Match detection works
- [ ] Next user endpoint works

---

## Execution Order

**Recommended order:**
1. Backend changes first (Steps 1.1-1.8)
2. Test backend endpoints
3. Frontend changes (Steps 2.1-2.9)
4. Seed database (Steps 3.1-3.3)
5. End-to-end testing (Steps 4.1-4.9)

**Quick Start:**
```bash
# 1. Backend changes
# Edit: backend/src/controllers/discovery.controller.js
# Edit: backend/src/routes/discovery.routes.js

# 2. Frontend changes
# Edit: frontend/src/config/api.js
# Edit: frontend/src/services/discoveryService.js
# Edit: frontend/src/pages/DiscoveryFeedPage.jsx

# 3. Seed database
cd backend
npm run seed

# 4. Test
# Start backend: npm run dev
# Start frontend: npm run dev
# Login with: 9876543000
```

---

## Troubleshooting

**Issue:** Match scores not calculating
- Check if `lastActiveAt` is populated in queries
- Verify `checkUserActiveStatus` function exists
- Check console for errors

**Issue:** Active status not showing
- Verify `activeStatus` in API response
- Check frontend display logic
- Verify `lastActiveAt` field in User model

**Issue:** Seed script fails
- Check MongoDB connection
- Verify all models imported correctly
- Check for duplicate phone numbers

**Issue:** Swipe not saving
- Check API endpoint calls
- Verify authentication token
- Check backend console for errors

---

## Notes

- All backend changes should be tested with Postman/Thunder Client first
- Frontend changes should be tested after backend is working
- Seed script can be run multiple times (clears data first)
- Match scores are calculated server-side, frontend only displays
- Active status updates happen automatically on any authenticated action

