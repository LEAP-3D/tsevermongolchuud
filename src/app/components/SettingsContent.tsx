"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm md:text-base text-gray-500">Manage your ParentGuard account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive alerts via email</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">On</button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekly Reports</p>
              <p className="text-xs text-gray-500">Get summary every Monday</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">On</button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Real-time Alerts</p>
              <p className="text-xs text-gray-500">Instant notifications for risks</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg">On</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <p className="text-sm font-semibold text-gray-900">Change Password</p>
            <p className="text-xs text-gray-500">Update your account password</p>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500">Add extra security layer</p>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <p className="text-sm font-semibold text-gray-900">Data Export</p>
            <p className="text-xs text-gray-500">Download your monitoring data</p>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 md:p-6 border border-blue-100">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-sm text-gray-700 mb-4">Our support team is here to assist you with any questions.</p>
        <button className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
          Contact Support
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Account</h3>
        <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
        <SignOutButton redirectUrl="/login">
          <button className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 font-medium rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
            Log Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
