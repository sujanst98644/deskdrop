# Deskdrop — Student Marketplace

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma 7 + PostgreSQL, Better Auth, Zod 4.
**Tooling:** Bun.

Single Next.js app — no workspaces, no Turborepo. Everything lives under `src/`.

---

## 📁 Structure

```
deskdrop/
├── prisma/
│   ├── schema.prisma            ← users + Better Auth tables + marketplace models
│   └── seed.ts                  ← demo categories, users, listings
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/sign-in, sign-up
│   │   ├── (marketplace)/browse
│   │   ├── (dashboard)/sell, dashboard/listings, dashboard/orders
│   │   ├── listings/[id], sellers/[id]
│   │   ├── api/auth/[...all]    ← Better Auth handler
│   │   └── api/upload-auth      ← ImageKit signed upload params
│   ├── components/              ← ui/, layout/, home/, browse/, listings/, orders/
│   ├── db/index.ts              ← Prisma client singleton (import as `@/db`)
│   ├── lib/
│   │   ├── auth.ts              ← Better Auth server instance
│   │   ├── auth-client.ts       ← Better Auth React client
│   │   ├── auth-guard.ts        ← getSession() / requireSession()
│   │   ├── actions/             ← server actions (listing, order, upload)
│   │   ├── validations/         ← shared Zod schemas
│   │   ├── browse.ts, utils.ts
│   └── proxy.ts                 ← optimistic session-cookie route guard
├── components.json
├── docker-compose.yml           ← local Postgres
├── prisma.config.ts             ← Prisma 7 config (schema path + datasource URL)
├── eslint.config.mjs, next.config.js, postcss.config.js, tsconfig.json
└── package.json
```

Import aliases: `@/db` for the Prisma client, `@/lib/validations` for Zod schemas,
`@/lib/auth-guard` for session access. One schema, one set of validation rules.

---

## 🚀 Get running

1. **Install Bun** if you don't have it:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start Postgres** (or point `DATABASE_URL` at any Postgres you already have):

   ```bash
   docker compose up -d
   ```

4. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` → the docker-compose default already matches `.env.example`
   - `BETTER_AUTH_SECRET` → run `openssl rand -base64 32` and paste the output
   - `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` → `http://localhost:3000`

   _Optional:_ ImageKit keys for image uploads.

5. **Generate the Prisma client and create the database schema:**

   ```bash
   bun run db:generate
   bun run db:migrate
   ```

   `db:migrate` runs `prisma migrate dev` — it writes a migration into
   `prisma/migrations/` and applies it. Commit those files. Use `db:push` only
   for throwaway schema experiments; it does not record a migration.

6. **Seed demo data:**

   ```bash
   bun run seed
   ```

   Demo login: `asha@test.com` / `password123` (admin: `admin@test.com`).

7. **Run the dev server:**

   ```bash
   bun run dev
   ```

   Open http://localhost:3000.

8. **Add more shadcn/ui components** (run from the repo root):

   ```bash
   bunx shadcn@latest add dialog skeleton tabs
   ```

   If it asks to overwrite `globals.css` / `tailwind.config.ts`, say **no** — the
   existing ones are already wired with the Deskdrop theme.

---

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Next dev server |
| `bun run build` / `bun run start` | Production build / serve |
| `bun run lint` | ESLint over the whole repo |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:generate` | Regenerate the Prisma client |
| `bun run db:migrate` | `prisma migrate dev` — create + apply a migration (dev) |
| `bun run db:deploy` | `prisma migrate deploy` — apply pending migrations (prod/CI) |
| `bun run db:status` | Show which migrations are applied vs. pending |
| `bun run db:reset` | Drop the database, replay migrations, reseed (**destroys data**) |
| `bun run db:push` | Push the schema without a migration (throwaway dev only) |
| `bun run db:studio` | Prisma Studio GUI |
| `bun run seed` | Seed demo data |

---

## Auth notes

Better Auth owns the `users`, `sessions`, `accounts` and `verifications` tables.
Credentials are hashed by Better Auth and stored on the **Account** row — the
`User` model has no password column.

- **Server:** `auth` in `src/lib/auth.ts`; read a session with `getSession()` or
  `requireSession()` from `src/lib/auth-guard.ts`. Server actions and pages call
  these, never the raw API.
- **Client:** `signIn` / `signUp` / `signOut` / `useSession` from
  `src/lib/auth-client.ts`. There is no session provider to wrap the tree —
  Better Auth's React client keeps session state in a shared store.
- **Proxy:** `src/proxy.ts` (Next 16's rename of `middleware.ts`) only checks
  that a session *cookie* exists, which is an optimistic redirect, not
  authorization. Every protected page and action still verifies the session
  server-side.

---

## Stack notes

- **Tailwind 4** — no `tailwind.config.ts`. The theme lives in
  `src/app/globals.css` as `@theme inline` tokens; dark mode is a
  `@custom-variant` keyed off the `.dark` class that `next-themes` sets.
- **Prisma 7** — the datasource URL comes from `prisma.config.ts`, not the
  schema, and the client runs on the `@prisma/adapter-pg` driver adapter. Keep
  the `prisma` CLI pinned to the same 7.x line as `@prisma/client`: the 8.x CLI
  is a ground-up rewrite with a different command set (no `generate`,
  `db push`, or `migrate`) and will not drive this schema.
- **Zod 4** — string formats are top-level (`z.email()`, `z.url()`), and
  `ZodError` exposes `.issues`. Because `priceRs` is coerced, the listing schema
  has distinct input and output types (`ListingFormValues` / `ListingInput`).
