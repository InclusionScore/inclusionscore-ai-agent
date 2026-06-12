"use client";

import { useState } from "react";
import { evidenceRecords, assessmentQuestions } from "@/lib/mvp-data";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "I am your AI DISM Advisor. I can help interpret assessment gaps, request evidence, draft report language, and turn advisor decisions into implementation tasks."
  }
];

function createMockAdvisorResponse(input: string) {
  const lowerInput = input.toLowerCase();
  const unresolvedEvidence = evidenceRecords.filter((item) => item.status !== "Accepted");
  const gaps = assessmentQuestions.filter((question) => question.response !== "yes");

  if (lowerInput.includes("evidence")) {
    return `The highest-priority evidence request is ${unresolvedEvidence[0]?.title}. Ask ${unresolvedEvidence[0]?.owner} for a current artifact, then have the advisor validate sufficiency against ${unresolvedEvidence[0]?.mappedStandards.join(", ")}.`;
  }

  if (lowerInput.includes("report")) {
    return "Draft the report around three sections: current maturity, unresolved evidence blockers, and the next 30-day implementation plan. Keep the executive version focused on decisions, owners, and risk reduction.";
  }

  if (lowerInput.includes("risk") || lowerInput.includes("insurance")) {
    return "The main workforce risk signal is inconsistent proof of manager training and accommodation workflow controls. Those gaps can affect EPL underwriting confidence until evidence is current and repeatable.";
  }

  return `Start with ${gaps[0]?.domain ?? "Governance and Accountability"}. The advisor decision should convert the open gap into a specific owner, due date, evidence requirement, and readiness impact.`;
}

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("What should we do next in the DISM audit?");

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const response = createMockAdvisorResponse(trimmed);
    setMessages((current) => [...current, { role: "user", content: trimmed }, { role: "assistant", content: response }]);
    setInput("");
  }

  return (
    <section className="panel agent-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI DISM Advisor</p>
          <h2>Consultant chat</h2>
          <p className="muted">Mocked AI mode. When OpenAI is connected, this component can persist prompts and responses to Supabase.</p>
        </div>
        <span className="status-chip">Mocked AI</span>
      </div>

      <div className="chat-log" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
            <span className="pill">{message.role === "assistant" ? "Advisor" : "You"}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <div className="chat-composer">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={3} />
        <button className="primary-action" onClick={sendMessage} type="button">
          Ask advisor
        </button>
      </div>
    </section>
  );
}
