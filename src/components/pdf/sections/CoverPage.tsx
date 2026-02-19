import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { C, F, SIZE } from '../tokens';
import type { InputDocument, ReportSummary } from '@/types/pdf.types';

const fortivLogoWhite = '/fortiv-logo.jpg';

// ------------------------------------------------------------
// Styles — mirror the HTML template as closely as PDF allows
// ------------------------------------------------------------
const s = StyleSheet.create({
    page: { backgroundColor: '#ECF1F8', fontFamily: F.normal },

    // ── Cover card (mirrors .cover gradient) ────────────────
    cover: {
        backgroundColor: C.brandDark,   // PDF can't do CSS gradients; use dark brand
        borderRadius: SIZE.radius + 2,
        padding: 32,
        marginHorizontal: SIZE.pageMargin,
        marginTop: SIZE.pageMargin,
        marginBottom: 20,
        position: 'relative',
    },
    // Top accent bar (mirrors .cover-accent)
    coverAccent: {
        position: 'absolute',
        top: 0,
        left: 32,
        right: 32,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderRadius: 0,
    },

    // ── Cover top row (logo left  ·  pill right) ────────────
    coverTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    coverLogoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoBox: {
        width: 34,
        height: 34,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: { width: 26, height: 26 },
    logoTextCol: { gap: 2 },
    logoName: { fontSize: 13, fontFamily: F.bold, color: C.white, letterSpacing: -0.1 },
    logoSub: { fontSize: 8.5, color: C.white, opacity: 0.55 },

    coverPill: {
        backgroundColor: 'rgba(255,255,255,0.13)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    coverPillText: {
        fontSize: 9,
        fontFamily: F.bold,
        color: C.white,
        letterSpacing: 0.6,
        opacity: 0.88,
    },

    // ── Cover title / doc name ───────────────────────────────
    coverTitle: {
        fontSize: 28,
        fontFamily: F.bold,
        color: C.white,
        letterSpacing: -0.4,
        lineHeight: 1.15,
        marginBottom: 6,
    },
    coverDocLine: {
        fontSize: 11.5,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    coverDocSpan: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 3,
        paddingHorizontal: 6,
        paddingVertical: 1,
        fontSize: 11.5,
        fontFamily: F.bold,
        color: C.white,
        opacity: 1,
    },
    coverDocText: {
        fontSize: 11.5,
        color: 'rgba(255,255,255,0.7)',
    },

    // ── Stats grid (mirrors .cover-meta-row) ─────────────────
    statGrid: {
        flexDirection: 'row',
        gap: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: SIZE.radius,
        overflow: 'hidden',
    },
    statCell: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    statLabel: {
        fontSize: 8,
        fontFamily: F.bold,
        letterSpacing: 0.7,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontFamily: F.bold,
        letterSpacing: -0.3,
        lineHeight: 1,
        color: C.white,
    },
    statSub: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 3,
    },

    // ── AI disclaimer banner inside cover ────────────────────
    disclaimerBanner: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderWidth: 1,
        borderColor: 'rgba(255,220,100,0.35)',
        borderRadius: SIZE.radius,
        padding: 11,
    },
    disclaimerWarningBar: {
        width: 3,
        backgroundColor: 'rgba(255,220,80,1)',
        borderRadius: 2,
        marginRight: 4,
    },
    disclaimerContent: { flex: 1 },
    disclaimerLabel: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.8,
        color: 'rgba(255,220,80,1)',
        marginBottom: 3,
    },
    disclaimerText: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 1.6,
    },

    // ── Document Information section ─────────────────────────
    sectionArea: {
        marginHorizontal: SIZE.pageMargin,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: C.brand,
        flexShrink: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: F.bold,
        color: C.ink900,
        letterSpacing: -0.2,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.ink100,
    },

    // ── Info block (mirrors .info-block / .info-block-grid) ──
    infoBlock: {
        backgroundColor: C.white,
        borderRadius: SIZE.radius,
        borderWidth: 1,
        borderColor: 'rgba(23,131,223,0.07)',
        overflow: 'hidden',
        marginBottom: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoCell: {
        width: '33.33%',
        padding: 14,
        borderRightWidth: 1,
        borderRightColor: C.ink100,
        borderBottomWidth: 1,
        borderBottomColor: C.ink100,
    },
    infoCellLabel: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.6,
        color: C.ink300,
        marginBottom: 4,
    },
    infoCellValue: {
        fontSize: 11.5,
        fontFamily: F.bold,
        color: C.ink900,
    },

    // ── Footer ───────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 18,
        left: SIZE.pageMargin,
        right: SIZE.pageMargin,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: C.ink100,
        paddingTop: 6,
    },
    footerLeft: { gap: 1 },
    footerBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    footerDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: C.brand,
        opacity: 0.5,
    },
    footerBrandText: { fontSize: 9.5, color: C.ink300 },
    footerBrandBold: { fontSize: 9.5, fontFamily: F.bold, color: C.brand },
    footerLegal: {
        fontSize: 8.5,
        color: C.ink300,
        lineHeight: 1.5,
        textAlign: 'right',
        maxWidth: 260,
    },
    footerPageNum: { fontSize: 9.5, color: C.ink300 },
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function pct(n: number, total: number) {
    if (!total) return '0%';
    return `${Math.round((n / total) * 100)}%`;
}

function scoreLabel(score: number) {
    if (score >= 80) return 'Strong compliance — minor review recommended';
    if (score >= 50) return 'Partial compliance — remediation required';
    return 'Significant issues detected — expert review essential';
}

function scoreColor(score: number) {
    if (score >= 80) return { txt: '#6EE7A0' }; // use light variants for dark bg
    if (score >= 50) return { txt: '#FCD34D' };
    return { txt: '#FCA5A5' };
}

interface Props {
    document: InputDocument;
    summary: ReportSummary;
}

export function CoverPage({ document, summary }: Props) {
    const sc = scoreColor(summary.complianceScore);
    const total = summary.totalClauses;

    return (
        <Page size="A4" style={s.page}>

            {/* ════ COVER CARD ════ */}
            <View style={s.cover}>
                <View style={s.coverAccent} />

                {/* Top: logo + pill */}
                <View style={s.coverTop}>
                    <View style={s.coverLogoRow}>
                        <View style={s.logoBox}>
                            <Image src={fortivLogoWhite} style={s.logo} />
                        </View>
                        <View style={s.logoTextCol}>
                            <Text style={s.logoName}>Fortiv Solutions</Text>
                            <Text style={s.logoSub}>Islamic Finance Compliance Platform</Text>
                        </View>
                    </View>
                    <View style={s.coverPill}>
                        <Text style={s.coverPillText}>CONFIDENTIAL REPORT</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={s.coverTitle}>Shariah Compliance Report</Text>

                {/* Doc name line */}
                <View style={s.coverDocLine}>
                    <Text style={s.coverDocSpan}>{document.document_name}</Text>
                    <Text style={s.coverDocText}>
                        {'  Analysed: '}
                        {summary.generatedAt}
                        {'  ·  Contract Type: '}
                        {document.document_type}
                    </Text>
                </View>

                {/* Stats 4-col grid */}
                <View style={s.statGrid}>
                    <View style={s.statCell}>
                        <Text style={s.statLabel}>TOTAL CLAUSES</Text>
                        <Text style={s.statValue}>{summary.totalClauses}</Text>
                        <Text style={s.statSub}>Analysed in full</Text>
                    </View>
                    <View style={s.statCell}>
                        <Text style={s.statLabel}>COMPLIANT</Text>
                        <Text style={[s.statValue, { color: '#6EE7A0' }]}>{summary.compliantCount}</Text>
                        <Text style={s.statSub}>{pct(summary.compliantCount, total)} of total</Text>
                    </View>
                    <View style={s.statCell}>
                        <Text style={s.statLabel}>NEEDS REVIEW</Text>
                        <Text style={[s.statValue, { color: '#FCD34D' }]}>{summary.reviewCount}</Text>
                        <Text style={s.statSub}>{pct(summary.reviewCount, total)} of total</Text>
                    </View>
                    <View style={s.statCell}>
                        <Text style={s.statLabel}>NON-COMPLIANT</Text>
                        <Text style={[s.statValue, { color: '#FCA5A5' }]}>{summary.nonCompliantCount}</Text>
                        <Text style={s.statSub}>{pct(summary.nonCompliantCount, total)} of total</Text>
                    </View>
                </View>

                {/* AI Disclaimer banner */}
                <View style={s.disclaimerBanner}>
                    <View style={s.disclaimerWarningBar} />
                    <View style={s.disclaimerContent}>
                        <Text style={s.disclaimerLabel}>AI-GENERATED REPORT — DISCLAIMER</Text>
                        <Text style={s.disclaimerText}>
                            This report was generated by Fortiv Solutions' AI compliance engine. AI analysis may contain errors or omissions and does not constitute legal or Shariah advice. All findings must be independently verified by a qualified Shariah scholar or certified compliance professional before any contractual or regulatory reliance is placed on this report.
                        </Text>
                    </View>
                </View>
            </View>

            {/* ════ DOCUMENT INFORMATION ════ */}
            <View style={s.sectionArea}>
                <View style={s.sectionHeader}>
                    <View style={s.sectionDot} />
                    <Text style={s.sectionTitle}>Document Information</Text>
                    <View style={s.sectionLine} />
                </View>

                <View style={s.infoBlock}>
                    <View style={s.infoGrid}>
                        {[
                            ['Document Name', document.document_name],
                            ['Contract Type', document.document_type],
                            ['Date Analysed', summary.generatedAt],
                            ['Analysed By', `${summary.analystName} — ${summary.analystEmail}`],
                            ['Regulatory Frameworks', 'AAOIFI SS-8 & SAMA Regulations'],
                            ['Classification', 'Confidential — Internal Use Only'],
                        ].map(([label, value], i) => (
                            <View key={label}
                                style={[
                                    s.infoCell,
                                    // Remove right border for every 3rd cell
                                    (i % 3 === 2) ? { borderRightWidth: 0 } : {},
                                    // Remove bottom border for last row
                                    (i >= 3) ? { borderBottomWidth: 0 } : {},
                                ]}
                            >
                                <Text style={s.infoCellLabel}>{label}</Text>
                                <Text style={s.infoCellValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* ════ PAGE FOOTER ════ */}
            <View style={s.footer} fixed>
                <View style={s.footerBrand}>
                    <View style={s.footerDot} />
                    <Text style={s.footerBrandText}>Generated by </Text>
                    <Text style={s.footerBrandBold}>Fortiv Solutions</Text>
                </View>
                <Text
                    style={s.footerPageNum}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                />
            </View>
        </Page>
    );
}
