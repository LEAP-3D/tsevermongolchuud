"use client";
/* eslint-disable max-lines */

import { useEffect, useMemo, useState } from 'react';
import { X, Clock, Plus } from 'lucide-react';
import { useAuthUser } from '@/lib/auth';

export default function TimeLimitsContent() {
  const { user } = useAuthUser();
  const [dailyLimit, setDailyLimit] = useState(240);
  const [weekdayLimit, setWeekdayLimit] = useState(180);
  const [weekendLimit, setWeekendLimit] = useState(300);
  const [sessionLimit, setSessionLimit] = useState(60);
  const [breakEvery, setBreakEvery] = useState(45);
  const [breakDuration, setBreakDuration] = useState(10);
  const [focusMode, setFocusMode] = useState(false);
  const [downtimeEnabled, setDowntimeEnabled] = useState(true);

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
    { id: 3, name: 'Video Streaming', minutes: 90 },
    { id: 4, name: 'Messaging', minutes: 60 },
    { id: 5, name: 'Entertainment', minutes: 90 },
    { id: 6, name: 'Shopping', minutes: 30 },
    { id: 7, name: 'Streaming Music', minutes: 90 },
    { id: 8, name: 'Short Videos', minutes: 45 },
    { id: 9, name: 'Learning Apps', minutes: 120 },
    { id: 10, name: 'Browser', minutes: 90 }
  ]);
  const [categoryLimits, setCategoryLimits] = useState([
    { id: 101, name: 'Education', minutes: 180 },
    { id: 102, name: 'Games', minutes: 120 },
    { id: 103, name: 'Social', minutes: 60 },
    { id: 104, name: 'Entertainment', minutes: 90 },
    { id: 105, name: 'Creativity', minutes: 120 },
    { id: 106, name: 'Communication', minutes: 60 },
    { id: 107, name: 'Productivity', minutes: 120 }
  ]);
  const [editingItem, setEditingItem] = useState<{ id: number; type: 'app' | 'category' } | null>(
    null
  );
  const [tempMinutes, setTempMinutes] = useState(60);
  const [blockedDuringFocus, setBlockedDuringFocus] = useState<string[]>([
    'Social Media',
    'Gaming',
    'Streaming Video'
  ]);
  const [newBlocked, setNewBlocked] = useState('');
  const [children, setChildren] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minLimit = 30;
  const maxLimit = 720;
  const fillPercent = ((dailyLimit - minLimit) / (maxLimit - minLimit)) * 100;

  const defaultAppLimits = useMemo(
    () => [
      { id: 1, name: 'Social Media', minutes: 60 },
      { id: 2, name: 'Gaming', minutes: 120 },
      { id: 3, name: 'Video Streaming', minutes: 90 },
      { id: 4, name: 'Messaging', minutes: 60 },
      { id: 5, name: 'Entertainment', minutes: 90 },
      { id: 6, name: 'Shopping', minutes: 30 },
      { id: 7, name: 'Streaming Music', minutes: 90 },
      { id: 8, name: 'Short Videos', minutes: 45 },
      { id: 9, name: 'Learning Apps', minutes: 120 },
      { id: 10, name: 'Browser', minutes: 90 }
    ],
    []
  );

  const defaultCategoryLimits = useMemo(
    () => [
      { id: 101, name: 'Education', minutes: 180 },
      { id: 102, name: 'Games', minutes: 120 },
      { id: 103, name: 'Social', minutes: 60 },
      { id: 104, name: 'Entertainment', minutes: 90 },
      { id: 105, name: 'Creativity', minutes: 120 },
      { id: 106, name: 'Communication', minutes: 60 },
      { id: 107, name: 'Productivity', minutes: 120 }
    ],
    []
  );

  useEffect(() => {
    const loadChildren = async () => {
      if (!user?.id) {
        setChildren([]);
        setSelectedChildId(null);
        return;
      }
      try {
        const response = await fetch(`/api/child?parentId=${encodeURIComponent(String(user.id))}`);
        if (!response.ok) return;
        const data: Array<{ id: number; name: string }> = await response.json();
        setChildren(data);
        if (!selectedChildId && data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch {
        // ignore
      }
    };

    void loadChildren();
  }, [user?.id, selectedChildId]);

  useEffect(() => {
    const loadLimits = async () => {
      if (!user?.id || !selectedChildId) return;
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const response = await fetch(
          `/api/timelimits?childId=${selectedChildId}&parentId=${encodeURIComponent(String(user.id))}`
        );
        if (!response.ok) {
          let message = 'Failed to load time limits.';
          try {
            const payload = await response.json();
            if (payload?.error) message = String(payload.error);
          } catch {
            // ignore
          }
          throw new Error(message);
        }
        const payload: {
          timeLimit?: {
            dailyLimit: number;
            weekdayLimit: number;
            weekendLimit: number;
            sessionLimit: number;
            breakEvery: number;
            breakDuration: number;
            focusMode: boolean;
            downtimeEnabled: boolean;
          } | null;
          appLimits?: Array<{ id: number; name: string; minutes: number }>;
          categoryLimits?: Array<{ id: number; name: string; minutes: number }>;
          alwaysAllowed?: Array<{ id: number; name: string }>;
          blockedDuringFocus?: Array<{ id: number; name: string }>;
        } = await response.json();

        const limit = payload.timeLimit;
        if (limit) {
          setDailyLimit(limit.dailyLimit ?? 240);
          setWeekdayLimit(limit.weekdayLimit ?? 180);
          setWeekendLimit(limit.weekendLimit ?? 300);
          setSessionLimit(limit.sessionLimit ?? 60);
          setBreakEvery(limit.breakEvery ?? 45);
          setBreakDuration(limit.breakDuration ?? 10);
          setFocusMode(Boolean(limit.focusMode));
          setDowntimeEnabled(Boolean(limit.downtimeEnabled));
        }

        setAppLimits(
          payload.appLimits && payload.appLimits.length > 0
            ? payload.appLimits
            : defaultAppLimits
        );
        setCategoryLimits(
          payload.categoryLimits && payload.categoryLimits.length > 0
            ? payload.categoryLimits
            : defaultCategoryLimits
        );
        setBlockedDuringFocus(
          payload.blockedDuringFocus && payload.blockedDuringFocus.length > 0
            ? payload.blockedDuringFocus.map((item) => item.name)
            : ['Social Media', 'Gaming', 'Streaming Video']
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load time limits.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadLimits();
  }, [user?.id, selectedChildId, defaultAppLimits, defaultCategoryLimits]);

  const handleSave = async () => {
    if (!user?.id || !selectedChildId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/timelimits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: user.id,
          childId: selectedChildId,
          timeLimit: {
            dailyLimit,
            weekdayLimit,
            weekendLimit,
            sessionLimit,
            breakEvery,
            breakDuration,
            focusMode,
            downtimeEnabled
          },
          appLimits: appLimits.map((item) => ({ name: item.name, minutes: item.minutes })),
          categoryLimits: categoryLimits.map((item) => ({ name: item.name, minutes: item.minutes })),
          blockedDuringFocus
        })
      });

      if (!response.ok) {
        let message = 'Failed to save time limits.';
        try {
          const payload = await response.json();
          if (payload?.error) message = String(payload.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      setSuccess('Saved successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save time limits.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-1">Screen Time Limits</h1>
        <p className="text-sm md:text-base text-gray-500">Set healthy usage limits for your children</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">
          {loading ? 'Loading time limits...' : error ? error : success || 'Select a child to manage limits'}
        </div>
        <select
          value={selectedChildId ?? ''}
          onChange={(event) => {
            if (!event.target.value) return;
            setSelectedChildId(Number(event.target.value));
          }}
          className="w-full sm:w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {children.length === 0 && <option value="">No children</option>}
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
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
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Weekday vs Weekend</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekdays</p>
            <p className="text-xs text-gray-500 mb-3">Mon - Fri</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatMinutes(weekdayLimit)}</span>
              <input
                type="range"
                min={30}
                max={600}
                step={30}
                value={weekdayLimit}
                onChange={(event) => setWeekdayLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((weekdayLimit - 30) / (600 - 30)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekend</p>
            <p className="text-xs text-gray-500 mb-3">Sat - Sun</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatMinutes(weekendLimit)}</span>
              <input
                type="range"
                min={30}
                max={720}
                step={30}
                value={weekendLimit}
                onChange={(event) => setWeekendLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((weekendLimit - 30) / (720 - 30)) * 100}%`,
                }}
              />
            </div>
          </div>
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
              <p className={`text-xs ${downtimeEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                {downtimeEnabled ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Weekends</p>
              <p className="text-xs text-gray-500">Fri - Sun</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">10:00 PM - 8:00 AM</p>
              <p className={`text-xs ${downtimeEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                {downtimeEnabled ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Downtime Mode</p>
            <p className="text-xs text-gray-500">Lock all apps during bedtime</p>
          </div>
          <button
            onClick={() => setDowntimeEnabled(prev => !prev)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              downtimeEnabled ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {downtimeEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">App Time Limits</h3>
        <div className="space-y-3">
          {appLimits.map((app) => (
            <div key={app.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">{app.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{formatMinutes(app.minutes)}</span>
                <button
                  onClick={() => {
                    setEditingItem({ id: app.id, type: 'app' });
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

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Category Time Limits</h3>
        <div className="space-y-3">
          {categoryLimits.map((category) => (
            <div key={category.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-900">{category.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{formatMinutes(category.minutes)}</span>
                <button
                  onClick={() => {
                    setEditingItem({ id: category.id, type: 'category' });
                    setTempMinutes(category.minutes);
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

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Session Limits</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Max Session Length</p>
            <p className="text-xs text-gray-500 mb-3">Limit continuous usage</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatMinutes(sessionLimit)}</span>
              <input
                type="range"
                min={15}
                max={180}
                step={15}
                value={sessionLimit}
                onChange={(event) => setSessionLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((sessionLimit - 15) / (180 - 15)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Break Reminders</p>
            <p className="text-xs text-gray-500 mb-3">Encourage healthy breaks</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Every {formatMinutes(breakEvery)}</span>
              <input
                type="range"
                min={15}
                max={120}
                step={15}
                value={breakEvery}
                onChange={(event) => setBreakEvery(Number(event.target.value))}
                className="time-slider w-32 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((breakEvery - 15) / (120 - 15)) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-700">Break {formatMinutes(breakDuration)}</span>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={breakDuration}
                onChange={(event) => setBreakDuration(Number(event.target.value))}
                className="time-slider w-32 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((breakDuration - 5) / (30 - 5)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Focus Mode</h3>
        <div className="flex items-center justify-between mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Block distractions</p>
            <p className="text-xs text-gray-500">Temporarily pause entertainment apps</p>
          </div>
          <button
            onClick={() => setFocusMode(prev => !prev)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              focusMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {focusMode ? 'On' : 'Off'}
          </button>
        </div>
        <div className="space-y-2">
          {blockedDuringFocus.map((item) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2">
              <span className="text-sm font-medium text-gray-900">{item}</span>
              <button
                onClick={() => setBlockedDuringFocus(prev => prev.filter(entry => entry !== item))}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newBlocked}
            onChange={(event) => setNewBlocked(event.target.value)}
            placeholder="Add blocked app"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              const trimmed = newBlocked.trim();
              if (!trimmed) return;
              setBlockedDuringFocus(prev => [trimmed, ...prev]);
              setNewBlocked('');
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>


      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !selectedChildId}
          className="px-6 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
    {editingItem !== null && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Edit {editingItem.type === 'app' ? 'App' : 'Category'} Limit
              </h4>
              <p className="text-sm text-gray-500">Set daily limit in hours and minutes</p>
            </div>
            <button
              onClick={() => setEditingItem(null)}
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
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingItem.type === 'app') {
                    setAppLimits(prev =>
                      prev.map(app =>
                        app.id === editingItem.id ? { ...app, minutes: tempMinutes } : app
                      )
                    );
                  } else {
                    setCategoryLimits(prev =>
                      prev.map(category =>
                        category.id === editingItem.id ? { ...category, minutes: tempMinutes } : category
                      )
                    );
                  }
                  setEditingItem(null);
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
