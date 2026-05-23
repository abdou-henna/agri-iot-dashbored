/**
 * Node2_Soil — ESP32-C3 Soil Node Firmware
 *
 * Hardware : ESP32-C3 Super Mini + LoRa SX1278 + MAX485 + RS485 Soil Sensor + Relay
 * Role     : Power soil sensor via relay, read temperature / moisture / EC via
 *            Modbus RTU over RS485, transmit a compact JSON packet over LoRa,
 *            then enter deep sleep.
 * No WiFi. No SD. No RTC. No NPK. No pH. No salinity.
 *
 * Packet format verified against Main_Node parseSoilPacket().
 * Modbus register map from soil_sensor_protocol.md §13 (confirmed, validated).`````````````
 * Pin assignments from Pin_Mapping.md — Node2 section.
 * Stage constants from debug_strategy.md §5.2.
 */

// ─── Standard / Platform ─────────────────────────────────────────────────────
#include <SPI.h>
#include "esp_wifi.h"
#include "esp_bt.h"
#include "esp_sleep.h"

// ─── LoRa ────────────────────────────────────────────────────────────────────
#include <LoRa.h>

// ═════════════════════════════════════════════════════════════════════════════
// COMPILE-TIME CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════

#define NODE_ID "N2"
#define NODE_TYPE "soil"
#define PROTOCOL_VERSION 1
#define LORA_FREQUENCY 433E6
#define MEASUREMENT_INTERVAL_SEC 600  // 10 minutes
#define LORA_ACK_TIMEOUT_MS 2500      // max ACK listen window
#define MAX_LORA_RETRIES 0            // one TX attempt per wake cycle — no in-wake retries
#define DEBUG_MODE true               // set false before deployment

// ─── Soil Sensor Timings ─────────────────────────────────────────────────────
#define SOIL_WARMUP_MS 5000      // relay-ON to first read (ms)
#define RS485_RX_TIMEOUT_MS 300  // Modbus response timeout (ms)

// ─── Modbus RTU Parameters (soil_sensor_protocol.md §13) ─────────────────────
#define MODBUS_BAUD_RATE 4800
#define MODBUS_SLAVE_ID 0x01
#define MODBUS_FUNC_CODE 0x03
#define MODBUS_START_ADDR_HI 0x00
#define MODBUS_START_ADDR_LO 0x00
#define MODBUS_REG_COUNT_HI 0x00
#define MODBUS_REG_COUNT_LO 0x03
#define MODBUS_RESPONSE_LEN 11  // bytes in a valid 3-register response

// ─── Relay ───────────────────────────────────────────────────────────────────
#define RELAY_ON HIGH  // active-high relay module
#define RELAY_OFF LOW

// ─── Execution Stage Constants (debug_strategy.md §5.2) ──────────────────────
#define STAGE_BOOT 0
#define STAGE_GPIO_READY 1
#define STAGE_RELAY_ON 2
#define STAGE_SENSOR_WARMUP 3
#define STAGE_MODBUS_REQUEST 4
#define STAGE_RS485_RESPONSE 5
#define STAGE_PARSED 6
#define STAGE_RELAY_OFF 7
#define STAGE_LORA_INIT 8
#define STAGE_PACKET_SENT 9
#define STAGE_ACK_DONE 10
#define STAGE_SLEEP_PREPARE 11
#define STAGE_DEEP_SLEEP 12

// ─── Pin Mapping (Node2 ESP32-C3, from Pin_Mapping.md) ───────────────────────
// LoRa SX1278 — SPI
#define LORA_SCK_PIN 4
#define LORA_MISO_PIN 5
#define LORA_MOSI_PIN 6
#define LORA_CS_PIN 7
#define LORA_RST_PIN 2
#define LORA_DIO0_PIN 3

// Relay module — active-high, COM+NO wiring (sensor OFF when relay inactive)
#define RELAY_PIN 0

// MAX485 RS485 transceiver
#define MAX485_DE_RE_PIN 10  // RE and DE tied together
#define RS485_RX_PIN 20      // MAX485 RO  →  ESP32-C3 RX
#define RS485_TX_PIN 21      // MAX485 DI  →  ESP32-C3 TX

// ═════════════════════════════════════════════════════════════════════════════
// DEBUG HELPERS  — zero overhead when DEBUG_MODE is false
// ═════════════════════════════════════════════════════════════════════════════

#if DEBUG_MODE
#define DBG(msg) Serial.println(msg)
#define DBGF(fmt, ...) Serial.printf(fmt "\n", ##__VA_ARGS__)
#else
#define DBG(msg) ((void)0)
#define DBGF(fmt, ...) ((void)0)
#endif

// ═════════════════════════════════════════════════════════════════════════════
// RTC MEMORY  — persists across deep sleep cycles
// ═════════════════════════════════════════════════════════════════════════════

RTC_DATA_ATTR uint32_t node_seq     = 0;   // incremented on successful TX
RTC_DATA_ATTR uint32_t bootCount    = 0;   // incremented on every boot
RTC_DATA_ATTR uint8_t  txFailCount  = 0;   // consecutive ACK failures

// ═════════════════════════════════════════════════════════════════════════════
// GLOBALS
// ═════════════════════════════════════════════════════════════════════════════

// HARDWARE NOTE: N2 field RSSI -115 to -120 dBm (near SX1278 sensitivity floor).
// Packet loss on this node is likely caused by antenna/cable/placement issues,
// not firmware bugs. Do NOT raise TX power — fix the hardware RF path instead.

uint8_t stage = STAGE_BOOT;
bool g_loraReady = false;  // guards LoRa.sleep() on error exit paths

// Sleep duration hint received from Main Node ACK ("sleep" field).
// Overrides getRecoverySleepSec() when a valid ACK is received, allowing
// Main to enforce TDMA slot offset (N2 = 10 s into next cycle).
// Not RTC — resets to default on every boot, then overridden by ACK parse.
uint32_t g_ackSleepHintSec = MEASUREMENT_INTERVAL_SEC;

// ═════════════════════════════════════════════════════════════════════════════
// FUNCTION PROTOTYPES
// ═════════════════════════════════════════════════════════════════════════════

void setupPins();
void disableUnusedRadios();
uint16_t modbusRTUCRC(const uint8_t *buf, size_t len);
bool readSoilSensorRS485(float &temp, float &mois, float &ec,
                         char *errorCode, size_t errorCodeLen);
bool initLoRa();
String buildSoilPacket(float temp, float mois, float ec);
bool sendLoRaPacket(const String &packet);
bool     waitForAck();
void     prepareForSleep();
void     goToDeepSleep(uint32_t sleepSec = MEASUREMENT_INTERVAL_SEC);
void     sendErrorPacket(const char *status, const char *errorCode);
uint32_t getRecoverySleepSec(uint8_t failCount);

// ═════════════════════════════════════════════════════════════════════════════
// SETUP  — all logic lives here; loop() is intentionally empty
// ═════════════════════════════════════════════════════════════════════════════

void setup() {
#if DEBUG_MODE
  Serial.begin(115200);
  delay(500);  // give USB-CDC time to enumerate (ESP32-C3)
  DBG("[Node2] Boot");
#endif

  // ── Boot counter ───────────────────────────────────────────────────────────
  if (bootCount > 1000000UL) bootCount = 0;
  bootCount++;
  stage = STAGE_BOOT;

  // ── 0. Sanity-check RTC sequence counter ───────────────────────────────────
  if (node_seq > 1000000UL) {
    node_seq = 0;
    DBG("[Node2] node_seq reset (implausible RTC value)");
  }

  // ── 1. Safe GPIO states before any peripheral is touched ──────────────────
  setupPins();

  // ── 2. Disable WiFi and Bluetooth immediately ──────────────────────────────
  disableUnusedRadios();
  stage = STAGE_GPIO_READY;
  DBGF("[Node2] Boot #%u  seq #%u", bootCount, node_seq);

  // ── 3. Initialise LoRa — must succeed before powering the sensor ─────────
  stage = STAGE_LORA_INIT;
  if (!initLoRa()) {
    DBG("[Node2] LoRa init failed — sleeping without TX");
    goToDeepSleep();  // relay never turned ON; Serial1 never started
  }
  g_loraReady = true;

  // ── 4. Power soil sensor via relay ────────────────────────────────────────
  digitalWrite(RELAY_PIN, RELAY_ON);
  stage = STAGE_RELAY_ON;
  DBG("[Node2] Relay ON — sensor powered");

  // ── 5. Warm-up: sensor needs time to stabilise after power-on ─────────────
  stage = STAGE_SENSOR_WARMUP;
  DBGF("[Node2] Warm-up %d ms ...", SOIL_WARMUP_MS);
  delay(SOIL_WARMUP_MS);

  // ── 6. Read soil sensor via Modbus RTU ────────────────────────────────────
  float soilTemp = 0.0f, soilMois = 0.0f, soilEc = 0.0f;
  char errCode[48] = "";

  stage = STAGE_MODBUS_REQUEST;
  bool sensorOk = readSoilSensorRS485(soilTemp, soilMois, soilEc,
                                      errCode, sizeof(errCode));

  // ── 7. Relay OFF — must happen regardless of sensor result ────────────────
  digitalWrite(RELAY_PIN, RELAY_OFF);
  stage = STAGE_RELAY_OFF;
  DBG("[Node2] Relay OFF — sensor de-powered");

  if (sensorOk) {
    DBGF("[Node2] Soil: T=%.1f C  M=%.1f%%  EC=%.0f uS/cm",
         soilTemp, soilMois, soilEc);
  } else {
    DBGF("[Node2] Sensor error: %s", errCode);
  }

  // ── 8. Transmit soil reading or error notification ────────────────────────
  bool ackReceived = false;
  g_ackSleepHintSec = MEASUREMENT_INTERVAL_SEC;  // reset each boot before TX

  if (sensorOk) {
    String packet = buildSoilPacket(soilTemp, soilMois, soilEc);
    DBGF("[Node2] Packet (%d B): %s", packet.length(), packet.c_str());

#if DEBUG_MODE
    unsigned long tx_start_ms = millis();
#endif
    bool txOk = sendLoRaPacket(packet);
    stage = STAGE_PACKET_SENT;
    if (txOk) {
#if DEBUG_MODE
      unsigned long tx_end_ms = millis();
      DBGF("[Timing] tx_start_ms=%lu tx_end_ms=%lu tx_dur_ms=%lu seq=%lu",
           tx_start_ms, tx_end_ms, tx_end_ms - tx_start_ms, (unsigned long)node_seq);
#else
      DBGF("[LoRa] packet_sent seq=%lu", (unsigned long)node_seq);
#endif
      ackReceived = waitForAck();
      stage = STAGE_ACK_DONE;
      node_seq++;
    }
  } else {
    // Best-effort: notify Main Node so it can log the event for Pivot 2
    sendErrorPacket("rs485_error", errCode);
    ackReceived = waitForAck();
    stage = STAGE_ACK_DONE;
  }

  // ── 9. Update recovery state and compute sleep duration ──────────────────
  uint32_t sleepSec;
  if (ackReceived) {
    txFailCount = 0;
    sleepSec    = g_ackSleepHintSec;  // use Main's TDMA slot hint if received
    DBGF("[Sleep] ack_ok — sleep=%lu s (slot_hint)", (unsigned long)sleepSec);
  } else {
    txFailCount++;
    sleepSec = getRecoverySleepSec(txFailCount);
    DBGF("[Sleep] no_ack — txFail=%u sleep=%lu s (recovery)", txFailCount, (unsigned long)sleepSec);
  }

  // ── 10. Safe shutdown and deep sleep ─────────────────────────────────────
  stage = STAGE_SLEEP_PREPARE;
  prepareForSleep();
  stage = STAGE_DEEP_SLEEP;
  goToDeepSleep(sleepSec);
}

// ─── loop() is unreachable — deep sleep always reboots the MCU ───────────────
void loop() {}

// ═════════════════════════════════════════════════════════════════════════════
// IMPLEMENTATIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Set all GPIO to a safe initial state before any peripheral is initialised.
 * Relay starts OFF (COM+NO wiring: inactive = sensor de-powered).
 * MAX485 DE/RE starts LOW (receive / idle mode).
 * LoRa CS starts HIGH (SPI bus unselected).
 */
void setupPins() {
  // Relay — OFF by default; COM+NO so OFF = sensor is de-powered
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF);

  // MAX485 direction — LOW = receive (idle); must not be left HIGH when idle
  pinMode(MAX485_DE_RE_PIN, OUTPUT);
  digitalWrite(MAX485_DE_RE_PIN, LOW);

  // LoRa SPI
  pinMode(LORA_CS_PIN, OUTPUT);
  digitalWrite(LORA_CS_PIN, HIGH);
  pinMode(LORA_RST_PIN, OUTPUT);
  digitalWrite(LORA_RST_PIN, HIGH);
  pinMode(LORA_DIO0_PIN, INPUT);
}

/**
 * Disable WiFi and Bluetooth at the radio driver level.
 * Node2 never uses wireless; disabling eliminates idle radio current draw.
 */
void disableUnusedRadios() {
  esp_wifi_stop();

#if defined(CONFIG_BT_ENABLED)
  esp_bt_controller_disable();
#endif

  DBG("[Node2] Radios disabled");
}

/**
 * Compute CRC-16/Modbus.
 * Polynomial: 0xA001 (reflected 0x8005). Low byte transmitted first.
 */
uint16_t modbusRTUCRC(const uint8_t *buf, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)buf[i];
    for (uint8_t j = 0; j < 8; j++) {
      crc = (crc & 0x0001) ? ((crc >> 1) ^ 0xA001) : (crc >> 1);
    }
  }
  return crc;
}

/**
 * Read the soil sensor via Modbus RTU over RS485/MAX485.
 *
 * Protocol: 4800 baud 8N1, slave 0x01, FC 0x03, registers 0–2, 11-byte response.
 * Register map (soil_sensor_protocol.md §13 — validated on real hardware):
 *   reg 0  bytes res[3:4]  soil_moisture_percent = raw / 10
 *   reg 1  bytes res[5:6]  soil_temperature_c    = raw / 10
 *   reg 2  bytes res[7:8]  soil_ec_us_cm         = raw (integer)
 *
 * Updates global `stage` to STAGE_RS485_RESPONSE then STAGE_PARSED.
 * Guarantees MAX485_DE_RE LOW and Serial1 ended on every return path.
 * Returns true and fills temp/mois/ec on success.
 * Returns false and writes errorCode on failure.
 */
bool readSoilSensorRS485(float &temp, float &mois, float &ec,
                         char *errorCode, size_t errorCodeLen) {
  Serial1.begin(MODBUS_BAUD_RATE, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
  while (Serial1.available()) Serial1.read();  // discard any stale bytes

  // Build Modbus RTU request frame (6 data bytes + 2 CRC bytes)
  uint8_t req[8] = {
    MODBUS_SLAVE_ID,
    MODBUS_FUNC_CODE,
    MODBUS_START_ADDR_HI,
    MODBUS_START_ADDR_LO,
    MODBUS_REG_COUNT_HI,
    MODBUS_REG_COUNT_LO,
    0x00, 0x00  // CRC placeholder
  };
  uint16_t reqCRC = modbusRTUCRC(req, 6);
  req[6] = (uint8_t)(reqCRC & 0xFF);
  req[7] = (uint8_t)(reqCRC >> 8);

  // Transmit: enable driver → send → wait for shift-register empty → disable driver
  digitalWrite(MAX485_DE_RE_PIN, HIGH);
  delayMicroseconds(200);
  Serial1.write(req, sizeof(req));
  Serial1.flush();  // blocks until all bits are shifted out
  delayMicroseconds(300);
  digitalWrite(MAX485_DE_RE_PIN, LOW);  // back to receive mode

  // Drain echo bytes produced by MAX485 half-duplex loopback during TX
  while (Serial1.available()) Serial1.read();

  // Collect exactly MODBUS_RESPONSE_LEN bytes with timeout
  stage = STAGE_RS485_RESPONSE;
  uint8_t res[MODBUS_RESPONSE_LEN];
  uint8_t idx = 0;
  uint32_t tStart = millis();

  while (idx < MODBUS_RESPONSE_LEN) {
    if ((millis() - tStart) >= (uint32_t)RS485_RX_TIMEOUT_MS) {
      snprintf(errorCode, errorCodeLen, "SOIL_SENSOR_NO_RESPONSE");
      Serial1.end();
      // MAX485_DE_RE already LOW
      return false;
    }
    if (Serial1.available()) {
      res[idx++] = (uint8_t)Serial1.read();
    }
  }

  // Validate Modbus header: [slave_id][func_code][byte_count = 6]
  if (res[0] != MODBUS_SLAVE_ID || res[1] != MODBUS_FUNC_CODE || res[2] != 0x06) {
    snprintf(errorCode, errorCodeLen, "SOIL_SENSOR_PARSE_ERROR");
    Serial1.end();
    return false;
  }

  // Validate CRC over bytes 0–8; received CRC is in bytes 9–10 (low byte first)
  uint16_t rxCRC = (uint16_t)res[9] | ((uint16_t)res[10] << 8);
  uint16_t calcCRC = modbusRTUCRC(res, 9);
  if (rxCRC != calcCRC) {
    snprintf(errorCode, errorCodeLen, "SOIL_SENSOR_CRC_ERROR");
    Serial1.end();
    return false;
  }

  // Extract sensor values from holding registers
  stage = STAGE_PARSED;
  uint16_t rawMois = ((uint16_t)res[3] << 8) | res[4];
  uint16_t rawTemp = ((uint16_t)res[5] << 8) | res[6];
  uint16_t rawEc = ((uint16_t)res[7] << 8) | res[8];

  mois = rawMois / 10.0f;
  temp = rawTemp / 10.0f;
  ec = (float)rawEc;

  Serial1.end();
  return true;
}

/**
 * Initialise LoRa SX1278 on the Node2 custom SPI pins.
 * RF settings must match Main Node exactly.
 * Returns true on success.
 */
bool initLoRa() {
  digitalWrite(LORA_RST_PIN, LOW);
  delay(10);
  digitalWrite(LORA_RST_PIN, HIGH);
  delay(50);

  SPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_CS_PIN);
  LoRa.setPins(LORA_CS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    DBG("[LoRa] begin() failed");
    return false;
  }

  // RF parameters — must match Main Node settings exactly
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.enableCrc();
  LoRa.setTxPower(14);

  DBG("[LoRa] Ready");
  return true;
}

/**
 * Build a compact JSON LoRa payload for a successful soil reading.
 * Key names match Main_Node parseSoilPacket() expectations exactly:
 *   temp  → soil_temperature_c       (float, 1 decimal place)
 *   mois  → soil_moisture_percent    (float, 1 decimal place)
 *   ec    → soil_ec_us_cm            (integer — raw Modbus register value)
 *
 * No pH, salinity, NPK. Battery always "not_measured".
 */
String buildSoilPacket(float temp, float mois, float ec) {
  char t_str[8], m_str[8];
  dtostrf(temp, 5, 1, t_str);
  dtostrf(mois, 5, 1, m_str);

  String ts = String(t_str);
  ts.trim();
  String ms = String(m_str);
  ms.trim();

  String pkt = "{";
  pkt += "\"pv\":" + String(PROTOCOL_VERSION) + ",";
  pkt += "\"pt\":\"soil_reading\",";
  pkt += "\"nid\":\"" NODE_ID "\",";
  pkt += "\"ntype\":\"" NODE_TYPE "\",";
  pkt += "\"seq\":" + String(node_seq) + ",";
  pkt += "\"boot\":" + String(bootCount) + ",";
  pkt += "\"stg\":" + String(stage) + ",";
  pkt += "\"uptime\":" + String(millis()) + ",";
  pkt += "\"temp\":" + ts + ",";
  pkt += "\"mois\":" + ms + ",";
  pkt += "\"ec\":" + String((uint32_t)ec) + ",";
  pkt += "\"rfail\":" + String(txFailCount) + ",";
  pkt += "\"batt\":\"not_measured\",";
  pkt += "\"status\":\"ok\"";
  pkt += "}";

  return pkt;
}

/**
 * Transmit the LoRa packet.
 * Retries up to MAX_LORA_RETRIES times on TX failure.
 * Returns true if at least one attempt succeeded.
 */
bool sendLoRaPacket(const String &packet) {
  for (int attempt = 0; attempt <= MAX_LORA_RETRIES; attempt++) {
    if (attempt > 0) {
      DBGF("[LoRa] Retry %d", attempt);
      delay(200);
    }

    if (!LoRa.beginPacket()) {
      DBG("[LoRa] beginPacket() failed");
      continue;
    }

    LoRa.print(packet);

    if (LoRa.endPacket(false)) {  // false = blocking TX — wait until radio is idle
      DBGF("[LoRa] TX ok (attempt %d)", attempt + 1);
      return true;
    }

    DBG("[LoRa] endPacket() failed");
  }

  DBG("[LoRa] All TX attempts failed");
  return false;
}

/**
 * Listen for an ACK from the Main Node for at most LORA_ACK_TIMEOUT_MS.
 * Returns true if ACK was received, false on timeout.
 */
bool waitForAck() {
  LoRa.receive();
#if DEBUG_MODE
  unsigned long ack_window_start = millis();
#endif
  unsigned long deadline = millis() + LORA_ACK_TIMEOUT_MS;

  while (millis() < deadline) {
    int pktSize = LoRa.parsePacket();
    if (pktSize > 0) {
      String ack = "";
      while (LoRa.available()) {
        ack += (char)LoRa.read();
      }
      DBGF("[LoRa] ack_payload: %s", ack.c_str());
      bool valid = ack.indexOf("\"pt\":\"ack\"") >= 0 &&
                   ack.indexOf("\"to\":\"N2\"") >= 0 &&
                   ack.indexOf("\"seq\":" + String(node_seq)) >= 0;
      if (valid) {
        // Parse sleep hint from ACK — Main encodes TDMA slot offset here.
        int sleepIdx = ack.indexOf("\"sleep\":");
        if (sleepIdx >= 0) {
          uint32_t hint = (uint32_t)ack.substring(sleepIdx + 8).toInt();
          if (hint >= 30 && hint <= 1200) {
            g_ackSleepHintSec = hint;
          }
        }
#if DEBUG_MODE
        unsigned long ack_window_end = millis();
        DBGF("[LoRa] ack_result=ok  seq=%lu  RSSI=%d  sleep_hint=%lu  window_used_ms=%lu",
             (unsigned long)node_seq, LoRa.packetRssi(),
             (unsigned long)g_ackSleepHintSec, ack_window_end - ack_window_start);
#endif
        return true;
      }
      DBG("[LoRa] ack_received: ignored (not for us)");
    }
    yield();
  }

#if DEBUG_MODE
  unsigned long ack_window_end = millis();
  DBGF("[LoRa] ack_result=timeout  window_used_ms=%lu", ack_window_end - ack_window_start);
#else
  DBG("[LoRa] ack_timeout");
#endif
  return false;
}

/**
 * Return sleep duration in seconds based on consecutive ACK failure count.
 * Sequence shifts TX phase relative to the Main Node 600 s superframe.
 */
uint32_t getRecoverySleepSec(uint8_t failCount) {
  if (failCount == 0) return 600;
  if (failCount == 1) return 60;
  if (failCount == 2) return 120;
  if (failCount == 3) return 300;
  return 600;
}

/**
 * Put all peripherals into a safe low-power state before deep sleep.
 * Idempotent — safe to call multiple times.
 */
void prepareForSleep() {
  digitalWrite(RELAY_PIN, RELAY_OFF);   // sensor must not stay powered during sleep
  digitalWrite(MAX485_DE_RE_PIN, LOW);  // idle receive mode

  if (g_loraReady) {
    LoRa.sleep();                     // SX1278 low-power sleep mode
    digitalWrite(LORA_CS_PIN, HIGH);  // CS deasserted during deep sleep
  }

  DBG("[Node2] Prepared for sleep");
}

/**
 * Enter ESP32-C3 deep sleep for the given number of seconds.
 * Forces relay OFF and MAX485 idle even if prepareForSleep() was not called.
 * This function does NOT return — the MCU reboots into setup() on wake.
 */
void goToDeepSleep(uint32_t sleepSec) {
  // Safety net: enforce safe states on every path that reaches sleep
  digitalWrite(RELAY_PIN, RELAY_OFF);
  digitalWrite(MAX485_DE_RE_PIN, LOW);

  uint64_t sleep_us = (uint64_t)sleepSec * 1000000ULL;
  DBGF("[Node2] Deep sleep %lu s", (unsigned long)sleepSec);

#if DEBUG_MODE
  Serial.flush();
#endif

  esp_sleep_enable_timer_wakeup(sleep_us);
  esp_deep_sleep_start();

  // Unreachable — deep sleep triggers a full MCU reset on wake
}

/**
 * Build and transmit a minimal error packet so the Main Node can log the event.
 * status: "rs485_error" for Modbus/RS485 failures, "sensor_error" for other faults.
 * Caller increments node_seq and calls prepareForSleep() / goToDeepSleep() after this.
 */
void sendErrorPacket(const char *status, const char *errorCode) {
  String pkt = "{";
  pkt += "\"pv\":" + String(PROTOCOL_VERSION) + ",";
  pkt += "\"pt\":\"soil_reading\",";
  pkt += "\"nid\":\"" NODE_ID "\",";
  pkt += "\"ntype\":\"" NODE_TYPE "\",";
  pkt += "\"seq\":" + String(node_seq) + ",";
  pkt += "\"boot\":" + String(bootCount) + ",";
  pkt += "\"stg\":" + String(stage) + ",";
  pkt += "\"uptime\":" + String(millis()) + ",";
  pkt += "\"rfail\":" + String(txFailCount) + ",";
  pkt += "\"batt\":\"not_measured\",";
  pkt += "\"status\":\"" + String(status) + "\",";
  pkt += "\"err\":\"" + String(errorCode) + "\"";
  pkt += "}";

  DBGF("[Node2] Error packet: %s", pkt.c_str());

  // Best-effort single send — no retry loop on error path
  if (LoRa.beginPacket()) {
    LoRa.print(pkt);
    LoRa.endPacket(false);
    DBG("[LoRa] Error packet sent");
  } else {
    DBG("[LoRa] Error packet TX failed");
  }
}
