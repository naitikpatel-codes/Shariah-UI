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
  | 'Istisna'  | 'Tawarruq' | 'Sukuk'    | 'Wakalah';

export interface ClauseAnalysis {
  id: string;
  document_id: string;
  clause_number: string;
  clause_text: string;
  classification: string;
  severity: Severity;
  confidence_score: number;
  shariah_issues: string[];
  sama_issues: string[];
  findings: string;
  remediation: string;
  subclauses: string[];
  is_critical_for_shariah: boolean;
  contains_arabic: boolean;
  verdict: Verdict;
  created_at: string;
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
}
