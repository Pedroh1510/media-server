# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS media server that automates anime torrent management. It scrapes RSS feeds from sources like Nyaa, Erai, AnimeTosho, and Moe; processes them through BullMQ queues; and manages downloads via qBittorrent.

## Commands

```bash
# Development
npm run start:dev          # NestJS with hot reload (port 3033)
npm run build              # Compile TypeScript

# Infrastructure (requires Docker)
npm run services:up        # Start PostgreSQL, Redis, qBittorrent
npm run services:down      # Stop services

# Database
npm run migration:push     # Push Prisma schema to DB (uses .env.development)

# Tests
npm run test:nest          # All tests (unit + integration)
npm run test:ci            # Unit tests only, sequential (for CI)
npm run test:nest:coverage # With coverage report

# Run a single test file
npx jest --config jest.config.ts src/domain/adm/adm.service.spec.ts

# Lint
npm run lint               # ESLint with auto-fix
```

## Architecture

### Module Structure

- **`src/domain/`** — Business logic, split by domain:
  - `adm/` — Admin operations: torrent management (list, stop, delete), CSV import/export, tag management
  - `extractor/` — RSS feed scrapers (Nyaa, Erai, AnimeTosho, Moe, N8N) and scan job coordination
  - `rss/` — RSS feed storage and retrieval
  - `status/` — Health check endpoint
  - `shared/` — Cross-domain services: CSV, XML, torrent parsing, image download

- **`src/infra/`** — Infrastructure adapters:
  - `database/` — Prisma service and module
  - `service/bittorrent.service.ts` — qBittorrent client wrapper (`@ctrl/qbittorrent`)

- **`src/jobs/`** — BullMQ queue processors and cron-based scheduler:
  - `Anime process` — Processes individual anime RSS entries
  - `Adm Anime` — Admin-triggered anime jobs
  - `Scan process` — Periodic RSS scan jobs

### Key Patterns

- **Queue flow**: `QueueSchedulerService` triggers scans → `ScanQueueProcessor` → `ExtractorService` → `AnimeQueueProcessor` downloads torrents
- **BittorrentService** is in `infra/service/` (not domain) since it's an external integration
- **Mocks**: `src/__mocks__/` contains mocks for `parse-torrent` and `@ctrl/qbittorrent` used in unit tests
- **Integration tests** live in `tests/` and run against real services (60s timeout)
- **Unit tests** live alongside source files as `*.spec.ts` inside `src/`

### Infrastructure Dependencies

Services defined in `src/infra/docker/compose.yml`:
- PostgreSQL 16 on port 5432
- Redis 7 on port 6379
- qBittorrent (WebUI on port 8080, downloads at `./media`)

### Environment

Config loaded from `.env.local` → `.env.development` → `.env` (in priority order).

Required env vars: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `url_torrent`, `user_torrent`, `pass_torrent`.

### Swagger / BullBoard

- API docs: `http://localhost:3033/docs`
- Queue dashboard: `http://localhost:3033/queues`
