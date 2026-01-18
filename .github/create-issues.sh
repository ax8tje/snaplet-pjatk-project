#!/bin/bash

# GitHub Issues Creation Script for Snaplet PJATK
# This script creates all planned issues using the GitHub API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO="ax8tje/snaplet-pjatk-project"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
    echo "Please create a GitHub Personal Access Token at:"
    echo "https://github.com/settings/tokens"
    echo ""
    echo "Then export it:"
    echo "export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo -e "${GREEN}Creating GitHub issues for $REPO${NC}"
echo ""

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"

    echo -e "${YELLOW}Creating issue: $title${NC}"

    # Escape the body for JSON
    body_json=$(jq -n --arg body "$body" '$body')
    labels_json=$(echo "$labels" | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')

    response=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/issues" \
        -d "{
            \"title\": \"$title\",
            \"body\": $body_json,
            \"labels\": $labels_json
        }")

    issue_url=$(echo "$response" | jq -r '.html_url // empty')

    if [ -n "$issue_url" ]; then
        echo -e "${GREEN}✓ Created: $issue_url${NC}"
        return 0
    else
        error_msg=$(echo "$response" | jq -r '.message // "Unknown error"')
        echo -e "${RED}✗ Failed: $error_msg${NC}"
        return 1
    fi
}

# Issue 1: Firebase Authentication
create_issue \
    "Implement Firebase Authentication" \
    "$(cat << 'EOF'
Implement user authentication using Firebase Auth to allow users to sign up, log in, and manage their accounts.

## Tasks
- [ ] Set up Firebase Auth SDK integration
- [ ] Create sign-up screen with email/password
- [ ] Create login screen with email/password
- [ ] Add social login options (Google, Facebook)
- [ ] Implement password reset functionality
- [ ] Add email verification flow
- [ ] Create authentication state management with Zustand
- [ ] Add authentication guards to protected screens
- [ ] Write tests for authentication flows

## Acceptance Criteria
- Users can register with email/password
- Users can log in with email/password
- Users can reset forgotten passwords
- Authentication state persists across app restarts
- All authentication flows have proper error handling
EOF
)" \
    "enhancement,feature,authentication"

echo ""

# Issue 2: Camera Photo Capture
create_issue \
    "Implement Camera Photo Capture" \
    "$(cat << 'EOF'
Enable users to capture photos using the device camera with React Native Vision Camera.

## Tasks
- [ ] Configure camera permissions for iOS and Android
- [ ] Create camera screen UI with capture button
- [ ] Implement photo capture functionality
- [ ] Add camera flip (front/back) toggle
- [ ] Implement flash control
- [ ] Add preview before confirming photo
- [ ] Handle camera permissions denial gracefully
- [ ] Optimize photo quality and size
- [ ] Write tests for camera functionality

## Acceptance Criteria
- Users can access device camera
- Users can capture photos in high quality
- Users can switch between front and back cameras
- Photo preview shows before saving
- Proper error handling for permission issues
EOF
)" \
    "enhancement,feature,camera"

echo ""

# Issue 3: Cloud Photo Storage
create_issue \
    "Implement Cloud Photo Storage" \
    "$(cat << 'EOF'
Implement photo upload and storage functionality using Firebase Cloud Storage.

## Tasks
- [ ] Set up Firebase Storage SDK integration
- [ ] Create upload service with progress tracking
- [ ] Implement image compression before upload
- [ ] Add upload queue for multiple photos
- [ ] Create storage folder structure (user-based)
- [ ] Implement upload retry logic for failed uploads
- [ ] Add image metadata (timestamp, location, etc.)
- [ ] Create thumbnail generation
- [ ] Write tests for storage operations

## Acceptance Criteria
- Photos upload to Firebase Storage successfully
- Upload progress is displayed to users
- Failed uploads are retried automatically
- Photos are compressed to optimize storage
- Proper error handling for upload failures
EOF
)" \
    "enhancement,feature,storage"

echo ""

# Issue 4: Real-time Photo Feed
create_issue \
    "Implement Real-time Photo Feed" \
    "$(cat << 'EOF'
Create a real-time photo feed that displays photos from all users with live updates using Firebase Firestore.

## Tasks
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

## Acceptance Criteria
- Feed displays all user photos in chronological order
- New photos appear automatically without refresh
- Smooth infinite scroll with pagination
- Images load efficiently with caching
- Proper loading and error states
EOF
)" \
    "enhancement,feature,feed"

echo ""

# Issue 5: User Profiles
create_issue \
    "Implement User Profiles" \
    "$(cat << 'EOF'
Create user profile pages with customizable profile information and user-specific photo galleries.

## Tasks
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

## Acceptance Criteria
- Users can view their own profile
- Users can edit profile information
- Users can upload profile photos
- Profile displays user's photo gallery
- Users can view other users' profiles
EOF
)" \
    "enhancement,feature,profile"

echo ""

# Issue 6: Social Features
create_issue \
    "Implement Social Features (Likes & Comments)" \
    "$(cat << 'EOF'
Add social interaction features including likes and comments on photos.

## Tasks
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

## Acceptance Criteria
- Users can like/unlike photos
- Like count updates in real-time
- Users can add comments to photos
- Comments update in real-time
- Users can delete their own comments
- Proper validation and error handling
EOF
)" \
    "enhancement,feature,social"

echo ""

# Issue 7: Add Tests for Remaining Screens
create_issue \
    "Add Tests for Remaining Screens" \
    "$(cat << 'EOF'
Expand test coverage by adding comprehensive tests for all remaining screens in the application.

## Priority Screens
- [ ] RegisterScreen
- [ ] HomeScreen
- [ ] ProfileScreen
- [ ] CameraScreen
- [ ] SettingsScreen
- [ ] EditProfileScreen
- [ ] SearchScreen
- [ ] MessagesScreen
- [ ] NotificationsScreen

## Tasks
- [ ] Write unit tests for each screen component
- [ ] Test user interactions (button clicks, input changes)
- [ ] Test navigation between screens
- [ ] Test error states and loading states
- [ ] Mock Firebase services appropriately
- [ ] Ensure 100% coverage for each screen

## Acceptance Criteria
- All screens have test files
- 100% statement and branch coverage for tested screens
- All user interactions are tested
- All tests pass successfully
EOF
)" \
    "testing,quality"

echo ""

# Issue 8: Navigation Tests
create_issue \
    "Add Tests for Navigation Components" \
    "$(cat << 'EOF'
Create tests for all navigation components to ensure proper routing and navigation flows.

## Components to Test
- [ ] AuthNavigator.tsx
- [ ] HomeStackNavigator.tsx
- [ ] MainTabNavigator.tsx
- [ ] MessagesStackNavigator.tsx
- [ ] ProfileStackNavigator.tsx

## Tasks
- [ ] Write tests for each navigator
- [ ] Test navigation between screens
- [ ] Test navigation parameters
- [ ] Test authentication guards
- [ ] Test deep linking (if implemented)
- [ ] Mock React Navigation appropriately

## Acceptance Criteria
- All navigators have test coverage
- Navigation flows are tested end-to-end
- Tests verify correct screen transitions
- All tests pass successfully
EOF
)" \
    "testing,quality"

echo ""

# Issue 9: Increase Code Coverage
create_issue \
    "Increase Overall Code Coverage to 60%+" \
    "$(cat << 'EOF'
Systematically increase code coverage from current 10.09% to at least 60%.

## Current Coverage
- Statements: 10.09%
- Branch: 24.39%
- Functions: 10.47%
- Lines: 8.54%

## Target Coverage
- Statements: 60%+
- Branch: 60%+
- Functions: 60%+
- Lines: 60%+

## Tasks
- [ ] Add tests for services layer
- [ ] Add tests for utility functions
- [ ] Add tests for store/state management
- [ ] Add tests for remaining components
- [ ] Add integration tests
- [ ] Set up coverage thresholds in Jest config
- [ ] Add coverage reporting to CI/CD

## Acceptance Criteria
- Overall coverage reaches 60% or higher
- Coverage report shows improvement in all metrics
- No critical code paths left untested
- Coverage thresholds enforced in CI
EOF
)" \
    "testing,quality,high-priority"

echo ""

# Issue 10: CI/CD Pipeline
create_issue \
    "Set Up CI/CD Pipeline with Automated Testing" \
    "$(cat << 'EOF'
Configure continuous integration and continuous deployment pipeline with automated testing.

## Tasks
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

## Acceptance Criteria
- Tests run automatically on every PR
- Build succeeds on both platforms
- Failed tests block PR merging
- Coverage reports are generated
- Status badges show build/test status
EOF
)" \
    "devops,testing,automation"

echo ""

# Issue 11: E2E Tests
create_issue \
    "Add End-to-End Tests with Detox" \
    "$(cat << 'EOF'
Implement end-to-end testing using Detox to test complete user flows across the application.

## Tasks
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

## Critical User Flows to Test
- [ ] User registration and login
- [ ] Photo capture and upload
- [ ] Browsing and refreshing feed
- [ ] Liking and commenting on photos
- [ ] Viewing and editing profile

## Acceptance Criteria
- Detox is properly configured for both platforms
- Critical user flows have E2E test coverage
- E2E tests run in CI pipeline
- All E2E tests pass consistently
EOF
)" \
    "testing,e2e,quality"

echo ""

# Issue 12: API Documentation
create_issue \
    "Create API Documentation" \
    "$(cat << 'EOF'
Document all API endpoints, Firebase services integration, and data models.

## Tasks
- [ ] Document Firestore data schema
- [ ] Document Firebase Storage structure
- [ ] Document authentication flows
- [ ] Create API reference for services
- [ ] Add JSDoc comments to service files
- [ ] Create data flow diagrams
- [ ] Document error handling patterns

## Acceptance Criteria
- All services are documented
- Data schemas are clearly defined
- API reference is easy to navigate
- Examples provided for common operations
EOF
)" \
    "documentation"

echo ""

# Issue 13: Performance Monitoring
create_issue \
    "Add Performance Monitoring" \
    "$(cat << 'EOF'
Implement performance monitoring to track app performance and identify bottlenecks.

## Tasks
- [ ] Set up Firebase Performance Monitoring
- [ ] Add custom performance traces
- [ ] Monitor app startup time
- [ ] Monitor screen rendering performance
- [ ] Monitor network request performance
- [ ] Set up performance alerts
- [ ] Create performance dashboard
- [ ] Document performance metrics

## Acceptance Criteria
- Performance monitoring is active
- Key metrics are tracked
- Performance reports are accessible
- Alerts trigger for performance issues
EOF
)" \
    "enhancement,monitoring,performance"

echo ""
echo -e "${GREEN}Done! All issues have been created.${NC}"
echo "View all issues at: https://github.com/$REPO/issues"
