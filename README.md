# Auriga Money

A neobank for people who live and earn across borders. EUR IBAN in under a minute, virtual Mastercard instantly.

## Architecture

```
auriga-money/
├── apps/
│   ├── web/          # Next.js 15 (App Router) — landing + app
│   └── api/          # NestJS + Fastify — BFF / API gateway
├── packages/
│   ├── provider-contracts/  # Provider abstraction interfaces
│   └── shared/              # Shared types, validation, constants
└── turbo.json
```

### Key design decisions

- **Provider abstraction layer**: Swan is the EMI rail, but all product code depends on interfaces (`AccountProvider`, `CardProvider`, `OnboardingProvider`, `PaymentProvider`), never on Swan types directly. Adding Airwallex (phase 2 FX) means implementing the interface — no product code changes.
- **Reconciliation read-model**: Balances and transactions in our DB are a cache/projection. Swan is always authoritative. We never hold funds.
- **PCI out-of-scope**: Card PANs are never stored or transmitted by Auriga. Card details render via Swan's secure/tokenised components only.

## Prerequisites

- Node.js >= 20
- PostgreSQL 15+
- Redis 7+
- Swan sandbox credentials (register at [docs.swan.io](https://docs.swan.io))

## Getting started

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start the database
docker run -d --name auriga-db -p 5432:5432 \
  -e POSTGRES_USER=auriga -e POSTGRES_PASSWORD=auriga -e POSTGRES_DB=auriga_bank \
  postgres:15

# Start Redis
docker run -d --name auriga-redis -p 6379:6379 redis:7

# Run both apps in development
npm run dev
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:4000`.

API documentation (Swagger) is available at `http://localhost:4000/api/docs`.

## Project structure

### `apps/web` — Frontend (Next.js)

| Route | Purpose |
|-------|---------|
| `/` | Landing page (marketing, SEO) |
| `/onboarding` | Sign-up → KYC → IBAN reveal → card (hero flow) |
| `/login` | Passwordless login |
| `/dashboard` | Account home, balance, transactions |
| `/card` | Virtual/physical card, wallet, controls |
| `/send` | SEPA credit transfer |
| `/settings` | Profile, security, documents |
| `/support` | FAQ + contact |

### `apps/api` — Backend (NestJS)

| Module | Responsibility |
|--------|---------------|
| `auth` | Passwordless OTP, session tokens |
| `onboarding` | Orchestrates sign-up → KYC → account + card creation |
| `accounts` | Balance, transactions, reconciliation |
| `cards` | Issue, freeze, wallet provisioning |
| `payments` | SEPA credit transfer (with SCA consent) |
| `webhooks` | Swan event processing (idempotent, persisted) |
| `providers/swan` | Swan GraphQL API integration |

### `packages/provider-contracts`

TypeScript interfaces that define the contract between product code and banking providers:

- `OnboardingProvider` — create/track KYC onboarding
- `AccountProvider` — create account, get balance, list transactions
- `CardProvider` — issue/freeze/cancel cards, wallet provisioning
- `PaymentProvider` — initiate SEPA transfers, track consent

## Regulatory notes

- Auriga is **not a bank**. Banking services are provided by Swan SAS (ACPR-licensed EMI).
- Customer funds are safeguarded per EU e-money regulations.
- Auriga is PCI out-of-scope by design.
- GDPR: data minimisation, encrypt PII at rest, processor agreement with Swan.
- Strong Customer Authentication (SCA/PSD2) is handled by Swan.

## Environment variables

See `apps/api/.env.example` for the full list. Critical secrets (Swan credentials, JWT secret) must use a managed secrets store in production — never commit real credentials.

## Build sequence

1. **Week 0** (parallel): Swan commercial + compliance conversation; engage fintech counsel
2. **Week 1**: Scaffold complete; Swan sandbox OAuth; landing page
3. **Week 2**: Onboarding flow + KYC against sandbox; IBAN reveal
4. **Week 3**: Dashboard + transactions + webhooks; virtual card + wallet
5. **Week 4**: Send/receive, settings, polish; internal demo on sandbox
6. **Then**: Swan programme approval → limited pilot → production

## License

Proprietary. All rights reserved.
