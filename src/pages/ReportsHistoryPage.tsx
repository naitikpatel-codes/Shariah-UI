import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService } from '@/services/dashboard.service';
import { cn } from '@/lib/utils';

export default function ReportsHistoryPage() {
  const [search, setSearch] = useState('');
  const userId = useAuthStore((s) => s.user?.id);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['all-documents', userId],
    queryFn: () => dashboardService.getRecentAnalyses(userId!, 100),
    enabled: !!userId,
  });

  const filtered = (documents ?? []).filter((d) =>
    d.document_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Reports History</h1>
        <p className="text-sm text-gray-500 mt-1">All past analyses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-brand focus:ring-brand/20"
          />
        </div>
        <select className="h-10 px-3 rounded-md border border-gray-200 bg-surface text-sm text-gray-600 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
          <option value="">All Types</option>
          <option>Murabaha</option>
          <option>Ijarah</option>
          <option>Sukuk</option>
        </select>
        <select className="h-10 px-3 rounded-md border border-gray-200 bg-surface text-sm text-gray-600 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
          <option value="">All Status</option>
          <option>Complete</option>
          <option>Processing</option>
          <option>Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Document Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Clauses</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Critical</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading reports...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((doc, i) => (
                  <tr key={doc.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                        <span className="text-sm text-gray-700 font-medium">{doc.document_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.document_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(doc.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        doc.analysis_status === 'complete' && "bg-compliant-bg text-compliant",
                        doc.analysis_status === 'completed' && "bg-compliant-bg text-compliant",
                        doc.analysis_status === 'failed' && "bg-noncompliant-bg text-noncompliant",
                        !['complete', 'completed', 'failed'].includes(doc.analysis_status) && "bg-review-bg text-review"
                      )}>
                        {doc.analysis_status.charAt(0).toUpperCase() + doc.analysis_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.total_clauses}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={cn(doc.critical_clauses > 0 ? "text-noncompliant font-semibold" : "text-gray-400")}>
                        {doc.critical_clauses}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/report/${doc.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-brand hover:text-brand-dark hover:bg-accent">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
