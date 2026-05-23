# Claims to Avoid

All items below are prohibited in thesis prose. Each item is listed with its prohibition source and a safe alternative statement.

---

## Category 1 — Sensor Measurement Overreach

### pH measurement
- **Prohibited:** Any claim that the system measures, monitors, or reports soil pH.
- **Source:** `data-field-policy.md` · `limitations.md §1` · validation_summary (1,622 non-null `soil_ph` rows in raw CSV must be ignored)
- **Safe alternative:** "The system measures soil moisture, soil temperature, and soil electrical conductivity. Soil pH measurement is outside the scope of the current sensor configuration."

### NPK measurement
- **Prohibited:** Any claim that the system measures, detects, or monitors nitrogen, phosphorus, or potassium.
- **Source:** `data-field-policy.md` · `limitations.md §1`
- **Safe alternative:** "Nutrient concentration measurement is not implemented in the current system and represents a direction for future work."

### Official salinity class / ECe conversion
- **Prohibited:** Converting raw in-situ EC values to official salinity classification (e.g., non-saline, slightly saline, moderately saline) or to laboratory-grade ECe.
- **Source:** `data-field-policy.md` · `limitations.md §3`
- **Safe alternative:** "Soil electrical conductivity is treated as a relative trend indicator. Absolute salinity classification requires field/laboratory calibration not available in the current deployment."

### Evapotranspiration (ET) calculation
- **Prohibited:** Claiming the system computes reference ET or crop ET using FAO Penman-Monteith or any standard method.
- **Source:** `data-field-policy.md` · `limitations.md §4`
- **Reason:** No wind speed or solar radiation sensor is installed. Full ET requires at minimum these missing variables.
- **Safe alternative:** "The weather node measures air temperature, relative humidity, and atmospheric pressure. These variables support weather context and vapour pressure deficit estimation; however, the absence of wind speed and solar radiation sensors prevents computation of full reference evapotranspiration."

### Disease diagnosis
- **Prohibited:** Any claim that the system diagnoses plant diseases, pest infestations, or pathogen presence.
- **Source:** `data-field-policy.md` · `limitations.md §6`
- **Safe alternative:** "Environmental conditions may be described as generally favourable or unfavourable for certain risks. Disease diagnosis requires field scouting and pathogen evidence outside the scope of this system."

### Yield prediction
- **Prohibited:** Claiming the system predicts, estimates, or forecasts crop yield.
- **Source:** `data-field-policy.md` · `limitations.md §6`
- **Safe alternative:** "Manually recorded yield data from agronomic events can be displayed contextually. Yield prediction requires a validated agronomic model and a larger calibrated dataset, both outside the current project scope."

### Automatic irrigation prescription
- **Prohibited:** Claiming the system automatically prescribes, triggers, or schedules irrigation without human action.
- **Source:** `limitations.md §2` · `data-field-policy.md`
- **Safe alternative:** "The platform supports irrigation decision support by providing soil moisture trends and contextual analytics. Irrigation decisions remain with the farm operator."

### Absolute soil moisture thresholds (field capacity, wilting point)
- **Prohibited:** Stating that the sensor readings correspond to field capacity, refill point, or permanent wilting point without calibration evidence.
- **Source:** `limitations.md §2`
- **Safe alternative:** "Moisture values support trend analysis and pivot comparison. Calibrated agronomic thresholds require local soil-specific calibration not yet performed."

---

## Category 2 — AI / Gemini Boundary Violations

### Gemini computes analytics
- **Prohibited:** "Gemini analyses the data" / "the AI computes reliability" / "Gemini processes sensor readings".
- **Source:** `data-field-policy.md` AI boundary section
- **Safe alternative:** "Gemini is accessed exclusively through the backend proxy. It receives deterministic analytics outputs and provides a narrative interpretation. It does not perform primary computation, data cleaning, or metric calculation."

### Gemini as authoritative output
- **Prohibited:** Citing Gemini output as proof or as a scientific result.
- **Source:** `data-field-policy.md` · `limitations.md §8`
- **Safe alternative:** "Gemini-generated explanations are supplementary. Deterministic metrics, QC flags, and reliability scores remain authoritative."

### Gemini fills missing data
- **Prohibited:** Claiming Gemini estimates, fills, or imputes missing sensor values.
- **Source:** `data-field-policy.md`
- **Safe alternative:** "Missing data remains visible in the dashboard. No imputation is performed by any system component."

---

## Category 3 — Time Semantics Violations

### Upload time = analysis time
- **Prohibited:** Using upload timestamps as measurement timestamps on charts or in analytics discussions.
- **Source:** `data-field-policy.md` · `source-map.md` · test-scenarios.md §3
- **Safe alternative:** "`measured_at` is the canonical timestamp for sensor charts and analytics. Upload time is recorded separately as transfer and audit metadata and is not used on the time axis."

### Upload time implies data freshness
- **Prohibited:** "The dashboard shows real-time data" / "the latest upload reflects current field conditions".
- **Source:** `limitations.md §7`
- **Safe alternative:** "The dashboard reflects the latest uploaded data. Because the system is offline-first and upload-driven, the most recent field measurements stored on SD may not yet appear in the dashboard."

---

## Category 4 — Validation Overreach

### Full-season agronomic validation
- **Prohibited:** Claiming the system has been validated over a full alfalfa growing season.
- **Source:** `limitations.md §9` · `test-scenarios.md` Notes
- **Safe alternative:** "The validation window covers 5.6 days (2026-05-06 to 2026-05-11). This demonstrates functional feasibility and system behavior but does not constitute long-term field validation."

### Error-free upload
- **Prohibited:** "All upload sessions completed without errors."
- **Source:** `validation_summary.md` — error_count sum = 3 across 6 sessions
- **Safe alternative:** "Six upload sessions were recorded, all with status `processed`. A total of three minor upload errors were logged and do not affect data completeness."

### Reliability of 0.399 is high or ideal
- **Prohibited:** Presenting the constant 0.399 reliability score as a strong validation result without explanation.
- **Source:** `validation_summary.md` — 135 processed rows all at 0.399
- **Safe alternative:** "A reliability indicator of 0.399 was computed for the processed window, reflecting the pilot-phase nature of the validation dataset. Reliability thresholds and their agronomic implications require further calibration."

### Warning-free software build
- **Prohibited:** Claiming the software builds and deploys without any warnings, unless build logs are provided.
- **Source:** `data-field-policy.md` Unsupported claims section
- **Safe alternative:** State only what build evidence shows. If no terminal build output is available, omit the claim.

---

## Category 5 — Reference/Citation Violations

### Citing unverified professor-provided PDFs
- **Prohibited:** Citing any of the eight unverified bibliography entries without confirmed metadata.
- **Unverified keys:** `rajak2023iot_smart_sensors_agriculture`, `iot_protocols_precision_agriculture_outdoor`, `cheap_practical_iot_agri_monitoring`, `iot_enhancements_algerian_desert_agriculture`, `hadeid_saharan_agriculture_algerian_oasis`, `desert_agriculture_food_security_algeria`, `smart_agriculture_desert_wadi_souf`, `lloret2021soil_moisture_wsn`
- **Safe alternative:** Use `[TODO: verify bibliographic metadata]` marker; cite confirmed references in their place if available.

### Claiming numerical results from related works
- **Prohibited:** Citing specific performance figures (range in meters, accuracy percentage, latency) from related works unless the user provides the verified figure from the source.
- **Source:** `anti-plagiarism-rewrite-logic.md`
- **Safe alternative:** Describe the related work's contribution and limitation without borrowing their quantitative results.

---

## Category 6 — Scope and Deployment Violations

### Commercial deployment
- **Prohibited:** Describing the system as a finished commercial product or ready for large-scale deployment.
- **Source:** `limitations.md §9` · `data-field-policy.md`
- **Safe alternative:** "The platform demonstrates functional feasibility in a field-oriented prototype configuration. Commercial deployment would require additional calibration, extended validation, and security hardening."

### pH field in raw CSV
- **Prohibited:** Using the `soil_ph` column from `readings_2026-05-06_to_2026-05-11_1500.csv` as a claimed measurement.
- **Source:** `validation_summary.md` — 1,622 non-null `soil_ph` rows; policy says pH is unsupported.
- **Safe alternative:** "The raw data file contains a `soil_ph` field. This field is excluded from thesis claims because pH sensing is not confirmed by the current sensor stack. It is treated as a raw-file inconsistency pending hardware verification."
