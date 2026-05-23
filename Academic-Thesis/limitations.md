# Project Limitations

## Purpose

This document defines the limitations that must be explicitly stated in the thesis. Its goal is to prevent overclaiming, protect scientific accuracy, and clarify the difference between implemented functionality, supported interpretation, and future work.

## 1. Sensor and Hardware Limitations

The implemented system measures a limited set of environmental and soil variables. The current sensor stack supports soil moisture, soil temperature, soil electrical conductivity, air temperature, relative humidity, air pressure, and LoRa signal quality indicators such as RSSI and SNR. It does not directly measure pH, NPK concentration, rainfall, wind speed, solar radiation, leaf wetness, plant height, canopy temperature, biomass, or crop disease symptoms.

Although some exported data files may contain fields such as `soil_ph` or `soil_salinity`, these fields must not be treated as validated measurements unless a corresponding sensor, calibration procedure, and implementation evidence are provided. In the current thesis scope, pH, NPK, official salinity classes, and laboratory salinity measurements are outside the supported capability of the system.

## 2. Soil Moisture Interpretation Limitations

Soil moisture values are useful for trend analysis, pivot comparison, irrigation response observation, and relative wetting/drying behavior. However, absolute agronomic thresholds such as field capacity, refill point, permanent wilting point, and water-stress limits require local calibration. Without soil texture, sensor depth, sensor installation details, and field-specific calibration, the dashboard must not claim definitive water-stress diagnosis.

The system can state that moisture increased, decreased, remained stable, or differed between Pivot 1 and Pivot 2. It must not state that the crop is certainly under water stress unless calibrated thresholds and reliable agronomic context are available.

## 3. Soil EC and Salinity Limitations

Soil electrical conductivity is treated as a trend indicator only. Raw in-situ EC values are affected by water content, soil texture, temperature, porosity, and sensor characteristics. Therefore, raw EC values must not be converted directly into saturated-paste ECe, official salinity class, or expected yield loss.

The thesis may discuss EC trend monitoring and EC changes around irrigation or fertilization events, but it must clearly state that official salinity assessment requires field/laboratory calibration and appropriate agronomic sampling.

## 4. Weather and ET Limitations

The weather node measures air temperature, relative humidity, and barometric pressure. These variables support weather context, heat-stress context, and VPD estimation. However, the current system does not measure wind speed or solar radiation, and therefore it cannot compute full reference evapotranspiration or crop evapotranspiration using standard FAO Penman-Monteith requirements.

Any VPD or atmospheric-demand interpretation must be presented as contextual support, not as a complete irrigation scheduling model.

## 5. Agronomic Event Limitations

Manual agronomic events such as irrigation, fertilization, field notes, and cutting-related records improve interpretation, but they depend on user entry accuracy. An irrigation event with estimated timing should produce weaker conclusions than an event recorded with exact start and end times. Fertilization records can explain possible context for EC changes, but they cannot diagnose nutrient sufficiency or deficiency without soil or tissue analysis.

Manual data are therefore contextual evidence, not independent proof of crop response.

## 6. Disease, Pest, and Yield Limitations

The current system must not diagnose diseases or pest problems. Weather conditions may be described as favorable or unfavorable for certain general risks, but disease diagnosis requires field scouting, pathogen presence, plant symptoms, or image-based evidence.

Similarly, the system cannot predict yield from the current sensors alone. Yield can only be analyzed if manually recorded yield values are provided. Any yield discussion must remain descriptive and contextual unless a validated yield model is developed later.

## 7. Data Quality and Reliability Limitations

The system is offline-first and upload-driven. This means the dashboard is not a real-time monitoring system. It reflects the latest uploaded data, not necessarily the latest field condition stored on the SD card. The thesis must distinguish latest measurement time from last upload time.

Data reliability may be affected by LoRa packet loss, node absence, sensor flatline behavior, timestamp uncertainty, duplicate uploads, missing readings, or upload failure. These issues are not hidden; they are part of the reliability and QC layer.

## 8. AI Interpretation Limitations

Gemini is used only as an interpretation layer. It must not compute deterministic analytics, clean raw data, fill missing values, infer unsupported measurements, override reliability gates, or issue authoritative agronomic decisions.

AI-generated summaries must remain subordinate to deterministic metrics, QC flags, reliability scores, and explicit project constraints. The thesis must not present Gemini output as processed data or as scientific proof.

## 9. Validation Limitations

The current validation evidence includes uploaded sensor data, agronomic events, system events, upload-session records, processed-data export, firmware serial behavior, and dashboard screenshots. These materials demonstrate functional feasibility and system behavior over the available test period. However, they do not constitute long-term field validation over a full alfalfa season.

Final thesis claims should therefore be limited to implemented functionality, observed test behavior, and validated data-handling logic. Large-scale agronomic performance, water savings, yield improvement, and long-term robustness require additional deployment time and controlled evaluation.

## 10. Environmental Effects on Field Hardware

The effects of rain, sustained high humidity, wind-borne sand, and temperature cycling on LoRa communication quality, enclosure sealing, and cable connections were not experimentally isolated or quantified during the pilot deployment. A temporal coincidence between \texttt{node\_missing} system events and rainy field conditions was noted, but this observation does not establish a causal relationship; the contribution of environmental factors to communication failures cannot be separated from other possible causes (timing drift, battery state, RF interference) using the available evidence alone.

The IP65-rated enclosures provide dust and water-contact protection appropriate for the deployment context, but do not protect against submersion or sustained water pressure. Long-term environmental effects on enclosure integrity, cable insulation, and connector reliability require extended field observation under monitored weather conditions.

The thesis must not claim that rain caused node failures. The permitted language is: coincided with, may have contributed, requires further controlled environmental validation.

## 11. Security and Privacy Limitations

The thesis package must not include secrets, API keys, database URLs, environment files, private deployment credentials, or raw connection strings. Deployment configuration should be described conceptually using environment variables and secure platform configuration, not by exposing actual secret values.

## 12. Future Improvements

Future work may include rainfall sensing, wind speed, solar radiation, multi-depth soil moisture sensing, soil-water-potential sensors, calibrated soil moisture thresholds, field/lab EC calibration, pH and nutrient data from laboratory analysis, plant imagery, longer field trials, stronger authentication, role-based access control, and deeper agronomic model validation.

## Thesis-Safe Summary

The proposed platform is best described as a traceable IoT monitoring and deterministic agronomic analytics system. It supports reliable data acquisition, domain-separated storage, dashboard visualization, QC-aware analysis, and cautious interpretation. It should not be described as a complete autonomous irrigation controller, disease diagnosis system, salinity classification system, or yield prediction platform.
