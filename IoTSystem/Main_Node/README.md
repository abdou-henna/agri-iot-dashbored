# Main Node — Gateway Node Firmware

ESP32 + LoRa SX1278 + SD Card + DS3231 RTC  
Role: Receive LoRa data from Node2 (soil) and Node3 (weather), timestamp via DS3231, store to SD card, upload to Render WebService on manual button press.

---

## 1. System Role and Architecture Position

The Main Node is the central hub of the IoT agricultural monitoring system.

```
[Node 2: Soil Node]  ──LoRa──┐
                              ├──► [Main Node (Gateway)]
[Node 3: Weather Node] ─LoRa─┘        │
                                       ├── DS3231 RTC (timestamp)
                                       ├── SD Card (local storage)
                                       └── WiFi → Render WebService (on button)
```

The Main Node does not enter deep sleep between packets the way sensor nodes do. It keeps LoRa in receive mode for a 70-second window each 10-minute cycle, then writes records to SD and sleeps for the remainder.

Normal cycle:
1. Wake (timer or first boot)
2. Initialize RTC, SD, LoRa
3. Check upload button — if held ≥ 1 second: enter upload mode
4. Open LoRa receive window (up to 70 seconds)
5. Receive packets from Node2 (Pivot 2) and Node3; send ACKs
6. Detect missing nodes (timeout per node)
7. **Mandatory Pivot 1 local soil measurement** — relay ON → RS485 read → relay OFF (runs after all LoRa RX windows, before SD writes)
8. Write readings and events to SD card
9. Deep sleep for remaining cycle time

Upload cycle (button press):
1. Connect to configured WiFi hotspot
2. Read today's upload queue JSONL from SD
3. POST to WebService
4. Parse response; update RTC from server_time
5. Save upload_state.json
6. Disconnect WiFi

---

## 2. Hardware Summary and Pin Mapping

### Components

| Component | Part | Interface |
|---|---|---|
| Microcontroller | ESP32 (38-pin) | — |
| LoRa Radio | SX1278 433 MHz | SPI (VSPI) |
| SD Card | SPI module | SPI (HSPI) |
| RTC | DS3231 | I2C |
| Upload trigger | 4-pin tactile button | GPIO |
| Relay module | GPIO-controlled relay | GPIO |
| RS485 transceiver | MAX485 | UART (Serial1) |
| Local soil sensor | RS485 Modbus RTU | via MAX485 |

> Source: `Pin_Mapping.md` — Main Node section. Do not change without updating both files.

### LoRa SX1278 (VSPI)

| LoRa Pin | ESP32 GPIO | Firmware Constant |
|---|---|---|
| VCC | 3.3 V | — |
| GND | GND | — |
| MISO | GPIO 19 | `LORA_MISO_PIN` |
| MOSI | GPIO 23 | `LORA_MOSI_PIN` |
| SCK | GPIO 18 | `LORA_SCK_PIN` |
| NSS / CS | GPIO 5 | `LORA_CS_PIN` |
| RST | GPIO 26 | `LORA_RST_PIN` |
| DIO0 | GPIO 14 | `LORA_DIO0_PIN` |

### SD Card Module (HSPI — separate SPI bus from LoRa)

| SD Pin | ESP32 GPIO | Firmware Constant |
|---|---|---|
| VCC | 3.3 V | — |
| GND | GND | — |
| MISO | GPIO 32 | `SD_MISO_PIN` |
| MOSI | GPIO 33 | `SD_MOSI_PIN` |
| SCK | GPIO 25 | `SD_SCK_PIN` |
| CS | GPIO 27 | `SD_CS_PIN` |

LoRa and SD use separate SPI buses (VSPI and HSPI). No multiplexing or CS toggling needed.

### RTC DS3231 (I2C)

| RTC Pin | ESP32 GPIO | Firmware Constant |
|---|---|---|
| VCC | 3.3 V | — |
| GND | GND | — |
| SDA | GPIO 21 | `RTC_SDA_PIN` |
| SCL | GPIO 22 | `RTC_SCL_PIN` |

### Upload Button

| Button Pin | ESP32 GPIO | Notes |
|---|---|---|
| Signal leg | GPIO 34 | `BTN_PIN` |
| Other leg | GND | — |

- Mode: `INPUT_PULLUP`
- Default: HIGH
- Pressed: LOW
- Hold ≥ 1 second to trigger upload (debounced)

### Relay Module

| Signal | ESP32 GPIO | Firmware Constant |
|---|---|---|
| IN | GPIO 2 | `RELAY_PIN` |

- `RELAY_ON` = HIGH (active-high relay module — adjust constant if module is active-low)
- Safe default: OFF (LOW) from the first line of `initPins()`

### MAX485 RS485 Transceiver

| MAX485 Pin | ESP32 GPIO | Firmware Constant |
|---|---|---|
| RO (receive out) | GPIO 16 | `RS485_RX_PIN` |
| DI (data in) | GPIO 17 | `RS485_TX_PIN` |
| RE + DE (tied) | GPIO 4 | `MAX485_DE_RE_PIN` |

- RE+DE LOW = receive mode (default)
- RE+DE HIGH = transmit mode (set during Modbus request only, then immediately restored to LOW)
- Serial1 is initialised at `RS485_BAUD_RATE` (9600) in `initSystem()`

---

## 3. LoRa Packet Handling

### LoRa RF Settings (must match sensor nodes exactly)

| Parameter | Value |
|---|---|
| Frequency | 433 MHz |
| Spreading Factor | 7 |
| Bandwidth | 125 kHz |
| Coding Rate | 4/5 |
| CRC | Enabled |
| TX Power | 14 dBm |

### Node3 Weather Packet (received, parsed)

```json
{
  "pv": 1,
  "pt": "weather_reading",
  "nid": "N3",
  "ntype": "weather",
  "seq": 4511,
  "boot": 18,
  "stg": 5,
  "uptime": 1823,
  "temp": 24.3,
  "hum": 48.5,
  "pres": 1012.8,
  "batt": "not_measured",
  "status": "ok"
}
```

Field mapping (LoRa → SD / WebService):

| LoRa field | SD / Upload field |
|---|---|
| `nid` | `node_id` = `"N3"` |
| `ntype` | `node_type` = `"weather"` |
| `seq` | `node_seq` |
| `boot` | `node_boot` (CSV only) |
| `stg` | `node_stage` (CSV only) |
| `temp` | `air_temperature_c` |
| `hum` | `air_humidity_percent` |
| `pres` | `air_pressure_hpa` |
| `batt` | `battery_status` = `"not_measured"` |
| `status` | `status` |
| `err` | `error_code` (if present) |
| *(RTC)* | `measured_at` — added by Main Node |
| *(LoRa)* | `rssi`, `snr` — added by Main Node |

### Node2 Soil Packet — Pivot 2 (assumed format — see Assumptions §10)

Node2 represents **Pivot 2** (second rotating axis). It is independent of the Main Node local sensor and is not a backup for it.

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
  "ec": 1450.0,
  "batt": "not_measured",
  "status": "ok"
}
```

Soil fields: **temperature, moisture, EC only.** The sensor does not provide pH, salinity, or NPK.

Field mapping:

| LoRa field | SD / Upload field |
|---|---|
| `temp` | `soil_temperature_c` |
| `mois` | `soil_moisture_percent` |
| `ec` | `soil_ec_us_cm` |

`ph`, `sal`, and NPK keys are ignored if received — they are forbidden.

> If Node2 firmware uses different short keys, update `parseSoilPacket()` in `Main_Node.ino`.

### ACK Packet (transmitted after each successful receive)

```json
{
  "pt": "ack",
  "gid": "GW01",
  "to": "N3",
  "seq": 4511,
  "ts": "2026-04-25T10:00:39Z"
}
```

---

## 4. SD Storage Structure

```
/CONFIG/
  upload_state.json       ← last upload metadata, RTC sync time

/DATA/
  /YYYY/
    /MM/
      YYYY-MM-DD_readings.csv         ← one row per sensor reading
      YYYY-MM-DD_events.csv           ← one row per system event
      YYYY-MM-DD_upload_queue.jsonl   ← JSONL for WebService upload

/ARCHIVE/
  uploaded_files.log      ← list of JSONL files already uploaded

/MANIFEST/                ← reserved for future manifest.json
```

### Readings CSV Header

```
record_id,gateway_id,node_id,node_type,node_seq,frame_id,measured_at,
rssi,snr,battery_mv,battery_percent,battery_status,
soil_temperature_c,soil_moisture_percent,soil_ec_us_cm,soil_ph,soil_salinity,
air_temperature_c,air_humidity_percent,air_pressure_hpa,
status,node_boot,node_stage,error_code
```

No NPK columns. Battery fields always empty (no hardware measurement). Fields not applicable to a node type are left blank.

### Events CSV Header

```
event_id,gateway_id,node_id,event_type,severity,event_time,error_code,message
```

### Upload Queue JSONL

Each line is one JSON object with `"type": "reading"` or `"type": "event"`. Field names match the WebService schema exactly so upload is direct read-and-send.

Example reading line:
```json
{"type":"reading","record_id":"GW01-N3-00004511","gateway_id":"GW01","node_id":"N3","node_type":"weather","node_seq":4511,"frame_id":88421,"measured_at":"2026-04-25T10:00:39Z","rssi":-90,"snr":8.1,"battery_mv":null,"battery_percent":null,"battery_status":"not_measured","air_temperature_c":24.3,"air_humidity_percent":48.5,"air_pressure_hpa":1012.8,"status":"ok"}
```

Example event line:
```json
{"type":"event","event_id":"EVT-GW01-20260425-100039-001","event_type":"packet_received","severity":"info","event_time":"2026-04-25T10:00:39Z","node_id":"N3","message":"Weather packet received","details":"{}"}
```

---

## 5. Upload Flow

### Trigger

Press and hold the button on GPIO 34 for at least 1 second. The firmware debounces (50 ms) then measures hold duration.

### Upload Sequence

```
Button held ≥ 1 s
  ↓
Log upload_started event
  ↓
WiFi.begin(SSID, PASSWORD)
  ↓ (timeout 20 s)
Read today's JSONL from SD
  ↓
POST to https://agri-iot-webservice.onrender.com/api/v1/upload
  with header: x-api-key: <API_KEY>
  ↓
Parse response:
  ok, inserted_records, server_time
  ↓
Update DS3231 from server_time
Log time_sync event
  ↓
Save /CONFIG/upload_state.json
Append path to /ARCHIVE/uploaded_files.log
  ↓
WiFi.disconnect + WiFi.mode(WIFI_OFF)
```

### WebService Request Format

```json
{
  "upload_id": "UPL-GW01-20260425-103000",
  "gateway": {
    "gateway_id": "GW01",
    "firmware_version": "gw-1.0.0"
  },
  "upload": {
    "started_at": "2026-04-25T10:30:00Z",
    "source": "esp32"
  },
  "readings": [ ... ],
  "events":   [ ... ]
}
```

### WebService Response

```json
{
  "ok": true,
  "upload_id": "UPL-GW01-20260425-103000",
  "received_records": 288,
  "inserted_records": 285,
  "duplicate_records": 3,
  "received_events": 12,
  "inserted_events": 12,
  "server_time": "2026-04-25T10:30:15.000Z",
  "rtc_sync_recommended": true
}
```

### Upload Limits per Request

| Item | Limit |
|---|---|
| Readings per request | 400 (`UPLOAD_MAX_READINGS`) |
| Events per request | 200 (`UPLOAD_MAX_EVENTS`) |
| HTTP timeout | 30 s |
| WiFi connect timeout | 20 s |

A daily volume of ~288 readings and ~50 events fits comfortably within one request.

### Failed Upload Behavior

- WiFi timeout: log `upload_failed` event, save `FAILED` status to `upload_state.json`, disconnect WiFi
- HTTP error: same — records remain in JSONL queue for next attempt
- Data is never deleted on upload failure

---

## 6. Debug System

### Stage Constants (debug_strategy.md §5.3)

| Value | Constant | Meaning |
|---|---|---|
| 0 | `STAGE_BOOT` | Boot started |
| 1 | `STAGE_GPIO_READY` | GPIO initialized |
| 2 | `STAGE_RTC_INIT` | RTC initialized |
| 3 | `STAGE_SD_INIT` | SD initialized |
| 4 | `STAGE_LORA_INIT` | LoRa initialized |
| 5 | `STAGE_RX_OPEN` | Receive window opened |
| 6 | `STAGE_PKT_RECEIVED` | Packet received |
| 7 | `STAGE_PKT_PARSED` | Packet parsed |
| 8 | `STAGE_RECORD_SAVED` | Record saved to SD |
| 9 | `STAGE_EVENT_SAVED` | Event saved to SD |
| 10 | `STAGE_BTN_CHECKED` | Upload button checked |
| 11 | `STAGE_WIFI_UPLOAD` | WiFi upload started |
| 12 | `STAGE_UPLOAD_DONE` | Upload completed |
| 13 | `STAGE_RTC_UPDATED` | RTC updated from server |
| 14 | `STAGE_SLEEP_PREPARE` | Preparing for sleep |

### Boot Counter

`bootCount` is stored in RTC memory (`RTC_DATA_ATTR`) and survives deep sleep. It is reset to 0 if the value exceeds 1,000,000 (implausible after power loss).

### Error Codes Used

| Code | Event Type | Severity | Meaning |
|---|---|---|---|
| `RTC_INIT_FAILED` | `rtc_init_failed` | error | DS3231 not found |
| `LORA_INIT_FAILED` | `lora_init_failed` | error | SX1278 begin() failed |
| `NODE_TIMEOUT` | `node_missing` | warning | Node did not transmit |
| `PACKET_PARSE_FAILED` | `packet_parse_failed` | error | JSON parse error |
| `UNKNOWN_NODE` | `unknown_packet` | warning | Unrecognized nid |
| `UPLOAD_WIFI_TIMEOUT` | `upload_failed` | error | WiFi timeout |
| `UPLOAD_API_ERROR` | `upload_failed` | error | HTTP non-200 |
| `UPLOAD_BUTTON_PRESSED` | `upload_started` | info | Manual trigger |
| `LOCAL_SOIL_REGISTER_MAP_MISSING` | `sensor_error` | error | Modbus register map not yet defined — placeholder active |

### Event Severity Values

All severities use lowercase to match WebService `CONFIG.EVENT_SEVERITIES`:
`info`, `warning`, `error`, `critical`

---

## 7. Troubleshooting Guide

### DS3231 not found

- Check SDA → GPIO 21, SCL → GPIO 22 wiring.
- Verify 3.3 V on RTC VCC.
- Run an I2C scanner sketch to confirm address 0x68.
- Timestamps will be `"1970-01-01T00:00:00Z"` if RTC fails.

### SD card not found

- Check MISO=32, MOSI=33, SCK=25, CS=27.
- Use a FAT32-formatted card (≤ 32 GB recommended).
- Confirm 3.3 V supply — do not use 5 V.
- SD and LoRa are on separate SPI buses; there is no bus conflict.

### LoRa not finding Node2 or Node3

- Confirm frequency = 433 MHz matches sensor nodes.
- Confirm SF=7, BW=125 kHz, CR=4/5, CRC=enabled.
- Check CS=5, RST=26, DIO0=14.
- Verify LoRa is powered at 3.3 V.

### No packets received (missing events logged every cycle)

- Nodes may not be powered or may have drifted out of the receive window.
- Extend `CYCLE_WINDOW_MS` if nodes transmit later than expected.
- Use Serial debug output to confirm LoRa is in receive mode.

### WiFi fails to connect

- Confirm hotspot SSID = `Abdou-Phone`, password = `12345678`.
- Hotspot must be active before pressing upload button.
- If timeout > 20 s, increase `WIFI_CONNECT_TIMEOUT_MS`.

### Upload rejected by WebService (HTTP 4xx)

- Check API key in `API_KEY` constant matches `connection.md`.
- Check `WEBSERVICE_URL` matches the Render deployment URL.
- Check that payload does not contain NPK fields (none are added by this firmware).
- Check that node_type values are `"soil"` or `"weather"` (lowercase).

### RTC time wrong after power loss

- DS3231 has a coin cell battery backup. If the coin cell is dead, the clock resets on power loss.
- `rtc.lostPower()` returns true in this case — the firmware logs the condition.
- Press the upload button as soon as the hotspot is available; `server_time` from the WebService response will correct the RTC.

### bootCount / eventCount reset to 0

- These are stored in ESP32 RTC memory (`RTC_DATA_ATTR`). They survive deep sleep but not a hard power cut. This is expected.

---

## 8. How to Change Upload Credentials

All credentials are compile-time constants near the top of `Main_Node.ino`:

```cpp
#define WIFI_SSID        "Abdou-Phone"
#define WIFI_PASSWORD    "12345678"
#define WEBSERVICE_URL   "https://agri-iot-webservice.onrender.com/api/v1/upload"
#define API_KEY          "x7F9$kL2@vQ8#ZpR4!mN6&cT1^aD0*HsJ9uW3eY5"
```

Change the values, recompile, and reflash. No runtime configuration file is needed.

---

## 9. How to Disable Debug Output

Set `DEBUG_MODE` to `false`:

```cpp
#define DEBUG_MODE false
```

When `false`:
- All `DBG()` and `DBGF()` calls compile to nothing
- `Serial.begin()` is never called
- `Serial.flush()` before sleep is skipped
- No USB CDC overhead at runtime

---

## 10. Assumptions Made During Implementation

1. **Node2 packet short keys assumed.** Node2 firmware was not available at implementation time. The parser in `parseSoilPacket()` expects: `temp` → soil temperature, `mois` → soil moisture %, `ec` → EC µS/cm, `ph` → soil pH. If Node2 uses different key names, update `parseSoilPacket()` to match. Field names in the upload payload always use the WebService long-form names (`soil_temperature_c`, etc.).

2. **Node identification via `nid` field.** The firmware checks for `"nid":"N3"` or `"nid":"N2"` as a fast string search before full JSON parsing. If `nid` is absent or different, the packet is logged as unknown and discarded.

3. **No NPK fields anywhere.** Node2 is not expected to send NPK data (nitrogen, phosphorus, potassium). The WebService explicitly rejects these fields. This firmware adds none. The local readings CSV also omits NPK columns.

4. **Battery fields are always null / "not_measured".** Neither Node2 nor Node3 has battery voltage measurement hardware. `battery_mv` and `battery_percent` are JSON `null`; `battery_status` is always `"not_measured"`. This is correct and accepted by the WebService.

5. **Frame ID derived from RTC Unix time.** `frame_id = rtc.now().unixtime() / 600`. This gives a unique integer per 10-minute cycle. If RTC has lost power, frame_id = 0.

6. **VSPI for LoRa, HSPI for SD.** The LoRa library uses the default ESP32 SPI class (VSPI). The SD uses a separate `SPIClass(HSPI)` instance with explicit pins. This matches the Pin_Mapping.md wiring which puts LoRa and SD on independent SPI buses.

7. **Upload uploads today's JSONL only.** Each call to `runUploadMode()` reads and uploads only today's `/DATA/YYYY/MM/YYYY-MM-DD_upload_queue.jsonl`. To upload multiple days, press the button again on each day or modify `runUploadMode()` to scan past dates.

8. **Event count in RTC memory.** `eventCount` is stored in `RTC_DATA_ATTR`. It resets to 0 after a hard power cut. Event IDs generated after a reset may not be strictly sequential but remain unique because the timestamp portion of the ID is different each cycle.

9. **Local soil sensor infrastructure is present; register map is pending.** `Pin_Mapping.md` lists a MAX485 and relay on the Main Node. `performLocalSoilMeasurement()` runs every cycle: it powers the sensor via relay, then calls `readLocalSoilSensorRS485()`. That function is currently a **safe placeholder** — it immediately returns `false` with error code `LOCAL_SOIL_REGISTER_MAP_MISSING` and logs a `sensor_error` event. No fake values are written. The relay is always turned OFF on both the success and failure paths. To activate local soil reading: provide the Modbus register addresses for `soil_temperature_c`, `soil_moisture_percent`, and `soil_ec_us_cm` only (no pH, no salinity, no NPK), then implement the request/response inside `readLocalSoilSensorRS485()`.

10. **Deep sleep uses timer wakeup.** The firmware calculates remaining cycle time and sets `esp_sleep_enable_timer_wakeup()` accordingly. DS3231 SQW alarm wakeup is not implemented in v1; it can be added by configuring the DS3231 alarm and attaching a wake interrupt to GPIO 13 (SQW pin).

11. **ESP32 Arduino core ≥ 2.0.x required.** `RTC_DATA_ATTR`, `esp_sleep_enable_timer_wakeup()`, and `esp_deep_sleep_start()` are verified against this core version. Board: **ESP32 Dev Module** in Arduino IDE.

12. **ArduinoJson 7.x required.** Uses `JsonDocument` (heap-managed). Not compatible with ArduinoJson 6.x `DynamicJsonDocument` / `StaticJsonDocument` API.

13. **RTClib by Adafruit required.** Provides `RTC_DS3231`, `DateTime`, `rtc.lostPower()`, `rtc.adjust()`. Install via Arduino Library Manager.
