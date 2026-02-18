import { Link } from 'react-router-dom';
import {
  BarChart3, CheckCircle, AlertCircle, XCircle,
  PlusCircle, ArrowUp, ArrowDown, FileText, Eye, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { recentAnalyses, monthlyStats, monthlyLimits } = useDashboard();

  // Derive display values from live data
  const usageDisplay = monthlyLimits.data
    ? `${monthlyLimits.data.current_usage} / ${monthlyLimits.data.limits}`
    : '— / —';
  const barPercent = monthlyLimits.data
    ? (monthlyLimits.data.current_usage / monthlyLimits.data.limits) * 100
    : 0;

  const compliantCount = monthlyStats.data?.compliantClauses ?? '—';
  const needsReviewCount = monthlyStats.data?.needsReview ?? '—';
  const nonCompliantCount = monthlyStats.data?.nonCompliant ?? '—';

  const showUsageWarning =
    monthlyLimits.data &&
    monthlyLimits.data.current_usage / monthlyLimits.data.limits >= 0.9;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const statCards = [
    {
      label: 'Analyses This Month',
      value: usageDisplay,
      icon: BarChart3,
      featured: true,
      trend: null as number | null,
      showBar: true,
      barPercent,
    },
    {
      label: 'Compliant Clauses',
      value: compliantCount.toString(),
      icon: CheckCircle,
      featured: false,
      trend: null as number | null,
      trendLabel: 'vs last month',
    },
    {
      label: 'Needs Review',
      value: needsReviewCount.toString(),
      icon: AlertCircle,
      featured: false,
      trend: null as number | null,
      trendLabel: 'vs last month',
    },
    {
      label: 'Non-Compliant',
      value: nonCompliantCount.toString(),
      icon: XCircle,
      featured: false,
      trend: null as number | null,
      trendLabel: 'vs last month',
    },
  ];

  const isLoading = recentAnalyses.isLoading || monthlyStats.isLoading || monthlyLimits.isLoading;

  return (
    <div className="space-y-6">
      {/* 90% Usage Warning */}
      {showUsageWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          ⚠️ You've used {Math.round((monthlyLimits.data!.current_usage / monthlyLimits.data!.limits) * 100)}% of your monthly analysis quota.
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {userName}</p>
        </div>
        <Link to="/new-analysis">
          <Button className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5">
            <PlusCircle className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className={cn(
              "rounded-xl p-6 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 animate-card-reveal border",
              card.featured
                ? "bg-brand border-brand text-primary-foreground"
                : "bg-surface border-border"
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <card.icon className={cn("w-5 h-5", card.featured ? "text-primary-foreground/75" : "text-gray-400")} strokeWidth={1.75} />
                <span className={cn("text-xs font-medium", card.featured ? "text-primary-foreground/75" : "text-gray-500")}>
                  {card.label}
                </span>
              </div>
            </div>
            <p className={cn("text-3xl font-display font-bold mb-2", card.featured ? "text-primary-foreground" : "text-gray-900")}>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin opacity-50" />
              ) : (
                card.value
              )}
            </p>
            {card.showBar && (
              <div className="h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary-foreground/60 rounded-full transition-all duration-700"
                  style={{ width: `${card.barPercent}%` }}
                />
              </div>
            )}
            {card.trend !== undefined && card.trend !== null && (
              <div className="flex items-center gap-1 mt-1">
                {card.trend > 0 ? (
                  <ArrowUp className="w-3 h-3 text-compliant" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-noncompliant" />
                )}
                <span className={cn("text-xs font-medium", card.trend > 0 ? "text-compliant" : "text-noncompliant")}>
                  {Math.abs(card.trend)}
                </span>
                <span className="text-xs text-gray-400 ml-1">{card.trendLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Analyses & Quick Start */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Analyses */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-gray-900">Recent Analyses</h2>
            <Link to="/reports" className="text-xs text-brand hover:text-brand-dark font-medium transition-colors">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Document</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Clauses</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading analyses...
                    </td>
                  </tr>
                ) : recentAnalyses.data && recentAnalyses.data.length > 0 ? (
                  recentAnalyses.data.slice(0, 5).map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">{doc.document_name}</span>
                          {doc.analysis_status === 'pending' && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.document_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.total_clauses}</td>
                      <td className="px-4 py-3">
                        <Link to={`/report/${doc.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-brand hover:text-brand-dark hover:bg-accent">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      No analyses yet. Start by uploading a contract.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-surface rounded-xl border border-border shadow-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
            <PlusCircle className="w-7 h-7 text-brand" strokeWidth={1.75} />
          </div>
          <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">Quick Start</h3>
          <p className="text-sm text-gray-500 mb-6">Upload a new contract for Shariah compliance analysis</p>
          <Link to="/new-analysis">
            <Button className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5">
              New Analysis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
