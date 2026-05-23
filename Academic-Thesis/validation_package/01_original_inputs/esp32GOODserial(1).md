ets Jul 29 2019 12:21:46

rst:0x1 (POWERON_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 1 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963004 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=13406
[LoRa] RX 172 B  RSSI=-95  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":0,"boot":1,"stg":7,"uptime":5634,"temp":23.3,"mois":22.5,"ec":259,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=0 sleep=591 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=13 slot_offset=10 boot_to_tx_sec=6 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=14369 ack_end_ms=14721 ack_tx_ms=352
[Timing] return_to_rx_ms=14732
[LoRa] packet_received N2 seq=0 status=ok
[Timing] rx_elapsed_ms=20619
[LoRa] RX 181 B  RSSI=-94  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":0,"boot":1,"stg":5,"uptime":753,"temp":24.9,"hum":48.2,"pres":1014.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=0 sleep=619 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=20 slot_offset=40 boot_to_tx_sec=1 sleep_hint=619 sleep_src=cycle_based
[Timing] ack_start_ms=21581 ack_end_ms=21933 ack_tx_ms=352
[Timing] return_to_rx_ms=21944
[LoRa] packet_received N3 seq=0 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.7 ec=1104
[LocalSoil] Read ok — temp=23.7 mois=25.2 ec=1104.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963004 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 574 s  (active was 26 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 2 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963005 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15332
[LoRa] RX 172 B  RSSI=-95  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":1,"boot":2,"stg":7,"uptime":5634,"temp":23.3,"mois":22.5,"ec":258,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=1 sleep=589 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=15 slot_offset=10 boot_to_tx_sec=6 sleep_hint=589 sleep_src=cycle_based
[Timing] ack_start_ms=16245 ack_end_ms=16597 ack_tx_ms=352
[Timing] return_to_rx_ms=16608
[LoRa] packet_received N2 seq=1 status=ok
[Timing] rx_elapsed_ms=46551
[LoRa] RX 181 B  RSSI=-92  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":1,"boot":2,"stg":5,"uptime":753,"temp":24.6,"hum":48.3,"pres":1014.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=1 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47464 ack_end_ms=47816 ack_tx_ms=352
[Timing] return_to_rx_ms=47827
[LoRa] packet_received N3 seq=1 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.7 ec=1102
[LocalSoil] Read ok — temp=23.7 mois=25.2 ec=1102.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963005 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 3 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963006 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16700
[LoRa] RX 172 B  RSSI=-97  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":2,"boot":3,"stg":7,"uptime":5634,"temp":23.4,"mois":22.5,"ec":259,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=2 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17613 ack_end_ms=17965 ack_tx_ms=352
[Timing] return_to_rx_ms=17976
[LoRa] packet_received N2 seq=2 status=ok
[Timing] rx_elapsed_ms=47681
[LoRa] RX 181 B  RSSI=-81  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":2,"boot":3,"stg":5,"uptime":753,"temp":24.6,"hum":47.3,"pres":1014.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=2 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48595 ack_end_ms=48947 ack_tx_ms=352
[Timing] return_to_rx_ms=48958
[LoRa] packet_received N3 seq=2 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.6 ec=1102
[LocalSoil] Read ok — temp=23.6 mois=25.2 ec=1102.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963006 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 4 | RTC=1 SD=1 LoRa=1
[MainNode] EXT0 long-press — entering upload mode
[WiFi] Connecting...
[WiFi] Connected  IP=10.59.197.247
[Upload] Uploading /DATA/2026/05/2026-05-03_upload_queue.jsonl
[Upload] Attempt 1/3 — /DATA/2026/05/2026-05-03_upload_queue.jsonl
[Upload] Payload: 150 readings, 105 events
[Upload] Payload size: 170 bytes
[Upload] Attempt 1 — HTTP 400
[Upload] Error body (attempt 1): {"error":"Invalid JSON","message":"Request body contains invalid JSON"}
[Upload] Retry 2/3 in 5000 ms
[Upload] Attempt 2/3 — /DATA/2026/05/2026-05-03_upload_queue.jsonl
[Upload] Payload: 150 readings, 107 events
[Upload] Payload size: 168 bytes
[Upload] Attempt 2 — HTTP 400
[Upload] Error body (attempt 2): {"error":"Invalid JSON","message":"Request body contains invalid JSON"}
[Upload] Retry 3/3 in 5000 ms
[Upload] Attempt 3/3 — /DATA/2026/05/2026-05-03_upload_queue.jsonl
[Upload] Payload: 150 readings, 109 events
[Upload] Payload size: 168 bytes
[Upload] Attempt 3 — HTTP 400
[Upload] Error body (attempt 3): {"error":"Invalid JSON","message":"Request body contains invalid JSON"}
[WiFi] Disconnected and disabled
[MainNode] Upload finished
[MainNode] Sleeping until next cycle boundary, sleepSec = 29
[MainNode] Prepared for sleep
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 5 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963007 — opening LoRa RX window (70000 ms, recovery=0)
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[SD] Missing reading logged for N3
[LocalSoil] mois=25.1 temp=23.6 ec=1102
[LocalSoil] Read ok — temp=23.6 mois=25.1 ec=1102.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963007 rcvN2=0 rcvN3=0 missN2=1 missN3=1 mainSoil=1 qRead=3 qEvt=4
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 6 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963007 — opening LoRa RX window (120000 ms, recovery=1)
[Timing] rx_elapsed_ms=7494
[LoRa] RX 181 B  RSSI=-93  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":6,"boot":7,"stg":5,"uptime":753,"temp":24.7,"hum":47.6,"pres":1014.3,"rfail":3,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=6 sleep=632 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=7 slot_offset=40 boot_to_tx_sec=1 sleep_hint=632 sleep_src=cycle_based
[Timing] ack_start_ms=8477 ack_end_ms=8829 ack_tx_ms=352
[Timing] return_to_rx_ms=8840
[LoRa] packet_received N3 seq=6 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.6 ec=1102
[LocalSoil] Read ok — temp=23.6 mois=25.2 ec=1102.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963007 rcvN2=0 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=2 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 475 s  (active was 125 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 7 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963008 — opening LoRa RX window (120000 ms, recovery=1)
[Timing] rx_elapsed_ms=6421
[LoRa] RX 172 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":7,"boot":8,"stg":7,"uptime":5634,"temp":23.5,"mois":22.5,"ec":260,"rfail":4,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=7 sleep=598 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=6 slot_offset=10 boot_to_tx_sec=6 sleep_hint=598 sleep_src=cycle_based
[Timing] ack_start_ms=7397 ack_end_ms=7748 ack_tx_ms=351
[Timing] return_to_rx_ms=7759
[LoRa] packet_received N2 seq=7 status=ok
[Timing] rx_elapsed_ms=47382
[LoRa] RX 181 B  RSSI=-63  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":7,"boot":8,"stg":5,"uptime":753,"temp":25.0,"hum":47.0,"pres":1014.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=7 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48295 ack_end_ms=48647 ack_tx_ms=352
[Timing] return_to_rx_ms=48658
[LoRa] packet_received N3 seq=7 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.6 ec=1100
[LocalSoil] Read ok — temp=23.6 mois=25.2 ec=1100.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963008 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=3
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 8 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963009 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16891
[LoRa] RX 172 B  RSSI=-93  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":8,"boot":9,"stg":7,"uptime":5634,"temp":23.5,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=8 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17804 ack_end_ms=18156 ack_tx_ms=352
[Timing] return_to_rx_ms=18167
[LoRa] packet_received N2 seq=8 status=ok
[Timing] rx_elapsed_ms=47535
[LoRa] RX 181 B  RSSI=-63  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":8,"boot":9,"stg":5,"uptime":753,"temp":25.0,"hum":47.5,"pres":1014.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=8 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48449 ack_end_ms=48801 ack_tx_ms=352
[Timing] return_to_rx_ms=48812
[LoRa] packet_received N3 seq=8 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.6 ec=1098
[LocalSoil] Read ok — temp=23.6 mois=25.2 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963009 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 9 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963010 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17162
[LoRa] RX 173 B  RSSI=-93  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":9,"boot":10,"stg":7,"uptime":5634,"temp":23.5,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=9 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18076 ack_end_ms=18428 ack_tx_ms=352
[Timing] return_to_rx_ms=18439
[LoRa] packet_received N2 seq=9 status=ok
[Timing] rx_elapsed_ms=46859
[LoRa] RX 182 B  RSSI=-63  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":9,"boot":10,"stg":5,"uptime":753,"temp":25.0,"hum":47.6,"pres":1014.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=9 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47772 ack_end_ms=48124 ack_tx_ms=352
[Timing] return_to_rx_ms=48135
[LoRa] packet_received N3 seq=9 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.6 ec=1100
[LocalSoil] Read ok — temp=23.6 mois=25.2 ec=1100.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963010 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 10 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963011 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16139
[LoRa] RX 174 B  RSSI=-93  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":10,"boot":11,"stg":7,"uptime":5634,"temp":23.5,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=10 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17053 ack_end_ms=17405 ack_tx_ms=352
[Timing] return_to_rx_ms=17416
[LoRa] packet_received N2 seq=10 status=ok
[Timing] rx_elapsed_ms=46516
[LoRa] RX 183 B  RSSI=-62  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":10,"boot":11,"stg":5,"uptime":753,"temp":25.0,"hum":47.1,"pres":1013.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=10 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47441 ack_end_ms=47793 ack_tx_ms=352
[Timing] return_to_rx_ms=47804
[LoRa] packet_received N3 seq=10 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1098
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963011 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 11 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963012 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16336
[LoRa] RX 174 B  RSSI=-94  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":11,"boot":12,"stg":7,"uptime":5635,"temp":23.5,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=11 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17250 ack_end_ms=17601 ack_tx_ms=351
[Timing] return_to_rx_ms=17612
[LoRa] packet_received N2 seq=11 status=ok
[Timing] rx_elapsed_ms=47427
[LoRa] RX 183 B  RSSI=-62  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":11,"boot":12,"stg":5,"uptime":753,"temp":25.0,"hum":47.3,"pres":1013.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=11 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48341 ack_end_ms=48693 ack_tx_ms=352
[Timing] return_to_rx_ms=48704
[LoRa] packet_received N3 seq=11 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.6 ec=1098
[LocalSoil] Read ok — temp=23.6 mois=25.1 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963012 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 12 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963013 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17260
[LoRa] RX 174 B  RSSI=-93  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":12,"boot":13,"stg":7,"uptime":5634,"temp":23.5,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=12 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18174 ack_end_ms=18526 ack_tx_ms=352
[Timing] return_to_rx_ms=18537
[LoRa] packet_received N2 seq=12 status=ok
[Timing] rx_elapsed_ms=48291
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":12,"boot":13,"stg":5,"uptime":753,"temp":25.0,"hum":47.7,"pres":1013.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=12 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49216 ack_end_ms=49568 ack_tx_ms=352
[Timing] return_to_rx_ms=49579
[LoRa] packet_received N3 seq=12 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.6 ec=1098
[LocalSoil] Read ok — temp=23.6 mois=25.1 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963013 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 546 s  (active was 54 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 13 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963014 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17234
[LoRa] RX 174 B  RSSI=-93  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":13,"boot":14,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":260,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=13 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18148 ack_end_ms=18500 ack_tx_ms=352
[Timing] return_to_rx_ms=18511
[LoRa] packet_received N2 seq=13 status=ok
[Timing] rx_elapsed_ms=47828
[LoRa] RX 183 B  RSSI=-62  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":13,"boot":14,"stg":5,"uptime":753,"temp":25.0,"hum":47.5,"pres":1013.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=13 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48742 ack_end_ms=49094 ack_tx_ms=352
[Timing] return_to_rx_ms=49105
[LoRa] packet_received N3 seq=13 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1098
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963014 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 14 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963015 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17282
[LoRa] RX 174 B  RSSI=-92  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":14,"boot":15,"stg":7,"uptime":5634,"temp":23.6,"mois":22.6,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=14 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18196 ack_end_ms=18548 ack_tx_ms=352
[Timing] return_to_rx_ms=18559
[LoRa] packet_received N2 seq=14 status=ok
[Timing] rx_elapsed_ms=46608
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":14,"boot":15,"stg":5,"uptime":753,"temp":25.0,"hum":46.9,"pres":1013.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=14 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47532 ack_end_ms=47884 ack_tx_ms=352
[Timing] return_to_rx_ms=47895
[LoRa] packet_received N3 seq=14 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.2 temp=23.7 ec=1098
[LocalSoil] Read ok — temp=23.7 mois=25.2 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963015 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 15 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963016 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16312
[LoRa] RX 174 B  RSSI=-93  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":15,"boot":16,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=15 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17225 ack_end_ms=17577 ack_tx_ms=352
[Timing] return_to_rx_ms=17588
[LoRa] packet_received N2 seq=15 status=ok
[Timing] rx_elapsed_ms=47228
[LoRa] RX 183 B  RSSI=-62  SNR=10.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":15,"boot":16,"stg":5,"uptime":753,"temp":25.1,"hum":46.9,"pres":1013.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=15 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48142 ack_end_ms=48494 ack_tx_ms=352
[Timing] return_to_rx_ms=48505
[LoRa] packet_received N3 seq=15 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1098
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1098.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963016 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 16 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963017 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15741
[LoRa] RX 174 B  RSSI=-93  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":16,"boot":17,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=16 sleep=589 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=589 sleep_src=cycle_based
[Timing] ack_start_ms=16655 ack_end_ms=17007 ack_tx_ms=352
[Timing] return_to_rx_ms=17018
[LoRa] packet_received N2 seq=16 status=ok
[Timing] rx_elapsed_ms=46387
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":16,"boot":17,"stg":5,"uptime":753,"temp":25.1,"hum":47.5,"pres":1013.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=16 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47312 ack_end_ms=47664 ack_tx_ms=352
[Timing] return_to_rx_ms=47675
[LoRa] packet_received N3 seq=16 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1096
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963017 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 17 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963018 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17774
[LoRa] RX 174 B  RSSI=-94  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":17,"boot":18,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=17 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18688 ack_end_ms=19040 ack_tx_ms=352
[Timing] return_to_rx_ms=19051
[LoRa] packet_received N2 seq=17 status=ok
[Timing] rx_elapsed_ms=48114
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":17,"boot":18,"stg":5,"uptime":753,"temp":25.1,"hum":46.9,"pres":1013.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=17 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49028 ack_end_ms=49380 ack_tx_ms=352
[Timing] return_to_rx_ms=49391
[LoRa] packet_received N3 seq=17 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1096
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963018 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 18 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963019 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17290
[LoRa] RX 174 B  RSSI=-94  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":18,"boot":19,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=18 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18204 ack_end_ms=18556 ack_tx_ms=352
[Timing] return_to_rx_ms=18567
[LoRa] packet_received N2 seq=18 status=ok
[Timing] rx_elapsed_ms=46958
[LoRa] RX 183 B  RSSI=-63  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":18,"boot":19,"stg":5,"uptime":753,"temp":25.1,"hum":46.8,"pres":1012.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=18 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47882 ack_end_ms=48234 ack_tx_ms=352
[Timing] return_to_rx_ms=48245
[LoRa] packet_received N3 seq=18 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.7 ec=1096
[LocalSoil] Read ok — temp=23.7 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963019 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 19 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963020 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16251
[LoRa] RX 174 B  RSSI=-93  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":19,"boot":20,"stg":7,"uptime":5634,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=19 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17165 ack_end_ms=17516 ack_tx_ms=351
[Timing] return_to_rx_ms=17527
[LoRa] packet_received N2 seq=19 status=ok
[Timing] rx_elapsed_ms=45999
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":19,"boot":20,"stg":5,"uptime":753,"temp":25.2,"hum":47.1,"pres":1012.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=19 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=46924 ack_end_ms=47276 ack_tx_ms=352
[Timing] return_to_rx_ms=47287
[LoRa] packet_received N3 seq=19 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.8 ec=1094
[LocalSoil] Read ok — temp=23.8 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963020 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 549 s  (active was 51 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 20 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963021 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15858
[LoRa] RX 174 B  RSSI=-94  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":20,"boot":21,"stg":7,"uptime":5635,"temp":23.6,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=20 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=16771 ack_end_ms=17123 ack_tx_ms=352
[Timing] return_to_rx_ms=17134
[LoRa] packet_received N2 seq=20 status=ok
[Timing] rx_elapsed_ms=46686
[LoRa] RX 183 B  RSSI=-63  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":20,"boot":21,"stg":5,"uptime":753,"temp":25.2,"hum":47.0,"pres":1012.7,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=20 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47610 ack_end_ms=47962 ack_tx_ms=352
[Timing] return_to_rx_ms=47973
[LoRa] packet_received N3 seq=20 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.8 ec=1094
[LocalSoil] Read ok — temp=23.8 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963021 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 21 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963022 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16222
[LoRa] RX 174 B  RSSI=-93  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":21,"boot":22,"stg":7,"uptime":5634,"temp":23.7,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=21 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17135 ack_end_ms=17487 ack_tx_ms=352
[Timing] return_to_rx_ms=17498
[LoRa] packet_received N2 seq=21 status=ok
[Timing] rx_elapsed_ms=48304
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":21,"boot":22,"stg":5,"uptime":753,"temp":25.3,"hum":46.6,"pres":1012.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=21 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49228 ack_end_ms=49580 ack_tx_ms=352
[Timing] return_to_rx_ms=49591
[LoRa] packet_received N3 seq=21 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.8 ec=1094
[LocalSoil] Read ok — temp=23.8 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963022 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 546 s  (active was 54 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 22 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963023 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16436
[LoRa] RX 174 B  RSSI=-93  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":22,"boot":23,"stg":7,"uptime":5634,"temp":23.7,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=22 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17349 ack_end_ms=17701 ack_tx_ms=352
[Timing] return_to_rx_ms=17712
[LoRa] packet_received N2 seq=22 status=ok
[Timing] rx_elapsed_ms=47478
[LoRa] RX 183 B  RSSI=-62  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":22,"boot":23,"stg":5,"uptime":753,"temp":25.3,"hum":46.3,"pres":1012.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=22 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48403 ack_end_ms=48755 ack_tx_ms=352
[Timing] return_to_rx_ms=48766
[LoRa] packet_received N3 seq=22 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.8 ec=1094
[LocalSoil] Read ok — temp=23.8 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963023 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 23 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963024 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17243
[LoRa] RX 174 B  RSSI=-93  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":23,"boot":24,"stg":7,"uptime":5634,"temp":23.7,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=23 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18157 ack_end_ms=18509 ack_tx_ms=352
[Timing] return_to_rx_ms=18520
[LoRa] packet_received N2 seq=23 status=ok
[Timing] rx_elapsed_ms=47985
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":23,"boot":24,"stg":5,"uptime":753,"temp":25.3,"hum":46.4,"pres":1012.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=23 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48899 ack_end_ms=49251 ack_tx_ms=352
[Timing] return_to_rx_ms=49262
[LoRa] packet_received N3 seq=23 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.9 ec=1094
[LocalSoil] Read ok — temp=23.9 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963024 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 24 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963025 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16898
[LoRa] RX 174 B  RSSI=-91  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":24,"boot":25,"stg":7,"uptime":5634,"temp":23.7,"mois":22.6,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=24 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17812 ack_end_ms=18164 ack_tx_ms=352
[Timing] return_to_rx_ms=18175
[LoRa] packet_received N2 seq=24 status=ok
[Timing] rx_elapsed_ms=46857
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":24,"boot":25,"stg":5,"uptime":753,"temp":25.4,"hum":45.7,"pres":1011.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=24 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47770 ack_end_ms=48122 ack_tx_ms=352
[Timing] return_to_rx_ms=48133
[LoRa] packet_received N3 seq=24 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.9 ec=1094
[LocalSoil] Read ok — temp=23.9 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963025 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 25 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963026 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16386
[LoRa] RX 174 B  RSSI=-93  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":25,"boot":26,"stg":7,"uptime":5634,"temp":23.8,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=25 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17300 ack_end_ms=17652 ack_tx_ms=352
[Timing] return_to_rx_ms=17663
[LoRa] packet_received N2 seq=25 status=ok
[Timing] rx_elapsed_ms=46583
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":25,"boot":26,"stg":5,"uptime":753,"temp":25.4,"hum":46.2,"pres":1011.7,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=25 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47497 ack_end_ms=47849 ack_tx_ms=352
[Timing] return_to_rx_ms=47860
[LoRa] packet_received N3 seq=25 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.9 ec=1094
[LocalSoil] Read ok — temp=23.9 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963026 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 26 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963027 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16869
[LoRa] RX 174 B  RSSI=-93  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":26,"boot":27,"stg":7,"uptime":5634,"temp":23.8,"mois":22.5,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=26 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17783 ack_end_ms=18135 ack_tx_ms=352
[Timing] return_to_rx_ms=18146
[LoRa] packet_received N2 seq=26 status=ok
[Timing] rx_elapsed_ms=48171
[LoRa] RX 183 B  RSSI=-62  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":26,"boot":27,"stg":5,"uptime":753,"temp":25.5,"hum":45.7,"pres":1011.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=26 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49085 ack_end_ms=49437 ack_tx_ms=352
[Timing] return_to_rx_ms=49448
[LoRa] packet_received N3 seq=26 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.9 ec=1094
[LocalSoil] Read ok — temp=23.9 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963027 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 27 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963028 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15864
[LoRa] RX 174 B  RSSI=-92  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":27,"boot":28,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":261,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=27 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=16777 ack_end_ms=17129 ack_tx_ms=352
[Timing] return_to_rx_ms=17140
[LoRa] packet_received N2 seq=27 status=ok
[Timing] rx_elapsed_ms=46855
[LoRa] RX 183 B  RSSI=-62  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":27,"boot":28,"stg":5,"uptime":753,"temp":25.6,"hum":44.7,"pres":1011.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=27 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47779 ack_end_ms=48131 ack_tx_ms=352
[Timing] return_to_rx_ms=48142
[LoRa] packet_received N3 seq=27 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=23.9 ec=1094
[LocalSoil] Read ok — temp=23.9 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963028 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 28 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963029 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17346
[LoRa] RX 174 B  RSSI=-92  SNR=11.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":28,"boot":29,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=28 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18259 ack_end_ms=18611 ack_tx_ms=352
[Timing] return_to_rx_ms=18622
[LoRa] packet_received N2 seq=28 status=ok
[Timing] rx_elapsed_ms=46633
[LoRa] RX 183 B  RSSI=-62  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":28,"boot":29,"stg":5,"uptime":753,"temp":25.6,"hum":44.9,"pres":1011.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=28 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47546 ack_end_ms=47898 ack_tx_ms=352
[Timing] return_to_rx_ms=47909
[LoRa] packet_received N3 seq=28 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.0 ec=1094
[LocalSoil] Read ok — temp=24.0 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963029 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 29 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963030 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17122
[LoRa] RX 174 B  RSSI=-92  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":29,"boot":30,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=29 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18036 ack_end_ms=18387 ack_tx_ms=351
[Timing] return_to_rx_ms=18398
[LoRa] packet_received N2 seq=29 status=ok
[Timing] rx_elapsed_ms=47567
[LoRa] RX 183 B  RSSI=-62  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":29,"boot":30,"stg":5,"uptime":753,"temp":25.7,"hum":44.7,"pres":1011.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=29 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48481 ack_end_ms=48833 ack_tx_ms=352
[Timing] return_to_rx_ms=48844
[LoRa] packet_received N3 seq=29 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.0 ec=1094
[LocalSoil] Read ok — temp=24.0 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963030 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 30 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963031 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17823
[LoRa] RX 174 B  RSSI=-92  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":30,"boot":31,"stg":7,"uptime":5634,"temp":23.9,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=30 sleep=586 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=586 sleep_src=cycle_based
[Timing] ack_start_ms=18736 ack_end_ms=19088 ack_tx_ms=352
[Timing] return_to_rx_ms=19099
[LoRa] packet_received N2 seq=30 status=ok
[Timing] rx_elapsed_ms=47880
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":30,"boot":31,"stg":5,"uptime":753,"temp":25.7,"hum":44.4,"pres":1011.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=30 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48794 ack_end_ms=49145 ack_tx_ms=351
[Timing] return_to_rx_ms=49156
[LoRa] packet_received N3 seq=30 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.0 ec=1094
[LocalSoil] Read ok — temp=24.0 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963031 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 31 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963032 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16242
[LoRa] RX 174 B  RSSI=-92  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":31,"boot":32,"stg":7,"uptime":5635,"temp":23.9,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=31 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17156 ack_end_ms=17508 ack_tx_ms=352
[Timing] return_to_rx_ms=17519
[LoRa] packet_received N2 seq=31 status=ok
[Timing] rx_elapsed_ms=46548
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":31,"boot":32,"stg":5,"uptime":753,"temp":25.8,"hum":44.6,"pres":1010.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=31 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47462 ack_end_ms=47814 ack_tx_ms=352
[Timing] return_to_rx_ms=47825
[LoRa] packet_received N3 seq=31 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.1 ec=1094
[LocalSoil] Read ok — temp=24.1 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963032 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 32 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963033 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16680
[LoRa] RX 174 B  RSSI=-92  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":32,"boot":33,"stg":7,"uptime":5634,"temp":23.9,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=32 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17593 ack_end_ms=17945 ack_tx_ms=352
[Timing] return_to_rx_ms=17956
[LoRa] packet_received N2 seq=32 status=ok
[Timing] rx_elapsed_ms=47939
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":32,"boot":33,"stg":5,"uptime":753,"temp":25.8,"hum":44.3,"pres":1010.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=32 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48853 ack_end_ms=49205 ack_tx_ms=352
[Timing] return_to_rx_ms=49216
[LoRa] packet_received N3 seq=32 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.1 ec=1094
[LocalSoil] Read ok — temp=24.1 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963033 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 33 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963034 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16970
[LoRa] RX 174 B  RSSI=-92  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":33,"boot":34,"stg":7,"uptime":5634,"temp":23.9,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=33 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17883 ack_end_ms=18235 ack_tx_ms=352
[Timing] return_to_rx_ms=18246
[LoRa] packet_received N2 seq=33 status=ok
[Timing] rx_elapsed_ms=47223
[LoRa] RX 183 B  RSSI=-62  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":33,"boot":34,"stg":5,"uptime":753,"temp":25.9,"hum":44.2,"pres":1010.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=33 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48148 ack_end_ms=48500 ack_tx_ms=352
[Timing] return_to_rx_ms=48511
[LoRa] packet_received N3 seq=33 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.1 ec=1094
[LocalSoil] Read ok — temp=24.1 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963034 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 34 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963035 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15497
[LoRa] RX 174 B  RSSI=-91  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":34,"boot":35,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=34 sleep=589 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=15 slot_offset=10 boot_to_tx_sec=6 sleep_hint=589 sleep_src=cycle_based
[Timing] ack_start_ms=16410 ack_end_ms=16762 ack_tx_ms=352
[Timing] return_to_rx_ms=16773
[LoRa] packet_received N2 seq=34 status=ok
[Timing] rx_elapsed_ms=45790
[LoRa] RX 183 B  RSSI=-62  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":34,"boot":35,"stg":5,"uptime":745,"temp":25.9,"hum":43.9,"pres":1010.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=34 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=46704 ack_end_ms=47056 ack_tx_ms=352
[Timing] return_to_rx_ms=47067
[LoRa] packet_received N3 seq=34 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.1 ec=1096
[LocalSoil] Read ok — temp=24.1 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963035 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 549 s  (active was 51 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 35 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963036 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16469
[LoRa] RX 174 B  RSSI=-92  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":35,"boot":36,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=35 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17382 ack_end_ms=17734 ack_tx_ms=352
[Timing] return_to_rx_ms=17745
[LoRa] packet_received N2 seq=35 status=ok
[Timing] rx_elapsed_ms=46866
[LoRa] RX 183 B  RSSI=-62  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":35,"boot":36,"stg":5,"uptime":745,"temp":26.0,"hum":43.7,"pres":1010.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=35 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47779 ack_end_ms=48131 ack_tx_ms=352
[Timing] return_to_rx_ms=48142
[LoRa] packet_received N3 seq=35 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.2 ec=1094
[LocalSoil] Read ok — temp=24.2 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963036 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 36 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963037 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16674
[LoRa] RX 174 B  RSSI=-91  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":36,"boot":37,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=36 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17588 ack_end_ms=17939 ack_tx_ms=351
[Timing] return_to_rx_ms=17950
[LoRa] packet_received N2 seq=36 status=ok
[Timing] rx_elapsed_ms=47452
[LoRa] RX 183 B  RSSI=-62  SNR=11.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":36,"boot":37,"stg":5,"uptime":753,"temp":26.1,"hum":43.7,"pres":1010.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=36 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48366 ack_end_ms=48718 ack_tx_ms=352
[Timing] return_to_rx_ms=48729
[LoRa] packet_received N3 seq=36 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.3 ec=1096
[LocalSoil] Read ok — temp=24.3 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963037 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 37 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963038 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17008
[LoRa] RX 174 B  RSSI=-92  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":37,"boot":38,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=37 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17921 ack_end_ms=18273 ack_tx_ms=352
[Timing] return_to_rx_ms=18284
[LoRa] packet_received N2 seq=37 status=ok
[Timing] rx_elapsed_ms=47254
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":37,"boot":38,"stg":5,"uptime":753,"temp":26.1,"hum":43.0,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=37 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48179 ack_end_ms=48531 ack_tx_ms=352
[Timing] return_to_rx_ms=48542
[LoRa] packet_received N3 seq=37 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.3 ec=1096
[LocalSoil] Read ok — temp=24.3 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963038 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 38 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963039 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15730
[LoRa] RX 174 B  RSSI=-92  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":38,"boot":39,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=38 sleep=589 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=589 sleep_src=cycle_based
[Timing] ack_start_ms=16644 ack_end_ms=16996 ack_tx_ms=352
[Timing] return_to_rx_ms=17007
[LoRa] packet_received N2 seq=38 status=ok
[Timing] rx_elapsed_ms=46805
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":38,"boot":39,"stg":5,"uptime":753,"temp":26.2,"hum":43.9,"pres":1010.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=38 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47729 ack_end_ms=48081 ack_tx_ms=352
[Timing] return_to_rx_ms=48092
[LoRa] packet_received N3 seq=38 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.4 ec=1096
[LocalSoil] Read ok — temp=24.4 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963039 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 39 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963040 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17163
[LoRa] RX 174 B  RSSI=-95  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":39,"boot":40,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":262,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=39 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18077 ack_end_ms=18429 ack_tx_ms=352
[Timing] return_to_rx_ms=18440
[LoRa] packet_received N2 seq=39 status=ok
[Timing] rx_elapsed_ms=46921
[LoRa] RX 183 B  RSSI=-59  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":39,"boot":40,"stg":5,"uptime":753,"temp":26.3,"hum":43.7,"pres":1010.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=39 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47846 ack_end_ms=48197 ack_tx_ms=351
[Timing] return_to_rx_ms=48208
[LoRa] packet_received N3 seq=39 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.4 ec=1096
[LocalSoil] Read ok — temp=24.4 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963040 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 40 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963041 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16496
[LoRa] RX 174 B  RSSI=-88  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":40,"boot":41,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=40 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17410 ack_end_ms=17762 ack_tx_ms=352
[Timing] return_to_rx_ms=17773
[LoRa] packet_received N2 seq=40 status=ok
[Timing] rx_elapsed_ms=46333
[LoRa] RX 183 B  RSSI=-59  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":40,"boot":41,"stg":5,"uptime":753,"temp":26.4,"hum":43.5,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=40 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47257 ack_end_ms=47609 ack_tx_ms=352
[Timing] return_to_rx_ms=47620
[LoRa] packet_received N3 seq=40 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.4 ec=1096
[LocalSoil] Read ok — temp=24.4 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963041 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 41 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963042 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17090
[LoRa] RX 174 B  RSSI=-88  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":41,"boot":42,"stg":7,"uptime":5634,"temp":24.0,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=41 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18003 ack_end_ms=18355 ack_tx_ms=352
[Timing] return_to_rx_ms=18366
[LoRa] packet_received N2 seq=41 status=ok
[Timing] rx_elapsed_ms=47723
[LoRa] RX 183 B  RSSI=-59  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":41,"boot":42,"stg":5,"uptime":753,"temp":26.5,"hum":42.9,"pres":1010.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=41 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48636 ack_end_ms=48988 ack_tx_ms=352
[Timing] return_to_rx_ms=48999
[LoRa] packet_received N3 seq=41 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.5 ec=1094
[LocalSoil] Read ok — temp=24.5 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963042 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 42 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963043 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16388
[LoRa] RX 174 B  RSSI=-94  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":42,"boot":43,"stg":7,"uptime":5634,"temp":24.1,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=42 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17302 ack_end_ms=17654 ack_tx_ms=352
[Timing] return_to_rx_ms=17665
[LoRa] packet_received N2 seq=42 status=ok
[Timing] rx_elapsed_ms=48425
[LoRa] RX 183 B  RSSI=-61  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":42,"boot":43,"stg":5,"uptime":753,"temp":26.6,"hum":42.7,"pres":1010.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=42 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49350 ack_end_ms=49701 ack_tx_ms=351
[Timing] return_to_rx_ms=49712
[LoRa] packet_received N3 seq=42 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.5 ec=1092
[LocalSoil] Read ok — temp=24.5 mois=25.1 ec=1092.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963043 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 546 s  (active was 54 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 43 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963044 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17849
[LoRa] RX 174 B  RSSI=-94  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":43,"boot":44,"stg":7,"uptime":5634,"temp":24.1,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=43 sleep=586 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=586 sleep_src=cycle_based
[Timing] ack_start_ms=18763 ack_end_ms=19114 ack_tx_ms=351
[Timing] return_to_rx_ms=19125
[LoRa] packet_received N2 seq=43 status=ok
[Timing] rx_elapsed_ms=48329
[LoRa] RX 183 B  RSSI=-60  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":43,"boot":44,"stg":5,"uptime":753,"temp":26.7,"hum":42.6,"pres":1010.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=43 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=49242 ack_end_ms=49594 ack_tx_ms=352
[Timing] return_to_rx_ms=49605
[LoRa] packet_received N3 seq=43 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.5 ec=1096
[LocalSoil] Read ok — temp=24.5 mois=25.1 ec=1096.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963044 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 546 s  (active was 54 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 44 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963045 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16398
[LoRa] RX 174 B  RSSI=-90  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":44,"boot":45,"stg":7,"uptime":5634,"temp":24.1,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=44 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17312 ack_end_ms=17664 ack_tx_ms=352
[Timing] return_to_rx_ms=17675
[LoRa] packet_received N2 seq=44 status=ok
[Timing] rx_elapsed_ms=47257
[LoRa] RX 183 B  RSSI=-58  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":44,"boot":45,"stg":5,"uptime":753,"temp":26.7,"hum":43.3,"pres":1010.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=44 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48171 ack_end_ms=48523 ack_tx_ms=352
[Timing] return_to_rx_ms=48534
[LoRa] packet_received N3 seq=44 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.6 ec=1092
[LocalSoil] Read ok — temp=24.6 mois=25.1 ec=1092.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963045 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 45 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963046 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15616
[LoRa] RX 174 B  RSSI=-93  SNR=9.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":45,"boot":46,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=45 sleep=589 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=15 slot_offset=10 boot_to_tx_sec=6 sleep_hint=589 sleep_src=cycle_based
[Timing] ack_start_ms=16530 ack_end_ms=16882 ack_tx_ms=352
[Timing] return_to_rx_ms=16893
[LoRa] packet_received N2 seq=45 status=ok
[Timing] rx_elapsed_ms=46448
[LoRa] RX 183 B  RSSI=-58  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":45,"boot":46,"stg":5,"uptime":753,"temp":26.8,"hum":42.7,"pres":1010.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=45 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47362 ack_end_ms=47714 ack_tx_ms=352
[Timing] return_to_rx_ms=47725
[LoRa] packet_received N3 seq=45 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.7 ec=1094
[LocalSoil] Read ok — temp=24.7 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963046 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 46 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963047 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16819
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":46,"boot":47,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=46 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17733 ack_end_ms=18085 ack_tx_ms=352
[Timing] return_to_rx_ms=18096
[LoRa] packet_received N2 seq=46 status=ok
[Timing] rx_elapsed_ms=47443
[LoRa] RX 183 B  RSSI=-59  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":46,"boot":47,"stg":5,"uptime":753,"temp":26.8,"hum":42.6,"pres":1010.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=46 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48357 ack_end_ms=48708 ack_tx_ms=351
[Timing] return_to_rx_ms=48719
[LoRa] packet_received N3 seq=46 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.7 ec=1094
[LocalSoil] Read ok — temp=24.7 mois=25.1 ec=1094.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963047 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 47 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963048 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16201
[LoRa] RX 174 B  RSSI=-89  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":47,"boot":48,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=47 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17115 ack_end_ms=17467 ack_tx_ms=352
[Timing] return_to_rx_ms=17478
[LoRa] packet_received N2 seq=47 status=ok
[Timing] rx_elapsed_ms=47458
[LoRa] RX 183 B  RSSI=-59  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":47,"boot":48,"stg":5,"uptime":753,"temp":26.9,"hum":42.0,"pres":1010.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=47 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48372 ack_end_ms=48724 ack_tx_ms=352
[Timing] return_to_rx_ms=48735
[LoRa] packet_received N3 seq=47 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.7 ec=1090
[LocalSoil] Read ok — temp=24.7 mois=25.1 ec=1090.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963048 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 48 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963049 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16763
[LoRa] RX 174 B  RSSI=-89  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":48,"boot":49,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=48 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17677 ack_end_ms=18029 ack_tx_ms=352
[Timing] return_to_rx_ms=18040
[LoRa] packet_received N2 seq=48 status=ok
[Timing] rx_elapsed_ms=47520
[LoRa] RX 183 B  RSSI=-59  SNR=11.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":48,"boot":49,"stg":5,"uptime":753,"temp":26.8,"hum":42.0,"pres":1010.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=48 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48444 ack_end_ms=48796 ack_tx_ms=352
[Timing] return_to_rx_ms=48807
[LoRa] packet_received N3 seq=48 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.7 ec=1092
[LocalSoil] Read ok — temp=24.7 mois=25.1 ec=1092.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963049 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 49 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963050 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17764
[LoRa] RX 174 B  RSSI=-89  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":49,"boot":50,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=49 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18677 ack_end_ms=19029 ack_tx_ms=352
[Timing] return_to_rx_ms=19040
[LoRa] packet_received N2 seq=49 status=ok
[Timing] rx_elapsed_ms=47354
[LoRa] RX 183 B  RSSI=-59  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":49,"boot":50,"stg":5,"uptime":753,"temp":26.8,"hum":41.8,"pres":1010.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=49 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48279 ack_end_ms=48630 ack_tx_ms=351
[Timing] return_to_rx_ms=48641
[LoRa] packet_received N3 seq=49 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.7 ec=1092
[LocalSoil] Read ok — temp=24.7 mois=25.1 ec=1092.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963050 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 50 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963051 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17225
[LoRa] RX 174 B  RSSI=-89  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":50,"boot":51,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=50 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18139 ack_end_ms=18491 ack_tx_ms=352
[Timing] return_to_rx_ms=18502
[LoRa] packet_received N2 seq=50 status=ok
[Timing] rx_elapsed_ms=47392
[LoRa] RX 183 B  RSSI=-58  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":50,"boot":51,"stg":5,"uptime":753,"temp":26.9,"hum":41.6,"pres":1010.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=50 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48317 ack_end_ms=48669 ack_tx_ms=352
[Timing] return_to_rx_ms=48680
[LoRa] packet_received N3 seq=50 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.8 ec=1092
[LocalSoil] Read ok — temp=24.8 mois=25.1 ec=1092.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963051 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 51 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963052 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16606
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":51,"boot":52,"stg":7,"uptime":5634,"temp":24.3,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=51 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17519 ack_end_ms=17871 ack_tx_ms=352
[Timing] return_to_rx_ms=17882
[LoRa] packet_received N2 seq=51 status=ok
[Timing] rx_elapsed_ms=47792
[LoRa] RX 183 B  RSSI=-58  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":51,"boot":52,"stg":5,"uptime":753,"temp":27.0,"hum":40.5,"pres":1010.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=51 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48717 ack_end_ms=49069 ack_tx_ms=352
[Timing] return_to_rx_ms=49080
[LoRa] packet_received N3 seq=51 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.8 ec=1088
[LocalSoil] Read ok — temp=24.8 mois=25.1 ec=1088.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963052 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 52 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963053 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17500
[LoRa] RX 174 B  RSSI=-90  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":52,"boot":53,"stg":7,"uptime":5634,"temp":24.3,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=52 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18414 ack_end_ms=18766 ack_tx_ms=352
[Timing] return_to_rx_ms=18777
[LoRa] packet_received N2 seq=52 status=ok
[Timing] rx_elapsed_ms=46934
[LoRa] RX 183 B  RSSI=-59  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":52,"boot":53,"stg":5,"uptime":753,"temp":27.0,"hum":38.8,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=52 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47859 ack_end_ms=48210 ack_tx_ms=351
[Timing] return_to_rx_ms=48221
[LoRa] packet_received N3 seq=52 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.8 ec=1088
[LocalSoil] Read ok — temp=24.8 mois=25.1 ec=1088.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963053 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 53 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963054 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17066
[LoRa] RX 174 B  RSSI=-90  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":53,"boot":54,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=53 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17980 ack_end_ms=18332 ack_tx_ms=352
[Timing] return_to_rx_ms=18343
[LoRa] packet_received N2 seq=53 status=ok
[Timing] rx_elapsed_ms=46947
[LoRa] RX 183 B  RSSI=-59  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":53,"boot":54,"stg":5,"uptime":753,"temp":26.9,"hum":38.2,"pres":1010.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=53 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47871 ack_end_ms=48223 ack_tx_ms=352
[Timing] return_to_rx_ms=48234
[LoRa] packet_received N3 seq=53 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.1 temp=24.8 ec=1088
[LocalSoil] Read ok — temp=24.8 mois=25.1 ec=1088.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963054 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 54 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963055 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16543
[LoRa] RX 174 B  RSSI=-91  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":54,"boot":55,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=54 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17457 ack_end_ms=17809 ack_tx_ms=352
[Timing] return_to_rx_ms=17820
[LoRa] packet_received N2 seq=54 status=ok
[Timing] rx_elapsed_ms=47132
[LoRa] RX 183 B  RSSI=-58  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":54,"boot":55,"stg":5,"uptime":753,"temp":26.9,"hum":38.5,"pres":1010.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=54 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48056 ack_end_ms=48408 ack_tx_ms=352
[Timing] return_to_rx_ms=48419
[LoRa] packet_received N3 seq=54 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1088
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1088.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963055 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 55 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963056 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16275
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":55,"boot":56,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=55 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17188 ack_end_ms=17540 ack_tx_ms=352
[Timing] return_to_rx_ms=17551
[LoRa] packet_received N2 seq=55 status=ok
[Timing] rx_elapsed_ms=46443
[LoRa] RX 183 B  RSSI=-59  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":55,"boot":56,"stg":5,"uptime":753,"temp":26.8,"hum":38.9,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=55 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47357 ack_end_ms=47709 ack_tx_ms=352
[Timing] return_to_rx_ms=47720
[LoRa] packet_received N3 seq=55 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1086
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1086.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963056 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 56 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963057 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17329
[LoRa] RX 174 B  RSSI=-91  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":56,"boot":57,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=56 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18243 ack_end_ms=18594 ack_tx_ms=351
[Timing] return_to_rx_ms=18605
[LoRa] packet_received N2 seq=56 status=ok
[Timing] rx_elapsed_ms=47662
[LoRa] RX 183 B  RSSI=-59  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":56,"boot":57,"stg":5,"uptime":753,"temp":26.7,"hum":38.7,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=56 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48587 ack_end_ms=48939 ack_tx_ms=352
[Timing] return_to_rx_ms=48950
[LoRa] packet_received N3 seq=56 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1084
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1084.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963057 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 57 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963058 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17027
[LoRa] RX 174 B  RSSI=-90  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":57,"boot":58,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=57 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17941 ack_end_ms=18293 ack_tx_ms=352
[Timing] return_to_rx_ms=18304
[LoRa] packet_received N2 seq=57 status=ok
[Timing] rx_elapsed_ms=47669
[LoRa] RX 183 B  RSSI=-59  SNR=10.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":57,"boot":58,"stg":5,"uptime":753,"temp":26.7,"hum":38.7,"pres":1010.4,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=57 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48583 ack_end_ms=48935 ack_tx_ms=352
[Timing] return_to_rx_ms=48946
[LoRa] packet_received N3 seq=57 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1082
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1082.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963058 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 58 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963059 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16199
[LoRa] RX 174 B  RSSI=-90  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":58,"boot":59,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=58 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17113 ack_end_ms=17465 ack_tx_ms=352
[Timing] return_to_rx_ms=17476
[LoRa] packet_received N2 seq=58 status=ok
[Timing] rx_elapsed_ms=47118
[LoRa] RX 183 B  RSSI=-59  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":58,"boot":59,"stg":5,"uptime":753,"temp":26.7,"hum":38.3,"pres":1010.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=58 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48042 ack_end_ms=48394 ack_tx_ms=352
[Timing] return_to_rx_ms=48405
[LoRa] packet_received N3 seq=58 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1082
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1082.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963059 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 59 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963060 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16948
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":59,"boot":60,"stg":7,"uptime":5634,"temp":24.2,"mois":22.6,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=59 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17862 ack_end_ms=18214 ack_tx_ms=352
[Timing] return_to_rx_ms=18225
[LoRa] packet_received N2 seq=59 status=ok
[Timing] rx_elapsed_ms=46211
[LoRa] RX 183 B  RSSI=-59  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":59,"boot":60,"stg":5,"uptime":753,"temp":26.7,"hum":38.0,"pres":1010.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=59 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47136 ack_end_ms=47488 ack_tx_ms=352
[Timing] return_to_rx_ms=47499
[LoRa] packet_received N3 seq=59 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1078
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1078.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963060 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 549 s  (active was 51 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 60 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963061 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16127
[LoRa] RX 174 B  RSSI=-90  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":60,"boot":61,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=60 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17041 ack_end_ms=17393 ack_tx_ms=352
[Timing] return_to_rx_ms=17404
[LoRa] packet_received N2 seq=60 status=ok
[Timing] rx_elapsed_ms=47028
[LoRa] RX 183 B  RSSI=-59  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":60,"boot":61,"stg":5,"uptime":753,"temp":26.7,"hum":38.3,"pres":1010.7,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=60 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47941 ack_end_ms=48293 ack_tx_ms=352
[Timing] return_to_rx_ms=48304
[LoRa] packet_received N3 seq=60 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1078
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1078.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963061 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 61 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963062 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15812
[LoRa] RX 174 B  RSSI=-91  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":61,"boot":62,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=61 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=16725 ack_end_ms=17077 ack_tx_ms=352
[Timing] return_to_rx_ms=17088
[LoRa] packet_received N2 seq=61 status=ok
[Timing] rx_elapsed_ms=46471
[LoRa] RX 183 B  RSSI=-58  SNR=10.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":61,"boot":62,"stg":5,"uptime":753,"temp":26.6,"hum":37.8,"pres":1010.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=61 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47385 ack_end_ms=47737 ack_tx_ms=352
[Timing] return_to_rx_ms=47748
[LoRa] packet_received N3 seq=61 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1076
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1076.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963062 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 62 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963063 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17720
[LoRa] RX 174 B  RSSI=-91  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":62,"boot":63,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=62 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18634 ack_end_ms=18986 ack_tx_ms=352
[Timing] return_to_rx_ms=18997
[LoRa] packet_received N2 seq=62 status=ok
[Timing] rx_elapsed_ms=47835
[LoRa] RX 183 B  RSSI=-58  SNR=10.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":62,"boot":63,"stg":5,"uptime":753,"temp":26.6,"hum":38.0,"pres":1011.0,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=62 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48760 ack_end_ms=49112 ack_tx_ms=352
[Timing] return_to_rx_ms=49123
[LoRa] packet_received N3 seq=62 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1076
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1076.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963063 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 63 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963064 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17685
[LoRa] RX 174 B  RSSI=-90  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":63,"boot":64,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=63 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18599 ack_end_ms=18951 ack_tx_ms=352
[Timing] return_to_rx_ms=18962
[LoRa] packet_received N2 seq=63 status=ok
[Timing] rx_elapsed_ms=47015
[LoRa] RX 183 B  RSSI=-58  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":63,"boot":64,"stg":5,"uptime":753,"temp":26.6,"hum":38.5,"pres":1011.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=63 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47940 ack_end_ms=48292 ack_tx_ms=352
[Timing] return_to_rx_ms=48303
[LoRa] packet_received N3 seq=63 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1074
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1074.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963064 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 64 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963065 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17252
[LoRa] RX 174 B  RSSI=-90  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":64,"boot":65,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=64 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18165 ack_end_ms=18517 ack_tx_ms=352
[Timing] return_to_rx_ms=18528
[LoRa] packet_received N2 seq=64 status=ok
[Timing] rx_elapsed_ms=46560
[LoRa] RX 183 B  RSSI=-59  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":64,"boot":65,"stg":5,"uptime":753,"temp":26.5,"hum":38.3,"pres":1011.1,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=64 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47474 ack_end_ms=47826 ack_tx_ms=352
[Timing] return_to_rx_ms=47837
[LoRa] packet_received N3 seq=64 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1076
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1076.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963065 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 65 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963066 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17191
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":65,"boot":66,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=65 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=18105 ack_end_ms=18457 ack_tx_ms=352
[Timing] return_to_rx_ms=18468
[LoRa] packet_received N2 seq=65 status=ok
[Timing] rx_elapsed_ms=47752
[LoRa] RX 183 B  RSSI=-58  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":65,"boot":66,"stg":5,"uptime":753,"temp":26.5,"hum":38.1,"pres":1011.2,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=65 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48665 ack_end_ms=49017 ack_tx_ms=352
[Timing] return_to_rx_ms=49028
[LoRa] packet_received N3 seq=65 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=25.0 temp=24.8 ec=1072
[LocalSoil] Read ok — temp=24.8 mois=25.0 ec=1072.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963066 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 66 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963067 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15990
[LoRa] RX 174 B  RSSI=-90  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":66,"boot":67,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=66 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=16903 ack_end_ms=17255 ack_tx_ms=352
[Timing] return_to_rx_ms=17266
[LoRa] packet_received N2 seq=66 status=ok
[Timing] rx_elapsed_ms=47971
[LoRa] RX 183 B  RSSI=-58  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":66,"boot":67,"stg":5,"uptime":753,"temp":26.5,"hum":38.0,"pres":1011.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=66 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48885 ack_end_ms=49237 ack_tx_ms=352
[Timing] return_to_rx_ms=49248
[LoRa] packet_received N3 seq=66 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.9 temp=24.8 ec=1074
[LocalSoil] Read ok — temp=24.8 mois=24.9 ec=1074.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963067 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 67 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963068 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=15912
[LoRa] RX 174 B  RSSI=-94  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":67,"boot":68,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=67 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=16826 ack_end_ms=17178 ack_tx_ms=352
[Timing] return_to_rx_ms=17189
[LoRa] packet_received N2 seq=67 status=ok
[Timing] rx_elapsed_ms=46351
[LoRa] RX 183 B  RSSI=-60  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":67,"boot":68,"stg":5,"uptime":753,"temp":26.5,"hum":38.1,"pres":1011.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=67 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47264 ack_end_ms=47616 ack_tx_ms=352
[Timing] return_to_rx_ms=47627
[LoRa] packet_received N3 seq=67 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.9 temp=24.8 ec=1070
[LocalSoil] Read ok — temp=24.8 mois=24.9 ec=1070.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963068 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 68 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963069 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16998
[LoRa] RX 174 B  RSSI=-99  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":68,"boot":69,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=68 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17911 ack_end_ms=18263 ack_tx_ms=352
[Timing] return_to_rx_ms=18274
[LoRa] packet_received N2 seq=68 status=ok
[Timing] rx_elapsed_ms=47971
[LoRa] RX 183 B  RSSI=-62  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":68,"boot":69,"stg":5,"uptime":753,"temp":26.5,"hum":38.2,"pres":1011.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=68 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48885 ack_end_ms=49236 ack_tx_ms=351
[Timing] return_to_rx_ms=49247
[LoRa] packet_received N3 seq=68 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.9 temp=24.8 ec=1072
[LocalSoil] Read ok — temp=24.8 mois=24.9 ec=1072.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963069 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 69 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963070 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16253
[LoRa] RX 174 B  RSSI=-91  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":69,"boot":70,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":264,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=69 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17167 ack_end_ms=17519 ack_tx_ms=352
[Timing] return_to_rx_ms=17530
[LoRa] packet_received N2 seq=69 status=ok
[Timing] rx_elapsed_ms=28060
[LoRa] RX 13 B  RSSI=-121  SNR=-1.5
[LoRa] raw: Hello LoRa 20
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=30102
[LoRa] RX 13 B  RSSI=-119  SNR=1.8
[LoRa] raw: Hello LoRa 21
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=32144
[LoRa] RX 13 B  RSSI=-120  SNR=2.2
[LoRa] raw: Hello LoRa 22
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=34186
[LoRa] RX 13 B  RSSI=-121  SNR=0.5
[LoRa] raw: Hello LoRa 23
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=36228
[LoRa] RX 13 B  RSSI=-121  SNR=0.5
[LoRa] raw: Hello LoRa 24
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=38270
[LoRa] RX 13 B  RSSI=-121  SNR=0.2
[LoRa] raw: Hello LoRa 25
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=40312
[LoRa] RX 13 B  RSSI=-121  SNR=0.0
[LoRa] raw: Hello LoRa 26
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=42354
[LoRa] RX 13 B  RSSI=-121  SNR=0.5
[LoRa] raw: Hello LoRa 27
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=44396
[LoRa] RX 13 B  RSSI=-121  SNR=0.8
[LoRa] raw: Hello LoRa 28
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=46438
[LoRa] RX 13 B  RSSI=-57  SNR=5.8
[LoRa] raw: �8�m���|�����
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=48480
[LoRa] RX 13 B  RSSI=-121  SNR=-0.2
[LoRa] raw: Hello LoRa 30
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=50522
[LoRa] RX 13 B  RSSI=-121  SNR=0.2
[LoRa] raw: Hello LoRa 31
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=52564
[LoRa] RX 13 B  RSSI=-121  SNR=0.8
[LoRa] raw: Hello LoRa 32
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=54606
[LoRa] RX 13 B  RSSI=-121  SNR=-0.2
[LoRa] raw: Hello LoRa 33
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=56648
[LoRa] RX 13 B  RSSI=-121  SNR=0.2
[LoRa] raw: Hello LoRa 34
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=58690
[LoRa] RX 13 B  RSSI=-121  SNR=0.8
[LoRa] raw: Hello LoRa 35
[LoRa] Unknown packet — ignoring
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N3
[LocalSoil] mois=24.8 temp=24.8 ec=1068
[LocalSoil] Read ok — temp=24.8 mois=24.8 ec=1068.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963070 rcvN2=1 rcvN3=0 missN2=0 missN3=1 mainSoil=1 qRead=3 qEvt=19
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 70 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963071 — opening LoRa RX window (120000 ms, recovery=1)
[Timing] rx_elapsed_ms=16912
[LoRa] RX 174 B  RSSI=-98  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":70,"boot":71,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=70 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17825 ack_end_ms=18177 ack_tx_ms=352
[Timing] return_to_rx_ms=18188
[LoRa] packet_received N2 seq=70 status=ok
[Timing] rx_elapsed_ms=19923
[LoRa] RX 181 B  RSSI=-66  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":0,"boot":1,"stg":5,"uptime":745,"temp":26.2,"hum":38.6,"pres":1011.7,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=0 sleep=619 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=20 slot_offset=40 boot_to_tx_sec=1 sleep_hint=619 sleep_src=cycle_based
[Timing] ack_start_ms=20899 ack_end_ms=21251 ack_tx_ms=352
[Timing] return_to_rx_ms=21262
[LoRa] packet_received N3 seq=0 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.8 temp=24.8 ec=1066
[LocalSoil] Read ok — temp=24.8 mois=24.8 ec=1066.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963071 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=3
[MainNode] Prepared for sleep
[MainNode] Deep sleep 575 s  (active was 25 s)





ets Jul 29 2019 12:21:46

rst:0x1 (POWERON_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 1 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963071 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=12523
[LoRa] RX 172 B  RSSI=-105  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":0,"boot":1,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=0 sleep=592 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=12 slot_offset=10 boot_to_tx_sec=6 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=13485 ack_end_ms=13837 ack_tx_ms=352
[Timing] return_to_rx_ms=13848
[LoRa] packet_received N2 seq=0 status=ok
[Timing] rx_elapsed_ms=18245
[LoRa] RX 181 B  RSSI=-60  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":0,"boot":1,"stg":5,"uptime":753,"temp":26.2,"hum":39.3,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=0 sleep=621 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=18 slot_offset=40 boot_to_tx_sec=1 sleep_hint=621 sleep_src=cycle_based
[Timing] ack_start_ms=19207 ack_end_ms=19559 ack_tx_ms=352
[Timing] return_to_rx_ms=19570
[LoRa] packet_received N3 seq=0 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.8 temp=24.8 ec=1066
[LocalSoil] Read ok — temp=24.8 mois=24.8 ec=1066.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963071 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 577 s  (active was 23 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 2 | RTC=1 SD=1 LoRa=1
[MainNode] EXT0 long-press — entering upload mode
[WiFi] Connecting...
[WiFi] Connected  IP=10.59.197.247
[Upload] Uploading /DATA/2026/05/2026-05-03_upload_queue.jsonl
[Upload] Batch: 15 readings, 10 events, 7318 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=15
[Upload] Batch: 15 readings, 10 events, 7206 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=30
[Upload] Batch: 9 readings, 10 events, 5497 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=39
[Upload] Batch: 15 readings, 10 events, 7315 bytes
[Upload] Batch HTTP -3
[Upload] Batch HTTP error -3: 
[Upload] Batch run done — total_inserted=39 anyFailed=1
[Upload] Retry 2/3 in 5000 ms
[Upload] Batch: 15 readings, 10 events, 7315 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=15
[Upload] Batch: 15 readings, 10 events, 7338 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=30
[Upload] Batch: 15 readings, 10 events, 7339 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=45
[Upload] Batch: 15 readings, 10 events, 7344 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=60
[Upload] Batch: 15 readings, 10 events, 7332 bytes
[Upload] Batch HTTP -1
[Upload] Batch HTTP error -1: 
[Upload] Batch run done — total_inserted=60 anyFailed=1
[Upload] Retry 3/3 in 5000 ms
[Upload] Batch: 15 readings, 10 events, 7332 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=15
[Upload] Batch: 15 readings, 10 events, 7331 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=30
[Upload] Batch: 15 readings, 10 events, 7327 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=43
[Upload] Batch: 6 readings, 10 events, 4512 bytes
[Upload] Batch HTTP 200
[Upload] Batch accepted, total_inserted=47
[Upload] Batch: 8 readings, 10 events, 5244 bytes
[Upload] Batch HTTP -1
[Upload] Batch HTTP error -1: 
[Upload] Batch run done — total_inserted=47 anyFailed=1
[WiFi] Disconnected and disabled
[MainNode] Upload finished
[MainNode] Post-button schedule-preserving sleep = 422 s
[MainNode] Prepared for sleep
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 3 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963072 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=20563
[LoRa] RX 172 B  RSSI=-88  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":1,"boot":2,"stg":7,"uptime":5634,"temp":24.2,"mois":22.5,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=1 sleep=584 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=20 slot_offset=10 boot_to_tx_sec=6 sleep_hint=584 sleep_src=cycle_based
[Timing] ack_start_ms=21478 ack_end_ms=21830 ack_tx_ms=352
[Timing] return_to_rx_ms=21841
[LoRa] packet_received N2 seq=1 status=ok
[Timing] rx_elapsed_ms=51074
[LoRa] RX 181 B  RSSI=-63  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":1,"boot":2,"stg":5,"uptime":753,"temp":26.3,"hum":38.9,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=1 sleep=588 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=51 slot_offset=40 boot_to_tx_sec=1 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=51988 ack_end_ms=52340 ack_tx_ms=352
[Timing] return_to_rx_ms=52351
[LoRa] packet_received N3 seq=1 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.8 temp=24.7 ec=1064
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1064.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963072 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 544 s  (active was 56 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 4 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963073 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16961
[LoRa] RX 172 B  RSSI=-88  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":2,"boot":3,"stg":7,"uptime":5634,"temp":24.1,"mois":22.5,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=2 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17875 ack_end_ms=18227 ack_tx_ms=352
[Timing] return_to_rx_ms=18238
[LoRa] packet_received N2 seq=2 status=ok
[Timing] rx_elapsed_ms=46691
[LoRa] RX 181 B  RSSI=-63  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":2,"boot":3,"stg":5,"uptime":753,"temp":26.1,"hum":38.4,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=2 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=47606 ack_end_ms=47957 ack_tx_ms=351
[Timing] return_to_rx_ms=47968
[LoRa] packet_received N3 seq=2 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.8 temp=24.7 ec=1062
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1062.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963073 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 5 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963074 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17054
[LoRa] RX 172 B  RSSI=-92  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":3,"boot":4,"stg":7,"uptime":5634,"temp":24.1,"mois":22.5,"ec":263,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=3 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17968 ack_end_ms=18320 ack_tx_ms=352
[Timing] return_to_rx_ms=18331
[LoRa] packet_received N2 seq=3 status=ok
[Timing] rx_elapsed_ms=47733
[LoRa] RX 181 B  RSSI=-61  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":3,"boot":4,"stg":5,"uptime":745,"temp":26.0,"hum":38.7,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=3 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48648 ack_end_ms=49000 ack_tx_ms=352
[Timing] return_to_rx_ms=49011
[LoRa] packet_received N3 seq=3 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.8 temp=24.7 ec=1060
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1060.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963074 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 547 s  (active was 53 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 6 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963075 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=47813
[LoRa] RX 181 B  RSSI=-61  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":4,"boot":5,"stg":5,"uptime":753,"temp":26.0,"hum":38.6,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=4 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48728 ack_end_ms=49080 ack_tx_ms=352
[Timing] return_to_rx_ms=49091
[LoRa] packet_received N3 seq=4 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.8 temp=24.7 ec=1060
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1060.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963075 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=3
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 7 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963076 — opening LoRa RX window (120000 ms, recovery=1)
[Timing] rx_elapsed_ms=47390
[LoRa] RX 181 B  RSSI=-61  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":5,"boot":6,"stg":5,"uptime":753,"temp":25.8,"hum":38.9,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=5 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48305 ack_end_ms=48656 ack_tx_ms=351
[Timing] return_to_rx_ms=48667
[LoRa] packet_received N3 seq=5 status=ok
[Timing] rx_elapsed_ms=116110
[LoRa] RX 145 B  RSSI=-123  SNR=-11.8
[LoRa] raw: �,�n�>7�sY7<*>��M ���.�f�;JYm�<ģ�a�f��Mp��&^Wy��e��<d����~sn-�>RIf ӄ�k�����AL����
[LoRa] Unknown packet — ignoring
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.8 temp=24.7 ec=1057
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1057.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963076 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=3
[MainNode] Prepared for sleep
[MainNode] Deep sleep 475 s  (active was 125 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 8 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963077 — opening LoRa RX window (120000 ms, recovery=1)
[Timing] rx_elapsed_ms=47052
[LoRa] RX 181 B  RSSI=-61  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":6,"boot":7,"stg":5,"uptime":753,"temp":25.8,"hum":38.7,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=6 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47967 ack_end_ms=48319 ack_tx_ms=352
[Timing] return_to_rx_ms=48330
[LoRa] packet_received N3 seq=6 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.8 temp=24.7 ec=1055
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1055.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963077 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 475 s  (active was 125 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 9 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963078 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=47740
[LoRa] RX 181 B  RSSI=-61  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":7,"boot":8,"stg":5,"uptime":753,"temp":25.7,"hum":39.0,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=7 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48655 ack_end_ms=49007 ack_tx_ms=352
[Timing] return_to_rx_ms=49018
[LoRa] packet_received N3 seq=7 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.8 temp=24.7 ec=1053
[LocalSoil] Read ok — temp=24.7 mois=24.8 ec=1053.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963078 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 10 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963079 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=48032
[LoRa] RX 181 B  RSSI=-64  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":8,"boot":9,"stg":5,"uptime":753,"temp":25.8,"hum":38.6,"pres":1011.7,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=8 sleep=591 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=48 slot_offset=40 boot_to_tx_sec=1 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=48947 ack_end_ms=49299 ack_tx_ms=352
[Timing] return_to_rx_ms=49310
[LoRa] packet_received N3 seq=8 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.7 temp=24.7 ec=1051
[LocalSoil] Read ok — temp=24.7 mois=24.7 ec=1051.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963079 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=4
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 11 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963080 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=47238
[LoRa] RX 182 B  RSSI=-66  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":9,"boot":10,"stg":5,"uptime":753,"temp":25.7,"hum":39.3,"pres":1011.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=9 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48153 ack_end_ms=48505 ack_tx_ms=352
[Timing] return_to_rx_ms=48516
[LoRa] packet_received N3 seq=9 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.7 temp=24.6 ec=1049
[LocalSoil] Read ok — temp=24.6 mois=24.7 ec=1049.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963080 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 12 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963081 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=3241
[LoRa] RX 13 B  RSSI=-121  SNR=-10.0
[LoRa] raw: .elle LoRa`|;
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=7325
[LoRa] RX 13 B  RSSI=-123  SNR=-8.8
[LoRa] raw: Hello LoRa 49
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=9367
[LoRa] RX 13 B  RSSI=-122  SNR=-7.2
[LoRa] raw: Hello LoRa 50
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=11409
[LoRa] RX 13 B  RSSI=-123  SNR=-7.8
[LoRa] raw: Hello LoRa 51
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=13451
[LoRa] RX 13 B  RSSI=-122  SNR=-8.0
[LoRa] raw: Hello LoRa 52
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=17535
[LoRa] RX 13 B  RSSI=-123  SNR=-8.8
[LoRa] raw: Hello LoRa 54
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=47200
[LoRa] RX 183 B  RSSI=-64  SNR=10.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":10,"boot":11,"stg":5,"uptime":753,"temp":25.7,"hum":38.4,"pres":1011.9,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=10 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48115 ack_end_ms=48467 ack_tx_ms=352
[Timing] return_to_rx_ms=48478
[LoRa] packet_received N3 seq=10 status=ok
[Timing] rx_elapsed_ms=48165
[LoRa] RX 13 B  RSSI=-123  SNR=-11.0
[LoRa] raw: ����e�L+�% 
[LoRa] Unknown packet — ignoring
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.6 temp=24.6 ec=1047
[LocalSoil] Read ok — temp=24.6 mois=24.6 ec=1047.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963081 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=9
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 13 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963082 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=1201
[LoRa] RX 14 B  RSSI=-122  SNR=-2.8
[LoRa] raw: Hello LoRa 336
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=3244
[LoRa] RX 14 B  RSSI=-122  SNR=-3.0
[LoRa] raw: Hello LoRa 337
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=5286
[LoRa] RX 14 B  RSSI=-123  SNR=-3.8
[LoRa] raw: Hello LoRa 338
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=5945
[LoRa] RX 136 B  RSSI=-123  SNR=-12.0
[LoRa] raw: ��|�6�~L�WyGՉ���$��`�[Pok�qv?ġ���Q%e�H??c��<&��.���c=D��M+�~������c�C�=�����%���Z��U�FA�)�=�n�(�Y��-�e?����r�dg��i��lZ
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=7327
[LoRa] RX 14 B  RSSI=-122  SNR=-3.2
[LoRa] raw: Hello LoRa 339
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=9369
[LoRa] RX 14 B  RSSI=-122  SNR=-3.5
[LoRa] raw: Hello LoRa 340
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=11412
[LoRa] RX 14 B  RSSI=-122  SNR=-3.8
[LoRa] raw: Hello LoRa 341
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=13454
[LoRa] RX 14 B  RSSI=-121  SNR=-2.8
[LoRa] raw: Hello LoRa 342
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=15496
[LoRa] RX 14 B  RSSI=-123  SNR=-2.5
[LoRa] raw: Hello LoRa 343
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=17538
[LoRa] RX 14 B  RSSI=-122  SNR=-2.8
[LoRa] raw: Hello LoRa 344
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=19580
[LoRa] RX 14 B  RSSI=-123  SNR=-4.8
[LoRa] raw: Hello LoRa 345
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=21622
[LoRa] RX 14 B  RSSI=-122  SNR=-4.2
[LoRa] raw: Hello LoRa 346
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=23664
[LoRa] RX 14 B  RSSI=-122  SNR=-4.2
[LoRa] raw: Hello LoRa 347
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=25706
[LoRa] RX 14 B  RSSI=-122  SNR=-4.0
[LoRa] raw: Hello LoRa 348
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=27748
[LoRa] RX 14 B  RSSI=-123  SNR=-4.5
[LoRa] raw: Hello LoRa 349
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=29790
[LoRa] RX 14 B  RSSI=-123  SNR=-4.0
[LoRa] raw: Hello LoRa 350
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=31832
[LoRa] RX 14 B  RSSI=-122  SNR=-4.2
[LoRa] raw: Hello LoRa 351
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=33874
[LoRa] RX 14 B  RSSI=-123  SNR=-4.2
[LoRa] raw: Hello LoRa 352
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=35916
[LoRa] RX 14 B  RSSI=-122  SNR=-3.2
[LoRa] raw: Hello LoRa 353
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=37958
[LoRa] RX 14 B  RSSI=-122  SNR=-4.5
[LoRa] raw: Hello LoRa 354
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=40000
[LoRa] RX 14 B  RSSI=-122  SNR=-4.5
[LoRa] raw: Hello LoRa 355
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=42042
[LoRa] RX 14 B  RSSI=-122  SNR=-4.5
[LoRa] raw: Hello LoRa 356
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=44084
[LoRa] RX 14 B  RSSI=-123  SNR=-4.2
[LoRa] raw: Hello LoRa 357
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=46126
[LoRa] RX 14 B  RSSI=-122  SNR=-4.8
[LoRa] raw: Hello LoRa 358
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=47207
[LoRa] RX 183 B  RSSI=-62  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":11,"boot":12,"stg":5,"uptime":753,"temp":25.6,"hum":38.8,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=11 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48133 ack_end_ms=48484 ack_tx_ms=351
[Timing] return_to_rx_ms=48495
[LoRa] packet_received N3 seq=11 status=ok
[Timing] rx_elapsed_ms=48168
[LoRa] RX 14 B  RSSI=-123  SNR=-4.8
[LoRa] raw: Hello LoRa 359
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=50210
[LoRa] RX 14 B  RSSI=-122  SNR=-5.0
[LoRa] raw: Hello LoRa 360
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=52252
[LoRa] RX 14 B  RSSI=-122  SNR=-5.0
[LoRa] raw: Hello LoRa 361
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=54294
[LoRa] RX 14 B  RSSI=-122  SNR=-4.2
[LoRa] raw: Hello LoRa 362
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=56336
[LoRa] RX 14 B  RSSI=-123  SNR=-5.0
[LoRa] raw: Hello LoRa 363
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=58378
[LoRa] RX 14 B  RSSI=-123  SNR=-3.8
[LoRa] raw: Hello LoRa 364
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=60420
[LoRa] RX 14 B  RSSI=-123  SNR=-5.2
[LoRa] raw: Hello LoRa 365
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=62462
[LoRa] RX 14 B  RSSI=-122  SNR=-4.2
[LoRa] raw: Hello LoRa 366
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=64504
[LoRa] RX 14 B  RSSI=-122  SNR=-5.0
[LoRa] raw: Hello LoRa 367
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=66546
[LoRa] RX 14 B  RSSI=-122  SNR=-4.5
[LoRa] raw: Hello LoRa 368
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=68588
[LoRa] RX 14 B  RSSI=-122  SNR=-5.0
[LoRa] raw: Hello LoRa 369
[LoRa] Unknown packet — ignoring
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.7 temp=24.5 ec=1049
[LocalSoil] Read ok — temp=24.5 mois=24.7 ec=1049.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963082 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=37
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 14 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963083 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=47195
[LoRa] RX 183 B  RSSI=-63  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":12,"boot":13,"stg":5,"uptime":753,"temp":25.4,"hum":39.0,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=12 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48110 ack_end_ms=48462 ack_tx_ms=352
[Timing] return_to_rx_ms=48473
[LoRa] packet_received N3 seq=12 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.6 temp=24.5 ec=1043
[LocalSoil] Read ok — temp=24.5 mois=24.6 ec=1043.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963083 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 15 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963084 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=47458
[LoRa] RX 183 B  RSSI=-62  SNR=10.2
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":13,"boot":14,"stg":5,"uptime":753,"temp":25.5,"hum":38.9,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=13 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48373 ack_end_ms=48725 ack_tx_ms=352
[Timing] return_to_rx_ms=48736
[LoRa] packet_received N3 seq=13 status=ok
[MainNode] Cycle window closed — writing SD records
[SD] Missing reading logged for N2
[LocalSoil] mois=24.6 temp=24.5 ec=1043
[LocalSoil] Read ok — temp=24.5 mois=24.6 ec=1043.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963084 rcvN2=0 rcvN3=1 missN2=1 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 525 s  (active was 75 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 16 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963085 — opening LoRa RX window (70000 ms, recovery=1)
[Timing] rx_elapsed_ms=12932
[LoRa] RX 172 B  RSSI=-96  SNR=9.2
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":0,"boot":1,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":273,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=0 sleep=591 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=13 slot_offset=10 boot_to_tx_sec=6 sleep_hint=591 sleep_src=cycle_based
[Timing] ack_start_ms=13910 ack_end_ms=14262 ack_tx_ms=352
[Timing] return_to_rx_ms=14273
[LoRa] packet_received N2 seq=0 status=ok
[Timing] rx_elapsed_ms=47126
[LoRa] RX 183 B  RSSI=-63  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":14,"boot":15,"stg":5,"uptime":753,"temp":25.4,"hum":39.3,"pres":1011.8,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=14 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48052 ack_end_ms=48404 ack_tx_ms=352
[Timing] return_to_rx_ms=48415
[LoRa] packet_received N3 seq=14 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.6 temp=24.4 ec=1033
[LocalSoil] Read ok — temp=24.4 mois=24.6 ec=1033.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963085 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=3
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 17 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963086 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=16173
[LoRa] RX 172 B  RSSI=-100  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":1,"boot":2,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":273,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=1 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17087 ack_end_ms=17439 ack_tx_ms=352
[Timing] return_to_rx_ms=17450
[LoRa] packet_received N2 seq=1 status=ok
[Timing] rx_elapsed_ms=47097
[LoRa] RX 183 B  RSSI=-69  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":15,"boot":16,"stg":5,"uptime":753,"temp":25.2,"hum":39.2,"pres":1011.6,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=15 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=48012 ack_end_ms=48363 ack_tx_ms=351
[Timing] return_to_rx_ms=48374
[LoRa] packet_received N3 seq=15 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.6 temp=24.4 ec=1035
[LocalSoil] Read ok — temp=24.4 mois=24.6 ec=1035.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963086 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 18 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963087 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=5672
[LoRa] RX 14 B  RSSI=-122  SNR=-10.2
[LoRa] raw: Hell� LoRA !54
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=13840
[LoRa] RX 14 B  RSSI=-124  SNR=-10.2
[LoRa] raw: xV�`o L�Xk*��9
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=16146
[LoRa] RX 172 B  RSSI=-95  SNR=9.0
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":2,"boot":3,"stg":7,"uptime":5634,"temp":23.8,"mois":22.6,"ec":273,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=2 sleep=588 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=16 slot_offset=10 boot_to_tx_sec=6 sleep_hint=588 sleep_src=cycle_based
[Timing] ack_start_ms=17061 ack_end_ms=17413 ack_tx_ms=352
[Timing] return_to_rx_ms=17424
[LoRa] packet_received N2 seq=2 status=ok
[Timing] rx_elapsed_ms=22008
[LoRa] RX 14 B  RSSI=-123  SNR=-6.2
[LoRa] raw: Hello LoRa 153
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=24050
[LoRa] RX 14 B  RSSI=-124  SNR=-8.8
[LoRa] raw: HGN�� LoRa 154
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=26092
[LoRa] RX 14 B  RSSI=-123  SNR=-6.8
[LoRa] raw: Hello LoRa 155
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=28134
[LoRa] RX 14 B  RSSI=-124  SNR=-8.2
[LoRa] raw: Hello LoRa 156
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=30176
[LoRa] RX 14 B  RSSI=-123  SNR=-5.2
[LoRa] raw: Hello LoRa 157
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=32218
[LoRa] RX 14 B  RSSI=-123  SNR=-5.5
[LoRa] raw: Hello LoRa 158
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=34260
[LoRa] RX 14 B  RSSI=-122  SNR=-2.5
[LoRa] raw: Hello LoRa 159
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=36303
[LoRa] RX 14 B  RSSI=-123  SNR=-7.2
[LoRa] raw: Hello LoRa 160
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=38344
[LoRa] RX 14 B  RSSI=-123  SNR=-5.5
[LoRa] raw: Hello LoRa 161
[LoRa] Unknown packet — ignoring
[Timing] rx_elapsed_ms=46859
[LoRa] RX 183 B  RSSI=-66  SNR=10.0
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":16,"boot":17,"stg":5,"uptime":753,"temp":25.3,"hum":39.7,"pres":1011.5,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=16 sleep=592 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=47 slot_offset=40 boot_to_tx_sec=1 sleep_hint=592 sleep_src=cycle_based
[Timing] ack_start_ms=47784 ack_end_ms=48136 ack_tx_ms=352
[Timing] return_to_rx_ms=48147
[LoRa] packet_received N3 seq=16 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.5 temp=24.4 ec=1037
[LocalSoil] Read ok — temp=24.4 mois=24.5 ec=1037.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-03_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-03_readings.csv
[Frame] id=2963087 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=13
[MainNode] Prepared for sleep
[MainNode] Deep sleep 548 s  (active was 52 s)
ets Jul 29 2019 12:21:46

rst:0x5 (DEEPSLEEP_RESET),boot:0x17 (SPI_FAST_FLASH_BOOT)
configsip: 0, SPIWP:0xee
clk_drv:0x00,q_drv:0x00,d_drv:0x00,cs0_drv:0x00,hd_drv:0x00,wp_drv:0x00
mode:DIO, clock div:1
load:0x3fff0030,len:4876
ho 0 tail 12 room 4
load:0x40078000,len:16560
load:0x40080400,len:3500
entry 0x400805b4
[MainNode] Boot
[MainNode] GPIO initialized
[RTC] DS3231 ready
[SD] Ready — 1919 MB total
[LoRa] Ready
[MainNode] Boot 19 | RTC=1 SD=1 LoRa=1
[MainNode] Frame 2963088 — opening LoRa RX window (70000 ms, recovery=0)
[Timing] rx_elapsed_ms=17040
[LoRa] RX 172 B  RSSI=-96  SNR=9.5
[LoRa] raw: {"pv":1,"pt":"soil_reading","nid":"N2","ntype":"soil","seq":3,"boot":4,"stg":7,"uptime":5634,"temp":23.7,"mois":22.6,"ec":272,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N2 seq=3 sleep=587 slot_off=10 boot_tx=6 sleep_src=cycle_based
[ACK] rx_elapsed_sec=17 slot_offset=10 boot_to_tx_sec=6 sleep_hint=587 sleep_src=cycle_based
[Timing] ack_start_ms=17954 ack_end_ms=18306 ack_tx_ms=352
[Timing] return_to_rx_ms=18317
[LoRa] packet_received N2 seq=3 status=ok
[Timing] rx_elapsed_ms=45973
[LoRa] RX 183 B  RSSI=-67  SNR=9.8
[LoRa] raw: {"pv":1,"pt":"weather_reading","nid":"N3","ntype":"weather","seq":17,"boot":18,"stg":5,"uptime":753,"temp":24.9,"hum":39.0,"pres":1011.3,"rfail":0,"batt":"not_measured","status":"ok"}
[LoRa] ack_sent → N3 seq=17 sleep=593 slot_off=40 boot_tx=1 sleep_src=cycle_based
[ACK] rx_elapsed_sec=46 slot_offset=40 boot_to_tx_sec=1 sleep_hint=593 sleep_src=cycle_based
[Timing] ack_start_ms=46888 ack_end_ms=47240 ack_tx_ms=352
[Timing] return_to_rx_ms=47251
[LoRa] packet_received N3 seq=17 status=ok
[MainNode] Cycle window closed — writing SD records
[LocalSoil] mois=24.5 temp=24.4 ec=1035
[LocalSoil] Read ok — temp=24.4 mois=24.5 ec=1035.0
[SD] MAIN soil reading saved → /DATA/2026/05/2026-05-04_readings.csv
[SD] Weather reading saved → /DATA/2026/05/2026-05-04_readings.csv
[SD] Soil reading saved → /DATA/2026/05/2026-05-04_readings.csv
[Frame] id=2963088 rcvN2=1 rcvN3=1 missN2=0 missN3=0 mainSoil=1 qRead=3 qEvt=2
[MainNode] Prepared for sleep
[MainNode] Deep sleep 549 s  (active was 51 s)
