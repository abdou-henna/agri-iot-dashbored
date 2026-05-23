# Reference Usage Map — Smart Farm IoT Thesis

| BibTeX key | source type | topic/category | thesis chapter where it should be cited | reason for use | confidence |
|---|---|---|---|---|---|
| `ahmed2022lora_agriculture_chile` | peer-reviewed article | Related work; LoRa agriculture | Chapter 1 | Comparison work 1: strong LoRa agriculture platform; contrasts with our offline-first RTC/QC analytics system | High |
| `pereira2023esp32_drip_irrigation` | peer-reviewed article | Related work; ESP32 irrigation | Chapter 1 | Comparison work 2: ESP32 irrigation automation; contrasts with our dual-pivot data governance and analytics | High |
| `saban2023smart_agricultural_lora_cloud` | peer-reviewed article | Related work; cloud/LoRa smart farm | Chapter 1 | Comparison work 3: LoRa/LoRaWAN + cloud web application; contrasts with our PostgreSQL, processed viewer, and AI boundary | High |
| `ramli2020adaptive_smart_farm` | peer-reviewed article | Reliable smart farm networking | Chapter 1/4 | Supports reliability-aware IoT farm architecture discussion | Needs verification |
| `pylianidis2021digital_twins_agriculture` | peer-reviewed article | Digital twins/agricultural data systems | Chapter 1 | Supports broader smart agriculture/data-driven farming context | High |
| `teh2020sensor_data_quality` | systematic review | Sensor data quality | Chapter 4 | Supports QC, missing data, drift, outlier, and reliability layer | High |
| `dandrifosse2024weather_qc_agriculture` | peer-reviewed article | Agricultural weather QC | Chapter 4/5 | Supports automated QC checks for agricultural weather data and validation discussion | High |
| `espressif2024esp32_datasheet` | official datasheet/manual | ESP32 hardware | Chapter 3 | Supports microcontroller capabilities and IoT suitability | High |
| `semtech2020sx127x_datasheet` | official datasheet/manual | SX1278 LoRa transceiver | Chapter 3 | Supports LoRa transceiver characteristics | High |
| `loraalliance2020lorawan_104` | official specification | LoRaWAN/LPWAN protocol | Chapter 1/3 | Supports LoRaWAN theory and low-power network background; note project uses LoRa node-gateway link, not necessarily full LoRaWAN | High |
| `bosch2024bme280_datasheet` | official datasheet/manual | BME280 environmental sensor | Chapter 3 | Supports weather node measurement variables | Needs verification |
| `maxim2013ds3231_datasheet` | official datasheet/manual | DS3231 RTC | Chapter 3 | Supports RTC authoritative timestamp design | Needs verification |
| `analog2017max485_datasheet` | official datasheet/manual | RS485 transceiver | Chapter 3 | Supports RS485 electrical communication layer | High |
| `modbus2012application_protocol` | official specification | Modbus protocol | Chapter 3 | Supports RS485/Modbus soil sensor communication explanation | High |
| `modbus2006serial_line` | official specification | Modbus serial line | Chapter 3 | Supports serial Modbus implementation detail | High |
| `postgresql2025docs16` | official documentation | PostgreSQL database | Chapter 4 | Supports database technology reference if needed | High |
| `allen1998fao56` | authoritative book/manual | ET, VPD, evapotranspiration | Chapter 1/4 | Supports VPD formula and why full ET is deferred without wind/radiation | High |
| `fao_alflafa_crop_water` | FAO official crop page | Alfalfa water/salinity context | Chapter 1 | Supports crop background and salinity boundary | Medium |
| `mueller2007alfalfa_growth_development` | extension technical chapter | Alfalfa establishment/temperature | Chapter 1/2 | Supports why alfalfa needs crop-specific context | High |
| `orloff2008harvest_strategies_alfalfa` | extension technical chapter | Cutting/regrowth | Chapter 1/5 | Supports cutting interval and regrowth discussion | Needs verification |
| `irmak2007irrigation_alfalfa` | extension technical guide | Alfalfa irrigation | Chapter 1/5 | Supports alfalfa water use and irrigation management context | High |
| `orloff2015drought_strategies_alfalfa` | extension publication | Alfalfa drought/water | Chapter 1/5 | Supports drought and water-management limitations | High |
| `hanson2011drought_irrigation_alfalfa` | extension publication | Drought irrigation | Chapter 1/5 | Supports irrigation strategy context for alfalfa | High |
| `wassie2019heat_stress_alfalfa` | peer-reviewed article | Alfalfa heat stress | Chapter 1/4 | Supports heat-stress contextual analytics | Needs verification |
| `alhamdani1990temperature_regimes_alfalfa` | peer-reviewed/proceedings article | Alfalfa temperature/regrowth physiology | Chapter 1 | Supports temperature and regrowth relationship | Needs verification |
| `nrcs1999soil_electrical_conductivity` | government technical sheet | Soil EC interpretation | Chapter 1/4 | Supports raw EC limitation and salinity caution | Needs verification |
| `benabdelouahab2019sensor_calibration_5te` | peer-reviewed article | Soil moisture/salinity sensor calibration | Chapter 4 | Supports EC/moisture calibration limitation | Needs verification |
| `frate2008alfalfa_diseases` | extension technical chapter | Disease boundary | Chapter 1/5 | Supports why disease diagnosis is excluded | Needs verification |
| `tarkalson2005fertilizer_management_alfalfa` | extension publication | Fertilization/nutrient limits | Chapter 1/5 | Supports no nutrient diagnosis without tests | Needs verification |
| `utahstate2024alfalfa_nutrient_management` | extension publication | Nutrient management | Chapter 1/5 | Supports fertilization context and limitations | Needs verification |
| `gubbi2013iot_vision` | peer-reviewed article | IoT background | Chapter 1 | General IoT architecture background | High |
| `ayaz2019iot_smart_agriculture_survey` | peer-reviewed article | Smart agriculture survey | Chapter 1 | Broad smart agriculture and IoT review | Needs verification |
| `farooq2019iot_smart_agriculture_review` | peer-reviewed article | Smart farming survey | Chapter 1 | Broad IoT agriculture survey and related work support | Needs verification |

## The three selected comparison works

1. `ahmed2022lora_agriculture_chile` — use to compare LoRa-based agricultural monitoring.
2. `pereira2023esp32_drip_irrigation` — use to compare ESP32 irrigation automation.
3. `saban2023smart_agricultural_lora_cloud` — use to compare LoRa/LoRaWAN plus cloud web application architecture.

These three should be the core of the thesis table titled **Related Work and Comparative Analysis**.
