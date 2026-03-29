"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddProductForm from "@/components/AddProductForm";
import OrdersList from "@/components/OrdersList";
import RealTimeOrdersNotification from "@/components/RealTimeOrdersNotification";

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

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from("products").select("count").limit(1);
        if (error) {
          setConnectionError("Supabase connection failed. Please check your configuration.");
        } else {
          setConnectionError(null);
        }
      } catch {
        setConnectionError("Unable to connect to Supabase. Please check your internet connection and configuration.");
      }
    };

    testConnection();
    fetchOrders();

    const channel = supabase
      .channel("orders_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setNewOrdersCount((count) => count + 1);
        }

        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { error: testError } = await supabase.from("products").select("count").limit(1);

      if (testError) {
        setConnectionError(
          "Cannot connect to Supabase. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        );
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false });

      if (ordersError) {
        if (ordersError.code === "42P01" || ordersError.message?.includes("does not exist")) {
          setConnectionError("Database tables missing. Please run the database-setup.sql script in your Supabase SQL editor.");
        } else if (
          ordersError.code === "42703" ||
          (ordersError.message?.includes("column") && ordersError.message?.includes("does not exist"))
        ) {
          setConnectionError("Missing database columns. Please run the fix-created-at.sql script in your Supabase SQL editor.");
        } else if (ordersError.code === "42501" || ordersError.message?.includes("permission denied")) {
          setConnectionError("Database permission denied. Please check your Supabase RLS policies.");
        } else {
          setConnectionError(`Database error: ${ordersError.message || "Unknown error"}`);
        }
        return;
      }

      const { data: productsData, error: productsError } = await supabase.from("products").select("id, name, price");

      if (productsError) {
        if (productsError.code === "42P01" || productsError.message?.includes("does not exist")) {
          setConnectionError("Products table does not exist. Please run the database-setup.sql script in your Supabase SQL editor.");
        } else if (
          productsError.code === "42703" ||
          (productsError.message?.includes("column") && productsError.message?.includes("does not exist"))
        ) {
          setConnectionError("Missing database columns. Please check your database schema.");
        } else if (productsError.code === "42501" || productsError.message?.includes("permission denied")) {
          setConnectionError("Database permission denied. Please check your Supabase RLS policies.");
        } else {
          setConnectionError(`Failed to load products: ${productsError.message || "Unknown database error"}`);
        }
        return;
      }

      const productsMap = (productsData || []).reduce<Record<string, Product>>((acc, product) => {
        acc[product.id] = { id: product.id, name: product.name, price: product.price };
        return acc;
      }, {});

      const mappedOrders = (ordersData || []).map((order) => ({
        ...order,
        products: productsMap[order.product_id] || null,
      }));

      setOrders(mappedOrders);
      setConnectionError(null);
    } catch {
      setOrders([]);
      setConnectionError("Failed to load orders. Please check your Supabase connection and database tables.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status.");
      }

      setAdminToast(`Order ${orderId.slice(0, 8)} status set to ${status}.`);
      setTimeout(() => setAdminToast(null), 3000);
      await fetchOrders();
    } catch {
      setAdminToast("Unable to update order status. See console for details.");
      setTimeout(() => setAdminToast(null), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(244,239,229,0.95),rgba(255,255,255,0.96))] px-6 py-10 shadow-[0_18px_44px_rgba(17,17,17,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Admin</p>
        <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">Store dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              The admin area now follows the same visual system as the storefront, so managing orders and products feels like part of one brand experience.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Total orders</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{orders.length}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">New orders</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{newOrdersCount}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {orders.filter((order) => order.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <RealTimeOrdersNotification />

      {adminToast && (
        <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]">
          {adminToast}
        </div>
      )}

      {connectionError && (
        <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Connection error</p>
              <p className="mt-1 text-sm">{connectionError}</p>
            </div>
            <button
              onClick={() => {
                setConnectionError(null);
                setLoading(true);
                fetchOrders();
              }}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <section className="mt-8">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-white p-1 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
          <button
            onClick={() => {
              setActiveTab("orders");
              setNewOrdersCount(0);
            }}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === "orders" ? "bg-[var(--foreground)] text-white" : "text-[var(--foreground)]"
            }`}
          >
            Orders ({orders.length}){newOrdersCount > 0 ? ` +${newOrdersCount}` : ""}
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === "products" ? "bg-[var(--foreground)] text-white" : "text-[var(--foreground)]"
            }`}
          >
            Add product
          </button>
        </div>
      </section>

      <section className="mt-6">
        {activeTab === "orders" && (
          <OrdersList
            orders={orders}
            loading={loading}
            onStatusUpdate={updateOrderStatus}
            updatingOrderId={updatingOrderId}
          />
        )}

        {activeTab === "products" && <AddProductForm />}
      </section>
    </div>
  );
}
