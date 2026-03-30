# JobMatch

**Paste a job description. Get a brutal honest analysis in 30 seconds.**

Built by [Javier Olivieri](https://devlabs.dev) · [DevLabs](https://devlabs.dev)

---

## What it does

JobMatch uses Claude (Anthropic) to cross-reference any job description against your CV and give you a structured, no-flattery fit report — so you know whether to invest time in an application or move on.

Every analysis includes:

- **Skills score** — how well your technical stack maps to what the JD actually requires
- **Strategic score** — whether this role makes sense for your career trajectory, not just your skills
- **Verdict** — one direct sentence: apply, skip, or apply only if X
- **Criteria checklist** — ✅ / ⚠️ / ❌ breakdown across remote eligibility, required skills, gaps, compensation, competition volume, and strategic fit
- **Keyword map** — what the JD asks for that you have (green) vs. what's missing (red)
- **Outreach message** — a ready-to-send LinkedIn DM or email in English and Spanish, personalized with a specific project from your CV

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Vite + React 18 |
| Styling | Inline CSS-in-JS — no UI library |
| AI | Anthropic Claude Sonnet (direct browser API call) |
| Fonts | DM Sans + DM Mono via Google Fonts |
| Deploy | Vercel |

No backend. No database. The Anthropic API is called directly from the browser using the `anthropic-dangerous-direct-browser-access` header. Your API key lives in Vercel environment variables — never in the codebase.

---

## Project structure

```
job-analyzer/
├── index.html              # HTML shell + Google Fonts import
├── vite.config.js          # Vite + React plugin config
├── package.json
├── .env.example            # Template for local env vars
├── CLAUDE.md               # Context file for Claude Code
└── src/
    ├── main.jsx            # React root mount
    └── App.jsx             # Entire application (intentionally single-file)
```

`App.jsx` is intentionally kept as a single file. This is a personal productivity tool — not a design system. Splitting it into components would add friction without benefit.

---

## How the AI analysis works

The app sends two things to Claude Sonnet:

1. The full job description (pasted by the user)
2. The candidate's CV (hardcoded in `MY_CV`, editable in-UI)

Claude responds with a structured JSON object:

```json
{
  "skills_score": 88,
  "strategic_score": 74,
  "verdict": "Apply — strong technical match, confirm compensation before committing.",
  "verdict_type": "apply",
  "summary": "2-3 sentences of honest fit analysis...",
  "checks": [
    { "status": "ok", "label": "Remote eligible", "note": "Argentina is listed explicitly." },
    { "status": "warn", "label": "Compensation not published", "note": "Verify range before final round." }
  ],
  "keywords_match": ["n8n", "agentic workflows", "Next.js"],
  "keywords_gap": ["fine-tuning", "LoRA"],
  "outreach_es": "Ready-to-send message in Spanish...",
  "outreach_en": "Ready-to-send message in English..."
}
```

The system prompt is calibrated to be **brutally honest** — no flattery, no encouragement theater. If the role is a bad fit strategically even when skills match, it says so.

---

## Score logic

| Score | Color | Meaning |
|---|---|---|
| ≥ 80 | 🟢 Green | Strong match |
| 60–79 | 🟡 Yellow | Partial match — read the gaps |
| < 60 | 🔴 Red | Weak match — skip or reconsider |

Skills score and strategic score are independent. A role can score 90 on skills and 30 on strategy (overqualified, wrong direction, low compensation) — and the verdict will reflect that distinction.

---

## Local development

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/job-analyzer.git
cd job-analyzer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
# 4. Start dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Deploy to Vercel

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel
```

**Option B — GitHub import (recommended)**

```bash
git init
git add .
git commit -m "init: job analyzer"
gh repo create job-analyzer --private --push
```

Then go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo. Vercel auto-detects Vite.

**Add the environment variable:**

Vercel dashboard → Settings → Environment Variables:

| Name | Value |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |

Click **Deploy**. Done.

---

## Updating the CV

The candidate CV is stored as a plain text string in `MY_CV` at the top of `src/App.jsx`. Edit it directly to update skills, experience, or positioning.

The CV is also **editable at runtime** — click the "CV — click to edit" toggle in the UI to make per-session modifications without touching the code.

---

## Customizing the analysis

The AI behavior is controlled entirely by `SYSTEM_PROMPT` in `App.jsx`. The prompt instructs Claude to:

- Return only valid JSON (no markdown wrapping)
- Be brutally honest — no generic encouragement
- Cover 6–10 specific criteria per analysis
- Write outreach messages that reference a specific project when relevant
- Keep outreach human and direct — not corporate

To adjust the tone, scoring criteria, or output format, modify `SYSTEM_PROMPT`.

---

## Roadmap

- [ ] Analysis history saved to localStorage
- [ ] Export report as PDF
- [ ] Field for recruiter name and company (to personalize outreach further)
- [ ] Side-by-side comparison of multiple JDs
- [ ] Score trend chart across analyzed roles

---

## Security note

This app makes direct browser-to-Anthropic API calls using the `anthropic-dangerous-direct-browser-access: true` header. This is intentional for a **private personal tool**.

**Do not make this repository public.** The API key is never in the bundle, but public repos invite scraping attempts. If you adapt this for shared use, route API calls through a Vercel Edge Function to keep the key server-side.

---

## License

Private — built for personal use by [Javier Olivieri](https://devlabs.dev).
