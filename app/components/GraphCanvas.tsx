/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  summary: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  label: string;
}

interface Props {
  data: { nodes: Node[]; edges: Edge[] };
  onNodeClick: (node: Node) => void;
}

const GROUP_COLORS = [
  "#c8a97e", "#e05c5c", "#5c9ee0", "#6abf7b",
  "#b07ee0", "#e0b45c", "#5ce0d8", "#e07eb4",
];

export default function GraphCanvas({ data, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Color map
    const groups = [...new Set(data.nodes.map((n) => n.group))];
    const colorMap: Record<string, string> = {};
    groups.forEach((g, i) => { colorMap[g] = GROUP_COLORS[i % GROUP_COLORS.length]; });

    // Zoom
    const g = svg.append("g");
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => g.attr("transform", event.transform))
    );

    // Pre-position nodes in a circle so they don't start mingled
    const radius = Math.min(width, height) * 0.3;
    const nodes: Node[] = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      return {
        ...n,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
      };
    });
      const nodeIds = new Set(data.nodes.map((n) => n.id));
      const edges: Edge[] = data.edges
        .filter((e) => {
          const src = typeof e.source === "string" ? e.source : (e.source as Node).id;
          const tgt = typeof e.target === "string" ? e.target : (e.target as Node).id;
          return nodeIds.has(src) && nodeIds.has(tgt);
        })
        .map((e) => ({ ...e }));

    // Simulation — fast decay, high friction so it settles quickly
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Edge>(edges).id((d) => d.id).distance(140).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(55))
      .alphaDecay(0.04)
      .velocityDecay(0.6);

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    // Arrow marker
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 38)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#444");
    // Edges
    const link = g.append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrow)");  // ← add this line

    // Edge labels
    const edgeLabel = g.append("g")
      .selectAll("text")
      .data(edges)
      .join("text")
      .attr("font-size", "9px")
      .attr("fill", "#888")
      .attr("text-anchor", "middle")
      .attr("font-family", "DM Mono, monospace")
      
      .text((d) => d.label);

    // Node groups
    const node = g.append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on("click", (_, d) => onNodeClick(d));

    // Circles
    node.append("circle")
      .attr("r", 28)
      .attr("fill", (d) => `${colorMap[d.group]}18`)
      .attr("stroke", (d) => colorMap[d.group])
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#glow)")
      .on("mouseover", function () {
        d3.select(this).attr("r", 33).attr("fill", function (d: any) {
          return `${colorMap[d.group]}35`;
        });
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 28).attr("fill", function (d: any) {
          return `${colorMap[d.group]}18`;
        });
      });

    // Labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("font-family", "DM Sans, sans-serif")
      .attr("font-weight", "500")
      .attr("fill", (d) => colorMap[d.group])
      .attr("pointer-events", "none")
      .text((d) => d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label);

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x ?? 0)
        .attr("y1", (d) => (d.source as Node).y ?? 0)
        .attr("x2", (d) => (d.target as Node).x ?? 0)
        .attr("y2", (d) => (d.target as Node).y ?? 0);

      edgeLabel
        .attr("x", (d) => (((d.source as Node).x ?? 0) + ((d.target as Node).x ?? 0)) / 2)
        .attr("y", (d) => (((d.source as Node).y ?? 0) + ((d.target as Node).y ?? 0)) / 2);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { simulation.stop(); };
  }, [data, onNodeClick]);

  return (
    <svg ref={svgRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
  );
}
