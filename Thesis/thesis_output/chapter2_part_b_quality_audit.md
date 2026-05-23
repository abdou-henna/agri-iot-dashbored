# Chapter 2 Part B Quality Audit
**Chapter:** Related Works and Comparative Analysis
**File:** `chapters/chapter2_related_works.tex`
**Scope:** Sections 2.11–2.13 (Part B; appended to Part A on 2026-05-14)
**Audit date:** 2026-05-14

---

## 1. Sections Completed

| Section | Title | Status | Word count (approx.) |
|---|---|---|---|
| 2.11 | Proposed System Improvements | Complete | ~700 |
| 2.12 | Comparative Analysis | Complete | ~310 text + 3 tables |
| 2.13 | Chapter Summary | Complete | ~360 |

**Estimated total Part B body text:** ~1,370 words (excluding table content)
**Tables created:** 3 (see §3 below)
**Figures:** 0 (no figures in Part B; tables are the primary comparative artefacts)

**Full Chapter 2 word count (Parts A + B combined):** ~4,750 words body text + 4 tables

---

## 2. Tables Created

| Label | Section | Title | Rows | Columns |
|---|---|---|---|---|
| `tab:crop-focus-summary` | §2.12 | Grouped crop focus and agricultural context of reviewed works compared with the proposed system | 6 (Ahmed / Pereira / Saban / Survey works / Other reviewed [TODO] / Proposed system) | 5 |
| `tab:related-work-comparison` | §2.12 | Criterion-based comparison across twelve design dimensions | 12 criteria | 4 |
| `tab:feature-matrix` | §2.12 | System feature comparison | 15 features | 6 (Feature + Ahmed + Pereira + Saban + Other reviewed + Proposed) |

**`tab:feature-matrix` uses `\resizebox{\textwidth}{!}{...}` as required for wide table rendering.**

### Deviation from task spec — Table 1 label

The task specification listed `tab:related-work-crop-focus` for §2.12 Table 1. This label is already defined in §2.9 (`tab:related-work-crop-focus`, lines ~437 in the .tex file). Using the same label would produce a LaTeX duplicate-label warning and cause `\ref{}` to resolve to the wrong occurrence. The label `tab:crop-focus-summary` was used instead.

**Functional difference between the two crop-focus tables:**
- §2.9 `tab:related-work-crop-focus` (Part A, 10 rows): per-work breadth survey, reviewed works only, no proposed system row
- §2.12 `tab:crop-focus-summary` (Part B, 6 rows): grouped view, includes Proposed system row, used for comparative positioning in the analysis section

A bridging sentence at the start of §2.12's Crop Focus subsection (`Table~\ref{tab:crop-focus-summary} extends the per-work crop survey of Section~\ref{sec:crop-targets}...`) makes the relationship between the two tables explicit and prevents redundancy from appearing as careless repetition.

---

## 3. References Used in Part B

### Confirmed references

| Key | Section(s) | Use |
|---|---|---|
| `ahmed2022lora_agriculture_chile` | §2.11, §2.12 (all 3 tables), §2.13 | Architecture reference in improvements; primary comparison row; chapter summary citation |
| `pereira2023esp32_drip_irrigation` | §2.11, §2.12 (all 3 tables), §2.13 | Same as above |
| `saban2023smart_agricultural_lora_cloud` | §2.11, §2.12 (all 3 tables), §2.13 | Same as above |
| `ayaz2019iot_smart_agriculture_survey` | §2.12 (Table 1), §2.13 | Survey works row in crop-focus table; chapter summary |
| `farooq2019iot_smart_agriculture_review` | §2.12 (Table 1), §2.13 | Survey works row in crop-focus table; chapter summary |
| `teh2020sensor_data_quality` | §2.13 | Chapter summary reference grouping |
| `dandrifosse2024weather_qc_agriculture` | §2.13 | Chapter summary reference grouping |

**Count: 7 confirmed references (same 7 as Part A — all used consistently across both parts)**

### Unverified references in Part B

No new unverified references were cited in Part B. The 7 unverified works from Part A (`iot_protocols_precision_agriculture_outdoor`, `lloret2021soil_moisture_wsn`, `cheap_practical_iot_agri_monitoring`, `abbaari2024data_collection_iot_networks`, `rajak2023iot_smart_sensors_agriculture`, `villa2020iot_arable_farming`, `iot_enhancements_algerian_desert_agriculture`) are referenced in Part B only as the "Other reviewed [TODO]" group row in `tab:crop-focus-summary` and the "Other reviewed" column in `tab:feature-matrix`. They are not cited individually with `\cite{}` in Part B prose.

---

## 4. TODOs Remaining

| ID | Type | Location | Required action |
|---|---|---|---|
| T1–T7 | Reference verification | Inherited from Part A | Verify 7 unverified bibliography entries before final submission (see Part A audit for details) |
| T8 | Forward reference | §2.11, §2.13: `\ref{chap:implementation}` | Resolve when `chapter3_implementation.tex` is created; use `\label{chap:implementation}` in Chapter 3 header |
| T9 | Table cleanup | §2.12 `tab:crop-focus-summary`, row "Other reviewed [TODO]" | Remove `[TODO]` text from row after metadata for unverified works is confirmed |
| T10 | Feature matrix values | §2.12 `tab:feature-matrix`, column "Other reviewed" | Review cell values against verified metadata once unverified references are confirmed |
| T11 | LaTeX compilation check | §2.12 tables | Verify that three-table sequence compiles without float placement conflicts; may need `[H]` + `\clearpage` between large tables depending on page geometry |

---

## 5. Anti-Plagiarism Checklist

The four-stage method (source → rhetorical function → abstract pattern → project-specific reconstruction) was applied to every Part B paragraph. No source sentences from `related_work_comparison_3_studies.md`, `02_chapter_2_related_work_brief.md`, or any cited paper were preserved.

| Section | Source function identified | Abstract pattern applied | Project-specific reconstruction | Verdict |
|---|---|---|---|---|
| §2.11 ¶1 | Gap-to-response transition | Gap inventory → design space framing → chapter-level scope statement | "seven thematic dimensions → each gap → deliberate design decision → Ch3 handles detail" — project-grounded opening, not adapted from any source | PASS |
| §2.11 ¶2 | Architecture description | Nodes → topology → roles → independence rationale | Three named nodes (MAIN gateway + Node 2 soil + Node 3 weather) + LoRa ACK + recovery — specifics from project architecture, not from ahmed2022 or saban2023 text | PASS |
| §2.11 ¶3 | Offline-first design rationale | SD storage → upload trigger → timestamp consequence → separation stated | Long-button-press Upload Mode + "upload time = transfer and audit metadata" — phrasing derived from data-field-policy.md principle, reconstructed in academic voice | PASS |
| §2.11 ¶4 | RTC time integrity | Time source independence → DS3231 → four-press sync → measured_at = canonical | DS3231 named; four-consecutive-press trigger described at principle level; `measured_at` as canonical field name — all project-specific | PASS |
| §2.11 ¶5 | Firmware modes | Four explicit modes → Power Saving detail → event logging → upload + dashboard visibility | Four modes named (Upload, Recovery, RTC Sync, Power Saving); JSONL diagnostic log + relay power control — project architecture, not adapted from reviewed works | PASS |
| §2.11 ¶6 | Deterministic analytics pipeline | QC → cleaning → reliability → alerts → snapshots → Processed Data Viewer → no mutation | "No raw data is mutated at any stage" + traceability chain — derived from data-field-policy.md principle, rewritten in pipeline-description academic voice | PASS |
| §2.11 ¶7 | AI interpretation boundary | AI receives analytics snapshot → does not compute → supplementary label → deterministic authoritative | "Architectural decision, not a limitation" phrasing — original; "cannot override or substitute for the computed layer" — project-grounded and not from any source | PASS |
| §2.11 ¶8 | Crop and context specificity | Alfalfa requirements → variable selection → agronomic event log → gap restatement | Alfalfa monitoring requirements linked back to §§1.9–1.10 (established in Ch1); "field-oriented prototype" — cautious, evidence-bounded | PASS |
| §2.12 intro | Comparative section framing | Three-view organization announced | "Grouped crop-focus summary / criterion-based table / binary feature matrix" — original structural description; bridging sentence to §2.9 table | PASS |
| §2.12 Table 1 prose | Table introduction + gap restatement | Summary sentence after table | "Within the reviewed works used in this thesis, no selected work explicitly targets alfalfa as the main monitored crop" — exact required wording, not copied from any source | PASS |
| §2.12 Table 2 prose | Criterion intro | Dimension count + cross-reference | Sentence constructed from section cross-references; no prose from comparison source file | PASS |
| §2.12 Table 3 prose | Feature matrix interpretation | Primary works strengths acknowledged → extension dimensions listed | "The extension lies in the data governance and analytics layers" — synthesizing phrase, not from any source; acknowledged strengths of reviewed works before stating extension | PASS |
| §2.13 | Chapter summary | Acknowledge → gap → cautious contribution claim | Four-paragraph structure: contributions acknowledged → technical gaps stated → crop gap stated → contribution scoped precisely; ending transition to Chapter 3 reconstructed, not echoed from brief |  PASS |

---

## 6. Prohibited Claims Scan

### Verified against Part B text

| Prohibited claim | Present in Part B? | Evidence |
|---|---|---|
| pH measurement | NO | Not mentioned anywhere |
| NPK measurement | NO | Not mentioned anywhere |
| Evapotranspiration computation | NO | Not mentioned; weather variables listed only as "air temperature, relative humidity, atmospheric pressure" |
| Disease diagnosis | NO | Not mentioned |
| Yield prediction | NO | Not mentioned |
| Official salinity class / ECe conversion | NO | EC referenced as "soil electrical conductivity as a relative trend indicator" — no classification claim |
| Autonomous irrigation prescription | NO | §2.11 ¶3 describes Upload Mode as operator-controlled; §2.12 Table 2 "Dashboard scope" row says "raw chart display" limitation → "Processed Data Viewer" response — no actuation claim |
| Upload time = analysis time | NO | §2.11 ¶3 explicitly: "upload time = transfer and audit metadata"; §2.12 Table 2 "Upload strategy" row reinforces this; §2.13 does not contradict it |
| Real-time guarantee | NO | Not claimed; offline-first model makes this physically impossible to claim |
| Gemini computes analytics | NO | §2.11 ¶7: "does not execute database queries, compute reliability scores, or evaluate quality control rules" |
| Gemini as authoritative output | NO | §2.11 ¶7: "Deterministic metrics, quality control flags, and reliability scores remain the authoritative outputs" |
| Gemini fills missing data | NO | Not mentioned |
| Full-season agronomic validation | NO | Validation is a Chapter 3 topic; Part B contains no validation claims |
| Error-free upload | NO | Not mentioned |
| Reliability 0.399 as high/ideal | NO | Not mentioned; reliability scoring described as a pipeline stage, not a result |
| Warning-free software build | NO | Not claimed |
| Commercial readiness | NO | §2.13: "field-oriented prototype" — explicit qualification |
| Citing unverified refs as fact | NO | Unverified works appear only as "[TODO]" group row in Table 1 and "Other reviewed" column in Table 3; no factual claims drawn from them; no `\cite{}` calls to unverified keys in Part B prose |
| "Our system is better than all previous systems" | NO | §2.13: "The proposed system is not positioned as a universal improvement over all prior work. Its contribution is specific..." — exact safe alternative from related_work_comparison_3_studies.md advice section |

**Prohibited claims scan: ALL CLEAR**

---

## 7. Consistency with Chapter 1 and Chapter 2 Part A

### Consistency with Chapter 1

| Item from Chapter 1 | Used correctly in Part B? |
|---|---|
| §1.5 LoRa characteristics established | §2.11 ¶2 references LoRa as "established" without re-explaining; correct |
| §1.6 Gateway topology introduced | §2.11 ¶2 says "LoRa node-to-gateway topology" — consistent; no redefinition |
| §1.7 Power Saving Mode (deep sleep + relay) | §2.11 ¶5 and §2.12 Table 2 "Power management" row — consistent description at principle level; no implementation detail |
| §1.8 Recovery concept introduced | §2.11 ¶2 ("enters a defined recovery procedure rather than failing silently") and §2.11 ¶5 — correctly framed as defined firmware procedure; consistent with §1.8 framing |
| §1.3 measured_at vs upload_time | §2.11 ¶3–¶4 and §2.12 Table 2 "Time policy" row — canonical \texttt{measured\_at} consistently used |
| §1.9–§1.10 Alfalfa monitoring requirements | §2.11 ¶8 references "Chapter~\ref{chap:background}" for the monitoring requirements — avoids re-stating; correctly deferred |
| EC as relative trend indicator | §2.11 ¶8: "soil electrical conductivity as a relative trend indicator" — exact safe alternative phrasing from 03_claims_to_avoid.md |
| Monitoring vs control distinction | §2.11 ¶7: AI is "interpretation layer" not a decision-making layer; §2.12 Table 2 AI row — maintained throughout |

### Consistency with Chapter 2 Part A

| Item from Part A | Consistent in Part B? |
|---|---|
| Seven comparison dimensions announced in §2.1 | §2.11 intro explicitly maps gaps back to "the preceding sections"; §2.12 Table 2 has twelve rows (seven dimensions + specific sub-dimensions) |
| Three primary works (Ahmed, Pereira, Saban) | Part B tables name all three consistently; no fourth primary work introduced |
| Gap statements at end of each §2.2–§2.8 section | §2.11 paragraphs directly correspond to each gap; no new gaps introduced without prior establishment |
| §2.9 `tab:related-work-crop-focus` (10-row breadth table) | §2.12 `tab:crop-focus-summary` bridges to it with explicit reference; does not replace or contradict it |
| §2.10 gap statement wording | §2.12 Table 1 note reproduces required exact wording; §2.13 restates the gap without contradiction |
| Unverified references (7 TODO keys) | Part B does not introduce new `\cite{}` calls to unverified keys; grouped as "[TODO]" in tables only |
| Forward reference `chap:implementation` | Used consistently in §2.11 ¶1, §2.11 ¶8, §2.13 final paragraph — all three occurrences use same label |

---

## 8. Citation Integrity

| Check | Status | Notes |
|---|---|---|
| All `\cite{}` keys in Part B are confirmed references | PASS | 7 confirmed keys used; no unverified keys appear as `\cite{}` in Part B prose |
| No numerical results borrowed from references | PASS | No accuracy %, range figures, RSSI, latency, or cost from any reference cited as the proposed system's own results |
| Citations in §2.13 grouped as closing chapter references | PASS | Three groups: primary works, surveys, data-quality refs — each group cited together, not decoratively |
| Forward reference `chap:implementation` | PENDING | Must resolve when Chapter 3 is written; `\label{chap:implementation}` must appear in Chapter 3 `\chapter{}` command |
| `tab:crop-focus-summary` label distinct from `tab:related-work-crop-focus` | PASS | No duplicate label; deviation documented (see §2 above) |

---

## 9. Writing Quality Notes

### Strengths

- **§2.11 is academic synthesis, not a bullet list.** Eight paragraphs, each covering one design dimension with topic sentence, explanation, project-specific evidence, and closing significance. No enumeration or "the system does X, Y, Z" structure.
- **AI boundary paragraph (§2.11 ¶7)** covers all three prohibited AI claims simultaneously: "does not execute database queries, compute reliability scores, or evaluate quality control rules" + "AI-generated text is supplementary" + no mention of AI filling missing data. Precise and complete.
- **§2.13 contribution statement** uses the safe alternative phrasing from `related_work_comparison_3_studies.md` without quoting it: "The proposed system is not positioned as a universal improvement over all prior work. Its contribution is specific..." — academically honest and defensible.
- **Feature matrix** uses four symbol types (\checkmark, --, Partial, Not specified) defined in the caption legend — reader can interpret every cell without ambiguity. "Not specified" used for Pereira power saving (not "Partial") as recommended by advisor review, because deep sleep is a platform capability, not a Pereira-specific design contribution.
- **Bridging sentence** at §2.12 subsection 1 connects the grouped crop table to §2.9's per-work table, preventing the reader from treating them as redundant.
- **§2.13 structure**: four paragraphs with distinct rhetorical functions (what was done / what the reviewed works achieve / what they address less consistently / what the proposed system contributes) — no promotional tone, no exaggerated claims.

### Points to review before final submission

- **LaTeX float placement**: three large tables in §2.12 may stack across pages depending on page geometry. If the compiled PDF shows awkward float placement, add `\clearpage` between subsections or change `[H]` to `[htbp]` for the criterion comparison table.
- **§2.12 subsections are unnumbered** (`\subsection*{}`). This is appropriate for table-introduction text that does not warrant formal subsection numbers. If the committee expects numbered sub-subsections throughout Chapter 2, change to `\subsection{}` with labels.
- **"Other reviewed" column in feature matrix**: values are assessed from observable feature evidence in the literature. After metadata verification, individual confirmed works can be added as separate rows if the committee requires more granularity.
- **Word count balance**: Part B (§2.11–§2.13) adds ~1,370 words to Part A's ~3,380 words, bringing Chapter 2 to approximately 4,750 words of body text plus four tables. This is appropriate for a related-works chapter in an Algerian master thesis.

---

## 10. Phase 4 Readiness Assessment

Phase 4 is Chapter 3 — Design, Implementation, and Evaluation (§3.1–§3.17).

### What Phase 4 needs from Chapter 2

| Item | Status | Note |
|---|---|---|
| `chap:implementation` forward reference label | READY for Chapter 3 to define | Chapter 3 must open with `\chapter{...}\label{chap:implementation}` |
| `chap:background` forward reference (Ch3 may cite Ch1) | DEFINED in chapter1_background.tex | Use `\ref{chap:background}` freely in Chapter 3 |
| Gap statements for each dimension | COMPLETE | §2.11–§2.13 state all gaps; Chapter 3 implementation sections can reference these without re-arguing |
| Monitoring vs control distinction | ESTABLISHED across Ch1 + Ch2 | Chapter 3 must not claim autonomous irrigation or automatic agronomic decisions |
| EC calibration caveat | ESTABLISHED in §1.9.4 | Chapter 3 §3.x soil sensor section can reference it; no new calibration claim needed |
| Alfalfa crop requirements | ESTABLISHED in §§1.9–1.10 + §§2.10, 2.11 | Chapter 3 can reference "the monitoring requirements described in Chapter 1" without restating |
| AI boundary | ESTABLISHED in §2.8 and §2.11 | Chapter 3 backend section must implement and document this boundary |
| Upload time = metadata policy | ESTABLISHED in §2.6–§2.7 and §2.11 | Chapter 3 firmware and backend sections must implement `measured_at` policy consistently |
| `tab:feature-matrix` shows proposed system features | COMPLETE | Chapter 3 sections can cross-reference this table when implementing each feature |

### Phase 4 status: **READY TO PROCEED**

All Chapter 2 content is complete. The `.tex` file ends with:
```
% End of Chapter 2. Chapter 3 follows in chapters/chapter3_implementation.tex.
```

The next file to create is `chapters/chapter3_implementation.tex` with `\label{chap:implementation}` at the chapter heading.

---

## 11. Files Modified / Created in Phase 3

| File | Action | Content added |
|---|---|---|
| `chapters/chapter2_related_works.tex` | MODIFIED — §§2.11–2.13 appended | §2.11 (8 paragraphs), §2.12 (3 tables + bridge text), §2.13 (4 paragraphs) |
| `thesis_output/chapter2_part_b_quality_audit.md` | CREATED | This file |

### Files NOT modified (as required)

- `chapters/chapter1_background.tex` — untouched
- `thesis_output/chapter1_quality_audit.md` — untouched
- `thesis_output/chapter2_part_a_quality_audit.md` — untouched
- `Academic-Thesis/references.bib` — untouched
- `Academic-Thesis/data-field-policy.md` — untouched
- `Academic-Thesis/source-map.md` — untouched
- All firmware, backend, and dashboard files — untouched
