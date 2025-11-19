import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  const login = useCallback(async (email, role = "patient") => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, role })
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Login error response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { error: 'Invalid server response' };
        }
        return { 
          success: false, 
          error: errorData.error || `Login failed with status ${response.status}` 
        };
      }
      
      const data = await response.json();
      console.log('Login successful, user data:', data);
      
      if (data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        return { success: true };
      } else {
        console.error('Invalid response format - missing user or token');
        return { success: false, error: 'Invalid server response format' };
      }
    } catch (error) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection.' 
      };
    }
  }, []);

  const signup = useCallback(async (email, role = "patient", name = "") => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      console.log('Attempting signup at:', `${API_URL}/api/auth/signup`);
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, role, name })
      });
      
      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Signup error response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { error: 'Invalid server response' };
        }
        return { 
          success: false, 
          error: errorData.error || `Signup failed with status ${response.status}` 
        };
      }
      
      const data = await response.json();
      console.log('Signup successful, user data:', data);
      
      if (data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        return { success: true };
      } else {
        console.error('Invalid response format - missing user or token');
        return { success: false, error: 'Invalid server response format' };
      }
    } catch (error) {
      console.error('Signup exception:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection.' 
      };
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
