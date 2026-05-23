# IoT Data Acquisition, Storage & Upload System Design

**Project:** Smart Farm / Desert Agriculture Monitoring System  
**Document Type:** IoT data collection and storage architecture  
**Scope:** Sensor acquisition, LoRa communication, power-saving workflow, SD-card storage, error logging, manual upload trigger, time synchronization metadata  
**Out of Scope:** Website UI, cloud dashboard design, data analysis algorithms, Render deployment implementation  
**Related File:** `pin_mapping.md` or the existing hardware pin mapping file

---

## 1. Purpose of This Document

This document defines the professional operating logic of the IoT monitoring system. It explains how the nodes collect data, exchange packets over LoRa, preserve battery power, store data locally on the SD card, detect errors, and prepare structured data for future upload to a cloud backend such as a Render Web Service connected to PostgreSQL.

This file is intended to be placed inside the project folder and used later as a reference for generating firmware code for all nodes using an agent or developer.

This document deliberately does **not** repeat detailed pin mapping because that information already exists in the dedicated hardware pin mapping file.

---

## 2. System Overview

The system consists of three main embedded nodes:

| Node | Role | Main Function |
|---|---|---|
| Main Node | Gateway + storage + upload controller + local soil measurement point | Receives LoRa packets, timestamps them, stores them on SD card, detects missing data, measures soil locally through RS485/relay at the main pivot location, starts upload when button is pressed |
| Node 2 | Remote soil node | Reads soil sensor through RS485, controls sensor power using relay, sends data through LoRa |
| Node 3 | Remote weather node | Reads BME280 weather data and sends it through LoRa |

### 2.1 Main Node Local Soil Sensor Decision

The Main Node includes its own RS485 soil sensor and relay-controlled 12V power line.  
This local soil sensor is **mandatory** and must be read in every normal measurement cycle.

This is **not** a backup for Node 2 and it is **not** optional.

The two soil sensors represent **two different physical measurement locations**:

| Soil Source | Physical Location | Purpose |
|---|---|---|
| Main Node local soil sensor | Main pivot / main rotating axis location | Measures soil conditions at the main pivot point |
| Node 2 soil sensor | Second pivot / another field axis location | Measures soil conditions at another independent location |

Therefore, the system intentionally stores two separate soil data streams:

```text
MAIN local soil data  → source = local_rs485
NODE2 remote soil data → source = lora
```

Both are required because they describe different areas of the field.  
A failure in one soil source must be logged as an event, but it must not cancel or replace the other source.



### 2.2 Soil Sensor Measurement Capability

Both soil sensors, the Main Node local sensor and the Node 2 remote sensor, provide **only three soil measurements**:

| Measurement | Storage Field | Required |
|---|---|---|
| Soil temperature | `soil_temp_c` / `soil_temperature_c` | Yes |
| Soil moisture | `soil_moisture_pct` / `soil_moisture_percent` | Yes |
| Soil electrical conductivity | `soil_ec_us_cm` | Yes |

The soil sensors do **not** provide:

```text
soil_ph
soil_salinity
soil_n_mg_kg
soil_p_mg_kg
soil_k_mg_kg
NPK
```

These values must not be read, generated, uploaded, or displayed as real measurements. If old schema/database fields exist for compatibility, they must remain empty/null.


The system operates without permanent internet access. All sensor data is collected locally and saved on the SD card. When the user is physically present and presses the upload button, the Main Node enters upload mode and sends pending data to the cloud through a Web Service. After successful upload, the system stores upload metadata such as `last_upload_time` so the website can display the last synchronization time.

---

## 3. High-Level Architecture

```text
[Node 2: Soil Node]
    Soil Sensor -> RS485/MAX485 -> ESP32-C3 -> LoRa

[Node 3: Weather Node]
    BME280 -> ESP32-C3 -> LoRa

                         LoRa
                          |
                          v
[Main Node: Gateway]
    LoRa Receiver -> RTC Timestamp -> SD Card Logger
          |                  |
          |                  +-> Local event/error log
          |
          +-> Mandatory local soil sensor reading at main pivot location
          |
          +-> Manual upload button -> Wi-Fi upload mode -> Render Web Service later
```

---

## 4. Operating Philosophy

The system is designed around the following principles:

1. **Sleep-first design**: Every node sleeps most of the time.
2. **Sensor power only when needed**: Soil sensors are powered through relay modules only during measurement.
3. **Short LoRa activity windows**: LoRa modules are active only during transmit/receive windows, then placed in sleep mode.
4. **Structured local storage**: All records are saved in predictable CSV/JSONL-compatible structures.
5. **Error visibility**: Communication failures, missing nodes, sensor failures, CRC errors, SD errors, and upload failures are logged as structured events.
6. **Upload is manual and energy-aware**: Upload is started using a physical button and must never keep Wi-Fi active continuously.
7. **Cloud-ready data format**: SD data must be directly compatible with a future API and PostgreSQL database.
8. **Recoverability**: If power is removed from any node, the system must recover automatically and continue collecting data.

---

## 5. Main System Timing

### 5.1 Measurement Interval

The target measurement interval is:

```text
10 minutes
```

This means every node should attempt to produce one valid reading every 10 minutes.

Daily expected records:

| Source | Records per day |
|---|---:|
| Node 2 soil data | 144 |
| Node 3 weather data | 144 |
| Main local soil data | 144 |
| Total typical sensor rows | 288 to 432 |

This is a small amount of data for an SD card and is also suitable for PostgreSQL storage later.

---

## 6. Superframe Schedule

The system should use a fixed 10-minute superframe. Each superframe is divided into small communication windows.

Recommended schedule:

```text
T + 00s  Main Node wakes and prepares LoRa receiver
T + 02s  Beacon / sync packet from Main Node
T + 05s  Node 2 wakes, powers soil sensor relay, waits for stabilization
T + 20s  Node 2 reads soil sensor through RS485
T + 24s  Node 2 transmits LoRa data packet
T + 25s  Main Node sends ACK to Node 2
T + 35s  Node 3 wakes, reads BME280
T + 38s  Node 3 transmits LoRa data packet
T + 39s  Main Node sends ACK to Node 3
T + 45s  Main Node performs mandatory local soil reading at the main pivot location
T + 70s  Main Node writes completed records and errors to SD
T + 75s  Main Node enters sleep until next cycle
```

The exact seconds may be adjusted in firmware, but the structure should remain stable:

```text
Wake -> Measure -> Transmit -> ACK -> Store -> Sleep
```

---

## 7. Power-Saving Strategy

### 7.1 General Rules

Every firmware should enforce these rules:

```text
- Disable Wi-Fi except during manual upload mode.
- Put LoRa into sleep mode after each communication window.
- Use ESP32 deep sleep between 10-minute cycles.
- Power soil sensors through relay only during measurement.
- Keep relay OFF by default.
- Keep RS485 direction pin in safe state during sleep.
- Close SD files immediately after writing.
- Avoid long receive windows.
```

---

### 7.2 Soil Sensor Relay Control

Both the Main Node and Node 2 now include relay modules for controlling soil sensor power.

The soil sensor should not be powered continuously. It should be powered only during the measurement phase.

Required behavior:

```text
1. Relay OFF during boot initialization.
2. Relay ON before reading soil sensor.
3. Wait stabilization time.
4. Read soil data through RS485.
5. Relay OFF immediately after reading.
6. Continue LoRa/storage tasks.
7. Enter deep sleep.
```

Recommended stabilization time:

```text
Initial value: 15 seconds
Allowed range: 5 to 25 seconds
```

This value should be calibrated by testing repeated sensor readings after 5s, 10s, 15s, and 20s.

---

### 7.3 Node 2 Power Workflow

```text
Deep Sleep
  |
  v
Wake by timer
  |
  v
Initialize GPIO safe states
  |
  v
Relay ON -> Soil sensor receives 12V
  |
  v
Wait 15 seconds
  |
  v
Read RS485 sensor
  |
  v
Relay OFF
  |
  v
Build LoRa data packet
  |
  v
Transmit packet
  |
  v
Wait short ACK window: 1.5 to 2.0 seconds
  |
  v
LoRa sleep
  |
  v
ESP32-C3 deep sleep until next 10-minute cycle
```

---

### 7.4 Node 3 Power Workflow

Node 3 uses BME280 and does not require relay control.

Required behavior:

```text
Deep Sleep
  |
  v
Wake by timer
  |
  v
BME280 forced measurement
  |
  v
Build LoRa data packet
  |
  v
Transmit packet
  |
  v
Wait short ACK window
  |
  v
LoRa sleep
  |
  v
Deep sleep
```

The BME280 must be used in forced measurement mode, not continuous normal mode.

---

### 7.5 Main Node Power Workflow

The Main Node is responsible for receiving data, storing it, detecting errors, and handling uploads.

Normal cycle:

```text
Sleep
  |
  v
Wake by RTC alarm or timer
  |
  v
LoRa receive windows for Node 2 and Node 3
  |
  v
Mandatory local soil sensor reading using relay at the main pivot location
  |
  v
Timestamp data using RTC
  |
  v
Write sensor records to SD
  |
  v
Write event records to SD
  |
  v
Check upload button state
  |
  v
If not pressed -> sleep
If pressed -> upload mode
```

### 7.6 Main Node Local Soil Workflow

The Main Node local soil measurement is a mandatory part of each normal cycle.

Required behavior:

```text
1. Keep relay OFF by default.
2. Turn relay ON only before local soil measurement.
3. Wait for soil sensor stabilization.
4. Read local soil sensor through RS485 / MAX485.
5. Turn relay OFF immediately after reading.
6. Save the record with:
   node_id = MAIN
   node_type = soil
   source = local_rs485
7. If reading fails, save an error/partial record and create a system event.
```

The Main Node local soil sensor represents the soil conditions at the **main pivot / main rotating axis location**.  
Node 2 represents a different physical measurement location, therefore both data streams must be preserved separately.


During sleep:

```text
- Wi-Fi OFF
- LoRa sleep
- Soil relay OFF
- SD files closed
- RTC continues timekeeping
```

---

## 8. Communication Design

### 8.1 LoRa Role Allocation

| Node | LoRa Role |
|---|---|
| Main Node | Receiver, ACK sender, time master |
| Node 2 | Data sender |
| Node 3 | Data sender |

Main Node controls the communication rhythm. Sensor nodes send their data in assigned windows. This reduces collision risk and saves power.

---

### 8.2 Message Types

All LoRa communication should use explicit message types.

| Type | Direction | Purpose |
|---|---|---|
| `BEACON` | Main -> Nodes | Time and schedule sync |
| `DATA_SOIL` | Node 2 -> Main | Soil readings |
| `DATA_WEATHER` | Node 3 -> Main | Weather readings |
| `DATA_LOCAL_SOIL` | Main internal | Mandatory Main Node local soil sensor reading at main pivot location |
| `ACK` | Main -> Node | Confirms packet and gives next schedule |
| `ERROR_REPORT` | Node -> Main | Reports local sensor or hardware error |
| `STATUS` | Node -> Main | Battery, boot count, firmware version |

---

### 8.3 Recommended Binary Packet Structure

For LoRa, binary packets are preferred over long text because they are smaller and reduce transmission time.

Common packet header:

| Field | Type | Description |
|---|---|---|
| `magic` | uint16 | Fixed value to identify system packets, example `0xA55A` |
| `protocol_version` | uint8 | Packet format version |
| `message_type` | uint8 | Message type code |
| `network_id` | uint16 | Identifies this farm/system |
| `node_id` | uint8 | Node identifier |
| `sequence` | uint32 | Incremental counter per node |
| `boot_count` | uint16 | Incremented after reboot if possible |
| `uptime_s` | uint32 | Uptime since current boot |
| `battery_mv` | uint16 | Battery voltage in millivolts |
| `payload_len` | uint8 | Payload length |
| `payload` | bytes | Sensor or status payload |
| `crc16` | uint16 | Packet integrity check |

Recommended node identifiers:

| Node | `node_id` | Text code |
|---|---:|---|
| Main Node | 1 | `MAIN` |
| Node 2 Soil | 2 | `N2_SOIL` |
| Node 3 Weather | 3 | `N3_WEATHER` |

---

### 8.4 ACK Packet Structure

ACK should be short but useful.

| Field | Type | Description |
|---|---|---|
| `message_type` | uint8 | `ACK` |
| `network_id` | uint16 | System ID |
| `node_id` | uint8 | Target node |
| `acked_sequence` | uint32 | Sequence received by Main Node |
| `gateway_epoch` | uint32 | Current gateway time |
| `next_wakeup_epoch` | uint32 | Recommended next wake time |
| `config_version` | uint16 | Allows future config updates |
| `status_flags` | uint16 | Accepted, duplicate, CRC ok, time correction |

If a sensor node receives ACK, it should store:

```text
last_ack_sequence
last_gateway_time
next_wakeup_epoch
last_rssi
last_snr
```

If no ACK arrives, the node should not stay awake for long. It should sleep and retry in the next cycle.

---

## 9. Time Management

### 9.1 Time Source

The Main Node is the time master because it contains the RTC DS3231. All stored records must use Main Node RTC time as the official timestamp.

Sensor nodes may include their own relative timing, but their timestamps are not authoritative.

Official timestamp source:

```text
Main Node RTC timestamp
```

---

### 9.2 Time Synchronization During Upload

When the user presses the upload button and the Main Node successfully connects to the upload service or phone/hotspot, the Main Node should update its RTC time from the server response.

Upload response should include:

```json
{
  "server_time_utc": "2026-04-25T10:30:00Z",
  "upload_session_id": "UPL-20260425-103000-GW01",
  "accepted_records": 288,
  "next_expected_upload": "2026-04-26T10:30:00Z"
}
```

After receiving `server_time_utc`, Main Node should:

```text
1. Validate time format.
2. Compare with RTC time.
3. If difference is acceptable or configured, update RTC.
4. Log a TIME_SYNC event.
5. Store last successful upload time.
```

---

### 9.3 Last Upload Time

The system must store last upload metadata locally so the website can later display the last update time.

File:

```text
/CONFIG/upload_state.json
```

Example:

```json
{
  "gateway_id": "GW01",
  "last_upload_time_utc": "2026-04-25T10:30:15Z",
  "last_upload_session_id": "UPL-20260425-103000-GW01",
  "last_upload_status": "SUCCESS",
  "last_uploaded_file": "/DATA/2026/04/2026-04-25_readings.csv",
  "last_uploaded_offset": 57344,
  "last_accepted_records": 288,
  "last_failed_reason": null,
  "rtc_last_sync_utc": "2026-04-25T10:30:16Z"
}
```

If upload fails, update:

```json
{
  "last_upload_status": "FAILED",
  "last_failed_reason": "WIFI_TIMEOUT"
}
```

---

## 10. Local Storage Design on SD Card

### 10.1 Folder Structure

Recommended SD card layout:

```text
/CONFIG/
  system_config.json
  upload_state.json
  nodes_config.json

/DATA/
  /YYYY/
    /MM/
      YYYY-MM-DD_readings.csv
      YYYY-MM-DD_events.csv
      YYYY-MM-DD_upload_queue.jsonl

/MANIFEST/
  manifest.json

/ARCHIVE/
  uploaded_files.log
```

Example:

```text
/DATA/2026/04/2026-04-25_readings.csv
/DATA/2026/04/2026-04-25_events.csv
/DATA/2026/04/2026-04-25_upload_queue.jsonl
```

---

### 10.2 Main Sensor Reading CSV

File name:

```text
YYYY-MM-DD_readings.csv
```

Purpose:

```text
Stores all valid or partially valid sensor readings in a database-friendly format.
```

Header:

```csv
record_id,gateway_id,node_id,node_type,source,timestamp_utc,frame_id,sequence,boot_count,battery_mv,rssi,snr,soil_temp_c,soil_moisture_pct,soil_ec_us_cm,air_temp_c,air_humidity_pct,air_pressure_hpa,status,quality_flags,error_code,raw_crc,created_at_gateway_utc
```

Example records:

```csv
record_id,gateway_id,node_id,node_type,source,timestamp_utc,frame_id,sequence,boot_count,battery_mv,rssi,snr,soil_temp_c,soil_moisture_pct,soil_ec_us_cm,air_temp_c,air_humidity_pct,air_pressure_hpa,status,quality_flags,error_code,raw_crc,created_at_gateway_utc
GW01-N2-00000124,GW01,N2_SOIL,soil,lora,2026-04-25T10:00:24Z,88421,124,7,, -94,7.5,21.40,38.20,1450,,,,OK,0,,A91F,2026-04-25T10:00:25Z
GW01-N3-00004511,GW01,N3_WEATHER,weather,lora,2026-04-25T10:00:39Z,88421,4511,5,,-90,8.1,,,,24.30,48.50,1012.80,OK,0,,82BC,2026-04-25T10:00:40Z
GW01-MAIN-SOIL-00000512,GW01,MAIN,soil,local_rs485,2026-04-25T10:00:58Z,88421,512,12,,,,,21.80,36.90,1510,,,,OK,0,,F21A,2026-04-25T10:00:59Z
```

---

### 10.3 Field Definitions

| Field | Type | Required | Description |
|---|---|---|---|
| `record_id` | text | yes | Unique record ID generated by gateway |
| `gateway_id` | text | yes | Gateway identifier, example `GW01` |
| `node_id` | text | yes | `N2_SOIL`, `N3_WEATHER`, `MAIN` |
| `node_type` | text | yes | `soil`, `weather`, `gateway` |
| `source` | text | yes | `lora`, `local_rs485`, `system` |
| `timestamp_utc` | datetime | yes | Official reading time from RTC |
| `frame_id` | integer | yes | 10-minute cycle identifier |
| `sequence` | integer | yes | Node sequence number |
| `boot_count` | integer | no | Node reboot counter |
| `battery_mv` | integer | no | Battery voltage in mV |
| `rssi` | integer | no | LoRa RSSI, only for LoRa packets |
| `snr` | float | no | LoRa SNR, only for LoRa packets |
| `soil_temp_c` | float | no | Soil temperature |
| `soil_moisture_pct` | float | no | Soil moisture percentage |
| `soil_ec_us_cm` | float | no | Electrical conductivity |

> Unused soil fields such as pH, salinity, and NPK must not be generated. If legacy storage/database fields exist, they must remain empty/null.
| `air_temp_c` | float | no | Air temperature |
| `air_humidity_pct` | float | no | Air relative humidity |
| `air_pressure_hpa` | float | no | Air pressure |
| `status` | text | yes | `OK`, `PARTIAL`, `MISSING`, `ERROR`, `DUPLICATE` |
| `quality_flags` | integer | yes | Bitmask for data quality |
| `error_code` | text | no | Error code if any |
| `raw_crc` | text | no | Packet CRC or sensor response CRC |
| `created_at_gateway_utc` | datetime | yes | Time the gateway saved the row |

---

## 11. Quality Flags

Use a bitmask so firmware can store multiple quality conditions in one integer.

| Bit | Decimal | Name | Meaning |
|---:|---:|---|---|
| 0 | 1 | `MISSING_VALUE` | One or more expected sensor values are missing |
| 1 | 2 | `CRC_ERROR` | LoRa or RS485 CRC error |
| 2 | 4 | `OUT_OF_RANGE` | Sensor value outside allowed physical range |
| 3 | 8 | `LOW_BATTERY` | Battery below configured threshold |
| 4 | 16 | `NO_ACK` | Sender did not receive ACK |
| 5 | 32 | `RETRY_PACKET` | Packet was retransmitted |
| 6 | 64 | `TIME_UNCERTAIN` | Time was not synchronized recently |
| 7 | 128 | `SENSOR_WARMUP_SHORT` | Sensor may not have stabilized |
| 8 | 256 | `SD_WRITE_RETRY` | SD write required retry |
| 9 | 512 | `UPLOAD_PENDING` | Record is pending upload |

Example:

```text
quality_flags = 10
```

Meaning:

```text
CRC_ERROR + LOW_BATTERY = 2 + 8
```

---

## 12. Error and Event Logging

### 12.1 Events CSV

File name:

```text
YYYY-MM-DD_events.csv
```

Header:

```csv
event_id,gateway_id,timestamp_utc,event_level,event_type,node_id,frame_id,sequence,error_code,message,value_1,value_2,created_at_gateway_utc
```

Example:

```csv
event_id,gateway_id,timestamp_utc,event_level,event_type,node_id,frame_id,sequence,error_code,message,value_1,value_2,created_at_gateway_utc
EVT-GW01-20260425-100025-001,GW01,2026-04-25T10:00:25Z,INFO,PACKET_RECEIVED,N2_SOIL,88421,124,,Soil packet received,-94,7.5,2026-04-25T10:00:25Z
EVT-GW01-20260425-101025-002,GW01,2026-04-25T10:10:25Z,WARN,NODE_MISSING,N2_SOIL,88422,,NODE_TIMEOUT,No packet received during assigned slot,,,2026-04-25T10:10:25Z
EVT-GW01-20260425-102040-003,GW01,2026-04-25T10:20:40Z,ERROR,SD_WRITE_ERROR,MAIN,88423,,SD_WRITE_FAIL,Failed to append readings row,,,2026-04-25T10:20:40Z
EVT-GW01-20260425-103016-004,GW01,2026-04-25T10:30:16Z,INFO,TIME_SYNC,MAIN,88424,,RTC_UPDATED,RTC synchronized from upload server,old_offset_s,4,2026-04-25T10:30:16Z
```

---

### 12.2 Event Levels

| Level | Meaning |
|---|---|
| `INFO` | Normal system activity |
| `WARN` | Recoverable issue that should be shown as notification |
| `ERROR` | Serious issue affecting data quality |
| `CRITICAL` | System failure requiring intervention |

---

### 12.3 Standard Error Codes

| Error Code | Meaning | Recommended Action |
|---|---|---|
| `NODE_TIMEOUT` | Node did not send during its slot | Store missing row and event |
| `LORA_CRC_FAIL` | Invalid LoRa packet CRC | Reject packet and log event |
| `RS485_TIMEOUT` | No Modbus response from soil sensor | Store partial/error row |
| `RS485_CRC_FAIL` | Invalid Modbus CRC | Retry once, then log |
| `SENSOR_POWER_FAIL` | Relay/sensor power suspected failed | Log error and store sensor status |
| `BME280_READ_FAIL` | Weather sensor failed | Store error row |
| `LOW_BATTERY` | Battery below threshold | Store warning event |
| `SD_INIT_FAIL` | SD card failed to initialize | Blink/serial error and retry |
| `SD_WRITE_FAIL` | File write failed | Retry then log if possible |
| `RTC_READ_FAIL` | RTC could not be read | Mark time uncertain |
| `RTC_TIME_INVALID` | RTC time invalid after power loss | Mark data with `TIME_UNCERTAIN` |
| `UPLOAD_BUTTON_PRESSED` | Manual upload requested | Start upload workflow |
| `UPLOAD_WIFI_TIMEOUT` | Hotspot not found or Wi-Fi failed | Stop upload and sleep |
| `UPLOAD_API_ERROR` | Server rejected request | Keep records pending |
| `UPLOAD_SUCCESS` | Upload completed | Store last upload metadata |

---

## 13. Missing Data Handling

If a node does not send data in its assigned slot, the Main Node must not wait indefinitely. It should:

```text
1. Wait only the configured receive window.
2. Create a readings row with status = MISSING.
3. Create an event row with event_type = NODE_MISSING.
4. Continue to the next node slot.
5. Sleep normally after the cycle.
```

Example missing row:

```csv
GW01-N2-MISSING-88422,GW01,N2_SOIL,soil,lora,2026-04-25T10:10:24Z,88422,,,,,,,,,,,,,,,,MISSING,1,NODE_TIMEOUT,,2026-04-25T10:10:25Z
```

This design ensures the website can later display:

```text
Node 2 did not send data at 10:10.
```

Instead of silently showing a gap.

---

## 14. Duplicate Packet Handling

If a node transmits the same packet more than once because it did not receive ACK, the Main Node should avoid storing duplicate readings.

Duplicate detection key:

```text
gateway_id + node_id + sequence
```

If duplicate detected:

```text
- Do not create a second normal readings row.
- Optionally log event_type = DUPLICATE_PACKET.
- Send ACK again to help the node return to sleep.
```

---

## 15. Node State Machines

### 15.1 Node 2 Soil Node State Machine

```text
BOOT
  |
  v
LOAD_CONFIG
  |
  v
SAFE_GPIO_INIT
  |-- relay OFF
  |-- MAX485 receive/idle
  |-- LoRa sleep if initialized
  |
  v
WAIT_UNTIL_MEASUREMENT_TIME
  |
  v
POWER_SOIL_SENSOR
  |
  v
WARMUP_DELAY
  |
  v
READ_RS485
  |-- success -> BUILD_DATA_PACKET
  |-- fail -> BUILD_ERROR_PACKET
  |
  v
POWER_OFF_SOIL_SENSOR
  |
  v
LORA_SEND
  |
  v
WAIT_ACK_SHORT
  |-- ack received -> UPDATE_NEXT_WAKE
  |-- no ack -> MARK_NO_ACK
  |
  v
SAVE_LOCAL_STATE
  |
  v
DEEP_SLEEP
```

---

### 15.2 Node 3 Weather Node State Machine

```text
BOOT
  |
  v
LOAD_CONFIG
  |
  v
BME280_FORCED_MEASUREMENT
  |-- success -> BUILD_WEATHER_PACKET
  |-- fail -> BUILD_ERROR_PACKET
  |
  v
LORA_SEND
  |
  v
WAIT_ACK_SHORT
  |
  v
DEEP_SLEEP
```

---

### 15.3 Main Node State Machine

```text
BOOT
  |
  v
INIT_RTC_SD_LORA
  |
  v
CHECK_UPLOAD_BUTTON
  |-- pressed -> UPLOAD_MODE
  |-- not pressed -> NORMAL_CYCLE

NORMAL_CYCLE
  |
  v
OPEN_LORA_WINDOWS
  |-- receive Node 2
  |-- receive Node 3
  |
  v
READ_LOCAL_SOIL_MANDATORY
  |
  v
VALIDATE_AND_TIMESTAMP_RECORDS
  |
  v
APPEND_TO_SD
  |
  v
WRITE_EVENTS
  |
  v
SET_NEXT_WAKE
  |
  v
DEEP_SLEEP

UPLOAD_MODE
  |
  v
LOAD_UPLOAD_QUEUE
  |
  v
ENABLE_WIFI_TEMPORARILY
  |
  v
CONNECT_TO_HOTSPOT_OR_LOCAL_NETWORK
  |
  v
UPLOAD_PENDING_DATA
  |
  v
RECEIVE_SERVER_TIME
  |
  v
UPDATE_RTC_IF_VALID
  |
  v
UPDATE_UPLOAD_STATE
  |
  v
DISABLE_WIFI
  |
  v
DEEP_SLEEP
```

---

## 16. Upload Button Workflow

The Main Node has a push button for manual upload triggering.

Button behavior:

```text
Default state: HIGH
Pressed state: LOW
Input mode: INPUT_PULLUP
```

Required firmware behavior:

```text
1. Check button on boot/wake.
2. Debounce for 50 to 200 ms.
3. If pressed for more than 1 second, enter upload mode.
4. Log UPLOAD_BUTTON_PRESSED event.
5. Enable Wi-Fi only inside upload mode.
6. Try to connect to known hotspot/network.
7. Upload pending records.
8. Update RTC from server time if upload succeeds.
9. Store last upload time and session metadata.
10. Disable Wi-Fi and return to sleep.
```

Recommended long-press actions:

| Press Duration | Action |
|---|---|
| 1 to 3 seconds | Start normal upload |
| 5 to 10 seconds | Start upload plus diagnostic summary |
| More than 10 seconds | Reserved for future maintenance mode |

---

## 17. Upload Queue Design

Even though the website/API implementation is out of scope, the local data format must prepare for it.

### 17.1 Upload Queue JSONL

File name:

```text
YYYY-MM-DD_upload_queue.jsonl
```

Each line is one JSON object. This is easier for chunked upload and recovery.

Example:

```jsonl
{"type":"reading","record_id":"GW01-N2-00000124","gateway_id":"GW01","node_id":"N2_SOIL","timestamp_utc":"2026-04-25T10:00:24Z","status":"OK","soil_moisture_pct":38.2,"soil_temp_c":21.4,"soil_ec_us_cm":1450,"battery_mv":null,"battery_status":"not_measured","rssi":-94,"snr":7.5}
{"type":"event","event_id":"EVT-GW01-20260425-101025-002","gateway_id":"GW01","timestamp_utc":"2026-04-25T10:10:25Z","event_level":"WARN","event_type":"NODE_MISSING","node_id":"N2_SOIL","error_code":"NODE_TIMEOUT","message":"No packet received during assigned slot"}
```

JSONL is recommended for upload because:

```text
- It supports line-by-line retry.
- It can mix readings and events.
- It maps directly to API request bodies.
- It is easier to resume after interruption.
```

---

### 17.2 Upload Manifest

File:

```text
/MANIFEST/manifest.json
```

Example:

```json
{
  "gateway_id": "GW01",
  "schema_version": 1,
  "generated_at_utc": "2026-04-25T10:30:00Z",
  "pending_files": [
    {
      "path": "/DATA/2026/04/2026-04-25_upload_queue.jsonl",
      "date": "2026-04-25",
      "record_count": 288,
      "event_count": 6,
      "size_bytes": 57344,
      "uploaded_offset": 0,
      "status": "PENDING"
    }
  ]
}
```

After successful upload:

```json
{
  "status": "UPLOADED",
  "uploaded_offset": 57344,
  "uploaded_at_utc": "2026-04-25T10:30:15Z"
}
```

---

## 18. Future Database Compatibility

The local data should be designed so it can map easily to PostgreSQL tables later.

Recommended future tables:

```text
sensor_readings
system_events
upload_sessions
node_status
```

### 18.1 Future `sensor_readings` Mapping

| Local CSV Field | Future PostgreSQL Column |
|---|---|
| `record_id` | `record_id` unique |
| `gateway_id` | `gateway_id` |
| `node_id` | `node_id` |
| `node_type` | `node_type` |
| `timestamp_utc` | `measured_at` |
| `frame_id` | `frame_id` |
| `sequence` | `sequence` |
| `battery_mv` | `battery_mv` |
| `rssi` | `rssi` |
| `snr` | `snr` |
| Soil fields | Soil columns |
| Weather fields | Weather columns |
| `status` | `status` |
| `quality_flags` | `quality_flags` |
| `error_code` | `error_code` |

### 18.2 Future `system_events` Mapping

| Local CSV Field | Future PostgreSQL Column |
|---|---|
| `event_id` | `event_id` unique |
| `gateway_id` | `gateway_id` |
| `timestamp_utc` | `occurred_at` |
| `event_level` | `level` |
| `event_type` | `type` |
| `node_id` | `node_id` |
| `error_code` | `error_code` |
| `message` | `message` |

---

## 19. Data Validation Rules

Main Node should validate values before storage.

Recommended validation ranges:

| Field | Valid Range | If invalid |
|---|---:|---|
| `soil_temp_c` | -20 to 80 | Mark `OUT_OF_RANGE` |
| `soil_moisture_pct` | 0 to 100 | Mark `OUT_OF_RANGE` |
| `soil_ec_us_cm` | 0 to 20000 | Mark `OUT_OF_RANGE` |
| `air_temp_c` | -40 to 85 | Mark `OUT_OF_RANGE` |
| `air_humidity_pct` | 0 to 100 | Mark `OUT_OF_RANGE` |
| `air_pressure_hpa` | 300 to 1200 | Mark `OUT_OF_RANGE` |
| `battery_mv` | depends on pack | Mark `LOW_BATTERY` if below threshold |

Invalid values should not crash the system. They should be stored with quality flags so the cloud can display warnings.

---

## 20. Battery Monitoring Fields

Each node should report battery voltage when possible.

Recommended battery thresholds:

| Node | Battery Type | Warning Threshold | Critical Threshold |
|---|---|---:|---:|
| Main Node | 3S2P lithium pack | 10.8 V | 10.2 V |
| Node 2 | 3S1P lithium pack | 10.8 V | 10.2 V |
| Node 3 | 1S2P lithium pack | 3.5 V | 3.3 V |

Store voltage as millivolts:

```text
11800 instead of 11.8V
3760 instead of 3.76V
```

Reason:

```text
Integer millivolts are safer for firmware, storage, and database indexing.
```
Battery voltage monitoring is currently not implemented in hardware.
All battery fields are reserved for future extension and must be stored as null/not_measured.

---

## 21. SD Card Write Strategy

To protect data integrity:

```text
1. Create folder if it does not exist.
2. Open file in append mode.
3. If file is new, write header first.
4. Write exactly one complete row per record.
5. Flush file.
6. Close file.
7. Never keep files open during sleep.
```

If SD write fails:

```text
- Retry once.
- If retry fails, log SD_WRITE_FAIL if possible.
- Keep a minimal RAM error counter.
- Continue system operation if safe.
```

---

## 22. Record ID Design

Every reading must have a globally unique record ID.

Format:

```text
<GATEWAY_ID>-<NODE_CODE>-<SEQUENCE_PADDED>
```

Examples:

```text
GW01-N2-00000124
GW01-N3-00004511
GW01-MAIN-SOIL-00000512
GW01-N2-MISSING-88422
```

Event ID format:

```text
EVT-<GATEWAY_ID>-<YYYYMMDD-HHMMSS>-<COUNTER>
```

Example:

```text
EVT-GW01-20260425-101025-002
```

---

## 23. Configuration Files

### 23.1 System Config

File:

```text
/CONFIG/system_config.json
```

Example:

```json
{
  "gateway_id": "GW01",
  "network_id": 1001,
  "schema_version": 1,
  "measurement_interval_seconds": 600,
  "soil_warmup_seconds": 15,
  "ack_timeout_ms": 1800,
  "lora_frequency_mhz": 433,
  "upload_button_enabled": true,
  "upload_wifi_timeout_seconds": 90,
  "time_sync_on_upload": true,
  "local_main_soil_sensor_mode": "mandatory_main_pivot"
}
```

### 23.2 Node Config

File:

```text
/CONFIG/nodes_config.json
```

Example:

```json
{
  "nodes": [
    {
      "node_id": "N2_SOIL",
      "type": "soil",
      "slot_offset_seconds": 24,
      "expected_interval_seconds": 600,
      "enabled": true
    },
    {
      "node_id": "N3_WEATHER",
      "type": "weather",
      "slot_offset_seconds": 38,
      "expected_interval_seconds": 600,
      "enabled": true
    }
  ]
}
```

---

## 24. Firmware Implementation Requirements

### 24.1 Common Requirements for All Nodes

```text
- Use structured constants for node ID, network ID, firmware version.
- Maintain a sequence counter in non-volatile storage if possible.
- Report boot count if possible.
- Use LoRa.sleep() before deep sleep.
- Disable Wi-Fi unless needed.
- Keep ACK wait time short.
- Validate sensor readings before sending or storing.
- Never block forever waiting for sensor or LoRa.
```

---

### 24.2 Node 2 Requirements

```text
- Relay must be OFF by default.
- Relay must turn ON only during soil measurement.
- Soil warmup delay must be configurable.
- RS485 read should include timeout.
- If RS485 fails, send ERROR_REPORT or DATA_SOIL with status ERROR.
- Turn relay OFF even if sensor read fails.
- LoRa packet must include sequence, sensor status, and battery status as not_measured.
- Soil sensor data must include only temperature, moisture, and EC.
- Do not read or transmit pH, salinity, or NPK fields.
```

---

### 24.3 Node 3 Requirements

```text
- BME280 must be read in forced mode.
- If BME280 fails, send status ERROR.
- Do not keep sensor in continuous mode.
- LoRa packet must include sequence, sensor status, and battery status as not_measured.
- Soil sensor data must include only temperature, moisture, and EC.
- Do not read or transmit pH, salinity, or NPK fields.
```

---

### 24.4 Main Node Requirements

```text
- RTC is the official timestamp source.
- SD card is the official local storage.
- Missing nodes must be logged.
- Duplicate packets must be detected using node_id + sequence.
- Upload button must be debounced.
- Wi-Fi must only run during upload mode.
- Successful upload must update upload_state.json.
- Server time from upload response must update RTC when valid.
- Event logs must be uploaded along with readings.
```

---

## 25. Upload Mode Without Permanent Internet

The system has no permanent internet connection. Upload is user-triggered.

Recommended upload mode:

```text
User arrives at field
  |
  v
User enables phone hotspot or local Wi-Fi
  |
  v
User presses Main Node upload button
  |
  v
Main Node wakes/enters upload mode
  |
  v
Main Node connects to configured Wi-Fi
  |
  v
Main Node sends pending JSONL records to Web Service
  |
  v
Web Service responds with server time and accepted count
  |
  v
Main Node updates RTC and upload_state.json
  |
  v
Main Node disables Wi-Fi and sleeps
```

Upload mode timeout:

```text
Recommended: 60 to 90 seconds
```

If Wi-Fi or server is unavailable:

```text
- Log UPLOAD_WIFI_TIMEOUT or UPLOAD_API_ERROR.
- Keep all records pending.
- Disable Wi-Fi.
- Return to sleep.
```

---

## 26. What Should Be Uploaded Later

When upload is implemented, the system should upload:

```text
1. Sensor readings
2. System events
3. Upload session metadata
4. Last upload state
5. Optional node status summary
```

Upload payload should include both readings and events because events are required for cloud notifications.

Example upload session payload:

```json
{
  "gateway_id": "GW01",
  "schema_version": 1,
  "upload_started_at_utc": "2026-04-25T10:30:00Z",
  "firmware_version": "gw-1.0.0",
  "readings": [],
  "events": []
}
```

---

## 27. Notification-Ready Events

The website can later generate notifications from uploaded events.

Important events to display:

| Event Type | Website Notification |
|---|---|
| `NODE_MISSING` | A node did not send data |
| `LOW_BATTERY` | Battery is low |
| `RS485_TIMEOUT` | Soil sensor did not respond |
| `BME280_READ_FAIL` | Weather sensor failed |
| `SD_WRITE_FAIL` | Storage error |
| `RTC_TIME_INVALID` | Time may be incorrect |
| `UPLOAD_SUCCESS` | Data synchronized successfully |
| `UPLOAD_API_ERROR` | Upload failed |

---

## 28. Recommended Project Folder Structure

Recommended local project organization:

```text
smart-farm-iot/
  docs/
    pin_mapping.md
    iot_data_system_design.md
    packet_protocol.md
    sd_storage_schema.md

  firmware/
    main_node/
    node2_soil/
    node3_weather/

  shared/
    protocol/
    schemas/
    test_data/

  tools/
    sd_validator/
    csv_to_jsonl/
```

This document belongs here:

```text
smart-farm-iot/docs/iot_data_system_design.md
```

---

## 29. Agent Instructions for Future Firmware Generation

When using an agent to generate firmware later, give it these rules:

```text
- Do not change hardware pin mapping unless explicitly requested.
- Use the existing pin_mapping.md file as the only source of pin assignments.
- Implement the state machines in this document.
- Implement relay-based soil sensor power control.
- Implement 10-minute measurement interval.
- Implement LoRa packets with sequence number, node ID, battery, status, and CRC.
- Implement ACK and short receive windows.
- Implement SD card CSV logging on Main Node.
- Implement event logging for missing nodes and sensor errors.
- Implement manual upload button workflow but keep cloud upload modular.
- Implement upload_state.json for last upload metadata.
- Implement RTC time sync update from upload response later.
```

---

## 30. Final System Behavior Summary

The final intended behavior is:

```text
Every 10 minutes:

1. Node 2 wakes.
2. Node 2 powers soil sensor using relay.
3. Node 2 waits for sensor stabilization.
4. Node 2 reads RS485 soil data.
5. Node 2 powers sensor off.
6. Node 2 sends data by LoRa.
7. Node 2 waits briefly for ACK.
8. Node 2 sleeps.

9. Node 3 wakes.
10. Node 3 reads BME280 in forced mode.
11. Node 3 sends weather data by LoRa.
12. Node 3 waits briefly for ACK.
13. Node 3 sleeps.

14. Main Node receives packets.
15. Main Node reads its mandatory local soil sensor at Pivot 1.
16. Main Node timestamps all records using RTC.
17. Main Node records valid data in readings CSV.
18. Main Node records missing nodes and failures in events CSV.
19. Main Node updates upload queue.
20. Main Node sleeps.

When user presses upload button:

20. Main Node enables Wi-Fi temporarily.
21. Main Node uploads pending readings and events.
22. Main Node receives server time.
23. Main Node updates RTC.
24. Main Node saves last_upload_time.
25. Main Node disables Wi-Fi.
26. Main Node returns to low-power operation.
```

---

## 31. Design Priorities

The firmware should prioritize:

```text
1. Data integrity
2. Battery life
3. Automatic recovery after power loss
4. Clear error logging
5. Cloud-ready data structure
6. Simple future integration with Render Web Service and PostgreSQL
```

This design makes the system professional, maintainable, and ready for future expansion without changing the local data acquisition architecture.
