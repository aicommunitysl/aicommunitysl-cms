"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }

      router.push(nextPath || "/");
      router.refresh();
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 md:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-shell hidden overflow-hidden p-8 lg:block">
          <div className="inline-flex rounded-full bg-[rgba(0,120,212,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Secure workspace
          </div>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight text-balance">
            Official CMS for AI Community Sri Lanka platform operations.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            Publish events, manage partners, update the team roster, review
            speaker applications, and keep static content aligned with the live
            API-backed website.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/80 p-5">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div className="mt-4 text-lg font-semibold">
                Role-aware access
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Admin and editor permissions are enforced through the API and
                protected proxy routes.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card/80 p-5">
              <LockKeyhole className="h-6 w-6 text-foreground" />
              <div className="mt-4 text-lg font-semibold">
                Cookie-backed sessions
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The FastAPI JWT stays server-side. The browser only receives a
                secure session cookie.
              </p>
            </div>
          </div>
        </section>

        <section className="section-shell glass-panel mx-auto w-full max-w-xl p-8 sm:p-10">
          <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Administrator login
          </div>
          <h2 className="mt-4 text-3xl font-semibold">Sign in to the CMS</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use an admin or editor account provisioned through the API. The
            first admin account can be bootstrapped through the backend signup
            endpoint.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@aicommunitysl.org"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
