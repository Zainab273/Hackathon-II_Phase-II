// frontend/src/lib/api-client.ts
import { auth } from './auth'; // Import the auth module for token management

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  response: Response;
  data: any;

  constructor(response: Response, data: any) {
    let errorMessage = "An unknown error occurred";
    if (data && data.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        // Assume it's a list of validation errors
        errorMessage = data.detail.map((item: any) => item.msg || item).join(', ');
      }
    } else if (response.statusText) {
      errorMessage = response.statusText;
    }
    
    super(errorMessage);
    this.name = 'ApiError';
    this.response = response;
    this.data = data;
  }
}

let _authToken: string | undefined = auth.getToken();

const fetchApi = async <T>( // Renamed the function
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const customHeaders = new Headers(options?.headers); // Initialize with existing headers

  // Set Content-Type, prioritizing custom headers if already set
  if (!customHeaders.has('Content-Type')) {
    customHeaders.set('Content-Type', 'application/json');
  }

  const currentToken = _authToken || auth.getToken();
  if (currentToken) {
    customHeaders.set('Authorization', `Bearer ${currentToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: customHeaders, // Pass the Headers object
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
};

// Now, export an object named 'apiClient'
const apiClient = {
  fetch: fetchApi, // The main fetching function
  setAuthToken: (token: string | undefined) => {
    _authToken = token;
  },
};

// Re-wire auth.onRemoveToken to clear the token in this new object structure
auth.onRemoveToken = () => {
    apiClient.setAuthToken(undefined);
};

export { apiClient }; // Export the object
