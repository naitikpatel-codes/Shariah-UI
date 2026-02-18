import { authService } from '@/services/auth.service';

const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000; // 8 hours
let inactivityTimer: ReturnType<typeof setTimeout>;

export function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(async () => {
        await authService.signOut();
        window.location.href = '/login?reason=expired';
    }, INACTIVITY_LIMIT_MS);
}
