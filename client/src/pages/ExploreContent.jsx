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
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { showSuccess } = useNotification();
  const [cartOpen, setCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Cart Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full px-2 text-xs">
                {cart.length}
              </span>
            )}
            <span className="ml-2">Cart</span>
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Explore Drone Content
        </h1>
        <p className="text-gray-400 text-center mb-10">
          Browse and preview aerial content available for purchase. Filter by
          creator.
        </p>
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative w-full md:w-1/4">
            <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Filter by creator name..."
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setCreatorFilter("");
              setSearch("");
            }}
            className="w-full md:w-auto"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((content) => (
              <Card key={content.id} className="bg-slate-800 border-slate-700">
                <div className="relative">
                  <img
                    src={
                      getYouTubeThumbnail(content.youtubePreview) ||
                      content.thumbnailFile?.url ||
                      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400"
                    }
                    alt={content.title}
                    className="w-full h-56 object-cover rounded-t-lg"
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
                      <Badge className="bg-red-600/20 text-red-400 border-red-500/30 cursor-pointer">
                        <Youtube className="h-3 w-3 mr-1" />
                        Preview
                      </Badge>
                    </button>
                  )}
                </div>
                <CardContent className="p-4">
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
                        className="bg-slate-700 text-gray-300 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {content.tags?.length > 3 && (
                      <Badge className="bg-slate-700 text-gray-300 text-xs">
                        +{content.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-green-400 font-semibold">
                      ${content.price}
                    </span>
                    <span className="text-xs text-gray-400">
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
                        className="bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Added
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!isBuyer) {
                            setShowLoginModal(true);
                            return;
                          }
                          await addToCart(content.id);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white p-2"
              onClick={() => setPreviewId(null)}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full rounded-t-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${previewId}?autoplay=1`}
                title="YouTube Preview"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-80 md:h-96"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Cart Modal */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="relative bg-slate-900 rounded-lg shadow-lg max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-medium text-lg">
                <ShoppingCart className="h-5 w-5 mr-2 inline" />
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
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button
                    className="bg-blue-600 text-white"
                    onClick={() => {
                      setCartOpen(false);
                      // TODO: Implement checkout flow
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
      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="relative bg-slate-900 rounded-lg shadow-lg max-w-md w-full mx-4"
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
