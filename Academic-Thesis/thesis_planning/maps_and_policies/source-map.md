# Updated Source Map — Three-Chapter Thesis Plan

## Purpose

This source map replaces older mapping files that assumed more than three chapters. It defines how project assets must be used when writing the supervisor-required three-chapter thesis.

## Thesis identity

| Item | Value |
|---|---|
| Project | Smart Farm IoT Monitoring and Deterministic Agronomic Analytics Platform |
| Target crop | Alfalfa |
| Context | Agricultural/Saharan field monitoring with offline-first IoT data collection |
| Final structure | General Introduction + 3 chapters + General Conclusion |

## Files not to use as thesis evidence

Do not cite or reproduce:

- Private database files.
- Environment files.
- API keys.
- WiFi credentials.
- Raw secret-bearing firmware constants.
- `node_modules`, `dist`, `.git`, local IDE settings, generated dependencies.

These may be used only internally to understand project structure, not as thesis content.

## Chapter 1 source map

| Section | Sources | Purpose |
|---|---|---|
| Saharan agriculture | IoT Agro desert agriculture PDFs; supporting references | Context and local motivation |
| Data collection | IoT data collection references; data-field-policy | Explain measurement, transfer, and traceability concepts |
| IoT and smart agriculture | IoT surveys; references.bib | Technical background |
| Communication technologies | LoRa/LoRaWAN docs; communication protocol PDFs; LoRa image | Explain why LoRa fits field monitoring |
| Low-power IoT | component photos and references | Prepare for Power Saving Mode |
| Reliability/recovery | IoT data collection and WSN references | Prepare for Recovery Mode |
| Alfalfa | FAO and alfalfa technical reports | Explain crop value and monitoring relevance |

## Chapter 2 source map

| Section | Sources | Purpose |
|---|---|---|
| IoT monitoring systems | Pereira, cheap practical IoT, Rajak, surveys | Establish existing monitoring approaches |
| Wireless communication | Ahmed, Saban, communication protocols papers | Compare LoRa and outdoor communication |
| Soil/environment data collection | Lloret-type WSN paper, sensor monitoring papers | Compare soil/weather monitoring focus |
| Energy/reliability | Data collection and communication references | Compare power/recovery coverage |
| Offline upload and time policy | Related works + project architecture | Show gap in offline-first and RTC policy |
| Crop-specific gap | All selected works + alfalfa refs | Show alfalfa is not central in reviewed works |
| Comparative tables | related_work_selection_matrix.md | Build final comparison |

## Chapter 3 source map

| Section | Sources | Purpose |
|---|---|---|
| Requirements | Project docs, source-map, data-field-policy | Define what system must do |
| Architecture | overall diagram, data flow diagram | Explain layers |
| Hardware | SystemImage and wiring diagrams | Explain components and node roles |
| Firmware modes | IoTSystem code/docs, state machine diagram, serial notes | Explain operating modes and motivation |
| Communication | sequence diagram, LoRa code/docs | Explain LoRa RX/ACK and recovery |
| Storage/time | data-field-policy, database docs, firmware storage | Explain SD, CSV/JSONL, measured_at |
| Backend | WebService source/docs, ERD | Explain API/database/ingestion |
| Dashboard | DashBoredImages and dashboard docs/code | Explain UI features |
| Analytics | dashboard analytics docs/code, QC flowchart | Explain deterministic processing |
| AI | Gemini UI/backend docs/code | Explain interpretation boundary |
| Validation | validation_package | Explain test evidence and results |
| Limitations | limitations files | State supported scope |

## Asset list discovered in current project

- `Academic-Thesis/DashBoredImages/AiInsight.png`
- `Academic-Thesis/DashBoredImages/Comparison.png`
- `Academic-Thesis/DashBoredImages/FieldNotes.png`
- `Academic-Thesis/DashBoredImages/Insights.png`
- `Academic-Thesis/DashBoredImages/Overview.png`
- `Academic-Thesis/DashBoredImages/Pivot.png`
- `Academic-Thesis/DashBoredImages/ProcessedData .png`
- `Academic-Thesis/DashBoredImages/Weather.png`
- `Academic-Thesis/Diagrams/Activity Diagram.png`
- `Academic-Thesis/Diagrams/Data Flow Diagram.png`
- `Academic-Thesis/Diagrams/DatabaseERDDiagram.png`
- `Academic-Thesis/Diagrams/MainNodeWiringDiagram.png`
- `Academic-Thesis/Diagrams/Node2WiringDiagram.png`
- `Academic-Thesis/Diagrams/Sequence Diagrams.png`
- `Academic-Thesis/Diagrams/State Machine Diagram.png`
- `Academic-Thesis/Diagrams/Use Case Diagram.png`
- `Academic-Thesis/Diagrams/WatherNodeWiringDiagram.png`
- `Academic-Thesis/Diagrams/overall diagram.png`
- `Academic-Thesis/SystemImage/Ams3.3.png`
- `Academic-Thesis/SystemImage/Bme280.png`
- `Academic-Thesis/SystemImage/DcConv.png`
- `Academic-Thesis/SystemImage/ESP32-38Pin.png`
- `Academic-Thesis/SystemImage/ESp32C3.png`
- `Academic-Thesis/SystemImage/LoRa.png`
- `Academic-Thesis/SystemImage/MainNodeBack.png`
- `Academic-Thesis/SystemImage/MainNodeFront.png`
- `Academic-Thesis/SystemImage/Max485.png`
- `Academic-Thesis/SystemImage/Relay.png`
- `Academic-Thesis/SystemImage/Rtc.png`
- `Academic-Thesis/SystemImage/SdCardModule.png`
- `Academic-Thesis/SystemImage/SecondNodeBack.png`
- `Academic-Thesis/SystemImage/SecondNodeFront.png`
- `Academic-Thesis/SystemImage/SoilSensor.png`
- `Academic-Thesis/SystemImage/WatherNodeBack.png`
- `Academic-Thesis/SystemImage/WatherNodeFront.png`
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/01_pivot_comparison_expanded_24h.png`
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/02_weather_air_humidity_7d.png`
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/03_uploads_per_day.png`
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/04_weather_air_temperature_7d.png`
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/README.md`
- `Academic-Thesis/validation_package/02_validation_evidence/final_validation_evidence.md`
- `Academic-Thesis/validation_package/02_validation_evidence/validation_summary.md`
- `Academic-Thesis/validation_package/02_validation_evidence/validation_table.csv`
