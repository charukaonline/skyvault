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
  const [selectedSlipType, setSelectedSlipType] = useState(""); // Track file type
  const [slipLoading, setSlipLoading] = useState(false);
  const [slipError, setSlipError] = useState("");
  const [showSlipModal, setShowSlipModal] = useState(false); // new state
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
    // Show confirmation dialog before proceeding
    const actionText = action === "approve" ? "approve" : "reject";
    const confirmMsg = `Are you sure you want to ${actionText} this order?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("token");
      // Use the correct creator endpoint for approve/reject
      const res = await fetch(
        `${API_BASE}/api/orders/creator/${orderId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        if (res.status === 403) {
          showError("You are not authorized to perform this action.");
        } else {
          showError("Failed to update order");
        }
        return;
      }
      showSuccess(`Order ${action === "approve" ? "approved" : "rejected"}`);
      // Optimistically update the order status in the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: action === "approve" ? "approved" : "rejected",
              }
            : order
        )
      );
      // Optionally, you can still fetchOrders() in the background for sync
      // await fetchOrders();
    } catch {
      showError("Failed to update order");
    }
  };

  const handleViewSlip = async (order) => {
    setSlipLoading(true);
    setSlipError("");
    setSelectedSlip(null);
    setSelectedSlipType("");
    setShowSlipModal(true); // open modal immediately, show spinner
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/orders/creator/${order.id}/slip-url?expirationMinutes=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setSlipError(data.message || "Failed to get slip URL");
        setSlipLoading(false);
        return;
      }
      const data = await res.json();
      setSelectedSlip(data.url);
      // Infer file type from URL
      if (data.url.endsWith(".pdf")) setSelectedSlipType("pdf");
      else if (data.url.match(/\.(jpg|jpeg|png)$/i))
        setSelectedSlipType("image");
      else setSelectedSlipType("");
    } catch (e) {
      setSlipError("Failed to get slip URL");
    }
    setSlipLoading(false);
  };

  const handleDownloadSlip = () => {
    if (!selectedSlip) return;
    const link = document.createElement("a");
    link.href = selectedSlip;
    link.download = "bank-slip";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                      {orders.map((order) => {
                        const status = (order.status || "").toLowerCase();
                        return (
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
                                onClick={() => handleViewSlip(order)}
                                disabled={slipLoading}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                            <td className="p-2">
                              <Badge className={statusColors[status]}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {status === "pending" && (
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Slip Modal */}
      {showSlipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => {
            setShowSlipModal(false);
            setSelectedSlip(null);
            setSlipError("");
            setSlipLoading(false);
          }}
        >
          <div
            className="relative bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => {
                setShowSlipModal(false);
                setSelectedSlip(null);
                setSlipError("");
                setSlipLoading(false);
              }}
              aria-label="Close slip"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Bank Slip
              </h3>
              {slipLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-4" />
                  <div className="text-gray-400">Loading slip...</div>
                </div>
              ) : slipError ? (
                <div className="text-red-400">{slipError}</div>
              ) : selectedSlip ? (
                <>
                  {selectedSlipType === "pdf" ? (
                    <iframe
                      src={selectedSlip}
                      title="Bank Slip"
                      className="w-full h-96"
                    />
                  ) : selectedSlipType === "image" ? (
                    <img
                      src={selectedSlip}
                      alt="Bank Slip"
                      className="w-full max-h-96 object-contain rounded"
                    />
                  ) : (
                    <div className="text-gray-400">Unsupported file type.</div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadSlip}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No slip found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
