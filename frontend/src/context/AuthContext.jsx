import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/user';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'fm_token';

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]       = useState(null);   // { user_id, name, email, has_preferences }
  const [loading, setLoading] = useState(true);    // resolving session on mount

  // On mount (or token change), verify token and load profile
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        // Token is invalid or expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  /** Called after a successful login or signup API response */
  const saveSession = useCallback((tokenStr, profile) => {
    localStorage.setItem(TOKEN_KEY, tokenStr);
    setToken(tokenStr);
    setUser(profile);
  }, []);

  /** Mark preferences as complete without a full profile re-fetch */
  const markPreferencesSaved = useCallback(() => {
    setUser((prev) => prev ? { ...prev, has_preferences: true } : prev);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, saveSession, markPreferencesSaved, logout }}>
      {children}
    </AuthContext.Provider>
  );
}