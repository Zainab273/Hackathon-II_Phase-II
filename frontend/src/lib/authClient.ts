// frontend/src/lib/authClient.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000", // Your backend API base URL
});
