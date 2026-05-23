# Related Work Selection Matrix

## Purpose

This file selects the works to be used in Chapter 2 and explains why each one belongs there. It is a planning document, not the chapter text.

## Main works to use

| No. | Work / reference key | Role in Chapter 2 | Comparison angle | Notes |
|---:|---|---|---|---|
| 1 | `ahmed2022lora_agriculture_chile` | LoRa agricultural monitoring | LoRa farm monitoring vs offline-first LoRa gateway with RTC, SD, analytics | Strong peer-reviewed Sensors paper. |
| 2 | `pereira2023esp32_drip_irrigation` | ESP32 irrigation system | ESP32 irrigation automation vs alfalfa monitoring and analytics platform | Strong ESP32 comparison. |
| 3 | `saban2023smart_agricultural_lora_cloud` | LoRa/cloud smart agriculture | Cloud/LoRa system vs domain-separated backend and deterministic analytics | Strong web/cloud comparison. |
| 4 | `villa2020iot_arable_farming` | Broad IoT farming review | General IoT challenges vs implemented prototype | Add metadata verification. |
| 5 | `rajak2023iot_smart_sensors_agriculture` | Smart sensors review | General sensors vs project-specific field system | Add metadata verification. |
| 6 | `iot_protocols_precision_agriculture_outdoor` | Communication protocols | Outdoor communication challenges and LoRa justification | Metadata from professor folder should be verified. |
| 7 | `abbaari2024data_collection_iot_networks` | IoT data collection architecture | General IoT collection theory vs field crop implementation | Professor folder includes IET paper. |
| 8 | `cheap_practical_iot_agri_monitoring` | Low-cost monitoring | Simple monitoring vs multi-node LoRa, RTC, SD, analytics | Metadata must be verified from PDF. |
| 9 | `iot_enhancements_algerian_desert_agriculture` | Local desert agriculture | Regional relevance vs complete alfalfa-focused prototype | Metadata must be verified from PDF. |
| 10 | `lloret2021soil_moisture_wsn` | Soil moisture WSN | Soil monitoring vs integrated soil/weather/backend/dashboard/analytics | Use if metadata verified. |

## Supporting references

Use these mainly in Chapter 1 and supporting parts of Chapter 2:

- Alfalfa: FAO, Mueller, Irmak, Orloff, Wassie.
- IoT and smart agriculture surveys: Ayaz, Farooq, Gubbi.
- Components and protocols: Espressif, Semtech, LoRa Alliance, Bosch, Maxim/Analog, Modbus, PostgreSQL.
- Desert agriculture context: Hadeid, Wadi Souf/desert agriculture files from professor folder.

## Mandatory Chapter 2 gap framing

The chapter must explicitly show that the reviewed works do not target alfalfa as the main crop. The claim must be careful: use “in the reviewed works” and “limited attention” rather than absolute global claims.

## Works to avoid as main comparisons

- Disease/pathogen detection papers: outside thesis scope.
- Remote sensing/satellite vegetation papers: not field IoT data collection.
- Greenhouse-only Raspberry Pi systems: useful only as minor support, not a main comparison.
- AI-heavy prediction works: future-work relevance only because the current project does not implement prediction.
- Crop-specific works unrelated to alfalfa and not IoT field monitoring: local context only if needed.
