FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/frontend ./apps/frontend
COPY packages/types ./packages/types
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @spotwave/frontend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/frontend ./apps/frontend
COPY --from=build /app/packages/types ./packages/types
USER node
EXPOSE 3000
CMD ["sh", "-c", "cd apps/frontend && node node_modules/next/dist/bin/next start -p 3000 -H 0.0.0.0"]
