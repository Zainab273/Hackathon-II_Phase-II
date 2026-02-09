# Research: Frontend Chat UI (ChatKit)

**Feature**: 004-chatkit-ui
**Date**: 2026-02-09
**Purpose**: Resolve technical unknowns and establish implementation approach

## Research Objectives

1. ChatKit UI library setup and integration
2. Chat interface component architecture
3. API communication patterns for stateless chat
4. Error handling and loading state patterns
5. Responsive design for chat interfaces
6. Message formatting and display strategies

## Findings

### 1. ChatKit UI Library

**Decision**: Use react-chatbotify or stream-chat-react as ChatKit-equivalent libraries

**Rationale**:
- "ChatKit" as specified is not a specific well-known library (may refer to PubNub ChatKit which was discontinued)
- react-chatbotify provides modern chat UI components optimized for conversational interfaces
- stream-chat-react offers comprehensive chat UI components with excellent customization
- Both support stateless operation, React 18+, and responsive design

**Recommendation**: **react-chatbotify** for hackathon timeline
- Simpler setup and configuration
- Built-in message bubbles, input components, and loading states
- Smaller bundle size (~50KB gzipped)
- Easy styling customization
- MIT license

**Alternative**: stream-chat-react if more advanced features needed
- More comprehensive component library
- Better performance for 1000+ messages
- Built-in typing indicators and read receipts
- Requires account/API key setup

**Installation**:
```bash
npm install react-chatbotify
# or
npm install stream-chat-react stream-chat
```

### 2. Component Architecture

**Decision**: Container-Presenter pattern with custom hooks

**Component Structure**:
- **ChatInterface** (Container): Manages state, API calls, error handling
- **MessageList** (Presenter): Renders scrollable message history
- **MessageBubble** (Presenter): Individual message display (user vs AI styling)
- **ChatInput** (Presenter): Input box with send button
- **LoadingIndicator** (Presenter): Typing animation during API requests
- **ErrorNotification** (Presenter): Toast or inline error messages

**State Management Approach**:
- Use React hooks (useState, useEffect) - no Redux needed for single component
- Custom hook `useChat` for message state and API integration
- Custom hook `useChatApi` for HTTP communication logic

**Rationale**:
- Separates concerns (presentation vs logic)
- Makes components independently testable
- Follows React best practices
- Hackathon-appropriate simplicity

### 3. API Communication Pattern

**Decision**: Fetch API with async/await in custom hook

**API Contract**:
- **Endpoint**: `POST /api/{user_id}/chat`
- **Request**: `{ message: string, timestamp: string }`
- **Response**: `{ response: string, timestamp: string, metadata?: object }`
- **Error Response**: `{ error: string, code: string, details?: object }`

**Implementation Pattern**:
```typescript
// useChatApi.ts
export function useChatApi(userId: string) {
  const sendMessage = async (message: string) => {
    const response = await fetch(`/api/${userId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, timestamp: new Date().toISOString() })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  };

  return { sendMessage };
}
```

**Rationale**:
- Fetch API is native, no additional dependencies
- Async/await provides clean error handling
- Custom hook encapsulates API logic for reusability
- TypeScript interfaces ensure type safety

### 4. Error Handling Pattern

**Decision**: Toast notifications for transient errors, inline messages for persistent errors

**Error Categories**:
- **Network Errors** (offline, timeout): Toast with retry button
- **API Errors** (400, 500): Inline message in chat with error context
- **Validation Errors** (empty message): Prevent submission, show field validation

**User-Friendly Error Messages**:
```typescript
// errorFormatter.ts
export function formatApiError(error: Error | string): string {
  const errorMap: Record<string, string> = {
    'NetworkError': 'Unable to connect. Please check your internet connection.',
    'TimeoutError': 'Request timed out. Please try again.',
    'ServerError': 'Something went wrong on our end. Please try again later.',
    'ValidationError': 'Please check your input and try again.',
  };

  return errorMap[error.name] || 'An unexpected error occurred. Please try again.';
}
```

**Rationale**:
- Matches specification requirement (FR-017): translate technical errors to user-friendly messages
- Toast for temporary issues doesn't interrupt chat flow
- Inline errors for context-specific issues
- Error map allows easy message customization

### 5. Responsive Design Strategy

**Decision**: CSS Flexbox with mobile-first breakpoints

**Breakpoints**:
- Mobile: 320px - 767px (single column, full width input)
- Tablet: 768px - 1023px (centered chat, 80% width)
- Desktop: 1024px+ (centered chat, max 800px width)

**Layout Approach**:
```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-input {
  flex-shrink: 0;
  padding: 1rem 0;
}

@media (max-width: 767px) {
  .chat-container {
    padding: 0.5rem;
    max-width: 100%;
  }
}
```

**Rationale**:
- Flexbox provides reliable layout across browsers
- Mobile-first ensures core functionality on smallest screens
- Max-width prevents overly wide chat on large displays
- Matches specification requirement (SC-002): 320px - 1920px support

### 6. Message Rendering and Scrolling

**Decision**: Virtualized list for 100+ messages with auto-scroll to bottom

**Performance Strategy**:
- Use `react-window` or `react-virtualized` for message list virtualization
- Only render visible messages + small buffer
- Auto-scroll to bottom on new message arrival
- Preserve scroll position when user scrolls up manually

**Auto-Scroll Logic**:
```typescript
// MessageList.tsx
const messageListRef = useRef<HTMLDivElement>(null);
const [isAtBottom, setIsAtBottom] = useState(true);

useEffect(() => {
  if (isAtBottom && messageListRef.current) {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }
}, [messages, isAtBottom]);

const handleScroll = () => {
  if (!messageListRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
  setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
};
```

**Rationale**:
- Virtualization ensures smooth performance with 100+ messages (SC-008)
- Auto-scroll matches user expectation for chat interfaces
- Manual scroll preservation prevents jarring UX when reading history
- Scroll threshold (50px) provides buffer for "at bottom" detection

### 7. Loading State Patterns

**Decision**: Typing indicator with pulse animation

**Implementation**:
- Show typing indicator below last message while waiting for API response
- Disable input field during API request to prevent multiple submissions
- Timeout after 30 seconds with error message if no response

**UI Pattern**:
```typescript
// LoadingIndicator.tsx
export function LoadingIndicator() {
  return (
    <div className="typing-indicator">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
}

// CSS
.typing-indicator .dot {
  animation: typing 1.4s infinite;
}
.typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
```

**Rationale**:
- Typing indicator provides clear feedback that system is processing
- Disabled input prevents accidental double-submissions
- Timeout prevents indefinite waiting state
- Matches specification requirement (FR-004): visual feedback during API wait

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| UI Framework | React | 18.2+ | Modern hooks, concurrent features, wide ecosystem |
| Chat UI Library | react-chatbotify | Latest | Simple setup, good customization, hackathon-friendly |
| HTTP Client | Fetch API | Native | No dependencies, built-in, sufficient for use case |
| Styling | CSS Modules + Flexbox | N/A | Scoped styles, responsive layouts, no build complexity |
| State Management | React Hooks | Built-in | useState, useEffect sufficient for single component |
| Testing | Jest + React Testing Library | Latest | Industry standard, component-focused testing |
| E2E Testing | Playwright | Latest | Fast, reliable, multi-browser support |
| TypeScript | TypeScript | 5.x | Type safety, better DX, catches errors early |

## Implementation Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| ChatKit library unclear/discontinued | High | Medium | Use react-chatbotify as proven alternative |
| API response format changes | Medium | Low | Define strict TypeScript interfaces, validate responses |
| Performance issues with 100+ messages | Medium | Medium | Implement virtualized list from start |
| Cross-browser compatibility | Low | Low | Use standard Flexbox, test on Chrome/Firefox/Safari |
| Mobile responsiveness complexity | Medium | Low | Mobile-first CSS, test on actual devices |
| WebSocket requirement for real-time | High | Low | Spec confirms HTTP POST sufficient (stateless) |

## Next Steps (Phase 1)

1. Create data model for Message, ChatRequest, ChatResponse types
2. Generate OpenAPI contract for `/api/{user_id}/chat` endpoint
3. Create quickstart guide for local development setup
4. Update agent context with chosen technologies

## References

- React Hooks Documentation: https://react.dev/reference/react/hooks
- react-chatbotify: https://www.npmjs.com/package/react-chatbotify
- Fetch API MDN: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Responsive Design Best Practices: https://web.dev/responsive-web-design-basics/
