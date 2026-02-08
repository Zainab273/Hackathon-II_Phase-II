// frontend/src/lib/auth.ts
// This file manages the authentication token (JWT) on the client side.

import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token'; // As used in middleware.ts and useAuth.ts

export const auth = {

  getToken: (): string | undefined => {

    return Cookies.get(TOKEN_KEY);

  },



  setToken: (token: string, expires_in_hours: number = 24): void => {

    Cookies.set(TOKEN_KEY, token, { expires: expires_in_hours / 24, path: '/' }); // Ensure cookie is accessible site-wide

  },



  removeToken: (): void => {

    Cookies.remove(TOKEN_KEY, { path: '/' }); // Ensure cookie is removed site-wide

    auth.onRemoveToken(); // Trigger callback

  },



  onRemoveToken: (): void => {}, // Initialize as an empty function

};
