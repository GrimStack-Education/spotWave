FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN apk add --no-cache python3 make g++ git && \
    npm install -g pnpm@latest

# Copy workspace manifests and b2b-admin sources
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/b2b-admin ./apps/b2b-admin
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/b2b-admin
RUN pnpm build

EXPOSE 3001
ENV DATABASE_URL="postgres://spotwave:changeme@postgres:5432/spotwave"
CMD ["pnpm", "--filter", "@spotwave/b2b-admin", "start"]
