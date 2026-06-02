# Swan Production Programme Approval — Runbook

> **Status: ACTION REQUIRED (human / commercial).** This is the long pole for go-live.
> Swan production approval has a **4–8 week lead time** and gates all real money
> movement. Start this on **day one**, in parallel with engineering Workstreams A & B.
> Nothing in this repo can move real money until this is complete.

This runbook captures everything Atlas must do to take the Swan integration from
sandbox to a live, regulated production programme. The code is already wired for
both modes; the remaining work is commercial, compliance, and a controlled cutover.

---

## 1. Kick-off (week 1)

- [ ] **Open the production programme request** with Swan (account manager / sales).
      State the EMI model, expected volumes, target launch geographies (EEA/SEPA
      first), and the customer profile (digital nomads / cross-border freelancers).
- [ ] Sign the commercial agreement / programme terms.
- [ ] Confirm pricing tier and assign a Swan technical contact.
- [ ] Get access to the Swan **Dashboard (Live)** project, distinct from sandbox.

## 2. Compliance package Swan will require

Swan (as the regulated EMI / ASPSP) owns the licence; Atlas operates as a programme
on top of it. Expect Swan compliance to request:

- [ ] Company KYB documents (incorporation, UBOs, directors).
- [ ] Programme description & customer journey (the onboarding flow in
      `apps/web/src/app/onboarding` + `apps/api/src/modules/onboarding`).
- [ ] AML/CFT policy and responsible person.
- [ ] Terms of Service & Privacy Policy (already aligned to the **EMI safeguarding**
      model — see `apps/web/src/app/terms`, `/privacy`, `/legal`).
- [ ] Risk assessment, target markets, and prohibited-use policy.

### Division of responsibility to confirm in writing with Swan
- [ ] **Transaction monitoring** — confirm Swan performs ongoing AML monitoring and
      what alerts/cases Atlas must action.
- [ ] **Sanctions / PEP screening** — confirm screening at onboarding and on payments,
      and who owns remediation.
- [ ] **SCA** — Swan owns Strong Customer Authentication on payment consents
      (`PaymentProvider.initiatePayment` returns a `consentUrl`). Confirm the
      production consent UX and redirect URLs.
- [ ] **Safeguarding** — confirm safeguarding account arrangements and the exact
      legal wording Atlas must display (must match our copy).
- [ ] **Complaints & dispute** handling responsibilities.

## 3. Engineering cutover checklist (code is ready; flip config only)

All Swan settings are environment-driven (`apps/api/src/config/swan.config.ts`).
Do **not** change application code for the cutover — only secrets/flags.

Switch these from sandbox → production in the production secret store:

- [ ] `SWAN_API_URL=https://api.swan.io`
- [ ] `SWAN_OAUTH_URL=https://oauth.swan.io`
- [ ] `SWAN_CLIENT_ID` / `SWAN_CLIENT_SECRET` (live credentials)
- [ ] `SWAN_PROJECT_ID` (live project)
- [ ] `SWAN_WEBHOOK_SECRET` (live signing secret)
- [ ] `SWAN_SANDBOX=false`

Other production-critical secrets (fail-fast checks live in `apps/api/src/main.ts`):

- [ ] `NODE_ENV=production` (hard-disables `SKIP_AUTH` and the in-memory DB/seed)
- [ ] `JWT_SECRET`, `ENCRYPTION_KEY` (32-byte hex), `DATABASE_URL`, `REDIS_URL`
- [ ] `RESEND_API_KEY` (live email)
- [ ] `SENTRY_DSN`

### Webhooks
- [ ] Register the production webhook endpoint with Swan:
      `POST https://<api-domain>/api/v1/webhooks/swan`.
- [ ] HMAC verification uses the raw request body (already enabled via Fastify
      `rawBody` in `main.ts`; verified in `swan.client.ts`). Confirm the live
      `SWAN_WEBHOOK_SECRET` matches the Swan dashboard.
- [ ] Subscribe to at least: `Account.Updated`, `Transaction.Booked`,
      `Transaction.Pending` (handled in `webhooks.service.ts`, which reconciles
      balances authoritatively from Swan).

### Money-movement gating
- [ ] Multi-currency `convert` is intentionally disabled until a real settlement
      rail exists — it stays guarded by `FX_SETTLEMENT_ENABLED` (see
      `convert.service.ts`). **Do not** set `FX_SETTLEMENT_ENABLED=true` at launch;
      EUR SEPA in/out via Swan is the only live money rail for the pilot.
- [ ] The sandbox top-up simulator (`top-up.service.ts → simulateCredit`) is
      hard-gated off in production; real funding arrives via inbound SEPA →
      `Transaction.Booked` webhook. Verify it returns 403 in production.

## 4. Production verification (after approval, before public launch)

Run the happy path against the **live** Swan project with a small real amount and
internal test users:

- [ ] Sign up → OTP → KYC (live Swan onboarding) → account provisioned with a real IBAN.
- [ ] Inbound SEPA top-up → `Transaction.Booked` webhook → balance reconciles.
- [ ] Outbound SEPA transfer → SCA consent → `Booked` → recipient receives funds.
- [ ] GDPR export & account closure (`gdpr.service.ts`) against a live account.
- [ ] Confirm Sentry receives events and structured logs redact PII/secrets.

## 5. Go / no-go gate

Do not enable public sign-ups until **all** of the following are true:
- [ ] Swan production programme approved and live credentials in the secret store.
- [ ] Live happy-path verification (section 4) passed end-to-end.
- [ ] AML/sanctions responsibility split confirmed in writing.
- [ ] Counsel sign-off on safeguarding copy and customer terms.
- [ ] Incident/on-call and complaints process documented.

---

**Owner:** Founder / Head of Ops + Engineering lead.
**Dependencies blocked by this:** any real customer onboarding or transfer.
**Tracking:** keep this file updated as items complete; this is the single source
of truth for launch readiness on the Swan dependency.
