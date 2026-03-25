# SIGEAC – Sistema de Gestión Aeronáutica Civil

**SIGEAC** is a modern, multi-tenant web platform for managing civil aviation operations. It covers fleet management, inventory control, procurement, quality assurance, staff administration, and real-time reporting — all in one place.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and a **Laravel** backend API.

---

## ✈️ Features

- **Administration** – Aircraft fleet tracking, flight history, routes, and expense management
- **Warehouse / Inventory** – Parts, consumables, and component control across multiple warehouses
- **Purchases** – Full procurement workflow: requisitions → quotes → purchase orders → in-transit tracking
- **Quality Control** – Compliance checklists and inspection management
- **Maintenance** – Maintenance service tracking and history
- **Training** – Course management with calendar view and attendance statistics
- **Reporting** – Operational dashboards, financial summaries, and PDF export
- **System Administration** – Companies, employees, departments, roles, and granular permissions
- **Real-time Notifications** – Live updates via WebSocket (Laravel Reverb / Pusher)
- **Multi-tenant** – Multiple companies with isolated data under the same platform
- **Dark / Light theme** – User-selectable interface theme

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| State management | TanStack React Query, Zustand |
| Forms & validation | React Hook Form, Zod |
| Tables | TanStack React Table |
| Calendar | Schedule-X, React Big Calendar |
| Charts | Recharts |
| Real-time | Laravel Echo, Pusher JS |
| PDF generation | @react-pdf/renderer, pdf-lib |
| QR codes | qrcode.react |
| HTTP client | Axios |
| Animations | Framer Motion |
| Auth | JWT (jose), cookies (js-cookie, nookies) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running instance of the [SIGEAC Backend](https://github.com/transmandu/SIGEAC_Backend) (Laravel API)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url/api

NEXT_PUBLIC_REVERB_APP_KEY=your-reverb-app-key
NEXT_PUBLIC_REVERB_HOST=your-reverb-host
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=ws
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
SIGEAC_Frontend/
├── app/                  # Next.js App Router (pages & layouts)
├── components/           # Reusable UI components (organized by domain)
├── actions/              # Server & client action handlers
├── contexts/             # React contexts (auth, company selection)
├── hooks/                # Custom React hooks (data fetching, authorization)
├── stores/               # Zustand state stores
├── lib/                  # Shared utilities (axios, cookies, sessions, PDF)
├── utils/                # Helper functions
├── providers/            # React context providers
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── middleware.ts         # Route protection middleware
```

---

## 🔐 Authentication & Authorization

- Authentication uses Bearer tokens stored in cookies and sent as `Authorization` headers.
- Role-based access control (RBAC) is enforced both on the frontend (via middleware and hooks) and the backend.
- Route protection is handled in `middleware.ts`.

---

## 📄 License

This project is proprietary software. All rights reserved by **Transmandu C.A.**
