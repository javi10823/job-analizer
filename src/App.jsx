import { useState } from "react";

const MY_CV = `Javier Olivieri — AI Consultant · Agentic Systems & Automation Architect
Location: Rosario, Argentina | Available: Remote · USA / Europe / South America
LinkedIn: linkedin.com/in/javierolivieri | Web: devlabs.dev

SUMMARY
I design and build agentic AI systems and automation architectures — from autonomous multi-agent pipelines and RAG systems to full-stack AI-native products that ship to production. With 17+ years in full-stack development and a track record at US-based startups, I specialize in mapping business processes end-to-end, identifying where AI creates real leverage, and executing — from technical blueprint to deployed system.
Stats: 17+ years dev experience · 40+ shipped projects · 8+ US clients · 3 AI products live

WHAT I DO
- Agentic AI Systems: Autonomous multi-agent workflows using Claude, OpenAI, CrewAI and MCP. Tool use, memory, RAG pipelines, and human-in-the-loop logic — production-ready.
- Process Design & Automation: End-to-end workflow audits: n8n, Make, APIs, LLMs, document parsing, SaaS integrations.
- AI-Native Product Architecture: Full-stack AI products — Next.js + NestJS + LLM APIs + vector DBs.
- Technical AI Strategy: AI readiness audits, stack & model selection, token cost optimization.

STACK & SKILLS
LLM Systems: Claude · OpenAI · Gemini · Prompt Engineering · Token Management · RAG Pipelines · Vector DBs · Embeddings
Agent Orchestration: CrewAI · LangChain · LlamaIndex · MCP Servers · Claude Code · Multi-agent workflows · Human-in-the-loop
Process & Automation: n8n · Make · Zapier · Workflow design · Document parsing · SaaS integrations · API + Webhooks
Backend & Data: NestJS · Node.js · Python · PostgreSQL · MongoDB · REST · GraphQL · Notion · Airtable
Frontend & Infra: Next.js · React · TypeScript · AWS · Docker · Vercel · CI/CD · GitHub Actions
Leadership: Tech Lead (6yr) · Systems thinking · Process design · Ops consulting · Remote teams · US clients

EXPERIENCE

DEVLABS (STARDEVS LLC) — Founder & Technical Lead · 2022–Present · Rosario, Argentina
- Built AI quoting agent (Claude) for a marble & stone company: reads architectural floor plans, applies 30+ business rules, auto-generates PDF + Excel quotes — cutting quote time from 3hrs to minutes and recovering 70% of leads
- Architected 20-module government platform modernization (NestJS + Next.js + PostgreSQL + MinIO)
- Delivered AI-native full-stack products for US clients across healthtech, fintech, and Web3

SAMA FERTILITY — Full-Stack Tech Lead · Dec 2022–Present · San Francisco, CA
- Designed full system architecture from scratch — web + mobile — defining technical specs directly with CTO
- Introduced AI-assisted tooling and automated dev workflows, increasing team throughput by ~35%
- Shipped CI/CD pipelines that cut deployment cycle time from days to under 2 hours
- Led distributed 4-person frontend team across US/LATAM time zones
Stack: React Native · React.js · TypeScript · Node.js · Python · Auth0 · Stripe · Firebase · AWS

SECURITIZE — React / React Native Sr. Full-Stack · Apr–Nov 2022 · San Francisco, CA
NIFTY GATEWAY — React Native Sr. Full-Stack · Nov 2020–Jun 2021 · San Francisco, CA
PRESENCE / BLUON / FOXBOX — React Native Tech Lead · Feb 2017–Oct 2020

LANGUAGES: English C1 (Professional) · Spanish C2 (Native)`;

const SYSTEM_PROMPT = `You are a brutally honest career advisor. Given a job description and a candidate CV, analyze fit and return ONLY valid JSON — no markdown, no text outside the JSON.

{
  "skills_score": <0-100>,
  "strategic_score": <0-100>,
  "verdict": "<one direct sentence: apply / skip / apply only if X>",
  "verdict_type": "<'apply'|'skip'|'maybe'>",
  "summary": "<2-3 sentences: honest fit analysis, key gaps, strategic implications>",
  "checks": [
    { "status": "<'ok'|'warn'|'no'>", "label": "<short label>", "note": "<1-2 sentences>" }
  ],
  "keywords_match": ["<keyword from JD found in CV>"],
  "keywords_gap": ["<keyword from JD missing in CV>"],
  "outreach_es": "<ready-to-send message in Spanish, 4-5 short paragraphs, direct tone, no generic openers, references the marble AI agent project as a concrete example when relevant>",
  "outreach_en": "<same in English>"
}

Rules: 6-10 checks covering remote/location, required skills, gaps, strategic fit, compensation if mentioned, competition if mentioned. keywords_match and keywords_gap should be concise single concepts. Outreach must feel human and specific — not corporate.`;

const scoreColor = (n) => n >= 80 ? "#4ade80" : n >= 60 ? "#fbbf24" : "#f87171";
const statusIcon = (s) => s === "ok" ? "✅" : s === "warn" ? "⚠️" : "❌";

const s = {
  page: { fontFamily: "'DM Sans', sans-serif", background: "#0a0a0a", color: "#e2e2e2", minHeight: "100vh", padding: "2rem 1.25rem", maxWidth: "700px", margin: "0 auto" },
  mono: { fontFamily: "'DM Mono', monospace" },
  label: { fontSize: "11px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" },
  card: { background: "#111", border: "1px solid #1e1e1e", borderRadius: "10px" },
  sectionTitle: { fontSize: "11px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" },
};

export default function App() {
  const [jd, setJd] = useState("");
  const [cv, setCv] = useState(MY_CV);
  const [showCv, setShowCv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [lang, setLang] = useState("es");

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const analyze = async () => {
    if (!jd.trim()) return;
    if (!apiKey) { setError("Falta VITE_ANTHROPIC_API_KEY en las variables de entorno."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `JD:\n${jd}\n\nCV:\n${cv}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError("Error al analizar: " + e.message);
    }
    setLoading(false);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #1a1a1a", paddingBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span style={{ fontSize: "22px", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em" }}>JobMatch</span>
          <span style={{ ...s.mono, fontSize: "11px", color: "#444", letterSpacing: "0.1em" }}>by DevLabs</span>
        </div>
        <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
          Pegá el JD · Analizá el fit · Decidí en 30 segundos
        </p>
      </div>

      {/* JD */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={s.label}>Job Description</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Pegá el JD completo acá — título, responsabilidades, requisitos, compensación..."
          style={{ ...s.mono, width: "100%", background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "14px", color: "#ccc", fontSize: "12px", lineHeight: 1.7, resize: "vertical", minHeight: "160px" }}
        />
      </div>

      {/* CV toggle */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={() => setShowCv(!showCv)} style={{ background: "none", border: "none", color: "#444", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>
          {showCv ? "▼" : "▶"} CV — {showCv ? "editando" : "click para editar"}
        </button>
        {showCv && (
          <textarea
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            style={{ ...s.mono, width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "8px", padding: "14px", color: "#666", fontSize: "11px", lineHeight: 1.6, resize: "vertical", minHeight: "200px", marginTop: "8px" }}
          />
        )}
      </div>

      {/* Button */}
      <button
        onClick={analyze}
        disabled={loading || !jd.trim()}
        style={{ width: "100%", padding: "14px", background: loading ? "#0f0f0f" : "#161616", border: "1px solid #2a2a2a", borderRadius: "8px", color: loading || !jd.trim() ? "#444" : "#e2e2e2", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: loading || !jd.trim() ? "not-allowed" : "pointer", letterSpacing: "0.05em", marginBottom: "2rem", transition: "all 0.15s" }}
      >
        {loading ? "Analizando con Claude..." : "→ Analizar fit"}
      </button>

      {error && (
        <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "12px 16px", color: "#f87171", fontSize: "12px", marginBottom: "1.5rem", ...s.mono }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Scores */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
            {[{ label: "Skills match", v: result.skills_score }, { label: "Strategic fit", v: result.strategic_score }].map(({ label, v }) => (
              <div key={label} style={{ ...s.card, padding: "1.25rem", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</div>
                <div style={{ fontSize: "44px", fontWeight: 600, color: scoreColor(v), lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>/ 100</div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div style={{ background: result.verdict_type === "apply" ? "#0a1a0a" : result.verdict_type === "skip" ? "#1a0a0a" : "#141008", border: `1px solid ${result.verdict_type === "apply" ? "#1a3a1a" : result.verdict_type === "skip" ? "#3a1a1a" : "#2a2008"}`, borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ ...s.sectionTitle }}>Veredicto</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: scoreColor(result.verdict_type === "apply" ? 90 : result.verdict_type === "skip" ? 10 : 60), marginBottom: "8px" }}>
              {result.verdict}
            </div>
            <div style={{ fontSize: "13px", color: "#777", lineHeight: 1.75 }}>{result.summary}</div>
          </div>

          {/* Checks */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={s.sectionTitle}>Análisis por criterio</div>
            <div style={{ ...s.card, overflow: "hidden" }}>
              {result.checks.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 16px", borderBottom: i < result.checks.length - 1 ? "1px solid #161616" : "none" }}>
                  <span style={{ fontSize: "14px", minWidth: "22px", marginTop: "1px" }}>{statusIcon(c.status)}</span>
                  <div>
                    <div style={{ fontSize: "13px", color: "#ddd", fontWeight: 500 }}>{c.label}</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "3px", lineHeight: 1.6 }}>{c.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={s.sectionTitle}>Keywords</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {result.keywords_match?.map((k) => (
                <span key={k} style={{ ...s.mono, background: "#0a1a0a", border: "1px solid #1a3a1a", color: "#4ade80", fontSize: "11px", padding: "3px 10px", borderRadius: "20px" }}>{k} ✓</span>
              ))}
              {result.keywords_gap?.map((k) => (
                <span key={k} style={{ ...s.mono, background: "#1a0a0a", border: "1px solid #3a1a1a", color: "#f87171", fontSize: "11px", padding: "3px 10px", borderRadius: "20px" }}>{k} ✗</span>
              ))}
            </div>
          </div>

          {/* Outreach */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={s.sectionTitle}>Mensaje de outreach</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["es", "en"].map((l) => (
                  <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#1e1e1e" : "none", border: "1px solid #222", borderRadius: "6px", color: lang === l ? "#e2e2e2" : "#555", fontSize: "11px", padding: "4px 12px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ ...s.card, padding: "1rem 1.25rem", position: "relative" }}>
              <pre style={{ fontSize: "13px", color: "#aaa", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'DM Sans', sans-serif", paddingRight: "60px" }}>
                {lang === "es" ? result.outreach_es : result.outreach_en}
              </pre>
              <button
                onClick={() => copy(lang === "es" ? result.outreach_es : result.outreach_en, "msg")}
                style={{ position: "absolute", top: "12px", right: "12px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", color: copied === "msg" ? "#4ade80" : "#666", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
              >
                {copied === "msg" ? "✓" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setResult(null); setJd(""); }}
            style={{ marginTop: "2rem", background: "none", border: "none", color: "#444", fontSize: "12px", cursor: "pointer", padding: 0, letterSpacing: "0.05em" }}
          >
            ← Nuevo análisis
          </button>
        </div>
      )}
    </div>
  );
}
