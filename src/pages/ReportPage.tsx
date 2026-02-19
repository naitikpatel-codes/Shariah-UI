import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Download, RefreshCw, PlusCircle,
  CheckCircle, AlertCircle, XCircle, ChevronDown,
  AlertTriangle, Languages, Shield, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { supabase } from '@/lib/supabase';
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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  // Fetch document summary from Supabase
  const { data: doc, isLoading: docLoading, error: docError } = useQuery({
    queryKey: ['document', id],
    queryFn: () => reportsService.getDocumentSummary(id!),
    enabled: !!id,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch clauses from Supabase
  const { data: clauses = [], isLoading: clausesLoading, error: clausesError } = useQuery({
    queryKey: ['fullRequest', id],
    queryFn: () => reportsService.getFullReport(id!),
    enabled: !!id,
    retry: 1,
  });

  if (docError) console.error('Error fetching document:', docError);
  if (clausesError) console.error('Error fetching clauses:', clausesError);

  // Realtime subscription for analysis status
  useEffect(() => {
    if (!id || (doc as any)?.analysis_status === 'complete') return;

    const channel = supabase
      .channel(`doc-status-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'input_documents',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['document', id] });
          if (payload.new.analysis_status === 'complete') {
            queryClient.invalidateQueries({ queryKey: ['fullRequest', id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, (doc as any)?.analysis_status, queryClient]);

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
    id: (doc as any).id,
    document_name: (doc as any).document_name,
    document_type: (doc as any).document_type,
    timestamp: (doc as any).timestamp,
    analysis_status: (doc as any).analysis_status,
    total_clauses: (doc as any).total_clauses,
    analyzed_clauses: (doc as any).analyzed_clauses,
    uploaded_by: (doc as any).uploaded_by,
    page_count: (doc as any).page_count,
    language: (doc as any).language,
    critical_clauses: (doc as any).critical_clauses,
  } : null;

  const pdfClauses: PDFClauseAnalysis[] = clauses.map((c: any) => {
    const rawFinal = c.final_decisions;
    const final = Array.isArray(rawFinal) ? rawFinal[0] : rawFinal;

    return {
      id: c.id,
      document_id: id!,
      document_name: doc?.document_name ?? '',
      clause_number: c.clause_number,
      clause_text: c.clause_text,
      classification: final?.final_classification ? getVerdict(final.final_classification) : getVerdict(c.classification),
      severity: c.severity as Severity,
      confidence_score: c.confidence_score,
      shariah_issues: c.shariah_issues ?? [],
      sama_issues: c.sama_issues ?? [],
      findings: final?.decision_rationale
        ? final.decision_rationale
        : c.findings,
      remediation: final?.consolidated_remediation
        ? final.consolidated_remediation
        : c.remediation,
      subclauses: [],
      is_critical_for_shariah: c.is_critical_for_shariah,
      contains_arabic: c.contains_arabic,
      created_at: c.created_at,
      updated_at: c.updated_at,


      // New fields for PDF parity
      violations: final?.consolidated_violations ?? [],
      conflicts: final?.conflicts_identified?.map((x: any) => ({ conflict: x.conflict, resolution: x.resolution })) ?? [],
      required_actions: Array.isArray(final?.required_actions?.next_steps)
        ? final.required_actions.next_steps.map((s: string) => ({ action: s, priority: final.required_actions.priority }))
        : Array.isArray(final?.required_actions)
          ? final.required_actions.map((a: any) => ({ action: a.action || a, priority: a.priority }))
          : [],
      layer_summary: final?.layer_summary ? {
        aaoifi: { verdict: final.layer_summary.aaoifi?.classification, findings: final.layer_summary.aaoifi?.key_findings },
        sama: { verdict: final.layer_summary.sama?.classification, findings: final.layer_summary.sama?.key_findings },
      } : undefined,
    };
  });

  // PDF Export hook
  const { isModalOpen, loading, openModal, closeModal, handleExport } = useReportExport(
    pdfDocument as PDFInputDocument,
    pdfClauses
  );

  const counts = {
    all: clauses.length,
    compliant: clauses.filter((c: any) => {
      const rawFinal = c.final_decisions;
      const final = Array.isArray(rawFinal) ? rawFinal[0] : rawFinal;
      const v = final?.final_classification ? getVerdict(final.final_classification) : getVerdict(c.classification);
      return v === 'compliant';
    }).length,
    needs_review: clauses.filter((c: any) => {
      const rawFinal = c.final_decisions;
      const final = Array.isArray(rawFinal) ? rawFinal[0] : rawFinal;
      const v = final?.final_classification ? getVerdict(final.final_classification) : getVerdict(c.classification);
      return v === 'needs_review';
    }).length,
    non_compliant: clauses.filter((c: any) => {
      const rawFinal = c.final_decisions;
      const final = Array.isArray(rawFinal) ? rawFinal[0] : rawFinal;
      const v = final?.final_classification ? getVerdict(final.final_classification) : getVerdict(c.classification);
      return v === 'non_compliant';
    }).length,
  };

  const filtered = activeTab === 'all' ? clauses : clauses.filter((c: any) => {
    const rawFinal = c.final_decisions;
    const final = Array.isArray(rawFinal) ? rawFinal[0] : rawFinal;
    const v = final?.final_classification ? getVerdict(final.final_classification) : getVerdict(c.classification);
    return v === activeTab;
  });

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

  if (docError || !doc) {
    return (
      <div className="text-center py-24 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium text-gray-900">Document not found</p>
        <p className="text-sm mt-2">{docError ? (docError as Error).message : "The requested document could not be found."}</p>
        <div className="mt-6">
          <Link to="/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
        </div>
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
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{(doc as any)?.document_name}</span>
              <span>•</span>
              <span>{new Date((doc as any)?.timestamp).toLocaleDateString()}</span>
              {/* {(doc as any).language && (
                <>
                  <span>•</span>
                  <span className="uppercase">{(doc as any).language}</span>
                </>
              )} */}
            </div>
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
          filtered.map((clause: any) => {
            // Use final decision if available, otherwise fall back to initial analysis
            // Handle final_decisions being returned as an array or object
            const rawFinalDecision = clause.final_decisions;
            const finalDecision = Array.isArray(rawFinalDecision) ? rawFinalDecision[0] : rawFinalDecision;

            const verdict = finalDecision?.final_classification
              ? getVerdict(finalDecision.final_classification)
              : getVerdict(clause.classification);

            const v = verdictConfig[verdict];

            const severity = (finalDecision?.final_severity || clause.severity) as Severity;
            const s = severityConfig[severity || 'low'];
            const confidence = finalDecision?.final_confidence ?? clause.confidence_score;
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
                    <span className="text-sm font-medium text-gray-800">
                      {finalDecision?.final_classification || clause.classification}
                    </span>
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
                    {confidence !== undefined && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        confidence >= 0.8 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          confidence >= 0.5 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {(confidence * 100).toFixed(0)}% Conf.
                      </span>
                    )}
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", v.bg, v.color,
                      verdict === 'compliant' && 'border-compliant-border',
                      verdict === 'needs_review' && 'border-review-border',
                      verdict === 'non_compliant' && 'border-noncompliant-border',
                    )}>
                      <v.icon className="w-3.5 h-3.5" /> {v.label}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", s.bg, s.color)}>
                      {severity}
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

                    {/* Final Decision Section */}
                    {finalDecision && (
                      <div className="bg-brand-light/30 border border-brand/20 rounded-md p-4 mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-2 flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Final Decision
                        </h4>

                        {finalDecision.decision_rationale && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-gray-500 block mb-1">Rationale:</span>
                            <p className="text-sm text-gray-800 leading-relaxed">{finalDecision.decision_rationale}</p>
                          </div>
                        )}

                        {finalDecision.consolidated_remediation && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 block mb-1">Remediation / Conditions:</span>
                            <p className="text-sm text-gray-800 leading-relaxed italic">"{finalDecision.consolidated_remediation}"</p>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-brand/10 text-xs text-gray-500 flex justify-between">
                          <span>Decided: {new Date(finalDecision.created_at).toLocaleDateString()}</span>
                          <span>Confidence: {(finalDecision.final_confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}

                    {!finalDecision && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                        <p className="text-xs text-gray-500 italic flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pending final review...
                        </p>
                      </div>
                    )}

                    {/* Layer Summary */}
                    {finalDecision?.layer_summary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">AAOIFI Layer</h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Verdict:</span>
                              <span className={cn("font-medium", verdictConfig[finalDecision.layer_summary.aaoifi.classification as Verdict]?.color)}>
                                {finalDecision.layer_summary.aaoifi.classification}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mt-2">{finalDecision.layer_summary.aaoifi.key_findings}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">SAMA Layer</h4>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Verdict:</span>
                              <span className={cn("font-medium", verdictConfig[finalDecision.layer_summary.sama.classification as Verdict]?.color)}>
                                {finalDecision.layer_summary.sama.classification}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mt-2">{finalDecision.layer_summary.sama.key_findings}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Violations */}
                    {finalDecision?.consolidated_violations?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-noncompliant mb-2 flex items-center gap-2">
                          <XCircle className="w-3 h-3" /> Violations
                        </h4>
                        <div className="space-y-2">
                          {finalDecision.consolidated_violations.map((v: any, i: number) => (
                            <div key={i} className="text-sm text-gray-800 bg-noncompliant-bg/50 border border-noncompliant-border/50 p-2.5 rounded flex items-start justify-between gap-3">
                              <span>{v.type || v}</span>
                              {v.source_layer && <span className="text-[10px] uppercase tracking-wider bg-white/50 px-1.5 py-0.5 rounded text-gray-500">{v.source_layer}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conflicts */}
                    {finalDecision?.conflicts_identified?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-review mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Conflicts Resolved
                        </h4>
                        <div className="space-y-2">
                          {finalDecision.conflicts_identified.map((c: any, i: number) => (
                            <div key={i} className="text-sm bg-review-bg/30 border border-review-border/30 p-2.5 rounded">
                              <p className="font-medium text-gray-800 mb-1">{c.conflict}</p>
                              <p className="text-xs text-gray-600">Resolution: {c.resolution}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Required Actions */}
                    {finalDecision?.required_actions && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-2 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" /> Required Actions
                          {finalDecision.required_actions.priority && (
                            <span className="text-[10px] bg-brand-light text-brand px-2 py-0.5 rounded-full border border-brand/20">
                              {finalDecision.required_actions.priority} Priority
                            </span>
                          )}
                        </h4>

                        {/* Handle new object format with next_steps array */}
                        {finalDecision.required_actions.next_steps && Array.isArray(finalDecision.required_actions.next_steps) && (
                          <ul className="space-y-1">
                            {finalDecision.required_actions.next_steps.map((step: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Fallback for legacy array format */}
                        {Array.isArray(finalDecision.required_actions) && (
                          <ul className="space-y-1">
                            {finalDecision.required_actions.map((action: any, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand flex-shrink-0" />
                                <span>{action.action || action}</span>
                                {(action.priority) && <span className="text-[10px] font-mono text-gray-400 uppercase">[{action.priority}]</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Old fallback sections if final decision is missing detailed data but we have legacy data */}
                    {!finalDecision?.layer_summary && shariahIssues.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">AAOIFI Findings (Legacy)</h4>
                        {shariahIssues.map((issue: any, i: number) => (
                          <p key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-review flex-shrink-0 mt-0.5" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    {!finalDecision?.layer_summary && samaIssues.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">SAMA Findings (Legacy)</h4>
                        {samaIssues.map((issue: any, i: number) => (
                          <p key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
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
