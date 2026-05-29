import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useApp, todayISO } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, Droplet, Footprints, Moon, Percent, Scale, Link as LinkIcon } from "lucide-react";

export const Route = createFileRoute("/body")({
  component: BodyPage,
});

function BodyPage() {
  const { state, setState } = useApp();
  if (!state.profile) return <Navigate to="/onboarding" />;
  const b = state.body;

  const update = (patch: Partial<typeof b>) =>
    setState((s) => ({ ...s, body: { ...s.body, ...patch } }));

  // Automation: sleep before 10:30 PM => toggle "Sleep on Time" habit
  useEffect(() => {
    if (!b.sleepStart) return;
    const [h, m] = b.sleepStart.split(":").map(Number);
    const minutes = h * 60 + m;
    // before 22:30 (and not too early like midday)
    if (minutes < 22 * 60 + 30 && minutes > 18 * 60) {
      const today = todayISO();
      setState((s) => {
        const day = { ...(s.habitChecks[today] || {}) };
        if (day.sleep) return s;
        day.sleep = true;
        return { ...s, habitChecks: { ...s.habitChecks, [today]: day } };
      });
    }
  }, [b.sleepStart]);

  return (
    <AppShell>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Sync Dashboard</p>
          <h1 className="text-3xl font-bold">Body Composition</h1>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <LinkIcon size={14} /> Google Fit
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<Scale size={16} />} label="Weight" value={`${state.profile.currentWeightKg.toFixed(1)} kg`} accent />
        <MetricCard icon={<Percent size={16} />} label="Body Fat" value={b.bodyFat ? `${b.bodyFat}%` : "—"} />
        <MetricCard icon={<Activity size={16} />} label="Muscle Mass" value={b.muscleMass ? `${b.muscleMass} kg` : "—"} />
        <MetricCard icon={<Footprints size={16} />} label="Steps Today" value={b.steps ? b.steps.toLocaleString() : "—"} />
        <MetricCard icon={<Moon size={16} />} label="Sleep" value={b.sleepDuration ? `${b.sleepDuration}h` : "—"} />
        <MetricCard icon={<Droplet size={16} />} label="Hydration" value="3 L target" />
      </div>

      {/* Manual sync stand-in */}
      <section className="mt-6 rounded-3xl bg-surface p-5 shadow-card">
        <h3 className="mb-1 text-sm font-bold uppercase tracking-widest">Manual Entry</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Google Fit auto-sync coming soon. Enter today's metrics manually for now.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Body Fat %">
            <Input type="number" step="0.1" value={b.bodyFat ?? ""} onChange={(e) => update({ bodyFat: parseFloat(e.target.value) || undefined })} />
          </Field>
          <Field label="Muscle (kg)">
            <Input type="number" step="0.1" value={b.muscleMass ?? ""} onChange={(e) => update({ muscleMass: parseFloat(e.target.value) || undefined })} />
          </Field>
          <Field label="Steps">
            <Input type="number" value={b.steps ?? ""} onChange={(e) => update({ steps: parseInt(e.target.value) || undefined })} />
          </Field>
          <Field label="Sleep (h)">
            <Input type="number" step="0.1" value={b.sleepDuration ?? ""} onChange={(e) => update({ sleepDuration: parseFloat(e.target.value) || undefined })} />
          </Field>
          <Field label="Sleep Time">
            <Input type="time" value={b.sleepStart ?? ""} onChange={(e) => update({ sleepStart: e.target.value })} />
          </Field>
        </div>
        <p className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          💡 Sleep before 10:30 PM auto-completes the "Sleep on Time" habit.
        </p>
      </section>
    </AppShell>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-card ${accent ? "border-primary/30 bg-gradient-surface" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
