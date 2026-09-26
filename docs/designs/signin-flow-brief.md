# Design brief: Sign-in flow (web)

Shaped with /impeccable shape on 2026-09-26. Status: CONFIRMED. No code yet.
Product context: `PRODUCT.md`. Server behavior: `openspec/changes/add-health-mcp-core/specs/mcp-auth/spec.md`.

## 1. Job and audience

- The owner and invited testers, arriving from an AI chat client (Claude first) when they add the Health AI connector, or roughly weekly when Google access expires during the testing period.
- Visitor mode: **Operate**. They want to grant access and get back to the chat quickly.

## 2. Outcome and proof

- Success: connected and back in Claude in about 30 seconds.
- Before signing in, the user sees exactly what is shared:

  | Item | Access |
  |---|---|
  | Sleep, heart rate, activity | Read |
  | Meals and water you log | Read and write |
  | Health values stored by us | None (delete your data at any time) |

- No health values are ever shown on these pages. No invented claims, users or numbers.

## 3. Direction

- **Plain Material Design 3, played straight** (owner's decision, recorded in `PRODUCT.md`). It should sit naturally next to Google's own account and Google Health surfaces.
- Roboto Flex; Material Symbols Rounded icons; tonal surfaces; filled buttons; list items with leading icons and trailing assist chips; a thin 3-step progress indicator (Claude, Sign in, Back to chat).
- Color: an M3 tonal palette (tonal spot) generated from one calm blue seed, `#3B6EA8`; primary `#39608f` light / `#a3c9fe` dark. The first green-teal seed (`#2f6b5e`) read as too green; the owner chose blue from four variants on 2026-09-26. Light and dark schemes follow the system setting.
- Mood: balance, confidence, health. Never clinical or illness-like.
- Reference sketch (approved): https://claude.ai/artifact/CX1FMLLZkqGdosVJGqYmJW (version 5).

## 4. Scope and boundaries

- In scope now: the sign-in flow screens listed in section 5.
- Later, same visual language: tester landing page, account/data page, experiment results page.
- Out of our control: Google's own sign-in and consent screens.
- Anti-goals: custom visual worlds, playful metaphors, marketing tone, dark patterns around consent.

## 5. States

| State | When | Primary action |
|---|---|---|
| Start | Client opened `/authorize` | Continue with Google |
| Redirecting | Between our page and Google, or on the callback | (progress only) |
| Connected (interstitial) | Callback succeeded; shown briefly before returning to the client | Back to Claude (auto-continue after a short delay) |
| Access expired | Reconnect link from a tool error | Reconnect |
| Not invited | Account not on the allow list | Use another account; Back to Claude |
| Permissions missing | User denied Health scopes | Try again, with the missing items listed |
| Partial permissions | Read granted, write denied | Continue with read only, or grant write |
| Error / timeout | Any other failure | Try again; the error explains what happened |

Copy: English, short, plain. Errors say what happened and what to do.

## 6. Interaction and layout

- Mobile-first single column (360–430 px); on desktop a centered column of about 400–480 px on the surface color.
- The top app bar shows the product name only; no navigation.
- The primary action is the full-width filled button, placed at the bottom of the content on mobile.
- The Connected interstitial shows for about 1.5 seconds, then continues to the client's redirect URI; the button lets the user go immediately. With reduced motion, no animated transitions.
- Visible focus states, 48 px touch targets, and WCAG 2.2 AA contrast (proposed default in `PRODUCT.md`).

## 7. Constraints and decisions

- **Hosting:** Firebase Hosting serves the static pages and rewrites the OAuth and MCP routes (`/authorize`, `/callback`, `/token`, `/register`, `/.well-known/*`, `/mcp`) to the Cloud Run service, so the pages and the authorization server share one origin.
- **Stack:** static HTML/CSS with minimal vanilla JS (`PRODUCT.md`). Whether to use the official Material Web components or hand-built M3 styles from tokens is a build-time decision; either way, match M3 specs.
- **Server-driven state:** the server decides which state to show (for example via a route or a query parameter). Pages must not trust client-side input for authorization decisions.
- **Open:** final product name and logo (a placeholder icon is used for now).
