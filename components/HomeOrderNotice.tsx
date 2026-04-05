"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function resolveNoticeMessage(hasRatingPrompt: boolean) {
  return hasRatingPrompt
    ? "Your order is confirmed. Our team will contact you shortly, and you can leave a quick rating whenever you're ready."
    : "Your order is confirmed. Our team will contact you shortly with the next delivery details.";
}

export default function HomeOrderNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderStatus = searchParams.get("order");
  const rateProductsParam = searchParams.get("rate");
  const rateProductIds = rateProductsParam
    ? rateProductsParam
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const firstRateProductId = rateProductIds[0] ?? null;
  const visible = orderStatus === "success";

  useEffect(() => {
    if (orderStatus !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("order");
      params.delete("rate");
      params.delete("emailMessage");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [orderStatus, pathname, router, searchParams]);

  if (!visible) {
    return null;
  }

  const hasRatingPrompt = rateProductIds.length > 0;
  const resolvedMessage = resolveNoticeMessage(hasRatingPrompt);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(17,17,17,0.32)] px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(244,239,229,0.94))] px-6 py-7 text-center shadow-[0_30px_90px_rgba(17,17,17,0.22)] md:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)] text-white shadow-[0_16px_30px_rgba(17,17,17,0.18)]">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden>
            <path d="m6.5 12.5 3.5 3.5 7.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Order received</p>
        <h2 className="mt-2 text-[1.95rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          Thanks, your order is confirmed
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--foreground)]">{resolvedMessage}</p>

        <div className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          This message closes automatically in a few seconds, so your shoppers can continue browsing without extra clicks.
        </div>

        {firstRateProductId ? (
          <Link
            href={`/products/${firstRateProductId}`}
            className="mt-5 inline-flex min-w-44 items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
          >
            Rate your order
          </Link>
        ) : null}
      </div>
    </div>
  );
}
