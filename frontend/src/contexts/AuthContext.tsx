import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Use environment variable directly - matching the API configuration
const API_BASE_URL = 'http://192.168.1.110:8000/api/v1';

console.log('🔧 AuthContext Debug:');
console.log('API_BASE_URL for authentication:', API_BASE_URL);

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const loginUrl = `${API_BASE_URL}/auth/login/`;
      console.log('🔐 AuthContext login URL:', loginUrl);
      console.log('📧 Login email:', email);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);

      // Store tokens and user data
      if (data.access) {
        localStorage.setItem('accessToken', data.access);
        setAccessToken(data.access);
      }
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
        setRefreshToken(data.refresh);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error: any) {
      console.error('❌ AuthContext login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!accessToken,
    isTeacher: user?.role === 'teacher',
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    accessToken,
    refreshToken,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
