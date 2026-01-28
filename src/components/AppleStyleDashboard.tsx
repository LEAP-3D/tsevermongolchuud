"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Shield,
  Clock,
  Users,
  Settings,
  BarChart3,
  Brain,
  Ban,
  Plus,
  Copy,
  Check,
  X,
  ArrowUpRight,
  Zap,
  TrendingUp,
} from "lucide-react";

type ChatMessage = {
  id: number;
  sender: "ai" | "user";
  text: string;
};

export default function AppleStyleDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddChild, setShowAddChild] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [copiedPin, setCopiedPin] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI parenting assistant. I can help you understand your children's online activity, answer questions about safety concerns, and provide recommendations. How can I help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendMessage = (text?: string) => {
    const messageText = (text ?? chatInput).trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
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
        id: Date.now() + 1,
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

  const usageData = [
    { day: "Mon", hours: 3.5 },
    { day: "Tue", hours: 4.2 },
    { day: "Wed", hours: 2.8 },
    { day: "Thu", hours: 5.1 },
    { day: "Fri", hours: 6.3 },
    { day: "Sat", hours: 7.5 },
    { day: "Sun", hours: 5.8 },
  ];

  const categoryData = [
    { name: "Education", value: 30, color: "#007AFF" },
    { name: "Video", value: 25, color: "#5856D6" },
    { name: "Games", value: 20, color: "#FF2D55" },
    { name: "Social", value: 15, color: "#FF9500" },
    { name: "Other", value: 10, color: "#8E8E93" },
  ];

  const riskData = [
    { level: "Safe", count: 245, color: "#34C759" },
    { level: "Suspicious", count: 32, color: "#FF9500" },
    { level: "Dangerous", count: 5, color: "#FF3B30" },
  ];

  const children = [
    { id: 1, name: "Emma", status: "Active", todayUsage: "3h 45m", pin: "8472", avatar: "E" },
    { id: 2, name: "Oliver", status: "Active", todayUsage: "2h 12m", pin: "5639", avatar: "O" },
  ];

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(pin);
  };

  const copyPin = () => {
    if (!generatedPin) return;
    navigator.clipboard.writeText(generatedPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-base text-gray-500">Monitor your family's internet activity</p>
              </div>
              <div className="flex items-center gap-0 bg-gray-100 rounded-lg p-1">
                {["24h", "7days", "30days"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeFilter === filter
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {filter === "24h" ? "24h" : filter === "7days" ? "7d" : "30d"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-3">Today's Usage</p>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          E
                        </div>
                        <span className="text-sm font-medium text-gray-700">Emma</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900 ml-8">3h 45m</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          O
                        </div>
                        <span className="text-sm font-medium text-gray-700">Oliver</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900 ml-8">2h 12m</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">Healthy usage today</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Safety Score</p>
                    <p className="text-3xl font-semibold text-gray-900 mb-1">87%</p>
                    <span className="text-sm text-green-500 font-medium">Excellent</span>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Blocked Sites</p>
                    <p className="text-3xl font-semibold text-gray-900 mb-1">37</p>
                    <span className="text-sm text-gray-500">This week</span>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <Ban className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Usage Timeline</h3>
                <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                  Details <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#8E8E93"
                    axisLine={false}
                    tickLine={false}
                    style={{
                      fontSize: "13px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    axisLine={false}
                    tickLine={false}
                    style={{
                      fontSize: "13px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#007AFF"
                    strokeWidth={2.5}
                    dot={{ fill: "#007AFF", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#007AFF", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Categories</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      strokeWidth={0}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "13px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="level"
                      stroke="#8E8E93"
                      axisLine={false}
                      tickLine={false}
                      style={{
                        fontSize: "13px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    />
                    <YAxis
                      stroke="#8E8E93"
                      axisLine={false}
                      tickLine={false}
                      style={{
                        fontSize: "13px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e5e5",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                      {riskData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "ai-analysis":
        return (
          <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-4">
              <h1 className="text-4xl font-semibold text-gray-900 mb-1">AI Assistant</h1>
              <p className="text-base text-gray-500">
                Ask questions about your children's online safety and activity
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
                      className={`flex gap-3 max-w-[80%] ${
                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-blue-500"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <Users className="w-5 h-5 text-white" />
                        ) : (
                          <Brain className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
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
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">AI-Powered Insights</h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    This AI assistant analyzes your children's online behavior in real-time and provides
                    personalized recommendations to keep them safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "blocking":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-1">Content Blocking</h1>
              <p className="text-base text-gray-500">Control what your children can access online</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Blocked Websites</h3>
                  <span className="text-2xl font-bold text-red-600">37</span>
                </div>
                <p className="text-sm text-gray-600">Sites automatically blocked this week</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
                  <span className="text-2xl font-bold text-blue-600">12</span>
                </div>
                <p className="text-sm text-gray-600">Content filters currently active</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Block by Category</h3>
              <div className="space-y-3">
                {[
                  { name: "Adult Content", enabled: true, color: "red" },
                  { name: "Violence & Weapons", enabled: true, color: "red" },
                  { name: "Gambling", enabled: true, color: "orange" },
                  { name: "Social Media", enabled: false, color: "blue" },
                  { name: "Gaming", enabled: false, color: "purple" },
                ].map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          category.enabled ? "bg-red-100" : "bg-gray-200"
                        }`}
                      >
                        <Ban
                          className={`w-5 h-5 ${
                            category.enabled ? "text-red-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.enabled ? "Blocked" : "Allowed"}</p>
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        category.enabled
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {category.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Custom Website Block</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="example.com"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
                  Block Site
                </button>
              </div>
            </div>
          </div>
        );

      case "time-limits":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-1">Screen Time Limits</h1>
              <p className="text-base text-gray-500">Set healthy usage limits for your children</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Limit</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">4 hours</p>
                  <p className="text-sm text-gray-600">Maximum daily screen time</p>
                </div>
                <Clock className="w-12 h-12 text-blue-500" />
              </div>
              <input
                type="range"
                min="1"
                max="12"
                defaultValue="4"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">1h</span>
                <span className="text-xs text-gray-500">12h</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedtime Schedule</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">School Nights</p>
                    <p className="text-xs text-gray-500">Mon - Thu</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">9:00 PM - 7:00 AM</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Weekends</p>
                    <p className="text-xs text-gray-500">Fri - Sun</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">10:00 PM - 8:00 AM</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Time Limits</h3>
              <div className="space-y-3">
                {[
                  { name: "Social Media", time: "1h", color: "orange" },
                  { name: "Gaming", time: "2h", color: "purple" },
                  { name: "Video Streaming", time: "1.5h", color: "red" },
                ].map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-semibold text-gray-900">{app.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{app.time}</span>
                      <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-1">Settings</h1>
              <p className="text-base text-gray-500">Manage your ParentGuard account and preferences</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive alerts via email</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">
                    On
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Weekly Reports</p>
                    <p className="text-xs text-gray-500">Get summary every Monday</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">
                    On
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Real-time Alerts</p>
                    <p className="text-xs text-gray-500">Instant notifications for risks</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">
                    On
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-semibold text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add extra security layer</p>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-semibold text-gray-900">Data Export</p>
                  <p className="text-xs text-gray-500">Download your monitoring data</p>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Our support team is here to assist you with any questions.
              </p>
              <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        );

      case "children":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-gray-900 mb-1">Children</h1>
                <p className="text-base text-gray-500">Manage and monitor your children's accounts</p>
              </div>
              <button
                onClick={() => {
                  setShowAddChild(true);
                  generatePin();
                }}
                className="px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Child
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl p-6 border border-gray-200/80 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                      {child.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {child.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Active monitoring</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Today's Usage</p>
                      <p className="text-lg font-semibold text-gray-900">{child.todayUsage}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Safety Score</p>
                      <p className="text-lg font-semibold text-green-600">Good</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Access PIN</p>
                        <p className="text-2xl font-bold font-mono text-blue-900 tracking-wider">
                          {child.pin}
                        </p>
                      </div>
                      <button className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Copy className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Share with your child to access their device
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      View Activity
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                      Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/80">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Guide: Adding a Child</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Create Account</p>
                    <p className="text-xs text-gray-600">Click "Add Child" and enter their name</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Share PIN</p>
                    <p className="text-xs text-gray-600">Give the generated PIN to your child</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Start Monitoring</p>
                    <p className="text-xs text-gray-600">Protection begins automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {showAddChild && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200/80 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Add New Child</h3>
                    <button
                      onClick={() => setShowAddChild(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Child's Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Emma, Oliver"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter your child's first name</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Access PIN Code
                      </label>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-blue-700 mb-1">Generated PIN</p>
                            <p className="text-3xl font-bold font-mono text-blue-900 tracking-widest">
                              {generatedPin}
                            </p>
                          </div>
                          <button
                            onClick={copyPin}
                            className="w-12 h-12 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                          >
                            {copiedPin ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <Copy className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-semibold">Important:</span> Share this PIN with your child.
                          They'll need it to access their device. Keep it safe and don't share it with
                          others.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold text-base shadow-sm">
                    Create Child Account
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200/80 min-h-screen p-4">
          <div className="flex items-center gap-2 px-3 py-4 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">ParentGuard</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: "dashboard", icon: BarChart3, label: "Dashboard" },
              { id: "ai-analysis", icon: Brain, label: "AI Assistant" },
              { id: "blocking", icon: Ban, label: "Blocking" },
              { id: "time-limits", icon: Clock, label: "Time Limits" },
              { id: "children", icon: Users, label: "Children" },
              { id: "settings", icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 px-3 py-4 bg-gray-50 rounded-xl border border-gray-200/80">
            <div className="flex items-start gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-900">Upgrade to Pro</p>
                <p className="text-xs text-gray-600 mt-1">Advanced features</p>
              </div>
            </div>
            <button className="w-full mt-3 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
