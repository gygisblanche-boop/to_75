import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { BADGES, computeStreak, useApp } from "@/lib/app-store";
import { Sparkles, Lock, Plus, Trophy, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const COACH_LINES = [
  "Discipline beats motivation. Show up today.",
  "Every gram down is earned. Keep going.",
  "Hydrate. Train. Sleep. The formula works.",
  "Your future self is watching. Don't disappoint.",
  "Small wins compound into transformation.",
];

function Dashboard() {
  const { state, level, xpInLevel, xpForNext, bmi, setState, addXP } = useApp();
  const [weightInput, setWeightInput] = useState("");
  const [open, setOpen] = useState(false);

  if (!state.profile) return <Navigate to="/onboarding" />;
  const p = state.profile;

  const totalToLose = Math.max(0.01, p.startWeightKg - p.goalWeightKg);
  const lost = p.startWeightKg - p.currentWeightKg;
  const progress = Math.max(0, Math.min(1, lost / totalToLose));

  const streak = useMemo(() => computeStreak(state), [state]);
  const coach = useMemo(() => COACH_LINES[new Date().getDate() % COACH_LINES.length], []);

  const logWeight = () => {
    const w = parseFloat(weightInput);
    if (!w) return;
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, currentWeightKg: w } : s.profile,
      weightLogs: { ...s.weightLogs, [today]: w },
    }));
    addXP(50);
    setWeightInput("");
    setOpen(false);
  };

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-bold">Hey, {p.name.split(" ")[0]}</h1>
      </header>

      {/* Progress wheel */}
      <section className="rounded-3xl bg-gradient-surface p-6 shadow-card">
        <div className="flex flex-col items-center">
          <ProgressRing progress={progress} size={220} stroke={16} color="var(--primary)">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Current</span>
            <span className="text-4xl font-bold leading-none">{p.currentWeightKg.toFixed(1)}</span>
            <span className="mt-1 text-xs text-muted-foreground">kg → goal {p.goalWeightKg} kg</span>
          </ProgressRing>
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <Stat label="Lost" value={`${lost.toFixed(1)} kg`} accent="success" icon={<TrendingDown size={14} />} />
            <Stat label="BMI" value={bmi ? bmi.toFixed(1) : "—"} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 h-12 w-full rounded-xl bg-gradient-primary font-semibold text-primary-foreground shadow-glow-primary">
                <Plus size={18} /> Log Today's Weight
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Weight</DialogTitle></DialogHeader>
              <Input
                type="number" step="0.1" placeholder="kg" value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)} autoFocus
              />
              <Button onClick={logWeight} className="bg-gradient-primary font-semibold text-primary-foreground">
                Save (+50 XP)
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* AI Coach */}
      <section className="mt-4 rounded-3xl border border-primary/30 bg-surface p-5 shadow-card">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Live Coaching</span>
        </div>
        <p className="text-base font-medium leading-relaxed">{coach}</p>
        <p className="mt-2 text-xs text-muted-foreground">Powered by AI — Gemini integration ready</p>
      </section>

      {/* Gamification */}
      <section className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Level</p>
            <p className="text-3xl font-bold text-gradient-primary">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Streak</p>
            <p className="text-3xl font-bold text-[var(--success)]">{streak}🔥</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent">
          <div className="h-full rounded-full bg-gradient-primary transition-all"
               style={{ width: `${(xpInLevel / xpForNext) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{xpInLevel} / {xpForNext} XP to next level</p>
      </section>

      {/* Badges */}
      <section className="mt-4 rounded-3xl bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Milestone Badges</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const unlocked = b.req(state);
            return (
              <div key={b.id}
                className={`flex items-center gap-2 rounded-2xl border p-3 text-sm transition ${
                  unlocked
                    ? "border-[var(--success)]/40 bg-[var(--success)]/10 text-foreground shadow-glow-success"
                    : "border-border bg-background/40 text-muted-foreground"
                }`}>
                {unlocked ? <Trophy size={16} className="text-[var(--success)]" /> : <Lock size={14} />}
                <span className="font-medium">{b.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value, accent, icon }: { label: string; value: string; accent?: "success"; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-background/60 p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}{label}
      </div>
      <div className={`mt-1 text-xl font-bold ${accent === "success" ? "text-[var(--success)]" : ""}`}>{value}</div>
    </div>
  );
}
