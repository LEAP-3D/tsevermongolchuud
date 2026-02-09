"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Check, Copy, Plus, X } from 'lucide-react';
import type { Child } from './types';

export type AddChildModalProps = {
  generatedPin: string;
  copiedPin: boolean;
  onClose: () => void;
  onCopyPin: () => void;
  onCreated: (child: Child) => void;
};

export default function AddChildModal({
  generatedPin,
  copiedPin,
  onClose,
  onCopyPin,
  onCreated
}: AddChildModalProps) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          pin: generatedPin,
          parentId: user?.id ?? null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create child.');
      }

      const data = await response.json();
      const createdChild: Child = {
        id: data.id,
        name: data.name,
        status: 'Active',
        todayUsage: '0h 0m',
        pin: data.pin ?? generatedPin,
        avatar: data.name?.[0]?.toUpperCase() ?? 'C'
      };

      onCreated(createdChild);
      onClose();
    } catch (err) {
      setError('Could not create child. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full border border-gray-200/80 shadow-2xl">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Family Member</h3>
              <p className="text-sm text-gray-600">Create a new account</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2.5">Child&apos;s Name</label>
            <input
              type="text"
              placeholder="e.g., Emma, Oliver"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-base transition-all"
            />
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2.5">Access PIN Code</label>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-5 border-2 border-blue-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Generated PIN</p>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-900 tracking-widest font-mono">{generatedPin}</p>
                  <p className="text-xs text-blue-700 mt-2">
                    {copiedPin ? 'Copied to clipboard! ✓' : 'Share with your child'}
                  </p>
                </div>
                <button
                  onClick={onCopyPin}
                  className="w-full sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center shadow-sm"
                >
                  {copiedPin ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="font-bold">Important:</span> Share this PIN with your child. They&apos;ll need it to access their device. Keep it safe and don&apos;t share it with others.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 sm:py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold text-base shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </div>
  );
}
