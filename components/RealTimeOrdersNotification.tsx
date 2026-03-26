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
    // Listen for new orders
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

          // Auto-hide notification after 5 seconds
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
        className={`w-full max-w-[420px] transform transition-all duration-300 ease-out md:w-80 ${
          showNotification ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="rounded-xl border border-emerald-500/40 bg-gray-900/95 shadow-2xl ring-1 ring-emerald-500/20 backdrop-blur">
          <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white leading-tight">New order received</p>
              <p className="text-sm text-emerald-100 truncate">
                {latestOrder.name} · {latestOrder.quantity} item(s)
              </p>
              {newOrdersCount > 1 && (
                <p className="text-xs text-emerald-200 mt-1">
                  +{newOrdersCount - 1} more new order{newOrdersCount - 1 > 1 ? "s" : ""}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2 truncate">Order ID: {latestOrder.id.slice(0, 8)}</p>
            </div>
            <button
              onClick={dismissNotification}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-1 w-full bg-emerald-700/40">
            <div
              className={`h-full bg-emerald-400 transition-all duration-[4800ms] ${
                showNotification ? "w-full" : "w-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

