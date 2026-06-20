# Spaces For you — Monorepo

> Inclusive venues platform for Kenya. Two apps in one workspace.

```
.
├── apps/
│   ├── web/   # React 18 + Vite + Tailwind + Zustand + TanStack Query
│   └── api/   # NestJS 10 + Prisma + Postgres + JWT auth
└── package.json   (npm workspaces)
```

## Quick start

```bash
# 1. Install everything (web + api)
npm install

# 2. Spin up Postgres locally (any way you like — Docker is easiest):
docker run -d --name spaces-db -p 5432:5432 \
  -e POSTGRES_USER=spaces -e POSTGRES_PASSWORD=spaces -e POSTGRES_DB=spaces \
  postgres:16

# 3. Configure backend env
cp apps/api/.env.example apps/api/.env
# (defaults assume the docker command above)

# 4. Run migrations + seed
npm run db:migrate
npm run db:seed

# 5. Start both apps (in two terminals)
npm run dev:api    # → http://localhost:4000/api
npm run dev:web    # → http://localhost:5173
```

<details>
<summary>Windows / PowerShell equivalents</summary>

PowerShell uses backtick (`` ` ``) for line continuation, not backslash. Replace step 2 and 3 with:

```powershell
# 2. Postgres
docker run -d --name spaces-db -p 5432:5432 `
  -e POSTGRES_USER=spaces `
  -e POSTGRES_PASSWORD=spaces `
  -e POSTGRES_DB=spaces `
  postgres:16

# 3. Backend env
Copy-Item apps/api/.env.example apps/api/.env
```
</details>

By default `apps/web/.env` has `VITE_USE_MOCK_API=true` so the frontend uses
in-memory fixtures. Flip it to `false` to point at the real API on
`http://localhost:4000/api`.

## Workspace commands

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev:web`      | Start Vite dev server                                     |
| `npm run dev:api`      | Start Nest in watch mode                                  |
| `npm run build`        | Build both apps                                           |
| `npm run db:generate`  | Regenerate Prisma client                                  |
| `npm run db:migrate`   | Apply Prisma migrations (dev)                             |
| `npm run db:seed`      | Seed the database with fixtures                           |
| `npm run db:studio`    | Open Prisma Studio for the DB                             |

## Booking Calendar (roadmap)

A dashboard calendar so venue owners see bookings at a glance, evolving toward
collision-proof scheduling against their own and external calendars.

### Phase 1 — Read-only booking calendar ✅ (shipped)

Month grid at `/dashboard/calendar` (owner/admin), wired to the existing
`/bookings/owner` feed — no backend change. Status-colored entries (Confirmed /
Pending-held / Completed; cancelled slots hidden), per-venue filter, and a
day-detail panel. The calendar *reflects* bookings; it is not the source of
truth. Collision logic stays server-side. Days are derived from the booking
date's `YYYY-MM-DD` prefix to avoid timezone drift.

### Phase 2 — Manual availability blocks (planned)

Let owners mark time as busy (maintenance, private/offline events) so public
bookings can't land on it. This is the piece that makes the calendar *prevent*
collisions, not just display them.

- New `AvailabilityBlock { venueId, date, startTime, endTime, reason? }` model
  (`prisma migrate dev --name availability_blocks`).
- One extra overlap check inside the existing serializable transaction in
  [apps/api/src/bookings/bookings.service.ts](apps/api/src/bookings/bookings.service.ts)
  — reject a booking that intersects a block, same half-open interval test
  already used for booking-vs-booking conflicts.
- Calendar UI: click an empty slot to add a block; render blocks as a distinct lane.

### Phase 3 — External "business calendar" sync (later, opt-in)

Two-way sync with Google/Outlook so an owner's real calendar and the platform
stay collision-free.

- **Cheap first step (one-way, no OAuth):** publish a per-owner iCal `.ics` feed
  of bookings to subscribe to; and/or import a secret iCal URL of their calendar,
  treating its busy events as Phase-2 blocks.
- **Full sync:** per-owner OAuth, token storage, push/poll, mapping bookings ⇄
  external events, with recurring-event expansion and timezone normalization.

> **Timezone note:** booking times are stored as `startTime`/`endTime` strings
> with `date` at UTC midnight. Treat them as **venue-local** (Kenya, EAT/UTC+3)
> when rendering; long-term, consider a `timezone` field on `Venue`.

See [apps/web/README.md](apps/web/README.md) and [apps/api/README.md](apps/api/README.md) for app-specific details.
