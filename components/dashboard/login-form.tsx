"use client";

import Image from "next/image";
import { ShieldCheck, LockKeyhole } from "lucide-react";

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
    <main className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        {/* Left panel — branding */}
        <section className="section-shell hidden flex-col gap-8 rounded-3xl p-8 lg:flex">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="AI Community Sri Lanka"
              width={1615}
              height={2938}
              priority
              style={{ height: 44, width: "auto" }}
              className="shrink-0"
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Official CMS
              </div>
              <div className="text-base font-semibold leading-tight">
                AI Community Sri Lanka
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-snug text-balance">
              Manage the platform from one secure workspace.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Publish events, manage partners, update the team, review speaker
              applications, and keep content aligned with the live website.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="mt-3 text-sm font-semibold">
                Role-aware access
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Admin and editor permissions enforced through the API.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <LockKeyhole className="h-5 w-5 text-foreground" />
              <div className="mt-3 text-sm font-semibold">Secure sessions</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                JWT stays server-side. Browser only receives a session cookie.
              </p>
            </div>
          </div>
        </section>

        {/* Right panel — sign in */}
        <section className="glass-panel mx-auto w-full max-w-sm rounded-3xl p-8">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image
              src="/logo.svg"
              alt="AI Community Sri Lanka"
              width={1615}
              height={2938}
              priority
              style={{ height: 36, width: "auto" }}
              className="shrink-0"
            />
            <span className="text-sm font-semibold">
              AI Community Sri Lanka
            </span>
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Administrator login
          </div>
          <h2 className="mt-2 text-2xl font-semibold">Sign in to CMS</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use an approved Google account to continue.
          </p>

          {error ? (
            <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <a
            href="/api/auth/google/login"
            className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border/70 bg-card px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Access is restricted to approved accounts only.
          </p>
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
