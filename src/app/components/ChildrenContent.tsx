"use client";

import { Copy, Plus } from 'lucide-react';
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
};

export default function ChildrenContent({
  childrenData,
  showAddChild,
  onOpenAddChild,
  onCloseAddChild,
  generatedPin,
  copiedPin,
  onCopyPin
}: ChildrenContentProps) {
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
              <button className="px-4 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                View Activity
              </button>
              <button className="px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
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
        />
      )}
    </div>
  );
}
