import { useEffect, useState } from "react";

function readIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === "string" && /^\d{2}$/.test(id)))].slice(0, 24);
  } catch {
    return [];
  }
}

export function useStoredIds(key: string) {
  const [ids, setIds] = useState<string[]>(() => readIds(key));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      // The collection still works for this visit when browser storage is unavailable.
    }
  }, [ids, key]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === key) setIds(readIds(key));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);

  return [ids, setIds] as const;
}
