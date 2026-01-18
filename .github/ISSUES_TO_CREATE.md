# GitHub Issues to Create

This file contains all the issues that should be created for the Snaplet PJATK project. You can either:
1. Run the automated script: `bash .github/create-issues.sh`
2. Create them manually by copying each issue below

---

## Feature Implementation Issues

### Issue 1: Implement Firebase Authentication
**Labels:** `enhancement`, `feature`, `authentication`

**Description:**
Implement user authentication using Firebase Auth to allow users to sign up, log in, and manage their accounts.

**Tasks:**
- [ ] Set up Firebase Auth SDK integration
- [ ] Create sign-up screen with email/password
- [ ] Create login screen with email/password
- [ ] Add social login options (Google, Facebook)
- [ ] Implement password reset functionality
- [ ] Add email verification flow
- [ ] Create authentication state management with Zustand
- [ ] Add authentication guards to protected screens
- [ ] Write tests for authentication flows

**Acceptance Criteria:**
- Users can register with email/password
- Users can log in with email/password
- Users can reset forgotten passwords
- Authentication state persists across app restarts
- All authentication flows have proper error handling

---

### Issue 2: Implement Camera Photo Capture
**Labels:** `enhancement`, `feature`, `camera`

**Description:**
Enable users to capture photos using the device camera with React Native Vision Camera.

**Tasks:**
- [ ] Configure camera permissions for iOS and Android
- [ ] Create camera screen UI with capture button
- [ ] Implement photo capture functionality
- [ ] Add camera flip (front/back) toggle
- [ ] Implement flash control
- [ ] Add preview before confirming photo
- [ ] Handle camera permissions denial gracefully
- [ ] Optimize photo quality and size
- [ ] Write tests for camera functionality

**Acceptance Criteria:**
- Users can access device camera
- Users can capture photos in high quality
- Users can switch between front and back cameras
- Photo preview shows before saving
- Proper error handling for permission issues

---

### Issue 3: Implement Cloud Photo Storage
**Labels:** `enhancement`, `feature`, `storage`

**Description:**
Implement photo upload and storage functionality using Firebase Cloud Storage.

**Tasks:**
- [ ] Set up Firebase Storage SDK integration
- [ ] Create upload service with progress tracking
- [ ] Implement image compression before upload
- [ ] Add upload queue for multiple photos
- [ ] Create storage folder structure (user-based)
- [ ] Implement upload retry logic for failed uploads
- [ ] Add image metadata (timestamp, location, etc.)
- [ ] Create thumbnail generation
- [ ] Write tests for storage operations

**Acceptance Criteria:**
- Photos upload to Firebase Storage successfully
- Upload progress is displayed to users
- Failed uploads are retried automatically
- Photos are compressed to optimize storage
- Proper error handling for upload failures

---

### Issue 4: Implement Real-time Photo Feed
**Labels:** `enhancement`, `feature`, `feed`

**Description:**
Create a real-time photo feed that displays photos from all users with live updates using Firebase Firestore.

**Tasks:**
- [ ] Set up Firestore SDK integration
- [ ] Design Firestore data schema for posts
- [ ] Create feed screen with infinite scroll
- [ ] Implement real-time listeners for new posts
- [ ] Add pull-to-refresh functionality
- [ ] Implement post creation flow
- [ ] Add loading states and skeleton screens
- [ ] Optimize image loading with caching
- [ ] Implement pagination for better performance
- [ ] Write tests for feed functionality

**Acceptance Criteria:**
- Feed displays all user photos in chronological order
- New photos appear automatically without refresh
- Smooth infinite scroll with pagination
- Images load efficiently with caching
- Proper loading and error states

---

### Issue 5: Implement User Profiles
**Labels:** `enhancement`, `feature`, `profile`

**Description:**
Create user profile pages with customizable profile information and user-specific photo galleries.

**Tasks:**
- [ ] Create profile screen UI
- [ ] Implement profile data in Firestore
- [ ] Add profile photo upload
- [ ] Create edit profile screen
- [ ] Implement bio and personal information fields
- [ ] Add user photo gallery (grid view)
- [ ] Implement follower/following counts
- [ ] Add profile viewing for other users
- [ ] Create profile settings page
- [ ] Write tests for profile functionality

**Acceptance Criteria:**
- Users can view their own profile
- Users can edit profile information
- Users can upload profile photos
- Profile displays user's photo gallery
- Users can view other users' profiles

---

### Issue 6: Implement Social Features (Likes & Comments)
**Labels:** `enhancement`, `feature`, `social`

**Description:**
Add social interaction features including likes and comments on photos.

**Tasks:**
- [ ] Design Firestore schema for likes and comments
- [ ] Implement like button functionality
- [ ] Add like counter display
- [ ] Create comments section UI
- [ ] Implement comment submission
- [ ] Add real-time comment updates
- [ ] Implement delete comment (own comments only)
- [ ] Add notification for new likes/comments
- [ ] Optimize comment loading with pagination
- [ ] Write tests for social features

**Acceptance Criteria:**
- Users can like/unlike photos
- Like count updates in real-time
- Users can add comments to photos
- Comments update in real-time
- Users can delete their own comments
- Proper validation and error handling

---

## Testing & Quality Improvements

### Issue 7: Add Tests for Remaining Screens
**Labels:** `testing`, `quality`

**Description:**
Expand test coverage by adding comprehensive tests for all remaining screens in the application.

**Priority Screens:**
- [ ] RegisterScreen
- [ ] HomeScreen
- [ ] ProfileScreen
- [ ] CameraScreen
- [ ] SettingsScreen
- [ ] EditProfileScreen
- [ ] SearchScreen
- [ ] MessagesScreen
- [ ] NotificationsScreen

**Tasks:**
- [ ] Write unit tests for each screen component
- [ ] Test user interactions (button clicks, input changes)
- [ ] Test navigation between screens
- [ ] Test error states and loading states
- [ ] Mock Firebase services appropriately
- [ ] Ensure 100% coverage for each screen

**Acceptance Criteria:**
- All screens have test files
- 100% statement and branch coverage for tested screens
- All user interactions are tested
- All tests pass successfully

---

### Issue 8: Add Tests for Navigation Components
**Labels:** `testing`, `quality`

**Description:**
Create tests for all navigation components to ensure proper routing and navigation flows.

**Components to Test:**
- [ ] AuthNavigator.tsx
- [ ] HomeStackNavigator.tsx
- [ ] MainTabNavigator.tsx
- [ ] MessagesStackNavigator.tsx
- [ ] ProfileStackNavigator.tsx

**Tasks:**
- [ ] Write tests for each navigator
- [ ] Test navigation between screens
- [ ] Test navigation parameters
- [ ] Test authentication guards
- [ ] Test deep linking (if implemented)
- [ ] Mock React Navigation appropriately

**Acceptance Criteria:**
- All navigators have test coverage
- Navigation flows are tested end-to-end
- Tests verify correct screen transitions
- All tests pass successfully

---

### Issue 9: Increase Overall Code Coverage to 60%+
**Labels:** `testing`, `quality`, `high-priority`

**Description:**
Systematically increase code coverage from current 10.09% to at least 60%.

**Current Coverage:**
- Statements: 10.09%
- Branch: 24.39%
- Functions: 10.47%
- Lines: 8.54%

**Target Coverage:**
- Statements: 60%+
- Branch: 60%+
- Functions: 60%+
- Lines: 60%+

**Tasks:**
- [ ] Add tests for services layer
- [ ] Add tests for utility functions
- [ ] Add tests for store/state management
- [ ] Add tests for remaining components
- [ ] Add integration tests
- [ ] Set up coverage thresholds in Jest config
- [ ] Add coverage reporting to CI/CD

**Acceptance Criteria:**
- Overall coverage reaches 60% or higher
- Coverage report shows improvement in all metrics
- No critical code paths left untested
- Coverage thresholds enforced in CI

---

### Issue 10: Set Up CI/CD Pipeline with Automated Testing
**Labels:** `devops`, `testing`, `automation`

**Description:**
Configure continuous integration and continuous deployment pipeline with automated testing.

**Tasks:**
- [ ] Set up GitHub Actions workflows
- [ ] Create test workflow (runs on PR)
- [ ] Create build workflow for Android
- [ ] Create build workflow for iOS
- [ ] Add linting to CI pipeline
- [ ] Add TypeScript type checking to CI
- [ ] Configure coverage reporting
- [ ] Add code quality checks (ESLint)
- [ ] Set up automated dependency updates (Dependabot)
- [ ] Add status badges to README

**Acceptance Criteria:**
- Tests run automatically on every PR
- Build succeeds on both platforms
- Failed tests block PR merging
- Coverage reports are generated
- Status badges show build/test status

---

### Issue 11: Add End-to-End Tests with Detox
**Labels:** `testing`, `e2e`, `quality`

**Description:**
Implement end-to-end testing using Detox to test complete user flows across the application.

**Tasks:**
- [ ] Install and configure Detox
- [ ] Set up Detox for Android
- [ ] Set up Detox for iOS
- [ ] Write E2E tests for authentication flow
- [ ] Write E2E tests for photo capture and upload
- [ ] Write E2E tests for feed interactions
- [ ] Write E2E tests for profile management
- [ ] Write E2E tests for social features
- [ ] Configure E2E tests in CI/CD
- [ ] Document E2E testing process

**Critical User Flows to Test:**
- [ ] User registration and login
- [ ] Photo capture and upload
- [ ] Browsing and refreshing feed
- [ ] Liking and commenting on photos
- [ ] Viewing and editing profile

**Acceptance Criteria:**
- Detox is properly configured for both platforms
- Critical user flows have E2E test coverage
- E2E tests run in CI pipeline
- All E2E tests pass consistently

---

## Documentation & Maintenance

### Issue 12: Create API Documentation
**Labels:** `documentation`

**Description:**
Document all API endpoints, Firebase services integration, and data models.

**Tasks:**
- [ ] Document Firestore data schema
- [ ] Document Firebase Storage structure
- [ ] Document authentication flows
- [ ] Create API reference for services
- [ ] Add JSDoc comments to service files
- [ ] Create data flow diagrams
- [ ] Document error handling patterns

**Acceptance Criteria:**
- All services are documented
- Data schemas are clearly defined
- API reference is easy to navigate
- Examples provided for common operations

---

### Issue 13: Add Performance Monitoring
**Labels:** `enhancement`, `monitoring`, `performance`

**Description:**
Implement performance monitoring to track app performance and identify bottlenecks.

**Tasks:**
- [ ] Set up Firebase Performance Monitoring
- [ ] Add custom performance traces
- [ ] Monitor app startup time
- [ ] Monitor screen rendering performance
- [ ] Monitor network request performance
- [ ] Set up performance alerts
- [ ] Create performance dashboard
- [ ] Document performance metrics

**Acceptance Criteria:**
- Performance monitoring is active
- Key metrics are tracked
- Performance reports are accessible
- Alerts trigger for performance issues

---

## Setup Instructions

### Option 1: Automated Creation (Recommended)
We've created a script that can automatically create all these issues. However, it requires a GitHub personal access token.

1. Create a GitHub Personal Access Token at: https://github.com/settings/tokens
   - Select scopes: `repo` (full control of private repositories)
2. Export your token: `export GITHUB_TOKEN=your_token_here`
3. Run the script: `bash .github/create-issues.sh`

### Option 2: Manual Creation
1. Go to https://github.com/ax8tje/snaplet-pjatk-project/issues/new
2. Copy each issue from above
3. Paste title and description
4. Add the specified labels
5. Click "Submit new issue"

---

## Priority Order

**High Priority (Implement First):**
1. Issue 1: Firebase Authentication
2. Issue 2: Camera Photo Capture
3. Issue 3: Cloud Photo Storage

**Medium Priority:**
4. Issue 4: Real-time Photo Feed
5. Issue 9: Increase Code Coverage to 60%
6. Issue 10: Set Up CI/CD Pipeline

**Standard Priority:**
7. Issue 5: User Profiles
8. Issue 6: Social Features
9. Issue 7: Add Tests for Remaining Screens
10. Issue 8: Add Tests for Navigation

**Low Priority (Future):**
11. Issue 11: Add E2E Tests with Detox
12. Issue 12: Create API Documentation
13. Issue 13: Add Performance Monitoring

---

**Total Issues to Create: 13**
