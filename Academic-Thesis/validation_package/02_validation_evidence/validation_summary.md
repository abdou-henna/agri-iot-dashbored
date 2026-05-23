# Validation Summary

## Dataset scope

| Metric | Value |
|---|---:|
| Sensor readings | 2433 |
| System events | 8 |
| Manual agronomic events | 6 |
| Upload sessions | 6 |
| Processed data rows | 135 |
| Time window | 2026-05-06T00:00:00+00:00 → 2026-05-11T15:00:00+00:00 |
| Upload row_count total | 2433 |
| Upload error_count total | 3 |

## Per-node coverage

| node_id   |   rows |   ok_rows | first                     | last                      |   avg_rssi |   avg_snr |
|:----------|-------:|----------:|:--------------------------|:--------------------------|-----------:|----------:|
| MAIN      |    811 |       811 | 2026-05-06 00:00:00+00:00 | 2026-05-11 15:00:00+00:00 |   -85.3687 |   8.45931 |
| N2        |    811 |       811 | 2026-05-06 00:00:00+00:00 | 2026-05-11 15:00:00+00:00 |   -97.0031 |   6.09396 |
| N3        |    811 |       811 | 2026-05-06 00:00:00+00:00 | 2026-05-11 15:00:00+00:00 |   -76.4137 |   9.6238  |

## Validation table

| Test                          | Expected                                                               | Actual                                                            | Status                              |
|:------------------------------|:-----------------------------------------------------------------------|:------------------------------------------------------------------|:------------------------------------|
| Data ingestion volume         | Uploaded readings should match upload session row counts               | 2433 readings; upload row_count sum = 2433                        | PASS                                |
| Node coverage                 | MAIN, N2, and N3 should be present                                     | Nodes found: MAIN, N2, N3                                         | PASS                                |
| Measurement time availability | Every reading must have measured_at                                    | Missing measured_at rows: 0                                       | PASS                                |
| Status completeness           | Every reading must have status                                         | Missing status rows: 0; statuses: ok                              | PASS                                |
| Upload processing             | Each upload session should be processed with zero errors               | Uploads: 6; error_count sum: 3                                    | CHECK                               |
| Manual agronomic context      | Manual irrigation/fertilization/notes should be represented separately | Agronomic events: 6; types: fertilization, field_note, irrigation | PASS                                |
| Processed viewer evidence     | Processed deterministic rows should expose reliability and limitations | Rows: 135; reliability range: 0.399-0.399                         | PASS                                |
| Unsupported pH field check    | Project policy says pH is unsupported and must not be claimed          | soil_ph non-null rows in raw file: 1622                           | WARNING: EXCLUDE FROM THESIS CLAIMS |

## Thesis interpretation

The uploaded files provide a coherent evidence set for Chapter 5 validation: readings, uploads, manual agronomic events, system events, processed data lineage, and firmware serial evidence. The data support a validation section focused on data completeness, upload processing, node coverage, time semantics, and deterministic processing transparency.

## Critical caution

The raw readings file contains non-null `soil_ph` values. Earlier project policy states that pH is not supported by the confirmed sensor stack. Therefore, the thesis should not claim pH sensing unless hardware support and calibration evidence are separately provided. In this package, pH is treated as a raw-file inconsistency and excluded from validation claims.
