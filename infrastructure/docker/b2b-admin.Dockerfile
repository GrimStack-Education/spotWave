FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/b2b-admin/package.json ./apps/b2b-admin/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/b2b-admin ./apps/b2b-admin
COPY packages/types ./packages/types
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @spotwave/b2b-admin build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/b2b-admin ./apps/b2b-admin
COPY --from=build /app/packages/types ./packages/types
USER node
EXPOSE 3001
CMD ["sh", "-c", "cd apps/b2b-admin && node node_modules/next/dist/bin/next start -p 3001 -H 0.0.0.0"]
