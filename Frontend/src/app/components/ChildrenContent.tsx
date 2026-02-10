"use client";
/* eslint-disable max-lines */

import { useMemo, useState } from 'react';
import { Copy, Plus, Trash2, X } from 'lucide-react';
import type { Child } from './types';
import AddChildModal from './AddChildModal';

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
  onCreatedChild
}: ChildrenContentProps) {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const initialManageSettings = useMemo(
    () => [
      { label: 'YouTube', value: '1h 30m', status: 'Limit' },
      { label: 'Games', value: '2h', status: 'Limit' },
      { label: 'Social Media', value: 'Blocked', status: 'Blocked' }
    ],
    []
  );
  const [manageSettingsRows, setManageSettingsRows] = useState(initialManageSettings);
  const [showAddWeb, setShowAddWeb] = useState(false);
  const [newWebLabel, setNewWebLabel] = useState('');
  const [newWebMinutes, setNewWebMinutes] = useState('30');
  const [newWebStatus, setNewWebStatus] = useState<'Limit' | 'Blocked'>('Limit');

  const selectedChild = useMemo(
    () => childrenData.find(child => child.id === selectedChildId) ?? null,
    [childrenData, selectedChildId]
  );

  const openSettings = (childId: number) => {
    setSelectedChildId(childId);
    setManageSettingsRows(initialManageSettings);
    setShowAddWeb(false);
    setNewWebLabel('');
    setNewWebMinutes('30');
    setNewWebStatus('Limit');
  };

  const formatMinutes = (minutesValue: number) => {
    if (!Number.isFinite(minutesValue) || minutesValue <= 0) {
      return '0m';
    }
    const hours = Math.floor(minutesValue / 60);
    const minutes = minutesValue % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleAddWeb = () => {
    const trimmedLabel = newWebLabel.trim();
    if (!trimmedLabel) {
      return;
    }
    const minutesNumber = Number.parseInt(newWebMinutes, 10);
    const value = newWebStatus === 'Blocked' ? 'Blocked' : formatMinutes(minutesNumber);
    setManageSettingsRows(prev => [
      ...prev,
      {
        label: trimmedLabel,
        value,
        status: newWebStatus
      }
    ]);
    setShowAddWeb(false);
    setNewWebLabel('');
    setNewWebMinutes('30');
    setNewWebStatus('Limit');
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
        {childrenData.map(child => (
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
                <button className="w-full sm:w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
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
              description: 'Click "Add Child" and enter their name'
            },
            {
              title: 'Share PIN',
              description: 'Give the generated PIN to your child'
            },
            {
              title: 'Start Monitoring',
              description: 'Protection begins automatically'
            }
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
                  <p className="text-sm text-gray-500">Manage limits, filters, and device access</p>
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

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Daily Screen Time</p>
                <p className="text-lg font-semibold text-gray-900">3h 30m</p>
                <p className="text-xs text-gray-500 mt-1">Current limit</p>
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
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Device Access</p>
                <p className="text-lg font-semibold text-gray-900">iPhone · iPad</p>
                <p className="text-xs text-gray-500 mt-1">2 devices linked</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-4 gap-0 bg-gray-50 text-xs font-semibold text-gray-500 px-4 py-2">
                  <div>Setting</div>
                  <div>Value</div>
                  <div>Status</div>
                  <div className="text-right">Action</div>
                </div>
                {manageSettingsRows.map(row => (
                  <div key={row.label} className="grid grid-cols-4 gap-0 px-4 py-3 text-sm text-gray-700 border-t border-gray-100">
                    <div className="font-medium text-gray-900">{row.label}</div>
                    <div>{row.value}</div>
                    <div className="text-gray-500">{row.status}</div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setManageSettingsRows(prev => prev.filter(item => item.label !== row.label))}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                        aria-label={`Remove ${row.label}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {manageSettingsRows.length === 0 && (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                    No limits or blocks set yet.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddWeb(true)}
                  className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  Add Web
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChildId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddWeb && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">Add Web Limit</h4>
              <button
                type="button"
                onClick={() => setShowAddWeb(false)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Website or App</label>
                <input
                  value={newWebLabel}
                  onChange={event => setNewWebLabel(event.target.value)}
                  placeholder="example.com or YouTube"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Daily Limit (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={newWebMinutes}
                  onChange={event => setNewWebMinutes(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newWebStatus}
                  onChange={event => setNewWebStatus(event.target.value === 'Blocked' ? 'Blocked' : 'Limit')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Limit">Limit</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWeb(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddWeb}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
