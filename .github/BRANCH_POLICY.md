# Branch Policy and Git Workflow

This document outlines the branching strategy, naming conventions, and git workflow for the Snaplet PJATK project.

---

## Branch Structure

### Main Branches

#### `main` (or `master`)
- **Purpose**: Production-ready code
- **Protection**: Protected branch - requires PR approval
- **Deploy**: Automatically deploys to GitHub Pages
- **Rules**:
  - ❌ No direct commits
  - ✅ Only merge via Pull Requests
  - ✅ All tests must pass
  - ✅ Requires at least 1 approval (in team settings)
  - ✅ Must be up-to-date with base branch

#### `develop` (optional - for larger teams)
- **Purpose**: Integration branch for features
- **Protection**: Semi-protected
- **Rules**:
  - Merge feature branches here first
  - Regular merges to `main` after testing
  - Can have direct commits for small fixes

---

## Feature Branches

### Naming Convention
```
feature/<issue-number>-<short-description>
```

**Examples:**
- `feature/1-firebase-authentication`
- `feature/2-camera-photo-capture`
- `feature/4-realtime-photo-feed`

### Workflow
1. **Create branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/1-firebase-authentication
   ```

2. **Work on feature:**
   ```bash
   # Make changes
   git add .
   git commit -m "Add Firebase Auth SDK integration"
   git push -u origin feature/1-firebase-authentication
   ```

3. **Create Pull Request:**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select: `main` ← `feature/1-firebase-authentication`
   - Fill in PR template
   - Request review

4. **After approval:**
   ```bash
   # Merge via GitHub UI (Squash and merge recommended)
   # Then delete the branch
   ```

---

## Bug Fix Branches

### Naming Convention
```
bugfix/<issue-number>-<short-description>
fix/<issue-number>-<short-description>
```

**Examples:**
- `bugfix/23-login-crash`
- `fix/45-camera-permission-error`

### Workflow
Same as feature branches but:
- More urgent merging
- Can be created from `main` or `develop`
- Smaller, focused changes

---

## Hotfix Branches

### Naming Convention
```
hotfix/<critical-issue-description>
```

**Examples:**
- `hotfix/auth-security-vulnerability`
- `hotfix/app-crash-on-startup`

### Workflow
1. **Create from main** (production code)
2. **Fix immediately**
3. **Fast-track PR review**
4. **Merge to main AND develop** (if using develop branch)

---

## Release Branches (optional)

### Naming Convention
```
release/<version-number>
```

**Examples:**
- `release/1.0.0`
- `release/1.1.0`

### Workflow
1. Create from `develop` when ready for release
2. Only bug fixes allowed
3. Merge to `main` and tag with version
4. Merge back to `develop`

---

## Branch Protection Rules

### For `main` branch:

**Required Status Checks:**
- ✅ All tests must pass
- ✅ ESLint checks must pass
- ✅ TypeScript type checking must pass
- ✅ Build must succeed

**Pull Request Settings:**
- ✅ Require pull request before merging
- ✅ Require approvals: 1 (adjust based on team size)
- ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)

**Additional Settings:**
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ❌ Allow force pushes: Disabled
- ❌ Allow deletions: Disabled

### Setting up on GitHub:
1. Go to: `Settings` → `Branches`
2. Click `Add branch protection rule`
3. Branch name pattern: `main`
4. Configure settings as above

---

## Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config)
- **perf**: Performance improvements

### Examples

**Good:**
```bash
git commit -m "feat(auth): implement Firebase email/password authentication

- Add Firebase Auth SDK integration
- Create login and signup screens
- Add authentication state management with Zustand
- Add tests for auth flows

Closes #1"
```

```bash
git commit -m "fix(camera): handle permission denial gracefully

Previously app would crash if user denied camera permission.
Now shows appropriate error message.

Fixes #23"
```

**Bad:**
```bash
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "update"
```

---

## Pull Request Workflow

### 1. Before Creating PR

```bash
# Make sure you're on your feature branch
git checkout feature/1-firebase-authentication

# Update from main
git fetch origin main
git rebase origin/main

# Run tests locally
npm test

# Run linter
npm run lint

# Check TypeScript
npm run type-check
```

### 2. Create PR

**Title Format:**
```
[Feature] Implement Firebase Authentication (#1)
[Fix] Handle camera permission denial (#23)
[Docs] Update README with deployment instructions
```

**PR Description Template:**
```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #1

## Changes
- [ ] List of changes
- [ ] Another change

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### 3. Review Process

**As Author:**
- ✅ Respond to all comments
- ✅ Make requested changes
- ✅ Mark conversations as resolved
- ✅ Keep PR up to date with main

**As Reviewer:**
- ✅ Check code quality
- ✅ Verify tests are adequate
- ✅ Test functionality locally if needed
- ✅ Provide constructive feedback
- ✅ Approve when ready

### 4. Merging

**Merge Strategies:**

**Squash and Merge** (Recommended for most cases)
- Combines all commits into one
- Clean linear history
- Use for feature branches

**Merge Commit**
- Preserves all commits
- Shows full history
- Use for release branches

**Rebase and Merge**
- Linear history without merge commit
- Use for simple bug fixes

### 5. After Merge

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Delete local feature branch
git branch -d feature/1-firebase-authentication

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/1-firebase-authentication
```

---

## Special Cases

### Working with Claude Code

When Claude Code creates branches, they follow this pattern:
```
claude/<description>-<session-id>
```

**Examples:**
- `claude/github-issues-automation-UsM6t`
- `claude/fix-camera-permissions-Abc123`

**Rules for Claude branches:**
- ✅ Can be pushed to remote
- ✅ Can be merged via PR
- ✅ Session ID must match for push to work
- ⚠️ Should follow same PR process
- ⚠️ Requires review before merge

**Important:** Always create a PR even for Claude branches. Never merge directly to main.

---

## GitHub Pages Deployment Branch

### `gh-pages` branch
- **Purpose**: Hosts GitHub Pages content
- **Auto-generated**: By GitHub Pages or CI/CD
- **Source**: Usually the `docs/` folder on `main` branch
- ❌ Don't modify manually
- ✅ Updated automatically on main merge

**Setup:**
1. Go to: `Settings` → `Pages`
2. Source: `Deploy from branch`
3. Branch: `main` → `/docs` folder
4. Save

---

## Quick Reference

### Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/<number>-<description>
```

### Update Branch from Main
```bash
git checkout feature/<number>-<description>
git fetch origin main
git rebase origin/main
```

### Push Feature Branch
```bash
git push -u origin feature/<number>-<description>
```

### Clean Up After Merge
```bash
git checkout main
git pull origin main
git branch -d feature/<number>-<description>
```

---

## Best Practices

### DO ✅
- Create small, focused PRs
- Write clear commit messages
- Keep branches up to date
- Delete merged branches
- Run tests before pushing
- Request reviews promptly
- Respond to review comments
- Keep commits atomic (one logical change)

### DON'T ❌
- Commit directly to main
- Create huge PRs (500+ lines)
- Use vague commit messages
- Leave branches stale
- Ignore test failures
- Merge without review
- Force push to shared branches
- Mix unrelated changes

---

## CI/CD Integration

### Automated Checks on PR

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint
      - name: Type check
        run: npm run type-check
```

### Automated Deploy on Main Merge

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

---

## Troubleshooting

### Branch Push Fails (403 Error)
- **Cause**: Claude branch session ID mismatch
- **Solution**: Ensure branch starts with `claude/` and ends with matching session ID

### PR Cannot Be Merged
- **Conflicts**: Rebase on main and resolve conflicts
- **Failed Tests**: Fix issues and push new commits
- **Not Up to Date**: Merge or rebase with main

### Accidentally Committed to Main
```bash
# DON'T FORCE PUSH if already pushed!
# Instead, revert the commit
git revert <commit-hash>
git push origin main
```

---

## Resources

- [GitHub Flow Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

---

**Last Updated:** 2026-01-18
**Version:** 1.0
