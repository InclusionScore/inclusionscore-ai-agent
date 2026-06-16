import { NextResponse, type NextRequest } from "next/server";
import { buildConsultantSystemPrompt } from "@/lib/agent/consultant";
import { demoInsuranceInputs, demoPremiumEstimate, type InsuranceRiskInputs, type PremiumEstimate } from "@/lib/insurance/premium-estimate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PremiumRecommendation = {
  maturity_actions: string[];
  policy_updates: string[];
  evidence_to_collect: string[];
  training_steps: string[];
  certification_actions: string[];
  premium_reduction_summary: string;
};

const fallbackRecommendation: PremiumRecommendation = {
  maturity_actions: ["Raise ISO 30415 governance readiness above 80%.", "Move ISO 30201 evidence controls to Measured maturity."],
  policy_updates: ["Refresh anti-harassment, discrimination, retaliation, accommodation, and escalation policies."],
  evidence_to_collect: ["Manager training export", "Governance RACI", "Evidence register", "Advisor review notes"],
  training_steps: ["Reach 90%+ training completion.", "Document overdue-training escalation and remediation."],
  certification_actions: ["Prepare advisor-reviewed certification readiness packet.", "Map evidence to ISO 30415 and ISO 30201 controls."],
  premium_reduction_summary:
    "Focus on evidence completeness, training coverage, and advisor-reviewed certification readiness to improve underwriting confidence."
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
  return JSON.parse(candidate) as PremiumRecommendation;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      inputs?: InsuranceRiskInputs;
      estimate?: PremiumEstimate;
    };
    const inputs = body.inputs || demoInsuranceInputs;
    const estimate = body.estimate || demoPremiumEstimate;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ...fallbackRecommendation, meta: { mocked: true, model: "fallback" } });
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
            content: `${buildConsultantSystemPrompt("workforce_risk")}

You are advising on EPL premium reduction for planning purposes only. Do not present this as a quote or binding underwriting decision.
Return only valid JSON:
{
  "maturity_actions": ["string"],
  "policy_updates": ["string"],
  "evidence_to_collect": ["string"],
  "training_steps": ["string"],
  "certification_actions": ["string"],
  "premium_reduction_summary": "string"
}`
          },
          {
            role: "user",
            content: `Review these EPL planning inputs and premium estimate. Recommend how to reduce premium pressure.\n${JSON.stringify({ inputs, estimate }, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      return NextResponse.json({ ...fallbackRecommendation, meta: { mocked: true, model, error: "OpenAI request failed" } });
    }

    const payload = (await response.json()) as unknown;
    const recommendation = parseRecommendation(extractTextFromOpenAIResponse(payload));
    return NextResponse.json({ ...recommendation, meta: { mocked: false, model } });
  } catch {
    return NextResponse.json({ ...fallbackRecommendation, meta: { mocked: true, model: "fallback" } });
  }
}
