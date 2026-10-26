import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

/**
 * Auth state.
 *
 * localStorage is still where the token is persisted across reloads, but it
 * is no longer the thing components read. localStorage is not reactive, which
 * is why the navbar used to poll every 60 seconds and showed "Sign in" for up
 * to a minute after signing in. The store is the source of truth now, and
 * localStorage is written alongside it.
 */

const readStoredSession = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    const expiresAt = decoded.exp * 1000;
    if (expiresAt < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      return null;
    }

    return {
      token,
      email: decoded.email || localStorage.getItem('email') || null,
      role: decoded.role || 'user',
      expiresAt,
    };
  } catch {
    // Malformed token
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    return null;
  }
};

const stored = readStoredSession();

const initialState = {
  token: stored?.token ?? null,
  email: stored?.email ?? null,
  role: stored?.role ?? null,
  expiresAt: stored?.expiresAt ?? null,
  isAuthenticated: Boolean(stored),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived: {
      reducer(state, action) {
        const { token, email, role, expiresAt } = action.payload;
        state.token = token;
        state.email = email;
        state.role = role;
        state.expiresAt = expiresAt;
        state.isAuthenticated = true;
      },
      prepare(token, fallbackEmail) {
        const decoded = jwtDecode(token);
        const payload = {
          token,
          email: decoded.email || fallbackEmail || null,
          role: decoded.role || 'user',
          expiresAt: decoded.exp * 1000,
        };
        localStorage.setItem('token', token);
        if (payload.email) localStorage.setItem('email', payload.email);
        return { payload };
      },
    },

    signedOut(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      state.token = null;
      state.email = null;
      state.role = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
    },
  },
});

export const { credentialsReceived, signedOut } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.role === 'admin';
export const selectEmail = (state) => state.auth.email;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
