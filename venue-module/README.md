# Venue Module Overview

This folder documents the current state of the Hubzz event landing scaffold that lives in this repository. It explains what runs today, how to try it locally, and what remains to be wired to real Hubzz services.

## What the code does now
- **Static preview** – `npm run serve` starts `server.js` to serve the built static assets (including `index.html`) on port 8080. Unknown routes fall back to `index.html` so you can click around without a Next.js build.
- **Mock-backed event landing** – The Next.js route `/event/[eventId]` renders mock Hubzz event data (name, timing, stages, hosts) from the Hubzz API stub. It shows a countdown before the start time, lists stages, and links to per-stage pages.
- **Stage pages** – `/event/[eventId]/stage/[stageId]` displays placeholder embeds (spatial or external stream) and hides the “Open in Hubzz” button until the event is live. Deep links use the helper in `lib/deep-links.ts` with a mobile fallback to the web client. A drop-in audio/video strip mirrors the backstage UI with host badges and mute/speaking state.
- **Hubzz API stub + mock data** – `lib/hubzz-api.ts` validates responses with Zod and serves mock events, stages, group members, and stream queues from `lib/mock-data.ts`. Toggle mocks via the exported `useMock` flag.
- **Placeholder UI** – Components like `components/countdown-timer.tsx` and `components/stream-queue.tsx` render the countdown and stream queue preview, styled with shared placeholder rules in `css/global.css`.
- **Ticket wallet preview** – `/tickets` shows mock tickets with day/hour/minute countdowns until join opens, a distinct current-location ticket, stub states for past events (mirroring the mobile feed card CTA behavior), and links to stub detail pages at `/stubs/[stubId]`.
- **Notifications preview** – `/notifications` renders mock event + social notifications that mirror the mobile feed (event announcements, friend requests/accepts) with CTA links.
- **Group detail preview** – `/groups/[groupId]` mirrors the mobile group profile mock with tabs for upcoming events (RSVP CTA +
  time range), stub-gated merch with owned stub counts, and members who carry host/mod privileges during events.

### Design note: follower feed cards

When a user follows a group, upcoming events should surface in their feed as cards (matching the provided mobile mock) with event title, time range/date, host avatars, age badge, and CTA states such as **Buy ticket** or **Sold out**. To support that flow here, we’ll need an endpoint that returns upcoming events for followed groups with capacity/age gating flags, ticket price, host metadata, and deep links. The UI should render countdowns before sales, disable the CTA when sold out, and route taps to the event landing page while enforcing server-side checks for availability and age gating.

### Drop-in audio/video + notifications

- Keep the starter kit’s drop-in audio/video rooms (100ms-backed) as a greenroom/backstage option. Match the mobile mock with avatar tiles, mute badges, speaking ring, and quick controls (mic/camera toggle, leave, participants list) plus a location label like “Hubzz rooftop.” Leave layout room alongside the stream embed for the drop-in strip.
- Mirror the notifications feed mock: show event creation notices (e.g., “Hubzz HQ created a new event”) and social actions (friend requests/accepts) with CTAs **View details**, **Accept**, **Decline**, and **View profile** sourced from followed-group and social graph APIs when available.

## How this maps to the Strategic Integration Proposal

- **Covered here (scaffold layer):** Mock Hubzz event/stage pages, countdown + stream queue placeholders, deep-link helper, and the Hubzz API stub that stands in for real event, stage, and host data. This repo currently delivers the public-facing landing shell outlined in the proposal (pre-event page, stage links, and Hubzz entry buttons) but with mock data.
- **Not yet covered here (needs backend/platform work):** Implementing the new ERD entities (Events, EventAttendance, EventStubs), HBC ticketing and revenue splits, moderation/ownership rules, or in-world venue modules. Those belong in the Hubzz platform services and client/engine; this repo will consume them once the APIs are available.
- **Where to align details:** Architectural decisions and open questions from the strategic proposal (auth scope, treasury/chain, backstage APIs, stream queue SLAs) are tracked in `docs/hubzz-open-decisions.md` and the broader plan in `docs/hubzz-event-site-integration.md`.

## How to run it
1. **Static preview (no installs):**
   ```bash
   npm run serve
   ```
   Then open <http://localhost:8080> to browse the built assets.

2. **Next.js mock scaffold:**
   ```bash
npm install
npm run dev
```
Visit <http://localhost:3000/event/sample> to see the mock event and <http://localhost:3000/event/sample/stage/stage-a> for a stage page. If `npm install` fails with registry 403 errors in a restricted network, run `npm run fix-npm-proxy` first (set `PROXY_URL` if your proxy requires auth) and see `docs/installation-troubleshooting.md` for proxy guidance.

3. **Mock API routes:**
   The Next.js API routes ship with the same mock data used by the pages so you can exercise the JSON responses locally. They default to mock mode (controlled by `HUBZZ_USE_MOCK` / `NEXT_PUBLIC_HUBZZ_USE_MOCK`); append `?mock=false` once real Hubzz endpoints are available.
   - `GET /api/events/[eventId]`
   - `GET /api/events/[eventId]/stages`
   - `GET /api/events/[eventId]/stream-queue`
   - `GET /api/events/[eventId]/drop-in`
   - `GET /api/groups/[groupId]/members`
   - `GET /api/groups/[groupId]`
   - `GET /api/users/[userId]/tickets`
   - `GET /api/users/[userId]/notifications`
   - `GET /api/stubs/[stubId]`

## What still needs wiring
- Replace DatoCMS remnants with real Hubzz API calls.
- Add Hubzz authentication using Privy instead of GitHub OAuth.
- Connect ticket purchase and NFT minting flows.
- Swap mock embeds for live stream/spatial experiences and hydrate deep links with real event coordinates.

## Where to look next
- Integration plan: `docs/hubzz-event-site-integration.md`
- Open decisions: `docs/hubzz-open-decisions.md`
- Test status and blockers: `docs/test-status.md`
