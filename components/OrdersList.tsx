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

export default function OrdersList({ orders, loading, onStatusUpdate, updatingOrderId }: OrdersListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-400 text-amber-900";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-emerald-100 text-emerald-800";
      case "delivered":
        return "bg-slate-200 text-slate-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-200 text-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm shadow-emerald-50">
        <div className="animate-pulse">
          <div className="h-4 bg-emerald-100 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-emerald-50 rounded border border-emerald-100"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-100 bg-white overflow-hidden shadow-sm shadow-emerald-50">
      <div className="p-6 border-b border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-900">Orders</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-emerald-50 text-emerald-900 px-3 py-2 rounded-md text-sm border border-emerald-200"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-emerald-700">No orders found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-emerald-50/60">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-emerald-900">
                        {order.name}
                      </div>
                      <div className="text-sm text-emerald-700">{order.phone}</div>
                      <div className="text-sm text-emerald-700">{order.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-emerald-900">
                      {order.products?.name || "Unknown Product"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900">
                    {order.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-900">
                    ${order.products ? (order.products.price * order.quantity).toFixed(2) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {[
                        { value: "pending", label: "Pending" },
                        { value: "processing", label: "Processing" },
                        { value: "shipped", label: "Shipped" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ].map((item) => (
                        <button
                          type="button"
                          key={`${order.id}-${item.value}`}
                          onClick={() => onStatusUpdate(order.id, item.value)}
                          disabled={updatingOrderId === order.id}
                          className={`px-2 py-1 text-[10px] rounded-lg font-semibold uppercase transition ${
                            updatingOrderId === order.id
                              ? "cursor-not-allowed opacity-50"
                            : order.status === item.value
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100"
                          }`}
                        >
                          {updatingOrderId === order.id && order.status !== item.value ? "..." : item.label}
                        </button>
                      ))}
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                      className="bg-emerald-50 text-emerald-900 px-2 py-1 rounded text-xs border border-emerald-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
