import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            storage: undefined,          // NO localStorage — memory only
            persistSession: false,       // Session lives in Zustand store
            autoRefreshToken: true,
            detectSessionInUrl: true,    // Required for password reset flow
        },
        realtime: {
            params: { eventsPerSecond: 2 },
        },
        global: {
            headers: { 'x-application-name': 'shariah-screener' },
        },
    }
);
