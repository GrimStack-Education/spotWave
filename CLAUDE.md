# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Root Commands

- `pnpm dev` - Run all services in development mode
- `pnpm dev:frontend` - Run only the frontend application
- `pnpm dev:backend` - Run only the backend application
- `pnpm build` - Build all packages in the monorepo
- `pnpm build:frontend` - Build only the frontend
- `pnpm build:backend` - Build only the backend
- `pnpm lint:fix` - Fix linting issues and format the codebase
- `pnpm format` - Format the entire repository using Prettier

### Application-Specific Commands

- **Backend**:
  - `pnpm --filter @spotwave/backend start:dev` - Start backend in watch mode
  - `pnpm --filter @spotwave/backend test` - Run backend tests
  - `pnpm --filter @spotwave/backend build` - Build the backend
- **Frontend**:
  - `pnpm --filter @spotwave/frontend dev` - Start frontend development server
  - `pnpm --filter @spotwave/frontend build` - Build the frontend for production
  - `pnpm --filter @spotwave/frontend lint` - Lint the frontend

### Infrastructure

- `docker compose -f infrastructure/docker/docker-compose.yml up --build` - Start local infrastructure (e.g., PostgreSQL)
- `docker compose -f infrastructure/docker/docker-compose.yml down` - Stop infrastructure

## Architecture and Structure

### High-Level Overview

SpotWave is a hyper-local social platform for finding real-time events and like-minded people. It is organized as a pnpm monorepo managed by Turborepo.

### Project Structure

- `apps/frontend/`: Next.js application using Tailwind CSS and HeroUI. Handles the user interface, interactive maps, and client-side state.
- `apps/backend/`: NestJS application providing a REST API. Contains business logic, domain modules, and database integration via Prisma.
- `infrastructure/`: Contains Docker configurations and environment setup for local development and deployment.
- `docs/`: Project documentation.

### Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, HeroUI.
- **Backend**: NestJS, Prisma ORM.
- **Database**: PostgreSQL.
- **Tooling**: pnpm, Turborepo, Prettier, ESLint.
