import React, { createContext, useState, useEffect, useContext } from 'react';

// CVAT Mock API or Real CVAT API
const API_URL = 'http://localhost:3000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrganization, setActiveOrganization] = useState(null); // null = Personal Workspace
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on mount
    const token = localStorage.getItem('cvat_token');
    if (token) {
      fetchCurrentUserAndOrgs(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUserAndOrgs = async (token) => {
    try {
      // 1. Fetch User
      const userRes = await fetch(`${API_URL}/api/users/self`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      setUser(userData);

      // 2. Fetch Organizations
      const orgRes = await fetch(`${API_URL}/api/organizations`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      
      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrganizations(orgData.results || []);
      }

    } catch (error) {
      console.error("Error fetching data", error);
      localStorage.removeItem('cvat_token');
      setUser(null);
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
        await fetchCurrentUserAndOrgs(data.key);
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
    setOrganizations([]);
    setActiveOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      organizations, 
      activeOrganization, 
      setActiveOrganization, 
      login, 
      logout, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
