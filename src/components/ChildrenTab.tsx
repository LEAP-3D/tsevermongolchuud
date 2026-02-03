"use client";

import { useState } from "react";
import { Plus, Copy } from "lucide-react";
import AddChildModal from "./AddChildModal";

const children = [
  {
    id: 1,
    name: "Emma",
    status: "Active",
    todayUsage: "3h 45m",
    pin: "8472",
    avatar: "E",
  },
  {
    id: 2,
    name: "Oliver",
    status: "Active",
    todayUsage: "2h 12m",
    pin: "5639",
    avatar: "O",
  },
];

export default function ChildrenTab() {
  const [showAddChild, setShowAddChild] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-5xl text-slate-900 mb-2">
            Children
          </h1>
          <p className="text-base text-slate-500">
            Manage and monitor your children`s accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddChild(true)}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white/75 rounded-3xl p-6 border border-white/80 hover:shadow-[0_25px_60px_-40px_rgba(15,23,42,0.6)] transition-all backdrop-blur"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {child.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {child.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    {child.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">Active monitoring</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
                <p className="text-xs text-slate-600 mb-1">Today`s Usage</p>
                <p className="text-lg font-semibold text-slate-900">
                  {child.todayUsage}
                </p>
              </div>
              <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
                <p className="text-xs text-slate-600 mb-1">Safety Score</p>
                <p className="text-lg font-semibold text-emerald-600">Good</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/70 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-1">
                    Access PIN
                  </p>
                  <p className="text-2xl font-bold font-mono text-amber-900 tracking-wider">
                    {child.pin}
                  </p>
                </div>
                <button className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors">
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Share with your child to access their device
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-white/80 text-slate-900 text-sm font-medium rounded-2xl hover:bg-white transition-colors border border-white/70">
                View Activity
              </button>
              <button className="flex-1 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-2xl hover:bg-slate-800 transition-colors">
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddChild && <AddChildModal onClose={() => setShowAddChild(false)} />}
    </div>
  );
}
