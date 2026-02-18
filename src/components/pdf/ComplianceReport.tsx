import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { CoverPage } from './sections/CoverPage';
import { ClauseTable } from './sections/ClauseTable';
import { FooterDisclaimer } from './sections/FooterDisclaimer';
import { C, F, SIZE } from './tokens';
// Use logo from public folder (accessible at runtime)
const fortivLogoWhite = '/fortiv-logo.jpg';
import type { InputDocument, ClauseAnalysis, ReportSummary } from '@/types/pdf.types';

interface Props {
    document: InputDocument;
    clauses: ClauseAnalysis[];
    summary: ReportSummary;
}

const clausePageStyles = StyleSheet.create({
    page: {
        backgroundColor: C.white,
        fontFamily: F.normal,
    },
    // ── Navy header (fixed on every page) ──
    header: {
        backgroundColor: C.navy,
        height: SIZE.headerH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZE.pageMargin,
    },
    logo: { width: SIZE.logoW },
    headerRight: { alignItems: 'flex-end' },
    headerTitle: { color: C.white, fontSize: 11, fontFamily: F.bold },
    headerSub: { color: C.white, fontSize: 8, opacity: 0.7, marginTop: 2 },
    // ── Body ──
    body: { paddingHorizontal: SIZE.pageMargin, paddingTop: 16, paddingBottom: 60 },
    // ── Footer ──
    footer: {
        position: 'absolute',
        bottom: 18,
        left: SIZE.pageMargin,
        right: SIZE.pageMargin,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: C.gray200,
        paddingTop: 5,
    },
    footerText: { fontSize: 8, color: C.gray400 },
    disclaimerLine: { fontSize: 6.5, color: C.gray400, marginTop: 3, fontStyle: 'italic' },
});

export function ComplianceReportDocument({ document, clauses, summary }: Props) {
    return (
        <Document
            title={`Shariah Compliance Report — ${document.document_name}`}
            author="Fortiv Solutions"
            subject="AI Shariah Compliance Analysis"
            creator="Fortiv AI Screener v1.0"
            producer="@react-pdf/renderer"
        >
            {/* Page 1: Cover */}
            <CoverPage document={document} summary={summary} />

            {/* Pages 2+: Clause Detail Tables */}
            <Page size="A4" style={clausePageStyles.page}>
                {/* ── Repeating page header — logo top-left on every page ── */}
                <View fixed style={clausePageStyles.header}>
                    <Image src={fortivLogoWhite} style={clausePageStyles.logo} />
                    <View style={clausePageStyles.headerRight}>
                        <Text style={clausePageStyles.headerTitle}>Shariah Compliance Report</Text>
                        <Text style={clausePageStyles.headerSub}>{document.document_name}</Text>
                    </View>
                </View>

                {/* ── Clause detail table blocks ── */}
                <View style={clausePageStyles.body}>
                    {clauses.map((clause) => (
                        <ClauseTable key={clause.id} clause={clause} />
                    ))}
                </View>

                {/* ── Footer on every page ── */}
                <View fixed style={clausePageStyles.footer}>
                    <View>
                        <Text style={clausePageStyles.footerText}>
                            Fortiv Solutions  ·  AI Shariah Compliance Screener  ·  Confidential
                        </Text>
                        <Text style={clausePageStyles.disclaimerLine}>
                            AI-generated analysis — must be reviewed by a qualified Shariah scholar before execution.
                        </Text>
                    </View>
                    <Text
                        style={clausePageStyles.footerText}
                        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    />
                </View>
            </Page>

            {/* Last Page: Footer Disclaimer */}
            <FooterDisclaimer summary={summary} />
        </Document>
    );
}
