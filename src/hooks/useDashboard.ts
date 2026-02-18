import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/stores/authStore';

export function useDashboard() {
    const userId = useAuthStore((s) => s.user?.id);

    const recentAnalyses = useQuery({
        queryKey: ['recent-analyses', userId],
        queryFn: () => dashboardService.getRecentAnalyses(userId!),
        enabled: !!userId,
        staleTime: 30_000, // 30 seconds
    });

    const monthlyStats = useQuery({
        queryKey: ['monthly-stats', userId],
        queryFn: () => dashboardService.getMonthlyStats(userId!),
        enabled: !!userId,
        staleTime: 60_000,
    });

    const monthlyLimits = useQuery({
        queryKey: ['monthly-limits', userId],
        queryFn: () => dashboardService.getMonthlyLimits(userId!),
        enabled: !!userId,
        staleTime: 60_000,
    });

    return { recentAnalyses, monthlyStats, monthlyLimits };
}
