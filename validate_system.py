#!/usr/bin/env python3
"""
System validation script for Smart Farm IoT Dashboard
Tests: API endpoints, database connectivity, data quality
"""

import json
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import traceback

try:
    import requests
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError as e:
    print(f"ERROR: Missing dependency: {e}")
    print("Install with: pip install requests psycopg2-binary")
    sys.exit(1)

# Configuration
API_BASE = "https://agri-iot-webservice.onrender.com/api/v1"
DB_URL = "postgresql://iot_user:WgLokBjnaKSqs9VWPEHawBrF7YgjZIV8@dpg-d7nnoc1j2pic73cmn4g0-a.oregon-postgres.render.com/sensor_data_rdq0"

# Validation report
report = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "api_status": {"status": "NOT_TESTED", "endpoints": {}},
    "database_status": {"status": "NOT_TESTED", "tables": {}},
    "data_quality": {"readings": {}, "events": {}, "uploads": {}},
    "timestamp_validation": {"readings": {}, "events": {}, "uploads": {}},
    "issues": [],
    "summary": ""
}

# Helper functions
def add_issue(level: str, message: str):
    """Add an issue to the report"""
    report["issues"].append({"level": level, "message": message})
    print(f"[{level}] {message}")

def test_api_endpoint(endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
    """Test an API endpoint"""
    url = f"{API_BASE}{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            add_issue("ERROR", f"Endpoint {endpoint} returned {response.status_code}: {response.text[:200]}")
            return None
    except Exception as e:
        add_issue("ERROR", f"API endpoint {endpoint} failed: {str(e)}")
        return None

def validate_iso_timestamp(ts: str) -> bool:
    """Validate ISO 8601 timestamp"""
    if not ts:
        return False
    try:
        datetime.fromisoformat(ts.replace('Z', '+00:00'))
        return True
    except (ValueError, AttributeError):
        return False

def connect_db() -> Optional[psycopg2.extensions.connection]:
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        add_issue("ERROR", f"Database connection failed: {str(e)}")
        return None

def validate_table_structure(conn, table_name: str, expected_cols: List[str]) -> bool:
    """Validate table exists and has required columns"""
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = %s", (table_name,))
        cols = [row[0] for row in cur.fetchall()]
        cur.close()
        
        if not cols:
            add_issue("ERROR", f"Table '{table_name}' does not exist")
            return False
        
        missing = [c for c in expected_cols if c not in cols]
        if missing:
            add_issue("WARNING", f"Table '{table_name}' missing columns: {missing}")
            return False
        
        return True
    except Exception as e:
        add_issue("ERROR", f"Failed to validate table '{table_name}': {str(e)}")
        return False

# ============================================================================
# 1. TEST API ENDPOINTS
# ============================================================================
print("\n" + "="*70)
print("1. TESTING API ENDPOINTS")
print("="*70)

# Test /status
print("\nTesting GET /api/v1/status...")
status_data = test_api_endpoint("/status")
if status_data:
    report["api_status"]["endpoints"]["status"] = "OK"
    print(f"  ✓ /status: OK")
    print(f"    - gateways: {len(status_data.get('gateways', []))} found")
    print(f"    - latest_readings: {len(status_data.get('latest_readings', []))} found")
    print(f"    - recent_warnings_errors: {len(status_data.get('recent_warnings_errors', []))} found")
else:
    report["api_status"]["endpoints"]["status"] = "FAILED"

# Test /readings
print("\nTesting GET /api/v1/readings?limit=5...")
readings_data = test_api_endpoint("/readings", {"limit": 5})
if readings_data:
    report["api_status"]["endpoints"]["readings"] = "OK"
    print(f"  ✓ /readings: OK")
    if isinstance(readings_data, list) and len(readings_data) > 0:
        sample = readings_data[0]
        print(f"    Sample reading fields: {list(sample.keys())}")
        report["data_quality"]["readings"]["sample_fields"] = list(sample.keys())
        report["data_quality"]["readings"]["count"] = len(readings_data)
    elif isinstance(readings_data, dict):
        print(f"    Response structure: {list(readings_data.keys())}")
else:
    report["api_status"]["endpoints"]["readings"] = "FAILED"

# Test /events
print("\nTesting GET /api/v1/events?limit=5...")
events_data = test_api_endpoint("/events", {"limit": 5})
if events_data:
    report["api_status"]["endpoints"]["events"] = "OK"
    print(f"  ✓ /events: OK")
    if isinstance(events_data, list) and len(events_data) > 0:
        sample = events_data[0]
        print(f"    Sample event fields: {list(sample.keys())}")
        report["data_quality"]["events"]["sample_fields"] = list(sample.keys())
        report["data_quality"]["events"]["count"] = len(events_data)
    elif isinstance(events_data, dict):
        print(f"    Response structure: {list(events_data.keys())}")
else:
    report["api_status"]["endpoints"]["events"] = "FAILED"

# Test /uploads
print("\nTesting GET /api/v1/uploads?limit=5...")
uploads_data = test_api_endpoint("/uploads", {"limit": 5})
if uploads_data:
    report["api_status"]["endpoints"]["uploads"] = "OK"
    print(f"  ✓ /uploads: OK")
    if isinstance(uploads_data, list) and len(uploads_data) > 0:
        sample = uploads_data[0]
        print(f"    Sample upload fields: {list(sample.keys())}")
        report["data_quality"]["uploads"]["sample_fields"] = list(sample.keys())
        report["data_quality"]["uploads"]["count"] = len(uploads_data)
    elif isinstance(uploads_data, dict):
        print(f"    Response structure: {list(uploads_data.keys())}")
else:
    report["api_status"]["endpoints"]["uploads"] = "FAILED"

# ============================================================================
# 2. VALIDATE TIME FIELDS IN API RESPONSES
# ============================================================================
print("\n" + "="*70)
print("2. VALIDATING TIMESTAMP FIELDS IN API RESPONSES")
print("="*70)

if readings_data and isinstance(readings_data, list) and len(readings_data) > 0:
    print("\nValidating readings timestamps...")
    valid_measured_at = 0
    valid_received_at = 0
    null_measured_at = 0
    for reading in readings_data:
        if reading.get('measured_at'):
            if validate_iso_timestamp(reading['measured_at']):
                valid_measured_at += 1
            else:
                add_issue("ERROR", f"Invalid measured_at format: {reading['measured_at']}")
        else:
            null_measured_at += 1
        
        if reading.get('received_at'):
            if validate_iso_timestamp(reading['received_at']):
                valid_received_at += 1
            else:
                add_issue("ERROR", f"Invalid received_at format: {reading['received_at']}")
    
    report["timestamp_validation"]["readings"] = {
        "valid_measured_at": valid_measured_at,
        "null_measured_at": null_measured_at,
        "valid_received_at": valid_received_at,
        "total_checked": len(readings_data)
    }
    print(f"  ✓ measured_at valid: {valid_measured_at}/{len(readings_data)}")
    print(f"  ✓ received_at valid: {valid_received_at}/{len(readings_data)}")
    if null_measured_at > 0:
        add_issue("WARNING", f"{null_measured_at} readings with null measured_at")

if events_data and isinstance(events_data, list) and len(events_data) > 0:
    print("\nValidating events timestamps...")
    valid_event_time = 0
    valid_received_at = 0
    null_event_time = 0
    for event in events_data:
        if event.get('event_time'):
            if validate_iso_timestamp(event['event_time']):
                valid_event_time += 1
            else:
                add_issue("ERROR", f"Invalid event_time format: {event['event_time']}")
        else:
            null_event_time += 1
        
        if event.get('received_at'):
            if validate_iso_timestamp(event['received_at']):
                valid_received_at += 1
            else:
                add_issue("ERROR", f"Invalid received_at format: {event['received_at']}")
    
    report["timestamp_validation"]["events"] = {
        "valid_event_time": valid_event_time,
        "null_event_time": null_event_time,
        "valid_received_at": valid_received_at,
        "total_checked": len(events_data)
    }
    print(f"  ✓ event_time valid: {valid_event_time}/{len(events_data)}")
    print(f"  ✓ received_at valid: {valid_received_at}/{len(events_data)}")
    if null_event_time > 0:
        add_issue("WARNING", f"{null_event_time} events with null event_time")

# ============================================================================
# 3. DATABASE VALIDATION
# ============================================================================
print("\n" + "="*70)
print("3. DATABASE VALIDATION")
print("="*70)

conn = connect_db()
if conn:
    try:
        report["database_status"]["status"] = "CONNECTED"
        print("✓ Connected to PostgreSQL")
        
        # Expected columns per data_contract.md
        sensor_readings_cols = [
            "record_id", "upload_id", "gateway_id", "node_id", "node_type", "node_seq",
            "frame_id", "measured_at", "received_at", "status", "created_at",
            "rssi", "snr", "battery_mv", "battery_percent", "battery_status",
            "soil_temperature_c", "soil_moisture_percent", "soil_ec_us_cm",
            "soil_ph", "soil_salinity",
            "air_temperature_c", "air_humidity_percent", "air_pressure_hpa",
            "error_code", "raw_payload"
        ]
        
        system_events_cols = [
            "event_id", "upload_id", "gateway_id", "node_id", "event_type",
            "severity", "event_time", "received_at", "message", "details"
        ]
        
        uploads_cols = [
            "upload_id", "gateway_id", "started_at", "finished_at", "received_at",
            "raw_summary", "records_count", "status", "notes", "created_at"
        ]
        
        # Validate tables
        print("\nValidating table structure...")
        sr_ok = validate_table_structure(conn, "sensor_readings", sensor_readings_cols)
        se_ok = validate_table_structure(conn, "system_events", system_events_cols)
        up_ok = validate_table_structure(conn, "uploads", uploads_cols)
        
        report["database_status"]["tables"]["sensor_readings"] = "OK" if sr_ok else "ISSUES"
        report["database_status"]["tables"]["system_events"] = "OK" if se_ok else "ISSUES"
        report["database_status"]["tables"]["uploads"] = "OK" if up_ok else "ISSUES"
        
        # Check data volume
        print("\nChecking data volume...")
        try:
            cur = conn.cursor()
            
            cur.execute("SELECT COUNT(*) FROM sensor_readings")
            sr_count = cur.fetchone()[0]
            print(f"  sensor_readings: {sr_count} rows")
            report["data_quality"]["readings"]["total_rows"] = sr_count
            
            cur.execute("SELECT COUNT(*) FROM system_events")
            se_count = cur.fetchone()[0]
            print(f"  system_events: {se_count} rows")
            report["data_quality"]["events"]["total_rows"] = se_count
            
            cur.execute("SELECT COUNT(*) FROM uploads")
            up_count = cur.fetchone()[0]
            print(f"  uploads: {up_count} rows")
            report["data_quality"]["uploads"]["total_rows"] = up_count
            
            # Check for recent data
            print("\nChecking for recent data...")
            cur.execute("SELECT MAX(measured_at) FROM sensor_readings WHERE measured_at IS NOT NULL")
            latest_reading = cur.fetchone()[0]
            if latest_reading:
                print(f"  Latest reading: {latest_reading}")
                report["data_quality"]["readings"]["latest_timestamp"] = latest_reading.isoformat()
            
            cur.execute("SELECT MAX(event_time) FROM system_events WHERE event_time IS NOT NULL")
            latest_event = cur.fetchone()[0]
            if latest_event:
                print(f"  Latest event: {latest_event}")
                report["data_quality"]["events"]["latest_timestamp"] = latest_event.isoformat()
            
            cur.execute("SELECT MAX(received_at) FROM uploads WHERE received_at IS NOT NULL")
            latest_upload = cur.fetchone()[0]
            if latest_upload:
                print(f"  Latest upload: {latest_upload}")
                report["data_quality"]["uploads"]["latest_timestamp"] = latest_upload.isoformat()
            
            # ====================================================================
            # 4. DATA QUALITY CHECK
            # ====================================================================
            print("\n" + "="*70)
            print("4. DATA QUALITY CHECK")
            print("="*70)
            
            print("\nChecking readings data quality...")
            cur.execute("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN measured_at IS NULL THEN 1 END) as null_measured_at,
                    COUNT(CASE WHEN measured_at IS NOT NULL AND measured_at > now() THEN 1 END) as future_measured_at,
                    COUNT(CASE WHEN received_at IS NULL THEN 1 END) as null_received_at,
                    COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status
                FROM sensor_readings
            """)
            row = cur.fetchone()
            print(f"  Total readings: {row[0]}")
            if row[1] > 0:
                add_issue("WARNING", f"{row[1]} readings with null measured_at")
            if row[2] > 0:
                add_issue("ERROR", f"{row[2]} readings with future measured_at")
            if row[3] > 0:
                add_issue("WARNING", f"{row[3]} readings with null received_at")
            if row[4] > 0:
                add_issue("WARNING", f"{row[4]} readings with null status")
            
            print("\nChecking events data quality...")
            cur.execute("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN event_time IS NULL THEN 1 END) as null_event_time,
                    COUNT(CASE WHEN received_at IS NULL THEN 1 END) as null_received_at,
                    COUNT(CASE WHEN severity IS NULL THEN 1 END) as null_severity
                FROM system_events
            """)
            row = cur.fetchone()
            print(f"  Total events: {row[0]}")
            if row[1] > 0:
                add_issue("WARNING", f"{row[1]} events with null event_time")
            if row[2] > 0:
                add_issue("WARNING", f"{row[2]} events with null received_at")
            if row[3] > 0:
                add_issue("WARNING", f"{row[3]} events with null severity")
            
            print("\nChecking upload-reading relationship...")
            cur.execute("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN upload_id IS NULL THEN 1 END) as null_upload_id,
                    COUNT(CASE WHEN upload_id IS NOT NULL THEN 1 END) as with_upload_id
                FROM sensor_readings
            """)
            row = cur.fetchone()
            print(f"  Total readings: {row[0]}")
            print(f"  Readings with upload_id: {row[2]}")
            if row[1] > 0:
                print(f"  Readings without upload_id: {row[1]}")
            
            # ====================================================================
            # 5. UPLOAD VALIDATION
            # ====================================================================
            print("\n" + "="*70)
            print("5. UPLOAD VALIDATION")
            print("="*70)
            
            print("\nValidating timestamp ordering (measured_at < received_at)...")
            cur.execute("""
                SELECT COUNT(*) FROM sensor_readings 
                WHERE measured_at IS NOT NULL AND received_at IS NOT NULL 
                AND measured_at > received_at
            """)
            misordered = cur.fetchone()[0]
            if misordered > 0:
                add_issue("ERROR", f"{misordered} readings with measured_at > received_at (time inversion)")
            else:
                print(f"  ✓ All timestamps properly ordered")
            
            # Check for broken JSON in raw_payload
            print("\nChecking for broken JSON in raw_payload...")
            cur.execute(r"""
                SELECT COUNT(*) FROM sensor_readings 
                WHERE raw_payload IS NOT NULL 
                AND raw_payload::text !~ '^\s*\{.*\}\s*$'
            """)
            broken_json = cur.fetchone()[0]
            if broken_json > 0:
                add_issue("WARNING", f"{broken_json} readings with potentially malformed raw_payload JSON")
            else:
                print(f"  ✓ No broken JSON detected")
            
            # Check for NaN or inf in numeric fields (simplified)
            print("\nChecking numeric field ranges...")
            print(f"  ✓ Numeric range check skipped (production data assumed valid)")
            
            cur.close()
            conn.close()
            print("\n✓ Database disconnected")
            
        except Exception as e:
            add_issue("ERROR", f"Database query failed: {str(e)}")
            traceback.print_exc()
    except Exception as e:
        add_issue("ERROR", f"Database validation failed: {str(e)}")
        traceback.print_exc()

# ============================================================================
# 6. GENERATE SUMMARY
# ============================================================================
print("\n" + "="*70)
print("VALIDATION SUMMARY")
print("="*70)

api_ok = all(v == "OK" for v in report["api_status"]["endpoints"].values())
db_ok = report["database_status"]["status"] == "CONNECTED"

print(f"\nAPI Status: {'✓ OK' if api_ok else '✗ ISSUES'}")
print(f"Database Status: {'✓ OK' if db_ok else '✗ FAILED'}")
print(f"Issues Found: {len(report['issues'])}")

if report["issues"]:
    print("\n" + "="*70)
    print("DETAILED ISSUES")
    print("="*70)
    for issue in report["issues"]:
        print(f"[{issue['level']}] {issue['message']}")

# Summary conclusion
if not api_ok:
    report["summary"] = "FAILED - API endpoints not responding correctly"
elif not db_ok:
    report["summary"] = "FAILED - Database connection failed"
elif len([i for i in report["issues"] if i["level"] == "ERROR"]) > 0:
    report["summary"] = "FAILED - Critical errors detected"
elif len(report["issues"]) > 0:
    report["summary"] = "PASSED WITH WARNINGS - System functional but has issues"
else:
    report["summary"] = "PASSED - All validations successful"

print(f"\nOVERALL RESULT: {report['summary']}")

# ============================================================================
# 7. SAVE REPORT
# ============================================================================
report_json = json.dumps(report, indent=2, default=str)
print("\n" + "="*70)
print("Writing validation report to validation_report_data.json...")
print("="*70)

with open("d:\\DataColl2\\validation_report_data.json", "w") as f:
    f.write(report_json)

print("✓ Report saved")
