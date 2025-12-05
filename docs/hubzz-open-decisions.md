# Hubzz Integration – Open Decisions

These decisions block or influence implementation sequencing for the Hubzz event landing conversion. Keep this file updated so contributors know what inputs are pending and who owns them.

| Decision | Options | Owner | Needed By | Status/Notes |
| --- | --- | --- | --- | --- |
| Auth provider | Privy confirmed as canonical login (GitHub fallback only if explicitly requested) | Confirmed (Privy) | Before auth implementation starts | Use Privy SDK/credentials; session must expose id, username, avatar, wallet, groupRole. |
| HBC treasury + chain | Treasury address and chain for staging/production | TBD | Before ticketing work | Required for `purchaseTicketWithHBC` flow and contract address in `NEXT_PUBLIC_HBC_CONTRACT_ADDRESS`. |
| Backstage API surface | Which moderator actions are live vs. placeholders | TBD | Before backstage route build | Determines whether backstage buttons call live Hubzz APIs or render mocked controls. |
| Stream queue freshness SLA | How often stream queue updates and who operates it | TBD | Before stream-queue wiring | Guides ISR interval, client polling, and admin controls for rotations. |
| Followed-groups feed API | Data shape and availability for upcoming events shown in follower feeds (CTA states, capacity, age gating) | TBD | Before feed/card implementation | Informs feed endpoint contract and cache freshness to mirror the mobile mock (buy/sold out/coming soon). |

## How to use
- Update **Owner** and **Needed By** dates as soon as a decision is assigned.
- Move items to “Resolved” in Status/Notes once a choice is confirmed; link to the source of truth (doc/issue/Slack thread).
- Reference this file in PRs that depend on these decisions so reviewers understand risk and sequencing.
