import React, { createContext, useState, useEffect, useContext } from 'react';

// CVAT Mock API or Real CVAT API
const API_URL = 'http://localhost:3000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = localStorage.getItem('cvat_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/users/self`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('cvat_token');
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.key) {
        localStorage.setItem('cvat_token', data.key);
        await fetchCurrentUser(data.key);
        return { success: true };
      } else {
        return { success: false, message: data.non_field_errors?.[0] || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Backend might be down.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('cvat_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
