import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    setUser: (user) => set({ user }),
    setSession: (session) =>
        set({ session, isAuthenticated: !!session }),
    setLoading: (isLoading) => set({ isLoading }),
    clearAuth: () =>
        set({ user: null, session: null, isAuthenticated: false }),
}));
