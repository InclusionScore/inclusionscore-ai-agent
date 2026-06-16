import { NextResponse, type NextRequest } from "next/server";
import {
  buildConsultantSystemPrompt,
  buildMockDismAdvisorOutput,
  type AgentMode,
  type DismAdvisorOutput
} from "@/lib/agent/consultant";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
  isSupabaseServerConfigured,
  isSupabaseServiceRoleConfigured
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdvisorRequest = {
  message?: string;
  mode?: AgentMode;
  conversationId?: string;
  tenantId?: string;
  organizationId?: string;
  assessmentId?: string;
  persist?: boolean;
};

type PersistedIds = {
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
  taskIds: string[];
  evidenceIds: string[];
};

const outputInstruction = `
Return only valid JSON with this exact shape:
{
  "answer": "string",
  "follow_up_questions": ["string"],
  "standards_mapping": [{"standard": "ISO 30415|ISO 30201|DISM", "concept": "string", "rationale": "string"}],
  "maturity_gaps": [{"domain": "string", "current_level": 1, "target_level": 4, "gap": "string"}],
  "recommended_tasks": [{"title": "string", "description": "string", "domain": "string", "priority": "low|medium|high|critical", "implementation_phase": "plan|do|check|act", "required_evidence": ["string"], "risk_implication": "string", "readiness_impact": "string"}],
  "evidence_requests": [{"title": "string", "description": "string", "mapped_standards": ["string"], "owner_hint": "string"}],
  "risk_implications": ["string"],
  "certification_readiness": {"readiness_level": "not_ready|partially_ready|ready_for_advisor_review|ready", "blockers": ["string"]},
  "action_plan": ["string"]
}
`;

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

function parseAdvisorOutput(text: string, fallbackMessage: string): DismAdvisorOutput {
  try {
    return JSON.parse(text) as DismAdvisorOutput;
  } catch {
    return {
      ...buildMockDismAdvisorOutput(fallbackMessage),
      answer: text.trim() || buildMockDismAdvisorOutput(fallbackMessage).answer
    };
  }
}

async function runOpenAIAdvisor(message: string, mode: AgentMode) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      output: buildMockDismAdvisorOutput(message),
      model: "mocked",
      mocked: true
    };
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
          content: `${buildConsultantSystemPrompt(mode)}\n\n${outputInstruction}`
        },
        {
          role: "user",
          content: message
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
    output: parseAdvisorOutput(extractTextFromOpenAIResponse(payload), message),
    model,
    mocked: false
  };
}

async function getAuthenticatedUserId(organizationId?: string) {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (organizationId) {
    const { error } = await supabase.from("organizations").select("id").eq("id", organizationId).single();
    if (error) {
      throw new Error("User does not have access to this organization.");
    }
  }

  return user.id;
}

async function persistAdvisorExchange(request: AdvisorRequest, output: DismAdvisorOutput, model: string, userId: string | null): Promise<PersistedIds> {
  const persisted: PersistedIds = {
    conversationId: request.conversationId,
    taskIds: [],
    evidenceIds: []
  };

  if (!request.persist || !isSupabaseServiceRoleConfigured()) {
    return persisted;
  }

  const supabase = createSupabaseServiceRoleClient();
  let conversationId = request.conversationId;

  if (!conversationId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        tenant_id: request.tenantId || null,
        organization_id: request.organizationId || null,
        assessment_id: request.assessmentId || null,
        mode: request.mode || "diagnostic",
        model,
        created_by: userId
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Could not create AI conversation: ${error.message}`);
    }

    conversationId = data.id as string;
    persisted.conversationId = conversationId;
  }

  if (conversationId) {
    const { data: userMessage, error: userMessageError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        tenant_id: request.tenantId || null,
        organization_id: request.organizationId || null,
        assessment_id: request.assessmentId || null,
        role: "user",
        content: request.message || "",
        created_by: userId
      })
      .select("id")
      .single();

    if (userMessageError) {
      throw new Error(`Could not persist user message: ${userMessageError.message}`);
    }

    persisted.userMessageId = userMessage.id as string;

    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        tenant_id: request.tenantId || null,
        organization_id: request.organizationId || null,
        assessment_id: request.assessmentId || null,
        role: "assistant",
        content: output.answer,
        structured_output: output,
        created_by: userId
      })
      .select("id")
      .single();

    if (assistantMessageError) {
      throw new Error(`Could not persist assistant message: ${assistantMessageError.message}`);
    }

    persisted.assistantMessageId = assistantMessage.id as string;
  }

  if (request.tenantId && request.organizationId) {
    const taskRows = output.recommended_tasks.map((task) => ({
      tenant_id: request.tenantId,
      organization_id: request.organizationId,
      assessment_id: request.assessmentId || null,
      title: task.title,
      description: task.description,
      domain: task.domain,
      mapped_concepts: output.standards_mapping.map((mapping) => `${mapping.standard}: ${mapping.concept}`),
      priority: task.priority,
      implementation_phase: task.implementation_phase,
      required_evidence: task.required_evidence,
      risk_implication: task.risk_implication,
      readiness_impact: task.readiness_impact,
      created_by: userId
    }));

    if (taskRows.length > 0) {
      const { data, error } = await supabase.from("tasks").insert(taskRows).select("id");
      if (error) {
        throw new Error(`Could not create tasks: ${error.message}`);
      }
      persisted.taskIds = (data || []).map((row) => row.id as string);
    }

    const evidenceRows = output.evidence_requests.map((evidenceRequest) => ({
      tenant_id: request.tenantId,
      organization_id: request.organizationId,
      assessment_id: request.assessmentId || null,
      title: evidenceRequest.title,
      description: evidenceRequest.description,
      mapped_standards: evidenceRequest.mapped_standards,
      mapped_concepts: output.standards_mapping.map((mapping) => `${mapping.standard}: ${mapping.concept}`),
      owner_name: evidenceRequest.owner_hint,
      status: "requested"
    }));

    if (evidenceRows.length > 0) {
      const { data, error } = await supabase.from("evidence").insert(evidenceRows).select("id");
      if (error) {
        throw new Error(`Could not create evidence requests: ${error.message}`);
      }
      persisted.evidenceIds = (data || []).map((row) => row.id as string);
    }

    await supabase.from("audit_logs").insert({
      tenant_id: request.tenantId,
      organization_id: request.organizationId,
      actor_user_id: userId,
      action: "ai_advisor.exchange",
      resource_type: "ai_conversation",
      resource_id: conversationId || null,
      summary: "AI DISM Advisor generated guidance, evidence requests, and implementation tasks.",
      metadata: {
        task_ids: persisted.taskIds,
        evidence_ids: persisted.evidenceIds,
        model
      }
    });
  }

  return persisted;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AdvisorRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }

    const mode = body.mode || "diagnostic";
    const userId = await getAuthenticatedUserId(body.organizationId);
    const { output, model, mocked } = await runOpenAIAdvisor(message, mode);
    const persisted = await persistAdvisorExchange({ ...body, message, mode }, output, model, userId);

    return NextResponse.json({
      ...output,
      meta: {
        model,
        mocked,
        persisted
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI advisor request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
