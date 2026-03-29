"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        router.replace("/auth");
        return;
      }

      setUser(session.user);
      setIsCheckingSession(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        router.replace("/auth");
        return;
      }

      setUser(session.user);
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (isCheckingSession) {
    return (
      <div className="bg-[var(--background)]">
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <div className="animate-pulse space-y-4">
              <div className="h-3 w-24 rounded-full bg-[var(--card-tint)]" />
              <div className="h-10 w-64 rounded-[1.5rem] bg-[var(--card-tint)]" />
              <div className="h-5 w-full rounded-full bg-[var(--card-tint)]" />
              <div className="h-12 w-40 rounded-full bg-[var(--card-tint)]" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
        <div className="mx-auto grid max-w-3xl gap-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Your account is active.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              You&apos;re signed in as <span className="font-semibold text-[var(--foreground)]">{user?.email}</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
              >
                Manage profile
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-[var(--border-strong)]"
                onClick={handleLogout}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Logging out..." : "Logout"}
              </button>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card-tint)] p-6">
            <p className="text-sm leading-6 text-[var(--muted)]">
              This page is protected with Supabase session checks. If the session disappears, you&apos;ll be sent back
              to the auth page automatically.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
