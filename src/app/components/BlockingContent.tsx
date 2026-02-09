"use client";

import { useMemo, useState } from 'react';
import { Ban } from 'lucide-react';

export default function BlockingContent() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Adult Content', enabled: true, color: 'red' },
    { id: 2, name: 'Violence & Weapons', enabled: true, color: 'red' },
    { id: 3, name: 'Gambling', enabled: true, color: 'orange' },
    { id: 4, name: 'Social Media', enabled: false, color: 'blue' },
    { id: 5, name: 'Gaming', enabled: false, color: 'purple' }
  ]);
  const [customBlocks, setCustomBlocks] = useState<string[]>([]);
  const [siteInput, setSiteInput] = useState('');

  const activeFilters = useMemo(
    () => categories.filter(category => category.enabled).length,
    [categories]
  );

  const blockedSites = useMemo(
    () => customBlocks.length + categories.filter(category => category.enabled).length * 5,
    [customBlocks, categories]
  );

  const toggleCategory = (id: number) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id ? { ...category, enabled: !category.enabled } : category
      )
    );
  };

  const addCustomBlock = () => {
    const trimmed = siteInput.trim().toLowerCase();
    if (!trimmed) return;
    if (customBlocks.includes(trimmed)) return;
    setCustomBlocks(prev => [trimmed, ...prev].slice(0, 5));
    setSiteInput('');
  };

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
            <span className="text-2xl font-bold text-red-600">{blockedSites}</span>
          </div>
          <p className="text-sm text-gray-600">Sites automatically blocked this week</p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
            <span className="text-2xl font-bold text-blue-600">{activeFilters}</span>
          </div>
          <p className="text-sm text-gray-600">Content filters currently active</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Block by Category</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
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
                onClick={() => toggleCategory(category.id)}
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
            value={siteInput}
            onChange={event => setSiteInput(event.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCustomBlock}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
          >
            Block Site
          </button>
        </div>
        {customBlocks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {customBlocks.map(site => (
              <span
                key={site}
                className="px-3 py-1.5 rounded-full bg-white border border-blue-200 text-xs text-blue-700"
              >
                {site}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
