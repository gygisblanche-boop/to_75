import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Profile = {
  name: string;
  age: number;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  startDate: string; // ISO
};

export type Exercise = { id: string; name: string; target: number; logs: Record<string, number> };
export type Habit = { id: string; label: string };
export type Task = { id: string; text: string; done: boolean; createdDate: string };
export type Meal = { date: string; text: string };
export type BodyMetrics = {
  bodyFat?: number;
  muscleMass?: number;
  steps?: number;
  sleepDuration?: number;
  sleepStart?: string; // HH:MM
};

export type AppState = {
  profile: Profile | null;
  xp: number;
  exercises: Exercise[];
  habits: Habit[];
  habitChecks: Record<string, Record<string, boolean>>; // date -> habitId -> checked
  tasks: Task[];
  meals: Meal[];
  weightLogs: Record<string, number>; // date -> kg
  body: BodyMetrics;
};

const DEFAULT_HABITS: Habit[] = [
  { id: "wake", label: "Wake Up Early" },
  { id: "hydrate", label: "Hydration (3L)" },
  { id: "clean", label: "Eat Clean" },
  { id: "junk", label: "Avoid Junk" },
  { id: "sleep", label: "Sleep on Time" },
];

const DEFAULT_STATE: AppState = {
  profile: null,
  xp: 0,
  exercises: [
    { id: "pushups", name: "Pushups", target: 50, logs: {} },
    { id: "pullups", name: "Pullups", target: 20, logs: {} },
  ],
  habits: DEFAULT_HABITS,
  habitChecks: {},
  tasks: [],
  meals: [],
  weightLogs: {},
  body: {},
};

const STORAGE_KEY = "myjourney_state_v1";

type Ctx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  addXP: (n: number) => void;
  todayKey: string;
  level: number;
  xpInLevel: number;
  xpForNext: number;
  bmi: number | null;
};

const AppCtx = createContext<Ctx | null>(null);

export const todayISO = () => new Date().toISOString().slice(0, 10);

function loadState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed, habits: DEFAULT_HABITS };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setRaw] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRaw(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setState = useCallback((updater: (s: AppState) => AppState) => {
    setRaw((s) => updater(s));
  }, []);

  const addXP = useCallback((n: number) => setRaw((s) => ({ ...s, xp: s.xp + n })), []);

  const todayKey = todayISO();
  const level = Math.floor(state.xp / 200) + 1;
  const xpInLevel = state.xp % 200;
  const xpForNext = 200;

  const bmi = useMemo(() => {
    if (!state.profile) return null;
    const h = state.profile.heightCm / 100;
    return state.profile.currentWeightKg / (h * h);
  }, [state.profile]);

  // Carry over uncompleted tasks from previous days
  useEffect(() => {
    if (!hydrated) return;
    setRaw((s) => {
      const today = todayISO();
      const needCarry = s.tasks.some((t) => !t.done && t.createdDate !== today);
      if (!needCarry) return s;
      return {
        ...s,
        tasks: s.tasks.map((t) => (!t.done && t.createdDate !== today ? { ...t, createdDate: today } : t)),
      };
    });
  }, [hydrated]);

  return (
    <AppCtx.Provider value={{ state, setState, addXP, todayKey, level, xpInLevel, xpForNext, bmi }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const BADGES = [
  { id: "5kg", label: "5kg Dropped", req: (s: AppState) => s.profile && s.profile.startWeightKg - s.profile.currentWeightKg >= 5 },
  { id: "10kg", label: "10kg Club", req: (s: AppState) => s.profile && s.profile.startWeightKg - s.profile.currentWeightKg >= 10 },
  { id: "streak7", label: "7-Day Streak Master", req: (s: AppState) => computeStreak(s) >= 7 },
  { id: "level5", label: "Level 5 Athlete", req: (s: AppState) => s.xp >= 800 },
];

export function computeStreak(s: AppState): number {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    const checks = s.habitChecks[key] || {};
    const allDone = s.habits.every((h) => checks[h.id]);
    if (allDone) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
