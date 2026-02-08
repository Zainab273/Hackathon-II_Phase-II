// frontend/src/lib/auth-api.ts
import { ApiError } from './api-client';
// import { auth } from './auth'; // The server-side auth instance is not used here anymore

// interface AuthResponse {
//   token: string;
//   user: {
//     id: string;
//     email: string;
//   };
// }

// The authApi object is now largely redundant for authentication actions
// as useAuth hook now directly uses better-auth/react's functions.
// We keep it as an empty object for now to avoid breaking other parts that might import it.
const authApi = {
  // Authentication actions are now handled directly by the useAuth hook using better-auth/react
  // e.g., useAuth().signIn, useAuth().signUp, useAuth().signOut
  // No longer needed:
  // async signup(...)
  // async signin(...)
  // async signout()
  // async getToken()
};

export { authApi };