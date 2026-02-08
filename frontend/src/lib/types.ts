// frontend/src/lib/types.ts
// Re-exporting backend schemas as frontend types for convenience

export interface User {
  id: string;
  email: string;
}

export interface AuthSignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthSigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User; // Assuming the user field in AuthResponse now matches our User interface
}

export interface TaskCreate {
  title: string;
}

export interface TaskUpdate {
  title: string;
}

export interface TaskToggle {
  completed: boolean;
}

export interface Task {
  id: string; // UUIDs are strings in frontend
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string; // ISO format string
  updated_at: string; // ISO format string
}
