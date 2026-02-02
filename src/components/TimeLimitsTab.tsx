"use client";

import { Clock } from "lucide-react";

export default function TimeLimitsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-1">
          Screen Time Limits
        </h1>
        <p className="text-base text-gray-500">
          Set healthy usage limits for your children
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Time Limit
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">4 hours</p>
            <p className="text-sm text-gray-600">Maximum daily screen time</p>
          </div>
          <Clock className="w-12 h-12 text-blue-500" />
        </div>
        <input
          type="range"
          min="1"
          max="12"
          defaultValue="4"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">1h</span>
          <span className="text-xs text-gray-500">12h</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bedtime Schedule
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                School Nights
              </p>
              <p className="text-xs text-gray-500">Mon - Thu</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                9:00 PM - 7:00 AM
              </p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekends</p>
              <p className="text-xs text-gray-500">Fri - Sun</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                10:00 PM - 8:00 AM
              </p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <p className="text-sm font-semibold text-gray-900">{app.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {app.time}
                </span>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
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
