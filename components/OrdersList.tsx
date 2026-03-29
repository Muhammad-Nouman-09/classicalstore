"use client";

import { useState } from "react";

type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string;
  products?: {
    name: string;
    price: number;
  } | null;
};

type OrdersListProps = {
  orders: Order[];
  loading: boolean;
  onStatusUpdate: (orderId: string, status: string) => void;
  updatingOrderId: string | null;
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersList({ orders, loading, onStatusUpdate, updatingOrderId }: OrdersListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#f2e6cf] text-[#7b5a22]";
      case "processing":
        return "bg-[#e8ecef] text-[#334155]";
      case "shipped":
        return "bg-[#e7efe7] text-[#36543f]";
      case "delivered":
        return "bg-[var(--card-tint)] text-[var(--foreground)]";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-[var(--card-tint)] text-[var(--foreground)]";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-[var(--card-tint)]" />
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Orders</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Manage incoming orders</h2>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-full border border-[var(--border-strong)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] outline-none"
        >
          <option value="all">All orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-8 text-center text-[var(--muted)]">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)]"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Customer</p>
                    <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{order.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{order.phone}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Product</p>
                    <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                      {order.products?.name || "Unknown product"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Quantity: {order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Total</p>
                    <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                      ${order.products ? (order.products.price * order.quantity).toFixed(2) : "N/A"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Status</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="mt-3 text-xs text-[var(--muted)]">Order ID: {order.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="w-full xl:max-w-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Update status</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statusOptions.map((item) => (
                      <button
                        type="button"
                        key={`${order.id}-${item.value}`}
                        onClick={() => onStatusUpdate(order.id, item.value)}
                        disabled={updatingOrderId === order.id}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                          updatingOrderId === order.id
                            ? "cursor-not-allowed opacity-50"
                            : order.status === item.value
                              ? "bg-[var(--foreground)] text-white"
                              : "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:border-[var(--foreground)]"
                        }`}
                      >
                        {updatingOrderId === order.id && order.status !== item.value ? "Updating..." : item.label}
                      </button>
                    ))}
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                    className="mt-4 w-full rounded-full border border-[var(--border-strong)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
