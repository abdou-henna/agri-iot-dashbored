# Node3 — Weather Node Firmware

ESP32-C3 Super Mini + LoRa SX1278 + BME280  
Role: Read weather data, transmit via LoRa to Main Node Gateway, deep sleep.

---

## 1. Hardware Summary

| Component | Part | Interface |
|---|---|---|
| Microcontroller | ESP32-C3 Super Mini | — |
| Radio | LoRa SX1278 | SPI |
| Weather sensor | Bosch BME280 | I2C |

Power supply: 3.3 V for all components.  
No battery voltage measurement hardware exists on this node.  
No WiFi, no SD card, no RTC, no relay.

---

## 2. Required Libraries

Install all of the following in the Arduino IDE Library Manager (Sketch → Include Library → Manage Libraries):

| Library | Author | Tested Version |
|---|---|---|
| LoRa | Sandeep Mistry | 0.8.0 |
| Adafruit BME280 Library | Adafruit | 2.2.4 |
| Adafruit Unified Sensor | Adafruit | 1.1.14 |

The following are part of the ESP32 Arduino core (no separate install needed):

- `SPI`
- `Wire`
- `esp_wifi.h` / `esp_bt.h` / `esp_sleep.h` — ESP-IDF headers bundled with the ESP32 core

Board package required: **esp32 by Espressif Systems**, version 2.0.x or later.  
Select board: **ESP32C3 Dev Module** (or "ESP32-C3 SuperMini" if your package includes it).  
USB CDC On Boot: **Enabled** (required for Serial output on ESP32-C3).

ArduinoJson is NOT used — the packet is simple enough to build as a plain String, saving RAM.

---

## 3. Pin Mapping

### LoRa SX1278 (SPI)

| LoRa Pin | ESP32-C3 GPIO | Firmware Constant |
|---|---|---|
| VCC | 3.3 V | — |
| GND | GND | — |
| MISO | GPIO 5 | `LORA_MISO_PIN` |
| MOSI | GPIO 6 | `LORA_MOSI_PIN` |
| SCK | GPIO 4 | `LORA_SCK_PIN` |
| NSS / CS | GPIO 7 | `LORA_CS_PIN` |
| RST | GPIO 2 | `LORA_RST_PIN` |
| DIO0 | GPIO 3 | `LORA_DIO0_PIN` |

### BME280 (I2C)

| BME280 Pin | ESP32-C3 GPIO | Firmware Constant |
|---|---|---|
| VCC | 3.3 V | — |
| GND | GND | — |
| SDA | GPIO 8 | `BME_SDA_PIN` |
| SCL | GPIO 9 | `BME_SCL_PIN` |

> All pin assignments are sourced from `Pin_Mapping.md`. Do not change them without updating both files.

---

## 4. Power-Saving Behavior

The firmware enforces the following power rules on every boot cycle:

| Rule | Implementation |
|---|---|
| WiFi radio disabled immediately | `esp_wifi_stop()` called in `disableUnusedRadios()` |
| Bluetooth radio disabled immediately | `esp_bt_controller_disable()` called in `disableUnusedRadios()` |
| BME280 single-shot only | `MODE_FORCED` + `takeForcedMeasurement()` — sensor sleeps after one reading |
| LoRa off after communication | `LoRa.sleep()` called in `prepareForSleep()` before every deep sleep entry |
| CS pin HIGH before sleep | `digitalWrite(LORA_CS_PIN, HIGH)` in `prepareForSleep()` |
| ACK window bounded | Listen for at most `LORA_ACK_TIMEOUT_MS` (1500 ms) — never blocks longer |
| Transmission limit | At most `1 + MAX_LORA_RETRIES` = 2 TX attempts total |
| Deep sleep between cycles | `esp_sleep_enable_timer_wakeup()` + `esp_deep_sleep_start()` for 600 s |
| No SD, no RTC, no WiFi | Corresponding libraries not included |
| Debug Serial gated | All `Serial` output wrapped in `DEBUG_MODE` compile-time flag |
| Error path sleeps immediately | Every error branch calls `goToDeepSleep()` — never stays awake indefinitely |

Typical active window per cycle: under 2 seconds (BME280 forced ~10 ms + LoRa TX + 1500 ms ACK window).

---

## 5. LoRa Packet Format

Every packet is a compact JSON string transmitted as LoRa payload.  
The Main Node decodes this JSON and maps it to the WebService data model.

### Normal weather reading

```json
{
  "pv":     1,
  "pt":     "weather_reading",
  "nid":    "N3",
  "ntype":  "weather",
  "seq":    4511,
  "boot":   18,
  "stg":    5,
  "uptime": 1823,
  "temp":   24.3,
  "hum":    48.5,
  "pres":   1012.8,
  "batt":   "not_measured",
  "status": "ok"
}
```

### Error packet (sensor failure)

```json
{
  "pv":     1,
  "pt":     "weather_reading",
  "nid":    "N3",
  "ntype":  "weather",
  "seq":    4511,
  "boot":   18,
  "stg":    2,
  "uptime": 312,
  "batt":   "not_measured",
  "status": "sensor_error",
  "err":    "BME280_NOT_FOUND"
}
```

### Field Definitions

| Field | Type | Description |
|---|---|---|
| `pv` | int | Protocol version (always 1) |
| `pt` | string | Packet type: `"weather_reading"` |
| `nid` | string | Node ID: `"N3"` |
| `ntype` | string | Node type: `"weather"` |
| `seq` | uint32 | Sequence counter; persisted in ESP32 RTC memory across deep sleep |
| `boot` | uint32 | Boot counter; incremented every wake-up, persisted in RTC memory |
| `stg` | uint8 | Last execution stage reached (see `debug_strategy.md` §5.1) |
| `uptime` | uint32 | `millis()` at measurement time (ms since this boot) |
| `temp` | float | Air temperature in °C, 1 decimal place |
| `hum` | float | Air relative humidity in %, 1 decimal place |
| `pres` | float | Air pressure in hPa, 1 decimal place |
| `batt` | string | Always `"not_measured"` — no hardware voltage sensor on Node3 |
| `status` | string | `"ok"` or `"sensor_error"` |
| `err` | string | Error code; only present when `status` = `"sensor_error"` |

### Error Codes

| Code | Meaning |
|---|---|
| `BME280_NOT_FOUND` | BME280 not detected on I2C at addresses 0x76 or 0x77 |
| `BME280_MEASUREMENT_FAILED` | Forced measurement returned NaN or `false` |

---

## 6. Expected Main Node Processing Steps

When the Main Node receives a Node3 packet it must perform the following steps to produce a WebService-compatible record:

1. **Parse JSON** from the received LoRa payload.
2. **Check `nid`** = `"N3"` and `ntype` = `"weather"`.
3. **Add `measured_at`** from its own RTC DS3231 (ISO 8601 UTC).
4. **Add `rssi`** from `LoRa.packetRssi()`.
5. **Add `snr`** from `LoRa.packetSnr()`.
6. **Add `frame_id`** (current 10-minute cycle identifier).
7. **Map short keys** to WebService column names:
   - `seq`  → `node_seq`
   - `temp` → `air_temperature_c`
   - `hum`  → `air_humidity_percent`
   - `pres` → `air_pressure_hpa`
   - `batt` → `battery_status` = `"not_measured"`, `battery_mv` = null, `battery_percent` = null
8. **Generate `record_id`** using format `GW01-N3-<seq padded to 6 digits>`.
9. **Validate ranges** per `iot_data_system_design.md` §19:
   - `air_temperature_c`: −40 to 85 °C
   - `air_humidity_percent`: 0 to 100 %
   - `air_pressure_hpa`: 300 to 1200 hPa
10. **Write to SD** in the readings CSV and upload queue JSONL.
11. **Send ACK** back to Node3 within the 1500 ms window.

Resulting WebService record example:

```json
{
  "record_id":            "GW01-N3-004511",
  "node_id":              "N3",
  "node_type":            "weather",
  "node_seq":             4511,
  "frame_id":             88421,
  "measured_at":          "2026-04-25T10:00:39Z",
  "rssi":                 -90,
  "snr":                  8.1,
  "battery_mv":           null,
  "battery_percent":      null,
  "battery_status":       "not_measured",
  "air_temperature_c":    24.3,
  "air_humidity_percent": 48.5,
  "air_pressure_hpa":     1012.8,
  "status":               "ok"
}
```

---

## 7. Troubleshooting Guide

### BME280 not found (Serial shows "Not found on 0x76 or 0x77")

- Check SDA → GPIO 8, SCL → GPIO 9 wiring.
- Some BME280 modules have the SDO pin pulled high (address 0x77) or low (0x76). The firmware tries both.
- Verify 3.3 V supply on BME280 VCC.
- Use an I2C scanner sketch to confirm the address.

### LoRa begin() fails (Serial shows "begin() failed")

- Verify MISO=5, MOSI=6, SCK=4, CS=7, RST=2, DIO0=3.
- Confirm LoRa module is powered from 3.3 V, NOT 5 V.
- Check NSS/CS → GPIO 7 is not shorted.
- Confirm `LoRa.begin(433E6)` matches the antenna/module frequency (433 MHz).

### No ACK received (normal in most cases)

- ACK is optional. The node sleeps normally if no ACK arrives.
- If the Main Node is not running, Node3 continues operating independently.

### Serial output not appearing

- On ESP32-C3, USB CDC On Boot must be **Enabled** in Arduino Tools menu.
- Baud rate is 115200.
- The firmware waits 500 ms after `Serial.begin()` for USB CDC enumeration.

### node_seq resets to 0

- On first power-on (no prior deep sleep), RTC memory may contain garbage → seq is reset.
- If `node_seq > 1,000,000` it is also reset. This is by design.

### Deep sleep not working / always rebooting fast

- Ensure `esp_sleep_enable_timer_wakeup()` is called before `esp_deep_sleep_start()`.
- Confirm the board is the correct ESP32-C3 target in Arduino IDE.

---

## 8. How to Change the Measurement Interval

Edit this constant near the top of `Node3_Weather.ino`:

```cpp
#define MEASUREMENT_INTERVAL_SEC 600   // currently 10 minutes
```

Change `600` to any value in seconds. The system design target is 600 s (10 minutes).

> Important: The Main Node's receive windows and superframe schedule must be updated to match any change here. See `iot_data_system_design.md` §6.

---

## 9. How to Disable Debug Output

Set `DEBUG_MODE` to `false`:

```cpp
#define DEBUG_MODE false
```

When `false`, all `DBG()` and `DBGF()` calls compile to nothing. `Serial.begin()` is also skipped. This reduces boot time and eliminates USB CDC overhead in production.

---

## 10. Assumptions Made During Implementation

1. **LoRa frequency is 433 MHz.** The SX1278 module installed is the 433 MHz variant. If a 868/915 MHz variant is used, `LORA_FREQUENCY` must be updated AND the hardware module must match.

2. **BME280 I2C address is 0x76 or 0x77.** The firmware tries both. If a non-standard address is used, `bme.begin(address, &Wire)` must be adjusted.

3. **No battery voltage sensing hardware.** The prompt and `power_saving_strategy.md` both confirm no voltage divider or ADC circuit is wired. All battery fields are permanently `"not_measured"` / null.

4. **ACK is optional.** The superframe design (§6 of `iot_data_system_design.md`) designates the Main Node as ACK sender, but Node3 proceeds to sleep regardless of whether an ACK arrives.

5. **node_seq persists via RTC memory.** On hard power loss (not deep sleep wake), RTC memory clears. The firmware detects implausible values (`> 1,000,000`) and resets to 0. Sequence continuity is therefore best-effort, not guaranteed.

6. **node_seq is incremented only on successful TX.** Error packets do not advance the counter because no valid measurement was taken.

7. **Packet format uses short JSON keys.** The Main Node is responsible for expanding these to WebService column names (`temp` → `air_temperature_c`, etc.). This trades Main Node complexity for smaller LoRa payloads and shorter air time.

8. **ESP32-C3 Arduino core 2.0.x or later.** The `esp_wifi_stop()` and `esp_deep_sleep_start()` APIs, and RTC_DATA_ATTR behaviour, are verified against this core version.

9. **Bluetooth disable via `esp_bt_controller_disable()` is guarded by `#if defined(CONFIG_BT_ENABLED)`.** If the board package does not define this symbol, the call is compiled out safely.

10. **`Serial.flush()` is called before deep sleep when `DEBUG_MODE` is true.** This ensures the last debug message is transmitted before the USB CDC is torn down. In production (`DEBUG_MODE false`), `Serial` is never started, so no flush is needed.

11. **SPI bus is initialised with explicit pin assignments.** `SPI.begin(SCK, MISO, MOSI, CS)` is called before `LoRa.begin()` to override the ESP32-C3 default SPI pins, which differ from the wired hardware.

12. **No watchdog reconfiguration.** The default ESP32-C3 Arduino watchdog is relied upon. The longest blocking section is `waitForAck()` at 1500 ms, well within the default 5-second watchdog window. `yield()` is called in the ACK loop to service the watchdog on longer waits.
