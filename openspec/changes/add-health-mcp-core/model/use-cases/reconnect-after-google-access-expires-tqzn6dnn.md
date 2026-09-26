---
id: UC-01m3eb1mg1k3kcp56xtqzn6dnn
form: use-case
title: "Reconnect after Google access expires"
capability: mcp-auth
actor: [A-01m3eb1kceqrt9s4dt82k0bs42]
goal: [G-01m3eb1jjs0c8ng53y9hk232sh]
interfaces: [IF-01m3eb1b7edb7e1dh0rft2dq63]
provenance:
  level: partly-inferred
  decided_by: agent-decided
  sources: ["openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md", "openspec/changes/add-health-mcp-core/design.md · Decisions"]
  quote: null
  inferred: "The use case sequence is assembled by the agent from the requirements and the design."
---
# Reconnect after Google access expires

## Intent

The user restores Google access when it has expired, without losing their data.

## Preconditions

The user was connected before; Google refresh fails with invalid_grant.

## Main success scenario

1. A tool call returns an error that Google access expired, with a reconnect link.
2. The user signs in again with the same Google account.
3. The stored Google token is replaced and the user returns to the client.

## Alternatives

- The user signs in with a different account: treated as a new connection.
