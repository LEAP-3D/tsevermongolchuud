"use client";

import { Shield, Clock, Users, Settings, BarChart3, Brain, Ban, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'ai-analysis', icon: Brain, label: 'AI Assistant' },
  { id: 'blocking', icon: Ban, label: 'Blocking' },
  { id: 'time-limits', icon: Clock, label: 'Time Limits' },
  { id: 'children', icon: Users, label: 'Children' },
  { id: 'settings', icon: Settings, label: 'Settings' }
] as const;

export type SidebarProps = {
  activeTab: string;
  onChangeTab: (tab: string) => void;
};

export default function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200/80 min-h-screen p-4">
      <div className="flex items-center gap-2 px-3 py-4 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">ParentGuard</h1>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 px-3 py-4 bg-gray-50 rounded-xl border border-gray-200/80">
        <div className="flex items-start gap-2 mb-2">
          <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-900">Upgrade to Pro</p>
            <p className="text-xs text-gray-600 mt-1">Advanced features</p>
          </div>
        </div>
        <button className="w-full mt-3 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
