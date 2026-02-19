import { supabase } from '@/lib/supabase';

export const reportsService = {
    // ── Get Document Summary ─────────────────────────────────
    async getDocumentSummary(documentId: string) {
        const { data, error } = await supabase
            .from('input_documents')
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Get All Clauses for a Document ──────────────────────
    async getClauses(documentId: string) {
        const { data, error } = await supabase
            .from('clause_analyses')
            .select(`
        id,
        clause_number,
        clause_text,
        classification,
        severity,
        confidence_score,
        findings,
        remediation,
        shariah_issues,
        sama_issues,
        is_critical_for_shariah,
        contains_arabic,
        created_at,
        updated_at
      `)
            .eq('document_id', documentId)
            .order('clause_number', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Get Final Decision for a Clause ─────────────────────
    async getFinalDecision(clauseId: string) {
        const { data, error } = await supabase
            .from('final_decisions')
            .select('*')
            .eq('clause_id', clauseId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Get SAMA Results for a Clause ───────────────────────
    async getSamaResults(clauseId: string) {
        const { data, error } = await supabase
            .from('sama_regulation_results')
            .select('*')
            .eq('clause_id', clauseId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Get AAOIFI Results for a Clause ─────────────────────
    async getAaoifiResults(clauseId: string) {
        const { data, error } = await supabase
            .from('aaoifistandards_analysis_results')
            .select('*')
            .eq('clause_id', clauseId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    },

    // ── Get All Clauses with Final Decisions (for Export) ───
    async getFullReport(documentId: string) {
        const { data, error } = await supabase
            .from('clause_analyses')
            .select(`
        *,
        final_decisions (
            final_classification,
            final_severity,
            final_confidence,
            decision_rationale,
            conflicts_identified,
            consolidated_violations,
            consolidated_remediation,
            required_actions,
            layer_summary,
            created_at,
            id
        ),
        sama_regulation_results (*),
        aaoifistandards_analysis_results (*)
      `)
            .eq('document_id', documentId)
            .order('clause_number', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    },
};
