# Chart Definitions

All charts support time-range selection: **last 24h · 7d · 30d · custom range**.
Missing data is always shown as explicit gaps (no interpolation across NULL or status=missing points).
Error-status readings are shown as distinct colored markers, not silently excluded.

Color system (consistent across all pages):
- Pivot 1: blue (`#2563EB`)
- Pivot 2: green (`#16A34A`)
- Weather: amber (`#D97706`)
- Error / anomaly: red (`#DC2626`)
- Missing: grey (`#9CA3AF`)
- Warning: orange (`#EA580C`)

---

## Overview Page Charts

### O-1: KPI Sparklines
- **Type:** Mini area sparkline (no axis labels)
- **One per KPI:** Pivot 1 soil moisture, Pivot 1 soil temp, Pivot 2 soil moisture, Pivot 2 soil temp, air temp, air humidity, air pressure
- **X axis:** last 24h (fixed, not adjustable on overview)
- **Y axis:** no labels; proportional height only
- **Data:** hourly averages of `measured_at` + metric field per node_id
- **Missing data:** flat line at zero-height with grey fill to distinguish from real zero

---

## Pivot 1 Soil Page Charts

### P1-1: Soil Temperature Over Time
- **Type:** Line chart with point markers
- **Y axis:** °C, range −20 to 80 (fixed to sensor limits)
- **X axis:** measured_at, bucketed per time range (10-min raw for 24h; hourly avg for 7d; daily avg for 30d)
- **Series:** One line for node_id="MAIN"
- **Missing data:** Break in line at status=missing points; grey marker at the gap
- **Anomaly markers:** Red dot at status=error or status=partial readings; clicking opens the nearest event in Logs
- **Reference band:** Optional configurable normal range (e.g. 15–35 °C) shown as light fill

### P1-2: Soil Moisture Over Time
- **Type:** Line chart with point markers
- **Y axis:** %, range 0 to 100 (fixed)
- **X axis:** same bucketing as P1-1
- **Series:** One line for node_id="MAIN", soil_moisture_percent
- **Missing data:** Break in line; grey marker
- **Anomaly markers:** Red dot at error/partial; threshold line at user-configured dry threshold

### P1-3: Soil EC Over Time
- **Type:** Line chart with point markers
- **Y axis:** µS/cm, range 0 to 20000 (firmware validated limit)
- **X axis:** same bucketing
- **Series:** One line for node_id="MAIN", soil_ec_us_cm
- **Missing data:** Break in line; grey marker
- **Anomaly markers:** Red dot at error/partial

### P1-4: Daily Summary — Min / Avg / Max Bands
- **Type:** Area band chart (min–max shaded region, avg as central line)
- **Y axis:** one panel each for temperature, moisture, EC
- **X axis:** one bar per calendar day
- **Purpose:** Show daily variability at a glance
- **Data query:** GROUP BY calendar day, MIN/AVG/MAX per metric

### P1-5: Reading Status Distribution
- **Type:** Stacked bar chart, one bar per day
- **Segments:** ok (blue) / partial (yellow) / error (red) / missing (grey)
- **Purpose:** Quickly spot bad days
- **Y axis:** count of readings

---

## Pivot 2 Soil Page Charts

Identical chart set to Pivot 1 (P1-1 through P1-5) but scoped to node_id="N2".

### P2-6: LoRa Signal Quality — RSSI Over Time
- **Type:** Line chart
- **Y axis:** dBm, typical range −60 to −120 (inverted: less negative = better)
- **X axis:** measured_at, 10-min resolution for 24h; hourly avg for 7d/30d
- **Series:** rssi for node_id="N2"
- **Reference line:** −110 dBm weak-signal warning threshold
- **Missing data:** Break in line

### P2-7: LoRa Signal Quality — SNR Over Time
- **Type:** Line chart
- **Y axis:** dB, typical range −20 to +15
- **X axis:** same as P2-6
- **Series:** snr for node_id="N2"
- **Reference line:** 0 dB threshold (below 0 = noise-floor limited)
- **Missing data:** Break in line

---

## Weather Page Charts

### W-1: Air Temperature Over Time
- **Type:** Line chart with point markers
- **Y axis:** °C, range −40 to 85 (BME280 limits)
- **X axis:** measured_at, bucketed per range
- **Series:** air_temperature_c for node_id="N3"
- **Missing data:** Break in line; grey marker

### W-2: Air Humidity Over Time
- **Type:** Line chart
- **Y axis:** %, range 0 to 100
- **Series:** air_humidity_percent

### W-3: Air Pressure Over Time
- **Type:** Line chart
- **Y axis:** hPa, range 950 to 1050 (typical ground-level; expand to 300–1200 if out of range)
- **Series:** air_pressure_hpa

### W-4: Weather Daily Summary Bands
- **Type:** Area band (min/avg/max) — one panel per metric
- **X axis:** calendar days

### W-5: LoRa Signal Quality (N3)
- **Type:** Dual-line chart (RSSI + SNR)
- **Same spec as P2-6 and P2-7** but scoped to node_id="N3"

### W-6: Weather Reading Status Distribution
- **Type:** Stacked bar by day, same segments as P1-5

---

## Pivot Comparison Page Charts

### C-1: Soil Temperature Comparison
- **Type:** Dual-line chart
- **Y axis:** °C, identical scale for both pivots (do not auto-scale per pivot)
- **Series:** Pivot 1 (node_id=MAIN, blue solid) vs Pivot 2 (node_id=N2, green dashed)
- **X axis:** same measured_at, aligned on shared time axis
- **Missing data:** Each series shows its own gaps independently; not synchronized

### C-2: Soil Moisture Comparison
- **Type:** Dual-line chart
- **Y axis:** %, 0–100, identical scale
- **Series:** Pivot 1 vs Pivot 2

### C-3: Soil EC Comparison
- **Type:** Dual-line chart
- **Y axis:** µS/cm, 0–20000, identical scale
- **Series:** Pivot 1 vs Pivot 2

### C-4: Delta Panel (numeric, not a chart)
- **Type:** KPI cards with direction arrows
- **Shows:** Pivot 1 − Pivot 2 for each metric at the latest shared timestamp
- **Format:** "Pivot 1 is 2.3 °C warmer" / "Pivot 2 is 8% drier"

### C-5: Soil-Weather Correlation
- **Type:** Scatter plot
- **X axis:** air_temperature_c (N3)
- **Y axis:** soil_moisture_percent
- **Color encoding:** Pivot 1 = blue, Pivot 2 = green
- **Purpose:** Visualize whether evapotranspiration-driven drying is consistent across both pivots
- **Only shown when date range ≥ 7d** (insufficient correlation signal in 24h)

---

## Upload History Page Charts

### U-1: Upload Success / Failure Over Time
- **Type:** Bar chart, one bar per calendar day
- **Segments:** successful uploads (blue) / failed uploads (red) / no upload (grey gap)
- **Data source:** uploads table, group by date of received_at
- **Purpose:** Spot days with no data transfer

### U-2: Records per Upload
- **Type:** Bar chart, one bar per upload session (X = received_at)
- **Y axis:** count of readings inserted
- **Tooltip:** shows upload_id, duplicate count, event count

---

## System Health Page Charts

### H-1: RSSI Trend — Both Remote Nodes
- **Type:** Dual-line chart
- **Series:** N2 (green) and N3 (amber)
- **Y axis:** dBm, shared scale
- **Purpose:** Detect LoRa link degradation across nodes simultaneously

### H-2: SNR Trend — Both Remote Nodes
- **Type:** Dual-line chart
- **Series:** N2 (green) and N3 (amber)

### H-3: Node Boot Count Over Time
- **Type:** Step chart
- **Source:** node_boot field in raw_payload JSONB (if extracted), or boot-related events
- **Purpose:** Abnormally rapid boot count increase indicates node reset loop
- **Open question:** raw_payload is in DB but not exposed by current API; requires new endpoint or JSON extraction query

### H-4: Node Stage at Packet Receipt
- **Type:** Scatter / jitter plot
- **X axis:** time
- **Y axis:** node stage value (0–12 for N2; 0–9 for N3)
- **Series:** N2 and N3 separately
- **Purpose:** Stage < 8 on N2 = sensor/relay failed before LoRa; stage < 4 on N3 = BME280 failed
- **Source:** raw_payload JSONB `stg` field; requires extraction at API level

### H-5: Event Severity Distribution
- **Type:** Donut chart
- **Segments:** info / warning / error / critical — count over selected time range
- **Filter:** applies to all nodes combined; separate donuts per node on expand

### H-6: Error Code Frequency
- **Type:** Horizontal bar chart, sorted by count descending
- **X axis:** count
- **Y axis:** error_code value
- **Source:** system_events.error_code, grouped and counted
- **Time range:** selectable
- **Purpose:** Identify the most common failure mode without reading every log row

---

## Logs / Events Page Charts

### L-1: Event Timeline
- **Type:** Swimlane timeline (one lane per severity)
- **X axis:** event_time
- **Marks:** colored dots per event; hovering shows message; clicking expands detail row
- **Lane order:** critical (top) → error → warning → info (bottom)
- **Time range:** inherits page filter

### L-2: Events per Day (mini histogram)
- **Type:** Small stacked bar above the timeline
- **Purpose:** Navigate to dense event days
- **Segments:** same severity color encoding


---

# Revision Addendum — Alfalfa-Specific Analytical Charts

The dashboard charts must evolve from generic sensor plots into alfalfa-oriented decision-support visuals. All derived charts must clearly state confidence and must only use available fields plus manual agronomic events.

## Alfalfa Insight Charts

### A-1: Irrigation Response — Moisture Before/After Irrigation

- **Type:** Event-aligned time-series
- **Data:** soil_moisture_percent for Pivot 1 and Pivot 2 + `irrigation_session`
- **X axis:** time around irrigation event, e.g. −6h to +24h
- **Purpose:** Show whether soil moisture increased after irrigation
- **Interpretation:** If irrigation is recorded but moisture does not respond, flag possible distribution, sensor, or timing issue
- **Confidence:** medium unless irrigation amount/duration is complete

### A-2: Daily Water Stress Risk

- **Type:** daily status band / heatmap
- **Inputs:** soil moisture trend, configured refill point if available, air temperature
- **Output:** `low`, `watch`, `possible_stress`
- **Rule:** If no calibrated refill point exists, label as “trend-based only”
- **Do not:** claim actual crop water deficit without calibration

### A-3: Soil Moisture vs Irrigation Timeline

- **Type:** line chart with vertical irrigation bands
- **Series:** Pivot 1 and Pivot 2 moisture
- **Overlays:** irrigation start/end shaded bands
- **Purpose:** Make daily irrigation effectiveness visible

### A-4: Alfalfa Heat Stress Hours

- **Type:** daily stacked bar
- **Input:** air_temperature_c
- **Bands:**
  - below 10°C: slow growth risk
  - 10–30°C: generally favorable
  - above 30°C: possible heat stress
  - above 35°C: high heat load
- **Purpose:** summarize weather pressure on crop

### A-5: Emergence Suitability Window

- **Type:** soil temperature timeline with reference bands
- **Use only:** when planting date exists and before establishment phase is complete
- **Input:** soil_temperature_c
- **Purpose:** indicate whether soil temperature conditions are suitable for emergence
- **Note:** Emergence date is manual confirmation, not automatically inferred

### A-6: Regrowth After Cutting

- **Type:** timeline from each cutting event
- **Inputs:** cutting date, weather temperature, soil moisture
- **Purpose:** show environmental support or stress during regrowth
- **Reminder:** After cutting, prompt for yield and track days since cutting

### A-7: EC / Salinity Indicator Trend

- **Type:** EC line chart with moving baseline
- **Input:** soil_ec_us_cm
- **Overlays:** irrigation and fertilization events
- **Purpose:** distinguish concentration effect, irrigation dilution, or fertilizer-related EC changes
- **Warning label:** “EC is an indicator and is not laboratory ECe unless calibrated.”

### A-8: Fertilization Impact Window

- **Type:** before/after EC and moisture view
- **Window:** −48h to +7d around fertilization event
- **Purpose:** explain EC changes after fertilizer applications
- **Do not:** diagnose nutrient sufficiency

### A-9: Cutting Yield Trend

- **Type:** bar chart by cutting number
- **Input:** yield_per_cutting events
- **Derived:** cumulative season yield
- **Purpose:** production history

### A-10: Data Confidence Overlay

- **Type:** overlay badge / secondary strip under charts
- **Inputs:** missing readings, sensor errors, upload age, technical events
- **Purpose:** indicate whether agronomic conclusions are reliable for the selected period

---

## Chart Marker Rules

Manual agronomic events appear as chart markers:

| Event | Marker |
|---|---|
| irrigation_session | blue vertical band from start to end |
| cutting | purple vertical line |
| fertilization | green vertical line |
| field_note | note icon |
| yield_per_cutting | bar / annotation after cutting |

Technical system events remain red/orange warning markers and link to Logs / Events.

---

## Alfalfa Dashboard Safety Rules

- Do not show pH or NPK because the system does not measure them.
- Do not claim disease detection from humidity alone.
- Do not claim official salinity class from raw soil EC.
- Do not claim yield prediction unless manually entered yield history exists.
- Always distinguish measured values, manual events, and derived indicators.


---

# Core Architecture Rule — Data Separation (Non-Negotiable)

The system enforces strict separation between three data domains:

1. Sensor Data (`sensor_readings`)
2. Agronomic Manual Data (`agronomic_events`)
3. System Logs (`system_events`)

## Rules

- These datasets MUST NOT be merged at storage level.
- They MUST NOT share tables or schemas.
- They MUST NOT be displayed as a single dataset.

## Integration Strategy

Integration happens ONLY at:

- Chart overlays
- Time-aligned analytics
- Insight generation
- Cross-navigation between pages

## Forbidden

- Joining readings + logs into one table
- Treating agronomic events as sensor data
- Mixing logs into agronomy workflows

## Allowed

- Overlay irrigation on moisture chart
- Overlay fertilization on EC chart
- Link logs to readings via time window
- Show confidence layer combining all sources

## Guiding Principle

"Separate at storage, integrate at interpretation."

