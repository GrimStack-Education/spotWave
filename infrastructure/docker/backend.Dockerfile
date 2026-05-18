FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN apk add --no-cache python3 make g++ git && \
    npm install -g pnpm@latest

# Copy root manifests to leverage pnpm workspace install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/backend
RUN pnpm build

EXPOSE 3333
ENV DATABASE_URL="postgres://spotwave:changeme@postgres:5432/spotwave"
CMD ["pnpm", "--filter", "@spotwave/backend", "start:prod"]
