# Engine-01 — Database & Integrity layer

The data and integrity layer of **Virality Intel**, an AI video virality simulator.
Full project: https://github.com/sayedyahiya18-web/virality_intel-mini_project-

## What's here

### Database
| File | Purpose |
|---|---|
| `prisma/schema.prisma` | PostgreSQL data model (users, simulations, personas, agents, reports…) |
| `database/client.ts` | Prisma client setup |
| `database/seed.ts` | Seed data for local development |
| `database/simulation-repository.ts` | Read/write simulations in the database |
| `services/persistence/*` | Storage layer: browser local storage now, API/database in production |
| `app/api/simulations/*` | Next.js API routes to list, save, load and run simulations |
| `.env.example` | Environment variables (placeholders only — no secrets) |

### Integrity (audit & permissions)
| File | Purpose |
|---|---|
| `lib/platform/audit.ts` | Audit log: records what agents and users did, and when |
| `lib/platform/permissions.ts` | Permission rules: what each agent is allowed to do |
| `app/api/audit/route.ts` | API route to read the audit log |

## Dependencies on the main project
These files are an extract, not a standalone app. They import:
- `@/types` — shared data types (`types/index.ts` in the main project)
- `app/api/simulations/run/route.ts` also uses the simulation engine (`@/lib/simulation/engine`), the LLM client (`@/lib/llm`) and the agent runtime (`@/lib/agents/agent-runtime`)

To run them, use the full project linked above.

## Setup (in the full project)
```bash
cp .env.example .env        # set DATABASE_URL
npx prisma generate
npx prisma db push
npm run db:seed
```

API keys (Groq / Anthropic) go in `.env.local`, which is git-ignored and never committed.
