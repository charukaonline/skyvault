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

// Original Video Viewer Component - Updated for Private S3 Access
const OriginalVideoViewer = ({ mediaFiles, title, contentId, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [presignedUrls, setPresignedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Find the first video file or use the first file
    const videoFile =
      mediaFiles?.find((file) => file.type === "video") || mediaFiles?.[0];
    setSelectedFile(videoFile);

    // Fetch presigned URLs for private S3 access
    fetchPresignedUrls();
  }, [mediaFiles, contentId]);

  const fetchPresignedUrls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/content/access/${contentId}/view?expirationMinutes=60`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get access URLs");
      }

      const data = await response.json();
      setPresignedUrls(data.urls);
    } catch (err) {
      console.error("Error fetching presigned URLs:", err);
      setError("Failed to load private content");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/content/access/${contentId}/download/${file.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const data = await response.json();

      // Open download URL in new tab
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Loading private content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedFile) return null;

  const fileUrl = presignedUrls[selectedFile.id];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative bg-slate-800 rounded-lg overflow-hidden max-w-6xl w-full max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="text-white font-medium truncate">{title}</h3>
            <p className="text-gray-400 text-sm">
              {selectedFile.originalName} •{" "}
              {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB •
              Private S3 Storage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleDownload(selectedFile)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Secure Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          {/* File Selection if multiple files */}
          {mediaFiles && mediaFiles.length > 1 && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">
                Select private file to view:
              </p>
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((file, index) => {
                  const hasUrl = presignedUrls[file.id];
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedFile(file)}
                      disabled={!hasUrl}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedFile === file
                          ? "bg-blue-600 text-white border-blue-500"
                          : hasUrl
                          ? "bg-slate-700 text-gray-300 border-slate-600 hover:border-slate-500"
                          : "bg-slate-800 text-gray-500 border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      {file.type === "video" ? (
                        <FileVideo className="h-3 w-3 inline mr-1" />
                      ) : (
                        <Image className="h-3 w-3 inline mr-1" />
                      )}
                      {file.originalName || `${file.type}_${index + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Display - Private S3 URLs */}
          <div className="bg-black rounded-lg overflow-hidden">
            {fileUrl ? (
              selectedFile.type === "video" ? (
                <video
                  controls
                  className="w-full max-h-[60vh] object-contain"
                  preload="metadata"
                  crossOrigin="anonymous"
                >
                  <source src={fileUrl} type={`video/${selectedFile.format}`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={fileUrl}
                  alt={selectedFile.originalName}
                  className="w-full max-h-[60vh] object-contain"
                  crossOrigin="anonymous"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">Failed to load secure content</p>
              </div>
            )}
          </div>

          {/* File Details */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Format</p>
              <p className="text-white">{selectedFile.format?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-gray-400">Size</p>
              <p className="text-white">
                {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {selectedFile.width && (
              <div>
                <p className="text-gray-400">Resolution</p>
                <p className="text-white">
                  {selectedFile.width}×{selectedFile.height}
                </p>
              </div>
            )}
            {selectedFile.duration && (
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="text-white">
                  {Math.floor(selectedFile.duration / 60)}:
                  {(selectedFile.duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
            )}
          </div>

          {/* S3 Security Info */}
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-400">
              <span className="font-medium">Security:</span> Private AWS S3
              Storage with temporary access •
              <span className="font-medium"> File ID:</span>{" "}
              {selectedFile.id?.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// Function to get YouTube thumbnail URL
const getYouTubeThumbnail = (youtubeUrl) => {
  if (!youtubeUrl) return null;

  const match = youtubeUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );

  if (match && match[1]) {
    // Use maxresdefault for highest quality, fallback to hqdefault if not available
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }

  return null;
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
  const [selectedContentForViewing, setSelectedContentForViewing] =
    useState(null);
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
                        getYouTubeThumbnail(content.youtubePreview) ||
                        content.thumbnailFile?.url ||
                        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400"
                      }
                      alt={content.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Fallback to hqdefault if maxresdefault fails
                        if (
                          content.youtubePreview &&
                          e.target.src.includes("maxresdefault")
                        ) {
                          const fallbackUrl = e.target.src.replace(
                            "maxresdefault",
                            "hqdefault"
                          );
                          e.target.src = fallbackUrl;
                        } else if (!e.target.src.includes("unsplash")) {
                          // Final fallback to S3 thumbnail or default image
                          e.target.src =
                            content.thumbnailFile?.url ||
                            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400";
                        }
                      }}
                    />

                    {/* View Original S3 Files Button Overlay */}
                    {content.mediaFiles && content.mediaFiles.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <Button
                          onClick={() => setSelectedContentForViewing(content)}
                          className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-600 backdrop-blur-sm"
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View S3 Files
                        </Button>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2">
                      {getStatusBadge(content.status)}
                    </div>

                    <div className="absolute bottom-3 left-3 flex gap-2">
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
                          onClick={() => setSelectedContentForViewing(content)}
                          title="View Original Files"
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

      {/* Original Video Viewer Modal */}
      {selectedContentForViewing && (
        <OriginalVideoViewer
          mediaFiles={selectedContentForViewing.mediaFiles}
          title={selectedContentForViewing.title}
          contentId={selectedContentForViewing.id}
          onClose={() => setSelectedContentForViewing(null)}
        />
      )}
    </div>
  );
};

export default ContentManagement;
