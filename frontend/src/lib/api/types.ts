/**
 * TypeScript type definitions for Frontend Application & Integration
 * Matches backend Pydantic schemas from Spec 002
 * @see specs/003-frontend-integration/data-model.md
 */

/**
 * Task entity - represents a user's todo item
 * Matches backend TaskResponse schema
 */
export interface Task {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Task title (1-500 characters, trimmed, non-empty) */
  title: string;

  /** Completion status */
  completed: boolean;

  /** Owner user ID (UUID v4) - matches authenticated user from JWT */
  user_id: string;

  /** Creation timestamp (ISO 8601 format) */
  created_at: string;

  /** Last update timestamp (ISO 8601 format) */
  updated_at: string;
}

/**
 * Request to create a new task
 * Matches backend TaskCreate schema
 */
export interface TaskCreateRequest {
  /** Task title - will be trimmed and validated */
  title: string;
}

/**
 * Request to update task title
 * Matches backend TaskUpdate schema
 */
export interface TaskUpdateRequest {
  /** New task title - will be trimmed and validated */
  title: string;
}

/**
 * Request to toggle task completion status
 * Matches backend TaskToggle schema
 */
export interface TaskToggleRequest {
  /** New completion status */
  completed: boolean;
}

/**
 * Response from GET /api/tasks
 * Returns array of tasks ordered by created_at descending (newest first)
 */
export type TaskListResponse = Task[];

/**
 * API error response format
 * Matches FastAPI HTTPException detail structure
 */
export interface APIErrorResponse {
  /** Error detail message (string or validation error object) */
  detail: string | ValidationError;
}

/**
 * Validation error structure for 422 responses
 */
export interface ValidationError {
  [field: string]: string[];
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * State for task list view
 */
export interface TasksViewState {
  /** Array of tasks (empty if no tasks) */
  tasks: Task[];

  /** Loading state for initial fetch */
  loading: LoadingState;

  /** Error message if loading failed */
  error: string | null;

  /** Individual task operation states (for optimistic updates) */
  operationStates: {
    [taskId: string]: {
      toggling?: boolean;
      updating?: boolean;
      deleting?: boolean;
      error?: string;
    };
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
