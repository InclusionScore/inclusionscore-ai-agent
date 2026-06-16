"use client";

import { useState } from "react";
import type { DismAdvisorOutput } from "@/lib/agent/consultant";

type Message = {
  role: "user" | "assistant";
  content: string;
  advisorOutput?: DismAdvisorOutput;
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "I am your AI DISM Advisor. I can help interpret assessment gaps, request evidence, draft report language, and turn advisor decisions into implementation tasks."
  }
];

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("What should we do next in the DISM audit?");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setIsLoading(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");

    try {
      const response = await fetch("/api/ai/dism-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          mode: "diagnostic",
          persist: false
        })
      });

      const payload = (await response.json()) as DismAdvisorOutput & { error?: string; meta?: { mocked?: boolean } };
      if (!response.ok) {
        throw new Error(payload.error || "AI advisor request failed.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.answer,
          advisorOutput: payload
        }
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "AI advisor request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="panel agent-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI DISM Advisor</p>
          <h2>Consultant chat</h2>
          <p className="muted">Server-side advisor API. Uses OpenAI when configured and falls back to structured mocked guidance without exposing keys.</p>
        </div>
        <span className="status-chip">Server API</span>
      </div>

      <div className="chat-log" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
            <span className="pill">{message.role === "assistant" ? "Advisor" : "You"}</span>
            <p>{message.content}</p>
            {message.advisorOutput ? <AdvisorOutputDetails output={message.advisorOutput} /> : null}
          </div>
        ))}
      </div>

      <div className="chat-composer">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={3} />
        <button className="primary-action" disabled={isLoading} onClick={sendMessage} type="button">
          {isLoading ? "Asking..." : "Ask advisor"}
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}

function AdvisorOutputDetails({ output }: { output: DismAdvisorOutput }) {
  return (
    <div className="advisor-output">
      <section>
        <h3>Follow-up questions</h3>
        <ul>
          {output.follow_up_questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Standards mapping</h3>
        <ul>
          {output.standards_mapping.map((mapping) => (
            <li key={`${mapping.standard}-${mapping.concept}`}>
              <strong>{mapping.standard}:</strong> {mapping.concept}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Tasks and evidence</h3>
        <ul>
          {output.recommended_tasks.map((task) => (
            <li key={task.title}>
              <strong>{task.title}</strong> — {task.readiness_impact}
            </li>
          ))}
          {output.evidence_requests.map((evidence) => (
            <li key={evidence.title}>
              <strong>{evidence.title}</strong> — {evidence.mapped_standards.join(", ")}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Action plan</h3>
        <ol>
          {output.action_plan.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
