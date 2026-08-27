# Deskdrop — Student Marketplace (Monorepo)

7-day MVP: sign up → list an item → browse/search → request to buy → seller accepts/completes → item sold.

**Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL, NextAuth.js (Credentials), Zod.
**Tooling:** pnpm workspaces + Turborepo monorepo.

## 📁 Structure

```
deskdrop/
├── apps/
│   └── web/                      ← the Next.js app
│       └── src/
│           ├── app/
│           │   ├── (auth)/sign-in, sign-up
│           │   ├── (marketplace)/browse    ← stub, built out Day 3
│           │   ├── api/auth/[...nextauth]  ← NextAuth handler
│           │   └── api/register            ← credentials sign-up endpoint
│           ├── components/layout/ (Header, Footer), providers.tsx
│           ├── lib/auth.ts, lib/utils/
│           ├── types/next-auth.d.ts
│           └── middleware.ts
├── packages/
│   ├── db/                       ← @deskdrop/db — Prisma schema + client
│   │   └── prisma/schema.prisma, seed.ts
│   └── validators/                ← @deskdrop/validators — shared Zod schemas
└── turbo.json, pnpm-workspace.yaml
```

Both apps and future services (e.g. an admin tool) can import `@deskdrop/db` and `@deskdrop/validators` — one schema, one set of validation rules, shared everywhere.

## 🚀 Get running (~10 min)

1. **Install pnpm** if you don't have it: `npm install -g pnpm`

2. **Install dependencies** (run from the repo root — pnpm links the workspace packages automatically)
   ```bash
   pnpm install
   ```

3. **Create a free Neon Postgres DB** → https://neon.tech (1 min, no card needed). Copy the connection string.

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` → your Neon connection string
   - `NEXTAUTH_SECRET` → run `openssl rand -base64 32` and paste the output

   Prisma and Next.js both read from this root `.env` — no need to duplicate it inside `apps/web`.

5. **Generate the Prisma client and push the schema**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

6. **Seed demo data**
   ```bash
   pnpm seed
   ```
   Demo login after seeding: `asha@test.com` / `password123`

7. **Run the dev server** (Turborepo runs all apps; right now that's just `web`)
   ```bash
   pnpm dev
   ```
   Open http://localhost:3000 — it should redirect to `/browse` and show 3 seeded listings, confirming Prisma is connected end-to-end.

8. **Install shadcn/ui components** (run inside `apps/web`):
   ```bash
   cd apps/web
   pnpm dlx shadcn@latest init
   pnpm dlx shadcn@latest add button card input form select sheet dialog badge skeleton tabs carousel
   ```
   If it asks to overwrite `globals.css` / `tailwind.config.ts`, say **no** — the ones in this repo are already wired with the Deskdrop theme tokens.

9. **Push to GitHub + import into Vercel.** In Vercel's project settings, set the **Root Directory** to `apps/web` (monorepo apps need this) and add `DATABASE_URL` + `NEXTAUTH_SECRET` as environment variables. Vercel auto-detects Turborepo and will build `packages/db` and `packages/validators` first.

## ✅ Day 1 status — what's already built

| Task | Status |
|---|---|
| pnpm + Turborepo monorepo scaffold | ✅ done |
| `packages/db` — Prisma schema (`User`, `Category`, `Listing`, `Order`) + client singleton | ✅ done |
| `packages/validators` — shared Zod schemas (sign up/in, listing, order) | ✅ done |
| NextAuth.js — Credentials provider, Prisma-backed, JWT sessions | ✅ done |
| `/api/register` — sign-up endpoint (hashes password with bcrypt) | ✅ done |
| Middleware protecting `/dashboard`, `/sell` | ✅ done |
| Sign-in / sign-up pages, wired to NextAuth | ✅ done |
| Header (session-aware) / Footer / root layout with dark mode | ✅ done |
| Seed script — 4 categories, 3 users, 3 sample listings | ✅ done |
| `/browse` — live Prisma query rendering seeded listings | ✅ stub — real filters/search built Day 3 |

## 🔜 Still to do today (Day 1 exit check)

- [ ] `pnpm install`, `pnpm db:generate`, `pnpm db:push`, `pnpm seed` all succeed against a real Neon DB
- [ ] `pnpm dev` shows seeded listings at `/browse`
- [ ] Sign up a new test account at `/sign-up`, confirm the header shows your name after refresh, sign out works
- [ ] Deploy to a Vercel preview with Root Directory = `apps/web` and both env vars set
- [ ] shadcn/ui installed in `apps/web` with the Day 2 form components available

Once all boxes are checked, move to **Day 2** (image upload + listing creation) — see the full architecture doc for that spec.

## ⚠️ Scope reminder

Do NOT add: chat/real-time, digital products, payment gateways, favorites, admin UI, email verification, OAuth providers. This is intentional — stay on scope, ship Friday.

## Notes on this stack vs. a single-app setup

- **Why Prisma over raw SQL/Drizzle here:** `prisma db push` + `prisma studio` give the team a GUI to inspect data without touching SQL, which matters when 4 people are moving fast.
- **Why NextAuth Credentials instead of rolling your own:** session cookies, JWT signing, and CSRF protection are handled for you. The trade-off is the `authorize()` callback pattern shown in `lib/auth.ts` — study that file, it's where all the login logic lives.
- **Why a monorepo for a 1-week project:** mainly so `@deskdrop/validators` is the *single* source of truth for what a valid listing/order looks like — the same Zod schema validates the form on the client and the server action, so you can't drift out of sync under time pressure.
