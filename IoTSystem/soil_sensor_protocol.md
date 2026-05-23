# Soil Sensor Protocol & Pivot Measurement Design

## 1. Purpose

This document defines the official soil-sensor design for the project.

It clarifies that the system contains **two independent pivot measurement points**, and each pivot has its own mandatory soil sensor.

This file must be used as the reference for:

- Main Node local soil measurement
- Node2 remote soil measurement
- RS485 / MAX485 handling
- Relay-based soil sensor power control
- LoRa packet design for soil readings
- SD storage fields
- WebService-compatible soil data format
- Future Modbus register implementation

---

## 2. Final Soil Measurement Architecture

The system has **two pivots**.

Each pivot must have its own soil sensor.

| Pivot | Sensor Location | Connected To | Communication | Status |
|---|---|---|---|---|
| Pivot 1 | Main pivot / main rotating axis | Main Node | RS485 / MAX485 directly | Mandatory |
| Pivot 2 | Second pivot / second rotating axis | Node2 | RS485 / MAX485, then LoRa to Main | Mandatory |

Important:

```text
Main Node soil sensor is NOT optional.
Node2 soil sensor is NOT optional.
They measure two different physical places.
```

They are not backups for each other.

Both data streams must be collected, stored, and uploaded separately.

---

## 3. Physical Meaning of Each Soil Source

### 3.1 Pivot 1 — Main Node Local Soil Sensor

This sensor is installed at the main pivot / main rotating axis location.

It is connected directly to the Main Node through:

```text
Soil Sensor -> RS485/MAX485 -> Main Node ESP32
```

The Main Node must read this soil sensor in every normal measurement cycle.

The resulting data represents:

```text
Soil condition at Pivot 1
```

### 3.2 Pivot 2 — Node2 Remote Soil Sensor

This sensor is installed at the second pivot / another field axis location.

It is connected to Node2 through RS485, and Node2 sends readings to the Main Node using LoRa:

```text
Soil Sensor -> RS485/MAX485 -> Node2 ESP32-C3 -> LoRa -> Main Node
```

The resulting data represents:

```text
Soil condition at Pivot 2
```

---

## 4. Mandatory Measurement Rule

Every 10-minute measurement cycle must attempt to collect:

```text
1. Pivot 1 soil data from Main Node local RS485 sensor
2. Pivot 2 soil data from Node2 LoRa packet
3. Weather data from Node3
```

If one source fails, the system must:

```text
- log the failure
- create a system event
- continue collecting the other sources
- never replace one pivot's data with another pivot's data
```

Example:

```text
If Node2 fails:
Main local soil reading remains valid for Pivot 1.
Node2 missing event is logged for Pivot 2.

If Main local soil sensor fails:
Node2 reading remains valid for Pivot 2.
Main local soil sensor error is logged for Pivot 1.
```

---

## 5. Soil Sensor Output Values

The soil sensor used in this project provides only the following values:

| Field | Meaning | Required |
|---|---|---|
| `soil_temperature_c` | Soil temperature in Celsius | Yes |
| `soil_moisture_percent` | Soil moisture percentage | Yes |
| `soil_ec_us_cm` | Electrical conductivity in uS/cm | Yes |

The sensor does **not** provide:

```text
soil_ph
soil_salinity
nitrogen
phosphorus
potassium
NPK
```

Therefore, firmware must not attempt to read or generate:

```text
soil_ph
soil_salinity
n
p
k
npk
nitrogen
phosphorus
potassium
```

If the existing schema contains unused fields such as `soil_ph` or `soil_salinity`, they must remain:

```text
null
empty
not provided
```

They must not contain fake values.

---

## 6. Data Source Identity

Each soil reading must identify its source clearly.

### 6.1 Main Node Local Soil Record

Main local soil record must use:

```text
node_id = MAIN
node_type = soil
source = local_rs485
location_id = pivot_1_main
```

If `location_id` is not implemented yet in the current firmware or WebService schema, do not break compatibility. Instead, include the location information in local metadata, event details, README, or future schema planning.

Recommended future field:

```text
location_id
```

Recommended value:

```text
pivot_1_main
```

### 6.2 Node2 Remote Soil Record

Node2 soil record must use:

```text
node_id = N2
node_type = soil
source = lora
location_id = pivot_2_remote
```

If `location_id` is not implemented yet, preserve this distinction using `node_id` and documentation.

Recommended future field:

```text
location_id
```

Recommended value:

```text
pivot_2_remote
```

---

## 7. WebService-Compatible Soil Fields

Both Main Node local soil and Node2 remote soil must eventually map to the same WebService soil columns:

```text
soil_temperature_c
soil_moisture_percent
soil_ec_us_cm
```

The following fields must remain null/empty unless the schema requires them:

```text
soil_ph = null
soil_salinity = null
battery_mv = null
battery_percent = null
battery_status = "not_measured"
```

No NPK fields are allowed.

---

## 8. Record ID Design

### 8.1 Main Local Soil Record ID

Recommended format:

```text
GW01-MAIN-SOIL-<frame_id>
```

or if a sequence counter is later added:

```text
GW01-MAIN-SOIL-<sequence_padded>
```

Examples:

```text
GW01-MAIN-SOIL-88421
GW01-MAIN-SOIL-000001
```

### 8.2 Node2 Soil Record ID

Recommended format:

```text
GW01-N2-<sequence_padded>
```

Example:

```text
GW01-N2-000124
```

---

## 9. Local Storage Requirements

The Main Node must store both soil readings as separate records.

Example CSV-style logical rows:

```csv
record_id,gateway_id,node_id,node_type,source,location_id,measured_at,soil_temperature_c,soil_moisture_percent,soil_ec_us_cm,status
GW01-MAIN-SOIL-88421,GW01,MAIN,soil,local_rs485,pivot_1_main,2026-04-25T10:00:45Z,21.7,36.2,1420,ok
GW01-N2-000124,GW01,N2,soil,lora,pivot_2_remote,2026-04-25T10:00:25Z,22.1,39.8,1510,ok
```

If the current CSV schema does not contain `source` or `location_id`, do not break the current code. The minimum required separation is:

```text
node_id = MAIN
node_id = N2
```

---

## 10. Measurement Timing

Recommended cycle:

```text
T + 00s  Main Node wakes and prepares LoRa receiver
T + 05s  Node2 powers Pivot 2 soil sensor
T + 20s  Node2 reads Pivot 2 soil sensor
T + 24s  Node2 sends Pivot 2 soil packet
T + 25s  Main Node receives Node2 packet and sends ACK
T + 35s  Node3 sends weather data
T + 38s  Main Node receives Node3 packet and sends ACK
T + 45s  Main Node powers Pivot 1 local soil sensor
T + 45s-60s Main Node reads Pivot 1 local soil sensor
T + 70s  Main Node stores all readings/events to SD
T + 75s  Main Node sleeps
```

Important:

```text
Main Node local soil reading must not block LoRa receive windows.
```

Therefore, the Main Node should read its local soil sensor **after** expected LoRa receive windows, unless the final scheduling implementation intentionally reserves a different safe slot.

---

## 11. Relay Power Control

Both Pivot 1 and Pivot 2 soil sensors are powered only during measurement.

Required relay behavior:

```text
Relay OFF by default
Relay ON before measurement
Wait warm-up
Read RS485
Relay OFF immediately after reading
Relay OFF on every error path
Relay OFF before sleep
```

Never leave the soil sensor powered continuously.

Never use `NC` relay contact for this design.

Use:

```text
COM + NO
```

so that the sensor is OFF when the relay is inactive.

---

## 12. RS485 / MAX485 Direction Control

For MAX485 with RE and DE connected together:

```text
LOW  = receive / driver inactive
HIGH = transmit
```

Required behavior:

```text
Before Modbus request:
  set DE/RE HIGH

After request bytes are sent:
  set DE/RE LOW

During response:
  keep DE/RE LOW

When idle or sleeping:
  keep DE/RE LOW
```


---

## 13. Modbus Register Map (FINAL)

The soil sensor Modbus register map is **confirmed and validated from real hardware testing**.

### Communication Parameters

```text
Protocol: Modbus RTU
Baud rate: 4800
Data format: 8N1
Slave ID: 0x01
Function Code: 0x03 (Read Holding Registers)
Start Address: 0x0000
Register Count: 0x0003
````

---

### Request Frame

```text
01 03 00 00 00 03 CRC_L CRC_H
```

Example CRC:

```text
05 CB
```

---

### Response Frame

```text
[ID] [FUNC] [BYTE_COUNT] [DATA...] [CRC_L] [CRC_H]

01 03 06 XX XX XX XX XX XX CRC CRC
```

Total length: **11 bytes**

---

### Register Mapping

| Register | Bytes          | Field                 | Conversion |
| -------- | -------------- | --------------------- | ---------- |
| 0        | res[3], res[4] | soil_moisture_percent | value / 10 |
| 1        | res[5], res[6] | soil_temperature_c    | value / 10 |
| 2        | res[7], res[8] | soil_ec_us_cm         | raw        |

---

### Data Extraction Reference

```cpp
soil_moisture_percent = ((res[3] << 8) | res[4]) / 10.0;
soil_temperature_c    = ((res[5] << 8) | res[6]) / 10.0;
soil_ec_us_cm         = ((res[7] << 8) | res[8]);
```

---

### Critical Rules

```text
- Do NOT change register addresses
- Do NOT change scaling
- Do NOT assume additional registers
- Do NOT attempt to read pH or salinity
```

---


## 14. Node2 Soil Packet Requirements

Node2 must send a LoRa packet that represents Pivot 2 soil data.

Recommended compact JSON:

```json
{
  "pv": 1,
  "pt": "soil_reading",
  "nid": "N2",
  "ntype": "soil",
  "seq": 124,
  "boot": 7,
  "stg": 9,
  "uptime": 20000,
  "temp": 21.4,
  "mois": 38.2,
  "ec": 1450,
  "batt": "not_measured",
  "status": "ok"
}
```

Allowed soil keys:

| Packet Field | Meaning |
|---|---|
| `temp` | soil_temperature_c |
| `mois` | soil_moisture_percent |
| `ec` | soil_ec_us_cm |

Forbidden packet fields:

```text
ph
sal
n
p
k
npk
nitrogen
phosphorus
potassium
```

---

## 15. Main Node Local Soil Internal Record

The Main Node does not need to send its local soil data by LoRa. It must create the record internally.

Recommended internal logical data:

```json
{
  "node_id": "MAIN",
  "node_type": "soil",
  "source": "local_rs485",
  "location_id": "pivot_1_main",
  "soil_temperature_c": 21.7,
  "soil_moisture_percent": 36.2,
  "soil_ec_us_cm": 1420,
  "battery_mv": null,
  "battery_percent": null,
  "battery_status": "not_measured",
  "status": "ok"
}
```

---

## 16. Failure Handling

### 16.1 Main Local Soil Failure

If Pivot 1 sensor fails:

```text
event_type = sensor_error or rs485_error
node_id = MAIN
severity = error
error_code = LOCAL_SOIL_REGISTER_MAP_MISSING / LOCAL_RS485_TIMEOUT / LOCAL_SOIL_PARSE_FAILED
```

The system must continue:

```text
- receive/store Node2 if available
- receive/store Node3 if available
- upload existing data when requested
```

### 16.2 Node2 Soil Failure

If Pivot 2 sensor fails, Node2 should send an error packet if possible.

Main Node must store it as:

```text
node_id = N2
node_type = soil
location = pivot_2_remote
event_type = sensor_error or rs485_error
```

If Node2 sends nothing:

```text
event_type = missing_node
node_id = N2
severity = warning
```

---

## 17. Firmware Implementation Rules

All firmware agents must follow:

```text
- Treat both soil sensors as mandatory.
- Do not remove either soil source.
- Do not merge their records.
- Do not treat one as backup for the other.
- Do not invent Modbus registers.
- Do not fake values.
- Do not add pH.
- Do not add salinity.
- Do not add NPK.
- Relay OFF on every failure path.
- Soil sensor powered only during measurement.
- Main local soil reading must not block LoRa receive windows.
```

---

## 18. Final Soil Design Summary

```text
Pivot 1:
  Main Node local RS485 soil sensor
  Mandatory
  Measures main pivot soil condition

Pivot 2:
  Node2 RS485 soil sensor
  Mandatory
  Measures second pivot soil condition

Both are required.
Both are independent.
Both must be stored separately.
Both must be uploaded later.
```
