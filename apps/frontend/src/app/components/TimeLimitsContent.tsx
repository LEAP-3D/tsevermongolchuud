"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Clock, Plus } from 'lucide-react';
import { useAuthUser } from '@/lib/auth';

type LimitItem = { id: number; name: string; minutes: number };

type TimeLimitsDraft = {
  dailyLimit: number;
  weekdayLimit: number;
  weekendLimit: number;
  sessionLimit: number;
  breakEvery: number;
  breakDuration: number;
  focusMode: boolean;
  downtimeEnabled: boolean;
  appLimits: LimitItem[];
  categoryLimits: LimitItem[];
  blockedDuringFocus: string[];
};

const getDraftKey = (parentId: number, childId: number) => `timelimits:draft:${parentId}:${childId}`;
const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const readDraft = (parentId: number, childId: number): TimeLimitsDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getDraftKey(parentId, childId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimeLimitsDraft & { updatedAt?: number };
    const updatedAt = Number(parsed.updatedAt);

    // Invalidate legacy drafts (no timestamp) and very old drafts to prevent stale values.
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > DRAFT_MAX_AGE_MS) {
      window.localStorage.removeItem(getDraftKey(parentId, childId));
      return null;
    }

    const { updatedAt: _updatedAt, ...draft } = parsed;
    return draft as TimeLimitsDraft;
  } catch {
    return null;
  }
};

const writeDraft = (parentId: number, childId: number, draft: TimeLimitsDraft) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getDraftKey(parentId, childId),
      JSON.stringify({
        ...draft,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // ignore storage write errors
  }
};

export default function TimeLimitsContent() {
  const { user } = useAuthUser();
  const skipNextAutoSaveRef = useRef(true);
  const isSavingRef = useRef(false);
  const [dailyLimit, setDailyLimit] = useState(240 * 60);
  const [weekdayLimit, setWeekdayLimit] = useState(180 * 60);
  const [weekendLimit, setWeekendLimit] = useState(300 * 60);
  const [sessionLimit, setSessionLimit] = useState(60 * 60);
  const [breakEvery, setBreakEvery] = useState(45 * 60);
  const [breakDuration, setBreakDuration] = useState(10 * 60);
  const [focusMode, setFocusMode] = useState(false);
  const [downtimeEnabled, setDowntimeEnabled] = useState(true);

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.max(0, Math.round(seconds));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0 && mins > 0 && secs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0 && secs > 0) return `${hrs}h ${secs}s`;
    if (hrs > 0) return `${hrs}h`;
    if (mins > 0 && secs > 0) return `${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m`;
    return `${secs}s`;
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
  const [hydrated, setHydrated] = useState(false);
  const [dailyRefreshing, setDailyRefreshing] = useState(false);

  const dailyHours = Math.floor(dailyLimit / 3600);
  const dailyMinutes = Math.floor((dailyLimit % 3600) / 60);
  const dailySeconds = dailyLimit % 60;

  const updateDailyLimitPart = (part: 'hours' | 'minutes' | 'seconds', value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    const nextHours = part === 'hours' ? safeValue : dailyHours;
    const nextMinutes = part === 'minutes' ? Math.min(59, safeValue) : dailyMinutes;
    const nextSeconds = part === 'seconds' ? Math.min(59, safeValue) : dailySeconds;
    const total = nextHours * 3600 + nextMinutes * 60 + nextSeconds;
    setDailyLimit(total >= 1 ? total : 1);
  };

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
    if (!user?.id || !selectedChildId) {
      setHydrated(false);
      return;
    }
    const draft = readDraft(user.id, selectedChildId);
    if (!draft) {
      setHydrated(false);
      return;
    }
    skipNextAutoSaveRef.current = true;
    setDailyLimit(Number(draft.dailyLimit) || 1);
    setWeekdayLimit(Number(draft.weekdayLimit) || 180 * 60);
    setWeekendLimit(Number(draft.weekendLimit) || 300 * 60);
    setSessionLimit(Number(draft.sessionLimit) || 60 * 60);
    setBreakEvery(Number(draft.breakEvery) || 45 * 60);
    setBreakDuration(Number(draft.breakDuration) || 10 * 60);
    setFocusMode(Boolean(draft.focusMode));
    setDowntimeEnabled(Boolean(draft.downtimeEnabled));
    setAppLimits(Array.isArray(draft.appLimits) && draft.appLimits.length > 0 ? draft.appLimits : defaultAppLimits);
    setCategoryLimits(
      Array.isArray(draft.categoryLimits) && draft.categoryLimits.length > 0
        ? draft.categoryLimits
        : defaultCategoryLimits
    );
    setBlockedDuringFocus(
      Array.isArray(draft.blockedDuringFocus) && draft.blockedDuringFocus.length > 0
        ? draft.blockedDuringFocus
        : ['Social Media', 'Gaming', 'Streaming Video']
    );
    setHydrated(true);
  }, [defaultAppLimits, defaultCategoryLimits, selectedChildId, user?.id]);

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

  const loadLimitsFromServer = useCallback(
    async (options?: { isManualRefresh?: boolean; manualSuccessMessage?: string }) => {
      if (!user?.id || !selectedChildId) return;

      const isManualRefresh = Boolean(options?.isManualRefresh);
      if (isManualRefresh) {
        setDailyRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');
      if (isManualRefresh) {
        setSuccess('');
      }

      try {
        const response = await fetch(`/api/timelimits?childId=${selectedChildId}`, {
          cache: 'no-store',
          credentials: 'include',
        });
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

        skipNextAutoSaveRef.current = true;

        const limit = payload.timeLimit;
        if (limit) {
          setDailyLimit(limit.dailyLimit ?? 240 * 60);
          setWeekdayLimit(limit.weekdayLimit ?? 180 * 60);
          setWeekendLimit(limit.weekendLimit ?? 300 * 60);
          setSessionLimit(limit.sessionLimit ?? 60 * 60);
          setBreakEvery(limit.breakEvery ?? 45 * 60);
          setBreakDuration(limit.breakDuration ?? 10 * 60);
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
        setHydrated(true);

        if (isManualRefresh) {
          setSuccess(
            options?.manualSuccessMessage ?? 'Daily time limit refreshed from server (extension-synced).'
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load time limits.';
        setError(message);
        if (/failed to fetch/i.test(message)) {
          if (user?.id && selectedChildId && typeof window !== 'undefined') {
            window.localStorage.removeItem(getDraftKey(user.id, selectedChildId));
          }
          setDailyLimit(240 * 60);
          setWeekdayLimit(180 * 60);
          setWeekendLimit(300 * 60);
          setSessionLimit(60 * 60);
          setBreakEvery(45 * 60);
          setBreakDuration(10 * 60);
          setFocusMode(false);
          setDowntimeEnabled(true);
          setAppLimits(defaultAppLimits);
          setCategoryLimits(defaultCategoryLimits);
          setBlockedDuringFocus(['Social Media', 'Gaming', 'Streaming Video']);
        }
        setHydrated(true);
      } finally {
        setLoading(false);
        setDailyRefreshing(false);
      }
    },
    [defaultAppLimits, defaultCategoryLimits, selectedChildId, user?.id]
  );

  useEffect(() => {
    void loadLimitsFromServer();
  }, [loadLimitsFromServer]);

  const saveToServer = useCallback(async (silent = false) => {
    if (!user?.id || !selectedChildId) return;
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);
    setError('');
    if (!silent) {
      setSuccess('');
    }
    try {
      const response = await fetch('/api/timelimits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
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
      setSuccess(silent ? 'Auto-saved to server.' : 'Saved to server.');
      const draft: TimeLimitsDraft = {
        dailyLimit,
        weekdayLimit,
        weekendLimit,
        sessionLimit,
        breakEvery,
        breakDuration,
        focusMode,
        downtimeEnabled,
        appLimits,
        categoryLimits,
        blockedDuringFocus,
      };
      writeDraft(user.id, selectedChildId, draft);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save time limits.';
      setError(message);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  }, [
    appLimits,
    blockedDuringFocus,
    breakDuration,
    breakEvery,
    categoryLimits,
    dailyLimit,
    downtimeEnabled,
    focusMode,
    selectedChildId,
    sessionLimit,
    user?.id,
    weekdayLimit,
    weekendLimit,
  ]);

  const handleSave = async () => {
    await saveToServer(false);
  };

  const handleDailyRefresh = async () => {
    if (!selectedChildId) return;

    setDailyRefreshing(true);
    setError('');
    setSuccess('');

    try {
      const resetResponse = await fetch('/api/timelimits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          childId: selectedChildId,
          action: 'RESET_DAILY_TIMER'
        })
      });

      if (!resetResponse.ok) {
        let message = 'Failed to reset daily timer.';
        try {
          const payload = await resetResponse.json();
          if (payload?.error) message = String(payload.error);
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      await loadLimitsFromServer({
        isManualRefresh: true,
        manualSuccessMessage: 'Daily timer reset and refreshed from server (extension-synced).'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset daily timer.';
      setError(message);
      setDailyRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !selectedChildId || !hydrated) return;
    const draft: TimeLimitsDraft = {
      dailyLimit,
      weekdayLimit,
      weekendLimit,
      sessionLimit,
      breakEvery,
      breakDuration,
      focusMode,
      downtimeEnabled,
      appLimits,
      categoryLimits,
      blockedDuringFocus,
    };
    writeDraft(user.id, selectedChildId, draft);
  }, [
    appLimits,
    blockedDuringFocus,
    breakDuration,
    breakEvery,
    categoryLimits,
    dailyLimit,
    downtimeEnabled,
    focusMode,
    hydrated,
    selectedChildId,
    sessionLimit,
    user?.id,
    weekdayLimit,
    weekendLimit,
  ]);

  useEffect(() => {
    if (!user?.id || !selectedChildId || !hydrated || loading) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveToServer(true);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [hydrated, loading, saveToServer, selectedChildId, user?.id]);

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
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Daily Time Limit</h3>
          <button
            onClick={() => {
              void handleDailyRefresh();
            }}
            disabled={dailyRefreshing || loading || !selectedChildId}
            className="w-full sm:w-auto rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dailyRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatDuration(dailyLimit)}</p>
            <p className="text-sm text-gray-600">Maximum daily screen time</p>
          </div>
          <Clock className="w-10 h-10 md:w-12 md:h-12 text-blue-500" />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Hour
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={dailyHours}
              onChange={(event) => updateDailyLimitPart('hours', Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Minute
            </span>
            <input
              type="number"
              min={0}
              max={59}
              step={1}
              value={dailyMinutes}
              onChange={(event) => updateDailyLimitPart('minutes', Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Second
            </span>
            <input
              type="number"
              min={0}
              max={59}
              step={1}
              value={dailySeconds}
              onChange={(event) => updateDailyLimitPart('seconds', Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Weekday vs Weekend</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekdays</p>
            <p className="text-xs text-gray-500 mb-3">Mon - Fri</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatDuration(weekdayLimit)}</span>
              <input
                type="range"
                min={30 * 60}
                max={10 * 60 * 60}
                step={1}
                value={weekdayLimit}
                onChange={(event) => setWeekdayLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((weekdayLimit - 30 * 60) / (10 * 60 * 60 - 30 * 60)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekend</p>
            <p className="text-xs text-gray-500 mb-3">Sat - Sun</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">{formatDuration(weekendLimit)}</span>
              <input
                type="range"
                min={30 * 60}
                max={12 * 60 * 60}
                step={1}
                value={weekendLimit}
                onChange={(event) => setWeekendLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((weekendLimit - 30 * 60) / (12 * 60 * 60 - 30 * 60)) * 100}%`,
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
              <span className="text-lg font-semibold text-gray-900">{formatDuration(sessionLimit)}</span>
              <input
                type="range"
                min={15 * 60}
                max={3 * 60 * 60}
                step={1}
                value={sessionLimit}
                onChange={(event) => setSessionLimit(Number(event.target.value))}
                className="time-slider w-40 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((sessionLimit - 15 * 60) / (3 * 60 * 60 - 15 * 60)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Break Reminders</p>
            <p className="text-xs text-gray-500 mb-3">Encourage healthy breaks</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Every {formatDuration(breakEvery)}</span>
              <input
                type="range"
                min={15 * 60}
                max={2 * 60 * 60}
                step={1}
                value={breakEvery}
                onChange={(event) => setBreakEvery(Number(event.target.value))}
                className="time-slider w-32 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((breakEvery - 15 * 60) / (2 * 60 * 60 - 15 * 60)) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-700">Break {formatDuration(breakDuration)}</span>
              <input
                type="range"
                min={5 * 60}
                max={30 * 60}
                step={1}
                value={breakDuration}
                onChange={(event) => setBreakDuration(Number(event.target.value))}
                className="time-slider w-32 cursor-pointer"
                style={{
                  ['--fill' as string]: `${((breakDuration - 5 * 60) / (30 * 60 - 5 * 60)) * 100}%`,
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
