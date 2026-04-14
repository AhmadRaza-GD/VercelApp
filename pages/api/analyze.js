const TAXONOMY = [
  { pattern: /^economy\/|\/economy\/|coin|iap|currency|pric|monetiz/i, category: "Economy" },
  { pattern: /^ui\/|\/ui\/|^components\/|\/components\/|^styles\/|\.css$|\.scss$|modal|screen|layout|button|icon|theme/i, category: "UI" },
  { pattern: /^balance\/|\/balance\/|damage|stat|weapon|skill|difficulty|level.*design/i, category: "Balance" },
  { pattern: /^ads\/|\/ads\/|^monetization\/|advert|rewarded|interstitial|placement|banner/i, category: "Ads" },
  { pattern: /^perf\/|\/perf\/|^performance\/|framerate|frame_rate|memory|optimis|optim[iz]/i, category: "Performance" },
  { pattern: /^analytics\/|\/analytics\/|tracking|event.*log|metric|telemetry/i, category: "Analytics" },
  { pattern: /^core\/|^engine\/|^platform\/|\/engine\/|architecture|renderer|physics/i, category: "Core" },
  { pattern: /^tests?\/|__tests?__|\.test\.|\.spec\.|\.e2e\./i, category: "Tests" },
  { pattern: /^fix\/|^hotfix\/|^bugfix\/|crash|null.*ptr|memory.*leak|fix.*bug|bug.*fix/i, category: "Bug Fix" },
];

const VAGUE_MESSAGES = [
  /^(wip|misc|various|updates?|fixes?|changes?|stuff|things?|improvements?|tweaks?)$/i,
  /various fixes/i, /misc updates/i, /some changes/i, /cleanup/i,
  /lots of/i, /multiple/i, /bundle/i,
];

function classifyFile(filePath) {
  for (const { pattern, category } of TAXONOMY) {
    if (pattern.test(filePath)) return category;
  }
  const ext = filePath.split(".").pop().toLowerCase();
  if (["js", "ts", "jsx", "tsx"].includes(ext)) return "Core";
  if (["json"].includes(ext)) return "Config";
  if (["md", "txt"].includes(ext)) return "Docs";
  return "Other";
}

function isVague(msg) {
  return VAGUE_MESSAGES.some(p => p.test(msg.trim()));
}

const HYPOTHESES = {
  Economy: "Expected to shift IAP conversion rate by 5–12% — measure revenue per DAU and purchase funnel drop-off over 7 days post-activation.",
  UI: "Expected to improve session engagement — measure tap-through rate on affected screens and D1 retention over 5 days.",
  Balance: "Expected to normalise win-rate in affected bracket — measure match outcome distribution and player churn in that tier over 14 days.",
  Ads: "Expected to shift ad revenue per session — measure eCPM, claim rate, and session length impact over 7 days.",
  Performance: "Expected to reduce crash rate and improve session length — measure ANR rate, frame drop frequency, and avg session duration over 7 days.",
  Analytics: "Expected to improve data completeness — validate event coverage in dashboard within 48 hours of activation.",
  Core: "Expected to have no user-facing metric impact — monitor crash rate and ANR rate for 48 hours as a stability check.",
  Tests: "No user-facing metric impact expected — validate CI pass rate and coverage delta in the pipeline.",
  "Bug Fix": "Expected to reduce crash rate or error frequency for the specific scenario — monitor crash-free session rate for 5 days.",
};

const RECOMMENDATIONS = {
  APPROVED: "This PR is atomic and ready to merge. Attach the auto-generated hypothesis to the feature flag and activate via the release gate agent.",
  BLOCKED: "Split this PR into separate branches — one per category. Each should be merged, flagged, and activated independently so results can be attributed cleanly.",
  WARNING: "Rewrite the commit message to follow the format: `type(scope): description of exactly one change`. Example: `balance: reduce sword damage 5% to normalise Gold+ win-rate`.",
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prTitle, prDescription, files, commitMessage } = req.body;

  if (!prTitle && !files) {
    return res.status(400).json({ error: "PR title or files required" });
  }

  const fileList = (files || "")
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);

  // Classify each file
  const filesAnalysis = fileList.map(file => {
    const category = classifyFile(file);
    const reasons = {
      Economy: "matches economy/ path or economy-related naming",
      UI: "matches ui/, components/, or style-related naming",
      Balance: "matches balance/ path or stat/damage-related naming",
      Ads: "matches ads/ or monetization/ path",
      Performance: "matches perf/ or performance-related naming",
      Analytics: "matches analytics/ or tracking-related naming",
      Core: "matches core/ or engine/ path",
      Tests: "matches test file pattern (*.test.*, __tests__/)",
      "Bug Fix": "matches fix/ path or crash/bug-related naming",
      Config: "JSON config file",
      Docs: "documentation file",
      Other: "no category match — review manually",
    };
    return { file, category, reason: reasons[category] || "classified by file path" };
  });

  // Detect unique categories (ignore Docs/Config/Other for blocking)
  const blockingCategories = [...new Set(
    filesAnalysis
      .map(f => f.category)
      .filter(c => !["Docs", "Config", "Other"].includes(c))
  )];

  const allCategories = [...new Set(filesAnalysis.map(f => f.category))];
  const primaryCategory = blockingCategories[0] || allCategories[0] || "Unknown";

  // Check commit message
  const msgToCheck = commitMessage || prTitle || "";
  const vagueMsg = isVague(msgToCheck);

  // Determine verdict
  let verdict, issues;

  if (blockingCategories.length >= 2) {
    verdict = "BLOCKED";
    issues = [
      `${blockingCategories.length} categories detected in a single PR: ${blockingCategories.join(", ")}.`,
      "Atomic release policy requires one category per PR. Each category must be a separate branch, separate merge, and separate feature flag.",
      `Split into ${blockingCategories.length} PRs: ${blockingCategories.map(c => `one for ${c}`).join(", ")}.`,
    ];
  } else if (vagueMsg) {
    verdict = "WARNING";
    issues = [
      `Commit message "${msgToCheck}" is too vague to generate a release hypothesis.`,
      "A clear commit message is required so the release gate agent can auto-generate a metric hypothesis.",
    ];
  } else {
    verdict = "APPROVED";
    issues = [];
  }

  // Atomic score
  let atomicScore = 100;
  if (blockingCategories.length >= 2) atomicScore = Math.max(10, 100 - (blockingCategories.length - 1) * 30);
  if (vagueMsg) atomicScore = Math.min(atomicScore, 55);

  const hypothesis = verdict === "APPROVED"
    ? (HYPOTHESES[primaryCategory] || "Monitor primary KPIs for 7 days post-activation.")
    : "";

  return res.status(200).json({
    verdict,
    categories_detected: blockingCategories.length ? blockingCategories : allCategories,
    primary_category: primaryCategory,
    files_analysis: filesAnalysis,
    issues,
    hypothesis,
    recommendation: RECOMMENDATIONS[verdict],
    atomic_score: atomicScore,
  });
}
