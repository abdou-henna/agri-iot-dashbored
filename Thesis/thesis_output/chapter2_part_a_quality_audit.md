# Chapter 2 Part A Quality Audit
**Chapter:** Related Works and Comparative Analysis
**File:** `chapters/chapter2_related_works.tex`
**Scope:** Sections 2.1–2.10 (Part A only; §2.11–§2.13 reserved for Phase 3)
**Audit date:** 2026-05-14

---

## 1. Sections Completed

| Section | Title | Status | Word count (approx.) |
|---|---|---|---|
| 2.1 | Chapter Introduction | Complete | ~210 |
| 2.2 | IoT-Based Agricultural Monitoring Systems | Complete | ~440 |
| 2.3 | Wireless Communication in Agricultural IoT | Complete | ~340 |
| 2.4 | Soil and Environmental Data Collection Systems | Complete | ~350 |
| 2.5 | Energy Management and Field Reliability | Complete | ~380 |
| 2.6 | Offline Storage and Upload Strategies | Complete | ~310 |
| 2.7 | Time Synchronization and Data Integrity | Complete | ~380 |
| 2.8 | Dashboards, Analytics, and AI Interpretation | Complete | ~390 |
| 2.9 | Previous Crop Targets in Existing Works | Complete | ~200 + table |
| 2.10 | The Alfalfa Monitoring Gap | Complete | ~380 |

**Estimated total Part A body text:** ~3,380 words (excluding table content)
**Tables included:** 1 (`tab:related-work-crop-focus` — 10 rows, §2.9)
**Figures included:** 0 (no figures in Part A; comparative figures are in §2.11–§2.13)

---

## 2. References Used

### Confirmed references (safe to cite — metadata verified)

| Key | Section(s) | Use |
|---|---|---|
| `ahmed2022lora_agriculture_chile` | §2.1, §2.2, §2.3, §2.5, §2.6, §2.7, §2.8, §2.9 | Primary comparison work — LoRa platform, Chile; communication layer, upload design |
| `pereira2023esp32_drip_irrigation` | §2.1, §2.2, §2.4, §2.5, §2.6, §2.7, §2.8, §2.9 | Primary comparison work — ESP32 drip irrigation; sensing, monitoring vs control distinction |
| `saban2023smart_agricultural_lora_cloud` | §2.1, §2.2, §2.3, §2.5, §2.6, §2.7, §2.8, §2.9 | Primary comparison work — PLC+LoRaWAN+cloud; cloud-first architecture critique |
| `ayaz2019iot_smart_agriculture_survey` | §2.2, §2.4, §2.9 | Three-layer IoT architecture survey; soil moisture monitoring context |
| `farooq2019iot_smart_agriculture_review` | §2.2, §2.9 | IoT smart farming review; broad architectural background |
| `teh2020sensor_data_quality` | §2.4 | Data completeness and consistency quality dimensions |
| `dandrifosse2024weather_qc_agriculture` | §2.7 | Timestamp integrity in agricultural data QC; measurement vs processing time |

**Count: 7 confirmed references**

### Unverified references (TODO markers in .tex — must verify before submission)

| Key | Section | Marker in .tex | Status |
|---|---|---|---|
| `iot_protocols_precision_agriculture_outdoor` | §2.3 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `lloret2021soil_moisture_wsn` | §2.4, §2.9 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `cheap_practical_iot_agri_monitoring` | §2.4, §2.9 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `abbaari2024data_collection_iot_networks` | §2.5, §2.9 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `rajak2023iot_smart_sensors_agriculture` | §2.5, §2.9 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `villa2020iot_arable_farming` | §2.9 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |
| `iot_enhancements_algerian_desert_agriculture` | §2.10 | `% TODO: verify bibliographic metadata` | Unverified — do not cite without metadata |

**Count: 7 unverified references (all carry inline TODO markers immediately after their `\cite{}` call)**

### Not used in Chapter 2 Part A (reserved for later chapters or unused)

| Key | Why not used |
|---|---|
| `gubbi2013iot_vision` | IoT concept definition — established in Chapter 1; not needed again in Ch2 |
| `semtech2020sx127x_datasheet` | LoRa hardware specification — belongs in Chapter 3 |
| `loraalliance2020lorawan_104` | LoRaWAN protocol spec — belongs in Chapter 3 |
| `bosch2024bme280_datasheet` | BME280 implementation detail — Chapter 3 |
| `espressif2024esp32_datasheet` | ESP32 hardware — Chapter 3 |
| `maxim2013ds3231_datasheet` | DS3231 RTC — Chapter 3 |
| `fao_alflafa_crop_water` | Alfalfa agronomics established in Chapter 1 |
| `mueller2007alfalfa_growth_development` | Alfalfa cut cycles established in Chapter 1 |
| `irmak2007irrigation_alfalfa` | Alfalfa water requirements — Chapter 1 |
| `orloff2015drought_strategies_alfalfa` | Drought strategies — Chapter 1 |
| `wassie2019heat_stress_alfalfa` | Heat stress — Chapter 1 |
| `nrcs1999soil_electrical_conductivity` | EC salinity — Chapter 1 |
| `benabdelouahab2019sensor_calibration_5te` | EC calibration — Chapter 1 |

---

## 3. TODOs Before Final Submission

| ID | Type | Location in .tex | Required action |
|---|---|---|---|
| T1 | Reference verification | §2.3, after `\cite{iot_protocols_precision_agriculture_outdoor}` | Verify author, title, journal, year, DOI from professor-provided PDF |
| T2 | Reference verification | §2.4, §2.9, after `\cite{lloret2021soil_moisture_wsn}` | Verify from `sensors-21-07243-v2.pdf` — full title, authors, volume, pages |
| T3 | Reference verification | §2.4, §2.9, after `\cite{cheap_practical_iot_agri_monitoring}` | Verify full bibliographic metadata from professor-provided PDF |
| T4 | Reference verification | §2.5, §2.9, after `\cite{abbaari2024data_collection_iot_networks}` | Verify full bibliographic metadata from professor-provided PDF |
| T5 | Reference verification | §2.5, §2.9, after `\cite{rajak2023iot_smart_sensors_agriculture}` | Verify full bibliographic metadata from professor-provided PDF |
| T6 | Reference verification | §2.9, after `\cite{villa2020iot_arable_farming}` | Verify volume, pages, DOI from Biosystems Engineering |
| T7 | Reference verification | §2.10, after `\cite{iot_enhancements_algerian_desert_agriculture}` | Verify full bibliographic metadata from professor-provided PDF |
| T8 | Table label [TODO] markers | §2.9, table rows for unverified works | After metadata verification, remove `[TODO]` text from table row entries and clean citation display |
| T9 | Phase 3 continuation | End of file comment | Sections §2.11–§2.13 (proposed system improvements, comparative table, chapter summary) must be written in Phase 3 |

---

## 4. Anti-Plagiarism Checklist

The four-stage reconstruction method (source → rhetorical function → abstract pattern → project-specific reconstruction) was applied to every section. No source sentences were preserved.

| Section | Source function identified | Abstract pattern applied | Project-specific reconstruction | Verdict |
|---|---|---|---|---|
| §2.1 | Literature review introduction: frame scope, state comparison method, identify primary works | Transition from Ch1 → scope statement → seven dimensions announced → primary works identified → unverified works flagged | El Oued context referenced; seven dimensions named explicitly; ahmed/pereira/saban named; unverified sources noted without overstating their role | PASS |
| §2.2 | System architecture review: dominant three-layer pattern, then paper-specific limitations | General convergence → three representative systems → per-system contribution summary → shared limitation identified | ESP32 framed as embedded choice with tradeoffs; Ahmed as scale/network; Saban as cloud-first; common gap = data governance, not sensing | PASS |
| §2.3 | Communication technology justification: confirm LoRa, then push from feasibility to reliability | LoRa confirmed → feasibility vs reliability distinction → missed packet consequence → application-level reliability requirements | "Ninety percent / ten percent" formulation is original reasoning; ACK + event log + recovery procedure as distinct from communication layer — project-specific design reasoning | PASS |
| §2.4 | Soil monitoring: measurement focus vs data lifecycle | Soil moisture as primary variable → sensing + topology works cited with TODO → shared gap = data organization after arrival → multi-source data problem → monitoring vs control | Teh2020 cited for quality dimensions as principle, not copied; irrigation-coupling critique framed around proposed system's separation principle | PASS |
| §2.5 | Energy and reliability: hardware → firmware → recovery → logging | Hardware selection → duty cycle implication → timing desynchronization distinction → diagnostic logging | "Timing desynchronization vs temporary packet loss" is a project-specific distinction, not borrowed from any reviewed work; RECOVERY MODE introduced at principle level | PASS |
| §2.6 | Offline storage: cloud-first assumption → offline-first inversion | Connectivity assumption in reviewed works → consequence of gaps → offline-first design inversion → upload as explicit operator action | "Server-side record is a subset of the local record" is a reconstruction of the project's actual architecture stated as a principle, not from any cited source | PASS |
| §2.7 | Timestamp semantics: measurement vs upload time | Every record carries a timestamp → meaning depends on definition → dandrifosse cited for agricultural QC context → reviewed works don't foreground this → active approach required | RTC module and clock synchronization as design choices stated at principle level; "authoritative field-assigned measurement timestamps" phrasing is project-specific | PASS |
| §2.8 | Dashboard and AI: raw display vs analytics layer → AI boundary | Dashboards in all three works → raw display vs processed analytics distinction → traceability rationale → AI boundary question → interpretation-only positioning | "The AI component receives the outputs of deterministic steps and provides a narrative explanation" is the project's explicit design, not adapted from any reviewed source | PASS |
| §2.9 | Crop context survey: table summarizing crop focus | No alfalfa in reviewed works → observation of general intent → gap introduced through table + explanation | Table constructed from project context and verified review of each cited work; all 10 rows are factually grounded in what each cited work targets | PASS |
| §2.10 | Gap identification: crop + technical gaps together | Monitoring requirement specificity → alfalfa-specific design needs → absence in reviewed works → combined technical and crop gap | "Stated with care: it reflects the scope of this literature review, not a claim about all published work globally" — original hedging formulation; six-element gap summary is project-derived | PASS |

---

## 5. Prohibited Claims Scan

### From `03_claims_to_avoid.md` — verified against Part A text

| Prohibited claim | Present in Part A? | Evidence |
|---|---|---|
| pH measurement | NO | Not mentioned anywhere |
| NPK measurement | NO | Not mentioned anywhere |
| Official salinity class / ECe conversion | NO | Not mentioned anywhere |
| Evapotranspiration computation | NO | Not mentioned anywhere; weather variables not listed as ET-capable |
| Disease diagnosis | NO | Not mentioned anywhere |
| Yield prediction | NO | Not mentioned anywhere |
| Automatic irrigation prescription | NO | §2.4 explicitly critiques tight coupling of measurement to actuation; monitoring vs control distinction maintained |
| Upload time = analysis time | NO | §2.7 explicitly establishes that upload timestamp ≠ measurement timestamp; dandrifosse2024 cited to support this |
| Upload time implies data freshness | NO | Not claimed; §2.6 describes offline-first model where server-side record is a subset of local record |
| Gemini computes analytics | NO | §2.8 states: "AI component receives the outputs of deterministic steps and provides a narrative explanation. It does not compute primary metrics, fill missing measurements, or override reliability assessments." |
| Gemini as authoritative output | NO | §2.8 explicitly frames AI as interpretation-only with deterministic metrics as authoritative |
| Gemini fills missing data | NO | Not claimed anywhere |
| Full-season agronomic validation | NO | Not claimed in Part A; validation is a Chapter 3 topic |
| Error-free upload | NO | Not mentioned in Part A |
| Reliability of 0.399 as high/ideal | NO | Reliability scoring is mentioned as an analytics concept; the 0.399 result is a Chapter 3 topic |
| Warning-free software build | NO | Not claimed anywhere |
| Citing unverified references as fact | NO | All 7 unverified references have explicit `% TODO: verify bibliographic metadata` comments; no numerical or factual claims are drawn from them |
| Commercial deployment claim | NO | Not made; system described as design response to identified gaps |
| Real-time guarantee | NO | Not claimed; §2.6 frames the upload model as operator-controlled and offline-first |

**Prohibited claims scan: ALL CLEAR**

---

## 6. Citation Integrity

| Check | Status | Notes |
|---|---|---|
| All `\cite{}` keys for confirmed references exist in `references.bib` / `references_updated.bib` | PASS | All 7 confirmed keys are present in the bib files |
| Unverified references have TODO comments in .tex | PASS | 7 unverified references each have an inline `% TODO` comment immediately after the `\cite{}` call |
| No numerical results borrowed from references | PASS | No accuracy %, range figures, or latency numbers from any reference are presented as this project's own results |
| Citations placed near claims, not decoratively | PASS | Each `\cite{}` appears at the sentence where the referenced work's contribution is introduced |
| Table rows for unverified works flagged with [TODO] text | PASS | §2.9 table includes `[TODO]` in the Work column for all 5 unverified entries |
| No self-citation of project files as academic references | PASS | No citations to dashboard screenshots, firmware code, validation CSVs, or project-internal evidence |
| Monitoring vs control distinction maintained | PASS | §2.4 and §2.8 both explicitly preserve this distinction; no automatic actuation is claimed for the proposed system |

---

## 7. Relation to Chapter 1

Chapter 2 Part A builds on Chapter 1's foundations in the following ways:

| Item established in Chapter 1 | How Chapter 2 Part A uses it |
|---|---|
| §1.5: LoRa justification (comparison table, spreading factor, range) | §2.3 confirms LoRa as established; builds beyond feasibility to the reliability and recovery layer |
| §1.6: Gateway-based star topology | §2.2 assumes this as background; critique of reviewed works focuses on layers above the topology, not the topology itself |
| §1.3: Timestamp semantics (measured_at vs upload_time) | §2.7 makes this the central argument of the section; cites dandrifosse2024 to reinforce the principle |
| §1.4: Monitoring vs control distinction | §2.4 and §2.8 explicitly invoke this distinction to position the proposed system against irrigation-automation works |
| §1.8: Reliability and recovery in IoT | §2.5 extends this to the literature review, identifying that reviewed works do not foreground timing desynchronization or recovery procedures |
| §1.9–§1.10: Alfalfa gap and monitoring requirements | §2.9 and §2.10 use the crop monitoring requirements from Ch1 as the basis for identifying the gap in the reviewed literature |
| §1.7: Low-power design (deep sleep, relay power control) | §2.5 frames energy management in the reviewed works in terms that set up the proposed system's Power Saving Mode without describing the implementation |
| §2.6: Offline-first model previewed | §1.2 introduced unstable power/connectivity as a Saharan field constraint; §2.6 makes this the design motivation for offline-first storage |

No content established in Chapter 2 Part A was introduced in Chapter 1 (no backward contamination). The chapter correctly references §1.2 (Saharan agriculture) and §1.9–§1.10 (alfalfa monitoring summary) without restating their content at length.

---

## 8. Phase 3 Readiness Assessment

### What §2.11–§2.13 require

**§2.11 — Proposed System Improvements**
A structured list of what the proposed system offers beyond the reviewed works, organized around the seven comparison dimensions established in §2.1. The groundwork is fully laid: each dimension has been analyzed in §2.2–§2.8, with the gap explicitly stated at the end of each section. Phase 3 can compose this section by drawing directly from those stated gaps.

**§2.12 — Comparative Analysis Table (Feature Matrix)**
A cross-work feature matrix comparing ahmed2022 / pereira2023 / saban2023 / proposed system across dimensions: communication, offline storage, timestamp semantics, QC layer, AI integration, crop target, deployment context. The `related_work_comparison_3_studies.md` source file in `Academic-Thesis/` provides the raw comparison data for the three confirmed works. Phase 3 must align the table columns with the seven dimensions from §2.1 and use the proposed system row to surface all identified gaps.

**§2.13 — Chapter Summary**
Summarize what the seven-dimension analysis established, restate the combined crop + technical gap from §2.10 concisely, and transition to Chapter 3 where the proposed system's design and implementation are described.

### Readiness verdict

| Phase 3 task | Groundwork laid? | Blocking items |
|---|---|---|
| §2.11 improvement list | YES — all seven dimensions analyzed with gap statements | None |
| §2.12 comparative table | YES — three primary works analyzed; feature matrix content derivable from Part A | Must resolve whether to include all 7 unverified works in table rows or only confirmed 3 + proposed |
| §2.13 chapter summary | YES — clear summary of what each section established | None |
| Table source | YES — `related_work_comparison_3_studies.md` provides comparison data | Must align old table structure with three-chapter plan numbering |
| Figure placement | YES — `08_figures_tables_placement_plan.md` specifies which figures go in §2.11–§2.13 | No figures in Part A; figures (if any) are in §2.12 table or §2.11 discussion |
| Unverified TODO references | PARTIALLY — 7 TODO markers present; not blocking Phase 3 writing | Metadata verification still pending; text must continue to use confirmed references as primary |

**Phase 3 status: READY TO PROCEED**

---

## 9. Writing Quality Notes

### Strengths

- **Thematic organization is coherent:** seven comparison dimensions are announced in §2.1 and each maps to one section (§2.2–§2.8). The reader always knows where they are in the argument.
- **Three primary works are analyzed across all relevant sections:** ahmed2022, pereira2023, and saban2023 appear in §2.2, §2.3, §2.4, §2.5, §2.6, §2.7, §2.8, and §2.9 — this provides depth of analysis, not just breadth of citation.
- **AI boundary is stated with precision in §2.8:** "It does not compute primary metrics, fill missing measurements, or override reliability assessments" — covers all three prohibited AI claims without being defensive or legalistic.
- **Timestamp semantics gap in §2.7** is the strongest technical gap argument: it identifies a concrete design absence in the reviewed works, provides a literature anchor (dandrifosse2024), and states the proposed approach without implementing it.
- **Gap statement in §2.10** is carefully hedged: "Within the works reviewed for this thesis" and "This observation is stated with care: it reflects the scope of this literature review, not a claim about all published work globally" — no exaggerated global claim.
- **Monitoring vs control distinction** carried through from Chapter 1 into §2.4 and §2.8 without restating the Chapter 1 argument.

### Points to review before Phase 3

- **§2.9 table `[TODO]` entries:** Five rows in `tab:related-work-crop-focus` have `[TODO]` markers in the Work column and inline TODO comments inside the table body. After metadata verification, these must be cleaned before final PDF compilation.
- **§2.3 iot_protocols reference:** This reference currently functions as a supporting mention at the end of the section. If metadata cannot be verified, the sentence it supports can be removed without weakening the section's primary argument.
- **§2.5 abbaari2024 and rajak2023:** Both are used as supporting context for the reliability concern being a recognized IoT problem. If neither can be verified, the paragraph that cites them can be removed; the section's core argument (timing desynchronization gap) does not depend on them.
- **Sentence rhythm:** The chapter uses varied sentence lengths. §2.7 in particular runs two consecutive complex sentences at the end of the third paragraph. A human proofreading pass is recommended before submission.

### Writing quality summary

- Academic register: consistent throughout
- No promotional or marketing language detected
- No AI-sounding filler phrases detected ("it is worth noting", "it is important to highlight", "in conclusion it can be said" — none present)
- No forward contamination: Chapter 2 does not reveal implementation details, validation results, or specific firmware behavior; these are reserved for Chapter 3
- Transitions between sections are explicit and carry the argument forward
- §2.1 previews all ten sections accurately by dimension

---

## 10. Compatibility Notes for Later Sections and Chapter 3

| Item | Note for §2.11–§2.13 | Note for Chapter 3 |
|---|---|---|
| Seven comparison dimensions established | §2.11 can list proposed improvements organized by dimension without re-explaining the dimensions | Chapter 3 implements the design; each improvement listed in §2.11 should be traceable to a Chapter 3 section |
| Offline-first model described | §2.13 summary can cite this as the primary architectural choice | Chapter 3 §3.x (offline storage) must implement and validate this model |
| RTC-governed timestamp semantics | §2.11 can cite "authoritative field-assigned measurement timestamps" as a gap the proposed system fills | Chapter 3 §3.x (time synchronization) must describe DS3231, synchronization procedure, and measured_at propagation |
| AI as interpretation-only | §2.12 feature matrix should include an AI/analytics column; proposed system row = "interpretation only, bounded" | Chapter 3 §3.x (AI backend proxy) must implement and document this boundary |
| Deterministic analytics layer | §2.12 feature matrix column; gap confirmed in §2.8 | Chapter 3 §3.x (analytics pipeline) is the implementation response |
| Alfalfa + Saharan context gap | §2.13 summary states the combined gap; no implementation detail needed | Chapter 3 §3.13 (deployment context) and §3.16 (agronomic analytics) validate the alfalfa-specific design |
| Monitoring vs control distinction | Maintained through all Part A sections | Chapter 3 must not claim automatic irrigation; decision support role must be stated clearly |
