"use client";

import { useState, useEffect } from "react";
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
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        const { data, error } = await supabase.from("products").select("count").limit(1);
        if (error) {
          console.error("Supabase connection test failed:", error);
          setConnectionError("Supabase connection failed. Please check your configuration.");
        } else {
          console.log("Supabase connection successful");
          setConnectionError(null);
        }
      } catch (err) {
        console.error("Supabase connection test error:", err);
        setConnectionError("Unable to connect to Supabase. Please check your internet connection and configuration.");
      }
    };

    testConnection();
    fetchOrders();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Order change:", payload);

          if (payload.eventType === "INSERT") {
            setNewOrdersCount((count) => count + 1);
          }

          fetchOrders(); // Refresh orders when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Testing Supabase connection...");
      // Test basic connectivity first
      const { data: testData, error: testError } = await supabase
        .from("products")
        .select("count")
        .limit(1);

      if (testError) {
        console.error("Supabase connection test failed:", testError);
        setConnectionError("Cannot connect to Supabase. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
        return;
      }
      console.log("Supabase connection successful");

      console.log("Fetching orders...");
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false });

      if (ordersError) {
        console.error("Supabase orders query error:", ordersError);
        console.error("Error details:", JSON.stringify(ordersError, null, 2));
        console.error("Error code:", ordersError.code);
        console.error("Error message:", ordersError.message);
        console.error("Error hint:", ordersError.hint);

        // Check if it's a "relation does not exist" error
        if (ordersError.code === '42P01' || ordersError.message?.includes('does not exist')) {
          setConnectionError("Database tables missing. Please run the database-setup.sql script in your Supabase SQL editor.");
        } else if (ordersError.code === '42703' || ordersError.message?.includes('column') && ordersError.message?.includes('does not exist')) {
          setConnectionError("Missing database columns. Please run the fix-created-at.sql script in your Supabase SQL editor.");
        } else if (ordersError.code === '42501' || ordersError.message?.includes('permission denied')) {
          setConnectionError("Database permission denied. Please check your Supabase RLS policies.");
        } else {
          setConnectionError(`Database error: ${ordersError.message || 'Unknown error'}`);
        }
        return;
      }

      console.log(`Fetched ${ordersData?.length || 0} orders`);

      console.log("Fetching products...");
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, price");

      if (productsError) {
        console.error("Supabase products query error:", productsError);
        console.error("Error details:", JSON.stringify(productsError, null, 2));
        if (productsError.code === '42P01' || productsError.message?.includes('does not exist')) {
          setConnectionError("Products table does not exist. Please run the database-setup.sql script in your Supabase SQL editor.");
        } else if (productsError.code === '42703' || productsError.message?.includes('column') && productsError.message?.includes('does not exist')) {
          setConnectionError("Missing database columns. Please check your database schema.");
        } else if (productsError.code === '42501' || productsError.message?.includes('permission denied')) {
          setConnectionError("Database permission denied. Please check your Supabase RLS policies.");
        } else {
          setConnectionError(`Failed to load products: ${productsError.message || 'Unknown database error'}`);
        }
        return;
      }

      console.log(`Fetched ${productsData?.length || 0} products`);

      console.log(`Fetched ${ordersData?.length || 0} orders and ${productsData?.length || 0} products`);

      const productsMap = (productsData || []).reduce<Record<string, Product>>((acc, product) => {
        acc[product.id] = { id: product.id, name: product.name, price: product.price };
        return acc;
      }, {});

      const mappedOrders = (ordersData || []).map((order) => ({
        ...order,
        products: productsMap[order.product_id] || null,
      }));

      setOrders(mappedOrders);
      console.log("Orders successfully loaded and mapped");
      setConnectionError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error type:", typeof error);
      console.error("Error keys:", error ? Object.keys(error) : 'No error object');
      // Set empty orders array to prevent UI crash
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

      // refresh orders list after status change for immediate feedback
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      setAdminToast("Unable to update order status. See console for details.");
      setTimeout(() => setAdminToast(null), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-emerald-50 text-emerald-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Admin</p>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-emerald-800">Manage orders and products</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-xl border border-emerald-100 bg-white/90 shadow-sm shadow-emerald-50">
            <p className="text-xs text-emerald-700 uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-100 bg-white/90 shadow-sm shadow-emerald-50">
            <p className="text-xs text-emerald-700 uppercase tracking-wide">New Orders</p>
            <p className="text-2xl font-bold">{newOrdersCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-100 bg-white/90 shadow-sm shadow-emerald-50">
            <p className="text-xs text-emerald-700 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p>
          </div>
        </div>

        <RealTimeOrdersNotification />

        {adminToast && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-600 text-white shadow-md">
            {adminToast}
          </div>
        )}

        {connectionError && (
          <div className="mb-6 bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Connection Error</p>
                  <p className="text-sm text-red-700">{connectionError}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setConnectionError(null);
                  setLoading(true);
                  fetchOrders();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-emerald-50 p-1 rounded-lg border border-emerald-100">
          <button
            onClick={() => {
              setActiveTab("orders");
              setNewOrdersCount(0);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span>Orders ({orders.length})</span>
              {newOrdersCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  +{newOrdersCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "products"
                ? "bg-emerald-600 text-white"
                : "text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Add Product
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <OrdersList
            orders={orders}
            loading={loading}
            onStatusUpdate={updateOrderStatus}
            updatingOrderId={updatingOrderId}
          />
        )}

        {activeTab === "products" && <AddProductForm />}
      </div>
    </div>
  );
}
