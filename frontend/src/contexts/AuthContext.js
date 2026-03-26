import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('nautica_token'));

  useEffect(() => {
    if (token) {
      const fetchUser = async () => {
        try {
          // Folosim instanța curată din api.js
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    // Apelăm authAPI direct
    const response = await authAPI.login(email, password);
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('nautica_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nautica_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      logout,
      updateUser,
      getAuthHeader,
      isAdmin: user?.role === 'OWNER' || user?.role === 'COACH',
      isOwner: user?.role === 'OWNER'
    }}>
      {children}
    </AuthContext.Provider>
  );
};