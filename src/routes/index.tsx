import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { state } = useApp();
  if (!state.profile) return <Navigate to="/onboarding" />;
  return <Navigate to="/dashboard" />;
}
