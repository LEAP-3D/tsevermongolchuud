import { useEffect, useState } from "react";

export type AuthUser = {
  id: number;
  email: string;
  name?: string | null;
  expiresAt: number;
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
    if (!Number.isFinite(parsed.expiresAt)) return null;
    if (Date.now() >= Number(parsed.expiresAt)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
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
    let isMounted = true;

    const syncLocal = () => {
      if (!isMounted) return;
      setUser(getStoredUser());
      setLoading(false);
    };

    const syncWithServer = async () => {
      const localUser = getStoredUser();
      if (!isMounted) return;
      setUser(localUser);
      setLoading(false);
      if (!localUser) return;

      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          clearStoredUser();
          return;
        }

        const payload = (await response.json()) as { user?: AuthUser };
        const nextUser = payload?.user;
        if (
          !nextUser ||
          !Number.isFinite(nextUser.id) ||
          typeof nextUser.email !== "string" ||
          !Number.isFinite(nextUser.expiresAt)
        ) {
          clearStoredUser();
          return;
        }
        setStoredUser(nextUser);
      } catch {
        // Keep local session if the check fails temporarily.
      }
    };

    void syncWithServer();
    const onStorage = () => syncLocal();
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT_KEY, onStorage);
    const interval = window.setInterval(syncLocal, 15_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT_KEY, onStorage);
    };
  }, []);

  return { user, loading };
};
