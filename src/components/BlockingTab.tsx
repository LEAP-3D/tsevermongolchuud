"use client";

import { Ban, Shield, Globe, Plus } from "lucide-react";

export default function BlockingTab() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Content Blocking
        </h1>
        <p className="text-base text-gray-500">
          Control what your children can access online
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-500" />
              Blocked Websites
            </h3>
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              37
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Sites automatically blocked this week
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Active Filters
            </h3>
            <span className="text-3xl font-bold tracking-tight text-gray-900">
              12
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Content filters currently active
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Block by Category
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: "Adult Content", enabled: true, color: "red" },
            { name: "Violence & Weapons", enabled: true, color: "red" },
            { name: "Gambling", enabled: true, color: "orange" },
            { name: "Social Media", enabled: false, color: "blue" },
            { name: "Gaming", enabled: false, color: "purple" },
          ].map((category, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${category.enabled ? "bg-red-50" : "bg-gray-100"}`}
                >
                  <Ban
                    className={`w-5 h-5 ${category.enabled ? "text-red-600" : "text-gray-400"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.enabled ? "Access restricted" : "Access allowed"}
                  </p>
                </div>
              </div>
              <button
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  category.enabled
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {category.enabled ? "Blocking" : "Allowed"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 border-dashed">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Globe className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Add Custom Website Block
          </h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="example.com"
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
          <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Block Site
          </button>
        </div>
      </div>
    </div>
  );
}
