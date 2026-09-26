# Google Health API v4 findings (task 1.1)

Source: the official discovery document,
`https://health.googleapis.com/$discovery/rest?version=v4`, revision `20260923`. A snapshot is kept
in `docs/google-health-api/discovery-v4.json`. The developer guides on developers.google.com were not
reachable from the build environment. Anything below that is marked **inferred** comes from names and
descriptions only, and still has to be confirmed with real calls in task 1.2.

## Model

- Base URL `https://health.googleapis.com/v4/`. The user is always `users/me`.
- Every metric is a **data type** under `users/me/dataTypes/{data-type}`, with a kebab-case id such as
  `heart-rate` or `nutrition-log`. A data point carries exactly one type field (for example
  `steps`) plus an optional `dataSource`.
- Data types come in four kinds, and the kind decides the filter field:

| Kind | Time field | Filter pattern |
|---|---|---|
| interval | `interval.startTime/endTime` | `{type}.interval.start_time` (RFC 3339) or `.civil_start_time` (local `YYYY-MM-DD[THH:mm:ss]`) |
| sample | `sampleTime.physicalTime` | `{type}.sample_time.physical_time` or `.civil_time` |
| daily | `date` | `{type}.date` (`YYYY-MM-DD`) |
| session | `interval` (with UTC offsets) | `{type}.interval.civil_start_time`; sleep: `sleep.interval.end_time` / `civil_end_time`; ECG: `electrocardiogram.interval.start_time >=` only |

  Filters support `>=` and `<`, joined with `AND`. Results come newest first.
- Page size defaults to 1440 and can go up to 10000. For `sleep` and `exercise` the default and the
  maximum are both 25. Pagination uses `pageToken` and `nextPageToken`.
- Writes (`create`, `patch`, `batchDelete`) return a long-running `Operation`. Data point names are
  `users/{user}/dataTypes/{type}/dataPoints/{id}`. **The id can be chosen by the client**: 4–63
  characters of lowercase letters, digits and hyphens. So `write_data` can pick the id and return it
  straight away.
- Only "identifiable" data types have data point names, and only those can be written, patched or
  deleted. The discovery document does not list which types those are (**inferred**: the session
  types and the manually logged types; nutrition and hydration logs certainly, since their write
  scopes and schemas exist).

## Scopes

Scopes are grouped by category. Each category has a `.readonly` scope, a `.writeonly` scope, or both.
All of them are prefixed with `https://www.googleapis.com/auth/googlehealth.`.

| Category | readonly | writeonly |
|---|---|---|
| `activity_and_fitness` | ✓ | ✓ |
| `health_metrics_and_measurements` | ✓ | ✓ |
| `sleep` | ✓ | ✓ |
| `nutrition` | **–** | ✓ |
| `mindfulness` | ✓ | ✓ |
| `logged_symptoms` | ✓ | ✓ |
| `reproductive_health` | ✓ | ✓ |
| `profile` | ✓ | ✓ |
| `settings` | ✓ | ✓ |
| `ecg`, `irn`, `location` | ✓ | – |

**Write-only scope, self-written data only.** In the API's words: "Callers that were only granted write
scopes for the requested data type may only read the data they wrote themselves: their requests are
implicitly restricted to `self-sources`". Nutrition has no read scope at all. So Health AI can read back
only the meals and water it logged itself, not the ones logged in the Fitbit or Google Health app.

### Data type catalog

Kind and aggregation support come from the discovery document. The scope category is **inferred**.

| Data type | Kind | Category (inferred) | rollUp | dailyRollUp |
|---|---|---|---|---|
| `steps`, `distance`, `floors`, `altitude` | interval | activity_and_fitness | ✓ | ✓ |
| `active-minutes`, `active-zone-minutes`, `sedentary-period`, `active-energy-burned` | interval | activity_and_fitness | ✓ | ✓ |
| `time-in-heart-rate-zone`, `swim-lengths-data` | interval | activity_and_fitness | ✓ | ✓ |
| `basal-energy-burned` | interval | activity_and_fitness | – | – |
| `activity-level` | daily | activity_and_fitness | ✓ | ✓ |
| `daily-heart-rate-zones`, `daily-vo2-max` | daily | activity_and_fitness | – | – |
| `exercise` | session | activity_and_fitness (+ `location` for GPS) | – | – |
| `run-vo2-max` | sample | activity_and_fitness | ✓ | ✓ |
| `vo2-max` | sample | activity_and_fitness | – | – |
| `heart-rate` | sample | health_metrics_and_measurements | ✓ (max 14 days) | ✓ |
| `heart-rate-variability`, `oxygen-saturation`, `respiratory-rate-sleep-summary` | sample | health_metrics_and_measurements | – | – |
| `weight`, `body-fat`, `blood-glucose`, `core-body-temperature` | sample | health_metrics_and_measurements | ✓ | ✓ |
| `height` | sample | health_metrics_and_measurements | – | – |
| `daily-resting-heart-rate`, `daily-heart-rate-variability`, `daily-oxygen-saturation`, `daily-respiratory-rate`, `daily-sleep-temperature-derivations` | daily | health_metrics_and_measurements | – | – |
| `sleep` | session | sleep | – | – |
| `nutrition-log` | session | nutrition | ✓ | ✓ |
| `hydration-log` | session | nutrition | ✓ | ✓ |
| `moods` | sample | mindfulness | – | – |
| `symptoms` | sample | logged_symptoms | – | – |
| `menstrual-period` | interval | reproductive_health | – | – |
| `ovulation-test` | sample | reproductive_health | – | – |
| `electrocardiogram` | session | ecg | – | – |
| `irregular-rhythm-notification` | session | irn | – | – |

Roll-ups also offer the derived values `total-calories` and `calories-in-heart-rate-zone`. Daily
roll-ups also offer `resting-heart-rate-personal-range` and `heart-rate-variability-personal-range`.

## Write model: meals and water

**`nutrition-log`** (session):

- `interval` is required: `startTime`, `endTime`, `startUtcOffset`, `endUtcOffset`.
- `mealType`: `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`, and a few others such as `ANYTIME`.
- Either `food` (a reference to a Food resource, "identified food") or `foodDisplayName`
  (anonymous food) with its own values:
  - `energy.kcal`, `energyFromFat.kcal`;
  - `totalCarbohydrate.grams`, `totalFat.grams`;
  - `nutrients[]` of `{nutrient: enum (CAFFEINE, CALCIUM, DIETARY_FIBER, …), quantity.grams}`;
  - `serving {amount, foodMeasurementUnit}`.
- Value ranges: energy 0–100000 kcal, weights 0–100000 g. `userProvidedUnit` records the unit the
  user entered.
- The discovery document has no food search endpoint. Health AI logs anonymous foods with
  `foodDisplayName`.

**`hydration-log`** (session): `interval` (required) and `amountConsumed.milliliters` (0–100000),
with an optional `userProvidedUnit` (`LITER`, `MILLILITER`, `CUP_US`, …).

## Mapping to the tools

Every data call uses `users/me` and the data type's scope.

| Tool | Endpoint | Scope |
|---|---|---|
| `list_data_types` | none; built from the registry and the user's granted scopes | – |
| `read_data` | `GET v4/users/me/dataTypes/{type}/dataPoints?filter=…&pageSize=…&pageToken=…` | the type's `.readonly`, or `.writeonly` (self-written data only) |
| `aggregate_data` | hour or custom buckets: `POST …/dataPoints:rollUp` `{range, windowSize: "3600s"}`; day or week buckets: `POST …/dataPoints:dailyRollUp` `{range (civil), windowSizeDays: 1 or 7}` | as `read_data` |
| `write_data` | `POST v4/users/me/dataTypes/{type}/dataPoints` (body: DataPoint with a client-chosen `name`) | the type's `.writeonly` |
| `update_data` | `PATCH v4/users/me/dataTypes/{type}/dataPoints/{id}` | the type's `.writeonly` |
| `delete_data` | `POST v4/users/me/dataTypes/{type}/dataPoints:batchDelete` `{names: [...]}` | the type's `.writeonly` |
| `get_profile` | `GET v4/users/me/profile` (age, stride lengths, member since) and `GET v4/users/me/settings` (time zone, UTC offset, units, locale) | `profile.readonly`, `settings.readonly` |
| `list_devices` | `GET v4/users/me/pairedDevices` (type, battery status and level, last sync time, product name) | `settings.readonly` |

Roll-up limits: the range is closed-open. The maximum range is 14 days for `heart-rate`,
`active-minutes`, `total-calories` and `calories-in-heart-rate-zone`, and 90 days for all other types.
For `dailyRollUp` the start must line up with the window.

## Also in the API (not used now)

- `dataPoints:reconcile` merges several sources into one stream.
- `exportExerciseTcx` exports an exercise as TCX.
- `users.getIdentity` returns the Health user id.
- `irnProfile`.
- `updateProfile` and `updateSettings`.
- Webhook subscribers (`projects.subscribers`, cloud-platform scope). These could later drive
  reminders.
- SMART Health Links (`shl`).

## Differences from the accepted model

These are reported, not fixed. Changing the accepted nodes needs a decision (see the chat).

1. **Nutrition cannot be read beyond Health AI's own entries.** The model assumes readable and writable
   flags per data type. For `nutrition-log` and `hydration-log`, reads are limited to self-written
   data.
2. **Writable types.** The model names the nutrition log and hydration as writable. The API also allows
   writes to most other categories (sleep, weight and more). The registry can offer more of them later;
   the first cut stays at nutrition and hydration, as the model says.
3. **The profile is split.** Time zone and units live in Settings, not in Profile, and devices need
   `settings.readonly`. `get_profile` therefore calls two endpoints, and the default scope set must
   include `settings.readonly`.
4. **Aggregation by type.** Sleep and most daily types have no roll-up. `aggregate_data` has to say so
   for those types and point to `read_data`.
