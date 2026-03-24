"use client";

import { useState, useEffect } from "react";
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

  if (!showNotification || !latestOrder) return null;

  return (
    <div className="mb-6 bg-green-600 text-white p-4 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21c4.411 0 8-4.03 8-9s-3.589-9-8-9-8 4.03-8 9a9.06 9.06 0 001.832 5.683L4 21l4.868-8.317z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold">New Order Received!</p>
            <p className="text-sm text-green-100">
              {latestOrder.name} ordered {latestOrder.quantity} item(s)
            </p>
            {newOrdersCount > 1 && (
              <p className="text-sm text-green-100">
                +{newOrdersCount - 1} more new order{newOrdersCount - 1 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={dismissNotification}
          className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-green-700 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}