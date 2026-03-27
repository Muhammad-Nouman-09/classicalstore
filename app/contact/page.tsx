export const metadata = {
  title: "Contact | Classical Store",
  description: "Reach the Classical Store crew for support, collabs, and press.",
};

const contactChannels = [
  { label: "Support", value: "support@classicalstore.com" },
  { label: "Partnerships", value: "partners@classicalstore.com" },
  { label: "Press", value: "press@classicalstore.com" },
];

const socials = [
  { label: "Instagram", handle: "@classicalstore", href: "#" },
  { label: "TikTok", handle: "@classicalstore", href: "#" },
  { label: "X", handle: "@classicalstore", href: "#" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-fuchsia-500/10 via-orange-400/10 to-purple-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.16),transparent_35%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-16 space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-700 shadow-sm backdrop-blur">
            Contact
          </p>
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Let&apos;s talk collabs, support, and press</h1>
            <p className="text-lg text-slate-700">
              We move fast?expect replies within one business day. Tell us what you need and we&apos;ll route it to the right human.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="pill">24h response</span>
              <span className="pill">Global team</span>
              <span className="pill">Creators welcome</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {contactChannels.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_60px_rgba(236,72,153,0.12)]">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Send a quick note</h2>
              <p className="text-sm text-slate-600">Drop your details and we&apos;ll loop back. Support, orders, or partnerships?all here.</p>
            </div>
            <form className="mt-6 space-y-4" action="mailto:support@classicalstore.com" method="post" encType="text/plain">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-fuchsia-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                  placeholder="Tell us about your request"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(236,72,153,0.25)] transition hover:-translate-y-0.5"
              >
                Send message
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Hours</h3>
              <p className="text-sm text-slate-600">Monday?Friday, 9:00?17:00 (UTC+05:00). Responses within one business day.</p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Socials</h3>
              <div className="mt-3 space-y-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-fuchsia-200">
                    <span>{s.label}</span>
                    <span className="text-fuchsia-600">{s.handle}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">HQ</h3>
              <p className="text-sm text-slate-600">Remote-first with pop-ups in NYC, London, and Dubai. Book a showroom visit?invite only.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
