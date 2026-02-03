"use client";

import { Ban, Shield, Globe, Plus } from "lucide-react";

export default function BlockingTab() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-slate-900 mb-2">
          Content Blocking
        </h1>
        <p className="text-base text-slate-500">
          Control what your children can access online
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] hover:shadow-[0_20px_50px_-35px_rgba(15,23,42,0.6)] transition-all duration-200 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-500" />
              Blocked Websites
            </h3>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              37
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Sites automatically blocked this week
          </p>
        </div>

        <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] hover:shadow-[0_20px_50px_-35px_rgba(15,23,42,0.6)] transition-all duration-200 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Active Filters
            </h3>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              12
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Content filters currently active
          </p>
        </div>
      </div>

      <div className="bg-white/75 rounded-3xl border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] overflow-hidden backdrop-blur">
        <div className="p-6 border-b border-white/60">
          <h3 className="text-lg font-semibold text-slate-900">
            Block by Category
          </h3>
        </div>
        <div className="divide-y divide-white/60">
          {[
            { name: "Adult Content", enabled: true, color: "red" },
            { name: "Violence & Weapons", enabled: true, color: "red" },
            { name: "Gambling", enabled: true, color: "orange" },
            { name: "Social Media", enabled: false, color: "blue" },
            { name: "Gaming", enabled: false, color: "purple" },
          ].map((category, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-6 hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${category.enabled ? "bg-rose-50" : "bg-slate-100"}`}
                >
                  <Ban
                    className={`w-5 h-5 ${category.enabled ? "text-rose-600" : "text-slate-400"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {category.enabled ? "Access restricted" : "Access allowed"}
                  </p>
                </div>
              </div>
              <button
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  category.enabled
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {category.enabled ? "Blocking" : "Allowed"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/70 rounded-3xl p-8 border border-white/70 border-dashed shadow-[0_18px_45px_-35px_rgba(15,23,42,0.4)] backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-2xl border border-white/80 shadow-sm">
            <Globe className="w-5 h-5 text-slate-700" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Add Custom Website Block
          </h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="example.com"
            className="flex-1 px-4 py-3 bg-white border border-white/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-sm"
          />
          <button className="px-6 py-3 bg-slate-900 text-white font-medium rounded-2xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Block Site
          </button>
        </div>
      </div>
    </div>
  );
}
