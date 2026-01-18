# MVP Issues - Updated Requirements

This document contains the prioritized issues for the Snaplet PJATK MVP with focus on deployment, Firebase backend, and actionable development tasks.

**📌 GitHub Free Tier Compatible:** All issues in this document are designed to work with GitHub Free accounts, especially for public repositories.

---

## 🎯 MVP Goals

1. **Deploy to GitHub Pages** - Showcase project documentation
2. **Firebase Backend Setup** - Authentication, Firestore, Storage
3. **Core Photo Sharing Features** - Camera, upload, feed
4. **Clean Branch Workflow** - Organized development process
5. **FFmpeg Integration** - Video processing (LAST PRIORITY)

---

## 🚀 Phase 1: Deployment & Infrastructure (HIGH PRIORITY)

### Issue 1: Set Up GitHub Pages Deployment
**Labels:** `deployment`, `documentation`, `setup`, `high-priority`

**Description:**
Configure GitHub Pages to automatically deploy project documentation from the `docs/` folder.

**Tasks:**
- [x] Create `docs/` folder with index.html
- [x] Create documentation landing page
- [ ] Configure GitHub Pages in repository settings
- [ ] Set up automatic deployment on main branch push
- [ ] Add custom domain (optional)
- [ ] Add status badge to README
- [ ] Test deployment pipeline
- [ ] Create documentation for updating GitHub Pages

**Acceptance Criteria:**
- GitHub Pages is live and accessible
- Documentation updates automatically on main branch merge
- All links work correctly
- Site is mobile-responsive

**Repository Settings:**
1. Go to `Settings` → `Pages`
2. Source: `Deploy from branch`
3. Branch: `main` → `/docs` folder
4. Save

**Site URL:** `https://ax8tje.github.io/snaplet-pjatk-project/`

---

### Issue 2: Set Up Firebase Project and Configuration
**Labels:** `firebase`, `backend`, `setup`, `high-priority`

**Description:**
Create and configure Firebase project with Authentication, Firestore, and Storage.

**Tasks:**
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Firebase Authentication
  - [ ] Email/Password provider
  - [ ] Google OAuth provider
  - [ ] Facebook OAuth provider (optional)
- [ ] Set up Cloud Firestore database
  - [ ] Create collections structure
  - [ ] Set up security rules
  - [ ] Create indexes
- [ ] Set up Firebase Storage
  - [ ] Create storage buckets
  - [ ] Configure security rules
  - [ ] Set up folder structure
- [ ] Add Firebase config to React Native app
  - [ ] Download `google-services.json` (Android)
  - [ ] Download `GoogleService-Info.plist` (iOS)
  - [ ] Add to `.gitignore`
- [ ] Create Firebase configuration documentation
- [ ] Test Firebase connection from app

**Firestore Collections Structure:**
```
users/
  {userId}/
    - email
    - displayName
    - photoURL
    - createdAt
    - bio

posts/
  {postId}/
    - userId
    - imageUrl
    - thumbnailUrl
    - caption
    - createdAt
    - likes (number)
    - commentCount (number)

comments/
  {commentId}/
    - postId
    - userId
    - text
    - createdAt

likes/
  {likeId}/
    - postId
    - userId
    - createdAt
```

**Acceptance Criteria:**
- Firebase project created and configured
- All services enabled (Auth, Firestore, Storage)
- Configuration files added to project (gitignored)
- Security rules properly set
- Documentation created for setup process

---

### Issue 3: Create CI/CD Pipeline with GitHub Actions
**Labels:** `devops`, `automation`, `ci-cd`, `high-priority`

**Description:**
Set up automated testing and deployment pipeline using GitHub Actions.

**Tasks:**
- [ ] Create `.github/workflows/test.yml` for PR checks
  - [ ] Run tests on every PR
  - [ ] Run ESLint
  - [ ] Run TypeScript type checking
  - [ ] Generate coverage report
- [ ] Create `.github/workflows/deploy.yml` for main branch
  - [ ] Auto-deploy docs to GitHub Pages
  - [ ] Run full test suite
  - [ ] Build Android APK (optional)
- [ ] Set up branch protection rules (GitHub Free compatible)
  - [ ] Require pull requests before merging to main
  - [ ] Require status checks to pass (tests, lint)
  - [ ] Require conversation resolution
  - [ ] Disable force pushes and deletions
  - [ ] Note: Required reviews need GitHub Pro (use manual review process)
- [ ] Add status badges to README
- [ ] Document CI/CD pipeline

**Example Workflow:**
```yaml
name: Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run type-check
```

**Acceptance Criteria:**
- Tests run automatically on every PR
- Main branch protected with required checks (GitHub Free compatible)
- Deployment happens automatically on merge
- Status badges show current build status

**GitHub Free Notes:**
- GitHub Actions provides 2,000 minutes/month for free (public repos get unlimited)
- Branch protection works well on public repos
- For private repos, consider making repo public or manual review process

---

## 📱 Phase 2: Core Features (MEDIUM PRIORITY)

### Issue 4: Implement Firebase Authentication
**Labels:** `feature`, `authentication`, `firebase`

**Description:**
Implement complete authentication flow with Firebase Auth.

**Tasks:**
- [ ] Install Firebase Auth SDK
  - [ ] `@react-native-firebase/app`
  - [ ] `@react-native-firebase/auth`
- [ ] Create authentication service layer
- [ ] Implement email/password signup
  - [ ] Create RegisterScreen UI
  - [ ] Add form validation
  - [ ] Handle errors
- [ ] Implement email/password login
  - [ ] Create LoginScreen UI
  - [ ] Add form validation
  - [ ] Handle errors
- [ ] Add "Forgot Password" flow
- [ ] Implement Google Sign-In
- [ ] Implement Facebook Sign-In (optional)
- [ ] Add authentication state management (Zustand)
- [ ] Create authentication guards for protected routes
- [ ] Add user profile creation on signup
- [ ] Write tests for auth flows
- [ ] Document authentication system

**Acceptance Criteria:**
- Users can register with email/password
- Users can login with email/password
- Users can reset password
- Google Sign-In works
- Auth state persists across app restarts
- Protected screens require authentication
- All tests pass

---

### Issue 5: Implement Photo Capture with Camera
**Labels:** `feature`, `camera`, `vision-camera`

**Description:**
Enable photo capture using React Native Vision Camera.

**Tasks:**
- [ ] Verify Vision Camera is properly configured
- [ ] Request and handle camera permissions
  - [ ] Android permissions
  - [ ] iOS permissions
  - [ ] Permission denial handling
- [ ] Create CameraScreen UI
  - [ ] Camera preview
  - [ ] Capture button
  - [ ] Front/back camera toggle
  - [ ] Flash toggle
  - [ ] Cancel button
- [ ] Implement photo capture
- [ ] Add photo preview before confirmation
- [ ] Optimize photo size and quality
- [ ] Handle errors gracefully
- [ ] Add loading states
- [ ] Write tests
- [ ] Document camera implementation

**Acceptance Criteria:**
- Camera opens when requested
- Users can capture photos
- Users can switch cameras
- Photo quality is optimized
- Permissions handled properly
- All edge cases covered

---

### Issue 6: Implement Photo Upload to Firebase Storage
**Labels:** `feature`, `storage`, `firebase`

**Description:**
Implement photo upload functionality with Firebase Storage.

**Tasks:**
- [ ] Install Firebase Storage SDK
  - [ ] `@react-native-firebase/storage`
- [ ] Create storage service layer
- [ ] Implement image compression
  - [ ] Use `react-native-image-resizer`
  - [ ] Compress before upload
  - [ ] Generate thumbnails
- [ ] Create upload function
  - [ ] Upload full-size image
  - [ ] Upload thumbnail
  - [ ] Add metadata (userId, timestamp)
- [ ] Add upload progress tracking
- [ ] Implement retry logic for failed uploads
- [ ] Create upload queue for multiple photos
- [ ] Save photo metadata to Firestore
- [ ] Handle errors and edge cases
- [ ] Write tests
- [ ] Document upload process

**Storage Structure:**
```
/users/{userId}/posts/{postId}/
  - full.jpg
  - thumbnail.jpg
```

**Acceptance Criteria:**
- Photos upload successfully
- Progress shown to user
- Failed uploads retry automatically
- Photos compressed appropriately
- Metadata saved to Firestore
- Tests pass

---

### Issue 7: Implement Real-time Photo Feed
**Labels:** `feature`, `feed`, `firestore`

**Description:**
Create photo feed with real-time updates using Firestore.

**Tasks:**
- [ ] Install Firestore SDK
  - [ ] `@react-native-firebase/firestore`
- [ ] Create Firestore service layer
- [ ] Implement feed query
  - [ ] Order by timestamp (newest first)
  - [ ] Paginate results (20 per page)
- [ ] Create HomeScreen/FeedScreen UI
  - [ ] Post cards with image
  - [ ] User info (name, avatar)
  - [ ] Like button and count
  - [ ] Comment button and count
  - [ ] Timestamp
- [ ] Add real-time listeners for updates
- [ ] Implement pull-to-refresh
- [ ] Implement infinite scroll
- [ ] Add image caching
  - [ ] Use `react-native-fast-image`
- [ ] Add loading states (skeleton screens)
- [ ] Handle empty state
- [ ] Write tests
- [ ] Document feed implementation

**Acceptance Criteria:**
- Feed displays all posts chronologically
- New posts appear automatically
- Infinite scroll works smoothly
- Images load efficiently
- Pull-to-refresh updates feed
- Tests pass

---

### Issue 8: Implement User Profiles
**Labels:** `feature`, `profile`, `firestore`

**Description:**
Create user profile screens with edit functionality.

**Tasks:**
- [ ] Create ProfileScreen UI
  - [ ] Profile photo
  - [ ] Display name
  - [ ] Bio
  - [ ] Post count
  - [ ] Posts grid
- [ ] Implement profile data fetching
- [ ] Create EditProfileScreen
  - [ ] Edit display name
  - [ ] Edit bio
  - [ ] Change profile photo
  - [ ] Save button
- [ ] Add profile photo upload
- [ ] Implement profile update functionality
- [ ] Add user's posts grid (photos only)
- [ ] Enable viewing other users' profiles
- [ ] Add loading and error states
- [ ] Write tests
- [ ] Document profile system

**Acceptance Criteria:**
- Users can view their profile
- Users can edit profile info
- Profile photo can be changed
- User's posts displayed in grid
- Other users' profiles viewable
- Tests pass

---

### Issue 9: Implement Social Features (Likes & Comments)
**Labels:** `feature`, `social`, `firestore`

**Description:**
Add like and comment functionality to posts.

**Tasks:**
- [ ] Design Firestore schema for likes/comments
- [ ] Implement like functionality
  - [ ] Create like service
  - [ ] Toggle like on tap
  - [ ] Update like count in real-time
  - [ ] Show liked state
- [ ] Implement comments
  - [ ] Create comments screen
  - [ ] Comment input field
  - [ ] Submit comment
  - [ ] Real-time comment updates
  - [ ] Delete own comments
- [ ] Add optimistic updates
- [ ] Handle errors gracefully
- [ ] Add loading states
- [ ] Write tests
- [ ] Document social features

**Acceptance Criteria:**
- Users can like/unlike posts
- Like count updates in real-time
- Users can comment on posts
- Comments update in real-time
- Users can delete their comments
- Tests pass

---

## 🧪 Phase 3: Testing & Quality (ONGOING)

### Issue 10: Increase Test Coverage to 60%
**Labels:** `testing`, `quality`, `ongoing`

**Description:**
Systematically increase test coverage across the application.

**Current Coverage:** 10.09%
**Target Coverage:** 60%+

**Priority Areas:**
- [ ] Authentication service (100% coverage)
- [ ] Storage service (100% coverage)
- [ ] Firestore service (100% coverage)
- [ ] All screen components (80%+ coverage)
- [ ] Navigation components (60%+ coverage)
- [ ] Utility functions (100% coverage)
- [ ] State management (80%+ coverage)

**Tasks:**
- [ ] Add tests for services layer
- [ ] Add tests for remaining screens
- [ ] Add tests for navigation
- [ ] Add integration tests
- [ ] Set up coverage thresholds in Jest
- [ ] Add coverage reporting to CI
- [ ] Document testing strategy

**Acceptance Criteria:**
- Overall coverage ≥ 60%
- All critical paths tested
- Coverage enforced in CI
- Tests documented

---

### Issue 11: Add Tests for All Screens
**Labels:** `testing`, `screens`

**Description:**
Create comprehensive tests for all screen components.

**Screens to Test:**
- [x] LoginScreen (already done)
- [ ] RegisterScreen
- [ ] HomeScreen / FeedScreen
- [ ] CameraScreen
- [ ] ProfileScreen
- [ ] EditProfileScreen
- [ ] SettingsScreen
- [ ] SearchScreen
- [ ] NotificationsScreen
- [ ] MessagesScreen
- [ ] ChatScreen

**For Each Screen Test:**
- [ ] Renders correctly
- [ ] Handles user interactions
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Navigation works
- [ ] Firebase integration mocked
- [ ] 100% coverage achieved

**Acceptance Criteria:**
- All screens have tests
- 100% coverage per screen
- All tests pass
- Tests well-documented

---

## 📚 Phase 4: Documentation (ONGOING)

### Issue 12: Create Comprehensive Documentation
**Labels:** `documentation`, `ongoing`

**Description:**
Document all aspects of the project for developers and users.

**Documentation Needed:**
- [ ] **Setup Guide**
  - [ ] Windows setup
  - [ ] macOS setup
  - [ ] Linux setup
  - [ ] Firebase configuration
- [ ] **Development Guide**
  - [ ] Project structure
  - [ ] Branch workflow
  - [ ] Coding standards
  - [ ] Testing guidelines
- [ ] **API Documentation**
  - [ ] Firebase services
  - [ ] Firestore schema
  - [ ] Storage structure
  - [ ] Authentication flows
- [ ] **Deployment Guide**
  - [ ] GitHub Pages deployment
  - [ ] Mobile app deployment
  - [ ] Firebase deployment
- [ ] **User Guide**
  - [ ] Feature documentation
  - [ ] Screenshots
  - [ ] Troubleshooting

**Acceptance Criteria:**
- All documentation complete
- Examples provided
- Screenshots included
- Easy to navigate

---

## 🎥 Phase 5: Advanced Features (LOW PRIORITY)

### Issue 13: FFmpeg Integration for Video Processing
**Labels:** `feature`, `video`, `ffmpeg`, `low-priority`, `future`

**⚠️ IMPORTANT: This is LAST PRIORITY - Implement after all core features are complete**

**Description:**
Add video capture and processing capabilities using FFmpeg.

**Tasks:**
- [ ] Install FFmpeg for React Native
  - [ ] Research best library option
  - [ ] Install dependencies
  - [ ] Configure for Android
  - [ ] Configure for iOS
- [ ] Implement video capture
  - [ ] Update CameraScreen for video mode
  - [ ] Add record button
  - [ ] Add stop button
  - [ ] Show recording timer
- [ ] Add video processing
  - [ ] Compress videos
  - [ ] Generate thumbnails
  - [ ] Add filters (optional)
- [ ] Implement video upload
  - [ ] Upload to Firebase Storage
  - [ ] Show upload progress
  - [ ] Save to Firestore
- [ ] Add video playback in feed
- [ ] Write tests
- [ ] Document video features

**Acceptance Criteria:**
- Users can record videos
- Videos are compressed
- Videos upload successfully
- Videos play in feed
- Tests pass

**DO NOT START THIS UNTIL:**
- ✅ All Phase 1 tasks complete
- ✅ All Phase 2 tasks complete
- ✅ Test coverage ≥ 60%
- ✅ All core features working
- ✅ Team approval

---

### Issue 14: End-to-End Testing with Detox
**Labels:** `testing`, `e2e`, `low-priority`

**Description:**
Implement E2E tests for critical user flows.

**Tasks:**
- [ ] Install and configure Detox
- [ ] Set up for Android
- [ ] Set up for iOS
- [ ] Write E2E tests for:
  - [ ] Authentication flow
  - [ ] Photo capture and upload
  - [ ] Feed interactions
  - [ ] Profile management
- [ ] Add to CI/CD
- [ ] Document E2E testing

**Acceptance Criteria:**
- Detox configured
- Critical flows tested
- Tests run in CI
- Documentation complete

---

### Issue 15: Performance Monitoring
**Labels:** `monitoring`, `performance`, `low-priority`

**Description:**
Add Firebase Performance Monitoring.

**Tasks:**
- [ ] Install Firebase Performance SDK
- [ ] Add custom traces
- [ ] Monitor app startup
- [ ] Monitor screen rendering
- [ ] Set up alerts
- [ ] Create dashboard
- [ ] Document monitoring

**Acceptance Criteria:**
- Monitoring active
- Metrics tracked
- Alerts configured
- Dashboard accessible

---

## 📊 MVP Priority Summary

### Must Have (Phase 1 & 2)
1. ✅ GitHub Pages deployment
2. Firebase project setup
3. CI/CD pipeline
4. Authentication
5. Photo capture
6. Photo upload
7. Photo feed
8. User profiles
9. Likes & comments

### Should Have (Phase 3)
10. 60%+ test coverage
11. All screens tested
12. Comprehensive documentation

### Could Have (Phase 5 - Low Priority)
13. FFmpeg video processing (LAST!)
14. E2E tests
15. Performance monitoring

---

## 🚀 Getting Started

### For Automated Issue Creation:
1. Export GitHub token: `export GITHUB_TOKEN=your_token`
2. Run script: `bash .github/create-issues.sh`

### For Manual Creation:
Use the issue templates above and create them at:
https://github.com/ax8tje/snaplet-pjatk-project/issues/new

---

**Last Updated:** 2026-01-18
**Version:** 2.0 (Updated for new MVP requirements)
