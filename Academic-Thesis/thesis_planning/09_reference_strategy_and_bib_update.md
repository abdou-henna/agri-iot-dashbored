# Reference Strategy and Bibliography Update Plan

## Purpose

This file explains how references should be used and what was updated for the new three-chapter plan.

## Reference-use principles

1. Chapter 1 uses references to build background: smart agriculture, IoT, communication, low power, reliability, data collection, and alfalfa.
2. Chapter 2 uses references for related works and comparison.
3. Chapter 3 uses fewer citations and mainly cites technical standards/datasheets when explaining components or protocols.
4. Project implementation claims should be supported by project files, not external citations.
5. Do not cite private files, secrets, credentials, or local-only configuration files.
6. If professor-provided PDF metadata is incomplete, keep a TODO marker until verified.

## Updated bibliography file

Use:

`references/references_updated.bib`

This file starts from the existing project bibliography and adds planned entries for the professor-provided IoT Agro works where metadata must be verified.

## References that must be verified before final submission

- `villa2020iot_arable_farming`
- `rajak2023iot_smart_sensors_agriculture`
- `iot_protocols_precision_agriculture_outdoor`
- `cheap_practical_iot_agri_monitoring`
- `iot_enhancements_algerian_desert_agriculture`
- `desert_agriculture_food_security_algeria`
- `smart_agriculture_desert_wadi_souf`
- `hadeid_saharan_agriculture_algerian_oasis`

## Citation placement by chapter

### Chapter 1

Use citations heavily for:

- Saharan agriculture.
- IoT and smart agriculture.
- Communication technologies.
- Low-power IoT.
- Alfalfa crop background.

### Chapter 2

Use citations for every related work and comparative claim. Each selected work should have a paragraph or grouped discussion and be present in at least one comparison table.

### Chapter 3

Use citations for:

- ESP32 datasheet.
- LoRa/SX127x datasheet or LoRaWAN specification, if discussed.
- BME280 datasheet.
- DS3231 RTC datasheet.
- MAX485/RS485 datasheet or Modbus specifications.
- PostgreSQL documentation if database choice is discussed.

## Anti-plagiarism reminder

Do not paraphrase a source paragraph. Extract the function of the paragraph and rebuild it using project-specific details.
