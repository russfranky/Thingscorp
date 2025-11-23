# Hubzz Event Landing Site Conversion Plan

This document outlines how to adapt the Vercel Virtual Event Starter Kit into a Hubzz-compatible event landing experience. The goal is to keep the starter kit's marketing strengths while wiring it into Hubzz authentication, ticketing, and spatial venues.

## Objectives
- Replace DatoCMS content fetching with Hubzz event data APIs.
- Swap GitHub OAuth for Hubzz authentication (wallet + social) while retaining optional GitHub login.
- Support multi-stage events mapped to Hubzz zones/venues, with deep links into the Hubzz client.
- Keep the optional 100ms drop-in rooms while adding external stream embeds (Kick/Twitch/YouTube) and queueing.
- Enable HBC-powered ticketing that mints Event Stub NFTs and unlocks venue access.

## Current Progress Snapshot
- **Plan completeness**: Architecture, API contract, implementation blueprint, and testing strategy are all drafted and ready for execution.
- **Repository state**: No code migrations have begun; the starter kit still needs DatoCMS removal, Hubzz auth wiring, and new event routes.
- **Dependencies & envs**: Hubzz-specific environment variables are defined here but have not yet been added to `.env.example` or validated in code.
- **Open decisions**: Awaiting confirmation on auth scope (GitHub fallback vs. Hubzz-only), HBC treasury details, backstage API support, and stream queue SLA—these are required before implementation starts.
- **Next actionable steps**: Remove DatoCMS bindings, scaffold Hubzz auth provider, add the Hubzz API client with Zod validation, and create dynamic `/event/[eventId]/stage/[stageId]` routes using ISR.

## Environment Variables
Configure the Next.js app with Hubzz settings:

```
HUBZZ_API_URL=https://api.hubzz.com
HUBZZ_API_KEY=<secret>
HUBZZ_CLIENT_URL=https://app.hubzz.com
NEXT_PUBLIC_HBC_CONTRACT_ADDRESS=<blockchain>
NEXTAUTH_URL=https://events.hubzz.com
NEXTAUTH_SECRET=<secret>
REDIS_URL=<redis-url>
REDIS_PASSWORD=<redis-password>
```

## Core Replacements
- **Authentication**: Replace GitHub provider with a Hubzz OAuth provider at `/api/auth/login`; optionally keep GitHub as a secondary provider. Sessions must respect Hubzz JWT tokens and expose avatar, username, wallet address, and group roles.
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

2. **Auth bridge**
   - Implement `pages/api/auth/[...nextauth].ts` with the Hubzz OAuth endpoints and JWT mapping (id, username, avatar, wallet, group roles).
   - Add a token refresh helper that exchanges the Hubzz refresh token for a new access token before expiry; store refresh token in encrypted cookies.
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
- **Token handling**: Store Hubzz refresh tokens HttpOnly + `SameSite=Lax`; use access tokens in memory. Ensure ISR revalidation uses application credentials, not user tokens.
- **Role enforcement**: Centralize `requireHostRole` helper for backstage routes and buttons to avoid scattered role checks.
- **Embed safety**: Sanitize external stream URLs, and set appropriate `allow`/`sandbox` attributes on iframes.
- **Progressive enhancement**: The site must still render static content (schedule, speakers, sponsors) even if Hubzz APIs are temporarily unavailable; show degradations with clear messaging.

## API contract mapping (Hubzz ⇄ Next.js)
- **Auth**
  - `POST /api/auth/login` → Hubzz OAuth authorize URL; exchanges `code` for `{ accessToken, refreshToken, expiresIn }`.
  - `POST /api/auth/refresh` → exchanges refresh token; returns `{ accessToken, expiresIn }`.
  - Session shape exposed to Next.js: `{ id, username, avatarUrl, walletAddress, groupRole, accessTokenExpiresAt }`.
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
- **Auth failures**: Display a retry CTA; clear cookies on repeated 401s; never block static content because of auth errors.
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
- Should GitHub OAuth remain as a fallback for web-only users, or is Hubzz auth exclusive?
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
