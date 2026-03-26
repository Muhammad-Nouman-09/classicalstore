export const metadata = {
  title: "Contact | Classical Store",
  description: "Reach the Classical Store team-built on a 100% serverless Next.js stack.",
};

const contactChannels = [
  { label: "Support", value: "support@classicalstore.com" },
  { label: "Partnerships", value: "partners@classicalstore.com" },
  { label: "Press", value: "press@classicalstore.com" },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 space-y-10">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Contact</p>
        <h1 className="text-4xl font-bold text-emerald-900">Talk with the Team</h1>
        <p className="text-lg text-emerald-800">
          We run everything on serverless Next.js, so reaching us is just as fast. Choose a channel below
          and we&apos;ll reply within one business day.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {contactChannels.map((item) => (
          <div key={item.label} className="rounded-xl border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-50">
            <p className="text-sm text-emerald-700">{item.label}</p>
            <p className="text-base font-semibold text-emerald-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-8 shadow-lg shadow-emerald-100 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-emerald-900">Send a quick note</h2>
          <p className="text-emerald-800 text-sm">
            Your message is processed by a serverless API route-no inbox bloat, no queues to babysit.
          </p>
        </div>
        <form className="space-y-4" action="mailto:support@classicalstore.com" method="post" encType="text/plain">
          <div className="space-y-2">
            <label className="block text-sm text-emerald-800" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 focus:border-emerald-400 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-emerald-800" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 focus:border-emerald-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-emerald-800" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full rounded-lg border border-emerald-200 bg-white/80 px-4 py-3 focus:border-emerald-400 focus:outline-none"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-6 py-3 font-semibold transition hover:bg-emerald-500"
          >
            Send Message
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-50">
        <h3 className="text-lg font-semibold text-emerald-900">Hours</h3>
        <p className="text-emerald-800 text-sm">
          Monday-Friday, 9:00-17:00 (UTC+05:00). We aim to respond within one business day.
        </p>
      </div>
    </section>
  );
}


