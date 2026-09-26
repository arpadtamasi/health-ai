# Spec Delta

## Purpose

Lets the owner improve Health AI from real use: users and their AI agents can send feedback about the service, and every tool call states why it was made, while this material stays private to the owner.

## ADDED Requirements

### Requirement: Feedback tool
The system SHALL provide a `send_feedback` tool that the user's AI agent can call, on the user's request or on its own, with a feedback message, who it comes from (`user` or `agent`) and optionally the tool it concerns, and SHALL store it for the owner with the sender's user id and the time.

#### Scenario: User asks the agent to pass on feedback
- **WHEN** the user tells the agent "tell the developer the sleep answer was confusing" and the agent calls `send_feedback` with source `user`
- **THEN** the feedback is stored with source `user`, the user's id and the time, and the tool confirms it was received

#### Scenario: Agent reports a problem on its own
- **WHEN** the agent calls `send_feedback` with source `agent` and the related tool `read_data` after a confusing error
- **THEN** the feedback is stored with source `agent` and the related tool name

#### Scenario: Empty feedback
- **WHEN** `send_feedback` is called with an empty message
- **THEN** nothing is stored and the tool result says a message is required

### Requirement: Every tool call states its intent
Every tool SHALL accept an `intent` argument, one sentence saying why the call is made, and the system SHALL record the tool name, the intent and the time for the owner. A call without an intent SHALL still be executed, and the missing intent SHALL be recorded.

#### Scenario: Call with intent
- **WHEN** the agent calls `read_data` with intent "the user asked how they slept last night"
- **THEN** the call is executed and the tool name, intent and time are recorded

#### Scenario: Call without intent
- **WHEN** the agent calls `aggregate_data` without an intent
- **THEN** the call is executed normally and a record with the tool name and "intent missing" is stored

### Requirement: Insight records are protected
Feedback and intent records SHALL be stored outside the application logs, SHALL be readable only by the owner, SHALL be deleted by `delete_my_data` for that user, and SHALL be deleted automatically 90 days after they were written.

#### Scenario: Not in the logs
- **WHEN** a tool call with an intent is executed
- **THEN** the application log contains no intent text and no feedback text

#### Scenario: Deleted with the user's data
- **WHEN** a user calls `delete_my_data` with confirmation
- **THEN** that user's feedback and intent records are deleted

#### Scenario: Retention
- **WHEN** a feedback or intent record is older than 90 days
- **THEN** it is deleted automatically

### Requirement: Owner-only insight tools
The system SHALL provide `list_feedback` and `usage_summary` tools only to the owner's account: `list_feedback` SHALL return feedback newest first with source, related tool and time, and `usage_summary` SHALL return call counts per tool and the recorded intents for a time range. Other accounts SHALL neither see nor call these tools.

#### Scenario: Owner reviews feedback
- **WHEN** the owner calls `list_feedback`
- **THEN** feedback from all users is returned newest first, with source, related tool and time

#### Scenario: Owner reviews usage
- **WHEN** the owner calls `usage_summary` for the last 7 days
- **THEN** call counts per tool and the recorded intents for that period are returned

#### Scenario: Tester cannot see insight tools
- **WHEN** a tester's client calls `tools/list` or calls `list_feedback`
- **THEN** the insight tools are not listed, and the call is refused
