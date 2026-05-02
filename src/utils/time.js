// Time utility functions
export function validateTimestamp(timestamp) {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

export function formatTimestamp(date) {
  return date.toISOString();
}

export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export function parseTimestamp(timestamp) {
  return new Date(timestamp);
}