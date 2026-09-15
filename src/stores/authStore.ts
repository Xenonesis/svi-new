import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

interface AuthState {
  /** The user ID from Supabase auth, or null if not logged in */
  userId: string | null;
  /** Whether auth has finished loading (session checked) */
  loading: boolean;
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** User profile (name, email, role) */
  profile: Profile | null;
  /** Supabase Auth Session Token */
  token: string | null;
  /** Whether listener has been attached */
  _initialized?: boolean;

  /** Initialize: check session, fetch profile and set up listener */
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
  token: null,
  _initialized: false,

  initialize: async () => {
    if (get()._initialized) {
      return;
    }
    set({ _initialized: true });

    const handleSession = async (currentSession: Session | null) => {
      if (!currentSession) {
        set({ userId: null, loading: false, isAdmin: false, profile: null, token: null });
        return;
      }

      const userId = currentSession.user.id;
      const token = currentSession.access_token;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', userId)
        .single();

      set({
        userId,
        token,
        loading: false,
        isAdmin: profile?.role === 'admin',
        profile: profile
          ? { id: userId, full_name: profile.full_name, email: profile.email, role: profile.role }
          : null,
      });
    };

    // 1. Initial Session Check
    let {
      data: { session },
    } = await supabase.auth.getSession();

    // 2. Fallback: Parse URL hash if magic link / OAuth token fragment is present
    if (
      !session &&
      typeof window !== 'undefined' &&
      window.location.hash.includes('access_token')
    ) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      if (access_token && refresh_token) {
        try {
          const { data: setSessionData } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          session = setSessionData.session;
        } catch {
          // Ignore parse errors
        }
      }
    }

    await handleSession(session);

    // 3. Setup Auth State Listener
    supabase.auth.onAuthStateChange((_event, currentSession) => {
      handleSession(currentSession);
    });
  },

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      userId: null,
      loading: false,
      isAdmin: false,
      profile: null,
      token: null,
      _initialized: false,
    });
  },
}));
