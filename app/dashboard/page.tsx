"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/productUtils";

type OrderRecord = {
  id: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string | null;
};

type ProductRecord = {
  id: string;
  name: string;
  price: number;
};

type DashboardOrder = OrderRecord & {
  product: ProductRecord | null;
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#fff4de] text-[#8a5a16]",
  processing: "bg-[#e8f1ff] text-[#2553a4]",
  shipped: "bg-[#e9f8ef] text-[#22653a]",
  delivered: "bg-[#edf9ea] text-[#2d6b2d]",
  cancelled: "bg-[#fdecec] text-[#9b2c2c]",
};

function getStatusLabel(status: string) {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DashboardSkeleton() {
  return (
    <div className="bg-[var(--background)]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <div className="h-3 w-24 rounded-full bg-[var(--card-tint)]" />
            <div className="mt-4 h-10 w-64 rounded-[1.5rem] bg-[var(--card-tint)]" />
            <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-[var(--card-tint)]" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 rounded-[1.5rem] bg-[var(--card-tint)]" />
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <div className="h-3 w-28 rounded-full bg-[var(--card-tint)]" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-32 rounded-[1.5rem] bg-[var(--card-tint)]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async (userId: string) => {
      setIsLoadingOrders(true);
      setOrdersError("");

      const { data: ordersData, error: ordersErrorResponse } = await supabase
        .from("orders")
        .select("id, product_id, quantity, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false, nullsFirst: false });

      if (!isMounted) return;

      if (ordersErrorResponse) {
        setOrders([]);
        setOrdersError(ordersErrorResponse.message);
        setIsLoadingOrders(false);
        return;
      }

      const productIds = Array.from(
        new Set((ordersData ?? []).map((order) => order.product_id).filter((value): value is string => Boolean(value)))
      );

      let productsMap: Record<string, ProductRecord> = {};

      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, price")
          .in("id", productIds);

        if (!isMounted) return;

        if (productsError) {
          setOrders([]);
          setOrdersError(productsError.message);
          setIsLoadingOrders(false);
          return;
        }

        productsMap = (productsData ?? []).reduce<Record<string, ProductRecord>>((accumulator, product) => {
          accumulator[product.id] = product;
          return accumulator;
        }, {});
      }

      setOrders(
        (ordersData ?? []).map((order) => ({
          ...order,
          product: productsMap[order.product_id] ?? null,
        }))
      );
      setIsLoadingOrders(false);
    };

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session?.user) {
        router.replace("/auth");
        return;
      }

      setUser(session.user);
      setIsCheckingSession(false);
      void loadOrders(session.user.id);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setOrders([]);
        router.replace("/auth");
        return;
      }

      setUser(session.user);
      setIsCheckingSession(false);
      void loadOrders(session.user.id);
    });

    const ordersChannel = supabase
      .channel("user_dashboard_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!isMounted || !currentUser) return;
        void loadOrders(currentUser.id);
      })
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(ordersChannel);
    };
  }, [router]);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length;

  if (isCheckingSession) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="bg-[var(--background)]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Your account is active.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              You&apos;re signed in as <span className="font-semibold text-[var(--foreground)]">{user?.email}</span>.
              Your order updates here follow the same status changes your admin team makes in the store dashboard.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-tint)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Total orders</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{orders.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-tint)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Active orders</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{activeOrders}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-tint)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Delivered</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{deliveredOrders}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--foreground-soft)]"
              >
                Manage profile
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
              >
                Continue shopping
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-[var(--border-strong)]"
                onClick={handleLogout}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-[0_22px_48px_rgba(17,17,17,0.07)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Your orders</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  Track every order from one place.
                </h2>
              </div>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--foreground)]"
              >
                Open cart
              </Link>
            </div>

            {ordersError ? (
              <p className="mt-6 rounded-[1.5rem] border border-[#d9b6ac] bg-[#fff3ef] px-4 py-3 text-sm text-[#8a3f29]">
                {ordersError}
              </p>
            ) : null}

            {isLoadingOrders ? (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-[1.5rem] bg-[var(--card-tint)]" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--card-tint)] px-6 py-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">No orders yet</p>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                  Once you place an order while signed in, it will appear here with the live status your admin team sets.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[0_14px_30px_rgba(17,17,17,0.04)]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                          {order.product?.name ?? "Product unavailable"}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                          <span>Quantity: {order.quantity}</span>
                          <span>
                            Total:{" "}
                            <span className="font-semibold text-[var(--foreground)]">
                              {formatPrice((order.product?.price ?? 0) * order.quantity)}
                            </span>
                          </span>
                          <span>
                            Placed:{" "}
                            <span className="font-semibold text-[var(--foreground)]">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recently"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[160px]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Status</p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                            statusStyles[order.status] ?? "bg-[var(--card-tint)] text-[var(--foreground)]"
                          }`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
