export const metadata = {
  title: "Contact | Classical Store",
  description: "Reach Classical Store for customer support, orders, partnerships, and press.",
};

const contactChannels = [
  { label: "Customer support", value: "support@classicalstore.com" },
  { label: "Partnerships", value: "partners@classicalstore.com" },
  { label: "Press", value: "press@classicalstore.com" },
];

const socials = [
  { label: "Instagram", handle: "@classicalstore", href: "#" },
  { label: "TikTok", handle: "@classicalstore", href: "#" },
  { label: "Pinterest", handle: "@classicalstore", href: "#" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.96))] px-6 py-10 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Contact</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
              Support that feels like part of the same premium store.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              This page now follows the same clean retail direction as the homepage, with clearer contact paths for orders, support, brand partnerships, and press.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {contactChannels.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Send a message</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">We usually reply within one business day.</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Ask about an order, request product help, or reach out for retail partnerships. The form stays simple and aligned with the storefront styling.
          </p>

          <form className="mt-6 space-y-4" action="mailto:support@classicalstore.com" method="post" encType="text/plain">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--foreground)]" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--foreground)]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--foreground)]" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
                placeholder="Tell us what you need"
              />
            </div>
            <button
              type="submit"
              className="inline-flex rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
            >
              Send message
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Customer care</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Store hours</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Monday to Saturday, 10am to 8pm. Order and support replies usually land within one business day.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Socials</p>
            <div className="mt-4 space-y-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center justify-between rounded-[1rem] border border-[var(--border)] bg-[var(--card-tint)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5"
                >
                  <span>{social.label}</span>
                  <span className="text-[var(--muted)]">{social.handle}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card-tint)] p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Retail note</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Need help with an order?</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Include your order name, phone, and delivery address so support can resolve it faster without back-and-forth.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
