import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'cinebook_token';
const USER_KEY = 'cinebook_user';

function normalizeUser(userData) {
  if (!userData) return null;
  return {
    User_Id: userData.User_Id ?? userData.user_id,
    First_Name: userData.First_Name ?? userData.first_name,
    Last_Name: userData.Last_Name ?? userData.last_name,
    Email: userData.Email ?? userData.email,
    Role: userData.Role ?? userData.role,
    Loyalty_Status: userData.Loyalty_Status ?? userData.loyalty_status ?? 'Standard',
    Theatre_Id: userData.Theatre_Id ?? userData.theatre_id ?? null
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    setToken(newToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('cinebook_pending_payment');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoggedIn: !!token && !!user,
      token,
      user,
      loading,
      login,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
