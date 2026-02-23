"use client";
/* eslint-disable max-lines */

import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, X } from 'lucide-react';
import type { Child } from './types';
import AddChildModal from './AddChildModal';

type JumpTab = 'dashboard' | 'time-limits' | 'blocking' | 'settings';

export type ChildrenContentProps = {
  childrenData: Child[];
  showAddChild: boolean;
  onOpenAddChild: () => void;
  onCloseAddChild: () => void;
  generatedPin: string;
  copiedPin: boolean;
  onCopyPin: () => void;
  onViewActivity: (childId: number) => void;
  onCreatedChild: (child: Child) => void;
  onRenamedChild: (childId: number, name: string) => void;
  onJumpToSection: (tab: JumpTab, childId: number) => void;
};

const formatLimit = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};

export default function ChildrenContent({
  childrenData,
  showAddChild,
  onOpenAddChild,
  onCloseAddChild,
  generatedPin,
  copiedPin,
  onCopyPin,
  onViewActivity,
  onCreatedChild,
  onRenamedChild,
  onJumpToSection,
}: ChildrenContentProps) {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [dailyLimitLabel, setDailyLimitLabel] = useState('--');
  const [dailyLimitLoading, setDailyLimitLoading] = useState(false);
  const [dailyLimitError, setDailyLimitError] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState('');

  const selectedChild = useMemo(
    () => childrenData.find((child) => child.id === selectedChildId) ?? null,
    [childrenData, selectedChildId],
  );

  useEffect(() => {
    setRenameValue(selectedChild?.name ?? '');
    setRenameError('');
  }, [selectedChild?.id, selectedChild?.name]);

  useEffect(() => {
    if (!selectedChildId) {
      setDailyLimitLabel('--');
      setDailyLimitError('');
      setDailyLimitLoading(false);
      return;
    }

    let cancelled = false;
    const loadDailyLimit = async () => {
      setDailyLimitLoading(true);
      setDailyLimitError('');
      try {
        const response = await fetch(`/api/timelimits?childId=${selectedChildId}`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (!response.ok) {
          let message = 'Failed to load daily limit.';
          try {
            const payload = await response.json();
            if (payload?.error) message = String(payload.error);
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const payload: { timeLimit?: { dailyLimit?: number } | null } = await response.json();
        const dailyLimitSeconds = Number(payload?.timeLimit?.dailyLimit);
        if (!cancelled) {
          if (Number.isFinite(dailyLimitSeconds) && dailyLimitSeconds > 0) {
            setDailyLimitLabel(formatLimit(dailyLimitSeconds));
          } else {
            setDailyLimitLabel('--');
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load daily limit.';
          setDailyLimitError(message);
          setDailyLimitLabel('--');
        }
      } finally {
        if (!cancelled) {
          setDailyLimitLoading(false);
        }
      }
    };

    void loadDailyLimit();
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  const openSettings = (childId: number) => {
    setSelectedChildId(childId);
  };

  const handleRenameChild = async () => {
    if (!selectedChild) return;
    const trimmedName = renameValue.trim();
    if (!trimmedName) {
      setRenameError('Name is required.');
      return;
    }
    if (trimmedName === selectedChild.name) {
      setRenameError('');
      return;
    }

    setRenameSaving(true);
    setRenameError('');
    try {
      const response = await fetch('/api/child', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedChild.id, name: trimmedName }),
      });
      if (!response.ok) {
        let message = 'Failed to rename child.';
        try {
          const payload = await response.json();
          if (payload?.error) message = String(payload.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      onRenamedChild(selectedChild.id, trimmedName);
      setRenameValue(trimmedName);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename child.';
      setRenameError(message);
    } finally {
      setRenameSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Children</h1>
          <p className="text-sm md:text-base text-gray-500">Manage and monitor your children&apos;s accounts</p>
        </div>
        <button
          onClick={onOpenAddChild}
          className="w-full md:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {childrenData.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80 hover:shadow-lg transition-all">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-sm">
                {child.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">{child.name}</h3>
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {child.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Active monitoring</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Today&apos;s Usage</p>
                <p className="text-base md:text-lg font-semibold text-gray-900">{child.todayUsage}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Safety Score</p>
                <p className="text-base md:text-lg font-semibold text-green-600">Good</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">Access PIN</p>
                  <p className="text-xl md:text-2xl font-bold font-mono text-blue-900 tracking-wider">{child.pin}</p>
                </div>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(child.pin);
                  }}
                  className="w-full sm:w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">Share with your child to access their device</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onViewActivity(child.id)}
                className="px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Activity
              </button>
              <button
                onClick={() => openSettings(child.id)}
                className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Quick Guide: Adding a Child</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Create Account',
              description: 'Click "Add Child" and enter their name',
            },
            {
              title: 'Share PIN',
              description: 'Give the generated PIN to your child',
            },
            {
              title: 'Start Monitoring',
              description: 'Protection begins automatically',
            },
          ].map((step, idx) => (
            <div key={step.title} className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{step.title}</p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddChild && (
        <AddChildModal
          generatedPin={generatedPin}
          copiedPin={copiedPin}
          onClose={onCloseAddChild}
          onCopyPin={onCopyPin}
          onCreated={onCreatedChild}
        />
      )}

      {selectedChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center">
                  {selectedChild.avatar}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedChild.name} Settings</h4>
                  <p className="text-sm text-gray-500">Manage limits and filters</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChildId(null)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-5 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Quick Jump</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Today's Usage", tab: 'dashboard' as const },
                  { label: 'Daily Screen Time', tab: 'time-limits' as const },
                  { label: 'Blocked Categories', tab: 'blocking' as const },
                  { label: 'Child Profile', tab: 'settings' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onJumpToSection(item.tab, selectedChild.id);
                      setSelectedChildId(null);
                    }}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Today&apos;s Usage</p>
                <p className="text-lg font-semibold text-gray-900">{selectedChild.todayUsage}</p>
                <p className="text-xs text-gray-500 mt-1">Live from dashboard data</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Daily Screen Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dailyLimitLoading ? 'Loading...' : dailyLimitLabel}
                </p>
                <p className="text-xs text-gray-500 mt-1">Synced with Time Limits</p>
                {dailyLimitError && <p className="mt-1 text-xs text-red-600">{dailyLimitError}</p>}
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Bedtime</p>
                <p className="text-lg font-semibold text-gray-900">9:00 PM - 7:00 AM</p>
                <p className="text-xs text-gray-500 mt-1">School nights</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Blocked Categories</p>
                <p className="text-lg font-semibold text-gray-900">Adult, Gambling</p>
                <p className="text-xs text-gray-500 mt-1">2 active filters</p>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-500 mb-1">Rename Child</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    placeholder="Child name"
                    className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void handleRenameChild();
                    }}
                    disabled={renameSaving}
                    className="h-10 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {renameSaving ? 'Saving...' : 'Save Name'}
                  </button>
                </div>
                {renameError && <p className="mt-1 text-xs text-red-600">{renameError}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedChildId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
