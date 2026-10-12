# Medscope — Project Guide

## What this is

Medscope is a paid exam-recall question bank for Nigerian doctors sitting
postgraduate exams (NPMCN, WACP, WACS, Primaries). Two parts:

1. **Landing page** (`/`) — sells the product, mirrors the structure of
   revisemedquestionbank.com
2. **The app** (`/app/*`) — per-user dashboard, question bank, practise,
   timed mocks, performance, weak areas, bookmarks, Free Resources,
   leaderboard

Assignment: Module 4 "Build and Launch a Product People Will Pay For".
Deadline: 7 October 2026, 11:59 PM WAT. Deliverables: YouTube demo link (LMS),
live link + GitHub repo (group chat).

## Commands

```bash
cd medscope
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

Node 24+ is required (Node 22 on this machine has a broken OpenSSL build).
If `npm install` stalls on Windows, kill node, `cmd.exe /c "rmdir /s /q
node_modules"`, then reinstall.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- No backend yet: auth and per-user data are **demo mode** (localStorage)
  in `src/lib/auth.tsx` and `src/lib/store.ts`
- Planned: Supabase (auth + Postgres), Paystack (payments), Vercel (host)

## Structure

```
src/app/
  page.tsx            landing page
  signup/page.tsx     create free account
  login/page.tsx      sign in
  coverage/page.tsx   colleges/faculties + question counts
  resources/page.tsx  public Free Resources page
  app/layout.tsx      app shell (sidebar nav, requires auth)
  app/page.tsx        dashboard (onboarding, stats, weak areas)
  app/questions/      question bank (search + filters)
  app/practice/       practise tab
  app/mock/           timed mock exam (10 Qs / 5 min)
  app/performance/    analytics + weak areas + mock history
  app/bookmarks/      saved questions
  app/resources/      Free Resources in-app
  app/leaderboard/    ranking by best mock score
src/lib/
  auth.tsx            AuthProvider / useAuth (localStorage demo mode)
  store.ts            per-user bookmarks, attempts, mocks, weak areas, leaderboard
  questions.ts        15 real-style recall questions (seed data)
src/components/auth-form.tsx  shared signup/signin form
```

## Conventions

- Palette: turquoise (`teal-500` #14b8a6 family) and white — per client
- Prices: Monthly ₦12,000/mo, Annual ₦10,000/yr (annual framed as
  "save ₦134,000"), Free = 10 questions/month
- Client components start with `"use client"`; server components by default
- Path alias `@/*` → `./src/*`
- Copy tone: plain verbs, sentence case, active voice

## TODO (in order)

1. Paystack checkout (test mode) on pricing/subscribe buttons
2. `npm run build` + fix any production issues
3. Deploy to Vercel (CLI deploy works without GitHub)
4. Create GitHub repo and push
5. Seed more questions (aim 50+)
6. Record demo video: landing → problem → signup → app → features → pricing
