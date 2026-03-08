FROM node:22.16.0-alpine3.22 AS base

# ─── Stage 1: All dependencies (dev + prod) ───────────────────────────────────
FROM base AS deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Production-only dependencies ────────────────────────────────────
FROM base AS production-deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 3: Build ───────────────────────────────────────────────────────────
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace.js build --no-assets

# ─── Stage 4: Production image ────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app

# Copy and set up the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "./bin/server.js"]
