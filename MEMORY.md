# Medscope — Project Memory

## Key decisions

- **Product**: exam-recall question bank for NPMCN / WACP / WACS / Primaries
  (chosen after user described "question bank where Nigerian doctors that want
  to take primaries will see questions and answers in their different
  department")
- **Reference site**: revisemedquestionbank.com — landing page mirrors its
  structure and copy (hero, question card, features, Free Resources,
  how-it-works, reviews, FAQ, footer)
- **Colors**: turquoise and white (client instruction)
- **Pricing**: Monthly ₦12,000/mo, Annual ₦10,000/yr — annual is cheaper
  *on purpose* as an incentive to subscribe yearly; framed as
  "save ₦134,000 a year"
- **Auth**: localStorage demo mode so the full journey works without keys;
  `src/lib/auth.tsx` is the seam to swap in Supabase
- **Data**: `src/lib/store.ts` persists per-user bookmarks/attempts/mocks in
  localStorage; weak areas + leaderboard derive from real activity

## Environment notes

- Node 22 on this machine has a broken OpenSSL (npm fetch fails with
  ERR_SSL_CIPHER_OPERATION_FAILED). Node 24 LTS was downloaded and is now
  the system `node` (v24.21.0). If npm breaks again, check `node -v`.
- npm registry was switched to npmmirror (npm config set registry).
- Dev server is started detached via PowerShell Start-Process so it survives
  tool timeouts; logs at `C:\Users\Demo User\Desktop\new\dev.log` / `dev.err`.
- `npx create-next-app` was interrupted mid-install; a full clean
  `rmdir /s /q node_modules` + reinstall was needed to fix ENOTEMPTY errors.

## Skills

- frontend-design skill installed at
  `~/.config/opencode/skills/frontend-design/SKILL.md`
  (plain copy also at project root `skill.md`)

## Current state (as of build)

- All routes verified 200: `/`, `/signup`, `/login`, `/coverage`,
  `/resources`, `/app`, `/app/questions`, `/app/practice`, `/app/mock`,
  `/app/performance`, `/app/bookmarks`, `/app/resources`, `/app/leaderboard`
- Not done: Paystack checkout, production build, Vercel deploy, GitHub repo,
  demo video
- PRD: `C:\Users\Demo User\Desktop\new\Medscope-PRD.md`
