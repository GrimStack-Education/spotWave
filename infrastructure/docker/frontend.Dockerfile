FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN apk add --no-cache python3 make g++ git && \
    npm install -g pnpm@latest

# Copy workspace manifests and frontend sources
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/frontend ./apps/frontend
COPY apps/backend ./apps/backend

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/frontend
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "--filter", "@spotwave/frontend", "start"]
