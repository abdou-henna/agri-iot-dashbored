# Evidence Map

Maps every confirmed project asset to its thesis role, chapter, and classification category.

---

## Section 1 — Diagrams

| File | Classification | Thesis chapter | Role | Priority |
|---|---|---|---|---|
| `Academic-Thesis/Diagrams/overall diagram.png` | diagrams | Ch3 §3.3 | Overall system architecture | Critical |
| `Academic-Thesis/Diagrams/Data Flow Diagram.png` | diagrams | Ch3 §3.3 / §3.10 | Data path from nodes to analytics | Critical |
| `Academic-Thesis/Diagrams/Use Case Diagram.png` | diagrams | Ch3 §3.2 | Functional requirements / user interaction | High |
| `Academic-Thesis/Diagrams/Sequence Diagrams 1.png` | diagrams | Ch3 §3.6 | LoRa communication workflow | High |
| `Academic-Thesis/Diagrams/Sequence Diagrams 2.png` | diagrams | Ch3 §3.6 | LoRa communication workflow (part 2) | High |
| `Academic-Thesis/Diagrams/Activity Diagram.png` | diagrams | Ch3 §3.10 | Deterministic processing workflow | High |
| `Academic-Thesis/Diagrams/State Machine Diagram.png` | diagrams | Ch3 §3.5 | Firmware operating modes | Critical |
| `Academic-Thesis/Diagrams/DatabaseERDDiagram.png` | diagrams | Ch3 §3.8 | PostgreSQL schema and domain separation | Critical |
| `Academic-Thesis/Diagrams/MainNodeWiringDiagram.png` | iot_hardware | Ch3 §3.4.1 | MAIN gateway hardware connections | Critical |
| `Academic-Thesis/Diagrams/Node2WiringDiagram.png` | iot_hardware | Ch3 §3.4.2 | Node2 soil node hardware connections | Critical |
| `Academic-Thesis/Diagrams/WatherNodeWiringDiagram.png` | iot_hardware | Ch3 §3.4.3 | Weather node hardware connections (note spelling) | Critical |

**Note on Sequence Diagrams:** The source-map lists `Sequence Diagrams.png` but two files exist: `Sequence Diagrams 1.png` and `Sequence Diagrams 2.png`. Both are present. Use whichever is the final intended version or include both if they show distinct workflow stages.

---

## Section 2 — Hardware Component Images

| File | Classification | Thesis chapter | Role | Priority |
|---|---|---|---|---|
| `Academic-Thesis/SystemImage/ESP32-38Pin.png` | iot_hardware | Ch3 §3.4.1 | MAIN gateway microcontroller | High |
| `Academic-Thesis/SystemImage/ESp32C3.png` | iot_hardware | Ch3 §3.4.2 / §3.4.3 | Remote node microcontroller | High |
| `Academic-Thesis/SystemImage/LoRa.png` | iot_hardware | Ch1 §1.5 · Ch3 §3.6 | LoRa transceiver module | High |
| `Academic-Thesis/SystemImage/Rtc.png` | iot_hardware | Ch3 §3.5.7 / §3.7 | DS3231 RTC module | High |
| `Academic-Thesis/SystemImage/SdCardModule.png` | iot_hardware | Ch3 §3.5.5 | SD card local storage module | High |
| `Academic-Thesis/SystemImage/Bme280.png` | iot_hardware | Ch1 §1.7 · Ch3 §3.4.3 | BME280 weather sensor | High |
| `Academic-Thesis/SystemImage/SoilSensor.png` | iot_hardware | Ch3 §3.4.2 | RS485 soil sensor (moisture/temp/EC) | High |
| `Academic-Thesis/SystemImage/Max485.png` | iot_hardware | Ch3 §3.4.2 | MAX485 RS485 interface | Medium |
| `Academic-Thesis/SystemImage/Relay.png` | iot_hardware | Ch1 §1.7 · Ch3 §3.5.2 | Relay for sensor power control | Medium |
| `Academic-Thesis/SystemImage/DcConv.png` | iot_hardware | Ch3 §3.4 (power) | DC-DC converter | Medium |
| `Academic-Thesis/SystemImage/Ams3.3.png` | iot_hardware | Ch3 §3.4 (power) | AMS1117 3.3V regulator | Optional |
| `Academic-Thesis/SystemImage/MainNodeFront.png` | screenshots | Ch3 §3.4.1 | MAIN gateway assembled prototype (front) | Critical |
| `Academic-Thesis/SystemImage/MainNodeBack.png` | screenshots | Ch3 §3.4.1 | MAIN gateway assembled prototype (back) | High |
| `Academic-Thesis/SystemImage/SecondNodeFront.png` | screenshots | Ch3 §3.4.2 | Node2 soil node prototype (front) | Critical |
| `Academic-Thesis/SystemImage/SecondNodeBack.png` | screenshots | Ch3 §3.4.2 | Node2 soil node prototype (back) | High |
| `Academic-Thesis/SystemImage/WatherNodeFront.png` | screenshots | Ch3 §3.4.3 | Weather node prototype (front) | Critical |
| `Academic-Thesis/SystemImage/WatherNodeBack.png` | screenshots | Ch3 §3.4.3 | Weather node prototype (back) | High |

---

## Section 3 — Dashboard Screenshots

All from `Academic-Thesis/DashBoredImages/`. These are confirmed final dashboard screenshots, not generated images.

| File | Classification | Thesis chapter | Role | Priority |
|---|---|---|---|---|
| `Overview.png` | dashboard_ui | Ch3 §3.9 | Dashboard overview interface | Critical |
| `Pivot.png` | dashboard_ui | Ch3 §3.9 | Pivot soil monitoring interface | Critical |
| `Comparison.png` | dashboard_ui | Ch3 §3.9 | Pivot comparison interface | Critical |
| `Weather.png` | dashboard_ui | Ch3 §3.9 | Weather context interface | High |
| `Insights.png` | dashboard_ui | Ch3 §3.10 | Deterministic analytics insights | High |
| `ProcessedData .png` | dashboard_ui | Ch3 §3.11 | Processed Data Viewer (lineage/transparency) | Critical |
| `AiInsight.png` | dashboard_ui | Ch3 §3.12 | Gemini interpretation UI | High |
| `FieldNotes.png` | dashboard_ui | Ch3 §3.9 | Manual agronomic events / field notes | High |

**Note:** Filename `ProcessedData .png` contains a space before the extension. Must rename to `ProcessedData.png` before LaTeX generation, or escape carefully in the `\includegraphics` path.

---

## Section 4 — Validation Evidence

| File | Classification | Thesis chapter | Role |
|---|---|---|---|
| `validation_package/01_original_inputs/readings_2026-05-06_to_2026-05-11_1500.csv` | results | Ch3 §3.15 | 2433 sensor records (MAIN/N2/N3) |
| `validation_package/01_original_inputs/events_2026-05-06_to_2026-05-11_1500.csv` | results | Ch3 §3.15 | 8 system events |
| `validation_package/01_original_inputs/agronomic_events_2026-05-06_to_2026-05-11_1500.csv` | results | Ch3 §3.14 / §3.15 | 6 agronomic events (irrigation/fertilization/notes) |
| `validation_package/01_original_inputs/uploads_2026-05-06_to_2026-05-11_1500.csv` | results | Ch3 §3.15 | 6 upload sessions |
| `validation_package/01_original_inputs/upload_queue_2026-05-06_to_2026-05-11_1500.jsonl` | results | Ch3 §3.15 | Upload queue (offline-first evidence) |
| `validation_package/01_original_inputs/processed_data_sensor_readings...csv` | results | Ch3 §3.11 | Processed MAIN soil moisture (135 rows) |
| `validation_package/02_validation_evidence/final_validation_evidence.md` | results | Ch3 §3.15 | Main validation evidence document |
| `validation_package/02_validation_evidence/validation_summary.md` | results | Ch3 §3.15 | Summary table with per-node stats |
| `validation_package/02_validation_evidence/validation_table.csv` | results | Ch3 §3.15 | Structured validation test table |
| `validation_package/02_validation_evidence/dashboard_screenshots/01_pivot_comparison_expanded_24h.png` | results | Ch3 §3.15 | Validation: 24h pivot comparison |
| `validation_package/02_validation_evidence/dashboard_screenshots/02_weather_air_humidity_7d.png` | results | Ch3 §3.15 | Validation: 7d air humidity |
| `validation_package/02_validation_evidence/dashboard_screenshots/03_uploads_per_day.png` | results | Ch3 §3.15 | Validation: uploads per day |
| `validation_package/02_validation_evidence/dashboard_screenshots/04_weather_air_temperature_7d.png` | results | Ch3 §3.15 | Validation: 7d air temperature |
| `validation_package/04_firmware_serial/esp32_serial_aligned_2026-05-06_to_2026-05-11.md` | results | Ch3 §3.15 | Firmware serial behavior evidence |
| `validation_package/03_manual_agronomic_context/manual_agronomic_context.md` | results | Ch3 §3.14 | Agronomic event context and alignment |
| `validation_package/05_api_and_analytics/qc_reliability_flowchart.md` | results | Ch3 §3.10 | QC and reliability pipeline description |
| `validation_package/05_api_and_analytics/upload_api_listing.md` | backend_webservice | Ch3 §3.8 | API endpoint evidence |

---

## Section 5 — Validated Sensor Data Summary

| Metric | Value | Thesis interpretation |
|---|---|---|
| Total sensor readings | 2433 | Multi-node data acquisition confirmed |
| Nodes covered | MAIN, N2, N3 | All three sensing roles confirmed |
| Records per node | 811 each | Symmetric coverage |
| Time window | 2026-05-06T00:00Z → 2026-05-11T15:00Z | 5.6-day pilot window |
| ok_rows | 811/811 per node | No status anomalies in provided dataset |
| System events | 8 | Includes node-missing, irrigation-completed, heat-stress warning |
| Agronomic events | 6 | Irrigation (4), fertilization (1), field_note (1) |
| Upload sessions | 6 | All status `processed`; error_count sum = 3 |
| Processed data rows | 135 | MAIN soil moisture; reliability = 0.399 (constant) |
| RSSI (MAIN) | –85.4 dBm avg | Functional LoRa range |
| RSSI (N2) | –97.0 dBm avg | Further or obstructed node |
| RSSI (N3) | –76.4 dBm avg | Closest or best-positioned node |

---

## Section 6 — References Evidence Map

### Confirmed (verified metadata, safe to cite)

| Key | Type | Chapter use |
|---|---|---|
| `ahmed2022lora_agriculture_chile` | Article · Sensors | Ch2 main comparison |
| `pereira2023esp32_drip_irrigation` | Article · IoT journal | Ch2 main comparison |
| `saban2023smart_agricultural_lora_cloud` | Article · Sensors | Ch2 main comparison |
| `gubbi2013iot_vision` | Article | Ch1 IoT background |
| `ayaz2019iot_smart_agriculture_survey` | Article · IEEE Access | Ch1 smart agriculture |
| `farooq2019iot_smart_agriculture_review` | Article · IEEE Access | Ch1 smart agriculture |
| `fao_alflafa_crop_water` | FAO web | Ch1 alfalfa background |
| `mueller2007alfalfa_growth_development` | Tech report · UC ANR | Ch1 alfalfa |
| `irmak2007irrigation_alfalfa` | Tech report · UNL | Ch1 alfalfa irrigation |
| `orloff2015drought_strategies_alfalfa` | Tech report · UC ANR | Ch1 alfalfa drought |
| `wassie2019heat_stress_alfalfa` | Article | Ch1 alfalfa heat stress |
| `espressif2024esp32_datasheet` | Manual | Ch3 hardware |
| `semtech2020sx127x_datasheet` | Manual | Ch3 communication |
| `loraalliance2020lorawan_104` | Manual | Ch1/Ch3 LoRa |
| `bosch2024bme280_datasheet` | Manual | Ch3 hardware |
| `maxim2013ds3231_datasheet` | Manual | Ch3 hardware |
| `analog2017max485_datasheet` | Manual | Ch3 hardware |
| `modbus2012application_protocol` | Manual | Ch3 RS485/Modbus |
| `postgresql2025docs16` | Manual | Ch3 backend |
| `teh2020sensor_data_quality` | Article | Ch1/Ch3 data quality |
| `dandrifosse2024weather_qc_agriculture` | Article | Ch3 QC layer |
| `nrcs1999soil_electrical_conductivity` | Tech report | Ch1 EC background |
| `benabdelouahab2019sensor_calibration_5te` | Article | Ch1 soil sensor calibration |

### Unverified — require metadata confirmation before citing

| Key | Issue |
|---|---|
| `villa2020iot_arable_farming` | Volume/pages/DOI missing |
| `rajak2023iot_smart_sensors_agriculture` | Authors/journal/year all unverified |
| `iot_protocols_precision_agriculture_outdoor` | Authors/journal/year all unverified |
| `abbaari2024data_collection_iot_networks` | Full author list/DOI unverified |
| `cheap_practical_iot_agri_monitoring` | Authors/journal/year all unverified |
| `iot_enhancements_algerian_desert_agriculture` | Authors/journal/year all unverified |
| `hadeid_saharan_agriculture_algerian_oasis` | Title/journal unverified |
| `desert_agriculture_food_security_algeria` | Authors/journal/year all unverified |
| `smart_agriculture_desert_wadi_souf` | Authors/journal/year all unverified |
| `lloret2021soil_moisture_wsn` | Title/authors/volume all unverified |
| `pylianidis2021digital_twins_agriculture` | Metadata listed but note says verify |
| `ramli2020adaptive_smart_farm` | Note says metadata requires verification |

---

## Section 7 — IoTSystem Documentation Available

| File | Classification | Thesis use |
|---|---|---|
| `IoTSystem/Main_Node/README.md` | iot_firmware | Ch3 §3.4.1 gateway architecture |
| `IoTSystem/Node2_Soil/README.md` | iot_firmware | Ch3 §3.4.2 soil node |
| `IoTSystem/Node3_Weather/README.md` | iot_firmware | Ch3 §3.4.3 weather node |
| `IoTSystem/power_saving_strategy.md` | iot_firmware | Ch3 §3.5.2 Power Saving Mode motivation |
| `IoTSystem/recovery_resynchronization_strategy.md` | iot_firmware | Ch3 §3.5.4 Recovery Mode motivation |
| `IoTSystem/soil_sensor_protocol.md` | iot_firmware | Ch3 §3.4.2 RS485/Modbus |
| `IoTSystem/connection.md` | data_flow | Ch3 §3.6 communication design |
| `IoTSystem/Pin_Mapping.md` | iot_hardware | Ch3 §3.4 pin mapping table |
| `IoTSystem/iot_data_system_design.md` | data_flow | Ch3 §3.7 storage and time policy |
| `IoTSystem/debug_strategy.md` | iot_firmware | Ch3 §3.5.8 diagnostic logging |
