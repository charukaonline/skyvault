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
  const [contentMap, setContentMap] = useState({}); // contentId -> content metadata
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

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
    // Fetch buyer's approved orders and their content metadata
    const fetchOrdersAndContents = async () => {
      setLoadingOrders(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/orders/my-approved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        const orders = data.orders || [];
        setOrders(orders);

        // Collect all unique contentIds from all orders
        const allContentIds = [
          ...new Set(orders.flatMap((order) => order.contentIds || [])),
        ];
        // Fetch content metadata for each contentId in parallel
        const contentResults = await Promise.all(
          allContentIds.map(async (cid) => {
            try {
              const cres = await fetch(`${API_BASE}/api/content/public/${cid}`);
              if (!cres.ok) return null;
              const cdata = await cres.json();
              return [cid, cdata];
            } catch {
              return null;
            }
          })
        );
        // Build contentId -> content metadata map
        const cMap = {};
        for (const pair of contentResults) {
          if (pair && pair[0] && pair[1]) cMap[pair[0]] = pair[1];
        }
        setContentMap(cMap);
      } catch (e) {
        setOrders([]);
        setContentMap({});
      }
      setLoadingOrders(false);
    };
    fetchOrdersAndContents();
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
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => setShowChangePw(true)}
            >
              Change Password
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
                  <div className="mb-2 text-xs text-gray-500">
                    Purchased on: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {(order.contentIds || []).map((cid) => {
                      const content = contentMap[cid];
                      if (!content) {
                        return (
                          <div
                            key={cid}
                            className="bg-slate-900 rounded p-3 flex flex-col gap-2"
                          >
                            <div className="text-gray-400 text-sm">
                              Content unavailable (may have been removed)
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={cid}
                          className="bg-slate-900 rounded p-3 flex flex-col gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                content.thumbnailFile?.url ||
                                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200"
                              }
                              alt={content.title}
                              className="w-16 h-16 object-cover rounded"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200";
                              }}
                            />
                            <div>
                              <div className="text-white font-medium">
                                {content.title}
                              </div>
                              <div className="text-xs text-gray-400">
                                {content.category} • {content.location}
                              </div>
                              <div className="text-xs text-gray-400">
                                By {content.creatorName || "Unknown"}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setSelectedContent(cid);
                                setDownloadUrls({});
                                await fetchDownloadUrls(cid);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download Files
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
        {/* Change Password Modal */}
        {showChangePw && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowChangePw(false)}
          >
            <div
              className="relative bg-slate-900 rounded-lg shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
                onClick={() => setShowChangePw(false)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Change Password
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPwError("");
                    setPwSuccess("");
                    if (
                      !pwForm.oldPassword ||
                      !pwForm.newPassword ||
                      !pwForm.confirm
                    ) {
                      setPwError("All fields are required.");
                      return;
                    }
                    if (pwForm.newPassword.length < 6) {
                      setPwError("New password must be at least 6 characters.");
                      return;
                    }
                    if (pwForm.newPassword !== pwForm.confirm) {
                      setPwError("Passwords do not match.");
                      return;
                    }
                    setPwLoading(true);
                    try {
                      const res = await fetch(
                        `${API_BASE}/api/user/change-password`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                          body: JSON.stringify({
                            oldPassword: pwForm.oldPassword,
                            newPassword: pwForm.newPassword,
                          }),
                        }
                      );
                      const data = await res.json();
                      if (res.ok) {
                        setPwSuccess("Password changed successfully.");
                        setPwForm({
                          oldPassword: "",
                          newPassword: "",
                          confirm: "",
                        });
                        setTimeout(() => {
                          setShowChangePw(false);
                          setPwSuccess("");
                        }, 1500);
                      } else {
                        setPwError(
                          data.message || "Failed to change password."
                        );
                      }
                    } catch {
                      setPwError("Failed to change password.");
                    }
                    setPwLoading(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-gray-300 mb-1">
                      Old Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                      value={pwForm.oldPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          oldPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                      value={pwForm.newPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                      value={pwForm.confirm}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, confirm: e.target.value }))
                      }
                      required
                    />
                  </div>
                  {pwError && <div className="text-red-500">{pwError}</div>}
                  {pwSuccess && (
                    <div className="text-green-500">{pwSuccess}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white mt-2"
                    disabled={pwLoading}
                  >
                    {pwLoading ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerDashboard;
