"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center bg-gradient-to-b from-amber-50 via-white to-emerald-50">
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl shadow-red-100">
        <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-700">An unexpected error occurred while rendering this page.</p>
        <p className="mt-3 text-sm text-slate-600">{error?.message ?? "Please try again."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-white px-4 py-2 text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}
