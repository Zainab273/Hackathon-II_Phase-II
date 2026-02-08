/**
 * Task API functions
 * @see specs/003-frontend-integration/contracts/api-client.md
 */

import { authenticatedFetch } from './client';
import { Task, TaskCreateRequest, TaskUpdateRequest, TaskToggleRequest } from './types';

/**
 * Fetch all tasks for the authenticated user
 *
 * Endpoint: GET /api/tasks
 * Auth: Required (JWT)
 * Success: 200 OK with Task[]
 * Errors:
 *   - 401: Not authenticated
 *
 * @returns Array of tasks ordered by created_at descending (newest first)
 * @throws APIError on failure
 */
export async function getTasks(): Promise<Task[]> {
  const response = await authenticatedFetch('/api/tasks');
  const tasks: Task[] = await response.json();
  return tasks;
}

/**
 * Create a new task
 *
 * Endpoint: POST /api/tasks
 * Auth: Required (JWT)
 * Request Body: { title: string }
 * Success: 201 Created with Task
 * Errors:
 *   - 400: Invalid title (empty, whitespace, too long)
 *   - 401: Not authenticated
 *   - 422: Validation error
 *
 * @param data - Task creation data
 * @returns Created task with id, timestamps, etc.
 * @throws APIError on failure
 */
export async function createTask(data: TaskCreateRequest): Promise<Task> {
  const response = await authenticatedFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const task: Task = await response.json();
  return task;
}

/**
 * Toggle task completion status
 *
 * Endpoint: PATCH /api/tasks/{id}
 * Auth: Required (JWT)
 * Request Body: { completed: boolean }
 * Success: 200 OK with updated Task
 * Errors:
 *   - 401: Not authenticated
 *   - 403: Task belongs to different user
 *   - 404: Task not found
 *   - 422: Invalid UUID format
 *
 * @param id - Task ID (UUID)
 * @param data - New completion status
 * @returns Updated task
 * @throws APIError on failure
 */
export async function toggleTask(
  id: string,
  data: TaskToggleRequest
): Promise<Task> {
  const response = await authenticatedFetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  const task: Task = await response.json();
  return task;
}

/**
 * Update task title
 *
 * Endpoint: PUT /api/tasks/{id}
 * Auth: Required (JWT)
 * Request Body: { title: string }
 * Success: 200 OK with updated Task
 * Errors:
 *   - 400: Invalid title (empty, whitespace, too long)
 *   - 401: Not authenticated
 *   - 403: Task belongs to different user
 *   - 404: Task not found
 *   - 422: Invalid UUID format
 *
 * @param id - Task ID (UUID)
 * @param data - New title
 * @returns Updated task
 * @throws APIError on failure
 */
export async function updateTask(
  id: string,
  data: TaskUpdateRequest
): Promise<Task> {
  const response = await authenticatedFetch(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  const task: Task = await response.json();
  return task;
}

/**
 * Delete a task permanently
 *
 * Endpoint: DELETE /api/tasks/{id}
 * Auth: Required (JWT)
 * Success: 204 No Content
 * Errors:
 *   - 401: Not authenticated
 *   - 403: Task belongs to different user
 *   - 404: Task not found
 *   - 422: Invalid UUID format
 *
 * @param id - Task ID (UUID)
 * @returns void (no response body)
 * @throws APIError on failure
 */
export async function deleteTask(id: string): Promise<void> {
  await authenticatedFetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  // 204 No Content - no response body to parse
}
