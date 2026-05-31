# Repository Guidelines

## Project Structure & Module Organization

This repository is a `pnpm` + `turbo` monorepo.

- `apps/frontend` - main Next.js app for the consumer UI.
- `apps/b2b-admin` - separate Next.js admin surface.
- `apps/backend` - NestJS API, with unit and e2e tests in `src/**/*.spec.ts` and `test/`.
- `packages/database` - Prisma schema, client generation, and seed logic.
- `packages/types` - shared TypeScript types.
- `docs/` - architecture, API, and contribution docs.
- `infrastructure/` - Docker, Fly, and Nginx deployment assets.

## Build, Test, and Development Commands

Run commands from the repository root unless noted.

- `pnpm install` - install workspace dependencies.
- `pnpm dev` - run all apps in watch mode via Turbo.
- `pnpm dev:frontend` / `pnpm dev:backend` - run one app only.
- `pnpm build` - build all workspace packages.
- `pnpm build:frontend` / `pnpm build:backend` - build one app only.
- `pnpm format` / `pnpm format:check` - format or verify formatting with Prettier.
- `pnpm lint:fix` - run workspace lint fixes, then format the repo.
- Backend-specific: `pnpm --filter @spotwave/backend test`, `test:cov`, `test:e2e`.

## Coding Style & Naming Conventions

Use TypeScript throughout. Keep formatting consistent with Prettier defaults and existing file style.

- Prefer `camelCase` for variables, functions, and Prisma fields.
- Use `PascalCase` for React components, NestJS classes, and Prisma models.
- Keep filenames descriptive and aligned with feature scope, e.g. `event.service.ts`, `CommunityCard.tsx`.
- Follow the package lint rules before opening a PR.

## Testing Guidelines

Backend tests use Jest. Name unit tests `*.spec.ts`; e2e tests live under `apps/backend/test`.

- Add tests for behavior changes, especially API, database, and auth flows.
- Prefer focused tests that cover the regression being introduced.
- Run `pnpm --filter @spotwave/backend test` before backend changes and `test:e2e` for integration work.

## Commit & Pull Request Guidelines

Use Conventional Commits: `<type>(<scope>): <subject>`.

- Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`.
- Common scopes: `frontend`, `backend`, `db`, `components`, `shared`, `docker`.
- Keep PRs small and focused. Describe what changed, why, and how to verify it.
- Include screenshots or short recordings for UI changes.
- Update docs when behavior, scripts, or architecture change.

## Security & Configuration Tips

Do not commit secrets, API keys, or generated local state. If you touch Prisma or Docker setup, verify the change with the relevant root command and note any required environment variables in the PR.
