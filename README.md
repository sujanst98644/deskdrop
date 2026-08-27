# Deskdrop — Student Marketplace (Monorepo)

**Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma + PostgreSQL, NextAuth.js (Credentials), Zod.  
**Tooling:** Bun + Turborepo monorepo.

---

## 📁 Structure

```
deskdrop/
├── apps/
│   └── web/                         ← Next.js app
│       └── src/
│           ├── app/
│           │   ├── (auth)/sign-in, sign-up
│           │   ├── (marketplace)/browse   ← stub (built Day 3)
│           │   ├── api/auth/[...nextauth] ← NextAuth handler
│           │   └── api/register           ← credentials sign-up
│           ├── components/layout/ (Header, Footer), providers.tsx
│           ├── lib/auth.ts, lib/utils/
│           ├── types/next-auth.d.ts
│           └── middleware.ts
├── packages/
│   ├── db/                          ← @deskdrop/db — Prisma schema + client
│   │   └── prisma/schema.prisma, seed.ts
│   └── validators/                  ← @deskdrop/validators — shared Zod schemas
├── .env                             ← root environment (copied into packages/db for Prisma)
├── .env.example
├── bun.lock
├── package.json                     ← defines workspaces and scripts
├── turbo.json
└── README.md
```

Both apps and future services can import `@deskdrop/db` and `@deskdrop/validators` — one schema, one set of validation rules, shared everywhere.

---

## 🚀 Get running (~10 min)

1. **Install Bun** if you don't have it:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Install dependencies** (from repo root – Bun automatically links workspace packages):

   ```bash
   bun install
   ```

3. **Create a free Neon Postgres DB** → [neon.tech](https://neon.tech) (1 min, no card). Copy the connection string.

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` → your Neon connection string
   - `NEXTAUTH_SECRET` → run `openssl rand -base64 32` and paste the output
   - `NEXTAUTH_URL` → `http://localhost:3000` (or your production URL)

   _Optional:_ Add ImageKit keys for later (see Day 2).

5. **Make Prisma see the environment**
   Because Prisma runs inside `packages/db`, it won't see the root `.env` automatically.  
   Copy it into the package:

   ```bash
   cp .env packages/db/.env
   ```

6. **Generate Prisma client and push the schema**

   ```bash
   bun run db:generate
   bun run db:push
   ```

7. **Seed demo data**

   ```bash
   bun run seed
   ```

   Seeded admin login: `admin@test.com` / `admin123` (or check `seed.ts` for the actual credentials).

8. **Run the dev server**

   ```bash
   bun run dev
   ```

   Open http://localhost:3000 – it should redirect to `/browse` and show seeded listings, confirming Prisma is connected end‑to‑end.

9. **Install shadcn/ui components** (run inside `apps/web`):
   ```bash
   cd apps/web
   bunx shadcn@latest init
   bunx shadcn@latest add button card input form select sheet dialog badge skeleton tabs carousel
   cd ../..
   ```
   If it asks to overwrite `globals.css` / `tailwind.config.ts`, say **no** — the existing ones are already wired with the Deskdrop theme.

## Notes on This Stack vs. a Single‑App Setup

- **Why Prisma over raw SQL/Drizzle here:** `prisma db push` + `prisma studio` give the team a GUI to inspect data without touching SQL, which matters when 4 people are moving fast.
- **Why NextAuth Credentials instead of rolling your own:** session cookies, JWT signing, and CSRF protection are handled for you. The trade‑off is the `authorize()` callback pattern shown in `lib/auth.ts` — study that file, it's where all the login logic lives.
- **Why a monorepo for a 1‑week project:** mainly so `@deskdrop/validators` is the _single_ source of truth for what a valid listing/order looks like — the same Zod schema validates the form on the client and the server action, so you can't drift out of sync under time pressure.
- **Why `.env` is copied into `packages/db`:** Prisma runs inside the workspace and doesn't see the root `.env` by default. We copy it during setup; you can delete the copy after seeding, or keep it — it's harmless and already in `.gitignore`.
