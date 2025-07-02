import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatorHeader from "@/components/creatorDashboard/CreatorHeader";
import CreatorSideBar from "@/components/creatorDashboard/CreatorSideBar";
import { Eye, Check, X, Loader2, Download } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const statusColors = {
  pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/orders/creator/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      showError("Failed to load orders");
    }
    setLoading(false);
  };

  const handleAction = async (orderId, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      showSuccess(`Order ${action === "approve" ? "approved" : "rejected"}`);
      fetchOrders();
    } catch {
      showError("Failed to update order");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CreatorHeader />
      <CreatorSideBar />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
            <p className="text-gray-400">View and manage your sales orders</p>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Order List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-gray-400 text-center py-12">
                  No orders found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-gray-300">
                    <thead>
                      <tr>
                        <th className="p-2 text-left">Buyer</th>
                        <th className="p-2 text-left">Content</th>
                        <th className="p-2 text-left">Slip</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-slate-700"
                        >
                          <td className="p-2">{order.buyerEmail}</td>
                          <td className="p-2">
                            {order.contentTitles?.join(", ") || "-"}
                          </td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSlip(order.slipUrl)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <a
                              href={order.slipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2"
                            >
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </a>
                          </td>
                          <td className="p-2">
                            <Badge className={statusColors[order.status]}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {order.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleAction(order.id, "approve")
                                  }
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() =>
                                    handleAction(order.id, "reject")
                                  }
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Slip Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="relative bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => setSelectedSlip(null)}
              aria-label="Close slip"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Bank Slip
              </h3>
              {selectedSlip.endsWith(".pdf") ? (
                <iframe
                  src={selectedSlip}
                  title="Bank Slip"
                  className="w-full h-96"
                />
              ) : (
                <img
                  src={selectedSlip}
                  alt="Bank Slip"
                  className="w-full max-h-96 object-contain rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
