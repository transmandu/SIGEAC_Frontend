# SIGEAC Frontend

Frontend web application for **SIGEAC**, built with **Next.js (App Router)**.

## Tech Stack

- Next.js 14 / React 18 / TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Axios
- Radix UI (shadcn-style components)

## Requirements

- Node.js **24 LTS** (the hard floor is 22.13, imposed by `pdfjs-dist`; see `.nvmrc`)
- **pnpm** — the repo ships `pnpm-lock.yaml` and declares `packageManager`.
  Install it with `npm i -g pnpm@12`; pnpm then keeps itself on the declared
  version. Do **not** run `npm install`: it would create a second, competing
  lockfile and a different `node_modules` layout.

## Getting Started (Local Development)

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. (Optional) Configure environment variables

   This repository currently does **not** include a `.env.example` in the root.
   If your app requires environment variables (API base URL, auth keys, etc.), create a `.env.local` file:

   ```bash
   # .env.local
   # NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Open:

   - http://localhost:3000

## Available Scripts

- `pnpm dev` — start Next.js dev server (Turbopack)
- `pnpm build` — build for production
- `pnpm start` — run production build
- `pnpm lint` — run ESLint
- `pnpm exec tsc --noEmit` — type-check without building

## Project Structure (high level)

- `app/` — Next.js App Router routes/pages
- `components/` — UI components
- `contexts/` — React contexts
- `hooks/` — custom hooks
- `lib/` — shared helpers/libs
- `providers/` — app-level providers
- `stores/` — Zustand stores
- `types/` — shared TypeScript types
- `utils/` — utilities

## Notes

- To edit the main page, start with `app/page.tsx`.
- If you deploy on Vercel, ensure any required environment variables are configured in the Vercel project settings.

## License

Add license info here (or remove this section if private/internal).