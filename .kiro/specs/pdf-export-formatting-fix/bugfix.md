# Bugfix Requirements Document

## Introduction

The Shariah Compliance Report PDF export currently suffers from severe formatting issues that significantly impact readability and professional presentation. The exported PDFs exhibit text overlapping, poor spacing between sections, inconsistent layouts, and misaligned elements. These formatting problems occur throughout the clause detail pages, making it difficult for users to read and interpret the compliance analysis. This bugfix addresses all formatting issues in the PDF export to ensure proper spacing, alignment, and readability.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the clause name text is long THEN the system allows text to overflow and overlap with badges in the title row

1.2 WHEN multiple clauses are rendered on a page THEN the system applies insufficient spacing (marginBottom: 12) causing clauses to appear cramped

1.3 WHEN rendering the title row THEN the system uses numberOfLines={1} with ellipsis that cuts off important clause information prematurely

1.4 WHEN rendering meta cells (Classification, Severity, Confidence) THEN the system uses inconsistent padding (paddingVertical: 5) that creates unbalanced vertical spacing

1.5 WHEN rendering section content THEN the system uses padding: SIZE.cellPad + 2 (8pt) which is insufficient for readability

1.6 WHEN rendering sub-items (violations, actions) THEN the system uses marginTop: 3 and gap: 6 which creates cramped spacing between list items

1.7 WHEN rendering the clause text in the title row THEN the system truncates at 60 characters with hardcoded substring causing information loss

1.8 WHEN rendering layer analysis boxes THEN the system uses gap: 10 which is insufficient spacing between AAOIFI and SAMA boxes

1.9 WHEN rendering body text THEN the system uses lineHeight: 1.5 which is too tight for comfortable reading in PDF format

1.10 WHEN rendering the violations section THEN the system uses inline styles that are inconsistent with other sections

1.11 WHEN clause blocks wrap across pages THEN the system uses wrap={false} on the entire block causing potential page overflow issues

1.12 WHEN rendering bullet points THEN the system uses a 3x3pt circle with marginTop: 5 that doesn't align properly with text baseline

### Expected Behavior (Correct)

2.1 WHEN the clause name text is long THEN the system SHALL allow the title row to wrap to multiple lines or increase height to accommodate full text without overlap

2.2 WHEN multiple clauses are rendered on a page THEN the system SHALL apply adequate spacing (marginBottom: 20-24) to clearly separate clause blocks

2.3 WHEN rendering the title row THEN the system SHALL display the full clause text or provide a longer preview (100+ characters) before truncation

2.4 WHEN rendering meta cells (Classification, Severity, Confidence) THEN the system SHALL use consistent and balanced padding (paddingVertical: 8-10) for proper visual hierarchy

2.5 WHEN rendering section content THEN the system SHALL use adequate padding (12-16pt) to ensure comfortable reading space

2.6 WHEN rendering sub-items (violations, actions) THEN the system SHALL use proper spacing (marginTop: 6-8, gap: 8-10) to clearly separate list items

2.7 WHEN rendering the clause text in the title row THEN the system SHALL display a meaningful preview (100+ characters) or implement proper text wrapping

2.8 WHEN rendering layer analysis boxes THEN the system SHALL use adequate spacing (gap: 16-20) to clearly separate AAOIFI and SAMA analysis

2.9 WHEN rendering body text THEN the system SHALL use comfortable line height (1.6-1.8) for optimal PDF readability

2.10 WHEN rendering the violations section THEN the system SHALL use consistent styling patterns matching other sections

2.11 WHEN clause blocks wrap across pages THEN the system SHALL implement intelligent page breaking that keeps related content together

2.12 WHEN rendering bullet points THEN the system SHALL use properly sized bullets (4x4pt) with correct vertical alignment (marginTop: 6-7) to match text baseline

### Unchanged Behavior (Regression Prevention)

3.1 WHEN rendering the cover page THEN the system SHALL CONTINUE TO display the cover page with existing layout and styling

3.2 WHEN rendering the header on each page THEN the system SHALL CONTINUE TO show the fixed navy header with logo and document name

3.3 WHEN rendering the footer on each page THEN the system SHALL CONTINUE TO display page numbers and disclaimer text

3.4 WHEN rendering classification badges THEN the system SHALL CONTINUE TO use the correct colors (compliant: green, needs_review: orange, non-compliant: red)

3.5 WHEN rendering severity indicators THEN the system SHALL CONTINUE TO use the correct color coding (low: gray, medium: orange, high: orange-red, critical: red)

3.6 WHEN rendering confidence scores THEN the system SHALL CONTINUE TO display as percentage with primary color

3.7 WHEN rendering the layer summary THEN the system SHALL CONTINUE TO show AAOIFI and SAMA analysis in separate boxes

3.8 WHEN rendering violations with source layer information THEN the system SHALL CONTINUE TO display the source layer badge

3.9 WHEN rendering conflicts THEN the system SHALL CONTINUE TO show both conflict description and resolution

3.10 WHEN rendering required actions THEN the system SHALL CONTINUE TO display action text with priority level

3.11 WHEN rendering the footer disclaimer page THEN the system SHALL CONTINUE TO display the disclaimer content with existing structure

3.12 WHEN exporting the PDF THEN the system SHALL CONTINUE TO use @react-pdf/renderer library and maintain A4 page size
