# Store Keeper — Client

Multi-branch retail and inventory management dashboard. This repository is the **web front end** only: a Next.js App Router application that consumes a REST API contract, authenticates through Supabase, and ships a bundled mock API so the UI can run standalone.

> The backend (NestJS + Prisma + Postgres + Supabase) lives in a sibling project, `store-keeper/server`. The authoritative front-end specification for this app is [`BUILD.md`](./BUILD.md); it defines the design system, API contract, and sprint plan that the code follows.

---

## Table of contents

- [At a glance](#at-a-glance)
- [Feature modules](#feature-modules)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running without a backend (bundled mock API)](#running-without-a-backend-bundled-mock-api)
- [Authentication and security](#authentication-and-security)
- [API layer](#api-layer)
- [Client data layer](#client-data-layer)
- [Design system](#design-system)
- [Routes](#routes)
- [Workspace registration (3-step flow)](#workspace-registration-3-step-flow)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Verification status](#verification-status)
- [Known gaps](#known-gaps)
- [Conventions](#conventions)
- [References](#references)

---

## At a glance

| Concern | Choice |
|---|---|
| Framework | Next.js `16.4.2` (App Router, Turbopack, `cacheComponents` + `partialPrefetching` enabled) |
| UI runtime | React `19.3.0` |
| Language | TypeScript, `strict: true`, path alias `@/*` → project root |
| Styling | Tailwind CSS v4 (HSL CSS variables + `@theme`), no `tailwind.config.ts` |
| Components | Hand-rolled shadcn/ui-style primitives on Radix UI |
| Forms | React Hook Form + Zod resolver |
| Server state | TanStack Query v5 |
| Client state | Zustand (cart + UI only) |
| Auth | Supabase via `@supabase/ssr` (cookie sessions, no custom JWTs) |
| Charts | Recharts |
| Icons / dates / toasts | lucide-react / date-fns / sonner |
| Package manager | bun `1.3.14` (pinned via `packageManager`) |

Screens: login, 3-step workspace registration, dashboard, sales list, new sale (POS), stock, products, categories, analytics, branches, users.

---

## Feature modules

| Module | Route | Highlights |
|---|---|---|
| **Auth** | `/login`, `/register` | Email/password sign-in via Server Action; 3-step tenant onboarding wizard |
| **Dashboard** | `/dashboard` | KPI cards with deltas, revenue vs profit area chart, recent sales, low-stock banner |
| **Sales / POS** | `/sales`, `/sales/new` | Cart store, barcode/search entry, payment dialog, receipts, void/cancel |
| **Inventory** | `/stock` | Per-branch stock levels, stock-in, signed adjustments, ledger drawer |
| **Products** | `/products` | Table with search/filter/pagination, image upload (Cloudinary), variant + dynamic attributes |
| **Categories** | `/categories` | Tree view plus a dynamic attribute-schema builder |
| **Analytics** | `/analytics` | Profit & loss, top products, dead stock, stock valuation, CSV/PDF export with async polling |
| **Branches** | `/branches` | CRUD for operating branches |
| **Team** | `/users` | Invites, global roles, per-branch access management |

The app shell (`app/(dashboard)/layout.tsx`) adds a 240 px sidebar, a sticky topbar with an operating-branch selector, a `⌘K` command palette, and an offline indicator.

---

## Getting started

### Prerequisites

- **Node.js 20+** — verified on Node `v24.5.0`
- **bun 1.3.14** (recommended; the repository includes `bun.lock`) — npm/pnpm also work
- Python is *not* required by this app

### Install and run

```bash
bun install
cp .env.example .env.local     # then edit values
bun dev                        # http://localhost:3000
```

Production build:

```bash
bun run build
bun run start
```

> **Next.js 16 caveat.** This version has breaking changes relative to older App Router releases — request APIs such as `params`/`searchParams` are async, middleware is now `proxy.ts`, and `next lint` is removed (use ESLint directly). Read the installed guides in `node_modules/next/dist/docs/` before making framework-level changes; `AGENTS.md` restates this rule for coding agents.

---

## Environment variables

Copy [`.env.example`](./.env.example) to `.env.local`. Environment files are git-ignored (`.env*`, except `.env.example`), so no credentials are committed.

| Variable | Required | Default when unset | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Browser: `/api/v1` · Server: `http://localhost:3000/api/v1` | Base URL of the REST API (including the version segment) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | `https://placeholder-storekeeper.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | `placeholder-anon-key` | Supabase anon key (public by design) |

All three are optional only because the app degrades to a development fallback. For real behavior, set all of them.

Typical values:

```bash
# Against the real NestJS backend
NEXT_PUBLIC_API_URL=http://localhost:4000/v1

# Against the bundled mock routes (see next section)
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Running without a backend (bundled mock API)

`app/api/v1/[...route]/route.ts` is a single catch-all route handler that implements the REST contract with an in-memory dataset, so the UI is fully explorable with no external services.

Covered resources: `auth/me`, `branches`, `branches/:id/stock`, `branches/:id/stock-in`, `branches/:id/adjustments`, `branches/:id/ledger`, `branches/:id/sales`, `sales/:id` (+ `cancel`, `payments`), `products`, `categories`, `users` (+ invite, branch access), `exports`, `analytics/*`, `health`, `health/ready`.

Sales created through the mock are stored as `COMPLETED` immediately; there is no `confirm` or `receipt` route, so the two contract endpoints for those are unimplemented locally.

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Behavior to be aware of:

- Data is **in-memory and resets on every server restart** — it is a fixture, not a database.
- The mock does **not** validate the CSRF header or the bearer token. Authorization is likewise not enforced. Never treat it as a security boundary.
- The login Server Action includes a development fallback: while Supabase is still using placeholder credentials, any email/password combination signs in by setting a `dev_auth_session` cookie. The login screen exposes three seeded accounts (Owner, Admin, Cashier) as one-click fills.

---

## Authentication and security

Supabase handles identity; the app adds no custom JWT logic.

| Piece | File | Behavior |
|---|---|---|
| Session refresh + route guards | [`proxy.ts`](./proxy.ts) | Refreshes the Supabase session on every request; redirects unauthenticated users from protected prefixes to `/login?redirect=…`; redirects authenticated users away from `/login` to `/dashboard` |
| Browser client | [`lib/supabase/client.ts`](./lib/supabase/client.ts) | `createBrowserClient` |
| Server client | [`lib/supabase/server.ts`](./lib/supabase/server.ts) | `createServerClient` with a `next/headers` cookie adapter |
| Login action | [`app/(auth)/login/actions.ts`](<./app/(auth)/login/actions.ts>) | `signInWithPassword`, then issues the CSRF cookie; returns `{ ok }` or `{ error }` |

Protected prefixes: `/dashboard`, `/products`, `/categories`, `/stock`, `/sales`, `/analytics`, `/branches`, `/users`.

**CSRF (double-submit cookie).** On successful sign-in the action sets `csrf_token` — deliberately **not** `httpOnly`, `SameSite=Lax`, 7-day TTL, `Secure` in production. [`lib/api.ts`](./lib/api.ts) echoes it as `X-CSRF-Token` on every non-GET request; the API is expected to compare the two. The bundled mock does not enforce this.

**Session expiry.** A `401` from the API triggers exactly one `refreshSession()` retry. If the refresh fails, the browser is sent to `/login`.

> Route protection in `proxy.ts` is a navigation guard, not the authorization boundary. The API must authorize sensitive reads and mutations server-side.

---

## API layer

Every response uses one envelope:

```jsonc
// success
{ "success": true, "message": "…", "data": { }, "meta": { } }

// failure
{ "success": false, "message": "…", "errors": [{ "field": "sku", "code": "DUPLICATE_CODE", "message": "…" }] }
```

Two wrappers encapsulate transport:

- [`lib/api.ts`](./lib/api.ts) — `apiFetch<T>()` for Client Components. Attaches `Authorization: Bearer <supabase access token>`, adds the CSRF header on mutations, uses `credentials: "include"`, retries once after a session refresh on `401`, normalizes pagination (`meta.pagination.*` is also lifted onto `meta.*`), and throws a typed **`ApiError`** carrying `status`, `code`, `message`, and `errors[]`.
- [`lib/api-server.ts`](./lib/api-server.ts) — `apiFetchServer<T>()` for Server Components and Server Actions, reading cookies via `next/headers`.

Usage:

```ts
import { apiFetch, ApiError } from "@/lib/api";

try {
  const { data, meta, message } = await apiFetch<Product[]>("/products", {
    params: { page: 1, limit: 20 },
  });
} catch (error) {
  if (error instanceof ApiError && error.status === 409) {
    toast.error(error.message); // e.g. duplicate SKU
  }
}
```

All entities and DTOs are typed in [`types/api.ts`](./types/api.ts) (`Branch`, `UserItem`, `Category`, `Product`, `StockItem`, `StockLedgerEntry`, `Sale`, `Payment`, `ExportJob`, `CurrentUser`, pagination and envelope types, plus role/status unions).

### API surface

Base: `${NEXT_PUBLIC_API_URL}`. Auth: Supabase bearer token. Mutations: `X-CSRF-Token`.

| Resource | Endpoints |
|---|---|
| Auth | `GET /auth/me` |
| Users | `GET /users`, `POST /users/invite`, `PATCH /users/:id`, `DELETE /users/:id`, `POST /users/:id/branches`, `PATCH`/`DELETE /users/:id/branches/:branchId` |
| Branches | `GET /branches`, `POST /branches`, `GET`/`PATCH`/`DELETE /branches/:id` |
| Categories | `GET /categories?tree=true`, `POST /categories`, `GET`/`PATCH`/`DELETE /categories/:id` |
| Products | `GET /products`, `POST /products`, `GET`/`PATCH`/`DELETE /products/:id`, `POST /products/:id/image/sign` |
| Stock | `GET /branches/:branchId/stock`, `GET /branches/:branchId/stock/:productId`, `POST /branches/:branchId/stock-in`, `POST /branches/:branchId/adjustments`, `GET /branches/:branchId/ledger` |
| Sales | `GET`/`POST /branches/:branchId/sales`, `GET`/`PATCH /sales/:id`, `POST /sales/:id/{confirm,cancel,payments}`, `GET /sales/:id/receipt` |
| Analytics | `GET /analytics/{sales-summary,profit-loss,top-products,dead-stock,stock-valuation}` |
| Exports | `POST /exports`, `GET /exports/:id`, `GET /exports` |
| Health | `GET /health`, `GET /health/ready` |

> `POST /auth/register` (tenant onboarding) does **not** exist in the contract yet. See [Workspace registration](#workspace-registration-3-step-flow).
>
> The bundled mock implements sale `cancel` and `payments`; it has no `confirm` or `receipt` route (sales are created already `COMPLETED`).

---

## Client data layer

### TanStack Query

Configured once in [`components/providers/query-provider.tsx`](./components/providers/query-provider.tsx): `staleTime` 30 s, `gcTime` 5 min, `refetchOnWindowFocus: false`, `retry: 2` with exponential backoff (capped at 30 s).

Query keys are scoped so mutations invalidate narrowly — never the root cache:

| Key | Hook | Invalidated by |
|---|---|---|
| `["me"]` | `use-me` | — |
| `["branches"]` | `use-branches` | branch mutations |
| `["users"]` | `use-users` | invite / update / branch-access mutations |
| `["categories", { tree }]` | `use-categories` | category mutations |
| `["products", filters]`, `["product", id]` | `use-products` | product mutations |
| `["stock", branchId, filters]` | `use-stock` | stock-in, adjustments |
| `["ledger", branchId, filters]` | `use-ledger` | stock mutations |
| `["sales", branchId, filters]`, `["sale", id]` | `use-sales` | sale confirm/cancel/payment |
| `["analytics", type, branchId, …]` | `use-analytics` | stock and sales mutations |
| — | `use-export-polling` | polls `GET /exports/:id` until `COMPLETED`/`FAILED` |

### Zustand

Client state is intentionally limited to two stores: [`stores/cart.ts`](./stores/cart.ts) (POS cart) and [`stores/ui.ts`](./stores/ui.ts) (sidebar, mobile menu, command palette, active branch).

### Forms

Every form uses React Hook Form with a Zod schema from [`lib/schemas/index.ts`](./lib/schemas/index.ts) (`loginSchema`, `branchSchema`, `inviteUserSchema`, `productSchema`, `stockInSchema`, `paymentSchema`, `registerTenantSchema`, …). Field state is never kept in `useState`; inline errors render beneath the field.

---

## Design system

Defined in [`app/globals.css`](./app/globals.css) as HSL custom properties exposed through Tailwind v4's `@theme`.

| Token | Value | Use |
|---|---|---|
| `--background` | `0 0% 98%` | Page canvas |
| `--card` | `0 0% 100%` | Cards and panels |
| `--foreground` | `240 10% 4%` | Primary text |
| `--muted-foreground` | `240 4% 46%` | Secondary text |
| `--border` / `--input` | `240 6% 90%` | Hairlines, field borders |
| `--primary` | `160 84% 39%` (emerald) | Accent, primary actions, focus ring |
| `--destructive` | `0 84% 60%` | Errors and destructive actions |
| `--radius` | `0.5rem` | Base corner radius |

Style direction (per `BUILD.md`): Vercel-like — neutral, dense, structural. Thin borders, no gradients, no shadows on flat cards, emerald used sparingly.

- **Typography:** Inter for UI (`--font-sans`), JetBrains Mono for figures (`--font-mono`), both loaded with `next/font/google`.
- **Numerals:** the `.num` utility (mono + `tabular-nums`) is mandatory for every number, SKU, currency amount, and code.
- **Scale:** page titles `text-2xl font-semibold tracking-tight`; KPI values `text-3xl font-semibold num`; labels `text-xs`; helper/error text `text-[11px]`.
- **Layout metrics:** 240 px fixed sidebar, 56 px sticky blurred topbar, content `max-w-350` with `p-4 sm:p-6` and `space-y-6`.
- **Density:** `h-9` inputs and default buttons, dense `h-10` table rows, `p-5`/`p-6` card padding.
- **Dark mode:** a `.dark` token block exists, but there is **no theme switcher** — the app renders light only until one is added.

### Component inventory

| Group | Components |
|---|---|
| `components/ui` | `alert-dialog`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `separator`, `sheet`, `skeleton`, `stepper`, `table`, `tabs` |
| `components/layout` | `sidebar`, `topbar`, `command-palette`, `offline-indicator`, `kpi-card` |
| `components/features` | `auth/register-wizard`, `branches/branch-form`, `categories/attribute-schema-builder`, `products/{product-form, product-detail-sheet, product-image-upload}`, `sales/{payment-dialog, sale-detail-sheet}`, `stock/{stock-in-dialog, adjustment-dialog, ledger-drawer}`, `users/{invite-user-form, branch-access-manager}` |
| `components/providers` | `query-provider` |

Formatting helpers live in [`lib/formatters.ts`](./lib/formatters.ts): `formatCurrency` (BDT via `Intl.NumberFormat("en-BD")`, ৳) and `formatDate` (relative under 24 h, absolute otherwise).

---

## Routes

| Path | File | Type | Guarded |
|---|---|---|---|
| `/` | `app/page.tsx` | Server — redirects to `/dashboard` | — |
| `/login` | `app/(auth)/login/page.tsx` | Client + Server Action | Redirects away when authenticated |
| `/register` | `app/(auth)/register/page.tsx` | Client wizard (prerendered) | No |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Client | Yes |
| `/sales` | `app/(dashboard)/sales/page.tsx` | Client | Yes |
| `/sales/new` | `app/(dashboard)/sales/new/page.tsx` | Client | Yes |
| `/stock` | `app/(dashboard)/stock/page.tsx` | Client | Yes |
| `/products` | `app/(dashboard)/products/page.tsx` | Client | Yes |
| `/categories` | `app/(dashboard)/categories/page.tsx` | Client | Yes |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | Client | Yes |
| `/branches` | `app/(dashboard)/branches/page.tsx` | Client | Yes |
| `/users` | `app/(dashboard)/users/page.tsx` | Client | Yes |
| `/api/v1/[...route]` | `app/api/v1/[...route]/route.ts` | Route Handler (mock API) | No |
| — | `app/error.tsx`, `app/not-found.tsx` | Error boundary / 404 | — |

Error handling conventions: `401` → refresh then `/login`; `403` → generic "no permission" toast (never reveal the required role); `409` → specific toast (e.g. duplicate SKU); `429` → rate-limit toast; `5xx` → generic failure toast.

---

## Workspace registration (3-step flow)

`/register` onboards a new tenant in three steps, then issues the owner account and first branch.

| Step | Title | Fields |
|---|---|---|
| 1 | Business | Business name, workspace URL (auto-slugged, editable), business type, default currency |
| 2 | Owner | Full name, work email, password + confirmation (with live requirement checks), OWNER notice |
| 3 | First branch | Branch name, branch code (auto-derived, max 10), optional phone and address, plus a review summary before submission |

Implementation: [`components/features/auth/register-wizard.tsx`](./components/features/auth/register-wizard.tsx) (client), [`app/(auth)/register/actions.ts`](<./app/(auth)/register/actions.ts>) (Server Action), [`components/ui/stepper.tsx`](./components/ui/stepper.tsx) (reusable stepper), and `registerTenantSchema` in [`lib/schemas/index.ts`](./lib/schemas/index.ts).

Behavior: each step validates only its own fields before advancing; the step heading receives focus on transition for screen-reader context; the stepper is an ordered list marking the active step with `aria-current="step"`; completed steps double as "go back" buttons; Enter advances until the final step, where it submits.

> **Current limitation.** No tenant-registration endpoint exists in the API contract, so the action cannot persist anything. It validates server-side and then:
> - **development** — returns `{ ok: true, demo: true }`; the success panel states plainly that nothing was saved;
> - **production** — returns an explicit "not available yet" error rather than faking success.
>
> To complete the feature, add the real request in `registerTenantAction`; the wizard requires no changes. The payload it validates maps to `{ tenant: { name, slug, businessType, currency }, owner: { fullName, email, password, globalRole: "OWNER" }, primaryBranch: { name, code, address, phone } }`.

---

## Project structure

```
.
├── app/
│   ├── (auth)/                 login, register (route group, no shell)
│   ├── (dashboard)/            authenticated screens + shell layout
│   ├── api/v1/[...route]/      bundled mock REST API
│   ├── layout.tsx              fonts, providers, Toaster
│   ├── globals.css             design tokens, .num utility
│   ├── error.tsx, not-found.tsx
│   └── page.tsx                redirect → /dashboard
├── components/
│   ├── ui/                     primitives (Radix + Tailwind)
│   ├── layout/                 sidebar, topbar, command palette, KPI card
│   ├── features/               domain forms, dialogs, sheets
│   └── providers/              TanStack Query provider
├── hooks/                      use-me, use-branches, use-users, use-categories,
│                               use-products, use-stock, use-ledger, use-sales,
│                               use-analytics, use-export-polling
├── lib/
│   ├── api.ts                  browser fetch wrapper + ApiError
│   ├── api-server.ts           server fetch wrapper
│   ├── supabase/{client,server}.ts
│   ├── schemas/index.ts        all Zod schemas
│   ├── formatters.ts           BDT currency, dates
│   └── utils.ts                cn()
├── stores/                     cart.ts, ui.ts (Zustand)
├── types/api.ts                entities, DTOs, envelopes
├── proxy.ts                    session refresh + route guards
├── next.config.ts
└── BUILD.md                    front-end specification (design + contract)
```

---

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Development server on `:3000` (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint (flat config; `next lint` was removed in Next 16) |
| `npx tsc --noEmit` | Type check without emitting |

---

## Verification status

Documented against revision **`f2f87fd`** (`feat: add branch role management and update api mock routes and client hooks`) plus the uncommitted registration work described above. Documentation drifts; re-run these commands rather than trusting this section.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed |
| `bun run lint` | 0 errors; 65 warnings — 64 pre-existing (unused imports, `react-hooks/incompatible-library` on RHF `watch()`), 1 from the registration wizard's `watch()` |
| `bun run build` | Passed; 14 route entries in the build output, `/register` prerendered as static |
| Registration flow (manual, headless Chrome over CDP) | Step gating, validation, auto-slug/code, keyboard Enter, review, demo success state verified |
| Automated tests | **None exist** — no test runner, no `test` script, no CI workflows |

---

## Known gaps

- **No automated tests.** `BUILD.md` calls for Vitest + React Testing Library (and Playwright end-to-end); neither is installed. There are no CI workflows (`.github` is git-ignored).
- **Tenant registration is UI-only** — the endpoint does not exist yet (see above).
- **The bundled mock API enforces no auth or CSRF**, and loses all data on restart.
- **No theme switcher** despite dark-mode tokens being defined.
- **`Select` renders blank while closed** unless `SelectValue` receives explicit children — a Radix quirk affecting about a dozen files (`product-form`, `payment-dialog`, …). The registration wizard works around it; the rest still show an empty trigger until a value is chosen.
- **Currency is hard-wired to BDT** in `formatCurrency`, even though the registration flow collects a preferred currency.
- **Repository name is not a valid npm package name** (`"store keeper client"` in `package.json` includes spaces).
- **No license file** is present.

---

## Conventions

From [`BUILD.md`](./BUILD.md), binding for new work:

- Server Components by default; `"use client"` only where interactivity or client state is required.
- Never call `fetch` directly — go through `lib/api.ts` or `lib/api-server.ts`; never hardcode API URLs.
- Never invent API endpoints; never put tokens in `localStorage`/`sessionStorage`.
- Forms: React Hook Form + Zod only; no `useState` for field values.
- Invalidate specific query keys, never the whole cache.
- Every mutation shows a toast using the API's `message`; every list has a skeleton and a non-empty empty state.
- Use the design tokens (no default shadcn colors), Tailwind only (no inline styles), `next/image` instead of `<img>`, and `.num` for all figures.
- TypeScript strict, no `any`.

---

## References

- [`BUILD.md`](./BUILD.md) — design system, API contract, sprint plan, acceptance criteria
- [`AGENTS.md`](./AGENTS.md) — rule to consult the installed Next.js docs before framework changes
- `.env.example` — environment template
- Next.js docs bundled with this install: `node_modules/next/dist/docs/`
