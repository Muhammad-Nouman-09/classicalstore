"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  alt: string;
};

const fallbackHeroSlides: HeroSlide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80",
    alt: "Fashion collection background",
  },
  {
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=80",
    alt: "Women shopping fashion carousel image",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
    alt: "Modern fashion editorial background",
  },
];

export default function HeroCarousel({ slides = fallbackHeroSlides }: { slides?: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroSlides = slides.length > 0 ? slides : fallbackHeroSlides;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [heroSlides.length]);

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-90"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(24, 14, 7, 0.28), rgba(24, 14, 7, 0.72)), radial-gradient(circle at top left, rgba(117, 58, 19, 0.2), transparent 28%), radial-gradient(circle at 85% 20%, rgba(187, 107, 52, 0.22), transparent 24%), radial-gradient(circle at bottom right, rgba(244, 205, 137, 0.18), transparent 28%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[340px] max-w-7xl flex-col justify-between px-4 py-6 md:min-h-[460px] md:px-6 md:py-10 lg:min-h-[560px]">
        <div className="flex flex-wrap gap-2">
          <p className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            New season fashion in Pakistan
          </p>
          <p className="inline-flex w-fit items-center rounded-full border border-[#f4d3aa]/40 bg-[#fff2df]/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#fff3df] backdrop-blur-sm">
            Limited-time picks
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-end gap-4">
            <div className="hidden gap-2 sm:flex">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"
                  }`}
                />
              ))}
            </div>
            <div className="hidden flex-wrap gap-2 text-sm font-semibold text-white md:flex">
              <span className="rounded-full bg-white/14 px-3 py-2 backdrop-blur-sm">Free delivery over Rs 2000</span>
              <span className="rounded-full bg-white/14 px-3 py-2 backdrop-blur-sm">Cash on Delivery available</span>
              <span className="rounded-full bg-white/14 px-3 py-2 backdrop-blur-sm">New arrivals every week</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <Link
                href="/products"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#8f3d10] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_18px_40px_rgba(143,61,16,0.24)] transition hover:-translate-y-0.5 hover:bg-[#75310b] sm:min-h-12 sm:px-6 sm:py-3 sm:text-sm"
              >
                Shop Now
              </Link>
              <Link
                href="#featured-products"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 bg-white/88 px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[#8f3d10] hover:text-[#8f3d10] sm:min-h-12 sm:px-6 sm:py-3 sm:text-sm"
              >
                View Best Sellers
              </Link>
            </div>

            <div className="hidden flex-wrap gap-2 sm:justify-end sm:gap-3 md:flex">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_12px_30px_rgba(17,17,17,0.04)] backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-[#5e8b3d]" />
                Premium Quality
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(17,17,17,0.04)] backdrop-blur-sm sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-[#b15b2a]" />
                Easy Returns
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(17,17,17,0.04)] backdrop-blur-sm sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-[#d6a13d]" />
                Cash on Delivery
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:hidden">
            <div className="flex gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
