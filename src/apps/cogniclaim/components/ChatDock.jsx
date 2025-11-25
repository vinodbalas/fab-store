import { X } from "lucide-react";
import { useState } from "react";

export default function ChatDock({ open, onClose, claim }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi! You can ask me anything about this claim." },
  ]);
  const [input, setInput] = useState("");

  if (!open) return null;

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }, { from: "ai", text: "Let me check SOP 3.2.1 — this rule covers pre-auth steps (mock)." }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg h-[35vh] flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="font-semibold text-[#612D91]">Ask Cogniclaim (AI Assistant)</div>
        <button onClick={onClose}>
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-2 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[70%] p-2 rounded-md ${
              m.from === "ai"
                ? "bg-[#612D91]/10 text-[#612D91]"
                : "bg-gray-200 dark:bg-gray-800 self-end"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this claim..."
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800"
        />
        <button
          onClick={send}
          className="px-3 py-2 bg-[#612D91] text-white rounded-md text-sm hover:bg-[#612D91]/90"
        >
          Send
        </button>
      </div>
    </div>
  );
}
