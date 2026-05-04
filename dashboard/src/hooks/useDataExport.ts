import { useMemo, useState } from 'react';
import { getAgronomicEvents } from '../api/agronomy.api';
import { getEvents } from '../api/events.api';
import { getReadings } from '../api/readings.api';
import { getUploads } from '../api/uploads.api';
import type { AgronomicEvent } from '../types/agronomy';
import type { SystemEvent } from '../types/events';
import type { SensorReading } from '../types/readings';
import type { UploadRecord } from '../types/uploads';
import { downloadCsv, toCsv, type CsvColumn } from '../utils/csv';

export type ExportDataset = 'sensor_readings' | 'system_events' | 'uploads' | 'agronomic_events';

const sensorColumns: CsvColumn<SensorReading>[] = [
  { key: 'record_id', header: 'record_id' }, { key: 'upload_id', header: 'upload_id' }, { key: 'gateway_id', header: 'gateway_id' },
  { key: 'node_id', header: 'node_id' }, { key: 'node_type', header: 'node_type' }, { key: 'node_seq', header: 'node_seq' },
  { key: 'frame_id', header: 'frame_id' }, { key: 'measured_at', header: 'measured_at' }, { key: 'received_at', header: 'received_at' },
  { key: 'rssi', header: 'rssi' }, { key: 'snr', header: 'snr' }, { key: 'soil_temperature_c', header: 'soil_temperature_c' },
  { key: 'soil_moisture_percent', header: 'soil_moisture_percent' }, { key: 'soil_ec_us_cm', header: 'soil_ec_us_cm' },
  { key: 'air_temperature_c', header: 'air_temperature_c' }, { key: 'air_humidity_percent', header: 'air_humidity_percent' },
  { key: 'air_pressure_hpa', header: 'air_pressure_hpa' }, { key: 'status', header: 'status' }, { key: 'error_code', header: 'error_code' },
];

const eventsColumns: CsvColumn<SystemEvent>[] = [
  { key: 'event_id', header: 'event_id' }, { key: 'upload_id', header: 'upload_id' }, { key: 'gateway_id', header: 'gateway_id' },
  { key: 'node_id', header: 'node_id' }, { key: 'event_type', header: 'event_type' }, { key: 'severity', header: 'severity' },
  { key: 'event_time', header: 'event_time' }, { key: 'received_at', header: 'received_at' }, { key: 'error_code', header: 'error_code' },
  { key: 'message', header: 'message' }, { key: 'details', header: 'details' },
];

const uploadsColumns: CsvColumn<UploadRecord>[] = [
  { key: 'upload_id', header: 'upload_id' }, { key: 'gateway_id', header: 'gateway_id' }, { key: 'started_at', header: 'started_at' },
  { key: 'finished_at', header: 'finished_at' }, { key: 'received_at', header: 'received_at' }, { key: 'status', header: 'status' },
  { key: 'records_count', header: 'records_count' }, { key: 'events_count', header: 'events_count' }, { key: 'notes', header: 'notes' },
  { key: 'raw_summary', header: 'raw_summary' },
];

const agronomyColumns: CsvColumn<AgronomicEvent>[] = [
  { key: 'agro_event_id', header: 'agro_event_id' }, { key: 'gateway_id', header: 'gateway_id' }, { key: 'event_category', header: 'event_category' },
  { key: 'event_type', header: 'event_type' }, { key: 'target_scope', header: 'target_scope' }, { key: 'started_at', header: 'started_at' },
  { key: 'ended_at', header: 'ended_at' }, { key: 'confidence', header: 'confidence' }, { key: 'details', header: 'details' },
  { key: 'notes', header: 'notes' }, { key: 'created_at', header: 'created_at' }, { key: 'updated_at', header: 'updated_at' },
];

function stamp() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportNote = useMemo(() => 'Export uses current API limit; pagination export is not implemented yet.', []);

  async function exportDataset(dataset: ExportDataset, from: string, to: string) {
    if (dataset === 'sensor_readings') {
      const response = await getReadings({ from, to, limit: 1000 });
      downloadCsv(`sensor_readings_${stamp()}.csv`, toCsv(response.readings, sensorColumns));
      return;
    }
    if (dataset === 'system_events') {
      const response = await getEvents({ from, to, limit: 1000 });
      downloadCsv(`system_events_${stamp()}.csv`, toCsv(response.events, eventsColumns));
      return;
    }
    if (dataset === 'uploads') {
      const response = await getUploads({ from, to, limit: 1000 });
      downloadCsv(`uploads_${stamp()}.csv`, toCsv(response.uploads, uploadsColumns));
      return;
    }
    const response = await getAgronomicEvents({ from, to, limit: 1000 });
    downloadCsv(`agronomic_events_${stamp()}.csv`, toCsv(response.events, agronomyColumns));
  }

  async function runExport(datasets: ExportDataset[], from: string, to: string) {
    setIsExporting(true);
    setError(null);
    setMessage(null);
    try {
      for (const dataset of datasets) {
        // eslint-disable-next-line no-await-in-loop
        await exportDataset(dataset, from, to);
      }
      setMessage(`Export completed. ${exportNote}`);
    } catch (exportError) {
      setError(typeof exportError === 'object' && exportError !== null && 'message' in exportError ? String((exportError as { message: unknown }).message) : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  }

  return { isExporting, error, message, exportNote, runExport };
}
