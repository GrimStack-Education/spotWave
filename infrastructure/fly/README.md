# Fly.io deployment

This project is deployed as three Fly apps because Fly does not run Docker Compose as a single unit:

- `spotwave-backend` from `infrastructure/docker/backend.Dockerfile`
- `spotwave` from `infrastructure/docker/frontend.Dockerfile`
- `spotwave-b2b-admin` from `infrastructure/docker/b2b-admin.Dockerfile`

The default region is `fra`. If any app name is already taken, rename it in the matching `fly.*.toml` file and update `CORS_ORIGIN` plus `NEXT_PUBLIC_API_URL` values before deploying.

## First deploy

```sh
flyctl auth login

flyctl apps create spotwave-backend
flyctl apps create spotwave
flyctl apps create spotwave-b2b-admin

flyctl postgres create --name spotwave-postgres --region fra
flyctl postgres attach spotwave-postgres --app spotwave-backend

flyctl secrets set JWT_SECRET="$(openssl rand -base64 48)" --app spotwave-backend

flyctl deploy --config fly.backend.toml --ha=false
flyctl deploy --config fly.frontend.toml --ha=false
flyctl deploy --config fly.b2b-admin.toml --ha=false
```

The backend release command syncs the current Prisma schema and seeds data before the backend machine starts. It uses the same `prisma db push` path as the local Docker migrator because the current migration history does not yet cover the full active schema.

## Redeploy

```sh
flyctl deploy --config fly.backend.toml --ha=false
flyctl deploy --config fly.frontend.toml --ha=false
flyctl deploy --config fly.b2b-admin.toml --ha=false
```

To keep the MVP footprint small, each app is scaled to one machine:

```sh
flyctl scale count 1 --app spotwave-backend --process-group app
flyctl scale count 1 --app spotwave --process-group app
flyctl scale count 1 --app spotwave-b2b-admin --process-group app
```
