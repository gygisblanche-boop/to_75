import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppProvider } from "@/context/AppContext";
import App from "@/App";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  // The repo's AppProvider reads from localStorage in state initializers and
  // registers browser-only listeners — render it client-only to avoid SSR errors.
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
