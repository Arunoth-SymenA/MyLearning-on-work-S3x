import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { LOGIN_USER, REGISTER_USER } from '../graphql/mutations';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
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
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_USER);
  const [registerMutation] = useMutation(REGISTER_USER);

  // Get current user on mount
  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !localStorage.getItem('token'),
    onError: () => {
      localStorage.removeItem('token');
      setUser(null);
    }
  });

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
    setLoading(meLoading);
  }, [meData, meLoading]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } }
      });

      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        setUser(data.login.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const { data } = await registerMutation({
        variables: { input: { name, email, password, role } }
      });

      if (data?.register?.token) {
        localStorage.setItem('token', data.register.token);
        setUser(data.register.user);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.assign('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
