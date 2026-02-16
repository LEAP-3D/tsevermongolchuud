"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthUser } from '@/lib/auth';

type BlockingCategory = {
  id: number;
  name: string;
  status: 'ALLOWED' | 'BLOCKED' | 'LIMITED';
  source?: 'PARENT' | 'AI' | null;
};

type BlockedSite = {
  domain: string;
  source: 'PARENT' | 'AI';
};

const normalizeDomain = (raw: string) =>
  raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

const getFaviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(domain)}`;

export default function BlockingContent() {
  const { user } = useAuthUser();
  const [children, setChildren] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [categories, setCategories] = useState<BlockingCategory[]>([]);
  const [customBlocks, setCustomBlocks] = useState<BlockedSite[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [siteInput, setSiteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const loadChildren = useCallback(async () => {
    if (!user?.id) {
      setChildren([]);
      return;
    }
    const response = await fetch(`/api/child?parentId=${encodeURIComponent(String(user.id))}`);
    if (!response.ok) {
      return;
    }
    const data: Array<{ id: number; name: string }> = await response.json();
    setChildren(data);
    if (!selectedChildId && data.length > 0) {
      setSelectedChildId(data[0].id);
    }
  }, [selectedChildId, user?.id]);

  const loadBlocking = useCallback(async (childId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/blocking?childId=${childId}&parentId=${encodeURIComponent(String(user?.id ?? ""))}`
      );
      if (!response.ok) {
        let message = 'Failed to load blocking.';
        try {
          const payload = await response.json();
          if (payload?.error) message = String(payload.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      const payload: {
        categories: BlockingCategory[];
        blockedSites: Array<string | { id?: number; domain: string; source?: 'PARENT' | 'AI' }>;
      } = await response.json();
      const mappedSites = (payload.blockedSites ?? [])
        .map((site) => {
          if (typeof site === 'string') {
            return { domain: normalizeDomain(site), source: 'PARENT' as const };
          }
          return {
            domain: normalizeDomain(site.domain),
            source: site.source === 'AI' ? 'AI' as const : 'PARENT' as const,
          };
        })
        .filter((site) => site.domain.length > 0);
      setCategories(payload.categories ?? []);
      setCustomBlocks(mappedSites);
      setSelectedSites([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load blocking.';
      setError(message);
      setCategories([]);
      setCustomBlocks([]);
      setSelectedSites([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren, user?.id]);

  useEffect(() => {
    if (selectedChildId && user?.id) {
      void loadBlocking(selectedChildId);
    } else {
      setCategories([]);
      setCustomBlocks([]);
      setSelectedSites([]);
    }
  }, [loadBlocking, selectedChildId, user?.id]);

  const activeFilters = useMemo(
    () => categories.filter(category => category.status === 'BLOCKED').length,
    [categories]
  );

  const blockedSites = useMemo(
    () => customBlocks.length,
    [customBlocks]
  );

  const allSitesSelected = useMemo(
    () => customBlocks.length > 0 && selectedSites.length === customBlocks.length,
    [customBlocks.length, selectedSites.length]
  );

  const toggleCategory = async (id: number) => {
    if (!selectedChildId) return;
    const target = categories.find(category => category.id === id);
    if (!target) return;
    const nextEnabled = target.status !== 'BLOCKED';
    setCategories(prev =>
      prev.map(category =>
        category.id === id
          ? { ...category, status: nextEnabled ? 'BLOCKED' : 'ALLOWED', source: nextEnabled ? 'PARENT' : null }
          : category
      )
    );

    const response = await fetch('/api/blocking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: selectedChildId,
        categoryId: id,
        parentId: user?.id,
        enabled: nextEnabled
      })
    });
    if (!response.ok) {
      await loadBlocking(selectedChildId);
    }
  };

  const addCustomBlock = async () => {
    const trimmed = normalizeDomain(siteInput);
    if (!trimmed) return;
    if (!selectedChildId) return;
    if (customBlocks.some((item) => item.domain === trimmed)) return;
    setSiteInput('');
    setUpdating(true);
    const response = await fetch('/api/blocking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: selectedChildId,
        parentId: user?.id,
        domain: trimmed
      })
    });
    if (response.ok) {
      setCustomBlocks(prev => [
        { domain: trimmed, source: 'PARENT' },
        ...prev.filter((item) => item.domain !== trimmed),
      ]);
    } else if (selectedChildId) {
      await loadBlocking(selectedChildId);
    }
    setUpdating(false);
  };

  const removeCustomBlock = async (domain: string) => {
    if (!selectedChildId) return;
    setUpdating(true);
    const response = await fetch('/api/blocking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: selectedChildId,
        parentId: user?.id,
        domain
      })
    });
    if (response.ok) {
      setCustomBlocks(prev => prev.filter((item) => item.domain !== domain));
      setSelectedSites(prev => prev.filter((item) => item !== domain));
    } else {
      await loadBlocking(selectedChildId);
    }
    setUpdating(false);
  };

  const removeSelectedSites = async () => {
    if (!selectedChildId || selectedSites.length === 0) return;
    setUpdating(true);
    const response = await fetch('/api/blocking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: selectedChildId,
        parentId: user?.id,
        domains: selectedSites
      })
    });
    if (response.ok) {
      const selected = new Set(selectedSites);
      setCustomBlocks(prev => prev.filter((item) => !selected.has(item.domain)));
      setSelectedSites([]);
    } else {
      await loadBlocking(selectedChildId);
    }
    setUpdating(false);
  };

  const toggleSiteSelect = (domain: string) => {
    setSelectedSites(prev => {
      if (prev.includes(domain)) {
        return prev.filter((item) => item !== domain);
      }
      return [...prev, domain];
    });
  };

  const toggleSelectAllSites = () => {
    if (allSitesSelected) {
      setSelectedSites([]);
      return;
    }
    setSelectedSites(customBlocks.map((item) => item.domain));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Content Blocking</h1>
        <p className="text-sm md:text-base text-gray-500">Control what your children can access online</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">
          {loading ? "Loading blocking data..." : error ? error : "Select a child to manage blocking"}
        </div>
        <select
          value={selectedChildId ?? ''}
          onChange={(event) => {
            if (!event.target.value) return;
            setSelectedChildId(Number(event.target.value));
          }}
          className="w-full sm:w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {children.length === 0 && <option value="">No children</option>}
          {children.map(child => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blocked Websites</h3>
            <span className="text-2xl font-bold text-red-600">{blockedSites}</span>
          </div>
          <p className="text-sm text-gray-600">Sites currently blocked by Parent or AI</p>
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
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">No categories available.</p>
          )}
          {categories.map(category => (
            <div key={category.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    category.status === 'BLOCKED' ? 'bg-red-100' : 'bg-gray-200'
                  }`}
                >
                  <Ban className={`w-5 h-5 ${category.status === 'BLOCKED' ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category.status === 'BLOCKED'
                      ? `Blocked by ${category.source === 'AI' ? 'AI' : 'Parent'}`
                      : 'Allowed'}
                  </p>
                </div>
              </div>
              {category.status === 'BLOCKED' && (
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    category.source === 'AI'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {category.source === 'AI' ? 'AI' : 'Parent'}
                </span>
              )}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category.status === 'BLOCKED' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.status === 'BLOCKED' ? 'Enabled' : 'Disabled'}
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
            disabled={updating || !selectedChildId}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Block Site
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Blocked Websites List</h3>
          <button
            onClick={removeSelectedSites}
            disabled={selectedSites.length === 0 || updating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Remove Selected ({selectedSites.length})
          </button>
        </div>

        <label className="mb-3 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={allSitesSelected}
            onChange={toggleSelectAllSites}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Select all
        </label>

        {customBlocks.length === 0 ? (
          <p className="text-sm text-gray-500">No custom blocked websites yet.</p>
        ) : (
          <div className="space-y-2">
            {customBlocks.map((site) => (
              <div
                key={site.domain}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={selectedSites.includes(site.domain)}
                  onChange={() => toggleSiteSelect(site.domain)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Image
                  src={getFaviconUrl(site.domain)}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                  className="h-[18px] w-[18px] rounded-sm"
                />
                <span className="flex-1 text-sm font-medium text-gray-900">{site.domain}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    site.source === 'AI'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {site.source === 'AI' ? 'AI' : 'Parent'}
                </span>
                <button
                  onClick={() => {
                    void removeCustomBlock(site.domain);
                  }}
                  disabled={updating}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
