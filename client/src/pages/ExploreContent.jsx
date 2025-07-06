import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Youtube,
  Search,
  MapPin,
  Camera,
  X,
  ShoppingCart,
  Check,
  Trash2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNotification } from "@/contexts/NotificationContext";
import Login from "./auth/Login";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getYouTubeId = (youtubeUrl) => {
  if (!youtubeUrl) return null;
  const match = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match && match[1] ? match[1] : null;
};

const getYouTubeThumbnail = (youtubeUrl) => {
  const id = getYouTubeId(youtubeUrl);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
};

const ExploreContent = () => {
  const [contents, setContents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorFilter, setCreatorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const { cart, creatorId, addToCart, removeFromCart, clearCart, fetchCart } =
    useCart();
  const { showSuccess } = useNotification();
  const [cartOpen, setCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/content/explore`)
      .then((res) => res.json())
      .then((data) => {
        setContents(data.content || []);
        setFiltered(data.content || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = contents;
    if (creatorFilter.trim()) {
      result = result.filter((c) =>
        (c.creatorName || "")
          .toLowerCase()
          .includes(creatorFilter.trim().toLowerCase())
      );
    }
    if (search.trim()) {
      result = result.filter(
        (c) =>
          (c.title || "").toLowerCase().includes(search.trim().toLowerCase()) ||
          (c.description || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
      );
    }
    setFiltered(result);
  }, [creatorFilter, search, contents]);

  // Modal close on ESC
  useEffect(() => {
    if (!previewId) return;
    const handler = (e) => {
      if (e.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewId]);

  // Helper to check if content is in cart
  const isInCart = (contentId) => cart.includes(contentId);

  // Helper to check if user is a logged-in buyer
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };
  const user = getUser();
  const isBuyer = user && user.role === "buyer";

  // Helper to get creator info for cart
  const cartCreator = contents.find((c) => c.creatorId === creatorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 md:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Cart Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="relative shadow-md rounded-full px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 transition"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full px-2 text-xs shadow">
                {cart.length}
              </span>
            )}
            <span className="ml-2 font-semibold">Cart</span>
          </Button>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6 text-center tracking-tight drop-shadow">
          Explore Drone Content
        </h1>
        <p className="text-gray-400 text-center mb-8 md:mb-10 max-w-2xl mx-auto">
          Browse and preview aerial content available for purchase. Filter by
          creator.
        </p>
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 justify-center items-stretch">
          <div className="relative w-full sm:w-2/5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-2 rounded-lg bg-slate-800/70 border-slate-700 text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="relative w-full sm:w-1/4">
            <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Filter by creator name..."
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="pl-10 py-2 rounded-lg bg-slate-800/70 border-slate-700 text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setCreatorFilter("");
              setSearch("");
            }}
            className="w-full sm:w-auto rounded-lg bg-slate-700/60 hover:bg-slate-700 text-gray-200 font-semibold transition"
          >
            Clear Filters
          </Button>
        </div>
        {/* Content Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-24">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-24">
            No content found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((content) => (
              <Card
                key={content.id}
                className="bg-slate-800 border-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 group flex flex-col overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={
                      getYouTubeThumbnail(content.youtubePreview) ||
                      content.thumbnailFile?.url ||
                      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400"
                    }
                    alt={content.title}
                    className="w-full h-48 sm:h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-200"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      if (
                        content.youtubePreview &&
                        e.target.src.includes("maxresdefault")
                      ) {
                        e.target.src = e.target.src.replace(
                          "maxresdefault",
                          "hqdefault"
                        );
                      } else if (!e.target.src.includes("unsplash")) {
                        e.target.src =
                          content.thumbnailFile?.url ||
                          "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400";
                      }
                    }}
                  />
                  {content.youtubePreview && (
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 focus:outline-none"
                      onClick={() =>
                        setPreviewId(getYouTubeId(content.youtubePreview))
                      }
                    >
                      <Badge className="bg-red-600/20 text-red-400 border-red-500/30 cursor-pointer shadow hover:bg-red-600/40 transition">
                        <Youtube className="h-3 w-3 mr-1" />
                        Preview
                      </Badge>
                    </button>
                  )}
                </div>
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                    {content.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {content.location}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {content.tags?.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-slate-700 text-gray-300 text-xs rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {content.tags?.length > 3 && (
                      <Badge className="bg-slate-700 text-gray-300 text-xs rounded-full px-2 py-0.5">
                        +{content.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-green-400 font-bold text-lg drop-shadow">
                      ${content.price}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      By {content.creatorName || "Unknown"}
                    </span>
                  </div>
                  {/* Add to Cart Button */}
                  <div className="mt-4 flex justify-end">
                    {isInCart(content.id) ? (
                      <Button
                        size="sm"
                        variant="success"
                        disabled
                        className="bg-green-600 text-white rounded-full shadow"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Added
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-blue-500 text-blue-400 hover:bg-blue-600/20 transition font-semibold"
                        onClick={async () => {
                          if (!isBuyer) {
                            setShowLoginModal(true);
                            return;
                          }
                          await addToCart(content.id, content.creatorId);
                          showSuccess(
                            "Added to Cart",
                            "Content added to cart!"
                          );
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Preview Modal */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-all"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => setPreviewId(null)}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full rounded-t-2xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${previewId}?autoplay=1`}
                title="YouTube Preview"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-64 sm:h-80 md:h-96"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Cart Modal */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-all"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full mx-2 sm:mx-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                My Cart ({cart.length})
              </h3>
              <Button variant="ghost" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Your cart is empty.
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.map((contentId) => {
                    const content = contents.find((c) => c.id === contentId);
                    if (!content) return null;
                    return (
                      <li
                        key={contentId}
                        className="flex items-center justify-between bg-slate-800 rounded p-3"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {content.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {content.creatorName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-semibold text-sm">
                            ${content.price}
                          </span>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={async () => {
                              await removeFromCart(contentId);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {cart.length > 0 && (
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="rounded-lg bg-slate-800/70 hover:bg-slate-700 text-gray-200 transition"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    className="bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    onClick={() => {
                      setCartOpen(false);
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-all"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => setShowCheckout(false)}
              aria-label="Close checkout"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2 text-center">
                Checkout - Bank Transfer
              </h3>
              <div className="mb-4 text-gray-300 text-sm">
                <div className="mb-2 font-semibold">Bank Details:</div>
                <div>
                  Bank: <span className="font-mono">SkyVault Bank</span>
                </div>
                <div>
                  Account Name:{" "}
                  <span className="font-mono">SkyVault Platform</span>
                </div>
                <div>
                  Account Number: <span className="font-mono">1234567890</span>
                </div>
                <div>
                  Branch: <span className="font-mono">Colombo Main</span>
                </div>
                <div>
                  Reference:{" "}
                  <span className="font-mono">Your Email or User ID</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-200 mb-1 font-medium">
                  Upload Bank Transfer Slip
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSlipFile(e.target.files[0])}
                  className="block w-full text-gray-300 bg-slate-800/70 rounded-lg border border-slate-700 px-3 py-2"
                />
              </div>
              {checkoutError && (
                <div className="text-red-500 mb-2">{checkoutError}</div>
              )}
              {checkoutSuccess && (
                <div className="text-green-500 mb-2">{checkoutSuccess}</div>
              )}
              <Button
                className="w-full bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                disabled={checkoutLoading}
                onClick={async () => {
                  setCheckoutError("");
                  setCheckoutSuccess("");
                  if (!slipFile) {
                    setCheckoutError("Please upload the bank slip.");
                    return;
                  }
                  setCheckoutLoading(true);
                  // Prepare form data
                  const formData = new FormData();
                  cart.forEach((id) => formData.append("contentIds", id));
                  formData.append("slip", slipFile);
                  try {
                    const res = await fetch(`${API_BASE}/api/cart/checkout`, {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCheckoutSuccess(
                        "Checkout successful! Your purchase is pending verification."
                      );
                      clearCart();
                      setSlipFile(null);
                      setTimeout(() => {
                        setShowCheckout(false);
                        setCheckoutSuccess("");
                      }, 2000);
                    } else {
                      setCheckoutError(data.message || "Checkout failed.");
                    }
                  } catch (err) {
                    setCheckoutError("Checkout failed.");
                  }
                  setCheckoutLoading(false);
                }}
              >
                {checkoutLoading ? "Processing..." : "Submit Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-all"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => setShowLoginModal(false)}
              aria-label="Close login"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2 text-center">
                Please sign in as a buyer to add items to your cart
              </h3>
              <Login
                onLoginSuccess={() => {
                  setShowLoginModal(false);
                  window.location.reload();
                }}
                hideLinks
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreContent;
