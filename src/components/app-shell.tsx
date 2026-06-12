import Link from "next/link";
import type { ReactNode } from "react";
import { portalNavigation } from "@/lib/navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">InclusionScore</div>
        <nav className="nav-group" aria-label="Primary navigation">
          {portalNavigation.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <input className="search" aria-label="Global search" placeholder="Search controls, evidence, risks..." />
          <div className="muted">Client Workspace • Acme Corp</div>
        </header>
        <div className="content">{children}</div>
      </section>
    </main>
  );
}

