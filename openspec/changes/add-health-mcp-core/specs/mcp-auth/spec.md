# Spec Delta

## Purpose

Lets a user connect an MCP client to the server with one sign-in: the server acts as a standard MCP OAuth authorization server, delegates identity to Google, and obtains Google Health API access in the same consent.

## ADDED Requirements

### Requirement: MCP-compliant OAuth discovery
The system SHALL publish OAuth 2.0 Protected Resource Metadata and Authorization Server Metadata as required by the MCP authorization specification, so that MCP clients can discover how to authorize without manual configuration.

#### Scenario: Client discovers authorization server
- **WHEN** a client fetches the protected resource metadata URL
- **THEN** the response names the server's authorization server and supported scopes

#### Scenario: Client fetches authorization server metadata
- **WHEN** a client fetches `/.well-known/oauth-authorization-server`
- **THEN** the response lists the authorization, token and registration endpoints, supports the `authorization_code` and `refresh_token` grants, and requires PKCE with `S256`

### Requirement: Dynamic client registration
The system SHALL support OAuth 2.0 Dynamic Client Registration so that MCP clients can register themselves without the operator creating client credentials by hand.

#### Scenario: Client registers
- **WHEN** an MCP client posts valid client metadata with HTTPS or loopback redirect URIs to the registration endpoint
- **THEN** the server returns a client id and the client can start an authorization request

#### Scenario: Invalid redirect URI
- **WHEN** a registration request contains a redirect URI that is neither HTTPS nor a loopback address
- **THEN** registration is rejected

### Requirement: Single sign-in grants identity and Google Health access
The system SHALL, during the MCP authorization flow, redirect the user to Google sign-in requesting the user's identity and the Google Health API scopes needed by the tools, and SHALL issue MCP tokens only after the user has granted them.

#### Scenario: User grants all requested scopes
- **WHEN** the user signs in with an allow-listed Google account and grants the requested scopes
- **THEN** the server stores the Google refresh token for that user, redirects back to the MCP client with an authorization code, and the client can exchange it for an MCP access token

#### Scenario: User denies Google Health scopes
- **WHEN** the user signs in but does not grant the Google Health scopes
- **THEN** no MCP tokens are issued and the user sees which permissions are required

#### Scenario: Partial scope grant
- **WHEN** the user grants read scopes but not write scopes
- **THEN** MCP tokens are issued, read tools work, and write tools return an error stating that write permission was not granted and how to grant it

### Requirement: Google credentials are protected
The system MUST store Google refresh tokens encrypted at rest with a key managed outside the database, and MUST NOT return Google tokens to the MCP client.

#### Scenario: Stored token inspection
- **WHEN** an operator reads a user record directly from the database
- **THEN** the Google refresh token is only present in encrypted form

#### Scenario: Token response to client
- **WHEN** an MCP client exchanges an authorization code or refresh token
- **THEN** the response contains only tokens issued by the server itself

### Requirement: MCP token lifecycle
The system SHALL issue short-lived MCP access tokens and rotating refresh tokens, and SHALL invalidate a refresh token once it has been used.

#### Scenario: Access token refresh
- **WHEN** a client presents a valid MCP refresh token
- **THEN** it receives a new access token and a new refresh token, and the old refresh token no longer works

#### Scenario: Refresh token reuse
- **WHEN** an already used MCP refresh token is presented again
- **THEN** the request is rejected and all tokens of that grant are revoked

### Requirement: Re-authentication when Google access is lost
The system SHALL detect when the stored Google credentials can no longer be refreshed (expired, revoked, or expired because the OAuth app is in Testing mode) and SHALL tell the user how to reconnect instead of failing silently.

#### Scenario: Google refresh token expired
- **WHEN** a tool is called and refreshing the user's Google access token fails with an invalid-grant error
- **THEN** the tool result is marked as an error explaining that Google access expired and containing a link that restarts Google sign-in for that user

#### Scenario: Reconnect keeps the user
- **WHEN** the user completes the reconnect flow with the same Google account
- **THEN** the stored Google refresh token is replaced and the user's existing server-side records are kept
