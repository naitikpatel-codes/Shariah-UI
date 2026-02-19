import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { C, F, SIZE } from '../tokens';
import type { ReportSummary } from '@/types/pdf.types';

const fortivLogoWhite = '/fortiv-logo.jpg';

const s = StyleSheet.create({
    page: { backgroundColor: '#ECF1F8', fontFamily: F.normal },

    // ── Reusable header band (same as clause pages) ──────────
    header: {
        backgroundColor: C.brandDark,
        height: SIZE.headerH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZE.pageMargin,
    },
    logoImg: { width: SIZE.logoW },
    headerRight: { alignItems: 'flex-end', gap: 2 },
    headerTitle: { color: C.white, fontSize: 10.5, fontFamily: F.bold, letterSpacing: 0.3 },
    headerSub: { color: C.white, fontSize: 8, opacity: 0.65 },

    body: {
        paddingHorizontal: SIZE.pageMargin,
        paddingTop: 22,
        paddingBottom: 64,
    },

    // ── Section header (dot + title + line) ──────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        marginTop: 20,
    },
    sectionDot: {
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: C.brand, flexShrink: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: F.bold,
        color: C.ink900,
        letterSpacing: -0.2,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: C.ink100 },

    // ── Sign block (mirrors .sign-block) ─────────────────────
    signBlock: {
        backgroundColor: C.white,
        borderRadius: SIZE.radius,
        borderWidth: 1,
        borderColor: 'rgba(23,131,223,0.07)',
        overflow: 'hidden',
        marginBottom: 20,
    },
    signBlockHeader: {
        backgroundColor: C.brandXLight,
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.brandLight,
    },
    signBlockHeaderText: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.7,
        color: C.brand,
    },
    signGrid: {
        flexDirection: 'row',
    },
    signCell: {
        flex: 1,
        padding: 20,
        borderRightWidth: 1,
        borderRightColor: C.ink100,
    },
    signCellLast: { borderRightWidth: 0 },
    signRole: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.6,
        color: C.ink300,
        marginBottom: 22,
    },
    signLine: {
        borderBottomWidth: 1.5,
        borderBottomColor: C.ink900,
        marginBottom: 7,
        width: '80%',
    },
    signName: { fontSize: 11.5, fontFamily: F.bold, color: C.ink700 },
    signDetail: { fontSize: 9.5, color: C.ink300, marginTop: 2 },

    // ── Legal table (mirrors .table-wrapper / .data-table) ───
    tableWrapper: {
        backgroundColor: C.white,
        borderRadius: SIZE.radius,
        borderWidth: 1,
        borderColor: 'rgba(23,131,223,0.07)',
        overflow: 'hidden',
        marginBottom: 20,
    },
    tHead: {
        flexDirection: 'row',
        backgroundColor: C.brandXLight,
        borderBottomWidth: 1.5,
        borderBottomColor: C.brandLight,
    },
    tHeadCell: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    tHeadText: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.7,
        color: C.brand,
    },
    tRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: C.ink100,
    },
    tRowFirst: { borderTopWidth: 0 },
    tCell: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    tCellKey: {
        flex: 0.5,
        fontFamily: F.bold,
        color: C.ink900,
    },
    tCellVal: {
        flex: 1.5,
        fontSize: 10.5,
        color: C.ink700,
        lineHeight: 1.55,
    },
    tCellKeyText: {
        fontSize: 10.5,
        fontFamily: F.bold,
        color: C.ink900,
    },

    // ── Footer ────────────────────────────────────────────────
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
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    footerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.brand, opacity: 0.5 },
    footerBrandText: { fontSize: 9.5, color: C.ink300 },
    footerBrandBold: { fontSize: 9.5, fontFamily: F.bold, color: C.brand },
    footerLegal: {
        fontSize: 8,
        color: C.ink300,
        lineHeight: 1.5,
        textAlign: 'right',
        maxWidth: 250,
    },
    footerPageNum: { fontSize: 9.5, color: C.ink300 },
});

interface Props {
    summary: ReportSummary;
}

const LEGAL_ROWS: Array<[string, string]> = [
    ['Nature of Report', 'This report is generated by the Fortiv AI Shariah Compliance Screener for internal review purposes only. It does not constitute a Shariah fatwa, legal opinion, or binding regulatory assessment.'],
    ['AI Limitations', 'All findings, classifications, and recommendations are AI-generated and may contain errors or omissions. They must be reviewed and validated by a qualified Shariah scholar or compliance officer before any contractual decision is made.'],
    ['Liability', 'Fortiv Solutions accepts no liability for decisions made solely on the basis of this automated report.'],
    ['Reference Frameworks', 'AAOIFI Shariah Standards (current edition)  ·  SAMA Islamic Finance Regulations  ·  Approved Internal Contract Templates'],
    ['Confidentiality', 'This document is classified Confidential — Internal Use Only. Unauthorised distribution or reproduction is strictly prohibited.'],
];

export function FooterDisclaimer({ summary }: Props) {
    return (
        <Page size="A4" style={s.page}>

            {/* ── Header (matches clause-page header) ── */}
            <View fixed style={s.header}>
                <Image src={fortivLogoWhite} style={s.logoImg} />
                <View style={s.headerRight}>
                    <Text style={s.headerTitle}>Shariah Compliance Report</Text>
                    <Text style={s.headerSub}>Disclaimer &amp; Acknowledgement</Text>
                </View>
            </View>

            <View style={s.body}>

                {/* ── Legal Disclaimer (table style) ── */}
                <View style={[s.sectionHeader, { marginTop: 0 }]}>
                    <View style={s.sectionDot} />
                    <Text style={s.sectionTitle}>Legal Disclaimer</Text>
                    <View style={s.sectionLine} />
                </View>

                <View style={s.tableWrapper}>
                    {LEGAL_ROWS.map(([key, val], i) => (
                        <View key={key} style={[s.tRow, i === 0 && s.tRowFirst]}>
                            <View style={[s.tCell, s.tCellKey]}>
                                <Text style={s.tCellKeyText}>{key}</Text>
                            </View>
                            <View style={[s.tCell, s.tCellVal]}>
                                <Text style={{ fontSize: 10.5, color: C.ink700, lineHeight: 1.55 }}>
                                    {val}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Signatures ── */}
                <View style={s.sectionHeader}>
                    <View style={s.sectionDot} />
                    <Text style={s.sectionTitle}>Signatures</Text>
                    <View style={s.sectionLine} />
                </View>

                <View style={s.signBlock}>
                    <View style={s.signBlockHeader}>
                        <Text style={s.signBlockHeaderText}>
                            ANALYST ACKNOWLEDGEMENT &amp; SHARIAH SCHOLAR REVIEW
                        </Text>
                    </View>
                    <View style={s.signGrid}>
                        {/* Analyst */}
                        <View style={s.signCell}>
                            <Text style={s.signRole}>ANALYST / PREPARER</Text>
                            <View style={s.signLine} />
                            <Text style={s.signName}>{summary.analystName}</Text>
                            <Text style={s.signDetail}>{summary.analystEmail}</Text>
                            <Text style={[s.signDetail, { marginTop: 4 }]}>{summary.generatedAt}</Text>
                        </View>
                        {/* Shariah Scholar */}
                        <View style={s.signCell}>
                            <Text style={s.signRole}>SHARIAH SCHOLAR / REVIEWER</Text>
                            <View style={[s.signLine, { borderBottomColor: C.ink300 }]} />
                            <Text style={[s.signName, { color: C.ink300 }]}>Name (printed)</Text>
                            <Text style={[s.signDetail, { marginTop: 4 }]}>Signature &amp; date</Text>
                        </View>
                        {/* Compliance Officer */}
                        <View style={[s.signCell, s.signCellLast]}>
                            <Text style={s.signRole}>COMPLIANCE OFFICER</Text>
                            <View style={[s.signLine, { borderBottomColor: C.ink300 }]} />
                            <Text style={[s.signName, { color: C.ink300 }]}>Name (printed)</Text>
                            <Text style={[s.signDetail, { marginTop: 4 }]}>Signature &amp; date</Text>
                        </View>
                    </View>
                </View>

                {/* ── Platform info ── */}
                <View style={s.sectionHeader}>
                    <View style={s.sectionDot} />
                    <Text style={s.sectionTitle}>Report Information</Text>
                    <View style={s.sectionLine} />
                </View>
                <View style={s.tableWrapper}>
                    {[
                        ['Platform', 'Fortiv Solutions · AI Shariah Compliance Screener v1.0'],
                        ['Generated', summary.generatedAt],
                        ['Analyst', `${summary.analystName} · ${summary.analystEmail}`],
                        ['Frameworks', 'AAOIFI Shariah Standards · SAMA Islamic Finance Regulations'],
                    ].map(([k, v], i) => (
                        <View key={k} style={[s.tRow, i === 0 && s.tRowFirst]}>
                            <View style={[s.tCell, s.tCellKey]}>
                                <Text style={s.tCellKeyText}>{k}</Text>
                            </View>
                            <View style={[s.tCell, s.tCellVal]}>
                                <Text style={{ fontSize: 10.5, color: C.ink700, lineHeight: 1.5 }}>{v}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* ── Footer ── */}
            <View fixed style={s.footer}>
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
