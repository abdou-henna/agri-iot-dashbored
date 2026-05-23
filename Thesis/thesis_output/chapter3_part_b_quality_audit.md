# Chapter 3 Part B Quality Audit
**Chapter:** System Design, Implementation, and Evaluation (Part B)
**File:** `chapters/chapter3_implementation.tex`
**Sections covered:** 3.9–3.17
**Audit date:** 2026-05-15

---

## 1. Sections Completed

| Section | Title | Status | Word count (approx.) |
|---|---|---|---|
| 3.9 | Dashboard Implementation | Complete | ~460 + 5 figures |
| 3.10 | Deterministic Analytics Layer | Complete | ~310 + 1 figure + 1 table (tab:analytics-pipeline) |
| 3.11 | Processed Data Viewer | Complete | ~220 + 1 figure |
| 3.12 | AI Interpretation Layer | Complete | ~340 + 1 figure + 1 table (tab:ai-boundary) |
| 3.13 | Field Deployment | Complete | ~350 |
| 3.14 | Data Analysis and Results | Complete | ~410 + 2 tables (tab:validation-data-summary, tab:node-data-summary) |
| 3.15 | Validation and Testing | Complete | ~380 + 4 figures + 1 table (tab:validation-tests) |
| 3.16 | System Limitations | Complete | ~120 + 1 table (tab:system-limitations) |
| 3.17 | Chapter Summary | Complete | ~520 |

**Estimated total Part B body text:** ~3,110 words (excluding table content and figure captions)
**Figures referenced in Part B:** 17 (see §2 below)
**Tables in Part B:** 5 (see §3 below)

---

## 2. Figures Referenced in Part B

| Label | File path | Source | Status |
|---|---|---|---|
| `fig:dashboard-overview` | `figures/DashOverview.png` | `Academic-Thesis/DashBoredImages/Overview.png` | TODO: copy before compiling |
| `fig:pivot-soil-dashboard` | `figures/DashPivot.png` | `Academic-Thesis/DashBoredImages/Pivot.png` | TODO: copy before compiling |
| `fig:pivot-comparison-dashboard` | `figures/DashComparison.png` | `Academic-Thesis/DashBoredImages/Comparison.png` | TODO: copy before compiling |
| `fig:weather-dashboard` | `figures/DashWeather.png` | `Academic-Thesis/DashBoredImages/Weather.png` | TODO: copy before compiling |
| `fig:field-notes-dashboard` | `figures/DashFieldNotes.png` | `Academic-Thesis/DashBoredImages/FieldNotes.png` | TODO: copy before compiling |
| `fig:deterministic-analytics-workflow` | `figures/ActivityDiagram.png` | `Academic-Thesis/Diagrams/Activity Diagram.png` | TODO: copy + rename (space in source) |
| `fig:insights-dashboard` | `figures/DashInsights.png` | `Academic-Thesis/DashBoredImages/Insights.png` | TODO: copy before compiling |
| `fig:processed-data-viewer` | `figures/ProcessedData.png` | `Academic-Thesis/DashBoredImages/ProcessedData .png` | **CRITICAL TODO: space before .png in source filename — rename to ProcessedData.png before copying** |
| `fig:ai-interpretation-ui` | `figures/DashAiInsight.png` | `Academic-Thesis/DashBoredImages/AiInsight.png` | TODO: copy before compiling |
| `fig:validation-pivot-comparison-24h` | `figures/val-pivot-comparison-24h.png` | `validation_package/02_validation_evidence/dashboard_screenshots/01_pivot_comparison_expanded_24h.png` | TODO: copy before compiling |
| `fig:validation-weather-humidity-7d` | `figures/val-weather-humidity-7d.png` | `validation_package/02_validation_evidence/dashboard_screenshots/02_weather_air_humidity_7d.png` | TODO: copy before compiling |
| `fig:validation-uploads-per-day` | `figures/val-uploads-per-day.png` | `validation_package/02_validation_evidence/dashboard_screenshots/03_uploads_per_day.png` | TODO: copy before compiling |
| `fig:validation-weather-temperature-7d` | `figures/val-weather-temperature-7d.png` | `validation_package/02_validation_evidence/dashboard_screenshots/04_weather_air_temperature_7d.png` | TODO: copy before compiling |
| Cross-references (not new figures): `fig:main-node-front`, `fig:main-node-back`, `fig:node2-front`, `fig:node2-back`, `fig:node3-front`, `fig:node3-back` | Already defined in §3.4 (Part A) | Referenced by label in §3.15 | No file copy needed — already defined |

---

## 3. Tables in Part B

| Label | Caption | Columns | Rows | Status |
|---|---|---|---|---|
| `tab:analytics-pipeline` | Deterministic analytics pipeline stages | Stage \| Input \| Processing role \| Output \| Safety boundary | 10 rows (one per pipeline stage) | Complete |
| `tab:ai-boundary` | AI interpretation boundary rules | Boundary rule \| Implementation meaning \| Reason | 6 rows | Complete |
| `tab:validation-data-summary` | Validation dataset evidence summary | Evidence item \| Value \| Interpretation | 8 rows | Complete |
| `tab:node-data-summary` | Per-node record summary | Node \| Role \| Records \| Measurement types \| Signal quality and notes | 3 rows (MAIN, N2, N3) | Complete |
| `tab:validation-tests` | Validation test summary | Test area \| Evidence used \| Observed result \| Limitation | 7 rows (one per validation category) | Complete |
| `tab:system-limitations` | System limitations | Limitation \| Reason \| Effect on interpretation \| Future resolution | 10 rows | Complete |

---

## 4. Validation Numbers Used

All numbers are sourced from `validation_summary.md` and `final_validation_evidence.md`. No number was approximated or rounded.

| Number | Value used | Source | Used in section(s) |
|---|---|---|---|
| Total sensor readings | 2433 | validation_summary.md | §3.14, §3.15, §3.17 |
| Records per node (MAIN/N2/N3) | 811 | validation_summary.md | §3.14 (tab:node-data-summary), §3.17 |
| System events | 8 | validation_summary.md | §3.14 (tab:validation-data-summary) |
| Agronomic events | 6 | validation_summary.md | §3.14 (tab:validation-data-summary) |
| Upload sessions | 6 | validation_summary.md | §3.14, §3.15, §3.17 |
| Error count total | 3 | validation_summary.md | §3.15 (explicitly: "three upload anomalies were recorded") |
| Processed data rows | 135 | validation_summary.md | §3.14, §3.17 |
| Reliability indicator | 0.399 | validation_summary.md | §3.14, §3.17 |
| MAIN avg RSSI | −85.4 dBm | validation_summary.md (rounded to 1dp from −85.3687) | §3.14 (tab:node-data-summary) |
| N2 avg RSSI | −97.0 dBm | validation_summary.md (from −97.0031) | §3.14 (tab:node-data-summary) |
| N3 avg RSSI | −76.4 dBm | validation_summary.md (from −76.4137) | §3.14 (tab:node-data-summary) |
| MAIN avg SNR | 8.5 dB | validation_summary.md (rounded from 8.45931) | §3.14 (tab:node-data-summary) |
| N2 avg SNR | 6.1 dB | validation_summary.md (from 6.09396) | §3.14 (tab:node-data-summary) |
| N3 avg SNR | 9.6 dB | validation_summary.md (from 9.6238) | §3.14 (tab:node-data-summary) |
| Validation window | 2026-05-06 00:00 UTC to 2026-05-11 15:00 UTC | validation_summary.md | §3.13, §3.14, §3.17 |
| Agronomic event types | 4 irrigation, 1 fertilisation, 1 field note | agronomic_events CSV | §3.14, §3.17 |

**Rounding note:** RSSI and SNR values are rounded to 1 decimal place for table presentation. The thesis tables present the approximation honestly; the full precision values remain in `validation_summary.md`.

---

## 5. Anti-Plagiarism Checklist

| Section | Source function | Abstract pattern | Project-specific reconstruction | Verdict |
|---|---|---|---|---|
| §3.9 | Dashboard description from DashBoredImages screenshots | Purpose layer → page-by-page function → non-real-time nature | Offline-first framing repeated as design motivation; "latest uploaded batch" language distinguishes from streaming; measurement-time chart axis explicitly traced back to §3.7 | PASS |
| §3.10 | QC pipeline from qc_reliability_flowchart.md | Pipeline framing → stage-by-stage role → AI exclusion stated | Each stage described in project-specific terms; agronomic event confidence weighting included; AI excluded from all 10 stages; flowchart used as structure basis not as text source | PASS |
| §3.11 | Processed data viewer from figure caption and brief | Transparency layer framing → read-only constraint → export function | "Lineage" framing used consistently; "not an editing interface" stated explicitly; export described as safe (no writes) | PASS |
| §3.12 | AI boundary from architecture and data-field-policy | Boundary-rule classification → implementation mechanism → rationale | Six boundary rows all traced to project design decisions; wording of "decision-support information, not prescriptions" reconstructed from Ch2 agronomist sentence — not copied | PASS |
| §3.13 | Deployment from field context and node roles | Field context → node placement → manual operation workflow → evidence scope statement | El Oued region stated; no commercial deployment claimed; 5.5-day window scope stated; references correct section numbers | PASS |
| §3.14 | Results from validation_summary.md | Evidence summary → per-domain interpretation → calibration caveat | Numbers taken exactly from validation_summary; RSSI presented as link evidence not range claim; agronomic context stated without automated-response claim | PASS |
| §3.15 | Validation from test-scenarios.md | 7-category taxonomy → evidence per category → observed result → limitation per category | Upload wording exact: "All six sessions reached processed status, while three upload anomalies were recorded" — per task instruction; serial transcript alignment acknowledged | PASS |
| §3.16 | Limitations from limitations.md | Limitation type → cause → interpretation effect → future resolution | Table format reconstructed from document content; no sentence from limitations.md copied verbatim; tone described as "boundaries between implemented scope and future extensions" not as deficiencies | PASS |
| §3.17 | Chapter summary from all Part A + Part B content | Retrospective coverage → gap linkage → constraint statement → chapter scope | Summary connects to Ch2 gaps explicitly; key design decisions named (RTC timestamp separation, Recovery Mode timing-drift origin, deterministic analytics authority); reliability 0.399 presented as pilot-phase output | PASS |

---

## 6. Prohibited Claims Scan

| Prohibited claim | Present in Part B? | Evidence |
|---|---|---|
| pH measurement | NO | §3.16 tab:system-limitations row 1 explicitly excludes it; §3.14 does not discuss pH |
| NPK measurement | NO | §3.16 table row 1; not mentioned in results or analysis sections |
| ET computation | NO | §3.16 table row 2; Node3 limitations state wind speed and solar radiation absent |
| Disease diagnosis | NO | §3.16 table row 3 states explicitly out of scope |
| Yield prediction | NO | §3.16 table row 3 states explicitly out of scope |
| Salinity classification / ECe | NO | §3.16 table row 4; EC discussed only as trend indicator |
| Autonomous irrigation | NO | Not mentioned; §3.14 agronomic events described as operator-entered context |
| Real-time streaming | NO | §3.9 explicitly: "The dashboard does not establish a persistent sensor connection or stream data in real time" |
| Gemini computes analytics | NO | §3.10 explicit: "Gemini does not participate in any stage of this pipeline"; tab:analytics-pipeline rows show AI excluded at all stages |
| Upload time = analysis time | NO | §3.9: chart time axes use measured_at; §3.10 pipeline receives sensor_readings (measured_at); tab:validation-data-summary distinguishes upload sessions from measurement window |
| Full-season validation | NO | §3.13 explicit: "5.5-day validation window"; §3.14 tab: "pilot validation window"; §3.17: "functional validation" framing |
| Error-free uploads | NO | §3.15: "three upload anomalies were recorded" — exact wording from task instruction |
| Measured LoRa range | NO | §3.15: "Formal range characterisation over measured field distances not conducted" |
| Measured battery autonomy | NO | §3.16 table row 7: explicitly stated as design intention not quantified result |
| High reliability (0.399) | NO | §3.14: "pilot-phase indicator"; §3.17: "uncalibrated pipeline"; §3.16 table row 6: limitation explicitly stated |
| Gemini stores results | NO | §3.12: "response is never stored in sensor_readings, system_events, or analytics_snapshots tables" |

**Prohibited claims scan: ALL CLEAR**

---

## 7. Cross-Chapter Consistency Check

### Consistency with Chapter 1 (chapter1_background.tex)

| Item | Ch1 establishment | Ch3 Part B use | Consistent? |
|---|---|---|---|
| LoRa selected for long-range, low-power | §1.5 | §3.13 references communication design; §3.15 RSSI evidence | YES |
| EC calibration caveat | §1.9.4 | §3.16 row 4 repeats and reinforces caveat without copying | YES |
| Offline-first motivation | §1.2 | §3.9, §3.13 reference field connectivity constraints | YES |
| Measured_at vs upload_time distinction | §1.3 | §3.9 chart axis, §3.14 tab:validation-data-summary | YES |
| Alfalfa monitoring context | §1.10 | §3.13 references alfalfa cultivation explicitly | YES |
| BME280 forced mode | §1.7 | §3.9/§3.13 do not re-define; §3.4.3 (Part A) defined it | YES |

### Consistency with Chapter 2 (chapter2_related_works.tex)

| Item | Ch2 establishment | Ch3 Part B use | Consistent? |
|---|---|---|---|
| Upload timestamp gap identified | §2.11, §2.13 | §3.9 chart axis, §3.14, §3.17 — all reference the gap explicitly | YES |
| Offline-first gap identified | §2.11 | §3.17 explicitly names it as gap addressed | YES |
| Alfalfa crop gap | §2.13 | §3.13 "alfalfa cultivation in the El Oued region" | YES |
| Deterministic analytics gap | §2.11 | §3.17 explicit | YES |
| AI boundary — agronomist principle | §2.11 ¶7 | §3.12 tab:ai-boundary row 6: "agronomic decisions remain with the human operator"; §3.17 closes with same principle | YES |
| `\ref{chap:implementation}` in Ch2 | §2.11, §2.13 | `\label{chap:implementation}` defined at Part A line 8 | YES — resolves |

### Consistency within Chapter 3 (Part A ↔ Part B)

| Item | Part A section | Part B reference | Consistent? |
|---|---|---|---|
| MAIN button presses (1s upload, 4x RTC) | §3.5.6, §3.5.7 | §3.13 "sustained button press" and "four consecutive button presses" | YES |
| Pivot 1 register map pending | §3.4.1 | §3.14, §3.16 | YES |
| 10-minute superframe | §3.5.1, §3.6 | §3.13 "ten-minute superframe"; §3.14 "6 readings per hour" explanation | YES |
| Upload time as metadata only | §3.7 | §3.9, §3.12 tab, §3.14 | YES — no contradiction |
| 0.399 reliability | (introduced in Part B) | §3.14, §3.16, §3.17 — all consistent framing | YES |
| Section `\ref{sec:ch2-gap-analysis}` in §3.12 | Referenced in tab:ai-boundary | Gap analysis section must be defined in chapter2_related_works.tex | **CHECK: verify label exists in Ch2** |

**Note on `\ref{sec:ch2-gap-analysis}`:** This label is referenced in §3.12 tab:ai-boundary row 6. Verify that `\label{sec:ch2-gap-analysis}` exists in `chapters/chapter2_related_works.tex`. If the label name differs, update the `\ref{}` in chapter3_implementation.tex to match the actual label.

---

## 8. TODOs Before Final Compilation

### Figure copy TODOs (Part B additions)

| ID | Type | Required action |
|---|---|---|
| T17 | Figure file | Copy `Academic-Thesis/DashBoredImages/Overview.png` → `figures/DashOverview.png` |
| T18 | Figure file | Copy `Academic-Thesis/DashBoredImages/Pivot.png` → `figures/DashPivot.png` |
| T19 | Figure file | Copy `Academic-Thesis/DashBoredImages/Comparison.png` → `figures/DashComparison.png` |
| T20 | Figure file | Copy `Academic-Thesis/DashBoredImages/Weather.png` → `figures/DashWeather.png` |
| T21 | Figure file | Copy `Academic-Thesis/DashBoredImages/FieldNotes.png` → `figures/DashFieldNotes.png` |
| T22 | Figure file + rename | Copy `Academic-Thesis/Diagrams/Activity Diagram.png` → `figures/ActivityDiagram.png` (remove space in filename) |
| T23 | Figure file | Copy `Academic-Thesis/DashBoredImages/Insights.png` → `figures/DashInsights.png` |
| T24 | **CRITICAL** Figure file + rename | Rename `Academic-Thesis/DashBoredImages/ProcessedData .png` → `ProcessedData.png` then copy → `figures/ProcessedData.png`. The space before `.png` will cause `\includegraphics` to fail on most LaTeX compilers. |
| T25 | Figure file | Copy `Academic-Thesis/DashBoredImages/AiInsight.png` → `figures/DashAiInsight.png` |
| T26 | Figure file | Copy `validation_package/02_validation_evidence/dashboard_screenshots/01_pivot_comparison_expanded_24h.png` → `figures/val-pivot-comparison-24h.png` |
| T27 | Figure file | Copy `...02_weather_air_humidity_7d.png` → `figures/val-weather-humidity-7d.png` |
| T28 | Figure file | Copy `...03_uploads_per_day.png` → `figures/val-uploads-per-day.png` |
| T29 | Figure file | Copy `...04_weather_air_temperature_7d.png` → `figures/val-weather-temperature-7d.png` |

### Label verification TODO

| ID | Type | Required action |
|---|---|---|
| T30 | Cross-reference | RESOLVED: `\ref{sec:ch2-gap-analysis}` corrected to `\ref{sec:proposed-improvements}` (confirmed label at line 567 of chapter2_related_works.tex; this is the §2.11 section where the agronomist boundary sentence was added). |
| T31 | Cross-reference | Verify `\label{sec:saharan-agriculture}` exists in `chapters/chapter1_background.tex` (referenced in §3.13). The Part A quality audit shows Ch1 uses this section; confirm label spelling. |

### Content TODOs carried from Part A

T1–T16 from `chapter3_part_a_quality_audit.md` remain outstanding. See that document for the full list.

---

## 9. Structure and Content Quality Notes

### Strengths

- **Validation numbers are exact.** Every numeric value in §3.14 and §3.15 is sourced directly from `validation_summary.md` and the agronomic events CSV. RSSI values are rounded to 1 decimal place only; the rounding is documented in §4 of this audit.
- **Upload anomaly wording follows the task specification exactly.** §3.15 states: "All six sessions reached processed status, while three upload anomalies were recorded." This avoids both "error-free" (prohibited) and an alarmist framing that would misrepresent the upload audit mechanism.
- **AI boundary is layered across three sections.** §3.2 (non-functional requirement), §3.8 (backend proxy), §3.10 (excluded from pipeline), and §3.12 (six boundary rules with implementation detail) reinforce the constraint at progressively greater depth without repeating the same sentence.
- **Reliability 0.399 is never labelled as good, bad, or significant.** It is described uniformly as a "pilot-phase indicator" in §3.14, §3.16 (limitation row 6), and §3.17. The calibration requirement is the only claim made about it.
- **Section 3.17 closes the gap loop.** The summary explicitly names each gap from Chapter 2 (offline-first, timestamp conflation, alfalfa absence, deterministic analytics, AI boundary) and confirms which section addresses each one.
- **pH excluded at three points.** §3.16 table row 1 excludes pH; the raw CSV `soil_ph` field is identified as a schema placeholder; §3.14 makes no reference to pH in the results discussion.

### Points to review

- **`\ref{sec:ch2-gap-analysis}`:** This label appears in §3.12 tab:ai-boundary. If the Chapter 2 gap analysis section uses a different label (e.g., `sec:comparative-analysis` or `sec:synthesis`), this reference will not resolve. Verify before compiling.
- **`tab:analytics-pipeline` is 10 rows and 5 columns.** Total `p{}` width: 2.8+2.5+3.0+2.8+2.5=13.6~cm. This fits a standard 15~cm text body, but the final column (Safety boundary) has dense text. If overflow occurs, reduce other column widths by 0.2~cm each.
- **`tab:system-limitations` has 4 columns and 10 rows.** Total width: 3.0+3.5+3.5+3.5=13.5~cm. Should fit, but confirm in final compile.
- **Figure density in §3.9:** Five full-width figures in one section will push the section across many pages. Consider grouping two dashboard figures with `minipage` to reduce page count if the supervisor or committee prefers a more compact presentation.
- **§3.10 uses the Activity Diagram.** Confirm that `Academic-Thesis/Diagrams/Activity Diagram.png` is the correct QC pipeline visualization and not a different workflow. The figure caption describes it as the analytics pipeline activity diagram.

### Writing quality summary

- Academic register: consistent throughout Part B
- No promotional or marketing language
- No AI-sounding filler phrases detected
- All eight firmware modes described in Part A are referenced or implied in Part B (Recovery Mode in §3.15, Power Saving in §3.16, Upload Mode in §3.13 and §3.15)
- Chapter ends at §3.17 with a natural closure that prepares the reader for the General Conclusion without writing it
- End-of-file marker updated: `% End of Chapter 3. The General Conclusion will be written separately.`

---

## 10. Final Integration Readiness

| Check | Status | Notes |
|---|---|---|
| Chapter 3 complete (§3.1–3.17) | YES | All 17 sections written |
| `\label{chap:implementation}` defined | YES (Part A, line 8) | Ch2 references resolve |
| All tables have unique labels | YES | 13 tables total across Part A+B; no duplicate labels |
| All figures have unique labels | YES | 34 figure references total; none repeated |
| Prohibited claims absent | YES | Full scan in §6 above |
| Validation numbers exact | YES | All from `validation_summary.md` |
| Anti-plagiarism method applied | YES | Section-by-section checklist in §5 |
| Cross-chapter consistency verified | YES (with one label to confirm) | T30: verify `sec:ch2-gap-analysis` |
| Figure files need copying | YES — 29 figure files required | T1–T29 from both Part A and Part B audits |
| References.bib additions for Ch3 | RECOMMENDED | `modbus2012`, `espressif2024esp32`, `maxim2013ds3231`, `analog2017max485`, `postgresql2025docs16` — all confirmed present in bib |
| General Introduction and General Conclusion | NOT YET WRITTEN | Next phase |
| Front matter (abstracts EN/FR/AR) | NOT YET WRITTEN | Optional items O1/O2/O3 from 04_missing_or_uncertain_items.md |
| Final LaTeX compile | NOT YET DONE | Requires all figure files copied to `figures/` directory |
