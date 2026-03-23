"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">An unexpected error occurred while rendering this page.</p>
        <p className="mt-3 text-sm text-slate-500">{error?.message ?? "Please try again."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}
