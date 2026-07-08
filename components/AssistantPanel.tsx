"use client";

import { useState, useTransition } from "react";
import { askAssistant } from "@/lib/actions/assistant";
import { QUICK_ACTIONS } from "@/lib/assistant";

type Message = { role: "user" | "assistant"; text: string };

export default function AssistantPanel({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Ask me about your profit, expenses, invoices, or sales. Try a quick action below." },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function ask(question: string) {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    startTransition(async () => {
      const answer = await askAssistant(question);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    });
  }

  return (
    <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <h2 className="mb-3 text-sm font-medium text-[#0b0b0b] dark:text-white">Assistant</h2>
      <div className={`flex flex-col gap-2 overflow-y-auto ${compact ? "max-h-48" : "max-h-96"}`}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-[#2a78d6] text-white"
                : "self-start bg-[#e1e0d9]/50 text-[#0b0b0b] dark:bg-[#2c2c2a] dark:text-white"
            }`}
          >
            {m.text}
          </div>
        ))}
        {isPending && (
          <div className="self-start rounded-lg bg-[#e1e0d9]/50 px-3 py-2 text-sm text-[#898781] dark:bg-[#2c2c2a]">
            Thinking...
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            onClick={() => ask(qa.question)}
            disabled={isPending}
            className="rounded-full border border-[#c3c2b7] px-3 py-1 text-xs font-medium hover:bg-[#e1e0d9]/40 disabled:opacity-60 dark:hover:bg-[#2c2c2a]"
          >
            {qa.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 rounded-md border border-[#c3c2b7] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#2a78d6]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#2a78d6] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
