---
id: A-01m3eb1kqkzfqzy7jwdanwgedx
form: actor
title: "AI chat client"
provenance:
  level: stated
  decided_by: human
  sources: ["openspec/changes/add-health-mcp-core/conversation.md · SZ2", "openspec/changes/add-health-mcp-core/proposal.md · What Changes"]
  quote: "rendes távoli mcp"
  inferred: null
---
# AI chat client

## Role

An MCP client that supports remote servers with OAuth, Claude first.

## Goals

Call the Health AI tools on the user's behalf.

## Responsibilities

Discovers OAuth metadata, registers itself, runs the authorization code flow with PKCE, and calls tools with its access token.
