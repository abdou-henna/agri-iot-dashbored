import type { NodeId, NodeType, ReadingStatus } from './common';
import type { SystemEvent } from './events';

export interface GatewayStatus {
  gateway_id: string;
  name: string | null;
  last_seen_at: string | null;
  last_upload_at: string | null;
  last_upload_id: string | null;
  firmware_version: string | null;
}

export interface LatestReadingStatus {
  node_id: NodeId;
  node_type: NodeType;
  measured_at: string;
  status: ReadingStatus;
  battery_status?: 'not_measured';
  rssi?: number | null;
  snr?: number | null;
  soil_temperature_c?: number | null;
  soil_moisture_percent?: number | null;
  soil_ec_us_cm?: number | null;
  air_temperature_c?: number | null;
  air_humidity_percent?: number | null;
  air_pressure_hpa?: number | null;
}

export interface StatusResponse {
  gateways: GatewayStatus[];
  latest_readings: LatestReadingStatus[];
  recent_warnings_errors: SystemEvent[];
  server_time: string;
}

export interface NodeHealth {
  node_id: NodeId;
  node_type: NodeType;
  name: string | null;
  gateway_id: string;
  created_at: string;
  last_seen_at: string | null;
  last_seq: number | null;
}

export interface NodesResponse {
  nodes: NodeHealth[];
}

