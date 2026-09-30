# Spec Delta

## Purpose

Provides a thin, resource-oriented MCP tool set that mirrors the Google Health API one-to-one, so AI clients can read and write the user's health data without the server adding domain logic.

## ADDED Requirements

### Requirement: Resource-oriented tool set
The system SHALL expose a fixed, small set of generic tools that correspond to Google Health API operations: `list_data_types`, `read_data`, `aggregate_data`, `write_data`, `update_data`, `delete_data`, `get_profile` and `list_devices`, rather than one tool per data type.

#### Scenario: Tool listing
- **WHEN** a client calls `tools/list`
- **THEN** the response contains the core tools of this capability, `delete_my_data` and `send_feedback`, plus `list_feedback` and `usage_summary` for the owner only, each with an input schema that includes `intent`

### Requirement: Thin mapping without domain logic
The tools MUST pass data between the client and the Google Health API without estimating, inferring, or altering health values, apart from format conversion between the MCP input schema and the API's request and response formats.

#### Scenario: Writing a record
- **WHEN** a client calls `write_data` with a record whose values are valid for the data type
- **THEN** the same values are sent to the Google Health API and the created record, including its upstream id, is returned

### Requirement: Data type discovery
The `list_data_types` tool SHALL return every data type the server supports, whether each is readable and writable for the current user given granted scopes, and the field schema needed to write it.

#### Scenario: Discover writable types
- **WHEN** a client calls `list_data_types`
- **THEN** each entry states its name, description, readable, writable, and for writable types the required and optional fields with units

#### Scenario: Scope not granted
- **WHEN** the user has not granted the write scope for a data type
- **THEN** that data type is listed with `writable: false` and the reason

### Requirement: Reading raw data
The `read_data` tool SHALL return data points of one data type for a time range given as ISO 8601 timestamps or dates, interpreted in the user's time zone when no offset is given, with pagination for large results.

#### Scenario: Read last night's sleep
- **WHEN** a client calls `read_data` with type `sleep` and a range covering last night
- **THEN** the sleep sessions in that range are returned with start, end, stages and source device

#### Scenario: Large result
- **WHEN** the requested range contains more records than one page
- **THEN** the result contains one page of records and a continuation token that returns the next page when passed back

#### Scenario: Invalid range
- **WHEN** the range end is before its start or the data type is unknown
- **THEN** the tool returns an error naming the invalid argument

### Requirement: Aggregated data
The `aggregate_data` tool SHALL return values of one data type aggregated into day, week or hour buckets over a time range, using the aggregation the Google Health API provides for that type.

#### Scenario: Daily steps for a week
- **WHEN** a client calls `aggregate_data` with type `steps`, bucket `day`, and a seven-day range
- **THEN** seven buckets are returned, each with its date and total step count

### Requirement: Writing, updating and deleting records
The system SHALL allow creating, updating and deleting records of writable data types, including nutrition log entries and hydration entries, and SHALL return the upstream record id for every created record so it can later be updated or deleted.

#### Scenario: Log a meal
- **WHEN** a client calls `write_data` with a nutrition entry containing meal type, time, food name, amount and nutrient values
- **THEN** the entry is created in the user's Google Health account and appears in the Google Health app, and the tool returns its id

#### Scenario: Correct a logged meal
- **WHEN** a client calls `update_data` with the id of a previously created nutrition entry and changed amounts
- **THEN** the entry in Google Health reflects the new values

#### Scenario: Delete a record
- **WHEN** a client calls `delete_data` with the id of a record the user owns
- **THEN** the record is removed from Google Health

#### Scenario: Write to read-only type
- **WHEN** a client calls `write_data` for a data type that is not writable
- **THEN** the tool returns an error and nothing is sent upstream

### Requirement: Profile and devices
The `get_profile` tool SHALL return the user's profile settings relevant to interpreting data (time zone, units, and, if available, age, height and weight), and `list_devices` SHALL return the user's connected devices with type, battery level and last sync time where the API provides them.

#### Scenario: Check Fitbit sync
- **WHEN** a client calls `list_devices`
- **THEN** the Fitbit Air is listed with its last sync time

### Requirement: Tool annotations
Every tool SHALL declare MCP tool annotations: read-only tools as `readOnlyHint: true`, and `delete_data` and `delete_my_data` as `destructiveHint: true`.

#### Scenario: Client inspects annotations
- **WHEN** a client lists the tools
- **THEN** `read_data`, `aggregate_data`, `list_data_types`, `get_profile` and `list_devices` are marked read-only, and `delete_data` and `delete_my_data` are marked destructive
