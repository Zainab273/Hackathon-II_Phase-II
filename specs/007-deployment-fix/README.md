# 007: Deployment Fix - Missing Library Files

## Overview
Critical bugfix to resolve Vercel build failures caused by missing `frontend/src/lib/` files that were inadvertently excluded by an overly broad `.gitignore` pattern.

## Problem Statement
Vercel builds were failing with 6 "Module not found" errors:
- `./frontend/src/contexts/AuthContext.tsx:7` - Can't resolve '../lib/api-client'
- `./frontend/src/hooks/useTasks.ts:6` - Can't resolve '../lib/api-client'
- `./frontend/src/contexts/AuthContext.tsx:6` - Can't resolve '../lib/auth'
- `./frontend/src/app/(protected)/view-task/page.tsx:5` - Can't resolve '@/lib/utils/formatting'
- `./frontend/src/components/TaskItem.tsx:4` - Can't resolve '@/lib/utils/formatting'
- `./frontend/src/components/CreateTaskForm.tsx:4` - Can't resolve '@/lib/utils/validation'

## Root Cause
The root `.gitignore` file contained `lib/` on line 13, intended for Python virtual environment directories. This pattern matched ALL directories named `lib`, including `frontend/src/lib/`, causing git to ignore critical frontend application code.

## Solution
1. **Updated `.gitignore`**: Changed from broad `lib/` pattern to specific patterns:
   - `/lib/` - Root-level lib directory only
   - `/lib64/` - Root-level lib64 directory only
   - `backend/lib/` - Backend-specific lib directories
   - `backend/lib64/` - Backend-specific lib64 directories

2. **Added Missing Files**: Tracked 13 previously ignored files in `frontend/src/lib/`:
   - API client and authentication modules
   - Utility functions for formatting and validation
   - Type definitions

## Impact
- ✅ Resolves all 6 build errors
- ✅ Enables successful Vercel deployments
- ✅ Prevents future conflicts between Python and frontend lib directories

## Files Modified
- `.gitignore` - Updated lib ignore patterns
- `frontend/src/lib/**/*` - 13 files added to git tracking

## Related Features
- 003-frontend-integration - Uses these lib files extensively
- 004-chatkit-ui - Will depend on these utilities

## Lessons Learned
- Gitignore patterns should be as specific as possible
- Use root-anchored patterns (`/lib/`) or path-specific patterns (`backend/lib/`) to avoid unintended matches
- Regularly verify that critical application code is tracked by git
