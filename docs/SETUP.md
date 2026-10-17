# Setup

Clout City: Hollywood Music has its own Supabase project and its own Vercel project, separate from Clout City
NYC, so player data never mixes.

## 1. Supabase (the database and sign-in)
1. At https://supabase.com create a new project, for example `clout-city-hollywood`. Pick a strong database
   password and keep it in your password manager.
2. **SQL editor:** run each file in `supabase/migrations/` in order (`0001_…`, `0002_…`). Every pull request that
   adds a migration says which files to run. Never edit a file that has been run; new rules come as new files.
3. **Project settings → API:** copy the **Project URL** and the **anon (publishable) key** for Vercel. The
   **service role key** is secret: it goes in Vercel only, never in the code or a chat.
4. Sign-in settings (email code, Google, the email template) are added in v0.1 step 2.

## 2. Vercel (the website and previews)
1. At https://vercel.com, **Add New → Project**, import `internova0x-stack/cloutcityhollywood`. Framework: Next.js
   (detected).
2. **Environment variables** (Production and Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`: the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the anon (publishable) key
   - `SUPABASE_SERVICE_ROLE_KEY`: the service role key (secret)
   - `NEXT_PUBLIC_SITE_URL`: the live address once you have one, e.g. `https://music.cloutcity.app`
3. Deploy. Every pull request then gets its own preview link in the PR.

Without the Supabase variables the site still runs (the guest pages work; sign-up says accounts aren't on yet).

## 3. Local development (optional)
`npm install`, then `npm run dev`. Checks: `npm run typecheck`, `npm test`, `npm run build`, and
`npm run test:db` (runs every migration and the SQL tests on a throwaway local Postgres; needs Postgres 15+).
