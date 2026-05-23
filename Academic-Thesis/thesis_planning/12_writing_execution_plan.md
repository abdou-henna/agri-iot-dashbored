# Writing Execution Plan

## Purpose

This file defines the staged writing workflow for the `academic-thesis-builder` skill.

## Stage 0 — Workspace reading

Before writing any thesis text, the skill must read:

1. `00_README.md`
2. `01_project_understanding_map.md`
3. `02_master_thesis_plan.md`
4. `maps_and_policies/source-map.md`
5. `maps_and_policies/data-field-policy.md`
6. `08_figures_tables_placement_plan.md`
7. `09_reference_strategy_and_bib_update.md`
8. `references/related_work_selection_matrix.md`
9. The specific chapter brief being written.

## Stage 1 — Chapter 1 complete draft

Write Chapter 1 fully before writing Chapter 2.

Inputs:

- `chapter_briefs/01_chapter_1_background_brief.md`
- references related to IoT, smart agriculture, communication, low power, reliability, and alfalfa.

Output:

- `chapters/chapter1_background.tex` or equivalent.

Quality checks:

- Background only, no implementation results.
- Alfalfa motivation clearly introduced.
- No unsupported agronomic claims.

## Stage 2A — Chapter 2 thematic related-work draft

Write sections 2.1 to 2.10.

Inputs:

- `chapter_briefs/02_chapter_2_related_work_brief.md`
- `references/related_work_selection_matrix.md`
- `references/references_updated.bib`

Output:

- First half of Chapter 2.

Quality checks:

- Every related-work claim has a citation.
- Works are grouped by theme.
- No copy-paste or source-style cloning.
- Alfalfa-specific gap appears as a dedicated section.

## Stage 2B — Chapter 2 comparison tables and synthesis

Write sections 2.11 to 2.13.

Outputs:

- Proposed system improvements.
- Comparative analysis table.
- Feature matrix.
- Chapter summary.

Quality checks:

- Comparison is fair and evidence-bound.
- Our improvements match actual project implementation.
- No exaggeration of novelty.

## Stage 3A — Chapter 3 implementation draft, first half

Write sections 3.1 to 3.8.

Inputs:

- `chapter_briefs/03_chapter_3_part_a_implementation_brief.md`
- project code/docs
- hardware images and diagrams

Quality checks:

- Firmware modes include motivations and triggers.
- Long press = Upload Mode.
- Four consecutive presses = RTC Sync Mode.
- Private files are not exposed.

## Stage 3B — Chapter 3 implementation/evaluation draft, second half

Write sections 3.9 to 3.17.

Inputs:

- `chapter_briefs/04_chapter_3_part_b_results_brief.md`
- dashboard screenshots
- validation package
- limitations files

Quality checks:

- Dashboard is described as implemented evidence.
- AI is interpretation-only.
- Validation claims match available files.
- Limitations are explicit.

## Stage 4 — Introduction, abstracts, conclusion

Write after chapters because final contribution wording depends on completed content.

Inputs:

- `chapter_briefs/00_front_matter_and_conclusion_brief.md`
- all drafted chapters.

## Stage 5 — Final consistency pass

Check:

- Three-chapter structure only.
- Figure/table numbering.
- Citation coverage.
- No private secrets.
- No unsupported agronomic claims.
- All diagrams and screenshots are placed intentionally.
- Chapter 2 contains strong comparison and alfalfa crop-specific gap.
