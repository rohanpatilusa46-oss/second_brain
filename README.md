# 🧠 Second Brain — Knowledge Graph Visualizer

Paste any notes, ideas, or text and watch your thoughts come alive as an interactive knowledge graph powered by GPT-4o.

**Live demo:** [your-vercel-url.vercel.app]

## Features
- 🔵 **Interactive D3.js force graph** — drag, zoom, explore
- 🎨 **Color-coded clusters** — related concepts group together
- 🔗 **Labeled edges** — shows how concepts relate
- 🖱️ **Click any node** — see a summary of that concept
- ⚡ **GPT-4o powered** — works on any text, any topic

## Stack
- **Frontend:** Next.js 15 + React + TypeScript
- **Graph:** D3.js force simulation
- **AI:** OpenAI GPT-4o (JSON mode)
- **Deploy:** Vercel

## Run Locally

```bash
git clone https://github.com/yourusername/second-brain
cd second-brain
npm install
cp .env.example .env.local
# Add your key: OPENAI_API_KEY=sk-...
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
1. Push to GitHub
2. Import at vercel.com
3. Add `OPENAI_API_KEY` in Environment Variables
4. Deploy
