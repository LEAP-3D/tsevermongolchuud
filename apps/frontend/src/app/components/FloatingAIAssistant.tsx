"use client";

import { Bot, MessageCircle, SendHorizontal, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./types";

type FloatingAIAssistantProps = {
  messages: ChatMessage[];
  chatInput: string;
  onChangeInput: (value: string) => void;
  onSendMessage: (override?: string) => void;
  quickPrompts: string[];
};

export default function FloatingAIAssistant({
  messages,
  chatInput,
  onChangeInput,
  onSendMessage,
  quickPrompts,
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messageContainerRef.current?.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-24 md:right-8">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <p className="text-sm font-semibold">AI Assistant</p>
            </div>
            <button
              type="button"
              aria-label="Close AI chat"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-white/90 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-slate-100 bg-slate-50 px-3 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <Sparkles className="h-3 w-3" />
              Start With A Prompt
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSendMessage(prompt)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={messageContainerRef}
            className="max-h-[46vh] min-h-48 space-y-3 overflow-y-auto bg-white px-3 py-3"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <span className="mt-0.5 rounded-full bg-indigo-100 p-1.5 text-indigo-600">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === "user"
                      ? "rounded-tr-md bg-indigo-500 text-white"
                      : "rounded-tl-md bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <span className="mt-0.5 rounded-full bg-indigo-500 p-1.5 text-white">
                    <User className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-b-2xl border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={(event) => onChangeInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSendMessage();
                  }
                }}
                rows={2}
                placeholder="Ask anything about your children's activity..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200/70"
              />
              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!chatInput.trim()}
                className="inline-flex h-auto items-center justify-center rounded-xl bg-indigo-500 px-3 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-5 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg ring-4 ring-white transition hover:scale-105 hover:from-indigo-600 hover:to-blue-600 md:bottom-8 md:right-8"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
