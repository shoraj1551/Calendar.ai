# Branching Strategy & Development Workflow

This document outlines the branching strategy and rules for contributing to **Calendar.ai**. We follow a strict workflow to ensure code stability and quality.

## 🌳 Branch Structure

### 1. `main` (Production)
- **Protected Branch**: Direct commits are **not allowed**.
- **Stability**: Must always be in a deployable, bug-free state.
- **Source**: Only accepts merges from `dev` via Pull Request (PR).

### 2. `dev` (Development)
- **Integration Branch**: The active development branch.
- **Source**: All feature branches branch off from `dev`.
- **Target**: All feature branches merge back into `dev`.
- **Stability**: Should be stable enough for integration testing.

### 3. Feature Branches (`feat/*`, `fix/*`, `chore/*`)
- **Naming Convention**:
  - `feat/feature-name`: For new features (e.g., `feat/week-view`)
  - `fix/bug-name`: For bug fixes (e.g., `fix/event-overlap`)
  - `chore/task-name`: For maintenance (e.g., `chore/update-deps`)
- **Lifecycle**: Created from `dev`, merged back to `dev`, then deleted.

---

## 🚦 Rules & Regulations for Merging

### Moving from `feat/*` → `dev`
1.  **Pull Request**: Must create a PR.
2.  **Code Review**: At least one review approval required (if working in a team).
3.  **Testing**:
    - Manual verification of the feature.
    - **Unit Tests**: Must pass locally.
    - **Functional Tests**: Must pass locally.

### Moving from `dev` → `main` (Release)
1.  **Pull Request**: Create a "Release PR" from `dev` to `main`.
2.  **Automated Checks**: The following **MUST** pass in the CI pipeline:
    - ✅ **Linting**: Code style checks.
    - ✅ **Unit Tests**: Automated verification of logic.
    - ✅ **Functional/E2E Tests**: Automated browser interaction tests.
3.  **No Conflicts**: `dev` must be up-to-date with `main`.
4.  **Version Bump**: `CHANGELOG.md` must be updated with the new version.

---

## 🤖 Automation Setup (CI/CD)

We use GitHub Actions for automation. The workflow is defined in `.github/workflows/ci.yml`.

### Required Checks
1.  **Unit Testing**: Validates individual functions (e.g., time calculations, event sorting).
2.  **Functional Testing**: Validates user flows (e.g., "User can create an event").

### Failure Policy
- If **ANY** test fails, the merge to `main` is **BLOCKED**.
- Broken builds on `dev` must be fixed immediately.
