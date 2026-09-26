# Spec Delta

## Purpose

Defines how the health MCP server is exposed to AI clients as a remote MCP endpoint, how users are isolated from one another, how errors are reported, and how users remove their data.

## ADDED Requirements

### Requirement: Remote MCP endpoint
The system SHALL expose a single MCP endpoint over HTTPS using the MCP Streamable HTTP transport, reachable from the public internet, so that any MCP client supporting remote servers can connect without local installation.

#### Scenario: Client connects to the endpoint
- **WHEN** an MCP client sends an `initialize` request with a valid access token to the MCP endpoint
- **THEN** the server responds with its server info, protocol version and the list of supported capabilities including tools

#### Scenario: Plain HTTP is rejected
- **WHEN** a request reaches the service over unencrypted HTTP
- **THEN** the request is not served as an MCP request

### Requirement: Every MCP request is authenticated
The system MUST reject any MCP request that does not carry a valid, unexpired access token issued by the server's own authorization server, and MUST point the client to its OAuth metadata.

#### Scenario: Missing token
- **WHEN** a client calls the MCP endpoint without an `Authorization: Bearer` header
- **THEN** the server responds with HTTP 401 and a `WWW-Authenticate` header referencing the protected resource metadata URL

#### Scenario: Expired or revoked token
- **WHEN** a client calls the MCP endpoint with an expired or revoked access token
- **THEN** the server responds with HTTP 401 and does not execute any tool

### Requirement: Per-user data isolation
The system MUST execute every tool call strictly on behalf of the authenticated user, using only that user's Google Health credentials and stored records. The one exception: the owner's `list_feedback` and `usage_summary` tools MAY read the feedback and intent records of all users, and nothing else of theirs.

#### Scenario: Two users call the same tool
- **WHEN** user A and user B each call `read_data` for the same data type and time range
- **THEN** each receives only data from their own Google Health account

#### Scenario: Owner reads insight records
- **WHEN** the owner calls `list_feedback`
- **THEN** feedback records of all users are returned, but no other user's health data, tokens or other records are read

#### Scenario: Tool arguments cannot select another user
- **WHEN** a tool call includes an argument that names a different user identifier
- **THEN** the argument is ignored or rejected and no other user's data is accessed

### Requirement: Actionable tool errors
The system SHALL report failures of tool calls as MCP tool results marked as errors with a human-readable message that tells the user or the AI what to do next, rather than as transport-level failures.

#### Scenario: Upstream API rejects a request
- **WHEN** the Google Health API returns a validation error for a tool call
- **THEN** the tool result is marked as an error and includes the upstream reason in readable form

#### Scenario: Upstream rate limit
- **WHEN** the Google Health API responds with a rate-limit error
- **THEN** the tool result is marked as an error stating that the request was rate limited and can be retried later

### Requirement: Access restricted to allow-listed users
The system SHALL only allow sign-in for Google accounts that are on the operator-managed allow list (owner and testers).

#### Scenario: Non-listed account tries to connect
- **WHEN** a Google account that is not on the allow list completes Google sign-in
- **THEN** the authorization flow ends with an access-denied error and no user record or token is stored

### Requirement: User can delete their data
The system SHALL provide a `delete_my_data` tool that revokes the user's Google grant, deletes all data the server stores for that user, and invalidates the user's MCP tokens.

#### Scenario: User deletes their data
- **WHEN** an authenticated user calls `delete_my_data` with explicit confirmation
- **THEN** the Google refresh token is revoked, the user's stored records are deleted, and subsequent calls with the user's previous access token receive HTTP 401

#### Scenario: Missing confirmation
- **WHEN** a user calls `delete_my_data` without the confirmation argument
- **THEN** nothing is deleted and the tool result explains that confirmation is required

### Requirement: No health data in logs
The system MUST NOT write health data values, meal contents, or tokens to application logs.

#### Scenario: Successful read is logged
- **WHEN** a `read_data` call succeeds
- **THEN** logs contain at most the tool name, data type, time range, duration, outcome and a pseudonymous user id, but no returned values
