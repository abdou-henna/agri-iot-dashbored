# Figures and Tables Placement Plan

This file maps images, diagrams, and tables to the three-chapter thesis structure. It replaces older five-chapter placement plans.

## Chapter 1 figures

| Section | Asset | Purpose | Suggested caption | Priority |
|---|---|---|---|---|
| 1.5 IoT Communication Technologies | `Academic-Thesis/SystemImage/LoRa.png` | Show LoRa module used in project context while explaining LoRa generally | LoRa module used for long-range wireless communication in the proposed field monitoring system. | High |
| 1.7 Low-Power Operation | `Academic-Thesis/SystemImage/Relay.png` | Explain sensor power control concept | Relay module used to control sensor power during low-power operation. | Optional |
| 1.7 Low-Power Operation | `Academic-Thesis/SystemImage/Bme280.png` | Explain weather sensor and forced measurement concept | BME280 environmental sensor used by the weather node. | Optional |

## Chapter 2 tables

Figures are optional in Chapter 2. Tables are mandatory.

| Table | Placement | Purpose |
|---|---|---|
| Crop focus in previous works | 2.9 | Show that reviewed works are mostly generic, irrigation-focused, greenhouse-oriented, or not alfalfa-specific. |
| Comparative related-work analysis | 2.12 | Compare selected works against proposed system. |
| Feature matrix | 2.12 | Compare offline storage, RTC, LoRa, recovery, power saving, analytics, AI boundary, alfalfa focus. |

## Chapter 3 figures

| Section | Asset | Purpose | Suggested caption | Priority |
|---|---|---|---|---|
| 3.3 General System Architecture | `Academic-Thesis/Diagrams/overall diagram.png` | Show full architecture | Overall architecture of the proposed Smart Farm IoT monitoring and analytics platform. | Critical |
| 3.3 General System Architecture | `Academic-Thesis/Diagrams/Data Flow Diagram.png` | Show data path | Data flow from field nodes to backend, analytics, and dashboard visualization. | Critical |
| 3.4 MAIN Gateway | `Academic-Thesis/SystemImage/MainNodeFront.png` | Prototype evidence | Front view of the MAIN ESP32 gateway prototype. | Critical |
| 3.4 MAIN Gateway | `Academic-Thesis/SystemImage/MainNodeBack.png` | Prototype evidence | Back view of the MAIN ESP32 gateway prototype. | High |
| 3.4 MAIN Gateway | `Academic-Thesis/Diagrams/MainNodeWiringDiagram.png` | Wiring evidence | Wiring diagram of the MAIN gateway node. | Critical |
| 3.4 Node2 | `Academic-Thesis/SystemImage/SecondNodeFront.png` | Prototype evidence | Front view of the remote soil monitoring node. | Critical |
| 3.4 Node2 | `Academic-Thesis/SystemImage/SecondNodeBack.png` | Prototype evidence | Back view of the remote soil monitoring node. | High |
| 3.4 Node2 | `Academic-Thesis/Diagrams/Node2WiringDiagram.png` | Wiring evidence | Wiring diagram of the Node2 soil sensing unit. | Critical |
| 3.4 Node2 | `Academic-Thesis/SystemImage/SoilSensor.png` | Component evidence | RS485 soil sensor used for soil moisture, temperature, and electrical conductivity monitoring. | High |
| 3.4 Node2 | `Academic-Thesis/SystemImage/Max485.png` | Component evidence | MAX485 interface module used for RS485 communication with the soil sensor. | High |
| 3.4 Node3 | `Academic-Thesis/SystemImage/WatherNodeFront.png` | Prototype evidence | Front view of the weather monitoring node. | Critical |
| 3.4 Node3 | `Academic-Thesis/SystemImage/WatherNodeBack.png` | Prototype evidence | Back view of the weather monitoring node. | High |
| 3.4 Node3 | `Academic-Thesis/Diagrams/WatherNodeWiringDiagram.png` | Wiring evidence | Wiring diagram of the weather monitoring node. | Critical |
| 3.5 Firmware Modes | `Academic-Thesis/Diagrams/State Machine Diagram.png` | Explain operating modes | Firmware state machine showing sensing, low-power, upload, RTC synchronization, and recovery behavior. | Critical |
| 3.6 Communication Design | `Academic-Thesis/Diagrams/Sequence Diagrams.png` | Explain interactions | Sequence diagram of communication between nodes, gateway, backend, dashboard, and AI interpretation layer. | Critical |
| 3.8 Backend | `Academic-Thesis/Diagrams/DatabaseERDDiagram.png` | Show schema | PostgreSQL entity relationship diagram for the main data domains. | Critical |
| 3.10 Analytics | `Academic-Thesis/Diagrams/Activity Diagram.png` | Show processing flow | Deterministic processing activity from data validation to reliability-aware analytics. | High |
| 3.9 Dashboard | `Academic-Thesis/DashBoredImages/Overview.png` | Interface overview | Overview dashboard interface. | Critical |
| 3.9 Dashboard | `Academic-Thesis/DashBoredImages/Pivot.png` | Soil dashboard | Soil monitoring interface for pivot-level measurements. | Critical |
| 3.9 Dashboard | `Academic-Thesis/DashBoredImages/Comparison.png` | Pivot comparison | Pivot comparison interface. | Critical |
| 3.9 Dashboard | `Academic-Thesis/DashBoredImages/Weather.png` | Weather dashboard | Weather context visualization interface. | High |
| 3.11 Processed Data Viewer | `Academic-Thesis/DashBoredImages/ProcessedData .png` | Transparency interface | Processed Data Viewer showing deterministic lineage and reliability context. | Critical |
| 3.12 AI Interpretation | `Academic-Thesis/DashBoredImages/AiInsight.png` | AI UI evidence | Gemini-assisted interpretation interface constrained to deterministic analytics outputs. | High |
| 3.15 Validation | `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/01_pivot_comparison_expanded_24h.png` | Validation evidence | Validation screenshot of expanded pivot comparison over 24 hours. | High |
| 3.15 Validation | `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/02_weather_air_humidity_7d.png` | Validation evidence | Validation screenshot of seven-day air humidity visualization. | High |
| 3.15 Validation | `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/03_uploads_per_day.png` | Validation evidence | Validation screenshot of uploads per day. | High |
| 3.15 Validation | `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/04_weather_air_temperature_7d.png` | Validation evidence | Validation screenshot of seven-day air temperature visualization. | High |

## General figure rules

- Reference every figure in the text before or immediately after it appears.
- Do not include too many component photos in the main chapter; move extra component photos to appendices if needed.
- Keep dashboard screenshots as implementation/validation evidence, not decorative images.
- If file names contain spelling errors, preserve the existing file path or rename consistently before LaTeX generation.
