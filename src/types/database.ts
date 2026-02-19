// TypeScript types matching the Supabase database schema.
// Used as the generic argument for createClient<Database>().

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            input_documents: {
                Row: {
                    id: string;
                    document_name: string;
                    document_type: string;
                    timestamp: string;
                    analysis_status: string;
                    total_clauses: number;
                    analyzed_clauses: number;
                    uploaded_by: string;
                    page_count: number;
                    language: string;
                    critical_clauses: number;
                    processing_status?: string;
                    current_step?: string;
                    progress_percent?: number;
                };
                Insert: {
                    id?: string;
                    document_name: string;
                    document_type: string;
                    timestamp?: string;
                    analysis_status?: string;
                    total_clauses?: number;
                    analyzed_clauses?: number;
                    uploaded_by: string;
                    page_count?: number;
                    language?: string;
                    critical_clauses?: number;
                    processing_status?: string;
                    current_step?: string;
                    progress_percent?: number;
                };
                Update: Partial<Database['public']['Tables']['input_documents']['Insert']>;
            };
            clause_analyses: {
                Row: {
                    id: string;
                    document_id: string;
                    document_name?: string;
                    clause_number: string;
                    clause_text: string;
                    subclauses?: Json;
                    is_critical_for_shariah: boolean;
                    contains_arabic: boolean;
                    analysis_status?: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    document_id: string;
                    document_name?: string;
                    clause_number: string;
                    clause_text: string;
                    subclauses?: Json;
                    is_critical_for_shariah?: boolean;
                    contains_arabic?: boolean;
                    analysis_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Database['public']['Tables']['clause_analyses']['Insert']>;
            };
            final_decisions: {
                Row: {
                    id: string;
                    clause_id: string;
                    document_id: string;
                    final_classification: string;
                    final_severity: string;
                    final_confidence: number;
                    decision_rationale: string;
                    conflicts_identified?: Json;
                    consolidated_violations?: Json;
                    consolidated_remediation?: string;
                    required_actions?: Json;
                    audit_trace?: Json;
                    layer_summary?: Json;
                    parsed_at?: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    clause_id: string;
                    document_id: string;
                    final_classification: string;
                    final_severity: string;
                    final_confidence?: number;
                    decision_rationale?: string;
                    conflicts_identified?: Json;
                    consolidated_violations?: Json;
                    consolidated_remediation?: string;
                    required_actions?: Json;
                    audit_trace?: Json;
                    layer_summary?: Json;
                    parsed_at?: string;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['final_decisions']['Insert']>;
            };
            sama_regulation_results: {
                Row: {
                    id: string;
                    document_id: string;
                    clause_id: string;
                    classification: string;
                    severity: string;
                    confidence: number;
                    sama_regulations_referenced?: Json;
                    findings: string;
                    consumer_protection_issues?: Json;
                    disclosure_gaps?: Json;
                    rule_violations?: Json;
                    remediation: string;
                    retrieval_quality?: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    document_id: string;
                    clause_id: string;
                    classification: string;
                    severity: string;
                    confidence?: number;
                    sama_regulations_referenced?: Json;
                    findings?: string;
                    consumer_protection_issues?: Json;
                    disclosure_gaps?: Json;
                    rule_violations?: Json;
                    remediation?: string;
                    retrieval_quality?: Json;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['sama_regulation_results']['Insert']>;
            };
            aaoifistandards_analysis_results: {
                Row: {
                    id: string;
                    document_id: string;
                    clause_id: string;
                    classification: string;
                    severity: string;
                    confidence: number;
                    reference?: Json;
                    findings: string;
                    remediation: string;
                    retrieval_quality?: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    document_id: string;
                    clause_id: string;
                    classification: string;
                    severity: string;
                    confidence?: number;
                    reference?: Json;
                    findings?: string;
                    remediation?: string;
                    retrieval_quality?: Json;
                    created_at?: string;
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
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    limits: number;
                    current_usage?: number;
                    reset_date?: string;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['monthly_limits']['Insert']>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}
