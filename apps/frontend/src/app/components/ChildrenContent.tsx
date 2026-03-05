"use client";
/* eslint-disable max-lines */

import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, X } from 'lucide-react';
import type { Child } from './types';
import AddChildModal from './AddChildModal';
import { withApiBase } from "@/lib/apiBase";
import { getExtensionStoreUrl } from "@/lib/extensionStore";

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
  onSubscriptionRequired?: () => void;
};

const formatLimit = (minutesValue: number) => {
  const safeMinutes = Math.max(0, Math.round(minutesValue));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
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
  onSubscriptionRequired,
}: ChildrenContentProps) {
  const extensionStoreUrl = getExtensionStoreUrl();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [weekdayWeekendLimitLabel, setWeekdayWeekendLimitLabel] = useState('--');
  const [weekdayWeekendLoading, setWeekdayWeekendLoading] = useState(false);
  const [weekdayWeekendError, setWeekdayWeekendError] = useState('');
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
      setWeekdayWeekendLimitLabel('--');
      setWeekdayWeekendError('');
      setWeekdayWeekendLoading(false);
      return;
    }

    let cancelled = false;
    const loadWeekdayWeekendLimits = async () => {
      setWeekdayWeekendLoading(true);
      setWeekdayWeekendError('');
      try {
        const response = await fetch(
          withApiBase(`/api/timelimits?childId=${selectedChildId}`),
          {
            cache: 'no-store',
            credentials: 'include',
          },
        );
        if (!response.ok) {
          let message = 'Failed to load weekday/weekend limits.';
          try {
            const payload = await response.json();
            if (payload?.error) message = String(payload.error);
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const payload: {
          timeLimit?: { weekdayLimit?: number; weekendLimit?: number } | null;
        } = await response.json();
        const weekdayLimitMinutes = Number(payload?.timeLimit?.weekdayLimit);
        const weekendLimitMinutes = Number(payload?.timeLimit?.weekendLimit);
        if (!cancelled) {
          const hasWeekday = Number.isFinite(weekdayLimitMinutes) && weekdayLimitMinutes > 0;
          const hasWeekend = Number.isFinite(weekendLimitMinutes) && weekendLimitMinutes > 0;
          if (hasWeekday || hasWeekend) {
            const weekdayLabel = hasWeekday ? formatLimit(weekdayLimitMinutes) : '--';
            const weekendLabel = hasWeekend ? formatLimit(weekendLimitMinutes) : '--';
            setWeekdayWeekendLimitLabel(`Weekday ${weekdayLabel} / Weekend ${weekendLabel}`);
          } else {
            setWeekdayWeekendLimitLabel('--');
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load weekday/weekend limits.';
          setWeekdayWeekendError(message);
          setWeekdayWeekendLimitLabel('--');
        }
      } finally {
        if (!cancelled) {
          setWeekdayWeekendLoading(false);
        }
      }
    };

    void loadWeekdayWeekendLimits();
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  const openSettings = (childId: number) => {
    setSelectedChildId(childId);
  };

  const jumpFromModal = (tab: JumpTab) => {
    if (!selectedChild) return;
    onJumpToSection(tab, selectedChild.id);
    setSelectedChildId(null);
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
      const response = await fetch(withApiBase('/api/child'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900 mb-1">Children</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage and monitor your children&apos;s accounts</p>
        </div>
        <button
          onClick={onOpenAddChild}
          className="w-full md:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {childrenData.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80 hover:shadow-lg transition-all">
            <div className="mb-4 flex items-start gap-4">
              <div className="h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-sm">
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

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Today&apos;s Usage</p>
                <p className="text-base md:text-lg font-semibold text-gray-900">{child.todayUsage}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Safety Score</p>
                <p className="text-base md:text-lg font-semibold text-green-600">Good</p>
              </div>
            </div>

            <div className="mb-4 bg-blue-50 rounded-xl p-3.5 border border-blue-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">Access PIN</p>
                  <p className="text-xl md:text-2xl font-bold font-mono text-blue-900 tracking-wider">{child.pin}</p>
                </div>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(child.pin);
                  }}
                  className="w-full sm:w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  <Copy className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">Share with your child to access their device</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onViewActivity(child.id)}
                className="px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                View Activity
              </button>
              <button
                onClick={() => openSettings(child.id)}
                className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Settings
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Quick Guide: Adding a Child</h3>
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

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
          Child Browser Extension Setup (Optional)
        </h3>
        <p className="text-xs md:text-sm text-gray-600">
          Parent panel can be used without extension. Install this only on the child&apos;s browser if you want
          live browser tracking/enforcement there.
        </p>
        <div className="mt-3">
          <a
            href={extensionStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 md:text-sm"
          >
            Open Chrome Web Store
          </a>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs md:text-sm text-gray-700">
          <li>Install the Safe-kid extension from Chrome Web Store on the child&apos;s browser.</li>
          <li>Open the extension and enter the child PIN shown in this dashboard.</li>
          <li>Start monitoring usage and adjust limits anytime.</li>
        </ol>
      </div>

      {showAddChild && (
        <AddChildModal
          generatedPin={generatedPin}
          copiedPin={copiedPin}
          onClose={onCloseAddChild}
          onCopyPin={onCopyPin}
          onCreated={onCreatedChild}
          onSubscriptionRequired={onSubscriptionRequired}
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
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <button
                  type="button"
                  onClick={() => jumpFromModal('dashboard')}
                  className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Today&apos;s Usage
                </button>
                <p className="text-lg font-semibold text-gray-900">{selectedChild.todayUsage}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <button
                  type="button"
                  onClick={() => jumpFromModal('time-limits')}
                  className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Weekday / Weekend Limits
                </button>
                <p className="text-lg font-semibold text-gray-900">
                  {weekdayWeekendLoading ? 'Loading...' : weekdayWeekendLimitLabel}
                </p>
                {weekdayWeekendError && <p className="mt-1 text-xs text-red-600">{weekdayWeekendError}</p>}
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <button
                  type="button"
                  onClick={() => jumpFromModal('time-limits')}
                  className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Bedtime
                </button>
                <p className="text-lg font-semibold text-gray-900">9:00 PM - 7:00 AM</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <button
                  type="button"
                  onClick={() => jumpFromModal('blocking')}
                  className="cursor-pointer text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Blocked Categories
                </button>
                <p className="text-lg font-semibold text-gray-900">Adult, Gambling</p>
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
                    className="h-10 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
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
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
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
