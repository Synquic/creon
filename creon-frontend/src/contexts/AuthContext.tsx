import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as simpleApi from '../services/api-simple';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer' | 'user';
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  theme: {
    background: string;
    textColor: string;
    buttonStyle: string;
  };
  isPremium: boolean;
  profileUrl: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (simpleApi.isAuthenticated()) {
          const response = await simpleApi.getProfile();
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        simpleApi.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await simpleApi.login({ identifier, password });
      const { user: userData, tokens } = response.data.data;

      simpleApi.setTokens(tokens);
      setUser(userData);
      toast.success('Welcome back!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await simpleApi.register(data);
      const { user: userData, tokens } = response.data.data;

      simpleApi.setTokens(tokens);
      setUser(userData);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Note: logout endpoint not implemented in simple API yet
      console.log('Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      simpleApi.clearTokens();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};