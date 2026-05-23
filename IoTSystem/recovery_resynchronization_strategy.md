# LoRa Recovery & Resynchronization Strategy

**Project:** Smart Farm / Desert Agriculture Monitoring System  
**Document Type:** Communication recovery, node rejoin, and timing resynchronization strategy  
**Scope:** Main Node, Node2 Soil Node, Node3 Weather Node, LoRa ACK behavior, missed-cycle recovery, low-power reconnect logic  
**Out of Scope:** Web dashboard implementation, backend API changes, new hardware design, sensor calibration, battery monitoring hardware  
**Related Documents:** `iot_data_system_design.md`, `power_saving_strategy.md`, `debug_strategy.md`, `soil_sensor_protocol.md`, `Pin_Mapping.md`

---

## 1. Purpose of This Document

This document defines a professional **Recovery and Resynchronization Strategy** for the distributed ESP32/ESP32-C3 LoRa monitoring system.

The goal is to reduce the number of missed measurement cycles when a node temporarily loses communication with the Main Node, reboots after battery replacement, misses an ACK, or falls out of timing alignment.

This document is intended to be used later as a precise implementation reference for firmware updates on:

| Firmware | Role in Recovery |
|---|---|
| Main Node | Detect missing nodes, extend RX window temporarily, send ACK/scheduling hints |
| Node2 Soil | Retry after ACK loss while preserving low power and RS485 safety |
| Node3 Weather | Retry after ACK loss while preserving low power and BME280 forced-mode behavior |

This document does **not** redefine pin mapping, soil protocol, packet fields, or storage schema. Those remain defined in their dedicated source-of-truth documents.

---

## 2. Terminology

| Term | Meaning |
|---|---|
| Normal Cycle | The standard 10-minute sensing cycle |
| Superframe | One complete 10-minute system period containing node transmissions and Main Node reception |
| RX Window | Time interval during which Main Node listens for LoRa packets |
| ACK | A short response from Main Node confirming that a node packet was received |
| Missed Cycle | A cycle where an expected node packet was not received |
| Recovery Mode | Temporary behavior after ACK loss or missing-node detection |
| Resynchronization | Returning a node to the expected timing relationship with Main Node |
| Recovery Scan | A sequence of short sleep intervals used by a node to test different timing phases |
| Offline State | A node is considered unavailable after several consecutive missing cycles |

---

## 3. Existing Timing Model

The current system is based on a fixed low-power measurement interval:

```text
Normal measurement interval = 600 seconds = 10 minutes
```

During normal operation:

```text
Main Node wakes
↓
Main Node opens LoRa RX window
↓
Node2 sends soil packet
↓
Main Node ACKs Node2
↓
Node3 sends weather packet
↓
Main Node ACKs Node3
↓
Main Node performs local soil read
↓
Main Node writes readings/events to SD
↓
Main Node sleeps
```

The system already follows the core low-power principle:

```text
Wake → Measure/Receive → Store/ACK → Sleep
```

This recovery strategy must preserve that principle.

---

## 4. Problem Statement

### 4.1 Why Recovery Is Needed

A node may fail to communicate for multiple reasons:

| Scenario | Example |
|---|---|
| Battery replacement | Node reboots at a random time, no longer aligned with Main RX window |
| ACK loss | Main receives packet but node does not receive ACK |
| Node late wake | Node sends after Main has closed RX window |
| Main reboot | Main timing changes while nodes continue their own sleep cycles |
| LoRa collision/noise | Packet or ACK lost due to radio conditions |
| Temporary hardware issue | Relay, sensor, or power transient delays node execution |
| Low battery | Node boots, transmits weakly, or resets before completing TX |

Without recovery, a node can remain out of phase with Main Node for several cycles.

---

### 4.2 Why a Fixed “5-Minute Retry” Is Not Enough

A simple strategy such as:

```text
If ACK fails → sleep 300 seconds
```

is not robust.

Reason:

```text
Main Node does not listen continuously.
If the node wakes after 300s while Main is sleeping, the retry is wasted.
```

Worse, a fixed retry interval may preserve a bad phase relationship for a long time.

Example:

```text
Main RX window: T + 0s to T + 70s
Node retry: every 300s
```

If the node retry happens near the middle of Main sleep, repeated retries may still miss the RX window.

Therefore, recovery must not be based only on one fixed shorter interval.

---

## 5. Design Goals

The recovery strategy must satisfy the following goals:

```text
1. Minimize missed cycles after temporary failure.
2. Avoid continuous LoRa RX or continuous retransmission.
3. Preserve battery life.
4. Avoid sending multiple retries inside the same wake session.
5. Keep Main Node RX extension temporary.
6. Recover after battery replacement without manual timing alignment.
7. Keep failure events visible in SD/WebService logs.
8. Avoid changing sensor data schema or packet meaning.
```

---

## 6. Design Principles

### 6.1 One Transmission Per Wake

Sensor nodes must not do aggressive in-wake retries.

Incorrect:

```text
Wake → Send → No ACK → Send again → Send again → Send again
```

Correct:

```text
Wake → Send once → Wait short ACK → Sleep according to recovery state
```

Reason:

```text
Multiple retries increase airtime, energy use, and collision probability.
```

---

### 6.2 Recovery Must Change Phase

A node that lost synchronization must not retry at the same phase forever.

Therefore, recovery uses a sequence of different sleep durations:

```text
60s → 120s → 300s → 600s
```

This changes the node’s transmission phase relative to Main Node’s 600-second superframe.

---

### 6.3 Main Node Helps but Does Not Stay Awake Forever

Main Node may temporarily extend its RX window after a node is missed.

However:

```text
Extended RX must be bounded.
```

Otherwise, one dead node would permanently increase Main Node power consumption.

---

### 6.4 ACK Is the Best Resynchronization Point

When a node receives ACK, it knows:

```text
Main Node was awake now.
The packet was accepted now.
The node can return to normal timing.
```

Future enhancement: Main Node can include a recommended sleep duration or next wake time inside ACK.

---

## 7. Recovery Strategy Overview

The proposed strategy has two cooperating parts:

| Side | Behavior |
|---|---|
| Sensor Node | If ACK fails, enter recovery scan using short phased sleep intervals |
| Main Node | If a node is missed, temporarily extend RX window for a small number of cycles |

High-level behavior:

```text
Node sends packet
↓
If ACK received:
    reset recovery state
    sleep normal interval
else:
    increment fail counter
    sleep according to recovery scan table
```

Main Node:

```text
If expected node missing:
    increment missed counter
    enable recovery watch
    extend next RX window temporarily
```

---

## 8. Node-Side Recovery Algorithm

### 8.1 Required Persistent State

Each sensor node should store a small recovery state in RTC memory:

```cpp
RTC_DATA_ATTR uint8_t txFailCount = 0;
RTC_DATA_ATTR uint32_t lastAckSeq = 0;
```

Recommended optional state:

```cpp
RTC_DATA_ATTR uint32_t lastAckMillis = 0;
RTC_DATA_ATTR bool recoveryMode = false;
```

The minimum required value is:

```cpp
txFailCount
```

---

### 8.2 Normal Success Behavior

When a node sends a packet and receives ACK:

```text
txFailCount = 0
recoveryMode = false
sleep = normal cycle interval
```

Default:

```text
normal sleep = 600 seconds
```

---

### 8.3 No-ACK Recovery Behavior

If the node sends a packet but does not receive ACK:

```text
txFailCount++
sleep = recoverySleep(txFailCount)
```

Recommended recovery sleep sequence:

| Consecutive ACK Failure | Sleep Duration | Purpose |
|---:|---:|---|
| 1 | 60s | Fast phase change after first miss |
| 2 | 120s | Second phase sample |
| 3 | 300s | Broader phase shift |
| 4+ | 600s | Return to low-power periodic retry |

This is intentionally not a constant 300s retry.

---

### 8.4 Recovery Function

Recommended pseudocode:

```cpp
uint32_t getRecoverySleepSec(uint8_t failCount) {
  if (failCount == 0) return 600;  // normal mode
  if (failCount == 1) return 60;
  if (failCount == 2) return 120;
  if (failCount == 3) return 300;
  return 600;
}
```

---

### 8.5 Node Flow

```text
Wake
↓
Initialize safe GPIO
↓
Measure sensor
↓
Build data or error packet
↓
LoRa transmit once
↓
Wait ACK briefly
↓
If ACK received:
    txFailCount = 0
    sleep = 600s or ACK-provided value
Else:
    txFailCount++
    sleep = recovery sequence
↓
LoRa.sleep()
↓
Deep sleep
```

---

## 9. Main Node Recovery Algorithm

### 9.1 Required Node Health State

Main Node should track each expected remote node.

Recommended structure:

```cpp
struct NodeHealth {
  const char* nodeId;
  uint8_t missedCount;
  uint32_t lastSeenFrame;
  bool recoveryWatch;
};
```

For the current system:

```cpp
NodeHealth n2Health = {"N2", 0, 0, false};
NodeHealth n3Health = {"N3", 0, 0, false};
```

---

### 9.2 On Successful Packet Reception

When Main receives and accepts a packet from a node:

```text
missedCount = 0
recoveryWatch = false
lastSeenFrame = currentFrame
send ACK
```

---

### 9.3 On Missing Node

If expected packet is not received during the normal cycle:

```text
missedCount++
recoveryWatch = true
log event: missing_node
create missing reading if current storage logic requires it
```

---

### 9.4 Adaptive RX Window

Main Node uses normal RX window unless at least one node is under recovery watch.

Recommended values:

| Mode | RX Window |
|---|---:|
| Normal | 70s |
| Recovery Watch | 120s |

Rules:

```text
If any node has recoveryWatch = true and missedCount <= 2:
    RX_WINDOW = 120s
else:
    RX_WINDOW = 70s
```

After two consecutive misses:

```text
Node is considered offline.
Main returns to normal RX window.
```

This prevents long-term energy penalty from a dead node.

---

### 9.5 Main RX Window Logic

Recommended pseudocode:

```cpp
uint32_t getMainRxWindowMs() {
  bool recoveryActive =
      (n2Health.recoveryWatch && n2Health.missedCount <= 2) ||
      (n3Health.recoveryWatch && n3Health.missedCount <= 2);

  return recoveryActive ? 120000UL : 70000UL;
}
```

---

## 10. Recovery Logging & Observability

### 10.1 Purpose

Recovery must be **fully observable and traceable** in system logs.

The system must not only recover — it must also **report how recovery happened**.

This enables:

- Debugging communication issues
- Measuring system reliability
- Detecting weak nodes (battery / signal / hardware)
- Visualizing recovery behavior in dashboard logs

---

### 10.2 Recovery Event Types

Add the following new event types:

| Event Type | Description |
|----------|----------|
| `recovery_started` | Recovery mode activated for a node |
| `recovery_cycle_adjusted` | Node reduced its sleep interval |
| `recovery_success` | Node successfully resynchronized |
| `recovery_failed` | Node failed to recover after max attempts |
| `node_marked_dead` | Node considered offline/dead |
| `node_back_online` | Node recovered after being dead |

---

### 10.3 Required Recovery Metrics

Each recovery process must track:

| Field | Description |
|------|----------|
| `node_id` | Affected node |
| `recovery_start_time` | When recovery started |
| `recovery_end_time` | When recovery ended |
| `missed_cycles` | Number of missed cycles |
| `recovery_attempts` | Number of retries |
| `avg_recovery_interval_sec` | Average retry interval |
| `final_status` | success / failed |
| `last_rssi` | Last signal quality |
| `last_snr` | Last SNR |
| `reason` | battery_loss / timeout / unknown |

---

### 10.4 Example Event (JSON)

```json
{
  "event_type": "recovery_success",
  "severity": "info",
  "node_id": "N2",
  "event_time": "2026-05-01T10:30:00Z",
  "details": {
    "missed_cycles": 3,
    "recovery_attempts": 2,
    "avg_interval_sec": 180,
    "final_status": "success",
    "last_rssi": -78,
    "last_snr": 9.5
  }
}
```

---

### 10.5 Dead Node Detection

If a node exceeds a defined threshold:

```text
missed_cycles >= DEAD_THRESHOLD (example: 5)
```

Main Node must log:

```json
{
  "event_type": "node_marked_dead",
  "severity": "warning",
  "node_id": "N2",
  "details": {
    "missed_cycles": 5,
    "last_seen": "2026-05-01T09:40:00Z"
  }
}
```

---

### 10.6 Node Back Online

When node sends again after being dead:

```json
{
  "event_type": "node_back_online",
  "severity": "info",
  "node_id": "N2",
  "details": {
    "downtime_cycles": 6,
    "downtime_minutes": 60
  }
}
```

---

### 10.7 Implementation Rules

* All recovery events must be stored in SD `events.csv`
* All recovery events must be included in upload payload
* Events must follow `system_events` schema (see debug_strategy.md)
* Do not generate duplicate recovery events in the same cycle
* Use `frame_id` to correlate recovery events with measurement cycles

---

### 10.8 Integration with Debug Strategy

Recovery events must integrate with the system debug model:

* Use `severity` levels from debug_strategy.md 
* Use existing event storage and upload pipeline
* Do not create a separate logging system

---

### 10.9 Expected Dashboard Usage

These events will be used later for:

* Recovery timeline visualization
* Missed cycles tracking per node
* Node reliability metrics
* Battery failure detection
* LoRa signal quality analysis (RSSI/SNR trends)

---

### 10.10 Design Rule

```text
Recovery must not be silent.
Every recovery process must produce structured, analyzable events.
```

---

## 11. ACK-Based Resynchronization Enhancement

### 11.1 Current ACK Role

Current ACK confirms:

```text
Main received this node sequence.
```

This is enough to reset the node’s recovery counter.

---

### 11.2 Recommended Future ACK Payload

To make synchronization more accurate, ACK should include scheduling data.

Recommended compact JSON ACK:

```json
{
  "ack": 1,
  "nid": "N2",
  "seq": 124,
  "sleep": 600
}
```

Optional advanced ACK:

```json
{
  "ack": 1,
  "nid": "N2",
  "seq": 124,
  "gw_epoch": 1777550400,
  "next_sleep": 580,
  "rx_mode": "normal"
}
```

---

### 11.3 Node Behavior with ACK Sleep

If ACK contains `sleep` or `next_sleep`:

```text
Use Main-provided sleep value.
Reset txFailCount.
```

If ACK does not contain scheduling data:

```text
Use local normal sleep = 600s.
```

---

### 11.4 Why ACK Scheduling Is Better

Main Node has RTC and is the timing authority.

Therefore, Main can compute:

```text
next cycle boundary
node slot offset
recommended sleep duration
```

This allows nodes to return quickly to the expected superframe timing after any successful ACK.

---

## 12. Battery Replacement / Cold Start Scenario

### 12.1 Problem

After battery replacement, a node may reboot at a random time.

The node usually does not have its own RTC.

Therefore, it cannot know where it is inside Main Node’s 10-minute superframe.

---

### 12.2 Required Behavior

On cold boot or loss of RTC memory:

```text
1. Node sends as soon as its sensor measurement is ready.
2. If ACK is received:
     node becomes synchronized.
3. If no ACK:
     node enters recovery scan.
```

This makes battery replacement field-safe.

---

### 12.3 Expected Recovery Sequence

Example:

```text
Boot after battery replacement
↓
Send packet immediately
↓
No ACK
↓
Sleep 60s
↓
Send again
↓
No ACK
↓
Sleep 120s
↓
Send again
↓
ACK received
↓
Return to normal 600s schedule
```

---

## 13. Probability and Timing Analysis

### 13.1 Baseline Capture Probability

If a node transmits at a random phase and Main listens for 70 seconds in every 600-second cycle:

```text
P(capture per attempt) = 70 / 600 = 11.7%
```

This is low.

---

### 13.2 Extended RX Capture Probability

If Main extends RX to 120 seconds:

```text
P(capture per attempt) = 120 / 600 = 20%
```

This is better, but still not enough alone.

---

### 13.3 Why Phase Scanning Helps

The recovery scan changes the node’s transmission time relative to Main’s cycle:

```text
Attempt 1: current phase
Attempt 2: current phase + 60s
Attempt 3: current phase + 180s
Attempt 4: current phase + 480s
```

This samples different parts of the 600-second cycle.

The combination of:

```text
node phase scanning + temporary Main extended RX
```

creates a much higher probability of reconnecting within a small number of attempts than either technique alone.

---

### 13.4 Practical Expected Result

In practice, the expected behavior is:

| Scenario | Expected Misses |
|---|---|
| Single lost ACK | Usually 0–1 additional missed cycles |
| Node reboot with good radio link | Usually reconnects within a few attempts |
| Main reboot | Nodes reconnect after first successful overlap |
| Dead battery / powered-off node | Marked offline after bounded Main recovery |

---

## 14. Energy Analysis

### 14.1 Node Energy

The recovery scan increases wake frequency temporarily.

However:

```text
Only one packet is sent per wake.
LoRa is not kept in continuous RX.
Sensor is powered only during measurement.
Recovery returns to 600s after several failures.
```

Therefore, recovery is bounded and energy-safe.

---

### 14.2 Main Node Energy

Main Node temporarily increases RX window:

```text
70s → 120s
```

This is only for nodes with recent missing events and only for a limited number of cycles.

Recommended limit:

```text
max extended RX cycles = 2
```

---

### 14.3 Why Not Keep RX Open Longer

Long RX windows increase:

```text
LoRa active current
Main Node active time
Battery drain
SD/event activity
```

The design avoids permanent RX extension.

---

## 15. Recommended Parameters

| Parameter | Recommended Value | Notes |
|---|---:|---|
| Cycle duration | 600s | Existing system interval |
| Normal Main RX window | 70s | Current stable value |
| Recovery Main RX window | 120s | Temporary only |
| Max recovery RX cycles | 2 | After this, mark offline |
| Node recovery sleep #1 | 60s | Fast phase change |
| Node recovery sleep #2 | 120s | Second phase sample |
| Node recovery sleep #3 | 300s | Wide phase shift |
| Node recovery sleep #4+ | 600s | Low-power retry |
| ACK timeout | 1.5–2.0s | Keep short |
| Node TX retries per wake | 1 | Do not loop transmit |

---

## 16. Event Logging Requirements

Recovery must be visible in logs.

### 16.1 Node-Side Events or Packet Fields

Nodes should include recovery status in their packet where practical.

Recommended additional fields in future packets:

```json
{
  "rfail": 2,
  "rmode": 1
}
```

Where:

| Field | Meaning |
|---|---|
| `rfail` | Consecutive ACK failure count |
| `rmode` | 1 if node is in recovery mode, 0 otherwise |

If packet size is a concern, these fields can be deferred.

---

### 16.2 Main-Side Events

Main Node should generate events:

| Event Type | Severity | Meaning |
|---|---|---|
| `node_missing` | warning | Node missed expected cycle |
| `node_recovery_watch` | warning/info | Main extended RX due to missing node |
| `node_recovered` | info | Previously missing node returned |
| `node_offline` | error/warning | Node missed beyond recovery threshold |
| `duplicate_packet` | info/warning | Node resent old sequence due to ACK loss |

---

### 16.3 Event Details JSON

Recommended examples:

```json
{
  "node_id": "N2",
  "missed_count": 1,
  "frame_id": 2963421,
  "rx_window_ms": 120000
}
```

```json
{
  "node_id": "N2",
  "previous_missed_count": 2,
  "recovered_seq": 125,
  "rssi": -82,
  "snr": 9.5
}
```

---

## 17. Duplicate Packet Handling During Recovery

Recovery increases the chance that a node may resend a packet if ACK was lost but Main already stored it.

Therefore:

```text
Main Node must treat duplicate sequence numbers safely.
```

Recommended duplicate key:

```text
gateway_id + node_id + node_seq
```

If duplicate packet is received:

```text
Do not store duplicate reading.
Send ACK again.
Optionally log duplicate_packet event.
```

This helps the node return to normal mode without corrupting data.

---

## 18. Interaction With Sensor Errors

Recovery is about communication and synchronization.

It must not hide sensor failures.

Example:

```text
Node2 sensor fails but LoRa works
↓
Node2 sends error packet
↓
Main receives ACK
↓
txFailCount resets to 0
```

Reason:

```text
Communication succeeded even though sensor measurement failed.
```

Therefore:

| Case | Recovery? |
|---|---|
| Sensor error packet sent and ACKed | No communication recovery needed |
| Sensor error packet sent but no ACK | Yes, ACK failure recovery |
| Node sends nothing | Main missing-node recovery |
| Node powered off | Main recovery expires → offline |

---

## 19. Interaction With Main Local Soil Sensor

Main Node local soil sensor is independent from LoRa recovery.

Rules:

```text
Main local soil reading must still run during recovery RX cycles.
Recovery RX extension must not permanently remove local soil measurement time.
```

Recommended order remains:

```text
LoRa RX window
↓
Local soil measurement
↓
SD write
↓
Optional upload handling
↓
Sleep
```

If RX window is extended to 120s, the active cycle becomes longer and sleep duration must be shortened accordingly to preserve the 10-minute boundary where possible.

---

## 20. Interaction With Upload Mode

Manual upload must not be used as a recovery mechanism.

Rules:

```text
Upload mode must not force nodes to reconnect.
Upload mode must not keep LoRa RX open.
Upload mode should preserve normal recovery state.
```

If upload occurs after a recovery event, the logs will be uploaded and the dashboard can show the missing-node/recovery timeline.

---

## 21. Safety Rules

Recovery implementation must follow these safety rules:

```text
- No infinite retry loops.
- No continuous LoRa RX on sensor nodes.
- No continuous WiFi.
- No relay left ON.
- No MAX485 left in transmit mode.
- No fake readings to fill missing cycles.
- No clearing of missed counters without receiving a valid packet.
- No deletion of pending data because of recovery failure.
```

---

## 22. Firmware Implementation Checklist

### 22.1 Node2 / Node3

```text
[ ] Add RTC_DATA_ATTR txFailCount.
[ ] Detect ACK success/failure.
[ ] Reset txFailCount on valid ACK.
[ ] Increment txFailCount on ACK timeout.
[ ] Compute sleep using recovery sequence.
[ ] Send only once per wake.
[ ] Keep LoRa.sleep() before deep sleep.
[ ] Preserve existing sensor error behavior.
[ ] Do not change packet schema unless explicitly implementing recovery fields.
```

---

### 22.2 Main Node

```text
[ ] Add NodeHealth tracking for N2 and N3.
[ ] Reset node health when packet is received.
[ ] Increment missedCount when node is missing.
[ ] Enable recoveryWatch after first miss.
[ ] Extend RX window to 120s only when recoveryWatch active.
[ ] Limit extended RX to 2 cycles.
[ ] Mark node offline after threshold.
[ ] Log node_recovery_watch and node_recovered events.
[ ] Send ACK for duplicate packets.
[ ] Preserve local soil measurement.
[ ] Preserve SD readings/events schema.
```

---

## 23. Implementation Phases

### Phase 1 — Safe Local Recovery

Implement without changing ACK packet format.

```text
Node: txFailCount + recovery sleep sequence
Main: NodeHealth + temporary RX extension
```

This phase is low-risk and compatible with current packets.

---

### Phase 2 — ACK Scheduling

Extend ACK to include scheduling hints.

```text
ACK includes sleep or next_sleep
Node uses ACK-provided sleep after success
```

This improves long-term synchronization.

---

### Phase 3 — Dashboard Visibility

Expose recovery events to WebService/dashboard.

```text
node_missing
node_recovery_watch
node_recovered
node_offline
duplicate_packet
```

This improves diagnostics without changing measurement data.

---

## 24. Stop Conditions for Future Implementation Agents

A firmware agent must pause before applying recovery code if:

```text
- Existing ACK format is unclear.
- Node sleep scheduling is not centralized.
- Main RX window timing is hard-coded in multiple places.
- Duplicate detection is not implemented.
- Changing RX duration would skip local soil measurement.
- Recovery fields would change WebService payload schema unexpectedly.
```

---

## 25. Final Recommended Algorithm

### Node Algorithm

```text
After each LoRa send:
  if ACK received:
      txFailCount = 0
      sleep 600s or ACK-provided sleep
  else:
      txFailCount++
      if txFailCount == 1: sleep 60s
      if txFailCount == 2: sleep 120s
      if txFailCount == 3: sleep 300s
      if txFailCount >= 4: sleep 600s
```

### Main Algorithm

```text
Each cycle:
  set RX window:
      120s if any node is in recoveryWatch with missedCount <= 2
      otherwise 70s

  receive packets:
      on valid packet:
          send ACK
          if node was missing:
              log node_recovered
          reset missedCount and recoveryWatch

  after RX window:
      for each expected node not received:
          missedCount++
          log node_missing
          if missedCount <= 2:
              recoveryWatch = true
              log node_recovery_watch
          else:
              recoveryWatch = false
              log node_offline
```

---

## 26. Final Design Summary

This recovery strategy combines:

```text
Node-side phase scanning
+
Main-side temporary RX extension
+
ACK-based reset of recovery state
+
bounded low-power behavior
```

It is designed to:

```text
- reduce missed cycles after failure,
- recover after battery replacement,
- avoid permanent high-power listening,
- preserve existing data integrity,
- keep all failures visible through structured logs.
```

Recommended implementation status:

```text
Ready for future firmware implementation as Phase 1 recovery.
```
