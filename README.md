# studioNeo

A Next.js (App Router) studio site with membership tiers, a generative-art gallery, a creator upload studio and a custom authentication stack (email OTP, passkeys/WebAuthn, TOTP, Google & Microsoft OAuth). Hosted on Azure Static Web Apps with Azure Database for MySQL, Blob Storage and Communication Services.

> **University project.** All products, memberships and payments are **mock**. Stripe runs in simulated mode only; no real payments are ever processed.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create the database schema with [scripts/schema.sql](scripts/schema.sql).

## Environment Configuration

Use [.env.example](.env.example) as the complete variable checklist. `.env.local` is ignored by Git and must never be committed.

For Azure Static Web Apps, add the same variables under **Static Web App -> Configuration -> Application settings**. At minimum, production requires:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_STORAGE_CONTAINER_NAME`
- `AUTH_SESSION_SECRET`, `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_TTL_SECONDS`
- `AZURE_COMMUNICATION_CONNECTION_STRING`, `ACS_SENDER_EMAIL` (OTP and studio notification emails)
- `CONTACT_NOTIFY_EMAIL` (inbox that receives contact-form inquiries)
- `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`
- `APP_URL` and `NEXT_PUBLIC_APP_URL`

Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the deployed HTTPS hostname without a trailing slash, and set `WEBAUTHN_RP_ID` to that hostname only, without `https://` or a port. Register these callback URLs with the OAuth providers:

```text
https://<your-static-app-host>/api/auth/oauth/google/callback
https://<your-static-app-host>/api/auth/oauth/microsoft/callback
```

The GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN_ORANGE_GLACIER_0274E2E00` is separate from application settings. It must contain the current deployment token generated from the matching Azure Static Web App resource.

### Behaviour when services are not configured

| Service | If unset |
|---|---|
| Database (`DB_*`) | Development only: falls back to an in-memory store. In production, queries fail. |
| Azure Storage | Download URLs are simulated (`mock_sas=true`). |
| ACS email | OTP codes are printed to the server console; contact notifications are skipped. |
| Stripe (`STRIPE_*`) | Intended mode. Checkout is simulated and the tier is auto-fulfilled. |

## Contact form protection

`/api/contact` is protected without any third-party keys: a hidden honeypot field, a minimum time-to-submit check (3 s), and a per-IP rate limit (5 submissions per 10 minutes). Inquiries are stored in the `inquiries` table (a DB failure returns an error) and forwarded to `CONTACT_NOTIFY_EMAIL` through Azure Communication Services.

## Diagnostics & Testing

```bash
# Run local environment and database diagnostic audit
npm run diagnose

# Run automated cryptographic security, WebAuthn & SAS token test suite
npm test
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
