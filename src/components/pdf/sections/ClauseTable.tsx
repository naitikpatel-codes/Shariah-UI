import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, SIZE } from '../tokens';
import type { ClauseAnalysis } from '@/types/pdf.types';

// ─────────────────────────────────────────────────────────────
// Styles — mirror .clause-card, .clause-top, .clause-body,
//          .decision-block, .layer-grid, .flags-row from HTML template
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({

    // ── Card wrapper (mirrors .clause-card + .status-X left border) ──
    card: {
        backgroundColor: C.white,
        borderRadius: SIZE.radius,
        borderWidth: 1,
        borderColor: 'rgba(23,131,223,0.07)',
        marginBottom: SIZE.clauseGap,
        overflow: 'hidden',
    },

    // ── Card top row (mirrors .clause-top) ───────────────────
    clauseTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.ink100,
        gap: 12,
    },
    clauseTopLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 7,
        flex: 1,
    },
    clauseTopRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        flexShrink: 0,
    },

    // ── Clause ID pill (mirrors .clause-id) ──────────────────
    clauseId: {
        fontSize: 9.5,
        fontFamily: F.bold,
        color: C.ink500,
        backgroundColor: C.ink50,
        borderWidth: 1,
        borderColor: C.ink100,
        borderRadius: 3,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },

    // ── Status badge (mirrors .status-badge) ─────────────────
    statusBadge: {
        fontSize: 9.5,
        fontFamily: F.bold,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        letterSpacing: 0.2,
    },

    // ── Severity tag (mirrors .severity-tag) ─────────────────
    severityTag: {
        fontSize: 8.5,
        fontFamily: F.bold,
        letterSpacing: 0.7,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 3,
    },

    // ── Confidence pill (mirrors .conf-pill) ─────────────────
    confPill: {
        fontSize: 9,
        fontFamily: F.bold,
        color: C.ink500,
        backgroundColor: C.ink50,
        borderWidth: 1,
        borderColor: C.ink100,
        borderRadius: 12,
        paddingHorizontal: 9,
        paddingVertical: 2,
    },

    // ── Card body (mirrors .clause-body) ─────────────────────
    clauseBody: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    // ── Clause text label (mirrors .clause-text-label) ───────
    clauseTextLabel: {
        fontSize: 8.5,
        fontFamily: F.bold,
        letterSpacing: 1,
        color: C.ink300,
        marginBottom: 6,
    },

    // ── Clause text box (mirrors .clause-text) ───────────────
    clauseTextBox: {
        fontSize: 11,
        color: C.ink700,
        lineHeight: 1.65,
        backgroundColor: C.ink50,
        borderWidth: 1,
        borderColor: C.ink100,
        borderRadius: SIZE.radius,
        padding: 12,
        fontStyle: 'italic',
        marginBottom: 12,
    },

    // ── Decision block (mirrors .decision-block) ─────────────
    decisionBlock: {
        borderWidth: 1,
        borderColor: C.decisionBorder,
        borderRadius: SIZE.radius,
        overflow: 'hidden',
        marginBottom: 12,
    },
    decisionHeader: {
        backgroundColor: C.decisionHeaderBg,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: C.decisionBorder,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    decisionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: C.brand,
        flexShrink: 0,
    },
    decisionHeaderLabel: {
        fontSize: 9,
        fontFamily: F.bold,
        letterSpacing: 0.7,
        color: C.brand,
    },
    decisionBody: {
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    decisionRow: {
        marginBottom: 9,
    },
    decisionRowLast: {
        marginBottom: 0,
    },
    drLabel: {
        fontSize: 9.5,
        fontFamily: F.bold,
        color: C.ink500,
        marginBottom: 3,
    },
    drText: {
        fontSize: 11,
        color: C.ink700,
        lineHeight: 1.6,
    },
    drTextRemediation: {
        fontSize: 11,
        color: C.brandDark,
        lineHeight: 1.6,
        fontStyle: 'italic',
        borderLeftWidth: 2,
        borderLeftColor: C.brandLight,
        paddingLeft: 11,
    },

    // ── Layer grid (mirrors .layer-grid 2-col) ───────────────
    layerGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    layerBox: {
        flex: 1,
        backgroundColor: C.ink50,
        borderWidth: 1,
        borderColor: C.ink100,
        borderRadius: SIZE.radius,
        padding: 11,
    },
    layerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    layerTitle: {
        fontSize: 8.5,
        fontFamily: F.bold,
        letterSpacing: 1,
        color: C.ink300,
    },
    layerVerdict: {
        fontSize: 8.5,
        fontFamily: F.bold,
        paddingHorizontal: 7,
        paddingVertical: 1.5,
        borderRadius: 10,
    },
    layerDesc: {
        fontSize: 10.5,
        color: C.ink700,
        lineHeight: 1.6,
    },

    // ── Flags row (mirrors .flags-row 2-col) ─────────────────
    flagsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 2,
    },
    flagBox: {
        flex: 1,
        borderRadius: SIZE.radius,
        padding: 11,
    },
    flagLabel: {
        fontSize: 8.5,
        fontFamily: F.bold,
        letterSpacing: 1,
        marginBottom: 5,
    },
    flagText: {
        fontSize: 10.5,
        lineHeight: 1.6,
    },
    priorityTag: {
        fontSize: 8,
        fontFamily: F.bold,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
        backgroundColor: '#DBEAFE',
        color: '#1D4ED8',
        marginLeft: 5,
    },

    // ── Clause footer (mirrors .clause-footer) ───────────────
    clauseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: C.ink100,
        backgroundColor: C.ink50,
    },
    cfTimestamp: { fontSize: 9, color: C.ink300 },
    cfConfidence: { fontSize: 9, fontFamily: F.bold, color: C.ink500 },
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

interface ClassStyle {
    leftBorderColor: string;
    badge: { bg: string; border: string; txt: string };
    label: string;
    icon: string;
    decisionHeaderBg: string;
    decisionHeaderBorder: string;
    decisionDotColor: string;
    decisionLabelColor: string;
}

function getClassStyle(c: string): ClassStyle {
    if (c === 'compliant') return {
        leftBorderColor: C.compliant,
        badge: { bg: C.compliantBg, border: C.compliantBorder, txt: C.compliant },
        label: 'Compliant',
        icon: '✓',
        decisionHeaderBg: C.decisionGreenBg,
        decisionHeaderBorder: C.decisionGreenBord,
        decisionDotColor: C.compliant,
        decisionLabelColor: C.compliant,
    };
    if (c === 'needs_review') return {
        leftBorderColor: C.review,
        badge: { bg: C.reviewBg, border: C.reviewBorder, txt: C.review },
        label: 'Needs Review',
        icon: '⚠',
        decisionHeaderBg: C.decisionHeaderBg,
        decisionHeaderBorder: C.decisionBorder,
        decisionDotColor: C.brand,
        decisionLabelColor: C.brand,
    };
    return {
        leftBorderColor: C.critical,
        badge: { bg: C.criticalBg, border: C.criticalBorder, txt: C.critical },
        label: 'Non-Compliant',
        icon: '✕',
        decisionHeaderBg: C.decisionRedBg,
        decisionHeaderBorder: C.decisionBorderRed,
        decisionDotColor: C.critical,
        decisionLabelColor: C.critical,
    };
}

function getSeverityStyle(sev: string) {
    if (sev === 'critical' || sev === 'high') return {
        bg: C.severityCriticalBg, border: C.criticalBorder, txt: C.critical,
        label: sev === 'critical' ? 'Critical' : 'High',
    };
    if (sev === 'medium') return {
        bg: C.severityMediumBg, border: C.reviewBorder, txt: C.review, label: 'Medium',
    };
    return {
        bg: C.severityLowBg, border: C.ink100, txt: C.ink500, label: 'Low',
    };
}

function getVerdictStyle(verdict: string) {
    if (!verdict) return { bg: C.ink100, txt: C.ink500 };
    const v = verdict.toLowerCase();
    if (v === 'compliant') return { bg: C.compliantBg, txt: C.compliant };
    if (v === 'needs_review') return { bg: C.reviewBg, txt: C.review };
    return { bg: C.criticalBg, txt: C.critical };
}

function verdictLabel(v: string) {
    if (!v) return '—';
    const map: Record<string, string> = {
        compliant: 'Compliant',
        needs_review: 'Needs Review',
        non_compliant: 'Non-Compliant',
    };
    return map[v.toLowerCase()] ?? v;
}

function cleanText(raw: string): string {
    return raw.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

interface Props {
    clause: ClauseAnalysis;
}

export function ClauseTable({ clause }: Props) {
    const cls = getClassStyle(clause.classification);
    const severity = clause.severity || 'low';
    const sevStyle = getSeverityStyle(severity);
    const conf = typeof clause.confidence_score === 'number'
        ? Math.round(clause.confidence_score * 100)
        : 0;

    const hasFindings = !!clause.findings;
    const hasRemediation = !!clause.remediation;
    const hasLayerSum = !!clause.layer_summary;
    const hasConflicts = !!(clause.conflicts && clause.conflicts.length > 0);
    const hasActions = !!(clause.required_actions && clause.required_actions.length > 0);
    const hasViolations = !!(clause.violations && clause.violations.length > 0);
    const hasLegacy = !hasLayerSum && (
        (clause.shariah_issues?.length > 0) || (clause.sama_issues?.length > 0)
    );

    // Build action text string for flag box
    const actionSentences = clause.required_actions?.map(a => a.action).join(' ') ?? '';
    const firstAction = clause.required_actions?.[0];
    const actionPriority = firstAction?.priority;

    return (
        <View style={[s.card, { borderLeftWidth: 3.5, borderLeftColor: cls.leftBorderColor }]}>

            {/* ── Top row: clause id + badges ── */}
            <View style={s.clauseTop}>
                <View style={s.clauseTopLeft}>
                    <Text style={s.clauseId}>[{clause.clause_number}]</Text>
                    <Text style={[s.statusBadge, {
                        backgroundColor: cls.badge.bg,
                        borderColor: cls.badge.border,
                        color: cls.badge.txt,
                    }]}>
                        {cls.icon} {cls.label}
                    </Text>
                    <Text style={[s.severityTag, {
                        backgroundColor: sevStyle.bg,
                        borderWidth: sevStyle.border === C.ink100 ? 1 : 0,
                        borderColor: sevStyle.border,
                        color: sevStyle.txt,
                    }]}>
                        {sevStyle.label}
                    </Text>
                </View>
                <View style={s.clauseTopRight}>
                    <Text style={s.confPill}>{conf}% Conf.</Text>
                </View>
            </View>

            {/* ── Body ── */}
            <View style={s.clauseBody}>

                {/* Clause text */}
                <Text style={s.clauseTextLabel}>Clause Text</Text>
                <Text style={s.clauseTextBox}>{cleanText(clause.clause_text)}</Text>

                {/* Decision block (Rationale + Remediation) */}
                {(hasFindings || hasRemediation) && (
                    <View style={[s.decisionBlock, {
                        borderColor: cls.decisionHeaderBorder,
                    }]}>
                        <View style={[s.decisionHeader, {
                            backgroundColor: cls.decisionHeaderBg,
                            borderBottomColor: cls.decisionHeaderBorder,
                        }]}>
                            <View style={[s.decisionDot, { backgroundColor: cls.decisionDotColor }]} />
                            <Text style={[s.decisionHeaderLabel, { color: cls.decisionLabelColor }]}>
                                Final Decision
                            </Text>
                        </View>
                        <View style={s.decisionBody}>
                            {hasFindings && (
                                <View style={[s.decisionRow, !hasRemediation && s.decisionRowLast]}>
                                    <Text style={s.drLabel}>Rationale</Text>
                                    <Text style={s.drText}>{clause.findings}</Text>
                                </View>
                            )}
                            {hasRemediation && (
                                <View style={s.decisionRowLast}>
                                    <Text style={s.drLabel}>Remediation / Conditions</Text>
                                    <Text style={s.drTextRemediation}>
                                        "{clause.remediation}"
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Layer analysis grid */}
                {hasLayerSum && clause.layer_summary && (
                    <View style={s.layerGrid}>
                        {clause.layer_summary.aaoifi && (
                            <View style={s.layerBox}>
                                <View style={s.layerTitleRow}>
                                    <Text style={s.layerTitle}>AAOIFI LAYER</Text>
                                    {(() => {
                                        const vs = getVerdictStyle(clause.layer_summary!.aaoifi!.verdict ?? '');
                                        return (
                                            <Text style={[s.layerVerdict, { backgroundColor: vs.bg, color: vs.txt }]}>
                                                {verdictLabel(clause.layer_summary!.aaoifi!.verdict ?? '')}
                                            </Text>
                                        );
                                    })()}
                                </View>
                                <Text style={s.layerDesc}>{clause.layer_summary.aaoifi.findings}</Text>
                            </View>
                        )}
                        {clause.layer_summary.sama && (
                            <View style={s.layerBox}>
                                <View style={s.layerTitleRow}>
                                    <Text style={s.layerTitle}>SAMA LAYER</Text>
                                    {(() => {
                                        const vs = getVerdictStyle(clause.layer_summary!.sama!.verdict ?? '');
                                        return (
                                            <Text style={[s.layerVerdict, { backgroundColor: vs.bg, color: vs.txt }]}>
                                                {verdictLabel(clause.layer_summary!.sama!.verdict ?? '')}
                                            </Text>
                                        );
                                    })()}
                                </View>
                                <Text style={s.layerDesc}>{clause.layer_summary.sama.findings}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Legacy issues (fallback when no layer_summary) */}
                {hasLegacy && (
                    <View style={s.layerGrid}>
                        {clause.shariah_issues?.length > 0 && (
                            <View style={s.layerBox}>
                                <Text style={s.layerTitle}>AAOIFI STANDARDS</Text>
                                {clause.shariah_issues.map((iss, i) => (
                                    <Text key={i} style={s.layerDesc}>· {iss}</Text>
                                ))}
                            </View>
                        )}
                        {clause.sama_issues?.length > 0 && (
                            <View style={s.layerBox}>
                                <Text style={s.layerTitle}>SAMA REGULATIONS</Text>
                                {clause.sama_issues.map((iss, i) => (
                                    <Text key={i} style={s.layerDesc}>· {iss}</Text>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Flags row: conflicts (left) + actions (right) */}
                {(hasConflicts || hasActions || hasViolations) && (
                    <View style={s.flagsRow}>
                        {/* Conflicts / Violations */}
                        {(hasConflicts || hasViolations) && (
                            <View style={[s.flagBox, {
                                backgroundColor: C.conflictBg,
                                borderWidth: 1,
                                borderColor: C.conflictBorder,
                                flex: hasActions ? 1 : 2,
                            }]}>
                                <Text style={[s.flagLabel, { color: C.conflictLabel }]}>
                                    {hasConflicts ? '⇄ Conflicts Resolved' : '⚠ Violations Detected'}
                                </Text>
                                {hasConflicts && clause.conflicts!.map((c, i) => (
                                    <Text key={i} style={[s.flagText, { color: C.conflictText }]}>
                                        {c.conflict}
                                        {c.resolution ? ` Resolution: ${c.resolution}` : ''}
                                    </Text>
                                ))}
                                {!hasConflicts && hasViolations && clause.violations!.map((v, i) => {
                                    const isObj = typeof v === 'object' && v !== null;
                                    const txt = isObj ? (v as any).type : v;
                                    const src = isObj ? (v as any).source_layer : null;
                                    return (
                                        <Text key={i} style={[s.flagText, { color: C.conflictText }]}>
                                            {txt}{src ? ` [${src}]` : ''}
                                        </Text>
                                    );
                                })}
                            </View>
                        )}

                        {/* Required actions */}
                        {hasActions && (
                            <View style={[s.flagBox, {
                                backgroundColor: C.actionsBg,
                                borderWidth: 1,
                                borderColor: C.actionsBorder,
                                flex: (hasConflicts || hasViolations) ? 1 : 2,
                            }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                    <Text style={[s.flagLabel, { color: C.actionsLabel, marginBottom: 0 }]}>
                                        ✦ Required Actions
                                    </Text>
                                    {actionPriority && (
                                        <Text style={s.priorityTag}>{actionPriority} Priority</Text>
                                    )}
                                </View>
                                {clause.required_actions!.map((action, i) => (
                                    <Text key={i} style={[s.flagText, { color: C.actionsText }]}>
                                        {clause.required_actions!.length > 1 ? `${i + 1}. ` : ''}{action.action}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* ── Footer bar ── */}
            <View style={s.clauseFooter}>
                <Text style={s.cfTimestamp}>Analysed: {new Date().toLocaleDateString('en-GB')}</Text>
                <Text style={s.cfConfidence}>Confidence: {conf}%</Text>
            </View>
        </View>
    );
}
