# Related Work and Comparative Analysis — Selected 3 Studies

Purpose: this file selects only three strong related works for the thesis section **"Related Work and Comparative Analysis"**. The goal is to choose references that are close enough to the Smart Farm IoT project to be academically relevant, while still allowing the thesis to clearly show the originality and strength of our system.

## Recommended thesis placement

Use this material in:

```text
Chapter 1: Background and Related Work
Section: Related Work and Comparative Analysis
```

Then refer back to it in:

```text
Chapter 5: Discussion
```

when explaining how the implemented system responds to limitations found in previous systems.

---

## Selected Works

| No. | Reference | Why this work was selected | Main comparison angle |
|---:|---|---|---|
| 1 | Ahmed et al. (2022), *LoRa Based IoT Platform for Remote Monitoring of Large-Scale Agriculture Farms in Chile* | Strong peer-reviewed Sensors paper; directly relevant to LoRa-based farm monitoring and multi-layer IoT architecture. | Compare LoRa remote monitoring architecture with our offline-first, RTC-authoritative, deterministic analytics platform. |
| 2 | Pereira et al. (2023), *IoT-Enabled Smart Drip Irrigation System Using ESP32* | Strong ESP32 irrigation reference; close to embedded smart irrigation and dashboard/control context. | Compare ESP32 irrigation automation with our dual-pivot monitoring, manual agronomic events, reliability/QC, and backend data governance. |
| 3 | Saban et al. (2023), *A Smart Agricultural System Based on PLC and a Cloud Computing Web Application Using LoRa and LoRaWAN* | Strong smart farming system with LoRa/LoRaWAN and cloud web application; useful for comparing web monitoring and agricultural automation. | Compare cloud monitoring and control with our PostgreSQL-backed domain separation, processed data viewer, and Gemini-as-interpretation-only boundary. |

---

## Study 1 — Ahmed et al. (2022)

### Full reference

Ahmed, M. A., Gallardo, J. L., Zuniga, M. D., Pedraza, M. A., Carvajal, G., Jara, N., & Carvajal, R. (2022). *LoRa Based IoT Platform for Remote Monitoring of Large-Scale Agriculture Farms in Chile*. **Sensors, 22**(8), 2824. https://doi.org/10.3390/s22082824

### What the study does

This study proposes a LoRa-based IoT platform for remote agricultural monitoring. It focuses on farm-scale sensing, LoRa communication, hardware/software platform design, and evaluation of LoRa network behavior for agricultural environments.

### Why it is relevant to our project

It is highly relevant because our project also uses LoRa communication between distributed field nodes and a gateway. It also supports the idea that long-range, low-power wireless communication is suitable for agricultural fields.

### How our project can be compared against it

| Comparison point | Ahmed et al. (2022) | Our Smart Farm project |
|---|---|---|
| Communication | LoRa/LoRaWAN-oriented remote monitoring | LoRa node-to-gateway communication with ACK/recovery protocol |
| Architecture | Multi-layer smart farming platform | Firmware + WebService + PostgreSQL + dashboard + deterministic analytics |
| Data timing | Remote monitoring focus | RTC-authoritative `measured_at` policy, upload time separated from measurement time |
| Offline support | Primarily remote monitoring and network platform | Offline-first SD storage and batch upload pipeline |
| Analytics | Monitoring and decision-support potential | Deterministic QC, reliability scoring, alert rules, analytics snapshots |
| AI boundary | Not the central contribution | Gemini interpretation only; deterministic analytics remain authoritative |

### How this helps show our project is stronger/newer

Use this reference to show that LoRa is an established technology for smart agriculture, then explain that our project extends the monitoring idea with stronger **data governance**, especially RTC-based measurement time, offline-first storage, deterministic QC/reliability, and transparent processed-data lineage.

---

## Study 2 — Pereira et al. (2023)

### Full reference

Pereira, G. P., Chaari, M. Z., & Daroge, F. (2023). *IoT-Enabled Smart Drip Irrigation System Using ESP32*. **IoT, 4**(3), 221–243. https://doi.org/10.3390/iot4030012

### What the study does

This work designs and tests an ESP32-based IoT drip irrigation system. It is useful as a reference for smart irrigation, embedded sensing, and the use of ESP32 in agricultural automation.

### Why it is relevant to our project

It is relevant because our project also uses ESP32-based embedded nodes and supports irrigation-related decision support. However, our system is not only an irrigation controller; it is a broader monitoring and agronomic analytics platform for alfalfa.

### How our project can be compared against it

| Comparison point | Pereira et al. (2023) | Our Smart Farm project |
|---|---|---|
| Microcontroller | ESP32 | ESP32 MAIN gateway + ESP32-C3 remote nodes |
| Main goal | Smart drip irrigation automation | Field monitoring + deterministic agronomic analytics + dashboard |
| Crop context | General irrigation application | Alfalfa-focused monitoring and agronomic context |
| Sensor data | Irrigation-related sensor measurements | Pivot 1 soil, Pivot 2 soil, shared weather context |
| Agronomic events | Irrigation automation focus | Manual agronomic events: irrigation, cutting, fertilization, yield, field notes |
| Data reliability | Not the central comparative focus | Explicit QC, reliability scoring, limitations, and missing-data visibility |
| AI | Not the key contribution | Gemini backend proxy for interpretation only, not computation |

### How this helps show our project is stronger/newer

Use this work to show that ESP32 is a valid platform for smart irrigation systems. Then emphasize that our project goes beyond direct irrigation automation by introducing **dual-pivot monitoring**, **manual agronomic context**, **processed analytics transparency**, and **strict AI safety boundaries**.

---

## Study 3 — Saban et al. (2023)

### Full reference

Saban, M., Bekkour, M., Amdaouch, I., El Gueri, J., Ait Ahmed, B., Chaari, M. Z., Ruiz-Alzola, J., Rosado-Muñoz, A., & Aghzout, O. (2023). *A Smart Agricultural System Based on PLC and a Cloud Computing Web Application Using LoRa and LoRaWAN*. **Sensors, 23**(5), 2725. https://doi.org/10.3390/s23052725

### What the study does

This paper presents a smart agricultural system that combines PLC-based control, LoRa/LoRaWAN communication, and a cloud-hosted web application for monitoring and managing connected agricultural devices.

### Why it is relevant to our project

It is relevant because it combines agricultural monitoring, LoRa/LoRaWAN, and a web-based cloud interface. This makes it useful for comparing dashboard/web-service architecture and remote agricultural management.

### How our project can be compared against it

| Comparison point | Saban et al. (2023) | Our Smart Farm project |
|---|---|---|
| Control architecture | PLC + IoT gateway/cloud web application | ESP32 gateway + Node.js/Express WebService + PostgreSQL dashboard |
| Communication | LoRa and LoRaWAN | LoRa node-to-gateway coordination with recovery and ACK handling |
| Web layer | Cloud-hosted web monitoring/control | React dashboard with deterministic analytics, diagnostics, and processed viewer |
| Database semantics | Cloud data processing focus | Explicit domain separation: sensor readings, system events, uploads, agronomic events |
| Data transparency | Monitoring/control orientation | Raw/cleaned/processed lineage through Processed Data Viewer |
| AI role | Not central | AI interpretation constrained by deterministic snapshots and reliability gates |
| Offline-first behavior | Cloud-oriented system | SD-based offline storage and upload-driven dashboard |

### How this helps show our project is stronger/newer

Use this work to show that LoRa/cloud web applications are already used in smart agriculture. Then contrast our system by focusing on the features that are uncommon in typical dashboards: **offline-first acquisition**, **canonical time semantics**, **domain-separated PostgreSQL model**, **deterministic analytics snapshots**, and **AI interpretation constrained by reliability and QC**.

---

## Proposed Comparative Table for the Thesis

| Criterion | Ahmed et al. (2022) | Pereira et al. (2023) | Saban et al. (2023) | Our Smart Farm Project |
|---|---|---|---|---|
| Field communication | LoRa/LoRaWAN | Wi-Fi/IoT ESP32 context | LoRa/LoRaWAN | LoRa with gateway ACK/recovery |
| Edge hardware | LoRa sensor platform | ESP32 irrigation system | PLC + IoT gateway | MAIN ESP32 + N2 ESP32-C3 + N3 ESP32-C3 |
| Offline-first storage | Limited/not central | Not central | Cloud-oriented | SD storage + batch/manual upload |
| Authoritative measurement time | Not the main contribution | Not the main contribution | Not the main contribution | RTC-based `measured_at` as canonical analytics time |
| Crop specificity | General farm monitoring | Irrigation application | General smart agriculture | Alfalfa-focused agronomic monitoring |
| Soil monitoring | Yes | Yes, irrigation-focused | Yes/environmental monitoring | Pivot 1 + Pivot 2 separated soil monitoring |
| Weather context | Yes | Environmental context | Yes | Shared N3 weather context |
| Backend/database | Platform/cloud support | IoT system support | Cloud web application | Node.js/Express + PostgreSQL with strict domain separation |
| QC/reliability layer | Not central | Not central | Not central | Deterministic QC + reliability scoring |
| Processed data transparency | Not central | Not central | Not central | Processed Data Viewer: raw/cleaned/processed lineage |
| AI interpretation | Not central | Not central | Not central | Gemini interpretation only, reliability-gated |
| Main limitation compared with our work | Less emphasis on offline data lineage and deterministic analytics | More irrigation-control focused than full analytics governance | More cloud/control oriented than deterministic data governance | Current system still requires final validation, references, and field calibration |

---

## Suggested paragraph logic for the thesis

Use the comparison with this logic:

1. Start by saying that previous smart agriculture systems demonstrate the feasibility of IoT, ESP32, LoRa, and cloud/web monitoring in agricultural contexts.
2. Explain that most related systems focus mainly on communication, automation, or visualization.
3. Then state the gap: fewer systems explicitly combine offline-first acquisition, authoritative field timestamps, domain-separated storage, deterministic QC/reliability, processed-data transparency, and AI interpretation boundaries.
4. Present our project as a response to this gap, while avoiding exaggerated claims.

Do not claim that our system is universally better. Say it is stronger in **traceability, data governance, deterministic analytics, and transparency**.

---

## BibTeX entries

```bibtex
@article{ahmed2022lora_agriculture_chile,
  author  = {Ahmed, Mohamed A. and Gallardo, Jose Luis and Zuniga, Marcos D. and Pedraza, Manuel A. and Carvajal, Gonzalo and Jara, Nicolas and Carvajal, Rodrigo},
  title   = {LoRa Based IoT Platform for Remote Monitoring of Large-Scale Agriculture Farms in Chile},
  journal = {Sensors},
  volume  = {22},
  number  = {8},
  pages   = {2824},
  year    = {2022},
  doi     = {10.3390/s22082824},
  url     = {https://doi.org/10.3390/s22082824}
}

@article{pereira2023esp32_drip_irrigation,
  author  = {Pereira, Gilroy P. and Chaari, Mohamed Z. and Daroge, Fawwad},
  title   = {IoT-Enabled Smart Drip Irrigation System Using ESP32},
  journal = {IoT},
  volume  = {4},
  number  = {3},
  pages   = {221--243},
  year    = {2023},
  doi     = {10.3390/iot4030012},
  url     = {https://doi.org/10.3390/iot4030012}
}

@article{saban2023smart_agriculture_plc_lora,
  author  = {Saban, Mohamed and Bekkour, Mostapha and Amdaouch, Ibtisam and El Gueri, Jaouad and Ait Ahmed, Badiaa and Chaari, Mohamed Zied and Ruiz-Alzola, Juan and Rosado-Muñoz, Alfredo and Aghzout, Otman},
  title   = {A Smart Agricultural System Based on PLC and a Cloud Computing Web Application Using LoRa and LoRaWan},
  journal = {Sensors},
  volume  = {23},
  number  = {5},
  pages   = {2725},
  year    = {2023},
  doi     = {10.3390/s23052725},
  url     = {https://doi.org/10.3390/s23052725}
}
```

---

## Important writing warning

When writing the thesis later, do not say:

> Our system is better than all previous systems.

Say instead:

> Compared with the selected works, the proposed system places stronger emphasis on offline-first data continuity, domain-specific timestamp semantics, deterministic quality control, reliability-aware interpretation, and transparent processed-data lineage.

This is academically safer and more defensible.
