import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  role: 'student' | 'admin' | 'facilitator';
  userType?: 'student' | 'corporate' | 'partner';
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
  department: string;
  year: string;
  role?: 'student' | 'facilitator';
  userType?: 'student' | 'corporate' | 'partner';
  organization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
          else localStorage.removeItem("token");
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);

      // Redirect based on role
      if (data.user.role === 'admin' || data.user.role === 'facilitator') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      localStorage.setItem("token", responseData.token);
      setUser(responseData.user);

      // Redirect to home after registration
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
