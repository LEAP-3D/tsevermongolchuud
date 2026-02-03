"use client";

import { Ban, Shield, Globe, Plus, AlertTriangle } from "lucide-react";

export default function BlockingTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          Content Blocking
        </h1>
        <p className="text-lg text-slate-600">
          Control what your children can access online with smart filtering
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-danger-50 to-danger-100/50 rounded-2xl p-6 border border-danger-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="w-5 h-5 text-danger-600" />
                <h3 className="text-sm font-bold text-danger-700 uppercase tracking-wide">
                  Blocked Websites
                </h3>
              </div>
              <p className="text-5xl font-bold text-danger-900 mb-2">37</p>
              <p className="text-sm text-danger-700 font-medium">
                Sites blocked automatically this week
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-danger-400 to-danger-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Ban className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wide">
                  Active Filters
                </h3>
              </div>
              <p className="text-5xl font-bold text-primary-900 mb-2">12</p>
              <p className="text-sm text-primary-700 font-medium">
                Content filters currently protecting your family
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Blocking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="text-xl font-bold text-slate-900">
            Block by Category
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Toggle content categories to protect your family
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { name: "Adult Content", enabled: true, color: "danger", description: "Mature and explicit content" },
            { name: "Violence & Weapons", enabled: true, color: "danger", description: "Violent content and weapon-related sites" },
            { name: "Gambling", enabled: true, color: "accent", description: "Online betting and casino sites" },
            { name: "Social Media", enabled: false, color: "primary", description: "Social networking platforms" },
            { name: "Gaming", enabled: false, color: "secondary", description: "Online gaming websites" },
          ].map((category, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    category.enabled 
                      ? `bg-${category.color}-100` 
                      : "bg-slate-100"
                  }`}
                >
                  {category.enabled ? (
                    <Ban className={`w-6 h-6 text-${category.color}-600`} />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">
                    {category.name}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </div>
              <button
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-soft border-2 ${
                  category.enabled
                    ? `bg-${category.color}-100 text-${category.color}-700 border-${category.color}-300 hover:bg-${category.color}-200`
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {category.enabled ? "Blocking" : "Allowed"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Block */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-8 border-2 border-dashed border-slate-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-soft">
            <Globe className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Add Custom Website Block
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Block specific websites that aren't covered by categories
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="example.com"
            className="flex-1 px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-soft text-slate-900 placeholder:text-slate-400"
          />
          <button className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold rounded-xl hover:from-slate-900 hover:to-black transition-all shadow-soft hover:shadow-soft-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Block Site
          </button>
        </div>
      </div>
    </div>
  );
}
