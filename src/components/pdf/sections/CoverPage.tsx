import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { C, F, SIZE } from '../tokens';
// Use logo from public folder (accessible at runtime)
const fortivLogoWhite = '/fortiv-logo.jpg';
import type { InputDocument, ReportSummary } from '@/types/pdf.types';

const s = StyleSheet.create({
    page: { backgroundColor: C.white, fontFamily: F.normal },

    // ── Header band ──────────────────────────────────────────
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
    headerTitle: { color: C.white, fontSize: 16, fontFamily: F.bold },
    headerSub: { color: C.white, fontSize: 9, opacity: 0.8, marginTop: 3 },
    headerMeta: { color: C.white, fontSize: 8, opacity: 0.65, marginTop: 2 },

    // ── Body ─────────────────────────────────────────────────
    body: { paddingHorizontal: SIZE.pageMargin, paddingTop: 20, paddingBottom: 60 },

    sectionLabel: {
        fontSize: 8, fontFamily: F.bold, color: C.gray500,
        letterSpacing: 1, textTransform: 'uppercase',
        marginBottom: 6, marginTop: 16,
    },

    // ── Summary stat table ────────────────────────────────────
    table: { borderWidth: 1, borderColor: C.tableBorder, borderRadius: SIZE.radius },
    tHead: {
        flexDirection: 'row',
        backgroundColor: C.tableHead,
        borderTopLeftRadius: SIZE.radius,
        borderTopRightRadius: SIZE.radius,
    },
    tRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: C.tableBorder,
    },
    tCell: {
        flex: 1, padding: SIZE.cellPad,
        borderRightWidth: 1, borderRightColor: C.tableBorder,
        alignItems: 'center',
    },
    tCellLast: { borderRightWidth: 0 },
    tHeadText: { color: C.white, fontSize: 8, fontFamily: F.bold, letterSpacing: 0.5 },
    tStatNum: { fontSize: 24, fontFamily: F.bold, marginTop: 4 },

    // ── Score bar ─────────────────────────────────────────────
    scoreBox: {
        borderWidth: 1, borderColor: C.tableBorder, borderRadius: SIZE.radius,
        padding: 12, marginTop: 8,
    },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    scoreLbl: { fontSize: 10, fontFamily: F.bold, color: C.gray700 },
    scoreVal: { fontSize: 10, fontFamily: F.bold },
    barTrack: { height: 7, backgroundColor: C.gray200, borderRadius: 4 },
    barFill: { height: 7, borderRadius: 4 },

    // ── Metadata table ────────────────────────────────────────
    metaTable: { borderWidth: 1, borderColor: C.tableBorder, borderRadius: SIZE.radius },
    metaRow: {
        flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.tableBorder,
    },
    metaFirstRow: { borderTopWidth: 0 },
    metaKey: {
        width: 120, padding: SIZE.cellPad, backgroundColor: C.tableAlt,
        borderRightWidth: 1, borderRightColor: C.tableBorder,
        fontSize: 8, fontFamily: F.bold, color: C.gray500,
    },
    metaVal: { flex: 1, padding: SIZE.cellPad, fontSize: 9, color: C.gray700 },

    // ── Footer ────────────────────────────────────────────────
    footer: {
        position: 'absolute', bottom: 20, left: SIZE.pageMargin, right: SIZE.pageMargin,
        flexDirection: 'row', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: C.gray200, paddingTop: 6,
    },
    footerText: { fontSize: 8, color: C.gray400 },

    // ── Disclaimer ────────────────────────────────────────────
    disclaimerBox: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: C.tableBorder,
        borderRadius: SIZE.radius,
        padding: 10,
        backgroundColor: C.gray50,
    },
    disclaimerTitle: {
        fontSize: 8,
        fontFamily: F.bold,
        color: C.gray500,
        letterSpacing: 1,
        marginBottom: 4,
    },
    disclaimerText: {
        fontSize: 7,
        color: C.gray500,
        lineHeight: 1.5,
    },
});

function scoreColor(pct: number) {
    if (pct >= 80) return C.compliant;
    if (pct >= 50) return C.review;
    return C.nonCompliant;
}

interface Props {
    document: InputDocument;
    summary: ReportSummary;
}

export function CoverPage({ document, summary }: Props) {
    const pct = summary.complianceScore;
    const scoreCol = scoreColor(pct);

    return (
        <Page size="A4" style={s.page}>

            {/* ── Navy header with logo top-left ── */}
            <View style={s.header}>
                <Image src={fortivLogoWhite} style={s.logo} />
                <View style={s.headerRight}>
                    <Text style={s.headerTitle}>Shariah Compliance Report</Text>
                    <Text style={s.headerSub}>{document.document_name}</Text>
                    <Text style={s.headerMeta}>
                        {summary.generatedAt}  ·  {document.document_type} Contract
                    </Text>
                </View>
            </View>

            <View style={s.body}>

                {/* ── Section: Summary Stats as Table ── */}
                <Text style={s.sectionLabel}>Report Summary</Text>
                <View style={s.table}>
                    <View style={s.tHead}>
                        {['Total Clauses', 'Compliant', 'Needs Review', 'Non-Compliant'].map((h, i, arr) => (
                            <View key={h} style={[s.tCell, i === arr.length - 1 && s.tCellLast]}>
                                <Text style={s.tHeadText}>{h.toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={s.tRow}>
                        <View style={s.tCell}>
                            <Text style={[s.tStatNum, { color: C.gray900 }]}>{summary.totalClauses}</Text>
                        </View>
                        <View style={s.tCell}>
                            <Text style={[s.tStatNum, { color: C.compliant }]}>{summary.compliantCount}</Text>
                        </View>
                        <View style={s.tCell}>
                            <Text style={[s.tStatNum, { color: C.review }]}>{summary.reviewCount}</Text>
                        </View>
                        <View style={[s.tCell, s.tCellLast]}>
                            <Text style={[s.tStatNum, { color: C.nonCompliant }]}>{summary.nonCompliantCount}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Section: Compliance Score Bar ── */}
                <Text style={s.sectionLabel}>Compliance Score</Text>
                <View style={s.scoreBox}>
                    <View style={s.scoreRow}>
                        <Text style={s.scoreLbl}>Overall Compliance Score</Text>
                        <Text style={[s.scoreVal, { color: scoreCol }]}>{pct}%</Text>
                    </View>
                    <View style={s.barTrack}>
                        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: scoreCol }]} />
                    </View>
                </View>

                {/* ── Section: Report Metadata ── */}
                <Text style={s.sectionLabel}>Report Metadata</Text>
                <View style={s.metaTable}>
                    {[
                        ['Prepared By', `${summary.analystName}  ·  ${summary.analystEmail}`],
                        ['Organisation', 'Fortiv Solutions'],
                        ['Generated', summary.generatedAt],
                        ['Contract Type', document.document_type],
                        ['Document', document.document_name],
                        ['Classification', 'Confidential — Internal Use Only'],
                    ].map(([k, v], i) => (
                        <View key={k} style={[s.metaRow, i === 0 && s.metaFirstRow]}>
                            <Text style={s.metaKey}>{k}</Text>
                            <Text style={s.metaVal}>{v}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Section: Disclaimer ── */}
                <Text style={s.sectionLabel}>Disclaimer</Text>
                <View style={s.disclaimerBox}>
                    <Text style={s.disclaimerTitle}>LEGAL NOTICE</Text>
                    <Text style={s.disclaimerText}>
                        This report is generated by the Fortiv AI Shariah Compliance Screener for internal review purposes only. It does not constitute a Shariah fatwa, legal opinion, or binding regulatory assessment. All findings, classifications, and recommendations are AI-generated and must be reviewed and validated by a qualified Shariah scholar or compliance officer before any contractual decisions are made. Fortiv Solutions accepts no liability for decisions made solely on the basis of this automated report. Reference frameworks: AAOIFI Shariah Standards (current edition) and SAMA Islamic Finance Regulations.
                    </Text>
                </View>

            </View>

            {/* ── Footer ── */}
            <View style={s.footer} fixed>
                <View>
                    <Text style={s.footerText}>Fortiv Solutions  ·  Confidential</Text>
                    <Text style={{ fontSize: 6.5, color: C.gray400, marginTop: 2, fontStyle: 'italic' }}>
                        AI-generated analysis — must be reviewed by a qualified Shariah scholar.
                    </Text>
                </View>
                <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
                    `Page ${pageNumber} of ${totalPages}`} />
            </View>

        </Page>
    );
}
