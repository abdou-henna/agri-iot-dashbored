# Chapter 3 Part A Quality Audit
**Chapter:** System Design, Implementation, and Evaluation (Part A)
**File:** `chapters/chapter3_implementation.tex`
**Sections covered:** 3.1–3.8
**Audit date:** 2026-05-14

---

## 1. Sections Completed

| Section | Title | Status | Word count (approx.) |
|---|---|---|---|
| 3.1 | Chapter Introduction | Complete | ~200 |
| 3.2 | System Requirements | Complete | ~170 + table (tab:system-requirements) |
| 3.3 | General System Architecture | Complete | ~340 + 2 figures |
| 3.4 | Hardware Architecture | Complete | ~750 + 6 figure pairs + 2 tables |
| 3.4.1 | MAIN ESP32 Gateway Node | Complete | ~350 |
| 3.4.2 | Node2 Remote Soil Node | Complete | ~220 |
| 3.4.3 | Node3 Weather Node | Complete | ~180 |
| 3.5 | Firmware Operating Modes | Complete | ~850 + 1 figure + 1 table |
| 3.5.1–3.5.8 | Eight firmware modes | Complete | Distributed across ~850 words |
| 3.6 | Communication Design | Complete | ~380 + 2 figures |
| 3.7 | Data Storage and Time Policy | Complete | ~420 + table (tab:data-domains-time-fields) |
| 3.8 | Backend Implementation | Complete | ~380 + 1 figure + 2 tables |

**Estimated total chapter body text (Part A):** ~3,800 words (excluding table content and figure captions)
**Figures referenced:** 21 (see §2 below)
**Tables included:** 7 (see §3 below)

---

## 2. Figures Referenced

| Label | File path | Priority | Status |
|---|---|---|---|
| `fig:overall-system-architecture` | `figures/overall-diagram.png` (from `Academic-Thesis/Diagrams/overall diagram.png`) | Essential | File must be copied — TODO in .tex |
| `fig:data-flow-diagram` | `figures/data-flow-diagram.png` (from `Academic-Thesis/Diagrams/Data Flow Diagram.png`) | Essential | File must be copied — TODO in .tex |
| `fig:main-node-front` | `figures/MainNodeFront.png` | Essential | File must be copied — TODO in .tex |
| `fig:main-node-back` | `figures/MainNodeBack.png` | Essential | File must be copied — TODO in .tex |
| `fig:main-node-wiring` | `figures/MainNodeWiringDiagram.png` | Essential | File must be copied — TODO in .tex |
| `fig:relay-module-ch3` | `figures/Relay.png` | High | File must be copied — TODO in .tex |
| `fig:node2-front` | `figures/SecondNodeFront.png` | Essential | File must be copied — TODO in .tex |
| `fig:node2-back` | `figures/SecondNodeBack.png` | Essential | File must be copied — TODO in .tex |
| `fig:node2-wiring` | `figures/Node2WiringDiagram.png` | Essential | File must be copied — TODO in .tex |
| `fig:soil-sensor` | `figures/SoilSensor.png` | High | File must be copied — TODO in .tex |
| `fig:max485` | `figures/Max485.png` | Medium | File must be copied — TODO in .tex |
| `fig:node3-front` | `figures/WatherNodeFront.png` | Essential | File must be copied; TODO to rename Wather→Weather |
| `fig:node3-back` | `figures/WatherNodeBack.png` | Essential | File must be copied; TODO to rename Wather→Weather |
| `fig:node3-wiring` | `figures/WatherNodeWiringDiagram.png` | Essential | File must be copied; TODO to rename Wather→Weather |
| `fig:bme280-ch3` | `figures/Bme280.png` | High | File must be copied — TODO in .tex |
| `fig:firmware-state-machine` | `figures/StateMachineDiagram.png` (from `Academic-Thesis/Diagrams/State Machine Diagram.png`) | Essential | File must be copied — TODO in .tex |
| `fig:lora-module-ch3` | `figures/LoRa.png` | High | File must be copied — TODO in .tex |
| `fig:sequence-diagram-1` | `figures/SequenceDiagram1.png` | Essential | TODO: confirm whether 1.png or single file exists |
| `fig:sequence-diagram-2` | `figures/SequenceDiagram2.png` | High | TODO: confirm second file exists; remove if not |
| `fig:sd-card-module` | `figures/SdCardModule.png` | Medium | File must be copied — TODO in .tex |
| `fig:rtc-module` | `figures/Rtc.png` | High | File must be copied — TODO in .tex |
| `fig:database-erd` | `figures/DatabaseERDDiagram.png` | Essential | File must be copied — TODO in .tex |

---

## 3. Tables Included

| Label | Caption | Columns | Status |
|---|---|---|---|
| `tab:system-requirements` | Functional and non-functional requirements | Type \| Requirement \| Design response | Complete (9 functional + 6 non-functional rows) |
| `tab:node-roles` | Summary of node roles | Node \| Microcontroller \| Primary function \| Location | Complete (3 rows) |
| `tab:hardware-components` | Hardware components across all nodes | Component \| Node(s) \| Interface \| Function | Complete (10 rows) |
| `tab:firmware-operating-modes` | Firmware operating modes | Mode \| Trigger \| Purpose \| Field problem addressed \| Output/log | Complete (8 rows) |
| `tab:data-domains-time-fields` | Data domains, time fields, analytical roles | Domain \| Content \| Time field \| Used for analytics? \| Purpose | Complete (4 rows) |
| `tab:database-tables` | PostgreSQL database tables | Table \| Migration \| Purpose and key fields | Complete (7 rows) |
| `tab:api-endpoints` | Backend REST API endpoints | Method \| Endpoint \| Client \| Function | Complete (7 rows) |

---

## 4. References Used in Part A

Part A of Chapter 3 is primarily an implementation chapter. Citations to academic references are minimal by design; the content is grounded in project documentation, firmware evidence, and hardware datasheets. Cross-references to earlier chapters carry the academic foundation established in Chapters 1 and 2.

| Cross-reference | Section | Use |
|---|---|---|
| `\ref{chap:related}` | §3.1, §3.7 | Gap motivation; upload timestamp gap identified in Ch2 |
| `\ref{chap:background}` | §3.2 | Saharan field constraints as requirements source |
| `\ref{sec:iot-communication}` | §3.6 | LoRa selection justification established in Ch1 §1.5 |

No new academic citations are introduced in §3.1–3.8. The hardware and firmware descriptions cite project-internal evidence (firmware README files, SQL migration files, power saving and recovery strategy documents). If the committee expects academic references in the hardware section, the following from the BibTeX files may be added:
- `semtech2020sx127x_datasheet` — LoRa SF7 characteristics (already cited in §1.5; may be repeated in §3.6 for the LoRa configuration table)
- `bosch2024bme280_datasheet` — BME280 forced mode (already cited in §1.7; may be repeated in §3.4.3)
- `modbus2012application_protocol` — Modbus RTU protocol (appropriate for §3.4.1 and §3.4.2)
- `espressif2024esp32_datasheet` — ESP32 SPI bus configuration (appropriate for §3.4.1)
- `maxim2013ds3231_datasheet` — DS3231 RTC (appropriate for §3.4.1 and §3.7)
- `analog2017max485_datasheet` — MAX485 RS485 interface (appropriate for §3.4.1 and §3.4.2)
- `postgresql2025docs16` — PostgreSQL (appropriate for §3.8)

These references are confirmed present in `references.bib` and `references_updated.bib`. Adding them in Part B or during a final consistency pass is recommended.

---

## 5. Anti-Plagiarism Checklist

| Section | Source function | Abstract pattern applied | Project-specific reconstruction | Verdict |
|---|---|---|---|---|
| §3.1 | Introduction framing from Ch2 gaps | Gap identified → chapter purpose → scope statement | Three specific gaps named (alfalfa, offline-first, timestamp conflation); deferred sections named without forward \ref{} to undefined labels | PASS |
| §3.2 | Requirements definition from field constraints | Type classification → requirement statement → design response | Each requirement linked to either a Chapter 1 constraint (battery, connectivity) or a Chapter 2 gap (timestamp, deterministic analytics); no requirements invented | PASS |
| §3.3 | Architecture description from project diagrams | Tier description → data flow → offline-first emphasis | Three tiers named from project structure; data flow traced from sensor to dashboard with timestamp separation emphasized at the end | PASS |
| §3.4.1 | MAIN node from README and wiring diagram | Hardware role → subsystems → pin mapping → local sensor status | Pivot 1 register-map-pending status reported honestly; pin numbers from README, not invented; relay-on/off sequence described as design not as measured outcome | PASS |
| §3.4.2 | Node2 from README | Remote node role → interfaces → power control → transmission | Two pivots explained as distinct monitoring zones; deep sleep described as primary energy mechanism; no range or autonomy claims | PASS |
| §3.4.3 | Node3 from README | Weather role → BME280 forced mode → low-power | Forced mode explained as single-shot pattern; active window stated as "under two seconds" from README — accurate claim | PASS |
| §3.5 modes | Firmware strategy docs + READMEs | Field problem → mode motivation → implementation mechanism | Recovery mode origin traced to timing drift observation (not packet loss); relay sequence both on success and failure paths stated accurately | PASS |
| §3.6 | Communication from sequence diagrams and LoRa config | LoRa config → superframe sequence → ACK mechanism → RSSI evidence | RSSI range stated from validation data; no range or packet-loss claims; recovery sequence references §3.5 rather than duplicating | PASS |
| §3.7 | Data policy from data-field-policy.md | Domain classification → time field semantics → upload/measurement distinction | "Upload timestamp is transfer/audit metadata only" stated three times in different phrasings; enforced structurally in backend description | PASS |
| §3.8 | Backend from WebService README and SQL migrations | Backend stack → ingestion flow → table roles → AI boundary | Tables derived from confirmed SQL migration files; API endpoints reflect documented endpoints only; Gemini proxy described at boundary level with no overclaim | PASS |

---

## 6. Prohibited Claims Scan

| Prohibited claim | Present in Part A? | Evidence |
|---|---|---|
| pH measurement | NO | Not mentioned anywhere in §3.1–3.8 |
| NPK measurement | NO | Not mentioned |
| ET computation | NO | Not mentioned |
| Disease diagnosis | NO | Not mentioned |
| Yield prediction | NO | Not mentioned |
| Salinity classification | NO | Not mentioned |
| Autonomous irrigation | NO | Monitoring-only system; no actuator control claimed |
| Real-time guarantee | NO | Offline-first explicitly described; no latency guarantees |
| Gemini computes analytics | NO | §3.8 explicitly states Gemini receives deterministic snapshot; does not compute analytics |
| Upload time = analysis time | NO | §3.7 explicitly states the opposite in multiple phrasings; tab:data-domains-time-fields marks uploads as "No" for analytics |
| Full-season validation | NO | Deferred to Part B; Part A describes design only |
| Error-free builds | NO | Not claimed |
| Measured LoRa range | NO | §3.6: "Formal range characterisation over measured distances was not conducted" |
| Measured battery autonomy | NO | §3.5.2: "Battery autonomy was not formally characterised during the validation window" |
| Constant 0.399 reliability score as final result | NO | Deferred to Part B validation section |

**Prohibited claims scan: ALL CLEAR**

---

## 7. TODOs Before Final Compilation

| ID | Type | Location in .tex | Required action |
|---|---|---|---|
| T1 | Figure file | §3.3, `\includegraphics{figures/overall-diagram}` | Copy `Academic-Thesis/Diagrams/overall diagram.png` → `figures/overall-diagram.png` |
| T2 | Figure file | §3.3, `\includegraphics{figures/data-flow-diagram}` | Copy `Academic-Thesis/Diagrams/Data Flow Diagram.png` → `figures/data-flow-diagram.png` |
| T3 | Figure file | §3.4.1 | Copy `MainNodeFront.png`, `MainNodeBack.png`, `MainNodeWiringDiagram.png`, `Relay.png` to `figures/` |
| T4 | Figure file | §3.4.2 | Copy `SecondNodeFront.png`, `SecondNodeBack.png`, `Node2WiringDiagram.png`, `SoilSensor.png`, `Max485.png` to `figures/` |
| T5 | Figure file + rename | §3.4.3 | Copy `WatherNodeFront.png`, `WatherNodeBack.png`, `WatherNodeWiringDiagram.png` to `figures/`; optionally rename Wather→Weather in source directory |
| T6 | Figure file | §3.4.3 | Copy `Bme280.png` to `figures/` |
| T7 | Figure file | §3.5 | Copy `Academic-Thesis/Diagrams/State Machine Diagram.png` → `figures/StateMachineDiagram.png` |
| T8 | Figure file | §3.5.5 | Copy `SdCardModule.png` to `figures/` |
| T9 | Figure file | §3.5.7 | Copy `Rtc.png` to `figures/` |
| T10 | Figure file | §3.6 | Copy `LoRa.png` to `figures/` |
| T11 | Figure file — confirm | §3.6, `fig:sequence-diagram-1` | Confirm `Sequence Diagrams 1.png` exists in `Academic-Thesis/Diagrams/`; copy to `figures/SequenceDiagram1.png` |
| T12 | Figure file — confirm | §3.6, `fig:sequence-diagram-2` | Confirm `Sequence Diagrams 2.png` exists; copy to `figures/SequenceDiagram2.png`; if not, remove fig from .tex |
| T13 | Figure file | §3.8 | Copy `Academic-Thesis/Diagrams/DatabaseERDDiagram.png` → `figures/DatabaseERDDiagram.png` |
| T14 | API response sample | §3.8, after `tab:api-endpoints` | Add captured API response JSON samples if available (see missing_items H5) |
| T15 | References | §3.4–3.8 | Consider adding datasheets (`modbus2012`, `espressif2024esp32`, `maxim2013ds3231`, `analog2017max485`, `postgresql2025docs16`) in final consistency pass |
| T16 | Pivot 1 sensor | §3.4.1 | Update LOCAL_SOIL_REGISTER_MAP_MISSING paragraph when register map is confirmed |

---

## 8. Structure and Content Quality Notes

### Strengths

- **Timestamp policy is stated at three levels:** concept (§3.3), design table (§3.7 tab:data-domains-time-fields), and implementation enforcement (§3.8 ingestion description). This mirrors the depth required by the related-works gap argument in Chapter 2.
- **Recovery Mode motivation is traced to the observed field failure** (timing drift, not merely packet loss). This framing is honest about the engineering origin of the mode and distinguishes the system from works that treat communication failures as generic retransmission problems.
- **Pivot 1 sensor status is reported accurately.** The `LOCAL_SOIL_REGISTER_MAP_MISSING` state is described as a pending register map, not a sensor failure, and the relay power sequence is acknowledged as executing correctly on each cycle. This is intellectually honest and avoids misrepresenting the validation evidence.
- **Prohibited claims are absent throughout.** No range, autonomy, pH, NPK, yield, or ET claims appear in any section.
- **AI boundary description is layered.** §3.2 states it as a non-functional requirement; §3.8 describes how the proxy enforces it at the API level. Part B will describe how the dashboard presents the separation visually.
- **Superframe timing constants are from project documentation**, not approximated. The 70-second window, 1500 ms ACK timeout, 15-second warmup, and sleep sequences are all directly traceable to the firmware strategy documents.

### Points to review

- **`tab:system-requirements` is a wide table with 3 columns.** In a two-sided A4 document with standard margins, it may overflow horizontally. Consider `p{}` widths: the current 2.8 + 6.2 + 5.0 = 14.0 cm total, which fits a standard 15 cm text body. If the supervisor uses narrower margins, adjust.
- **`tab:firmware-operating-modes` has 5 columns.** Total `p{}` width is 2.5 + 2.8 + 3.0 + 3.2 + 2.5 = 14.0 cm. The same margin caveat applies.
- **`fig:sequence-diagram-2`** references a file whose existence is unconfirmed. The `.tex` file contains a TODO comment; if the file is absent, the figure environment must be removed before compiling.
- **References from §1.5 and §1.7 (LoRa datasheet, BME280 datasheet)** are not re-cited in Chapter 3 because the convention is to cite where the concept is first introduced. If the committee expects hardware datasheets cited in the hardware chapter, add them in the final consistency pass.
- **`tab:api-endpoints`** lists 7 endpoints based on WebService README and source code structure. If additional endpoints exist (e.g., PATCH for agronomic events, DELETE), the table should be updated when a complete endpoint listing is confirmed.

### Writing quality summary

- Academic register: consistent throughout
- No promotional or marketing language detected
- No AI-sounding filler phrases detected
- All eight firmware modes are given both a motivation (why it was introduced) and an implementation description (how it works) — this matches the chapter brief requirement
- Forward references to §3.9–§3.17 (Part B sections) are written in prose only; no `\ref{}` to undefined labels
- End-of-file marker present: `% End of Chapter 3 Part A. Sections 3.9–3.17 will be generated in Phase 5.`

---

## 9. Compatibility Notes for Part B and Final Consistency

| Item | Note for Part B (§3.9–3.17) | Note for final pass |
|---|---|---|
| `\label{chap:implementation}` defined | Chapter 2 `\ref{chap:implementation}` in §2.11 and §2.13 will now resolve | Verify during LaTeX compile |
| `tab:data-domains-time-fields` defined | §3.9 dashboard may reference this table for the data access layer description | Verify no redefinition |
| `tab:api-endpoints` defined | §3.9 dashboard API consumption section references these endpoints | Extend table if new endpoints confirmed |
| `tab:firmware-operating-modes` defined | §3.13 validation section may cross-reference recovery mode event types | Verify labels match |
| Pivot 1 sensor pending state acknowledged | §3.13 validation must not present Pivot 1 soil readings as collected data | Update when register map resolved |
| Constant reliability score 0.399 | §3.13–3.14 must handle this as "pilot-phase evaluation" per missing_items M6 | Write as stated in missing_items M6 |
| AI boundary established | §3.11 (AI interpretation) must not add new capabilities; must remain consistent with §3.2 and §3.8 descriptions | Review against §3.2 non-functional requirement |
