import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the GameDistrict PR Review Agent — an AI enforcer of atomic release discipline.

Your job is to analyze a GitHub pull request and determine if it is ATOMIC (single-purpose) or MIXED (multi-purpose).

FILE PATH TAXONOMY — each file path maps to exactly one category:
- economy/     → Economy (coin drops, IAP, currencies, pricing)
- ui/ or components/ or styles/ → UI (layouts, visuals, modals, screens)
- balance/     → Balance (damage values, stats, difficulty, game feel)
- ads/ or monetization/ → Ads (ad placement, frequency, rewarded ads)
- perf/ or performance/ → Performance (frame rate, memory, load times)
- analytics/   → Analytics (tracking, events, metrics)
- core/ or engine/ or platform/ → Core (engine, architecture, platform)
- tests/ or __tests__/ or *.test.* or *.spec.* → Tests (unit/integration tests)
- fix/ or hotfix/ or bugfix/ or any file with obvious bug fix context → Bug Fix

RULES:
1. If ALL changed files belong to ONE category → APPROVED (atomic)
2. If files span TWO OR MORE categories → BLOCKED (mixed)
3. If commit message is vague ("various fixes", "updates", "wip") → WARNING (bad message)
4. Generate a hypothesis for approved PRs: what metric this change should move and by how much

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "APPROVED" | "BLOCKED" | "WARNING",
  "categories_detected": ["category1", "category2"],
  "primary_category": "the main category",
  "files_analysis": [
    { "file": "path/to/file.js", "category": "Category", "reason": "brief reason" }
  ],
  "issues": ["issue 1 if any", "issue 2 if any"],
  "hypothesis": "For APPROVED PRs: one sentence about what metric this is expected to move. For BLOCKED: empty string.",
  "recommendation": "A concrete action for the developer to take",
  "atomic_score": 0-100
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prTitle, prDescription, files, commitMessage } = req.body;

  if (!prTitle && !files) {
    return res.status(400).json({ error: "PR title or files required" });
  }

  const userMessage = `Analyze this GitHub Pull Request:

PR TITLE: ${prTitle || "Untitled"}
COMMIT MESSAGE: ${commitMessage || prTitle || "No commit message"}
DESCRIPTION: ${prDescription || "No description provided"}

CHANGED FILES:
${files || "No files listed"}

Analyze for atomic discipline. Respond with JSON only.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Agent error:", err);
    return res.status(500).json({ error: "Agent failed: " + err.message });
  }
}
