import { useState } from "react";
import Head from "next/head";

const EXAMPLES = [
  {
    label: "✗ Blocked — mixed categories",
    prTitle: "Update shop UI and rebalance sword damage",
    commitMessage: "feat: new shop modal + balance sword dmg by 5%",
    prDescription: "Redesigned the shop modal layout and also reduced sword damage to fix balance issues in Gold+ bracket.",
    files: `ui/shopModal.jsx
ui/shopModal.css
components/ShopButton.jsx
balance/swordDamage.js
balance/weaponStats.json`,
  },
  {
    label: "✓ Approved — atomic balance patch",
    prTitle: "balance: reduce sword damage by 5% in Gold+ bracket",
    commitMessage: "balance: reduce sword damage 5% to normalise win-rate in Gold+",
    prDescription: "Sword win-rate in Gold+ trophy range is 4.2% above target. Reducing base damage from 240 to 228 to bring it in line.",
    files: `balance/swordDamage.js
balance/weaponStats.json`,
  },
  {
    label: "⚠ Warning — vague commit message",
    prTitle: "Various fixes and improvements",
    commitMessage: "misc updates",
    prDescription: "Fixed some stuff and cleaned up a few things that were bothering me.",
    files: `ui/homeScreen.jsx
ui/homeScreen.css`,
  },
  {
    label: "✗ Blocked — 4 categories bundled",
    prTitle: "Release prep: UI + economy + ads + bug fixes",
    commitMessage: "release: bundle all changes for v3.2",
    prDescription: "Combining all changes for the upcoming release.",
    files: `ui/shopModal.jsx
economy/coinDrop.js
economy/iapPricing.json
ads/placement.js
ads/rewardedConfig.json
fix/nullCrashLevelExit.js
fix/memoryLeakFix.js`,
  },
];

const VERDICT_CONFIG = {
  APPROVED: {
    color: "#155C35",
    bg: "#E6F7EF",
    border: "#2ECC71",
    badge: "#2ECC71",
    badgeText: "#fff",
    icon: "✓",
    label: "APPROVED — Atomic",
  },
  BLOCKED: {
    color: "#8B1A1A",
    bg: "#FFE8E8",
    border: "#E74C3C",
    badge: "#E74C3C",
    badgeText: "#fff",
    icon: "✗",
    label: "BLOCKED — Mixed Categories",
  },
  WARNING: {
    color: "#7A5800",
    bg: "#FFF3C4",
    border: "#F5C518",
    badge: "#F5C518",
    badgeText: "#111",
    icon: "⚠",
    label: "WARNING — Needs Attention",
  },
};

const CAT_COLORS = {
  Economy: { bg: "#FFF3C4", text: "#7A5800" },
  UI: { bg: "#E6F0FF", text: "#1A3A7A" },
  Balance: { bg: "#E6F7EF", text: "#155C35" },
  Ads: { bg: "#F0EEFF", text: "#3A1A7A" },
  Performance: { bg: "#FAECE7", text: "#712B13" },
  Analytics: { bg: "#E1F5EE", text: "#0F6E56" },
  Core: { bg: "#F2F2F2", text: "#444" },
  Tests: { bg: "#F2F2F2", text: "#444" },
  "Bug Fix": { bg: "#FFE8E8", text: "#8B1A1A" },
};

function getCatStyle(cat) {
  return CAT_COLORS[cat] || { bg: "#F2F2F2", text: "#444" };
}

export default function Home() {
  const [form, setForm] = useState({
    prTitle: "",
    commitMessage: "",
    prDescription: "",
    files: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeExample, setActiveExample] = useState(null);

  function loadExample(ex, idx) {
    setForm({
      prTitle: ex.prTitle,
      commitMessage: ex.commitMessage,
      prDescription: ex.prDescription,
      files: ex.files,
    });
    setResult(null);
    setError(null);
    setActiveExample(idx);
  }

  async function analyze() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <>
      <Head>
        <title>PR Review Agent — GameDistrict AI-Thon 2026</title>
        <meta name="description" content="Atomic release enforcement for game studios" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --yellow: #F5C518;
          --yellow-dim: #7A5800;
          --black: #0D0D0D;
          --surface: #141414;
          --surface2: #1C1C1C;
          --surface3: #242424;
          --border: #2A2A2A;
          --border2: #333;
          --text: #EFEFEF;
          --text2: #999;
          --text3: #666;
          --mono: 'JetBrains Mono', monospace;
          --sans: 'Syne', sans-serif;
        }
        html { background: var(--black); color: var(--text); font-family: var(--sans); }
        body { min-height: 100vh; }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 52px;
          background: var(--surface); border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .logo-badge {
          background: var(--yellow); color: #111; font-family: var(--mono);
          font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 3px;
          letter-spacing: 0.08em;
        }
        .topbar-title { font-size: 13px; font-weight: 600; color: var(--text2); letter-spacing: 0.02em; }
        .topbar-right { font-family: var(--mono); font-size: 10px; color: var(--text3); }

        .hero {
          border-bottom: 1px solid var(--border);
          padding: 64px 32px 48px;
          background: var(--surface);
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            90deg, transparent, transparent 79px,
            rgba(255,255,255,0.015) 79px, rgba(255,255,255,0.015) 80px
          );
          pointer-events: none;
        }
        .hero-inner { max-width: 900px; margin: 0 auto; position: relative; }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(245,197,24,0.12); border: 1px solid rgba(245,197,24,0.25);
          color: var(--yellow); font-family: var(--mono); font-size: 10px;
          font-weight: 700; padding: 5px 12px; border-radius: 3px;
          letter-spacing: 0.08em; margin-bottom: 20px;
        }
        .hero-tag::before { content: '●'; font-size: 7px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .hero h1 {
          font-size: clamp(32px, 5vw, 52px); font-weight: 800;
          color: var(--text); line-height: 1.05; letter-spacing: -0.03em;
          margin-bottom: 16px;
        }
        .hero h1 span { color: var(--yellow); }
        .hero-sub {
          font-size: 15px; color: var(--text2); line-height: 1.7; max-width: 540px;
          margin-bottom: 32px;
        }
        .hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; gap: 2px; }
        .stat-num { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--yellow); }
        .stat-lbl { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.06em; }

        .main { max-width: 900px; margin: 0 auto; padding: 40px 32px 80px; }

        .section-label {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 12px;
        }

        .examples-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 32px; }
        .example-btn {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text2); font-family: var(--mono); font-size: 11px;
          padding: 10px 14px; border-radius: 4px; cursor: pointer;
          text-align: left; transition: all 0.15s; line-height: 1.4;
        }
        .example-btn:hover { border-color: var(--yellow); color: var(--text); background: var(--surface3); }
        .example-btn.active { border-color: var(--yellow); color: var(--yellow); background: rgba(245,197,24,0.06); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field.full { grid-column: 1 / -1; }
        label {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          color: var(--text3); letter-spacing: 0.08em; text-transform: uppercase;
        }
        input, textarea {
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text); font-family: var(--mono); font-size: 12px;
          padding: 10px 12px; border-radius: 4px; outline: none;
          transition: border-color 0.15s; resize: vertical;
        }
        input:focus, textarea:focus { border-color: rgba(245,197,24,0.5); }
        textarea { min-height: 80px; }
        textarea.files { min-height: 120px; }

        .analyze-btn {
          width: 100%; padding: 14px;
          background: var(--yellow); color: #111;
          font-family: var(--sans); font-size: 14px; font-weight: 800;
          border: none; border-radius: 4px; cursor: pointer;
          letter-spacing: 0.03em; transition: all 0.15s;
          margin-top: 4px;
        }
        .analyze-btn:hover:not(:disabled) { background: #FFD700; transform: translateY(-1px); }
        .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .loading-bar {
          height: 3px; background: var(--surface3); border-radius: 2px;
          overflow: hidden; margin: 16px 0;
        }
        .loading-bar-inner {
          height: 100%; background: var(--yellow);
          animation: loadbar 1.4s ease-in-out infinite;
          border-radius: 2px;
        }
        @keyframes loadbar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }

        .result { margin-top: 32px; animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }

        .verdict-banner {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 24px; border-radius: 6px 6px 0 0;
          border: 1px solid; border-bottom: none;
        }
        .verdict-icon {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 900; flex-shrink: 0;
          color: #fff;
        }
        .verdict-label { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
        .verdict-sub { font-size: 12px; opacity: 0.7; margin-top: 2px; font-family: var(--mono); }
        .score-pill {
          margin-left: auto; font-family: var(--mono); font-size: 11px;
          font-weight: 700; padding: 6px 14px; border-radius: 20px;
          border: 1px solid currentColor;
        }

        .result-body {
          background: var(--surface); border: 1px solid var(--border2);
          border-radius: 0 0 6px 6px; padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
        }

        .result-section h3 {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 10px;
        }

        .cats-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-tag {
          font-family: var(--mono); font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 3px;
        }

        .files-table { width: 100%; border-collapse: collapse; }
        .files-table td {
          padding: 7px 10px; font-family: var(--mono); font-size: 11px;
          border-bottom: 1px solid var(--border); color: var(--text2);
          vertical-align: middle;
        }
        .files-table tr:last-child td { border-bottom: none; }
        .files-table td:first-child { color: var(--text); }
        .file-cat-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 2px;
        }

        .issues-list { display: flex; flex-direction: column; gap: 7px; }
        .issue-item {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.2);
          padding: 10px 12px; border-radius: 4px;
          font-size: 12px; color: #E07070; line-height: 1.5;
        }
        .issue-item::before { content: '⚠'; flex-shrink: 0; margin-top: 1px; }

        .hypothesis-box {
          background: rgba(245,197,24,0.06); border: 1px solid rgba(245,197,24,0.2);
          border-radius: 4px; padding: 14px 16px;
          font-size: 13px; color: var(--text2); line-height: 1.6;
        }
        .hypothesis-box strong { color: var(--yellow); font-family: var(--mono); font-size: 10px;
          letter-spacing: 0.08em; display: block; margin-bottom: 6px; }

        .rec-box {
          background: var(--surface2); border: 1px solid var(--border);
          border-left: 3px solid var(--yellow);
          border-radius: 0 4px 4px 0; padding: 12px 16px;
          font-size: 12px; color: var(--text2); line-height: 1.6;
        }

        .error-box {
          background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.3);
          color: #E07070; padding: 14px 16px; border-radius: 4px;
          font-family: var(--mono); font-size: 12px; margin-top: 16px;
        }

        .divider { height: 1px; background: var(--border); }

        .footer {
          border-top: 1px solid var(--border); padding: 20px 32px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-left { font-family: var(--mono); font-size: 10px; color: var(--text3); }
        .footer-right { font-family: var(--mono); font-size: 10px; color: var(--text3); }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .examples-row { grid-template-columns: 1fr; }
          .hero { padding: 40px 20px 32px; }
          .main { padding: 28px 20px 60px; }
          .topbar { padding: 0 20px; }
          .hero-stats { gap: 20px; }
        }
      `}</style>

      <div className="topbar">
        <div className="topbar-left">
          <span className="logo-badge">GD</span>
          <span className="topbar-title">PR Review Agent · AI-Thon 2026</span>
        </div>
        <span className="topbar-right">powered by Claude</span>
      </div>

      <div className="hero">
        <div className="hero-inner">
          <div className="hero-tag">LIVE DEMO — ATOMIC RELEASE ENFORCEMENT</div>
          <h1>The PR Review<br /><span>Agent</span></h1>
          <p className="hero-sub">
            Paste any pull request and watch the agent instantly classify its categories, detect mixed concerns, block bundled changes, and generate a release hypothesis — all in real time.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">5</span>
              <span className="stat-lbl">categories enforced</span>
            </div>
            <div className="stat">
              <span className="stat-num">&lt;2s</span>
              <span className="stat-lbl">analysis time</span>
            </div>
            <div className="stat">
              <span className="stat-num">0</span>
              <span className="stat-lbl">manual reviews needed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main">

        <div className="section-label">Try an example</div>
        <div className="examples-row">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              className={`example-btn${activeExample === i ? " active" : ""}`}
              onClick={() => loadExample(ex, i)}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="section-label">Or enter a PR manually</div>

        <div className="form-grid">
          <div className="field">
            <label>PR Title</label>
            <input
              value={form.prTitle}
              onChange={e => setForm(f => ({ ...f, prTitle: e.target.value }))}
              placeholder="feat: update shop UI and rebalance sword damage"
            />
          </div>
          <div className="field">
            <label>Commit Message</label>
            <input
              value={form.commitMessage}
              onChange={e => setForm(f => ({ ...f, commitMessage: e.target.value }))}
              placeholder="fix: null crash + new shop modal"
            />
          </div>
          <div className="field full">
            <label>PR Description (optional)</label>
            <textarea
              value={form.prDescription}
              onChange={e => setForm(f => ({ ...f, prDescription: e.target.value }))}
              placeholder="What does this PR do and why?"
            />
          </div>
          <div className="field full">
            <label>Changed Files (one per line)</label>
            <textarea
              className="files"
              value={form.files}
              onChange={e => setForm(f => ({ ...f, files: e.target.value }))}
              placeholder={`ui/shopModal.jsx\neconomy/coinDrop.js\nbalance/swordDamage.js`}
            />
          </div>
        </div>

        <button
          className="analyze-btn"
          onClick={analyze}
          disabled={loading || (!form.prTitle && !form.files)}
        >
          {loading ? "Analyzing PR..." : "Run PR Review Agent →"}
        </button>

        {loading && (
          <div className="loading-bar">
            <div className="loading-bar-inner" />
          </div>
        )}

        {error && <div className="error-box">Error: {error}</div>}

        {result && vc && (
          <div className="result">
            <div
              className="verdict-banner"
              style={{
                background: `${vc.bg}18`,
                borderColor: `${vc.border}55`,
                color: vc.color,
              }}
            >
              <div
                className="verdict-icon"
                style={{ background: vc.badge, color: vc.badgeText }}
              >
                {vc.icon}
              </div>
              <div>
                <div className="verdict-label" style={{ color: vc.color }}>
                  {vc.label}
                </div>
                <div className="verdict-sub" style={{ color: vc.color }}>
                  {result.categories_detected?.join(" + ")}
                </div>
              </div>
              <div
                className="score-pill"
                style={{ color: vc.color, borderColor: `${vc.border}55` }}
              >
                Atomic score: {result.atomic_score}/100
              </div>
            </div>

            <div className="result-body">

              {result.categories_detected?.length > 0 && (
                <div className="result-section">
                  <h3>Categories detected</h3>
                  <div className="cats-row">
                    {result.categories_detected.map((cat, i) => {
                      const s = getCatStyle(cat);
                      return (
                        <span key={i} className="cat-tag" style={{ background: s.bg, color: s.text }}>
                          {cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {result.files_analysis?.length > 0 && (
                <div className="result-section">
                  <h3>File analysis</h3>
                  <table className="files-table">
                    <tbody>
                      {result.files_analysis.map((f, i) => {
                        const s = getCatStyle(f.category);
                        return (
                          <tr key={i}>
                            <td>{f.file}</td>
                            <td>
                              <span className="file-cat-badge" style={{ background: s.bg, color: s.text }}>
                                {f.category}
                              </span>
                            </td>
                            <td style={{ color: "#666" }}>{f.reason}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {result.issues?.length > 0 && (
                <div className="result-section">
                  <h3>Issues found</h3>
                  <div className="issues-list">
                    {result.issues.map((issue, i) => (
                      <div key={i} className="issue-item">{issue}</div>
                    ))}
                  </div>
                </div>
              )}

              {result.hypothesis && (
                <div className="result-section">
                  <div className="hypothesis-box">
                    <strong>AUTO-GENERATED HYPOTHESIS</strong>
                    {result.hypothesis}
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div className="result-section">
                  <h3>Recommended action</h3>
                  <div className="rec-box">{result.recommendation}</div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      <div className="footer">
        <span className="footer-left">GameDistrict · AI-Thon 2026 · Ahmad Raza, Development, CoreTeam</span>
        <span className="footer-right">www.gamedistrict.co</span>
      </div>
    </>
  );
}
