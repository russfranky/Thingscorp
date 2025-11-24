# Hubzz Event Landing Site Conversion Plan

This document outlines how to adapt the Vercel Virtual Event Starter Kit into a Hubzz-compatible event landing experience. The goal is to keep the starter kit's marketing strengths while wiring it into Hubzz authentication (via Privy), ticketing, and spatial venues.

## Objectives
- Replace DatoCMS content fetching with Hubzz event data APIs.
- Swap GitHub OAuth for Privy-powered Hubzz authentication (wallet-first) while retaining optional GitHub login only if needed later.
- Support multi-stage events mapped to Hubzz zones/venues, with deep links into the Hubzz client.
- Keep the optional 100ms drop-in rooms while adding external stream embeds (Kick/Twitch/YouTube) and queueing.
- Enable HBC-powered ticketing that mints Event Stub NFTs and unlocks venue access.

## Event Discovery & Feed Expectations

Followers should see upcoming events from the groups they follow directly in their feed, matching the provided mobile mock (card with title, time range, date, host avatars, age/availability badge, and CTA state such as **Buy ticket** or **Sold out**). To support this experience:
- **Data shape**: Add an API that returns upcoming events for followed groups with fields for event metadata (name, start/end), ticket price, availability (remaining capacity/sold-out flag), host group info (name plus avatar stack), age gating, CTA state, and Hubzz deep link targets.
- **CTA logic**: Render distinct CTA states—buy/active, sold out (disabled), or coming soon (pre-sale). Swap to countdown mode before sales open and suppress purchase once sold out.
- **Navigation**: Tapping the card routes to the event landing page; the CTA opens the Hubzz ticketing/deep-link flow. Age-gated or sold-out events must enforce server validation, not just UI hints.
- **Freshness**: Cache feed responses briefly (e.g., 30–60s) while honoring near-real-time sellout updates to avoid oversubscription.

Ticket/RVSP cards in the feed should mirror the mobile ticket view with day/hour/minute countdowns until join is allowed and stub visibility after the event ends. Mark the current location ticket distinctly and gate the CTA until `canJoinAt` or `startTime`. Past events should deep-link to a stub detail view that shows replay CTA, host roster, and a guest list summary (as in the mobile stub mock).

### Drop-in audio/video and notifications (UI alignment)

- **Drop-in A/V (100ms)**: Preserve the starter kit’s drop-in audio/video rooms for greenroom/backstage. The UI should match the mobile mock: avatar grid with mute badges, active speaker ring, quick controls (mic/camera toggle, leave, participants list), and a location label like “Hubzz rooftop.” Leave layout room beside/below the external stream embed for the drop-in tile strip.
- **Notifications feed**: Add an activity list that shows event-creation notices (e.g., “Hubzz HQ created a new event”) plus social actions (friend requests/accepts) with CTAs **View details**, **Accept**, **Decline**, **View profile**. Source data from followed groups and the social graph APIs when available.

## Current Progress Snapshot
- **Plan completeness**: Architecture, API contract, implementation blueprint, and testing strategy are all drafted and ready for execution.
- **Repository state**: Scaffolding for Hubzz routes (`/event/[eventId]`, `/event/[eventId]/stage/[stageId]`), mock data, and the Hubzz API client stub are checked in; DatoCMS removal, auth wiring, and live data hooks are still pending.
- **Dependencies & envs**: Hubzz-specific environment variables are now captured in `.env.example`; dependency install is currently blocked by npm registry 403 errors in this environment (see `docs/test-status.md`).
- **Open decisions**: Awaiting HBC treasury details, backstage API support, and stream queue SLA—these are required before implementation starts. Auth is confirmed to use Privy.
- **Next actionable steps**: Remove remaining DatoCMS bindings, scaffold Hubzz auth provider, connect the Hubzz API client to real endpoints, and wire dynamic `/event/[eventId]/stage/[stageId]` routes to validated data with ISR.

## Execution Tracker (actionable backlog)
| Area | Task | Status | Owner | Definition of Done |
| --- | --- | --- | --- | --- |
| Auth | Implement Privy authentication in `pages/api/auth/[...nextauth].ts` (or Privy SDK middleware), add refresh/session handling, and expose `groupRole`/`walletAddress` in session. | **Planned** (Privy confirmed) | TBD | Login works against Privy sandbox; session contains id, username, avatar, wallet, groupRole; refresh executes automatically. |
| Data client | Create `lib/hubzz-api.ts` with `fetchJson`, Zod schemas, and methods for events, stages, groups, tickets, and stream queue. | **In progress** | TBD | All methods return validated types; 4xx/5xx errors mapped to typed errors; shared hubzz API key applied server-side only. |
| Routing | Add `/event/[eventId]`, `/event/[eventId]/stage/[stageId]`, `/event/[eventId]/backstage` with ISR (30s) and server-side data wiring. | **In progress** | TBD | Routes build locally and via ISR; landing shows schedule/speakers/ticket CTA; stage page renders embed + deep link; backstage rejects non-hosts. |
| Stage experience | Build `stage-embed.tsx` + `stream-queue.ts` to render Kick/Twitch/YouTube embeds, rotation controls, and spatial fallback; preserve 100ms flag. | **Todo** | TBD | Embeds render per platform; queue “next” works; fallback component shown when no active stream or embed failure. |
| Hosts/backstage | Map group roles to speaker/host/backstage UX; gate backstage actions with `groupRole`. | **Blocked** (needs backstage API detail) | TBD | Owner/admin see backstage link and controls; member/guest do not; role check enforced server-side and client-side. |
| Ticketing/NFTs | Implement `purchaseTicketWithHBC` flow + `ticket-purchase.tsx`; persist purchase state in Redis. | **Blocked** (treasury/chain decision) | TBD | Happy-path purchase returns NFT id; insufficient balance error handled; Redis keyed by user+event caches access flag. |
| Deep links | Add `deep-links.ts` and mobile/desktop handling; countdown gating before `startTime`, replay after `endTime/recordingUrl`. | **Todo** | TBD | Deep link opens Hubzz app/web correctly; countdown disables CTA pre-start; replay view shown post-event. |
| Branding | Update Tailwind theme, constants, hero/footer copy, and assets to Hubzz design. | **Todo** | TBD | Brand colors + fonts applied; hero/footer reflect Hubzz messaging; Lighthouse contrast passes. |
| Testing | Add unit/contract tests, API smoke tests, and E2E flows for auth, ticketing, countdown, deep links, and stream queue. | **Todo** | TBD | CI green; smoke tests cover key routes; E2E suite exercises login → ticketing → stage join. |

## Immediate next steps (unblocked work)
- Draft `.env.example` and README updates with Hubzz env vars so local setup matches the integration plan. **(Done: `.env.example` + README pointer added.)**
- Scaffold `lib/hubzz-api.ts` with Zod schema placeholders and a shared `fetchJson` helper (can proceed without final endpoints by stubbing URLs).
- Remove DatoCMS-specific imports/references in the codebase to prepare for the new Hubzz client and routes.
- Add stub pages for `/event/[eventId]` and `/event/[eventId]/stage/[stageId]` that currently render static placeholders, enabling routing work ahead of API completion.

### What to do next (actionable checklist)
1) **Scaffold the Hubzz API client**
   - Create `lib/hubzz-api.ts` with a `fetchJson` helper that injects `HUBZZ_API_KEY` on server-side calls. **(Done: fetchJson + Zod validation added with mock data fallback.)**
   - Add Zod schemas for `HubzzEvent`, `HubzzStage`, `StreamQueue`, `GroupMember`, and ticket purchase responses; export typed fetchers that currently hit stub URLs. **(Done for events, stages, groups, and stream queue.)**
   - Wire minimal unit tests for the validation layer so the client fails fast on malformed payloads. **(Todo.)**
2) **Remove DatoCMS bindings**
   - Delete/replace `lib/cms-api` imports, DatoCMS env vars, and any DatoCMS queries from pages/components.
   - Introduce placeholder data providers (using the new Hubzz client stubs) so pages continue to build while Hubzz endpoints are finalized.
3) **Add routing placeholders**
   - Add `/pages/event/[eventId]/index.tsx` and `/pages/event/[eventId]/stage/[stageId].tsx` that render static placeholders for: event name, schedule stub, ticket CTA stub, stage embed stub, and a disabled “Enter Hubzz” button with countdown messaging. **(Done: placeholder routes added with mock data.)**
   - Enable ISR (`revalidate: 30`) on these pages with static mock data pulled from `lib/hubzz-api` stubs to exercise the data flow before live endpoints are provided. **(Done for landing + stage routes.)**
4) **Track decisions in the repo**
   - Create `docs/hubzz-open-decisions.md` summarizing the four blockers (auth scope, HBC treasury/chain, backstage API, stream queue SLA) with owners and due dates so contributors know what’s pending.
5) **Update the execution tracker**
   - Set `Data client` and `Routing` to “In progress” once the above scaffolding starts, leaving blocked items unchanged.
   - Add links to the new stub pages and client file so future PRs can reference concrete artifacts.

## What’s left to complete (execution scope)
The plan is ready; the remaining work is implementation. The list below calls out the concrete tasks that are still undone in the codebase and the decision checkpoints that affect execution.

### Implementation work still outstanding
- **Repository hygiene**: Remove DatoCMS dependencies (packages, env vars, CMS fetches), and add Hubzz env vars to `.env.example`/`README`.
- **Auth bridge (Privy)**: Implement the Privy provider in `pages/api/auth/[...nextauth].ts` (or Privy Next.js middleware), including session shape (`id`, `username`, `avatarUrl`, `walletAddress`, `groupRole`).
- **Data client**: Create `lib/hubzz-api.ts` with Zod validation, shared `fetchJson` helper, and methods for events, stages, groups, tickets, and stream queues.
- **Routing and pages**: Add dynamic routes (`/event/[eventId]`, `/event/[eventId]/stage/[stageId]`, `/event/[eventId]/backstage`) with ISR and server-side data wiring.
- **Stage experience**: Implement `components/stage-embed.tsx` plus `lib/stream-queue.ts` to handle Kick/Twitch/YouTube embeds, rotation, and Hubzz spatial fallback; preserve 100ms drop-ins behind a flag.
- **Hosts and backstage**: Map group roles to speaker/host/backstage UX and gate backstage actions with role checks.
- **Ticketing + NFT flow**: Build `lib/ticketing.ts` + `components/ticket-purchase.tsx` to charge HBC, mint the Event Stub NFT, and store access state (Redis-backed).
- **Countdown & deep links**: Add countdown gating, mobile/desktop deep-link handling, and replay mode after `endTime`/`recordingUrl`.
- **Branding**: Update Tailwind theme, constants, hero/footer content, and assets to match Hubzz branding.
- **Testing & hardening**: Add contract/unit tests (Hubzz client, token refresh, deep links), API smoke tests, and E2E flows for login, ticketing, countdown, deep-link, and stream queue.

### Decision dependencies (need answers to proceed)
- Privy provider is the canonical auth path (GitHub fallback not required unless requested later).
- HBC treasury address and chain (staging vs. production).
- Whether backstage moderator actions are API-backed now or should ship as placeholders.
- Target freshness/SLA for stream queue updates and who operates them.

### Can we complete it?
Yes. The roadmap is fully specified above. Once the decision dependencies are confirmed, we can implement each step in order (auth → data client → routes → embeds → ticketing/NFTs → deep links → branding → tests) and deliver the completed Hubzz landing site within the outlined 6–8 week timeline.

## Environment Variables
Configure the Next.js app with Hubzz settings:

```
HUBZZ_API_URL=https://api.hubzz.com
HUBZZ_API_KEY=<secret>
HUBZZ_CLIENT_URL=https://app.hubzz.com
NEXT_PUBLIC_HBC_CONTRACT_ADDRESS=<blockchain>
NEXTAUTH_URL=https://events.hubzz.com
NEXTAUTH_SECRET=<secret>
PRIVY_APP_ID=<privy-app-id>
PRIVY_APP_SECRET=<privy-app-secret>
NEXT_PUBLIC_PRIVY_APP_ID=<privy-app-id>
REDIS_URL=<redis-url>
REDIS_PASSWORD=<redis-password>
```

Use the provided Privy App ID `cIp0x8o7t0Jh5jt0fmxIqcrpa` for both `PRIVY_APP_ID` and `NEXT_PUBLIC_PRIVY_APP_ID`, and supply the corresponding secret from the Privy dashboard in `PRIVY_APP_SECRET` when configuring local or deployment environments.

## Core Replacements
- **Authentication (Privy)**: Use Privy as the primary auth provider for the landing site, wiring `pages/api/auth/[...nextauth].ts` (or Privy middleware) to Privy credentials and mapping the Privy session payload to the Hubzz session shape (id, username, avatar, wallet address, group roles). Keep GitHub only if a future fallback is explicitly required.
- **Data Layer**: Remove DatoCMS calls and add a `lib/hubzz-api.ts` client that fetches events, stages, group members, and ticketing info from Hubzz. Use ISR to refresh event data every ~30s.
- **Routing**: Convert static `/stage/a` pages into dynamic routes:
  - `/event/[eventId]` — landing page with schedule, speakers, countdown, ticket CTA.
  - `/event/[eventId]/stage/[stageId]` — stage detail page.
  - `/event/[eventId]/backstage` — host/moderator tools for group owners/admins.
- **Deep Links**: Generate Hubzz client URLs (`hubzz://` mobile deep link with web fallback) that target zone/venue coordinates and include an auth token when available.

## Feature Implementations
- **Countdown & State**: Show a countdown until `startTime`; activate "Enter Hubzz" and stage joins once live; offer replay embeds post-event.
- **External Streams**: Embed Kick, Twitch, YouTube with a queueing helper (`stream-queue.ts`) to rotate through prioritized streams; fallback to Hubzz spatial audio if no external stream is available.
- **Hosts & Group Roles**: Map speakers to Hubzz group members. Owners/admins receive backstage deep links and moderator controls; other members show as speakers/guests.
- **Ticketing & NFTs**: Implement `purchaseTicketWithHBC` to verify HBC balance, transfer to treasury, mint an Event Stub NFT, and grant access. Surface status in a `TicketPurchase` component with toast feedback.
- **Branding**: Update Tailwind theme (`hubzz-primary`, `hubzz-secondary`, `hubzz-accent`) and constants with Hubzz logos and social links; refresh hero/footer copy to match Hubzz messaging.

## Implementation Blueprint (step-by-step)
Follow these sequential steps to convert the starter kit into the Hubzz landing experience. The order minimizes rework and keeps auth + data foundations stable before UX work.

1. **Baseline repo cleanup**
   - Remove DatoCMS dependencies and associated environment variables.
   - Update TypeScript paths to `lib/*`, `components/*`, and `pages/event/*` patterns.
   - Add Hubzz env vars to `.env.example` and `README` setup instructions.

2. **Auth bridge (Privy)**
   - Implement `pages/api/auth/[...nextauth].ts` (or Privy Next.js middleware) using Privy credentials and map the Privy user/session payload to Hubzz session fields (id, username, avatar, wallet, group roles).
   - Handle Privy session refresh/reauth flows per the Privy SDK; keep sensitive tokens server-side and expose only the session shape needed by the UI.
   - Expose a `useSession` wrapper that includes `groupRole` and `walletAddress` to simplify backstage and ticketing guards.

3. **Hubzz API client**
   - Create `lib/hubzz-api.ts` with typed methods: `getEvent`, `getEventStages`, `getGroupMembers`, `getTicketPrice`, `purchaseTicket`, `mintEventStubNFT`, `getStreamQueue`.
   - Centralize `fetchJson` with automatic `HUBZZ_API_KEY` header injection and 401 handling that triggers token refresh.
   - Add Zod schemas for runtime validation to avoid breaking ISR pages on malformed data.

4. **Dynamic routing + data fetching**
   - Add `/pages/event/[eventId]/index.tsx` for the landing page and `/pages/event/[eventId]/stage/[stageId].tsx` for per-stage views; both should use ISR (revalidate 30s) and server-side Hubzz API calls.
   - Generate stage deep links with `lib/deep-links.ts`, embedding zone/venue coordinates and an optional auth token.
   - Wire schedule, speakers, sponsors, and CTA sections to Hubzz event data instead of DatoCMS.

5. **Stage experience + external streams**
   - Implement `components/stage-embed.tsx` to choose between external streams (Kick/Twitch/YouTube) and Hubzz spatial fallback.
   - Add `lib/stream-queue.ts` and a `StreamQueue` React hook to rotate streams in priority order and expose a "Next Stream" control.
   - Preserve 100ms drop-in support for greenroom/backstage usage by feature-flagging it per stage.

6. **Hosts, groups, and backstage**
   - Map Hubzz group owners/admins to hosts/moderators; everyone else becomes speakers/guests.
   - Create `/pages/event/[eventId]/backstage.tsx` gated by `groupRole` and expose moderator actions (mute/kick triggers that call Hubzz APIs if available, or placeholders if not yet implemented).
   - Display backstage deep links only for owner/admin roles on the landing page and stage cards.

7. **Ticketing + Event Stub NFTs**
   - Build `lib/ticketing.ts` with `purchaseTicketWithHBC` that checks HBC balance, transfers to treasury, mints the NFT, and records access.
   - Add `components/ticket-purchase.tsx` with optimistic UI, error toasts, and a minted-NFT confirmation state.
   - Persist ticket purchase state in Redis (mirroring the starter kit) to prevent duplicate purchases and to hydrate UI on reload.

8. **Countdown, state gates, and deep-link behavior**
   - Create a `CountdownTimer` component that gates the "Enter Hubzz" button until the event start time.
   - Add mobile/desktop handling: attempt `hubzz://` on mobile, then fall back to the web client after a timeout; desktop opens the web client in a new tab.
   - Post-event, switch the hero area to replay mode when `recordingUrl` is present.

9. **Branding + design system**
   - Update `tailwind.config.js` with Hubzz color tokens and import brand fonts if required.
   - Refresh hero, CTA buttons, and footer to use Hubzz logos and copy; ensure dark-mode defaults align with Hubzz client styling.

10. **Verification + launch**
    - Add Cypress (or Playwright) smoke tests for auth login, ticket purchase flow (mocked blockchain), countdown gating, deep-link rendering, and stream queue controls.
    - Ship `vercel.json` and `README` deployment steps; confirm all required env vars are set in Vercel project settings.

## Architecture Notes (to guide implementation)
- **Server boundaries**: Keep all Hubzz API calls server-side in `getStaticProps`/API routes to avoid leaking secrets. Client-side fetches should hit your own Next.js API routes that proxy and validate.
- **Token handling (Privy)**: Follow Privy's Next.js guidance—use the Privy server SDK to verify sessions server-side, keep Privy cookies HttpOnly + `SameSite=Lax`, and avoid exposing Privy tokens to the client beyond the session shape the UI needs. Ensure ISR revalidation uses application credentials, not user tokens.
- **Role enforcement**: Centralize `requireHostRole` helper for backstage routes and buttons to avoid scattered role checks.
- **Embed safety**: Sanitize external stream URLs, and set appropriate `allow`/`sandbox` attributes on iframes.
- **Progressive enhancement**: The site must still render static content (schedule, speakers, sponsors) even if Hubzz APIs are temporarily unavailable; show degradations with clear messaging.

## API contract mapping (Hubzz ⇄ Next.js)
- **Auth (Privy)**
  - Client uses Privy SDK for login; server verifies the Privy session via Privy server SDK in Next.js API routes or `getServerSideProps`.
  - Optional helper route can exchange the Privy session for a Hubzz-session token if required by downstream Hubzz APIs.
  - Session shape exposed to Next.js: `{ id, username, avatarUrl, walletAddress, groupRole, privyUserId }`.
- **Events & stages**
  - `GET /api/event/:eventId` → `{ id, name, description, startTime, endTime, zoneId, venueCoordinates, ticketPrice, recordingUrl }`.
  - `GET /api/event/:eventId/stages` → `[ { id, name, venueModuleId, streamType, externalStreamUrl, deepLink } ]`.
  - `GET /api/event/:eventId/stream-queue` → `{ activeStreamIndex, streams: [ { platform, channelId, embedUrl, priority } ] }`.
- **Groups & roles**
  - `GET /api/groups/:groupId/members` → `[ { id, username, avatarUrl, role } ]` where `role ∈ { owner, admin, member }`.
- **Ticketing**
  - `POST /api/event/:eventId/ticket` with `{ walletAddress }` → `{ success, nftId, txHash }`.
  - `GET /api/event/:eventId/ticket` → `{ hasTicket: boolean, nftId?: string }` used to hydrate UI state.

## Data validation & caching
- Use Zod schemas in `lib/hubzz-api.ts` to validate all responses before hydration; return typed fallbacks plus user-visible warnings when parsing fails.
- Cache immutable event metadata (name, description, schedule) with ISR; cache ticket status per session in Redis keyed by user id + event id.
- For stream queues, prefer short TTL (15–30s) in-memory cache to reduce UI flicker while keeping updates responsive.

## Error handling and degraded modes
- **Auth failures**: Display a retry CTA; clear cookies on repeated 401s; never block static content because of auth errors. Surface Privy-specific troubleshooting (wallet connect, email magic link) where applicable.
- **Ticket purchase errors**: Show specific messages for insufficient HBC balance, transaction failures, or minting failures; expose `txHash` when available for support.
- **Stream embed failures**: Detect iframe load errors and surface the spatial-audio fallback with a dismissible alert; log the failing stream id for telemetry.
- **Deep-link failures**: Provide a manual copy button for the Hubzz client URL when automatic deep linking fails or is blocked by the platform.

## Security and privacy checklist
- Ensure JWT signing secret (`NEXTAUTH_SECRET`) is rotated and stored in the deploy environment only.
- Apply CSP headers to disallow untrusted iframes; explicitly allow Kick/Twitch/YouTube origins used by external streams.
- Mark event/stage API routes rate-limited (IP-based) to prevent scraping of stage URLs.
- Scrub PII (email, wallet address) from client logs; limit analytics payloads to anonymized IDs.

## Performance optimizations
- Enable Next.js image optimization for speaker avatars and sponsor logos; cache CDN responses.
- Use `priority` on hero images above-the-fold and lazy-load stage embeds below-the-fold.
- Prefetch stage pages (`next/link prefetch`) when the event landing page renders to reduce navigation latency at go-live.
- For countdown timers, throttle re-renders to 1s intervals and avoid heavy computations in `setInterval`.

## Open questions to resolve with stakeholders
- Confirm Privy app IDs/secrets for staging vs. production and whether any legacy GitHub fallback is still desired for web-only flows.
- What is the exact HBC treasury address and chain (mainnet/testnet) for ticket transfers during staging vs. production?
- Are backstage moderator actions currently API-backed (mute/kick), or should the UI ship as placeholders until server support is ready?
- What SLA is expected for stream queue freshness (e.g., 10s vs. 30s), and who operates the queue updates (Hubzz ops vs. automated signals)?

## Testing Checklist
- Authentication via Hubzz succeeds and session exposes wallet + roles.
- Countdown displays pre-event, and "Enter Hubzz" deep link activates at start time.
- Multi-stage routing renders all stages with correct deep links and external stream embeds.
- Host/moderator backstage links only work for group owners/admins.
- External stream queue rotates correctly; spatial audio fallback works when no stream is active.
- HBC ticket purchase mints Event Stub NFT and grants venue access.
- Mobile devices attempt `hubzz://` first, then fall back to the web client.

## Test Execution Guidance
To operationalize the checklist, use a mix of automated and manual passes:

- **Unit + contract tests (Jest)**: Mock Hubzz API responses and verify `lib/hubzz-api.ts` schema validation, token refresh behavior, and deep-link generation logic.
- **End-to-end flows (Playwright/Cypress)**: Cover login, countdown gating, stage switching, stream queue rotation, ticket purchase happy path + insufficient-funds errors, and mobile deep-link fallback (via device emulation).
- **API route smoke tests (Supertest)**: Exercise `/api/auth/login`, `/api/auth/refresh`, `/api/event/[id]`, `/api/event/[id]/ticket` with mocked Hubzz services to ensure correct status codes and payload shapes.
- **Accessibility audits (axe/lighthouse)**: Run against `/event/[eventId]` and stage pages to keep landing content usable during pre-event countdown and live states.
- **Resilience drills**: Simulate API errors and expired tokens to confirm degraded modes show fallback content and actionable messaging without breaking page rendering.

## Delivery Timeline (6–8 weeks)
- **Week 1**: Repo setup, dependency audit, env vars, auth bridge scaffolding.
- **Weeks 2–3**: Hubzz API client, DatoCMS removal, dynamic event/stage routes.
- **Weeks 3–4**: Group integration, backstage controls, external stream queue.
- **Weeks 4–5**: Countdown/state handling, multi-stage UX, embed fallbacks.
- **Weeks 5–6**: HBC ticketing + Event Stub NFT flow, deep-link generation.
- **Weeks 7–8**: Branding pass, polish, verification, deployment to Vercel.

## Group profile mock coverage (what exists in the scaffold)

- **Page**: `/groups/[groupId]` renders the group detail view from mock data (or live API later) with the tabs shown in the mob
ile reference: Events, Merch, and Members.
- **Events tab**: Lists upcoming events for the group with date/time range, host, RSVP count, and a CTA (RSVP/Free in mock). Wh
en wired to production, replace `ctaHref` with the event landing route and surface ticket/age gating as needed.
- **Merch tab**: Shows stub-gated items with HBC pricing, stub cost, owned stubs, and unlock notes (mirroring the “Stubs Owned"
 and "Unlocks when you acquire…" copy). Tie this to the merch/storefront API once available.
- **Members tab**: Displays group members (hosts/mods) to reflect who has event permissions. Swap in the live group roster endpo
int to enforce host/mod UI paths.
- **API**: `GET /api/groups/[groupId]` is stub-backed today and will proxy to the real group profile endpoint later; the Hubzz A
PI client (`getGroupProfile`) validates the payload with Zod.

## Troubleshooting guide (what to check and how to fix)
Use this section to quickly diagnose issues when implementing or operating the Hubzz landing site. Each item lists symptoms, likely causes, and fixes.

### Auth and sessions
- **Login fails or loops** → Verify `HUBZZ_API_URL`, `HUBZZ_API_KEY`, `NEXTAUTH_SECRET`, and callback URLs. Check the Hubzz OAuth app settings and ensure `NEXTAUTH_URL` matches the deployed domain. Confirm refresh-token exchange works by hitting `/api/auth/refresh` with a valid refresh token.
- **Missing wallet/role in session** → Confirm the custom Hubzz provider maps `walletAddress` and `groupRole` in the profile callback. Add a unit test for the NextAuth `jwt` and `session` callbacks to ensure these fields persist.
- **401s during ISR revalidation** → Ensure server-side fetches use app credentials (API key) rather than per-user tokens. Rotate the API key and invalidate stale cache entries if needed.

### Hubzz API data
- **Event/stage pages render empty** → Check `lib/hubzz-api.ts` Zod schemas for mismatches against live responses. Log validation errors in development and add fixtures to contract tests to catch shape drift early.
- **Stream queue not updating** → Confirm the polling interval (15–30s) and that `getStreamQueue` is pointing at the correct event id. If the queue API is down, surface the spatial audio fallback and log the failing request id.
- **Group roles incorrect** → Verify the group members endpoint returns `role ∈ { owner, admin, member }`. Add a mapping test to ensure owners/admins become hosts/moderators before rendering backstage controls.

### Ticketing and NFTs
- **Ticket purchase fails** → Inspect HBC balance check and treasury address values. Validate blockchain RPC availability and ensure the contract address matches the current network. When minting fails after payment, record `txHash`, show a support message, and retry minting idempotently with a stored purchase record.
- **Duplicate purchases** → Confirm Redis keys are composed of `{userId}:{eventId}` and that the purchase path performs an atomic check/set. Add a smoke test that simulates rapid double-clicks on the CTA.
- **NFT not visible in UI** → Ensure the ticket status API (`GET /api/event/:eventId/ticket`) returns the minted `nftId` and that the client hydrates this value after purchase.

### Deep links and embeds
- **Deep link fails on mobile** → Verify the `hubzz://` scheme is registered. Implement a 1s fallback to the web client and provide a "Copy link" button. Test on iOS/Android emulation in Playwright.
- **External stream iframe blocked** → Check CSP headers and iframe `sandbox/allow` attributes for Kick/Twitch/YouTube. Validate the embed URL format (e.g., Twitch channel vs. video id) and sanitize input.
- **Countdown never flips to live** → Ensure `startTime` is parsed as UTC and that client-side timers use the same reference. Add a unit test that simulates crossing the start boundary to validate state transitions.

### Build, deploy, and environment
- **Build failures after removing DatoCMS** → Remove unused imports, env vars, and TypeScript types tied to DatoCMS. Run `yarn lint && yarn test` to catch stragglers; add stubs for replacement data where needed.
- **Env drift between local and Vercel** → Keep `.env.example` updated. In Vercel, double-check that `NEXTAUTH_URL`, `HUBZZ_API_URL`, `HUBZZ_CLIENT_URL`, and `NEXT_PUBLIC_HBC_CONTRACT_ADDRESS` are set for each environment (preview vs. production).
- **Slow first paint on event pages** → Enable ISR (revalidate ~30s) and prefetch stage links. Use Next.js image optimization for speaker avatars and ensure hero images use `priority`.
