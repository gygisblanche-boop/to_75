import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppProvider } from "@/context/AppContext";
import App from "@/App";

export const Route = createFileRoute("/$")({
  component: CatchAllRoute,
});

function CatchAllRoute() {
  // The app uses internal tab state, not real routes. Any unknown path
  // (e.g. /onboarding) should still render the app shell client-only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg-dark, #0a0a0a)",
        }}
      />
    );
  }

  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
