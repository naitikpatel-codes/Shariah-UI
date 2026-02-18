import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Download, RefreshCw, PlusCircle,
  CheckCircle, AlertCircle, XCircle, ChevronDown,
  AlertTriangle, Languages, Shield, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { Verdict, Severity } from '@/types';
import { cn } from '@/lib/utils';
import { ExportModal } from '@/components/ExportModal';
import { useReportExport } from '@/hooks/useReportExport';
import { ClauseAnalysis as PDFClauseAnalysis, InputDocument as PDFInputDocument } from '@/types/pdf.types';

const verdictConfig: Record<Verdict, { label: string; icon: typeof CheckCircle; color: string; bg: string; borderColor: string }> = {
  compliant: { label: 'Compliant', icon: CheckCircle, color: 'text-compliant', bg: 'bg-compliant-bg', borderColor: 'border-l-compliant' },
  needs_review: { label: 'Needs Review', icon: AlertCircle, color: 'text-review', bg: 'bg-review-bg', borderColor: 'border-l-review' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, color: 'text-noncompliant', bg: 'bg-noncompliant-bg', borderColor: 'border-l-noncompliant' },
};

const severityConfig: Record<Severity, { color: string; bg: string }> = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { color: 'text-review', bg: 'bg-review-bg' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50' },
  critical: { color: 'text-noncompliant', bg: 'bg-noncompliant-bg' },
};

type FilterTab = 'all' | Verdict;

export default function ReportPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  // Fetch document summary from Supabase
  const { data: doc, isLoading: docLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => reportsService.getDocumentSummary(id!),
    enabled: !!id,
  });

  // Fetch clauses from Supabase
  const { data: clauses = [], isLoading: clausesLoading } = useQuery({
    queryKey: ['clauses', id],
    queryFn: () => reportsService.getClauses(id!),
    enabled: !!id,
  });

  const isLoading = docLoading || clausesLoading;

  // Map classification to verdict for display
  const getVerdict = (classification: string): Verdict => {
    if (classification === 'compliant') return 'compliant';
    if (classification === 'needs_review') return 'needs_review';
    if (classification === 'non_compliant') return 'non_compliant';
    return 'needs_review'; // fallback
  };

  // Convert Supabase data to PDF types for export
  const pdfDocument: PDFInputDocument | null = doc ? {
    id: doc.id,
    document_name: doc.document_name,
    document_type: doc.document_type,
    timestamp: doc.timestamp,
    analysis_status: doc.analysis_status,
    total_clauses: doc.total_clauses,
    analyzed_clauses: doc.analyzed_clauses,
    uploaded_by: doc.uploaded_by,
    page_count: doc.page_count,
    language: doc.language,
    critical_clauses: doc.critical_clauses,
  } : null;

  const pdfClauses: PDFClauseAnalysis[] = clauses.map((c) => ({
    id: c.id,
    document_id: id!,
    document_name: doc?.document_name ?? '',
    clause_number: c.clause_number,
    clause_text: c.clause_text,
    classification: getVerdict(c.classification),
    severity: c.severity as Severity,
    confidence_score: c.confidence_score,
    shariah_issues: c.shariah_issues ?? [],
    sama_issues: c.sama_issues ?? [],
    findings: c.findings,
    remediation: c.remediation,
    subclauses: [],
    is_critical_for_shariah: c.is_critical_for_shariah,
    contains_arabic: c.contains_arabic,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  // PDF Export hook
  const { isModalOpen, loading, openModal, closeModal, handleExport } = useReportExport(
    pdfDocument as PDFInputDocument,
    pdfClauses
  );

  const counts = {
    all: clauses.length,
    compliant: clauses.filter((c) => getVerdict(c.classification) === 'compliant').length,
    needs_review: clauses.filter((c) => getVerdict(c.classification) === 'needs_review').length,
    non_compliant: clauses.filter((c) => getVerdict(c.classification) === 'non_compliant').length,
  };

  const filtered = activeTab === 'all' ? clauses : clauses.filter((c) => getVerdict(c.classification) === activeTab);

  const toggleClause = (clauseId: string) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      next.has(clauseId) ? next.delete(clauseId) : next.add(clauseId);
      return next;
    });
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Clauses', count: counts.all },
    { key: 'compliant', label: 'Compliant', count: counts.compliant },
    { key: 'needs_review', label: 'Needs Review', count: counts.needs_review },
    { key: 'non_compliant', label: 'Non-Compliant', count: counts.non_compliant },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-24 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm">Document not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand" strokeWidth={1.75} />
          <div>
            <h1 className="font-display font-bold text-xl text-gray-900">Shariah Compliance Report</h1>
            <p className="text-sm text-gray-500">{doc.document_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/new-analysis">
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
              <PlusCircle className="w-4 h-4 mr-1.5" /> New Analysis
            </Button>
          </Link>
          <Button size="sm" className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand" onClick={openModal}>
            <Download className="w-4 h-4 mr-1.5" /> Export Report
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clauses', value: counts.all, color: 'text-gray-900', icon: FileText },
          { label: 'Compliant', value: counts.compliant, color: 'text-compliant', icon: CheckCircle },
          { label: 'Needs Review', value: counts.needs_review, color: 'text-review', icon: AlertCircle },
          { label: 'Non-Compliant', value: counts.non_compliant, color: 'text-noncompliant', icon: XCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} strokeWidth={1.75} />
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
            <p className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-colors duration-200",
              activeTab === tab.key
                ? "text-brand border-brand"
                : "text-gray-500 border-transparent hover:text-gray-800"
            )}
          >
            {tab.label}
            <span className={cn(
              "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-semibold",
              activeTab === tab.key ? "bg-accent text-brand" : "bg-gray-100 text-gray-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Clause Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No clauses found for this filter.</p>
          </div>
        ) : (
          filtered.map((clause) => {
            const verdict = getVerdict(clause.classification);
            const v = verdictConfig[verdict];
            const s = severityConfig[(clause.severity as Severity) || 'low'];
            const expanded = expandedClauses.has(clause.id);
            const shariahIssues = clause.shariah_issues ?? [];
            const samaIssues = clause.sama_issues ?? [];

            return (
              <div
                key={clause.id}
                className={cn(
                  "bg-surface rounded-r-md border border-border border-l-4 shadow-card transition-all duration-200",
                  v.borderColor
                )}
              >
                {/* Collapsed Header */}
                <button
                  onClick={() => toggleClause(clause.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-medium text-gray-500 flex-shrink-0">[{clause.clause_number}]</span>
                    <span className="text-sm font-medium text-gray-800">{clause.classification}</span>
                    {clause.is_critical_for_shariah && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-noncompliant-bg text-noncompliant border border-noncompliant-border">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                    {clause.contains_arabic && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                        <Languages className="w-3 h-3" /> Arabic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", v.bg, v.color,
                      verdict === 'compliant' && 'border-compliant-border',
                      verdict === 'needs_review' && 'border-review-border',
                      verdict === 'non_compliant' && 'border-noncompliant-border',
                    )}>
                      <v.icon className="w-3.5 h-3.5" /> {v.label}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", s.bg, s.color)}>
                      {clause.severity}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", expanded && "rotate-180")} />
                  </div>
                </button>

                {/* Collapsed preview */}
                {!expanded && (
                  <div className="px-5 pb-4 -mt-1">
                    <p className="text-xs text-gray-500 truncate">{clause.clause_text.substring(0, 120)}...</p>
                  </div>
                )}

                {/* Expanded Body */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4 animate-fade-up">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Clause Text</h4>
                      <p className={cn("text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md", clause.contains_arabic && "text-right direction-rtl")} dir={clause.contains_arabic ? 'rtl' : 'ltr'}>
                        "{clause.clause_text}"
                      </p>
                    </div>

                    {shariahIssues.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">AAOIFI Findings</h4>
                        {shariahIssues.map((issue, i) => (
                          <p key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-review flex-shrink-0 mt-0.5" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    {samaIssues.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">SAMA Findings</h4>
                        {samaIssues.map((issue, i) => (
                          <p key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Findings Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{clause.findings}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Remediation</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{clause.remediation}</p>
                    </div>

                    <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                      <span>Confidence: {(clause.confidence_score * 100).toFixed(0)}%</span>
                      <span>Analysed: {new Date(clause.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onExport={handleExport}
        loading={loading}
      />
    </div>
  );
}
