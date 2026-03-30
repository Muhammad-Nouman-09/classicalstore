"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getRatingStars } from "@/lib/productUtils";

type ProductRatingProps = {
  productId: string;
  initialRating: number;
  initialCount: number;
};

export default function ProductRating({ productId, initialRating, initialCount }: ProductRatingProps) {
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRatingContext = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      setUserId(user?.id ?? null);

      if (!user) {
        setEligibilityChecked(true);
        return;
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .limit(1);

      if (!isMounted) return;

      const purchased = Boolean(orderData?.length);
      setHasPurchased(purchased);
      setEligibilityChecked(true);

      if (!purchased) {
        return;
      }

      const { data } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .maybeSingle<{ rating: number }>();

      if (!isMounted) return;

      setUserRating(data?.rating ?? null);
    };

    void loadRatingContext();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleRate = async (value: number) => {
    if (!userId || !hasPurchased || isSaving) return;

    setIsSaving(true);
    setMessage("");

    const { error } = await supabase.from("product_ratings").upsert(
      {
        product_id: productId,
        user_id: userId,
        rating: value,
      },
      { onConflict: "product_id,user_id" }
    );

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    const previousRating = userRating;
    const nextCount = previousRating ? ratingCount : ratingCount + 1;
    const nextTotal = averageRating * ratingCount - (previousRating ?? 0) + value;
    const nextAverage = Math.round((nextTotal / Math.max(nextCount, 1)) * 10) / 10;

    setUserRating(value);
    setRatingCount(nextCount);
    setAverageRating(nextAverage);
    setMessage("Your rating has been saved.");
    setIsSaving(false);
  };

  return (
    <div className="rounded-[1.5rem] bg-[var(--card-tint)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Rating</p>
          <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
            {getRatingStars(averageRating)} <span className="ml-1">{averageRating.toFixed(1)}</span>
            <span className="ml-2 text-[var(--muted)]">({ratingCount} ratings)</span>
          </p>
        </div>

        {userId && hasPurchased ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                disabled={isSaving}
                onClick={() => handleRate(value)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  userRating === value
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                    : "border-[var(--border-strong)] bg-white text-[var(--foreground)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        ) : userId && eligibilityChecked ? (
          <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)]">
            Buy this product to rate it
          </span>
        ) : (
          <Link
            href="/auth"
            className="rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
          >
            Login to rate
          </Link>
        )}
      </div>

      {message ? <p className="mt-3 text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
