# Thingscorp

Hubzz venue module scaffold built with Next.js and mock data.

## What the code does today
- **Next.js mock landing site** – `/event/[eventId]` renders mock Hubzz event data with a countdown, stage list, and host
  roster pulled from the Hubzz API stub. Each stage links to `/event/[eventId]/stage/[stageId]`.
- **Stage experience preview** – Stage pages show an embed placeholder for spatial or external streams, gate the "Open in
  Hubzz" button until the event start time, and use the deep-link helper to open the Hubzz client with a mobile fallback.
- **Drop-in strip preview** – Stage pages now include a drop-in audio/video strip to mirror the backstage UI shown in the mocks
  (host badges, mute/speaking state, location label like “Hubzz rooftop”).
- **API + mock data layer** – `lib/hubzz-api.ts` validates responses with Zod, serves mock events/stages/group members/stream
  queues from `lib/mock-data.ts`, and exposes helpers like `getEvent`, `getEventStages`, `getGroupMembers`, `getStreamQueue`,
  and `getDropInSession` with a `useMock` flag.
- **Deep link utilities** – `lib/deep-links.ts` builds Hubzz client URLs (including optional tokens) and provides an
  `openHubzzLink` helper that handles mobile deep-link fallback to the web client.
- **Placeholder UI components** – `components/countdown-timer.tsx` and `components/stream-queue.tsx` provide countdown and
  stream queue previews, styled with the shared placeholder styles in `css/global.css`.
- **Ticket wallet preview** – `/tickets` renders mock tickets with day/hour/minute countdowns (matching the mobile feed card
  design), CTA gating until join opens, stub states for past events, and links to stub detail pages.
- **Group profile preview** – `/groups/[groupId]` mirrors the mobile group detail mock with an events tab (upcoming schedule +
  RSVP CTA), a merch tab showing stub-gated items and owned stub counts, and a members tab indicating who has host/mod
  privileges during events.
- **Notifications preview** – `/notifications` shows mock event announcements and social updates with CTA links to mirror the
  mobile notifications feed.

### Design note: follower feed cards

The mobile mock for following a group shows upcoming events as rich cards (title, time range/date, host avatars, age badge) with CTA states like **Buy ticket** or **Sold out**. To match that UI when wiring real data:
- Fetch upcoming events for followed groups, including capacity/sellout flags, ticket price, age gating, host group avatars, and Hubzz deep links.
- Render distinct CTA states (active, coming soon with countdown, or disabled when sold out) and enforce server-side checks for age gating and capacity.
- Route card taps to the event landing page; CTA triggers the ticketing/deep-link flow.

**Ticket wallet + RSVP cards**

 - Mirror the mobile ticket view: show upcoming tickets with day/hour/minute countdowns until join is allowed, mark the current location ticket separately, and list past tickets as stubs.
 - Gate the CTA until `canJoinAt` or event start, surface stub IDs when available for past events, and provide a stub detail view that shows the replay CTA, host roster, and guest list summary.

### Drop-in audio/video + notifications (UI parity)

- Preserve the starter kit’s drop-in A/V experience (100ms-backed) for greenroom/backstage use: a grid of avatars with mute state, speaking ring, and standard controls (toggle mic/camera, leave, participants list). Keep the “Hubzz rooftop” context label for spatial awareness and leave UI room for the drop-in tile strip when a stream embed is present.
- Event notifications should mirror the mobile mock: a feed surface that shows "Hubzz HQ created a new event" plus friend requests or accepts, with CTAs like **View details**, **Accept**, **Decline**, and **View profile**. Wire this to followed-group and social graph data once those APIs are available.

## Development

### Next.js scaffolding (Hubzz landing work)

To run the mock-backed Next.js scaffold locally:

```bash
npm run fix-npm-proxy   # optional: normalize proxy settings before install
npm install
npm run dev
```

If `npm install` fails with registry 403 errors in a restricted network, run `npm run fix-npm-proxy` (or set `PROXY_URL` for
authenticated proxies) and see `docs/installation-troubleshooting.md` for detailed proxy/registry access guidance.

### Mock API routes and toggling mocks

For local and mock-driven development, the following Next.js API routes return the same stubbed data used by the event pages.
They default to mock mode (controlled by `HUBZZ_USE_MOCK`/`NEXT_PUBLIC_HUBZZ_USE_MOCK`), and you can also pass
`?mock=false` to proxy to a real Hubzz API once available.

- `GET /api/events/[eventId]`
- `GET /api/events/[eventId]/stages`
- `GET /api/events/[eventId]/stream-queue`
- `GET /api/events/[eventId]/drop-in`
- `GET /api/groups/[groupId]/members`
- `GET /api/groups/[groupId]`
- `GET /api/users/[userId]/tickets`
- `GET /api/users/[userId]/notifications`
- `GET /api/stubs/[stubId]`

### Authentication (Privy)

Hubzz login for the landing site will use [Privy](https://docs.privy.io/welcome). When wiring the auth bridge, set the following variables in your local `.env` (also mirrored in `.env.example`):

- `PRIVY_APP_ID` and `PRIVY_APP_SECRET` — server-side credentials for Privy.
- `NEXT_PUBLIC_PRIVY_APP_ID` — surfaced client-side for initializing the Privy client SDK.

The Privy App ID provided for this project is `cIp0x8o7t0Jh5jt0fmxIqcrpa`; copy it into both `PRIVY_APP_ID` and `NEXT_PUBLIC_PRIVY_APP_ID` and add the matching Privy app secret to `PRIVY_APP_SECRET` locally.

Auth work should target the Privy provider instead of GitHub OAuth, mapping the Privy session payload to the Hubzz session shape (id, username, avatar, wallet address, group role).

## Hubzz event landing integration planning

Integration planning for the Hubzz event landing site lives in `docs/hubzz-event-site-integration.md`. A starter `.env.example` at the repo root captures the Hubzz- and auth-related variables referenced in the plan. Fill these values in a local `.env` file when wiring the Next.js implementation described in the document. Open decisions that block sequencing are tracked in `docs/hubzz-open-decisions.md`.
