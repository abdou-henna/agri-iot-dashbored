import { uploadService } from '../services/upload.service.js';

export async function uploadData(req, res, next) {
  try {
    const payload = req.body;

    const result = await uploadService.processUpload(payload);

    res.json({
      ok: true,
      upload_id: result.uploadId,
      // New spec fields
      received_readings: result.receivedRecords,
      inserted_readings: result.insertedRecords,
      duplicate_readings: result.duplicateRecords,
      received_events: result.receivedEvents,
      inserted_events: result.insertedEvents,
      duplicate_events: result.duplicateEvents,
      // Legacy fields kept for firmware compatibility (firmware reads inserted_records)
      received_records: result.receivedRecords,
      inserted_records: result.insertedRecords,
      duplicate_records: result.duplicateRecords,
      server_time: new Date().toISOString(),
      rtc_sync_recommended: true
    });
  } catch (error) {
    next(error);
  }
}
