"use client";

type OrderProcessingModalProps = {
  title: string;
  description: string;
  badge?: string;
};

export default function OrderProcessingModal({
  title,
  description,
  badge = "Processing order",
}: OrderProcessingModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(17,17,17,0.38)] px-4 backdrop-blur-[2px]">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(244,239,229,0.94))] px-6 py-7 text-center shadow-[0_30px_90px_rgba(17,17,17,0.22)]"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)] text-white shadow-[0_16px_30px_rgba(17,17,17,0.18)]">
          <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" className="opacity-20" stroke="currentColor" strokeWidth="2.2" />
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{badge}</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>

        <div className="mt-5 overflow-hidden rounded-full bg-white/80 p-1">
          <div className="h-2 w-2/3 animate-pulse rounded-full bg-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}
