"use client";
/* eslint-disable max-lines */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useAuthUser } from '@/lib/auth';
import { detectSafekidExtensionInstalled, type ExtensionStatus } from '@/lib/extensionDetection';

type LimitItem = { id: number; name: string; minutes: number };

type TimeLimitsDraft = {
  dailyLimit: number;
  weekdayLimit: number;
  weekendLimit: number;
  schoolNightStartMinute: number;
  schoolNightEndMinute: number;
  weekendStartMinute: number;
  weekendEndMinute: number;
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
const DRAFT_VERSION = 2;
const DEFAULT_BEDTIME_SCHEDULE = {
  schoolNightStartMinute: 21 * 60,
  schoolNightEndMinute: 7 * 60,
  weekendStartMinute: 22 * 60,
  weekendEndMinute: 8 * 60,
} as const;

const DEFAULT_CATEGORY_MINUTES = 60;

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

const buildCategoryLimits = (
  availableCategories: Array<{ id: number; name: string }>,
  savedLimits: LimitItem[] | null | undefined,
  fallbackMinutes = DEFAULT_CATEGORY_MINUTES,
): LimitItem[] => {
  const saved = Array.isArray(savedLimits) ? savedLimits : [];
  if (!availableCategories || availableCategories.length === 0) {
    return saved;
  }
  const savedByKey = new Map(
    saved.map((item) => [normalizeCategoryKey(item.name), item]),
  );
  return availableCategories.map((category, index) => {
    const key = normalizeCategoryKey(category.name);
    const savedItem = savedByKey.get(key);
    const minutesValue = Number(savedItem?.minutes);
    const minutes =
      Number.isFinite(minutesValue) && minutesValue > 0
        ? Math.round(minutesValue)
        : fallbackMinutes;
    return {
      id: savedItem?.id ?? category.id ?? index + 1,
      name: category.name,
      minutes,
    };
  });
};

const readDraft = (parentId: number, childId: number): TimeLimitsDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getDraftKey(parentId, childId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimeLimitsDraft & { updatedAt?: number; version?: number };
    const updatedAt = Number(parsed.updatedAt);

    // Invalidate legacy drafts (no timestamp) and very old drafts to prevent stale values.
    if (!Number.isFinite(updatedAt) || parsed.version !== DRAFT_VERSION || Date.now() - updatedAt > DRAFT_MAX_AGE_MS) {
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
        version: DRAFT_VERSION,
      })
    );
  } catch {
    // ignore storage write errors
  }
};

export default function TimeLimitsContent({
  preferredChildId = null,
}: {
  preferredChildId?: number | null;
}) {
  const { user } = useAuthUser();
  const skipNextAutoSaveRef = useRef(true);
  const isSavingRef = useRef(false);
  const extensionAutoPromptedChildRef = useRef<number | null>(null);
  const hydratedChildRef = useRef<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState(240);
  const [weekdayLimit, setWeekdayLimit] = useState(180);
  const [weekendLimit, setWeekendLimit] = useState(300);
  const [schoolNightStartMinute, setSchoolNightStartMinute] = useState(
    DEFAULT_BEDTIME_SCHEDULE.schoolNightStartMinute,
  );
  const [schoolNightEndMinute, setSchoolNightEndMinute] = useState(
    DEFAULT_BEDTIME_SCHEDULE.schoolNightEndMinute,
  );
  const [weekendStartMinute, setWeekendStartMinute] = useState(
    DEFAULT_BEDTIME_SCHEDULE.weekendStartMinute,
  );
  const [weekendEndMinute, setWeekendEndMinute] = useState(
    DEFAULT_BEDTIME_SCHEDULE.weekendEndMinute,
  );
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

  const formatDuration = (minutesValue: number) => {
    const safeMinutes = Math.max(0, Math.round(minutesValue));
    const hrs = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const formatDurationFull = (minutesValue: number) => {
    const safeMinutes = Math.max(0, Math.round(minutesValue));
    const hrs = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
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
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryLimits, setCategoryLimits] = useState<LimitItem[]>([]);
  const [blockedDuringFocus, setBlockedDuringFocus] = useState<string[]>([
    'Social Media',
    'Gaming',
    'Streaming Video'
  ]);
  const [children, setChildren] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [dailyRefreshing, setDailyRefreshing] = useState(false);
  const [showInstallExtension, setShowInstallExtension] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>('not-installed');

  const toHourMinute = (minutesValue: number) => {
    const safeMinutes = Math.max(0, Math.round(minutesValue));
    return {
      hours: Math.floor(safeMinutes / 60),
      minutes: safeMinutes % 60,
    };
  };

  const toMinutesWithoutSecondsInput = (hours: number, minutes: number) => {
    const safeHours = Number.isFinite(hours) ? Math.max(0, Math.floor(hours)) : 0;
    const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.min(59, Math.floor(minutes))) : 0;
    const totalMinutes = safeHours * 60 + safeMinutes;
    return Math.max(1, totalMinutes);
  };

  const dailyParts = toHourMinute(dailyLimit);
  const weekdayParts = toHourMinute(weekdayLimit);
  const weekendParts = toHourMinute(weekendLimit);

  const updateDailyLimitPart = (part: 'hours' | 'minutes', value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    const nextHours = part === 'hours' ? safeValue : dailyParts.hours;
    const nextMinutes = part === 'minutes' ? Math.min(59, safeValue) : dailyParts.minutes;
    setDailyLimit(toMinutesWithoutSecondsInput(nextHours, nextMinutes));
  };

  const updateWeekdayLimitPart = (part: 'hours' | 'minutes', value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    const nextHours = part === 'hours' ? safeValue : weekdayParts.hours;
    const nextMinutes = part === 'minutes' ? Math.min(59, safeValue) : weekdayParts.minutes;
    setWeekdayLimit(toMinutesWithoutSecondsInput(nextHours, nextMinutes));
  };

  const updateWeekendLimitPart = (part: 'hours' | 'minutes', value: number) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    const nextHours = part === 'hours' ? safeValue : weekendParts.hours;
    const nextMinutes = part === 'minutes' ? Math.min(59, safeValue) : weekendParts.minutes;
    setWeekendLimit(toMinutesWithoutSecondsInput(nextHours, nextMinutes));
  };

  const updateCategoryLimitPart = (id: number, part: 'hours' | 'minutes', value: number) => {
    setCategoryLimits((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
        const currentHours = Math.floor(item.minutes / 60);
        const currentMinutes = item.minutes % 60;
        const nextHours = part === 'hours' ? safeValue : currentHours;
        const nextMinutes = part === 'minutes' ? Math.min(59, safeValue) : currentMinutes;
        return { ...item, minutes: Math.max(1, nextHours * 60 + nextMinutes) };
      }),
    );
  };

  const toCategoryParts = (minutes: number) => {
    const safeValue = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0;
    return {
      hours: Math.floor(safeValue / 60),
      minutes: safeValue % 60,
    };
  };

  const formatMinuteOfDay = (minutes: number) => {
    const safe = Math.max(0, Math.min(1439, Math.round(minutes)));
    const hour = Math.floor(safe / 60);
    const minute = safe % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const parseMinuteOfDay = (value: string, fallback: number) => {
    const [rawHour = "", rawMinute = ""] = value.split(":");
    const hour = Number.parseInt(rawHour, 10);
    const minute = Number.parseInt(rawMinute, 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return fallback;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return fallback;
    return hour * 60 + minute;
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

  const defaultCategoryLimits = useMemo<LimitItem[]>(() => [], []);

  useEffect(() => {
    if (!user?.id || !selectedChildId) {
      hydratedChildRef.current = null;
      setHydrated(false);
      return;
    }
    if (hydratedChildRef.current === selectedChildId) {
      return;
    }
    const draft = readDraft(user.id, selectedChildId);
    if (!draft) {
      hydratedChildRef.current = null;
      setHydrated(false);
      return;
    }
    skipNextAutoSaveRef.current = true;
    setDailyLimit(Number(draft.dailyLimit) || 240);
    setWeekdayLimit(Number(draft.weekdayLimit) || 180);
    setWeekendLimit(Number(draft.weekendLimit) || 300);
    setSchoolNightStartMinute(
      Number.isFinite(Number(draft.schoolNightStartMinute))
        ? Math.max(0, Math.min(1439, Math.round(Number(draft.schoolNightStartMinute))))
        : DEFAULT_BEDTIME_SCHEDULE.schoolNightStartMinute,
    );
    setSchoolNightEndMinute(
      Number.isFinite(Number(draft.schoolNightEndMinute))
        ? Math.max(0, Math.min(1439, Math.round(Number(draft.schoolNightEndMinute))))
        : DEFAULT_BEDTIME_SCHEDULE.schoolNightEndMinute,
    );
    setWeekendStartMinute(
      Number.isFinite(Number(draft.weekendStartMinute))
        ? Math.max(0, Math.min(1439, Math.round(Number(draft.weekendStartMinute))))
        : DEFAULT_BEDTIME_SCHEDULE.weekendStartMinute,
    );
    setWeekendEndMinute(
      Number.isFinite(Number(draft.weekendEndMinute))
        ? Math.max(0, Math.min(1439, Math.round(Number(draft.weekendEndMinute))))
        : DEFAULT_BEDTIME_SCHEDULE.weekendEndMinute,
    );
    setSessionLimit(Number(draft.sessionLimit) || 60);
    setBreakEvery(Number(draft.breakEvery) || 45);
    setBreakDuration(Number(draft.breakDuration) || 10);
    setFocusMode(Boolean(draft.focusMode));
    setDowntimeEnabled(Boolean(draft.downtimeEnabled));
    setAppLimits(Array.isArray(draft.appLimits) && draft.appLimits.length > 0 ? draft.appLimits : defaultAppLimits);
    const nextCategoryLimits = buildCategoryLimits(
      availableCategories,
      draft.categoryLimits,
      DEFAULT_CATEGORY_MINUTES,
    );
    setCategoryLimits(nextCategoryLimits.length > 0 ? nextCategoryLimits : defaultCategoryLimits);
    setBlockedDuringFocus(
      Array.isArray(draft.blockedDuringFocus) && draft.blockedDuringFocus.length > 0
        ? draft.blockedDuringFocus
        : ['Social Media', 'Gaming', 'Streaming Video']
    );
    setHydrated(true);
    hydratedChildRef.current = selectedChildId;
  }, [availableCategories, defaultAppLimits, defaultCategoryLimits, selectedChildId, user?.id]);

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
        if (preferredChildId && data.some((child) => child.id === preferredChildId)) {
          setSelectedChildId(preferredChildId);
          return;
        }
        if (!selectedChildId && data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch {
        // ignore
      }
    };

    void loadChildren();
  }, [preferredChildId, selectedChildId, user?.id]);

  useEffect(() => {
    if (!preferredChildId) return;
    if (!children.some((child) => child.id === preferredChildId)) return;
    setSelectedChildId(preferredChildId);
  }, [children, preferredChildId]);

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
          bedtimeSchedule?: {
            schoolNightStartMinute: number;
            schoolNightEndMinute: number;
            weekendStartMinute: number;
            weekendEndMinute: number;
          } | null;
          appLimits?: Array<{ id: number; name: string; minutes: number }>;
          categoryLimits?: Array<{ id: number; name: string; minutes: number }>;
          availableCategories?: Array<{ id: number; name: string }>;
          alwaysAllowed?: Array<{ id: number; name: string }>;
          blockedDuringFocus?: Array<{ id: number; name: string }>;
        } = await response.json();

        skipNextAutoSaveRef.current = true;

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
        const bedtime = payload.bedtimeSchedule;
        setSchoolNightStartMinute(
          bedtime?.schoolNightStartMinute ?? DEFAULT_BEDTIME_SCHEDULE.schoolNightStartMinute,
        );
        setSchoolNightEndMinute(
          bedtime?.schoolNightEndMinute ?? DEFAULT_BEDTIME_SCHEDULE.schoolNightEndMinute,
        );
        setWeekendStartMinute(
          bedtime?.weekendStartMinute ?? DEFAULT_BEDTIME_SCHEDULE.weekendStartMinute,
        );
        setWeekendEndMinute(
          bedtime?.weekendEndMinute ?? DEFAULT_BEDTIME_SCHEDULE.weekendEndMinute,
        );

        setAppLimits(
          payload.appLimits && payload.appLimits.length > 0
            ? payload.appLimits
            : defaultAppLimits
        );
        const nextAvailableCategories = payload.availableCategories ?? [];
        setAvailableCategories(nextAvailableCategories);
        const nextCategoryLimits = buildCategoryLimits(
          nextAvailableCategories,
          payload.categoryLimits,
          DEFAULT_CATEGORY_MINUTES,
        );
        setCategoryLimits(nextCategoryLimits);
        setBlockedDuringFocus(
          payload.blockedDuringFocus && payload.blockedDuringFocus.length > 0
            ? payload.blockedDuringFocus.map((item) => item.name)
            : ['Social Media', 'Gaming', 'Streaming Video']
        );
        setHydrated(true);
        hydratedChildRef.current = selectedChildId;

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
          setDailyLimit(240);
          setWeekdayLimit(180);
          setWeekendLimit(300);
          setSchoolNightStartMinute(DEFAULT_BEDTIME_SCHEDULE.schoolNightStartMinute);
          setSchoolNightEndMinute(DEFAULT_BEDTIME_SCHEDULE.schoolNightEndMinute);
          setWeekendStartMinute(DEFAULT_BEDTIME_SCHEDULE.weekendStartMinute);
          setWeekendEndMinute(DEFAULT_BEDTIME_SCHEDULE.weekendEndMinute);
          setSessionLimit(60);
          setBreakEvery(45);
          setBreakDuration(10);
          setFocusMode(false);
          setDowntimeEnabled(true);
          setAppLimits(defaultAppLimits);
          setCategoryLimits(defaultCategoryLimits);
          setBlockedDuringFocus(['Social Media', 'Gaming', 'Streaming Video']);
        }
        setHydrated(true);
        hydratedChildRef.current = selectedChildId;
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
          bedtimeSchedule: {
            schoolNightStartMinute,
            schoolNightEndMinute,
            weekendStartMinute,
            weekendEndMinute,
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
        schoolNightStartMinute,
        schoolNightEndMinute,
        weekendStartMinute,
        weekendEndMinute,
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
    schoolNightEndMinute,
    schoolNightStartMinute,
    selectedChildId,
    sessionLimit,
    user?.id,
    weekendEndMinute,
    weekendStartMinute,
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

  const checkExtensionInstalled = useCallback(async (options?: { openIfMissing?: boolean }) => {
    setExtensionStatus('checking');
    const installed = await detectSafekidExtensionInstalled();
    const nextStatus: ExtensionStatus = installed ? 'installed' : 'not-installed';
    setExtensionStatus(nextStatus);
    if (!installed && options?.openIfMissing) {
      setShowInstallExtension(true);
    }
    return installed;
  }, []);

  const openInstallExtensionDebug = () => {
    setShowInstallExtension(true);
    void checkExtensionInstalled();
  };

  useEffect(() => {
    if (!selectedChildId || !hydrated || loading) return;
    if (extensionAutoPromptedChildRef.current === selectedChildId) return;
    extensionAutoPromptedChildRef.current = selectedChildId;
    void checkExtensionInstalled({ openIfMissing: true });
  }, [checkExtensionInstalled, hydrated, loading, selectedChildId]);

  useEffect(() => {
    if (!user?.id || !selectedChildId || !hydrated) return;
    const draft: TimeLimitsDraft = {
      dailyLimit,
      weekdayLimit,
      weekendLimit,
      schoolNightStartMinute,
      schoolNightEndMinute,
      weekendStartMinute,
      weekendEndMinute,
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
    schoolNightEndMinute,
    schoolNightStartMinute,
    selectedChildId,
    sessionLimit,
    user?.id,
    weekendEndMinute,
    weekendStartMinute,
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
      <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-3xl font-semibold text-gray-900 mb-1">Screen Time Limits</h1>
        <p className="text-xs md:text-sm text-gray-500">Set healthy usage limits for your children</p>
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

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">Daily Time Limit</h3>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => {
                void handleDailyRefresh();
              }}
              disabled={dailyRefreshing || loading || !selectedChildId}
              className="w-full sm:w-auto rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {dailyRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={openInstallExtensionDebug}
              className="w-full sm:w-auto rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 cursor-pointer"
            >
              Show Install Extension
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{formatDurationFull(dailyLimit)}</p>
            <p className="text-sm text-gray-600">Maximum daily screen time</p>
          </div>
          <Clock className="w-9 h-9 md:w-10 md:h-10 text-blue-500" />
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
              value={dailyParts.hours}
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
              value={dailyParts.minutes}
              onChange={(event) => updateDailyLimitPart('minutes', Number(event.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Weekday vs Weekend</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekdays</p>
            <p className="text-xs text-gray-500 mb-3">Mon - Fri</p>
            <p className="mb-3 text-lg font-semibold text-gray-900">{formatDuration(weekdayLimit)}</p>
            <div className="flex items-end gap-3">
              <label className="flex-1">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Hour
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={weekdayParts.hours}
                  onChange={(event) => updateWeekdayLimitPart('hours', Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  value={weekdayParts.minutes}
                  onChange={(event) => updateWeekdayLimitPart('minutes', Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Weekend</p>
            <p className="text-xs text-gray-500 mb-3">Sat - Sun</p>
            <p className="mb-3 text-lg font-semibold text-gray-900">{formatDuration(weekendLimit)}</p>
            <div className="flex items-end gap-3">
              <label className="flex-1">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Hour
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={weekendParts.hours}
                  onChange={(event) => updateWeekendLimitPart('hours', Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  value={weekendParts.minutes}
                  onChange={(event) => updateWeekendLimitPart('minutes', Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Bedtime Schedule</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">School Nights</p>
            <p className="mb-3 text-xs text-gray-500">Mon - Thu</p>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Start
                </span>
                <input
                  type="time"
                  value={formatMinuteOfDay(schoolNightStartMinute)}
                  onChange={(event) =>
                    setSchoolNightStartMinute(
                      parseMinuteOfDay(event.target.value, schoolNightStartMinute),
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  End
                </span>
                <input
                  type="time"
                  value={formatMinuteOfDay(schoolNightEndMinute)}
                  onChange={(event) =>
                    setSchoolNightEndMinute(
                      parseMinuteOfDay(event.target.value, schoolNightEndMinute),
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Weekends</p>
            <p className="mb-3 text-xs text-gray-500">Fri - Sun</p>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Start
                </span>
                <input
                  type="time"
                  value={formatMinuteOfDay(weekendStartMinute)}
                  onChange={(event) =>
                    setWeekendStartMinute(parseMinuteOfDay(event.target.value, weekendStartMinute))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  End
                </span>
                <input
                  type="time"
                  value={formatMinuteOfDay(weekendEndMinute)}
                  onChange={(event) =>
                    setWeekendEndMinute(parseMinuteOfDay(event.target.value, weekendEndMinute))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-3.5 md:p-5 border border-gray-200/80">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Category Time Limits</h3>
        <div className="space-y-3">
          {categoryLimits.map((category) => (
            <div key={category.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {formatMinutes(category.minutes)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Hour
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={toCategoryParts(category.minutes).hours}
                    onChange={(event) =>
                      updateCategoryLimitPart(category.id, 'hours', Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Minute
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    value={toCategoryParts(category.minutes).minutes}
                    onChange={(event) =>
                      updateCategoryLimitPart(category.id, 'minutes', Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              </div>
            </div>
          ))}
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
    {showInstallExtension && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Install Browser Extension</h4>
              <p className="text-sm text-slate-600">
                Extension is required for live tracking and enforcement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInstallExtension(false)}
              className="h-9 w-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Close extension setup"
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                extensionStatus === 'installed'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : extensionStatus === 'not-installed'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {extensionStatus === 'installed' && 'Extension detected in this browser.'}
              {extensionStatus === 'not-installed' &&
                'Extension not detected. Install it, then click Re-check.'}
              {extensionStatus === 'checking' && 'Checking extension status...'}
            </div>

            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Open <code>chrome://extensions</code></li>
              <li>Enable <strong>Developer mode</strong></li>
              <li>
                Click <strong>Load unpacked</strong> and select{" "}
                <code>/Users/25LP5321/Desktop/safe-kid/extantion/extension-tustai/chrome-extension</code>
              </li>
            </ol>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setShowInstallExtension(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                void checkExtensionInstalled();
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Re-check Extension
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
