# PR Review Agent — GameDistrict AI-Thon 2026

A live demo app that demonstrates the **Atomic PR Review Agent** — an AI that enforces single-purpose pull requests for game studios.

Built with Next.js + Anthropic Claude. Deployable to Vercel in under 2 minutes.

---

## What it does

Paste any GitHub PR (title, commit message, description, changed files) and the agent will:

- **Classify** every changed file into a category (Economy, UI, Balance, Ads, Performance, Bug Fix, etc.)
- **Detect** if multiple categories are bundled in a single PR
- **Block** mixed PRs with a clear explanation
- **Approve** atomic PRs and auto-generate a release hypothesis
- **Warn** on vague commit messages
- **Score** the PR's atomicity from 0–100

---

## Deploy to Vercel (2 minutes)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: PR review agent demo"
git remote add origin https://github.com/YOUR_USERNAME/pr-review-agent-demo.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repo
3. In **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
4. Click **Deploy**

That's it. Vercel auto-detects Next.js — no build config needed.

---

## Run locally

```bash
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## File taxonomy enforced

| Path prefix | Category |
|---|---|
| `economy/` | Economy |
| `ui/`, `components/`, `styles/` | UI |
| `balance/` | Balance |
| `ads/`, `monetization/` | Ads |
| `perf/`, `performance/` | Performance |
| `analytics/` | Analytics |
| `core/`, `engine/` | Core |
| `tests/`, `*.test.*` | Tests |
| `fix/`, `hotfix/` | Bug Fix |

---

## Tech stack

- **Next.js 14** — React framework with API routes
- **Anthropic Claude** (claude-sonnet-4) — PR analysis agent
- **Vercel** — zero-config deployment

---

## Part of

**GameDistrict AI-Thon 2026**  
*Release less, learn more — atomic releases and a shared intelligence layer for GameDistrict*  
Ahmad Raza · Development · CoreTeam
