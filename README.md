# Reeltrail

Reeltrail is a standalone Reddit browsing client focused on an ordered, fullscreen video feed. It runs as a separate web application, outside Reddit, and is not a Devvit app or an official Reddit product.

## Current features

- Select a subreddit by name or link, and browse r/popular.
- Hot, New, Top, and Rising sorting; time ranges for Top. The feed endpoint also accepts Controversial, which is not exposed in the current interface.
- Filter listings into a video queue while preserving Reddit post order.
- Fullscreen playback and vertical swipe navigation, plus keyboard controls.
- Reddit HLS playback with sound where supported, direct MP4/WebM playback, and links to original posts/comments.
- Pinned subreddits, sound controls, and optional automatic advance.
- Cursor pagination and user-visible API errors.

Text and image-only posts are skipped. Unsupported externally hosted videos open on their original sites. There is no general image-gallery browsing mode.

## Status

Early functional prototype. Queue tests and TypeScript checks have passed. Live Reddit API access, end-to-end playback, and mobile browser interactions still need verification with approved credentials. Credential possession alone does not demonstrate Reddit approval. Future work is validation and compatibility fixes; no additional feature roadmap is promised.

## Local setup

Requires Node.js 22.13 or newer and pnpm 11.25.0 (the version declared in package.json).

```sh
pnpm install --frozen-lockfile
cp .env.example .dev.vars
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Place the generated value after SESSION_KEY= in the ignored .dev.vars file. Keep it private. The app reads this value as a Cloudflare Worker binding; .env.example is a template, not an automatically loaded configuration file.

```sh
pnpm dev
```

Use the loopback URL printed by the server (normally http://localhost:5173). Visit `/signin-with-chatgpt?return_to=/` to establish the starter's local development identity. This mock identity is for local development only. Select **Connect Reddit** and enter the approved Reddit app's client ID, app type, Reddit username, and client secret when required. These are runtime inputs, not source configuration.

```sh
node --test lib/media.test.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

The production build previews through a Cloudflare Worker. Built previews do not simulate ChatGPT sign-in. The deployed app relies on Sites authentication and private access controls; another hosting platform requires an equivalent trusted authentication integration. Secure session cookies may require a trusted localhost browser context or HTTPS for live connection testing.

## Environment variables and credentials

| Name | Required | Purpose |
| --- | --- | --- |
| SESSION_KEY | Yes for connection/session operations | 64 hexadecimal characters representing a private random 32-byte AES-GCM encryption key. Configure as a Worker secret in production. |

Reddit client credentials are entered through the connection form. The server exchanges them for app-only access tokens. It encrypts session credentials and tokens into an HttpOnly, Secure, SameSite=Strict cookie bound to the authenticated user. It does not implement Reddit account login, voting, commenting, posting, or private-account feed access. Disconnect clears the app cookie.

Never commit .env files, .dev.vars, passwords, access tokens, private keys, or real client secrets. Never expose SESSION_KEY in client-side environment variables. Changing this key invalidates existing sessions.

## Reddit API review

This application uses Reddit OAuth token exchange and read-only subreddit listing requests to construct an ordered video feed. Source entry points:

- `app/api/connect/route.ts`: validates connection input and starts an encrypted session.
- `lib/reddit-session.ts`: token exchange, renewal, session encryption, and authorization.
- `app/api/feed/route.ts`: sorted listing requests and pagination.
- `lib/media.mjs`: video extraction without changing listing order.
- `app/page.tsx`: feed controls and player interface.

Reddit content is not bundled in the repository. Playback uses media URLs returned by Reddit. API availability and permitted use depend on Reddit's approval and applicable terms; this repository does not claim approval.

A private repository requires reviewer access before Reddit can inspect it. Repository creation does not grant Reddit access automatically.

## Project structure

`app/` contains the React interface and server routes; `lib/` contains session and media logic; `components/` contains UI components. `build/`, `scripts/`, and `.openai/hosting.json` preserve the Sites/Vinext runtime configuration. The original starter documentation is retained in [docs/STARTER.md](docs/STARTER.md). Optional database examples are inherited scaffolding and are not used by Reeltrail.

No redesign or unrelated feature changes are included in this export.
