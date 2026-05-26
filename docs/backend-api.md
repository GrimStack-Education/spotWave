# SpotWave Backend API

This document describes the backend endpoints that are currently implemented and ready for frontend integration.

Base URL:

```text
http://localhost:3333
```

## Transport rules

- Authentication: `Authorization: Bearer <accessToken>`
- Content type for write requests: `application/json`
- All successful responses are wrapped in:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {}
}
```

- All error responses are wrapped in:

```json
{
  "status": "error",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "path": "/events",
  "error": "Readable error message or validation object"
}
```

## Enums

### `UserRole`

- `USER`
- `ADMIN`
- `MODERATOR`
- `B2B_ADMIN`

### `EventStatus`

- `DRAFT`
- `ACTIVE`
- `CANCELLED`
- `FINISHED`

### `EventVisibility`

- `PUBLIC`
- `NEIGHBORHOOD`
- `PRIVATE`

### `ParticipantRole`

- `HOST`
- `MEMBER`

### `ParticipantStatus`

- `JOINED`
- `WAITLIST`
- `LEFT`

### `ReportTargetType`

- `EVENT`
- `USER`

### `ReportStatus`

- `OPEN`
- `REVIEWING`
- `RESOLVED`
- `REJECTED`

## Health

### `GET /`

Simple smoke endpoint.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": "Hello World!"
}
```

### `GET /health`

Backend liveness probe.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "ok": true
  }
}
```

### `GET /health/ready`

Backend readiness probe with database check.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "ok": true
  }
}
```

## Auth

### `POST /auth/register`

Creates a new user and returns JWT.

Request body:

```json
{
  "email": "guest@example.com",
  "password": "password123",
  "name": "Guest User"
}
```

Validation:

- `email` must be a valid email
- `password` min length: `8`
- `name` is optional

Response `201`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "accessToken": "<jwt>"
  }
}
```

Common errors:

- `409` email already exists
- `400` validation error

### `POST /auth/login`

Returns JWT for an existing user.

Request body:

```json
{
  "email": "guest@example.com",
  "password": "password123"
}
```

Response `201`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "accessToken": "<jwt>"
  }
}
```

Common errors:

- `401` invalid credentials
- `400` validation error

### `GET /auth/me`

Protected endpoint. Returns current user profile.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "id": "uuid",
    "email": "guest@example.com",
    "role": "USER",
    "profile": {
      "displayName": "Guest User",
      "avatarUrl": null,
      "bio": null,
      "homeLat": null,
      "homeLng": null,
      "radiusKm": 5
    },
    "createdAt": "2026-05-26T12:00:00.000Z",
    "updatedAt": "2026-05-26T12:00:00.000Z"
  }
}
```

Common errors:

- `401` missing or invalid token

### `POST /auth/refresh`

Protected endpoint. Returns a new JWT for the current user.

Response `201`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "accessToken": "<jwt>"
  }
}
```

## Users

### `GET /users`

Returns a public list of users.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "email": "guest@example.com",
      "role": "USER",
      "displayName": "Guest User",
      "avatarUrl": null,
      "createdAt": "2026-05-26T12:00:00.000Z",
      "updatedAt": "2026-05-26T12:00:00.000Z"
    }
  ]
}
```

### `GET /users/:id`

Returns one user by UUID.

Common errors:

- `404` user not found
- `400` invalid UUID

## Tags

### `GET /tags`

Returns all available tags.

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "slug": "music",
      "name": "Music"
    }
  ]
}
```

## Events

### Event response shape

`GET /events`, `GET /events/:id`, `POST /events`, `PATCH /events/:id`, `DELETE /events/:id` all return the same event object shape:

```json
{
  "id": "uuid",
  "title": "Courtyard meetup",
  "description": "Bring coffee and stories",
  "startsAt": "2026-05-28T18:00:00.000Z",
  "endsAt": "2026-05-28T20:00:00.000Z",
  "status": "ACTIVE",
  "visibility": "NEIGHBORHOOD",
  "capacity": 10,
  "lat": 43.2389,
  "lng": 76.8897,
  "addressText": "Central courtyard",
  "createdAt": "2026-05-26T12:00:00.000Z",
  "updatedAt": "2026-05-26T12:00:00.000Z",
  "distanceKm": 0.245,
  "creator": {
    "id": "uuid",
    "email": "host@example.com",
    "role": "USER",
    "displayName": "Host User",
    "avatarUrl": null
  },
  "tags": [
    {
      "id": "uuid",
      "slug": "music",
      "name": "Music"
    }
  ],
  "participants": {
    "joinedCount": 2,
    "waitlistCount": 1,
    "items": [
      {
        "userId": "uuid",
        "role": "HOST",
        "status": "JOINED",
        "joinedAt": "2026-05-26T12:00:00.000Z"
      }
    ]
  }
}
```

Notes:

- `distanceKm` is `null` unless `lat` and `lng` were provided in list query
- `participants.items` currently contains all participant rows, including `LEFT`

### `GET /events`

Public endpoint. Returns event list with pagination metadata.

Query params:

- `lat?: number`
- `lng?: number`
- `radiusKm?: number` from `0.1` to `100`
- `startsFrom?: ISO date string`
- `startsTo?: ISO date string`
- `tag?: string`
  - can be tag `slug`
  - can also be tag `id`
- `status?: EventStatus`
- `limit?: number` from `1` to `100`
- `offset?: number` from `0`

Rules:

- `lat` and `lng` must be sent together
- `radiusKm` requires both `lat` and `lng`
- default status filter is `ACTIVE`
- sorting is:
  1. distance ascending if coordinates are provided
  2. `startsAt` ascending

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "items": [],
    "total": 0,
    "limit": 20,
    "offset": 0
  }
}
```

Common errors:

- `400` invalid coordinates, invalid date, invalid limit/offset

### `GET /events/:id`

Public endpoint. Returns one event by UUID.

Common errors:

- `404` event not found
- `400` invalid UUID

### `POST /events`

Protected endpoint. Creates an event. Creator is automatically added as `HOST`.

Request body:

```json
{
  "title": "Courtyard meetup",
  "description": "Bring coffee and stories",
  "startsAt": "2026-05-28T18:00:00.000Z",
  "endsAt": "2026-05-28T20:00:00.000Z",
  "visibility": "NEIGHBORHOOD",
  "capacity": 10,
  "lat": 43.2389,
  "lng": 76.8897,
  "addressText": "Central courtyard",
  "tagIds": ["uuid", "uuid"]
}
```

Validation:

- `title` min length: `3`
- `endsAt` must be greater than `startsAt`
- `capacity` min: `1`, max: `10000`
- `lat` / `lng` must be valid coordinates
- `tagIds` max length: `10`, unique, UUID only

Common errors:

- `401` missing token
- `400` invalid payload
- `400` one or more tags do not exist

### `PATCH /events/:id`

Protected endpoint. Only creator or `ADMIN` can update.

Request body: any subset of create fields.

Notes:

- when `tagIds` is sent, it fully replaces the event tags
- omitted fields are not changed

Common errors:

- `401` missing token
- `403` not creator and not admin
- `404` event not found
- `400` invalid payload

### `DELETE /events/:id`

Protected endpoint. Only creator or `ADMIN` can cancel.

Important:

- this is not hard delete
- backend sets `status = CANCELLED`

Response returns the updated event object.

Common errors:

- `401`
- `403`
- `404`

### `POST /events/:id/join`

Protected endpoint. Adds current user to event.

Rules:

- cannot join `CANCELLED` or `FINISHED`
- duplicate active participation is rejected
- if capacity is full, user gets `WAITLIST`
- if user previously left, existing row is reused and status is updated

Response `201`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "eventId": "uuid",
    "userId": "uuid",
    "role": "MEMBER",
    "status": "JOINED",
    "joinedAt": "2026-05-26T12:00:00.000Z"
  }
}
```

Common errors:

- `401`
- `404` event not found
- `409` already joined
- `409` cannot join cancelled or finished event

### `POST /events/:id/leave`

Protected endpoint. Marks participant as `LEFT`.

Rules:

- host cannot leave own event
- leaving a `JOINED` spot promotes the earliest `WAITLIST` user to `JOINED`

Response `201`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "eventId": "uuid",
    "userId": "uuid",
    "role": "MEMBER",
    "status": "LEFT",
    "joinedAt": "2026-05-26T12:00:00.000Z"
  }
}
```

Common errors:

- `401`
- `404` event not found
- `409` user is not an active participant
- `409` host cannot leave their own event

## Reports

### Report response shape

`POST /reports` returns a single report record.

`GET /reports` returns paginated items with related reporter / target entities.

### `POST /reports`

Protected endpoint. Creates a report for event or user.

Request body:

```json
{
  "targetType": "EVENT",
  "targetId": "uuid",
  "reason": "Need moderator review"
}
```

Validation:

- `targetType` must be `EVENT` or `USER`
- `targetId` must be UUID
- `reason` min length: `5`

Rules:

- `targetId` must exist for the selected `targetType`
- duplicate active report from the same reporter to the same target is rejected
- active statuses for duplicate detection: `OPEN`, `REVIEWING`

Common errors:

- `401`
- `404` target event or user not found
- `409` duplicate active report
- `400` validation error

### `GET /reports`

Protected endpoint for `ADMIN` only.

Query params:

- `status?: ReportStatus`
- `targetType?: ReportTargetType`
- `page?: number` default `1`
- `limit?: number` default `20`, max `100`

Response `200`:

```json
{
  "status": "success",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

Common errors:

- `401`
- `403` not admin

### `PATCH /reports/:id/status`

Protected endpoint for `ADMIN` only.

Request body:

```json
{
  "status": "RESOLVED"
}
```

Allowed statuses:

- `OPEN`
- `REVIEWING`
- `RESOLVED`
- `REJECTED`

Common errors:

- `401`
- `403`
- `404` report not found
- `400` invalid status

## Frontend notes

- Use `/auth/login` or `/auth/register` to get JWT, then keep it in client storage.
- For protected requests send `Authorization: Bearer <token>`.
- To create report for an event, frontend should send `targetId`, not `targetEventId`.
- To build an events page, the minimal flow is:
  1. `GET /tags`
  2. `GET /events`
  3. optional `POST /events/:id/join`
  4. optional `POST /events/:id/leave`
  5. optional `POST /reports`
- `DELETE /events/:id` should be treated in UI as cancel event, not as hard deletion.
