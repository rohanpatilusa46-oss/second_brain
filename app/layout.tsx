export const metadata = {
  title: "Second Brain — Knowledge Graph Visualizer",
  description: "Paste your notes and watch your ideas come alive as an interactive knowledge graph.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0a", overflow: "hidden" }}>{children}</body>
    </html>
  );
}
