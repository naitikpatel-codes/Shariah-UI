export type AnalysisStatus =
  | 'pending'
  | 'extracting'
  | 'analysing'
  | 'finalising'
  | 'complete'
  | 'failed';

export type Verdict = 'compliant' | 'needs_review' | 'non_compliant';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type LicenseStatus = 'active' | 'suspended' | 'expired';
export type ContractType =
  | 'Murabaha' | 'Ijarah' | 'Musharakah' | 'Mudarabah'
  | 'Istisna' | 'Tawarruq' | 'Sukuk' | 'Wakalah';

export interface Conflict {
  conflict: string;
  resolution: string;
}

export interface Violation {
  type: string;
  severity: Severity;
  source_layer: string;
}

export interface RequiredAction {
  action: string;
  priority: string;
}

export interface LayerResult {
  classification: Verdict;
  severity: Severity;
  key_findings: string;
}

export interface LayerSummary {
  aaoifi: LayerResult;
  sama: LayerResult;
}

export interface FinalDecision {
  id: string;
  clause_id: string;
  document_id: string;
  final_classification: Verdict;
  final_severity: Severity;
  final_confidence: number;
  decision_rationale: string;
  conflicts_identified: Conflict[];
  consolidated_violations: Violation[];
  consolidated_remediation: string;
  required_actions: RequiredAction[];
  layer_summary: LayerSummary;
  audit_trace: any;
  created_at: string;
}

export interface ClauseAnalysis {
  id: string;
  document_id: string;
  clause_number: string;
  clause_text: string;
  classification: string; // Keep for fallback
  severity: Severity; // Keep for fallback
  confidence_score: number;
  shariah_issues: string[];
  sama_issues: string[];
  findings: string;
  remediation: string;
  subclauses: string[];
  is_critical_for_shariah: boolean;
  contains_arabic: boolean;
  verdict?: Verdict; // logical verdict
  created_at: string;

  // Joined tables
  final_decisions?: FinalDecision;
}

export interface InputDocument {
  id: string;
  document_name: string;
  document_type: ContractType;
  timestamp: string;
  analysis_status: AnalysisStatus;
  total_clauses: number;
  analyzed_clauses: number;
  uploaded_by: string;
  page_count: number;
  language: string;
  critical_clauses: number;
  processing_status?: string;
  current_step?: string;
  progress_percent?: number;
}
