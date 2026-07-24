# ClipForge Backend

Spring Boot 3.3 / Java 21 / Maven. This is a **runnable slice**, not the
full Phase 1–8 spec: only the `auth` and `campaigns` modules are wired up
and compiling. `clips`, `wallet`, `payments`, and `storage` are designed
(see the conversation this repo came from) but not yet implemented here —
see "What's next" below for the exact sequencing.

## Prerequisites

- **Java 21** (`java -version` to check). Install via [SDKMAN](https://sdkman.io/) if needed: `sdk install java 21-tem`
- **Maven** (or use the included wrapper once generated — see below)
- **Docker Desktop** (for Postgres + Redis via docker-compose)
- **VS Code** with the **Extension Pack for Java** and **Spring Boot Extension Pack** (this repo's `.vscode/extensions.json` will prompt you to install these automatically when you open the folder)

## First-time setup

### 1. Start Postgres + Redis
```bash
cd backend
docker compose up -d
```
Confirm they're healthy: `docker compose ps` — both should show `healthy`.

### 2. Generate the Maven wrapper (recommended, one-time)
If you don't already have Maven installed globally, generate the wrapper so `./mvnw` works without a system-wide Maven install:
```bash
mvn -N wrapper:wrapper
```
If you do have Maven installed, skip this and just use `mvn` directly in the commands below.

### 3. Run the app
```bash
mvn spring-boot:run
```
or in VS Code: open the folder, wait for the Java extension to finish indexing (bottom-right progress bar), then press **F5** (uses the `launch.json` already configured in `.vscode/`).

The API is now running at `http://localhost:8080`. Flyway will have automatically created the schema in your `clipforge` Postgres database — check the startup logs for `Successfully applied 1 migration`.

### 4. Verify it's alive
```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

## Try the actual API

```bash
# Register a creator
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@test.com","password":"password123","displayName":"Test Creator","role":"CREATOR"}'

# Save the accessToken from the response, then create a campaign
curl -X POST http://localhost:8080/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"name":"Test Campaign","cpmPaise":25000,"budgetTotalPaise":10000000,"allowedPlatforms":["INSTAGRAM"]}'

# Browse campaigns (public, no auth needed)
curl http://localhost:8080/api/campaigns
```

## Create your admin account

There's no public signup path for admins by design. Instead:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--seed-admin --email=you@clipforge.com --password=changeme123"
```
Then log in normally via `POST /api/auth/login` with those credentials.

## Running tests
```bash
mvn test
```
Note: `ClipForgeApplicationTests` loads the full Spring context against your docker-compose Postgres, so the containers need to be running first.

## Project structure
```
src/main/java/com/clipforge/
├── ClipForgeApplication.java
├── common/
│   ├── config/SecurityConfig.java       JWT filter chain, CORS, password encoder
│   ├── exception/                        Global exception handling, typed exceptions
│   ├── security/                          JwtService, JwtAuthFilter, UserPrincipal, RefreshToken
│   └── cli/AdminSeeder.java               One-time admin account creation
├── users/                                 User, CreatorProfile, ClipperProfile entities
├── auth/                                   register/login/refresh
└── campaigns/                              create/browse/get, budget-spend logic

src/main/resources/
├── application.yml                        Dev config — DB, JWT, CORS settings
└── db/migration/V1__init_schema.sql       Flyway migration (source of truth for schema)
```

## What's next (in the order it should be built)

1. **`clips` module** — submission + review, including the atomic
   "approve → record spend → write ledger entry" transaction. Needs the
   `wallet` module's `LedgerService` to exist first, or at least a stub.
2. **`wallet` module** — the append-only `ledger_entries` table and
   `LedgerService`. This is the one to build carefully; it's the financial
   source of truth for the whole platform.
3. **`payments` module** — Razorpay Orders (campaign funding) and
   RazorpayX Payouts (clipper withdrawals), plus webhook handlers. Get a
   Razorpay sandbox account before starting this one.
4. **`storage` module** — S3/Cloudflare R2 pre-signed upload URLs for
   campaign assets.
5. Redis is already running via docker-compose but nothing uses it yet —
   first real use will be rate limiting on `/api/auth/login` and
   `/api/auth/register` (brute-force/fake-account protection).

Each of these follows the exact same pattern already established in
`auth` and `campaigns`: `Entity → Repository → DTO → Service (business
rules) → Controller (thin, delegates to service)`, with a matching
`V2__...sql`, `V3__...sql` Flyway migration per module.

## Common issues

- **`Flyway migration checksum mismatch`** — you edited an already-applied
  migration file. Never edit a migration once it's run against your local
  DB; add a new `V2__...sql` instead, or run `docker compose down -v` to
  wipe the local DB and start clean (dev-only, obviously never do this
  against a real database).
- **`Connection refused` on startup** — Postgres isn't up yet. Run
  `docker compose ps` to confirm, or `docker compose up -d` again.
- **VS Code shows red squiggles everywhere but `mvn spring-boot:run`
  works fine** — the Java extension hasn't finished indexing yet, or needs
  a reload. Command Palette → "Java: Clean Java Language Server Workspace".
