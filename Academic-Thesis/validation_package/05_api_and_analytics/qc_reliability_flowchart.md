# QC and Reliability Flowchart

## Mermaid diagram

```mermaid
flowchart TD
    A[Raw sensor readings] --> B[Canonical timestamp check]
    B --> C[Duplicate detection]
    C --> D[Missing data preservation]
    D --> E[Physical range checks]
    E --> F[Flatline and spike checks]
    F --> G[System-event consistency check]
    G --> H[Window quality score]
    H --> I[Node reliability score]
    I --> J[Deterministic alerts]
    J --> K[Analytics snapshot]
    K --> L[Processed Data Viewer]
    K --> M[Gemini interpretation input]

    N[Agronomic events] --> O[Event confidence weighting]
    O --> H

    P[Uploads metadata] --> Q[Upload freshness diagnostics]
    Q --> I
```

## Interpretation

The QC and reliability pipeline is deterministic. It must run before any interpretation layer. Gemini may receive only processed summaries, reliability scores, limitations, and alert context. It must not clean raw data, fill missing values, compute primary metrics, or override deterministic alert severity.
