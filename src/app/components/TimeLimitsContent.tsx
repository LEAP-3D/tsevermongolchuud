"use client";

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Clock } from 'lucide-react';

export default function TimeLimitsContent() {
  const [dailyLimit, setDailyLimit] = useState(240);

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const [appLimits, setAppLimits] = useState([
    { id: 1, name: 'Social Media', minutes: 60 },
    { id: 2, name: 'Gaming', minutes: 120 },
    { id: 3, name: 'Video Streaming', minutes: 90 }
  ]);
  const [editingAppId, setEditingAppId] = useState<number | null>(null);
  const [tempMinutes, setTempMinutes] = useState(60);

  const minLimit = 30;
  const maxLimit = 720;
  const fillPercent = ((dailyLimit - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Screen Time Limits</h1>
        <p className="text-sm md:text-base text-gray-500">Set healthy usage limits for your children</p>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Daily Time Limit</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatMinutes(dailyLimit)}</p>
            <p className="text-sm text-gray-600">Maximum daily screen time</p>
          </div>
          <Clock className="w-10 h-10 md:w-12 md:h-12 text-blue-500" />
        </div>
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step="30"
          value={dailyLimit}
          onChange={(event) => setDailyLimit(Number(event.target.value))}
          className="time-slider w-full cursor-pointer"
          style={{ ['--fill' as string]: `${fillPercent}%` }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">30m</span>
          <span className="text-xs text-gray-500">12h</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Bedtime Schedule</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">School Nights</p>
              <p className="text-xs text-gray-500">Mon - Thu</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">9:00 PM - 7:00 AM</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekends</p>
              <p className="text-xs text-gray-500">Fri - Sun</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">10:00 PM - 8:00 AM</p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">App Time Limits</h3>
        <div className="space-y-3">
          {appLimits.map((app, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">{app.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{formatMinutes(app.minutes)}</span>
                <button
                  onClick={() => {
                    setEditingAppId(app.id);
                    setTempMinutes(app.minutes);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {editingAppId !== null && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Edit App Limit</h4>
              <p className="text-sm text-gray-500">Set daily limit in hours and minutes</p>
            </div>
            <button
              onClick={() => setEditingAppId(null)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Selected limit</p>
              <p className="text-lg font-semibold text-gray-900">{formatMinutes(tempMinutes)}</p>
            </div>

            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={tempMinutes}
              onChange={(event) => setTempMinutes(Number(event.target.value))}
              className="time-slider w-full cursor-pointer"
              style={{
                ['--fill' as string]: `${((tempMinutes - 15) / (240 - 15)) * 100}%`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>15m</span>
              <span>4h</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAppId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAppLimits(prev =>
                    prev.map(app =>
                      app.id === editingAppId ? { ...app, minutes: tempMinutes } : app
                    )
                  );
                  setEditingAppId(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    <style jsx>{`
      .time-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 10px;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          #6366f1 0%,
          #7c3aed var(--fill),
          #e5e7eb var(--fill),
          #e5e7eb 100%
        );
        transition: background 0.25s ease;
      }

      .time-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #ffffff;
        border: 2px solid #6366f1;
        box-shadow: 0 6px 14px rgba(99, 102, 241, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .time-slider:active::-webkit-slider-thumb {
        transform: scale(1.05);
        box-shadow: 0 8px 18px rgba(99, 102, 241, 0.35);
      }

      .time-slider::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #ffffff;
        border: 2px solid #6366f1;
        box-shadow: 0 6px 14px rgba(99, 102, 241, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .time-slider:active::-moz-range-thumb {
        transform: scale(1.05);
        box-shadow: 0 8px 18px rgba(99, 102, 241, 0.35);
      }

      .time-slider::-moz-range-track {
        height: 10px;
        border-radius: 999px;
        background: transparent;
      }
    `}</style>
    </>
  );
}
