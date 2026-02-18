import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const authService = {
    // ── Sign In ──────────────────────────────────────────────
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Invalid email or password. Please try again.');
            }
            throw new Error(error.message);
        }

        // Store in Zustand (memory) — NEVER localStorage
        useAuthStore.getState().setSession(data.session);
        useAuthStore.getState().setUser(data.user);
        return data;
    },

    // ── Sign Out ─────────────────────────────────────────────
    async signOut() {
        await supabase.auth.signOut();
        useAuthStore.getState().clearAuth();
    },

    // ── Forgot Password ──────────────────────────────────────
    async sendPasswordReset(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message);
    },

    // ── Update Password (from reset link) ───────────────────
    async updatePassword(newPassword: string) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message);
    },

    // ── Subscribe to Auth State Changes ─────────────────────
    // Call this ONCE in App.tsx
    onAuthStateChange() {
        return supabase.auth.onAuthStateChange((event, session) => {
            const store = useAuthStore.getState();
            store.setSession(session);
            store.setUser(session?.user ?? null);
            store.setLoading(false);
        });
    },
};
