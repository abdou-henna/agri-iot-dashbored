# Missing or Uncertain Items

Each item is classified by priority, impact on writing, and recommended handling.

---

## Priority: Critical (blocks specific LaTeX generation decisions)

### C1 — Official university cover-page format
- **What is missing:** The exact faculty cover-page template (logo placement, field labels, formatting rules).
- **Impact:** Cannot finalize title page LaTeX without it.
- **Source:** `thesis-metadata.md` — "Exact official cover-page format required by the faculty" listed as TODO.
- **Handling:** Use a standard Algerian master thesis cover-page template as a placeholder. Mark with `% TODO: replace with official faculty template`.

### C2 — Specialty wording: "Network Security" vs "Cybersecurity"
- **What is missing:** Confirmation of whether the specialty is "Internet of Things and Network Security" or "Internet of Things and Cybersecurity" in the official department template.
- **Impact:** Affects cover page, abstract header, and front matter.
- **Source:** `thesis-metadata.md` — "Whether the specialty should be written as Internet of Things and Network Security or Internet of Things and Cybersecurity according to the department template."
- **Handling:** Use "Internet of Things and Network Security" as the current best estimate. Mark as `[TODO: confirm specialty exact wording from department]`.

### C3 — pH field in raw data (policy conflict)
- **What is missing:** Official confirmation that the `soil_ph` column is a schema artifact and not a real sensor output.
- **Impact:** Without confirmation, this field is excluded from all thesis claims. Including it would be an unsupported claim.
- **Source:** `validation_summary.md` — "WARNING: EXCLUDE FROM THESIS CLAIMS" · `missing_items_checklist.md` — "Confirmation about pH column: Critical"
- **Handling:** Treat as excluded. Write a single disclaimer sentence in the limitations section: "A soil_ph field appears in the raw database export but is excluded from thesis claims as pH sensing is not confirmed by the installed sensor stack."

### C4 — Eight unverified professor-provided PDF references
- **What is missing:** Verified author, title, journal, year, DOI for:
  `rajak2023`, `iot_protocols_precision_agriculture_outdoor`, `cheap_practical_iot_agri_monitoring`, `iot_enhancements_algerian_desert_agriculture`, `hadeid_saharan_agriculture_algerian_oasis`, `desert_agriculture_food_security_algeria`, `smart_agriculture_desert_wadi_souf`, `lloret2021soil_moisture_wsn`
- **Impact:** These 8 references cannot be cited until verified. Chapter 2 sections relying on them (2.4, 2.5, 2.9, desert context) must use confirmed references instead or insert `[TODO: cite after verification]` placeholders.
- **Handling:** Use ahmed2022, pereira2023, saban2023, gubbi2013, ayaz2019, farooq2019 as primary references. Keep `[TODO: verify: rajak2023iot_smart_sensors_agriculture]` placeholders in the `.bib` and in chapter text.

---

## Priority: High (affects completeness of a specific section)

### H1 — Sensor calibration data
- **What is missing:** Calibration equations, calibration procedure, or factory calibration certificate for the RS485 soil sensor.
- **Impact:** Cannot claim calibrated soil moisture values or threshold-based conclusions. Trend analysis is still valid.
- **Source:** `missing_items_checklist.md` · `limitations.md §2`
- **Handling:** Write all soil moisture discussion as relative trend analysis. Explicitly state in Section 3.16: "Sensor calibration data were not available for this validation window. All soil moisture values are used for trend comparison only."

### H2 — Sequence Diagrams: one file or two?
- **What is missing:** Clarification on which sequence diagram files to use. `source-map.md` lists `Sequence Diagrams.png` (single file) but two files exist: `Sequence Diagrams 1.png` and `Sequence Diagrams 2.png`.
- **Impact:** Affects Chapter 3 §3.6 figure reference and LaTeX label.
- **Handling:** Include both as `fig:sequence-diagram-1` and `fig:sequence-diagram-2` if they show distinct workflow stages. If one is a draft, use only the final one. Confirm with the student.

### H3 — `ProcessedData .png` filename space
- **What is missing:** A renamed file without the space before `.png`, or confirmation that the space is intentional.
- **Impact:** LaTeX `\includegraphics` will fail with a raw space in the path unless escaped.
- **Source:** `figure-captions.md` — "The file `ProcessedData .png` contains a space before the extension. Preserve the filename when referencing the existing asset, or rename it consistently before LaTeX generation."
- **Handling:** Rename to `ProcessedData.png` before LaTeX generation. Update all references to match.

### H4 — Build/test terminal outputs
- **What is missing:** `npm run build`, `npm run typecheck`, and test terminal outputs for the WebService and dashboard.
- **Impact:** Cannot claim warning-free or error-free builds.
- **Source:** `missing_items_checklist.md`
- **Handling:** Omit build-status claims. Describe the tech stack (React/Vite/TypeScript/Node.js/Express) without claiming verified build state.

### H5 — Backend API response screenshots or JSON samples
- **What is missing:** Captured JSON responses from deployed WebService API calls.
- **Impact:** Cannot include live API response evidence in Section 3.8.
- **Source:** `missing_items_checklist.md`
- **Handling:** Describe API endpoints from `upload_api_listing.md`. Use endpoint table without captured response bodies. Mark as `[TODO: add API response sample if available]`.

### H6 — Lloret 2021 soil moisture WSN reference
- **What is missing:** Exact title, authors, volume, issue, pages, DOI from `sensors-21-07243-v2.pdf`.
- **Impact:** Cannot cite this reference in Chapter 2 §2.4 without verification.
- **Source:** `references.bib` — `lloret2021soil_moisture_wsn` has all fields as TODO.
- **Handling:** Do not cite until verified. Use `abbaari2024` (if verified) or the teh2020/dandrifosse2024 data-quality references as alternatives for Section 2.4.

---

## Priority: Medium (enhances a section but is not blocking)

### M1 — Hardware photos with labels
- **What is missing:** Component photos annotated with labels (arrows pointing to individual components).
- **Impact:** Labeled component photos improve Chapter 3 hardware description quality.
- **Source:** `missing_items_checklist.md`
- **Handling:** Use unlabeled component photos as supplied. Caption each photo clearly. Create a hardware component table (`tab:hardware-components`) to compensate for the absence of labeled diagrams.

### M2 — villa2020 and ramli2020 metadata verification
- **What is missing:** Volume, pages, DOI for `villa2020iot_arable_farming` and note says verification needed for `ramli2020adaptive_smart_farm`.
- **Impact:** These are secondary references. Their absence does not block primary Chapter 2 analysis.
- **Handling:** Use as `[TODO: verify metadata]` placeholders. Primary comparison remains ahmed2022/pereira2023/saban2023.

### M3 — alhamdani1990 temperature regimes reference
- **What is missing:** Metadata verification note present in `.bib`.
- **Impact:** Used only as minor alfalfa heat context in Chapter 1 §1.9.
- **Handling:** Verify before final submission; use FAO and Wassie 2019 as primary alfalfa refs in the interim.

### M4 — Exact battery capacity and measured autonomy
- **What is missing:** Measured battery life under Power Saving Mode conditions.
- **Impact:** Cannot claim specific hours or days of autonomy.
- **Source:** `01_project_understanding_map.md` — listed as a placeholder.
- **Handling:** Write: "Battery autonomy was not formally measured during the validation window. Power Saving Mode is designed to reduce consumption through deep sleep and relay-controlled sensor power." Do not invent or estimate a figure.

### M5 — Exact LoRa range measured in the field
- **What is missing:** Measured communication range or packet loss over distance.
- **Impact:** Cannot claim a specific range (e.g., "1 km" or "3 km") without measurement evidence.
- **Source:** `01_project_understanding_map.md` — listed as a placeholder.
- **Handling:** Write: "LoRa was selected for its long-range, low-power characteristics. The RSSI values observed in the validation dataset (–76 to –97 dBm) confirm functional communication between nodes and the gateway, though formal range characterization was not conducted."

### M6 — Constant reliability score 0.399
- **What is missing:** Explanation of why all 135 processed rows have the same reliability score.
- **Impact:** Cannot claim dynamic reliability scoring without understanding the constant output.
- **Handling:** Present it as: "A reliability indicator of 0.399 was computed uniformly across the processed analysis window, consistent with a pilot-phase evaluation where reliability thresholds were not yet field-calibrated." Do not present 0.399 as a final system result.

---

## Priority: Optional (nice-to-have, does not block writing)

### O1 — Abstract in Arabic (ملخص)
- **What is missing:** An Arabic-language abstract for the front matter.
- **Impact:** Algerian master theses typically include Arabic abstract. Without it, the front matter is incomplete.
- **Handling:** Write the English abstract first. The Arabic version can be translated by the students afterward. Mark the placeholder as `% TODO: Arabic abstract — ملخص`.

### O2 — Abstract in French (Résumé)
- **Same as O1** but in French. Students or supervisor may handle translation.
- **Handling:** Write English abstract first; insert `% TODO: Résumé` placeholder.

### O3 — Formal field GPS coordinates or location description
- **What is missing:** If the field location should be mentioned (region, governorate, or general area) for the Saharan context section.
- **Impact:** Adds specificity to §1.2 and §3.13.
- **Handling:** Use "agricultural field in the El Oued region" as a general reference if confirmed. Do not include coordinates or exact locations without student confirmation.

---

## Items Confirmed Present (no action needed)

These were listed as potential gaps in older files but are now confirmed:

| Item | Confirmed by |
|---|---|
| All 3 node prototype photos (front/back) | Directory listing confirmed |
| All 3 wiring diagrams | Directory listing confirmed |
| All 8 dashboard screenshots | Directory listing confirmed |
| ERD diagram | Directory listing confirmed |
| Overall system diagram | Directory listing confirmed |
| State machine diagram | Directory listing confirmed |
| Validation CSVs (readings, events, agronomic, uploads) | Directory + validation_summary confirmed |
| Firmware serial transcript | validation_package/04 confirmed |
| Thesis metadata (students, supervisor, institution) | thesis-metadata.md confirmed |
| Three-chapter structure | Multiple planning files confirmed |
