"use client";

import { useState } from "react";
import { Clock, Moon, Smartphone, Edit2, Save } from "lucide-react";

export default function TimeLimitsTab() {
  const [dailyLimit, setDailyLimit] = useState(4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          Screen Time Management
        </h1>
        <p className="text-lg text-slate-600">
          Set healthy digital boundaries for your family
        </p>
      </div>

      {/* Daily Time Limit */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-soft">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-accent-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Daily Time Limit
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Maximum screen time allowed per day
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-accent-600">{dailyLimit}h</p>
            <p className="text-sm text-slate-600 mt-1">per day</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="12"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-accent-200 to-accent-300 rounded-full appearance-none cursor-pointer accent-accent-600"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(dailyLimit / 12) * 100}%, #fde68a ${(dailyLimit / 12) * 100}%, #fde68a 100%)`
            }}
          />
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-600">1 hour</span>
            <span className="text-sm font-medium text-slate-600">12 hours</span>
          </div>
        </div>
      </div>

      {/* Bedtime Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-bold text-slate-900">
              Bedtime Schedule
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Automatic device restrictions during sleep hours
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                School Nights
              </p>
              <p className="text-sm text-slate-600">Monday - Thursday</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-900 mb-1">
                9:00 PM - 7:00 AM
              </p>
              <span className="inline-block px-3 py-1 bg-secondary-200 text-secondary-800 text-xs font-bold rounded-lg">
                Active
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-xl border border-secondary-200">
            <div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Weekends
              </p>
              <p className="text-sm text-slate-600">Friday - Sunday</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-secondary-900 mb-1">
                10:00 PM - 8:00 AM
              </p>
              <span className="inline-block px-3 py-1 bg-secondary-200 text-secondary-800 text-xs font-bold rounded-lg">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* App Time Limits */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-accent-600" />
            <h3 className="text-xl font-bold text-slate-900">
              App Category Limits
            </h3>
          </div>
          <p className="text-sm text-slate-600">
            Set specific time limits for different app categories
          </p>
        </div>
        
        <div className="p-6 space-y-3">
          {[
            { name: "Social Media", time: "1h", color: "from-accent-400 to-accent-600", used: "45min" },
            { name: "Gaming", time: "2h", color: "from-primary-400 to-primary-600", used: "1h 30min" },
            { name: "Video Streaming", time: "1.5h", color: "from-danger-400 to-danger-600", used: "1h 15min" },
          ].map((app, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center shadow-soft`}>
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{app.name}</p>
                  <p className="text-sm text-slate-600">{app.used} used today</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-600 font-medium">Daily Limit</p>
                  <p className="text-xl font-bold text-slate-900">
                    {app.time}
                  </p>
                </div>
                <button className="p-2.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <button className="w-full px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-soft flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
