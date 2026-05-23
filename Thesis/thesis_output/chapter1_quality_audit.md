# Chapter 1 Quality Audit
**Chapter:** Background and Theoretical Foundations
**File:** `chapters/chapter1_background.tex`
**Audit date:** 2026-05-14

---

## 1. Sections Completed

| Section | Title | Status | Word count (approx.) |
|---|---|---|---|
| 1.1 | Chapter Introduction | Complete | ~160 |
| 1.2 | Saharan Agriculture Context | Complete | ~390 |
| 1.3 | Data Collection in Agriculture | Complete | ~430 |
| 1.4 | Smart Agriculture and the Internet of Things | Complete | ~400 |
| 1.5 | IoT Communication Technologies | Complete | ~520 + figure + table |
| 1.6 | IoT Network Topologies | Complete | ~380 |
| 1.7 | Low-Power Operation in Field IoT Systems | Complete | ~470 + 2 figures |
| 1.8 | Reliability and Fault Recovery in IoT Systems | Complete | ~420 |
| 1.9 | Alfalfa Crop Background | Complete | ~710 + table |
| 1.10 | Why Alfalfa Was Selected | Complete | ~510 |
| 1.11 | Chapter Summary | Complete | ~350 |

**Estimated total chapter body text:** ~4,750 words (excluding figure captions and table content)
**Figures included:** 3 (`fig:lora-module-ch1`, `fig:relay-power-control-ch1`, `fig:bme280-sensor-ch1`)
**Tables included:** 2 (`tab:iot-communication-comparison`, `tab:alfalfa-monitoring-needs`)

---

## 2. References Used

### Used and cited (confirmed metadata)

| Key | Section(s) | Use |
|---|---|---|
| `gubbi2013iot_vision` | §1.4 | IoT concept definition and architectural elements |
| `ayaz2019iot_smart_agriculture_survey` | §1.4 | IoT applications in smart agriculture (survey) |
| `farooq2019iot_smart_agriculture_review` | §1.4 | IoT for smart farming; low-cost embedded systems |
| `semtech2020sx127x_datasheet` | §1.5 | LoRa spreading factor and range characteristics |
| `loraalliance2020lorawan_104` | §1.5 | LoRaWAN specification and device class architecture |
| `teh2020sensor_data_quality` | §1.3 | Sensor data quality dimensions (completeness, consistency, timeliness, accuracy) |
| `dandrifosse2024weather_qc_agriculture` | §1.3 | Agricultural weather data QC; timestamp integrity |
| `bosch2024bme280_datasheet` | §1.7 | BME280 forced measurement mode |
| `fao_alflafa_crop_water` | §1.9 intro | Alfalfa agronomic role and crop-water relationship |
| `mueller2007alfalfa_growth_development` | §1.9.1 | Cut cycles, regrowth patterns, harvest timing |
| `irmak2007irrigation_alfalfa` | §1.9.2 | Alfalfa water requirements; irrigation management |
| `orloff2015drought_strategies_alfalfa` | §1.9.2 | Drought strategies; water deficit at growth stages |
| `wassie2019heat_stress_alfalfa` | §1.9.3 | Heat stress effects on alfalfa physiology |
| `nrcs1999soil_electrical_conductivity` | §1.9.4 | EC salinity thresholds for alfalfa yield |
| `benabdelouahab2019sensor_calibration_5te` | §1.9.4 | Multi-parameter soil sensor calibration; EC dependency on water content |
| `ahmed2022lora_agriculture_chile` | §1.10.2 | Cited as representative reviewed work without alfalfa focus |
| `pereira2023esp32_drip_irrigation` | §1.10.2 | Cited as representative reviewed work without alfalfa focus |
| `saban2023smart_agricultural_lora_cloud` | §1.10.2 | Cited as representative reviewed work without alfalfa focus |

### Used with TODO verification markers (unverified metadata)

| Key | Section | Marker in .tex | Status |
|---|---|---|---|
| `hadeid_saharan_agriculture_algerian_oasis` | §1.2 | `% TODO: verify citation metadata` | Unverified — must resolve before submission |
| `desert_agriculture_food_security_algeria` | §1.2 | `% TODO: verify citation metadata` | Unverified — must resolve before submission |
| `smart_agriculture_desert_wadi_souf` | §1.2 | `% TODO: verify citation metadata` | Unverified — must resolve before submission |
| `villa2020iot_arable_farming` | §1.6 | `% TODO: verify citation metadata` | Unverified — must resolve before submission |
| `iot_enhancements_algerian_desert_agriculture` | §1.10.2 | `% TODO: verify citation metadata` | Unverified — must resolve before submission |

### Not used in Chapter 1 (reserved for later chapters)

| Key | Why not used |
|---|---|
| `espressif2024esp32_datasheet` | Hardware implementation detail — belongs in Chapter 3 |
| `maxim2013ds3231_datasheet` | DS3231 RTC implementation — Chapter 3 |
| `analog2017max485_datasheet` | MAX485 RS485 interface — Chapter 3 |
| `modbus2012application_protocol` | Protocol implementation detail — Chapter 3 |
| `postgresql2025docs16` | Backend implementation — Chapter 3 |
| `alhamdani1990temperature_regimes_alfalfa` | Useful for temperature context but metadata unverified; wassie2019 covers heat stress sufficiently |
| `orloff2008harvest_strategies_alfalfa` | Metadata note: requires verification |
| All other unverified desert/Saharan refs | Unverified; only those with direct justification in §1.2 and §1.10 were referenced with TODO markers |

---

## 3. Anti-Plagiarism Checklist

The following section-by-section verification confirms that the four-stage reconstruction method was applied. No source sentences were preserved.

| Section | Source function identified | Abstract pattern applied | Project-specific reconstruction | Verdict |
|---|---|---|---|---|
| §1.2 | Broad motivation: Saharan agriculture constraints | Environment → specific constraints → consequence for monitoring → technology need | El Oued oasis, unstable power, groundwater dependence, manual monitoring failure, offline-first motivation stated at the end | PASS |
| §1.3 | Data quality limitation framing | Traditional observation → limitation → need for traceability → timestamp distinction | Four data domains, measured_at vs upload_time distinction introduced conceptually (not by domain name), teh2020 and dandrifosse2024 used for conceptual support only | PASS |
| §1.4 | IoT definition and agricultural application | Technology definition → agricultural layers → monitoring vs control distinction → decision support | Three-layer framing (sensing, communication+storage, visualization) derived from literature function, not copied from gubbi/ayaz/farooq text | PASS |
| §1.5 | Technology comparison → LoRa justification | Technology landscape → outdoor constraints → LoRa characteristics → suitability conclusion | Comparison table constructed from project context (range, power, infrastructure, field suitability) — no table structure borrowed from any source | PASS |
| §1.6 | Network topology explanation → gateway justification | Topology types → tradeoffs → gateway pattern → relevance | Gateway-based star described conceptually; project architecture previewed at the level of "central gateway coordinates remote sensing nodes" only — no node names, no implementation specifics | PASS |
| §1.7 | Low-power design principles | Field power constraints → battery dependency → deep sleep strategy → peripheral control | BME280 forced mode described from datasheet function, not copied; relay power control described at principle level; figures introduced with caption explaining monitoring role | PASS |
| §1.8 | Reliability and recovery framing | Communication failures → synchronization loss → ACK pattern → diagnostic logging | Synchronization loss problem described as original reasoning (window mismatch concept) — this is the project's actual observed problem reframed as a general principle appropriate for the background chapter | PASS |
| §1.9 | Alfalfa agronomic background | Crop description → economic role → water/soil requirements → monitoring relevance | Cut cycles, water demand, heat stress, EC limitation all reconstructed from their references using project-specific framing (monitoring purpose, Saharan context) | PASS |
| §1.10 | Gap identification | Regional relevance → existing gap → project contribution | Gap stated carefully: "in the works reviewed in this review" and "not stated as a universal absolute" — no exaggerated global claim | PASS |
| §1.11 | Summary and transition | Establish chapters done → connect to next chapter | Chapter summary written from memory of what the chapter established, not by repeating source sentences | PASS |

---

## 4. Prohibited Claims Scan

### From `03_claims_to_avoid.md` — verified against chapter text

| Prohibited claim | Present in chapter? | Evidence |
|---|---|---|
| pH measurement | NO | Soil EC section explicitly states EC is a "relative trend indicator" only and does not mention pH |
| NPK measurement | NO | Not mentioned anywhere |
| Official salinity class / ECe conversion | NO | §1.9.4 explicitly states: "raw EC readings cannot be directly converted to saturated-paste ECe or to official salinity classifications without appropriate calibration procedures" |
| Evapotranspiration computation | NO | Not mentioned. Water demand discussed only at the crop level from references |
| Disease diagnosis | NO | Not mentioned |
| Yield prediction | NO | Not mentioned |
| Automatic irrigation prescription | NO | §1.4 explicitly distinguishes monitoring from control; §1.10.3 says "not as automatic agronomic decisions, but as information that supports better-informed human decisions" |
| Upload time = analysis time | NO | §1.3 explicitly establishes that upload time and measurement time are distinct |
| Real-time guarantee | NO | Not claimed. Offline-first context mentioned at §1.2 level |
| Gemini / AI analytics | NO | AI layer not mentioned in background chapter — correctly reserved for Chapter 3 |
| Autonomous irrigation | NO | Not claimed |
| Absolute moisture thresholds | NO | Monitoring role is stated as trend tracking and operator support only |
| Warning-free build | NO | Not mentioned |

**Prohibited claims scan: ALL CLEAR**

---

## 5. Citation Integrity

| Check | Status | Notes |
|---|---|---|
| All `\cite{}` keys exist in `references.bib` or `references_updated.bib` | PASS | All 19 confirmed keys are present in the bib files |
| Unverified references have TODO comments in .tex | PASS | 5 unverified references have inline `% TODO` comments immediately after the `\cite{}` call |
| No numeric results borrowed from references | PASS | No accuracy %, latency, or performance figures from any reference are presented as the project's own results |
| Citations placed near claims, not decoratively | PASS | Each `\cite{}` appears at the sentence where the referenced concept is introduced |
| No self-citation of project files as academic references | PASS | Chapter 1 contains no citations to dashboard screenshots, firmware code, validation CSVs, or other project-internal evidence |
| `espressif2024esp32_datasheet` and component datasheets not cited in Chapter 1 | PASS | These are reserved for Chapter 3 where hardware implementation is described |

---

## 6. TODOs Before Final Submission

| ID | Type | Location in .tex | Required action |
|---|---|---|---|
| T1 | Reference verification | §1.2, line after `\cite{hadeid_saharan_agriculture_algerian_oasis}` | Verify author, title, journal/book, year, DOI from professor-provided PDF |
| T2 | Reference verification | §1.2, line after `\cite{desert_agriculture_food_security_algeria}` | Verify full bibliographic metadata from professor-provided PDF |
| T3 | Reference verification | §1.2, line after `\cite{smart_agriculture_desert_wadi_souf}` | Verify full bibliographic metadata from professor-provided PDF |
| T4 | Reference verification | §1.6, line after `\cite{villa2020iot_arable_farming}` | Verify volume, pages, DOI from Biosystems Engineering |
| T5 | Reference verification | §1.10.2, line after `\cite{iot_enhancements_algerian_desert_agriculture}` | Verify full bibliographic metadata from professor-provided PDF |
| T6 | Figure file | §1.5, `\includegraphics{figures/LoRa}` | Copy `Academic-Thesis/SystemImage/LoRa.png` to `figures/LoRa.png` before compiling |
| T7 | Figure file | §1.7, `\includegraphics{figures/Relay}` | Copy `Academic-Thesis/SystemImage/Relay.png` to `figures/Relay.png` before compiling |
| T8 | Figure file | §1.7, `\includegraphics{figures/Bme280}` | Copy `Academic-Thesis/SystemImage/Bme280.png` to `figures/Bme280.png` before compiling |
| T9 | Optional reference | §1.9.3, heat stress | If `alhamdani1990temperature_regimes_alfalfa` metadata is verified, it may be added alongside `wassie2019heat_stress_alfalfa` for the temperature regimes context |
| T10 | Optional expansion | §1.2 | If a field photo of the agricultural site is approved by the student, a figure may be added to §1.2 to illustrate the Saharan field context |

---

## 7. Structure and Content Quality Notes

### Strengths
- **Section progression is coherent:** each section builds on the previous one; the progression from field constraints → data quality → IoT concepts → communication → topology → power → reliability → crop → crop gap flows naturally.
- **Monitoring vs control distinction** is established clearly in §1.4 and carried through to §1.10.3 — this prevents the chapter from making claims that only Chapter 3 can support.
- **EC limitation is pre-empted** in §1.9.4 with the calibration caveat from Benabdelouahab et al. — this means the claim-to-avoid rule around EC is already embedded in the background chapter itself, not just as a restriction in later writing.
- **LoRa justification** in §1.5 is evidence-based: the comparison table makes the choice defensible without overstating measured performance.
- **Alfalfa gap** in §1.10.2 uses three confirmed references (ahmed2022, pereira2023, saban2023) as evidence that reviewed works do not target alfalfa — this is honest and defensible.
- **Chapter summary** (§1.11) accurately mirrors what each section established and transitions correctly to Chapter 2.

### Points to review
- **§1.2 relies on three unverified references** for the Saharan agriculture context. If none of these can be verified before submission, the section will need alternative references or the claims must be presented as contextual background without citation. The core argument is still supportable from FAO and general agricultural geography literature.
- **§1.6** references `villa2020iot_arable_farming` for the gateway topology argument — this is a weak citation since the metadata is unverified. The topological argument is self-evident and the citation is not strictly necessary; removing it if unverified does not weaken the section.
- **Table 1.1** (communication comparison) does not include LoRaWAN as a separate row. If the committee asks, the distinction between LoRa and LoRaWAN may need a brief note in the table footer or in the text. Currently the text mentions both briefly.
- **BME280 forced mode** in §1.7 references `bosch2024bme280_datasheet` — confirm the exact datasheet revision used matches the year in the BibTeX entry. The note in the original bib file says "Metadata requires verification against the exact datasheet revision used in the project."
- **Sentence rhythm check:** The chapter uses varied sentence lengths throughout. A final human proofreading pass is recommended to ensure that no section settles into a monotone long-sentence rhythm for more than two consecutive sentences.

### Writing quality summary
- Academic register: consistent
- No promotional or marketing language detected
- No AI-sounding filler phrases detected (no "it is worth noting", "it is important to highlight", "in conclusion it can be said", etc.)
- Chapter introduction previews all sections by number — standard and appropriate for a master thesis chapter
- Chapter summary mirrors section content accurately without copying section text
- Transition to Chapter 2 is explicit and natural

---

## 8. Compatibility Notes for Later Chapters

| Item | Note for Chapter 2 | Note for Chapter 3 |
|---|---|---|
| Gateway-based topology introduced | Chapter 2 can reference this as established background | Chapter 3 implements it — no need to redefine |
| LoRa characteristics described | Chapter 2 comparison should reference §1.5 | Chapter 3 firmware implementation can assume LoRa is already justified |
| Monitoring vs control distinction | Chapter 2 gap analysis should use this framing | Chapter 3 should not claim autonomous control |
| Timestamp semantics (measurement vs upload) | Chapter 2 can cite this as a gap in reviewed works | Chapter 3 must implement and validate this distinction |
| EC calibration caveat established | Chapter 2 and 3 do not need to restate it at length | Chapter 3 limitations section can reference the §1.9.4 caveat |
| Alfalfa crop gap introduced | Chapter 2 §2.10 can refer back to this gap as established in Chapter 1 | Chapter 3 validates the monitoring use case for alfalfa |
