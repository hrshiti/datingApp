# Dating App Flow Analysis

## Current Implementation Status

### ✅ **ALREADY IMPLEMENTED:**

#### 1. **Sign Up/Login Flow:**
- ✅ Phone number input (`/phone` route)
- ✅ OTP generation and sending via SMS
- ✅ Test numbers (`6264560457`, `9685974247`) with default OTP `123456`
- ✅ OTP verification (`/verify-otp` route)
- ✅ Navigation logic: Signup → Basic Info, Login → People Page
- ✅ Phone number saved to database (User model)
- ✅ OTP saved to database with expiration

#### 2. **Basic Information Page:**
- ✅ Fields: name, gender, lookingFor, orientation, date of birth
- ✅ Validation for all fields
- ✅ Save to backend via `POST /api/profile/basic-info`
- ✅ After save, navigates to `/people` (people page)

#### 3. **People Page (Discovery Feed):**
- ✅ Profile completion check on swipe attempt
- ✅ "Complete Your Profile" modal when profile incomplete
- ✅ Modal navigates to `/onboarding` with `showOnlyIncomplete: true`
- ✅ Shows other users' profiles

#### 4. **Onboarding Page:**
- ✅ Step-by-step flow (8 steps)
- ✅ Loads data from backend on mount
- ✅ `showOnlyIncomplete` mode - shows only unfilled steps
- ✅ Each step saves to backend via `PUT /api/profile/onboarding/:step`
- ✅ After save, finds next incomplete step
- ✅ Navigates to `/people` when all mandatory steps complete

#### 5. **Profile Page:**
- ✅ Loads data from backend (`GET /api/profile/me`)
- ✅ Displays all profile information
- ✅ "Complete Profile" button (only shows when incomplete)
- ✅ "Edit Profile" button
- ✅ Reloads on navigation

#### 6. **Edit Profile Info Page:**
- ✅ Loads data from backend
- ✅ `showOnlyIncomplete` mode - shows only unfilled fields
- ✅ Edit mode - shows all fields with existing data
- ✅ Save function updates backend
- ✅ After save in "Complete Profile" mode, navigates to profile page
- ✅ Field-level conditional rendering

#### 7. **Backend APIs:**
- ✅ `POST /api/auth/send-otp` - Send OTP
- ✅ `POST /api/auth/verify-otp` - Verify OTP
- ✅ `POST /api/profile/basic-info` - Save basic info
- ✅ `PUT /api/profile/onboarding/:step` - Update onboarding step
- ✅ `GET /api/profile/me` - Get user profile
- ✅ `GET /api/profile/check-completion` - Check profile completion
- ✅ `PUT /api/profile/bio` - Update bio

### ⚠️ **NEEDS VERIFICATION/FIXING:**

#### 1. **Basic Information Flow:**
- ⚠️ Verify: After saving basic info, user should go to `/people` (currently implemented)
- ⚠️ Verify: Data is properly saved to backend

#### 2. **People Page - Swipe Check:**
- ⚠️ Verify: When user tries to swipe, profile completion is checked
- ⚠️ Verify: "Complete Profile" modal shows when incomplete
- ⚠️ Verify: Modal navigates to onboarding with correct state

#### 3. **Onboarding - Unfilled Fields:**
- ⚠️ Verify: When coming from "Complete Profile", only unfilled steps show
- ⚠️ Verify: Each step saves to backend before moving to next
- ⚠️ Verify: After all steps complete, navigates to `/people`

#### 4. **Profile Page:**
- ⚠️ Verify: Data loads from backend correctly
- ⚠️ Verify: "Complete Profile" button only shows when incomplete
- ⚠️ Verify: "Edit Profile" button loads existing data

#### 5. **Edit Profile - Complete Profile Mode:**
- ⚠️ Verify: Shows only unfilled fields
- ⚠️ Verify: Save updates backend
- ⚠️ Verify: After save, navigates to profile page
- ⚠️ Verify: Other unfilled fields don't disappear after saving one field

#### 6. **Data Sync:**
- ⚠️ Verify: Profile page shows updated data after edit
- ⚠️ Verify: People page uses latest dealbreakers for filtering

## Required Flow (As Per User Requirements)

### **Case 1: New User Sign Up**

1. **Phone Number Entry:**
   - User enters phone number
   - Phone saved to database
   - OTP generated (123456 for test numbers)
   - OTP sent via SMS

2. **OTP Verification:**
   - User enters OTP
   - Backend verifies OTP
   - If wrong: Show error "Wrong OTP, please enter correct"
   - If correct: Navigate to Basic Information page

3. **Basic Information:**
   - Fields: name, gender, looking for, sexual orientation, date of birth
   - User fills and clicks "Next"
   - Data saved to backend
   - Navigate to People page

4. **People Page:**
   - Show other users' profiles
   - When user tries to swipe:
     - Check if profile complete
     - If complete: Allow swipe
     - If incomplete: Show "Complete Your Profile" modal

5. **Complete Profile Modal:**
   - Show modal with "Complete Profile" button
   - Click button → Navigate to Onboarding page
   - Pass `showOnlyIncomplete: true` state

6. **Onboarding (Complete Profile Mode):**
   - Check backend for unfilled fields
   - Show only unfilled fields/steps
   - User fills one step → Click Next
   - Save to backend
   - Move to next incomplete step
   - Repeat until all mandatory fields complete
   - Then navigate to `/people`

### **Case 2: Existing User Login**

1. **Phone Number & OTP:**
   - User enters phone number
   - OTP sent
   - User verifies OTP
   - Navigate to `/people` (skip basic info)

2. **People Page:**
   - Same as Case 1 step 4

3. **Profile Page:**
   - User clicks on profile
   - Load data from backend
   - Show all filled data
   - "Complete Profile" button (only if incomplete)
   - "Edit Profile" button

4. **Edit Profile:**
   - Load all data from backend
   - Fill fields with existing data
   - User can edit
   - Save → Update backend
   - Navigate to profile page
   - Profile page shows updated data

5. **Complete Profile (from Profile Page):**
   - Click "Complete Profile" button
   - Navigate to Edit Profile Info page with `showOnlyIncomplete: true`
   - Show only unfilled fields
   - User fills one field → Save
   - Update backend
   - Navigate to profile page
   - Other unfilled fields should still be visible (don't hide)

## Files to Check/Update

### **Frontend:**
1. `frontend/src/pages/auth/AuthPages.jsx` - OTP verification flow
2. `frontend/src/pages/BasicInfoPage.jsx` - Basic info save and navigation
3. `frontend/src/pages/DiscoveryFeedPage.jsx` - Swipe check and modal
4. `frontend/src/pages/OnboardingPage.jsx` - Unfilled fields logic
5. `frontend/src/pages/ProfilePage.jsx` - Data loading and button visibility
6. `frontend/src/pages/EditProfileInfoPage.jsx` - Complete profile mode

### **Backend:**
1. `backend/src/controllers/auth.controller.js` - OTP generation/verification
2. `backend/src/controllers/profile.controller.js` - Profile save/update APIs
3. `backend/src/models/Profile.model.js` - Profile schema

## Key Points to Verify

1. ✅ OTP verification error message shows correctly
2. ✅ Basic info saves to backend
3. ✅ People page checks profile completion on swipe
4. ✅ Onboarding shows only unfilled steps
5. ✅ Each onboarding step saves to backend
6. ✅ Profile page loads from backend
7. ✅ Edit profile loads and saves correctly
8. ✅ Complete Profile mode shows only unfilled fields
9. ✅ Save in Complete Profile mode navigates to profile page
10. ✅ Unfilled fields don't disappear after saving one field

