# 🕌 AI Shariah Compliance Screener — Gemini Agent Integration Guide
## How to Fetch & Display Compliance Reports After Receiving a `document_id`

> **Purpose:** This document explains the complete database schema, the correct data-fetching sequence, and how to render a structured compliance report once you receive a `document_id` from the UI.

---

## 1. The Problem You're Solving

When the UI triggers a document analysis and receives back a `document_id`, the agent must:

1. Fetch the **document metadata** from `input_documents`
2. Fetch **all clauses** for that document from `clause_analyses`
3. Fetch the **final compliance decision** for each clause from `final_decisions`
4. Optionally fetch **AAOIFI** and **SAMA** layer results from `aaoifi_standards_analysis_results` and `sama_regulation_results`
5. Render a **structured, readable report**

The error you're seeing is almost certainly caused by **querying the wrong table**, **missing the foreign key join**, or **not waiting for `analysis_status = 'complete'`** before fetching.

---

## 2. Complete Database Schema

### 2.1 `input_documents` — Master Document Record

> One row per uploaded document. This is your entry point.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | **This is the `document_id`** the UI gives you |
| `document_name` | text | Original filename (e.g. `murabaha_contract.pdf`) |
| `document_type` | text | Contract type (Murabaha, Ijarah, Sukuk, etc.) |
| `timestamp` | timestamptz | Upload timestamp |
| `analysis_status` | text | `pending` → `extracting` → `analysing` → `complete` / `failed` |
| `total_clauses` | int4 | Total number of clauses extracted |
| `analyzed_clauses` | int4 | Clauses processed so far (use for progress bar) |
| `uploaded_by` | uuid | FK → `auth.users.id` |
| `page_count` | int4 | Document page count |
| `language` | text | Detected language |
| `critical_clauses` | int4 | Count of critical severity clauses |
| `processing_status` | text | Internal processing sub-status |
| `current_step` | text | Current pipeline step label |
| `progress_percent` | int2 | 0–100 progress for the UI bar |

**⚠️ Always check `analysis_status = 'complete'` before fetching clauses. If it's not complete, the clause data will be partial or empty.**

---

### 2.2 `clause_analyses` — Individual Clause Records

> One row per clause extracted from the document. FK: `document_id → input_documents.id`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique clause ID — used as FK in `final_decisions` |
| `document_id` | uuid (FK) | Links to `input_documents.id` |
| `document_name` | text | Denormalised filename |
| `clause_number` | varchar | E.g. `"1"`, `"2.3"`, `"4.a"` |
| `clause_text` | text | Full raw clause content |
| `subclauses` | jsonb | Sub-clause texts if present |
| `is_critical_for_shariah` | bool | `true` if flagged as a critical Shariah risk |
| `contains_arabic` | bool | `true` if Arabic text was detected |
| `aaoifi_standards_ref...` | text | Reference to AAOIFI result (denormalised) |
| `sama_regulations_re...` | text | Reference to SAMA result (denormalised) |
| `analysis_status` | text | Processing status of this clause |
| `created_at` | timestamptz | Creation time |
| `updated_at` | timestamptz | Last update time |

---

### 2.3 `final_decisions` — Final Compliance Verdict Per Clause

> One row per clause. FK: `clause_id → clause_analyses.id` AND `document_id → input_documents.id`

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique decision ID |
| `clause_id` | uuid (FK) | Links to `clause_analyses.id` |
| `document_id` | uuid (FK) | Links to `input_documents.id` |
| `final_classification` | text | `compliant` / `needs_review` / `non_compliant` |
| `final_severity` | text | `low` / `medium` / `high` / `critical` |
| `final_confidence` | numeric | 0.00–1.00 confidence score |
| `decision_rationale` | text | Explanation of the final verdict |
| `conflicts_identified` | jsonb | Array of AAOIFI vs SAMA conflicts |
| `consolidated_violations` | jsonb | Combined violations from all layers |
| `consolidated_remediation` | text | Merged remediation guidance |
| `required_actions` | jsonb | Prioritised action items |
| `audit_trace` | jsonb | Full audit trail of layer outputs |
| `layer_summary` | jsonb | Summary of AAOIFI and SAMA layer results |
| `parsed_at` | timestamptz | When the decision was parsed |
| `created_at` | timestamptz | Creation timestamp |

---

### 2.4 `aaoifi_standards_analysis_results` — Layer 1 Results

> One row per clause per AAOIFI analysis pass. FK: `clause_id` and `document_id`.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique result ID |
| `document_id` | uuid (FK) | Links to `input_documents.id` |
| `clause_id` | uuid (FK) | Links to `clause_analyses.id` |
| `classification` | text | AAOIFI verdict: `compliant` / `needs_review` / `non_compliant` |
| `severity` | text | `low` / `medium` / `high` / `critical` |
| `confidence` | numeric | AAOIFI confidence score |
| `reference` | jsonb | AAOIFI standards referenced (standard_number, standard_name, section) |
| `findings` | text | AAOIFI-specific findings text |
| `remediation` | text | AAOIFI remediation guidance |
| `retrieval_quality` | jsonb | RAG retrieval quality metadata |
| `created_at` | timestamptz | Creation time |

---

### 2.5 `sama_regulation_results` — Layer 2 Results

> One row per clause per SAMA analysis pass. FK: `clause_id` and `document_id`.

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique result ID |
| `document_id` | uuid (FK) | Links to `input_documents.id` |
| `clause_id` | uuid (FK) | Links to `clause_analyses.id` |
| `classification` | text | SAMA verdict |
| `severity` | text | Risk severity |
| `confidence` | numeric | SAMA confidence score |
| `sama_regulations_re...` | jsonb | SAMA regulations referenced |
| `findings` | text | SAMA-specific findings |
| `consumer_protection_issues` | jsonb | Consumer protection flags |
| `disclosure_gaps` | jsonb | Disclosure issue details |
| `rule_violations` | jsonb | Specific rule violations |
| `remediation` | text | SAMA remediation guidance |
| `retrieval_quality` | jsonb | RAG retrieval quality |
| `created_at` | timestamptz | Creation time |

---

### 2.6 `monthly_limits` — Usage Quotas

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Unique record ID |
| `user_id` | uuid (FK) | Links to `auth.users.id` |
| `limits` | int4 | Max monthly analyses allowed |
| `current_usage` | int4 | Analyses used this month |
| `reset_date` | timestamptz | When the usage counter resets |
| `created_at` | timestamptz | Creation time |

---

### 2.7 `documents` — Vector Store (RAG Knowledge Base)

> **Do NOT query this for report data.** This stores embedded AAOIFI/SAMA reference documents for the AI pipeline only.

| Column | Type | Description |
|---|---|---|
| `id` | int8 (PK) | Auto-increment ID |
| `content` | text | Chunk of regulatory text |
| `metadata` | jsonb | Source metadata (standard name, section, etc.) |
| `embedding` | vector | Embedding vector for similarity search |

---

## 3. The Correct Data-Fetching Flow

Once you receive a `document_id` from the UI, follow this exact sequence:

```
Step 1: Fetch input_documents WHERE id = document_id
        → Check analysis_status = 'complete'
        → If NOT complete → show progress bar using progress_percent, poll/subscribe

Step 2: Fetch clause_analyses WHERE document_id = document_id
        → ORDER BY clause_number ASC
        → This gives you all clauses (collect each clause's id)

Step 3: Fetch final_decisions WHERE document_id = document_id
        → JOIN with clause_analyses ON final_decisions.clause_id = clause_analyses.id
        → This gives you the verdict for each clause

Step 4 (Optional): Fetch aaoifi_standards_analysis_results WHERE document_id = document_id
Step 5 (Optional): Fetch sama_regulation_results WHERE document_id = document_id
        → Use these for the detailed layer breakdown per clause
```

---

## 4. Supabase Query Examples

### 4.1 Check Document Status

```typescript
const { data: document, error } = await supabase
  .from('input_documents')
  .select('*')
  .eq('id', documentId)
  .single();

if (document.analysis_status !== 'complete') {
  // Show progress UI — do NOT fetch clauses yet
  console.log(`Progress: ${document.progress_percent}%`);
  return;
}
```

### 4.2 Fetch Clauses with Final Decisions (Single Join Query)

```typescript
const { data: clauses, error } = await supabase
  .from('clause_analyses')
  .select(`
    id,
    clause_number,
    clause_text,
    subclauses,
    is_critical_for_shariah,
    contains_arabic,
    analysis_status,
    final_decisions (
      final_classification,
      final_severity,
      final_confidence,
      decision_rationale,
      conflicts_identified,
      consolidated_violations,
      consolidated_remediation,
      required_actions,
      layer_summary
    )
  `)
  .eq('document_id', documentId)
  .order('clause_number', { ascending: true });

if (error) {
  console.error('Error fetching clauses:', error.message);
}
```

> **Note:** `final_decisions` is a 1-to-1 relation from `clause_analyses` via `clause_id`. Supabase will return it as a nested object inside each clause.

### 4.3 Fetch AAOIFI + SAMA Layer Details Per Clause

```typescript
const { data: aaoifiResults } = await supabase
  .from('aaoifi_standards_analysis_results')
  .select('*')
  .eq('document_id', documentId);

const { data: samaResults } = await supabase
  .from('sama_regulation_results')
  .select('*')
  .eq('document_id', documentId);

// Map by clause_id for easy lookup
const aaoifiByClause = Object.fromEntries(
  aaoifiResults?.map(r => [r.clause_id, r]) ?? []
);
const samaByClause = Object.fromEntries(
  samaResults?.map(r => [r.clause_id, r]) ?? []
);
```

---

## 5. Why the Error Is Happening

Common causes and fixes:

| Error Symptom | Root Cause | Fix |
|---|---|---|
| Empty clause list returned | Fetching before `analysis_status = 'complete'` | Check status first; use Realtime subscription |
| `null` or missing `final_decisions` | Querying by wrong FK (`id` instead of `clause_id`) | Use `.select('final_decisions!clause_id(*)')` or ensure the join is on `clause_analyses.id = final_decisions.clause_id` |
| RLS: zero rows returned | User is not the `uploaded_by` on the document | Ensure auth session is active; RLS filters silently |
| `final_classification` is undefined | `final_decisions` not yet written (pipeline still running) | Only render after `analysis_status = 'complete'` |
| AAOIFI/SAMA results missing | Querying `documents` table (vector store) instead of `aaoifi_standards_analysis_results` | Use the correct table name |

---

## 6. Report Display Structure

Once data is fetched, render the report in this structure:

### 6.1 Document Header Section
```
Document Name:      [input_documents.document_name]
Contract Type:      [input_documents.document_type]
Analysis Date:      [input_documents.timestamp]
Total Clauses:      [input_documents.total_clauses]
Critical Clauses:   [input_documents.critical_clauses]
Language:           [input_documents.language]
```

### 6.2 Overall Summary Bar

Display three aggregate counts from `final_decisions` grouped by `final_classification`:

```
✅ Compliant:      X clauses
⚠️  Needs Review:  X clauses
❌ Non-Compliant:  X clauses
```

### 6.3 Per-Clause Card (repeat for each clause)

```
─────────────────────────────────────────────────
Clause [clause_number]
─────────────────────────────────────────────────
Clause Text:
  [clause_analyses.clause_text]

[If is_critical_for_shariah = true] → Show "🔴 CRITICAL SHARIAH RISK" badge
[If contains_arabic = true]         → Show "🌐 Contains Arabic" badge

─── FINAL VERDICT ───────────────────────────────
Classification:   [final_decisions.final_classification]  (colour-coded)
Severity:         [final_decisions.final_severity]
Confidence:       [final_decisions.final_confidence * 100]%
Rationale:        [final_decisions.decision_rationale]

─── LAYER SUMMARY ───────────────────────────────
AAOIFI Layer:
  Classification: [layer_summary.aaoifi.classification]
  Severity:       [layer_summary.aaoifi.severity]
  Key Findings:   [layer_summary.aaoifi.key_findings]

SAMA Layer:
  Classification: [layer_summary.sama.classification]
  Severity:       [layer_summary.sama.severity]
  Key Findings:   [layer_summary.sama.key_findings]

─── VIOLATIONS ──────────────────────────────────
[Loop through consolidated_violations array]
  • Type: [violation.type]  |  Severity: [violation.severity]  |  Source: [violation.source_layer]

─── CONFLICTS ───────────────────────────────────
[If conflicts_identified is non-empty, display each]
  • [conflict.conflict] → Resolution: [conflict.resolution]

─── REMEDIATION ─────────────────────────────────
[final_decisions.consolidated_remediation]

─── REQUIRED ACTIONS ────────────────────────────
[Loop through required_actions — show priority level and action text]
─────────────────────────────────────────────────
```

### 6.4 Colour Coding Rules

| Value | Colour |
|---|---|
| `compliant` | Green (#22c55e) |
| `needs_review` | Amber (#f59e0b) |
| `non_compliant` | Red (#ef4444) |
| Severity `critical` | Red |
| Severity `high` | Orange |
| Severity `medium` | Yellow |
| Severity `low` | Blue/Grey |

---

## 7. Realtime Subscription (Polling Alternative)

If you want live updates while the analysis runs:

```typescript
const channel = supabase
  .channel(`doc-status-${documentId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'input_documents',
      filter: `id=eq.${documentId}`,
    },
    (payload) => {
      const updated = payload.new;
      if (updated.analysis_status === 'complete') {
        // Now safe to fetch clauses and final_decisions
        fetchFullReport(documentId);
        channel.unsubscribe();
      } else {
        // Update progress bar
        setProgress(updated.progress_percent);
      }
    }
  )
  .subscribe();
```

---

## 8. Quick Reference — Table Relationship Map

```
input_documents (id)
    │
    ├──── clause_analyses (document_id → input_documents.id)
    │         │
    │         ├──── final_decisions (clause_id → clause_analyses.id,
    │         │                      document_id → input_documents.id)
    │         │
    │         ├──── aaoifi_standards_analysis_results (clause_id, document_id)
    │         │
    │         └──── sama_regulation_results (clause_id, document_id)
    │
    └──── monthly_limits (user_id → auth.users.id)

documents  ← RAG vector store ONLY — do NOT query for report data
```

---

## 9. Summary Checklist for the Agent

Before rendering any report:

- [ ] Received `document_id` from UI response ✓
- [ ] Queried `input_documents` WHERE `id = document_id` ✓
- [ ] Confirmed `analysis_status = 'complete'` (else show progress) ✓
- [ ] Fetched `clause_analyses` WHERE `document_id = document_id` ✓
- [ ] Fetched `final_decisions` WHERE `document_id = document_id` (joined by `clause_id`) ✓
- [ ] Mapped each `final_decisions` row to its corresponding `clause_analyses` row ✓
- [ ] Rendered document header, summary bar, and per-clause cards ✓
- [ ] Applied colour-coding for `final_classification` and `severity` ✓
- [ ] Handled empty or partial results gracefully (analysis still running) ✓

---

*Document prepared for: Anti Gravity Gemini 3.0 Pro Integration*
*Project: AI Shariah Compliance Screener*
*Last Updated: February 2026*
