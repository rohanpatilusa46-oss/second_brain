import OpenAI from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return Response.json({ error: "Please enter at least a few sentences." }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a knowledge graph extractor. Given notes or text, extract the key concepts and their relationships.

Return ONLY a JSON object in this exact format:
{
  "nodes": [
    { "id": "concept_id", "label": "Concept Name", "group": "category_name", "summary": "One sentence about this concept from the text" }
  ],
  "edges": [
    { "source": "concept_id_1", "target": "concept_id_2", "label": "relationship verb" }
  ],
  "stats": {
    "concepts": 10,
    "connections": 8,
    "clusters": 3
  }
}

Rules:
- Extract 8-20 nodes (concepts, ideas, people, tools, places — whatever is meaningful)
- Each node needs a unique id (snake_case), a short label (2-4 words max), a group (for coloring clusters), and a brief summary
- Create edges showing meaningful relationships between concepts
- Use short relationship labels: "uses", "leads to", "supports", "contradicts", "part of", "enables", "requires", "related to"
- Group related concepts under the same group name (3-5 groups max)
- Make sure every node id used in edges exists in nodes array`,
        },
        {
          role: "user",
          content: `Extract a knowledge graph from these notes:\n\n${text.slice(0, 4000)}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const graph = JSON.parse(raw);

    return Response.json(graph);
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
