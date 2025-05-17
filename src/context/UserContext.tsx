"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { showError } from '@/utils/toast';

// Define possible roles
type UserRole = 'admin' | 'hr' | 'employee' | null;

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole; // Add role to profile type
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch the user's profile from the 'profiles' table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role') // Select the new role column
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          showError("Gagal memuat profil pengguna: " + error.message);
          setProfile(null); // Clear profile on error
        } else {
          console.log("Fetched user profile:", data);
          setProfile(data as UserProfile); // Cast data to UserProfile type
        }
      } else {
        setProfile(null); // Clear profile if no user
      }
      setLoading(false);
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      fetchUserAndProfile(session?.user || null);
    });

    // Fetch initial user and profile state
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndProfile(session?.user || null);
    });


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const role = profile?.role || null; // Get role from profile, default to null

  return (
    <UserContext.Provider value={{ user, profile, role, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};