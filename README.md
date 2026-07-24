# ClipForge

India's clip trading floor — a two-sided marketplace where brands post
clipping campaigns and clippers get paid per verified view.

## Current state

- **`backend/`** — a real, runnable Spring Boot app. `auth` (register/login/
  refresh, JWT) and `campaigns` (create/browse/get) are fully implemented
  and compile. `clips`, `wallet`, `payments`, and `storage` are designed
  but not yet built — see `backend/README.md` for the exact next steps.
- **`frontend/`** — Next.js app (JavaScript, from the earlier prototyping
  pass). Currently uses mock data with a fallback pattern; wiring it to
  the real backend endpoints above is the next integration step once more
  backend modules exist.

This is a **learning-by-building checkpoint**, not a finished product —
the point right now is getting `auth` and `campaigns` actually running,
tested against a real Postgres, before adding more surface area.

## Quick start

**1. Backend:**
```bash
cd backend
docker compose up -d          # Postgres + Redis
mvn spring-boot:run           # http://localhost:8080
```
Full instructions, curl examples, and admin account setup: `backend/README.md`

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

## Opening in VS Code

Open the **repo root** (not `backend/` or `frontend/` individually) — the
`.vscode/` folder at the root has:
- `extensions.json` — recommends the Java + Spring Boot extension packs, prompted automatically on open
- `launch.json` — F5 to run/debug the backend directly
- `settings.json` — hides `target/`, `.next/`, `node_modules/` from the file explorer

## Architecture reference

The full system design (all 12 phases: business requirements, architecture,
database schema, wireframes, complete API specs for every module, payments
integration, auth details) was worked through before this repo was
scaffolded. This repo implements Phases 1–8's `auth` and `campaigns`
modules as real, compiling code — everything else in those phases
(clips, wallet, payments, storage) is specified but not yet built.
