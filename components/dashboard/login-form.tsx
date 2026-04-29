"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_oauth_denied: "Google sign-in was cancelled.",
  access_denied: "Your account is not authorised to access this system.",
  email_not_verified: "Your Google email address is not verified.",
  invalid_state: "Sign-in session expired. Please try again.",
  google_request_failed: "Could not reach Google. Please try again.",
  authentication_failed: "Authentication failed. Please try again.",
};

function resolveOAuthError(error: string | undefined): string | null {
  if (!error) return null;
  return OAUTH_ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.";
}

export function LoginForm({ oauthError }: { oauthError?: string }) {
  const error = resolveOAuthError(oauthError);

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
            Use a Google account that has been approved for CMS access.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <a
            href="/api/auth/google/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </section>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
