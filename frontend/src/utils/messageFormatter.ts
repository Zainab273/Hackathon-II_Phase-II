/**
 * Message formatter for task confirmations and structured responses
 * @see specs/004-chatkit-ui/data-model.md
 */

import type { ChatResponse, TaskSummary } from '../types/chat';

export function formatTaskConfirmation(response: ChatResponse): string {
  const { metadata } = response;

  if (!metadata) {
    return response.response;
  }

  // Task creation confirmation
  if (metadata.operation === 'add' && metadata.taskId && metadata.taskName) {
    return `${response.response}\n\n✓ Task ID: ${metadata.taskId}\n✓ Task: ${metadata.taskName}`;
  }

  // Task completion confirmation
  if (metadata.operation === 'complete' && metadata.taskId) {
    const taskName = metadata.taskName || `Task ${metadata.taskId}`;
    return `${response.response}\n\n✓ ${taskName} marked as complete`;
  }

  // Task update confirmation
  if (metadata.operation === 'update' && metadata.taskId) {
    const taskName = metadata.taskName || `Task ${metadata.taskId}`;
    return `${response.response}\n\n✓ ${taskName} updated successfully`;
  }

  // Task deletion confirmation
  if (metadata.operation === 'delete' && metadata.taskId) {
    const taskName = metadata.taskName || `Task ${metadata.taskId}`;
    return `${response.response}\n\n✓ ${taskName} deleted`;
  }

  // Task list formatting
  if (metadata.operation === 'list' && metadata.tasks) {
    return formatTaskList(response.response, metadata.tasks);
  }

  return response.response;
}

function formatTaskList(introText: string, tasks: TaskSummary[]): string {
  if (tasks.length === 0) {
    return `${introText}\n\nYou don't have any tasks yet. Would you like to create one?`;
  }

  const taskLines = tasks.map((task, index) => {
    const statusIcon = task.status === 'completed' ? '✓' : '○';
    const dueDateText = task.dueDate ? ` (Due: ${formatDueDate(task.dueDate)})` : '';
    return `${index + 1}. ${statusIcon} ${task.name}${dueDateText}`;
  });

  return `${introText}\n\n${taskLines.join('\n')}`;
}

function formatDueDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return isoDate;
  }
}
