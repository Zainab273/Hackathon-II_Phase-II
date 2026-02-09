/**
 * Chat page - Main entry point for chat interface
 * @see specs/004-chatkit-ui/spec.md
 */

'use client';

import React from 'react';
import { ChatInterface } from '../../components/chat';

export default function ChatPage() {
  // Get user ID from environment or use default
  const userId = process.env.NEXT_PUBLIC_DEV_USER_ID || 'dev-user-001';

  return (
    <main>
      <ChatInterface userId={userId} />
    </main>
  );
}
