"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [orderStatus, pathname, router, searchParams]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(17,17,17,0.32)] px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-white px-6 py-6 text-center shadow-[0_30px_90px_rgba(17,17,17,0.22)] md:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--foreground)] text-lg font-semibold text-white">
          OK
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Order placed</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
          {rateProductIds.length > 0 ? "Your order is confirmed" : "Purchase complete"}
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
          {rateProductIds.length > 0
            ? "Thanks for your purchase. You can rate your product now, and this reminder will close automatically in 3 seconds."
            : "Your order was placed successfully. We'll contact you soon to confirm delivery details."}
        </p>
        {firstRateProductId ? (
          <Link
            href={`/products/${firstRateProductId}`}
            className="mt-5 inline-flex min-w-40 items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
          >
            Rate now
          </Link>
        ) : null}
      </div>
    </div>
  );
}
