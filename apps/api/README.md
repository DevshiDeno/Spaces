# Qreative Spaces — API

NestJS 10 + Prisma 5 + Postgres backend for the Qreative Spaces platform.

## What's inside

- **NestJS 10** with global `ValidationPipe`, exception filter, and response transformer
- **Prisma 5** ORM against Postgres with full schema for users, venues, events, bookings, RSVPs, ally applications, and contact messages
- **JWT auth** (passport-jwt) + bcrypt password hashing
- **Role-based access** via `@Roles()` decorator and a global `RolesGuard`
- **Throttling** (`@nestjs/throttler` — 120 req/min default)
- **Helmet** + CORS configured from env
- **Swagger** auto-generated at `/api/docs`
- **M-Pesa Daraja** STK Push integration scaffolded (returns mocked success until you fill in `MPESA_*` env vars)
- **Stripe** card payments scaffolded the same way

## Quick start

```bash
# From the monorepo root:

# 1. Start Postgres (Docker is easiest)
docker run -d --name qspaces-db -p 5432:5432 \
  -e POSTGRES_USER=qspaces -e POSTGRES_PASSWORD=qspaces -e POSTGRES_DB=qspaces \
  postgres:16

# 2. Copy env (defaults match the docker command above)
cp apps/api/.env.example apps/api/.env

# 3. Run migrations + seed
npm run db:migrate     # creates the schema
npm run db:seed        # inserts admin user, venues, events, applications

# 4. Boot the API
npm run dev:api
# → http://localhost:4000/api
# → http://localhost:4000/api/docs  (Swagger)
```

### Seeded credentials

| Role         | Email                              | Password    |
| ------------ | ---------------------------------- | ----------- |
| Admin        | `admin@qreativespaces.co.ke`       | `admin123`  |
| Space Owner  | `owner@qreativespaces.co.ke`       | `owner123`  |
| User         | `simon@mzizi.co.ke`                | `demo1234`  |

## Architecture

```
apps/api/
├── prisma/
│   ├── schema.prisma          # Single source of truth for the DB
│   └── seed.ts                # Idempotent seed via `tsx`
└── src/
    ├── main.ts                # Bootstrap: helmet, CORS, validation, Swagger
    ├── app.module.ts          # Imports every feature module + global guards
    ├── config/configuration.ts # Typed env reader
    │
    ├── common/
    │   ├── decorators/        # @Public, @Roles, @CurrentUser
    │   ├── guards/            # RolesGuard
    │   ├── filters/           # HttpExceptionFilter (Prisma-aware)
    │   ├── interceptors/      # TransformInterceptor (success envelope)
    │   ├── dto/               # PaginationDto
    │   └── utils/             # slugify
    │
    ├── prisma/                # PrismaService (lifecycle-managed)
    ├── auth/                  # /auth — register, login, me
    ├── users/                 # /users — admin user mgmt
    ├── venues/                # /venues — public + owner CRUD
    ├── events/                # /events — public + RSVP
    ├── bookings/              # /bookings — create, list, cancel
    ├── applications/          # /applications — ally application submit + review
    ├── contact/               # /contact — public message + admin inbox
    ├── dashboard/             # /dashboard — KPI stats
    ├── payments/              # /payments — M-Pesa STK + Stripe (stubbed)
    └── health/                # /health — liveness/DB check
```

### Auth flow

- `JwtAuthGuard` is registered globally via `APP_GUARD`. **Every route is protected by default.**
- Add `@Public()` to opt a route out (used for `/venues`, `/events`, `/auth/login`, `/auth/register`, `/contact`, `/applications`, `/health`, `/payments/mpesa/callback`).
- `RolesGuard` reads `@Roles(UserRole.X)` metadata and 403s when the JWT's role doesn't match.
- Tokens are signed with HS256, default 7-day expiry. Set `JWT_SECRET` to a long random string in production.

### Response envelope

Every successful response is wrapped by `TransformInterceptor`:

```json
{ "success": true, "data": ..., "timestamp": "2026-05-12T10:00:00Z" }
```

Errors go through `HttpExceptionFilter`:

```json
{ "success": false, "statusCode": 404, "message": "Venue not found", "code": "NOT_FOUND", "path": "/api/venues/slug/missing", "timestamp": "..." }
```

> The frontend currently unwraps neither — flip `VITE_USE_MOCK_API=false` and either adjust [apps/web/src/services/http.ts](../web/src/services/http.ts) to read `res.data.data`, or change `TransformInterceptor` to pass-through. The contract is yours to pick.

## API surface

### Public

| Verb | Path | Notes |
|---|---|---|
| GET  | `/health` | Liveness + DB ping |
| POST | `/auth/register` | Returns `{ user, token }` |
| POST | `/auth/login` | Returns `{ user, token }` |
| GET  | `/venues` | Filters: `query, city, type, mood, timeOfDay, capacityMin/Max, priceMin/Max, page, pageSize` |
| GET  | `/venues/featured` | |
| GET  | `/venues/slug/:slug` | |
| GET  | `/events` | |
| GET  | `/events/featured` | |
| GET  | `/events/slug/:slug` | |
| POST | `/applications` | Submit ally application |
| POST | `/contact` | Submit contact message |
| POST | `/payments/mpesa/callback` | Daraja webhook |

### Authenticated (any role)

| Verb | Path | Notes |
|---|---|---|
| GET   | `/auth/me` | |
| POST  | `/bookings` | Create booking + initiate payment |
| GET   | `/bookings` | My bookings |
| GET   | `/bookings/:id` | If owner / customer / admin |
| PATCH | `/bookings/:id/cancel` | |
| POST  | `/events/:id/rsvp` | `{ attendees }` |

### Space Owner

| Verb | Path | Notes |
|---|---|---|
| GET   | `/venues/owner` | My venues |
| POST  | `/venues` | Create venue |
| PATCH | `/venues/:id` | Owner or admin |
| POST  | `/venues/:id/images` | Append image URLs |
| DELETE| `/venues/:id` | Owner or admin |
| GET   | `/bookings/owner` | Bookings on my venues |
| POST  | `/events` | Create event |
| GET   | `/dashboard/stats` | Shared with admin |

### Admin only

| Verb | Path | Notes |
|---|---|---|
| GET   | `/users?role=&search=&page=` | |
| GET   | `/users/:id` | |
| PATCH | `/users/:id/role` | |
| DELETE| `/users/:id` | |
| GET   | `/applications?status=PENDING` | |
| PATCH | `/applications/:id/review` | `{ status: APPROVED \| REJECTED, notes? }` |
| GET   | `/contact` | Inbox |

## Wiring up M-Pesa Daraja (STK Push)

1. Get sandbox credentials at https://developer.safaricom.co.ke
2. Set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` in `.env`
3. Expose `MPESA_CALLBACK_URL` to the internet (ngrok in dev): `ngrok http 4000` → put the https URL in `.env` and Daraja's portal
4. Implement the two TODO blocks in [src/payments/payments.service.ts](src/payments/payments.service.ts):
   - `initiateMpesa()` — OAuth token → STK Push request
   - `handleMpesaCallback()` — verify + update `Booking.paymentStatus`

Both methods currently return mocked success when credentials are missing, so the booking flow works for development without Daraja access.

## Wiring up Stripe (or Flutterwave / DPO)

Set `STRIPE_SECRET_KEY` then implement `initiateCard()` in the same file — return `{ clientSecret }` to the frontend and finalize via a webhook handler.

## Scripts

| Command                        | What it does                                  |
| ------------------------------ | --------------------------------------------- |
| `npm run start:dev`            | Nest watch mode                               |
| `npm run build`                | Compile to `dist/`                            |
| `npm run start:prod`           | Run compiled `dist/main.js`                   |
| `npm run prisma:generate`      | Regenerate Prisma client                      |
| `npm run prisma:migrate`       | Apply migrations (dev)                        |
| `npm run prisma:migrate:deploy`| Production migrations                         |
| `npm run prisma:seed`          | Run [prisma/seed.ts](prisma/seed.ts)          |
| `npm run prisma:studio`        | Open Prisma Studio                            |
| `npm run type-check`           | `tsc --noEmit`                                |

## Deploying to Fly.io (recommended)

The repo ships with a [Dockerfile](../../Dockerfile), [.dockerignore](../../.dockerignore), and [fly.toml](../../fly.toml) at the monorepo root, configured for the **`jnb` (Johannesburg)** region so M-Pesa latency to Nairobi stays around 50 ms.

### One-time setup

```bash
# 1. Install flyctl
#    macOS:   brew install flyctl
#    Windows: iwr https://fly.io/install.ps1 -useb | iex
#    Linux:   curl -L https://fly.io/install.sh | sh

fly auth login

# 2. Provision Postgres (use Neon — free + serverless — over Fly Postgres)
#    Sign up at https://neon.tech → create project → copy connection string

# 3. Claim the Fly app (does NOT deploy yet)
cd c:/Code/source/repos/Spaces
fly launch --no-deploy --copy-config --name qspaces-api --region jnb

# 4. Set secrets (these are encrypted, never leave Fly)
fly secrets set \
  DATABASE_URL="postgresql://...neon.tech/qspaces?sslmode=require" \
  JWT_SECRET="$(openssl rand -base64 48)" \
  CORS_ORIGINS="https://qreativespaces.co.ke,https://www.qreativespaces.co.ke"

# Optional payment + email secrets (the API falls back to mocked success without these)
fly secrets set \
  MPESA_CONSUMER_KEY=... \
  MPESA_CONSUMER_SECRET=... \
  MPESA_SHORTCODE=... \
  MPESA_PASSKEY=... \
  MPESA_CALLBACK_URL=https://qspaces-api.fly.dev/api/payments/mpesa/callback
```

### Deploy

```bash
fly deploy
```

That's it. The Dockerfile is multi-stage:
1. **Builder** — installs all workspace deps, runs `prisma generate` + `nest build`
2. **Runtime** — prod-only deps + compiled `dist/` + Prisma schema, ~180 MB final image
3. **Container start** — runs `prisma migrate deploy` then `node dist/main.js`

Migrations apply on every deploy automatically — safe to re-run.

### Verifying the deploy

```bash
fly logs              # tail container output
fly ssh console       # shell into the running machine
curl https://qspaces-api.fly.dev/api/health
```

### Seeding production (one-time)

```bash
fly ssh console -C "npm run prisma:seed --workspace apps/api"
```

> ⚠️ **Disable the seed before going live for real customers** — it inserts demo accounts with weak passwords.

### Updating the M-Pesa callback URL

Daraja needs your callback URL pre-registered. Once you have your Fly app URL:

1. Set `MPESA_CALLBACK_URL=https://qspaces-api.fly.dev/api/payments/mpesa/callback` via `fly secrets set`
2. Update it in Safaricom's developer portal under your sandbox/production app

## What's still TODO before production

- Real M-Pesa Daraja + Stripe integration (see above)
- File uploads → S3 / Cloudinary (currently `coverImage` / `images` are just URLs)
- Transactional emails (booking confirmations, RSVP receipts, application acknowledgements)
- Refresh tokens + forgot-password flow
- Reviews & ratings (model already has `rating` / `reviewCount` on `Venue`)
- Rate-limiting tightening on auth routes
- CSRF + cookie-based session option (currently bearer-only)
- E2E tests (Jest + supertest)
