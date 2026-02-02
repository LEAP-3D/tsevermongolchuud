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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-base text-gray-500">
          Manage your ParentGuard account and preferences
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            Account Settings
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Email Notifications
              </p>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              On
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Weekly Reports
              </p>
              <p className="text-xs text-gray-500">Get summary every Monday</p>
            </div>
            <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              On
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Real-time Alerts
              </p>
              <p className="text-xs text-gray-500">
                Instant notifications for risks
              </p>
            </div>
            <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
              On
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            Privacy & Security
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Change Password
                </p>
                <p className="text-xs text-gray-500">
                  Update your account password
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-500">
                  Add extra security layer
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Data Export</p>
                <p className="text-xs text-gray-500">
                  Download your monitoring data
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100/50 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6 max-w-xl">
          Our support team is here to assist you with any questions.
        </p>
        <button className="px-6 py-2.5 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200 text-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
}
