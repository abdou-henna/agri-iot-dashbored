# Project Understanding Map

## Working title

**A Smart Farm IoT Monitoring and Deterministic Agronomic Analytics Platform for Alfalfa Cultivation**

## Project domain

Smart agriculture, IoT-based agricultural monitoring, field data collection, deterministic analytics, dashboard visualization, and AI-assisted interpretation for alfalfa cultivation in challenging Saharan/agricultural environments.

## Main problem addressed

Field monitoring in arid or remote agricultural areas is difficult because continuous Internet connectivity and stable electrical power are not guaranteed. Manual observation is insufficient for structured, timestamped, and traceable agricultural data collection. Alfalfa is economically relevant as animal feed, fast-growing, and increasingly needed, but locally targeted digital monitoring studies for alfalfa in Algerian/Saharan conditions are limited.

## Proposed solution

A distributed IoT system composed of a MAIN ESP32 gateway, a remote soil node, and a weather node. The system collects soil and weather measurements, timestamps them using RTC-governed measurement time, stores data locally on SD card, uploads data manually/batch-wise to a Node.js/Express/PostgreSQL backend, visualizes them in a React dashboard, processes them through deterministic analytics, and offers Gemini-based interpretation only through a backend proxy.

## IoT subsystem

### MAIN ESP32 gateway

- RTC authoritative local time source.
- SD CSV/JSONL storage.
- LoRa receiver and ACK coordinator.
- Local Pivot 1 soil sensing.
- Manual upload mode through long continuous push-button press.
- RTC synchronization mode through four consecutive button presses.
- Recovery and diagnostic event logging.

### Node2 soil node

- Pivot 2 soil node.
- RS485/Modbus soil sensor.
- LoRa transmission.
- Relay-controlled sensor power.
- Deep sleep and recovery-safe operation.

### Node3 weather node

- Weather/environment node.
- BME280 sensing.
- LoRa transmission.
- Low-power forced measurement design.

## Backend subsystem

- Node.js / Express web service.
- PostgreSQL database.
- Upload ingestion.
- Sensor readings, system events, uploads, agronomic events, and analytics snapshots.
- Gemini backend proxy only.
- Timeout and response-normalization behavior should be described cautiously if supported by project files.

## Dashboard subsystem

- React + Vite + TypeScript.
- Overview, soil monitoring, weather, comparison, diagnostics, uploads, health, agronomic events, insights, Processed Data Viewer, Gemini interpretation UI.
- Dashboard screenshots in `Academic-Thesis/DashBoredImages/` are final accepted dashboard evidence.

## Data flow

Nodes → LoRa → MAIN Gateway → RTC timestamp assignment → SD CSV/JSONL → manual/batch upload → WebService → PostgreSQL → deterministic analytics → analytics snapshots → Gemini interpretation → dashboard UI.

## Key design contributions

- Offline-first field monitoring.
- LoRa-based gateway topology.
- RTC-governed measurement time.
- SD-first local persistence.
- Manual push-button upload and RTC synchronization modes.
- Recovery mode motivated by observed node desynchronization after failed communication.
- Power-saving mode motivated by battery constraints and unstable field electricity.
- Deterministic analytics before AI.
- Processed Data Viewer for transparency.
- Alfalfa-focused monitoring gap in local/Saharan context.

## Missing or uncertain information to keep as placeholders

- Exact field deployment location details, if not already approved.
- Exact battery capacity and measured autonomy, unless provided by test evidence.
- Exact LoRa range and packet loss rates, unless measured.
- Exact sensor calibration equations, unless documented.
- Exact experimental duration interpretation beyond available validation package.
