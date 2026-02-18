// PDF Export Type Definitions
// Mirrors the Supabase schema for PDF generation

/** Mirrors Supabase table: input_documents */
export interface InputDocument {
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
}

/** Mirrors Supabase table: clause_analyses */
export interface ClauseAnalysis {
    id: string;
    document_id: string;
    document_name: string;

    // Core fields (shown in PDF)
    clause_number: string;
    clause_text: string;

    // Classification
    classification: 'compliant' | 'needs_review' | 'non_compliant';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence_score: number; // 0.0 – 1.0 → shown as %

    // Regulatory References
    shariah_issues: string[]; // AAOIFI findings
    sama_issues: string[]; // SAMA regulation issues

    // Findings & Remediation
    findings: string;
    remediation: string;

    // Flags
    is_critical_for_shariah: boolean;
    contains_arabic: boolean;

    created_at: string;
    updated_at: string;
    subclauses?: string[];
}

/** Computed summary — derived before passing to PDF */
export interface ReportSummary {
    totalClauses: number;
    compliantCount: number;
    reviewCount: number;
    nonCompliantCount: number;
    complianceScore: number; // (compliant / total) * 100
    generatedAt: string; // formatted date string
    analystName: string; // from user profile
    analystEmail: string;
}
