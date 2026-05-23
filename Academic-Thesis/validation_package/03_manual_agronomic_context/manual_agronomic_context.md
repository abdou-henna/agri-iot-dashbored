# Manual Agronomic Context Layer

The uploaded agronomic events file contains 6 manual/contextual events. These events should be described in the thesis as a separate agronomic context layer, not as automatic sensor measurements.

## Confirmed event types

| event_type    |   count |
|:--------------|--------:|
| irrigation    |       4 |
| field_note    |       1 |
| fertilization |       1 |

## Thesis use

- Irrigation events support pre/post irrigation interpretation around soil moisture trends.
- Fertilization events provide management context for later EC or crop observations, but they do not diagnose nutrient status.
- Field notes provide human-observed context, but they do not replace sensor data or deterministic analysis.

## Recommended thesis wording

The system integrates automatic IoT measurements with manually recorded agronomic events. This design allows soil and weather trends to be interpreted in relation to real field operations such as irrigation, fertilization, and field observations while maintaining strict separation between sensor data and human-entered agronomic context.
