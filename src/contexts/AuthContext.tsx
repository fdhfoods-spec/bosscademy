import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { supabase, IS_MOCK_SUPABASE } from '../lib/supabase';
import { initializeMockData } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_MOCK_SUPABASE) {
      initializeMockData();
    }

    // Check active sessions and sets the user
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile as User);
        }
      }
      setLoading(false);
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser(profile as User || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    const cleanUsername = username.trim().toLowerCase();
    
    // For Mentors and Students, we use proper Supabase Authentication
    if (IS_MOCK_SUPABASE) {
      // Check if the login attempt is for the Admin (using mock credentials)
      if (cleanUsername === 'admin@gmail.com') {
        if (password !== '123456rj') throw new Error('Invalid admin credentials.');
        
        const mockAdmin: User = {
          id: `mock-admin`,
          username: 'admin@gmail.com',
          name: `Admin User`,
          email: `admin@gmail.com`,
          role: 'Admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(mockAdmin);
        return mockAdmin;
      }

      // Mock Fallback for Demo without backend
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const existingUser = mockUsers.find((u: any) => 
        u.username.toLowerCase() === cleanUsername || 
        (u.email && u.email.toLowerCase() === cleanUsername)
      );

      if (!existingUser) {
        throw new Error('Invalid username or password.');
      }

      if (!existingUser.password) {
        throw new Error('Please set up your password using the link sent to your email.');
      }
      
      // Since mock_users stores password as btoa(password), we decode it for comparison
      // In live mode, Supabase automatically handles bcrypt validation securely
      const decodedPassword = atob(existingUser.password);
      
      if (decodedPassword !== password) {
        throw new Error('Invalid username or password.');
      }
      
      setUser(existingUser);
      return existingUser;
    } else {
      // Live Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanUsername,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Failed to fetch')) {
          throw new Error('Invalid username or password, or Supabase backend is unreachable.');
        }
        throw error;
      }

      // Fetch the user's profile from the database to determine role and details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        // If no profile exists, sign them out as they shouldn't have access
        await supabase.auth.signOut();
        throw new Error('No profile associated with this account. Please contact the administrator.');
      }

      setUser(profile as User);
      return profile as User;
    }
  };

  const logout = async () => {
    if (user?.role !== 'Admin') {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
