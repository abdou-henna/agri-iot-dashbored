# 🛠️ IoT System Debug Strategy

## 1. Purpose

This document defines a unified debugging strategy for all nodes in the IoT agricultural monitoring system.

The system is battery-powered and may run without access to Serial Monitor during field operation. Therefore, debugging must be handled through:

- LoRa packets
- SD card logs
- system events
- upload diagnostics
- node status fields
- lightweight error codes
- optional debug LEDs if available

The goal is:

```text
The data itself must help diagnose the system.
```

---

## 2. Debug Philosophy

In this system, debugging must not depend only on USB Serial.

Every node must be able to report:

```text
Who am I?
What did I try to do?
Did it succeed?
If not, where did it fail?
When did it happen?
Can the Main Node store this problem?
Can the WebService receive it later?
```

The debug system must be:

```text
low-power
short
structured
machine-readable
compatible with SD storage
compatible with WebService events
safe during failures
```

---

## 3. Debug Levels

Use the following debug levels across all firmware:

| Level | Name | Meaning | Should be uploaded? |
|---|---|---|---|
| 0 | `none` | No issue | No |
| 1 | `info` | Normal system message | Optional |
| 2 | `warning` | Non-critical issue | Yes |
| 3 | `error` | Failed operation | Yes |
| 4 | `critical` | Serious system failure | Yes |

Recommended enum:

```cpp
enum DebugSeverity {
  DBG_NONE = 0,
  DBG_INFO = 1,
  DBG_WARNING = 2,
  DBG_ERROR = 3,
  DBG_CRITICAL = 4
};
```

---

## 4. Universal Node Debug Fields

Every node packet should include lightweight debug fields.

Recommended common fields:

| Field | Example | Description |
|---|---|---|
| `nid` | `"N3"` | Node ID |
| `ntype` | `"weather"` | Node type |
| `seq` | `102` | Sequence number |
| `boot` | `14` | Boot counter |
| `stg` | `5` | Last execution stage |
| `status` | `"ok"` | General packet status |
| `err` | `"BME280_NOT_FOUND"` | Error code, omitted if no error |
| `uptime` | `1530` | Milliseconds since boot |
| `pv` | `1` | Protocol version |

Example normal packet:

```json
{
  "pv": 1,
  "pt": "weather_reading",
  "nid": "N3",
  "ntype": "weather",
  "seq": 42,
  "boot": 18,
  "stg": 5,
  "uptime": 1450,
  "temp": 24.3,
  "hum": 48.5,
  "pres": 1012.8,
  "batt": "not_measured",
  "status": "ok"
}
```

Example error packet:

```json
{
  "pv": 1,
  "pt": "weather_reading",
  "nid": "N3",
  "ntype": "weather",
  "seq": 42,
  "boot": 18,
  "stg": 2,
  "uptime": 390,
  "batt": "not_measured",
  "status": "sensor_error",
  "err": "BME280_NOT_FOUND"
}
```

---

## 5. Execution Stage Debugging

Each node must maintain a stage number. The stage tells where the firmware reached before sleeping or failing.

### 5.1 Node3 Weather Stages

| Stage | Meaning |
|---:|---|
| 0 | Boot started |
| 1 | GPIO initialized |
| 2 | BME280 initialization |
| 3 | BME280 forced measurement |
| 4 | LoRa initialization |
| 5 | Packet built |
| 6 | LoRa transmission completed |
| 7 | ACK wait finished |
| 8 | Preparing for sleep |
| 9 | Deep sleep entered |

Recommended constants:

```cpp
#define STAGE_BOOT              0
#define STAGE_GPIO_READY        1
#define STAGE_BME_INIT          2
#define STAGE_BME_READ          3
#define STAGE_LORA_INIT         4
#define STAGE_PACKET_BUILT      5
#define STAGE_LORA_SENT         6
#define STAGE_ACK_DONE          7
#define STAGE_SLEEP_PREPARE     8
#define STAGE_DEEP_SLEEP        9
```

---

### 5.2 Node2 Soil Stages

| Stage | Meaning |
|---:|---|
| 0 | Boot started |
| 1 | GPIO initialized |
| 2 | Relay ON / soil sensor power enabled |
| 3 | Soil sensor warm-up |
| 4 | MAX485 / Modbus request |
| 5 | RS485 response received |
| 6 | Soil data parsed |
| 7 | Relay OFF / sensor power disabled |
| 8 | LoRa initialized |
| 9 | Packet sent |
| 10 | ACK wait finished |
| 11 | Preparing sleep |
| 12 | Deep sleep entered |

---

### 5.3 Main Node Stages

| Stage | Meaning |
|---:|---|
| 0 | Boot started |
| 1 | GPIO initialized |
| 2 | RTC initialized |
| 3 | SD initialized |
| 4 | LoRa initialized |
| 5 | Receive window opened |
| 6 | Packet received |
| 7 | Packet parsed |
| 8 | Record saved to SD |
| 9 | Event saved to SD |
| 10 | Upload button checked |
| 11 | WiFi upload started |
| 12 | WebService upload completed |
| 13 | RTC updated from server time |
| 14 | Preparing sleep / idle |

---

## 6. Boot Counter

Each node should store a boot counter in RTC memory if possible.

Example:

```cpp
RTC_DATA_ATTR uint32_t bootCount = 0;

void updateBootCounter() {
  if (bootCount > 1000000) {
    bootCount = 0;
  }
  bootCount++;
}
```

Purpose:

```text
If bootCount increases too fast, the node may be resetting repeatedly.
```

Main Node should store `boot` in SD logs.

---

## 7. Sequence Counter

Each node should keep a sequence counter.

Purpose:

```text
Detect missing packets
Detect duplicate packets
Build record_id
Order readings
```

Recommended behavior:

```text
Increment seq only after a successful sensor reading and LoRa send attempt.
Do not fake sequence continuity after hard power loss.
```

Example:

```cpp
RTC_DATA_ATTR uint32_t nodeSeq = 0;

void validateSeq() {
  if (nodeSeq > 1000000) {
    nodeSeq = 0;
  }
}
```

---

## 8. Error Code Standard

All nodes must use short, consistent error codes.

### 8.1 Weather Node Error Codes

| Error Code | Meaning |
|---|---|
| `BME280_NOT_FOUND` | BME280 not detected |
| `BME280_MEASUREMENT_FAILED` | Forced measurement failed |
| `LORA_INIT_FAILED` | LoRa module failed to initialize |
| `LORA_SEND_FAILED` | LoRa send attempt failed |

### 8.2 Soil Node Error Codes

| Error Code | Meaning |
|---|---|
| `SOIL_SENSOR_NO_RESPONSE` | No RS485 reply |
| `SOIL_SENSOR_CRC_ERROR` | Modbus CRC invalid |
| `SOIL_SENSOR_PARSE_ERROR` | Response could not be parsed |
| `MAX485_TIMEOUT` | RS485 timeout |
| `RELAY_ON_FAILED_ASSUMED` | Relay command sent but sensor still did not respond |
| `LORA_INIT_FAILED` | LoRa failed |
| `LORA_SEND_FAILED` | Packet transmission failed |

### 8.3 Main Node Error Codes

| Error Code | Meaning |
|---|---|
| `RTC_INIT_FAILED` | RTC DS3231 not detected |
| `SD_INIT_FAILED` | SD card failed |
| `SD_WRITE_FAILED` | Could not write record/event |
| `LORA_INIT_FAILED` | LoRa failed |
| `PACKET_PARSE_FAILED` | Received packet could not be parsed |
| `UNKNOWN_NODE` | Packet from unknown node |
| `MISSING_NODE` | Node did not send in expected slot |
| `WIFI_CONNECT_FAILED` | Upload WiFi failed |
| `UPLOAD_HTTP_FAILED` | WebService HTTP request failed |
| `UPLOAD_RESPONSE_INVALID` | Invalid server response |
| `RTC_UPDATE_FAILED` | Could not update RTC from server time |

---

## 9. Status Values

Use these status values consistently:

| Status | Meaning |
|---|---|
| `ok` | Measurement successful |
| `sensor_error` | Sensor problem |
| `rs485_error` | RS485 or Modbus issue |
| `lora_error` | LoRa init/send issue |
| `storage_error` | SD card issue |
| `upload_error` | WebService upload issue |
| `missing_node` | Expected node packet not received |
| `clock_error` | RTC/time problem |

---

## 10. Main Node Debug Responsibility

The Main Node is the central debug collector.

It must:

```text
Receive debug fields from Node2 and Node3
Add measured_at using RTC
Add RSSI and SNR
Generate system events when needed
Save readings to SD
Save errors to SD
Upload readings and events to WebService later
```

The Main Node must not ignore error packets.

If a node sends:

```json
{
  "status": "sensor_error",
  "err": "BME280_NOT_FOUND"
}
```

The Main Node must save a `system_events` record.

---

## 11. SD Debug File Structure

Recommended SD layout:

```text
/DATA/
  /YYYY/
    /MM/
      YYYY-MM-DD_readings.csv
      YYYY-MM-DD_events.csv
      YYYY-MM-DD_uploads.csv
      YYYY-MM-DD_raw_packets.log
```

---

## 12. Readings CSV Debug Fields

Every reading line should include:

```csv
record_id,upload_id,gateway_id,node_id,node_type,node_seq,node_boot,node_stage,frame_id,measured_at,rssi,snr,battery_mv,battery_percent,battery_status,soil_temperature_c,soil_moisture_percent,soil_ec_us_cm,soil_ph,soil_salinity,air_temperature_c,air_humidity_percent,air_pressure_hpa,status,error_code,raw_packet
```

Important:

```text
battery_mv and battery_percent remain empty/null because no battery measurement hardware exists.
This is not an error.
```

---

## 13. Events CSV Format

Recommended event format:

```csv
event_id,upload_id,gateway_id,node_id,event_type,severity,event_time,message,error_code,node_stage,details_json
```

Example:

```csv
EV-GW01-20260425-0001,,GW01,N3,sensor_error,error,2026-04-25T10:00:21Z,BME280 not detected,BME280_NOT_FOUND,2,"{""source"":""node_packet""}"
```

---

## 14. Raw Packet Log

The Main Node should optionally save raw LoRa packets:

```text
/YYYY/MM/YYYY-MM-DD_raw_packets.log
```

Example:

```text
2026-04-25T10:00:21Z | RSSI=-90 | SNR=8.1 | {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":42,"stg":5,"temp":24.3,"hum":48.5,"pres":1012.8,"status":"ok"}
```

Purpose:

```text
If parsing fails later, the original packet is still available.
```

This file can be disabled later to save SD writes.

---

## 15. WebService Event Compatibility

The WebService already supports a `system_events` table.

Main Node should map debug problems to WebService event fields:

| Node Debug | WebService Field |
|---|---|
| `event_id` | `event_id` |
| `gateway_id` | `gateway_id` |
| `node_id` | `node_id` |
| `status` / `err` | `event_type` |
| severity | `severity` |
| RTC time | `event_time` |
| message | `message` |
| extra data | `details` JSON |

Example upload event:

```json
{
  "event_id": "EV-GW01-20260425-0001",
  "event_type": "sensor_error",
  "severity": "error",
  "event_time": "2026-04-25T10:00:21Z",
  "node_id": "N3",
  "message": "BME280 not detected on Node3",
  "details": {
    "error_code": "BME280_NOT_FOUND",
    "node_stage": 2,
    "packet_source": "lora"
  }
}
```

---

## 16. Missing Node Detection

The Main Node must detect missing nodes during expected receive windows.

Example:

```text
Expected N3 in weather slot
No packet received within RX window
↓
Create event:
event_type = missing_node
severity = warning
node_id = N3
```

Example:

```json
{
  "event_type": "missing_node",
  "severity": "warning",
  "node_id": "N3",
  "message": "Weather node did not transmit during expected slot",
  "details": {
    "expected_slot": "weather",
    "frame_id": 88421
  }
}
```

---

## 17. Debug Without Serial

Because field operation may be battery-only:

```text
Serial Monitor must be optional, not required.
```

Required alternatives:

```text
LoRa packet debug fields
SD events log
raw packet log
WebService uploaded system_events
boot counter
stage number
error codes
```

---

## 18. Optional Debug LED

If a free LED or onboard LED exists, it may be used only during development.

Example patterns:

| Pattern | Meaning |
|---|---|
| 1 short blink | Boot |
| 2 short blinks | Sensor OK |
| 3 short blinks | LoRa OK |
| 5 fast blinks | Error |

Production rule:

```text
Disable LED debug in final low-power build.
```

---

## 19. Debug Macros

Recommended debug macros:

```cpp
#define DEBUG_MODE false

#if DEBUG_MODE
  #define DBG(x) Serial.println(x)
  #define DBGF(...) Serial.printf(__VA_ARGS__)
#else
  #define DBG(x)
  #define DBGF(...)
#endif
```

Do not use raw `Serial.print()` directly in production code.

---

## 20. Safe Failure Rule

All nodes must follow this failure rule:

```text
If something fails:
1. Save/send the error if possible.
2. Turn off active hardware.
3. Enter sleep.
4. Try again in the next cycle.
```

Never do:

```text
while(true);
endless retry loops;
continuous LoRa receive;
continuous WiFi retry;
relay left ON after failure;
sensor left powered after failure;
```

---

## 21. Upload Debugging

When upload button is pressed, Main Node must create upload lifecycle events.

Recommended events:

```text
upload_started
wifi_connected
upload_http_started
upload_finished
upload_failed
clock_updated
```

Example upload metadata:

```json
{
  "upload_id": "UP-GW01-20260425-001",
  "gateway_id": "GW01",
  "started_at": "2026-04-25T10:00:00Z",
  "finished_at": "2026-04-25T10:01:20Z",
  "records_count": 288,
  "events_count": 4,
  "status": "success"
}
```

---

## 22. Debug Checklist for Firmware Agents

Before accepting firmware for any node, verify:

```text
[ ] Debug fields included in packets where applicable.
[ ] status and err fields are consistent.
[ ] stage number is updated before important operations.
[ ] boot counter exists if node supports RTC memory.
[ ] node_seq exists if node sends readings.
[ ] Errors never leave relay/sensor/WiFi/LoRa active.
[ ] LoRa.sleep() called before deep sleep.
[ ] No infinite retry loops.
[ ] Serial is optional and behind DEBUG_MODE.
[ ] Main Node logs missing nodes.
[ ] Main Node creates system_events for errors.
[ ] Battery missing values are not treated as faults.
[ ] No NPK fields are added.
```

---

## 23. Recommended Debug Development Flow

Use this order:

```text
1. Implement Node3 packet debug fields.
2. Implement Main Node raw packet receiver.
3. Confirm Main Node receives N3 packets.
4. Implement SD readings/events log.
5. Implement Node2 debug fields.
6. Add missing-node detection.
7. Add upload lifecycle events.
8. Upload events to WebService.
9. Build website notifications later.
```

---

## 24. Final Rule

For this project:

```text
A silent failure is not acceptable.
A low-power logged failure is acceptable.
```

Every failure should become either:

```text
a LoRa error packet
an SD event
a WebService system_event
or all of them
```
