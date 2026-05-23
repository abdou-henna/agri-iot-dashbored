/**
 * Main_Node — ESP32 Gateway Node Firmware
 *
 * Hardware  : ESP32 + LoRa SX1278 (VSPI) + SD Card (HSPI) + DS3231 RTC (I2C)
 * Role      : Receive LoRa packets from Node2 (soil) and Node3 (weather),
 *             add RTC timestamp, store to SD card, upload to Render WebService
 *             on manual button press.
 *
 * Rules enforced:
 *   - No WiFi during normal operation
 *   - No NPK fields anywhere
 *   - No battery measurement (null / "not_measured")
 *   - LoRa sleeps when no RX/TX window is open
 *   - SD files opened → written → closed per operation
 *   - All Serial output gated behind DEBUG_MODE
 *
 * Upload target : POST https://agri-iot-webservice.onrender.com/api/v1/upload
 * Auth header   : x-api-key
 * WebService    : validated against sql/001_init.sql + validation.service.js
 */

// ─── Standard / Platform ─────────────────────────────────────────────────────
#include <SPI.h>
#include <Wire.h>
#include "esp_sleep.h"

// ─── LoRa ────────────────────────────────────────────────────────────────────
#include <LoRa.h>

// ─── SD Card ─────────────────────────────────────────────────────────────────
#include <SD.h>
#include <FS.h>

// ─── RTC DS3231 ──────────────────────────────────────────────────────────────
#include <RTClib.h>

// ─── JSON (ArduinoJson 7.x) ──────────────────────────────────────────────────
#include <ArduinoJson.h>

// ─── WiFi / HTTP (upload mode only) ─────────────────────────────────────────
#include <WiFi.h>
#include <HTTPClient.h>

// ═════════════════════════════════════════════════════════════════════════════
// COMPILE-TIME CONSTANTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── Identity ────────────────────────────────────────────────────────────────
#define GATEWAY_ID          "GW01"
#define FIRMWARE_VERSION    "gw-1.0.0"
#define LORA_FREQUENCY      433E6
#define DEBUG_MODE          true      // set false before deployment

// ─── LoRa SPI pins (VSPI — Pin_Mapping.md Main Node) ────────────────────────
#define LORA_SCK_PIN        18
#define LORA_MISO_PIN       19
#define LORA_MOSI_PIN       23
#define LORA_CS_PIN          5
#define LORA_RST_PIN        26
#define LORA_DIO0_PIN       14

// ─── SD Card SPI pins (HSPI — Pin_Mapping.md Main Node) ─────────────────────
#define SD_SCK_PIN          25
#define SD_MISO_PIN         32
#define SD_MOSI_PIN         33
#define SD_CS_PIN           27

// ─── RTC DS3231 I2C pins (Pin_Mapping.md Main Node) ─────────────────────────
#define RTC_SDA_PIN         21
#define RTC_SCL_PIN         22

// ─── Upload Button (Pin_Mapping.md — GPIO34, INPUT_PULLUP) ───────────────────
#define BTN_PIN             34
#define BTN_PRESSED         LOW
#define BTN_DEBOUNCE_MS     50
#define BTN_HOLD_MS         1000    // hold ≥ 1 s to trigger upload

// ─── Relay + RS485 / MAX485 (Pin_Mapping.md Main Node) ──────────────────────
#define RELAY_PIN               2     // Relay IN — GPIO2
#define RELAY_ON                HIGH   // active-high relay module
#define RELAY_OFF               LOW   
#define MAX485_DE_RE_PIN        4     // RE + DE tied together — GPIO4
#define RS485_RX_PIN            16    // MAX485 RO — GPIO16
#define RS485_TX_PIN            17    // MAX485 DI — GPIO17
#define RS485_BAUD_RATE         4800  // Modbus RTU — soil_sensor_protocol.md §13
#define RS485_SENSOR_WARMUP_MS  5000  // relay ON → first Modbus request delay
#define RS485_RX_TIMEOUT_MS     300   // max wait for Modbus response bytes

// ─── Timing ──────────────────────────────────────────────────────────────────
#define CYCLE_DURATION_SEC  600     // 10-minute superframe
#define CYCLE_WINDOW_MS         70000UL // RX window per cycle (both nodes)
#define RECOVERY_RX_WINDOW_MS  120000UL // extended RX window during recovery watch
#define NODE_DEAD_THRESHOLD     5        // consecutive missed cycles before node_marked_dead
#define RECOVERY_MAX_CYCLES     2        // cycles after first miss that extend RX window
#define ACK_TIMEOUT_MS      200     // half-duplex guard before ACK TX
#define N2_SLOT_OFFSET_SEC  10      // N2 wakes 10 s into next cycle (transmits first)
#define N3_SLOT_OFFSET_SEC  40      // N3 wakes 40 s into next cycle (30 s guard after N2)
#define N2_BOOT_TO_TX_SEC   6       // N2 measured boot-to-LoRa-TX duration
#define N3_BOOT_TO_TX_SEC   1       // N3 measured boot-to-LoRa-TX duration
#define WIFI_CONNECT_TIMEOUT_MS  20000
#define UPLOAD_HTTP_TIMEOUT_MS   30000
#define SD_RETRY_COUNT      2

// ─── LoRa RF settings — MUST match Node2 and Node3 exactly ──────────────────
#define LORA_SF             7
#define LORA_BW             125E3
#define LORA_CR             5
#define LORA_TX_POWER       14

// ─── Upload limits per request ───────────────────────────────────────────────
#define UPLOAD_MAX_READINGS     400     // legacy — kept for reference
#define UPLOAD_MAX_EVENTS       200     // legacy — kept for reference
#define UPLOAD_MAX_RETRIES      3       // max HTTP POST attempts per upload
#define UPLOAD_RETRY_DELAY_MS   5000    // ms between retries
#define MAX_BATCH_READINGS      20      // readings per chunked POST
#define MAX_BATCH_EVENTS        10      // events per chunked POST
#define MAX_BATCH_PAYLOAD_BYTES 8000    // soft payload size limit per batch
#define RTC_DRIFT_SAFE_S        30      // ignore drift ≤ this many seconds
#define BTN_CLICK_MAX_MS        400     // press longer than this aborts 4-click
#define GESTURE_4CLICK_TIMEOUT_MS 4000  // window to complete 4-click sequence
#define MIN_SAFE_SLEEP_AFTER_MODE_SEC 60  // minimum sleep after upload/correction before recovery is forced
#define MAX_PENDING_QUEUES      32    // max queue files scanned per upload session
#define QUEUE_PATH_MAXLEN       56    // /DATA/YYYY/MM/YYYY-MM-DD_upload_queue.jsonl + NUL

// ─── Credentials (connection.md) ─────────────────────────────────────────────
#define WIFI_SSID           "Abdou-Phone"
#define WIFI_PASSWORD       "12345678"
#define WEBSERVICE_URL      "https://agri-iot-webservice.onrender.com/api/v1/upload"
#define API_KEY             "x7F9$kL2@vQ8#ZpR4!mN6&cT1^aD0*HsJ9uW3eY5"

// ─── SD Paths ────────────────────────────────────────────────────────────────
#define SD_CONFIG_DIR       "/CONFIG"
#define SD_ARCHIVE_DIR      "/ARCHIVE"
#define SD_MANIFEST_DIR     "/MANIFEST"
#define SD_UPLOAD_STATE     "/CONFIG/upload_state.json"
#define SD_ARCHIVE_LOG      "/ARCHIVE/uploaded_files.log"

// ─── Execution Stage Constants (debug_strategy.md §5.3) ─────────────────────
#define STAGE_BOOT          0
#define STAGE_GPIO_READY    1
#define STAGE_RTC_INIT      2
#define STAGE_SD_INIT       3
#define STAGE_LORA_INIT     4
#define STAGE_RX_OPEN       5
#define STAGE_PKT_RECEIVED  6
#define STAGE_PKT_PARSED    7
#define STAGE_RECORD_SAVED  8
#define STAGE_EVENT_SAVED   9
#define STAGE_BTN_CHECKED   10
#define STAGE_WIFI_UPLOAD   11
#define STAGE_UPLOAD_DONE   12
#define STAGE_RTC_UPDATED   13
#define STAGE_SLEEP_PREPARE 14

// ═════════════════════════════════════════════════════════════════════════════
// DEBUG HELPERS — zero overhead when DEBUG_MODE is false
// ═════════════════════════════════════════════════════════════════════════════

#if DEBUG_MODE
  #define DBG(msg)          Serial.println(msg)
  #define DBGF(fmt, ...)    Serial.printf(fmt "\n", ##__VA_ARGS__)
#else
  #define DBG(msg)          ((void)0)
  #define DBGF(fmt, ...)    ((void)0)
#endif

// Per-node recovery state — defined here so RTC_DATA_ATTR can use the type
struct NodeHealth {
  uint8_t  missedCount;    // consecutive missed cycles
  uint32_t lastSeenFrame;  // g_frameId when node was last received
  bool     recoveryWatch;  // true after first miss
  bool     markedDead;     // true after NODE_DEAD_THRESHOLD misses
};

// ═════════════════════════════════════════════════════════════════════════════
// RTC MEMORY — persists across deep sleep cycles
// ═════════════════════════════════════════════════════════════════════════════

RTC_DATA_ATTR uint32_t bootCount  = 0;   // incremented every boot
RTC_DATA_ATTR uint32_t eventCount = 0;   // per-boot event ID counter
RTC_DATA_ATTR NodeHealth n2Health = {0, 0, false, false};
RTC_DATA_ATTR NodeHealth n3Health = {0, 0, false, false};
RTC_DATA_ATTR uint32_t g_lastMissingFrameN2 = 0;  // Patch F: idempotent missing writes
RTC_DATA_ATTR uint32_t g_lastMissingFrameN3 = 0;
RTC_DATA_ATTR bool     g_forceRecoveryWindowNextBoot = false;  // set after upload; clears on next normal cycle
RTC_DATA_ATTR uint32_t g_plannedWakeEpoch = 0;               // unix epoch of next planned wake; set before every sleep

// ─── Gesture types ───────────────────────────────────────────────────────────
enum GestureType {
  GESTURE_NONE,
  GESTURE_LONG_PRESS,   // ≥ BTN_HOLD_MS hold → upload
  GESTURE_FOUR_CLICK    // 4 short presses within GESTURE_4CLICK_TIMEOUT_MS → RTC correction
};

// ═════════════════════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═════════════════════════════════════════════════════════════════════════════

struct WeatherReading {
  bool    valid      = false;
  bool    isError    = false;
  String  nodeId;
  uint32_t nodeSeq   = 0;
  uint32_t nodeBoot  = 0;
  uint8_t  nodeStg   = 0;
  float   temp       = 0.0f;
  float   hum        = 0.0f;
  float   pres       = 0.0f;
  int     rssi       = 0;
  float   snr        = 0.0f;
  uint8_t txFail     = 0;   // rfail from packet — diagnostic only
  String  status;
  String  errCode;
  String  measuredAt;
  String  recordId;
};

struct SoilReading {
  bool    valid      = false;
  bool    isError    = false;
  String  nodeId;
  uint32_t nodeSeq   = 0;
  uint32_t nodeBoot  = 0;
  uint8_t  nodeStg   = 0;
  float   soilTemp   = 0.0f;
  float   soilMois   = 0.0f;
  float   soilEc     = 0.0f;
  float   soilPh     = 0.0f;
  int     rssi       = 0;
  float   snr        = 0.0f;
  uint8_t txFail     = 0;   // rfail from packet — diagnostic only
  String  status;
  String  errCode;
  String  measuredAt;
  String  recordId;
};

// ═════════════════════════════════════════════════════════════════════════════
// GLOBALS
// ═════════════════════════════════════════════════════════════════════════════

RTC_DS3231  rtc;
SPIClass    sdSPI(HSPI);      // SD uses HSPI; LoRa uses default VSPI

uint8_t     stage         = STAGE_BOOT;
bool        g_rtcOk       = false;
bool        g_sdOk        = false;
bool        g_loraOk      = false;
bool        g_rtcLostPower = false;

WeatherReading g_weather;
SoilReading    g_soil;

bool        g_receivedN2  = false;
bool        g_receivedN3  = false;
bool        g_missingN2Logged = false;
bool        g_missingN3Logged = false;

uint32_t    g_lastSeqN2   = 0xFFFFFFFF;  // duplicate detection
uint32_t    g_lastSeqN3   = 0xFFFFFFFF;

uint32_t    g_frameId     = 0;
uint32_t    g_cycleStartMs = 0;
bool        g_uploadHandled = false;
bool        g_uploadPendingInCycle = false;  // latched by long-press during active cycle

// Patch I: per-cycle debug counters (reset on every boot, non-RTC)
bool        g_mainSoilSaved      = false;
int         g_frameQueueReadings = 0;
int         g_frameQueueEvents   = 0;
bool        g_uploadInProgress   = false;  // gates saveSystemEvent JSONL append during upload
bool        g_postUploadFrame    = false;  // snapshot of g_forceRecoveryWindowNextBoot at cycle start

// ═════════════════════════════════════════════════════════════════════════════
// FUNCTION PROTOTYPES
// ═════════════════════════════════════════════════════════════════════════════

// Init
void     initPins();
bool     initRTC();
bool     initSDCard();
bool     initLoRa();
void     initSystem();

// RTC / time helpers
String   getTimestamp();
uint32_t getFrameId();
bool     isRtcTimeValid();
bool     updateRTCFromISO(const String& isoStr);

// Record / event ID builders
String   buildWeatherRecordId(uint32_t seq);
String   buildSoilRecordId(uint32_t seq);
String   buildMissingRecordId(const String& nodeId, uint32_t frameId);
String   buildMainSoilRecordId();
String   buildEventId(const String& ts);

// SD helpers
bool     ensureDir(const String& path);
String   getReadingsPath(const DateTime& dt);
String   getEventsPath(const DateTime& dt);
String   getQueuePath(const DateTime& dt);
bool     writeCSVRow(const String& path, const String& header, const String& row);
bool     appendJSONL(const String& path, const String& jsonLine);

// LoRa receive / parse / ACK
void     handleIncomingPacket();
bool     parseWeatherPacket(const String& raw, int rssi, float snr);
bool     parseSoilPacket(const String& raw, int rssi, float snr);
void     sendAck(const String& nodeId, uint32_t nodeSeq);

// Record saving
void     saveWeatherReading();
void     saveSoilReading();
void     saveMissingReading(const String& nodeId, const String& nodeType);
void     saveMainSoilReading(const SoilReading& r);
void     saveSystemEvent(const String& level, const String& eventType,
                         const String& nodeId, const String& errCode,
                         const String& msg, const String& details);

// Missing node detection
bool     isCycleComplete();

// Recovery / resynchronization tracking
uint32_t getMainRxWindowMs();
void     updateNodeReceived(NodeHealth &h, const char* nodeId, int rssi, float snr);
void     updateNodeMissed(NodeHealth &h, const char* nodeId);

// Button / gesture
GestureType detectGestureOnWake();
void     checkUploadLatch();

// RTC sync
void     syncRTCFromServerTime(const String& serverTime);

// Upload mode
void     runUploadMode();
void     runRTCCorrectionMode();
bool     connectWiFi();
void     disconnectWiFi();
bool     uploadJSONLFile(const String& path, String& serverTime, int& inserted, int attempt);
bool     runBatchedUpload(const String& qPath, String& serverTime, int& totalInserted);
int      scanPendingQueues(char paths[][QUEUE_PATH_MAXLEN], int maxPaths);
void     saveUploadState(const String& uploadId, bool success,
                          const String& serverTime, int inserted,
                          const String& reason);
void     markFileUploaded(const String& path);

// Sleep
void     prepareForSleep();
void     goToDeepSleep();

// Local RS485 soil sensor
bool     readLocalSoilSensorRS485(SoilReading &reading, char *errorCode, size_t errorCodeLen);
void     performLocalSoilMeasurement();

// ═════════════════════════════════════════════════════════════════════════════
// SETUP
// ═════════════════════════════════════════════════════════════════════════════

void setup() {
#if DEBUG_MODE
  Serial.begin(115200);
  delay(500);
  DBG("[MainNode] Boot");
#endif

  // Boot counter
  if (bootCount > 1000000UL) bootCount = 0;
  bootCount++;
  stage = STAGE_BOOT;

  initSystem();

  // ── EXT0 wake (button press): gesture-classified, upload or RTC correction ─
  // Does NOT open LoRa RX, does NOT create missing-node events,
  // does NOT call performLocalSoilMeasurement(), does NOT write cycle readings.
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    stage = STAGE_BTN_CHECKED;

    // Compute seconds remaining on the timer that was interrupted by this button press.
    // g_plannedWakeEpoch was stored before the previous sleep; subtract current time.
    uint32_t remaining_sleep_before_mode = CYCLE_DURATION_SEC;
    if (g_rtcOk && g_plannedWakeEpoch > 0) {
      uint32_t now_epoch = rtc.now().unixtime();
      if (g_plannedWakeEpoch > now_epoch) {
        remaining_sleep_before_mode = g_plannedWakeEpoch - now_epoch;
        if (remaining_sleep_before_mode > CYCLE_DURATION_SEC)
          remaining_sleep_before_mode = CYCLE_DURATION_SEC;
      } else {
        remaining_sleep_before_mode = 0;
      }
    }

    uint32_t mode_start_ms = millis();

    GestureType wakeGesture = detectGestureOnWake();
    if (wakeGesture == GESTURE_LONG_PRESS) {
      DBG("[MainNode] EXT0 long-press — entering upload mode");
      runUploadMode();
      DBG("[MainNode] Upload finished");
    } else if (wakeGesture == GESTURE_FOUR_CLICK) {
      DBG("[MainNode] EXT0 4-click — entering RTC correction mode");
      runRTCCorrectionMode();
    } else {
      DBG("[MainNode] EXT0 wake — no valid gesture, returning to sleep");
    }

    // Wait for button to return HIGH before sleeping — bounded at 5 s
    {
      uint32_t tRelease = millis();
      while (digitalRead(BTN_PIN) == BTN_PRESSED &&
             (millis() - tRelease) < 5000UL) {
        yield();
      }
    }

    // Schedule-preserving sleep: subtract mode duration from remaining timer.
    // If remainder is too short to be useful, force recovery window and sleep full cycle.
    uint32_t mode_elapsed_sec = (millis() - mode_start_ms) / 1000UL;
    uint32_t sleepSec;
    if (remaining_sleep_before_mode > mode_elapsed_sec &&
        (remaining_sleep_before_mode - mode_elapsed_sec) >= MIN_SAFE_SLEEP_AFTER_MODE_SEC) {
      sleepSec = remaining_sleep_before_mode - mode_elapsed_sec;
      DBGF("[MainNode] Post-button schedule-preserving sleep = %lu s", (unsigned long)sleepSec);
    } else {
      g_forceRecoveryWindowNextBoot = true;
      sleepSec = CYCLE_DURATION_SEC;
      DBGF("[MainNode] Post-button overrun — full cycle sleep = %lu s, recovery window set",
           (unsigned long)sleepSec);
    }

    if (g_rtcOk) g_plannedWakeEpoch = rtc.now().unixtime() + sleepSec;
    else          g_plannedWakeEpoch = 0;

    prepareForSleep();
#if DEBUG_MODE
    Serial.flush();
#endif
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_34, 0);
    esp_sleep_enable_timer_wakeup((uint64_t)sleepSec * 1000000ULL);
    esp_deep_sleep_start();
    return;  // unreachable — documents that nothing below executes on button wake
  }

  // ── Cold boot: check button before opening RX window ─────────────────────
  // Timer wake skips this block (button cannot be held during sleep).
  stage = STAGE_BTN_CHECKED;
  if (esp_sleep_get_wakeup_cause() != ESP_SLEEP_WAKEUP_TIMER) {
    GestureType bootGesture = detectGestureOnWake();
    if (bootGesture == GESTURE_LONG_PRESS) {
      DBG("[MainNode] Cold-boot long-press — entering upload mode");
      g_uploadHandled = true;
      runUploadMode();
      // Sleep a full cycle after upload so nodes are not starved of ACKs.
      // g_forceRecoveryWindowNextBoot was set inside runUploadMode() on success.
      prepareForSleep();
#if DEBUG_MODE
      Serial.flush();
#endif
      esp_sleep_enable_ext0_wakeup(GPIO_NUM_34, 0);
      esp_sleep_enable_timer_wakeup((uint64_t)CYCLE_DURATION_SEC * 1000000ULL);
      esp_deep_sleep_start();
      return;  // unreachable
    } else if (bootGesture == GESTURE_FOUR_CLICK) {
      DBG("[MainNode] Cold-boot 4-click — entering RTC correction mode");
      // Schedule-preserving sleep — identical formula to EXT0 handler.
      // On cold boot g_plannedWakeEpoch is 0, so remaining defaults to CYCLE_DURATION_SEC.
      uint32_t remaining_sleep_before_mode = CYCLE_DURATION_SEC;
      if (g_rtcOk && g_plannedWakeEpoch > 0) {
        uint32_t now_epoch = rtc.now().unixtime();
        if (g_plannedWakeEpoch > now_epoch) {
          remaining_sleep_before_mode = g_plannedWakeEpoch - now_epoch;
          if (remaining_sleep_before_mode > CYCLE_DURATION_SEC)
            remaining_sleep_before_mode = CYCLE_DURATION_SEC;
        } else {
          remaining_sleep_before_mode = 0;
        }
      }
      uint32_t mode_start_ms = millis();
      runRTCCorrectionMode();
      uint32_t mode_elapsed_sec = (millis() - mode_start_ms) / 1000UL;
      uint32_t sleepSec;
      if (remaining_sleep_before_mode > mode_elapsed_sec &&
          (remaining_sleep_before_mode - mode_elapsed_sec) >= MIN_SAFE_SLEEP_AFTER_MODE_SEC) {
        sleepSec = remaining_sleep_before_mode - mode_elapsed_sec;
      } else {
        g_forceRecoveryWindowNextBoot = true;
        sleepSec = CYCLE_DURATION_SEC;
      }
      if (g_rtcOk) g_plannedWakeEpoch = rtc.now().unixtime() + sleepSec;
      else          g_plannedWakeEpoch = 0;
      prepareForSleep();
#if DEBUG_MODE
      Serial.flush();
#endif
      esp_sleep_enable_ext0_wakeup(GPIO_NUM_34, 0);
      esp_sleep_enable_timer_wakeup((uint64_t)sleepSec * 1000000ULL);
      esp_deep_sleep_start();
      return;
    }
  }

  // Prepare receive cycle
  g_frameId           = getFrameId();
  g_cycleStartMs      = millis();
  g_postUploadFrame   = g_forceRecoveryWindowNextBoot;  // latch before window opens
  g_receivedN2        = false;
  g_receivedN3   = false;
  g_missingN2Logged = false;
  g_missingN3Logged = false;

  DBGF("[MainNode] Frame %u — opening LoRa RX window (%lu ms, recovery=%d)",
       g_frameId, (unsigned long)getMainRxWindowMs(),
       (n2Health.recoveryWatch || n3Health.recoveryWatch) ? 1 : 0);

  stage = STAGE_RX_OPEN;
  if (g_loraOk) LoRa.receive();  // enter continuous RX mode
}

// ═════════════════════════════════════════════════════════════════════════════
// LOOP — LoRa receive polling, button latch, cycle-complete detection
// ═════════════════════════════════════════════════════════════════════════════

void loop() {
  // 1. LoRa receive polling
  if (g_loraOk) {
    int pktSize = LoRa.parsePacket();
    if (pktSize > 0) {
      stage = STAGE_PKT_RECEIVED;
      handleIncomingPacket();
      if (g_loraOk) LoRa.receive();  // back to RX
    }
  }

  // 2. Upload button latch (non-blocking — deferred to cycle end, never interrupts LoRa)
  if (!g_uploadHandled) checkUploadLatch();

  // 3. Cycle complete → write SD records → optional deferred upload → sleep
  if (isCycleComplete()) {
    DBG("[MainNode] Cycle window closed — writing SD records");

    // Patch A/F: missing detection only after window closes; idempotent across reboots.
    // On the cycle immediately after an upload the RX window was extended (recovery);
    // nodes may have woken misaligned. Don't aggressively mark them dead that cycle.
    bool wasPostUploadFrame = g_postUploadFrame;
    g_forceRecoveryWindowNextBoot = false;  // consumed; clear for subsequent cycles

    if (!g_receivedN2 && g_lastMissingFrameN2 != g_frameId) {
      saveMissingReading("N2", "soil");
      g_lastMissingFrameN2 = g_frameId;
      g_missingN2Logged    = true;
      if (!wasPostUploadFrame) updateNodeMissed(n2Health, "N2");
    }
    if (!g_receivedN3 && g_lastMissingFrameN3 != g_frameId) {
      saveMissingReading("N3", "weather");
      g_lastMissingFrameN3 = g_frameId;
      g_missingN3Logged    = true;
      if (!wasPostUploadFrame) updateNodeMissed(n3Health, "N3");
    }

    // Mandatory Pivot 1 local soil measurement — runs after all LoRa RX windows
    performLocalSoilMeasurement();

    // Save received readings
    if (g_weather.valid) saveWeatherReading();
    if (g_soil.valid)    saveSoilReading();

    DBGF("[Frame] id=%lu rcvN2=%d rcvN3=%d missN2=%d missN3=%d mainSoil=%d qRead=%d qEvt=%d",
         (unsigned long)g_frameId,
         g_receivedN2 ? 1 : 0, g_receivedN3 ? 1 : 0,
         g_missingN2Logged ? 1 : 0, g_missingN3Logged ? 1 : 0,
         g_mainSoilSaved ? 1 : 0,
         g_frameQueueReadings, g_frameQueueEvents);

    // Deferred upload — triggered by long-press during the active cycle
    if (g_uploadPendingInCycle) {
      if (g_loraOk) LoRa.idle();
      runUploadMode();
    }

    prepareForSleep();
    goToDeepSleep();
    // Does not return
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// HARDWARE INIT
// ═════════════════════════════════════════════════════════════════════════════

void initPins() {
  // LoRa CS and RST — safe states before SPI init
  pinMode(LORA_CS_PIN,   OUTPUT); digitalWrite(LORA_CS_PIN,   HIGH);
  pinMode(LORA_RST_PIN,  OUTPUT); digitalWrite(LORA_RST_PIN,  HIGH);
  pinMode(LORA_DIO0_PIN, INPUT);

  // SD CS — high before SPI init
  pinMode(SD_CS_PIN, OUTPUT); digitalWrite(SD_CS_PIN, HIGH);

  // Upload button 
  pinMode(BTN_PIN, INPUT);

  // Relay — OFF before any soil measurement (safe default)
  pinMode(RELAY_PIN,        OUTPUT); digitalWrite(RELAY_PIN,        RELAY_OFF);
  // MAX485 direction control — receive mode by default
  pinMode(MAX485_DE_RE_PIN, OUTPUT); digitalWrite(MAX485_DE_RE_PIN, LOW);

  stage = STAGE_GPIO_READY;
  DBG("[MainNode] GPIO initialized");
}

bool initRTC() {
  Wire.begin(RTC_SDA_PIN, RTC_SCL_PIN);
  if (!rtc.begin(&Wire)) {
    DBG("[RTC] DS3231 not found");
    return false;
  }
  g_rtcLostPower = rtc.lostPower();
  if (g_rtcLostPower) {
    DBG("[RTC] Lost power — timestamp may be invalid");
  }
  stage = STAGE_RTC_INIT;
  DBG("[RTC] DS3231 ready");
  return true;
}

bool initSDCard() {
  sdSPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);
  if (!SD.begin(SD_CS_PIN, sdSPI)) {
    DBG("[SD] init failed");
    return false;
  }
  // Ensure base directories exist
  ensureDir(SD_CONFIG_DIR);
  ensureDir(SD_ARCHIVE_DIR);
  ensureDir(SD_MANIFEST_DIR);

  stage = STAGE_SD_INIT;
  DBGF("[SD] Ready — %llu MB total", SD.totalBytes() / (1024ULL * 1024ULL));
  return true;
}

bool initLoRa() {
  SPI.begin(LORA_SCK_PIN, LORA_MISO_PIN, LORA_MOSI_PIN, LORA_CS_PIN);
  LoRa.setPins(LORA_CS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    DBG("[LoRa] begin() failed");
    return false;
  }
  LoRa.setSpreadingFactor(LORA_SF);
  LoRa.setSignalBandwidth(LORA_BW);
  LoRa.setCodingRate4(LORA_CR);
  LoRa.enableCrc();
  LoRa.setTxPower(LORA_TX_POWER);

  stage = STAGE_LORA_INIT;
  DBG("[LoRa] Ready");
  return true;
}

void initSystem() {
  initPins();

  // RS485 on Serial1 — pins assigned from Pin_Mapping.md Main Node
  Serial1.begin(RS485_BAUD_RATE, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);

  g_rtcOk  = initRTC();
  g_sdOk   = initSDCard();
  g_loraOk = initLoRa();

  if (!g_rtcOk) {
    saveSystemEvent("error", "rtc_init_failed", "MAIN", "RTC_INIT_FAILED",
              "DS3231 not found on I2C", "{}");
  }
  if (g_rtcLostPower) {
    saveSystemEvent("warning", "rtc_lost_power", "MAIN", "RTC_LOST_POWER",
              "DS3231 lost power — timestamp may be unreliable", "{}");
  }
  if (!g_sdOk) {
    DBG("[MainNode] SD init failed — events cannot be saved");
  }
  if (!g_loraOk) {
    saveSystemEvent("error", "lora_init_failed", "MAIN", "LORA_INIT_FAILED",
              "LoRa SX1278 begin() failed", "{}");
  }

  DBGF("[MainNode] Boot %u | RTC=%d SD=%d LoRa=%d",
       bootCount, g_rtcOk, g_sdOk, g_loraOk);
}

// ═════════════════════════════════════════════════════════════════════════════
// RTC / TIME HELPERS
// ═════════════════════════════════════════════════════════════════════════════

String getTimestamp() {
  if (!g_rtcOk) return "1970-01-01T00:00:00Z";
  DateTime now = rtc.now();
  char buf[25];
  snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
           now.year(), now.month(),  now.day(),
           now.hour(), now.minute(), now.second());
  return String(buf);
}

// Returns true only when the RTC has valid wall-clock time (not power-loss defaults).
bool isRtcTimeValid() {
  if (!g_rtcOk) return false;
  return rtc.now().year() >= 2025;
}

uint32_t getFrameId() {
  if (!g_rtcOk) return 0;
  return rtc.now().unixtime() / CYCLE_DURATION_SEC;
}

bool updateRTCFromISO(const String& isoStr) {
  // Expects format: "2026-04-25T10:30:00.000Z" or "2026-04-25T10:30:00Z"
  if (isoStr.length() < 19) return false;
  int yr  = isoStr.substring(0,  4).toInt();
  int mo  = isoStr.substring(5,  7).toInt();
  int dy  = isoStr.substring(8,  10).toInt();
  int hr  = isoStr.substring(11, 13).toInt();
  int mi  = isoStr.substring(14, 16).toInt();
  int sc  = isoStr.substring(17, 19).toInt();
  if (yr < 2020 || yr > 2099) return false;
  rtc.adjust(DateTime(yr, mo, dy, hr, mi, sc));
  stage = STAGE_RTC_UPDATED;
  DBG("[RTC] Updated from server time");
  return true;
}

// Compare server_time against DS3231; apply correction only when drift exceeds
// RTC_DRIFT_SAFE_S. Rejects obviously invalid server timestamps.
void syncRTCFromServerTime(const String& serverTime) {
  if (!g_rtcOk || serverTime.length() < 19) {
    saveSystemEvent("warning", "rtc_sync_rejected", "MAIN", "RTC_SYNC_REJECTED",
              "Server time string too short or RTC unavailable", "{}");
    return;
  }

  int yr = serverTime.substring(0,  4).toInt();
  int mo = serverTime.substring(5,  7).toInt();
  int dy = serverTime.substring(8,  10).toInt();
  int hr = serverTime.substring(11, 13).toInt();
  int mi = serverTime.substring(14, 16).toInt();
  int sc = serverTime.substring(17, 19).toInt();

  if (yr < 2020 || yr > 2099) {
    saveSystemEvent("warning", "rtc_sync_rejected", "MAIN", "RTC_SYNC_REJECTED",
              "Server time year out of valid range 2020-2099", "{}");
    return;
  }

  DateTime serverDt(yr, mo, dy, hr, mi, sc);
  DateTime localDt = rtc.now();
  long drift = (long)serverDt.unixtime() - (long)localDt.unixtime();
  long absDrift = drift < 0 ? -drift : drift;

  char detBuf[64];
  snprintf(detBuf, sizeof(detBuf), "{\"drift_s\":%ld}", drift);

  if (absDrift > (long)RTC_DRIFT_SAFE_S) {
    saveSystemEvent("info", "rtc_drift_detected", "MAIN", "",
              "RTC drift exceeds threshold — applying correction", detBuf);
    rtc.adjust(serverDt);
    stage = STAGE_RTC_UPDATED;
    saveSystemEvent("info", "rtc_sync_applied", "MAIN", "",
              "RTC corrected from server_time", detBuf);
    DBGF("[RTC] Drift %ld s — corrected to server time", drift);
  } else {
    DBGF("[RTC] Drift %ld s — within tolerance, no correction", drift);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// RECORD / EVENT ID BUILDERS
// ═════════════════════════════════════════════════════════════════════════════

String buildWeatherRecordId(uint32_t seq) {
  char buf[32];
  snprintf(buf, sizeof(buf), "%s-N3-%08lu", GATEWAY_ID, (unsigned long)seq);
  return String(buf);
}

String buildSoilRecordId(uint32_t seq) {
  char buf[32];
  snprintf(buf, sizeof(buf), "%s-N2-%08lu", GATEWAY_ID, (unsigned long)seq);
  return String(buf);
}

String buildMissingRecordId(const String& nodeId, uint32_t frameId) {
  char buf[48];
  snprintf(buf, sizeof(buf), "%s-%s-MISSING-%lu",
           GATEWAY_ID, nodeId.c_str(), (unsigned long)frameId);
  return String(buf);
}

String buildMainSoilRecordId() {
  char buf[48];
  snprintf(buf, sizeof(buf), "%s-MAIN-SOIL-%lu", GATEWAY_ID, (unsigned long)g_frameId);
  return String(buf);
}

String buildEventId(const String& ts) {
  // EVT-GW01-YYYYMMDD-HHMMSS-NNN
  // ts format: "2026-04-25T10:30:00Z"
  char buf[48];
  eventCount++;
  String date = "", time = "";
  if (ts.length() >= 19) {
    // Extract YYYYMMDD from ts
    date = ts.substring(0,4) + ts.substring(5,7) + ts.substring(8,10);
    time = ts.substring(11,13) + ts.substring(14,16) + ts.substring(17,19);
  } else {
    date = "00000000"; time = "000000";
  }
  snprintf(buf, sizeof(buf), "EVT-%s-%s-%s-%03lu",
           GATEWAY_ID, date.c_str(), time.c_str(), (unsigned long)(eventCount % 1000));
  return String(buf);
}

// ═════════════════════════════════════════════════════════════════════════════
// SD HELPERS
// ═════════════════════════════════════════════════════════════════════════════

bool ensureDir(const String& path) {
  if (!g_sdOk) return false;
  if (SD.exists(path.c_str())) return true;

  // SD.mkdir() does not create parent directories — build each level in sequence.
  int len = path.length();
  for (int i = 1; i <= len; i++) {
    if (i == len || path[i] == '/') {
      String sub = path.substring(0, i);
      if (sub.length() <= 1) continue;   // skip bare "/"
      if (!SD.exists(sub.c_str())) {
        if (!SD.mkdir(sub.c_str())) {
          DBGF("[SD] mkdir failed: %s", sub.c_str());
          return false;
        }
      }
    }
  }
  return true;
}

String getDataDir(const DateTime& dt) {
  char buf[32];
  snprintf(buf, sizeof(buf), "/DATA/%04d/%02d", dt.year(), dt.month());
  return String(buf);
}

String getReadingsPath(const DateTime& dt) {
  char buf[48];
  snprintf(buf, sizeof(buf), "/DATA/%04d/%02d/%04d-%02d-%02d_readings.csv",
           dt.year(), dt.month(), dt.year(), dt.month(), dt.day());
  return String(buf);
}

String getEventsPath(const DateTime& dt) {
  char buf[48];
  snprintf(buf, sizeof(buf), "/DATA/%04d/%02d/%04d-%02d-%02d_events.csv",
           dt.year(), dt.month(), dt.year(), dt.month(), dt.day());
  return String(buf);
}

String getQueuePath(const DateTime& dt) {
  char buf[52];
  snprintf(buf, sizeof(buf), "/DATA/%04d/%02d/%04d-%02d-%02d_upload_queue.jsonl",
           dt.year(), dt.month(), dt.year(), dt.month(), dt.day());
  return String(buf);
}

// Append one CSV row; writes header if file is new.
bool writeCSVRow(const String& path, const String& header, const String& row) {
  if (!g_sdOk) return false;

  for (int attempt = 0; attempt < SD_RETRY_COUNT; attempt++) {
    bool isNew = !SD.exists(path.c_str());

    File f = SD.open(path.c_str(), FILE_APPEND);
    if (!f) {
      DBGF("[SD] Cannot open %s (attempt %d)", path.c_str(), attempt + 1);
      delay(20);
      continue;
    }
    if (isNew) f.println(header);
    f.println(row);
    f.flush();
    f.close();
    stage = STAGE_RECORD_SAVED;
    return true;
  }

  DBGF("[SD] Write failed after %d retries: %s", SD_RETRY_COUNT, path.c_str());
  return false;
}

// Append one JSONL line (reading or event) to the upload queue.
bool appendJSONL(const String& path, const String& jsonLine) {
  if (!g_sdOk) return false;

  for (int attempt = 0; attempt < SD_RETRY_COUNT; attempt++) {
    File f = SD.open(path.c_str(), FILE_APPEND);
    if (!f) {
      delay(20);
      continue;
    }
    f.println(jsonLine);
    f.flush();
    f.close();
    return true;
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════════════════
// LORA RECEIVE / PARSE / ACK
// ═════════════════════════════════════════════════════════════════════════════

void handleIncomingPacket() {
  String raw = "";
  while (LoRa.available()) raw += (char)LoRa.read();
  int   rssi = LoRa.packetRssi();
  float snr  = LoRa.packetSnr();

#if DEBUG_MODE
  unsigned long rx_elapsed_ms = millis() - g_cycleStartMs;
  DBGF("[Timing] rx_elapsed_ms=%lu", rx_elapsed_ms);
#endif
  DBGF("[LoRa] RX %d B  RSSI=%d  SNR=%.1f", raw.length(), rssi, snr);
  DBGF("[LoRa] raw: %s", raw.c_str());

  if (raw.length() == 0) return;

  // Identify node by nid field — peek before full parse
  bool isN3 = raw.indexOf("\"nid\":\"N3\"") >= 0;
  bool isN2 = raw.indexOf("\"nid\":\"N2\"") >= 0;

  if (isN3) {
    if (parseWeatherPacket(raw, rssi, snr)) {
      // Duplicate detection
      if (g_weather.nodeSeq == g_lastSeqN3 && g_receivedN3) {
        DBGF("[LoRa] Duplicate N3 seq=%lu — ACK only", (unsigned long)g_weather.nodeSeq);
        sendAck("N3", g_weather.nodeSeq);
        return;
      }
      g_lastSeqN3  = g_weather.nodeSeq;
      g_receivedN3 = true;
      g_weather.measuredAt = getTimestamp();
      g_weather.recordId   = buildWeatherRecordId(g_weather.nodeSeq);
      updateNodeReceived(n3Health, "N3", rssi, snr);
      sendAck("N3", g_weather.nodeSeq);
      saveSystemEvent("info", "packet_received", "N3", "",
                "Weather packet received", "{}");
      stage = STAGE_PKT_PARSED;
      DBGF("[LoRa] packet_received N3 seq=%lu status=%s",
           (unsigned long)g_weather.nodeSeq, g_weather.status.c_str());
    } else {
      saveSystemEvent("error", "packet_parse_failed", "N3", "PACKET_PARSE_FAILED",
                "Failed to parse N3 JSON", "{}");
    }
  } else if (isN2) {
    if (parseSoilPacket(raw, rssi, snr)) {
      if (g_soil.nodeSeq == g_lastSeqN2 && g_receivedN2) {
        DBGF("[LoRa] Duplicate N2 seq=%lu — ACK only", (unsigned long)g_soil.nodeSeq);
        sendAck("N2", g_soil.nodeSeq);
        return;
      }
      g_lastSeqN2  = g_soil.nodeSeq;
      g_receivedN2 = true;
      g_soil.measuredAt = getTimestamp();
      g_soil.recordId   = buildSoilRecordId(g_soil.nodeSeq);
      updateNodeReceived(n2Health, "N2", rssi, snr);
      sendAck("N2", g_soil.nodeSeq);
      saveSystemEvent("info", "packet_received", "N2", "",
                "Soil packet received", "{}");
      stage = STAGE_PKT_PARSED;
      DBGF("[LoRa] packet_received N2 seq=%lu status=%s",
           (unsigned long)g_soil.nodeSeq, g_soil.status.c_str());
    } else {
      saveSystemEvent("error", "packet_parse_failed", "N2", "PACKET_PARSE_FAILED",
                "Failed to parse N2 JSON", "{}");
    }
  } else {
    DBG("[LoRa] Unknown packet — ignoring");
    saveSystemEvent("warning", "unknown_packet", "MAIN", "UNKNOWN_NODE",
              "Received packet from unknown node", "{}");
  }
}

bool parseWeatherPacket(const String& raw, int rssi, float snr) {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, raw);
  if (err) {
    DBGF("[Parse] N3 JSON error: %s", err.c_str());
    return false;
  }

  g_weather = WeatherReading();  // reset
  g_weather.nodeId   = doc["nid"]  | "N3";
  g_weather.nodeSeq  = doc["seq"]  | 0UL;
  g_weather.nodeBoot = doc["boot"] | 0UL;
  g_weather.nodeStg  = doc["stg"]  | 0;
  g_weather.status   = doc["status"] | "unknown";
  g_weather.errCode  = doc["err"]    | "";
  g_weather.rssi     = rssi;
  g_weather.snr      = snr;
  g_weather.txFail   = doc["rfail"] | 0;
  g_weather.isError  = (g_weather.status != "ok");

  if (!g_weather.isError) {
    g_weather.temp = doc["temp"] | 0.0f;
    g_weather.hum  = doc["hum"]  | 0.0f;
    g_weather.pres = doc["pres"] | 0.0f;
  }

  g_weather.valid = true;
  return true;
}

bool parseSoilPacket(const String& raw, int rssi, float snr) {
  // Node2 JSON short keys — Pivot 2 soil sensor provides temperature, moisture, EC only.
  // nid="N2", ntype="soil", seq, boot, stg, uptime,
  // temp (soil_temperature_c), mois (soil_moisture_percent),
  // ec (soil_ec_us_cm), batt, status, [err]
  // ph, sal, and NPK keys are ignored if present — sensor does not provide them.
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, raw);
  if (err) {
    DBGF("[Parse] N2 JSON error: %s", err.c_str());
    return false;
  }

  g_soil = SoilReading();  // reset
  g_soil.nodeId   = doc["nid"]  | "N2";
  g_soil.nodeSeq  = doc["seq"]  | 0UL;
  g_soil.nodeBoot = doc["boot"] | 0UL;
  g_soil.nodeStg  = doc["stg"]  | 0;
  g_soil.status   = doc["status"] | "unknown";
  g_soil.errCode  = doc["err"]    | "";
  g_soil.rssi     = rssi;
  g_soil.snr      = snr;
  g_soil.txFail   = doc["rfail"] | 0;
  g_soil.isError  = (g_soil.status != "ok");

  if (!g_soil.isError) {
    g_soil.soilTemp = doc["temp"] | 0.0f;
    g_soil.soilMois = doc["mois"] | 0.0f;
    g_soil.soilEc   = doc["ec"]   | 0.0f;
    // soilPh is never populated — sensor does not provide pH
  }

  g_soil.valid = true;
  return true;
}

void sendAck(const String& nodeId, uint32_t nodeSeq) {
  if (!g_loraOk) return;

#if DEBUG_MODE
  unsigned long ack_start_ms = millis();
#endif

  delay(ACK_TIMEOUT_MS);  // half-duplex guard: ensure node is in RX before we TX

  // Compute ACK sleep hint so node wakes at its designated TDMA slot next cycle.
  // Uses elapsed time within THIS cycle (g_cycleStartMs), not wall-clock modulo,
  // because Main's RX window is not aligned to UTC 10-minute boundaries.
  uint32_t sleepHint;
  const char* sleepSource;
  uint32_t slotOffset  = (nodeId == "N2") ? N2_SLOT_OFFSET_SEC  : N3_SLOT_OFFSET_SEC;
  uint32_t bootToTxSec = (nodeId == "N2") ? N2_BOOT_TO_TX_SEC   : N3_BOOT_TO_TX_SEC;

  if (g_cycleStartMs > 0 && millis() >= g_cycleStartMs) {
    uint32_t rxElapsedSec = (millis() - g_cycleStartMs) / 1000UL;
    int32_t  rawSleepHint = (int32_t)CYCLE_DURATION_SEC
                            - (int32_t)rxElapsedSec
                            + (int32_t)slotOffset
                            - (int32_t)bootToTxSec;
    rawSleepHint = constrain(rawSleepHint, 300, 700);
    sleepHint    = (uint32_t)rawSleepHint;
    sleepSource  = "cycle_based";
  } else {
    // g_cycleStartMs not yet set (first boot) — use safe fixed hints.
    sleepHint   = (nodeId == "N2") ? 590u : 635u;
    sleepSource = "fallback";
  }

  String ts  = getTimestamp();
  String ack = "{\"pt\":\"ack\",\"gid\":\"" GATEWAY_ID "\",\"to\":\"" +
               nodeId + "\",\"seq\":" + String(nodeSeq) +
               ",\"sleep\":" + String(sleepHint) +
               ",\"ts\":\"" + ts + "\"}";

  if (LoRa.beginPacket()) {
    LoRa.print(ack);
    LoRa.endPacket(false);  // blocking TX
#if DEBUG_MODE
    unsigned long ack_end_ms = millis();
#endif
    DBGF("[LoRa] ack_sent → %s seq=%lu sleep=%lu slot_off=%lu boot_tx=%lu sleep_src=%s",
         nodeId.c_str(), (unsigned long)nodeSeq, (unsigned long)sleepHint,
         (unsigned long)slotOffset, (unsigned long)bootToTxSec, sleepSource);
#if DEBUG_MODE
    uint32_t rxElapsedLog = (g_cycleStartMs > 0) ? (millis() - g_cycleStartMs) / 1000UL : 0;
    DBGF("[ACK] rx_elapsed_sec=%lu slot_offset=%lu boot_to_tx_sec=%lu sleep_hint=%lu sleep_src=%s",
         (unsigned long)rxElapsedLog, (unsigned long)slotOffset,
         (unsigned long)bootToTxSec, (unsigned long)sleepHint, sleepSource);
#endif
#if DEBUG_MODE
    DBGF("[Timing] ack_start_ms=%lu ack_end_ms=%lu ack_tx_ms=%lu",
         ack_start_ms, ack_end_ms, ack_end_ms - ack_start_ms);
#endif
  } else {
    DBG("[LoRa] ACK beginPacket() failed");
  }

  // Re-enter RX mode immediately — Main is half-duplex and goes deaf after TX.
  LoRa.receive();
#if DEBUG_MODE
  DBGF("[Timing] return_to_rx_ms=%lu", millis());
#endif
}

// ═════════════════════════════════════════════════════════════════════════════
// RECORD SAVING
// ═════════════════════════════════════════════════════════════════════════════

static const char READINGS_CSV_HEADER[] =
  "record_id,gateway_id,node_id,node_type,node_seq,frame_id,measured_at,"
  "rssi,snr,battery_mv,battery_percent,battery_status,"
  "soil_temperature_c,soil_moisture_percent,soil_ec_us_cm,soil_ph,soil_salinity,"
  "air_temperature_c,air_humidity_percent,air_pressure_hpa,"
  "status,node_boot,node_stage,error_code";

static const char EVENTS_CSV_HEADER[] =
  "event_id,gateway_id,node_id,event_type,severity,event_time,error_code,message";

void saveWeatherReading() {
  if (!g_sdOk || !g_rtcOk) return;
  DateTime now = rtc.now();
  String rPath = getReadingsPath(now);
  String qPath = getQueuePath(now);

  ensureDir(getDataDir(now));

  // Validate ranges — set quality flag if out of range
  bool tempOk = (!g_weather.isError) && (g_weather.temp >= -40.0f && g_weather.temp <= 85.0f);
  bool humOk  = (!g_weather.isError) && (g_weather.hum  >= 0.0f   && g_weather.hum  <= 100.0f);
  bool presOk = (!g_weather.isError) && (g_weather.pres >= 300.0f && g_weather.pres <= 1200.0f);
  bool outOfRange = g_weather.valid && !g_weather.isError && (!tempOk || !humOk || !presOk);

  String csvStatus = g_weather.isError ? "error" :
                     outOfRange        ? "partial" : "ok";

  // ── CSV row ───────────────────────────────────────────────────────────────
  char csvBuf[320];
  if (!g_weather.isError) {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,N3,weather,%lu,%lu,%s,"
      "%d,%.1f,,,not_measured,"
      ",,,,,"
      "%.1f,%.1f,%.1f,"
      "%s,%lu,%u,%s",
      g_weather.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_weather.nodeSeq, (unsigned long)g_frameId,
      g_weather.measuredAt.c_str(),
      g_weather.rssi, g_weather.snr,
      g_weather.temp, g_weather.hum, g_weather.pres,
      csvStatus.c_str(),
      (unsigned long)g_weather.nodeBoot, g_weather.nodeStg,
      g_weather.errCode.c_str());
  } else {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,N3,weather,%lu,%lu,%s,"
      "%d,%.1f,,,not_measured,"
      ",,,,,"
      ",,,"
      "%s,%lu,%u,%s",
      g_weather.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_weather.nodeSeq, (unsigned long)g_frameId,
      g_weather.measuredAt.c_str(),
      g_weather.rssi, g_weather.snr,
      csvStatus.c_str(),
      (unsigned long)g_weather.nodeBoot, g_weather.nodeStg,
      g_weather.errCode.c_str());
  }
  writeCSVRow(rPath, READINGS_CSV_HEADER, String(csvBuf));

  // ── JSONL upload queue ────────────────────────────────────────────────────
  JsonDocument jdoc;
  jdoc["type"]       = "reading";
  jdoc["record_id"]  = g_weather.recordId;
  jdoc["gateway_id"] = GATEWAY_ID;
  jdoc["node_id"]    = "N3";
  jdoc["node_type"]  = "weather";
  jdoc["node_seq"]   = g_weather.nodeSeq;
  jdoc["frame_id"]   = g_frameId;
  jdoc["measured_at"]= g_weather.measuredAt;
  jdoc["rssi"]       = g_weather.rssi;
  jdoc["snr"]        = g_weather.snr;
  jdoc["battery_mv"].set(nullptr);
  jdoc["battery_percent"].set(nullptr);
  jdoc["battery_status"]  = "not_measured";
  if (!g_weather.isError) {
    jdoc["air_temperature_c"]   = g_weather.temp;
    jdoc["air_humidity_percent"]= g_weather.hum;
    jdoc["air_pressure_hpa"]    = g_weather.pres;
  }
  jdoc["status"] = csvStatus;
  if (g_weather.errCode.length() > 0) jdoc["error_code"] = g_weather.errCode;

  String jsonLine;
  serializeJson(jdoc, jsonLine);
  appendJSONL(qPath, jsonLine);
  g_frameQueueReadings++;

  DBGF("[SD] Weather reading saved → %s", rPath.c_str());
}

void saveSoilReading() {
  if (!g_sdOk || !g_rtcOk) return;
  DateTime now = rtc.now();
  String rPath = getReadingsPath(now);
  String qPath = getQueuePath(now);

  ensureDir(getDataDir(now));

  // Validate ranges — temperature, moisture, EC only (sensor has no pH or salinity)
  bool tempOk = (!g_soil.isError) && (g_soil.soilTemp >= -20.0f && g_soil.soilTemp <= 80.0f);
  bool moisOk = (!g_soil.isError) && (g_soil.soilMois >= 0.0f   && g_soil.soilMois <= 100.0f);
  bool ecOk   = (!g_soil.isError) && (g_soil.soilEc   >= 0.0f   && g_soil.soilEc   <= 20000.0f);
  bool outOfRange = g_soil.valid && !g_soil.isError && (!tempOk || !moisOk || !ecOk);

  String csvStatus = g_soil.isError ? "error" :
                     outOfRange     ? "partial" : "ok";

  // ── CSV row ───────────────────────────────────────────────────────────────
  char csvBuf[320];
  if (!g_soil.isError) {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,N2,soil,%lu,%lu,%s,"
      "%d,%.1f,,,not_measured,"
      "%.1f,%.1f,%.1f,,,"
      ",,,"
      "%s,%lu,%u,%s",
      g_soil.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_soil.nodeSeq, (unsigned long)g_frameId,
      g_soil.measuredAt.c_str(),
      g_soil.rssi, g_soil.snr,
      g_soil.soilTemp, g_soil.soilMois, g_soil.soilEc,
      csvStatus.c_str(),
      (unsigned long)g_soil.nodeBoot, g_soil.nodeStg,
      g_soil.errCode.c_str());
  } else {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,N2,soil,%lu,%lu,%s,"
      "%d,%.1f,,,not_measured,"
      ",,,,,"
      ",,,"
      "%s,%lu,%u,%s",
      g_soil.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_soil.nodeSeq, (unsigned long)g_frameId,
      g_soil.measuredAt.c_str(),
      g_soil.rssi, g_soil.snr,
      csvStatus.c_str(),
      (unsigned long)g_soil.nodeBoot, g_soil.nodeStg,
      g_soil.errCode.c_str());
  }
  writeCSVRow(rPath, READINGS_CSV_HEADER, String(csvBuf));

  // ── JSONL upload queue ────────────────────────────────────────────────────
  JsonDocument jdoc;
  jdoc["type"]       = "reading";
  jdoc["record_id"]  = g_soil.recordId;
  jdoc["gateway_id"] = GATEWAY_ID;
  jdoc["node_id"]    = "N2";
  jdoc["node_type"]  = "soil";
  jdoc["node_seq"]   = g_soil.nodeSeq;
  jdoc["frame_id"]   = g_frameId;
  jdoc["measured_at"]= g_soil.measuredAt;
  jdoc["rssi"]       = g_soil.rssi;
  jdoc["snr"]        = g_soil.snr;
  jdoc["battery_mv"].set(nullptr);
  jdoc["battery_percent"].set(nullptr);
  jdoc["battery_status"]  = "not_measured";
  if (!g_soil.isError) {
    jdoc["soil_temperature_c"]   = g_soil.soilTemp;
    jdoc["soil_moisture_percent"]= g_soil.soilMois;
    jdoc["soil_ec_us_cm"]        = g_soil.soilEc;
    // soil_ph and soil_salinity are not written — sensor does not provide them
  }
  jdoc["status"] = csvStatus;
  if (g_soil.errCode.length() > 0) jdoc["error_code"] = g_soil.errCode;

  String jsonLine;
  serializeJson(jdoc, jsonLine);
  appendJSONL(qPath, jsonLine);
  g_frameQueueReadings++;

  DBGF("[SD] Soil reading saved → %s", rPath.c_str());
}

void saveMissingReading(const String& nodeId, const String& nodeType) {
  if (!g_sdOk || !g_rtcOk) return;
  DateTime now  = rtc.now();
  String rPath  = getReadingsPath(now);
  String qPath  = getQueuePath(now);
  String ts     = getTimestamp();
  String recId  = buildMissingRecordId(nodeId, g_frameId);

  ensureDir(getDataDir(now));

  char csvBuf[256];
  snprintf(csvBuf, sizeof(csvBuf),
    "%s,%s,%s,%s,,%lu,%s,"
    ",,,,,,,,,,,,,"
    "missing,,,NODE_TIMEOUT",
    recId.c_str(), GATEWAY_ID, nodeId.c_str(), nodeType.c_str(),
    (unsigned long)g_frameId, ts.c_str());
  writeCSVRow(rPath, READINGS_CSV_HEADER, String(csvBuf));

  // JSONL — missing reading entry (type="reading") so WebService inserts into sensor_readings
  {
    JsonDocument jdoc;
    jdoc["type"]        = "reading";
    jdoc["record_id"]   = recId;
    jdoc["gateway_id"]  = GATEWAY_ID;
    jdoc["node_id"]     = nodeId;
    jdoc["node_type"]   = nodeType;
    jdoc["frame_id"]    = g_frameId;
    jdoc["measured_at"] = ts;
    jdoc["status"]      = "missing";
    jdoc["error_code"]  = "NODE_TIMEOUT";
    String jsonLine;
    serializeJson(jdoc, jsonLine);
    appendJSONL(qPath, jsonLine);
    g_frameQueueReadings++;
  }

  // Separate system event for the node_missing occurrence
  char detBuf[80];
  snprintf(detBuf, sizeof(detBuf),
           "{\"frame_id\":%lu,\"expected_slot\":\"%s\"}",
           (unsigned long)g_frameId, nodeType.c_str());
  saveSystemEvent("warning", "node_missing", nodeId, "NODE_TIMEOUT",
                  "Node did not transmit during expected window", detBuf);

  DBGF("[SD] Missing reading logged for %s", nodeId.c_str());
}

void saveMainSoilReading(const SoilReading& r) {
  if (!g_sdOk || !g_rtcOk) return;
  DateTime now = rtc.now();
  String rPath = getReadingsPath(now);
  String qPath = getQueuePath(now);

  ensureDir(getDataDir(now));

  char csvBuf[320];
  if (r.status == "ok") {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,MAIN,soil,,%lu,%s,"
      ",,,,not_measured,"
      "%.1f,%.1f,%.1f,,,"
      ",,,"
      "%s,,,%s",
      r.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_frameId, r.measuredAt.c_str(),
      r.soilTemp, r.soilMois, r.soilEc,
      r.status.c_str(), r.errCode.c_str());
  } else {
    snprintf(csvBuf, sizeof(csvBuf),
      "%s,%s,MAIN,soil,,%lu,%s,"
      ",,,,not_measured,"
      ",,,,,"
      ",,,"
      "%s,,,%s",
      r.recordId.c_str(), GATEWAY_ID,
      (unsigned long)g_frameId, r.measuredAt.c_str(),
      r.status.c_str(), r.errCode.c_str());
  }
  writeCSVRow(rPath, READINGS_CSV_HEADER, String(csvBuf));

  JsonDocument jdoc;
  jdoc["type"]        = "reading";
  jdoc["record_id"]   = r.recordId;
  jdoc["gateway_id"]  = GATEWAY_ID;
  jdoc["node_id"]     = "MAIN";
  jdoc["node_type"]   = "soil";
  jdoc["frame_id"]    = g_frameId;
  jdoc["measured_at"] = r.measuredAt;
  jdoc["battery_status"] = "not_measured";
  if (r.status == "ok") {
    jdoc["soil_temperature_c"]    = r.soilTemp;
    jdoc["soil_moisture_percent"] = r.soilMois;
    jdoc["soil_ec_us_cm"]         = r.soilEc;
  }
  jdoc["status"] = r.status;
  if (r.errCode.length() > 0) jdoc["error_code"] = r.errCode;

  String jsonLine;
  serializeJson(jdoc, jsonLine);
  appendJSONL(qPath, jsonLine);
  g_frameQueueReadings++;

  g_mainSoilSaved = true;
  DBGF("[SD] MAIN soil reading saved → %s", rPath.c_str());
}

void saveSystemEvent(const String& level, const String& eventType,
               const String& nodeId, const String& errCode,
               const String& msg, const String& details) {
  if (!g_sdOk) return;
  if (!g_rtcOk && level == "info") return;  // skip info events if no RTC

  DateTime now = g_rtcOk ? rtc.now() : DateTime(2000, 1, 1, 0, 0, 0);
  String ts    = getTimestamp();
  String evId  = buildEventId(ts);
  String ePath = getEventsPath(now);
  String qPath = getQueuePath(now);

  ensureDir(getDataDir(now));

  // ── Events CSV row ────────────────────────────────────────────────────────
  char csvBuf[256];
  snprintf(csvBuf, sizeof(csvBuf),
    "%s,%s,%s,%s,%s,%s,%s,%s",
    evId.c_str(), GATEWAY_ID, nodeId.c_str(), eventType.c_str(),
    level.c_str(), ts.c_str(), errCode.c_str(), msg.c_str());
  writeCSVRow(ePath, EVENTS_CSV_HEADER, String(csvBuf));

  // ── JSONL upload queue ────────────────────────────────────────────────────
  JsonDocument jdoc;
  jdoc["type"]       = "event";
  jdoc["event_id"]   = evId;
  jdoc["event_type"] = eventType;
  jdoc["severity"]   = level;
  jdoc["event_time"] = ts;
  if (nodeId.length()  > 0) jdoc["node_id"]    = nodeId;
  if (errCode.length() > 0) jdoc["error_code"]  = errCode;
  if (msg.length()     > 0) jdoc["message"]     = msg;
  // details is a pre-serialized JSON string — embed as raw
  jdoc["details"] = details;

  stage = STAGE_EVENT_SAVED;

  // During upload the queue file is being read; skip JSONL to prevent queue growth
  // while it is being consumed. Events.csv is always written (full audit trail).
  if (!g_uploadInProgress) {
    String jsonLine;
    serializeJson(jdoc, jsonLine);
    appendJSONL(qPath, jsonLine);
    g_frameQueueEvents++;
  }
}

bool isCycleComplete() {
  uint32_t elapsed = millis() - g_cycleStartMs;
  bool bothDone = g_receivedN2 && g_receivedN3;
  bool windowExpired = elapsed >= getMainRxWindowMs();
  return bothDone || windowExpired;
}

uint32_t getMainRxWindowMs() {
  // After an upload Main may wake misaligned with nodes; always use recovery window.
  if (g_forceRecoveryWindowNextBoot) return RECOVERY_RX_WINDOW_MS;
  bool recoveryActive =
      (n2Health.recoveryWatch && n2Health.missedCount <= RECOVERY_MAX_CYCLES) ||
      (n3Health.recoveryWatch && n3Health.missedCount <= RECOVERY_MAX_CYCLES);
  return recoveryActive ? RECOVERY_RX_WINDOW_MS : CYCLE_WINDOW_MS;
}

void updateNodeReceived(NodeHealth &h, const char* nodeId, int rssi, float snr) {
  bool wasRecovering = h.recoveryWatch && h.missedCount > 0;
  bool wasDead = h.markedDead;

  if (wasDead) {
    char det[128];
    snprintf(det, sizeof(det),
             "{\"downtime_cycles\":%u,\"last_seen_frame\":%lu,\"last_rssi\":%d,\"last_snr\":%.1f}",
             (unsigned)h.missedCount, (unsigned long)h.lastSeenFrame, rssi, snr);
    saveSystemEvent("info", "node_back_online", nodeId, "",
              "Node returned after being marked dead", det);
  } else if (wasRecovering) {
    char det[128];
    snprintf(det, sizeof(det),
             "{\"recovery_attempts\":%u,\"last_seen_frame\":%lu,\"last_rssi\":%d,\"last_snr\":%.1f}",
             (unsigned)h.missedCount, (unsigned long)h.lastSeenFrame, rssi, snr);
    saveSystemEvent("info", "recovery_success", nodeId, "",
              "Node recovered after missed cycles", det);
  }

  h.missedCount   = 0;
  h.recoveryWatch = false;
  h.markedDead    = false;
  h.lastSeenFrame = g_frameId;
}

void updateNodeMissed(NodeHealth &h, const char* nodeId) {
  h.missedCount++;

  if (!h.recoveryWatch) {
    h.recoveryWatch = true;
    char det[96];
    snprintf(det, sizeof(det),
             "{\"missed_cycles\":1,\"last_seen_frame\":%lu}",
             (unsigned long)h.lastSeenFrame);
    saveSystemEvent("warning", "recovery_started", nodeId, "",
              "Node missed cycle — starting recovery watch", det);
  }

  if (h.missedCount >= NODE_DEAD_THRESHOLD && !h.markedDead) {
    h.markedDead = true;
    char det[128];
    snprintf(det, sizeof(det),
             "{\"missed_cycles\":%u,\"last_seen_frame\":%lu,\"final_status\":\"dead\"}",
             (unsigned)h.missedCount, (unsigned long)h.lastSeenFrame);
    saveSystemEvent("error", "node_marked_dead", nodeId, "NODE_DEAD",
              "Node exceeded dead threshold", det);
    saveSystemEvent("error", "recovery_failed", nodeId, "RECOVERY_FAILED",
              "Recovery failed — node presumed offline", det);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BUTTON GESTURE DETECTION
// ═════════════════════════════════════════════════════════════════════════════

// Blocking classifier used at EXT0 wake and cold boot.
// Returns GESTURE_LONG_PRESS, GESTURE_FOUR_CLICK, or GESTURE_NONE.
// Mutual exclusion: first press is timed — if it reaches BTN_HOLD_MS the
// function returns long-press immediately (button still held). If it releases
// before BTN_HOLD_MS it becomes click #1 of the 4-click sequence. A press
// that exceeds BTN_CLICK_MAX_MS during the 4-click sequence aborts and returns
// GESTURE_NONE (logs false_button_wake).
GestureType detectGestureOnWake() {
  delay(BTN_DEBOUNCE_MS);
  if (digitalRead(BTN_PIN) != BTN_PRESSED) return GESTURE_NONE;

  // Time first press — determines which gesture path to take
  uint32_t t0 = millis();
  while (digitalRead(BTN_PIN) == BTN_PRESSED) {
    if ((millis() - t0) >= (uint32_t)BTN_HOLD_MS) {
      saveSystemEvent("info", "gesture_detected", "MAIN", "",
                "Long-press on wake — upload trigger", "{}");
      return GESTURE_LONG_PRESS;  // button still held; caller does not need release
    }
    yield();
  }

  // First press was short — treat as click #1 and attempt 4-click sequence
  int      clicks   = 1;
  uint32_t seqStart = millis();

  while (clicks < 4) {
    // Wait for next press within timeout window
    bool gotPress = false;
    while ((millis() - seqStart) < (uint32_t)GESTURE_4CLICK_TIMEOUT_MS) {
      if (digitalRead(BTN_PIN) == BTN_PRESSED) {
        delay(BTN_DEBOUNCE_MS);
        if (digitalRead(BTN_PIN) == BTN_PRESSED) { gotPress = true; break; }
      }
      yield();
    }
    if (!gotPress) break;  // timeout — not enough clicks

    // Time this press — must be short (< BTN_CLICK_MAX_MS)
    uint32_t ck = millis();
    while (digitalRead(BTN_PIN) == BTN_PRESSED) {
      if ((millis() - ck) >= (uint32_t)BTN_CLICK_MAX_MS) {
        // Press too long — wait for release then abort
        while (digitalRead(BTN_PIN) == BTN_PRESSED) yield();
        saveSystemEvent("warning", "false_button_wake", "MAIN", "",
                  "4-click aborted: press held too long", "{}");
        return GESTURE_NONE;
      }
      yield();
    }
    clicks++;
  }

  if (clicks >= 4) {
    saveSystemEvent("info", "gesture_detected", "MAIN", "",
              "4-click gesture — RTC correction", "{}");
    return GESTURE_FOUR_CLICK;
  }

  char msg[56];
  snprintf(msg, sizeof(msg), "4-click timeout: only %d of 4 clicks received", clicks);
  saveSystemEvent("warning", "false_button_wake", "MAIN", "", msg, "{}");
  return GESTURE_NONE;
}

// Non-blocking latch used inside loop() during an active receive cycle.
// Sets g_uploadPendingInCycle after a sustained hold of BTN_HOLD_MS.
// Does NOT call LoRa.idle() — upload is deferred to cycle end.
void checkUploadLatch() {
  static uint32_t s_latchPressStart  = 0;
  static bool     s_latchPressActive = false;

  bool pressed = (digitalRead(BTN_PIN) == BTN_PRESSED);

  if (pressed && !s_latchPressActive) {
    delay(BTN_DEBOUNCE_MS);  // 50 ms blocking — acceptable within 70 s window
    if (digitalRead(BTN_PIN) == BTN_PRESSED) {
      s_latchPressActive = true;
      s_latchPressStart  = millis();
    }
  } else if (!pressed) {
    s_latchPressActive = false;
  }

  if (s_latchPressActive &&
      (millis() - s_latchPressStart) >= (uint32_t)BTN_HOLD_MS) {
    g_uploadPendingInCycle = true;
    g_uploadHandled        = true;
    s_latchPressActive     = false;
    saveSystemEvent("info", "gesture_detected", "MAIN", "",
              "Long-press in active cycle — upload latched for cycle end", "{}");
    DBGF("[MainNode] Upload latched for cycle end");
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD MODE
// ═════════════════════════════════════════════════════════════════════════════

bool connectWiFi() {
  DBG("[WiFi] Connecting...");
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > WIFI_CONNECT_TIMEOUT_MS) {
      DBG("[WiFi] Connection timeout");
      return false;
    }
    delay(250);
    yield();
  }
  DBGF("[WiFi] Connected  IP=%s", WiFi.localIP().toString().c_str());
  return true;
}

void disconnectWiFi() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  DBG("[WiFi] Disconnected and disabled");
}

// Read the JSONL queue file and POST to WebService.
// Returns true on HTTP 200, sets serverTime and inserted count.
// attempt is 1-based; used only for logging.
// Thin shim — kept for callers that pass an attempt number.
// Internally delegates to runBatchedUpload; attempt is used only for log context.
bool uploadJSONLFile(const String& path, String& serverTime, int& inserted, int attempt) {
  DBGF("[Upload] Attempt %d/%d — %s", attempt, UPLOAD_MAX_RETRIES, path.c_str());
  return runBatchedUpload(path, serverTime, inserted);
}

// Reads the JSONL queue in batches of MAX_BATCH_READINGS / MAX_BATCH_EVENTS,
// POSTing each batch. Lines that could not be uploaded are preserved in the
// queue via a .tmp swap so the next upload can retry them.
bool runBatchedUpload(const String& qPath, String& serverTime, int& totalInserted) {
  if (!SD.exists(qPath.c_str())) {
    DBGF("[Upload] Queue file not found: %s", qPath.c_str());
    return false;
  }

  // ── .tmp path (robust: find last dot) ────────────────────────────────────
  int    dot     = qPath.lastIndexOf('.');
  String tmpPath = (dot >= 0) ? qPath.substring(0, dot) + ".tmp" : qPath + ".tmp";

  // ── Build upload_id from current timestamp ────────────────────────────────
  String ts       = getTimestamp();
  String uploadId = "UPL-" GATEWAY_ID "-";
  if (ts.length() >= 19) {
    uploadId += ts.substring(0,4) + ts.substring(5,7) + ts.substring(8,10);
    uploadId += "-";
    uploadId += ts.substring(11,13) + ts.substring(14,16) + ts.substring(17,19);
  } else {
    uploadId += "00000000-000000";
  }

  totalInserted = 0;

  // Remove any stale .tmp from a previous aborted run
  if (SD.exists(tmpPath.c_str())) SD.remove(tmpPath.c_str());

  File src = SD.open(qPath.c_str(), FILE_READ);
  if (!src) {
    DBGF("[Upload] Cannot open %s", qPath.c_str());
    return false;
  }
  File tmp = SD.open(tmpPath.c_str(), FILE_WRITE);
  if (!tmp) {
    src.close();
    DBG("[Upload] Cannot create .tmp file");
    return false;
  }

  bool   anyFailed = false;
  String carryLine = "";   // valid-type line that overflowed its bucket; reprocessed first next batch

  // ── Batch loop ────────────────────────────────────────────────────────────
  while ((src.available() || carryLine.length() >= 5) && !anyFailed) {
    // Accumulate one batch
    String readingsBuf = "";
    String eventsBuf   = "";
    // Store raw lines so we can re-write them to .tmp if the POST fails
    String batchLines[MAX_BATCH_READINGS + MAX_BATCH_EVENTS];
    int    nBatchLines = 0;
    int    nReadings   = 0;
    int    nEvents     = 0;

    while (src.available() || carryLine.length() >= 5) {
      String line;
      if (carryLine.length() >= 5) {
        line = carryLine;
        carryLine = "";
      } else {
        line = src.readStringUntil('\n');
        line.trim();
        if (line.length() < 5) continue;
      }

      bool isReading = line.indexOf("\"type\":\"reading\"") >= 0;
      bool isEvent   = line.indexOf("\"type\":\"event\"")   >= 0;
      bool rdgFull   = (nReadings >= MAX_BATCH_READINGS);
      bool evtFull   = (nEvents   >= MAX_BATCH_EVENTS);

      if (isReading && !rdgFull) {
        if (nReadings > 0) readingsBuf += ",";
        readingsBuf += line;
        batchLines[nBatchLines++] = line;
        nReadings++;
      } else if (isEvent && !evtFull) {
        if (nEvents > 0) eventsBuf += ",";
        eventsBuf += line;
        batchLines[nBatchLines++] = line;
        nEvents++;
      } else if (isReading || isEvent) {
        carryLine = line;  // valid type, bucket full — carry to next batch, never .tmp
        break;
      } else {
        tmp.println(line);  // invalid/unsupported — discard to .tmp immediately
      }

      if ((readingsBuf.length() + eventsBuf.length()) >= MAX_BATCH_PAYLOAD_BYTES) {
        break;
      }
    }

    if (nBatchLines == 0) break;

    // ── Build payload ─────────────────────────────────────────────────────
    String payload = "{\"upload_id\":\"" + uploadId + "\",";
    payload += "\"gateway\":{\"gateway_id\":\"" GATEWAY_ID "\","
               "\"firmware_version\":\"" FIRMWARE_VERSION "\"},";
    payload += "\"upload\":{\"started_at\":\"" + ts + "\","
               "\"source\":\"esp32\"},";
    payload += "\"readings\":[" + readingsBuf + "],";
    payload += "\"events\":["   + eventsBuf   + "]}";

    DBGF("[Upload] Batch: %d readings, %d events, %d bytes",
         nReadings, nEvents, (int)payload.length());

    // ── HTTP POST ──────────────────────────────────────────────────────────
    HTTPClient http;
    http.begin(WEBSERVICE_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);
    http.setTimeout(UPLOAD_HTTP_TIMEOUT_MS);

    int httpCode = http.POST(payload);
    DBGF("[Upload] Batch HTTP %d", httpCode);

    if (httpCode == 200) {
      String response = http.getString();
      http.end();

      JsonDocument resp;
      if (deserializeJson(resp, response) == DeserializationError::Ok) {
        bool ok = resp["ok"] | false;
        if (ok) {
          String st = resp["server_time"] | "";
          if (st.length() >= 19 && serverTime.length() == 0) serverTime = st;
          totalInserted += (int)(resp["inserted_records"] | 0);
          DBGF("[Upload] Batch accepted, total_inserted=%d", totalInserted);
        } else {
          // Server returned ok=false — treat as failure; re-queue this batch
          DBGF("[Upload] Batch rejected by server (ok=false)");
          for (int i = 0; i < nBatchLines; i++) tmp.println(batchLines[i]);
          anyFailed = true;
        }
      } else {
        DBG("[Upload] Batch response parse failed");
        for (int i = 0; i < nBatchLines; i++) tmp.println(batchLines[i]);
        anyFailed = true;
      }
    } else {
      String errBody = http.getString();
      DBGF("[Upload] Batch HTTP error %d: %s", httpCode, errBody.c_str());
      http.end();
      for (int i = 0; i < nBatchLines; i++) tmp.println(batchLines[i]);
      anyFailed = true;
    }
  }  // while src.available() && !anyFailed

  // Flush any remaining source lines into .tmp when a batch failed mid-way
  if (anyFailed) {
    if (carryLine.length() >= 5) tmp.println(carryLine);  // carry-over line not yet uploaded
    while (src.available()) {
      String line = src.readStringUntil('\n');
      line.trim();
      if (line.length() >= 5) tmp.println(line);
    }
  }

  src.close();
  tmp.flush();
  tmp.close();

  // ── Atomic queue swap: .tmp replaces original ─────────────────────────────
  SD.remove(qPath.c_str());
  SD.rename(tmpPath.c_str(), qPath.c_str());

  DBGF("[Upload] Batch run done — total_inserted=%d anyFailed=%d",
       totalInserted, anyFailed ? 1 : 0);
  return !anyFailed;
}

void saveUploadState(const String& uploadId, bool success,
                     const String& serverTime, int inserted,
                     const String& reason) {
  if (!g_sdOk) return;

  String ts = getTimestamp();

  JsonDocument doc;
  doc["gateway_id"]            = GATEWAY_ID;
  doc["last_upload_id"]        = uploadId;
  doc["last_upload_time_utc"]  = ts;
  doc["last_upload_status"]    = success ? "SUCCESS" : "FAILED";
  doc["last_accepted_records"] = inserted;
  if (reason.length() > 0) {
    doc["last_failed_reason"] = reason;
  } else {
    doc["last_failed_reason"].set(nullptr);
  }
  if (serverTime.length() > 0) {
    doc["rtc_last_sync_utc"] = serverTime;
  } else {
    doc["rtc_last_sync_utc"].set(nullptr);
  }

  // Overwrite the file
  SD.remove(SD_UPLOAD_STATE);
  File f = SD.open(SD_UPLOAD_STATE, FILE_WRITE);
  if (f) {
    serializeJsonPretty(doc, f);
    f.flush();
    f.close();
    DBG("[SD] upload_state.json saved");
  }
}

void markFileUploaded(const String& path) {
  if (!g_sdOk) return;
  File f = SD.open(SD_ARCHIVE_LOG, FILE_APPEND);
  if (f) {
    f.println(path + "," + getTimestamp());
    f.flush();
    f.close();
  }
}

bool isFileAlreadyUploaded(const String& path) {
  if (!g_sdOk) return false;
  File f = SD.open(SD_ARCHIVE_LOG, FILE_READ);
  if (!f) return false;
  bool found = false;
  while (f.available()) {
    String line = f.readStringUntil('\n');
    if (line.indexOf(path) >= 0) { found = true; break; }
  }
  f.close();
  return found;
}

// POST an empty payload to harvest server_time for RTC correction only.
// Does not touch the JSONL queue.
void runRTCCorrectionMode() {
  stage = STAGE_WIFI_UPLOAD;
  DBG("[RTC] Starting RTC correction mode");

  if (!connectWiFi()) {
    saveSystemEvent("error", "upload_failed", "MAIN", "UPLOAD_WIFI_TIMEOUT",
              "WiFi failed during RTC correction", "{}");
    disconnectWiFi();
    return;
  }

  // Minimal valid payload — empty arrays pass server validation
  String payload = "{\"gateway\":{\"gateway_id\":\"" GATEWAY_ID "\","
                   "\"firmware_version\":\"" FIRMWARE_VERSION "\"},"
                   "\"readings\":[],\"events\":[]}";

  HTTPClient http;
  http.begin(WEBSERVICE_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  http.setTimeout(UPLOAD_HTTP_TIMEOUT_MS);

  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    String response = http.getString();
    http.end();
    JsonDocument resp;
    if (deserializeJson(resp, response) == DeserializationError::Ok) {
      String serverTime = resp["server_time"] | "";
      if (serverTime.length() >= 19) {
        syncRTCFromServerTime(serverTime);
      } else {
        saveSystemEvent("warning", "rtc_sync_rejected", "MAIN", "RTC_SYNC_REJECTED",
                  "server_time absent in RTC correction response", "{}");
      }
    }
  } else {
    DBGF("[RTC] Correction POST failed — HTTP %d", httpCode);
    http.end();
  }

  disconnectWiFi();
}

// Walk /DATA/YYYY/MM/ on SD and collect *_upload_queue.jsonl paths, sorted oldest-first.
// Returns number of paths written into paths[][]. paths is a caller-supplied 2-D array.
// Does not recurse deeper than /DATA/YYYY/MM — year and month dirs only.
int scanPendingQueues(char paths[][QUEUE_PATH_MAXLEN], int maxPaths) {
  int count = 0;
  if (!g_sdOk || maxPaths <= 0) return 0;

  File dataDir = SD.open("/DATA");
  if (!dataDir || !dataDir.isDirectory()) {
    if (dataDir) dataDir.close();
    return 0;
  }

  while (count < maxPaths) {
    File yearEntry = dataDir.openNextFile();
    if (!yearEntry) break;
    if (!yearEntry.isDirectory()) { yearEntry.close(); continue; }

    // name() on ESP32 SD returns full path; extract leaf with strrchr for safety
    const char* yn = strrchr(yearEntry.name(), '/');
    yn = yn ? yn + 1 : yearEntry.name();
    char yearPath[16];
    snprintf(yearPath, sizeof(yearPath), "/DATA/%s", yn);

    while (count < maxPaths) {
      File monthEntry = yearEntry.openNextFile();
      if (!monthEntry) break;
      if (!monthEntry.isDirectory()) { monthEntry.close(); continue; }

      const char* mn = strrchr(monthEntry.name(), '/');
      mn = mn ? mn + 1 : monthEntry.name();
      char monthPath[24];
      snprintf(monthPath, sizeof(monthPath), "%s/%s", yearPath, mn);

      while (count < maxPaths) {
        File fileEntry = monthEntry.openNextFile();
        if (!fileEntry) break;
        if (fileEntry.isDirectory()) { fileEntry.close(); continue; }

        const char* fn = strrchr(fileEntry.name(), '/');
        fn = fn ? fn + 1 : fileEntry.name();
        int fnLen = (int)strlen(fn);
        // Match suffix "_upload_queue.jsonl" (19 chars)
        if (fnLen > 19 && strcmp(fn + fnLen - 19, "_upload_queue.jsonl") == 0) {
          snprintf(paths[count], QUEUE_PATH_MAXLEN, "%s/%s", monthPath, fn);
          count++;
        }
        fileEntry.close();
      }
      monthEntry.close();
    }
    yearEntry.close();
  }
  dataDir.close();

  // Bubble sort — lexicographic order is naturally oldest-first for YYYY-MM-DD filenames
  for (int i = 0; i < count - 1; i++) {
    for (int j = 0; j < count - 1 - i; j++) {
      if (strcmp(paths[j], paths[j + 1]) > 0) {
        char tmp[QUEUE_PATH_MAXLEN];
        strncpy(tmp,         paths[j],     QUEUE_PATH_MAXLEN - 1); tmp[QUEUE_PATH_MAXLEN-1]         = '\0';
        strncpy(paths[j],    paths[j + 1], QUEUE_PATH_MAXLEN - 1); paths[j][QUEUE_PATH_MAXLEN-1]    = '\0';
        strncpy(paths[j + 1], tmp,         QUEUE_PATH_MAXLEN - 1); paths[j + 1][QUEUE_PATH_MAXLEN-1] = '\0';
      }
    }
  }

  return count;
}

void runUploadMode() {
  stage              = STAGE_WIFI_UPLOAD;
  g_uploadInProgress = true;  // gates saveSystemEvent JSONL append

  saveSystemEvent("info", "upload_started", "MAIN", "", "Manual upload triggered", "{}");

  if (!connectWiFi()) {
    saveSystemEvent("error", "upload_failed", "MAIN", "UPLOAD_WIFI_TIMEOUT",
              "WiFi connection failed", "{}");
    saveUploadState("", false, "", 0, "WIFI_TIMEOUT");
    disconnectWiFi();
    g_uploadInProgress = false;
    return;
  }

  // Scan all pending queue files across all dates, oldest-first
  char queuePaths[MAX_PENDING_QUEUES][QUEUE_PATH_MAXLEN];
  int  queueCount = scanPendingQueues(queuePaths, MAX_PENDING_QUEUES);

  DBGF("[Upload] Total queue files found: %d", queueCount);

  if (queueCount == 0) {
    DBG("[Upload] No pending queue files found.");
    saveUploadState("", false, "", 0, "NO_PENDING_DATA");
    stage              = STAGE_UPLOAD_DONE;
    g_uploadInProgress = false;
    disconnectWiFi();
    return;
  }

  String serverTime    = "";
  int    totalInserted = 0;
  bool   anyOk         = false;
  int    filesUploaded = 0;
  int    filesFailed   = 0;

  for (int qi = 0; qi < queueCount; qi++) {
    String qPath = String(queuePaths[qi]);
    DBGF("[Upload] Uploading: %s", qPath.c_str());

    int  inserted = 0;
    bool batchOk  = false;

    for (int attempt = 1; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
      if (attempt > 1) {
        DBGF("[Upload] Retry %d/%d in %d ms", attempt, UPLOAD_MAX_RETRIES, UPLOAD_RETRY_DELAY_MS);
        delay(UPLOAD_RETRY_DELAY_MS);
        char detBuf[48];
        snprintf(detBuf, sizeof(detBuf), "{\"attempt\":%d}", attempt);
        saveSystemEvent("info", "upload_retry", "MAIN", "", "Retrying upload", detBuf);
      }
      inserted = 0;
      if (runBatchedUpload(qPath, serverTime, inserted)) {
        batchOk = true;
        break;
      }
      char detBuf[64];
      snprintf(detBuf, sizeof(detBuf), "{\"http_status\":0,\"attempt\":%d}", attempt);
      saveSystemEvent("warning", "upload_retry", "MAIN", "HTTP_ERROR",
                "Upload attempt failed", detBuf);
    }

    if (batchOk && inserted > 0) {
      anyOk = true;
      filesUploaded++;
      totalInserted += inserted;
      char detBuf[64];
      snprintf(detBuf, sizeof(detBuf), "{\"inserted\":%d}", inserted);
      saveSystemEvent("info", "upload_success", "MAIN", "", "Upload succeeded", detBuf);
      DBGF("[Upload] %s OK — %d records inserted", qPath.c_str(), inserted);
    } else if (batchOk) {
      DBGF("[Upload] %s: empty queue, skipped", qPath.c_str());
    } else {
      filesFailed++;
      saveSystemEvent("error", "upload_failed", "MAIN", "MAX_RETRIES_EXCEEDED",
                "All upload attempts failed", "{}");
      DBGF("[Upload] %s: all retries failed", qPath.c_str());
    }
  }

  if (anyOk) {
    String ts2       = getTimestamp();
    String uploadId2 = "UPL-" GATEWAY_ID "-";
    if (ts2.length() >= 19) {
      uploadId2 += ts2.substring(0,4) + ts2.substring(5,7) + ts2.substring(8,10);
      uploadId2 += "-";
      uploadId2 += ts2.substring(11,13) + ts2.substring(14,16) + ts2.substring(17,19);
    } else {
      uploadId2 += "00000000-000000";
    }
    saveUploadState(uploadId2, true, serverTime, totalInserted, "");
    g_forceRecoveryWindowNextBoot = true;
    DBGF("[Upload] Summary: %d uploaded, %d failed, %d records inserted",
         filesUploaded, filesFailed, totalInserted);
  } else if (filesFailed > 0) {
    saveUploadState("", false, "", 0, "MAX_RETRIES_EXCEEDED");
    DBGF("[Upload] Summary: 0 uploaded, %d failed", filesFailed);
  } else {
    saveUploadState("", false, "", 0, "NO_PENDING_DATA");
    DBGF("[Upload] Summary: queue files found but no pending records");
  }

  if (anyOk && serverTime.length() >= 19) {
    syncRTCFromServerTime(serverTime);
  }

  stage              = STAGE_UPLOAD_DONE;
  g_uploadInProgress = false;
  disconnectWiFi();
}

// ═════════════════════════════════════════════════════════════════════════════
// LOCAL RS485 SOIL SENSOR
// ═════════════════════════════════════════════════════════════════════════════

static uint16_t modbusRTUCRC(const uint8_t *buf, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)buf[i];
    for (uint8_t j = 0; j < 8; j++) {
      crc = (crc & 0x0001) ? ((crc >> 1) ^ 0xA001) : (crc >> 1);
    }
  }
  return crc;
}

// Reads Pivot 1 soil sensor via Modbus RTU (soil_sensor_protocol.md §13).
// Relay control stays in performLocalSoilMeasurement() — not touched here.
// MAX485 DE/RE is HIGH only during TX request; LOW on every exit path.
bool readLocalSoilSensorRS485(SoilReading &reading, char *errorCode, size_t errorCodeLen) {
  // Protocol: slave=0x01, baud=4800, 8N1, FC=0x03, start=0x0000, count=3, response=11 bytes
  Serial1.begin(RS485_BAUD_RATE, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);

  // Drain stale RX bytes before transmitting
  while (Serial1.available()) Serial1.read();

  // Build Modbus RTU request: 01 03 00 00 00 03 <CRC_L> <CRC_H>
  uint8_t req[8] = {0x01, 0x03, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00};
  uint16_t reqCRC = modbusRTUCRC(req, 6);
  req[6] = (uint8_t)(reqCRC & 0xFF);
  req[7] = (uint8_t)(reqCRC >> 8);

  // Transmit: DE/RE HIGH → write → flush → guard → DE/RE LOW
  digitalWrite(MAX485_DE_RE_PIN, HIGH);
  delayMicroseconds(200);           // driver enable settle
  Serial1.write(req, sizeof(req));
  Serial1.flush();                  // block until all bytes are clocked out
  delayMicroseconds(300);           // guard: last stop bit fully clocked out
  digitalWrite(MAX485_DE_RE_PIN, LOW);

  // Drain echo bytes accumulated during TX
  while (Serial1.available()) Serial1.read();

  // Collect 11-byte response within timeout
  uint8_t  res[11];
  uint8_t  idx    = 0;
  uint32_t tStart = millis();
  while (idx < 11) {
    if (millis() - tStart >= (uint32_t)RS485_RX_TIMEOUT_MS) {
      DBGF("[LocalSoil] Timeout — received %u of 11 bytes", idx);
      snprintf(errorCode, errorCodeLen, "LOCAL_RS485_TIMEOUT");
      return false;
    }
    if (Serial1.available()) res[idx++] = (uint8_t)Serial1.read();
  }

  // Validate slave ID, function code, byte count
  if (res[0] != 0x01 || res[1] != 0x03 || res[2] != 0x06) {
    DBGF("[LocalSoil] Bad response header: %02X %02X %02X", res[0], res[1], res[2]);
    snprintf(errorCode, errorCodeLen, "LOCAL_SOIL_PARSE_FAILED");
    return false;
  }

  // Validate CRC — bytes 0..8, received as low byte then high byte
  uint16_t rxCRC   = (uint16_t)res[9] | ((uint16_t)res[10] << 8);
  uint16_t calcCRC = modbusRTUCRC(res, 9);
  if (rxCRC != calcCRC) {
    DBGF("[LocalSoil] CRC error: recv=0x%04X calc=0x%04X", rxCRC, calcCRC);
    snprintf(errorCode, errorCodeLen, "LOCAL_SOIL_CRC_ERROR");
    return false;
  }

  // Extract register values — soil_sensor_protocol.md §13 data extraction reference
  uint16_t rawMois = ((uint16_t)res[3] << 8) | res[4];  // reg0
  uint16_t rawTemp = ((uint16_t)res[5] << 8) | res[6];  // reg1
  uint16_t rawEc   = ((uint16_t)res[7] << 8) | res[8];  // reg2

  reading.soilMois = rawMois / 10.0f;  // soil_moisture_percent
  reading.soilTemp = rawTemp / 10.0f;  // soil_temperature_c
  reading.soilEc   = (float)rawEc;     // soil_ec_us_cm (raw integer)
  // soilPh intentionally not populated — sensor does not provide it

  DBGF("[LocalSoil] mois=%.1f temp=%.1f ec=%.0f",
       reading.soilMois, reading.soilTemp, reading.soilEc);
  return true;
}

void performLocalSoilMeasurement() {
  SoilReading localReading;
  localReading.nodeId     = "MAIN";
  localReading.measuredAt = getTimestamp();
  localReading.recordId   = buildMainSoilRecordId();

  char errCode[48] = "";

  // Power sensor and set MAX485 to receive mode
  digitalWrite(RELAY_PIN,        RELAY_ON);
  digitalWrite(MAX485_DE_RE_PIN, LOW);
  delay(RS485_SENSOR_WARMUP_MS);

  bool ok = readLocalSoilSensorRS485(localReading, errCode, sizeof(errCode));

  // Relay OFF on all exit paths
  digitalWrite(RELAY_PIN,        RELAY_OFF);
  digitalWrite(MAX485_DE_RE_PIN, LOW);

  if (!ok) {
    DBGF("[LocalSoil] RS485 read failed: %s", errCode);
    localReading.valid   = true;
    localReading.status  = "error";
    localReading.errCode = String(errCode);
    saveMainSoilReading(localReading);
    saveSystemEvent("error", "sensor_error", "MAIN", errCode,
                    "Local RS485 soil sensor failed", "{}");
    return;
  }

  localReading.valid  = true;
  localReading.status = "ok";
  DBGF("[LocalSoil] Read ok — temp=%.1f mois=%.1f ec=%.1f",
       localReading.soilTemp, localReading.soilMois, localReading.soilEc);
  saveMainSoilReading(localReading);
}

// ═════════════════════════════════════════════════════════════════════════════
// SLEEP
// ═════════════════════════════════════════════════════════════════════════════

void prepareForSleep() {
  stage = STAGE_SLEEP_PREPARE;
  if (g_loraOk) {
    LoRa.sleep();
    digitalWrite(LORA_CS_PIN, HIGH);
  }
  DBG("[MainNode] Prepared for sleep");
}

void goToDeepSleep() {
  uint32_t activeSec = (millis() - g_cycleStartMs) / 1000UL;
  uint32_t sleepSec  = (activeSec < CYCLE_DURATION_SEC)
                       ? (CYCLE_DURATION_SEC - activeSec) : 60UL;

  DBGF("[MainNode] Deep sleep %lu s  (active was %lu s)", sleepSec, activeSec);

  if (g_rtcOk) g_plannedWakeEpoch = rtc.now().unixtime() + sleepSec;
  else          g_plannedWakeEpoch = 0;

#if DEBUG_MODE
  Serial.flush();
#endif

  esp_sleep_enable_ext0_wakeup(GPIO_NUM_34, 0);    // wake on button LOW
  esp_sleep_enable_timer_wakeup((uint64_t)sleepSec * 1000000ULL);
  esp_deep_sleep_start();
}
