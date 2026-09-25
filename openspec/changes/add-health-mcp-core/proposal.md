# Proposal

## Why

I want to talk to my own health data (Fitbit Air, via the Google Health API) from an AI chat: ask about sleep, heart rate and activity, and log what I eat into Google Health through a conversation, with or without a photo. No existing tool offers this as a standard remote MCP server, and the Fitbit Web API shuts down on 2026-09-30, so any integration has to be built on the new Google Health API (`health.googleapis.com/v4`) from the start.

## What Changes

- New remote MCP server (Streamable HTTP) deployed on Google Cloud Run, usable from any MCP client that supports remote servers with OAuth (Claude first).
- Standard MCP OAuth: the server is its own OAuth authorization server and delegates sign-in to Google. The same Google consent grants identity and Google Health API access, so one login connects everything.
- Per-user storage in Firestore; Google refresh tokens encrypted with Cloud KMS. Built for the owner plus a small group of testers (Google OAuth app in "Testing" mode, max 100 users).
- A thin tool layer that maps the Google Health API resource model one-to-one (list data types, read, aggregate, write, update, delete, profile, devices) instead of one tool per data type. No AI, heuristics or domain logic in the server; conversational features (meal logging flow, summaries, coaching) are left to the client and to a later packaging layer.
- Self-service data deletion for users (revoke Google access, erase stored data).

Out of scope (later changes): meal-logging skills/prompts, barcode lookup, hydration reminders and push notifications, public launch and Google OAuth verification.

## Capabilities

### New Capabilities
- `mcp-server`: Remote MCP transport, deployment on Cloud Run, per-user isolation, error conventions, and user data deletion.
- `mcp-auth`: MCP OAuth authorization server flow backed by Google sign-in, Google Health consent, encrypted token storage, refresh and re-authentication handling.
- `health-data-tools`: The thin, resource-oriented MCP tool set that maps the Google Health API (discovery, read, aggregate, write, update, delete, profile, devices).

### Modified Capabilities
<!-- None: this is the first change in the project. -->

## Impact

- New codebase (service, infra config) in this repo; no existing code affected.
- Google Cloud project: Cloud Run, Firestore, Cloud KMS, Secret Manager; Google OAuth client with Google Health API scopes in Testing mode.
- External dependency on the Google Health API v4 and its scope model; exact endpoints and writable data types must be verified against the official docs before implementation.
- Sensitive personal health data of testers is stored and processed; requires encryption at rest, minimal retention, and a deletion path.
