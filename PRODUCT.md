# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML/CSS with minimal vanilla JS, served from Firebase Hosting in the same Google Cloud project as the Cloud Run MCP server. Chosen because the web surfaces are few and small (sign-in, consent result, reconnect, errors, a tester-facing page) and must load fast from a chat client's redirect; no framework or build step is needed until a surface proves otherwise.

## Users

- The owner: wears a Fitbit Air and wants to talk to their own health data from an AI chat instead of opening dashboards.
- A small group of invited testers (at most 100, allow-listed Google accounts) who connect the same server to their own AI client with their own Google Health data.

Both arrive through an AI chat client (Claude first): they add a connector, get redirected to sign in, and later return only when access expires or something fails.

## Product Purpose

Health AI lets a person reach their own Google Health / Fitbit data from an AI chat:
- ask about sleep, heart rate, activity and other measurements;
- log what they ate through conversation or a photo, recorded properly in Google Health;
- run honest n=1 experiments on themselves (first: late dinner vs. deep sleep).

Success: the user gets real answers about their own body, with less effort than a dashboard, and experiment results they can trust.

## Positioning

A thin, standard remote MCP server over the Google Health API: one sign-in connects any MCP-capable AI client to your own data. Experiment results are computed in code with stated uncertainty, never guessed by the model; the product says "not enough data" or "no clear difference" rather than inventing a finding.

## Operating Context

- Used from an AI chat (Claude web, desktop, mobile); the web surfaces are short stops in a redirect flow, not a destination app.
- Google OAuth in Testing mode: testers must reconnect roughly weekly; the reconnect page is a recurring touchpoint.
- Hosting: Cloud Run (MCP server) and Firebase (web pages, Firestore).
- Hardware: Fitbit Air is screenless; reminders reach the phone, not the wrist.

## Capabilities and Constraints

- Reads and writes Google Health data through the user's own consent; stores only identity, encrypted tokens and experiment protocol state, never health values.
- Users can delete all their data (`delete_my_data`).
- Sign-in is limited to allow-listed Google accounts.
- Not medical advice; experiments include a skip path and a safety notice.
- Undecided: public launch, Google verification, custom domain, push-reminder channel.

## Brand Commitments

- Working name: health-ai (no final name, logo or visual identity yet).
- Interface language: English.
- Visual language (owner's decision): plain Material Design 3, played straight, sitting alongside Google's own account and Google Health surfaces. Custom visual worlds (wayfinding, lab report, hypnogram, seed packet, spirit level) were explored and declined.
- Mood (owner's words): balance, confidence, health. It must feel like being well, never like being a patient: no clinical, lab-report or illness associations.

## Evidence on Hand

- No testimonials, users, metrics or results exist yet. Do not fabricate any.
- Design and spec documents: `docs/designs/sleep-dinner-experiment.md`, `openspec/changes/add-health-mcp-core/`.

## Product Principles

1. Your data, your account: every action runs on the signed-in user's own Google consent; nothing is shared between users.
2. Honest over impressive: show real numbers and uncertainty; never overstate a result.
3. Stay out of the way: the chat is the product; web pages exist only to get the user back to it quickly.
4. Minimum data kept: store what operating the service needs, nothing more, and make deletion easy.

## Accessibility & Inclusion

Proposed default, not yet confirmed by the owner: WCAG 2.2 AA for all web surfaces, since they handle consent for health data.
