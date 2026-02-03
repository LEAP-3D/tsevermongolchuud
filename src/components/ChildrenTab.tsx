"use client";

import { useState } from "react";
import { Plus, Copy, Activity, Shield } from "lucide-react";
import AddChildModal from "./AddChildModal";

const children = [
  {
    id: 1,
    name: "Emma",
    status: "Active",
    todayUsage: "3h 45m",
    pin: "8472",
    avatar: "E",
    safetyScore: "Good",
    color: "from-primary-400 to-primary-600",
  },
  {
    id: 2,
    name: "Oliver",
    status: "Active",
    todayUsage: "2h 12m",
    pin: "5639",
    avatar: "O",
    safetyScore: "Excellent",
    color: "from-secondary-400 to-secondary-600",
  },
];

export default function ChildrenTab() {
  const [showAddChild, setShowAddChild] = useState(false);
  const [copiedPin, setCopiedPin] = useState<number | null>(null);

  const handleCopyPin = (childId: number, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(childId);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Family Members
          </h1>
          <p className="text-lg text-slate-600">
            Manage and monitor your children's digital activity
          </p>
        </div>
        <button
          onClick={() => setShowAddChild(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft hover:shadow-soft-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Family Member
        </button>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl p-7 border border-slate-200 shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${child.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-soft`}>
                {child.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {child.name}
                  </h3>
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-xs font-bold rounded-lg">
                    {child.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Active monitoring enabled
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-1.5 uppercase tracking-wide">
                  Today's Usage
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {child.todayUsage}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${
                child.safetyScore === "Excellent" 
                  ? "from-secondary-50 to-secondary-100/50 border-secondary-200" 
                  : "from-primary-50 to-primary-100/50 border-primary-200"
              } rounded-xl p-4 border`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Shield className={`w-3.5 h-3.5 ${
                    child.safetyScore === "Excellent" ? "text-secondary-600" : "text-primary-600"
                  }`} />
                  <p className={`text-xs font-semibold uppercase tracking-wide ${
                    child.safetyScore === "Excellent" ? "text-secondary-600" : "text-primary-600"
                  }`}>
                    Safety Score
                  </p>
                </div>
                <p className={`text-2xl font-bold ${
                  child.safetyScore === "Excellent" ? "text-secondary-700" : "text-primary-700"
                }`}>
                  {child.safetyScore}
                </p>
              </div>
            </div>

            {/* PIN Section */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-5 border border-primary-200 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wide">
                    Access PIN
                  </p>
                  <p className="text-3xl font-bold font-mono text-primary-900 tracking-wider">
                    {child.pin}
                  </p>
                </div>
                <button 
                  onClick={() => handleCopyPin(child.id, child.pin)}
                  className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft hover:shadow-soft-lg"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-primary-700 font-medium">
                {copiedPin === child.id ? "PIN copied to clipboard!" : "Share with your child to access their device"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all">
                View Activity
              </button>
              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Child Modal */}
      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} />}
    </div>
  );
}
