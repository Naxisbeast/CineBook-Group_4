// =============================================================
// CineBook — frontend/src/context/AuthContext.jsx
// Authentication state — wraps the whole app in App.jsx
// CMPG 311 | Group 4 | 2026
// =============================================================
// Any component can access auth state with:
//   import { useAuth } from '../context/AuthContext';
//   const { user, isLoggedIn, login, logout } = useAuth();
// =============================================================

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session from localStorage on app load (page refresh)
  useEffect(() => {
    const savedToken = localStorage.getItem('cinebook_token');
    const savedUser  = localStorage.getItem('cinebook_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data in storage — clear it
        localStorage.removeItem('cinebook_token');
        localStorage.removeItem('cinebook_user');
      }
    }
    setLoading(false);
  }, []);

  // Called by LoginPage and RegisterPage after successful auth
  const login = (newToken, userData) => {
    localStorage.setItem('cinebook_token', newToken);
    localStorage.setItem('cinebook_user',  JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Called by Navbar logout button
  const logout = () => {
    localStorage.removeItem('cinebook_token');
    localStorage.removeItem('cinebook_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isLoggedIn : !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook (shortcut for consuming the context) ────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export default AuthContext;
