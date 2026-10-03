# Webhook Delivery System

A reliable, at-least-once webhook delivery service — the kind of infrastructure Stripe, GitHub, and Shopify run internally to notify external systems about events. Built to explore distributed systems reliability patterns: async job processing, retries, idempotency, and failure isolation.

## Why this exists

Sending a webhook sounds simple — `POST` some JSON to a URL. But doing it *reliably* is hard: subscriber endpoints go down, time out, or misbehave, and a naive synchronous implementation blocks your whole API waiting on them. This project builds that reliability layer from scratch.

## Architecture

```
Client
  │
  ▼
POST /events ──────► API (Express)
  │                     │
  │                     ├─ saves event
  │                     ├─ finds matching subscribers (fan-out)
  │                     └─ queues one job per subscriber
  │                          │
  │                          ▼
  │                     Redis Queue (BullMQ)
  │                          │
  │                          ▼
  │                     Worker (separate process)
  │                          ├─ fetches event + subscriber
  │                          ├─ signs payload (HMAC-SHA256)
  │                          ├─ POSTs to subscriber URL
  │                          ├─ on failure: retries with exponential backoff
  │                          ├─ on exhausted retries: dead-letters + AI failure summary
  │                          └─ tracks consecutive failures → auto-pauses dead subscribers
  │
  ▼
GET /deliveries, /deliveries/:id, /deliveries/:id/replay
```

The API responds immediately after queuing — it never waits on the actual HTTP delivery. Delivery, retry, and failure handling all happen independently in the worker process.

## Features

- **Subscriber management** — register a URL + event types, get a server-generated signing secret
- **Event-driven fan-out** — one event routes to every matching, active subscriber
- **Async delivery via queue** (Redis + BullMQ) — API never blocks on subscriber latency
- **Retry with exponential backoff** — up to 5 attempts, increasing delay between each
- **Delivery state tracking** — every attempt updates a single row (`pending → success` or `pending → failed → dead_letter`), full history queryable
- **Dead-letter handling** — permanently failed deliveries marked distinctly after retries exhaust
- **HMAC-SHA256 signing** — every payload signed with the subscriber's own secret (`X-Signature` header) so they can verify authenticity
- **Idempotency key** — stable `X-Idempotency-Key` per delivery, lets subscribers dedupe retried requests
- **Circuit breaker** — after 3 consecutive dead-letters, a subscriber is auto-paused (`active: false`), stopping wasted delivery attempts to dead endpoints
- **AI failure summaries** — when a delivery dead-letters, Gemini generates a plain-English explanation of the likely cause, stored alongside the delivery record
- **Query & replay API** — filter/paginate delivery history, manually replay any delivery
- **Layered architecture** — repository → service → controller → route, consistent across every domain
- **Tested** — Jest unit tests (schema validation) + Supertest integration tests, isolated test database
- **Containerized** — full stack (API, worker, Postgres, Redis) runs via `docker-compose up`

## Tech stack

Node.js · Express · TypeScript · PostgreSQL · Prisma · Redis · BullMQ · Zod · Winston · Jest/Supertest · Docker · Gemini API

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/webhooks` | Register a subscription (`url`, `events[]`) |
| GET | `/webhooks` | List all subscriptions |
| POST | `/events` | Publish an event, triggers fan-out delivery |
| GET | `/deliveries` | List deliveries (filter by `status`, `subscriptionId`) |
| GET | `/deliveries/:id` | Get a single delivery record |
| POST | `/deliveries/:id/replay` | Manually re-queue a delivery for retry |

## Running locally

**With Docker (recommended):**
```bash
docker-compose up --build
```

**Manually:**
```bash
npm install
npx prisma migrate dev
npm run dev              # API server, terminal 1
npx tsx src/worker.ts    # Worker, terminal 2
```

Requires a `.env` file — see `.env.example` for required variables (`DATABASE_URL`, `REDIS_URL`, `GEMINI_API_KEY`, `PORT`).

## Testing

```bash
npm test
```
Runs schema validation tests and API integration tests against an isolated test database (`.env.test`).

## What I'd add next

- Half-open circuit breaker state (auto health-check paused subscribers instead of requiring manual reactivation)
- Public-facing UUIDs instead of sequential integer IDs
- Horizontal worker scaling behind a load test to get real throughput numbers
