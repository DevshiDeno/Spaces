# syntax=docker/dockerfile:1.7
#
# Production image for apps/api (NestJS + Prisma).
# Build context = monorepo root. Deploy with `fly deploy` from repo root.
# ──────────────────────────────────────────────────────────────────────────────

# ───────── 1. Builder: install ALL deps, generate Prisma client, build ─────────
FROM node:20-slim AS builder

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /repo

# Copy workspace manifests first for layer caching.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all workspace deps (devDeps included — we need nest CLI + prisma to build).
RUN npm ci

# Copy only the api source — we don't need the web app in this image.
COPY apps/api/ ./apps/api/

WORKDIR /repo/apps/api
RUN npx prisma generate \
 && npm run build

# ───────── 2. Runtime: prod deps only + compiled output ─────────
FROM node:20-slim AS runtime

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Reinstall production-only deps so the final image is lean.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci --omit=dev --workspace apps/api --include-workspace-root \
 && npm cache clean --force

# Bring in build artifacts + Prisma schema so `prisma generate` and
# `migrate deploy` have everything they need at runtime.
COPY --from=builder /repo/apps/api/dist     ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma   ./apps/api/prisma

WORKDIR /app/apps/api
RUN npx prisma generate

USER node
EXPOSE 4000

# Apply pending migrations on container start, then boot the API.
# Safe to re-run: `migrate deploy` is a no-op if everything is applied.
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
