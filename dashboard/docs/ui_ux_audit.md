# UI/UX Audit (Repo-Specific)

## Executive summary
The dashboard has strong functional breadth and clear domain separation, but visual and interaction consistency is uneven across overview, diagnostics, agronomy intelligence, Gemini interpretation, and processed-data transparency views. The highest-value near-term work is a **UI-only standardization pass** (cards, badges, tables, state messaging, spacing hierarchy) without changing analytics logic, Gemini rules, routing, or data contracts.

## Current strengths
- Clear app shell with grouped sidebar taxonomy and mobile bottom navigation fallback.
- Timezone visibility in header and broad use of UTC-to-display formatting utilities.
- Strong diagnostics utility: filters, severity chips, histogram + event table workflow.
- Explicit deterministic and AI-oriented panel separation (`AgronomicIntelligencePanel` vs `GeminiInsightPanel`).
- Processed Data Viewer includes read-only patterns and distinct badge semantics.

## Current weaknesses
- Repeated utility-class compositions create subtle drift in card padding, border tone, heading density, and action placement.
- Dense pages (Logs, System Health, Insights) have inconsistent scan paths between filters, summaries, and detailed rows.
- Badge semantics and severity palettes are not fully unified between diagnostics and analytics tables.
- Loading/empty/error states exist but presentation rhythm differs by page, reducing perceived cohesion.
- Mobile ergonomics for dense tables/drawers rely heavily on horizontal squeeze rather than progressively disclosed summaries.

## Navigation / information architecture
- IA is broad and mostly coherent: Overview, Daily Operations, Soil, Weather, Agronomy, Diagnostics, Settings.
- Mobile route set is intentionally reduced (good), but discoverability gap exists for diagnostics/system-health and agronomy insights on small screens.
- Group names in desktop sidebar are effective; card-level deep-links are less consistent between pages.

## Visual hierarchy
- Primary hierarchy is generally card-based with white surfaces over slate background.
- Heading levels and section-intro copy are inconsistent; some pages jump from page title to dense controls without explanatory context.
- Alert/warning emphasis is strong but not always paired with short decision guidance.

## Cards / panels
- Core card motif (`rounded-lg`, `border-slate-200`, `bg-white`, `p-4`) appears widely and is a good base.
- Variants (summary cards, KPI cards, reliability blocks, context controls) need a standard header/body/footer anatomy.
- Secondary metadata placement (timestamps, source labels, caveats) is inconsistent.

## Tables / dense data
- Diagnostics event table and processed-data table are functional and information-rich.
- Column-density management lacks a universal responsive pattern (priority columns vs expandable detail).
- Badge and monospace usage is good, but row-height/padding and empty-cell rendering should be standardized.

## AI interpretation UX
- Gemini panel language already frames interpretation with caution and reliability context.
- Opportunity: stronger visual “AI interpretation” container treatment to prevent confusion with deterministic outputs.
- Keep current safeguards visible (limitations, confidence context, non-override framing).

## Deterministic analytics UX
- Agronomic intelligence panel appropriately presents deterministic summaries and limitations.
- Opportunity: normalize section ordering and microcopy rhythm across all deterministic cards.
- Preserve null/insufficient-data signaling; never imply certainty when evidence is sparse.

## Diagnostics UX
- Logs page filter controls are useful and domain-oriented (severity/node/upload/event/error).
- System Health + Uploads workflows could benefit from tighter summary-to-detail progression and standardized status chips.
- Event histogram + table relation is valuable and should be visually reinforced.

## Processed Data Viewer UX
- Current drawer/table/badges are a strong transparency feature foundation.
- Preserve read-only semantics, lineage/provenance wording, and missing-value visibility.
- Improve quick interpretability via consistent status legends and sticky context headers.

## Mobile / responsive behavior
- App shell handles collapse and bottom nav well.
- Dense diagnostics/data surfaces need mobile-first condensation rules (summary rows + tap-to-expand details).
- Button-chip clusters can wrap unpredictably and should follow spacing/token rules.

## Accessibility concerns
- Contrast likely acceptable in many areas, but small text and muted gray metadata may underperform in low-vision contexts.
- Chip/button focus and keyboard ordering should be standardized across all filter bars.
- Icon-only collapsed nav should preserve robust accessible labeling.

## Consistency issues
- Inconsistent text scales for section titles and metadata.
- Variations in action-button treatment (filled vs outlined vs text) without a clear semantic system.
- Inconsistent timestamp/source annotation placement across cards and rows.

## High-risk areas not to touch
- Any analytics computation, QC/reliability math, agronomic reasoning, or snapshot adapters.
- Gemini boundary logic, reliability gate behavior, prompt semantics, and safety constraints.
- API contracts, hooks query semantics, routing, and time-semantic utilities.

## Low-risk visual improvements
- Unify card anatomy, spacing scale, section headers, and metadata row treatment.
- Standardize badge color/shape/text tokens for severity/status/reliability.
- Normalize loading/empty/error state components usage and placement.
- Establish consistent table typography and row spacing.

## Medium-risk component standardization opportunities
- Centralize reusable panel wrappers for analytics, diagnostics, and agronomy sections.
- Introduce shared filter-bar layout primitives for chips + fields + actions.
- Standardize drawer header/footer patterns for processed-data and diagnostics detail surfaces.

## Recommended implementation sequence
1. Define design tokens and visual primitives (colors, spacing, typography, radius, shadows).
2. Standardize shared feedback states and badge patterns.
3. Refactor card/panel wrappers and filter bars.
4. Normalize table patterns and responsive density rules.
5. Apply deterministic vs AI visual separation upgrades.
6. Polish diagnostics + processed-data detail flows.
7. Run regression checks (visual + functional + safety-rule verification).

## Acceptance criteria for UI-only refactor
- No changes to runtime analytics/Gemini/business logic and no dependency additions.
- Deterministic and Gemini outputs remain clearly separated with explicit reliability/limitations.
- Low-confidence and insufficient-data warnings remain prominent.
- Processed Data Viewer remains read-only and preserves missing/provenance semantics.
- Diagnostics tables retain current filter capability while improving readability.
- Responsive layouts preserve full task completion on mobile without hidden critical warnings.
