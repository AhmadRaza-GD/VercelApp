# Atomic — Unity Release Intelligence

A four-step Unity CI/CD pipeline tool with atomic PR enforcement, built for GameDistrict AI-Thon 2026.

**No API key required. Runs entirely client-side.**

---

## What it does

A complete release intelligence workflow for Unity game studios:

| Step | Panel | What it does |
|------|-------|-------------|
| 1 | **PR Agent** | Analyses Unity PRs by game system (Player, Enemy, UI, Shop...). Approves atomic PRs, blocks mixed ones, generates release hypotheses. Includes force-approve override toggle. |
| 2 | **Commits** | Living knowledge base of all merged PRs — system, score, hypothesis, timestamp. |
| 3 | **Release Agent** | Checks whether all merged PRs form a clean atomic release or a mixed bundle. Verdict: safe to ship or attribution unclear. |
| 4 | **CI/CD Pipeline** | Push Build button with 6 animated pipeline steps. Shows a blocking warning modal if Release Agent detected mixed systems. Tracks release history. |

---

## Deploy to Vercel (2 minutes)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: atomic unity release intelligence"
git remote add origin https://github.com/YOUR_USERNAME/atomic-unity.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. No environment variables needed
4. Click **Deploy**

Vercel auto-detects Next.js — no config needed beyond `vercel.json`.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech stack

- **Next.js 14** — React framework
- **Zero dependencies** beyond Next.js — all logic is vanilla JS
- **No API calls** — runs entirely in the browser
- **Vercel** — zero-config deployment

---

## Game systems detected

Player · Enemy · UI / HUD · Shop · Inventory · Camera · Audio · VFX / Shaders · Physics · Level / World · Performance · Build / Config

---

**GameDistrict · AI-Thon 2026 · Ahmad Raza, Development, CoreTeam**
