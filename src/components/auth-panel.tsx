"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured, type AuthMode } from "@/lib/mvp-data";

type AuthState = {
  email: string;
  role: string;
  mode: AuthMode;
};

const mockRoles = ["client_admin", "client_contributor", "advisor_consultant", "executive_viewer"] as const;

export function AuthPanel() {
  const [email, setEmail] = useState("advisor@inclusionscore.ai");
  const [role, setRole] = useState<(typeof mockRoles)[number]>("client_admin");
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [message, setMessage] = useState("");
  const supabaseEnabled = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    async function loadAuthState() {
      if (supabaseEnabled) {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (user?.email) {
          const nextState = {
            email: user.email,
            role,
            mode: "supabase"
          } satisfies AuthState;

          window.localStorage.setItem("iscore-auth", JSON.stringify(nextState));
          setAuthState(nextState);
          setEmail(user.email);
          return;
        }
      }

      const saved = window.localStorage.getItem("iscore-auth");
      if (saved) {
        setAuthState(JSON.parse(saved) as AuthState);
      }
    }

    loadAuthState();
  }, [role, supabaseEnabled]);

  async function signIn() {
    setMessage("");

    if (supabaseEnabled) {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/client-portal`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Magic link sent. Open it to continue the production demo flow.");
    }

    const nextState = {
      email,
      role,
      mode: supabaseEnabled ? "supabase" : "mock"
    } satisfies AuthState;

    window.localStorage.setItem("iscore-auth", JSON.stringify(nextState));
    setAuthState(nextState);
  }

  async function signOut() {
    if (supabaseEnabled) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    window.localStorage.removeItem("iscore-auth");
    setAuthState(null);
    setMessage("Signed out of the demo workspace.");
  }

  return (
    <section className="panel auth-panel">
      <div>
        <p className="eyebrow">Auth</p>
        <h2>Role-based workspace access</h2>
        <p className="muted">
          {supabaseEnabled
            ? "Supabase auth is configured. Sign in with a magic link to create organizations and save diagnostic results."
            : "Supabase keys are not configured, so this run uses mocked auth with the same role model."}
        </p>
      </div>

      <div className="form-grid">
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as (typeof mockRoles)[number])}>
            {mockRoles.map((mockRole) => (
              <option key={mockRole} value={mockRole}>
                {mockRole}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="header-actions">
        <button className="primary-action" onClick={signIn}>
          {authState ? "Switch role" : "Sign in"}
        </button>
        {authState ? (
          <button className="secondary-action" onClick={signOut}>
            Sign out
          </button>
        ) : null}
      </div>

      <div className="auth-status">
        <span className="status-chip">{authState ? authState.role : "Not signed in"}</span>
        <span className="muted">
          {authState ? `${authState.email} via ${authState.mode}` : "Choose a role to enter the workspace."}
        </span>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}
