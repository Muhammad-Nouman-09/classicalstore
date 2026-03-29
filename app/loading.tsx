function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[1.5rem] bg-[rgba(255,255,255,0.72)] ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
      <div className="relative bg-[var(--card-tint)] p-4">
        <SkeletonBlock className="h-7 w-24 rounded-full" />
        <SkeletonBlock className="mt-4 aspect-[4/5] w-full rounded-[1.5rem]" />
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-3/4" />
          <SkeletonBlock className="h-4 w-full rounded-full" />
          <SkeletonBlock className="h-4 w-5/6 rounded-full" />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-14 rounded-full" />
            <SkeletonBlock className="h-8 w-24" />
          </div>
          <SkeletonBlock className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex gap-3">
          <SkeletonBlock className="h-12 flex-1 rounded-full" />
          <SkeletonBlock className="h-12 flex-1 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export default function Loading() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="pb-20">
        <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.92)_60%,rgba(233,224,209,0.75))]">
          <div
            className="absolute inset-0 opacity-60"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(24,24,24,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(183,147,95,0.18), transparent 26%)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:px-6 lg:py-20">
            <div className="space-y-7">
              <SkeletonBlock className="h-10 w-64 rounded-full border border-[var(--border)]" />
              <div className="space-y-4">
                <SkeletonBlock className="h-14 w-full max-w-xl rounded-[1.75rem]" />
                <SkeletonBlock className="h-14 w-11/12 max-w-lg rounded-[1.75rem]" />
                <SkeletonBlock className="h-5 w-full max-w-2xl rounded-full" />
                <SkeletonBlock className="h-5 w-5/6 max-w-xl rounded-full" />
              </div>
              <div className="flex flex-wrap gap-3">
                <SkeletonBlock className="h-12 w-36 rounded-full" />
                <SkeletonBlock className="h-12 w-48 rounded-full" />
              </div>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-[var(--border)] bg-white/85 p-4 shadow-[0_18px_40px_rgba(17,17,17,0.06)]"
                  >
                    <SkeletonBlock className="h-8 w-20" />
                    <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                    <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="min-h-[420px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#d9c9b2] p-5 shadow-[0_28px_80px_rgba(17,17,17,0.14)]">
                <SkeletonBlock className="h-full min-h-[380px] w-full rounded-[1.75rem] bg-[rgba(255,255,255,0.26)]" />
              </div>
              <div className="grid gap-4">
                {[...Array(2)].map((_, index) => (
                  <article
                    key={index}
                    className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_22px_48px_rgba(17,17,17,0.07)]"
                  >
                    <SkeletonBlock className="h-3 w-24 rounded-full" />
                    <SkeletonBlock className="mt-4 h-8 w-4/5" />
                    <SkeletonBlock className="mt-2 h-8 w-2/3" />
                    <SkeletonBlock className="mt-4 h-4 w-full rounded-full" />
                    <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
                    {index === 1 ? <SkeletonBlock className="mt-5 h-11 w-32 rounded-full" /> : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-10 w-64" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full min-w-[280px] rounded-full" />
              <SkeletonBlock className="h-4 w-5/6 rounded-full" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#e9e0d1] p-5 shadow-[0_18px_44px_rgba(17,17,17,0.08)]"
              >
                <SkeletonBlock className="h-72 w-full rounded-[1.5rem] bg-[rgba(255,255,255,0.3)]" />
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="w-full space-y-2">
                    <SkeletonBlock className="h-8 w-2/3" />
                    <SkeletonBlock className="h-4 w-4/5 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-10 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-32 rounded-full" />
              <SkeletonBlock className="h-10 w-80" />
            </div>
            <SkeletonBlock className="h-5 w-32 rounded-full" />
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,#171717,#2b241d)] px-6 py-10 shadow-[0_28px_80px_rgba(17,17,17,0.16)] lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-32 rounded-full bg-[rgba(255,255,255,0.18)]" />
                <SkeletonBlock className="h-10 w-full max-w-xl bg-[rgba(255,255,255,0.18)]" />
                <SkeletonBlock className="h-10 w-5/6 max-w-lg bg-[rgba(255,255,255,0.18)]" />
                <SkeletonBlock className="h-4 w-full max-w-2xl rounded-full bg-[rgba(255,255,255,0.14)]" />
                <SkeletonBlock className="h-4 w-4/5 rounded-full bg-[rgba(255,255,255,0.14)]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[...Array(3)].map((_, index) => (
                  <SkeletonBlock
                    key={index}
                    className="h-24 rounded-3xl bg-[rgba(255,255,255,0.12)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-28 rounded-full" />
              <SkeletonBlock className="h-10 w-96 max-w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full min-w-[260px] rounded-full" />
              <SkeletonBlock className="h-4 w-5/6 rounded-full" />
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)]"
              >
                <SkeletonBlock className="h-7 w-[4.5rem] rounded-full" />
                <SkeletonBlock className="mt-4 h-7 w-2/3" />
                <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="h-10 w-72" />
            </div>
            <SkeletonBlock className="h-10 w-56 rounded-full" />
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <article
                key={index}
                className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_40px_rgba(17,17,17,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="w-full space-y-2">
                    <SkeletonBlock className="h-5 w-24" />
                    <SkeletonBlock className="h-4 w-32 rounded-full" />
                  </div>
                </div>
                <SkeletonBlock className="mt-5 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-full rounded-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6 rounded-full" />
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
