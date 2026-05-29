import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp, todayISO } from "@/lib/app-store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Flame, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/habits")({
  component: HabitsPage,
});

function last7Days(): string[] {
  const arr: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    arr.push(x.toISOString().slice(0, 10));
  }
  return arr;
}

function HabitsPage() {
  const { state, setState, addXP } = useApp();
  if (!state.profile) return <Navigate to="/onboarding" />;

  const today = todayISO();
  const days = last7Days();

  const toggle = (habitId: string) => {
    const wasChecked = state.habitChecks[today]?.[habitId];
    setState((s) => {
      const day = { ...(s.habitChecks[today] || {}) };
      day[habitId] = !day[habitId];
      return { ...s, habitChecks: { ...s.habitChecks, [today]: day } };
    });
    if (!wasChecked) addXP(10);
  };

  const isDayComplete = (key: string) => {
    const checks = state.habitChecks[key] || {};
    return state.habits.every((h) => checks[h.id]);
  };

  const [meal, setMeal] = useState(
    state.meals.find((m) => m.date === today)?.text || ""
  );

  const saveMeal = () => {
    setState((s) => {
      const others = s.meals.filter((m) => m.date !== today);
      return { ...s, meals: [...others, { date: today, text: meal }] };
    });
  };

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Streak Machine</p>
        <h1 className="text-3xl font-bold">Daily Habits</h1>
      </header>

      {/* 7-day sticker calendar */}
      <section className="rounded-3xl bg-gradient-surface p-5 shadow-card">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Last 7 days</p>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const complete = isDayComplete(d);
            const isToday = d === today;
            const day = new Date(d).toLocaleDateString(undefined, { weekday: "narrow" });
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{day}</span>
                <div className={`grid h-11 w-11 place-items-center rounded-xl border text-lg transition-all ${
                  complete
                    ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow-primary"
                    : isToday
                      ? "border-primary/50 bg-surface"
                      : "border-border bg-surface/50"
                }`}>
                  {complete ? <Flame size={20} /> : <span className="text-xs text-muted-foreground">{new Date(d).getDate()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Today checklist */}
      <section className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest">Today's Checklist</h3>
        <ul className="space-y-2">
          {state.habits.map((h) => {
            const done = !!state.habitChecks[today]?.[h.id];
            return (
              <li key={h.id}>
                <button
                  onClick={() => toggle(h.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    done
                      ? "border-[var(--success)]/40 bg-[var(--success)]/10"
                      : "border-border bg-background/40 hover:border-primary/40"
                  }`}
                >
                  <span className={`font-medium ${done ? "text-foreground" : "text-foreground/80"}`}>{h.label}</span>
                  <span className={`grid h-7 w-7 place-items-center rounded-full transition ${
                    done ? "bg-[var(--success)] text-[var(--success-foreground)]" : "border border-border"
                  }`}>
                    {done && <Check size={16} strokeWidth={3} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Meal log */}
      <section className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest">Meal Log — Today</h3>
        <Textarea
          value={meal} onChange={(e) => setMeal(e.target.value)}
          placeholder="Breakfast: oats &amp; eggs&#10;Lunch: chicken &amp; rice&#10;Dinner: salmon &amp; salad"
          rows={5} className="bg-background/60"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={saveMeal} className="flex-1 bg-gradient-primary font-semibold text-primary-foreground">
            Save Log
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <ImagePlus size={16} /> Photo
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Image attachments coming soon — Gemini Vision ready.</p>
      </section>
    </AppShell>
  );
}
