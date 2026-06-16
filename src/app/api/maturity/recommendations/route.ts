import { NextResponse, type NextRequest } from "next/server";
import { buildConsultantSystemPrompt } from "@/lib/agent/consultant";
import { mockedMaturityDashboard, type MaturityDashboardData } from "@/lib/maturity/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type MaturityAiRecommendation = {
  top_risks: string[];
  priority_domains: string[];
  recommended_next_5_tasks: string[];
  evidence_to_collect: string[];
  certification_readiness_summary: string;
};

const fallbackRecommendation: MaturityAiRecommendation = {
  top_risks: [
    "Evidence is fragmented across standards, which weakens certification readiness.",
    "Governance and management review are not yet consistently measured.",
    "Skills, monitoring, and documented information gaps may slow multi-standard maturity improvement."
  ],
  priority_domains: ["Governance", "Skills", "Monitoring", "Documented Information"],
  recommended_next_5_tasks: [
    "Create a multi-standard evidence register.",
    "Approve governance RACI and management review cadence.",
    "Refresh skills taxonomy and training evidence by region.",
    "Define compliance monitoring cadence and reviewers.",
    "Prepare advisor review package for certification readiness."
  ],
  evidence_to_collect: ["Signed RACI", "Executive review minutes", "LMS export", "Monitoring plan", "Evidence register"],
  certification_readiness_summary:
    "The client is partially ready. Readiness depends on converting documented controls into measured evidence with clear owners, review cadence, and multi-standard evidence reuse."
};

function extractTextFromOpenAIResponse(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  if (!Array.isArray(response.output)) {
    return "";
  }

  return response.output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
        return [];
      }

      return item.content
        .map((contentItem: unknown) => {
          if (!contentItem || typeof contentItem !== "object") {
            return "";
          }

          const maybeText = contentItem as { text?: unknown };
          return typeof maybeText.text === "string" ? maybeText.text : "";
        })
        .filter(Boolean);
    })
    .join("\n");
}

function parseRecommendation(text: string) {
  const candidate = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || text.trim().match(/\{[\s\S]*\}/)?.[0] || text.trim();
  return JSON.parse(candidate) as MaturityAiRecommendation;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { dashboard?: MaturityDashboardData };
    const dashboard = body.dashboard || mockedMaturityDashboard;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ...fallbackRecommendation, meta: { model: "fallback", mocked: true } });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content: `${buildConsultantSystemPrompt("maturity_assessment")}

Return only valid JSON with this exact shape:
{
  "top_risks": ["string"],
  "priority_domains": ["string"],
  "recommended_next_5_tasks": ["string"],
  "evidence_to_collect": ["string"],
  "certification_readiness_summary": "string"
}`
          },
          {
            role: "user",
            content: `Review this client maturity dashboard and recommend what they should do next:\n${JSON.stringify(dashboard, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      return NextResponse.json({ ...fallbackRecommendation, meta: { model, mocked: true, error: "OpenAI request failed" } });
    }

    const payload = (await response.json()) as unknown;
    const recommendation = parseRecommendation(extractTextFromOpenAIResponse(payload));
    return NextResponse.json({ ...recommendation, meta: { model, mocked: false } });
  } catch {
    return NextResponse.json({ ...fallbackRecommendation, meta: { model: "fallback", mocked: true } });
  }
}
