import { NextResponse, type NextRequest } from "next/server";
import { buildConsultantSystemPrompt } from "@/lib/agent/consultant";
import {
  buildDiagnosticPrompt,
  diagnosticResultSchemaInstruction,
  type DiagnosticAnswer,
  type DiagnosticDemoResult
} from "@/lib/agent/diagnostic-demo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DiagnosticRequest = {
  organizationId?: string;
  answers?: DiagnosticAnswer[];
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

function parseDiagnosticResult(text: string) {
  const trimmed = text.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fencedJson || trimmed.match(/\{[\s\S]*\}/)?.[0] || trimmed;

  try {
    return JSON.parse(candidate) as DiagnosticDemoResult;
  } catch {
    throw new Error("The AI response could not be parsed into the required diagnostic format. Please run the diagnostic again.");
  }
}

async function runOpenAIDiagnostic(organizationName: string, answers: DiagnosticAnswer[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for the working AI DISM Advisor demo flow.");
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
          content: `${buildConsultantSystemPrompt("diagnostic")}\n\n${diagnosticResultSchemaInstruction}`
        },
        {
          role: "user",
          content: buildDiagnosticPrompt(organizationName, answers)
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as unknown;
  return {
    result: parseDiagnosticResult(extractTextFromOpenAIResponse(payload)),
    model
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DiagnosticRequest;

    if (!body.organizationId) {
      return NextResponse.json({ error: "Organization is required." }, { status: 400 });
    }

    if (!body.answers || body.answers.length < 5) {
      return NextResponse.json({ error: "At least five diagnostic answers are required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in before running the diagnostic." }, { status: 401 });
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id, tenant_id, name, industry, employee_count_band")
      .eq("id", body.organizationId)
      .single();

    if (organizationError || !organization) {
      throw new Error("Organization was not found or is not accessible.");
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        tenant_id: organization.tenant_id,
        organization_id: organization.id,
        name: "Workforce Risk / DISM Diagnostic",
        standard_set: ["DISM", "ISO 30415", "ISO 30201"],
        status: "in_progress",
        scope: "organization",
        current_domain: "Workforce Risk",
        created_by: user.id
      })
      .select("id")
      .single();

    if (assessmentError) {
      throw new Error(`Could not create assessment: ${assessmentError.message}`);
    }

    let result: DiagnosticDemoResult;
    let model: string;

    try {
      const aiResponse = await runOpenAIDiagnostic(organization.name, body.answers);
      result = aiResponse.result;
      model = aiResponse.model;
    } catch (aiError) {
      await supabase
        .from("assessments")
        .update({
          status: "advisor_review",
          completed_at: new Date().toISOString()
        })
        .eq("id", assessment.id);

      await supabase.from("audit_logs").insert({
        tenant_id: organization.tenant_id,
        organization_id: organization.id,
        actor_user_id: user.id,
        action: "diagnostic.ai_failed",
        resource_type: "assessment",
        resource_id: assessment.id,
        summary: "AI DISM diagnostic failed before results could be saved.",
        metadata: {
          error: aiError instanceof Error ? aiError.message : "Unknown AI failure"
        }
      });

      throw aiError;
    }
    const averageLevel = Math.round(result.maturity_summary.overall_level * 10) / 10;
    const readinessPercent = Math.max(0, Math.min(100, Math.round((averageLevel / 5) * 100)));
    const highestSeverity = result.top_risks.some((risk) => risk.severity === "critical")
      ? "critical"
      : result.top_risks.some((risk) => risk.severity === "high")
        ? "high"
        : result.top_risks.some((risk) => risk.severity === "medium")
          ? "watchlist"
          : "preferred";

    const { data: conversation, error: conversationError } = await supabase
      .from("ai_conversations")
      .insert({
        tenant_id: organization.tenant_id,
        organization_id: organization.id,
        assessment_id: assessment.id,
        title: "Workforce Risk / DISM Diagnostic",
        mode: "diagnostic",
        model,
        created_by: user.id
      })
      .select("id")
      .single();

    if (conversationError) {
      throw new Error(`Could not create AI conversation: ${conversationError.message}`);
    }

    const answerTranscript = body.answers.map((answer) => `${answer.domain}: ${answer.question}\n${answer.answer}`).join("\n\n");
    const { error: messageError } = await supabase.from("ai_messages").insert([
      {
        conversation_id: conversation.id,
        tenant_id: organization.tenant_id,
        organization_id: organization.id,
        assessment_id: assessment.id,
        role: "user",
        content: answerTranscript,
        structured_output: { answers: body.answers },
        created_by: user.id
      },
      {
        conversation_id: conversation.id,
        tenant_id: organization.tenant_id,
        organization_id: organization.id,
        assessment_id: assessment.id,
        role: "assistant",
        content: result.advisor_summary,
        structured_output: result,
        created_by: user.id
      }
    ]);

    if (messageError) {
      throw new Error(`Could not save AI messages: ${messageError.message}`);
    }

    const evidenceRows = result.evidence_requests.map((evidenceRequest) => ({
      tenant_id: organization.tenant_id,
      organization_id: organization.id,
      assessment_id: assessment.id,
      title: evidenceRequest.title,
      description: evidenceRequest.description,
      mapped_standards: evidenceRequest.mapped_standards,
      mapped_concepts: result.standards_mapping.map((mapping) => `${mapping.standard}: ${mapping.concept}`),
      owner_name: evidenceRequest.owner_hint,
      status: "requested",
      freshness: "unknown"
    }));

    const { data: evidence, error: evidenceError } = evidenceRows.length
      ? await supabase.from("evidence").insert(evidenceRows).select("id, title, status, mapped_standards, owner_name")
      : { data: [], error: null };

    if (evidenceError) {
      throw new Error(`Could not save evidence requests: ${evidenceError.message}`);
    }

    const taskRows = result.implementation_tasks.map((task) => ({
      tenant_id: organization.tenant_id,
      organization_id: organization.id,
      assessment_id: assessment.id,
      title: task.title,
      description: task.description,
      domain: task.domain,
      mapped_concepts: result.standards_mapping.map((mapping) => `${mapping.standard}: ${mapping.concept}`),
      priority: task.priority,
      implementation_phase: task.implementation_phase,
      required_evidence: task.required_evidence,
      risk_implication: task.risk_implication,
      readiness_impact: task.readiness_impact,
      created_by: user.id
    }));

    const { data: tasks, error: taskError } = taskRows.length
      ? await supabase.from("tasks").insert(taskRows).select("id, title, status, priority, domain")
      : { data: [], error: null };

    if (taskError) {
      throw new Error(`Could not save implementation tasks: ${taskError.message}`);
    }

    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        status: "report_ready",
        maturity_score: averageLevel,
        readiness_percent: readinessPercent,
        risk_level: highestSeverity,
        completed_at: new Date().toISOString()
      })
      .eq("id", assessment.id);

    if (updateError) {
      throw new Error(`Could not update assessment: ${updateError.message}`);
    }

    await supabase.from("audit_logs").insert({
      tenant_id: organization.tenant_id,
      organization_id: organization.id,
      actor_user_id: user.id,
      action: "diagnostic.completed",
      resource_type: "assessment",
      resource_id: assessment.id,
      summary: "Workforce Risk / DISM diagnostic completed with OpenAI-generated advisor output.",
      metadata: {
        conversation_id: conversation.id,
        task_count: tasks?.length || 0,
        evidence_count: evidence?.length || 0,
        model
      }
    });

    return NextResponse.json({
      organization,
      assessment: {
        id: assessment.id,
        maturity_score: averageLevel,
        readiness_percent: readinessPercent,
        risk_level: highestSeverity
      },
      conversationId: conversation.id,
      result,
      tasks: tasks || [],
      evidence: evidence || [],
      meta: { model }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not complete diagnostic." }, { status: 500 });
  }
}
