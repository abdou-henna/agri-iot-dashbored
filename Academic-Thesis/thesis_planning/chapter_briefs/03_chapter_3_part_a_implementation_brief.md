# Chapter 3 Writing Brief — Part A: System Architecture, Hardware, Firmware, Communication, and Backend

This file instructs the future writing skill how to write the first half of Chapter 3. Do not draft final thesis prose here.

## Chapter purpose

Explain the implemented system step by step. Chapter 3 is the practical chapter and must be grounded in project files, code, diagrams, photos, and validation evidence.

## Proposed title

**Chapter 3: System Design, Implementation, and Evaluation**

## Part A coverage

Part A covers sections 3.1 to 3.8.

## 3.1 Introduction

Explain that the chapter presents the system requirements, architecture, hardware, firmware modes, communication, data storage, backend, dashboard, analytics, AI interpretation, deployment, validation, and limitations.

## 3.2 System Requirements

### Functional requirements

Must include:

- Collect soil data from Pivot 1 and Pivot 2.
- Collect weather/environment data from Node3.
- Store readings locally on SD.
- Upload stored data to backend.
- Maintain RTC-based measurement time.
- Display readings and diagnostics on dashboard.
- Support agronomic events.
- Produce deterministic analytics and reliability indicators.
- Provide AI-assisted interpretation only.

### Non-functional requirements

Must include:

- Offline-first operation.
- Low power.
- Field reliability.
- Data integrity.
- Traceability.
- Modular architecture.
- Safe AI boundary.

Suggested table:

`tab:system-requirements` — Functional and non-functional requirements of the proposed system.

## 3.3 General System Architecture

Use:

- `Academic-Thesis/Diagrams/overall diagram.png`
- `Academic-Thesis/Diagrams/Data Flow Diagram.png`

Must explain:

- MAIN gateway.
- Node2 soil node.
- Node3 weather node.
- LoRa communication.
- RTC timestamping.
- SD storage.
- Upload to WebService.
- PostgreSQL.
- Dashboard.
- Deterministic analytics.
- Gemini interpretation.

## 3.4 Hardware Architecture

### 3.4.1 MAIN ESP32 Gateway

Use figures:

- `Academic-Thesis/SystemImage/MainNodeFront.png`
- `Academic-Thesis/SystemImage/MainNodeBack.png`
- `Academic-Thesis/Diagrams/MainNodeWiringDiagram.png`
- component images: ESP32, RTC, SD, LoRa, soil sensor if needed.

Must explain:

- Gateway role.
- Local Pivot 1 soil sensing.
- RTC authoritative time.
- SD storage.
- LoRa RX/ACK coordination.
- Manual push-button control.
- Upload orchestration.

### 3.4.2 Node2 Remote Soil Node

Use figures:

- `Academic-Thesis/SystemImage/SecondNodeFront.png`
- `Academic-Thesis/SystemImage/SecondNodeBack.png`
- `Academic-Thesis/Diagrams/Node2WiringDiagram.png`
- `Academic-Thesis/SystemImage/SoilSensor.png`
- `Academic-Thesis/SystemImage/Max485.png`
- `Academic-Thesis/SystemImage/Relay.png`

Must explain:

- Pivot 2 soil monitoring.
- RS485/Modbus.
- Relay-controlled sensor power.
- LoRa transmission.
- Deep sleep.

### 3.4.3 Node3 Weather Node

Use figures:

- `Academic-Thesis/SystemImage/WatherNodeFront.png`
- `Academic-Thesis/SystemImage/WatherNodeBack.png`
- `Academic-Thesis/Diagrams/WatherNodeWiringDiagram.png`
- `Academic-Thesis/SystemImage/Bme280.png`

Must explain:

- Weather context.
- BME280 measurements.
- Forced measurement mode.
- LoRa transmission.
- Low-power behavior.

Suggested tables:

- `tab:hardware-components`
- `tab:node-roles`
- `tab:pin-mapping`

## 3.5 Firmware Operating Modes: Motivation and Design

This is a critical section. For each mode, write both motivation and implementation role.

### 3.5.1 Normal Sensing Mode

Must explain:

- Scheduled measurement cycle.
- Sensor reading.
- Packet preparation.
- LoRa send/receive behavior.
- Return to low-power state.

### 3.5.2 Power Saving Mode

Must explain why it was created:

- The system is battery-powered.
- Electrical power in field/forest/agricultural deployment is unstable.
- Frequent battery replacement is impractical.

Must explain how it works:

- Deep sleep.
- Sensor power only during measurement.
- Relay-controlled soil sensor power.
- BME280 forced measurement.
- Limited radio activity.

Use figures:

- `Relay.png`
- `Bme280.png`
- `DcConv.png` if relevant.

### 3.5.3 LoRa RX/ACK Mode

Must explain:

- MAIN opens receive window.
- Node2/Node3 transmit packets.
- MAIN sends ACK after valid reception.
- ACK reduces uncertainty and supports reliability.

### 3.5.4 Recovery Mode

Must explain why it was created:

- During field tests, if one node failed to communicate once, it could lose synchronization and fail to reconnect normally.
- The issue was not only a failed packet but a timing mismatch between node transmission and MAIN receive window.

Must explain how it works:

- Controlled retries.
- Adaptive receive/recovery windows.
- Missing-node detection.
- Recovery event logging.
- Node returns when synchronization is restored.

Use figure:

- `Academic-Thesis/Diagrams/State Machine Diagram.png`

### 3.5.5 Local Storage Mode

Must explain:

- MAIN stores readings and events on SD.
- CSV for sensor readings.
- JSONL for events/upload queue when applicable.
- Data acquisition remains independent of Internet availability.

Use figure:

- `Academic-Thesis/SystemImage/SdCardModule.png`

### 3.5.6 Upload Mode

Must explain why it was created:

- Continuous Internet is difficult to provide in field/forest/agricultural deployment.
- Realtime upload would be unreliable and energy-costly.

Must explain trigger:

- Long continuous push-button press activates Upload Mode.

Must explain behavior:

- MAIN sends stored SD data to WebService.
- Backend ingests data into PostgreSQL.
- Upload time is metadata only and never replaces `measured_at`.

### 3.5.7 RTC Synchronization Mode

Must explain why it was created:

- Time is critical for analytics and charts.
- Upload time cannot be used as measurement time.

Must explain trigger:

- Four consecutive push-button presses activate RTC Sync Mode.

Must explain behavior:

- MAIN synchronizes RTC using server time when available.
- Future readings use RTC-derived `measured_at`.

Use figure:

- `Academic-Thesis/SystemImage/Rtc.png`

### 3.5.8 Diagnostic Logging Mode

Must explain:

- Logs recovery events.
- Logs upload events.
- Logs node missing/back-online events if present.
- Logs LoRa timeout, SD issues, sensor errors if present in project evidence.
- Feeds dashboard diagnostics and reliability.

Suggested table:

`tab:firmware-operating-modes` with columns: Mode, Trigger, Field problem, Firmware response, Thesis evidence.

## 3.6 Communication Design

Use:

- LoRa module image.
- Sequence diagram.

Must explain:

- Node-to-gateway communication.
- Packet flow.
- ACK.
- Retry/recovery.
- Why LoRa was selected.

Do not overclaim measured range unless documented.

## 3.7 Data Storage and Time Policy

Must explain:

- `sensor_readings` uses `measured_at`.
- `system_events` uses `event_time`.
- `uploads` are transfer/audit metadata only.
- `agronomic_events` use `started_at` / `ended_at`.
- UTC storage and local display if supported by project files.

Use:

- `maps_and_policies/data-field-policy.md`
- `maps_and_policies/source-map.md`

## 3.8 Backend Implementation

Use:

- WebService source code and docs.
- Database ERD.

Must explain:

- Node.js / Express.
- PostgreSQL.
- Upload ingestion.
- API endpoints.
- Agronomic events.
- Analytics snapshots.
- Gemini backend proxy only.

Use figure:

- `Academic-Thesis/Diagrams/DatabaseERDDiagram.png`

Suggested tables:

- `tab:database-tables`
- `tab:api-endpoints`
