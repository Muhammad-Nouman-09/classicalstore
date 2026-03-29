"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "login" | "signup";
type LoadingMode = "idle" | "email" | "google" | "session";

function GoogleIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.81 12.23c0-.72-.06-1.25-.19-1.8H12v3.56h5.65c-.11.89-.69 2.23-1.98 3.13l-.02.12 2.85 2.16.2.02c1.83-1.65 2.88-4.08 2.88-7.19Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.89 6.77-2.42l-3.23-2.48c-.86.59-2.01 1-3.54 1-2.7 0-4.99-1.75-5.8-4.17l-.12.01-2.96 2.25-.04.11C4.76 19.58 8.11 22 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.93A5.9 5.9 0 0 1 5.86 12c0-.67.12-1.32.33-1.93l-.01-.13-3-2.28-.1.05A9.79 9.79 0 0 0 2 12c0 1.56.38 3.03 1.08 4.29l3.12-2.36Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.93 0 3.23.82 3.97 1.5l2.9-2.76C17.07 3.03 14.76 2 12 2 8.11 2 4.76 4.42 3.08 7.71l3.11 2.35C7.01 7.65 9.3 5.9 12 5.9Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("session");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setErrorMessage(error.message);
        setLoadingMode("idle");
        return;
      }

      if (session?.user) {
        router.replace("/dashboard");
        return;
      }

      setLoadingMode("idle");
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const isBusy = loadingMode !== "idle";

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isBusy) return;

    setLoadingMode("email");
    setErrorMessage("");
    setSuccessMessage("");

    const response =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
      setErrorMessage(response.error.message);
      setLoadingMode("idle");
      return;
    }

    if (mode === "signup") {
      setSuccessMessage("Check your email");
      setPassword("");
      setLoadingMode("idle");
      return;
    }

    router.replace("/dashboard");
  };

  const handleGoogleLogin = async () => {
    if (isBusy) return;

    setLoadingMode("google");
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoadingMode("idle");
    }
  };

  return (
    <div className="bg-[var(--background)]">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.92)_60%,rgba(233,224,209,0.75))]">
        <div
          className="absolute inset-0 opacity-60"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at top left, rgba(24,24,24,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(183,147,95,0.18), transparent 26%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:min-h-[calc(100vh-13rem)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div className="max-w-xl space-y-6">
            <p className="inline-flex w-fit items-center rounded-full border border-[var(--border-strong)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Account access
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
                Sign in to manage your shopping faster.
              </h1>
              <p className="text-base leading-7 text-[var(--muted)] sm:text-lg">
                Use the same polished storefront experience to access your account, continue checkout, and keep your
                details in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <p className="text-2xl font-semibold text-[var(--foreground)]">Secure</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Email, password, and Google sign-in.</p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <p className="text-2xl font-semibold text-[var(--foreground)]">Fast</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Redirects straight into your dashboard.</p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <p className="text-2xl font-semibold text-[var(--foreground)]">Simple</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Clean account flow without extra steps.</p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_22px_48px_rgba(17,17,17,0.07)] sm:p-8">
              <div className="flex rounded-full border border-[var(--border)] bg-[var(--card-tint)] p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--foreground)] hover:bg-white"
                  }`}
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isBusy}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--foreground)] hover:bg-white"
                  }`}
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isBusy}
                >
                  Sign Up
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleEmailAuth}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-[var(--foreground)]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isBusy}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-[var(--foreground)]">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-[1.5rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--foreground)]"
                    placeholder="Enter your password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    disabled={isBusy}
                  />
                </div>

                {errorMessage ? (
                  <p className="rounded-[1.5rem] border border-[#d9b6ac] bg-[#fff3ef] px-4 py-3 text-sm text-[#8a3f29]">
                    {errorMessage}
                  </p>
                ) : null}

                {successMessage ? (
                  <p className="rounded-[1.5rem] border border-[#bfd2b9] bg-[#f4fbf2] px-4 py-3 text-sm text-[#365b2f]">
                    {successMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[var(--foreground)]"
                  disabled={isBusy}
                >
                  {loadingMode === "email"
                    ? mode === "login"
                      ? "Logging in..."
                      : "Creating account..."
                    : mode === "login"
                      ? "Login"
                      : "Sign Up"}
                </button>
              </form>

              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-[var(--border-strong)]"
                  onClick={handleGoogleLogin}
                  disabled={isBusy}
                >
                  <GoogleIcon />
                  {loadingMode === "google" ? "Connecting..." : `Continue with Google`}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-[var(--muted)]">
                {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isBusy}
                >
                  {mode === "login" ? "Sign Up" : "Login"}
                </button>
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-tint)] px-4 py-3 text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--foreground)]">Returning shopper?</span> Use the same email
                you used for checkout to keep things consistent.
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Want to keep browsing first?{" "}
              <Link href="/products" className="font-semibold text-[var(--foreground)] underline-offset-4 hover:underline">
                View the catalog
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
