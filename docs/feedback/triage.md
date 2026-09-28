# Feedback triage

Feedback sent from Claude through Health AI's `send_feedback` tool, tracked by the `feedback` skill
(`.claude/skills/feedback/SKILL.md`). Firestore deletes the raw records after 90 days; this ledger
keeps the decisions.

Feedback is addressed to the developer, so messages are kept verbatim below. Email addresses, names,
raw user ids and the user's own measurements are replaced with `[redacted]`.

States: `new` → `accepted` | `declined` | `duplicate`; `accepted` → `done` | `declined`.

| Key (`at`, UTC) | State | Kind | Source | Tools | User | Summary | Action |
|---|---|---|---|---|---|---|---|
| 2026-09-27T10:29:50.759Z | accepted | missing_capability | user | write_data | — | nutrition-log writes cannot record protein | Documented: `list_data_types` lists every nutrient (PROTEIN first) and the example logs protein; the API already accepted it in `nutrients`. Mark done after deploy. |
| 2026-09-27T13:33:01.162Z | accepted | bug | user | update_data, write_data, read_data, list_data_types | — | nutrition-log entries cannot be edited (404 with the write_data id, 500 with the read_data name); protein undocumented; hydration example has a zero-length interval | Fixed in code: `write_data` returns the name Google assigned (IF-01m3eb1gy6aa3z553154dgycdd), `update_data`/`delete_data` accept Google ids. Open: the 500 on patch, to diagnose from the new `tool_failure` log after deploy. Protein: see 2026-09-27T10:29:50.759Z. Hydration: see 2026-09-28T06:06:33.813Z. |
| 2026-09-28T06:06:33.813Z | accepted | bug | user | write_data, list_data_types | — | hydration-log example uses a zero-length interval, which Google rejects | Example changed to a 1-minute interval in `list_data_types` and `docs/tools.md`; the interval description says endTime must be after startTime. Auto-extending endTime declined: the server passes values through unchanged (BR-01m3eb1fm9kjbng60zvjgc34yn). |

## Messages

### 2026-09-27T10:29:50.759Z

> nutrition-log write_data has no field for protein. The writeFields list only energy, energyFromFat, totalCarbohydrate, totalFat and a nutrients array (examples: DIETARY_FIBER, CAFFEINE, CALCIUM). For a typical meal (grilled chicken breast with rice, ~55 g protein) protein is the most important macro and it cannot be recorded. Please add protein (e.g. a totalProtein {grams} field, or document PROTEIN as a supported value in nutrients if Google Health accepts it there).

### 2026-09-27T13:33:01.162Z

> update_data on nutrition-log fails. (1) Using the "hai-…" id returned by write_data: Google says "The requested resource was not found" (entries written minutes earlier, readable via read_data). (2) Using the data point name from read_data (users/…/dataTypes/nutrition-log/dataPoints/…): HTTP 500 "Google Health is unavailable", even with an unchanged payload. So entries can't be edited at all. Also: writeFields for nutrition-log doesn't document protein — please list whether PROTEIN is a valid nutrients[] value (or a top-level field), since users want to log protein. Minor: hydration-log example uses startTime == endTime, but Google rejects that ("start time must be strictly earlier than end time").

### 2026-09-28T06:06:33.813Z

> hydration-log write: Google Health rejects a zero-length interval ("Data point start time must be strictly earlier than end time"), but the example in list_data_types uses identical startTime and endTime (09:00–09:00), so following it fails on the first try. Suggested fix: change the example to a 1-minute interval, and/or have write_data auto-extend endTime by 1 minute when it equals startTime (same for nutrition-log).
