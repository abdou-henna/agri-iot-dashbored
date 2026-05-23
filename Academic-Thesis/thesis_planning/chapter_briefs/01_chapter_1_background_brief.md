# Chapter 1 Writing Brief — Background and Theoretical Foundations

This file instructs the future writing skill how to write Chapter 1. Do not draft the chapter inside this file.

## Chapter purpose

Establish the scientific and technical background required to understand the project. This chapter must explain the agricultural, IoT, communication, low-power, reliability, and alfalfa foundations before related-work comparison.

## Proposed title

**Chapter 1: Background and Theoretical Foundations**

## 1.1 Introduction

Explain the role of the chapter. Introduce the link between agriculture, field data collection, IoT, communication, energy, reliability, and crop monitoring. Do not discuss implementation details yet.

## 1.2 Saharan Agriculture Context

Must cover:

- Arid/Saharan agricultural constraints.
- Heat and environmental harshness.
- Water management pressure.
- Unstable or absent field electricity.
- Remote field conditions and monitoring difficulty.
- Why continuous manual monitoring is not practical.

Possible references:

- `hadeid_saharan_agriculture_algerian_oasis` [TODO key if added]
- `desert_agriculture_food_security_algeria` [TODO key if added]
- `smart_agriculture_desert_wadi_souf` [TODO key if added]

Figures:

- No project figure required unless the thesis includes a general field-context photo approved by the user.

## 1.3 Data Collection in Agriculture

Must cover:

- Data collection as the foundation of monitoring and decision support.
- Difference between raw field measurements, diagnostic events, upload metadata, and manual agronomic records.
- Need for timestamps, traceability, and structured storage.
- The difference between measurement time and transfer/upload time.

Use this section to prepare the reader for the project's domain separation, but do not introduce database implementation details yet.

## 1.4 Smart Agriculture and IoT

Must cover:

- IoT concept in agriculture.
- Sensors, embedded nodes, gateway, backend/cloud, dashboard.
- Monitoring vs control.
- Data-driven agriculture and decision support.

References:

- `ayaz2019iot_smart_agriculture_survey`
- `farooq2019iot_smart_agriculture_review`
- `gubbi2013iot_vision`

## 1.5 IoT Communication Technologies

Must compare conceptually:

- WiFi
- Bluetooth
- Zigbee
- GSM/4G
- LoRa / LoRaWAN

Explain why LoRa is suitable for distributed field monitoring: long range, low power, and suitability for sparse field nodes. Avoid claiming measured range unless project evidence provides it.

References:

- `semtech2020sx127x_datasheet`
- `loraalliance2020lorawan_104`
- communication protocol papers from the professor's IoT Agro folder.

Suggested figure:

- `Academic-Thesis/SystemImage/LoRa.png` under a caption such as: “LoRa module used for long-range field communication.”

## 1.6 IoT Network Topologies

Must cover:

- Point-to-point.
- Star topology.
- Mesh topology.
- Gateway-based topology.

Then explain theoretically that the project adopts a gateway-based LoRa topology where Node2 and Node3 communicate with MAIN Gateway. Do not present this as implementation proof yet; detailed system architecture goes to Chapter 3.

## 1.7 Low-Power Operation in Field IoT Systems

Must cover:

- Why field IoT nodes require energy-aware design.
- Battery-powered deployments.
- Deep sleep.
- Duty cycling.
- Relay-controlled sensor power.
- Forced measurement mode for environmental sensors.

Prepare the reader for Chapter 3 Power Saving Mode.

Suggested figures:

- `Academic-Thesis/SystemImage/Relay.png`
- `Academic-Thesis/SystemImage/Bme280.png`
- `Academic-Thesis/SystemImage/DcConv.png` if discussed as power support hardware.

## 1.8 Reliability and Fault Recovery in IoT Systems

Must cover:

- Packet loss and node desynchronization.
- Need for ACK and retries.
- Difference between temporary communication failure and permanent node loss.
- Why diagnostic logging matters.

Prepare the reader for Chapter 3 Recovery Mode. Avoid using project-specific observed failure details until Chapter 3.

## 1.9 Alfalfa Crop Background

Must cover:

- Alfalfa as a forage crop.
- Role as animal feed.
- Fast regrowth and repeated harvest cycles.
- Water/soil monitoring relevance.
- Need to observe soil moisture, soil temperature, and weather context.

References:

- `fao_alflafa_crop_water`
- `mueller2007alfalfa_growth_development`
- `irmak2007irrigation_alfalfa`
- `orloff2015drought_strategies_alfalfa`
- `wassie2019heat_stress_alfalfa`

## 1.10 Why Alfalfa Was Selected

Must cover:

- Increasing demand as animal feed.
- Fast growth and production relevance.
- Field monitoring relevance.
- Lack of local/Saharan/Algerian IoT data collection studies focusing specifically on alfalfa.
- The crop-specific gap must be introduced here, then proven comparatively in Chapter 2.

Do not overclaim that no study exists worldwide unless the literature review verifies that. Use cautious wording: “limited attention,” “few crop-specific IoT studies identified,” and “not represented in the reviewed local/Saharan works.”

## 1.11 Chapter Summary

Summarize the background and transition to related works. The summary should state that the next chapter analyzes how previous systems address or fail to address these issues.
