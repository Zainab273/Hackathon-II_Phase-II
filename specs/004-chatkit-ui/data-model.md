# Data Model: Frontend Chat UI

**Feature**: 004-chatkit-ui
**Date**: 2026-02-09
**Purpose**: Define frontend data structures for chat interface

## Overview

This document defines the TypeScript interfaces and types used in the frontend chat interface. Since the frontend is stateless (no local persistence), these models represent transient runtime data structures for message display and API communication.

## Core Entities

### 1. Message

Represents a single message in the chat conversation (either from user or AI assistant).

```typescript
export interface Message {
  id: string;                    // Unique identifier (generated client-side)
  text: string;                  // Message content
  sender: 'user' | 'assistant';  // Message originator
  timestamp: Date;               // When message was created
  status?: MessageStatus;        // Optional status for user messages
  metadata?: MessageMetadata;    // Optional additional data
}

export type MessageStatus =
  | 'sending'      // User message being sent to API
  | 'sent'         // User message successfully sent
  | 'delivered'    // AI response received
  | 'error';       // Message failed to send

export interface MessageMetadata {
  taskId?: string;              // Task ID if message relates to task operation
  operation?: TaskOperation;    // Type of task operation performed
  errorCode?: string;           // Error code if status is 'error'
  errorMessage?: string;        // User-friendly error message
}

export type TaskOperation =
  | 'add'
  | 'list'
  | 'complete'
  | 'update'
  | 'delete';
```

**Field Descriptions**:
- **id**: Client-generated UUID for React key prop and message tracking
- **text**: Raw message text displayed in chat bubble
- **sender**: Distinguishes user messages (right-aligned) from AI responses (left-aligned)
- **timestamp**: Used for chronological ordering and optional timestamp display
- **status**: Tracks message lifecycle for loading indicators and error states
- **metadata**: Additional context for task confirmations and error details

**Validation Rules**:
- `text` must not be empty string (validated before creating Message)
- `timestamp` must be valid Date object
- `id` must be unique within message list
- `sender` must be exactly 'user' or 'assistant'

### 2. ChatRequest

Represents the request payload sent to the backend API.

```typescript
export interface ChatRequest {
  message: string;     // User's message text
  timestamp: string;   // ISO 8601 timestamp
  userId?: string;     // Optional: may be in URL path instead
}
```

**Field Descriptions**:
- **message**: User input from ChatInput component
- **timestamp**: ISO 8601 format for server-side logging
- **userId**: Included if not in URL path (depends on API design)

**Example**:
```json
{
  "message": "Add task to buy groceries",
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

### 3. ChatResponse

Represents the response payload received from the backend API.

```typescript
export interface ChatResponse {
  response: string;              // AI-generated response text
  timestamp: string;             // Server timestamp (ISO 8601)
  metadata?: ResponseMetadata;   // Optional task operation details
}

export interface ResponseMetadata {
  operation?: TaskOperation;     // Task operation performed
  taskId?: string;               // Task ID for created/modified tasks
  taskName?: string;             // Task name for confirmation messages
  taskStatus?: 'active' | 'completed';
  taskCount?: number;            // For list operations
  tasks?: TaskSummary[];         // For list operations
}

export interface TaskSummary {
  id: string;
  name: string;
  status: 'active' | 'completed';
  dueDate?: string;              // ISO 8601 date string
}
```

**Field Descriptions**:
- **response**: AI-generated text displayed as assistant message
- **timestamp**: Server-side timestamp for accurate time tracking
- **metadata**: Structured data about task operations for enhanced UI display

**Example (Task Created)**:
```json
{
  "response": "Got it! I've added 'Buy groceries' to your tasks.",
  "timestamp": "2026-02-09T10:30:01.500Z",
  "metadata": {
    "operation": "add",
    "taskId": "task-123",
    "taskName": "Buy groceries"
  }
}
```

**Example (Task List)**:
```json
{
  "response": "Here are your current tasks:",
  "timestamp": "2026-02-09T10:30:01.500Z",
  "metadata": {
    "operation": "list",
    "taskCount": 3,
    "tasks": [
      { "id": "task-123", "name": "Buy groceries", "status": "active" },
      { "id": "task-124", "name": "Review report", "status": "active", "dueDate": "2026-02-10" },
      { "id": "task-125", "name": "Call John", "status": "completed" }
    ]
  }
}
```

### 4. ApiError

Represents error responses from the backend API.

```typescript
export interface ApiError {
  error: string;          // User-friendly error message
  code: string;           // Error code for client-side handling
  details?: ErrorDetails; // Optional additional error context
}

export interface ErrorDetails {
  field?: string;         // Field causing validation error
  expected?: string;      // Expected value format
  received?: string;      // Actual received value
  statusCode?: number;    // HTTP status code
}
```

**Example (Validation Error)**:
```json
{
  "error": "Message cannot be empty",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "message",
    "expected": "non-empty string",
    "received": ""
  }
}
```

**Example (Server Error)**:
```json
{
  "error": "Unable to process request. Please try again.",
  "code": "SERVER_ERROR",
  "details": {
    "statusCode": 500
  }
}
```

## Derived Types

### ChatState

Runtime state for the chat interface component.

```typescript
export interface ChatState {
  messages: Message[];          // Ordered list of chat messages
  isLoading: boolean;           // True when API request in progress
  error: string | null;         // Current error message (if any)
  inputValue: string;           // Current value of input field
  userId: string;               // Current user identifier
}
```

### ChatActions

Actions that can be performed on chat state.

```typescript
export interface ChatActions {
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
  setInputValue: (value: string) => void;
}
```

## State Transitions

### Message Status Lifecycle

```
User sends message:
  (no status) → 'sending' → 'sent' → (AI response) → 'delivered'
                    ↓
                 'error' (if request fails)
```

### Chat State Flow

```
1. User types message → inputValue updated
2. User clicks send → isLoading = true, new user Message with status 'sending'
3. API request sent → user Message status = 'sent'
4. API response received → isLoading = false, new assistant Message added
5. Error occurs → isLoading = false, error state set, user Message status = 'error'
```

## Validation Rules

### Message Text Validation
```typescript
export function validateMessageText(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return 'Message cannot be empty';
  }
  if (text.length > 5000) {
    return 'Message is too long (max 5000 characters)';
  }
  return null; // Valid
}
```

### Response Validation
```typescript
export function validateChatResponse(response: unknown): response is ChatResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'response' in response &&
    typeof response.response === 'string' &&
    'timestamp' in response &&
    typeof response.timestamp === 'string'
  );
}
```

## Type Guards

```typescript
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'string' &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

export function hasMetadata(response: ChatResponse): response is ChatResponse & { metadata: ResponseMetadata } {
  return response.metadata !== undefined;
}
```

## Storage Considerations

**No Persistence**: Per specification requirement (FR-012), the frontend is stateless:
- No localStorage
- No sessionStorage
- No IndexedDB
- No service worker caching

**Implications**:
- Messages cleared on page refresh
- Conversation history not preserved across sessions
- All context reconstruction handled by backend
- Frontend only displays current session messages

## Performance Considerations

### Message List Optimization

For rendering 100+ messages efficiently:

```typescript
// Use React.memo for MessageBubble to prevent unnecessary re-renders
export const MessageBubble = React.memo<MessageBubbleProps>(({ message }) => {
  // ... component implementation
});

// Virtualize message list for large message counts
import { FixedSizeList } from 'react-window';

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MessageBubble message={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

## Future Considerations

While out of scope for current implementation, these extensions may be considered:

- **Message Reactions**: Add reactions field to Message
- **Edit History**: Track message edits with editedAt timestamp
- **Attachments**: Support file/image metadata
- **Typing Indicators**: Real-time typing status from other users
- **Read Receipts**: Track message read status

These would require backend support and potentially WebSocket implementation.
