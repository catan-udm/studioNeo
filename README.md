This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Configuration

Use [.env.example](.env.example) as the complete variable checklist. Copy it to `.env.local` for local development and replace every sample value with a real credential. `.env.local` is ignored by Git and must never be committed.

For Azure Static Web Apps, add the same variables under **Static Web App -> Configuration -> Application settings**. At minimum, production requires:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`, `AZURE_STORAGE_CONTAINER_NAME`
- `AUTH_SESSION_SECRET`, `AUTH_SESSION_COOKIE_NAME`, `AUTH_SESSION_TTL_SECONDS`
- `AZURE_COMMUNICATION_CONNECTION_STRING`, `ACS_SENDER_EMAIL`
- `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`
- `APP_URL` and `NEXT_PUBLIC_APP_URL`

Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the deployed HTTPS hostname without a trailing slash, and set `WEBAUTHN_RP_ID` to that hostname only, without `https://` or a port. Register these callback URLs with the OAuth providers:

```text
https://<your-static-app-host>/api/auth/oauth/google/callback
https://<your-static-app-host>/api/auth/oauth/microsoft/callback
```

The GitHub Actions secret `AZURE_STATIC_WEB_APPS_API_TOKEN_ASHY_MUSHROOM_07675A400` is separate from application settings. It must contain the current deployment token generated from the matching Azure Static Web App resource.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
