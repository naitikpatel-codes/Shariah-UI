import { supabase } from '@/lib/supabase';

export const dashboardService = {
    // ── Recent Analyses (table on dashboard) ─────────────────
    async getRecentAnalyses(userId: string, limit = 10) {
        const { data, error } = await supabase
            .from('input_documents')
            .select('id, document_name, document_type, timestamp, total_clauses, analysis_status, critical_clauses')
            .eq('uploaded_by', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Stats Summary Cards ──────────────────────────────────
    async getMonthlyStats(userId: string) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: docs, error: docsError } = await supabase
            .from('input_documents')
            .select('id')
            .eq('uploaded_by', userId)
            .gte('timestamp', startOfMonth.toISOString());

        if (docsError) throw new Error(docsError.message);

        const docIds = docs.map((d) => d.id);

        if (docIds.length === 0) {
            return { compliantClauses: 0, needsReview: 0, nonCompliant: 0 };
        }

        const { data: clauses, error: clauseError } = await supabase
            .from('clause_analyses')
            .select('classification')
            .in('document_id', docIds);

        if (clauseError) throw new Error(clauseError.message);

        const counts = clauses.reduce(
            (acc, c) => {
                if (c.classification === 'compliant') acc.compliantClauses++;
                else if (c.classification === 'needs_review') acc.needsReview++;
                else if (c.classification === 'non_compliant') acc.nonCompliant++;
                return acc;
            },
            { compliantClauses: 0, needsReview: 0, nonCompliant: 0 }
        );

        return counts;
    },

    // ── Monthly Usage Limits ─────────────────────────────────
    async getMonthlyLimits(userId: string) {
        const { data, error } = await supabase
            .from('monthly_limits')
            .select('limits, current_usage, reset_date')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data ?? { limits: 50, current_usage: 0, reset_date: '' };
    },
};
