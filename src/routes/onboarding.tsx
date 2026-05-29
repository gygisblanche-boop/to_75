import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/app-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { setState } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    heightCm: "",
    currentWeightKg: "",
    goalWeightKg: "",
    startDate: new Date().toISOString().slice(0, 10),
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cw = parseFloat(form.currentWeightKg);
    setState((s) => ({
      ...s,
      profile: {
        name: form.name.trim(),
        age: parseInt(form.age),
        heightCm: parseFloat(form.heightCm),
        startWeightKg: cw,
        currentWeightKg: cw,
        goalWeightKg: parseFloat(form.goalWeightKg),
        startDate: form.startDate,
      },
      weightLogs: { ...s.weightLogs, [form.startDate]: cw },
    }));
    navigate({ to: "/dashboard" });
  };

  const ready =
    form.name && form.age && form.heightCm && form.currentWeightKg && form.goalWeightKg && form.startDate;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow-primary">
            <Flame className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MyJourney</h1>
            <p className="text-sm text-muted-foreground">Your transformation starts now.</p>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-5">
          <Field label="Your Name">
            <Input value={form.name} onChange={update("name")} placeholder="Alex" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <Input type="number" value={form.age} onChange={update("age")} placeholder="28" required />
            </Field>
            <Field label="Height (cm)">
              <Input type="number" value={form.heightCm} onChange={update("heightCm")} placeholder="178" required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Current Weight (kg)">
              <Input type="number" step="0.1" value={form.currentWeightKg} onChange={update("currentWeightKg")} placeholder="85" required />
            </Field>
            <Field label="Goal Weight (kg)">
              <Input type="number" step="0.1" value={form.goalWeightKg} onChange={update("goalWeightKg")} placeholder="75" required />
            </Field>
          </div>
          <Field label="Start Date">
            <Input type="date" value={form.startDate} onChange={update("startDate")} required />
          </Field>

          <div className="mt-auto pt-6">
            <Button
              type="submit"
              disabled={!ready}
              className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-bold text-primary-foreground shadow-glow-primary hover:opacity-90"
            >
              Start My Journey
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
