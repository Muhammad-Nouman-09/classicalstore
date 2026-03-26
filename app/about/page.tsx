export const metadata = {
  title: "About | Classical Store",
  description: "Learn how Classical Store runs entirely on a serverless Next.js stack.",
};

export default function AboutPage() {
  const card = "rounded-xl border border-emerald-100 bg-white/90 p-6 shadow-sm shadow-emerald-50";
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 space-y-10">
      <header className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Our Story</p>
        <h1 className="text-4xl font-bold text-emerald-900">Serverless by Design</h1>
        <p className="text-lg text-emerald-800">
          Classical Store is built on Next.js and a fully serverless stack so we scale instantly,
          stay fast worldwide, and keep your data secure without managing servers.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className={card}>
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Edge Delivery</h2>
          <p className="text-sm text-emerald-800">
            Static assets and pages are streamed from the edge for near-instant loads no matter where you are.
          </p>
        </div>
        <div className={card}>
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">API Without Servers</h2>
          <p className="text-sm text-emerald-800">
            Data is powered by Supabase functions and Postgres with Row Level Security, all invoked as serverless handlers.
          </p>
        </div>
        <div className={card}>
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Scales on Demand</h2>
          <p className="text-sm text-emerald-800">
            Usage spikes are handled automatically—zero warm-up, zero capacity planning, just smooth checkouts.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 p-8 shadow-lg shadow-emerald-100 space-y-4">
        <h3 className="text-2xl font-semibold text-emerald-900">Why it matters</h3>
        <p className="text-emerald-800">
          By staying serverless we ship features faster, avoid infrastructure overhead, and pass those savings on to you.
          Your experience stays reliable because every route in this app is delivered as a Next.js serverless function.
        </p>
        <ul className="list-disc list-inside space-y-2 text-emerald-800">
          <li>Secure authentication and data policies enforced at the database layer.</li>
          <li>Global caching for media and product images hosted on a CDN.</li>
          <li>Environment variables only—no servers to patch or babysit.</li>
        </ul>
      </div>

      <div className={`${card} p-8 space-y-3`}>
        <h3 className="text-2xl font-semibold text-emerald-900">Built for music lovers</h3>
        <p className="text-emerald-800">
          We curate instruments, vinyl, and accessories with the same care we apply to our tech stack.
          Everything is tuned for clarity, speed, and delight—just like your favorite performance.
        </p>
      </div>
    </section>
  );
}
