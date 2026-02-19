// ─────────────────────────────────────────────────────────────
// PDF Design Tokens — matched to shariah_compliance_report_template.html
// ─────────────────────────────────────────────────────────────

export const C = {
    // ── Brand (from --brand, --brand-dark, --brand-mid, --brand-light, --brand-xlight) ──
    brand: '#1783DF',
    brandDark: '#1068B8',
    brandMid: '#2393EF',
    brandLight: '#DCF0FF',
    brandXLight: '#F0F8FF',

    // ── Header gradient approximation (PDF can't do CSS gradients, use solid brandDark) ──
    headerBg: '#1068B8',

    // ── Status colours (from template vars) ──
    compliant: '#16A34A',
    compliantBg: '#F0FDF4',
    compliantBorder: '#86EFAC',

    review: '#D97706',
    reviewBg: '#FFFBEB',
    reviewBorder: '#FCD34D',

    critical: '#DC2626',
    criticalBg: '#FEF2F2',
    criticalBorder: '#FCA5A5',

    // ── Ink scale (from --ink-XXX) ──
    ink900: '#0A1929',
    ink700: '#1E3A5F',
    ink500: '#4A6580',
    ink300: '#A8BECE',
    ink100: '#EDF2F7',
    ink50: '#F7FAFC',

    white: '#FFFFFF',

    // ── Layer box tints (from .flag-box colours in template) ──
    conflictBg: '#FFF8F0',
    conflictBorder: '#FDE8C8',
    conflictText: '#92400E',
    conflictLabel: '#B45309',

    actionsBg: '#F0F9FF',
    actionsBorder: '#BAE6FD',
    actionsText: '#075985',
    actionsLabel: '#0369A1',

    // ── Severity tag BGs (from template .severity-tag) ──
    severityCriticalBg: '#FEF2F2',
    severityMediumBg: '#FFFBEB',
    severityLowBg: '#F7FAFC',

    // ── Decision block (from .decision-block, .decision-header) ──
    decisionBorder: '#DCF0FF',
    decisionHeaderBg: '#F0F8FF',
    decisionBorderRed: '#FCA5A5',
    decisionRedBg: '#FEF2F2',
    decisionGreenBg: '#F0FDF4',
    decisionGreenBord: '#86EFAC',
};

export const F = {
    bold: 'Helvetica-Bold',
    normal: 'Helvetica',
    mono: 'Courier',
};

export const SIZE = {
    pageMargin: 36,   // page horizontal padding
    headerH: 62,   // fixed header band height
    cellPad: 8,    // general cell padding
    radius: 4,    // border radius (PDF limited)
    logoW: 80,   // logo width
    clauseGap: 14,   // gap between clause cards
};
