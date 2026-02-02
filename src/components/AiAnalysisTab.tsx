"use client";

import { useState } from "react";
import { Brain, Users, ArrowUpRight } from "lucide-react";

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
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-semibold text-gray-900 mb-1">
          AI Assistant
        </h1>
        <p className="text-base text-gray-500">
          Ask questions about your children`s online safety and activity
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 flex flex-col overflow-hidden">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-blue-500" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}
                >
                  {message.sender === "user" ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <Brain className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What did Emma browse today?",
              "Are there any safety concerns?",
              "Show me weekly summary",
              "How much screen time left?",
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(question)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your children's online activity..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!chatInput.trim()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-purple-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              AI-Powered Insights
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
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
