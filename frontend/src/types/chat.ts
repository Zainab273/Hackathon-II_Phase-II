/**
 * Chat interface type definitions
 * @see specs/004-chatkit-ui/data-model.md
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error';

export type TaskOperation = 'add' | 'list' | 'complete' | 'update' | 'delete';

export interface MessageMetadata {
  taskId?: string;
  operation?: TaskOperation;
  errorCode?: string;
  errorMessage?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: MessageStatus;
  metadata?: MessageMetadata;
}

export interface ChatRequest {
  message: string;
  timestamp: string;
  userId?: string;
}

export interface TaskSummary {
  id: string;
  name: string;
  status: 'active' | 'completed';
  dueDate?: string;
}

export interface ResponseMetadata {
  operation?: TaskOperation;
  taskId?: string;
  taskName?: string;
  taskStatus?: 'active' | 'completed';
  taskCount?: number;
  tasks?: TaskSummary[];
}

export interface ChatResponse {
  response: string;
  timestamp: string;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
