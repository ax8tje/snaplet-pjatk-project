#!/usr/bin/env node

/**
 * Script to create GitHub issues and labels from BACKEND_ISSUES.md
 * Usage: GITHUB_TOKEN=your_token node create-issues.js
 */

const https = require('https');

const OWNER = 'ax8tje';
const REPO = 'snaplet-pjatk-project';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.error('\nTo get a token:');
  console.error('1. Go to https://github.com/settings/tokens');
  console.error('2. Click "Generate new token (classic)"');
  console.error('3. Select scopes: repo (all)');
  console.error('4. Generate and copy the token');
  console.error('\nThen run: GITHUB_TOKEN=your_token node create-issues.js');
  process.exit(1);
}

// Labels to create
const labels = [
  { name: 'backend', color: '0052CC', description: 'Backend related tasks' },
  { name: 'frontend', color: '1d76db', description: 'Frontend related tasks' },
  { name: 'infrastructure', color: '0E8A16', description: 'Infrastructure and DevOps' },
  { name: 'service', color: '5319e7', description: 'Service layer implementation' },
  { name: 'state-management', color: 'c5def5', description: 'State management (Zustand)' },
  { name: 'integration', color: 'f9d0c4', description: 'Screen/component integration' },
  { name: 'security', color: 'd93f0b', description: 'Security related tasks' },
  { name: 'high-priority', color: 'B60205', description: 'High priority - do first' },
  { name: 'medium-priority', color: 'FBCA04', description: 'Medium priority' },
  { name: 'low-priority', color: 'D4C5F9', description: 'Low priority' },
];

// Issues to create
const issues = [
  {
    title: 'Firebase Project Setup and Configuration',
    labels: ['backend', 'infrastructure', 'high-priority'],
    body: `## Description
Set up the Firebase project and configure it for the web application.

## Tasks
- [ ] Create Firebase project in Firebase Console
- [ ] Enable Firebase Authentication
- [ ] Enable Firestore Database
- [ ] Enable Firebase Storage
- [ ] Add web app to Firebase project
- [ ] Generate Firebase config object
- [ ] Create \`.env\` file with Firebase credentials
- [ ] Update \`src/utils/firebase.web.js\` with real config
- [ ] Test Firebase initialization
- [ ] Document setup process in README

## Files to Create/Modify
- \`.env\` (create)
- \`src/utils/firebase.web.js\` (update)
- \`README.md\` (update with setup instructions)

## Acceptance Criteria
- Firebase project is created and configured
- Web app can connect to Firebase
- All Firebase services are enabled
- Configuration is properly secured in \`.env\`
- Setup documentation is complete

## Priority
High

## Estimated Effort
2-3 hours`
  },
  {
    title: 'Firestore Security Rules',
    labels: ['backend', 'security', 'high-priority'],
    body: `## Description
Define and implement Firestore security rules to protect user data.

## Tasks
- [ ] Create \`firestore.rules\` file
- [ ] Define rules for \`users\` collection
- [ ] Define rules for \`posts\` collection
- [ ] Define rules for \`comments\` collection
- [ ] Define rules for \`likes\` collection
- [ ] Define rules for \`messages\` collection
- [ ] Add validation rules for required fields
- [ ] Test rules with Firebase Emulator
- [ ] Deploy rules to Firebase

## Collections Structure
\`\`\`
users/{userId}
  - email, displayName, photoURL, bio, createdAt

posts/{postId}
  - userId, imageUrl, thumbnailUrl, caption, createdAt, likes, commentCount

comments/{commentId}
  - postId, userId, text, createdAt

likes/{likeId}
  - postId, userId, createdAt

messages/{messageId}
  - senderId, receiverId, text, createdAt, read
\`\`\`

## Security Requirements
- Users can only read/write their own user document
- Users can create posts but only edit/delete their own
- Users can read all posts
- Users can only delete their own comments
- Users can only create/delete their own likes
- Users can only read messages they're part of

## Files to Create
- \`firestore.rules\`

## Acceptance Criteria
- Security rules are defined for all collections
- Rules enforce proper authentication
- Rules validate data structure
- Rules are tested and deployed

## Priority
High

## Estimated Effort
3-4 hours`
  },
  {
    title: 'Firebase Storage Security Rules',
    labels: ['backend', 'security', 'high-priority'],
    body: `## Description
Define and implement Storage security rules for photo uploads.

## Tasks
- [ ] Create \`storage.rules\` file
- [ ] Define rules for photo uploads
- [ ] Restrict file types to images only
- [ ] Set maximum file size limit (10MB)
- [ ] Ensure users can only upload to their own folder
- [ ] Allow public read access to uploaded images
- [ ] Test rules with Firebase Emulator
- [ ] Deploy rules to Firebase

## Storage Structure
\`\`\`
users/{userId}/posts/{postId}/{filename}
users/{userId}/profile/{filename}
\`\`\`

## Security Requirements
- Only authenticated users can upload
- Users can only upload to their own folders
- File size limit: 10MB
- Only image file types allowed
- Public read access for all images

## Files to Create
- \`storage.rules\`

## Acceptance Criteria
- Storage rules are defined
- File type and size restrictions work
- Users can only upload to their folders
- Rules are tested and deployed

## Priority
High

## Estimated Effort
2 hours`
  },
  {
    title: 'Authentication Service',
    labels: ['backend', 'service', 'high-priority'],
    body: `## Description
Create authentication service to handle user sign up, login, logout, and password management.

## Tasks
- [ ] Create \`src/services/\` directory
- [ ] Create \`src/services/authService.js\`
- [ ] Implement \`signUp(email, password, displayName)\` function
- [ ] Implement \`signIn(email, password)\` function
- [ ] Implement \`signOut()\` function
- [ ] Implement \`resetPassword(email)\` function
- [ ] Implement \`updateProfile(displayName, photoURL)\` function
- [ ] Implement \`getCurrentUser()\` function
- [ ] Implement \`onAuthStateChanged(callback)\` listener
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Functions to Implement
\`\`\`javascript
export const signUp = async (email, password, displayName) => {}
export const signIn = async (email, password) => {}
export const signOut = async () => {}
export const resetPassword = async (email) => {}
export const updateProfile = async (displayName, photoURL) => {}
export const getCurrentUser = () => {}
export const onAuthStateChanged = (callback) => {}
\`\`\`

## Files to Create
- \`src/services/authService.js\`
- \`src/services/__tests__/authService.test.js\`

## Acceptance Criteria
- All authentication functions work correctly
- Errors are properly caught and returned
- User data is created in Firestore on sign up
- Functions are well documented
- Unit tests pass

## Priority
High

## Estimated Effort
4-5 hours

## Dependencies
Requires: Firebase Project Setup (#1)`
  },
  {
    title: 'Firestore Database Service',
    labels: ['backend', 'service', 'high-priority'],
    body: `## Description
Create a base Firestore service with common CRUD operations.

## Tasks
- [ ] Create \`src/services/firestoreService.js\`
- [ ] Implement \`createDocument(collection, data)\` function
- [ ] Implement \`getDocument(collection, docId)\` function
- [ ] Implement \`updateDocument(collection, docId, data)\` function
- [ ] Implement \`deleteDocument(collection, docId)\` function
- [ ] Implement \`queryDocuments(collection, conditions)\` function
- [ ] Implement \`subscribeToDocument(collection, docId, callback)\` function
- [ ] Implement \`subscribeToCollection(collection, conditions, callback)\` function
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Functions to Implement
\`\`\`javascript
export const createDocument = async (collection, data) => {}
export const getDocument = async (collection, docId) => {}
export const updateDocument = async (collection, docId, data) => {}
export const deleteDocument = async (collection, docId) => {}
export const queryDocuments = async (collection, conditions) => {}
export const subscribeToDocument = (collection, docId, callback) => {}
export const subscribeToCollection = (collection, conditions, callback) => {}
\`\`\`

## Files to Create
- \`src/services/firestoreService.js\`
- \`src/services/__tests__/firestoreService.test.js\`

## Acceptance Criteria
- All CRUD operations work correctly
- Real-time subscriptions work properly
- Errors are properly handled
- Functions are well documented
- Unit tests pass

## Priority
High

## Estimated Effort
4-5 hours

## Dependencies
Requires: Firebase Project Setup (#1)`
  },
  {
    title: 'Storage Service',
    labels: ['backend', 'service', 'high-priority'],
    body: `## Description
Create storage service to handle photo uploads, compression, and management.

## Tasks
- [ ] Create \`src/services/storageService.js\`
- [ ] Implement \`uploadPhoto(file, userId, path)\` function with progress
- [ ] Implement \`compressImage(file, maxWidth, maxHeight)\` function
- [ ] Implement \`generateThumbnail(file)\` function
- [ ] Implement \`deletePhoto(photoUrl)\` function
- [ ] Implement \`getDownloadURL(path)\` function
- [ ] Add upload progress callbacks
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Functions to Implement
\`\`\`javascript
export const uploadPhoto = async (file, userId, path, onProgress) => {}
export const compressImage = async (file, maxWidth = 1080, maxHeight = 1080, quality = 0.8) => {}
export const generateThumbnail = async (file) => {}
export const deletePhoto = async (photoUrl) => {}
export const getDownloadURL = async (path) => {}
\`\`\`

## Technical Requirements
- Compress images to max 1080px width/height
- Generate thumbnails (300px max dimension)
- Support upload progress tracking
- Support cancellation of uploads
- Return download URLs after upload

## Files to Create
- \`src/services/storageService.js\`
- \`src/services/__tests__/storageService.test.js\`

## Acceptance Criteria
- Photos upload successfully with compression
- Thumbnails are generated correctly
- Upload progress is tracked
- Download URLs are returned
- Functions are well documented
- Unit tests pass

## Priority
High

## Estimated Effort
5-6 hours

## Dependencies
Requires: Firebase Project Setup (#1), Firebase Storage Security Rules (#3)`
  },
  {
    title: 'Post Service',
    labels: ['backend', 'service', 'high-priority'],
    body: `## Description
Create post service to manage post creation, retrieval, updates, and deletion.

## Tasks
- [ ] Create \`src/services/postService.js\`
- [ ] Implement \`createPost(userId, imageFile, caption)\` function
- [ ] Implement \`getPost(postId)\` function
- [ ] Implement \`updatePost(postId, data)\` function
- [ ] Implement \`deletePost(postId)\` function
- [ ] Implement \`getFeedPosts(limit, lastDoc)\` function for pagination
- [ ] Implement \`getUserPosts(userId)\` function
- [ ] Implement \`subscribeToFeed(callback, limit)\` function
- [ ] Implement post like count increment/decrement
- [ ] Implement post comment count increment/decrement
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Post Schema
\`\`\`javascript
{
  postId: string,
  userId: string,
  imageUrl: string,
  thumbnailUrl: string,
  caption: string,
  likes: number,
  commentCount: number,
  createdAt: timestamp
}
\`\`\`

## Files to Create
- \`src/services/postService.js\`
- \`src/services/__tests__/postService.test.js\`

## Acceptance Criteria
- Posts can be created with photo upload
- Posts can be fetched, updated, and deleted
- Feed displays posts in reverse chronological order
- Pagination works correctly
- Like and comment counts update properly
- Real-time feed updates work
- Functions are well documented
- Unit tests pass

## Priority
High

## Estimated Effort
6-7 hours

## Dependencies
Requires: Firestore Database Service (#5), Storage Service (#6)`
  },
  {
    title: 'User Service',
    labels: ['backend', 'service', 'medium-priority'],
    body: `## Description
Create user service to manage user profiles and user-related operations.

## Tasks
- [ ] Create \`src/services/userService.js\`
- [ ] Implement \`createUserProfile(userId, data)\` function
- [ ] Implement \`getUserProfile(userId)\` function
- [ ] Implement \`updateUserProfile(userId, data)\` function
- [ ] Implement \`getUserPosts(userId)\` function
- [ ] Implement \`searchUsers(query)\` function
- [ ] Implement \`subscribeToUser(userId, callback)\` function
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## User Profile Schema
\`\`\`javascript
{
  userId: string,
  email: string,
  displayName: string,
  photoURL: string,
  bio: string,
  createdAt: timestamp,
  postCount: number
}
\`\`\`

## Files to Create
- \`src/services/userService.js\`
- \`src/services/__tests__/userService.test.js\`

## Acceptance Criteria
- User profiles can be created and updated
- User data can be fetched and subscribed to
- User search works correctly
- Functions are well documented
- Unit tests pass

## Priority
Medium

## Estimated Effort
4 hours

## Dependencies
Requires: Firestore Database Service (#5)`
  },
  {
    title: 'Comment Service',
    labels: ['backend', 'service', 'medium-priority'],
    body: `## Description
Create comment service to manage comments on posts.

## Tasks
- [ ] Create \`src/services/commentService.js\`
- [ ] Implement \`createComment(postId, userId, text)\` function
- [ ] Implement \`getComment(commentId)\` function
- [ ] Implement \`getPostComments(postId)\` function
- [ ] Implement \`deleteComment(commentId, postId)\` function
- [ ] Implement \`subscribeToPostComments(postId, callback)\` function
- [ ] Update post comment count on create/delete
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Comment Schema
\`\`\`javascript
{
  commentId: string,
  postId: string,
  userId: string,
  text: string,
  createdAt: timestamp
}
\`\`\`

## Files to Create
- \`src/services/commentService.js\`
- \`src/services/__tests__/commentService.test.js\`

## Acceptance Criteria
- Comments can be created and deleted
- Comments are fetched in chronological order
- Real-time comment updates work
- Post comment count is updated correctly
- Functions are well documented
- Unit tests pass

## Priority
Medium

## Estimated Effort
3-4 hours

## Dependencies
Requires: Firestore Database Service (#5), Post Service (#8)`
  },
  {
    title: 'Like Service',
    labels: ['backend', 'service', 'medium-priority'],
    body: `## Description
Create like service to manage likes on posts.

## Tasks
- [ ] Create \`src/services/likeService.js\`
- [ ] Implement \`likePost(postId, userId)\` function
- [ ] Implement \`unlikePost(postId, userId)\` function
- [ ] Implement \`isPostLikedByUser(postId, userId)\` function
- [ ] Implement \`getPostLikes(postId)\` function
- [ ] Implement \`subscribeToPostLikes(postId, callback)\` function
- [ ] Update post like count on like/unlike
- [ ] Prevent duplicate likes
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Like Schema
\`\`\`javascript
{
  likeId: string, // Use composite key: \${postId}_\${userId}
  postId: string,
  userId: string,
  createdAt: timestamp
}
\`\`\`

## Files to Create
- \`src/services/likeService.js\`
- \`src/services/__tests__/likeService.test.js\`

## Acceptance Criteria
- Users can like and unlike posts
- Duplicate likes are prevented
- Post like count is updated correctly
- Real-time like updates work
- Functions are well documented
- Unit tests pass

## Priority
Medium

## Estimated Effort
3-4 hours

## Dependencies
Requires: Firestore Database Service (#5), Post Service (#8)`
  },
  {
    title: 'Message Service',
    labels: ['backend', 'service', 'low-priority'],
    body: `## Description
Create message service for real-time messaging between users.

## Tasks
- [ ] Create \`src/services/messageService.js\`
- [ ] Implement \`sendMessage(senderId, receiverId, text)\` function
- [ ] Implement \`getConversation(userId1, userId2)\` function
- [ ] Implement \`getConversations(userId)\` function
- [ ] Implement \`markMessageAsRead(messageId)\` function
- [ ] Implement \`subscribeToConversation(userId1, userId2, callback)\` function
- [ ] Implement \`subscribeToConversations(userId, callback)\` function
- [ ] Add error handling for all functions
- [ ] Add JSDoc documentation
- [ ] Write unit tests

## Message Schema
\`\`\`javascript
{
  messageId: string,
  senderId: string,
  receiverId: string,
  text: string,
  read: boolean,
  createdAt: timestamp
}
\`\`\`

## Files to Create
- \`src/services/messageService.js\`
- \`src/services/__tests__/messageService.test.js\`

## Acceptance Criteria
- Messages can be sent between users
- Conversations are fetched in chronological order
- Real-time message updates work
- Unread messages can be tracked
- Functions are well documented
- Unit tests pass

## Priority
Low

## Estimated Effort
5-6 hours

## Dependencies
Requires: Firestore Database Service (#5)`
  },
  {
    title: 'Authentication Store (Zustand)',
    labels: ['frontend', 'state-management', 'high-priority'],
    body: `## Description
Create Zustand store for managing authentication state.

## Tasks
- [ ] Create \`src/store/\` directory
- [ ] Create \`src/store/authStore.js\`
- [ ] Implement state: \`user\`, \`isAuthenticated\`, \`isLoading\`, \`error\`
- [ ] Implement \`setUser(user)\` action
- [ ] Implement \`clearUser()\` action
- [ ] Implement \`setLoading(isLoading)\` action
- [ ] Implement \`setError(error)\` action
- [ ] Implement \`initializeAuth()\` action to set up auth listener
- [ ] Persist authentication state to localStorage
- [ ] Add TypeScript types (optional but recommended)
- [ ] Write unit tests

## Store Structure
\`\`\`javascript
{
  user: null | { userId, email, displayName, photoURL },
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setUser: (user) => {},
  clearUser: () => {},
  setLoading: (isLoading) => {},
  setError: (error) => {},
  initializeAuth: () => {}
}
\`\`\`

## Files to Create
- \`src/store/authStore.js\`
- \`src/store/__tests__/authStore.test.js\`

## Acceptance Criteria
- Authentication state is managed correctly
- State persists across page refreshes
- Auth listener is set up on initialization
- Store is well documented
- Unit tests pass

## Priority
High

## Estimated Effort
3 hours

## Dependencies
Requires: Authentication Service (#4)`
  },
  {
    title: 'User Store (Zustand)',
    labels: ['frontend', 'state-management', 'medium-priority'],
    body: `## Description
Create Zustand store for managing user profile data.

## Tasks
- [ ] Create \`src/store/userStore.js\`
- [ ] Implement state: \`currentUserProfile\`, \`viewedUserProfile\`, \`isLoading\`, \`error\`
- [ ] Implement \`setCurrentUserProfile(profile)\` action
- [ ] Implement \`setViewedUserProfile(profile)\` action
- [ ] Implement \`updateCurrentUserProfile(data)\` action
- [ ] Implement \`loadCurrentUserProfile(userId)\` action
- [ ] Implement \`loadViewedUserProfile(userId)\` action
- [ ] Implement \`setLoading(isLoading)\` action
- [ ] Implement \`setError(error)\` action
- [ ] Write unit tests

## Files to Create
- \`src/store/userStore.js\`
- \`src/store/__tests__/userStore.test.js\`

## Acceptance Criteria
- User profile state is managed correctly
- Current and viewed profiles are separate
- Profile data loads correctly
- Store is well documented
- Unit tests pass

## Priority
Medium

## Estimated Effort
2-3 hours

## Dependencies
Requires: User Service (#8)`
  },
  {
    title: 'Feed Store (Zustand)',
    labels: ['frontend', 'state-management', 'high-priority'],
    body: `## Description
Create Zustand store for managing the posts feed.

## Tasks
- [ ] Create \`src/store/feedStore.js\`
- [ ] Implement state: \`posts\`, \`isLoading\`, \`error\`, \`hasMore\`, \`lastDoc\`
- [ ] Implement \`setPosts(posts)\` action
- [ ] Implement \`addPost(post)\` action
- [ ] Implement \`updatePost(postId, data)\` action
- [ ] Implement \`removePost(postId)\` action
- [ ] Implement \`loadFeed(refresh)\` action with pagination
- [ ] Implement \`loadMorePosts()\` action
- [ ] Implement \`subscribeToFeed()\` action for real-time updates
- [ ] Implement \`setLoading(isLoading)\` action
- [ ] Implement \`setError(error)\` action
- [ ] Write unit tests

## Files to Create
- \`src/store/feedStore.js\`
- \`src/store/__tests__/feedStore.test.js\`

## Acceptance Criteria
- Feed state is managed correctly
- Pagination works properly
- Real-time updates are handled
- Loading and error states work
- Store is well documented
- Unit tests pass

## Priority
High

## Estimated Effort
4-5 hours

## Dependencies
Requires: Post Service (#7)`
  },
  {
    title: 'Message Store (Zustand)',
    labels: ['frontend', 'state-management', 'low-priority'],
    body: `## Description
Create Zustand store for managing messages and conversations.

## Tasks
- [ ] Create \`src/store/messageStore.js\`
- [ ] Implement state: \`conversations\`, \`currentConversation\`, \`messages\`, \`isLoading\`, \`error\`
- [ ] Implement \`setConversations(conversations)\` action
- [ ] Implement \`setCurrentConversation(userId)\` action
- [ ] Implement \`setMessages(messages)\` action
- [ ] Implement \`addMessage(message)\` action
- [ ] Implement \`loadConversations(userId)\` action
- [ ] Implement \`loadMessages(userId1, userId2)\` action
- [ ] Implement \`sendMessage(senderId, receiverId, text)\` action
- [ ] Implement \`subscribeToConversations(userId)\` action
- [ ] Implement \`subscribeToMessages(userId1, userId2)\` action
- [ ] Implement \`setLoading(isLoading)\` action
- [ ] Implement \`setError(error)\` action
- [ ] Write unit tests

## Files to Create
- \`src/store/messageStore.js\`
- \`src/store/__tests__/messageStore.test.js\`

## Acceptance Criteria
- Message state is managed correctly
- Conversations list is maintained
- Real-time message updates work
- Store is well documented
- Unit tests pass

## Priority
Low

## Estimated Effort
4-5 hours

## Dependencies
Requires: Message Service (#11)`
  },
  {
    title: 'Integrate LoginScreen with Backend',
    labels: ['frontend', 'integration', 'high-priority'],
    body: `## Description
Connect LoginScreen to the authentication service and store.

## Tasks
- [ ] Import \`authStore\` and \`authService\`
- [ ] Connect email input to state
- [ ] Connect password input to state
- [ ] Implement login button handler using \`authService.signIn()\`
- [ ] Update UI based on auth store state
- [ ] Show loading indicator during login
- [ ] Display error messages from auth store
- [ ] Navigate to home on successful login
- [ ] Add "Forgot Password" functionality
- [ ] Add form validation
- [ ] Test login flow end-to-end

## Files to Modify
- \`src/screens/LoginScreen.js\`

## Acceptance Criteria
- Users can log in with email/password
- Loading states are displayed properly
- Error messages are shown appropriately
- Navigation works after successful login
- Form validation works correctly
- Forgot password link works

## Priority
High

## Estimated Effort
3-4 hours

## Dependencies
Requires: Authentication Service (#4), Authentication Store (#12)`
  },
  {
    title: 'Integrate RegisterScreen with Backend',
    labels: ['frontend', 'integration', 'high-priority'],
    body: `## Description
Connect RegisterScreen to the authentication service and store.

## Tasks
- [ ] Import \`authStore\` and \`authService\`
- [ ] Connect display name input to state
- [ ] Connect email input to state
- [ ] Connect password input to state
- [ ] Connect confirm password input to state
- [ ] Implement register button handler using \`authService.signUp()\`
- [ ] Update UI based on auth store state
- [ ] Show loading indicator during registration
- [ ] Display error messages from auth store
- [ ] Navigate to home on successful registration
- [ ] Add form validation (email format, password strength, passwords match)
- [ ] Test registration flow end-to-end

## Files to Modify
- \`src/screens/RegisterScreen.js\`

## Acceptance Criteria
- Users can register with email/password
- Display name is saved to user profile
- Loading states are displayed properly
- Error messages are shown appropriately
- Navigation works after successful registration
- Form validation works correctly
- User profile is created in Firestore

## Priority
High

## Estimated Effort
3-4 hours

## Dependencies
Requires: Authentication Service (#4), User Service (#8), Authentication Store (#12)`
  },
  {
    title: 'Integrate CameraScreen with Real Camera and Upload',
    labels: ['frontend', 'integration', 'high-priority'],
    body: `## Description
Implement real camera functionality and photo upload to Firebase Storage.

## Tasks
- [ ] Replace mock camera with real camera implementation
- [ ] Request camera permissions
- [ ] Implement camera capture functionality
- [ ] Show camera preview
- [ ] Implement photo review screen after capture
- [ ] Add caption input field
- [ ] Implement photo upload using \`storageService\` and \`postService\`
- [ ] Show upload progress bar
- [ ] Handle upload errors gracefully
- [ ] Navigate to home feed after successful post
- [ ] Add loading states
- [ ] Test camera and upload flow end-to-end

## Files to Modify
- \`src/screens/CameraScreen.js\`
- \`src/utils/camera.web.js\` (update for web camera access)

## Acceptance Criteria
- Camera permissions are requested and handled
- Camera preview works correctly
- Photos can be captured
- Users can add captions
- Photos upload to Firebase Storage with compression
- Posts are created in Firestore
- Upload progress is shown
- Navigation works after successful post
- Error handling works properly

## Priority
High

## Estimated Effort
6-8 hours

## Dependencies
Requires: Storage Service (#6), Post Service (#7)`
  },
  {
    title: 'Integrate HomeScreen with Real-time Feed',
    labels: ['frontend', 'integration', 'high-priority'],
    body: `## Description
Connect HomeScreen to display real-time posts from Firestore.

## Tasks
- [ ] Import \`feedStore\` and \`postService\`
- [ ] Load feed on component mount using \`feedStore.loadFeed()\`
- [ ] Subscribe to real-time feed updates
- [ ] Display posts from feed store
- [ ] Implement pull-to-refresh functionality
- [ ] Implement infinite scroll / load more posts
- [ ] Show loading indicators (initial load and pagination)
- [ ] Display empty state when no posts
- [ ] Handle errors gracefully
- [ ] Show user info (name, avatar) for each post
- [ ] Make posts clickable to navigate to PostDetailScreen
- [ ] Test feed functionality end-to-end

## Files to Modify
- \`src/screens/HomeScreen.js\`

## Acceptance Criteria
- Posts load from Firestore on mount
- Real-time updates work (new posts appear automatically)
- Pull-to-refresh works correctly
- Infinite scroll/pagination works
- Loading and error states are handled
- Empty state is shown when appropriate
- Posts display correct user info
- Navigation to post detail works

## Priority
High

## Estimated Effort
5-6 hours

## Dependencies
Requires: Post Service (#7), Feed Store (#14)`
  },
  {
    title: 'Integrate ProfileScreen with User Data',
    labels: ['frontend', 'integration', 'medium-priority'],
    body: `## Description
Connect ProfileScreen to display user profile and posts from Firestore.

## Tasks
- [ ] Import \`authStore\`, \`userStore\`, and \`postService\`
- [ ] Load user profile on component mount
- [ ] Display user info (name, email, avatar, bio, post count)
- [ ] Load and display user's posts in grid layout
- [ ] Implement edit profile functionality
- [ ] Allow users to upload profile photo
- [ ] Implement logout functionality
- [ ] Show loading indicators
- [ ] Handle errors gracefully
- [ ] Make posts clickable to navigate to PostDetailScreen
- [ ] Test profile functionality end-to-end

## Files to Modify
- \`src/screens/ProfileScreen.js\`

## Acceptance Criteria
- User profile loads correctly
- User posts are displayed in grid
- Edit profile works (update name, bio)
- Profile photo upload works
- Logout works correctly
- Loading and error states are handled
- Navigation to post detail works

## Priority
Medium

## Estimated Effort
5-6 hours

## Dependencies
Requires: User Service (#8), Post Service (#7), User Store (#13)`
  },
  {
    title: 'Integrate MessagesScreen with Real-time Messaging',
    labels: ['frontend', 'integration', 'low-priority'],
    body: `## Description
Connect MessagesScreen to display conversations and implement messaging.

## Tasks
- [ ] Import \`messageStore\` and \`messageService\`
- [ ] Load conversations on component mount
- [ ] Subscribe to real-time conversation updates
- [ ] Display list of conversations with last message
- [ ] Show unread message indicators
- [ ] Navigate to ChatScreen when conversation is tapped
- [ ] Implement search conversations functionality
- [ ] Show loading indicators
- [ ] Handle errors gracefully
- [ ] Display empty state when no conversations
- [ ] Test messaging functionality end-to-end

## Files to Modify
- \`src/screens/MessagesScreen.js\`

## Acceptance Criteria
- Conversations load correctly
- Real-time updates work
- Last messages are displayed
- Unread indicators work
- Navigation to chat works
- Search functionality works
- Loading and error states are handled
- Empty state is shown when appropriate

## Priority
Low

## Estimated Effort
4-5 hours

## Dependencies
Requires: Message Service (#11), Message Store (#15)`
  },
  {
    title: 'Integrate PostDetailScreen with Comments and Likes',
    labels: ['frontend', 'integration', 'medium-priority'],
    body: `## Description
Connect PostDetailScreen to display and manage comments and likes.

## Tasks
- [ ] Import necessary services: \`postService\`, \`commentService\`, \`likeService\`
- [ ] Load post details on component mount
- [ ] Load and display comments from Firestore
- [ ] Subscribe to real-time comment updates
- [ ] Implement add comment functionality
- [ ] Implement like/unlike functionality
- [ ] Subscribe to real-time like updates
- [ ] Display user info for comments (name, avatar)
- [ ] Allow comment authors to delete their comments
- [ ] Show loading states
- [ ] Handle errors gracefully
- [ ] Test post detail functionality end-to-end

## Files to Modify
- \`src/screens/PostDetailScreen.js\`

## Acceptance Criteria
- Post details are displayed correctly
- Comments load and display properly
- Real-time comment updates work
- Users can add new comments
- Users can like/unlike posts
- Real-time like updates work
- Comment authors can delete their comments
- Loading and error states are handled

## Priority
Medium

## Estimated Effort
5-6 hours

## Dependencies
Requires: Post Service (#7), Comment Service (#9), Like Service (#10)`
  },
];

// Helper function to make GitHub API requests
function githubRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}${path}`,
      method: method,
      headers: {
        'User-Agent': 'Node.js Script',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else if (res.statusCode === 422 && body.includes('already_exists')) {
          // Label already exists, that's okay
          resolve({ message: 'already exists' });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Create labels
async function createLabels() {
  console.log('\n🏷️  Creating labels...\n');

  for (const label of labels) {
    try {
      await githubRequest('/labels', 'POST', label);
      console.log(`✅ Created label: ${label.name}`);
    } catch (error) {
      if (error.message.includes('already_exists')) {
        console.log(`⚠️  Label already exists: ${label.name}`);
      } else {
        console.error(`❌ Failed to create label ${label.name}:`, error.message);
      }
    }
    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Create issues
async function createIssues() {
  console.log('\n📝 Creating issues...\n');

  let issueNumber = 1;
  for (const issue of issues) {
    try {
      const result = await githubRequest('/issues', 'POST', issue);
      console.log(`✅ Created issue #${issueNumber}: ${issue.title}`);
      console.log(`   URL: ${result.html_url}`);
      issueNumber++;
    } catch (error) {
      console.error(`❌ Failed to create issue "${issue.title}":`, error.message);
    }
    // Rate limiting: wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Main function
async function main() {
  console.log('🚀 Creating GitHub labels and issues...');
  console.log(`📦 Repository: ${OWNER}/${REPO}\n`);

  try {
    await createLabels();
    await createIssues();
    console.log('\n✨ Done! All labels and issues have been created.\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
