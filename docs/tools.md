# Health AI tools

Health AI maps the Google Health API one to one (`docs/google-health-api.md`). Tools send values
as given and return what Google Health returns. Every tool also takes `intent`: one sentence on why
the call is made. It is recorded for the owner and never blocks the call.

Times are ISO 8601:

- a date: `2026-09-25`;
- a local date-time without offset: `2026-09-25T22:00:00`, read in the user's time zone;
- a timestamp with offset: `2026-09-25T20:00:00Z`.

Ranges are `[start, end)`. Every example below is checked against the tool's input schema by
`server/test/mcp/tools-doc.test.ts`.

## list_data_types

Supported data types, whether the user can read and write each, the aggregations, and the fields
to send for writable types.

```json list_data_types
{ "intent": "find out which data types can be logged" }
```

## read_data

Raw data points of one type, newest first, one page at a time. Sleep is matched by its end time.

```json read_data
{ "data_type": "sleep", "start": "2026-09-26", "end": "2026-09-27", "intent": "the user asked how they slept last night" }
```

```json read_data
{ "data_type": "heart-rate", "start": "2026-09-26T06:00:00", "end": "2026-09-26T07:00:00", "page_size": 500, "intent": "heart rate during the morning run" }
```

## aggregate_data

Roll-ups by Google Health into `hour`, `day` or `week` buckets. Day and week buckets take local
dates. Hour buckets take timestamps with an offset.

```json aggregate_data
{ "data_type": "steps", "bucket": "day", "start": "2026-09-19", "end": "2026-09-26", "intent": "daily steps for the last week" }
```

```json aggregate_data
{ "data_type": "heart-rate", "bucket": "hour", "start": "2026-09-25T00:00:00+02:00", "end": "2026-09-26T00:00:00+02:00", "intent": "hourly heart rate yesterday" }
```

## write_data

Creates one entry and returns its `id`: the name Google gave the new entry, which `update_data` and
`delete_data` take. The writable types are `nutrition-log` (meals) and `hydration-log` (drinks).
The interval's `endTime` must be strictly after `startTime`; log a drink as a 1-minute interval.

Protein, sugar, fiber, vitamins and minerals of a meal go in `nutrients`, one entry per nutrient in
grams. Every value Google Health accepts is listed by `list_data_types`:
`PROTEIN`, `BIOTIN`, `CAFFEINE`, `CALCIUM`, `CHLORIDE`, `CARBOHYDRATES`, `CHOLESTEROL`, `CHROMIUM`, `COPPER`, `DIETARY_FIBER`, `FOLIC_ACID`, `IODINE`, `IRON`, `MAGNESIUM`, `MANGANESE`, `MOLYBDENUM`, `MONOUNSATURATED_FAT`, `NIACIN`, `PANTOTHENIC_ACID`, `PHOSPHORUS`, `POLYUNSATURATED_FAT`, `POTASSIUM`, `RIBOFLAVIN`, `SATURATED_FAT`, `SELENIUM`, `SODIUM`, `SUGAR`, `THIAMIN`, `TRANS_FAT`, `UNSATURATED_FAT`, `VITAMIN_A`, `VITAMIN_B12`, `VITAMIN_B6`, `VITAMIN_C`, `VITAMIN_D`, `VITAMIN_E`, `VITAMIN_K`, `ZINC`, `FOLATE`.

```json write_data
{
  "data_type": "nutrition-log",
  "data": {
    "interval": { "startTime": "2026-09-26T10:30:00Z", "endTime": "2026-09-26T10:45:00Z", "startUtcOffset": "7200s", "endUtcOffset": "7200s" },
    "mealType": "LUNCH",
    "foodDisplayName": "Chicken salad",
    "energy": { "kcal": 420 },
    "totalCarbohydrate": { "grams": 18 },
    "totalFat": { "grams": 22 },
    "nutrients": [
      { "nutrient": "PROTEIN", "quantity": { "grams": 35 } },
      { "nutrient": "DIETARY_FIBER", "quantity": { "grams": 6 } }
    ]
  },
  "intent": "log the lunch from the photo"
}
```

```json write_data
{
  "data_type": "hydration-log",
  "data": {
    "interval": { "startTime": "2026-09-26T07:00:00Z", "endTime": "2026-09-26T07:01:00Z", "startUtcOffset": "7200s", "endUtcOffset": "7200s" },
    "amountConsumed": { "milliliters": 250 }
  },
  "intent": "log a glass of water"
}
```

## update_data

Replaces the values of an entry. It takes the `id` from `write_data`, or the data point `name` from
`read_data`.

Google Health currently answers every `nutrition-log` update with HTTP 500 `INTERNAL`, whatever the
payload or name (probed 2026-09-29; `updateMask` is not a parameter of this method). Until Google
fixes it ([issue 567168257](https://issuetracker.google.com/issues/567168257)), correct a meal with
`delete_data` and a new `write_data`.

```json update_data
{
  "data_type": "nutrition-log",
  "id": "hai-0f8b1c2e-4a5d-4e6f-9a7b-8c9d0e1f2a3b",
  "data": {
    "interval": { "startTime": "2026-09-26T10:30:00Z", "endTime": "2026-09-26T10:45:00Z", "startUtcOffset": "7200s", "endUtcOffset": "7200s" },
    "mealType": "LUNCH",
    "foodDisplayName": "Chicken salad, half portion",
    "energy": { "kcal": 210 }
  },
  "intent": "the user said they ate only half"
}
```

## delete_data

```json delete_data
{ "data_type": "nutrition-log", "ids": ["hai-0f8b1c2e-4a5d-4e6f-9a7b-8c9d0e1f2a3b"], "intent": "the user logged the lunch twice" }
```

## get_profile and list_devices

```json get_profile
{ "intent": "check the user's time zone before reading" }
```

```json list_devices
{ "intent": "the user asked when the Fitbit last synced" }
```

## send_feedback

Agents also call this on their own, without asking the user, when a task took more calls than it
needed, a result was confusing, or a capability was missing.

```json send_feedback
{ "message": "Needed list_data_types, three read_data calls and aggregate_data to compare sleep and dinner times.", "source": "agent", "kind": "too_many_calls", "tools": ["list_data_types", "read_data", "aggregate_data"], "intent": "report friction" }
```

## delete_my_data

Revokes Google access, deletes everything Health AI stores about the user, and signs out every
client. Call it only after the user explicitly asks.

```json delete_my_data
{ "confirm": true, "intent": "the user asked to delete their Health AI data" }
```

## Owner only: list_feedback and usage_summary

```json list_feedback
{ "from": "2026-09-01", "limit": 20, "intent": "weekly feedback review" }
```

```json usage_summary
{ "from": "2026-09-19", "to": "2026-09-26", "intent": "which tools were used this week" }
```
