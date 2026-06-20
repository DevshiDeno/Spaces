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

See [apps/web/README.md](apps/web/README.md) and [apps/api/README.md](apps/api/README.md) for app-specific details.
