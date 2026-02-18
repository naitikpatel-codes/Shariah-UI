import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SIZE } from '../tokens';
import type { ClauseAnalysis } from '@/types/pdf.types';

const s = StyleSheet.create({

    // ── Outer wrapper — forces new page if needed ──
    clauseBlock: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.tableBorder,
        borderRadius: SIZE.radius,
        overflow: 'hidden',
    },

    // ── Title row — navy background ──────────────
    titleRow: {
        backgroundColor: C.navy,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    clauseNum: {
        fontFamily: F.mono,
        fontSize: 9,
        color: C.white,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 3,
    },
    clauseName: { color: C.white, fontSize: 11, fontFamily: F.bold },
    titleRight: { flexDirection: 'row', gap: 5 },

    // ── Status badge ─────────────────────────────
    badge: {
        paddingHorizontal: 7, paddingVertical: 3,
        borderRadius: 3, borderWidth: 1,
    },
    badgeText: { fontSize: 8, fontFamily: F.bold },

    // ── 4-column meta row ─────────────────────────
    metaHeaderRow: {
        flexDirection: 'row',
        backgroundColor: C.tableAlt,
        borderTopWidth: 1, borderTopColor: C.tableBorder,
    },
    metaDataRow: {
        flexDirection: 'row',
        borderTopWidth: 1, borderTopColor: C.tableBorder,
    },
    metaCell: {
        flex: 1, paddingHorizontal: SIZE.cellPad, paddingVertical: 5,
        borderRightWidth: 1, borderRightColor: C.tableBorder,
    },
    metaCellLast: { borderRightWidth: 0 },
    metaHdrTxt: { fontSize: 7, fontFamily: F.bold, color: C.gray500, letterSpacing: 0.5 },
    metaValTxt: { fontSize: 9, fontFamily: F.bold, color: C.gray700 },

    // ── Confidence bar (inline) ───────────────────
    confTrack: { height: 4, backgroundColor: C.gray200, borderRadius: 2, marginTop: 3 },
    confFill: { height: 4, borderRadius: 2, backgroundColor: C.primary },

    // ── Content rows ─────────────────────────────
    contentRow: {
        borderTopWidth: 1, borderTopColor: C.tableBorder,
        padding: SIZE.cellPad + 2,
    },
    sectionLbl: {
        fontSize: 7, fontFamily: F.bold, color: C.gray400,
        letterSpacing: 0.8, marginBottom: 5,
    },
    bodyText: {
        fontSize: 9, color: C.gray700, lineHeight: 1.5, fontFamily: F.normal,
    },

    // ── Split reference row ───────────────────────
    refRow: {
        flexDirection: 'row',
        borderTopWidth: 1, borderTopColor: C.tableBorder,
    },
    refCell: {
        flex: 1, padding: SIZE.cellPad + 2,
        borderRightWidth: 1, borderRightColor: C.tableBorder,
    },
    refCellLast: { borderRightWidth: 0 },

    // ── Tag pills ─────────────────────────────────
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
    aaoifiTag: {
        borderWidth: 1, borderColor: C.aaoifiBorder,
        backgroundColor: C.aaoifiBg, borderRadius: 3,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    aaoifiTagTxt: { fontSize: 7.5, color: C.aaaoifiText, fontFamily: F.bold },
    samaTag: {
        borderWidth: 1, borderColor: C.samaBorder,
        backgroundColor: C.samaBg, borderRadius: 3,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    samaTagTxt: { fontSize: 7.5, color: C.samaText, fontFamily: F.bold },

    // ── Remediation row ───────────────────────────
    remRow: {
        borderTopWidth: 1, borderTopColor: C.tableBorder,
        flexDirection: 'row',
    },
    remAccent: { width: 4, backgroundColor: C.navy },
    remBody: { flex: 1, padding: SIZE.cellPad + 2, backgroundColor: '#F0F7FF' },
});

// ── Helpers ──────────────────────────────────────────────────

function getClassStyle(c: string) {
    if (c === 'compliant') return { badge: { bg: C.compliantBg, border: C.compliant, txt: C.compliant }, label: 'COMPLIANT' };
    if (c === 'needs_review') return { badge: { bg: C.reviewBg, border: C.review, txt: C.review }, label: 'NEEDS REVIEW' };
    return { badge: { bg: C.nonCompliantBg, border: C.nonCompliant, txt: C.nonCompliant }, label: 'NON-COMPLIANT' };
}

function getSevStyle(sev: string) {
    const map: Record<string, { bg: string; border: string; txt: string }> = {
        low: { bg: C.sevLowBg, border: C.sevLow, txt: C.sevLow },
        medium: { bg: C.sevMedBg, border: C.sevMed, txt: C.sevMed },
        high: { bg: C.sevHighBg, border: C.sevHigh, txt: C.sevHigh },
        critical: { bg: C.sevCritBg, border: C.sevCrit, txt: C.sevCrit },
    };
    return map[sev] ?? map.low;
}

interface BadgeProps {
    label: string;
    bg: string;
    border: string;
    txt: string;
}

function Badge({ label, bg, border, txt }: BadgeProps) {
    return (
        <View style={[s.badge, { backgroundColor: bg, borderColor: border }]}>
            <Text style={[s.badgeText, { color: txt }]}>{label}</Text>
        </View>
    );
}

interface Props {
    clause: ClauseAnalysis;
}

export function ClauseTable({ clause }: Props) {
    const cls = getClassStyle(clause.classification);
    const sev = getSevStyle(clause.severity);
    const conf = Math.round(clause.confidence_score * 100);

    const hasAaoifi = clause.shariah_issues?.length > 0;
    const hasSama = clause.sama_issues?.length > 0;
    const hasRefs = hasAaoifi || hasSama;
    const needsRem = clause.classification !== 'compliant' && clause.remediation;

    return (
        <View style={s.clauseBlock} wrap={false}>

            {/* ── Row 1: Navy title bar ── */}
            <View style={s.titleRow}>
                <View style={s.titleLeft}>
                    <Text style={s.clauseNum}>[{clause.clause_number}]</Text>
                    <Text style={s.clauseName}>
                        {clause.clause_text.substring(0, 40)}...
                    </Text>
                </View>
                <View style={s.titleRight}>
                    <Badge label={cls.label} {...cls.badge} />
                    {clause.is_critical_for_shariah && (
                        <Badge label="CRITICAL" bg={C.sevCritBg} border={C.sevCrit} txt={C.sevCrit} />
                    )}
                </View>
            </View>

            {/* ── Row 2: 4-column meta header ── */}
            <View style={s.metaHeaderRow}>
                {['Classification', 'Severity', 'Confidence', 'Clause No.'].map((h, i, arr) => (
                    <View key={h} style={[s.metaCell, i === arr.length - 1 && s.metaCellLast]}>
                        <Text style={s.metaHdrTxt}>{h.toUpperCase()}</Text>
                    </View>
                ))}
            </View>

            {/* ── Row 3: 4-column meta data ── */}
            <View style={s.metaDataRow}>
                {/* Classification */}
                <View style={s.metaCell}>
                    <Text style={[s.metaValTxt, { color: cls.badge.txt }]}>{cls.label}</Text>
                </View>
                {/* Severity */}
                <View style={s.metaCell}>
                    <Text style={[s.metaValTxt, { color: sev.txt }]}>{clause.severity.toUpperCase()}</Text>
                </View>
                {/* Confidence with mini bar */}
                <View style={s.metaCell}>
                    <Text style={[s.metaValTxt, { color: C.primary }]}>{conf}%</Text>
                    <View style={s.confTrack}>
                        <View style={[s.confFill, { width: `${conf}%` }]} />
                    </View>
                </View>
                {/* Clause number */}
                <View style={[s.metaCell, s.metaCellLast]}>
                    <Text style={[s.metaValTxt, { fontFamily: F.mono }]}>[{clause.clause_number}]</Text>
                </View>
            </View>

            {/* ── Row 4: Clause text ── */}
            <View style={s.contentRow}>
                <Text style={s.sectionLbl}>CLAUSE TEXT</Text>
                <Text style={s.bodyText}>{clause.clause_text}</Text>
            </View>

            {/* ── Row 5: Findings ── */}
            <View style={s.contentRow}>
                <Text style={s.sectionLbl}>FINDINGS</Text>
                <Text style={s.bodyText}>{clause.findings}</Text>
            </View>

            {/* ── Row 6: References (split 50/50 if both, full width if one) ── */}
            {hasRefs && (
                <View style={s.refRow}>
                    {/* AAOIFI column */}
                    <View style={[s.refCell, !hasSama && s.refCellLast]}>
                        <Text style={s.sectionLbl}>AAOIFI STANDARDS REFERENCE</Text>
                        {hasAaoifi ? (
                            <View style={s.tagWrap}>
                                {clause.shariah_issues.map((issue, i) => (
                                    <View key={i} style={s.aaoifiTag}>
                                        <Text style={s.aaoifiTagTxt}>● {issue}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[s.bodyText, { color: C.gray400 }]}>None identified</Text>
                        )}
                    </View>

                    {/* SAMA column */}
                    {hasSama && (
                        <View style={[s.refCell, s.refCellLast]}>
                            <Text style={s.sectionLbl}>SAMA REGULATION REFERENCE</Text>
                            <View style={s.tagWrap}>
                                {clause.sama_issues.map((issue, i) => (
                                    <View key={i} style={s.samaTag}>
                                        <Text style={s.samaTagTxt}>● {issue}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* ── Row 7: Remediation (navy left bar, only if non-compliant) ── */}
            {needsRem && (
                <View style={s.remRow}>
                    <View style={s.remAccent} />
                    <View style={s.remBody}>
                        <Text style={s.sectionLbl}>REMEDIATION</Text>
                        <Text style={s.bodyText}>{clause.remediation}</Text>
                    </View>
                </View>
            )}

        </View>
    );
}
