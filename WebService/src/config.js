// Configuration constants
export const CONFIG = {
  // API
  API_VERSION: 'v1',

  // Node types
  NODE_TYPES: ['soil', 'weather', 'main'],

  // Battery statuses
  BATTERY_STATUSES: ['not_measured', 'ok', 'low', 'critical'],

  // Event severities
  EVENT_SEVERITIES: ['info', 'warning', 'error', 'critical'],

  // Upload statuses
  UPLOAD_STATUSES: ['received', 'processing', 'completed', 'failed'],

  // Reading statuses
  READING_STATUSES: ['ok', 'partial', 'missing', 'error', 'duplicate'],

  // Validation limits
  MAX_READINGS_PER_UPLOAD: 1000,
  MAX_EVENTS_PER_UPLOAD: 500,

  // Time validation (allow some clock drift)
  MAX_CLOCK_DRIFT_MINUTES: 1440, // 24 hours

  // Database constraints
  MAX_TEXT_LENGTH: 1000,
  MAX_JSON_SIZE: 10000
};