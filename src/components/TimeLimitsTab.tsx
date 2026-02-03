"use client";

import { Clock } from "lucide-react";

export default function TimeLimitsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl text-slate-900 mb-2">
          Screen Time Limits
        </h1>
        <p className="text-base text-slate-500">
          Set healthy usage limits for your children
        </p>
      </div>

      <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Daily Time Limit
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-slate-900">4 hours</p>
            <p className="text-sm text-slate-600">Maximum daily screen time</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/25">
            <Clock className="w-6 h-6 text-amber-200" />
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          defaultValue="4"
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-500">1h</span>
          <span className="text-xs text-slate-500">12h</span>
        </div>
      </div>

      <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Bedtime Schedule
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-white/70">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                School Nights
              </p>
              <p className="text-xs text-slate-500">Mon - Thu</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                9:00 PM - 7:00 AM
              </p>
              <p className="text-xs text-emerald-600">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-white/70">
            <div>
              <p className="text-sm font-semibold text-slate-900">Weekends</p>
              <p className="text-xs text-slate-500">Fri - Sun</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                10:00 PM - 8:00 AM
              </p>
              <p className="text-xs text-emerald-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/75 rounded-3xl p-6 border border-white/80 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          App Time Limits
        </h3>
        <div className="space-y-3">
          {[
            { name: "Social Media", time: "1h", color: "orange" },
            { name: "Gaming", time: "2h", color: "purple" },
            { name: "Video Streaming", time: "1.5h", color: "red" },
          ].map((app, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-white/70"
            >
              <p className="text-sm font-semibold text-slate-900">{app.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {app.time}
                </span>
                <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
