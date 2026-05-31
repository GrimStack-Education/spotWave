# SpotWave MVP Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the most visible MVP gaps found during review without changing the core app architecture.

**Architecture:** Keep the existing Nest module and Next feature structure. Add small backend business-rule fixes around event participation/check-in, then align frontend display and demo documentation with the corrected semantics.

**Tech Stack:** NestJS, Prisma, Next.js App Router, React Query, Docker Compose, pnpm.

---

### Task 1: Backend Participation Rules

**Files:**

- Modify: `apps/backend/test/app.e2e-spec.ts`
- Modify: `apps/backend/src/modules/events/events.service.ts`
- Modify: `apps/backend/src/modules/checkins/checkins.service.ts`

- [ ] Add regression coverage proving waitlisted participants cannot check in.
- [ ] Add regression coverage proving manual approval cannot overfill event capacity.
- [ ] Expose member-only joined counts and seats-left metadata while preserving existing response shape.
- [ ] Implement minimal backend policy fixes.
- [ ] Run `docker compose -f infrastructure/docker/docker-compose.yml run --rm backend-test`.

### Task 2: Frontend MVP Polish

**Files:**

- Modify: `apps/frontend/src/features/events/api/events.api.ts`
- Modify: `apps/frontend/src/features/events/model/mappers.ts`
- Modify: `apps/frontend/src/shared/types/domain.ts`
- Modify: `apps/frontend/src/widgets/app-shell/index.tsx`
- Modify: `apps/frontend/src/features/notifications/api/notifications.api.ts`
- Modify: `apps/frontend/src/features/create-event/ui/create-event-screen.tsx`

- [ ] Use backend member counts and seats-left data for event cards.
- [ ] Replace hardcoded notification badge with unread notification count.
- [ ] Show event creation success with a success visual state instead of `ErrorState`.
- [ ] Run `pnpm --filter @spotwave/frontend lint`.
- [ ] Run `pnpm --filter @spotwave/frontend build`.

### Task 3: README Demo Presentation

**Files:**

- Modify: `README.md`

- [ ] Add demo credentials for seeded users.
- [ ] Add a short demo flow that matches the real app screens.
- [ ] Mention the Docker backend e2e command can reset seed data and how to restore it.

### Task 4: Final Verification

- [ ] Run backend build.
- [ ] Run frontend lint and build.
- [ ] Run Docker compose config.
- [ ] Run backend e2e through Docker.
- [ ] Restore seed data after backend e2e.
