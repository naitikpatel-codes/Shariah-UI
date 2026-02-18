# Fortiv Solutions — Supabase Integration Guide
**AI Shariah Compliance Screener**  
Version: 1.0 | Last Updated: February 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Project Structure](#3-project-structure)
4. [Supabase Client Initialisation](#4-supabase-client-initialisation)
5. [Authentication Integration (Login Page)](#5-authentication-integration-login-page)
6. [Auth State Management (Zustand)](#6-auth-state-management-zustand)
7. [Protected Route Guard](#7-protected-route-guard)
8. [Dashboard Data Integration](#8-dashboard-data-integration)
9. [Compliance Report Viewer Integration](#9-compliance-report-viewer-integration)
10. [Realtime Status Updates](#10-realtime-status-updates)
11. [Database Query Reference](#11-database-query-reference)
12. [Row Level Security (RLS) Policies](#12-row-level-security-rls-policies)
13. [UI Changes Required](#13-ui-changes-required)
14. [Error Handling Patterns](#14-error-handling-patterns)
15. [Environment Variables](#15-environment-variables)
16. [Testing Checklist](#16-testing-checklist)

---

## 1. Overview

This document describes how to wire the existing Fortiv Solutions React UI to Supabase for:

- **Authentication** — Email/password login via Supabase Auth (session stored in memory only, never localStorage)
- **Dashboard** — Live data from `input_documents`, `clause_analyses`, and `monthly_limits` tables
- **Reports** — Clause-level data from `clause_analyses`, `final_decisions`, `sama_regulation_results`, and `aaoifistandards_analysis_results`
- **Realtime** — Live analysis progress via Postgres Changes subscription

### Database Tables in Scope

| Table | Purpose |
|---|---|
| `input_documents` | One row per uploaded contract. Tracks status, clause counts, progress |
| `clause_analyses` | One row per clause per document. Core analysis output |
| `final_decisions` | Consolidated AI verdict per clause (4-layer decision) |
| `sama_regulation_results` | SAMA-layer results per clause |
| `aaoifistandards_analysis_results` | AAOIFI-layer results per clause |
| `monthly_limits` | Per-user usage counter and monthly cap |
| `documents` | Vector store documents (embeddings) — read-only from frontend |

---

## 2. Prerequisites & Environment Setup

### 2.1 Install Dependencies

```bash
npm install @supabase/supabase-js zustand @tanstack/react-query
```

### 2.2 Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Security Rule**: Only `VITE_` prefixed variables are exposed to the browser. The `anon` key is safe to expose — Supabase RLS policies protect the data. Never put `service_role` key in frontend code.

---

## 3. Project Structure

Add the following files to your existing project:

```
src/
├── lib/
│   ├── supabase.ts          ← Supabase client instance
│   └── sessionGuard.ts      ← Inactivity timeout logic
├── stores/
│   └── authStore.ts         ← Zustand auth state
├── services/
│   ├── auth.service.ts      ← Login / logout / session
│   ├── dashboard.service.ts ← Dashboard queries
│   └── reports.service.ts   ← Report & clause queries
├── hooks/
│   ├── useDocumentStatus.ts ← Realtime analysis progress
│   └── useDashboard.ts      ← Dashboard data hook
├── components/
│   └── ProtectedRoute.tsx   ← Route guard wrapper
└── types/
    └── database.ts          ← TypeScript types matching DB schema
```

---

## 4. Supabase Client Initialisation

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: undefined,          // NO localStorage — memory only
      persistSession: false,       // Session lives in Zustand store
      autoRefreshToken: true,
      detectSessionInUrl: true,    // Required for magic link / password reset flow
    },
    realtime: {
      params: { eventsPerSecond: 2 },
    },
    global: {
      headers: { 'x-application-name': 'shariah-screener' },
    },
  }
);
```

---

## 5. Authentication Integration (Login Page)

### 5.1 Auth Service

```typescript
// src/services/auth.service.ts
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const authService = {
  // ── Sign In ──────────────────────────────────────────────
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message);
    }

    // Store in Zustand (memory) — NEVER localStorage
    useAuthStore.getState().setSession(data.session);
    useAuthStore.getState().setUser(data.user);
    return data;
  },

  // ── Sign Out ─────────────────────────────────────────────
  async signOut() {
    await supabase.auth.signOut();
    useAuthStore.getState().clearAuth();
  },

  // ── Forgot Password ──────────────────────────────────────
  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  // ── Update Password (from reset link) ───────────────────
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  // ── Subscribe to Auth State Changes ─────────────────────
  // Call this ONCE in App.tsx
  onAuthStateChange() {
    return supabase.auth.onAuthStateChange((event, session) => {
      const store = useAuthStore.getState();
      store.setSession(session);
      store.setUser(session?.user ?? null);
      store.setLoading(false);

      if (event === 'SIGNED_OUT') {
        // Wipe all cached query data on logout
        // queryClient.clear(); — call this if using TanStack Query
      }
    });
  },
};
```

### 5.2 Update Login Page Component

Modify your existing login form component to call `authService.signIn`. **Do not use `<form>` tags — use onClick handlers.**

```tsx
// src/pages/Login.tsx  (modify your existing login page)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... your existing JSX ...
    // Replace the sign-in button's onClick with handleSignIn
    // Display {error} below the form fields when non-empty
    // Set button disabled={loading} and show spinner when loading
  );
}
```

---

## 6. Auth State Management (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setSession: (session) =>
    set({ session, isAuthenticated: !!session }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () =>
    set({ user: null, session: null, isAuthenticated: false }),
}));
```

### 6.1 Bootstrap in App.tsx

```tsx
// src/App.tsx — add inside your App component
import { useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { resetInactivityTimer } from '@/lib/sessionGuard';

function App() {
  useEffect(() => {
    // Subscribe to auth state changes (handles page refresh)
    const { data: { subscription } } = authService.onAuthStateChange();

    // Start inactivity timer
    ['mousemove', 'keydown', 'click', 'scroll'].forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ... rest of App
}
```

### 6.2 Session Guard (Inactivity Timeout)

```typescript
// src/lib/sessionGuard.ts
import { authService } from '@/services/auth.service';

const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000; // 8 hours
let inactivityTimer: ReturnType<typeof setTimeout>;

export function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    await authService.signOut();
    window.location.href = '/login?reason=expired';
  }, INACTIVITY_LIMIT_MS);
}
```

---

## 7. Protected Route Guard

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Router Setup

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { ReportsPage } from '@/pages/Reports';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/reports/:documentId',
    element: <ProtectedRoute><ReportsPage /></ProtectedRoute>,
  },
  {
    path: '/new-analysis',
    element: <ProtectedRoute><NewAnalysisPage /></ProtectedRoute>,
  },
]);
```

---

## 8. Dashboard Data Integration

### 8.1 Dashboard Service

```typescript
// src/services/dashboard.service.ts
import { supabase } from '@/lib/supabase';

export const dashboardService = {
  // ── Recent Analyses (Recent Analyses table on dashboard) ─────────
  async getRecentAnalyses(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('input_documents')
      .select('id, document_name, document_type, timestamp, total_clauses, analysis_status, critical_clauses')
      .eq('uploaded_by', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  },

  // ── Stats Summary Cards ──────────────────────────────────────────
  async getMonthlyStats(userId: string) {
    // Get all this-month documents for the user
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: docs, error: docsError } = await supabase
      .from('input_documents')
      .select('id')
      .eq('uploaded_by', userId)
      .gte('timestamp', startOfMonth.toISOString());

    if (docsError) throw new Error(docsError.message);

    const docIds = docs.map((d) => d.id);

    if (docIds.length === 0) {
      return { compliantClauses: 0, needsReview: 0, nonCompliant: 0 };
    }

    // Aggregate clause classifications
    const { data: clauses, error: clauseError } = await supabase
      .from('clause_analyses')
      .select('classification')
      .in('document_id', docIds);

    if (clauseError) throw new Error(clauseError.message);

    const counts = clauses.reduce(
      (acc, c) => {
        if (c.classification === 'compliant') acc.compliantClauses++;
        else if (c.classification === 'needs_review') acc.needsReview++;
        else if (c.classification === 'non_compliant') acc.nonCompliant++;
        return acc;
      },
      { compliantClauses: 0, needsReview: 0, nonCompliant: 0 }
    );

    return counts;
  },

  // ── Monthly Usage Limits ─────────────────────────────────────────
  async getMonthlyLimits(userId: string) {
    const { data, error } = await supabase
      .from('monthly_limits')
      .select('limits, current_usage, reset_date')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
```

### 8.2 Dashboard Hook (TanStack Query)

```typescript
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/stores/authStore';

export function useDashboard() {
  const userId = useAuthStore((s) => s.user?.id);

  const recentAnalyses = useQuery({
    queryKey: ['recent-analyses', userId],
    queryFn: () => dashboardService.getRecentAnalyses(userId!),
    enabled: !!userId,
    staleTime: 30_000, // 30 seconds
  });

  const monthlyStats = useQuery({
    queryKey: ['monthly-stats', userId],
    queryFn: () => dashboardService.getMonthlyStats(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const monthlyLimits = useQuery({
    queryKey: ['monthly-limits', userId],
    queryFn: () => dashboardService.getMonthlyLimits(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });

  return { recentAnalyses, monthlyStats, monthlyLimits };
}
```

### 8.3 Dashboard Page — Wiring to UI

```tsx
// src/pages/Dashboard.tsx  (key sections to modify)
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { recentAnalyses, monthlyStats, monthlyLimits } = useDashboard();

  // ── Stat Cards ──────────────────────────────────────────────────
  // Wire "Analyses This Month" card:
  const usageDisplay = monthlyLimits.data
    ? `${monthlyLimits.data.current_usage} / ${monthlyLimits.data.limits}`
    : '— / —';

  // Wire "Compliant Clauses" card:
  const compliantCount = monthlyStats.data?.compliantClauses ?? '—';

  // Wire "Needs Review" card:
  const needsReviewCount = monthlyStats.data?.needsReview ?? '—';

  // Wire "Non-Compliant" card:
  const nonCompliantCount = monthlyStats.data?.nonCompliant ?? '—';

  // ── Recent Analyses Table ────────────────────────────────────────
  // Map each row from `input_documents`:
  const tableRows = recentAnalyses.data?.map((doc) => ({
    name: doc.document_name,
    type: doc.document_type,        // e.g. "Murabaha"
    date: new Date(doc.timestamp).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
    }),
    clauses: doc.total_clauses,
    status: doc.analysis_status,    // "completed" | "pending" | "failed"
    id: doc.id,
  }));

  // ── 90% Usage Warning Banner ─────────────────────────────────────
  const showUsageWarning =
    monthlyLimits.data &&
    monthlyLimits.data.current_usage / monthlyLimits.data.limits >= 0.9;

  return (
    <>
      {showUsageWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
          ⚠️ You've used {Math.round((monthlyLimits.data!.current_usage / monthlyLimits.data!.limits) * 100)}% of your monthly analysis quota.
        </div>
      )}
      {/* Render stat cards and table using the data above */}
    </>
  );
}
```

---

## 9. Compliance Report Viewer Integration

### 9.1 Reports Service

```typescript
// src/services/reports.service.ts
import { supabase } from '@/lib/supabase';

export const reportsService = {
  // ── Get Document Summary ─────────────────────────────────────────
  async getDocumentSummary(documentId: string) {
    const { data, error } = await supabase
      .from('input_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // ── Get All Clauses for a Document ──────────────────────────────
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

  // ── Get Final Decision for a Clause ─────────────────────────────
  async getFinalDecision(clauseId: string) {
    const { data, error } = await supabase
      .from('final_decisions')
      .select('*')
      .eq('clause_id', clauseId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ?? null;
  },

  // ── Get SAMA Results for a Clause ───────────────────────────────
  async getSamaResults(clauseId: string) {
    const { data, error } = await supabase
      .from('sama_regulation_results')
      .select('*')
      .eq('clause_id', clauseId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ?? null;
  },

  // ── Get AAOIFI Results for a Clause ─────────────────────────────
  async getAaoifiResults(clauseId: string) {
    const { data, error } = await supabase
      .from('aaoifistandards_analysis_results')
      .select('*')
      .eq('clause_id', clauseId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data ?? null;
  },

  // ── Get All Clauses with Final Decisions (for Export) ───────────
  async getFullReport(documentId: string) {
    const { data, error } = await supabase
      .from('clause_analyses')
      .select(`
        *,
        final_decisions (*),
        sama_regulation_results (*),
        aaoifistandards_analysis_results (*)
      `)
      .eq('document_id', documentId)
      .order('clause_number', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },
};
```

### 9.2 Report Viewer Page — Wiring

```tsx
// src/pages/Reports.tsx  (key integration points)
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';

export function ReportsPage() {
  const { documentId } = useParams<{ documentId: string }>();

  // Document summary (header stats)
  const { data: document } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => reportsService.getDocumentSummary(documentId!),
    enabled: !!documentId,
  });

  // All clauses
  const { data: clauses } = useQuery({
    queryKey: ['clauses', documentId],
    queryFn: () => reportsService.getClauses(documentId!),
    enabled: !!documentId,
  });

  // ── Stats Header Cards ────────────────────────────────────────────
  // Total Clauses  → document?.total_clauses
  // Compliant      → clauses?.filter(c => c.classification === 'compliant').length
  // Needs Review   → clauses?.filter(c => c.classification === 'needs_review').length
  // Non-Compliant  → clauses?.filter(c => c.classification === 'non_compliant').length

  // ── Clause List Rendering ─────────────────────────────────────────
  // For each clause card:
  //   Clause number  → clause.clause_number       e.g. "[1.1]"
  //   Clause name    → derive from clause_text or use clause_number
  //   Status badge   → clause.classification      "compliant" | "needs_review" | "non_compliant"
  //   Severity       → clause.severity            "low" | "medium" | "high" | "critical"
  //   Clause text    → clause.clause_text
  //   Findings       → clause.findings
  //   Remediation    → clause.remediation
  //   Confidence     → clause.confidence_score    e.g. 95%
  //   Analysed at    → clause.created_at
}
```

### 9.3 Status Badge Colour Mapping

```typescript
// Classification → badge colour
export const classificationStyles = {
  compliant:     'bg-blue-100 text-blue-700 border-blue-200',
  needs_review:  'bg-amber-100 text-amber-700 border-amber-200',
  non_compliant: 'bg-red-100 text-red-700 border-red-200',
};

// Severity → badge colour
export const severityStyles = {
  low:      'text-gray-500',
  medium:   'text-amber-600',
  high:     'text-orange-600',
  critical: 'text-red-600 font-semibold',
};

// Clause row left border colour
export const clauseBorderStyles = {
  compliant:     'border-l-4 border-l-blue-500',
  needs_review:  'border-l-4 border-l-amber-500',
  non_compliant: 'border-l-4 border-l-red-500',
};
```

---

## 10. Realtime Status Updates

Subscribe to analysis progress while a document is being processed.

```typescript
// src/hooks/useDocumentStatus.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDocumentStatus(documentId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!documentId) return;

    const channel = supabase
      .channel(`document-status-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'input_documents',
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          // Instantly update cached document data
          queryClient.setQueryData(
            ['document', documentId],
            payload.new
          );

          // If analysis completed, also refresh clause list
          if (payload.new.analysis_status === 'completed') {
            queryClient.invalidateQueries({ queryKey: ['clauses', documentId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, queryClient]);
}
```

Usage in the New Analysis / Report pages:

```tsx
// In your progress tracking component:
useDocumentStatus(documentId);  // Automatically updates UI when status changes
```

---

## 11. Database Query Reference

Quick reference for all frontend queries mapped to UI screens.

| UI Screen | Query | Table | Filter |
|---|---|---|---|
| Dashboard — analyses count | `count` | `input_documents` | `uploaded_by = userId` |
| Dashboard — recent list | `select` | `input_documents` | `uploaded_by = userId ORDER BY timestamp DESC LIMIT 10` |
| Dashboard — stat cards | `select classification` | `clause_analyses` | `document_id IN (user's doc ids)` |
| Dashboard — usage bar | `select limits, current_usage` | `monthly_limits` | `user_id = userId` |
| Report — header stats | `select *` | `input_documents` | `id = documentId` |
| Report — clause list | `select *` | `clause_analyses` | `document_id = documentId ORDER BY clause_number` |
| Report — clause detail | `select *` | `final_decisions` | `clause_id = clauseId` |
| Report — SAMA detail | `select *` | `sama_regulation_results` | `clause_id = clauseId` |
| Report — AAOIFI detail | `select *` | `aaoifistandards_analysis_results` | `clause_id = clauseId` |
| Export — full report | join query | `clause_analyses` + related | `document_id = documentId` |

---

## 12. Row Level Security (RLS) Policies

Run these SQL statements in your Supabase SQL Editor. These ensure users can only see their own data.

```sql
-- Enable RLS on all tables
ALTER TABLE input_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clause_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sama_regulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE aaoifistandards_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_limits ENABLE ROW LEVEL SECURITY;

-- input_documents: users see only their own documents
CREATE POLICY "Users access own documents"
  ON input_documents FOR ALL
  USING (uploaded_by = auth.uid());

-- monthly_limits: users see only their own limits
CREATE POLICY "Users access own limits"
  ON monthly_limits FOR ALL
  USING (user_id = auth.uid());

-- clause_analyses: users see clauses from their documents
CREATE POLICY "Users access clauses from own documents"
  ON clause_analyses FOR ALL
  USING (
    document_id IN (
      SELECT id FROM input_documents WHERE uploaded_by = auth.uid()
    )
  );

-- final_decisions: users see decisions from their clauses
CREATE POLICY "Users access decisions from own clauses"
  ON final_decisions FOR ALL
  USING (
    clause_id IN (
      SELECT id FROM clause_analyses
      WHERE document_id IN (
        SELECT id FROM input_documents WHERE uploaded_by = auth.uid()
      )
    )
  );

-- sama_regulation_results: same pattern
CREATE POLICY "Users access sama results from own clauses"
  ON sama_regulation_results FOR ALL
  USING (
    clause_id IN (
      SELECT id FROM clause_analyses
      WHERE document_id IN (
        SELECT id FROM input_documents WHERE uploaded_by = auth.uid()
      )
    )
  );

-- aaoifistandards_analysis_results: same pattern
CREATE POLICY "Users access aaoifi results from own clauses"
  ON aaoifistandards_analysis_results FOR ALL
  USING (
    clause_id IN (
      SELECT id FROM clause_analyses
      WHERE document_id IN (
        SELECT id FROM input_documents WHERE uploaded_by = auth.uid()
      )
    )
  );
```

---

## 13. UI Changes Required

The following changes to the existing UI are needed for a complete integration. These are additions/fixes to improve usability alongside the Supabase wiring.

### 13.1 Login Page

| Change | Details |
|---|---|
| Add inline error message | Show `{error}` in red below the password field when sign-in fails |
| Add loading state | Disable "Sign In" button and show spinner while auth request is in flight |
| Add session-expired message | Check URL for `?reason=expired` and show amber banner: *"Your session has expired. Please sign in again."* |
| "Forgot Password" link | Wire to `/forgot-password` route (currently not implemented) |

### 13.2 Dashboard Page

| Change | Details |
|---|---|
| Usage card | Replace hardcoded `12 / 50` with live data from `monthly_limits` table |
| Stat cards | Replace hardcoded `284`, `47`, `11` with live aggregation from `clause_analyses` |
| Recent analyses table | Replace hardcoded rows with data from `input_documents` |
| View button | Link each row's "View" to `/reports/{document.id}` |
| "Processing..." state | Show animated spinner badge next to documents with `analysis_status = 'pending'` |
| 90% usage warning | Show amber banner when `current_usage / limits >= 0.9` |
| User name in header | Replace hardcoded "Ahmad" with `user.user_metadata.full_name` from auth store |

### 13.3 Report Viewer Page

| Change | Details |
|---|---|
| Summary stat cards | Pull from `input_documents` + aggregate `clause_analyses` |
| Clause tabs (All / Compliant / Needs Review / Non-Compliant) | Filter `clauses` array by `classification` client-side |
| Clause card status badges | Map `classification` field: `compliant` → blue, `needs_review` → amber, `non_compliant` → red |
| Clause card left border | Use `clauseBorderStyles` mapping (see §9.3) |
| Confidence score | Display `confidence_score` field as percentage |
| Analysed timestamp | Format `created_at` from clause_analyses |
| Document name in header | Pull `document_name` from `input_documents` |

### 13.4 Sidebar / Navigation

| Change | Details |
|---|---|
| User name & role | Pull from `user.user_metadata.full_name` and a custom `user_roles` table or metadata |
| License badge | Add `ACTIVE` / `SUSPENDED` badge — fetch from a `client_licenses` table or user metadata |
| Logout | Wire "Logout" menu item to `authService.signOut()` |

---

## 14. Error Handling Patterns

```typescript
// Wrap all service calls with this pattern in hooks/components:

const [error, setError] = useState<string | null>(null);

try {
  const data = await someService.someMethod();
  // handle success
} catch (err: any) {
  setError(err.message ?? 'An unexpected error occurred. Please try again.');
}

// For Supabase-specific errors, check error.code:
// PGRST116 = row not found (treat as null, not an error)
// 42501    = RLS policy violation (user doesn't own the resource)
```

### Error UI Pattern

Add this to any data-loading page:

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    {error}
  </div>
)}
```

---

## 15. Environment Variables

Full list of required environment variables:

```env
# .env.local (never commit to version control)

# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# n8n (if proxied — see TechStack doc)
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n-host.com
```

---

## 16. Testing Checklist

Use this checklist to verify the integration end to end.

### Authentication

- [ ] User can log in with valid email/password → redirected to `/dashboard`
- [ ] Invalid credentials show inline error message (not alert)
- [ ] Login button shows loading spinner during request
- [ ] After 8 hours of inactivity → auto-logout → redirect to `/login?reason=expired`
- [ ] Session-expired message shown on login page when redirected
- [ ] Unauthenticated user navigating to `/dashboard` redirected to `/login`
- [ ] Logout button clears session and redirects to `/login`

### Dashboard

- [ ] "Analyses This Month" shows real usage from `monthly_limits`
- [ ] Stat cards show real aggregated numbers from `clause_analyses`
- [ ] Recent analyses table shows real documents ordered by date
- [ ] "View" button for each row navigates to the correct report
- [ ] Documents with `analysis_status = 'pending'` show spinner
- [ ] 90% usage warning banner appears when applicable

### Report Viewer

- [ ] Header shows correct document name and file
- [ ] Stat cards show correct clause counts per status
- [ ] All clauses render with correct text, status badge, and severity
- [ ] Filtering by tab (Compliant / Needs Review / Non-Compliant) works
- [ ] Confidence score and timestamp display correctly
- [ ] Expanding a clause shows full findings and remediation

### Realtime

- [ ] While an analysis is running, the progress updates in the UI without page refresh
- [ ] When analysis completes, clause list appears automatically

---

*End of Document*
