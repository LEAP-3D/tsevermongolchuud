"use client";

import {
  Bell,
  Shield,
  Lock,
  Download,
  ChevronRight,
  HelpCircle,
  User,
  CreditCard,
} from "lucide-react";

export default function SettingsTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          Settings
        </h1>
        <p className="text-lg text-slate-600">
          Manage your ParentGuard account and preferences
        </p>
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-bold text-slate-900">
              Account Settings
            </h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-soft">
              P
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Parent Account</p>
              <p className="text-sm text-slate-600">parent@example.com</p>
            </div>
          </div>
          <button className="w-full px-5 py-3 bg-slate-100 text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-all">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent-600" />
            <h3 className="text-xl font-bold text-slate-900">
              Notifications
            </h3>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Choose how you want to be notified
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Email Notifications
              </p>
              <p className="text-sm text-slate-600">Receive alerts via email</p>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-bold rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-soft">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Weekly Reports
              </p>
              <p className="text-sm text-slate-600">Get summary every Monday</p>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-bold rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-soft">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Real-time Alerts
              </p>
              <p className="text-sm text-slate-600">
                Instant notifications for safety risks
              </p>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-bold rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-soft">
              Enabled
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-bold text-slate-900">
              Privacy & Security
            </h3>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Protect your account and data
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-700 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-700 transition-all shadow-soft">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  Change Password
                </p>
                <p className="text-sm text-slate-600">
                  Update your account password
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
          
          <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-700 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-700 transition-all shadow-soft">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-slate-600">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
          
          <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-700 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:text-primary-700 transition-all shadow-soft">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  Data Export
                </p>
                <p className="text-sm text-slate-600">
                  Download all your monitoring data
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-7 border border-primary-200 shadow-soft">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Subscription Plan
              </h3>
              <p className="text-sm text-primary-700 mt-0.5">Free Plan</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-700 mb-5">
          Upgrade to Premium for advanced AI monitoring, custom alerts, and unlimited family members.
        </p>
        <button className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft hover:shadow-soft-lg">
          Upgrade to Premium
        </button>
      </div>

      {/* Help & Support */}
      <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-2xl p-7 border border-secondary-200 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-soft">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Need Help?</h3>
        </div>
        <p className="text-sm text-slate-700 mb-5">
          Our support team is here to assist you with any questions about protecting your family online.
        </p>
        <div className="flex gap-3">
          <button className="flex-1 px-5 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-soft border border-slate-200">
            View Docs
          </button>
          <button className="flex-1 px-5 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-semibold rounded-xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-soft">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
