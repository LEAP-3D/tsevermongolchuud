import { useEffect, useState } from "react";

export type AuthUser = {
  id: number;
  email: string;
  name?: string | null;
};

const STORAGE_KEY = "authUser";
const EVENT_KEY = "authuser:change";

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser | null) => {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(EVENT_KEY));
};

export const clearStoredUser = () => setStoredUser(null);

export const useAuthUser = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setUser(getStoredUser());
      setLoading(false);
    };
    sync();
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_KEY, onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_KEY, onStorage);
    };
  }, []);

  return { user, loading };
};
