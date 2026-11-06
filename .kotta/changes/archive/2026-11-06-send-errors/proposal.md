# A failed message says why, and the owner can read the failure

## Why

A photo that did not go out said "Ezt a képet nem tudtam elolvasni", although the app blames the photo for any failure; the
owner could not tell what had happened (SZ1). The owner said "Csináld most" to the proposal (J1): say the real reason, and record
each failed send for the owner without its content.

## What changes

- A failed message says why (no connection, too slow, the service failed, refused, daily limit) and blames the photo only when
  the service said so; each failure is recorded for the owner (time, step, status, code, photo or not; no content), kept 90 days,
  read with list_feedback. Rule "A failed message says why, and the owner can read the failure".
- New example "A photo that did not reach the service is not blamed on the photo".

## Open decisions

None.
