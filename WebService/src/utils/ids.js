// ID generation and validation utilities
export function generateUploadId(gatewayId, timestamp = new Date()) {
  const dateStr = timestamp.toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `UP-${gatewayId}-${dateStr}`;
}

export function generateEventId(gatewayId, timestamp = new Date(), counter = 1) {
  const dateStr = timestamp.toISOString().slice(0, 15).replace(/[:-]/g, '');
  const counterStr = counter.toString().padStart(3, '0');
  return `EV-${gatewayId}-${dateStr}-${counterStr}`;
}

export function generateRecordId(gatewayId, nodeId, sequence) {
  const seqStr = sequence.toString().padStart(6, '0');
  return `${gatewayId}-${nodeId}-${seqStr}`;
}

export function validateRecordId(recordId) {
  // Basic validation: GW-XX-NX-XXXXXX format
  const pattern = /^[A-Z0-9]+-[A-Z0-9]+-\d{6}$/;
  return pattern.test(recordId);
}

export function validateEventId(eventId) {
  // Basic validation: EV-GW-XX-YYYYMMDDHHMMSS-XXX format
  const pattern = /^EV-[A-Z0-9]+-\d{14}-\d{3}$/;
  return pattern.test(eventId);
}