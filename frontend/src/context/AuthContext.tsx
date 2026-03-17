import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

import API from '../apiConfig';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'admin';
  roomId: any;
  profilePhoto?: string;
  token: string;
  notifications?: any[];
  bookingStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateUser: () => Promise<void>;
  uploadPhoto: (base64: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hostel_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('hostel_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const signup = async (name: string, email: string, password: string, phone: string) => {
    const { data } = await axios.post(`${API}/auth/signup`, { name, email, password, phone });
    setUser(data);
    localStorage.setItem('hostel_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostel_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API}/auth/me`);
      const updated = { ...data, token: user.token };
      setUser(updated);
      localStorage.setItem('hostel_user', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const uploadPhoto = async (profilePhoto: string) => {
    if (!user) return;
    const { data } = await axios.patch(`${API}/auth/profile-photo`, { profilePhoto });
    const updated = { ...user, profilePhoto: data.profilePhoto };
    setUser(updated);
    localStorage.setItem('hostel_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, uploadPhoto }}>
      {children}
    </AuthContext.Provider>
  );
};
