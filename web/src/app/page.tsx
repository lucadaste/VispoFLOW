"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "ai" | "user";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

interface Doc {
  id: string;
  name: string;
  category: string;
  status: "draft" | "ready";
}

// ── Constants ────────────────────────────────────────────────────────────────

const WELCOME: Message = {
  id: "0",
  role: "ai",
  content: "Hello Matteo, how can I help you today?",
};

const QUICK_ACTIONS = [
  "I'd like to do an incorporation",
  "I need to issue stock options",
];

let _id = 0;
const genId = () => String(++_id);

function getAIResponse(input: string): { content: string; docs?: Doc[] } {
  const l = input.toLowerCase();

  if (l.includes("incorporat")) {
    return {
      content:
        "Great! I can help you incorporate your business. To get started, I'll need a few details:\n\n• What is the company name?\n• Which state would you like to incorporate in? Delaware is the most popular choice for startups due to its flexible corporate laws.\n• Who are the founders and what is the equity split?\n\nI've started preparing your core formation documents in the panel on the right.",
      docs: [
        { id: "d1", name: "Certificate of Incorporation", category: "Formation", status: "draft" },
        { id: "d2", name: "Bylaws", category: "Formation", status: "draft" },
        { id: "d3", name: "Founder Agreement", category: "Formation", status: "draft" },
      ],
    };
  }

  if (l.includes("stock") || l.includes("option") || l.includes("equity")) {
    return {
      content:
        "I can help you set up a stock option plan. Before we proceed:\n\n• Is your company already incorporated?\n• How many authorized shares does it have?\n• What percentage would you like to reserve for the option pool?\n\nCompanies typically reserve 10–20% of fully diluted shares for employee equity.",
      docs: [
        { id: "d4", name: "Stock Option Plan", category: "Equity", status: "draft" },
        { id: "d5", name: "83(b) Election Form", category: "Equity", status: "draft" },
      ],
    };
  }

  return {
    content:
      "Thanks for the details. I'm reviewing your request and will update the documents shortly. Is there anything else you'd like to add?",
  };
}

// ── Icons ────────────────────────────────────────────────────────────────────

function ScalesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3v18" />
      <path d="M3 7l9-4 9 4" />
      <path d="M6 7L3 14c0 1.657 1.343 3 3 3s3-1.343 3-3L6 7z" />
      <path d="M18 7l-3 7c0 1.657 1.343 3 3 3s3-1.343 3-3l-3-7z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

function RestartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function VispoApp() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showQuickActions = messages.length === 1 && !isTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleRestart() {
    setMessages([WELCOME]);
    setDocs([]);
    setInput("");
    setIsTyping(false);
  }

  function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: genId(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { content, docs: newDocs } = getAIResponse(text);
      const aiMsg: Message = { id: genId(), role: "ai", content };
      setMessages((prev) => [...prev, aiMsg]);
      if (newDocs) {
        setDocs((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          return [...prev, ...newDocs.filter((d) => !existingIds.has(d.id))];
        });
      }
      setIsTyping(false);
    }, 1000);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden" style={{ fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200 flex-shrink-0 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            <ScalesIcon className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">Vispo</p>
            <p className="text-xs text-gray-500">Incorporation Studio</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-black text-white">
            Formation
          </span>
          <div className="w-6 h-px bg-gray-300" />
          <span className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-300 text-gray-500 bg-white">
            Compliance
          </span>
        </div>

        {/* Restart */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RestartIcon className="w-3.5 h-3.5" />
          Restart demo
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Chat Panel ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ScalesIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "ai"
                      ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                      : "bg-black text-white rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <ScalesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-gray-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0">
            {showQuickActions && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={isTyping}
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Send
                <SendIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Document Panel ──────────────────────────────────────────────── */}
        <div className="w-[300px] border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
              <FileIcon className="w-11 h-11 text-gray-300" />
              <div>
                <p className="text-sm font-semibold text-gray-700">No documents yet</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[180px] mx-auto">
                  Start the conversation and your formation documents will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-4 overflow-y-auto">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-0.5">
                Documents
              </p>
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-start gap-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-gray-400">{doc.category}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 capitalize font-medium">
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
