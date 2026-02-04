"use client";

import { ArrowUpRight, Brain, Users } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { ChatMessage } from './types';

export type AIAssistantContentProps = {
  messages: ChatMessage[];
  chatInput: string;
  onChangeInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void;
  onQuickQuestion: (question: string) => void;
};

export default function AIAssistantContent({
  messages,
  chatInput,
  onChangeInput,
  onSendMessage,
  onKeyPress,
  onQuickQuestion
}: AIAssistantContentProps) {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-semibold text-gray-900 mb-1">AI Assistant</h1>
        <p className="text-base text-gray-500">Ask questions about your children&apos;s online safety and activity</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <Brain className="w-5 h-5 text-white" />
                  )}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
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
              'What did Emma browse today?',
              'Are there any safety concerns?',
              'Show me weekly summary',
              'How much screen time left?'
            ].map((question, idx) => (
              <button
                key={idx}
                onClick={() => onQuickQuestion(question)}
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
              onChange={event => onChangeInput(event.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Ask me anything about your children&apos;s online activity..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={onSendMessage}
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
            <h3 className="text-sm font-semibold text-gray-900 mb-1">AI-Powered Insights</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              This AI assistant analyzes your children&apos;s online behavior in real-time and provides personalized recommendations to keep them safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
