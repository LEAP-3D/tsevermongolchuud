"use client";

import { useState } from "react";
import { Brain, Users, ArrowUpRight, Sparkles, MessageCircle } from "lucide-react";

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
    <div className="h-[calc(100vh-120px)] flex flex-col w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          AI Assistant
        </h1>
        <p className="text-lg text-slate-600">
          Get intelligent insights and guidance for your family's digital wellbeing
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-soft flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft ${
                    message.sender === "user" 
                      ? "bg-linear-to-br from-primary-500 to-primary-600" 
                      : "bg-linear-to-br from-secondary-400 to-secondary-600"
                  }`}
                >
                  {message.sender === "user" ? (
                    <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                  ) : (
                    <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-5 py-4 shadow-soft ${
                    message.sender === "user" 
                      ? "bg-linear-to-br from-primary-500 to-primary-600 text-white" 
                      : "bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 text-slate-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Actions */}
        <div className="px-6 py-5 border-t border-slate-200 bg-linear-to-br from-slate-50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-slate-600" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Quick Questions
            </p>
          </div>
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
                className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all shadow-soft hover:shadow-soft-lg"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-slate-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about safety, screen time, or specific activities..."
              className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!chatInput.trim()}
              className="px-6 py-4 bg-linear-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-linear-to-br from-secondary-50 to-secondary-100/50 rounded-2xl p-6 border border-secondary-200 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shrink-0 shadow-soft">
            <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              AI-Powered Family Protection
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              This AI assistant analyzes your children's online behavior in real-time and provides personalized recommendations to keep them safe and healthy online.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
