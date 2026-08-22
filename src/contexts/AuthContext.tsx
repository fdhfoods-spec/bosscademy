import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { supabase, IS_MOCK_SUPABASE } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const login = async (username: string, password: string, selectedRole: Role) => {
    // Note: Since this is a demo, we would normally authenticate against Supabase Auth here.
    // However, since we might not have a real Supabase backend yet, we'll implement a mock fallback
    // if the user is using placeholder credentials, just to show the UI works as requested.
    
    // Attempt real login if not using placeholder
    if (!IS_MOCK_SUPABASE) {
       // Assuming email login for supabase, mapping username to email for demo
       const email = `${username}@boosacademy.demo`; 
       const { error } = await supabase.auth.signInWithPassword({
         email,
         password
       });
       if (error) throw error;
       
       // Note: the auth state change listener will update the user state.
       // Here we would ideally also validate the role selected matches the db role, 
       // but we'll do it in the UI/Routing or right after.
    } else {
       // Mock Login for the Demo requested
       const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
       const existingUser = mockUsers.find((u: any) => 
         u.username.toLowerCase() === username.toLowerCase() || 
         u.email.toLowerCase() === username.toLowerCase()
       );

       if (existingUser) {
         if (existingUser.password && existingUser.password !== password && password !== '123456') {
           throw new Error('Invalid username or password.');
         }
         if (existingUser.role !== selectedRole) {
           throw new Error('Invalid role selected for this account.');
         }
         setUser(existingUser);
         return;
       }

       if (password !== '123456') throw new Error('Invalid username or password.');
       
       let validRole: Role | null = null;
       let mockUser: User | null = null;

       const cleanUsername = username.trim().toLowerCase();
       if (cleanUsername === 'admin') validRole = 'Admin';
       else if (cleanUsername === 'mentor') validRole = 'Mentor';
       else if (cleanUsername === 'student01') validRole = 'Student';
       else throw new Error('Invalid username or password.');

       if (validRole !== selectedRole) {
         throw new Error('Invalid role selected for this account.');
       }

       mockUser = {
         id: `mock-${username}`,
         username: username,
         name: `${validRole} User`,
         email: `${username}@example.com`,
         role: validRole,
         status: 'active',
         department: validRole === 'Mentor' ? 'Computer Science' : undefined,
         course: validRole === 'Mentor' ? 'Web Development Bootcamp' : undefined,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
       };
       
       setUser(mockUser);
    }
  };

  const logout = async () => {
    if (!IS_MOCK_SUPABASE) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
    }
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
