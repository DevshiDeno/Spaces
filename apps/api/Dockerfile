# syntax = docker/dockerfile:1
#
# Production image for the Spaces For you API (NestJS + Prisma).
# Build context = apps/api/  (i.e. `fly deploy` from inside this folder).
# ──────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="NestJS/Prisma"

WORKDIR /app
ENV NODE_ENV="production"


# ───────── Build stage ─────────
FROM base AS build

# Build toolchain for native node modules (bcrypt, prisma engines, etc.)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential node-gyp openssl pkg-config python-is-python3

# Install ALL deps (we need nest CLI + tsc + prisma to build)
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Generate Prisma client (uses prisma/schema.prisma)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Compile NestJS → dist/main.js
RUN npm run build

# Drop devDependencies for a leaner runtime image
RUN npm prune --omit=dev


# ───────── Runtime stage ─────────
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app /app

EXPOSE 4000

# `release_command = 'npx prisma migrate deploy'` in fly.toml runs
# migrations once before each deploy, so we only need to boot here.
CMD ["npm", "run", "start:prod"]
