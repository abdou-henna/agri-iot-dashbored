# 🔋 Power Saving Strategy for IoT Desert Agriculture Monitoring System

## 1. Purpose

This document defines the **power-saving strategy** for the ESP32-based agricultural IoT system.

It focuses only on:

- ESP32 / ESP32-C3 power management
- LoRa SX1278 power management
- Soil sensor power control using relay
- MAX485 / RS485 handling
- BME280 low-power measurement
- SD card usage optimization
- RTC DS3231 usage for time scheduling
- WiFi upload mode power control
- Required Arduino libraries
- Practical coding rules for low-power firmware

This file does **not** repeat pin mapping or wiring details.  
Pin mapping is documented separately in the hardware pin mapping file.

---

## 2. General Low-Power Philosophy

The system must follow this rule:

```text
Every component must be OFF, asleep, or inactive unless it is currently needed.
```

The firmware must avoid:

```text
continuous LoRa RX
continuous WiFi
continuous soil sensor power
continuous SD card access
long blocking delays after measurement
unnecessary serial debug output in production
```

The preferred cycle is:

```text
Wake up
↓
Power only required modules
↓
Measure
↓
Transmit or store
↓
Turn off / sleep modules
↓
Enter ESP32 deep sleep
```

---

## 3. Node-Level Strategy

## 3.1 Soil Node

The soil node is the most power-critical node because it includes:

- ESP32-C3
- LoRa SX1278
- MAX485
- Soil sensor powered by 12V
- Relay for soil sensor power control

### Required behavior

```text
Every 10 minutes:
1. ESP32-C3 wakes from deep sleep.
2. Relay turns ON soil sensor power.
3. Wait for soil sensor stabilization.
4. Read data through RS485 / MAX485.
5. Relay turns OFF soil sensor power.
6. Send data through LoRa.
7. Wait briefly for ACK if implemented.
8. Put LoRa into sleep mode.
9. Put ESP32-C3 into deep sleep.
```

### Important rule

The soil sensor must **not** remain powered continuously.

The relay must control the **12V positive line** of the soil sensor:

```text
Relay OFF → soil sensor OFF
Relay ON  → soil sensor ON
```

Use `NO + COM`, not `NC`, so the sensor remains OFF by default when the system sleeps.

### Recommended timing

```text
Measurement period: 10 minutes
Soil sensor warm-up: 10 to 20 seconds
LoRa ACK window: 1 to 2 seconds
```

Start with:

```cpp
#define MEASUREMENT_INTERVAL_SEC 600
#define SOIL_WARMUP_MS 15000
#define LORA_ACK_TIMEOUT_MS 1500
```

If testing shows the soil readings stabilize earlier, reduce warm-up to 8-10 seconds.

---

## 3.2 Weather Node

The weather node is naturally low-power because BME280 supports sleep and forced measurement modes.

### Required behavior

```text
Every 10 minutes:
1. ESP32-C3 wakes.
2. BME280 performs one forced measurement.
3. ESP32-C3 reads temperature, humidity, pressure.
4. LoRa sends packet.
5. LoRa enters sleep mode.
6. ESP32-C3 enters deep sleep.
```

### Important rule

Do not use continuous BME280 normal mode.

Use:

```text
BME280 Forced Mode
```

Forced Mode performs one measurement and then returns the sensor to sleep.

---

## 3.3 Main Node

The main node is responsible for:

- Receiving LoRa data
- Reading the mandatory local soil sensor at the main pivot location
- Adding timestamp from RTC DS3231
- Saving data to SD card
- Logging system events
- Uploading SD data manually when button is pressed
- Updating RTC time after successful upload

### Required behavior during normal collection

```text
Wake according to schedule
↓
Open LoRa receive windows
↓
Receive packets from Node 2 and Node 3
↓
Read mandatory local soil sensor at main pivot location
↓
Save readings/events to SD
↓
Put LoRa in sleep
↓
Close SD files
↓
Sleep until next scheduled cycle
```

### Required behavior during upload mode

```text
Button pressed
↓
Start WiFi only for upload
↓
Connect to configured hotspot
↓
Send stored data to WebService
↓
Receive server time
↓
Update RTC
↓
Save upload metadata
↓
Turn WiFi OFF
↓
Return to low-power mode
```

WiFi must never remain active outside upload mode.

### Main Node Local Soil Measurement Rule

The Main Node has its own mandatory soil sensor at the main pivot / main rotating axis location. This reading must occur every normal measurement cycle.

Recommended order:

```text
1. Open LoRa receive windows for Node 2 and Node 3.
2. Receive packets and send ACKs.
3. Perform Main Node local soil measurement.
4. Store all records and events to SD.
5. Sleep.
```

Important:

```text
Main Node local soil measurement must NOT run before the expected LoRa receive windows.
```

Reason:

```text
The soil sensor warm-up and RS485 read can delay LoRa reception and cause packet loss.
```


---

## 4. ESP32 / ESP32-C3 Power Saving

## 4.1 Required ESP32 Sleep Mode

Use:

```cpp
esp_deep_sleep_start();
```

Deep sleep is preferred because the node sleeps for long periods between measurements. ESP32-C3 deep sleep powers off CPUs and most digital peripherals, leaving only RTC-related parts active depending on wake source configuration.

### Required wake method for sensor nodes

Use timer wakeup:

```cpp
esp_sleep_enable_timer_wakeup(600ULL * 1000000ULL);
esp_deep_sleep_start();
```

### Required wake method for main node

The main node can use:

```text
1. timer wakeup
2. DS3231 SQW/INT alarm wakeup
3. upload button wakeup
```

Use DS3231 alarm when accurate long-term scheduling is required.

---

## 4.2 Disable WiFi and Bluetooth Before Sleep

For nodes that do not use WiFi:

```cpp
WiFi.disconnect(true);
WiFi.mode(WIFI_OFF);
btStop();
```

For ESP32-C3, Bluetooth function availability depends on the Arduino core and board. If `btStop()` is not available, remove it.

### Rule

```text
Sensor nodes must not initialize WiFi at all.
Main node must initialize WiFi only in upload mode.
```

---

## 4.3 GPIO State Before Sleep

Before entering deep sleep:

- Turn relay OFF.
- Set MAX485 direction to receive/inactive.
- Put LoRa NSS/CS HIGH.
- Avoid floating GPIO pins.
- Avoid internal pull-ups/pull-downs fighting external circuits.

Recommended before sleep:

```cpp
digitalWrite(RELAY_PIN, RELAY_OFF);
digitalWrite(MAX485_RE_DE_PIN, LOW);
digitalWrite(LORA_CS_PIN, HIGH);
```

If a pin causes leakage, isolate or set it to a safe state.

---

## 4.4 Reduce CPU Frequency During Active Time

Because measurement and packet building are not computationally heavy, CPU frequency can be reduced during non-WiFi operation.

Optional:

```cpp
setCpuFrequencyMhz(80);
```

Do not reduce too aggressively before timing-sensitive protocols are verified.

---

## 5. LoRa SX1278 Power Saving

## 5.1 Required LoRa Rule

LoRa must not remain in receive mode continuously.

Use:

```cpp
LoRa.sleep();
```

after every send or receive window.

### Normal node behavior

```text
LoRa.begin()
↓
Send packet
↓
Short ACK receive window
↓
LoRa.sleep()
↓
ESP32 deep sleep
```

### Main node behavior

```text
Wake
↓
Open RX window only during expected node slots
↓
Receive data
↓
Send ACK if needed
↓
LoRa.sleep()
↓
Sleep
```

---

## 5.2 Avoid Long Receive Windows

Do not use:

```text
LoRa RX always ON
```

Use scheduled receive windows.

Recommended receive timeout:

```cpp
#define NODE_RX_WINDOW_MS 3000
#define ACK_WINDOW_MS 1500
```

---

## 5.3 Use Minimum Reliable TX Power

Start with a moderate TX power and increase only if needed.

Example:

```cpp
LoRa.setTxPower(14);
```

If communication is stable, reduce power.

Suggested test sequence:

```text
14 dBm → test
12 dBm → test
10 dBm → test
```

Use the lowest value that gives stable packets.

---

## 5.4 Prefer Moderate LoRa Settings

For power saving and shorter airtime:

```cpp
LoRa.setSpreadingFactor(7);      // Start with SF7
LoRa.setSignalBandwidth(125E3);
LoRa.setCodingRate4(5);
LoRa.enableCrc();
```

Increase SF only if range is not sufficient.

Higher SF increases airtime and energy consumption.

---

## 6. Soil Sensor Power Saving

## 6.1 Relay-Controlled Sensor Power

The soil sensor must be powered only during measurement.

Required sequence:

```cpp
soilPowerOn();
delay(SOIL_WARMUP_MS);
readSoilSensor();
soilPowerOff();
```

### Recommended functions

```cpp
void soilPowerOn() {
  digitalWrite(SOIL_RELAY_PIN, RELAY_ON);
}

void soilPowerOff() {
  digitalWrite(SOIL_RELAY_PIN, RELAY_OFF);
}
```

### Production rule

Always call:

```cpp
soilPowerOff();
```

before:

```cpp
esp_deep_sleep_start();
```

---

## 6.2 Warm-Up Optimization

Do not assume the sensor needs a long warm-up.

Test the sensor at:

```text
5 seconds
10 seconds
15 seconds
20 seconds
```

Choose the shortest delay that gives stable readings.

Recommended initial value:

```cpp
#define SOIL_WARMUP_MS 15000
```

---

## 6.3 Sensor Failure Handling

If the soil sensor does not respond:

```text
1. Turn relay OFF.
2. Log event: sensor_error or rs485_error.
3. Send error packet to main node.
4. Sleep normally.
```

Never keep the relay ON after a failed reading.

---

## 7. MAX485 / RS485 Power Saving

## 7.1 Direction Control

Current hardware uses RE + DE connected together.

Use:

```cpp
digitalWrite(MAX485_RE_DE_PIN, HIGH); // transmit
digitalWrite(MAX485_RE_DE_PIN, LOW);  // receive / driver off
```

Before sleep:

```cpp
digitalWrite(MAX485_RE_DE_PIN, LOW);
```

### Modbus sequence

```text
Set TX mode
Send Modbus request
Flush UART
Set RX mode
Wait for response
End Serial1 if not needed
```

Example:

```cpp
void preTransmission() {
  digitalWrite(MAX485_RE_DE_PIN, HIGH);
  delayMicroseconds(200);
}

void postTransmission() {
  delayMicroseconds(200);
  digitalWrite(MAX485_RE_DE_PIN, LOW);
}
```

---

## 7.2 End UART Before Sleep

After reading:

```cpp
Serial1.end();
```

This prevents unnecessary UART activity during sleep preparation.

---

## 8. BME280 Power Saving

## 8.1 Use Forced Mode

Do not use continuous normal mode.

With Adafruit BME280 library:

```cpp
bme.setSampling(
  Adafruit_BME280::MODE_FORCED,
  Adafruit_BME280::SAMPLING_X1,
  Adafruit_BME280::SAMPLING_X1,
  Adafruit_BME280::SAMPLING_X1,
  Adafruit_BME280::FILTER_OFF
);

bme.takeForcedMeasurement();
```

Then read:

```cpp
float t = bme.readTemperature();
float h = bme.readHumidity();
float p = bme.readPressure() / 100.0F;
```

---

## 8.2 Read BME280 Before LoRa Transmission

LoRa transmission and ESP32 activity can slightly heat the board.

Recommended order:

```text
Wake
↓
Read BME280 immediately
↓
Then transmit LoRa
```

This improves environmental measurement quality.

---

## 9. SD Card Power Saving

## 9.1 Use Short SD Sessions

The SD card should be used only when writing or reading files.

Normal collection:

```text
Open file
Append one or more lines
Flush
Close file
```

Recommended:

```cpp
File f = SD.open(path, FILE_APPEND);
f.println(line);
f.flush();
f.close();
```

---

## 9.2 Avoid Continuous SD Access

Do not keep files open while waiting for LoRa packets.

Recommended main node flow:

```text
Receive packets in RAM buffer
↓
Open SD
↓
Write batch
↓
Close SD
```

---

## 9.3 Upload Mode

During upload:

```text
Open SD file
Read chunk
Send to WebService
Close file
```

If upload fails, do not delete data.

---

## 9.4 Optional SD Shutdown

If hardware allows SD power control, turn it off after use.  
If not, still reduce consumption by:

```cpp
SD.end();
```

after finishing SD operations.

---

## 10. RTC DS3231 Power Strategy

## 10.1 Use RTC as Time Master

The main node must use DS3231 as the local time reference.

### Responsibilities

```text
Timestamp received readings
Schedule measurement cycles
Store time during power loss
Update time after successful upload
```

---

## 10.2 RTC Time Update After Upload

After a successful WebService upload:

```text
1. WebService returns server_time.
2. Main node parses server_time.
3. Main node updates DS3231.
4. Main node logs event: clock_updated.
5. Main node saves last_upload_at.
```

This allows the website to display:

```text
Last Update
```

and keeps future SD timestamps accurate.

---

## 10.3 DS3231 Alarm Wakeup

If implemented, use the SQW/INT pin to wake the main node.

Required logic:

```text
Set next DS3231 alarm
↓
Clear alarm flag
↓
Enter sleep
↓
SQW/INT wakes ESP32
```

---

## 11. WiFi Upload Power Saving

## 11.1 WiFi Only in Upload Mode

WiFi must be disabled during normal sensing.

Upload mode is activated by:

```text
Push button
```

Then the main node connects to:

```text
SSID: configured in connection.md
Password: configured in connection.md
```

---

## 11.2 Upload Time Limit

Do not allow WiFi upload mode to run forever.

Recommended:

```cpp
#define WIFI_CONNECT_TIMEOUT_MS 20000
#define UPLOAD_MAX_DURATION_MS 120000
```

If upload fails:

```text
Turn WiFi OFF
Log event: upload_failed
Return to sleep
```

---

## 11.3 Turn WiFi OFF After Upload

After upload:

```cpp
WiFi.disconnect(true);
WiFi.mode(WIFI_OFF);
```

---

## 11.4 Connection Stability During Upload

During active upload, reliability is more important than minimal current.  
It is acceptable to disable WiFi sleep during the short upload window:

```cpp
WiFi.setSleep(false);
```

Then turn WiFi off completely after upload.

---

## 12. Data Strategy for Power Saving

## 12.1 Batch Upload

Do not upload after every reading.

Correct behavior:

```text
Collect data locally on SD
↓
Upload only when user presses upload button
```

This avoids WiFi power consumption during normal field operation.

---

## 12.2 Store Events Locally

Errors should be saved locally and uploaded later.

Examples:

```text
missing_node
sensor_error
rs485_error
lora_timeout
sd_error
rtc_sync
clock_updated
upload_started
upload_finished
```

This avoids wasting energy trying to report errors immediately through WiFi.

---

## 13. Required Arduino Libraries

## 13.1 Common Libraries

Install these in Arduino IDE / PlatformIO as needed:

```text
SPI
Wire
WiFi
HTTPClient
ArduinoJson
FS
SD
```

Most are included with Arduino ESP32 core.

---

## 13.2 LoRa

Recommended library:

```text
LoRa by Sandeep Mistry
```

Used for SX1278 communication.

Required functions:

```cpp
LoRa.begin(frequency);
LoRa.beginPacket();
LoRa.print(...);
LoRa.endPacket();
LoRa.parsePacket();
LoRa.sleep();
LoRa.setTxPower(...);
LoRa.setSpreadingFactor(...);
LoRa.enableCrc();
```

Alternative advanced library:

```text
RadioLib
```

RadioLib can be considered later if more advanced LoRa control is needed.

---

## 13.3 Soil Node Libraries

Recommended:

```text
ModbusMaster
```

Purpose:

```text
Read soil sensor through RS485 / Modbus RTU
```

Use callbacks:

```cpp
node.preTransmission(preTransmission);
node.postTransmission(postTransmission);
```

---

## 13.4 Weather Node Libraries

Recommended:

```text
Adafruit BME280 Library
Adafruit Unified Sensor
```

Used for BME280 forced-mode reading.

---

## 13.5 RTC Libraries

Recommended:

```text
RTClib by Adafruit
```

Used for DS3231 timekeeping.

For DS3231 alarms, verify the selected RTClib version supports the alarm functions required by your implementation.

---

## 13.6 JSON / Upload

Recommended:

```text
ArduinoJson
```

Used for building upload JSON payloads for the WebService.

Recommended version:

```text
ArduinoJson 7.x
```

---

## 14. Firmware Rules for Low Power

## 14.1 Production Build Rules

Before final deployment:

```text
Disable unnecessary Serial.print
Use fixed measurement interval
Use short LoRa receive windows
Use relay only during sensor measurement
Use BME280 forced mode
Use WiFi only during upload mode
Close SD files immediately
Use deep sleep after each cycle
```

---

## 14.2 Safety Rules

Before every sleep:

```cpp
soilPowerOff();          // if node has soil relay
LoRa.sleep();
WiFi.disconnect(true);
WiFi.mode(WIFI_OFF);
digitalWrite(MAX485_RE_DE_PIN, LOW);
esp_deep_sleep_start();
```

For nodes without WiFi, remove WiFi calls if not initialized.

---

## 14.3 Error Handling Must Not Waste Power

If an error occurs:

```text
Log error
Turn off active hardware
Send short error packet if possible
Sleep
```

Do not keep retrying indefinitely.

Recommended retry limit:

```cpp
#define MAX_SENSOR_RETRIES 2
#define MAX_LORA_RETRIES 2
```

---

## 15. Recommended Timing Constants

```cpp
#define MEASUREMENT_INTERVAL_SEC   600     // 10 minutes
#define SOIL_WARMUP_MS             15000
#define LORA_ACK_TIMEOUT_MS        1500
#define MAIN_RX_WINDOW_MS          3000
#define WIFI_CONNECT_TIMEOUT_MS    20000
#define UPLOAD_MAX_DURATION_MS     120000
#define MAX_SENSOR_RETRIES         2
#define MAX_LORA_RETRIES           2
```

---

## 16. Recommended Power-Saving Workflow Per Node

## 16.1 Soil Node Workflow

```text
setup()
↓
initialize GPIO
↓
relay OFF
↓
wake reason check
↓
relay ON
↓
wait warm-up
↓
read RS485
↓
relay OFF
↓
build LoRa packet
↓
send packet
↓
wait ACK briefly
↓
LoRa.sleep()
↓
deep sleep 10 minutes
```

---

## 16.2 Weather Node Workflow

```text
setup()
↓
initialize BME280
↓
take forced measurement
↓
build LoRa packet
↓
send packet
↓
wait ACK briefly
↓
LoRa.sleep()
↓
deep sleep 10 minutes
```

---

## 16.3 Main Node Workflow

```text
setup()
↓
read RTC time
↓
listen to LoRa slots
↓
receive packets
↓
read mandatory local soil sensor
↓
timestamp packets and local soil record
↓
write SD records and events
↓
if upload button pressed:
    connect WiFi
    upload stored data
    update RTC from server_time
    save upload metadata
    WiFi OFF
↓
LoRa.sleep()
↓
sleep or wait until next cycle
```

---

## 17. Power-Saving Checklist Before Coding

Before generating firmware, verify:

```text
[ ] Relay OFF state is correct.
[ ] Main Node local soil measurement runs after LoRa receive windows.
[ ] Soil sensor uses COM + NO.
[ ] Soil sensor does not use NC.
[ ] LoRa sleep is called after communication.
[ ] ESP32 deep sleep is used between cycles.
[ ] BME280 forced mode is used.
[ ] WiFi is initialized only in upload mode.
[ ] Upload mode has timeout.
[ ] SD files are closed after write.
[ ] Battery fields remain null/not_measured because no battery monitor exists.
[ ] NPK fields are not used anywhere.
```

---

## 18. Notes for Future Improvement

These are optional future hardware improvements, not required now:

```text
Replace relay with MOSFET/load switch for lower switching energy.
Use low-Iq voltage regulators instead of AMS1117.
Add battery voltage divider to ADC for battery monitoring.
Add power control for SD module.
Use 3.3V RS485 transceiver to reduce level-shifting risk.
Use solar charging if long field deployment is required.
```

---

## 19. Source References

- Espressif ESP32-C3 sleep modes: Deep sleep, light sleep, WiFi/Bluetooth shutdown, GPIO leakage notes.
- Espressif Arduino WiFi API: `WiFi.disconnect(wifioff, eraseap)`, station mode and connection management.
- Bosch BME280 datasheet / documentation: sleep mode, forced mode, low-power weather monitoring.
- Semtech SX1278/SX127x documentation: LoRa sleep/receive behavior and low-power modes.
- ModbusMaster documentation: RS485/Modbus RTU with preTransmission and postTransmission callbacks.
- DS3231 documentation: RTC alarms and SQW/INT interrupt use.
