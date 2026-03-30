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

- Node.js 18+ (recommended)
- npm (repo includes `package-lock.json`, so npm is recommended)

## Getting Started (Local Development)

1. Install dependencies:

   ```bash
   npm install
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
   npm run dev
   ```

4. Open:

   - http://localhost:3000

## Available Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — build for production
- `npm run start` — run production build
- `npm run lint` — run linting

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