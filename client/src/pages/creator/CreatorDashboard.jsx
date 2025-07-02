import React, { useEffect, useState } from "react";
import {
  Camera,
  Upload,
  DollarSign,
  Users,
  LogOut,
  FileVideo,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import CreatorHeader from "@/components/creatorDashboard/CreatorHeader";
import CreatorSideBar from "@/components/creatorDashboard/CreatorSideBar";
import { apiConfig } from "@/config/api";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { userId, email } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalEarnings: 0,
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Validate URL parameters
        if (userId !== parsedUser.id || email !== parsedUser.email) {
          navigate(`/creator/${parsedUser.id}/${parsedUser.email}`, {
            replace: true,
          });
        }

        fetchDashboardData();
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth/login", { replace: true });
      }
    }
  }, [userId, email, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      // Fetch stats
      const statsResponse = await fetch(
        apiConfig.endpoints.content.creatorStats,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalViews: statsData.views || 0,
          totalDownloads: statsData.downloads || 0,
          totalEarnings: statsData.earnings || 0,
        });
      }

      // Fetch recent content
      const contentResponse = await fetch(
        `${apiConfig.endpoints.content.creatorContentFiltered}?page=0&size=3&sortBy=createdAt&sortDir=desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        setRecentContent(contentData.content || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CreatorHeader />
      <CreatorSideBar />

      {/* Main Content Area */}
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-200 mb-2">
              Welcome back, {user?.name || "Creator"}!
            </h1>
            <p className="text-gray-400">
              Here's an overview of your drone content performance
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalViews.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Downloads
                </CardTitle>
                <Download className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalDownloads}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${stats.totalEarnings.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Content
                </CardTitle>
                <FileVideo className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {recentContent.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-400" />
                  Quick Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Upload new drone footage to start earning
                </p>
                <Button
                  onClick={() => navigate("/creator/upload")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Upload Content
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileVideo className="h-5 w-5 mr-2 text-green-400" />
                  Manage Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  View and manage your uploaded content
                </p>
                <Button
                  onClick={() => navigate("/creator/content")}
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  View My Content
                </Button>
              </CardContent>
            </Card>

            {/* New Orders Quick Action */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-400" />
                  View Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Review and manage your sales orders
                </p>
                <Button
                  onClick={() => navigate("/creator/orders")}
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  View Orders
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content */}
          {recentContent.length > 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentContent.map((content) => (
                    <div
                      key={content.id}
                      className="bg-slate-700 rounded-lg p-4"
                    >
                      <h4 className="text-white font-medium mb-2">
                        {content.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-2">
                        {content.location}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{content.views} views</span>
                        <span>${content.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => navigate("/creator/content")}
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View All Content →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;
