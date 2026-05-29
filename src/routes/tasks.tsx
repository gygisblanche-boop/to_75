import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp, todayISO } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const { state, setState } = useApp();
  const [text, setText] = useState("");
  if (!state.profile) return <Navigate to="/onboarding" />;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setState((s) => ({
      ...s,
      tasks: [
        { id: crypto.randomUUID(), text: text.trim(), done: false, createdDate: todayISO() },
        ...s.tasks,
      ],
    }));
    setText("");
  };

  const toggle = (id: string) =>
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const remove = (id: string) =>
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

  const active = state.tasks.filter((t) => !t.done);
  const done = state.tasks.filter((t) => t.done);

  return (
    <AppShell>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Unified To-Do</p>
        <h1 className="text-3xl font-bold">Today's Tasks</h1>
        <p className="mt-1 text-xs text-muted-foreground">Uncompleted tasks roll over to tomorrow automatically.</p>
      </header>

      <form onSubmit={add} className="mb-5 flex items-center gap-2">
        <Input placeholder="Add a task..." value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" className="h-10 rounded-xl bg-gradient-primary px-4 text-primary-foreground">
          <Plus size={18} />
        </Button>
      </form>

      <section className="space-y-2">
        {active.map((t) => (
          <Row key={t.id} text={t.text} done={false} onToggle={() => toggle(t.id)} onRemove={() => remove(t.id)} />
        ))}
        {active.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            All clear. Add your first task.
          </p>
        )}
      </section>

      {done.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Completed</h3>
          <div className="space-y-2 opacity-70">
            {done.map((t) => (
              <Row key={t.id} text={t.text} done onToggle={() => toggle(t.id)} onRemove={() => remove(t.id)} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Row({ text, done, onToggle, onRemove }: { text: string; done: boolean; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${done ? "border-border bg-background/40" : "border-border bg-surface"}`}>
      <button
        onClick={onToggle}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
          done ? "bg-[var(--success)] text-[var(--success-foreground)]" : "border border-border"
        }`}
      >
        {done && <Check size={16} strokeWidth={3} />}
      </button>
      <span className={`flex-1 text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{text}</span>
      <button onClick={onRemove} className="rounded-lg p-1 text-muted-foreground hover:text-destructive">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
