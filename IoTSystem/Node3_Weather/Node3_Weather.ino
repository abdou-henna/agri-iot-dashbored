/**
 * Node3_Weather — ESP32-C3 Weather Node Firmware
 *
 * Hardware : ESP32-C3 Super Mini + LoRa SX1278 + BME280
 * Role     : Read temperature / humidity / pressure via BME280 forced mode,
 *            transmit a compact JSON packet over LoRa, then enter deep sleep.
 * No WiFi. No SD. No RTC. No NPK.
 *
 * Packet format and WebService compatibility verified against:
 *   WebService/sql/001_init.sql
 *   WebService/src/services/validation.service.js
 *   WebService/src/config.js
 */

// ─── Standard / Platform ──────────────────────────────────────────────────────
#include <SPI.h>
#include <Wire.h>
#include "esp_wifi.h"
#include "esp_bt.h"
#include "esp_sleep.h"

// ─── LoRa ─────────────────────────────────────────────────────────────────────
#include <LoRa.h>

// ─── BME280 ───────────────────────────────────────────────────────────────────
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>

// ═════════════════════════════════════════════════════════════════════════════
// COMPILE-TIME CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════

#define NODE_ID                  "N3"
#define NODE_TYPE                "weather"
#define PROTOCOL_VERSION         1
#define LORA_FREQUENCY           433E6
#define MEASUREMENT_INTERVAL_SEC 600       // 10 minutes
#define LORA_ACK_TIMEOUT_MS      2500      // max ACK listen window
#define MAX_LORA_RETRIES         0         // one TX attempt per wake cycle — no in-wake retries
#define DEBUG_MODE               true      // set false before deployment

// ─── Execution Stage Constants (debug_strategy.md §5.1) ──────────────────────
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

// ─── Pin Mapping (Node3, from Pin_Mapping.md) ─────────────────────────────────
// LoRa SX1278
#define LORA_SCK_PIN   4
#define LORA_MISO_PIN  5
#define LORA_MOSI_PIN  6
#define LORA_CS_PIN    7
#define LORA_RST_PIN   2
#define LORA_DIO0_PIN  3

// BME280 I2C
#define BME_SDA_PIN    8
#define BME_SCL_PIN    9

// ═════════════════════════════════════════════════════════════════════════════
// DEBUG HELPERS  — zero overhead when DEBUG_MODE is false
// ═════════════════════════════════════════════════════════════════════════════

#if DEBUG_MODE
  #define DBG(msg)           Serial.println(msg)
  #define DBGF(fmt, ...)     Serial.printf(fmt "\n", ##__VA_ARGS__)
#else
  #define DBG(msg)           ((void)0)
  #define DBGF(fmt, ...)     ((void)0)
#endif

// ═════════════════════════════════════════════════════════════════════════════
// RTC MEMORY  — persists across deep sleep cycles
// ═════════════════════════════════════════════════════════════════════════════

RTC_DATA_ATTR uint32_t node_seq     = 0;   // incremented on every successful TX
RTC_DATA_ATTR uint32_t bootCount    = 0;   // incremented on every boot
RTC_DATA_ATTR uint8_t  txFailCount  = 0;   // consecutive ACK failures
RTC_DATA_ATTR bool     recoveryMode = false; // true when in recovery sleep sequence

// ═════════════════════════════════════════════════════════════════════════════
// GLOBALS
// ═════════════════════════════════════════════════════════════════════════════

Adafruit_BME280 bme;
uint8_t         stage = STAGE_BOOT;

// Sleep duration hint received from Main Node ACK ("sleep" field).
// Overrides getRecoverySleepSec() when a valid ACK is received, allowing
// Main to enforce TDMA slot offset (N3 = 40 s into next cycle).
// Not RTC — resets to default on every boot, then overridden by ACK parse.
uint32_t g_ackSleepHintSec = MEASUREMENT_INTERVAL_SEC;

// ═════════════════════════════════════════════════════════════════════════════
// FUNCTION PROTOTYPES
// ═════════════════════════════════════════════════════════════════════════════

void   setupPins();
void   disableUnusedRadios();
bool   initBME280();
bool   readWeather(float &temp, float &hum, float &pres);
bool   initLoRa();
String buildWeatherPacket(float temp, float hum, float pres);
bool   sendLoRaPacket(const String &packet);
bool     waitForAck();
void     prepareForSleep();
void     goToDeepSleep(uint32_t sleepSec = MEASUREMENT_INTERVAL_SEC);
void     sendErrorPacket(const char *errorCode);
uint32_t getRecoverySleepSec(uint8_t failCount);

// ═════════════════════════════════════════════════════════════════════════════
// SETUP  — all logic lives here; loop() is intentionally empty
// ═════════════════════════════════════════════════════════════════════════════

void setup() {
#if DEBUG_MODE
  Serial.begin(115200);
  delay(500);  // give USB-CDC time to enumerate (ESP32-C3)
  DBG("[Node3] Boot");
#endif

  // ── Boot counter ───────────────────────────────────────────────────────────
  if (bootCount > 1000000UL) bootCount = 0;
  bootCount++;
  stage = STAGE_BOOT;

  // ── 0. Sanity-check RTC sequence counter ───────────────────────────────────
  if (node_seq > 1000000UL) {
    node_seq = 0;
    DBG("[Node3] node_seq reset (implausible RTC value)");
  }

  // ── 1. Safe GPIO states ────────────────────────────────────────────────────
  setupPins();

  // ── 2. Disable WiFi and Bluetooth immediately ──────────────────────────────
  disableUnusedRadios();
  stage = STAGE_GPIO_READY;

  // ── 3. Initialise BME280 ───────────────────────────────────────────────────
  stage = STAGE_BME_INIT;
  g_ackSleepHintSec = MEASUREMENT_INTERVAL_SEC;  // reset each boot before TX
  if (!initBME280()) {
    DBG("[Node3] BME280 init failed → sending error packet");
    if (initLoRa()) {
      sendErrorPacket("BME280_NOT_FOUND");
      bool ackOk = waitForAck();
      if (ackOk) { txFailCount = 0; recoveryMode = false; }
      else        { txFailCount++; recoveryMode = true; }
      prepareForSleep();
      DBGF("[Sleep] bme_init_fail — sleep=%lu s", (unsigned long)
           (ackOk ? g_ackSleepHintSec : getRecoverySleepSec(txFailCount)));
      goToDeepSleep(ackOk ? g_ackSleepHintSec : getRecoverySleepSec(txFailCount));
    } else {
      txFailCount++;
      recoveryMode = true;
      DBGF("[Sleep] lora_fail — sleep=%lu s", (unsigned long)getRecoverySleepSec(txFailCount));
      goToDeepSleep(getRecoverySleepSec(txFailCount));
    }
  }

  // ── 4. Read weather (forced measurement) ───────────────────────────────────
  stage = STAGE_BME_READ;
  float temp = 0.0f, hum = 0.0f, pres = 0.0f;
  if (!readWeather(temp, hum, pres)) {
    DBG("[Node3] BME280 read failed → sending error packet");
    if (initLoRa()) {
      sendErrorPacket("BME280_MEASUREMENT_FAILED");
      bool ackOk = waitForAck();
      if (ackOk) { txFailCount = 0; recoveryMode = false; }
      else        { txFailCount++; recoveryMode = true; }
      prepareForSleep();
      DBGF("[Sleep] bme_read_fail — sleep=%lu s", (unsigned long)
           (ackOk ? g_ackSleepHintSec : getRecoverySleepSec(txFailCount)));
      goToDeepSleep(ackOk ? g_ackSleepHintSec : getRecoverySleepSec(txFailCount));
    } else {
      txFailCount++;
      recoveryMode = true;
      DBGF("[Sleep] lora_fail — sleep=%lu s", (unsigned long)getRecoverySleepSec(txFailCount));
      goToDeepSleep(getRecoverySleepSec(txFailCount));
    }
  }

  DBGF("[Node3] T=%.1f°C  H=%.1f%%  P=%.1f hPa", temp, hum, pres);

  // ── 5. Initialise LoRa ─────────────────────────────────────────────────────
  stage = STAGE_LORA_INIT;
  if (!initLoRa()) {
    DBG("[Node3] LoRa init failed → sleeping without TX");
    goToDeepSleep();   // cannot send — just sleep
  }

  // ── 6. Build packet ────────────────────────────────────────────────────────
  stage = STAGE_PACKET_BUILT;
  String packet = buildWeatherPacket(temp, hum, pres);
  DBGF("[Node3] Packet (%d B): %s", packet.length(), packet.c_str());

  // ── 7. Transmit ───────────────────────────────────────────────────────────
#if DEBUG_MODE
  unsigned long tx_start_ms = millis();
#endif
  bool txOk = sendLoRaPacket(packet);
  bool ackReceived = false;

  if (txOk) {
    stage = STAGE_LORA_SENT;
#if DEBUG_MODE
    unsigned long tx_end_ms = millis();
    DBGF("[Timing] tx_start_ms=%lu tx_end_ms=%lu tx_dur_ms=%lu seq=%lu",
         tx_start_ms, tx_end_ms, tx_end_ms - tx_start_ms, (unsigned long)node_seq);
#else
    DBGF("[LoRa] packet_sent seq=%lu", (unsigned long)node_seq);
#endif

    // ── 8. Wait for ACK ───────────────────────────────────────────────────────
    ackReceived = waitForAck();
    stage = STAGE_ACK_DONE;

    // Increment sequence only after successful transmission
    node_seq++;
  }

  // ── 9. Update recovery state and compute sleep duration ──────────────────
  uint32_t sleepSec;
  if (ackReceived) {
    txFailCount  = 0;
    recoveryMode = false;
    sleepSec     = g_ackSleepHintSec;  // use Main's TDMA slot hint if received
    DBGF("[Sleep] ack_ok — sleep=%lu s (slot_hint)", (unsigned long)sleepSec);
  } else {
    txFailCount++;
    recoveryMode = true;
    sleepSec = getRecoverySleepSec(txFailCount);
    DBGF("[Sleep] no_ack — txFail=%u sleep=%lu s (recovery)", txFailCount, (unsigned long)sleepSec);
  }

  // ── 10. Sleep LoRa, safe GPIO, deep sleep ───────────────────────────────
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
 * Set all GPIO to a safe state before any peripheral is initialised.
 * CS must start HIGH so LoRa does not interfere with I2C bring-up.
 */
void setupPins() {
  pinMode(LORA_CS_PIN,   OUTPUT); digitalWrite(LORA_CS_PIN,   HIGH);
  pinMode(LORA_RST_PIN,  OUTPUT); digitalWrite(LORA_RST_PIN,  HIGH);
  pinMode(LORA_DIO0_PIN, INPUT);
}

/**
 * Disable WiFi and Bluetooth at the radio driver level.
 * Node3 never uses wireless; this eliminates idle radio current.
 */
void disableUnusedRadios() {
  esp_wifi_stop();

  // ESP32-C3 Bluetooth — disable controller if present.
  // If the board package does not expose esp_bt_controller_disable(),
  // remove the next two lines; it is safe to omit.
#if defined(CONFIG_BT_ENABLED)
  esp_bt_controller_disable();
#endif

  DBG("[Node3] Radios disabled");
}

/**
 * Initialise BME280 on the custom I2C pins (SDA=8, SCL=9).
 * Attempts both default I2C addresses (0x76 and 0x77).
 * Returns true on success.
 */
bool initBME280() {
  Wire.begin(BME_SDA_PIN, BME_SCL_PIN);

  // Try address 0x76 first, then 0x77
  if (!bme.begin(0x76, &Wire) && !bme.begin(0x77, &Wire)) {
    DBG("[BME280] Not found on 0x76 or 0x77");
    return false;
  }

  DBG("[BME280] Found");
  return true;
}

/**
 * Perform a single BME280 forced measurement.
 * Forced mode: sensor measures once then returns to sleep automatically.
 * Fills temp (°C), hum (%), pres (hPa).
 * Returns false if any value is NaN.
 */
bool readWeather(float &temp, float &hum, float &pres) {
  // Configure for one-shot low-power weather reading
  bme.setSampling(
    Adafruit_BME280::MODE_FORCED,
    Adafruit_BME280::SAMPLING_X1,   // temperature
    Adafruit_BME280::SAMPLING_X1,   // pressure
    Adafruit_BME280::SAMPLING_X1,   // humidity
    Adafruit_BME280::FILTER_OFF,
    Adafruit_BME280::STANDBY_MS_0_5
  );

  // Trigger single measurement; blocks until measurement is complete (~10 ms)
  if (!bme.takeForcedMeasurement()) {
    DBG("[BME280] takeForcedMeasurement() returned false");
    return false;
  }

  temp = bme.readTemperature();
  hum  = bme.readHumidity();
  pres = bme.readPressure() / 100.0F;  // Pa → hPa

  if (isnan(temp) || isnan(hum) || isnan(pres)) {
    DBG("[BME280] NaN reading");
    return false;
  }

  return true;
}

/**
 * Initialise LoRa SX1278 on the custom SPI pins.
 * Returns true on success.
 */
bool initLoRa() {
  // Bind SPI bus to the correct pins before LoRa uses it
  SPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_CS_PIN);

  LoRa.setPins(LORA_CS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    DBG("[LoRa] begin() failed");
    return false;
  }

  // RF settings — must match Main Node exactly
  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.enableCrc();
  LoRa.setTxPower(14);

  DBG("[LoRa] Ready");
  return true;
}

/**
 * Build a compact JSON LoRa payload.
 * Uses short key names to minimise packet size.
 * All floats rounded to 1 decimal place.
 *
 * Key mapping (Node3 → Main Node → WebService):
 *   temp  → air_temperature_c
 *   hum   → air_humidity_percent
 *   pres  → air_pressure_hpa
 *   batt  → battery_status = "not_measured", battery_mv = null
 */
String buildWeatherPacket(float temp, float hum, float pres) {
  // Round to 1 decimal to match WebService float resolution
  char t_str[8], h_str[8], p_str[10];
  dtostrf(temp, 5, 1, t_str);
  dtostrf(hum,  5, 1, h_str);
  dtostrf(pres, 7, 1, p_str);

  // Trim leading whitespace produced by dtostrf
  String ts = String(t_str); ts.trim();
  String hs = String(h_str); hs.trim();
  String ps = String(p_str); ps.trim();

  String pkt = "{";
  pkt += "\"pv\":"    + String(PROTOCOL_VERSION)    + ",";
  pkt += "\"pt\":\"weather_reading\","               ;
  pkt += "\"nid\":\""  NODE_ID                 "\",";
  pkt += "\"ntype\":\"" NODE_TYPE              "\",";
  pkt += "\"seq\":"   + String(node_seq)             + ",";
  pkt += "\"boot\":"  + String(bootCount)            + ",";
  pkt += "\"stg\":"   + String(stage)                + ",";
  pkt += "\"uptime\":" + String(millis())            + ",";
  pkt += "\"temp\":"  + ts                           + ",";
  pkt += "\"hum\":"   + hs                           + ",";
  pkt += "\"pres\":"  + ps                           + ",";
  pkt += "\"rfail\":"  + String(txFailCount)          + ",";
  pkt += "\"batt\":\"not_measured\","                ;
  pkt += "\"status\":\"ok\""                         ;
  pkt += "}";

  return pkt;
}

/**
 * Transmit the LoRa packet.
 * Retries up to MAX_LORA_RETRIES times if beginPacket()/endPacket() fails.
 * Returns true if at least one attempt succeeded.
 */
bool sendLoRaPacket(const String &packet) {
  for (int attempt = 0; attempt <= MAX_LORA_RETRIES; attempt++) {
    if (attempt > 0) {
      DBGF("[LoRa] Retry %d", attempt);
      delay(200);  // brief back-off before retry
    }

    if (!LoRa.beginPacket()) {
      DBG("[LoRa] beginPacket() failed");
      continue;
    }

    LoRa.print(packet);

    // endPacket(false) = blocking mode — waits until TX is complete
    if (LoRa.endPacket(false)) {
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
                   ack.indexOf("\"to\":\"N3\"") >= 0 &&
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
 * Put LoRa into sleep mode and leave CS HIGH.
 * Must be called before every deep sleep entry.
 */
void prepareForSleep() {
  LoRa.sleep();                           // SX1278 low-power sleep mode
  digitalWrite(LORA_CS_PIN, HIGH);        // CS HIGH during deep sleep
  DBG("[Node3] Prepared for sleep");
}

/**
 * Enter ESP32-C3 deep sleep for the given number of seconds.
 * This function does NOT return — the MCU reboots into setup() on wake.
 */
void goToDeepSleep(uint32_t sleepSec) {
  uint64_t sleep_us = (uint64_t)sleepSec * 1000000ULL;
  DBGF("[Node3] Entering deep sleep for %lu s", (unsigned long)sleepSec);

#if DEBUG_MODE
  Serial.flush();
#endif

  esp_sleep_enable_timer_wakeup(sleep_us);
  esp_deep_sleep_start();

  // Unreachable — deep sleep resets the MCU
}

/**
 * Build and transmit a minimal error packet.
 * Called when a sensor fails before LoRa data can be sent.
 * Does NOT increment node_seq (failed measurement).
 * Caller must call prepareForSleep() and goToDeepSleep() afterwards.
 */
void sendErrorPacket(const char *errorCode) {
  String pkt = "{";
  pkt += "\"pv\":"     + String(PROTOCOL_VERSION) + ",";
  pkt += "\"pt\":\"weather_reading\","             ;
  pkt += "\"nid\":\""  NODE_ID              "\",";
  pkt += "\"ntype\":\"" NODE_TYPE           "\",";
  pkt += "\"seq\":"    + String(node_seq)          + ",";
  pkt += "\"boot\":"   + String(bootCount)         + ",";
  pkt += "\"stg\":"    + String(stage)             + ",";
  pkt += "\"uptime\":" + String(millis())          + ",";
  pkt += "\"rfail\":"   + String(txFailCount)       + ",";
  pkt += "\"batt\":\"not_measured\","              ;
  pkt += "\"status\":\"sensor_error\","            ;
  pkt += "\"err\":\""  + String(errorCode)  + "\"";
  pkt += "}";

  DBGF("[Node3] Error packet: %s", pkt.c_str());

  // Best-effort single send; no retry loop on error path
  if (LoRa.beginPacket()) {
    LoRa.print(pkt);
    LoRa.endPacket(false);
    DBG("[LoRa] Error packet sent");
  } else {
    DBG("[LoRa] Error packet TX failed (beginPacket)");
  }
}
