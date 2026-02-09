# Implementation Plan: Frontend Chat UI (ChatKit)

**Branch**: `004-chatkit-ui` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-chatkit-ui/spec.md`

**Note**: This plan provides architecture and design for the ChatKit frontend chat interface.

## Summary

Build a conversational chat interface using ChatKit UI library that enables users to manage todos through natural language. The interface sends user messages to the backend API at `/api/{user_id}/chat`, displays AI responses, and shows confirmations for task operations. The system is stateless with no local message persistence, relying entirely on backend for conversation context.

**Technical Approach**: Use ChatKit UI components exclusively for rendering the chat interface. Implement stateless HTTP communication with the FastAPI backend. Focus on responsive design for mobile and desktop, error handling with user-friendly messages, and loading states during API requests.

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2020+
**Primary Dependencies**: ChatKit UI library, React 18+ (if ChatKit requires), Fetch API or Axios for HTTP
**Storage**: N/A (stateless - no local storage or persistence)
**Testing**: Jest + React Testing Library for component tests, Cypress or Playwright for E2E
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web frontend (chat interface component)
**Performance Goals**:
- Chat interface interactive within 2 seconds on load
- Message rendering < 100ms per message
- Smooth scrolling with 100+ messages
- API response display within 3 seconds total (includes network time)

**Constraints**:
- Must use ChatKit UI exclusively (no custom chat UI frameworks)
- Stateless operation (no localStorage, sessionStorage, or IndexedDB)
- No offline mode or service worker caching
- Desktop and mobile responsive (320px - 1920px width)

**Scale/Scope**:
- Single chat interface page/component
- ~5-10 ChatKit components (input, message list, message bubble, loading indicator, error display)
- Support 100+ messages in view without performance issues

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution template is currently empty. Proceeding with hackathon best practices:

✅ **Simplicity**: Single-purpose chat interface component using ChatKit UI library
✅ **Testability**: ChatKit components are independently testable with mock API responses
✅ **Clear Contracts**: Well-defined API contract with `/api/{user_id}/chat` endpoint
✅ **No Over-Engineering**: Using established ChatKit library rather than building custom chat UI
✅ **Stateless Design**: Adheres to specification requirement for stateless frontend operation

**No violations detected** - proceeding with Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/004-chatkit-ui/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - ChatKit integration patterns
├── data-model.md        # Phase 1 output - Frontend message/session models
├── quickstart.md        # Phase 1 output - Setup and dev guide
├── contracts/           # Phase 1 output - API request/response schemas
│   └── chat-api.yaml    # OpenAPI schema for /api/{user_id}/chat endpoint
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInterface.tsx        # Main chat container
│   │       ├── MessageList.tsx          # Scrollable message display
│   │       ├── MessageBubble.tsx        # Individual message rendering
│   │       ├── ChatInput.tsx            # Input box with send button
│   │       ├── LoadingIndicator.tsx     # Typing animation / spinner
│   │       └── ErrorNotification.tsx    # Error message display
│   ├── services/
│   │   └── chatApi.ts                   # API client for /api/{user_id}/chat
│   ├── types/
│   │   └── chat.ts                      # Message, ChatRequest, ChatResponse types
│   ├── hooks/
│   │   ├── useChat.ts                   # Chat state management hook
│   │   └── useChatApi.ts                # API communication hook
│   └── utils/
│       ├── errorFormatter.ts            # Format API errors for display
│       └── messageFormatter.ts          # Format task confirmations
└── tests/
    ├── components/
    │   └── chat/
    │       ├── ChatInterface.test.tsx
    │       ├── MessageList.test.tsx
    │       └── ChatInput.test.tsx
    ├── services/
    │   └── chatApi.test.ts
    └── e2e/
        └── chat-flow.spec.ts            # End-to-end chat interaction tests
```

**Structure Decision**: Frontend-only structure under `frontend/` directory. Organized by component, service, and type layers following React best practices. Chat components isolated in `components/chat/` subdirectory for modularity. API communication abstracted in `services/` with typed interfaces in `types/`. Custom hooks in `hooks/` for state and API logic separation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No complexity violations** - Using established ChatKit UI library keeps complexity low. Stateless design simplifies state management. Standard React patterns applied throughout.
