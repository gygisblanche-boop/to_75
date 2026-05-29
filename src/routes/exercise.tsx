import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProgressRing } from "@/components/ProgressRing";
import { useApp, todayISO } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Zap } from "lucide-react";

export const Route = createFileRoute("/exercise")({
  component: ExercisePage,
});

function ExercisePage() {
  const { state, setState, addXP } = useApp();
  if (!state.profile) return <Navigate to="/onboarding" />;

  const today = todayISO();

  const addReps = (id: string, reps: number) => {
    setState((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === id
          ? { ...e, logs: { ...e.logs, [today]: (e.logs[today] || 0) + reps } }
          : e
      ),
    }));
    const ex = state.exercises.find((e) => e.id === id);
    if (ex) {
      const before = ex.logs[today] || 0;
      if (before < ex.target && before + reps >= ex.target) addXP(20);
    }
  };

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Today</p>
          <h1 className="text-3xl font-bold">Exercise Targets</h1>
        </div>
        <NewExerciseButton onCreate={(name, target) =>
          setState((s) => ({
            ...s,
            exercises: [...s.exercises, { id: crypto.randomUUID(), name, target, logs: {} }],
          }))
        } />
      </header>

      <div className="space-y-4">
        {state.exercises.map((ex) => {
          const done = ex.logs[today] || 0;
          const left = Math.max(0, ex.target - done);
          const pct = Math.min(1, done / ex.target);
          const complete = done >= ex.target;
          return (
            <div key={ex.id} className="rounded-3xl bg-gradient-surface p-5 shadow-card">
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={pct}
                  size={110}
                  stroke={10}
                  color={complete ? "var(--success)" : "var(--primary)"}
                >
                  <span className="text-2xl font-bold">{done}</span>
                  <span className="text-[10px] text-muted-foreground">of {ex.target}</span>
                </ProgressRing>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{ex.name}</h3>
                  <p className={`mt-1 text-sm font-medium ${complete ? "text-[var(--success)]" : "text-muted-foreground"}`}>
                    {complete ? "🔥 Target smashed!" : `${left} left — push harder!`}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <QuickAdd onAdd={(n) => addReps(ex.id, n)} />
                    <button
                      onClick={() =>
                        setState((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== ex.id) }))
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {state.exercises.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No targets yet. Tap + to add one.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function QuickAdd({ onAdd }: { onAdd: (n: number) => void }) {
  const [val, setVal] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const n = parseInt(val); if (n > 0) { onAdd(n); setVal(""); } }}
      className="flex flex-1 items-center gap-2"
    >
      <Input
        type="number" inputMode="numeric" value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="reps" className="h-10"
      />
      <Button type="submit" className="h-10 rounded-xl bg-gradient-primary px-4 font-bold text-primary-foreground">
        <Zap size={16} /> Add
      </Button>
    </form>
  );
}

function NewExerciseButton({ onCreate }: { onCreate: (name: string, target: number) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 w-11 rounded-full bg-gradient-primary p-0 text-primary-foreground shadow-glow-primary">
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Target</DialogTitle></DialogHeader>
        <Input placeholder="Movement (e.g. Squats)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="number" placeholder="Daily target (e.g. 100)" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Button
          onClick={() => {
            const t = parseInt(target);
            if (name && t > 0) { onCreate(name, t); setName(""); setTarget(""); setOpen(false); }
          }}
          className="bg-gradient-primary font-semibold text-primary-foreground"
        >
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}
