
# 📡 IoT Desert Agriculture Monitoring System
## Hardware Pin Mapping & Wiring Documentation

---

## 📌 Overview

This document describes the complete hardware architecture of the system, including all nodes, components, and detailed pin connections.

The system consists of three main nodes:

- 🌱 **Node 2: Soil Node**
- 🌤 **Node 3: Weather Node**
- 🧠 **Main Node: Gateway + Storage + Control**


---

# 🌱 Soil Sensor Capability — FINAL DECISION

The soil sensors used in this system provide **ONLY** the following measurements:

| Measurement | System Field |
|------------|--------------|
| Soil temperature | `soil_temperature_c` |
| Soil moisture | `soil_moisture_percent` |
| Soil electrical conductivity | `soil_ec_us_cm` |

The soil sensors do **NOT** provide:

- pH
- Salinity
- Nitrogen
- Phosphorus
- Potassium
- NPK

Firmware must not attempt to read or generate values for pH, salinity, or NPK. If any database/schema field exists for these unused values, it must remain empty/null.

---

# 🌱 Node 2: Soil Node

## 🧩 Components

- ESP32-C3 Super Mini
- LoRa SX1278 (SPI)
- MAX485 (RS485 Interface)
- Soil Sensor (Temperature, Moisture, EC)
- Relay Module (Control)
- Power System (12V → 5V → 3.3V)

---

## 🔌 LoRa (SPI Connection)

| LoRa Pin | ESP32-C3 GPIO |
|----------|--------------|
| VCC      | 3.3V |
| GND      | GND |
| MISO     | GPIO 5 |
| MOSI     | GPIO 6 |
| SCK      | GPIO 4 |
| NSS (CS) | GPIO 7 |
| RST      | GPIO 2 |
| DIO0     | GPIO 3 |

---

## 🔌 MAX485 Connection

| MAX485 Pin | ESP32-C3 GPIO |
|------------|--------------|
| RO         | GPIO 20 |
| DI         | GPIO 21 |
| RE + DE    | GPIO 10 |
| VCC        | 5V |
| GND        | GND |

---

## 🔌 Soil Sensor (RS485)

| Sensor Pin | MAX485 |
|------------|--------|
| A          | A |
| B          | B |
| VCC        | 12V |
| GND        | GND |

---

## 🔌 Relay Module

| Relay Pin | ESP32-C3 |
|-----------|----------|
| IN        | GPIO 0 |
| VCC       | 5V |
| GND       | GND |

---

## 🔋 Power Architecture



12V Battery
↓
DC-DC Converter → 5V
↓
AMS1117 → 3.3V


| Component | Voltage |
|----------|--------|
| Soil Sensor | 12V |
| MAX485 | 5V |
| Relay | 5V |
| ESP32-C3 | 3.3V |
| LoRa | 3.3V |

---

# 🌤 Node 3: Weather Node

## 🧩 Components

- ESP32-C3 Super Mini
- LoRa SX1278
- BME280 Sensor (Temperature, Humidity, Pressure)

---

## 🔌 LoRa (Same as Node 2)

| LoRa Pin | ESP32-C3 GPIO |
|----------|--------------|
| VCC | 3.3V |
| GND | GND |
| MISO | GPIO 5 |
| MOSI | GPIO 6 |
| SCK | GPIO 4 |
| NSS | GPIO 7 |
| RST | GPIO 2 |
| DIO0 | GPIO 3 |

---

## 🔌 BME280 (I2C)

| BME280 Pin | ESP32-C3 GPIO |
|------------|--------------|
| VCC        | 3.3V |
| GND        | GND |
| SDA        | GPIO 8 |
| SCL        | GPIO 9 |

---

## 🔋 Power

| Component | Voltage |
|----------|--------|
| ESP32-C3 | 3.3V |
| LoRa | 3.3V |
| BME280 | 3.3V |

---

# 🧠 Main Node (Gateway Node)

## 🧩 Components

- ESP32
- LoRa SX1278
- SD Card Module (SPI)
- RTC DS3231 (I2C)
- Soil Sensor + MAX485
- Relay Module

---

## 🔌 LoRa (SPI)

| LoRa Pin | ESP32 GPIO |
|----------|-----------|
| VCC | 3.3V |
| GND | GND |
| MISO | GPIO 19 |
| MOSI | GPIO 23 |
| SCK | GPIO 18 |
| NSS | GPIO 5 |
| RST | GPIO 26 |
| DIO0 | GPIO 14 |

---

## 🔌 SD Card (SPI - Separate Bus)

| SD Pin | ESP32 GPIO |
|--------|-----------|
| VCC | 3.3V |
| GND | GND |
| MISO | GPIO 32 |
| MOSI | GPIO 33 |
| SCK | GPIO 25 |
| CS | GPIO 27 |

---

## 🔌 RTC DS3231 (I2C)

| RTC Pin | ESP32 GPIO |
|---------|-----------|
| VCC | 3.3V |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |
| SQW | GPIO 13 |

---

## 🔌 MAX485 (Soil Sensor Interface)

| MAX485 Pin | ESP32 GPIO |
|------------|-----------|
| RO | GPIO 16 |
| DI | GPIO 17 |
| RE + DE | GPIO 4 |
| VCC | 5V |
| GND | GND |

---

## 🔌 Soil Sensor

| Sensor | MAX485 |
|--------|--------|
| A | A |
| B | B |
| VCC | 12V |
| GND | GND |

---

## 🔌 Relay Module

| Relay Pin | ESP32 GPIO |
|-----------|-----------|
| IN | GPIO 2 |
| VCC | 5V |
| GND | GND |

---
# 🔘 Push Button (Manual Data Upload Trigger)

## 📌 Purpose

A push button is integrated into the main node to allow manual triggering of data upload.  
When pressed, the system initiates a predefined action such as transmitting stored data from the SD card.

---

## 🧩 Component

- 4-pin tactile push button (through-hole type)

---

## 🔌 Wiring Configuration

| Button Pin | ESP32 Connection |
|-----------|-----------------|
| Pin 1 (small leg) | GPIO 34 |
| Pin 2 (opposite small leg) | GND |

⚠️ Important:
- Only the **small pins** are used for electrical connection.
- The **large pins are mechanical supports only** and must NOT be connected.

---

## 🔧 Electrical Configuration

- Mode: `INPUT_PULLUP`
- Default state: HIGH
- Pressed state: LOW

---


# ⚠️ Important Notes

## Power Safety

- ❌ Never connect LoRa to 5V
- ✔ Always use 3.3V for LoRa
- ✔ Use stable 5V for Relay and MAX485

---

## Grounding

- ✔ All components MUST share a common GND

---

## Noise & Stability

- Add capacitors:
  - 100µF near ESP32
  - 10µF near LoRa and RTC

---

## RS485

- Ensure correct wiring:
  - A → A
  - B → B
- Do not swap lines

---

## SPI Separation

- LoRa and SD use separate SPI buses → ✔ Correct design

---

# 🧠 System Architecture Summary

```

[Soil Node] ----
\
→ LoRa → [Main Node] → SD Storage
/
[Weather Node]--/

Main Node:

* Adds timestamp (RTC)
* Stores data
* Controls local soil sensor relay power

```

---

# 🚀 Final Remarks

This system is designed as a **low-cost distributed IoT agricultural monitoring system**, combining:

- Environmental sensing
- Soil monitoring
- Long-range communication (LoRa)
- Local data storage
- Actuation (Relay control)

It is scalable, modular, and suitable for desert agriculture environments.

