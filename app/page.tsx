/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const GraphCanvas = dynamic(() => import("./components/GraphCanvas"), {
  ssr: false,
  loading: () => null,
}) as any;


const SAMPLES: { label: string; text: string }[] = [
  {
    label: "🤖 AI & ML",
    text: `Machine learning is a subset of artificial intelligence that enables systems to learn from data. 
Deep learning uses neural networks with many layers to process complex patterns. 
Natural language processing allows computers to understand human language.
Transformers are the architecture behind modern LLMs like GPT and Claude.
RAG combines vector search with LLMs to ground responses in real data.
Vector databases like Pinecone and Qdrant store embeddings for semantic search.
Embeddings are numerical representations of text that capture semantic meaning.
Fine-tuning adapts pre-trained models to specific tasks using labeled data.
Prompt engineering is the practice of crafting inputs to get better outputs from LLMs.
Agents use LLMs to plan and execute multi-step tasks autonomously.`,
  },
  {
    label: "💰 Startup & VC",
    text: `A startup is a company designed to scale rapidly with a repeatable business model.
Venture capital funds early-stage companies in exchange for equity.
Product-market fit means customers love your product enough to tell others.
Burn rate is how fast a startup spends its cash runway.
A pivot is when a startup changes its core strategy based on market feedback.
Network effects make a product more valuable as more people use it.
Series A, B, and C are funding rounds that scale the business progressively.
Churn is the rate at which customers stop using a product.
Growth hacking uses creative low-cost strategies to acquire users rapidly.
Unicorns are private startups valued at over one billion dollars.`,
  },
  {
    label: "🧬 Biology & DNA",
    text: `DNA is the molecule that carries genetic instructions for all living organisms.
Genes are segments of DNA that encode proteins with specific functions.
CRISPR is a gene editing tool that can cut and modify DNA with precision.
Proteins are built from amino acids based on instructions from RNA.
Mitochondria generate energy for cells through cellular respiration.
Evolution occurs through natural selection acting on genetic variation.
Epigenetics studies how environment affects gene expression without changing DNA.
Stem cells can differentiate into many cell types and repair damaged tissue.
The human genome contains approximately 3 billion base pairs of DNA.
Viruses hijack host cell machinery to replicate their own genetic material.`,
  },
  {
    label: "🏛️ Philosophy",
    text: `Epistemology is the study of knowledge — what we can know and how we know it.
Ethics examines what is morally right and wrong and how we should act.
Metaphysics explores the fundamental nature of reality and existence.
Plato believed in ideal forms that exist beyond the physical world.
Kant argued that morality comes from reason, not consequences or feelings.
Nietzsche claimed that God is dead and humans must create their own values.
Stoicism teaches that we should focus only on what is within our control.
Existentialism holds that individuals must create their own meaning in life.
Utilitarianism judges actions by their ability to maximize overall happiness.
The mind-body problem asks how consciousness relates to the physical brain.`,
  },
  {
    label: "🎬 Film & Storytelling",
    text: `The three-act structure divides a story into setup, confrontation, and resolution.
Character arc describes how a protagonist changes through the story's events.
A MacGuffin is an object that motivates characters but has no real importance.
Subtext is the hidden meaning beneath dialogue and surface-level action.
The hero's journey is a narrative pattern found across cultures and centuries.
Mise-en-scène refers to everything visible in a film frame including lighting and props.
Montage editing creates meaning by juxtaposing contrasting shots together.
An unreliable narrator makes the audience question the truth of the story.
Dramatic irony occurs when the audience knows something the characters do not.
Theme is the central idea or message a story explores beneath its plot.`,
  },
];

const GROUP_COLORS: Record<string, string> = {
  default: "#c8a97e",
};
const PALETTE = ["#c8a97e", "#e05c5c", "#5c9ee0", "#6abf7b", "#b07ee0", "#e0b45c", "#5ce0d8"];

export default function Home() {
  const [text, setText] = useState("");
  const [graph, setGraph] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  async function visualize() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setSelectedNode(null);
    setGraph(null);
 
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // Build color map
      const groups = [...new Set((data.nodes || []).map((n: any) => n.group))] as string[];
      const map: Record<string, string> = {};
      groups.forEach((g, i) => { map[g] = PALETTE[i % PALETTE.length]; });
      setColorMap(map);
      setGraph(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  // State — add this with your other useState hooks
const [sampleIndex, setSampleIndex] = useState(0);

// Replace loadSample function
  function loadSample() {
    const next = (sampleIndex + 1) % SAMPLES.length;
    setSampleIndex(next);
    setText(SAMPLES[next].text);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0a0a0a; color: #f0ece4; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <header style={{ padding: "1.75rem 3rem", display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2rem", letterSpacing: "0.15em" }}>
            SECOND BRAIN
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#c8a97e", marginLeft: 5, marginBottom: 4 }} />
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444" }}>
            Knowledge Graph Visualizer
          </div>
        </div>
        {graph?.stats && (
          <div style={{ display: "flex", gap: "2rem", animation: "fadeIn 0.5s ease" }}>
            {[
              { label: "Concepts", val: graph.stats.concepts },
              { label: "Connections", val: graph.stats.connections },
              { label: "Clusters", val: graph.stats.clusters },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.5rem", color: "#c8a97e", letterSpacing: "0.1em" }}>{s.val}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "#444", textTransform: "uppercase", letterSpacing: "0.15em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "calc(100vh - 73px)" }}>

        {/* LEFT PANEL */}
        <div style={{ borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Textarea */}
          <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#444" }}>
                Your Notes
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {SAMPLES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSampleIndex(i); setText(s.text); }}
                  style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: "0.6rem",
                    color: sampleIndex === i ? "#f0ece4" : "#444",
                    background: sampleIndex === i ? "#1e1e1e" : "none",
                    border: sampleIndex === i ? "1px solid #333" : "1px solid transparent",
                    cursor: "pointer",
                    padding: "0.2rem 0.4rem",
                    borderRadius: "3px",
                    transition: "all 0.2s",
                  }}
                  title={s.label}
                >
                  {s.label.split(" ")[0]}
                </button>
              ))}
            </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your notes, ideas, journal entries, research — anything. The more the better..."
              style={{
                flex: 1,
                background: "#111",
                border: "1px solid #1e1e1e",
                color: "#f0ece4",
                padding: "1rem",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                resize: "none",
                outline: "none",
                fontWeight: 300,
              }}
              onFocus={(e) => e.target.style.borderColor = "#c8a97e"}
              onBlur={(e) => e.target.style.borderColor = "#1e1e1e"}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.65rem", color: "#333" }}>
                {text.length} chars
              </span>
              <button
                onClick={visualize}
                disabled={loading || text.trim().length < 20}
                style={{
                  background: loading || text.trim().length < 20 ? "#1a1a1a" : "#f0ece4",
                  color: "#0a0a0a",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "1rem",
                  letterSpacing: "0.15em",
                  cursor: loading || text.trim().length < 20 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: loading || text.trim().length < 20 ? 0.35 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading && (
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0a", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                )}
                {loading ? "MAPPING..." : "VISUALIZE →"}
              </button>
            </div>

            {error && (
              <div style={{ background: "rgba(224,92,92,0.08)", border: "1px solid #e05c5c", color: "#e05c5c", padding: "0.75rem", fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", lineHeight: 1.6 }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Node detail panel */}
          {selectedNode && (
            <div style={{ borderTop: "1px solid #1a1a1a", padding: "1.25rem 1.5rem", animation: "fadeIn 0.3s ease", background: "#0d0d0d" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.6rem",
                  border: `1px solid ${colorMap[selectedNode.group] || "#c8a97e"}`,
                  color: colorMap[selectedNode.group] || "#c8a97e",
                }}>
                  {selectedNode.group}
                </div>
                <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "1rem", marginBottom: "0.5rem" }}>
                {selectedNode.label}
              </div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 300, fontSize: "0.82rem", color: "#888", lineHeight: 1.7 }}>
                {selectedNode.summary}
              </div>
            </div>
          )}

          {/* Legend */}
          {graph && Object.keys(colorMap).length > 0 && (
            <div style={{ borderTop: "1px solid #1a1a1a", padding: "1rem 1.5rem" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "#333", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.6rem" }}>Clusters</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {Object.entries(colorMap).map(([group, color]) => (
                  <div key={group} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", color: "#666", textTransform: "capitalize" }}>{group}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GRAPH CANVAS */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {!graph && !loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", opacity: 0.15 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "6rem", letterSpacing: "0.1em", color: "#222", lineHeight: 1 }}>YOUR</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "6rem", letterSpacing: "0.1em", color: "#222", lineHeight: 1 }}>MIND</div>
            </div>
          )}

          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: PALETTE[i % PALETTE.length], animation: `pulse 1.5s ease ${i * 0.15}s infinite` }} />
                ))}
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.7rem", color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Mapping your thoughts...
              </div>
            </div>
          )}

          {graph && (
            <div style={{ width: "100%", height: "100%", animation: "fadeIn 0.5s ease" }}>
              <GraphCanvas data={{ nodes: graph.nodes || [], edges: graph.edges || [] } as any} onNodeClick={handleNodeClick} />
            </div>
          )}

          {/* Hint */}
          {graph && (
            <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", color: "#2a2a2a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Drag nodes · Scroll to zoom · Click to inspect
            </div>
          )}
        </div>
      </div>
    </>
  );
}
