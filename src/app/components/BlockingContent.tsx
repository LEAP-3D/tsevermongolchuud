"use client";

import { Ban } from 'lucide-react';

export default function BlockingContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Content Blocking</h1>
        <p className="text-sm md:text-base text-gray-500">Control what your children can access online</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blocked Websites</h3>
            <span className="text-2xl font-bold text-red-600">37</span>
          </div>
          <p className="text-sm text-gray-600">Sites automatically blocked this week</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
            <span className="text-2xl font-bold text-blue-600">12</span>
          </div>
          <p className="text-sm text-gray-600">Content filters currently active</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Block by Category</h3>
        <div className="space-y-3">
          {[
            { name: 'Adult Content', enabled: true, color: 'red' },
            { name: 'Violence & Weapons', enabled: true, color: 'red' },
            { name: 'Gambling', enabled: true, color: 'orange' },
            { name: 'Social Media', enabled: false, color: 'blue' },
            { name: 'Gaming', enabled: false, color: 'purple' }
          ].map((category, idx) => (
            <div key={idx} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    category.enabled ? 'bg-red-100' : 'bg-gray-200'
                  }`}
                >
                  <Ban className={`w-5 h-5 ${category.enabled ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.enabled ? 'Blocked' : 'Allowed'}</p>
                </div>
              </div>
              <button
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category.enabled ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Add Custom Website Block</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="example.com"
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
            Block Site
          </button>
        </div>
      </div>
    </div>
  );
}
