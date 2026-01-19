# How to Create GitHub Issues Automatically

I've created a script that will automatically create all 22 backend issues and the necessary labels on your GitHub repository.

## Quick Start

### Step 1: Get a GitHub Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name like "Create Issues Script"
4. Select the **`repo`** scope (check all boxes under repo)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### Step 2: Run the Script

```bash
# Run the script with your token
GITHUB_TOKEN=your_token_here node create-issues.js
```

Replace `your_token_here` with the token you copied in Step 1.

### Step 3: Done!

The script will:
- ✅ Create 10 labels (backend, frontend, high-priority, etc.)
- ✅ Create all 22 issues with proper labels
- ✅ Print the URL for each created issue

## What Gets Created

### Labels
- `backend` (blue) - Backend related tasks
- `frontend` (blue) - Frontend related tasks
- `infrastructure` (green) - Infrastructure and DevOps
- `service` (purple) - Service layer implementation
- `state-management` (light blue) - State management (Zustand)
- `integration` (pink) - Screen/component integration
- `security` (red) - Security related tasks
- `high-priority` (red) - High priority - do first
- `medium-priority` (yellow) - Medium priority
- `low-priority` (purple) - Low priority

### 22 Issues

#### Infrastructure (3 issues)
1. Firebase Project Setup and Configuration
2. Firestore Security Rules
3. Firebase Storage Security Rules

#### Services (8 issues)
4. Authentication Service
5. Firestore Database Service
6. Storage Service
7. Post Service
8. User Service
9. Comment Service
10. Like Service
11. Message Service

#### State Management (4 issues)
12. Authentication Store (Zustand)
13. User Store (Zustand)
14. Feed Store (Zustand)
15. Message Store (Zustand)

#### Screen Integration (7 issues)
16. Integrate LoginScreen with Backend
17. Integrate RegisterScreen with Backend
18. Integrate CameraScreen with Real Camera and Upload
19. Integrate HomeScreen with Real-time Feed
20. Integrate ProfileScreen with User Data
21. Integrate MessagesScreen with Real-time Messaging
22. Integrate PostDetailScreen with Comments and Likes

## Troubleshooting

### "Error: GITHUB_TOKEN environment variable is required"
- Make sure you're passing the token correctly
- Use the format: `GITHUB_TOKEN=your_token node create-issues.js`

### "HTTP 401: Bad credentials"
- Your token might be invalid or expired
- Generate a new token and try again

### "HTTP 422: Validation Failed"
- Some labels or issues might already exist
- The script will skip existing labels and continue

### Rate Limiting
- The script includes delays to avoid rate limiting
- If you hit rate limits, wait a few minutes and run again

## Alternative: Manual Creation

If you prefer to create issues manually, all the issue details are in `BACKEND_ISSUES.md`. Just copy/paste each issue into GitHub.

## Security Note

**Never commit your GitHub token to git!** The token should only be used temporarily to run this script, then you can delete it from GitHub settings.
