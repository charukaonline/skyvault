import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import { apiConfig } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreatorHeader from "@/components/creatorDashboard/CreatorHeader";
import CreatorSideBar from "@/components/creatorDashboard/CreatorSideBar";
import {
  FileVideo,
  Image,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Calendar,
  MapPin,
  Youtube,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  X,
} from "lucide-react";

// YouTube Preview Component
const YouTubePreview = ({ youtubeUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    if (youtubeUrl) {
      // Extract video ID from YouTube URL
      const match = youtubeUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
      );
      if (match) {
        setVideoId(match[1]);
      }
    }
  }, [youtubeUrl]);

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleCloseClick = () => {
    setIsPlaying(false);
  };

  if (!videoId) return null;

  return (
    <>
      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            onClick={handlePlayClick}
            className="bg-red-600 hover:bg-red-700 p-3 rounded-full"
          >
            <Play className="h-6 w-6 text-white fill-current" />
          </Button>
        </div>
      )}

      {/* YouTube Player Modal */}
      {isPlaying && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative bg-slate-800 rounded-lg overflow-hidden max-w-4xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-medium truncate">{title}</h3>
              <Button
                onClick={handleCloseClick}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ContentManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarnings: 0,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchContentData();
    fetchStats();
  }, [searchTerm, filterStatus, sortBy, sortDir, pagination.page]);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showError("Error", "Authentication required");
        navigate("/auth/login");
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: sortBy,
        sortDir: sortDir,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(
        `${apiConfig.endpoints.content.creatorContentFiltered}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const data = await response.json();
      setContents(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching content:", error);
      showError("Error", "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(apiConfig.endpoints.content.creatorStats, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats({
          totalContent: contents.length,
          totalViews: statsData.views || 0,
          totalDownloads: statsData.downloads || 0,
          totalEarnings: statsData.earnings || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          apiConfig.endpoints.content.deleteContent(contentId),
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete content");
        }

        setContents((prev) =>
          prev.filter((content) => content.id !== contentId)
        );
        showSuccess("Content Deleted", "Content has been successfully deleted");
        fetchStats(); // Refresh stats
      } catch (error) {
        showError("Delete Failed", "Failed to delete content");
      }
    }
  };

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Approved",
      },
      pending_review: {
        color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        label: "Pending Review",
      },
      rejected: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.pending_review;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading && contents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CreatorHeader />
        <CreatorSideBar />
        <main className="ml-64 pt-16 p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <FileVideo className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400">Loading your content...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CreatorHeader />
      <CreatorSideBar />

      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Content</h1>
              <p className="text-gray-400">
                Manage your uploaded drone footage
              </p>
            </div>
            <Button
              onClick={() => navigate("/creator/upload")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload New Content
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Content
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {pagination.totalElements}
                    </p>
                  </div>
                  <FileVideo className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Views
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Downloads
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalDownloads}
                    </p>
                  </div>
                  <Download className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Total Earnings
                    </p>
                    <p className="text-2xl font-bold text-white">
                      ${stats.totalEarnings.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="price">Price</option>
                  <option value="views">Most Viewed</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          {contents.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <FileVideo className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  No content found
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by uploading your first drone footage"}
                </p>
                <Button
                  onClick={() => navigate("/creator/upload")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Content
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card
                  key={content.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={
                        content.thumbnailFile?.url ||
                        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400"
                      }
                      alt={content.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(content.status)}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {content.mediaFiles?.some(
                        (file) => file.type === "video"
                      ) && (
                        <Badge className="bg-purple-500/20 text-purple-400">
                          <FileVideo className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {content.mediaFiles?.some(
                        (file) => file.type === "image"
                      ) && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          <Image className="h-3 w-3 mr-1" />
                          Photo
                        </Badge>
                      )}
                    </div>

                    {/* YouTube Preview Integration */}
                    {content.youtubePreview && (
                      <>
                        <YouTubePreview
                          youtubeUrl={content.youtubePreview}
                          title={content.title}
                        />
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
                            <Youtube className="h-3 w-3 mr-1" />
                            Preview
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {content.title}
                    </h3>

                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {content.location}
                    </div>

                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(content.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
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

                    <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Views</p>
                        <p className="text-white font-medium">
                          {content.views?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Downloads</p>
                        <p className="text-white font-medium">
                          {content.downloads || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Earned</p>
                        <p className="text-green-400 font-medium">
                          ${(content.earnings || 0).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-400 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {content.price}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 0}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-400">
                  Page {pagination.page + 1} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ContentManagement;
