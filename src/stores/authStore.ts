import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase/client';

interface Profile {
  full_name: string;
  email: string;
}

interface AuthState {
  /** The user ID from Supabase auth, or null if not logged in */
  userId: string | null;
  /** Whether auth has finished loading (session checked) */
  loading: boolean;
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** User profile (name, email) */
  profile: Profile | null;

  /** Initialize: check session, fetch profile */
  initialize: () => Promise<void>;
  /** Set profile data */
  setProfile: (profile: Profile) => void;
  /** Sign out — clears session and local state */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  loading: true,
  isAdmin: false,
  profile: null,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      set({ userId: null, loading: false, isAdmin: false, profile: null });
      return;
    }

    const userId = session.user.id;

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    set({
      userId,
      loading: false,
      isAdmin: true, // All authenticated users in admin area are admins
      profile: profile ? { full_name: profile.full_name, email: profile.email } : null,
    });
  },

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null, loading: false, isAdmin: false, profile: null });
  },
}));
