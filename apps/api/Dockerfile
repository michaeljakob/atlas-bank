# Multi-stage build for the Atlas Bank API (NestJS + Fastify).
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# --- Dependencies (with dev deps for build) ---
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/provider-contracts/package.json packages/provider-contracts/package.json
RUN npm ci --include=dev

# --- Build ---
FROM deps AS build
COPY . .
RUN npm run build --workspace=apps/api

# --- Runtime ---
FROM base AS runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages ./packages

EXPOSE 4000
# migrationsRun:true applies pending migrations on boot.
CMD ["node", "apps/api/dist/main.js"]
