import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { ComplianceReportDocument } from '@/components/pdf/ComplianceReport';
import { InputDocument, ClauseAnalysis, ReportSummary } from '@/types/pdf.types';

/** Build the ReportSummary from raw data */
export function buildReportSummary(
    document: InputDocument,
    clauses: ClauseAnalysis[],
    analystName: string,
    analystEmail: string
): ReportSummary {
    const total = clauses.length;
    const comp = clauses.filter((c) => c.classification === 'compliant').length;
    const review = clauses.filter((c) => c.classification === 'needs_review').length;
    const nonComp = clauses.filter((c) => c.classification === 'non_compliant').length;

    return {
        totalClauses: total,
        compliantCount: comp,
        reviewCount: review,
        nonCompliantCount: nonComp,
        complianceScore: total > 0 ? Math.round((comp / total) * 100) : 0,
        generatedAt: new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date()),
        analystName,
        analystEmail,
    };
}

/**
 * Generates PDF as ArrayBuffer — NEVER triggers a browser download directly.
 * The caller (useReportExport hook) passes this to encryptPDF() first.
 */
export async function generateReportPDF(
    document: InputDocument,
    clauses: ClauseAnalysis[],
    analystName: string,
    analystEmail: string
): Promise<ArrayBuffer> {
    const summary = buildReportSummary(document, clauses, analystName, analystEmail);

    const blob = await pdf(
        React.createElement(ComplianceReportDocument, { document, clauses, summary })
    ).toBlob();

    return blob.arrayBuffer();
    // ↑ Return raw ArrayBuffer to caller — encryption happens next
}
