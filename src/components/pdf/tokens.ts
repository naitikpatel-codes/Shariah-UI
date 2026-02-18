// Design System Tokens for PDF Export — REDESIGNED
// Blue/Navy Theme — Fortiv Solutions

export const C = {
    // ── Brand ──────────────────────────────────────
    primary: '#1783DF',   // blue — headers, badges, links
    navy: '#1783DF',   // dark navy — header bg, accent bars
    white: '#FFFFFF',

    // ── Table Structure ────────────────────────────
    tableHead: '#1783DF',   // table header row background
    tableHeadTxt: '#FFFFFF',   // table header text
    tableRow: '#FFFFFF',   // data row background
    tableAlt: '#F4F8FD',   // alternating row (light blue tint)
    tableBorder: '#DAEAF8',   // cell border colour

    // ── Status Colours ─────────────────────────────
    compliant: '#16A34A',
    compliantBg: '#F0FDF4',
    review: '#D97706',
    reviewBg: '#FFFBEB',
    nonCompliant: '#DC2626',
    nonCompliantBg: '#FEF2F2',

    // ── Severity ───────────────────────────────────
    sevLow: '#6B7280', sevLowBg: '#F3F4F6',
    sevMed: '#D97706', sevMedBg: '#FFFBEB',
    sevHigh: '#EA580C', sevHighBg: '#FFF7ED',
    sevCrit: '#DC2626', sevCritBg: '#FEF2F2',

    // ── Neutral ────────────────────────────────────
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray700: '#334155',
    gray900: '#0F172A',

    // ── Reference tag colours ──────────────────────
    aaoifiBorder: '#1783DF', aaoifiBg: '#EFF6FF', aaaoifiText: '#1D4ED8',
    samaBorder: '#1783DF', samaBg: '#F0F7FF', samaText: '#1783DF',
};

export const F = {
    bold: 'Helvetica-Bold',
    normal: 'Helvetica',
    mono: 'Courier',
};

export const SIZE = {
    pageMargin: 36,       // pt — uniform page margin
    headerH: 64,       // pt — top header band height
    rowH: 22,       // pt — standard table row height
    cellPad: 6,        // pt — table cell padding
    radius: 4,        // pt — border radius
    logoW: 90,       // pt — logo image width
};
