import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--card-tint)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr] md:px-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-sm font-semibold tracking-[0.26em] text-[var(--foreground)]">
              CS
            </span>
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">Classical Store</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Fashion and lifestyle</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-7 text-[var(--muted)]">
            A cleaner storefront for clothes, jewellery, shoes, cosmetics, and home care. Built to look like a brand
            customers can trust, not a generic services app.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Shop</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
            <Link href="/products" className="transition hover:text-[var(--foreground)]">
              New arrivals
            </Link>
            <Link href="/products" className="transition hover:text-[var(--foreground)]">
              Best sellers
            </Link>
            <Link href="/products" className="transition hover:text-[var(--foreground)]">
              Sale
            </Link>
            <Link href="/contact" className="transition hover:text-[var(--foreground)]">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">Store info</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--muted)]">
            <Link href="/privacy" className="transition hover:text-[var(--foreground)]">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition hover:text-[var(--foreground)]">
              Terms of service
            </Link>
            <p>Support hours: Mon to Sat, 10am to 8pm</p>
            <p>Fast dispatch, secure checkout, easy returns</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
