"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string;
};

export default function RealTimeOrdersNotification() {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("new_orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setNewOrdersCount((prev) => prev + 1);
          setLatestOrder(newOrder);
          setShowNotification(true);

          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissNotification = () => {
    setShowNotification(false);
    setNewOrdersCount(0);
  };

  if (!latestOrder) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:inset-auto md:bottom-6 md:right-6">
      <div
        className={`w-full max-w-[420px] transform transition-all duration-300 ease-out md:w-96 ${
          showNotification ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="rounded-[1.5rem] border border-[var(--border-strong)] bg-[rgba(255,252,247,0.96)] shadow-[0_20px_50px_rgba(17,17,17,0.15)] backdrop-blur">
          <div className="flex items-start gap-3 px-4 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10l-1 11H8L7 8Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 8a2.5 2.5 0 0 1 5 0" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--foreground)]">New order received</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {latestOrder.name} placed {latestOrder.quantity} item{latestOrder.quantity > 1 ? "s" : ""}.
              </p>
              {newOrdersCount > 1 && (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  +{newOrdersCount - 1} more new order{newOrdersCount - 1 > 1 ? "s" : ""}
                </p>
              )}
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Order ID: {latestOrder.id.slice(0, 8)}</p>
            </div>
            <button
              onClick={dismissNotification}
              className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              aria-label="Dismiss notification"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="h-1 w-full bg-[var(--border)]">
            <div className={`h-full bg-[var(--accent)] transition-all duration-[4800ms] ${showNotification ? "w-full" : "w-0"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
