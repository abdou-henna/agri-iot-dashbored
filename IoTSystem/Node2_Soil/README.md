# Node2_Soil — Soil Node Firmware

ESP32-C3 Super Mini node that reads Pivot 2 soil conditions (temperature, moisture, EC) via a Modbus RTU soil sensor on RS485, and transmits the result to the Main Node over LoRa. No WiFi, no SD, no RTC, no NPK.

---

## Hardware

See `Pin_Mapping.md` — Node2 section for the complete wiring table. Summary:

| Peripheral | Interface | Key Pins |
|---|---|---|
| LoRa SX1278 | SPI | SCK=4 MISO=5 MOSI=6 CS=7 RST=2 DIO0=3 |
| Relay module | GPIO | IN=GPIO 0 (active-HIGH) |
| MAX485 | GPIO + UART | DE/RE=GPIO 10 RO=GPIO 20 DI=GPIO 21 |
| Soil sensor | RS485 via MAX485 | A→A B→B (12 V supply through relay) |

**Relay wiring:** COM + NO (normally-open). Relay inactive = sensor powered OFF.

---

## Firmware Cycle

Each 10-minute deep-sleep cycle:

1. Boot — increment `bootCount`, sanity-check `node_seq`
2. `setupPins()` — relay OFF, MAX485 idle, LoRa CS HIGH
3. `disableUnusedRadios()` — kill WiFi and BT drivers
4. Relay ON → `SOIL_WARMUP_MS` (15 s) warm-up delay
5. Modbus RTU read over RS485 — collects moisture, temperature, EC
6. Relay OFF (happens on both success and failure)
7. LoRa init
8. If sensor OK: transmit `soil_reading` packet → wait ACK (1.5 s window) → increment `node_seq`
9. If sensor failed: transmit error packet (best-effort, no retry)
10. `prepareForSleep()` → `goToDeepSleep()` (10 min)

---

## Modbus RTU Details

Register map confirmed from hardware testing — see `soil_sensor_protocol.md §13`.

| Parameter | Value |
|---|---|
| Baud | 4800 8N1 |
| Slave ID | 0x01 |
| Function code | 0x03 |
| Start address | 0x0000 |
| Register count | 3 |
| Response length | 11 bytes |

Register extraction:

```
res[3:4]  → soil_moisture_percent = raw / 10
res[5:6]  → soil_temperature_c    = raw / 10
res[7:8]  → soil_ec_us_cm         = raw (integer)
```

Do not change register addresses or scaling.

---

## LoRa Packet Format

Normal packet (`status = "ok"`):

```json
{
  "pv": 1,
  "pt": "soil_reading",
  "nid": "N2",
  "ntype": "soil",
  "seq": 124,
  "boot": 7,
  "stg": 8,
  "uptime": 20000,
  "temp": 21.4,
  "mois": 38.2,
  "ec": 1450,
  "batt": "not_measured",
  "status": "ok"
}
```

Error packet (`status = "sensor_error"`):

```json
{
  "pv": 1,
  "pt": "soil_reading",
  "nid": "N2",
  "ntype": "soil",
  "seq": 124,
  "boot": 7,
  "stg": 7,
  "uptime": 17200,
  "batt": "not_measured",
  "status": "sensor_error",
  "err": "SOIL_SENSOR_NO_RESPONSE"
}
```

`seq` is incremented only on a successful reading + TX. Error packets reuse the last sequence number.

---

## Debug Stage Reference

From `debug_strategy.md §5.2`:

| `stg` | Meaning |
|---:|---|
| 0 | Boot started |
| 1 | GPIO initialized |
| 2 | Relay ON |
| 3 | Sensor warm-up |
| 4 | Modbus request sent |
| 5 | RS485 response received |
| 6 | Soil data parsed |
| 7 | Relay OFF |
| 8 | LoRa initialized |
| 9 | Packet sent |
| 10 | ACK wait finished |
| 11 | Preparing sleep |
| 12 | Deep sleep entered |

A packet arriving at the Main Node with `stg < 8` means the sensor or relay failed before LoRa init.

---

## Error Codes

From `debug_strategy.md §8.2`:

| Code | Cause |
|---|---|
| `SOIL_SENSOR_NO_RESPONSE` | No RS485 bytes received within 300 ms |
| `SOIL_SENSOR_CRC_ERROR` | Modbus CRC mismatch |
| `SOIL_SENSOR_PARSE_ERROR` | Response header invalid (wrong slave/FC/byte-count) |
| `LORA_INIT_FAILED` | LoRa `begin()` returned false (no packet sent) |

---

## Key Configuration Constants

All in `Node2_Soil.ino`:

| Constant | Default | Notes |
|---|---|---|
| `SOIL_WARMUP_MS` | 15000 | Increase if first reading is unstable |
| `RS485_RX_TIMEOUT_MS` | 300 | Increase only if sensor responds slowly |
| `LORA_ACK_TIMEOUT_MS` | 1500 | Must be shorter than Main Node TX gap |
| `MEASUREMENT_INTERVAL_SEC` | 600 | Must match Main Node cycle |
| `DEBUG_MODE` | `true` | Set `false` before field deployment |

---

## RF Settings

Must match Main Node exactly:

```
Frequency  : 433 MHz
SF         : 7
BW         : 125 kHz
CR         : 4/5
CRC        : enabled
TX power   : 14 dBm
```

---

## Libraries Required

- `arduino-LoRa` (sandeep mistry)
- ESP32 Arduino core (for `esp_wifi.h`, `esp_bt.h`, `esp_sleep.h`, `HardwareSerial`)

---

## Safety Guarantees

Every exit path (sensor failure, LoRa failure, normal sleep) guarantees:

- Relay is OFF
- MAX485 DE/RE is LOW (idle)
- `Serial1` is ended
- `LoRa.sleep()` called if LoRa was initialised (`g_loraReady == true`)
- No infinite retry loops

`goToDeepSleep()` enforces relay OFF and MAX485 idle unconditionally as a final safety net, regardless of what the caller did.
