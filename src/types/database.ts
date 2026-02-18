// TypeScript types matching the Supabase database schema.
// Used as the generic argument for createClient<Database>().

export interface Database {
    public: {
        Tables: {
            input_documents: {
                Row: {
                    id: string;
                    document_name: string;
                    document_type: string;
                    timestamp: string;
                    total_clauses: number;
                    analyzed_clauses: number;
                    analysis_status: string;
                    uploaded_by: string;
                    page_count: number;
                    language: string;
                    critical_clauses: number;
                };
                Insert: {
                    id?: string;
                    document_name: string;
                    document_type: string;
                    timestamp?: string;
                    total_clauses?: number;
                    analyzed_clauses?: number;
                    analysis_status?: string;
                    uploaded_by: string;
                    page_count?: number;
                    language?: string;
                    critical_clauses?: number;
                };
                Update: Partial<Database['public']['Tables']['input_documents']['Insert']>;
            };
            clause_analyses: {
                Row: {
                    id: string;
                    document_id: string;
                    clause_number: string;
                    clause_text: string;
                    classification: string;
                    severity: string;
                    confidence_score: number;
                    findings: string;
                    remediation: string;
                    shariah_issues: string[];
                    sama_issues: string[];
                    is_critical_for_shariah: boolean;
                    contains_arabic: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    document_id: string;
                    clause_number: string;
                    clause_text: string;
                    classification?: string;
                    severity?: string;
                    confidence_score?: number;
                    findings?: string;
                    remediation?: string;
                    shariah_issues?: string[];
                    sama_issues?: string[];
                    is_critical_for_shariah?: boolean;
                    contains_arabic?: boolean;
                };
                Update: Partial<Database['public']['Tables']['clause_analyses']['Insert']>;
            };
            final_decisions: {
                Row: {
                    id: string;
                    clause_id: string;
                    final_verdict: string;
                    confidence: number;
                    reasoning: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    clause_id: string;
                    final_verdict: string;
                    confidence?: number;
                    reasoning?: string;
                };
                Update: Partial<Database['public']['Tables']['final_decisions']['Insert']>;
            };
            sama_regulation_results: {
                Row: {
                    id: string;
                    clause_id: string;
                    regulation_reference: string;
                    compliance_status: string;
                    details: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    clause_id: string;
                    regulation_reference?: string;
                    compliance_status?: string;
                    details?: string;
                };
                Update: Partial<Database['public']['Tables']['sama_regulation_results']['Insert']>;
            };
            aaoifistandards_analysis_results: {
                Row: {
                    id: string;
                    clause_id: string;
                    standard_reference: string;
                    compliance_status: string;
                    details: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    clause_id: string;
                    standard_reference?: string;
                    compliance_status?: string;
                    details?: string;
                };
                Update: Partial<Database['public']['Tables']['aaoifistandards_analysis_results']['Insert']>;
            };
            monthly_limits: {
                Row: {
                    id: string;
                    user_id: string;
                    limits: number;
                    current_usage: number;
                    reset_date: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    limits: number;
                    current_usage?: number;
                    reset_date?: string;
                };
                Update: Partial<Database['public']['Tables']['monthly_limits']['Insert']>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}
