"use client";

import {
  Bell,
  Shield,
  Lock,
  Download,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export default function SettingsTab() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-slate-900 mb-2">
          Settings
        </h1>
        <p className="text-base text-slate-500">
          Manage your ParentGuard account and preferences
        </p>
      </div>

      <div className="bg-white/75 rounded-3xl border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] overflow-hidden backdrop-blur">
        <div className="p-6 border-b border-white/60">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-500" />
            Account Settings
          </h3>
        </div>
        <div className="divide-y divide-white/60">
          <div className="flex items-center justify-between p-6 hover:bg-white/60 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Email Notifications
              </p>
              <p className="text-xs text-slate-500">Receive alerts via email</p>
            </div>
            <button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              On
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-white/60 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Weekly Reports
              </p>
              <p className="text-xs text-slate-500">Get summary every Monday</p>
            </div>
            <button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              On
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-white/60 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Real-time Alerts
              </p>
              <p className="text-xs text-slate-500">
                Instant notifications for risks
              </p>
            </div>
            <button className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              On
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/75 rounded-3xl border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] overflow-hidden backdrop-blur">
        <div className="p-6 border-b border-white/60">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-500" />
            Privacy & Security
          </h3>
        </div>
        <div className="divide-y divide-white/60">
          <button className="w-full flex items-center justify-between p-6 hover:bg-white/60 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-2xl text-slate-600 border border-white/80 group-hover:shadow-sm transition-all">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Change Password
                </p>
                <p className="text-xs text-slate-500">
                  Update your account password
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-white/60 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-2xl text-slate-600 border border-white/80 group-hover:shadow-sm transition-all">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-slate-500">
                  Add extra security layer
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-white/60 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-2xl text-slate-600 border border-white/80 group-hover:shadow-sm transition-all">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Data Export</p>
                <p className="text-xs text-slate-500">
                  Download your monitoring data
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-3xl p-8 border border-amber-100/60 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white rounded-2xl shadow-sm text-amber-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Need Help?</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6 max-w-xl">
          Our support team is here to assist you with any questions.
        </p>
        <button className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-2xl hover:bg-white/90 transition-all shadow-sm border border-white/80 text-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
}
