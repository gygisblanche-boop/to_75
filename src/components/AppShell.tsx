import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Dumbbell, CheckSquare, Activity, ListTodo } from "lucide-react";
import type { ReactNode } from "react";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/exercise", label: "Train", icon: Dumbbell },
  { to: "/habits", label: "Habits", icon: CheckSquare },
  { to: "/body", label: "Body", icon: Activity },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-md px-4 pb-28 pt-6">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur">
        <ul className="grid grid-cols-5">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium tracking-wide uppercase transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
