"use client";

import { useState } from "react";
import { Brain, Users, ArrowUpRight, Sparkles } from "lucide-react";

type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export default function AiAnalysisTab() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your AI parenting assistant. I can help you understand your children's online activity, answer questions about safety concerns, and provide recommendations. How can I help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendMessage = (text?: string) => {
    const messageText = (text ?? chatInput).trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: messageText,
    };
    setChatMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiResponses = [
        "Based on the recent activity, Emma has been browsing educational content for 2.5 hours today, which is great! Oliver spent 45 minutes on gaming sites, which is within the healthy limit you've set.",
        "I've analyzed the suspicious content flagged earlier. It appears to be a social media discussion that mentioned mature topics. I recommend reviewing it together with your child to provide context and guidance.",
        "Your children's safety scores are both above 85%, which is excellent. The main areas to watch are late-night usage and ensure gaming time doesn't exceed the 2-hour daily limit.",
        "I can help you set up better time limits. Would you like me to suggest an age-appropriate schedule based on Emma and Oliver's ages?",
      ];
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    }, 1000);

    setChatInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-slate-900 mb-2">
          AI Assistant
        </h1>
        <p className="text-base text-slate-500">
          Ask questions about your children`s online safety and activity
        </p>
      </div>

      <div className="flex-1 bg-white/75 rounded-3xl border border-white/80 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] flex flex-col overflow-hidden backdrop-blur">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${message.sender === "user" ? "bg-slate-900" : "bg-gradient-to-br from-amber-500 to-rose-500"}`}
                >
                  {message.sender === "user" ? (
                    <Users className="w-4 h-4 text-white" />
                  ) : (
                    <Brain className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-5 py-3.5 shadow-sm ${message.sender === "user" ? "bg-slate-900 text-white" : "bg-white border border-white/70 text-slate-700"}`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-white/60 bg-white/50">
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
            Suggested actions
          </p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "What did Emma browse today?",
              "Are there any safety concerns?",
              "Show me weekly summary",
              "How much screen time left?",
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="px-3.5 py-2 bg-white border border-white/80 rounded-full text-xs font-medium text-slate-600 hover:border-amber-200 hover:text-slate-900 hover:bg-amber-50 transition-all shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/60 bg-white/70">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about safety, screen time, or specific activities..."
              className="flex-1 px-4 py-3 bg-white border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 text-sm transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!chatInput.trim()}
              className="px-5 py-3 bg-slate-900 text-white font-medium rounded-2xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl p-5 border border-amber-100/60 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
              AI-Powered Insights
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              This AI assistant analyzes your children`s online behavior in
              real-time and provides personalized recommendations to keep them
              safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
