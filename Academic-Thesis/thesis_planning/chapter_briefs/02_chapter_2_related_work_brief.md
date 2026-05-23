# Chapter 2 Writing Brief — Related Works and Comparative Analysis

This is the most important planning file for Chapter 2. It defines exactly what the future writing skill must compare and how to avoid plagiarism.

## Chapter purpose

Analyze previous work thematically and comparatively. The chapter must show what previous systems achieved, what limitations remain, and how the proposed Smart Farm IoT system improves them. This is not a list of papers. It must be a critical academic comparison.

## Proposed title

**Chapter 2: Related Works and Comparative Analysis**

## Anti-plagiarism rule

For every reference:

1. Identify what the work proposed.
2. Extract its function and contribution.
3. Reconstruct the comparison using our project evidence.
4. Do not copy source sentences.
5. Do not translate paragraphs from older theses.
6. Cite only claims supported by references.
7. Do not borrow numeric performance results unless they are directly relevant and accurately cited.

## Selected number of works

Use approximately **10 main related works** plus **supporting references**. This is enough for a strong Master thesis chapter without overloading the analysis.

## Main comparison works

### Work 1 — Ahmed et al. 2022, LoRa agriculture monitoring

Use for:

- LoRa-based agricultural monitoring.
- Remote farm monitoring architecture.
- Comparing LoRa platform design with our offline-first, RTC-governed, deterministic analytics system.

Compare against our project:

- Our system uses MAIN gateway + LoRa + ACK/recovery.
- Our system separates measurement time from upload time.
- Our system adds SD local storage, deterministic analytics, Processed Data Viewer, and AI interpretation boundary.

### Work 2 — Pereira et al. 2023, ESP32 smart drip irrigation

Use for:

- ESP32 in agriculture.
- Smart irrigation and embedded sensing.
- Dashboard/cloud-based monitoring/control comparison.

Compare against our project:

- Their focus is irrigation automation.
- Our focus is alfalfa monitoring, data collection, reliability, and analytics.
- Our system is upload-driven and offline-first.

### Work 3 — Saban et al. 2023, PLC/cloud/LoRa smart agriculture

Use for:

- LoRa/LoRaWAN and web application in smart agriculture.
- Cloud agricultural monitoring/control.

Compare against our project:

- Our system uses PostgreSQL domain separation and deterministic analytics.
- Our system includes RTC time policy, SD local storage, and Gemini interpretation-only boundary.

### Work 4 — Villa-Henriksen et al., IoT in arable farming

Use for:

- Broad IoT farming challenges and opportunities.
- State-of-the-art context.

Compare against our project:

- Survey-level reference, not a complete alfalfa field implementation.
- Our work provides a concrete field-oriented prototype.

### Work 5 — Rajak et al., IoT and smart sensors in agriculture

Use for:

- General smart sensor background.
- Sensor deployment and IoT agriculture challenges.

Compare against our project:

- General review vs implemented system.
- Our project adds complete firmware/backend/dashboard/analytics integration.

### Work 6 — Outdoor IoT communication protocols for precision agriculture

Use for:

- Communication protocol comparison in outdoor environments.
- Justifying LoRa relative to other wireless technologies.

Compare against our project:

- Our system operationalizes LoRa in a node-gateway topology with ACK/recovery and offline storage.

### Work 7 — Data collection in IoT networks

Use for:

- Architecture, protocols, and challenges of IoT data collection.
- General data collection theory.

Compare against our project:

- Our project applies data collection architecture to a crop-specific agricultural field system.

### Work 8 — A Cheap and Practical IoT Solution for Agricultural Data Monitoring

Use for:

- Low-cost agricultural monitoring.
- Practical IoT deployment.

Compare against our project:

- Our project extends monitoring with multi-node LoRa, RTC, SD, deterministic analytics, and processed-data transparency.

### Work 9 — IoT enhancements in Algerian desert agriculture

Use for:

- Local/Saharan/Algerian context.
- Need for desert agriculture digitalization.

Compare against our project:

- Our system gives a concrete alfalfa-focused prototype rather than only a general desert-agriculture discussion.

### Work 10 — Wireless sensor network soil moisture monitoring / Lloret-type WSN reference

Use for:

- Soil moisture monitoring and wireless sensor networks.
- Field sensing relevance.

Compare against our project:

- Their focus is WSN/soil moisture.
- Our project integrates soil, weather, diagnostics, upload audit, agronomic events, dashboard, analytics, and AI interpretation.

## Required chapter sections

### 2.1 Introduction

Explain that the chapter compares previous works according to system architecture, communication, energy, recovery, offline storage, timestamp integrity, dashboards, analytics, AI, and crop focus.

### 2.2 IoT-Based Agricultural Monitoring Systems

Use works about general monitoring, smart sensors, ESP32, and low-cost agriculture systems.

Must discuss:

- What they monitor.
- What hardware or platform they use.
- Whether they are field-oriented or controlled-environment systems.
- Their limitations relative to our project.

### 2.3 Wireless Communication in Agricultural IoT

Use LoRa/LoRaWAN and protocol comparison works.

Must discuss:

- LoRa suitability.
- Outdoor connectivity constraints.
- Long-range/low-power tradeoff.
- Difference between communication feasibility and a complete reliable data platform.

### 2.4 Soil and Environmental Data Collection Systems

Use WSN and soil moisture monitoring works.

Must discuss:

- Soil moisture as a frequent monitoring target.
- Environmental sensing.
- Lack of integrated field-operation context in many systems.

### 2.5 Energy Management and Field Reliability

Must compare previous works against our field modes:

- Power Saving Mode caused by battery and unstable field electricity.
- Recovery Mode caused by observed desynchronization after failed node communication.
- ACK/retry/diagnostic logging.

Do not claim other works never discuss energy unless the selected reference confirms it. Use cautious language: “not always detailed,” “often secondary,” or “not the central contribution.”

### 2.6 Offline Storage and Upload Strategies

Must emphasize:

- Many systems assume continuous connectivity or realtime cloud communication.
- Our system supports SD-first storage.
- Upload Mode is triggered manually by long continuous push-button press.
- Upload time is transfer metadata, not analysis time.

### 2.7 Time Synchronization and Data Integrity

Must emphasize:

- Measurement time is essential for analytics.
- Many works do not foreground timestamp semantics.
- Our system uses RTC as authoritative local time.
- RTC Sync Mode is triggered by four consecutive push-button presses.
- `measured_at` is the analytical time axis.

### 2.8 Dashboards, Analytics, and AI Interpretation

Must compare:

- Simple dashboards and cloud monitoring vs our dashboard.
- Charts-only systems vs reliability/QC/processed-data transparency.
- AI decision/prediction systems vs our AI interpretation-only boundary.

### 2.9 Previous Crop Targets in Existing Works

Must include a crop-focus table.

Purpose:

Show that previous works often focus on general irrigation, greenhouse plants, generic crops, soil moisture, or desert agriculture broadly.

Table columns:

- Work
- Crop/context
- Main technical focus
- Is alfalfa the target crop?
- Relevance to our thesis

### 2.10 Crop-Specific Gap: Lack of IoT Studies on Alfalfa

This section is mandatory.

Must state carefully:

- In the reviewed works, alfalfa was not the main target crop.
- Alfalfa is important because it is a forage crop, fast-growing, repeatedly harvested, and locally relevant.
- Local/Saharan/Algerian digital monitoring studies targeting alfalfa are limited.
- Therefore the project contribution is both technical and crop-specific.

Avoid absolute global claims such as “no work exists anywhere.” Use evidence-bound wording.

### 2.11 Proposed System Improvements

Must list improvements thematically:

- Crop focus: alfalfa.
- Offline-first architecture.
- LoRa node-to-gateway design.
- Push-button Upload Mode.
- Push-button RTC Sync Mode.
- Recovery Mode.
- Power Saving Mode.
- SD CSV/JSONL storage.
- RTC `measured_at` policy.
- Domain separation.
- Deterministic analytics.
- Processed Data Viewer.
- AI interpretation-only.

### 2.12 Comparative Analysis Table

Must include a strong comparison table with columns:

- Reference
- Crop/context
- Main contribution
- Limitations/gaps
- Improvement in proposed system

Also include a second compact feature matrix:

- LoRa
- Offline storage
- RTC time policy
- Power saving
- Recovery mode
- Dashboard
- QC/reliability
- Processed-data transparency
- AI boundary
- Alfalfa-specific focus

### 2.13 Chapter Summary

Summarize the research gap and transition to Chapter 3. End by stating that Chapter 3 presents the proposed system design and implementation that responds to the identified gaps.

## Required figures and tables for Chapter 2

Figures are optional in Chapter 2. Tables are mandatory.

Mandatory tables:

1. Related work crop-focus table.
2. Related work comparative analysis table.
3. Feature matrix comparing previous works and the proposed system.

## Reference notes

Use `references/related_work_selection_matrix.md` and `references/references_updated.bib` from this workspace.

If a professor-provided PDF has incomplete metadata, cite it only after verifying its bibliographic details. Until then, use `[TODO: verify bibliographic metadata]` in the reference plan.
