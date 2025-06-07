import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
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
} from "lucide-react";

const ContentManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Mock data - replace with actual API call
  const mockContents = [
    {
      id: "1",
      title: "Sunset Over Santorini Cliffs",
      description:
        "Beautiful aerial view of Santorini cliffs during golden hour",
      category: "Tourism",
      tags: ["sunset", "cliffs", "santorini", "greece"],
      location: "Santorini, Greece",
      resolution: "4K",
      duration: 45,
      youtubePreview: "https://youtube.com/watch?v=example1",
      price: 49.99,
      licenseType: "royalty-free",
      status: "approved",
      views: 1245,
      downloads: 34,
      earnings: 1699.66,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
      createdAt: "2024-01-15T10:30:00Z",
      mediaFiles: [
        { type: "video", url: "https://example.com/video1.mp4" },
        { type: "image", url: "https://example.com/image1.jpg" },
      ],
    },
    {
      id: "2",
      title: "Urban Cityscape Aerial View",
      description: "Modern city skyline captured from above",
      category: "Urban",
      tags: ["city", "skyline", "modern", "architecture"],
      location: "New York, USA",
      resolution: "4K",
      duration: 32,
      youtubePreview: "https://youtube.com/watch?v=example2",
      price: 39.99,
      licenseType: "limited-use",
      status: "pending_review",
      views: 892,
      downloads: 23,
      earnings: 919.77,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1486162928267-e24c5f0c8820?w=400",
      createdAt: "2024-01-10T14:20:00Z",
      mediaFiles: [{ type: "video", url: "https://example.com/video2.mp4" }],
    },
    {
      id: "3",
      title: "Forest Canopy Drone Flight",
      description: "Flying through dense forest canopy",
      category: "Nature",
      tags: ["forest", "trees", "nature", "canopy"],
      location: "Amazon Rainforest, Brazil",
      resolution: "2K",
      duration: 67,
      price: 29.99,
      licenseType: "royalty-free",
      status: "rejected",
      views: 456,
      downloads: 12,
      earnings: 359.88,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
      createdAt: "2024-01-08T09:15:00Z",
      mediaFiles: [
        { type: "video", url: "https://example.com/video3.mp4" },
        { type: "image", url: "https://example.com/image3.jpg" },
      ],
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContents(mockContents);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredAndSortedContents = contents
    .filter((content) => {
      const matchesSearch =
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesFilter =
        filterStatus === "all" || content.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "most_viewed":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        // Simulate API call
        setContents((prev) =>
          prev.filter((content) => content.id !== contentId)
        );
        showSuccess("Content Deleted", "Content has been successfully deleted");
      } catch (error) {
        showError("Delete Failed", "Failed to delete content");
      }
    }
  };

  if (loading) {
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
                      {contents.length}
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
                      {contents
                        .reduce((sum, content) => sum + content.views, 0)
                        .toLocaleString()}
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
                      {contents.reduce(
                        (sum, content) => sum + content.downloads,
                        0
                      )}
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
                      $
                      {contents
                        .reduce((sum, content) => sum + content.earnings, 0)
                        .toFixed(2)}
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
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="most_viewed">Most Viewed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Content Grid */}
          {filteredAndSortedContents.length === 0 ? (
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
              {filteredAndSortedContents.map((content) => (
                <Card
                  key={content.id}
                  className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(content.status)}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {content.mediaFiles.some(
                        (file) => file.type === "video"
                      ) && (
                        <Badge className="bg-purple-500/20 text-purple-400">
                          <FileVideo className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {content.mediaFiles.some(
                        (file) => file.type === "image"
                      ) && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          <Image className="h-3 w-3 mr-1" />
                          Photo
                        </Badge>
                      )}
                    </div>
                    {content.youtubePreview && (
                      <div className="absolute bottom-3 right-3">
                        <a
                          href={content.youtubePreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors"
                        >
                          <Youtube className="h-4 w-4 text-white" />
                        </a>
                      </div>
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
                      {content.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-slate-700 text-gray-300 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {content.tags.length > 3 && (
                        <Badge className="bg-slate-700 text-gray-300 text-xs">
                          +{content.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Views</p>
                        <p className="text-white font-medium">
                          {content.views.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Downloads</p>
                        <p className="text-white font-medium">
                          {content.downloads}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Earned</p>
                        <p className="text-green-400 font-medium">
                          ${content.earnings.toFixed(0)}
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
        </div>
      </main>
    </div>
  );
};

export default ContentManagement;
