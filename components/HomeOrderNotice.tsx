"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function HomeOrderNotice() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(searchParams.get("order") === "success");

  useEffect(() => {
    const orderStatus = searchParams.get("order");
    setVisible(orderStatus === "success");

    if (orderStatus !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(false);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("order");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams]);

  if (!visible) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
      <div className="rounded-[1.75rem] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Order placed</p>
        <p className="mt-2 text-base text-[var(--foreground)]">
          Your order was placed successfully. We&apos;ll contact you soon to confirm delivery details.
        </p>
      </div>
    </div>
  );
}
