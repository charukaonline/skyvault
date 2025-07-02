import React, { useEffect, useState } from "react";
import {
  Camera,
  Search,
  Download,
  ShoppingCart,
  LogOut,
  Star,
  Eye,
  FileVideo,
  Image,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { userId, email } = useParams();
  const [user, setUser] = useState(null);
  const { showSuccess, showError } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [downloadUrls, setDownloadUrls] = useState({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Validate URL parameters
        if (userId !== parsedUser.id || email !== parsedUser.email) {
          navigate(`/buyer/${parsedUser.id}/${parsedUser.email}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth/login", { replace: true });
      }
    }
  }, [userId, email, navigate]);

  useEffect(() => {
    // Fetch buyer's approved orders
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/orders/my-approved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        setOrders([]);
      }
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [userId, email, navigate]);

  // Fetch download URLs for a content
  const fetchDownloadUrls = async (contentId) => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/content/access/${contentId}/download-all?expirationMinutes=60`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to get download URLs");
      const data = await res.json();
      setDownloadUrls(data.downloadUrls || {});
    } catch (e) {
      showError("Download Error", "Could not get download links.");
    }
    setDownloading(false);
  };

  // Download a single file
  const handleDownload = (file) => {
    const url = downloadUrls[file.id];
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName || file.id;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Download Started", file.originalName || file.id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Purchases</h1>
        {loadingOrders ? (
          <div className="text-gray-400">Loading your purchases...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">No approved purchases yet.</div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card key={order.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">
                      Order #{order.id.slice(-6)}
                    </span>
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                      Approved
                    </Badge>
                  </div>
                  <div className="mb-2 text-gray-400 text-sm">
                    {order.contentTitles?.join(", ")}
                  </div>
                  <div className="mb-2 text-xs text-gray-500">
                    Purchased on: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.contentIds.map((cid) => (
                      <Button
                        key={cid}
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setSelectedContent(cid);
                          setDownloadUrls({});
                          await fetchDownloadUrls(cid);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Content
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Download Modal */}
        {selectedContent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setSelectedContent(null)}
          >
            <div
              className="relative bg-slate-900 rounded-lg shadow-lg max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
                onClick={() => setSelectedContent(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Download Files
                </h3>
                {downloading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin" /> Preparing download
                    links...
                  </div>
                ) : Object.keys(downloadUrls).length === 0 ? (
                  <div className="text-gray-400">No files found.</div>
                ) : (
                  <ul className="space-y-2">
                    {Object.entries(downloadUrls).map(([fid, url]) => (
                      <li
                        key={fid}
                        className="flex items-center justify-between bg-slate-800 p-2 rounded"
                      >
                        <span className="text-white text-sm">{fid}</span>
                        <Button
                          size="sm"
                          onClick={() => handleDownload({ id: fid })}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerDashboard;
