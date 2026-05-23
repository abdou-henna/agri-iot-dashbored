# Chapter Generation Plan

Three-chapter supervisor-required structure. Writing order follows the execution plan in `thesis_planning/12_writing_execution_plan.md`.

---

## Thesis Architecture

```
Front Matter
  Title Page
  Acknowledgements
  Abstract (English)
  Résumé (French)
  ملخص (Arabic)
  Table of Contents
  List of Figures
  List of Tables
  List of Abbreviations

General Introduction
  §1  Smart agriculture context
  §2  Saharan/field monitoring constraints
  §3  Alfalfa: importance and selection rationale
  §4  Problem statement
  §5  Engineering objectives
  §6  Proposed solution overview
  §7  Main contributions
  §8  Thesis organization

Chapter 1 — Background and Theoretical Foundations
Chapter 2 — Related Works and Comparative Analysis
Chapter 3 — System Design, Implementation, and Evaluation

General Conclusion
  §1  Restate objectives
  §2  IoT architecture summary
  §3  Firmware mode contributions
  §4  Dashboard, analytics, AI layer summary
  §5  Validation scope and limitations
  §6  Future work

References
Appendices (A–G)
```

---

## Chapter 1 — Background and Theoretical Foundations

**Purpose:** Build the scientific and technical base. No implementation details. References used heavily.

| Section | Title | Evidence sources | Key references |
|---|---|---|---|
| 1.1 | Chapter Introduction | — | — |
| 1.2 | Saharan Agriculture Context | IoTSystem context docs | hadeid, desert_food_security, wadi_souf (unverified) |
| 1.3 | Data Collection in Agriculture | data-field-policy, IoTSystem/iot_data_system_design | teh2020, dandrifosse2024 |
| 1.4 | Smart Agriculture and IoT | project understanding map | gubbi2013, ayaz2019, farooq2019 |
| 1.5 | IoT Communication Technologies | SystemImage/LoRa.png | semtech2020, loraalliance2020, iot_protocols (unverified) |
| 1.6 | IoT Network Topologies | overall diagram (conceptual) | villa2020 (unverified) |
| 1.7 | Low-Power Operation in Field IoT | Relay.png, Bme280.png, DcConv.png | IoT data collection refs |
| 1.8 | Reliability and Fault Recovery in IoT | IoTSystem/recovery docs | abbaari2024 (unverified) |
| 1.9 | Alfalfa Crop Background | — | fao_alflafa, mueller2007, irmak2007, orloff2015, wassie2019 |
| 1.10 | Why Alfalfa Was Selected | project understanding map | alhamdani1990, benabdelouahab2019 |
| 1.11 | Chapter Summary | — | — |

**Planned Chapter 1 figures:**

| Figure | File | Label |
|---|---|---|
| LoRa module | `SystemImage/LoRa.png` | `fig:lora-module-ch1` |
| Relay (optional) | `SystemImage/Relay.png` | `fig:relay-power-control-ch1` |
| BME280 (optional) | `SystemImage/Bme280.png` | `fig:bme280-sensor-ch1` |

**Planned Chapter 1 tables:**

| Table | Purpose | Label |
|---|---|---|
| IoT communication comparison | Compare WiFi/BT/Zigbee/GSM/LoRa | `tab:iot-communication-comparison` |
| Alfalfa monitoring requirements | Crop monitoring needs and relevant sensors | `tab:alfalfa-monitoring-needs` |

---

## Chapter 2 — Related Works and Comparative Analysis

**Purpose:** Critical thematic comparison of selected works. Identify gaps. Transitions to Chapter 3 proposal.

| Section | Title | Main references |
|---|---|---|
| 2.1 | Chapter Introduction | — |
| 2.2 | IoT-Based Agricultural Monitoring Systems | ahmed2022, pereira2023, cheap_practical (unverified) |
| 2.3 | Wireless Communication in Agricultural IoT | saban2023, iot_protocols (unverified), loraalliance2020 |
| 2.4 | Soil and Environmental Data Collection | lloret2021 (unverified), abbaari2024 (unverified) |
| 2.5 | Energy Management and Field Reliability | rajak2023 (unverified), IoT reliability refs |
| 2.6 | Offline Storage and Upload Strategies | ahmed2022, project architecture (for gap) |
| 2.7 | Time Synchronization and Data Integrity | All selected works + project policy (gap) |
| 2.8 | Dashboards, Analytics, and AI Interpretation | saban2023, pereira2023 |
| 2.9 | Previous Crop Targets in Existing Works | All selected works |
| 2.10 | Crop-Specific Gap: Alfalfa | All selected works |
| 2.11 | Proposed System Improvements | project understanding map |
| 2.12 | Comparative Analysis Tables | related_work_comparison_3_studies.md + selection matrix |
| 2.13 | Chapter Summary | — |

**Planned Chapter 2 tables (mandatory):**

| Table | Purpose | Label |
|---|---|---|
| Crop focus in previous works | Show no work targets alfalfa specifically | `tab:related-work-crop-focus` |
| Full comparative analysis | Work vs. our project across multiple dimensions | `tab:related-work-comparison` |
| Feature matrix | Binary feature presence: LoRa/offline/RTC/recovery/power-saving/QC/AI-boundary/alfalfa | `tab:feature-matrix` |

**Anti-plagiarism anchor:** For every related work, use the four-stage reconstruction method:
source → rhetorical function → abstract pattern → project-specific reconstruction.
The three confirmed works (ahmed2022, pereira2023, saban2023) have detailed comparison tables already prepared in `related_work_comparison_3_studies.md`.

---

## Chapter 3 — System Design, Implementation, and Evaluation

**Purpose:** Full implemented system. Uses project files as primary evidence. References minimal (mainly datasheets/standards).

### Part A: §3.1–§3.8 (Hardware, Firmware, Backend)

| Section | Title | Primary evidence | Key figures/tables |
|---|---|---|---|
| 3.1 | Chapter Introduction | chapter briefs | — |
| 3.2 | System Requirements | source-map, data-field-policy | `tab:system-requirements` |
| 3.3 | General System Architecture | overall diagram, data flow diagram | `fig:overall-system-architecture`, `fig:data-flow-diagram` |
| 3.4.1 | MAIN ESP32 Gateway | MainNodeFront/Back, MainNodeWiringDiagram | `fig:main-node-front/back`, `fig:main-node-wiring`, `tab:hardware-components` |
| 3.4.2 | Node2 Remote Soil Node | SecondNodeFront/Back, Node2WiringDiagram, SoilSensor, Max485, Relay | `fig:node2-front/back`, `fig:node2-wiring` |
| 3.4.3 | Node3 Weather Node | WatherNodeFront/Back, WatherNodeWiringDiagram, Bme280 | `fig:weather-node-front/back`, `fig:weather-node-wiring` |
| 3.5 | Firmware Operating Modes | State Machine Diagram, IoTSystem/*.md | `fig:firmware-state-machine`, `tab:firmware-operating-modes` |
| 3.6 | Communication Design | Sequence Diagrams, LoRa.png | `fig:system-sequence-diagram` |
| 3.7 | Data Storage and Time Policy | data-field-policy, iot_data_system_design | `tab:data-domains-time-fields` |
| 3.8 | Backend Implementation | DatabaseERDDiagram, upload_api_listing | `fig:database-erd`, `tab:database-tables`, `tab:api-endpoints` |

### Part B: §3.9–§3.17 (Dashboard, Analytics, Validation)

| Section | Title | Primary evidence | Key figures/tables |
|---|---|---|---|
| 3.9 | Dashboard Implementation | DashBoredImages/*.png | `fig:dashboard-overview`, `fig:pivot-soil`, `fig:comparison`, `fig:weather`, `fig:field-notes` |
| 3.10 | Deterministic Analytics Layer | Activity Diagram, qc_reliability_flowchart | `fig:activity-diagram`, `tab:qc-rules`, `tab:reliability-factors` |
| 3.11 | Processed Data Viewer | ProcessedData .png | `fig:processed-data-viewer` |
| 3.12 | AI Interpretation Layer | AiInsight.png | `fig:ai-interpretation-ui` |
| 3.13 | Field Deployment | Node photos, validation context | All node front/back photos |
| 3.14 | Data Analysis and Results | validation CSVs, processed data | Inline tables from validation summary |
| 3.15 | Validation and Testing | final_validation_evidence, validation screenshots | `fig:validation-*` (4 screenshots), `tab:test-scenarios` |
| 3.16 | Limitations | limitations.md, validation_package/06 | `tab:system-limitations` |
| 3.17 | Chapter Summary | — | — |

---

## Appendices

| Appendix | Content | Source |
|---|---|---|
| A | Hardware wiring and pin mapping | Pin_Mapping.md + wiring diagrams |
| B | Firmware operating modes (extended) | IoTSystem docs |
| C | Backend API endpoint summary | upload_api_listing.md |
| D | Dashboard screenshots (supplementary) | DashBoredImages/ |
| E | Validation evidence (raw tables) | validation_package/ |
| F | Data field policy | data-field-policy.md |
| G | Source map | source-map.md |

---

## Writing Order

1. Stage 1: Chapter 1 complete
2. Stage 2A: Chapter 2 §2.1–§2.10
3. Stage 2B: Chapter 2 §2.11–§2.13 + all tables
4. Stage 3A: Chapter 3 §3.1–§3.8
5. Stage 3B: Chapter 3 §3.9–§3.17
6. Stage 4: General Introduction + Abstracts (EN/FR/AR) + Conclusion
7. Stage 5: Final consistency pass, figure numbering, citation audit

---

## LaTeX File Structure

```
main.tex
chapters/
  chapter1_background.tex
  chapter2_related_works.tex
  chapter3_implementation.tex
appendices/
  appendix_a_wiring.tex
  appendix_b_firmware.tex
  appendix_c_api.tex
  appendix_d_screenshots.tex
  appendix_e_validation.tex
  appendix_f_policy.tex
  appendix_g_sourcemap.tex
figures/
  [all PNG assets copied here]
references.bib
```

---

## Confirmed Thesis Identity Block

```
Title:      A Smart Farm IoT Monitoring and Deterministic Agronomic Analytics Platform
            for Alfalfa Cultivation
Authors:    Abderrahmane Henna · Nacer Eddine Aouissi
Supervisor: Mohib Eddine KHEBBACHE
University: University of El Oued – Echahid Hamma Lakhdar
Faculty:    Faculty of Exact Sciences
Dept:       Department of Computer Science
Specialty:  Internet of Things and Network Security
Year:       2025/2026
```

**TODO before cover page generation:** Confirm exact official cover-page format from faculty template. Confirm specialty wording (Network Security vs Cybersecurity).
