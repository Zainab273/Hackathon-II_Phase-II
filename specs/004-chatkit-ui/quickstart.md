# Quickstart Guide: Frontend Chat UI (ChatKit)

**Feature**: 004-chatkit-ui
**Date**: 2026-02-09
**Purpose**: Get the chat interface running locally for development

## Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Backend API running at `http://localhost:8000` (see backend setup)
- Basic knowledge of React and TypeScript

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Install Chat UI Library

```bash
npm install react-chatbotify
```

### 3. Verify Installation

```bash
npm list react-chatbotify
# Should show react-chatbotify@<version>
```

## Project Structure

```
frontend/src/
├── components/chat/
│   ├── ChatInterface.tsx        # Main container
│   ├── MessageList.tsx          # Message display
│   ├── MessageBubble.tsx        # Individual message
│   ├── ChatInput.tsx            # Input component
│   ├── LoadingIndicator.tsx    # Typing animation
│   └── ErrorNotification.tsx    # Error display
├── services/
│   └── chatApi.ts               # API client
├── types/
│   └── chat.ts                  # TypeScript interfaces
├── hooks/
│   ├── useChat.ts               # Chat state hook
│   └── useChatApi.ts            # API communication hook
└── utils/
    ├── errorFormatter.ts        # Error message formatting
    └── messageFormatter.ts      # Task confirmation formatting
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000` (or next available port).

### 2. Verify Backend Connection

The chat interface connects to `/api/{user_id}/chat`. Ensure your backend is running:

```bash
# In a separate terminal, test backend
curl -X POST http://localhost:8000/api/user-123/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "timestamp": "2026-02-09T10:00:00Z"}'

# Expected: JSON response with "response" field
```

### 3. Open Chat Interface

Navigate to: `http://localhost:3000/chat` (or wherever ChatInterface is mounted)

### 4. Test Basic Flow

1. Type a message: "Add task to buy groceries"
2. Click Send
3. Verify:
   - User message appears in chat (right-aligned)
   - Loading indicator shows briefly
   - AI response appears (left-aligned)
   - Confirmation includes task details

## Configuration

### Environment Variables

Create `.env.local` in `frontend/` directory:

```env
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Default user ID for development
NEXT_PUBLIC_DEV_USER_ID=user-dev-123

# Enable debug logging
NEXT_PUBLIC_DEBUG_MODE=true
```

### API Client Configuration

In `src/services/chatApi.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || 'user-dev-123';
```

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run E2E Tests

```bash
# Start dev server first
npm run dev

# In another terminal, run E2E tests
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## Common Tasks

### Add a New Message Type

1. Update `src/types/chat.ts` with new metadata fields
2. Update `src/utils/messageFormatter.ts` to handle new type
3. Update `MessageBubble.tsx` to render new format
4. Add tests in `tests/components/chat/MessageBubble.test.tsx`

### Customize Styling

1. Edit `src/components/chat/ChatInterface.module.css`
2. Modify CSS custom properties for theming:
   ```css
   :root {
     --chat-bg-color: #ffffff;
     --user-msg-bg: #007bff;
     --ai-msg-bg: #f1f3f4;
     --input-border-color: #d1d5db;
   }
   ```

### Add Error Handling for New Error Type

1. Add error code to `src/types/chat.ts` ApiError enum
2. Update `src/utils/errorFormatter.ts` error map:
   ```typescript
   export const ERROR_MESSAGES: Record<string, string> = {
     'NEW_ERROR_CODE': 'User-friendly message here',
     // ... existing codes
   };
   ```

### Debug API Issues

Enable debug mode:

```typescript
// src/services/chatApi.ts
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

export async function sendMessage(userId: string, message: string) {
  if (DEBUG) {
    console.log('[ChatAPI] Sending:', { userId, message });
  }

  const response = await fetch(/* ... */);

  if (DEBUG) {
    console.log('[ChatAPI] Response:', await response.clone().json());
  }

  return response;
}
```

## Troubleshooting

### Chat Not Loading

**Problem**: Blank screen or loading spinner indefinitely

**Solutions**:
1. Check browser console for errors
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check CORS configuration in backend
4. Verify API_BASE_URL in environment variables

### Messages Not Sending

**Problem**: Click send, but nothing happens

**Solutions**:
1. Open browser network tab, check for failed requests
2. Verify request payload matches API contract
3. Check backend logs for errors
4. Ensure user_id is valid

### Styling Issues

**Problem**: Chat layout broken or misaligned

**Solutions**:
1. Check for CSS conflicts with global styles
2. Verify CSS Modules are enabled in build config
3. Inspect elements in browser dev tools
4. Clear browser cache and rebuild

### TypeScript Errors

**Problem**: Type errors in IDE or build

**Solutions**:
1. Run `npm install` to ensure all types are installed
2. Check `tsconfig.json` is correctly configured
3. Restart TypeScript server in IDE
4. Verify types in `src/types/chat.ts` match API contract

## Performance Optimization

### Enable Production Build

```bash
npm run build
npm run start
```

### Analyze Bundle Size

```bash
npm run build
npm run analyze
```

### Optimize Re-renders

Use React DevTools Profiler to identify unnecessary re-renders:

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Start recording
4. Interact with chat
5. Stop recording and analyze flame graph

## Next Steps

1. **Implement Components**: Follow `plan.md` Phase 2 tasks
2. **Write Tests**: Create tests for each component
3. **Style Customization**: Apply brand colors and spacing
4. **Accessibility**: Add ARIA labels and keyboard navigation
5. **Performance**: Implement message virtualization for 100+ messages

## Resources

- **API Contract**: See `contracts/chat-api.yaml`
- **Data Model**: See `data-model.md`
- **Research Notes**: See `research.md`
- **React Hooks Docs**: https://react.dev/reference/react/hooks
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro/

## Support

For questions or issues:
1. Check this quickstart guide
2. Review `research.md` for implementation patterns
3. Consult API contract in `contracts/chat-api.yaml`
4. Ask team in Slack #frontend-chat channel (or equivalent)

## Development Checklist

Before submitting PR:

- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Components are properly typed
- [ ] Error handling covers all API error codes
- [ ] Loading states work correctly
- [ ] Responsive design tested on mobile and desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Performance: no unnecessary re-renders
- [ ] Code follows project conventions
